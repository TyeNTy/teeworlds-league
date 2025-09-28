import React, { useState, useEffect } from "react";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Player from "../../../components/Player";
import { useSelector } from "react-redux";
import API from "../../../services/api";

const Details = () => {
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [playerSelected, setPlayerSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const clanId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const currentSeason = useSelector((state) => state.Season.currentSeason);

  const get = async () => {
    const { ok, data } = await API.post(`/clan/search`, {
      _id: clanId,
      seasonId: currentSeason._id,
    });
    if (!ok) toast.error("Erreur while fetching clan");

    setClan(data[0]);

    const { ok: okPlayers, data: dataPlayers } = await API.post(
      `/user/search`,
      {}
    );
    if (!okPlayers) toast.error("Erreur while fetching players");

    setAllPlayers(
      dataPlayers.filter(
        (player) =>
          player.clanId === null || typeof player.clanId === "undefined"
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    if (currentSeason) get();
  }, [clanId, currentSeason]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClan({ ...clan, [name]: value });
  };

  const handleAddPlayer = async () => {
    if (playerSelected === null) return setOpen(false);

    const { ok, data } = await API.put(`/clan/${clanId}/addPlayer`, {
      userId: playerSelected._id,
    });
    if (!ok) return toast.error("Erreur while adding player to clan");

    setClan(data);
    setAllPlayers(
      allPlayers.filter((player) => player._id !== playerSelected._id)
    );

    setOpen(false);
    toast.success("Player added to clan successfully");
  };

  const handleSubmit = async () => {
    const { ok, data } = await API.put(`/clan/${clanId}`, clan);
    if (!ok) return toast.error("Erreur while updating clan");

    setClan(data);
    toast.success("Clan updated successfully");
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this clan ?"
    );
    if (!confirm) return;

    const { ok } = await API.remove(`/clan/${clanId}`);
    if (!ok) return toast.error("Erreur while deleting clan");

    toast.success("Clan deleted successfully");
    navigate("/clans");
  };

  const handleDeletePlayer = async (playerId) => {
    const confirm = window.confirm(
      "Are you sure you want to remove this player from the clan ?"
    );
    if (!confirm) return;

    const { ok, data } = await API.remove(`/clan/${clanId}/removePlayer`, {
      userId: playerId,
    });
    if (!ok) return toast.error("Erreur while removing player from clan");

    setClan(data.clan);
    setAllPlayers([...allPlayers, data.player]);
    toast.success("Player removed from clan successfully");
  };

  if (loading || !currentSeason) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Clan details</h1>

      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <button
          className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            const res = await API.post(`/clan/${clanId}/updateStat`);
            if (res.ok) {
              toast.success("Clan updated");
              return setClan(res.data);
            }
            return toast.error("Error while updating stat");
          }}
        >
          Sync
        </button>
      )}

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={clan.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the clan"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="players"
        >
          Players
        </label>
        <div>
          {clan.players.map((player, index) => (
            <div key={index} className="flex items-center">
              {realUser?.role === "ADMIN" && currentSeason?.isActive && (
                <MdDelete
                  size={20}
                  color="red"
                  className="cursor-pointer"
                  onClick={() => handleDeletePlayer(player.userId)}
                />
              )}
              <Player
                player={{ _id: player.userId, userName: player.userName }}
              />
            </div>
          ))}
        </div>

        {realUser?.role === "ADMIN" && currentSeason?.isActive && (
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                setPlayerSelected(null);
                setOpen(true);
              }}
            >
              Add player
            </button>
          </div>
        )}
      </div>
      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add player">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="playerId"
            name="playerId"
            onChange={(e) =>
              setPlayerSelected(
                allPlayers.find((player) => player._id === e.target.value)
              )
            }
          >
            <option value="" disabled selected>
              Select a player
            </option>
            {allPlayers.map((player) => (
              <option key={player._id} value={player._id}>
                {player.userName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleAddPlayer}
          >
            Add player
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Details;
