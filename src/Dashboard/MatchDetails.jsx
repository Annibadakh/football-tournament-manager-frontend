import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../Api";

const MatchDetails = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const tournamentName = location.state?.tournamentName || "Tournament";
  
  const [match, setMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerStatus, setTimerStatus] = useState("stopped");
  const [statusMessage, setStatusMessage] = useState("");
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  useEffect(() => {
    // Clear interval when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
      
      // Assuming the API returns an array of players
      setTeam1Players(team1PlayersRes.data.map(player => ({
        ...player,
        goals: 0 // Add a goals property for tracking scores
      })));
      
      setTeam2Players(team2PlayersRes.data.map(player => ({
        ...player,
        goals: 0 // Add a goals property for tracking scores
      })));
      
      // Initialize timer based on match status
      if (matchData.status === 'started' || matchData.status === 'half-time' || 
          matchData.status === 'break' || matchData.status === 'paused') {
        setTimerStatus(matchData.status);
        updateStatusMessage(matchData.status);
      }
      
    } catch (err) {
      console.error("Error fetching match details:", err);
    } finally {
      setLoading(false);
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
      console.log(res);
      setMatch({ ...match, status: newStatus });
      setTimerStatus(newStatus);
      updateStatusMessage(newStatus);
      
      // Handle timer based on new status
      if (newStatus === 'started') {
        startTimer();
      } else if (newStatus === 'half-time') {
        stopTimer();
        // Start half-time timer if halfTime is defined
        if (match.halfTime) {
          startBreakTimer(parseInt(match.halfTime) * 60);
        }
      } else if (newStatus === 'break') {
        stopTimer();
        // Start break timer if breakTime is defined
        if (match.breakTime) {
          startBreakTimer(parseInt(match.breakTime) * 60);
        }
      } else if (newStatus === 'paused') {
        pauseTimer();
      } else if (newStatus === 'ended') {
        stopTimer();
        // Update match outcome
        await updateMatchOutcome();
      }
    } catch (err) {
      console.error("Error updating match status:", err);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimerStatus("running");
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerStatus("paused");
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerStatus("stopped");
  };

  const startBreakTimer = (seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimer(seconds);
    setTimerStatus("countdown");
    
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          setTimerStatus("stopped");
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScoreChange = (teamNumber, playerIndex, change) => {
    if (teamNumber === 1) {
      const updatedPlayers = [...team1Players];
      updatedPlayers[playerIndex].goals = Math.max(0, updatedPlayers[playerIndex].goals + change);
      setTeam1Players(updatedPlayers);
      
      if (match) {
        const totalGoals = updatedPlayers.reduce((sum, player) => sum + player.goals, 0);
        setMatch({ ...match, totalGoalsTeam1: totalGoals });
      }
    } else {
      const updatedPlayers = [...team2Players];
      updatedPlayers[playerIndex].goals = Math.max(0, updatedPlayers[playerIndex].goals + change);
      setTeam2Players(updatedPlayers);
      
      if (match) {
        const totalGoals = updatedPlayers.reduce((sum, player) => sum + player.goals, 0);
        setMatch({ ...match, totalGoalsTeam2: totalGoals });
      }
    }
  };

  const updateMatchOutcome = async () => {
    if (!match) return;
    
    // Calculate total goals
    const totalGoalsTeam1 = team1Players.reduce((sum, player) => sum + player.goals, 0);
    const totalGoalsTeam2 = team2Players.reduce((sum, player) => sum + player.goals, 0);
    
    // Determine match outcome
    let matchOutcome = 'tie';
    let winnerTeamId = null;
    
    if (totalGoalsTeam1 > totalGoalsTeam2) {
      matchOutcome = 'team1';
      winnerTeamId = match.team1Id;
    } else if (totalGoalsTeam2 > totalGoalsTeam1) {
      matchOutcome = 'team2';
      winnerTeamId = match.team2Id;
    }
    
    // Update match in backend
    try {
      await api.post(`/match/update-result/${matchId}`, {
        totalGoalsTeam1,
        totalGoalsTeam2,
        matchOutcome,
        winnerTeamId
      });
      
      // Update local state
      setMatch({
        ...match,
        totalGoalsTeam1,
        totalGoalsTeam2,
        matchOutcome,
        winnerTeamId
      });
    } catch (err) {
      console.error("Error updating match outcome:", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading match details...</div>;
  }

  if (!match) {
    return <div className="text-center p-8">Match not found or error loading match details.</div>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-6xl mx-auto">
      {/* Tournament and Match Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">{tournamentName}</h2>
        <p className="text-lg mb-4">
          {team1 ? team1.teamName : 'Team 1'} vs {team2 ? team2.teamName : 'Team 2'}
        </p>
        <div className="flex justify-center items-center space-x-8 mb-4">
          <div className="text-center">
            <p className="text-gray-600">Team 1</p>
            <p className="text-4xl font-bold">{match.totalGoalsTeam1}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Team 2</p>
            <p className="text-4xl font-bold">{match.totalGoalsTeam2}</p>
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
          
          {/* Timer Display */}
          <div className="text-center">
            <p className="text-sm font-medium mb-1">{statusMessage}</p>
            <div className="text-2xl font-mono bg-black text-white px-4 py-2 rounded">
              {formatTime(timer)}
            </div>
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
                  <tr key={player.id || index} className="border-b hover:bg-gray-50">
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
                  <tr key={player.id || index} className="border-b hover:bg-gray-50">
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
              <span className="font-bold">{team1 ? team1.teamName : 'Team 1'}</span> {match.totalGoalsTeam1} - {match.totalGoalsTeam2} <span className="font-bold">{team2 ? team2.teamName : 'Team 2'}</span>
            </div>
            <p className="mt-2 text-gray-700">
              {match.matchOutcome === 'team1' 
                ? `${team1 ? team1.teamName : 'Team 1'} won the match!` 
                : match.matchOutcome === 'team2' 
                  ? `${team2 ? team2.teamName : 'Team 2'} won the match!` 
                  : 'The match ended in a tie!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;