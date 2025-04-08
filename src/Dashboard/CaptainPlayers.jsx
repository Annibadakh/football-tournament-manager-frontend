import { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const CaptainPlayers = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const { user } = useAuth();
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
  }, []);

  useEffect(() => {
    if (team) fetchPlayers();
  }, [team]);

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/team/get-captainteam/${user.uuid}`);
      setTeam(res.data.team);
      setTournament(res.data.tournament);
    } catch (err) {
      console.error("Error loading captain team", err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const playersRes = await api.get(`/player/get-players/${team.uuid}`);
      setPlayers(playersRes.data);
    } catch (err) {
      console.error("Error loading players", err);
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
      resetForm();
      fetchPlayers();
    } catch (err) {
      console.error("Add player error", err);
    }
  };

  const resetForm = () => {
    setFormVisible(false);
    setPhotoSaved(false);
    setPreview(null);
    setFile(null);
    setForm({
      name: "",
      position: "",
      photoUrl: "",
      jerseyNumber: "",
      totalScore: 0,
      addPoint: 0,
    });
  };

  if (!team) return <p className="text-center mt-10">Loading team info...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-3xl font-bold text-center mb-4">Your Registered Team</h2>
      <div className="text-gray-700 mb-4 text-center">
        <p><strong className="text-blue-600">Tournament:</strong> {tournament.name}</p>
        <p><strong className="text-blue-600">Team Name:</strong> {team.teamName}</p>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
        >
          {formVisible ? "Cancel" : "➕ Add Player"}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border mb-6">
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Player Name"
            required
          />
          <select
            name="position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
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
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Jersey Number"
            required
          />

          {/* Upload Section */}
          <div>
            <label className="block font-medium mb-1">Upload Player Photo</label>
            {!photoSaved && (
              <>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={handleUpload}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Photo
                </button>
              </>
            )}
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Preview" className="h-20 rounded-md shadow" />
              </div>
            )}
            {photoSaved ? (
              <p className="text-green-600 mt-1 font-medium">Photo saved ✅</p>
            ) : (
              <p className="text-red-500 mt-1">Please upload the player photo before submitting.</p>
            )}
          </div>

          {photoSaved && (
            <button
              type="submit"
              className="w-full py-2 mt-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow"
            >
              Add Player
            </button>
          )}
        </form>
      )}

      {/* Player Table */}
      <h3 className="text-xl font-semibold mb-3 border-b pb-2">Players List ({players.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
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
              <tr key={p.playerId} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{i + 1}</td>
                <td className="border px-3 py-2">
                  <img
                    src={`${imgUrl}${p.photoUrl}`}
                    alt="player"
                    className="h-10 w-10 object-cover rounded-full mx-auto"
                  />
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
    </div>
  );
};

export default CaptainPlayers;
