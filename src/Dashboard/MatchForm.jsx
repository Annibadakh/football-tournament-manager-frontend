import { useEffect, useState } from "react";
import api from "../Api";

const MatchForm = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [teams, setTeams] = useState([]);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [existingMatches, setExistingMatches] = useState([]);
  const [stage, setStage] = useState("");
  const [matchInfo, setMatchInfo] = useState({
    startDate: "",
    startTime: "",
    halfTime: "",
    breakTime: "",
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/tournament/all");
        setTournaments(res.data.list);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  const fetchExistingMatches = async (tournamentId) => {
    try {
      const res = await api.get(`/match/get-matches/${tournamentId}`);
      setExistingMatches(res.data);
    } catch (err) {
      console.error("Error fetching existing matches:", err);
    }
  };

  const handleTournamentSelect = async (e) => {
    const id = e.target.value;
    setSelectedTournamentId(id);
    setTeam1("");
    setTeam2("");
    
    if (id) {
      try {
        // Fetch teams for the selected tournament
        const teamsRes = await api.get(`/team/get-teams/${id}`);
        setTeams(teamsRes.data);
        
        // Fetch existing matches for the selected tournament
        await fetchExistingMatches(id);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    } else {
      setTeams([]);
      setExistingMatches([]);
    }
  };

  const handleInputChange = (e) => {
    setMatchInfo({ ...matchInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tournamentId: selectedTournamentId,
      team1Id: team1,
      team2Id: team2,
      stage,
      ...matchInfo,
    };

    try {
      await api.post("/match/add-match", payload);
      alert("✅ Match saved successfully!");
      
      // Refresh the existing matches list
      await fetchExistingMatches(selectedTournamentId);
      
      // Reset form fields
      setTeam1("");
      setTeam2("");
      setStage("");
      setMatchInfo({
        startDate: "",
        startTime: "",
        halfTime: "",
        breakTime: "",
      });
    } catch (err) {
      console.error("Error saving match:", err);
      alert("❌ Failed to save match.");
    }
  };

  // Helper function to find team name by ID
  const getTeamNameById = (teamId) => {
    const team = teams.find(t => t.uuid === teamId);
    return team ? team.teamName : "Unknown Team";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">📅 Match Scheduler</h2>

      {/* Tournament Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Tournament</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedTournamentId}
          onChange={handleTournamentSelect}
        >
          <option value="">-- Select Tournament --</option>
          {tournaments.map((t) => (
            <option key={t.uuid} value={t.uuid}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Form Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Add New Match</h3>
          
          {/* Team 1 Dropdown */}
          {teams.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Select Team 1</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={team1}
                onChange={(e) => {
                  setTeam1(e.target.value);
                  setTeam2(""); // Reset team2
                }}
              >
                <option value="">-- Select Team 1 --</option>
                {teams.map((team) => (
                  <option key={team.uuid} value={team.uuid}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team 2 Dropdown (enabled only after team 1) */}
          {team1 && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Select Team 2</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
              >
                <option value="">-- Select Team 2 --</option>
                {teams
                  .filter((team) => team.uuid !== team1)
                  .map((team) => (
                    <option key={team.uuid} value={team.uuid}>
                      {team.teamName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Match Time Info */}
          {team1 && team2 && (
            <>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={matchInfo.startDate}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={matchInfo.startTime}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Half Time (mins)</label>
                <input
                  type="number"
                  name="halfTime"
                  value={matchInfo.halfTime}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="e.g. 15"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Break Time (mins)</label>
                <input
                  type="number"
                  name="breakTime"
                  value={matchInfo.breakTime}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="e.g. 10"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Select Stage</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  required
                >
                  <option value="">-- Select Stage --</option>
                  <option value="league-stage">League Stage</option>
                  <option value="quarter-final">Quarterfinal</option>
                  <option value="semi-final">Semifinal</option>
                  <option value="final">Final</option>
                </select>
              </div>

              <div className="text-right">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                  💾 Save Match
                </button>
              </div>
            </>
          )}
        </div>

        {/* Existing Matches Section */}
        {selectedTournamentId && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Existing Matches</h3>
            
            {existingMatches.length > 0 ? (
              <div className="overflow-auto max-h-96">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left">Teams</th>
                      <th className="py-2 px-3 text-left">Date</th>
                      <th className="py-2 px-3 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingMatches.map((match, index) => (
                      <tr key={match.uuid || index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">
                          {getTeamNameById(match.team1Id)} vs {getTeamNameById(match.team2Id)}
                        </td>
                        <td className="py-2 px-3">{formatDate(match.startDate)}</td>
                        <td className="py-2 px-3">{formatTime(match.startTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No matches scheduled yet for this tournament.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchForm;