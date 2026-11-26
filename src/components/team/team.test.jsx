import { render, screen } from "@testing-library/react";
import SquadList from "@/components/team/SquadList";
import { EMPTY_PERSON, MEMBER_STATUS, PERSON_MODE } from "@/constants/team.constants";
import { validateWithSchema } from "@/utils/form";
import { invitePlayerSchema, teamRequestSchema, toPersonPayload } from "@/validations/team.schema";

describe("team schemas", () => {
  it("turns a verified pick or a guest into the API person shape", () => {
    expect(toPersonPayload({ mode: PERSON_MODE.VERIFIED, player: { id: "p1" } })).toEqual({
      userId: "p1",
    });
    expect(
      toPersonPayload({ mode: PERSON_MODE.GUEST, fullName: "Guest", email: "g@x.com" }),
    ).toEqual({ fullName: "Guest", email: "g@x.com" });
  });

  it("reports nested person errors with dotted keys", () => {
    const result = validateWithSchema(invitePlayerSchema, {
      person: { ...EMPTY_PERSON, mode: PERSON_MODE.GUEST, fullName: "", email: "bad" },
      positionId: 4,
      jerseyNumber: "7",
    });
    expect(Object.keys(result.errors).sort()).toEqual(["person.email", "person.fullName"]);
  });

  it("uppercases short names and parses jersey numbers", () => {
    const result = validateWithSchema(teamRequestSchema, {
      name: "Kopargaon FC",
      shortName: "kfc",
      jerseyNumber: "9",
      positionId: 4,
    });
    expect(result.data).toMatchObject({ shortName: "KFC", jerseyNumber: 9 });
    expect(
      validateWithSchema(teamRequestSchema, {
        name: "Kopargaon FC",
        shortName: "KFC",
        jerseyNumber: "100",
        positionId: 4,
      }).errors.jerseyNumber,
    ).toBe("Jersey must be 1–99");
  });
});

describe("SquadList", () => {
  it("shows captain, guest and pending badges", () => {
    render(
      <SquadList
        members={[
          {
            id: "m1",
            jerseyNumber: 10,
            isCaptain: true,
            status: MEMBER_STATUS.ACTIVE,
            position: { name: "Midfielder" },
            player: { fullName: "Pratik Two", isVerified: true },
          },
          {
            id: "m2",
            jerseyNumber: 11,
            isCaptain: false,
            status: MEMBER_STATUS.INVITED,
            position: { name: "Forward" },
            player: { fullName: "Guest Player", isVerified: false },
          },
        ]}
      />,
    );
    expect(screen.getByText("Captain")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();
    expect(screen.getByText("Invite pending")).toBeInTheDocument();
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
  });
});
