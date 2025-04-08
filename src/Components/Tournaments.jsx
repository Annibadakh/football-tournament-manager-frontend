import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Tournaments = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${apiUrl}/tournament/all`);
      setTournaments(res.data.list);

      for (let t of res.data.list) {
        const teamRes = await axios.get(`${apiUrl}/team/get-teams/${t.uuid}`);
        console.log(teamRes);
        setTeams((prev) => ({ ...prev, [t.uuid]: teamRes.data }));

      }
    };
    fetch();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tournaments</h1>
      {tournaments.map((t) => (
        <div key={t.uuid} className="mb-6 p-4 border shadow rounded">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.name}</h2>
            <span className="text-sm text-gray-600">
              {t.startDate} to {t.endDate}
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-semibold">Teams:</h3>
            {teams[t.uuid]?.length ? (
              <ul className="list-disc pl-5">
                {teams[t.uuid].map((team) => (
                  <li
                    key={team.id}
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => navigate(`/team/${team.uuid}`)}
                  >
                    {team.teamName} - Captain: {team.captainName}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No teams added yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tournaments;
