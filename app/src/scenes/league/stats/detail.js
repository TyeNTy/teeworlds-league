import React, { useState, useEffect } from "react";
import API from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [stat, setStat] = useState(null);

  const navigate = useNavigate();
  const realUser = useSelector((state) => state.Auth.user);
  const currentSeason = useSelector((state) => state.Season.currentSeason);

  const id = useParams().id;

  const get = async () => {
    const { ok, data } = await API.get(`/stat/${id}`);
    if (!ok) return toast.error("Erreur while fetching stat");

    setStat(data);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">
        Stat of {stat.userName}
      </h1>

      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <button
          className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            const res = await API.post(`/stat/updateStatPlayer/${stat.userId}`);
            if (res.ok) {
              toast.success("Stat updated");
              return setStat(res.data);
            }
            return toast.error("Error while updating stat");
          }}
        >
          Sync
        </button>
      )}
      <div className="flex flex-col justify-center overflow-x-auto">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-center pt-3">Player</h2>
          <h3 className="text-lg font-bold pt-3">Global</h3>
          <div className="flex flex-row space-x-4">
            <StatCard
              title="Clan"
              value={stat.clanName}
              onClick={() => navigate(`/clans/${stat.clanId}`)}
            />
            <StatCard title="Elo" value={stat.elo} />
            <StatCard title="KD Ratio" value={stat.kdRatio} />
            <StatCard
              title="Highest K/D Ratio"
              value={stat.highestKdRatio}
              onClick={() =>
                navigate(`/results/${stat.highestKdRatioResultId}`)
              }
            />
            <StatCard title="Total Score" value={stat.totalScore} />
            <StatCard title="Total Flags" value={stat.totalFlags} />
            <StatCard title="Avg. Flags" value={stat.averageFlags} />
          </div>

          <h3 className="text-lg font-bold pt-3">Kills</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Kills" value={stat.totalKills} />
            <StatCard title="Avg. Kills" value={stat.averageKills} />
            <StatCard
              title="Highest Kills"
              value={stat.highestKills}
              onClick={() => navigate(`/results/${stat.highestKillResultId}`)}
            />
          </div>

          <h3 className="text-lg font-bold pt-3">Deaths</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Deaths" value={stat.totalDeaths} />
            <StatCard title="Avg. Deaths" value={stat.averageDeaths} />
            <StatCard
              title="Highest Deaths"
              value={stat.highestDeaths}
              onClick={() => navigate(`/results/${stat.highestDeathResultId}`)}
            />
          </div>
          <h3 className="text-lg font-bold pt-3">Scores</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Total Score" value={stat.totalScore} />
            <StatCard title="Avg. Score" value={stat.averageScore} />
            <StatCard
              title="Highest Score"
              value={stat.highestScore}
              onClick={() => navigate(`/results/${stat.highestScoreResultId}`)}
            />
            <StatCard
              title="Avg. Winning Result"
              value={stat.averageWinningScore}
            />
            <StatCard
              title="Avg. Losing Result"
              value={stat.averageLosingScore}
            />
          </div>
          <h2 className="text-xl font-bold text-center pt-3">Games</h2>
          <h3 className="text-lg font-bold pt-3">Global</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Win rate" value={stat.winRate} />
            <StatCard title="Nb. Games" value={stat.numberGames} />
            <StatCard title="Nb. Wins" value={stat.numberWins} />
            <StatCard title="Nb. Defeats" value={stat.numberLosses} />
          </div>

          <h3 className="text-lg font-bold pt-3">Red</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="win rate" value={stat.redWinRate} />
            <StatCard title="K/D" value={stat.redKdRatio} />
            <StatCard title="Total Kills" value={stat.redTotalKills} />
            <StatCard title="Total Deaths" value={stat.redTotalDeaths} />
            <StatCard title="Total flags" value={stat.redTotalFlags} />
            <StatCard title="Total Score" value={stat.redTotalScore} />
            <StatCard title="Avg. Score" value={stat.averageRedTeamScore} />
            <StatCard
              title="Highest Result"
              value={stat.highestRedTeamScore}
              onClick={() =>
                navigate(`/results/${stat.highestRedTeamScoreResultId}`)
              }
            />
          </div>

          <h3 className="text-lg font-bold pt-3">Blue</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Win rate" value={stat.blueWinRate} />
            <StatCard title="K/D" value={stat.blueKdRatio} />
            <StatCard title="Total Kills" value={stat.blueTotalKills} />
            <StatCard title="Total Deaths" value={stat.blueTotalDeaths} />
            <StatCard title="Total flags" value={stat.blueTotalFlags} />
            <StatCard title="Total Score" value={stat.blueTotalScore} />
            <StatCard title="Avg. Score" value={stat.averageBlueTeamScore} />
            <StatCard
              title="Highest Result"
              value={stat.highestBlueTeamScore}
              onClick={() =>
                navigate(`/results/${stat.highestBlueTeamScoreResultId}`)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, onClick }) => {
  if (typeof value === "number") value = value.toFixed(2).replace(/\.0+$/, "");

  return onClick ? (
    <div
      className="flex flex-col bg-white shadow-lg rounded-lg p-6 space-y-2 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">
        {title}
      </span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  ) : (
    <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 space-y-2">
      <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">
        {title}
      </span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
};

export default Details;
