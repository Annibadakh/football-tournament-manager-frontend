import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BracketView from "@/components/match/BracketView";
import MatchRow from "@/components/match/MatchRow";
import { MATCH_STATUS } from "@/constants/match.constants";
import {
  formatKickoff,
  fromIstInputValue,
  groupByDate,
  groupByRound,
  sideLabel,
  toIstInputValue,
} from "@/utils/match";

const base = {
  id: "m1",
  matchNumber: 3,
  stage: 1,
  roundNumber: 1,
  roundName: "Round 1",
  status: MATCH_STATUS.SCHEDULED,
  homeTeam: { id: "t1", name: "Shirdi Strikers", shortName: "SST" },
  awayTeam: { id: "t2", name: "Rahata Royals", shortName: "RRY" },
  scheduledAt: "2027-04-10T03:30:00.000Z",
  ground: { id: "g1", name: "Main ground" },
};

const withRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("match time helpers (IST)", () => {
  it("round-trips a kick-off through the datetime input", () => {
    expect(toIstInputValue("2027-04-10T03:30:00.000Z")).toBe("2027-04-10T09:00");
    expect(fromIstInputValue("2027-04-10T09:00")).toBe("2027-04-10T09:00:00+05:30");
    expect(fromIstInputValue("")).toBeNull();
  });

  it("formats kick-offs in Indian time", () => {
    expect(formatKickoff("2027-04-10T03:30:00.000Z")).toMatch(/Sat, 10 Apr · 9:00 am/i);
    expect(formatKickoff(null)).toBe("Time TBA");
  });
});

describe("grouping", () => {
  it("groups by round and keeps the third-place match apart", () => {
    const sections = groupByRound([
      { ...base, id: "a", stage: 3, roundNumber: 2, roundName: "Final" },
      { ...base, id: "b", stage: 3, roundNumber: 2, roundName: "Third place", isThirdPlace: true },
      { ...base, id: "c", stage: 3, roundNumber: 2, roundName: "Final" },
    ]);
    expect(sections.map((s) => [s.title, s.matches.length])).toEqual([
      ["Final", 2],
      ["Third place", 1],
    ]);
  });

  it("groups by IST date with unscheduled matches last", () => {
    const sections = groupByDate([
      { ...base, id: "x", scheduledAt: null },
      { ...base, id: "y", scheduledAt: "2027-04-10T20:00:00.000Z" }, // 11 Apr in IST
      { ...base, id: "z" },
    ]);
    expect(sections.map((s) => s.key)).toEqual(["2027-04-10", "2027-04-11", "tba"]);
  });

  it("falls back to the placeholder for open knockout slots", () => {
    expect(sideLabel({ homeTeam: null, homePlaceholder: "Winner of M4" }, "home")).toBe(
      "Winner of M4",
    );
  });
});

describe("MatchRow", () => {
  it("shows v before kick-off and the score once played", () => {
    const { rerender } = withRouter(<MatchRow match={base} />);
    expect(screen.getByText("v")).toBeInTheDocument();
    expect(screen.getByText("Main ground")).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <MatchRow
          match={{
            ...base,
            status: MATCH_STATUS.COMPLETED,
            homeScore: 2,
            awayScore: 1,
            winnerTeamId: "t1",
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("2 – 1")).toBeInTheDocument();
    expect(screen.getByText("Full time")).toBeInTheDocument();
  });
});

describe("BracketView", () => {
  it("renders rounds as columns with placeholders", () => {
    withRouter(
      <BracketView
        bracket={{
          rounds: [
            { roundNumber: 1, name: "Semi-final", matches: [base] },
            {
              roundNumber: 2,
              name: "Final",
              matches: [
                {
                  ...base,
                  id: "f",
                  matchNumber: 5,
                  homeTeam: null,
                  awayTeam: null,
                  homePlaceholder: "Winner of M3",
                  awayPlaceholder: "Winner of M4",
                },
              ],
            },
          ],
          thirdPlace: null,
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Final" })).toBeInTheDocument();
    expect(screen.getByText("Winner of M3")).toBeInTheDocument();
  });
});
