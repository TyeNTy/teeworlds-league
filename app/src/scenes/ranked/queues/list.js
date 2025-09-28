import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { maps, modes } from "../../../components/utils";
import { useSelector } from "react-redux";

const List = () => {
  const realUser = useSelector((state) => state.Auth.user);

  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { ok, data } = await api.post(`/queue/search`);
      if (!ok) {
        toast.error("Erreur while fetching queues");
        setLoading(false);
        return;
      }

      console.log(data);

      setQueues(data);
      setLoading(false);
    };

    fetchData();
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

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Queues</h1>

      {realUser?.role === "ADMIN" && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateQueue}
        >
          Create queue
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Mode</th>
              <th className="px-4 py-2">Maps</th>
              <th className="px-4 py-2">Players in queue</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((queue) => (
              <tr
                key={queue._id}
                className={"cursor-pointer hover:bg-gray-100 opacity-50"}
                onClick={() => navigate(`./${queue._id}`)}
              >
                <td className="border px-4 py-2">
                  {queue.name}
                </td>
                <td className="border px-4 py-2">
                  {modes.find((m) => m.value === queue.mode)?.label ??
                    "Unknown"}
                </td>
                <td className="border px-4 py-2">
                  {queue.maps.map((map) => (
                    <div key={map}>{maps.find((m) => m.value === map)?.label ?? "Unknown"}</div>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {queue.players.length}
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
