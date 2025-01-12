import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Player from "../../components/Player";
import { maps, modes } from "../../components/utils";
import { useSelector } from "react-redux";

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [redClanPlayers, setRedClanPlayers] = useState([]);
  const [blueClanPlayers, setBlueClanPlayers] = useState([]);
  const [open, setOpen] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(null);
  const [isRed, setIsRed] = useState(true);
  const [clans, setClans] = useState([]);
  const [canEdit, setCanEdit] = useState(false);

  const [result, setResult] = useState(null);
  const [canUpdate, setCanUpdate] = useState(false);

  const resultId = useParams().id;
  const navigate = useNavigate();

  const realUser = useSelector((state) => state.Auth.user);

  const getRedClanPlayers = async () => {
    const { ok: okPlayers, data: dataPlayers } = await api.post(
      `/user/search`,
      { clanId: result.redClanId }
    );
    if (!okPlayers) return toast.error("Erreur while fetching players");
    setRedClanPlayers(dataPlayers);
  };

  const getBlueClanPlayers = async () => {
    const { ok, data } = await api.post(`/user/search`, {
      clanId: result.blueClanId,
    });
    if (!ok) return toast.error("Erreur while fetching players");
    setBlueClanPlayers(data);
  };

  const get = async () => {
    const { ok, data } = await api.post(`/result/search`, { _id: resultId });
    if (!ok) return toast.error("Erreur while fetching result");

    if (data.length !== 1) return toast.error("Result not found");
    setResult(data[0]);

    const { ok: okClans, data: dataClans } = await api.post(`/clan/search`, {});
    if (!okClans) return toast.error("Erreur while fetching clans");

    setClans(dataClans);

    setCanEdit(realUser?.role === "ADMIN" && !data[0].freezed);

    setCanUpdate(false);
    setLoading(false);
  };

  useEffect(() => {
    get();
  }, [resultId]);

  const handleSubmit = async () => {
    const { ok } = await api.put(`/result/${resultId}`, { ...result });
    if (!ok) toast.error("Erreur while updating result");

    toast.success("Result updated");
    setLoading(true);
    get();
  };

  const handleAddPlayer = async () => {
    if (!playerSelected) return toast.error("Please select a player");

    if (isRed) {
      const { ok, data } = await api.post(`/result/${resultId}/addRedPlayer`, {
        playerId: playerSelected._id,
      });
      if (!ok) return toast.error("Erreur while adding red player");

      const newPlayers = data.redPlayers.filter(
        (p) => p.userId === playerSelected._id
      );
      if (newPlayers.length === 0)
        return toast.error("Error, there is no player returned");
      const newPlayer = newPlayers[0];

      setResult({
        ...result,
        redPlayers: [...result.redPlayers, newPlayer],
      });
      toast.success("Player added to red team");
    } else {
      const { ok, data } = await api.post(`/result/${resultId}/addBluePlayer`, {
        playerId: playerSelected._id,
      });
      if (!ok) return toast.error("Erreur while adding blue player");

      const newPlayers = data.bluePlayers.filter(
        (p) => p.userId === playerSelected._id
      );
      if (newPlayers.length === 0)
        return toast.error("Error, there is no player returned");
      const newPlayer = newPlayers[0];

      setResult({
        ...result,
        bluePlayers: [...result.bluePlayers, newPlayer],
      });
      toast.success("Player added to blue team");
    }
    setOpen(false);
  };

  const handleDeletePlayer = async (player) => {
    const approved = window.confirm(
      "Are you sure you want to remove this player ?"
    );
    if (!approved) return;

    const { ok } = await api.post(`/result/${resultId}/removePlayer`, {
      playerId: player.userId,
    });
    if (!ok) return toast.error("Erreur while removing player");
    setResult({
      ...result,
      redPlayers: result.redPlayers.filter((p) => p._id !== player._id),
      bluePlayers: result.bluePlayers.filter((p) => p._id !== player._id),
    });
    toast.success("Player removed successfully");
  };

  const handleUpdateRedPlayer = async (e, player) => {
    setCanUpdate(true);
    const { name, value } = e.target;
    const redPlayer = result.redPlayers.find((p) => p._id === player._id);
    redPlayer[name] = value;
    setResult({ ...result, redPlayers: [...result.redPlayers] });
  };

  const handleUpdateBluePlayer = async (e, player) => {
    setCanUpdate(true);
    const { name, value } = e.target;
    const bluePlayer = result.bluePlayers.find((p) => p._id === player._id);
    bluePlayer[name] = value;
    setResult({ ...result, bluePlayers: [...result.bluePlayers] });
  };

  const handleDelete = async () => {
    const approved = window.confirm(
      "Are you sure you want to delete this result ?"
    );
    if (!approved) return;

    const { ok } = await api.remove(`/result/${resultId}`);
    if (!ok) toast.error("Erreur while deleting result");

    navigate("/results");
  };

  const handleChange = (e) => {
    setCanUpdate(true);
    const { name, value } = e.target;
    setResult({ ...result, [name]: value });
  };

  const handleFreeze = async () => {
    const approved = window.confirm(
      "Are you sure you want to freeze this result ? You won't be able to edit it anymore."
    );
    if (!approved) return;

    const { ok, data } = await api.post(`/result/${resultId}/freeze`);
    if (!ok) return toast.error("Erreur while freezing result");

    toast.success("Result frozen");
    await get();
  };

  const handleForfeit = async (side) => {
    const approved = window.confirm(
      `Are you sure you want to declare forfeit for the ${side} side ?`
    );

    if (!approved) return;

    const { ok, data } = await api.post(`/result/${resultId}/forfeit`, {
      side,
    });
    if (!ok) return toast.error("Erreur while declaring forfeit");

    setResult(data);
    toast.success(`Forfeit declared for ${side} side`);
  };

  const handleUnforfeit = async (side) => {
    const approved = window.confirm(
      `Are you sure you want to remove forfeit for the ${side} side ?`
    );

    if (!approved) return;

    const { ok, data } = await api.post(`/result/${resultId}/unforfeit`);
    if (!ok) return toast.error("Erreur while removing forfeit");

    setResult(data);
    toast.success(`Forfeit removed for ${side} side`);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Result details</h1>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mt-2"
          htmlFor="date"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={result.date.split("T")[0]}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Name of the clan"
          disabled={!canEdit}
        />
        <label
          className="block text-gray-700 text-sm font-bold mt-2"
          htmlFor="mode"
        >
          Mode
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="mode"
          name="mode"
          onChange={handleChange}
          value={result.mode}
          disabled={!canEdit}
        >
          <option value="" disabled>
            Select a mode
          </option>
          {modes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <label
          className="block text-gray-700 text-sm font-bold mt-2"
          htmlFor="timeLimit"
        >
          Time limit
        </label>
        <input
          type="number"
          id="timeLimit"
          name="timeLimit"
          value={result.timeLimit}
          onChange={handleChange}
          min={0}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Time limit in minutes"
          disabled={!canEdit}
        />
        <label
          className="block text-gray-700 text-sm font-bold mt-2"
          htmlFor="scoreLimit"
        >
          Score limit
        </label>
        <input
          type="number"
          id="scoreLimit"
          name="scoreLimit"
          value={result.scoreLimit}
          onChange={handleChange}
          min={0}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Score limit"
          disabled={!canEdit}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mt-2"
          htmlFor="map"
        >
          Map
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="map"
          name="map"
          onChange={handleChange}
          value={result.map}
          disabled={!canEdit}
        >
          <option value="" disabled>
            Select a map
          </option>
          {maps.map((map) => (
            <option key={map.value} value={map.value}>
              {map.label}
            </option>
          ))}
        </select>
      </div>

      <h1 className="text-xl font-bold text-center">Match details</h1>
      <div className="flex justify-between">
        <div className="mb-4">
          <div className="flex flex-row items-center">
            <label>
              Red clan
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="redClanId"
                name="redClanId"
                onChange={handleChange}
                value={result.redClanId || ""}
                disabled={!canEdit}
              >
                <option value="" disabled>
                  Select a clan
                </option>
                {clans.map((clan) => (
                  <option key={clan._id} value={clan._id}>
                    {clan.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="ml-2">
              Score
              <input
                type="number"
                className="ml-2 w-20"
                min={0}
                max={2000}
                value={result.redScore}
                onChange={handleChange}
                name="redScore"
                disabled={!canEdit}
              />
            </label>
            {canEdit ? (
              result.isForfeit ? (
                result.winnerSide === "blue" ? (
                  <button
                    className="ml-2 bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleUnforfeit("red")}
                  >
                    Unforfeit
                  </button>
                ) : null
              ) : (
                <button
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleForfeit("red")}
                >
                  Forfeit
                </button>
              )
            ) : null}
          </div>
          <div className="flex flex-col items-center">
            {result.redPlayers.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nb. Flags
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kills
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deaths
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.redPlayers.map((player) => (
                    <tr key={player._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {canEdit && (
                          <MdDelete
                            size={20}
                            color="red"
                            className="cursor-pointer"
                            onClick={() => handleDeletePlayer(player)}
                            disabled={!canEdit}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Player
                          player={{
                            _id: player.userId,
                            userName: player.userName,
                            avatar: player.avatar,
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.score}
                          onChange={(e) => handleUpdateRedPlayer(e, player)}
                          name="score"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.flags}
                          onChange={(e) => handleUpdateRedPlayer(e, player)}
                          name="flags"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.kills}
                          onChange={(e) => handleUpdateRedPlayer(e, player)}
                          name="kills"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.deaths}
                          onChange={(e) => handleUpdateRedPlayer(e, player)}
                          name="deaths"
                          disabled={!canEdit}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {canEdit && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                onClick={() => {
                  setIsRed(true);
                  getRedClanPlayers();
                  setOpen(true);
                }}
              >
                Add red player
              </button>
            )}
          </div>
        </div>
        <div className="mb-4 ml-2">
          <div className="flex flex-row items-center">
            <label>
              Blue clan
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="blueClanId"
                name="blueClanId"
                onChange={handleChange}
                value={result.blueClanId || ""}
                disabled={!canEdit}
              >
                <option value="" disabled>
                  Select a clan
                </option>
                {clans.map((clan) => (
                  <option key={clan._id} value={clan._id}>
                    {clan.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="ml-2">
              Score
              <input
                type="number"
                className="ml-2 w-20"
                min={0}
                max={2000}
                value={result.blueScore}
                onChange={handleChange}
                name="blueScore"
                disabled={!canEdit}
              />
            </label>
            {canEdit ? (
              result.isForfeit ? (
                result.winnerSide === "red" ? (
                  <button
                    className="ml-2 bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleUnforfeit("blue")}
                  >
                    Unforfeit
                  </button>
                ) : null
              ) : (
                <button
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleForfeit("blue")}
                >
                  Forfeit
                </button>
              )
            ) : null}
          </div>
          <div className="flex flex-col items-center">
            {result.bluePlayers.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nb. Flags
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kills
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deaths
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.bluePlayers.map((player) => (
                    <tr key={player._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {canEdit && (
                          <MdDelete
                            size={20}
                            color="red"
                            className="cursor-pointer"
                            onClick={() => handleDeletePlayer(player)}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Player
                          player={{
                            _id: player.userId,
                            userName: player.userName,
                            avatar: player.avatar,
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.score}
                          onChange={(e) => handleUpdateBluePlayer(e, player)}
                          name="score"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.flags}
                          onChange={(e) => handleUpdateBluePlayer(e, player)}
                          name="flags"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.kills}
                          onChange={(e) => handleUpdateBluePlayer(e, player)}
                          name="kills"
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          className="w-10"
                          min={0}
                          max={1000}
                          value={player.deaths}
                          onChange={(e) => handleUpdateBluePlayer(e, player)}
                          name="deaths"
                          disabled={!canEdit}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {canEdit && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                onClick={() => {
                  setIsRed(false);
                  getBlueClanPlayers();
                  setOpen(true);
                }}
              >
                Add blue player
              </button>
            )}
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center justify-between">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete
          </button>
          <div className="flex items-center">
            {canUpdate ? (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                onClick={handleSubmit}
              >
                Update
              </button>
            ) : (
              <button
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleFreeze}
              >
                Freeze game
              </button>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add player">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="playerId"
            name="playerId"
            value={playerSelected?._id ?? ""}
            onChange={(e) =>
              setPlayerSelected(
                isRed
                  ? redClanPlayers.find(
                      (player) => player._id === e.target.value
                    )
                  : blueClanPlayers.find(
                      (player) => player._id === e.target.value
                    )
              )
            }
          >
            <option value="" disabled>
              Select a player
            </option>
            {isRed
              ? redClanPlayers.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.userName}
                  </option>
                ))
              : blueClanPlayers.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.userName}
                  </option>
                ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => handleAddPlayer()}
          >
            Add player
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Details;
