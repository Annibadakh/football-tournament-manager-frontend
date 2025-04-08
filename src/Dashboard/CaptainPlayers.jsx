import { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../Context/AuthContext";

const CaptainPlayers = () => {
  const MAX_PLAYERS = 11; // Maximum number of players allowed
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select an image file first.");
      return;
    }
    
    setUploadError("");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await api.post("/upload-photo", formData);
      setForm({ ...form, photoUrl: res.data.imageUrl });
      setPhotoSaved(true);
    } catch (err) {
      console.error("Upload error", err);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
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
    setIsUploading(false);
    setUploadError("");
    setForm({
      name: "",
      position: "",
      photoUrl: "",
      jerseyNumber: "",
      totalScore: 0,
      addPoint: 0,
    });
  };

  // Check if team is full
  const isTeamFull = players.length >= MAX_PLAYERS;

  if (!team) return <p className="text-center mt-10">Loading team info...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-3xl font-bold text-center mb-4">Your Registered Team</h2>
      <div className="text-gray-700 mb-4 text-center">
        <p><strong className="text-blue-600">Tournament:</strong> {tournament.name}</p>
        <p><strong className="text-blue-600">Team Name:</strong> {team.teamName}</p>
      </div>

      {/* Team Status Message */}
      <div className="text-center mb-4">
        {isTeamFull ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
            <p className="font-semibold">Team is full!</p>
            <p className="text-sm">Maximum number of players ({MAX_PLAYERS}) has been reached.</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded mb-4">
            <p className="text-sm">You can add {MAX_PLAYERS - players.length} more player(s) to complete your team.</p>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setFormVisible(!formVisible)}
          disabled={isTeamFull}
          className={`px-5 py-2 ${isTeamFull 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md shadow`}
        >
          {formVisible ? "Cancel" : "➕ Add Player"}
        </button>
      </div>

      {formVisible && !isTeamFull && (
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

          {/* Upload Section with Loader and Error Alert */}
          <div>
            <label className="block font-medium mb-1">Upload Player Photo</label>
            {!photoSaved && (
              <>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                
                {uploadError && (
                  <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                    {uploadError}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${isUploading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Photo"
                  )}
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
      <h3 className="text-xl font-semibold mb-3 border-b pb-2">Players List ({players.length}/{MAX_PLAYERS})</h3>
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