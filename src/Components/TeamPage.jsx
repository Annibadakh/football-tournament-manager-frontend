import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const TeamPage = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${apiUrl}/player/get-players/${id}`);
      console.log(res.data);
      setTeam(res.data);
    };
    fetch();
  }, [id]);

  const handleBack = () => {
    navigate("/tournaments");
  };

  if (!team) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <button 
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
      >
        <span className="mr-1">←</span> Back to Tournaments
      </button>
      
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