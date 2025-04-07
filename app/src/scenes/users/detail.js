import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

const Details = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const realUser = useSelector((state) => state.Auth.user);

  const userId = useParams().userId;
  const navigate = useNavigate();

  const fetchData = async () => {
    const { ok, data } = await api.post(`/user/search`, { _id: userId });
    if (!ok) return toast.error("Erreur while fetching user");

    if (data.length < 1) {
      toast.error("User not found");
      return navigate("/users");
    }

    setUser(data[0]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, data } = await api.put(`/user/${userId}`, user);
    if (!ok) return toast.error("Erreur while updating user");

    setUser(data);
    toast.success("User updated successfully");
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirm)
      return toast.error("Passwords do not match");

    if (newPassword.length < 1)
      return toast.error("Password must be at least 1 character long");

    const { ok, data } = await api.post(`/user/change-password`, {
      _id: userId,
      password: newPassword,
    });
    if (!ok) return toast.error("Erreur while changing password");

    toast.success("Password changed successfully");
    setIsOpen(false);
  };

  const handleDelete = async () => {
    const approved = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!approved) return;

    const { ok, data } = await api.remove(`/user/${userId}`);
    if (!ok) return toast.error("Erreur while deleting user");

    toast.success("User deleted successfully");
    navigate("/users");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">{user.userName}</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 px-2"
              htmlFor="userName"
            >
              Username
              <input
                type="text"
                id="userName"
                name="userName"
                value={user.userName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your username"
                disabled={realUser?.role !== "ADMIN"}
              />
            </label>
            <label
              className="block text-gray-700 text-sm font-bold mb-2 px-2"
              htmlFor="avatar"
            >
              Avatar
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={user.avatar}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter a link to your avatar"
                disabled={realUser?.role !== "ADMIN"}
              />
            </label>
          </div>
          <div className="flex flex-grow items-center">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 px-2"
              htmlFor="clan"
            >
              Clan
              <input
                type="text"
                id="clan"
                name="clan"
                value={user.clanName ?? "No clan"}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your clan"
                disabled
              />
            </label>
          </div>
        </div>
        {realUser?.role === "ADMIN" && (
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              disabled
            />
          </div>
        )}
        {realUser?.role === "ADMIN" && (
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your role"
              disabled
            />
          </div>
        )}
        {realUser?.role === "ADMIN" && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Reset password
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update
            </button>
          </div>
        )}
      </form>
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Change password"}
        onClose={() => setIsOpen(false)}
      >
        <div className="mb-4">
          <input
            type="password"
            id="password"
            name="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            placeholder="Enter new password"
          />
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={handleChangePassword}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Change password
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Details;
