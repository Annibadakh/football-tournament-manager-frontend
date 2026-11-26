// Fake server for the dev showcase so DataTable can be tried without the API
const TEAM_NAMES = [
  "Kopargaon FC",
  "Shirdi United",
  "Rahata Rangers",
  "Sangamner Strikers",
  "Nashik City",
  "Pune Warriors",
  "Ahmednagar Athletic",
  "Satara Stars",
  "Kolhapur Kings",
  "Aurangabad Eagles",
  "Solapur Sparks",
  "Nagpur Nomads",
];

const ALL_TEAMS = TEAM_NAMES.map((teamName, index) => ({
  id: index + 1,
  teamName,
  city: teamName.split(" ")[0],
  points: (index * 7) % 19,
  isVerified: index % 3 !== 0,
}));

export const fetchShowcaseTeams = ({ page, pageSize, sortBy, sortOrder, search }) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const term = (search ?? "").toLowerCase();
      const filtered = ALL_TEAMS.filter((team) => team.teamName.toLowerCase().includes(term));
      const sorted = sortBy
        ? [...filtered].sort((a, b) => {
            const result = a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
            return sortOrder === "desc" ? -result : result;
          })
        : filtered;
      const start = (page - 1) * pageSize;
      resolve({ data: sorted.slice(start, start + pageSize), total: filtered.length });
    }, 500);
  });

export const POSITION_OPTIONS = [
  { label: "Goalkeeper", value: 1 },
  { label: "Defender", value: 2 },
  { label: "Midfielder", value: 3 },
  { label: "Striker", value: 4 },
];
