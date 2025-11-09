import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState({});
  const [canEdit, setCanEdit] = useState(false);
  const tournamentId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/tournament/search`, { _id: tournamentId });
    if (!ok) return toast.error("Error while fetching tournament");

    if (data.length !== 1) return toast.error("Tournament not found");
    const newTournament = data[0];
    setTournament(newTournament);

    setCanEdit(realUser?.role === "ADMIN");
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, []);

  const handleDelete = async () => {
    const approved = window.confirm("Are you sure you want to delete this tournament?");
    if (!approved) return;

    const { ok } = await api.remove(`/tournament/${tournamentId}`);
    if (!ok) return toast.error("Error while deleting tournament");

    toast.success("Tournament deleted successfully");
    navigate("../../tournaments");
  };

  const handleUpdate = async () => {
    const { ok } = await api.put(`/tournament/${tournamentId}`, tournament);
    if (!ok) return toast.error("Error while updating tournament");
    toast.success("Tournament updated successfully");
    navigate("../../tournaments");
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Tournament details</h1>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={tournament.name || ""}
          onChange={(e) => setTournament({ ...tournament, name: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the tournament"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={tournament.description || ""}
          onChange={(e) => setTournament({ ...tournament, description: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Description of the tournament"
          rows="4"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationStartDate">
          Registration Start Date
        </label>
        <input
          type="datetime-local"
          id="registrationStartDate"
          name="registrationStartDate"
          value={formatDateForInput(tournament.registrationStartDate)}
          onChange={(e) => setTournament({ ...tournament, registrationStartDate: new Date(e.target.value) })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationEndDate">
          Registration End Date
        </label>
        <input
          type="datetime-local"
          id="registrationEndDate"
          name="registrationEndDate"
          value={formatDateForInput(tournament.registrationEndDate)}
          onChange={(e) => setTournament({ ...tournament, registrationEndDate: new Date(e.target.value) })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
          Tournament Start Date
        </label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          value={formatDateForInput(tournament.startDate)}
          onChange={(e) => setTournament({ ...tournament, startDate: new Date(e.target.value) })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
          Tournament End Date
        </label>
        <input
          type="datetime-local"
          id="endDate"
          name="endDate"
          value={formatDateForInput(tournament.endDate)}
          onChange={(e) => setTournament({ ...tournament, endDate: new Date(e.target.value) })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        <div className="block text-gray-700 text-sm font-bold mb-2">Registered Teams: {tournament.registeredTeams?.length || 0}</div>
        {tournament.registeredTeams && tournament.registeredTeams.length > 0 && (
          <div className="space-y-2">
            {tournament.registeredTeams.map((team, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded">
                <div className="font-medium">{team.name || `Team ${index + 1}`}</div>
                <div className="text-sm text-gray-600">Players: {team.players?.length || 0}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}>
            Delete
          </button>
          <div className="flex items-center">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
              onClick={handleUpdate}>
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
