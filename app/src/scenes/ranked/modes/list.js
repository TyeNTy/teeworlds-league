import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";
import { modesWithLabel } from "../../../components/utils";
import { enumMapsWithLabel } from "../../../enums/enumMaps";
import { useSelector } from "react-redux";

const List = () => {
  const realUser = useSelector((state) => state.Auth.user);

  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { ok, data } = await api.post(`/mode/search`, { sort: "name", asc: true });
      if (!ok) toast.error("Erreur while fetching results");

      setModes(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCreateMode = async () => {
    const { ok, data } = await api.post(`/mode/create`);
    if (!ok) return toast.error("Erreur while creating mode");
    navigate(`./${data._id}`);
    toast.success("Mode created successfully");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Modes</h1>

      {realUser?.role === "ADMIN" && (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCreateMode}>
          Create mode
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Mode</th>
            </tr>
          </thead>
          <tbody>
            {modes.map((mode) => (
              <tr key={mode._id} className="cursor-pointer hover:bg-gray-100" onClick={() => navigate(`./${mode._id}`)}>
                <td className="border px-4 py-2">{mode.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
