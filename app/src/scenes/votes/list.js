import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";
import enumVoteType from "../../enums/enumVote";

const List = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openVoteModal, setOpenVoteModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [allPlayers, setAllPlayers] = useState([]);
  const [allClans, setAllClans] = useState([]);

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  useEffect(() => {
    if (currentSeason) {
      fetchVotes();
      fetchPlayersAndClans();
    }
  }, [currentSeason]);

  const fetchVotes = async () => {
    try {
      const { ok, data } = await api.post(`/vote/search`, {
        seasonId: currentSeason._id,
      });
      if (!ok) {
        toast.error("Error while fetching votes");
        return;
      }
      setVotes(data);
    } catch (error) {
      toast.error("Error while fetching votes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersAndClans = async () => {
    try {
      const [playersRes, clansRes] = await Promise.all([
        api.post(`/user/search`, {}),
        api.post(`/clan/search`, { seasonId: currentSeason._id }),
      ]);
      
      if (playersRes.ok) setAllPlayers(playersRes.data);
      if (clansRes.ok) setAllClans(clansRes.data);
    } catch (error) {
      console.error("Error fetching players and clans:", error);
    }
  };

  const handleDelete = async (voteId) => {
    const confirm = window.confirm("Are you sure you want to delete this vote?");
    if (!confirm) return;

    try {
      const { ok } = await api.remove(`/vote/${voteId}`);
      if (!ok) {
        toast.error("Error while deleting vote");
        return;
      }
      toast.success("Vote deleted successfully");
      fetchVotes();
    } catch (error) {
      toast.error("Error while deleting vote");
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    // Check if user has already voted for this option
    if (!selectedVote || !selectedVote.votes || !realUser) {
      toast.error("Invalid vote data");
      return;
    }
    
    const userVotes = selectedVote.votes.filter(v => v.voterId === realUser._id);
    const alreadyVotedForOption = userVotes.some(v => 
      (selectedVote.type === enumVoteType.CLAN && v.clanId === selectedOption) ||
      (selectedVote.type === enumVoteType.PLAYER && v.playerId === selectedOption)
    );

    if (alreadyVotedForOption) {
      toast.error("You have already voted for this option");
      return;
    }

    try {
      const voteData = {
        voteId: selectedVote._id,
      };

      if (selectedVote.type === enumVoteType.CLAN) {
        voteData.clanId = selectedOption;
      } else if (selectedVote.type === enumVoteType.PLAYER) {
        voteData.playerId = selectedOption;
      }

      const { ok } = await api.post(`/vote/vote`, voteData);
      if (!ok) {
        toast.error("Error while casting vote");
        return;
      }
      
      toast.success("Vote cast successfully");
      setOpenVoteModal(false);
      setSelectedVote(null);
      setSelectedOption("");
      fetchVotes();
    } catch (error) {
      toast.error("Error while casting vote");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isVoteActive = (vote) => {
    const now = new Date();
    const startDate = new Date(vote.startDate);
    const endDate = new Date(vote.endDate);
    return now >= startDate && now <= endDate;
  };

  const getUserVoteCount = (vote) => {
    if (!vote || !vote.votes || !realUser) return 0;
    return vote.votes.filter(v => v.voterId === realUser._id).length;
  };

  const hasUserVoted = (vote) => {
    return getUserVoteCount(vote) > 0;
  };

  const canUserVote = (vote) => {
    return realUser && isVoteActive(vote) && getUserVoteCount(vote) < vote.maxVotes;
  };

  const getRemainingVotes = (vote) => {
    if (!vote || !vote.maxVotes) return 0;
    return vote.maxVotes - getUserVoteCount(vote);
  };

  const openVoteDialog = (vote) => {
    setSelectedVote(vote);
    setSelectedOption("");
    setOpenVoteModal(true);
  };

  if (loading || !currentSeason) return <Loader />;

  return (
    <div className="p-4">
      <div className="flex flex-col items-start mb-6">
        {realUser?.role === "ADMIN" && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={() => navigate("/votes/new")}
          >
            Create New Vote
          </button>
        )}
        <h1 className="text-2xl font-bold">Votes - {currentSeason.name}</h1>
      </div>

      {votes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No votes found for this season.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {votes.map((vote) => (
            <div
              key={vote._id}
              className="bg-white rounded-lg shadow-md p-6 border"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  {realUser?.role === "ADMIN" && (
                    <>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                        onClick={() => handleDelete(vote._id)}
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"
                        onClick={() => navigate(`/votes/${vote._id}`)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                    </>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{vote.question}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {vote.type}
                      </span>
                      <span>Max votes: {vote.maxVotes}</span>
                      <span>Current votes: {vote.votes.length}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>Start: {formatDate(vote.startDate)}</span>
                      <span>End: {formatDate(vote.endDate)}</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          isVoteActive(vote)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isVoteActive(vote) ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {realUser && canUserVote(vote) && (
                    <button
                      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => openVoteDialog(vote)}
                    >
                      Cast Vote ({getRemainingVotes(vote)} remaining)
                    </button>
                  )}
                  {realUser && hasUserVoted(vote) && !canUserVote(vote) && (
                    <span className="text-green-600 font-medium">
                      Voted ✓ ({getUserVoteCount(vote)}/{vote.maxVotes})
                    </span>
                  )}
                  {realUser && hasUserVoted(vote) && canUserVote(vote) && (
                    <div className="flex flex-col items-end">
                      <span className="text-green-600 font-medium text-sm">
                        Voted: {getUserVoteCount(vote)}/{vote.maxVotes}
                      </span>
                      <button
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-sm mt-1"
                        onClick={() => openVoteDialog(vote)}
                      >
                        Vote Again ({getRemainingVotes(vote)} left)
                      </button>
                    </div>
                  )}
                  {!realUser && isVoteActive(vote) && (
                    <span className="text-gray-500 font-medium">
                      Login to vote
                    </span>
                  )}
                </div>
              </div>
              
              {/* Show vote results */}
              {vote.votes.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Current Results:</h4>
                  <div className="space-y-1">
                    {vote.type === enumVoteType.CLAN ? (
                      // Group votes by clan
                      Object.entries(
                        vote.votes.reduce((acc, v) => {
                          acc[v.clanName] = (acc[v.clanName] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([clanName, count]) => (
                        <div key={clanName} className="flex justify-between text-sm">
                          <span>{clanName}</span>
                          <span className="font-medium">{count} votes</span>
                        </div>
                      ))
                    ) : (
                      // Group votes by player
                      Object.entries(
                        vote.votes.reduce((acc, v) => {
                          acc[v.playerName] = (acc[v.playerName] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([playerName, count]) => (
                        <div key={playerName} className="flex justify-between text-sm">
                          <span>{playerName}</span>
                          <span className="font-medium">{count} votes</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vote Modal */}
      <Modal isOpen={openVoteModal} onClose={() => setOpenVoteModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Cast Your Vote</h2>
          <p className="mb-4">{selectedVote?.question}</p>
          
          {selectedVote && (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  You have <strong>{getRemainingVotes(selectedVote)}</strong> votes remaining 
                  (voted {getUserVoteCount(selectedVote)} of {selectedVote.maxVotes})
                </p>
                {getUserVoteCount(selectedVote) > 0 && selectedVote.votes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-blue-800">Your previous votes:</p>
                    <ul className="text-sm text-blue-600 mt-1">
                      {selectedVote.votes
                        .filter(v => v.voterId === realUser._id)
                        .map((vote, index) => (
                          <li key={index}>
                            • {selectedVote.type === enumVoteType.CLAN ? vote.clanName : vote.playerName}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select your choice:
                </label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select an option...</option>
                  {selectedVote?.type === enumVoteType.CLAN
                    ? allClans.map((clan) => {
                        const alreadyVoted = selectedVote.votes && realUser
                          ? selectedVote.votes
                              .filter(v => v.voterId === realUser._id)
                              .some(v => v.clanId === clan._id)
                          : false;
                        return (
                          <option key={clan._id} value={clan._id} disabled={alreadyVoted}>
                            {clan.name} {alreadyVoted ? '(Already voted)' : ''}
                          </option>
                        );
                      })
                    : allPlayers.map((player) => {
                        const alreadyVoted = selectedVote.votes && realUser
                          ? selectedVote.votes
                              .filter(v => v.voterId === realUser._id)
                              .some(v => v.playerId === player._id)
                          : false;
                        return (
                          <option key={player._id} value={player._id} disabled={alreadyVoted}>
                            {player.name} {alreadyVoted ? '(Already voted)' : ''}
                          </option>
                        );
                      })}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setOpenVoteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleVote}
                >
                  Cast Vote
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default List; 