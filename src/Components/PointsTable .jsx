import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useAuth } from "../Context/AuthContext";

const PointsTable = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const {user} = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topScorers, setTopScorers] = useState([]);
  const [selectedTournamentName, setSelectedTournamentName] = useState("");
  const [generating, setGenerating] = useState(false);

  // Fetch all tournaments on component mount
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/tournament/all`);
        setTournaments(res.data.list);
        
        // Auto-select first tournament if available
        if (res.data.list.length > 0) {
          setSelectedTournament(res.data.list[0].uuid);
          setSelectedTournamentName(res.data.list[0].name);
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
        
        // Get tournament name
        const tournament = tournaments.find(t => t.uuid === selectedTournament);
        if (tournament) {
          setSelectedTournamentName(tournament.name);
        }
        
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
  }, [apiUrl, selectedTournament, tournaments]);

  // Handler for tournament selection change
  const handleTournamentChange = (e) => {
    setSelectedTournament(e.target.value);
  };

  // Generate PDF function
  const generatePDF = async () => {
    if (!selectedTournamentName || teams.length === 0) return;
    
    setGenerating(true);
    try {
      // Initialize PDF with portrait orientation
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
      
      // Add tournament header
      doc.setFillColor(66, 135, 245);
      doc.rect(margin, margin, pageWidth - 2 * margin, 15, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(selectedTournamentName, pageWidth / 2, margin + 10, { align: "center" });
      
      // Add points table title
      const titleY = margin + 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Points Table", pageWidth / 2, titleY, { align: "center" });
      
      // Add table headers
      const headerY = titleY + 10;
      const columnWidths = [15, 80, 20, 20, 20, 20];
      const headers = ["Pos", "Team", "GF", "GA", "GD", "Pts"];
      let currentX = margin;
      
      // Draw header background
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, headerY - 6, pageWidth - 2 * margin, 10, 'F');
      
      // Draw header text
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      for (let i = 0; i < headers.length; i++) {
        // Center-align positions and stats, left-align team names
        if (i === 1) {
          doc.text(headers[i], currentX + 2, headerY);
        } else {
          doc.text(headers[i], currentX + columnWidths[i] / 2, headerY, { align: "center" });
        }
        currentX += columnWidths[i];
      }
      
      // Add table rows
      let currentY = headerY + 8;
      const rowHeight = 8;
      
      // Draw horizontal line under header
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, headerY + 4, pageWidth - margin, headerY + 4);
      
      // Draw table content
      teams.forEach((team, index) => {
        const goalDifference = team.goalsScored - team.goalsConceded;
        const gdFormatted = goalDifference > 0 ? `+${goalDifference}` : goalDifference;
        
        // Alternate row colors
        if (index % 2 === 1) {
          doc.setFillColor(248, 248, 248);
          doc.rect(margin, currentY - 4, pageWidth - 2 * margin, rowHeight, 'F');
        }
        
        // Set font for data
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Position number
        doc.text((index + 1).toString(), margin + columnWidths[0] / 2, currentY, { align: "center" });
        
        // Team name
        doc.text(team.teamName || "Unknown Team", margin + columnWidths[0] + 2, currentY);
        
        // Goals for
        doc.text((team.goalsScored || 0).toString(), margin + columnWidths[0] + columnWidths[1] + columnWidths[2] / 2, currentY, { align: "center" });
        
        // Goals against
        doc.text((team.goalsConceded || 0).toString(), margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] / 2, currentY, { align: "center" });
        
        // Goal difference
        doc.text(gdFormatted.toString(), margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] / 2, currentY, { align: "center" });
        
        // Points (bold)
        doc.setFont("helvetica", "bold");
        doc.text((team.totalPoints || 0).toString(), margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5] / 2, currentY, { align: "center" });
        
        // Reset font
        doc.setFont("helvetica", "normal");
        
        // Draw horizontal line after each row
        if (index < teams.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.1);
          doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
        }
        
        currentY += rowHeight;
      });
      
      // Add table legend
      doc.setFontSize(8);
      doc.text("GF: Goals For | GA: Goals Against | GD: Goal Difference | Pts: Points", 
        pageWidth / 2, currentY + 8, { align: "center" });
      
      // Add top scorers section if available
      if (topScorers.length > 0) {
        // Check if we need a new page
        if (currentY > pageHeight - 80) {
          doc.addPage();
          currentY = margin + 10;
        } else {
          currentY += 20;
        }
        
        // Add top scorers title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Top Goal Scorers", pageWidth / 2, currentY, { align: "center" });
        
        // Add top scorers table
        const scorersHeaders = ["Player", "Team", "Position", "Goals"];
        const scorersColumnWidths = [60, 50, 40, 25];
        
        // Draw header background
        currentY += 10;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY - 6, pageWidth - 2 * margin, 10, 'F');
        
        // Draw header
        doc.setFontSize(10);
        currentX = margin;
        for (let i = 0; i < scorersHeaders.length; i++) {
          if (i === 0 || i === 1) {
            doc.text(scorersHeaders[i], currentX + 2, currentY);
          } else {
            doc.text(scorersHeaders[i], currentX + scorersColumnWidths[i] / 2, currentY, { align: "center" });
          }
          currentX += scorersColumnWidths[i];
        }
        
        // Draw horizontal line under header
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
        
        // Draw top scorers data
        currentY += 8;
        topScorers.slice(0, 10).forEach((player, index) => {
          // Alternate row colors
          if (index % 2 === 1) {
            doc.setFillColor(248, 248, 248);
            doc.rect(margin, currentY - 4, pageWidth - 2 * margin, rowHeight, 'F');
          }
          
          // Set font for data
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          
          // Player name
          doc.text(player.name || "Unknown Player", margin + 2, currentY);
          
          // Team name
          doc.text(player.teamName || "-", margin + scorersColumnWidths[0] + 2, currentY);
          
          // Position
          doc.text(player.position || "-", margin + scorersColumnWidths[0] + scorersColumnWidths[1] + scorersColumnWidths[2] / 2, currentY, { align: "center" });
          
          // Goals (bold)
          doc.setFont("helvetica", "bold");
          doc.text((player.totalScore || 0).toString(), margin + scorersColumnWidths[0] + scorersColumnWidths[1] + scorersColumnWidths[2] + scorersColumnWidths[3] / 2, currentY, { align: "center" });
          
          // Reset font
          doc.setFont("helvetica", "normal");
          
          // Draw horizontal line after each row
          if (index < Math.min(topScorers.length, 10) - 1) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
          }
          
          currentY += rowHeight;
        });
      }
      
      // Add footer with generation date
      // const date = new Date().toLocaleDateString();
      // doc.setFontSize(8);
      // doc.text(`Generated on: ${date}`, pageWidth - margin, pageHeight - margin, { align: "right" });
      
      // Save the PDF
      doc.save(`${selectedTournamentName.replace(/\s+/g, '-')}-Points-Table.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
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
      
      {/* Generate PDF Button */}
      {!loading && teams.length > 0 && (
        <div className="mb-6 flex justify-end">
          {user && (<button
            onClick={generatePDF}
            disabled={generating}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              generating ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download PDF
              </>
            )}
          </button>)}
        </div>
      )}
      
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
              <h2 className="text-xl font-semibold mb-4 text-center">Top Goal Scorers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {topScorers.slice(0, 6).map((player) => (
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