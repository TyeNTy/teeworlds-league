import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Player from "../../../components/Player";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isRed, setIsRed] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const [mode, setMode] = useState(null);
  const [canUpdate, setCanUpdate] = useState(false);

  const modeId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const getPlayers = async () => {
    const { ok, data } = await api.post(`/user/search`, {});
    if (!ok) return toast.error("Erreur while fetching players");
    setPlayers(data);
  };

  const get = async () => {
    const { ok, data } = await api.get(`/mode/${modeId}`);
    if (!ok) return toast.error("Erreur while fetching result");

    if (!data) return toast.error("Mode not found");
    setMode(data);

    setCanEdit(realUser?.role === "ADMIN");

    setCanUpdate(false);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [modeId]);

  const handleSubmit = async () => {
    const { ok } = await api.put(`/mode/${modeId}`, { ...mode });
    if (!ok) toast.error("Erreur while updating result");

    toast.success("Mode updated");
    navigate("../../modes");
  };

  const handleDelete = async () => {
    const approved = window.confirm("Are you sure you want to delete this mode ?");
    if (!approved) return;

    const { ok } = await api.remove(`/mode/${modeId}`);
    if (!ok) toast.error("Erreur while deleting result");

    navigate("../../modes");
  };

  const handleChange = (e) => {
    setCanUpdate(true);
    const { name, value } = e.target;
    setMode({ ...mode, [name]: value });
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Mode details</h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mt-2" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={mode.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the mode"
          disabled={!canEdit}
        />
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
              onClick={handleSubmit}>
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
