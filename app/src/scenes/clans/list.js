import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import StatColored from "../../components/StatColored";
import toast from "react-hot-toast";

const List = () => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sort: "points",
    asc: false,
  });
  const [open, setOpen] = useState(false);
  const [openNewSeason, setOpenNewSeason] = useState(false);
  const [openEndSeason, setOpenEndSeason] = useState(false);
  const [newClan, setNewClan] = useState({ name: "" });
  const [newSeason, setNewSeason] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  useEffect(() => {
    if (currentSeason) {
      const fetchData = async () => {
        const { ok, data } = await api.post(`/clan/search`, {
          ...filters,
          seasonName: currentSeason.name,
        });
        if (!ok) toast.error("Erreur while fetching users");

        setClans(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [filters, currentSeason]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newClanModified = { ...newClan, [name]: value };
    setNewClan(newClanModified);
  };

  const handleSeasonChange = (e) => {
    const { name, value } = e.target;
    const newSeasonModified = { ...newSeason, [name]: value };
    setNewSeason(newSeasonModified);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ok, data } = await api.post("/clan", newClan);
    if (!ok) return toast.error("Error while creating clan");

    setOpen(false);
    return navigate(`/clans/${data._id}`);
  };

  const handleEndSeason = async (e) => {
    e.preventDefault();

    if (
      window.confirm(
        "Are you sure you want to end the current season? This action cannot be undone."
      )
    ) {
      const { ok } = await api.post("/season/endSeason");
      if (!ok) return toast.error("Error while ending season");

      toast.success("Season ended successfully");
      setOpenEndSeason(false);
      window.location.reload();
    }
  };

  const handleCreateSeason = async (e) => {
    e.preventDefault();

    const { ok } = await api.post("/season/", newSeason);
    if (!ok) return toast.error("Error while creating new season");

    toast.success("New season created successfully");
    setOpenNewSeason(false);
    setNewSeason({ name: "", startDate: "", endDate: "" });
    window.location.reload();
  };

  if (loading || !currentSeason) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Clans</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          {realUser?.role === "ADMIN" && currentSeason?.isActive && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setOpen(true)}
            >
              Create clan
            </button>
          )}
        </div>
        <div className="space-x-2">
          {realUser?.role === "ADMIN" && currentSeason?.isActive && (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setOpenEndSeason(true)}
            >
              End {currentSeason.name}
            </button>
          )}
          {realUser?.role === "ADMIN" &&
            !currentSeason?.isActive &&
            currentSeason?.isLastSeason && (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setOpenNewSeason(true)}
              >
                Create New Season
              </button>
            )}
        </div>
      </div>

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              {[
                { label: "Name", key: "name" },
                { label: "Nb. Games", key: "numberGames" },
                { label: "Wins", key: "numberWins" },
                { label: "Losses", key: "numberLosses" },
                { label: "Win rate", key: "winRate" },
                { label: "Points", key: "points" },
                { label: "Difference", key: "difference" },
                { label: "Avg. Elo", key: "averageElo" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  className="px-4 py-2 cursor-pointer hover:underline"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      sort: key,
                      asc: !filters.asc,
                    })
                  }
                >
                  {label}
                  {filters.sort === key && (
                    <span>{filters.asc ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clans.map((clan) => (
              <tr
                key={clan._id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/clans/${clan._id}`)}
              >
                <td className="border px-4 py-2">{clan.name}</td>
                <td className="border px-4 py-2">{clan.numberGames}</td>
                <td className="border px-4 py-2">{clan.numberWins}</td>
                <td className="border px-4 py-2">{clan.numberLosses}</td>
                <td className="border px-4 py-2">
                  <StatColored
                    value={clan.winRate.toFixed(2)}
                    min={0}
                    max={1}
                  />
                </td>
                <td className="border px-4 py-2">{clan.points}</td>
                <td className="border px-4 py-2">{clan.difference}</td>
                <td className="border px-4 py-2">
                  <StatColored
                    value={clan.averageElo.toFixed(2)}
                    min={500}
                    max={1500}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create clan">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Name"
              name="name"
              value={newClan.name}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create clan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={openNewSeason}
        onClose={() => setOpenNewSeason(false)}
        title="Create New Season"
      >
        <form onSubmit={handleCreateSeason}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="newSeasonName"
            >
              Season Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newSeasonName"
              type="text"
              placeholder="Season Name"
              name="name"
              value={newSeason.name}
              onChange={handleSeasonChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startDate"
            >
              Start Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="startDate"
              type="datetime-local"
              name="startDate"
              value={newSeason.startDate}
              onChange={handleSeasonChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="endDate"
            >
              End Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="endDate"
              type="datetime-local"
              name="endDate"
              value={newSeason.endDate}
              onChange={handleSeasonChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Season
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={openEndSeason}
        onClose={() => setOpenEndSeason(false)}
        title={`End ${currentSeason?.name}`}
      >
        <div className="mb-4">
          <p className="text-gray-700">
            Are you sure you want to end the current season? This will:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Freeze the current season</li>
            <li>Freeze the current clans</li>
            <li>Freeze the current results</li>
          </ul>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleEndSeason}
          >
            End {currentSeason?.name}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default List;
