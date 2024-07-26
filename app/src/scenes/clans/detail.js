import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Player from "../../components/Player";
import { useSelector } from "react-redux";

const Details = () => {
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [allPlayersSelected, setAllPlayersSelected] = useState([]);
  const [playerSelected, setPlayerSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const clanId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/clan/search`, { _id: clanId });
    if (!ok) toast.error("Erreur while fetching clan");

    setClan(data[0]);

    const { ok: okPlayers, data: dataPlayers } = await api.post(
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

    if (data[0].players)
      setAllPlayersSelected(
        dataPlayers.filter((player) =>
          data[0].players.find((p) => p.userId === player._id)
        )
      );
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [clanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClan({ ...clan, [name]: value });
  };

  const handleAddPlayer = async () => {
    if (playerSelected === null) return setOpen(false);

    const { ok, data } = await api.put(`/clan/${clanId}/addPlayer`, {
      userId: playerSelected._id,
    });
    if (!ok) return toast.error("Erreur while adding player to clan");

    setAllPlayersSelected([...data.players]);
    setAllPlayers(
      allPlayers.filter((player) => player._id !== playerSelected._id)
    );

    setOpen(false);
    toast.success("Player added to clan successfully");
  };

  const handleSubmit = async () => {
    const { ok, data } = await api.put(`/clan/${clanId}`, clan);
    if (!ok) return toast.error("Erreur while updating clan");

    setClan(data);
    toast.success("Clan updated successfully");
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this clan ?"
    );
    if (!confirm) return;

    const { ok } = await api.remove(`/clan/${clanId}`);
    if (!ok) return toast.error("Erreur while deleting clan");

    toast.success("Clan deleted successfully");
    navigate("/clans");
  };

  const handleDeletePlayer = async (player) => {
    const confirm = window.confirm(
      "Are you sure you want to remove this player from the clan ?"
    );
    if (!confirm) return;

    const { ok, data } = await api.remove(`/clan/${clanId}/removePlayer`, {
      userId: player._id,
    });
    if (!ok) return toast.error("Erreur while removing player from clan");

    setAllPlayersSelected(data.players);
    setAllPlayers([...allPlayers, player]);
    toast.success("Player removed from clan successfully");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Clan details</h1>

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
          disabled={realUser?.role !== "ADMIN"}
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
          {allPlayersSelected.map((player, index) => (
            <div key={index} className="flex items-center">
              {realUser?.role === "ADMIN" && (
                <MdDelete
                  size={20}
                  color="red"
                  className="cursor-pointer"
                  onClick={() => handleDeletePlayer(player)}
                />
              )}
              <Player key={index} player={player} />
            </div>
          ))}
        </div>

        {realUser?.role === "ADMIN" && (
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
      {realUser?.role === "ADMIN" && (
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
