import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Tournaments = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/tournament/all`);
        setTournaments(res.data.list);

        // Fetch all teams in parallel for better performance
        const teamPromises = res.data.list.map(t => 
          axios.get(`${apiUrl}/team/get-teams/${t.uuid}`)
            .then(teamRes => ({ tournamentId: t.uuid, teams: teamRes.data }))
        );
        
        const teamResults = await Promise.all(teamPromises);
        
        const teamData = {};
        teamResults.forEach(result => {
          teamData[result.tournamentId] = result.teams;
        });
        
        setTeams(teamData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Tournaments</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {tournaments.map((tournament) => (
          <div 
            key={tournament.uuid} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {tournament.logoUrl ? (
                    <img 
                      src={`${imageUrl}${tournament.logoUrl}`} 
                      alt={`${tournament.name} logo`} 
                      className="h-16 w-16 object-contain rounded-md"
                      onError={(e) => {
                        e.target.src = '/placeholder-tournament.png';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{tournament.name}</h2>
                  <div className="flex items-center text-sm text-gray-600 space-x-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      {tournament.startDate} to {tournament.endDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Participating Teams ({teams[tournament.uuid]?.length || 0})
              </h3>
              
              {teams[tournament.uuid]?.length ? (
                <div className="space-y-3">
                  {teams[tournament.uuid].map((team) => (
                    <div 
                      key={team.id}
                      onClick={() => navigate(`/team/${team.uuid}`)}
                      className="flex items-center p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="mr-3">
                        {team.logoUrl ? (
                          <img 
                            src={`${imageUrl}${team.logoUrl}`} 
                            alt={`${team.teamName} logo`}
                            className="h-10 w-10 object-contain rounded-full"
                            onError={(e) => {
                              e.target.src = '/placeholder-team.png';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">{team.teamName?.charAt(0) || 'T'}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-blue-600">{team.teamName}</p>
                        <p className="text-sm text-gray-500">Captain: {team.captainName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                  No teams have joined this tournament yet
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
      
      {tournaments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tournaments available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default Tournaments;