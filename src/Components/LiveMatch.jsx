import { useEffect, useState } from "react";
import axios from "axios";

const LiveMatch = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState("");

  // Fetch all live matches
  useEffect(() => {
    fetchLiveMatches();
    
    // Set up polling for live updates
    const intervalId = setInterval(() => {
      fetchLiveMatches();
      if (selectedMatch) {
        fetchMatchDetails(selectedMatch.id);
      }
      setLastUpdated(new Date());
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, selectedMatch]);

  // When a match is selected, fetch its details
  useEffect(() => {
    if (selectedMatch) {
      fetchMatchDetails(selectedMatch.id);
    }
  }, [selectedMatch]);

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      // Direct axios call to the API endpoint
      const response = await axios.get(`${apiUrl}/match/get-matches`);
      
      // Filter matches that are in progress
      const activeMatches = response.data.filter(match => 
        match.status === 'started' || 
        match.status === 'half-time' || 
        match.status === 'paused' || 
        match.status === 'break'
      );
      
      setLiveMatches(activeMatches);
      
      // If no match is selected yet but live matches are available, select the first one
      if (!selectedMatch && activeMatches.length > 0) {
        setSelectedMatch(activeMatches[0]);
      }
      
      setError("");
    } catch (err) {
      console.error("Error fetching live matches:", err);
      setError("Unable to fetch live matches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (matchId) => {
    try {
      // Fetch match details
      const matchRes = await axios.get(`${apiUrl}/match/get-match/${matchId}`);
      const matchData = matchRes.data;
      setSelectedMatch(matchData);
      
      // Fetch teams
      const team1Res = await axios.get(`${apiUrl}/team/get-team/${matchData.team1Id}`);
      const team2Res = await axios.get(`${apiUrl}/team/get-team/${matchData.team2Id}`);
      setTeam1(team1Res.data);
      setTeam2(team2Res.data);
      
      // Fetch players for both teams
      const team1PlayersRes = await axios.get(`${apiUrl}/player/get-players/${matchData.team1Id}`);
      const team2PlayersRes = await axios.get(`${apiUrl}/player/get-players/${matchData.team2Id}`);
      
      // Set players with their goal scores
      setTeam1Players(team1PlayersRes.data.map(player => ({
        ...player,
        goals: player.goals || 0 // Use existing goal data if available
      })));
      
      setTeam2Players(team2PlayersRes.data.map(player => ({
        ...player,
        goals: player.goals || 0 // Use existing goal data if available
      })));
      
      setError("");
    } catch (err) {
      console.error("Error fetching match details:", err);
      setError("Unable to load match details. Please try again later.");
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'started':
        return "LIVE";
      case 'half-time':
        return "HALF-TIME";
      case 'break':
        return "BREAK";
      case 'paused':
        return "PAUSED";
      default:
        return status.toUpperCase();
    }
  };

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };

  const getTeamLogo = (team) => {
    return team ? `${imgUrl}${team.logoUrl}` : null;
  };

  const renderTeamLogo = (team, teamName) => {
    const logoUrl = getTeamLogo(team);
    
    if (logoUrl) {
      return (
        <div className="flex flex-col items-center">
          <img 
            src={logoUrl} 
            alt={`${teamName} logo`} 
            className="w-16 h-16 object-contain mb-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${imgUrl}/placeholder-team.png`;
            }}
          />
          <p className="text-lg font-medium text-gray-800">{teamName}</p>
        </div>
      );
    }
    
    return <p className="text-lg font-medium text-gray-800">{teamName}</p>;
  };

  if (loading && liveMatches.length === 0) {
    return (
      <div className="p-6 mt-10 flex justify-center items-center">
        <div className="animate-pulse text-lg">Loading live matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mt-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2 text-sm">Make sure you're connected to the internet and the server is running.</p>
        </div>
      </div>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <div className="p-6 mt-10 bg-white shadow-md rounded-md max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Live Matches</h1>
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-lg text-gray-600">No live matches currently in progress.</p>
          <p className="mt-2 text-sm text-gray-500">Please check back later.</p>
          <button 
            onClick={fetchLiveMatches} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-10 bg-white shadow-md rounded-md max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Matches</h1>
        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
          Last updated: {formatLastUpdated()}
          <button 
            onClick={fetchLiveMatches} 
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
          <select 
            className="ml-4 border rounded px-2 py-1 text-sm"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value="10">Refresh: 10s</option>
            <option value="30">Refresh: 30s</option>
            <option value="60">Refresh: 1m</option>
          </select>
        </div>
      </div>

      {/* Match Selector */}
      {liveMatches.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Match:</label>
          <div className="flex flex-wrap gap-2">
            {liveMatches.map(match => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`px-4 py-2 rounded-md ${
                  selectedMatch && selectedMatch.id === match.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {match.team1Name || 'Team 1'} vs {match.team2Name || 'Team 2'}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedMatch && (
        <>
          {/* Match Header with Score */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="text-center">
              <div className="mb-2">
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedMatch.status === 'started' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(selectedMatch.status)}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-6">
                {team1?.teamName || 'Team 1'} vs {team2?.teamName || 'Team 2'}
              </h2>
              
              <div className="flex justify-center items-center space-x-4 mb-6">
                {renderTeamLogo(team1, team1?.teamName || 'Team 1')}
                
                <div className="flex items-center">
                  <span className="text-5xl font-bold mx-4">{selectedMatch.totalGoalsTeam1 || 0}</span>
                  <span className="text-2xl font-medium mx-2">-</span>
                  <span className="text-5xl font-bold mx-4">{selectedMatch.totalGoalsTeam2 || 0}</span>
                </div>
                
                {renderTeamLogo(team2, team2?.teamName || 'Team 2')}
              </div>
              
              <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Half Time Score</p>
                  <p className="text-xl font-medium">{selectedMatch.halfTime || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Match Time</p>
                  <p className="text-xl font-medium">
                    {selectedMatch.matchTime || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Players Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team 1 Players */}
            <div>
              <h3 className="text-xl font-semibold mb-3">{team1?.teamName || 'Team 1'}</h3>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left border-b">Jersey</th>
                      <th className="py-2 px-3 text-left border-b">Name</th>
                      <th className="py-2 px-3 text-center border-b">Goals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team1Players.map((player, index) => (
                      <tr key={player.playerId || index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{player.jerseyNumber || '-'}</td>
                        <td className="py-2 px-3">{player.name || player.playerName || 'Player'}</td>
                        <td className="py-2 px-3 text-center font-medium">
                          {player.goals > 0 && (
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {player.goals}
                            </span>
                          )}
                          {player.goals === 0 && '-'}
                        </td>
                      </tr>
                    ))}
                    {team1Players.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-gray-500">No players found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Team 2 Players */}
            <div>
              <h3 className="text-xl font-semibold mb-3">{team2?.teamName || 'Team 2'}</h3>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left border-b">Jersey</th>
                      <th className="py-2 px-3 text-left border-b">Name</th>
                      <th className="py-2 px-3 text-center border-b">Goals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team2Players.map((player, index) => (
                      <tr key={player.playerId || index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{player.jerseyNumber || '-'}</td>
                        <td className="py-2 px-3">{player.name || player.playerName || 'Player'}</td>
                        <td className="py-2 px-3 text-center font-medium">
                          {player.goals > 0 && (
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {player.goals}
                            </span>
                          )}
                          {player.goals === 0 && '-'}
                        </td>
                      </tr>
                    ))}
                    {team2Players.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-gray-500">No players found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Scorers Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">Match Top Scorers</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {(() => {
                // Combine players from both teams
                const allPlayers = [...team1Players, ...team2Players];
                
                // Filter players with goals and sort by goals (descending)
                const scorers = allPlayers
                  .filter(player => player.goals > 0)
                  .sort((a, b) => b.goals - a.goals)
                  .slice(0, 5); // Top 5 scorers
                
                if (scorers.length === 0) {
                  return <p className="text-center text-gray-500">No goals scored yet</p>;
                }
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {scorers.map((player, index) => (
                      <div key={player.playerId || index} className="flex items-center p-2 bg-white rounded-md shadow-sm">
                        <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{player.name || player.playerName}</p>
                          <p className="text-sm text-gray-600">
                            {player.teamName || (team1Players.includes(player) ? team1?.teamName : team2?.teamName)}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            {player.goals} {player.goals === 1 ? 'goal' : 'goals'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveMatch;