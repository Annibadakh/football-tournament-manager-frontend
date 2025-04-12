import { useEffect, useState } from "react";
import axios from "axios";

const PointsTable = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topScorers, setTopScorers] = useState([]);

  // Fetch all tournaments on component mount
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/tournament/all`);
        setTournaments(res.data.list);
        
        // Auto-select first tournament if available
        if (res.data.list.length > 0) {
          setSelectedTournament(res.data.list[0].uuid);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };
    
    fetchTournaments();
  }, [apiUrl]);

  // Fetch teams when a tournament is selected
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedTournament) return;
      
      try {
        setLoading(true);
        const teamsRes = await axios.get(`${apiUrl}/team/get-teams/${selectedTournament}`);
        
        // Sort teams by total points (descending)
        const sortedTeams = teamsRes.data.sort((a, b) => {
          // First sort by points
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
          }
          // If points are equal, sort by goal difference
          const aGoalDiff = a.goalsScored - a.goalsConceded;
          const bGoalDiff = b.goalsScored - b.goalsConceded;
          if (bGoalDiff !== aGoalDiff) {
            return bGoalDiff - aGoalDiff;
          }
          // If goal difference is equal, sort by goals scored
          return b.goalsScored - a.goalsScored;
        });
        
        setTeams(sortedTeams);

        const scorersRes = await axios.get(`${apiUrl}/player/top-scorers/`);
      setTopScorers(scorersRes.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [apiUrl, selectedTournament]);

  // Handler for tournament selection change
  const handleTournamentChange = (e) => {
    setSelectedTournament(e.target.value);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Tournament Points Table</h1>
      
      {/* Tournament Selector */}
      <div className="mb-6">
        <label htmlFor="tournament-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Tournament
        </label>
        <div className="relative">
          <select
            id="tournament-select"
            value={selectedTournament}
            onChange={handleTournamentChange}
            className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base"
            disabled={tournaments.length === 0}
          >
            {tournaments.length === 0 && (
              <option value="">No tournaments available</option>
            )}
            {tournaments.map((tournament) => (
              <option key={tournament.uuid} value={tournament.uuid}>
                {tournament.name}
              </option>
            ))}
          </select>
          
        </div>
      </div>
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Points Table */}
      {!loading && selectedTournament && (
        <>
          {teams.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GF
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GA
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GD
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams.map((team, index) => {
                      // Calculate goal difference
                      const goalDifference = team.goalsScored - team.goalsConceded;
                      
                      return (
                        <tr key={team.uuid || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {team.logoUrl ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-contain bg-gray-50"
                                    src={`${imageUrl}${team.logoUrl}`}
                                    alt={`${team.teamName} logo`}
                                    onError={(e) => {
                                      e.target.src = '/placeholder-team.png';
                                    }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 font-medium">
                                      {(team.teamName || "Team").charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                                {team.captainName && (
                                  <div className="text-xs text-gray-500">Captain: {team.captainName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                            {team.goalsScored || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                            {team.goalsConceded || 0}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                            {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                            {team.totalPoints || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Table Legend */}
              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <span>GF: Goals For</span>
                  <span>GA: Goals Against</span>
                  <span>GD: Goal Difference</span>
                  <span>Pts: Points</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No teams available for this tournament</p>
              <p className="text-gray-500 text-sm mt-2">This could be because no teams have joined yet or the tournament hasn't started.</p>
            </div>
          )}

{topScorers.length > 0 && (
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-4 text-center">Top 4 Goal Scorers</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {topScorers.map((player, idx) => (
        <div
          key={player.playerId}
          className="bg-white shadow-lg rounded-xl p-4 flex items-center space-x-4"
        >
          <img
            src={`${imageUrl}${player.photoUrl}`}
            alt={player.name}
            className="w-16 h-16 object-cover rounded-full bg-gray-200"
            onError={(e) => {
              e.target.src = "/placeholder-player.png";
            }}
          />
          <div>
            <h3 className="text-lg font-bold">{player.name}</h3>
            <p className="text-sm text-gray-600">{player.position}</p>
            <p className="text-sm text-gray-500">Goals: {player.totalScore}</p>
            {player.teamName && (
              <p className="text-sm text-gray-400 italic">Team: {player.teamName}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </>
      )}
    </div>
  );
};

export default PointsTable;