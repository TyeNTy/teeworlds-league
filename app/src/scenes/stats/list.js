import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Player from "../../components/Player";
import { useSelector } from "react-redux";
import StatColored from "../../components/StatColored";

const List = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: "winRate", asc: false });

  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const get = async () => {
    const { ok, data } = await api.post(`/stat/search`, filters);
    if (!ok) return toast.error("Erreur while fetching stats");

    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [filters]);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Stats</h1>

      <div className="flex items-center my-4">
        <label className="mr-2">Player</label>
        <input
          type="text"
          className="border p-2 mr-2"
          value={filters.userName}
          placeholder="Search by player name"
          onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
        />
        <label className="mr-2">Clan</label>
        <input
          type="text"
          className="border p-2 mr-2"
          value={filters.clanName}
          placeholder="Search by clan name"
          onChange={(e) => setFilters({ ...filters, clanName: e.target.value })}
        />
      </div>

      <div className="flex flex-col justify-center overflow-x-auto">
        <table className="table-auto min-w-full">
          <thead>
            <tr>
              {[
                { label: "Player", key: "userName" },
                { label: "Clan", key: "clanName" },
                { label: "Wins", key: "numberWins" },
                { label: "Losses", key: "numberLosses" },
                { label: "Win rate", key: "winRate" },
                { label: "Avg. Kills", key: "averageKills" },
                { label: "Avg. Deaths", key: "averageDeaths" },
                { label: "K/D", key: "kdRatio" },
                { label: "Avg. Flag", key: "averageFlags" },
                { label: "Avg. Score", key: "averageScore" },
                { label: "elo", key: "elo" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  className="cursor-pointer hover:underline"
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
            {stats.map((stat) => (
              <tr
                key={stat._id}
                onClick={() => navigate(`/stats/${stat._id}`)}
                className={"cursor-pointer hover:bg-gray-100"}
              >
                <td className="border px-2 py-2">
                  <Player
                    player={{
                      userName: stat.userName,
                      avatar: stat.avatar,
                      _id: stat.userId,
                    }}
                  />
                </td>
                <td className="border px-2 py-2">{stat.clanName}</td>
                <td className="border px-2 py-2">{stat.numberWins}</td>
                <td className="border px-2 py-2">{stat.numberLosses}</td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.winRate.toFixed(2)}
                    min={0}
                    max={1}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.averageKills.toFixed(2)}
                    min={0}
                    max={150}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.averageDeaths.toFixed(2)}
                    min={0}
                    max={150}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.kdRatio.toFixed(2)}
                    min={0.7}
                    max={1.3}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.averageFlags.toFixed(2)}
                    min={0}
                    max={10}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.averageScore.toFixed(2)}
                    min={30}
                    max={170}
                  />
                </td>
                <td className="border px-2 py-2">
                  <StatColored
                    value={stat.elo.toFixed(2)}
                    min={500}
                    max={1500}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
