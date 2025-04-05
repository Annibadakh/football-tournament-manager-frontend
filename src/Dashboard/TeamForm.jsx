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
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded relative">
      <h2 className="text-2xl font-bold mb-4">Team Management</h2>

      <select
        onChange={handleTournamentSelect}
        className="block w-full border p-2 rounded mb-4"
        value={selectedTournamentId}
      >
        <option value="">Select Tournament</option>
        {tournaments.map((t) => (
          <option key={t.uuid} value={t.uuid}>
            {t.name}
          </option>
        ))}
      </select>

      {selectedTournamentId && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Teams in this Tournament ({teams.length})
            </h3>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setFormVisible(!formVisible)}
            >
              {formVisible ? "Cancel" : "➕ Add Team"}
            </button>
          </div>

          {teams.length !== 0 ? (
            <TeamTable teams={teams} />
          ) : (
            <p>No team added yet !!</p>
          )}
        </>
      )}

      {formVisible && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            className="input"
            placeholder="Team Name"
            required
          />
          <input
            name="captainName"
            value={form.captainName}
            onChange={handleChange}
            className="input"
            placeholder="Captain Name"
            required
          />
          <input
            name="captainEmail"
            value={form.captainEmail}
            onChange={handleChange}
            className="input"
            placeholder="Captain Email"
            type="email"
            required
          />
          <input
            name="captainContact"
            value={form.captainContact}
            onChange={handleChange}
            className="input"
            placeholder="Captain Contact"
            required
          />

          <div>
            <label className="font-semibold block mb-1">Team Logo</label>
            {!photoSaved && (
              <>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={handleUpload}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                >
                  Upload Logo
                </button>
              </>
            )}
            {preview && (
              <img src={preview} alt="Logo Preview" className="mt-2 h-20 rounded shadow" />
            )}
            {photoSaved && <p className="text-green-600">Logo saved ✅</p>}
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Submit Team
          </button>
        </form>
      )}
    </div>
  );
};

export default TeamForm;
