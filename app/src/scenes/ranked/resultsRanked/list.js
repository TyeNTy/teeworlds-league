import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";
import { modesWithLabel } from "../../../components/utils";
import { enumMapsWithLabel } from "../../../enums/enumMaps";
import { useSelector } from "react-redux";
import PaginatedTable from "../../../components/PaginatedTable";
import { displayDateWithTimeUntilNow } from "../../../utils/date";

const List = () => {
  const realUser = useSelector((state) => state.Auth.user);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModesRanked, setLoadingModesRanked] = useState(true);
  const [modesRanked, setModesRanked] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ numberPerPage, page });
  const [open, setOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    date: new Date().toISOString().split("T")[0],
    discordMessage: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingModesRanked(true);
      const { ok, data } = await api.post(`/mode/search`, { sort: "name", asc: true });
      if (!ok) toast.error("Erreur while fetching modes");
      setModesRanked(data);

      const firstMode = data[0];
      setFilters({ ...filters, modeId: firstMode._id });

      setLoadingModesRanked(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loadingModesRanked) return;

    const fetchData = async () => {
      const { ok, data } = await api.post(`/resultRanked/search`, filters);
      if (!ok) toast.error("Erreur while fetching results");

      let filteredData = data.resultsRanked;
      if (realUser?.role !== "ADMIN") {
        filteredData = filteredData.filter((result) => result.freezed);
      }

      setResults(filteredData);

      setPage(data.page);
      setTotal(data.total);

      setLoading(false);
    };

    fetchData();
  }, [filters]);

  const handleCreateResult = async () => {
    const { ok, data, errorCode, errorData } = await api.post(`/resultRanked/import`, { ...newPost });
    if (!ok) {
      if (errorCode === "PLAYER_NOT_FOUND") return toast.error(`Missing player \"${errorData.userName}\"`);
      if (errorCode === "TEAM_SIZE_MISMATCH") return toast.error("Team size mismatch");
      if (errorCode === "CLAN_NAME_MISMATCH")
        return toast.error(`Clan name "${errorData.clanName}" mismatch with "${errorData.clanNameReal}" for the player "${errorData.userName}"`);
      if (errorCode === "PLAYER_NOT_IN_CLAN") return toast.error(`Player "${errorData.userName}" is not in a clan`);
      if (errorCode === "CLAN_NOT_FOUND") return toast.error(`Clan "${errorData.clanName}" not found`);
      if (errorCode === "SAME_CLAN") return toast.error(`Red and blue players are in the same clan "${errorData.clanName}"`);
      return toast.error("Erreur while creating result");
    }

    setOpen(false);
    toast.success("Result created");
    navigate(`./${data._id}`);
  };

  if (loading || loadingModesRanked) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Results</h1>

      {realUser?.role === "ADMIN" && (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setOpen(true)}>
          Post result
        </button>
      )}

      <div className="flex flex-col justify-center mt-4">
        <select
          className="form-select mt-1 block w-full border border-gray-300 rounded-md p-2"
          value={filters.modeId}
          onChange={(e) => setFilters({ ...filters, modeId: e.target.value })}>
          {modesRanked.map((mode) => (
            <option key={mode._id} value={mode._id}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>

      <PaginatedTable
        filters={filters}
        setFilters={setFilters}
        titles={["Date", "Mode", "Map", "ELO Red", "Score", "ELO Blue", "Winner", "Status"]}
        elements={results.map((result) => ({
          _id: result._id,
          date: result.date,
          mode: result.mode,
          map: result.map,
          redEloBefore: result.redEloBefore,
          redScore: result.redScore,
          blueEloBefore: result.blueEloBefore,
          blueScore: result.blueScore,
          winnerName: result.winnerName,
          freezed: result.freezed,
          winnerSide: result.winnerSide,
          redEloGain: result.redEloGain,
          blueEloGain: result.blueEloGain,
          isForfeit: result.isForfeit,
          renderFunctions: [
            (element) => displayDateWithTimeUntilNow(new Date(element.date)),
            (element) => modesWithLabel.find((m) => m.value === element.mode)?.label ?? "Unknown",
            (element) => enumMapsWithLabel.find((m) => m.value === element.map)?.label ?? "Unknown",
            (element) => {
              if (element.isForfeit) {
                return element.winnerSide === "red"
                  ? { content: `${element.redEloBefore.toFixed(2)}`, className: "text-green-500" }
                  : { content: `${element.redEloBefore.toFixed(2)} (Forfeit)`, className: "text-red-500" };
              } else {
                const eloChange = element.freezed
                  ? ` (${element.winnerSide === "red" ? "+" + element.redEloGain.toFixed(2) : element.redEloGain.toFixed(2)})`
                  : "";
                return {
                  content: element.freezed ? `${element.redEloBefore.toFixed(2)}${eloChange}` : "",
                  className: element.winnerSide === "red" ? "text-green-500" : "text-red-500",
                };
              }
            },
            (element) => {
              if (element.isForfeit) {
                return element.winnerSide === "red"
                  ? { content: "1000 - Forfeit", className: "text-green-500" }
                  : { content: "Forfeit - 1000", className: "text-red-500" };
              } else {
                return {
                  content: `${Number(element.redScore)} - ${Number(element.blueScore)}`,
                  className: "",
                };
              }
            },
            (element) => {
              if (element.isForfeit) {
                return element.winnerSide === "blue"
                  ? { content: `${element.blueEloBefore.toFixed(2)}`, className: "text-green-500" }
                  : { content: `${element.blueEloBefore.toFixed(2)} (Forfeit)`, className: "text-red-500" };
              } else {
                const eloChange = element.freezed
                  ? ` (${element.winnerSide === "blue" ? "+" + element.blueEloGain.toFixed(2) : element.blueEloGain.toFixed(2)})`
                  : "";
                return {
                  content: element.freezed ? `${element.blueEloBefore.toFixed(2)}${eloChange}` : "",
                  className: element.winnerSide === "blue" ? "text-green-500" : "text-red-500",
                };
              }
            },
            (element) => element.winnerName,
            (element) => (element.freezed ? "Validated" : "Not validated"),
          ],
          className: result.freezed ? "cursor-pointer hover:bg-gray-100" : "cursor-pointer hover:bg-gray-100 opacity-50",
          onClick: () => navigate(`./${result._id}`),
        }))}
        total={total}
      />

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
            onChange={(e) => setNewPost({ ...newPost, message: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={handleCreateResult}>
            Post result
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default List;
