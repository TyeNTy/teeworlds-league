import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { modesWithLabel } from "../../../components/utils";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState({});
  const [canEdit, setCanEdit] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [canLeave, setCanLeave] = useState(false);
  const queueId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/queue/search`, { _id: queueId });
    if (!ok) return toast.error("Erreur while fetching queue");

    if (data.length !== 1) return toast.error("Queue not found");
    setQueue(data[0]);

    setCanEdit(realUser?.role === "ADMIN");
    setCanJoin(realUser && !data[0].players.some((player) => player.userId === realUser._id));
    setCanLeave(realUser && data[0].players.some((player) => player.userId === realUser._id));
    setLoading(false);
  };

  useEffect(() => {
    get();
    const interval = setInterval(() => {
      get();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    const approved = window.confirm(
      "Are you sure you want to delete this queue ?"
    );
    if (!approved) return;

  const { ok } = await api.remove(`/queue/${queueId}`);
    if (!ok) toast.error("Erreur while deleting queue");

    navigate("../../queues");
  };

  const handleUpdate = async () => {
    const { ok } = await api.put(`/queue/${queueId}`, queue);
    if (!ok) toast.error("Erreur while updating queue");
    toast.success("Queue updated successfully");
    navigate("../../queues");
  };

  const handleJoinQueue = async () => {
    const { ok } = await api.post(`/queue/${queueId}/join`);
    if (!ok) toast.error("Erreur while joining queue");
    toast.success("Queue joined successfully");
    get();
  };

  const handleLeaveQueue = async () => {
    const { ok } = await api.post(`/queue/${queueId}/leave`);
    if (!ok) toast.error("Erreur while leaving queue");
    toast.success("Queue left successfully");
    get();
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Queue details</h1>

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
          value={queue.name}
          onChange={(e) => setQueue({ ...queue, name: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the queue"
          disabled={!canEdit}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="mode"
        >
          Mode
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="mode"
          name="mode"
          onChange={(e) => setQueue({ ...queue, mode: e.target.value })}
          value={queue.mode}
          disabled={!canEdit}
        >
          <option value="" disabled>
            Select a mode
          </option>
          {modesWithLabel.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="maps"
        >
          Maps
        </label>
        <input
          type="text"
          id="maps"
          name="maps"
          value={queue.maps}
          onChange={(e) => setQueue({ ...queue, maps: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Available maps"
          disabled={!canEdit}
        />
      </div>

      <div className="mb-4">
        Number of player in Queue : {queue.players.length}
        <div className="flex items-center">
          {canJoin && <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => handleJoinQueue()}
          >
            Join queue
          </button>}

          {canLeave && <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => handleLeaveQueue()}
          >
            Leave queue
          </button>}
        </div>
      </div>
      
      {canEdit && (
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete
          </button>
          <div className="flex items-center">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
