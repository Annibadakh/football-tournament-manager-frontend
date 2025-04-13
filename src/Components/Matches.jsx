import { useState, useEffect } from "react";
import axios from "axios";

const Matches = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [matches, setMatches] = useState([]);
  const [teamsData, setTeamsData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch tournaments on component mount
    const fetchTournaments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/tournament/all`);
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
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch matches for the selected tournament
      const matchesRes = await axios.get(`${apiUrl}/match/get-matches/${id}`);
      
      // Sort matches by status (pending first) and then by date/time
      const sortedMatches = sortMatches(matchesRes.data);
      setMatches(sortedMatches);
      
      // Fetch teams for the selected tournament to get team names and logos
      const teamsRes = await axios.get(`${apiUrl}/team/get-teams/${id}`);
      
      // Create a map of team IDs to team data for easy reference
      const teamsMap = {};
      teamsRes.data.forEach(team => {
        teamsMap[team.uuid] = {
          name: team.teamName,
          logo: team.logoUrl
        };
      });
      setTeamsData(teamsMap);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort matches: pending first, then other statuses, then by date and time
  const sortMatches = (matchesList) => {
    // Define status priority (lower number = higher priority)
    const statusPriority = {
      'pending': 1,
      'started': 2,
      'half-time': 3,
      'break': 4,
      'paused': 5,
      'ended': 6
    };

    return [...matchesList].sort((a, b) => {
      // First, sort by status priority
      const statusComparison = (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999);
      if (statusComparison !== 0) return statusComparison;
      
      // If same status, sort by date and time
      const dateA = new Date(`${a.startDate}T${a.startTime || '00:00:00'}`);
      const dateB = new Date(`${b.startDate}T${b.startTime || '00:00:00'}`);
      return dateA - dateB;
    });
  };

  // Helper function to get match status with color code
  const getStatusWithColor = (status) => {
    const statusColors = {
      'pending': 'bg-gray-200 text-gray-800',
      'started': 'bg-green-200 text-green-800',
      'half-time': 'bg-yellow-200 text-yellow-800',
      'break': 'bg-blue-200 text-blue-800',
      'paused': 'bg-red-200 text-red-800',
      'ended': 'bg-purple-200 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || ''}`}>
        {status}
      </span>
    );
  };

  // Helper function to get outcome with color code
  const getOutcomeWithColor = (outcome, match) => {
    if (outcome === 'undecided') {
      return <span className="text-gray-500">Not determined</span>;
    }
    
    const outcomeColors = {
      'team1': 'text-green-600 font-semibold',
      'team2': 'text-green-600 font-semibold',
      'tie': 'text-blue-600 font-semibold'
    };
    
    let outcomeText = 'Unknown';
    
    if (outcome === 'team1') {
      outcomeText = teamsData[match.team1Id]?.name || 'Team 1';
    } else if (outcome === 'team2') {
      outcomeText = teamsData[match.team2Id]?.name || 'Team 2';
    } else if (outcome === 'tie') {
      outcomeText = 'Draw';
    }
    
    return <span className={outcomeColors[outcome] || ''}>{outcomeText}</span>;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  // Helper function to render team logo
  const renderTeamLogo = (teamId) => {
    const logoUrl = teamsData[teamId]?.logo;
    const teamName = teamsData[teamId]?.name || 'Unknown Team';
    
    if (!logoUrl) {
      // Display a placeholder if no logo is available
      return (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
          {teamName.substring(0, 1)}
        </div>
      );
    }
    
    return (
      <img 
        src={`${imgUrl}${logoUrl}`} 
        alt={`${teamName} logo`}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
        onError={(e) => {
          // Replace broken images with the first letter of team name
          e.target.onerror = null;
          e.target.src = '';
          e.target.alt = teamName.substring(0, 1);
          e.target.className = 'w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold';
        }}
      />
    );
  };

  return (
    <div className="p-6 mt-10 bg-white shadow-md rounded-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">⚽ Matches & Fixtures</h2>
      
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
      
      {/* Matches Display */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading matches...</p>
        </div>
      ) : selectedTournamentId && matches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left border-b">Teams</th>
                <th className="py-3 px-4 text-left border-b">Date & Time</th>
                <th className="py-3 px-4 text-left border-b">Stage</th>
                <th className="py-3 px-4 text-left border-b">Status</th>
                <th className="py-3 px-4 text-left border-b">Score</th>
                <th className="py-3 px-4 text-left border-b">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-start sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderTeamLogo(match.team1Id)}
                        <div className="font-semibold">
                          {teamsData[match.team1Id]?.name || 'Unknown'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">vs</div>
                      <div className="flex items-center gap-2">
                        {renderTeamLogo(match.team2Id)}
                        <div className="font-semibold">
                          {teamsData[match.team2Id]?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{formatDate(match.startDate)}</div>
                    <div className="text-sm text-gray-600">{formatTime(match.startTime)}</div>
                  </td>
                  <td className="py-3 px-4 capitalize font-medium text-sm text-gray-700">
                    {match.stage || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusWithColor(match.status)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-lg">
                    {match.totalGoalsTeam1} - {match.totalGoalsTeam2}
                  </td>
                  <td className="py-3 px-4">
                    {getOutcomeWithColor(match.matchOutcome, match)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedTournamentId ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No matches found for this tournament.</p>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">Please select a tournament to view matches.</p>
        </div>
      )}
    </div>
  );
};

export default Matches;