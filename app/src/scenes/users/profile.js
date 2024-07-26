import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const realUser = useSelector((state) => state.Auth.user);

  const fetchData = async () => {
    const { ok, data } = await api.post(`/user/search`, { _id: realUser._id });
    if (!ok) toast.error("Erreur while fetching user");

    setUser(data[0]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      user.password !== user.confirmPassword &&
      (user.password?.length > 0 || user.confirmPassword?.length > 0)
    )
      return toast.error("Passwords do not match");

    const { ok, data } = await api.put(`/user`, user);
    if (!ok) return toast.error("Erreur while updating user");

    user.password = "";
    user.confirmPassword = "";

    setUser(data);
    toast.success("User updated successfully");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Profile</h1>

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
                disabled
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
          />
        </div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-center">Change password</h1>
          <div className=" mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="New password"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
