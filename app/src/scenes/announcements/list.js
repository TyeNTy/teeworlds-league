import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import StatColored from "../../components/StatColored";
import { modes } from "../../components/utils";
import toast from "react-hot-toast";

const List = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [clans, setClans] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({});
  const [filters, setFilters] = useState({ sort: "date", asc: false });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/announcement/search`, { ...filters });
    if (!ok) toast.error("Erreur while fetching announcements");
    setAnnouncements(data);

    const { ok: okClans, data: dataClans } = await api.post(`/clan/search`, {});
    if (!okClans) toast.error("Erreur while fetching clans");
    setClans(dataClans);

    const { ok: okModerators, data: dataModerators } =
      await api.post(`/user/search`);
    if (!okModerators) toast.error("Erreur while fetching moderators");
    setModerators(dataModerators);

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newAnnouncement.redClan === newAnnouncement.blueClan)
      return toast.error("Clans must be different");
    if (newAnnouncement.date < new Date().toISOString())
      return toast.error("Date must be in the future");
    if (
      !newAnnouncement.redClan ||
      !newAnnouncement.blueClan ||
      !newAnnouncement.moderator ||
      !newAnnouncement.mode
    )
      return toast.error("All fields are required");

    const { ok } = await api.post("/announcement", newAnnouncement);
    if (!ok) return toast.error("Erreur while creating newAnnouncement");
    setOpen(false);
    get();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewAnnouncement({ ...newAnnouncement, [name]: value });
  };

  useEffect(() => {
    get();
  }, [filters]);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Clans</h1>

      {realUser?.role === "ADMIN" && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setOpen(true)}
        >
          New incoming match
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              {[
                { label: "Date", key: "date" },
                { label: "Clan A", key: "redClanName" },
                { label: "Clan B", key: "blueClanName" },
                { label: "Moderator", key: "moderator" },
                { label: "Mode", key: "mode" },
                { label: "Streams", key: "streams" },
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
            {announcements.map((announcement) => (
              <tr
                key={announcement._id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/announcements/${announcement._id}`)}
              >
                <td className="border px-4 py-2">{announcement.date}</td>
                <td className="border px-4 py-2">{announcement.redClanName}</td>
                <td className="border px-4 py-2">
                  {announcement.blueClanName}
                </td>
                <td className="border px-4 py-2">{announcement.moderator}</td>
                <td className="border px-4 py-2">{announcement.mode}</td>
                {
                  <td className="border px-4 py-2">
                    {announcement.streams.map((stream, index) => (
                      <a
                        key={index}
                        href={stream}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {stream}
                      </a>
                    ))}
                  </td>
                }
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
              htmlFor="date"
            >
              Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              type="datetime-local"
              placeholder="Date"
              name="date"
              value={newAnnouncement.name}
              onChange={handleChange}
            />

            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="redClan"
            >
              Clan A
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="redClan"
              name="redClan"
              value={newAnnouncement.redClan}
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Select a clan
              </option>
              {clans.map((clan) => (
                <option key={clan._id} value={clan._id}>
                  {clan.name}
                </option>
              ))}
            </select>

            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="blueClan"
            >
              Clan B
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="blueClan"
              name="blueClan"
              value={newAnnouncement.blueClan}
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Select a clan
              </option>
              {clans.map((clan) => (
                <option key={clan._id} value={clan._id}>
                  {clan.name}
                </option>
              ))}
            </select>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="moderator"
            >
              Moderator
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="moderator"
              name="moderator"
              value={newAnnouncement.moderator}
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Select a moderator
              </option>
              {moderators.map((moderator) => (
                <option key={moderator._id} value={moderator._id}>
                  {moderator.userName}
                </option>
              ))}
            </select>
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
              value={newAnnouncement.mode}
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Select a mode
              </option>
              {modes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="streams"
            >
              Streams
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="streams"
              type="text"
              placeholder="Streams, separated by enter"
              name="streams"
              value={newAnnouncement.streams}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              New incoming match
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default List;
