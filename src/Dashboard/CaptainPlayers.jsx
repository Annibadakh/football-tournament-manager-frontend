import { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";


const CaptainPlayers = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
    const {user} = useAuth();
  const [team, setTeam] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: "",
    photoUrl: "",
    jerseyNumber: "",
    totalScore: 0,
    addPoint: 0,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoSaved, setPhotoSaved] = useState(false);

  useEffect(() => {
    fetchTeam();
    fetchPlayers();
  }, []);
  const fetchTeam = async () => {
    try {
      const res = await api.get(`/team/get-captainteam/${user.uuid}`);
      setTeam(res.data.team);
      setTournament(res.data.tournament);
      console.log(res.data);
    } catch (err) {
      console.error("Error loading captain team", err);
    }
  };
  const fetchPlayers = async () => {
    try {
      const playersRes = await api.get(`/player/get-players/${team.uuid}`);
      setPlayers(playersRes.data);
    } catch (err) {
      console.error("Error loading captain team", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload-photo", formData);
      setForm({ ...form, photoUrl: res.data.imageUrl });
      setPhotoSaved(true);
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/player/add-player", {
        ...form,
        teamId: team.uuid,
      });
      alert("Player added!");
      setFormVisible(false);
      setPhotoSaved(false);
      setPreview(null);
      setForm({
        name: "",
        position: "",
        photoUrl: "",
        jerseyNumber: "",
        totalScore: 0,
        addPoint: 0,
      });
      fetchPlayers();
    } catch (err) {
      console.error("Add player error", err);
    }
  };

  if (!team) return <p>Loading team info...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Your Registered Team</h2>
      <p><strong>Tournament:</strong> {tournament.name}</p>
      <p><strong>Team Name:</strong> {team.teamName}</p>

      <button
        onClick={() => setFormVisible(!formVisible)}
        className="mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {formVisible ? "Cancel" : "➕ Add Player"}
      </button>

      {formVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="Player Name"
            required
          />
          <select
            name="position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="input"
            required
          >
            <option value="">Select Position</option>
            <option value="Striker">Striker</option>
            <option value="Defender">Defender</option>
            <option value="Mid-Fielder">Mid-Fielder</option>
            <option value="Goalkeeper">Goalkeeper</option>
          </select>
          <input
            name="jerseyNumber"
            type="number"
            value={form.jerseyNumber}
            onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
            className="input"
            placeholder="Jersey Number"
            required
          />
          {/* Upload Section */}
          <div>
            <label className="block mb-1">Upload Player Photo</label>
            {!photoSaved && (
              <>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="button" onClick={handleUpload} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
                  Upload
                </button>
              </>
            )}
            {preview && <img src={preview} alt="Preview" className="mt-2 h-20 rounded shadow" />}
            {photoSaved && <p className="text-green-600">Photo saved ✅</p>}
          </div>

          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
            Add Player
          </button>
        </form>
      )}

      {/* Player Table */}
      <h3 className="text-xl font-semibold mb-2">Players List ({players.length})</h3>
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">#</th>
            <th className="border px-3 py-2">Photo</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Position</th>
            <th className="border px-3 py-2">Jersey #</th>
            <th className="border px-3 py-2">Total</th>
            <th className="border px-3 py-2">Add Point</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.playerId} className="text-center">
              <td className="border px-3 py-2">{i + 1}</td>
              <td className="border px-3 py-2">
                <img src={`${imgUrl}${p.photoUrl}`} alt="player" className="h-10 w-10 object-cover rounded-full mx-auto" />
              </td>
              <td className="border px-3 py-2">{p.name}</td>
              <td className="border px-3 py-2">{p.position}</td>
              <td className="border px-3 py-2">{p.jerseyNumber}</td>
              <td className="border px-3 py-2">{p.totalScore}</td>
              <td className="border px-3 py-2">{p.addPoint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaptainPlayers;
