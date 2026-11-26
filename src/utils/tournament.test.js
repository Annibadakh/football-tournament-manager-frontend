import { buildPath, ROUTES } from "@/constants/routes.constants";
import { formatCategories, formatDateRange, formatEntryFee } from "@/utils/tournament";
import { validateWithSchema } from "@/utils/form";
import { tournamentDetailsSchema } from "@/validations/tournament.schema";

const baseValues = {
  name: "Unity Cup",
  description: "",
  venue: null,
  venueDetails: "",
  contactPhone: "",
  tournamentFormat: null,
  gameFormatId: null,
  ageGroupId: null,
  genderCategoryId: null,
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  entryFee: "",
  minTeams: "",
  maxTeams: "",
  minSquadSize: "",
  maxSquadSize: "",
  pointsWin: "3",
  pointsDraw: "1",
  pointsLoss: "0",
  organizerId: null,
  city: { id: "c1" },
  isStreamingEnabled: false,
};

describe("tournament formatting", () => {
  it("formats fees, including free tournaments", () => {
    expect(formatEntryFee(null)).toBe("Fee to be announced");
    expect(formatEntryFee(0)).toBe("Free entry");
    expect(formatEntryFee(1500)).toBe("₹1,500.00");
  });

  it("formats date ranges and categories", () => {
    expect(formatDateRange(null)).toBe("Dates to be announced");
    expect(formatDateRange("2026-12-20", "2026-12-20")).toBe("20 Dec 2026");
    expect(formatDateRange("2026-12-20", "2026-12-27")).toBe("20 Dec 2026 – 27 Dec 2026");
    expect(
      formatCategories({ gameFormat: { name: "7-a-side" }, genderCategory: { name: "Men" } }),
    ).toBe("7-a-side · Men");
  });

  it("fills route params", () => {
    expect(buildPath(ROUTES.TOURNAMENT, { tournamentId: "unity-cup-abc123" })).toBe(
      "/tournaments/unity-cup-abc123",
    );
  });
});

describe("tournament details schema", () => {
  it("turns empty number inputs into null and parses numbers", () => {
    const result = validateWithSchema(tournamentDetailsSchema, {
      ...baseValues,
      entryFee: "0",
      maxTeams: "16",
    });
    expect(result.isValid).toBe(true);
    expect(result.data).toMatchObject({
      entryFee: 0,
      maxTeams: 16,
      minTeams: null,
      startDate: null,
      pointsWin: 3,
    });
  });

  it("checks cross-field rules", () => {
    const result = validateWithSchema(tournamentDetailsSchema, {
      ...baseValues,
      startDate: "2026-12-20",
      endDate: "2026-12-10",
      registrationDeadline: "2026-12-25",
      minTeams: "10",
      maxTeams: "4",
      pointsWin: "1",
      pointsDraw: "2",
    });
    expect(Object.keys(result.errors).sort()).toEqual([
      "endDate",
      "minTeams",
      "pointsWin",
      "registrationDeadline",
    ]);
  });
});
