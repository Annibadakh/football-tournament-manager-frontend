import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventTimeline from "@/components/match/EventTimeline";
import LeadersList from "@/components/match/LeadersList";
import StandingsTable from "@/components/match/StandingsTable";
import { MATCH_EVENT_TYPE, MATCH_PERIOD } from "@/constants/match.constants";
import { computeClock, periodBaseMinute } from "@/hooks/useMatchClock";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const settings = { halfMinutes: 20, extraTimeHalfMinutes: 5 };

describe("match clock", () => {
  const start = "2027-04-10T10:00:00.000Z";
  const at = (seconds) => new Date(start).getTime() + seconds * 1000;

  it("runs mm:ss and the football minute", () => {
    const clock = computeClock(
      { period: MATCH_PERIOD.FIRST_HALF, periodStartedAt: start, settings },
      at(83),
      0,
    );
    expect(clock).toEqual({ minute: 2, display: "01:23", isRunning: true });
  });

  it("continues from the half length in the second half", () => {
    const clock = computeClock(
      { period: MATCH_PERIOD.SECOND_HALF, periodStartedAt: start, settings },
      at(5),
      0,
    );
    expect(clock.display).toBe("20:05");
    expect(clock.minute).toBe(21);
  });

  it("corrects for a device clock that is behind the server", () => {
    const clock = computeClock(
      { period: MATCH_PERIOD.FIRST_HALF, periodStartedAt: start, settings },
      at(0),
      90000,
    );
    expect(clock.display).toBe("01:30");
  });

  it("freezes in breaks", () => {
    expect(
      computeClock(
        { period: MATCH_PERIOD.HALF_TIME, periodStartedAt: start, settings },
        at(600),
        0,
      ),
    ).toEqual({
      minute: 20,
      display: "20:00",
      isRunning: false,
    });
    expect(periodBaseMinute(MATCH_PERIOD.EXTRA_SECOND_HALF, settings)).toBe(45);
  });
});

describe("EventTimeline", () => {
  const home = { id: "h", name: "Home", shortName: "HOM" };
  const away = { id: "a", name: "Away", shortName: "AWY" };

  it("shows period dividers, goals with assists and second-yellow reds", () => {
    renderWithRouter(
      <EventTimeline
        homeTeamId="h"
        events={[
          { id: "1", type: MATCH_EVENT_TYPE.PERIOD, period: MATCH_PERIOD.FIRST_HALF, minute: 0 },
          {
            id: "2",
            type: MATCH_EVENT_TYPE.GOAL,
            team: home,
            player: { fullName: "Akash" },
            assist: { fullName: "Bhushan" },
            minute: 7,
          },
          {
            id: "3",
            type: MATCH_EVENT_TYPE.RED_CARD,
            team: away,
            player: { fullName: "Chetan" },
            isSecondYellow: true,
            minute: 15,
          },
        ]}
      />,
    );
    expect(screen.getByText("1st half")).toBeInTheDocument();
    expect(screen.getByText(/assist Bhushan/)).toBeInTheDocument();
    expect(screen.getByText("Red card (second yellow)")).toBeInTheDocument();
    expect(screen.getByText("7'")).toBeInTheDocument();
  });

  it("says so when nothing has happened", () => {
    renderWithRouter(<EventTimeline homeTeamId="h" events={[]} />);
    expect(screen.getByText("No goals or cards yet.")).toBeInTheDocument();
  });
});

describe("StandingsTable and LeadersList", () => {
  it("renders rows, signed goal difference, form and qualifiers note", () => {
    render(
      <MemoryRouter>
        <StandingsTable
          title="Group A"
          qualifiers={1}
          rows={[
            {
              position: 1,
              team: { id: "t1", name: "Kings" },
              played: 2,
              won: 2,
              drawn: 0,
              lost: 0,
              goalsFor: 4,
              goalsAgainst: 1,
              goalDifference: 3,
              points: 6,
              form: ["W", "W"],
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Kings" })).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText(/top 1 go to the knockouts/)).toBeInTheDocument();
  });

  it("lists scorers and an empty assists column", () => {
    renderWithRouter(
      <LeadersList
        leaders={{
          scorers: [{ player: { id: "p1", fullName: "Akash" }, team: { name: "Kings" }, count: 3 }],
          assists: [],
        }}
      />,
    );
    expect(screen.getByText("Akash")).toBeInTheDocument();
    expect(screen.getByText("None yet.")).toBeInTheDocument();
  });
});
