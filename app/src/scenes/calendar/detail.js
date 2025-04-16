import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import API from "../../services/api";

const Details = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allClans, setAllClans] = useState([]);

  const eventId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const get = async () => {
    const { ok, data } = await API.get(`/event/${eventId}`);
    if (!ok) toast.error("Error while fetching event");
    setEvent(data);

    const { ok: okClans, data: dataClans } = await API.post(`/clan/search`, {
      seasonId: currentSeason._id,
    });
    if (!okClans) toast.error("Error while fetching clans");
    setAllClans(dataClans);

    setLoading(false);
  };

  useEffect(() => {
    if (currentSeason) get();
  }, [eventId, currentSeason]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleSubmit = async () => {
    const { ok, data } = await API.put(`/event/${eventId}`, event);
    if (!ok) return toast.error("Error while updating event");
    setEvent(data);
    toast.success("Event updated successfully");
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirm) return;

    const { ok } = await API.remove(`/event/${eventId}`);
    if (!ok) return toast.error("Error while deleting event");

    toast.success("Event deleted successfully");
    navigate("/calendar");
  };

  if (loading || !currentSeason) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Event details</h1>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="title"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={event.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Event title"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={event.description}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Event description"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="clanAId"
        >
          Clan A
        </label>
        <select
          id="clanAId"
          name="clanAId"
          value={event.clanAId}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        >
          <option value="">Select Clan A</option>
          {allClans.map((clan) => (
            <option key={clan._id} value={clan._id}>
              {clan.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="clanBId"
        >
          Clan B
        </label>
        <select
          id="clanBId"
          name="clanBId"
          value={event.clanBId}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        >
          <option value="">Select Clan B</option>
          {allClans.map((clan) => (
            <option key={clan._id} value={clan._id}>
              {clan.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="startDate"
        >
          Start Date
        </label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          value={formatDateForInput(event.startDate)}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
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
          type="datetime-local"
          id="endDate"
          name="endDate"
          value={formatDateForInput(event.endDate)}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="twitch"
        >
          Twitch URL
        </label>
        <input
          type="text"
          id="twitch"
          name="twitch"
          value={event.twitch}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Twitch stream URL"
          disabled={realUser?.role !== "ADMIN" || !currentSeason?.isActive}
        />
      </div>

      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
};

export default Details;
