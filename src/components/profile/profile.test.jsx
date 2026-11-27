import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AwardsList from "@/components/profile/AwardsList";
import PlayerLink from "@/components/profile/PlayerLink";
import ShareButton from "@/components/ui/ShareButton";
import { AWARD_TYPE, awardLabel } from "@/constants/award.constants";

const withRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("PlayerLink", () => {
  it("links verified players and leaves guests as text", () => {
    withRouter(
      <>
        <PlayerLink player={{ id: "p1", fullName: "Aarav", isVerified: true }} />
        <PlayerLink player={{ id: "p2", fullName: "Guest Gopal", isVerified: false }} />
      </>,
    );
    expect(screen.getByRole("link", { name: "Aarav" })).toHaveAttribute("href", "/players/p1");
    expect(screen.queryByRole("link", { name: "Guest Gopal" })).not.toBeInTheDocument();
    expect(screen.getByText("Guest Gopal")).toBeInTheDocument();
  });
});

describe("awards", () => {
  it("labels values with units", () => {
    expect(awardLabel({ type: AWARD_TYPE.GOLDEN_BOOT, title: "Golden Boot", value: 7 })).toBe(
      "Golden Boot · 7 goals",
    );
    expect(awardLabel({ type: AWARD_TYPE.CHAMPION, title: "Champion", value: null })).toBe(
      "Champion",
    );
  });

  it("shows the winner, or the tournament on profiles", () => {
    const awards = [
      {
        id: "a1",
        type: AWARD_TYPE.CHAMPION,
        title: "Champion",
        team: { id: "t1", name: "Kings" },
        player: null,
        tournament: { slug: "cup", name: "Godavari Cup" },
      },
      {
        id: "a2",
        type: AWARD_TYPE.GOLDEN_BOOT,
        title: "Golden Boot",
        value: 5,
        team: { id: "t1", name: "Kings" },
        player: { id: "p1", fullName: "Aarav", isVerified: true },
        tournament: { slug: "cup", name: "Godavari Cup" },
      },
    ];
    const { unmount } = withRouter(<AwardsList awards={awards} />);
    expect(screen.getByRole("link", { name: "Kings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aarav" })).toBeInTheDocument();
    expect(screen.getByText("Golden Boot · 5 goals")).toBeInTheDocument();
    unmount();
    withRouter(<AwardsList awards={awards} show="tournament" />);
    expect(screen.getAllByRole("link", { name: "Godavari Cup" })).toHaveLength(2);
  });
});

describe("ShareButton", () => {
  afterEach(() => {
    delete navigator.share;
  });

  it("uses the native share sheet when available", async () => {
    navigator.share = vi.fn().mockResolvedValue();
    render(<ShareButton title="Godavari Cup" url="https://maidaanapp.live/tournaments/cup" />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    await waitFor(() =>
      expect(navigator.share).toHaveBeenCalledWith({
        title: "Godavari Cup",
        text: "Godavari Cup",
        url: "https://maidaanapp.live/tournaments/cup",
      }),
    );
  });

  it("offers WhatsApp and copy link otherwise", () => {
    render(<ShareButton title="Godavari Cup" url="https://maidaanapp.live/t/cup" />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(screen.getByRole("menuitem", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      `https://wa.me/?text=${encodeURIComponent("Godavari Cup\nhttps://maidaanapp.live/t/cup")}`,
    );
    expect(screen.getByRole("menuitem", { name: /Copy link/ })).toBeInTheDocument();
  });
});
