import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { setUser } from "../redux/auth/actions";
import GCTFLogo from "../assets/gctfLeagueLogo.png";

const TopBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const res = await API.post("/user/logout");
      if (!res.ok) return;
      API.setToken(null);
      dispatch(setUser(null));
      const redirect = window.location.pathname.includes("/profile")
        ? "/"
        : window.location.pathname;
      navigate(redirect);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="pl-4">
          <Link to="/users" className="flex text-lg font-bold items-center">
            <img src={GCTFLogo} alt="GCTF League" className="w-12 h-12" />
            gCTF League
          </Link>
        </div>

        <div className="flex items-center">
          <nav className="flex items-center justify-center">
            <div className="flex items-center pr-4">
              <Link to="/rules/league" className="ml-2">
                Rules
              </Link>
            </div>
            <div className="flex items-center pr-4">
              <Link to="/users" className="ml-2">
                Players
              </Link>
            </div>
            <div className="flex items-center pr-4">
              <Link to="/clans" className="ml-2">
                Clans
              </Link>
            </div>
            <div className="flex items-center pr-4">
              <Link to="/results" className="ml-2">
                Results
              </Link>
            </div>
            <div className="flex items-center pr-4">
              <Link to="/stats" className="ml-2">
                Stats
              </Link>
            </div>
            <div className="border-r border-gray-600 h-6 mx-4" />
            <ul className="flex flex-col items-center">
              <li className="flex items-center pr-4">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center text-white focus:outline-none"
                    >
                      <span className="ml-2">{user.userName}</span>
                      <img
                        src={user.avatar}
                        alt={user.userName}
                        className="w-8 h-8 rounded-full ml-2"
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                          onClick={() => navigate("/users/profile")}
                        >
                          Profile
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={`/auth/signin?redirectUrl=${window.location.pathname}`}
                    className="ml-2"
                  >
                    Log in
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
