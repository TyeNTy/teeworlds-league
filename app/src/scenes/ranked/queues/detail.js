import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const queueId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/queue/search`, { _id: queueId });
    if (!ok) return toast.error("Erreur while fetching queue");

    if (data.length !== 1) return toast.error("Queue not found");
    setQueue(data[0]);

    setCanEdit(realUser?.role === "ADMIN");
    setLoading(false);
  };

  useEffect(() => {
    get();
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
        <input
          type="text"
          id="mode"
          name="mode"
          value={queue.mode}
          onChange={(e) => setQueue({ ...queue, mode: e.target.value })}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Game mode"
          disabled={!canEdit}
        />
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
