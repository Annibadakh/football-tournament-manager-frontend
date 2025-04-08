import { useEffect, useState } from "react";
import api from "../Api";
import TeamTable from "./TeamTable";

const TeamForm = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [teams, setTeams] = useState([]);
  const [formVisible, setFormVisible] = useState(false);

  const [form, setForm] = useState({
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainContact: "",
    isApproved: false,
    logoUrl: "",
    totalPoints: 0,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoSaved, setPhotoSaved] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/tournament/all");
        setTournaments(res.data.list);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  const fetchTeams = async (id) => {
    try {
      const res = await api.get(`/team/get-teams/${id}`);
      setTeams(res.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleTournamentSelect = (e) => {
    const id = e.target.value;
    setSelectedTournamentId(id);
    setFormVisible(false);
    fetchTeams(id);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload-photo", formData);
      setForm({ ...form, logoUrl: res.data.imageUrl });
      setPhotoSaved(true);
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tournamentId: selectedTournamentId,
    };
    try {
      await api.post("/team/add-team", payload);
      alert("Team added!");
      setFormVisible(false);
      setPhotoSaved(false);
      setPreview(null);
      setForm({
        teamName: "",
        captainName: "",
        captainEmail: "",
        captainContact: "",
        isApproved: false,
        logoUrl: "",
        totalPoints: 0,
      });
      fetchTeams(selectedTournamentId);
    } catch (err) {
      console.error("Submit error", err);
      alert("Error adding team.");
    }
  };

  return (
    <div className="w-full p-6 bg-white shadow-md rounded-md">
  <h2 className="text-3xl font-bold mb-6 text-center">🏆 Team Management</h2>

  {/* Tournament Selector */}
  <div className="mb-6">
    <label className="block font-semibold mb-2 text-gray-700">Select Tournament</label>
    <select
      onChange={handleTournamentSelect}
      value={selectedTournamentId}
      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-- Select Tournament --</option>
      {tournaments.map((t) => (
        <option key={t.uuid} value={t.uuid}>
          {t.name}
        </option>
      ))}
    </select>
  </div>

  {/* Team List and Toggle Button */}
  {selectedTournamentId && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Teams ({teams.length})
        </h3>
        <button
          className={`px-4 py-2 rounded font-medium ${
            formVisible ? "bg-red-600" : "bg-blue-600"
          } text-white hover:opacity-90 transition`}
          onClick={() => setFormVisible(!formVisible)}
        >
          {formVisible ? "Cancel" : "➕ Add Team"}
        </button>
      </div>

      {teams.length > 0 ? (
        <TeamTable teams={teams} />
      ) : (
        <p className="text-gray-500 mb-4">No team added yet !!</p>
      )}
    </>
  )}

  {/* Team Form */}
  {formVisible && (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="col-span-1 md:col-span-2">
        <label className="block font-semibold mb-1">Team Name</label>
        <input
          name="teamName"
          value={form.teamName}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Enter Team Name"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Captain Name</label>
        <input
          name="captainName"
          value={form.captainName}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Enter Captain Name"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Captain Email</label>
        <input
          name="captainEmail"
          value={form.captainEmail}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Enter Email"
          type="email"
          required
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="block font-semibold mb-1">Captain Contact</label>
        <input
          name="captainContact"
          value={form.captainContact}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Enter Contact Number"
          required
        />
      </div>

      {/* Logo Upload Section */}
      <div className="col-span-1 md:col-span-2 mt-4">
        <label className="block font-semibold mb-2">Team Logo</label>
        {!photoSaved && (
          <div className="flex flex-col md:flex-row items-start gap-4">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button
              type="button"
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Upload Logo
            </button>
          </div>
        )}
        {preview && (
          <img src={preview} alt="Logo Preview" className="mt-3 h-20 rounded shadow" />
        )}
        {photoSaved && <p className="text-green-600 mt-2">✅ Logo saved</p>}
      </div>

      <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Submit Team
        </button>
      </div>
    </form>
  )}
</div>

  );
};

export default TeamForm;
