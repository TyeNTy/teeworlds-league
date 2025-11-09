import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const List = () => {
  const realUser = useSelector((state) => state.Auth.user);

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchData = async () => {
    const { ok, data } = await api.post(`/tournament/search`);
    if (!ok) {
      toast.error("Error while fetching tournaments");
      setLoading(false);
      return;
    }

    setTournaments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTournament = async () => {
    const { ok, data } = await api.post("/tournament");
    if (!ok) {
      toast.error("Error while creating tournament");
      return;
    }

    toast.success("Tournament created successfully");
    navigate(`./${data._id}`);
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Tournaments</h1>

      {realUser?.role === "ADMIN" && (
        <div className="flex justify-between items-center mb-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCreateTournament}>
            Create tournament
          </button>
        </div>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Registration Period</th>
              <th className="px-4 py-2">Tournament Period</th>
              <th className="px-4 py-2">Registered Teams</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament._id} className={"hover:bg-gray-100 cursor-pointer"} onClick={() => navigate(`./${tournament._id}`)}>
                <td className="border px-4 py-2">{tournament.name || "Unnamed Tournament"}</td>
                <td className="border px-4 py-2">{tournament.description || "No description"}</td>
                <td className="border px-4 py-2">{tournament.status || "PENDING"}</td>
                <td className="border px-4 py-2">
                  {formatDate(tournament.registrationStartDate)} - {formatDate(tournament.registrationEndDate)}
                </td>
                <td className="border px-4 py-2">
                  {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </td>
                <td className="border px-4 py-2">{tournament.registeredTeams?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
