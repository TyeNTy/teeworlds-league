import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";
import { modesWithLabel } from "../../../components/utils";
import { enumMapsWithLabel } from "../../../enums/enumMaps";
import { useSelector } from "react-redux";

const List = () => {
  const currentSeason = useSelector((state) => state.Season.currentSeason);
  const realUser = useSelector((state) => state.Auth.user);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ seasonId: currentSeason._id });
  const [open, setOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    date: new Date().toISOString().split("T")[0],
    discordMessage: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (currentSeason) {
      const fetchData = async () => {
        const { ok, data } = await api.post(`/resultRanked/search`, {
          ...filters,
          seasonId: currentSeason._id,
          seasonName: currentSeason.name,
        });
        if (!ok) toast.error("Erreur while fetching results");

        let filteredData = data;
        if (realUser?.role !== "ADMIN") {
          filteredData = data.filter((result) => result.freezed);
        }

        setResults(filteredData);
        setLoading(false);
      };

      fetchData();
    }
  }, [filters, currentSeason]);

  const handleCreateResult = async () => {
    const { ok, data, errorCode, errorData } = await api.post(
      `/resultRanked/import`,
      { ...newPost }
    );
    if (!ok) {
      if (errorCode === "PLAYER_NOT_FOUND")
        return toast.error(`Missing player \"${errorData.userName}\"`);
      if (errorCode === "TEAM_SIZE_MISMATCH")
        return toast.error("Team size mismatch");
      if (errorCode === "CLAN_NAME_MISMATCH")
        return toast.error(
          `Clan name "${errorData.clanName}" mismatch with "${errorData.clanNameReal}" for the player "${errorData.userName}"`
        );
      if (errorCode === "PLAYER_NOT_IN_CLAN")
        return toast.error(`Player "${errorData.userName}" is not in a clan`);
      if (errorCode === "CLAN_NOT_FOUND")
        return toast.error(`Clan "${errorData.clanName}" not found`);
      if (errorCode === "SAME_CLAN")
        return toast.error(
          `Red and blue players are in the same clan "${errorData.clanName}"`
        );
      return toast.error("Erreur while creating result");
    }

    setOpen(false);
    toast.success("Result created");
    navigate(`./${data._id}`);
  };

  if (loading || !currentSeason) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Results</h1>

      {realUser?.role === "ADMIN" && currentSeason?.isActive && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setOpen(true)}
        >
          Post result
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Mode</th>
              <th className="px-4 py-2">Map</th>
              <th className="px-4 py-2">ELO Red</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">ELO Blue</th>
              <th className="px-4 py-2">Winner</th>
              {realUser?.role === "ADMIN" && (
                <th className="px-4 py-2">Status</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result._id}
                className={
                  result.freezed
                    ? "cursor-pointer hover:bg-gray-100"
                    : "cursor-pointer hover:bg-gray-100 opacity-50"
                }
                onClick={() => navigate(`./${result._id}`)}
              >
                <td className="border px-4 py-2">
                  {result.date.split("T")[0]}
                </td>
                <td className="border px-4 py-2">
                  {modesWithLabel.find((m) => m.value === result.mode)?.label ??
                    "Unknown"}
                </td>
                <td className="border px-4 py-2">
                  {enumMapsWithLabel.find((m) => m.value === result.map)?.label ?? "Unknown"}
                </td>
                {result.isForfeit ? (
                  result.winnerSide === "red" ? (
                    <>
                      <td className="border px-4 py-2 text-green-500">{`${result.redEloBefore.toFixed(2)}`}</td>
                      <td className="border px-4 py-2">
                        <span className="text-green-500">1000</span> -{" "}
                        <span className="text-red-500">Forfeit</span>
                      </td>
                      <td className="border px-4 py-2 text-red-500">{`${result.blueEloBefore.toFixed(2)} (Forfeit)`}</td>
                    </>
                  ) : (
                    <>
                      <td className="border px-4 py-2 text-red-500">{`${result.redEloBefore.toFixed(2)} (Forfeit)`}</td>
                      <td className="border px-4 py-2">
                        <span className="text-red-500">Forfeit</span> -{" "}
                        <span className="text-green-500">1000</span>
                      </td>
                      <td className="border px-4 py-2 text-green-500">{`${result.blueEloBefore.toFixed(2)}`}</td>
                    </>
                  )
                ) : (
                  <>
                    <td
                      className={
                        result.winnerSide === "red"
                          ? "border px-4 py-2 text-green-500"
                          : "border px-4 py-2 text-red-500"
                      }
                    >{`${
                      result.freezed
                        ? `${result.redEloBefore.toFixed(2)} (${
                            result.winnerSide === "red"
                              ? "+" + result.redEloGain.toFixed(2)
                              : result.redEloGain.toFixed(2)
                          })`
                        : ""
                    }`}</td>
                    <td className="border px-4 py-2">
                      <span
                        className={
                          result.winnerSide === "red"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {Number(result.redScore)}
                      </span>{" "}
                      -{" "}
                      <span
                        className={
                          result.winnerSide === "blue"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {Number(result.blueScore)}
                      </span>
                    </td>
                    <td
                      className={
                        result.winnerSide === "blue"
                          ? "border px-4 py-2 text-green-500"
                          : "border px-4 py-2 text-red-500"
                      }
                    >{`${
                      result.freezed
                        ? `${result.blueEloBefore.toFixed(2)} (${
                            result.winnerSide === "blue"
                              ? "+" + result.blueEloGain.toFixed(2)
                              : result.blueEloGain.toFixed(2)
                          })`
                        : ""
                    }`}</td>
                  </>
                )}
                <td className="border px-4 py-2">{result.winnerName}</td>
                {realUser?.role === "ADMIN" && currentSeason?.isActive && (
                  <td className="border px-4 py-2">
                    <span
                      className={
                        result.freezed ? "text-green-500" : "text-red-500"
                      }
                    >
                      {result.freezed ? "Validated" : "Not validated"}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post result">
        <div className="flex flex-col">
          <label className="text-sm font-bold">Date</label>
          <input
            type="date"
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={newPost.date}
            onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
          />
          <label className="text-sm font-bold mt-4">Discord message</label>
          <textarea
            className="form-input mt-1 block w-full border border-gray-300 rounded-md p-2 h-64"
            value={newPost.content}
            placeholder="Discord message, leave blank if no message"
            onChange={(e) =>
              setNewPost({ ...newPost, message: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleCreateResult}
          >
            Post result
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default List;
