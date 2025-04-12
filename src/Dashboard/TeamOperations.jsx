import { useState } from 'react';
import api from '../Api';

const operations = [
  { id: '01', label: 'Faul' },
  { id: '02', label: 'Penalty' },
  { id: '03', label: 'Goal' },
  { id: '04', label: 'Pass' },
  { id: '05', label: 'Shoot' },
  { id: '06', label: 'Freekick' },
  { id: '07', label: 'Away' },
  { id: '08', label: 'Throw' },
  { id: '09', label: 'Start' },
];

const TeamOperations = ({ team1, team2 }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleTeamClick = (teamName) => {
    setSelectedTeam(teamName);
  };

  const handleOperationClick = async (op) => {
    if (!selectedTeam) return;
    try {
      await api.post('/operations/add', {
        teamName: selectedTeam,
        operationId: op.id,
      });
      setSelectedTeam(null); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Choose a Team</h2>

      <div className="flex justify-center gap-6">
        <button
          className={`px-5 py-2 rounded text-white ${
            selectedTeam === team1 ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={() => handleTeamClick(team1)}
        >
          {team1}
        </button>
        <button
          className={`px-5 py-2 rounded text-white ${
            selectedTeam === team2 ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'
          }`}
          onClick={() => handleTeamClick(team2)}
        >
          {team2}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {operations.map((op) => (
          <button
            key={op.id}
            disabled={!selectedTeam}
            className={`px-4 py-2 rounded text-white transition ${
              selectedTeam
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => handleOperationClick(op)}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeamOperations;
