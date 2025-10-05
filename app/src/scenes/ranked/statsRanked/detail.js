import React, { useState, useEffect } from "react";
import API from "../../../services/api";
import Loader from "../../../components/Loader";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [statRanked, setStatRanked] = useState(null);

  const navigate = useNavigate();
  const realUser = useSelector((state) => state.Auth.user);

  const id = useParams().id;

  const get = async () => {
    const { ok, data } = await API.get(`/statRanked/${id}`);
    if (!ok) return toast.error("Erreur while fetching stat");

    setStatRanked(data);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Stat of {statRanked.userName}</h1>

      {realUser?.role === "ADMIN" && (
        <button
          className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            const res = await API.post(`/statRanked/updateStatPlayer/${statRanked._id}`);
            if (res.ok) {
              toast.success("Stat updated");
              return setStatRanked(res.data);
            }
            return toast.error("Error while updating stat");
          }}>
          Sync
        </button>
      )}
      <div className="flex flex-col justify-center overflow-x-auto">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-center pt-3">Player</h2>
          <h3 className="text-lg font-bold pt-3">Global</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Elo" value={statRanked.elo} />
            <StatCard title="KD Ratio" value={statRanked.kdRatio} />
            <StatCard
              title="Highest K/D Ratio"
              value={statRanked.highestKdRatio}
              onClick={() => navigate(`../../results/${statRanked.highestKdRatioResultId}`)}
            />
            <StatCard title="Total Score" value={statRanked.totalScore} />
            <StatCard title="Total Flags" value={statRanked.totalFlags} />
            <StatCard title="Avg. Flags" value={statRanked.averageFlags} />
          </div>

          <h3 className="text-lg font-bold pt-3">Kills</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Kills" value={statRanked.totalKills} />
            <StatCard title="Avg. Kills" value={statRanked.averageKills} />
            <StatCard
              title="Highest Kills"
              value={statRanked.highestKills}
              onClick={() => navigate(`../../results/${statRanked.highestKillResultId}`)}
            />
          </div>

          <h3 className="text-lg font-bold pt-3">Deaths</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Deaths" value={statRanked.totalDeaths} />
            <StatCard title="Avg. Deaths" value={statRanked.averageDeaths} />
            <StatCard
              title="Highest Deaths"
              value={statRanked.highestDeaths}
              onClick={() => navigate(`../../results/${statRanked.highestDeathResultId}`)}
            />
          </div>
          <h3 className="text-lg font-bold pt-3">Scores</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Total Score" value={statRanked.totalScore} />
            <StatCard title="Avg. Score" value={statRanked.averageScore} />
            <StatCard
              title="Highest Score"
              value={statRanked.highestScore}
              onClick={() => navigate(`../../results/${statRanked.highestScoreResultId}`)}
            />
            <StatCard title="Avg. Winning Result" value={statRanked.averageWinningScore} />
            <StatCard title="Avg. Losing Result" value={statRanked.averageLosingScore} />
          </div>
          <h2 className="text-xl font-bold text-center pt-3">Games</h2>
          <h3 className="text-lg font-bold pt-3">Global</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Win rate" value={statRanked.winRate} />
            <StatCard title="Nb. Games" value={statRanked.numberGames} />
            <StatCard title="Nb. Wins" value={statRanked.numberWins} />
            <StatCard title="Nb. Defeats" value={statRanked.numberLosses} />
          </div>

          <h3 className="text-lg font-bold pt-3">Red</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="win rate" value={statRanked.redWinRate} />
            <StatCard title="K/D" value={statRanked.redKdRatio} />
            <StatCard title="Total Kills" value={statRanked.redTotalKills} />
            <StatCard title="Total Deaths" value={statRanked.redTotalDeaths} />
            <StatCard title="Total flags" value={statRanked.redTotalFlags} />
            <StatCard title="Total Score" value={statRanked.redTotalScore} />
            <StatCard title="Avg. Score" value={statRanked.averageRedTeamScore} />
            <StatCard
              title="Highest Result"
              value={statRanked.highestRedTeamScore}
              onClick={() => navigate(`../../results/${statRanked.highestRedTeamScoreResultId}`)}
            />
          </div>

          <h3 className="text-lg font-bold pt-3">Blue</h3>
          <div className="flex flex-row space-x-4">
            <StatCard title="Win rate" value={statRanked.blueWinRate} />
            <StatCard title="K/D" value={statRanked.blueKdRatio} />
            <StatCard title="Total Kills" value={statRanked.blueTotalKills} />
            <StatCard title="Total Deaths" value={statRanked.blueTotalDeaths} />
            <StatCard title="Total flags" value={statRanked.blueTotalFlags} />
            <StatCard title="Total Score" value={statRanked.blueTotalScore} />
            <StatCard title="Avg. Score" value={statRanked.averageBlueTeamScore} />
            <StatCard
              title="Highest Result"
              value={statRanked.highestBlueTeamScore}
              onClick={() => navigate(`../../results/${statRanked.highestBlueTeamScoreResultId}`)}
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
    <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 space-y-2 cursor-pointer" onClick={onClick}>
      <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">{title}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  ) : (
    <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 space-y-2">
      <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">{title}</span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
};

export default Details;
