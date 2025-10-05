import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { modesWithLabel } from "../../../components/utils";
import { enumMapsWithLabel } from "../../../enums/enumMaps";
import { useSelector } from "react-redux";

const List = () => {
  const realUser = useSelector((state) => state.Auth.user);

  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const codeSuccess = searchParams.get("codeSuccess");

  const navigate = useNavigate();

  const fetchData = async () => {
    const { ok, data } = await api.post(`/queue/search`);
    if (!ok) {
      toast.error("Erreur while fetching queues");
      setLoading(false);
      return;
    }

    setQueues(data);
    setLoading(false);
  };

  useEffect(() => {
    if (codeSuccess) {
      toast.success("Discord code activated successfully");
      setSearchParams({ codeSuccess: null });
    }

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateQueue = async () => {
    const { ok, data } = await api.post("/queue");
    if (!ok) {
      toast.error("Erreur while creating queue");
      return;
    }

    toast.success("Queue created successfully");
    navigate(`./${data._id}`);
  };

  const handleJoinQueue = async (queueId) => {
    const { ok } = await api.post(`/queue/${queueId}/join`);
    if (!ok) return toast.error("Erreur while joining queue");
    toast.success("Queue joined successfully");
    fetchData();
  };

  const handleLeaveQueue = async (queueId) => {
    const { ok } = await api.post(`/queue/${queueId}/leave`);
    if (!ok) return toast.error("Erreur while leaving queue");
    toast.success("Queue left successfully");
    fetchData();
  };

  const canJoinQueue = (queue) => {
    return realUser && !queue.players.some((player) => player.userId === realUser._id);
  };

  const canLeaveQueue = (queue) => {
    return realUser && queue.players.some((player) => player.userId === realUser._id);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Queues</h1>

      {realUser?.role === "ADMIN" && (
        <div className="flex justify-between items-center mb-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCreateQueue}>
            Create queue
          </button>
        </div>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Mode</th>
              <th className="px-4 py-2">Detailed Mode</th>
              <th className="px-4 py-2">Maps</th>
              <th className="px-4 py-2">Players in queue</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((queue) => (
              <tr key={queue._id} className={"hover:bg-gray-100"} onClick={() => navigate(`./${queue._id}`)}>
                <td className="border px-4 py-2 cursor-pointer">{queue.name}</td>
                <td className="border px-4 py-2 cursor-pointer">{queue.modeName}</td>
                <td className="border px-4 py-2 cursor-pointer">{modesWithLabel.find((m) => m.value === queue.mode)?.label ?? "Unknown"}</td>
                <td className="border px-4 py-2 cursor-pointer">
                  {queue.maps.map((map) => (
                    <div key={map}>{enumMapsWithLabel.find((m) => m.value === map)?.label ?? "Unknown"}</div>
                  ))}
                </td>
                <td className="border px-4 py-2 cursor-pointer">{queue.players.length}</td>
                <td className="border px-4 py-2">
                  <div className="flex space-x-2">
                    {canJoinQueue(queue) && (
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinQueue(queue._id);
                        }}>
                        Join
                      </button>
                    )}
                    {canLeaveQueue(queue) && (
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveQueue(queue._id);
                        }}>
                        Leave
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
