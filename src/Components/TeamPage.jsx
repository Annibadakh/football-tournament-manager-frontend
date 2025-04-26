import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import jsPDF from "jspdf";

const TeamPage = () => {
  const {user} = useAuth();
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id, name } = useParams();
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${apiUrl}/player/get-players/${id}`);
      setTeam(res.data);
    };
    fetch();
  }, [id]);

  const handleBack = () => {
    navigate("/tournaments");
  };

  const generatePDF = async () => {
    setGeneratingPdf(true);
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Team: ${name}`, 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Jersey", 20, 50);
    doc.text("Name", 70, 50);
    doc.text("Position", 140, 50);
    doc.text("Score", 180, 50);
    doc.line(20, 52, 190, 52);

    let yPosition = 70;
    const playerImageSize = 15;
    const rowHeight = 18;

    const checkForNewPage = (y) => {
      if (y > 270) {
        doc.addPage();
        yPosition = 20;
        return 20;
      }
      return y;
    };

    for (let i = 0; i < team.length; i++) {
      const player = team[i];
      yPosition = checkForNewPage(yPosition);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(player.jerseyNumber.toString(), 20, yPosition);
      doc.text(player.name, 70, yPosition);
      doc.text(player.position, 140, yPosition);
      doc.text(player.totalScore.toString(), 180, yPosition);

      try {
        const imageFullUrl = `${import.meta.env.VITE_IMAGE_URL}${player.photoUrl}`;
        const imgData = await loadImage(imageFullUrl);

        if (imgData) {
          doc.addImage(imgData, 'JPEG', 40, yPosition - playerImageSize + 2, playerImageSize, playerImageSize);
        }
      } catch (error) {
        console.error(`Error loading image for player ${player.name}:`, error);
      }

      yPosition += rowHeight;
    }

    doc.save(`${name}_Team_Players.pdf`);
    setGeneratingPdf(false);
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  };

  if (!team) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <span className="mr-1">←</span> Back to Tournaments
        </button>

        {user && (<button
          onClick={generatePDF}
          disabled={generatingPdf}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
        >
          {generatingPdf ? "Generating..." : "Download Team PDF"}
        </button>)}
      </div>

      <h2 className="text-xl font-bold mt-4">Players</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Jersey Number</th>
              <th className="py-2 px-4 border-b">Photo</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Position</th>
              <th className="py-2 px-4 border-b">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {team.map((player) => (
              <tr key={player.playerId}>
                <td className="py-2 px-4 border-b text-center">{player.jerseyNumber}</td>
                <td className="py-2 px-4 border-b flex justify-center">
                  <img
                    src={`${imgUrl}${player.photoUrl}`}
                    alt={player.name}
                    className="h-12 w-12 object-cover rounded-full"
                  />
                </td>
                <td className="py-2 px-4 border-b">{player.name}</td>
                <td className="py-2 px-4 border-b">{player.position}</td>
                <td className="py-2 px-4 border-b text-center">{player.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPage;
