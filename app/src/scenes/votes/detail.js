import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import API from "../../services/api";
import enumVoteType from "../../enums/enumVote";

const Detail = () => {
  const [vote, setVote] = useState({
    question: "",
    type: enumVoteType.CLAN,
    maxVotes: 1,
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  // Helper function to convert UTC date to local datetime-local format
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Get the local timezone offset in minutes
    const timezoneOffset = date.getTimezoneOffset();
    // Adjust for local timezone
    const localDate = new Date(date.getTime() - (timezoneOffset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  // Helper function to convert local datetime-local to UTC
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    // datetime-local input gives us local time, so we create a Date object
    // and convert it to UTC
    const date = new Date(dateString);
    return date.toISOString();
  };

  useEffect(() => {
    if (currentSeason) {
      fetchVote();
    }
  }, [id, currentSeason]);

  const fetchVote = async () => {
    try {
      const { ok, data } = await API.post(`/vote/search`, {
        seasonId: currentSeason._id,
      });
      if (!ok) {
        toast.error("Error while fetching vote");
        return;
      }
      
      const foundVote = data.find(v => v._id === id);
      if (!foundVote) {
        toast.error("Vote not found");
        navigate("/votes");
        return;
      }
      
      setVote({
        ...foundVote,
        startDate: formatDateForInput(foundVote.startDate),
        endDate: formatDateForInput(foundVote.endDate),
      });
    } catch (error) {
      toast.error("Error while fetching vote");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVote({ ...vote, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(vote.startDate) >= new Date(vote.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (vote.maxVotes < 1) {
      toast.error("Max votes must be at least 1");
      return;
    }

    try {
      const voteData = {
        question: vote.question,
        type: vote.type,
        maxVotes: parseInt(vote.maxVotes),
        startDate: formatDateForAPI(vote.startDate),
        endDate: formatDateForAPI(vote.endDate),
      };

      const response = await API.put(`/vote/${id}`, voteData);

      if (!response.ok) {
        return;
      }

      toast.success("Vote updated successfully");
      navigate("/votes");
    } catch (error) {
      toast.error("Error while updating vote");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this vote?");
    if (!confirm) return;

    try {
      const { ok } = await API.remove(`/vote/${id}`);
      if (!ok) {
        toast.error("Error while deleting vote");
        return;
      }

      toast.success("Vote deleted successfully");
      navigate("/votes");
    } catch (error) {
      toast.error("Error while deleting vote");
    }
  };

  if (loading || !currentSeason) return <Loader />;

  // Check if user is admin
  if (realUser?.role !== "ADMIN") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center text-red-600">
          Access Denied
        </h1>
        <p className="text-center mt-4">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">
          Edit Vote
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
            Question *
          </label>
          <input
            type="text"
            id="question"
            name="question"
            value={vote.question}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the vote question"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Vote Type *
          </label>
          <select
            id="type"
            name="type"
            value={vote.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value={enumVoteType.CLAN}>Clan</option>
            <option value={enumVoteType.PLAYER}>Player</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxVotes">
            Maximum Votes Per User *
          </label>
          <input
            type="number"
            id="maxVotes"
            name="maxVotes"
            value={vote.maxVotes}
            onChange={handleChange}
            min="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter maximum number of votes per user"
            required
          />
          <p className="text-gray-600 text-sm mt-1">
            Each user can vote for up to this many different options (e.g., if set to 2, each user can vote for 2 different clans/players)
          </p>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
            Start Date *
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={vote.startDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
            End Date *
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={vote.endDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete Vote
          </button>
          
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Vote
          </button>
        </div>
      </form>

      {/* Show current votes if editing */}
      {vote.votes && vote.votes.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Current Votes ({vote.votes.length} total votes)</h3>
          
          {/* Show vote distribution */}
          <div className="mb-4 pb-4 border-b">
            <h4 className="font-medium mb-2">Vote Distribution:</h4>
            <div className="space-y-1">
              {Object.entries(
                vote.votes.reduce((acc, v) => {
                  const key = vote.type === enumVoteType.CLAN ? v.clanName : v.playerName;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-medium">{count} vote{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Group votes by voter */}
          <div className="space-y-3">
            {Object.entries(
              vote.votes.reduce((acc, v) => {
                if (!acc[v.voterId]) {
                  acc[v.voterId] = {
                    voterName: v.voterName,
                    votes: []
                  };
                }
                acc[v.voterId].votes.push(v);
                return acc;
              }, {})
            ).map(([voterId, voterData]) => (
              <div key={voterId} className="p-3 bg-white rounded border">
                <div className="font-medium mb-2">
                  {voterData.voterName} ({voterData.votes.length} vote{voterData.votes.length !== 1 ? 's' : ''})
                </div>
                <div className="space-y-1">
                  {voterData.votes.map((v, index) => (
                    <div key={index} className="text-sm text-gray-600 ml-4">
                      • {vote.type === enumVoteType.CLAN ? v.clanName : v.playerName}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail; 