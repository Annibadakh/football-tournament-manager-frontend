import { useEffect, useState, useRef } from "react";
import axios from "axios";
import LiveCommentary from "./LiveCommentary";

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
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState("");
  const intervalRef = useRef(null); // Using ref to track the interval
  const loadingRef = useRef(false); // To prevent overlapping API calls

  // This effect handles the interval setup and cleanup properly
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial load
    refreshData();
    
    // Set up a new interval of 30 seconds
    intervalRef.current = setInterval(() => {
      refreshData();
    }, 30 * 1000);
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Separate effect to handle selected match changes
  useEffect(() => {
    if (selectedMatch && selectedMatch.id) {
      fetchMatchDetails(selectedMatch.id);
    }
  }, [selectedMatch?.id]); // Only run when selectedMatch.id changes

  // Combined refresh function to avoid duplicate calls
  const refreshData = async () => {
    // Check if we're already loading data to prevent overlapping calls
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    
    try {
      await fetchLiveMatches();
      if (selectedMatch && selectedMatch.id) {
        await fetchMatchDetails(selectedMatch.id);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      loadingRef.current = false;
    }
  };

  const fetchLiveMatches = async () => {
    try {
      if (!loadingRef.current) {
        setLoading(true);
      }
      
      // Use a single API call with proper caching headers
      const response = await axios.get(`${apiUrl}/match/get-matches`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
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
      } else if (selectedMatch) {
        // Update the selected match data if it's in the active matches
        const updatedMatch = activeMatches.find(match => match.id === selectedMatch.id);
        if (updatedMatch) {
          setSelectedMatch(prev => ({...prev, ...updatedMatch}));
        }
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
      // Batch API calls together with Promise.all for efficiency
      const [matchRes, team1Res, team2Res] = await Promise.all([
        axios.get(`${apiUrl}/match/get-match/${matchId}`),
        // Only fetch team details if we don't have the IDs yet
        !team1 || !team2 ? null : axios.get(`${apiUrl}/team/get-team/${team1.teamId}`),
        !team1 || !team2 ? null : axios.get(`${apiUrl}/team/get-team/${team2.teamId}`)
      ]);
      
      const matchData = matchRes.data;
      setSelectedMatch(matchData);
      
      // Only fetch team details if needed
      if (!team1 || team1.teamId !== matchData.team1Id) {
        const team1Response = team1Res || await axios.get(`${apiUrl}/team/get-team/${matchData.team1Id}`);
        setTeam1(team1Response.data);
      }
      
      if (!team2 || team2.teamId !== matchData.team2Id) {
        const team2Response = team2Res || await axios.get(`${apiUrl}/team/get-team/${matchData.team2Id}`);
        setTeam2(team2Response.data);
      }
      
      // Now fetch players for both teams
      const [team1PlayersRes, team2PlayersRes] = await Promise.all([
        axios.get(`${apiUrl}/player/get-players/${matchData.team1Id}`),
        axios.get(`${apiUrl}/player/get-players/${matchData.team2Id}`)
      ]);
      
      const team1PlayersData = team1PlayersRes.data;
      const team2PlayersData = team2PlayersRes.data;
      
      // Fetch player scores for each player using the new endpoint
      const team1PlayersWithScores = await Promise.all(
        team1PlayersData.map(async (player) => {
          try {
            const scoreRes = await axios.get(`${apiUrl}/match/match-player/${matchId}/${player.playerId}`);
            return {
              ...player,
              goals: scoreRes.data.playerScore || 0
            };
          } catch (err) {
            console.error(`Error fetching score for player ${player.playerId}:`, err);
            return {
              ...player,
              goals: 0
            };
          }
        })
      );
      
      const team2PlayersWithScores = await Promise.all(
        team2PlayersData.map(async (player) => {
          try {
            const scoreRes = await axios.get(`${apiUrl}/match/match-player/${matchId}/${player.playerId}`);
            return {
              ...player,
              goals: scoreRes.data.playerScore || 0
            };
          } catch (err) {
            console.error(`Error fetching score for player ${player.playerId}:`, err);
            return {
              ...player,
              goals: 0
            };
          }
        })
      );
      
      setTeam1Players(team1PlayersWithScores);
      setTeam2Players(team2PlayersWithScores);
      
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

  const getStageText = (stage) => {
    switch (stage) {
      case 'league-stage':
        return "League Stage";
      case 'group-stage':
        return "Group Stage";
      case 'round-of-16':
        return "Round of 16";
      case 'quarterfinals':
        return "Quarterfinals";
      case 'semifinals':
        return "Semifinals";
      case 'finals':
        return "Finals";
      case 'third-place':
        return "Third Place Match";
      default:
        return stage ? stage.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') : "League Match";
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
          <p className="mt-2 text-xs text-gray-500">Data refreshes automatically every 30 seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-10 bg-white shadow-md rounded-md max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Matches</h1>
        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
          <div className="flex items-center">
            <span>Last updated: {formatLastUpdated()}</span>
            <div className="ml-4 flex items-center">
              <span className="animate-pulse text-xs text-green-600">●</span>
              <span className="ml-1">Auto-refreshing</span>
            </div>
          </div>
          <div className="text-xs text-amber-600 mt-1">
            This is a free hosted service. Data refreshes automatically every 30 seconds.
          </div>
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
                {match.stage && (
                  <span className="ml-2 text-xs px-2 py-1 bg-gray-700 bg-opacity-20 rounded-full">
                    {getStageText(match.stage)}
                  </span>
                )}
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
              <div className="mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedMatch.status === 'started' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(selectedMatch.status)}
                </span>
                
                {selectedMatch.stage && (
                  <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getStageText(selectedMatch.stage)}
                  </span>
                )}
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