import { useState } from "react";
import api from "../Api";
import axios from "axios";

const TeamTable = ({ teams: initialTeams }) => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const [players, setPlayers] = useState([]);
  const [showPlayersFor, setShowPlayersFor] = useState(null);
  const [teams, setTeams] = useState(initialTeams);

  const fetchPlayers = async (uuid) => {
    try {
      const res = await axios.get(`${apiUrl}/player/get-players/${uuid}`);
      setPlayers(res.data);
      setShowPlayersFor(uuid);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  const closePlayers = () => {
    setShowPlayersFor(null);
    setPlayers([]);
  };

  const handleApprovalChange = async (uuid, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await api.patch(`/team/approve/${uuid}`, {
        isApproved: updatedStatus,
      });

      // Update local state after successful patch
      const updatedTeams = teams.map((team) =>
        team.uuid === uuid ? { ...team, isApproved: updatedStatus } : team
      );
      setTeams(updatedTeams);
    } catch (error) {
      console.error("Failed to update approval status:", error);
    }
  };

  
  return (
      <>
        <div className="relative"> {/* Make the parent section relative */}
          {/* Player List Section */}
          {showPlayersFor && (
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-95 z-40 overflow-auto p-6 border border-gray-300 rounded shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Player List</h3>
    
              {players.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 rounded-md shadow">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border-b">#</th>
                        <th className="px-4 py-2 border-b">Photo</th>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">Jersey No.</th>
                        <th className="px-4 py-2 border-b">Position</th>
                        <th className="px-4 py-2 border-b">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((p, index) => (
                        <tr key={p.playerId} className="text-center hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">{index + 1}</td>
                          <td className="px-4 py-2 border-b">
                            <img
                              src={`${imgUrl}${p.photoUrl}`}
                              alt="player"
                              className="h-10 w-10 object-cover rounded-full mx-auto"
                            />
                          </td>
                          <td className="px-4 py-2 border-b">{p.name}</td>
                          <td className="px-4 py-2 border-b">{p.jerseyNumber}</td>
                          <td className="px-4 py-2 border-b">{p.position}</td>
                          <td className="px-4 py-2 border-b">{p.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No players found.</p>
              )}
    
              <button
                onClick={closePlayers}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              >
                Close Player List
              </button>
            </div>
          )}
    
          {/* Team Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 mb-6 min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Sr. No</th>
                  <th className="border px-4 py-2">Logo</th>
                  <th className="border px-4 py-2">Team Name</th>
                  <th className="border px-4 py-2">Captain</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Contact</th>
                  <th className="border px-4 py-2">Points</th>
                  <th className="border px-4 py-2">Approved</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team.id} className="text-center">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="p-3">
                      <img
                        src={`${imgUrl}${team.logoUrl}`}
                        alt="logo"
                        className="h-10 w-10 object-cover rounded-full mx-auto"
                      />
                    </td>
                    <td className="border px-4 py-2">{team.teamName}</td>
                    <td className="border px-4 py-2">{team.captainName}</td>
                    <td className="border px-4 py-2">{team.captainEmail}</td>
                    <td className="border px-4 py-2">{team.captainContact}</td>
                    <td className="border px-4 py-2">{team.totalPoints}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={team.isApproved}
                        onChange={() =>
                          handleApprovalChange(team.uuid, team.isApproved)
                        }
                        className="w-5 h-5 accent-green-600"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                        onClick={() => fetchPlayers(team.uuid)}
                      >
                        Show Players
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
    

};

export default TeamTable;
