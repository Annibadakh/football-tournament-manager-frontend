import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";

const Scorer = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [todayMatches, setTodayMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleTournamentSelect = async (e) => {
    const id = e.target.value;
    setSelectedTournamentId(id);
    
    if (id) {
      setLoading(true);
      try {
        // Fetch teams for the selected tournament
        const teamsRes = await api.get(`/team/get-teams/${id}`);
        setTeams(teamsRes.data);
        
        // Fetch matches for the selected tournament
        const matchesRes = await api.get(`/match/get-matches/${id}`);
        
        // Filter matches to show only today's matches
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMatchesList = matchesRes.data.filter(match => {
          const matchDate = new Date(match.startDate);
          matchDate.setHours(0, 0, 0, 0);
          return matchDate.getTime() === today.getTime();
        });
        
        setTodayMatches(todayMatchesList);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setTeams([]);
      setTodayMatches([]);
    }
  };

  // Helper function to find team name by ID
  const getTeamNameById = (teamId) => {
    const team = teams.find(t => t.uuid === teamId);
    return team ? team.teamName : "Unknown Team";
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const handleStartMatch = (matchId) => {
    // Find tournament name
    const selectedTournament = tournaments.find(t => t.uuid === selectedTournamentId);
    const tournamentName = selectedTournament ? selectedTournament.name : "";
    
    // Navigate to match details page with matchId and tournament name
    navigate(`/dashboard/match-details/${matchId}`, { 
      state: { 
        matchId, 
        tournamentName 
      } 
    });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">⚽ Today's Matches</h2>
      
      {/* Tournament Dropdown */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select Tournament</label>
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

      {/* Display Today's Matches */}
      {selectedTournamentId && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Matches Scheduled Today</h3>
          
          {loading ? (
            <div className="text-center py-4">Loading matches...</div>
          ) : todayMatches.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left border-b">Teams</th>
                    <th className="py-2 px-4 text-left border-b">Time</th>
                    <th className="py-2 px-4 text-left border-b">Status</th>
                    <th className="py-2 px-4 text-left border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayMatches.map((match) => (
                    <tr key={match.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{getTeamNameById(match.team1Id)}</div>
                        <div className="text-sm text-gray-600">vs</div>
                        <div className="font-medium">{getTeamNameById(match.team2Id)}</div>
                      </td>
                      <td className="py-3 px-4">{formatTime(match.startTime)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          match.status === 'started' ? 'bg-green-100 text-green-800' :
                          match.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.status === 'started' ? 'In Progress' :
                           match.status === 'ended' ? 'Completed' :
                           'Scheduled'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleStartMatch(match.id)}
                          disabled={match.status === 'ended'}
                          className={`px-4 py-1 rounded text-white ${
                            match.status === 'ended'
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {match.status === 'pending' ? 'Start Match' : 
                           match.status === 'ended' ? 'Completed' : 'Manage Match'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">No matches scheduled for today in this tournament.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scorer;