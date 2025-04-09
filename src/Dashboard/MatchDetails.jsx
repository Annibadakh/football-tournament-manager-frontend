import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../Api";

const MatchDetails = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tournamentName = location.state?.tournamentName || "Tournament";
  
  const [match, setMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  
  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    setLoading(true);
    try {
      // Fetch match details
      const matchRes = await api.get(`/match/get-match/${matchId}`);
      const matchData = matchRes.data;
      setMatch(matchData);
      
      // Fetch teams
      const team1Res = await api.get(`/team/get-team/${matchData.team1Id}`);
      const team2Res = await api.get(`/team/get-team/${matchData.team2Id}`);
      setTeam1(team1Res.data);
      setTeam2(team2Res.data);
      
      // Fetch players for both teams
      const team1PlayersRes = await api.get(`/player/get-players/${matchData.team1Id}`);
      const team2PlayersRes = await api.get(`/player/get-players/${matchData.team2Id}`);
      
      // Initialize players with scores from backend if available
      setTeam1Players(team1PlayersRes.data.map(player => ({
        ...player,
        goals: 0 // Initial value, will be updated from match player data if available
      })));
      
      setTeam2Players(team2PlayersRes.data.map(player => ({
        ...player,
        goals: 0 // Initial value, will be updated from match player data if available
      })));
      
      // Update status message based on match status
      if (matchData.status) {
        updateStatusMessage(matchData.status);
      }
      
      // If match is ended, fetch the latest match result to ensure accurate data
      if (matchData.status === 'ended') {
        refreshMatchResult();
      }
      
    } catch (err) {
      console.error("Error fetching match details:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMatchResult = async () => {
    try {
      // Get the latest match data to ensure accurate score and outcome
      const refreshRes = await api.get(`/match/get-match/${matchId}`);
      if (refreshRes.data) {
        setMatch(refreshRes.data);
      }
    } catch (err) {
      console.error("Error refreshing match result:", err);
    }
  };

  const updateStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        setStatusMessage("Match not started");
        break;
      case 'started':
        setStatusMessage("Match in progress");
        break;
      case 'half-time':
        setStatusMessage("Half-time break");
        break;
      case 'break':
        setStatusMessage("Break time");
        break;
      case 'paused':
        setStatusMessage("Match paused");
        break;
      case 'ended':
        setStatusMessage("Match ended");
        break;
      default:
        setStatusMessage("");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!match) return;
    
    try {
      const res = await api.post(`/match/update-status/${matchId}`, { status: newStatus });
      console.log("Status update response:", res.data);
      
      // Update local state with response data
      if (res.data && res.data.match) {
        setMatch(res.data.match);
      } else {
        // Fallback to local update if API doesn't return updated match
        setMatch({ ...match, status: newStatus });
      }
      
      updateStatusMessage(newStatus);
      
      // If changing to 'ended' status, refresh match result after a short delay
      // to ensure backend has processed the final result
      if (newStatus === 'ended') {
        setTimeout(refreshMatchResult, 500);
      }
      
    } catch (err) {
      console.error("Error updating match status:", err);
    }
  };

  const handleScoreChange = async (teamNumber, playerIndex, change) => {  
    if (!match) return;
    
    try {
      let scoreData;
      
      if (teamNumber === 1) {
        scoreData = {
          playerId: team1Players[playerIndex].playerId,
          playerName: team1Players[playerIndex].name || team1Players[playerIndex].playerName,
          matchId: match.id,
          scoreId: team1.uuid,
          concededId: team2.uuid,
          change: change
        };
      } else {
        scoreData = {
          playerId: team2Players[playerIndex].playerId,
          playerName: team2Players[playerIndex].name || team2Players[playerIndex].playerName,
          matchId: match.id,
          scoreId: team2.uuid,
          concededId: team1.uuid,
          change: change
        };
      }
      
      console.log("Score update request:", scoreData);
      const response = await api.post('/match/update-score', scoreData);
      console.log("Score update response:", response.data);
      
      // Update match data from response
      if (response.data.match) {
        setMatch(response.data.match);
      }
      
      // Update player scores from the response
      if (response.data.playerMatch) {
        const { playerId, playerScore } = response.data.playerMatch;
        
        // Update the specific player's score
        if (teamNumber === 1) {
          const updatedPlayers = team1Players.map(player => {
            if (player.playerId === playerId) {
              return { ...player, goals: playerScore };
            }
            return player;
          });
          setTeam1Players(updatedPlayers);
        } else {
          const updatedPlayers = team2Players.map(player => {
            if (player.playerId === playerId) {
              return { ...player, goals: playerScore };
            }
            return player;
          });
          setTeam2Players(updatedPlayers);
        }
      }
      
      // Also update team scores if they're in the response
      if (response.data.scoringTeam && response.data.concedingTeam) {
        if (teamNumber === 1 && response.data.scoringTeam.teamId === team1.uuid) {
          setTeam1({...team1, score: response.data.scoringTeam.score});
          setTeam2({...team2, conceded: response.data.concedingTeam.conceded});
        } else if (teamNumber === 2 && response.data.scoringTeam.teamId === team2.uuid) {
          setTeam2({...team2, score: response.data.scoringTeam.score});
          setTeam1({...team1, conceded: response.data.concedingTeam.conceded});
        }
      }
      
    } catch (err) {
      console.error("Error updating score:", err);
    }
  };

  const determineMatchOutcome = () => {
    if (!match) return { outcome: null, message: '' };
    
    const team1Score = match.totalGoalsTeam1 || 0;
    const team2Score = match.totalGoalsTeam2 || 0;
    
    // First try to use the server-provided outcome
    if (match.matchOutcome) {
      if (match.matchOutcome === 'team1') {
        return { 
          outcome: 'team1',
          message: `${team1?.teamName || 'Team 1'} won the match!`
        };
      } else if (match.matchOutcome === 'team2') {
        return {
          outcome: 'team2',
          message: `${team2?.teamName || 'Team 2'} won the match!`
        };
      } else if (match.matchOutcome === 'tie') {
        return {
          outcome: 'tie',
          message: 'The match ended in a tie!'
        };
      }
    }
    
    // If server didn't provide a proper outcome, determine it from scores
    if (team1Score > team2Score) {
      return {
        outcome: 'team1',
        message: `${team1?.teamName || 'Team 1'} won the match!`
      };
    } else if (team2Score > team1Score) {
      return {
        outcome: 'team2',
        message: `${team2?.teamName || 'Team 2'} won the match!`
      };
    } else {
      return {
        outcome: 'tie',
        message: 'The match ended in a tie!'
      };
    }
  };

  // New function to handle navigation back to the scorer dashboard
  const handleBackToScorer = () => {
    navigate('/dashboard/scorer');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading match details...</div>;
  }

  if (!match) {
    return <div className="text-center p-8">Match not found or error loading match details.</div>;
  }

  // Determine result for display purposes
  const matchResult = determineMatchOutcome();

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-6xl mx-auto">
      {/* Tournament and Match Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-4">{tournamentName}</h2>
        <p className="text-2xl mb-4">
          {team1 ? team1.teamName : 'Team 1'} vs {team2 ? team2.teamName : 'Team 2'}
        </p>
        <div className="grid grid-cols-2">
          <div className="flex justify-center items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-gray-600">Team 1</p>
              <p className="text-4xl font-bold">{match.totalGoalsTeam1 || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Team 2</p>
              <p className="text-4xl font-bold">{match.totalGoalsTeam2 || 0}</p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-gray-600">Half Time</p>
              <p className="text-2xl font-bold">{match.halfTime || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Break Time</p>
              <p className="text-2xl font-bold">{match.breakTime || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Controls */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-2 sm:mb-0">
            <label className="block text-sm font-medium mb-1">Match Status:</label>
            <select
              className="border rounded px-3 py-2"
              value={match.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={match.status === 'ended'}
            >
              <option value="pending">Pending</option>
              <option value="started">Started</option>
              <option value="half-time">Half-Time</option>
              <option value="break">Break</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>
          
          {/* Status Display */}
          <div className="text-center">
            <p className="text-sm font-medium mb-1">{statusMessage}</p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex space-x-2">
            {match.status === 'pending' && (
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => handleStatusChange('started')}
              >
                Start Match
              </button>
            )}
            
            {match.status === 'started' && (
              <>
                <button 
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  onClick={() => handleStatusChange('paused')}
                >
                  Pause
                </button>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => handleStatusChange('half-time')}
                >
                  Half-Time
                </button>
              </>
            )}
            
            {match.status === 'paused' && (
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => handleStatusChange('started')}
              >
                Resume
              </button>
            )}
            
            {(match.status === 'half-time' || match.status === 'break') && (
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => handleStatusChange('started')}
              >
                Resume Match
              </button>
            )}
            
            {match.status !== 'ended' && match.status !== 'pending' && (
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => handleStatusChange('ended')}
              >
                End Match
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Players Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team 1 Players */}
        <div>
          <h3 className="text-xl font-semibold mb-3">{team1 ? team1.teamName : 'Team 1'} Players</h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left border-b">Jersey</th>
                  <th className="py-2 px-3 text-left border-b">Name</th>
                  <th className="py-2 px-3 text-center border-b">Goals</th>
                  <th className="py-2 px-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team1Players.map((player, index) => (
                  <tr key={player.playerId || index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{player.jerseyNumber || '-'}</td>
                    <td className="py-2 px-3">{player.name || player.playerName || 'Player'}</td>
                    <td className="py-2 px-3 text-center font-medium">{player.goals}</td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          onClick={() => handleScoreChange(1, index, -1)}
                          disabled={player.goals === 0 || match.status === 'ended'}
                        >
                          -
                        </button>
                        <button 
                          className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          onClick={() => handleScoreChange(1, index, 1)}
                          disabled={match.status === 'ended'}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {team1Players.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">No players found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Team 2 Players */}
        <div>
          <h3 className="text-xl font-semibold mb-3">{team2 ? team2.teamName : 'Team 2'} Players</h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left border-b">Jersey</th>
                  <th className="py-2 px-3 text-left border-b">Name</th>
                  <th className="py-2 px-3 text-center border-b">Goals</th>
                  <th className="py-2 px-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team2Players.map((player, index) => (
                  <tr key={player.playerId || index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{player.jerseyNumber || '-'}</td>
                    <td className="py-2 px-3">{player.name || player.playerName || 'Player'}</td>
                    <td className="py-2 px-3 text-center font-medium">{player.goals}</td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                          onClick={() => handleScoreChange(2, index, -1)}
                          disabled={player.goals === 0 || match.status === 'ended'}
                        >
                          -
                        </button>
                        <button 
                          className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          onClick={() => handleScoreChange(2, index, 1)}
                          disabled={match.status === 'ended'}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {team2Players.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">No players found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Match Result (shown when match is ended) */}
      {match.status === 'ended' && (
        <div className="mt-6 p-4 border-2 border-yellow-500 rounded-md bg-yellow-50">
          <h3 className="text-xl font-semibold mb-2 text-center">Match Result</h3>
          <div className="text-center">
            <div className="text-lg">
              <span className="font-bold">{team1 ? team1.teamName : 'Team 1'}</span> {match.totalGoalsTeam1 || 0} - {match.totalGoalsTeam2 || 0} <span className="font-bold">{team2 ? team2.teamName : 'Team 2'}</span>
            </div>
            <p className="mt-2 text-gray-700">
              {matchResult.message}
            </p>
            {/* Back button - only appears when match is ended */}
            <button 
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={handleBackToScorer}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;