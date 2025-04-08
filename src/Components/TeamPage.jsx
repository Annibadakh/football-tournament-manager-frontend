import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Api";

const TeamPage = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const { id } = useParams();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get(`/team/get-team/${id}`);
      setTeam(res.data);
    };
    fetch();
  }, [id]);

  if (!team) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{team.teamName}</h1>
      <img
        src={`${imgUrl}${team.logoUrl}`}
        alt="logo"
        className="h-24 mb-2"
      />
      <p><strong>Captain:</strong> {team.captainName}</p>
      <p><strong>Email:</strong> {team.captainEmail}</p>
      <p><strong>Contact:</strong> {team.captainContact}</p>
      <p><strong>Total Points:</strong> {team.totalPoints}</p>
      <p><strong>Approved:</strong> {team.isApproved ? "✅" : "❌"}</p>
    </div>
  );
};

export default TeamPage;
