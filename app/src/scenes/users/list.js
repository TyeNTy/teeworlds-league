import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

const List = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [newPlayer, setNewPlayer] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showCreatePlayer, setShowCreatePlayer] = useState(false);

  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  const navigate = useNavigate();

  const get = async () => {
    const { ok, data } = await api.post(`/user/search`, { ...filters });
    if (!ok) toast.error("Erreur while fetching users");

    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    setFilters(newFilters);
  };

  const handleCreatePlayerChange = (e) => {
    const { name, value } = e.target;
    setNewPlayer({ ...newPlayer, [name]: value });
  };

  const handleCreatePlayer = async () => {
    const { ok, data } = await api.post(`/user`, newPlayer);
    if (!ok) return toast.error("Erreur while creating user");

    get();
    setShowCreatePlayer(false);
    navigate(`./${data._id}`);
    toast.success("User created successfully");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Players</h1>

      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowCreatePlayer(true)}
        >
          Create player
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              {realUser?.role === "ADMIN" && (
                <th className="px-4 py-2">Email</th>
              )}
              {realUser?.role === "ADMIN" && (
                <th className="px-4 py-2">Role</th>
              )}
              <th className="px-4 py-2">Clan name</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`./${user._id}`)}
              >
                <td className="border px-4 py-2">{user.userName}</td>
                {realUser?.role === "ADMIN" && (
                  <td className="border px-4 py-2">{user.email}</td>
                )}
                {realUser?.role === "ADMIN" && (
                  <td className="border px-4 py-2">{user.role}</td>
                )}
                <td className="border px-4 py-2">{user.clanName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={showCreatePlayer}
        onClose={() => setShowCreatePlayer(false)}
      >
        <label className="block mt-4" htmlFor="userName">
          <span className="text-gray-700">Username</span>
          <input
            type="text"
            name="userName"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2"
            onChange={handleCreatePlayerChange}
            placeholder="Name"
          />
        </label>
        <label className="block mt-4" htmlFor="email">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2"
            onChange={handleCreatePlayerChange}
            placeholder="Email"
          />
        </label>
        <label className="block mt-4" htmlFor="password">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            name="password"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2"
            onChange={handleCreatePlayerChange}
            placeholder="Password"
          />
        </label>
        <label className="block mt-4" htmlFor="confirmPassword">
          <span className="text-gray-700">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2"
            onChange={handleCreatePlayerChange}
            placeholder="Confirm password"
          />
        </label>
        <label className="block mt-4" htmlFor="role">
          <span className="text-gray-700">Role</span>
          <select
            name="role"
            className="form-select mt-1 block w-full border border-gray-300 rounded-md p-2"
            onChange={handleCreatePlayerChange}
          >
            <option value="">Select Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </label>
        <div className="flex items-end justify-end">
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreatePlayer}
          >
            Create
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default List;
