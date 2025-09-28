import React from "react";
import { useNavigate } from "react-router-dom";

const Player = ({ player }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center cursor-pointer hover:bg-blue-100 p-2 rounded-md"
      onClick={(e) => {
        e.stopPropagation();

        if(window.location.pathname.includes("/league")) {
          return navigate(`/league/users/${player._id}`);
        }
        if(window.location.pathname.includes("/ranked")) {
          return navigate(`/ranked/users/${player._id}`);
        }

        return navigate(`/users/${player._id}`);
      }}
    >
      <img
        src={
          player.avatar ??
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        }
        alt={player.userName}
        className="w-10 h-10 rounded-full"
      />
      <span className="ml-2">{player.userName}</span>
    </div>
  );
};

export default Player;
