import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import StatColored from "../../components/StatColored";

const List = () => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: "points", asc: false });
  const [open, setOpen] = useState(false);
  const [newClan, setNewClan] = useState({ name: "" });

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/clan/search`, { ...filters });
    if (!ok) toast.error("Erreur while fetching users");

    setClans(data);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newClanModified = { ...newClan, [name]: value };

    setNewClan(newClanModified);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ok, data } = await api.post("/clan", newClan);
    if (!ok) return toast.error("Error while creating clan");

    setOpen(false);
    return navigate(`/clans/${data._id}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Clans</h1>

      {realUser?.role === "ADMIN" && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setOpen(true)}
        >
          Create clan
        </button>
      )}

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
    </div>
  );
};

export default List;
