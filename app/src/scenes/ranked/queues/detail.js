import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { modesWithLabel } from "../../../components/utils";
import { enumMaps, enumMapsWithLabel } from "../../../enums/enumMaps";
import MultiPicker from "../../../components/MultiPicker";
import { FaDiscord } from "react-icons/fa";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState({});
  const [modes, setModes] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [guilds, setGuilds] = useState([]);
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [showGuildSelector, setShowGuildSelector] = useState(false);
  const [botInviteUrl, setBotInviteUrl] = useState(null);
  const queueId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/queue/search`, { _id: queueId });
    if (!ok) return toast.error("Erreur while fetching queue");

    if (data.length !== 1) return toast.error("Queue not found");
    const newQueue = data[0];
    setQueue(newQueue);

    setCanEdit(realUser?.role === "ADMIN");
    setLoading(false);
  };

  useEffect(() => {
    get();

    const fetchBotInviteUrl = async () => {
      try {
        const result = await api.get(`/discord/getBotInviteUrl`);
        if (result.ok) {
          setBotInviteUrl(result.data.url);
        }
      } catch (error) {
        console.error("Error fetching bot invite URL:", error);
      }
    };

    const fetchModes = async () => {
      const { ok, data } = await api.post(`/mode/search`, { sort: "name", asc: true });
      if (!ok) toast.error("Erreur while fetching modes");
      setModes(data);
    };

    fetchBotInviteUrl();
    fetchModes();
  }, []);

  const handleDelete = async () => {
    const approved = window.confirm("Are you sure you want to delete this queue ?");
    if (!approved) return;

    const { ok } = await api.remove(`/queue/${queueId}`);
    if (!ok) toast.error("Erreur while deleting queue");

    toast.success("Queue deleted successfully");
    navigate("../../queues");
  };

  const handleUpdate = async () => {
    const { ok } = await api.put(`/queue/${queueId}`, queue);
    if (!ok) toast.error("Erreur while updating queue");
    toast.success("Queue updated successfully");
    navigate("../../queues");
  };

  const fetchGuilds = async () => {
    setLoadingGuilds(true);
    try {
      const { ok, data } = await api.get("/discord/guilds");
      if (ok) {
        setGuilds(data);
      } else {
        toast.error("Failed to fetch Discord servers");
      }
    } catch (error) {
      toast.error("Failed to fetch Discord servers");
    }
    setLoadingGuilds(false);
  };

  const handleConnectGuild = async (guildId) => {
    try {
      const { ok, data } = await api.put(`/queue/${queueId}/guild`, { guildId });
      if (ok) {
        setQueue(data);
        setShowGuildSelector(false);
        toast.success("Discord server connected successfully");
      } else {
        toast.error("Failed to connect Discord server");
      }
    } catch (error) {
      toast.error("Failed to connect Discord server");
    }
  };

  const handleShowGuildSelector = () => {
    setShowGuildSelector(true);
    fetchGuilds();
  };

  const handleDiscordRecreate = async () => {
    const { ok } = await api.post(`/queue/${queueId}/discordRecreate`);
    if (!ok) toast.error("Erreur while recreating Discord");
    toast.success("Discord recreated successfully");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Queue details</h1>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={queue.name}
          onChange={(e) => setQueue({ ...queue, name: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the queue"
          disabled={!canEdit}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mode">
          Mode
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="mode"
          name="mode"
          onChange={(e) => setQueue({ ...queue, modeId: e.target.value })}
          value={queue.modeId}
          disabled={!canEdit}>
          <option value="" disabled>
            Select a mode
          </option>
          {modes.map((mode) => (
            <option key={mode._id} value={mode._id}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="detailedMode">
          Detailed Mode
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="detailedMode"
          name="detailedMode"
          onChange={(e) => setQueue({ ...queue, mode: e.target.value })}
          value={queue.mode}
          disabled={!canEdit}>
          <option value="" disabled>
            Select a detailed mode
          </option>
          {modesWithLabel.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfPlayersPerTeam">
          Number of players per team
        </label>
        <input
          type="number"
          id="numberOfPlayersPerTeam"
          name="numberOfPlayersPerTeam"
          value={queue.numberOfPlayersPerTeam}
          onChange={(e) => setQueue({ ...queue, numberOfPlayersPerTeam: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Number of players per team"
          disabled={!canEdit}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfPlayersForGame">
          Number of players for game
        </label>
        <input
          type="number"
          id="numberOfPlayersForGame"
          name="numberOfPlayersForGame"
          value={queue.numberOfPlayersForGame}
          onChange={(e) => setQueue({ ...queue, numberOfPlayersForGame: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Number of players for game"
          disabled={!canEdit}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maps">
          Maps
        </label>
        {canEdit ? (
          <MultiPicker
            items={Object.values(enumMaps)}
            selectedItems={Object.values(enumMaps).filter((mapValue) => queue.maps?.includes(mapValue))}
            onSelectionChange={(selectedMaps) => {
              setQueue({ ...queue, maps: selectedMaps });
            }}
            renderItem={(mapValue, isSelected) => {
              const mapObj = enumMapsWithLabel.find((m) => m.value === mapValue);
              return (
                <div className="flex items-center justify-between">
                  <span>{mapObj?.label || mapValue}</span>
                  {isSelected && <span className="text-green-500">✓</span>}
                </div>
              );
            }}
            className="space-y-2 max-h-64 overflow-y-auto"
            itemClassName="border rounded p-2"
          />
        ) : (
          <div className="space-y-2">
            {queue.maps?.map((mapValue) => {
              const mapObj = enumMapsWithLabel.find((m) => m.value === mapValue);
              return (
                <div key={mapValue} className="bg-gray-100 p-2 rounded">
                  {mapObj?.label || mapValue}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-gray-700 text-sm font-bold">Discord Server</label>
          {canEdit && botInviteUrl && (
            <a
              href={botInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md">
              <FaDiscord className="w-3 h-3 mr-1" />
              Invite Bot to Server
            </a>
          )}
        </div>
        {queue.guildId ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
            <div>
              <span className="text-green-800 font-medium">Connected to Discord Server</span>
              <p className="text-sm text-green-600">Guild ID: {queue.guildId}</p>
            </div>
            {canEdit && (
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm" onClick={handleShowGuildSelector}>
                Change Server
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-3">
            <span className="text-gray-600">No Discord server connected</span>
            {canEdit && (
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleShowGuildSelector}>
                Connect Server
              </button>
            )}
          </div>
        )}
      </div>

      {showGuildSelector && (
        <div className="mb-4 bg-white border border-gray-300 rounded-lg p-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
            onClick={handleDiscordRecreate}>
            Recreate Discord
          </button>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Select Discord Server</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowGuildSelector(false)}>
              ✕
            </button>
          </div>
          {loadingGuilds ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading Discord servers...</p>
            </div>
          ) : guilds.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {guilds.map((guild) => (
                <div
                  key={guild.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleConnectGuild(guild.id)}>
                  <div className="flex items-center">
                    {guild.icon && (
                      <img
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                        alt={guild.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">{guild.name}</p>
                      <p className="text-sm text-gray-500">{guild.memberCount} members</p>
                    </div>
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">Select</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No Discord servers found. Make sure the bot is added to your servers.</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">Number of player in Queue : {queue.players.length}</div>

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
