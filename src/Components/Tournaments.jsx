import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";

const Tournaments = () => {
  const { user } = useAuth();
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
        console.log(teamData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl]);

  // Helper function to render status badge
  const renderStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Paid
        </span>
      );
    } else if (isApproved === false) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Payment Pending
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Processing
        </span>
      );
    }
  };

  // Function to add logo to PDF
  const addLogoToPDF = async (doc, logoUrl, x, y, width, height) => {
    if (!logoUrl) return;
    
    try {
      // Create a full URL to the image
      const fullLogoUrl = `${imageUrl}${logoUrl}`;
      
      // Fetch the image as a blob
      const response = await fetch(fullLogoUrl);
      const blob = await response.blob();
      
      // Convert blob to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Add the image to the PDF
          doc.addImage(reader.result, 'PNG', x, y, width, height);
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
      // Continue without the logo
      return Promise.resolve();
    }
  };

  // Function to generate and download PDF for a tournament
  const generatePDF = async (tournament) => {
    const tournamentTeams = teams[tournament.uuid] || [];
    const doc = new jsPDF();
    
    // Add tournament logo if available
    if (tournament.logoUrl) {
      try {
        await addLogoToPDF(doc, tournament.logoUrl, 20, 10, 30, 30);
      } catch (error) {
        console.error("Error adding tournament logo:", error);
      }
    }
    
    // Set font size and add title (adjust position if logo exists)
    doc.setFontSize(20);
    doc.text(`Tournament: ${tournament.name}`, tournament.logoUrl ? 60 : 20, 25);
    
    // Add tournament details
    doc.setFontSize(12);
    doc.text(`Duration: ${tournament.startDate} to ${tournament.endDate}`, tournament.logoUrl ? 60 : 20, 35);
    
    // Add teams heading
    doc.setFontSize(16);
    doc.text(`Participating Teams (${tournamentTeams.length})`, 20, 50);
    
    // Add team details
    doc.setFontSize(12);
    let yPos = 60;
    
    if (tournamentTeams.length > 0) {
      // Process teams sequentially to handle async logo loading
      for (let i = 0; i < tournamentTeams.length; i++) {
        const team = tournamentTeams[i];
        
        // Add new page if needed
        if (yPos > 260 && i < tournamentTeams.length - 1) {
          doc.addPage();
          yPos = 20;
        }
        
        // Add team logo if available
        if (team.logoUrl) {
          try {
            await addLogoToPDF(doc, team.logoUrl, 20, yPos, 15, 15);
            doc.text(`Team: ${team.teamName}`, 40, yPos + 10);
          } catch (error) {
            console.error("Error adding team logo:", error);
            doc.text(`Team: ${team.teamName}`, 25, yPos + 10);
          }
        } else {
          doc.text(`Team: ${team.teamName}`, 25, yPos + 10);
        }
        
        doc.text(`Captain: ${team.captainName}`, 25, yPos + 20);
        doc.text(`Contact No.: ${team.captainContact}`, 100, yPos + 20);
        
        yPos += 30;
      }
    } else {
      doc.text("No teams have joined this tournament yet", 25, yPos);
    }
    
    // Save the PDF
    doc.save(`${tournament.name}-details.pdf`);
  };

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
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold text-gray-800">{tournament.name}</h2>
                    {user && (<button 
                      onClick={(e) => {
                        e.stopPropagation();
                        generatePDF(tournament);
                      }}
                      className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Generate PDF
                    </button>)}
                  </div>
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
                      onClick={() => navigate(`/team/${team.uuid}/${team.teamName}`)}
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
                      <div className="flex-grow">
                        <p className="font-medium text-blue-600">{team.teamName}</p>
                        <p className="text-sm text-gray-500">Captain: {team.captainName}</p>
                      </div>
                      <div className="ml-auto">
                        {renderStatusBadge(team.isApproved)}
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