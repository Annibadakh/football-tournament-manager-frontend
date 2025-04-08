import { useEffect, useState } from "react";
import api from "../Api";

const TournamentForm = () => {
  const imgUrl = import.meta.env.VITE_IMAGE_URL;
  const [form, setForm] = useState({
    name: "",
    totalTeams: "",
    type: "league",
    teamSize: "",
    startDate: "",
    endDate: "",
    amountPerTeam: "",
    logoUrl: "",
    pointsWin: "",
    pointsDraw: "",
    pointsLoss: "",
  });

  const [file, setFile] = useState(null);
  const [isPhotoSave, setPhotoSave] = useState(true);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [tournaments, setTournaments] = useState([]);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      const res = await api.get("/tournament/all");
      console.log(res.data.list);
      setTournaments(res.data.list);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await api.post("/upload-photo", formData);
      setForm({ ...form, logoUrl: res.data.imageUrl });
      setUploading(false);
      setPhotoSave(false);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/tournament/create-tournament", form);
      alert("Tournament created successfully!");
      fetchTournaments();
      console.log(res);
      setShowForm(false); 
      setForm({
        name: "",
        totalTeams: "",
        type: "league",
        teamSize: "",
        startDate: "",
        endDate: "",
        amountPerTeam: "",
        logoUrl: "",
        pointsWin: "",
        pointsDraw: "",
        pointsLoss: "",
      });
      setPreview(null);
      setPhotoSave(true);
    } catch (err) {
      console.error(err);
      alert("Error creating tournament.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded"
      >
        Add Tournament
      </button>

      {/* Tournament Form */}
      {showForm && (
        <div className="p-6 bg-white rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" onChange={handleChange} placeholder="Tournament Name" className="input" required />
            <input name="totalTeams" type="number" onChange={handleChange} placeholder="Total Teams" className="input" required />

            <select name="type" onChange={handleChange} className="input" required>
              <option value="league">League</option>
              <option value="group">Group</option>
              <option value="knockout">Knockout</option>
            </select>

            <input name="teamSize" type="number" onChange={handleChange} placeholder="Team Size" className="input" required />
            <input name="startDate" type="date" onChange={handleChange} className="input" required />
            <input name="endDate" type="date" onChange={handleChange} className="input" required />
            <input name="amountPerTeam" type="number" onChange={handleChange} placeholder="Amount Per Team" className="input" required />
            <input name="pointsWin" type="number" onChange={handleChange} placeholder="Points for Win" className="input" required />
            <input name="pointsDraw" type="number" onChange={handleChange} placeholder="Points for Draw" className="input" required />
            <input name="pointsLoss" type="number" onChange={handleChange} placeholder="Points for Loss" className="input" required />

            {/* File Upload */}
            <div>
              <label className="block mb-1 font-medium">Tournament Logo</label>
              {isPhotoSave && <input type="file" accept="image/*" onChange={handleFileChange} className="block" />}
              {preview && <img src={preview} alt="preview" className="mt-2 h-24 rounded shadow" />}
              {isPhotoSave ? (
                <button
                  type="button"
                  onClick={handleUpload}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save Photo"}
                </button>
              ) : (
                <p>Photo Saved !!</p>
              )}
            </div>

            {!isPhotoSave ? (
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
                Submit Tournament
              </button>
            ) : (
              <p>Save Photo First</p>
            )}
          </form>
        </div>
      )}

      {/* Tournament Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Logo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Teams</th>
              <th className="p-3">Team Size</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Win</th>
              <th className="p-3">Draw</th>
              <th className="p-3">Loss</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.uuid} className="text-center border-b">
                <td className="p-3">
                  <img src={`${imgUrl}${t.logoUrl}`} alt="logo" className="h-10 w-10 object-cover rounded-full mx-auto" />
                </td>
                <td className="p-3">{t.name}</td>
                <td className="p-3 capitalize">{t.type}</td>
                <td className="p-3">{t.totalTeams}</td>
                <td className="p-3">{t.teamSize}</td>
                <td className="p-3">{t.startDate}</td>
                <td className="p-3">{t.endDate}</td>
                <td className="p-3">₹{t.amountPerTeam}</td>
                <td className="p-3">{t.pointsWin}</td>
                <td className="p-3">{t.pointsDraw}</td>
                <td className="p-3">{t.pointsLoss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TournamentForm;
