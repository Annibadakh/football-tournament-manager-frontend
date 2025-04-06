import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import poster from "./poster.png";

const Home = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${apiUrl}/tournament/all`);
      setTournaments(res.data.list);
    };
    fetch();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Tournament</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tournaments.map((t) => (
          <div 
          key={t.uuid}
          className="border w-[800px] h-[400px] p-4 shadow rounded"
          style={{
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",

          }}

          >
            <img
              src={`${imageUrl}${t.logoUrl}`}
              alt={t.name}
              className="h-24 mx-auto mb-2"
            />
            <h2 className="text-xl font-semibold">{t.name}</h2>
            <p className="text-sm text-gray-600">
              {t.startDate} - {t.endDate}
            </p>
            <button
              onClick={() => navigate("/tournaments")}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
            >
              Read More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
