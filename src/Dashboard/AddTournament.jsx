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
      {tournaments.length < 1 && (
        <button
        onClick={() => setShowForm(true)}
        className="mb-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        Add Tournament
      </button>
      )}
  
      {/* Tournament Form */}
      {showForm && (
        <div className="p-6 bg-white rounded-xl shadow-md mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tournament Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              onChange={handleChange}
              placeholder="Tournament Name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="totalTeams"
              type="number"
              onChange={handleChange}
              placeholder="Total Teams"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
  
            <select
              name="type"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="league">League</option>
              <option value="group">Group</option>
              <option value="knockout">Knockout</option>
            </select>
  
            <input
              name="teamSize"
              type="number"
              onChange={handleChange}
              placeholder="Team Size"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="startDate"
              type="date"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="endDate"
              type="date"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="amountPerTeam"
              type="number"
              onChange={handleChange}
              placeholder="Amount Per Team"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="pointsWin"
              type="number"
              onChange={handleChange}
              placeholder="Points for Win"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="pointsDraw"
              type="number"
              onChange={handleChange}
              placeholder="Points for Draw"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="pointsLoss"
              type="number"
              onChange={handleChange}
              placeholder="Points for Loss"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
  
            {/* File Upload */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Tournament Logo</label>
              {isPhotoSave && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full block border border-gray-300 rounded-md px-4 py-2"
                />
              )}
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-4 h-24 w-24 object-cover rounded-md shadow-md"
                />
              )}
              {isPhotoSave ? (
                <button
                  type="button"
                  onClick={handleUpload}
                  className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-60"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save Photo"}
                </button>
              ) : (
                <p className="mt-2 text-green-600 font-semibold">Photo Saved !!</p>
              )}
            </div>
  
            {!isPhotoSave ? (
              <button
                type="submit"
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Submit Tournament
              </button>
            ) : (
              <p className="text-red-500 font-semibold">Save Photo First</p>
            )}
          </form>
        </div>
      )}
  
      {/* Tournament Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="p-3 text-left">Logo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Teams</th>
              <th className="p-3 text-left">Team Size</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Win</th>
              <th className="p-3 text-left">Draw</th>
              <th className="p-3 text-left">Loss</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.uuid} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  <img
                    src={`${imgUrl}${t.logoUrl}`}
                    alt="logo"
                    className="h-10 w-10 object-cover rounded-full"
                  />
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
