import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import poster from "./poster.png";

const Home = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
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
      <h1 className="text-2xl text-center w-full h-auto font-bold mb-4">Recent Tournament</h1>
      <div>
        <img src={poster}></img>
        <button
          onClick={() => navigate("/tournaments")}
          className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
        >
          Read More
        </button> 
      </div>
    </div>
  );
};

export default Home;
