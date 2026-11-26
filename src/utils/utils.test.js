import { z } from "zod";
import { apiErrorsToFieldErrors, validateWithSchema } from "@/utils/form";
import { formatCurrency, formatNumber } from "@/utils/number";
import { formatDate, getAge } from "@/utils/date";
import { getPageNumbers } from "@/utils/pagination";

describe("form utils", () => {
  const schema = z.object({ teamName: z.string().min(2, "Team name is required") });

  it("returns field errors from a zod schema", () => {
    expect(validateWithSchema(schema, { teamName: "" })).toEqual({
      isValid: false,
      data: null,
      errors: { teamName: "Team name is required" },
    });
  });

  it("maps backend errors to a field map", () => {
    expect(apiErrorsToFieldErrors([{ field: "email", message: "Already used" }])).toEqual({
      email: "Already used",
    });
  });
});

describe("number and date utils", () => {
  it("formats numbers the Indian way", () => {
    expect(formatNumber(1250000)).toBe("12,50,000");
    expect(formatCurrency(1500)).toBe("₹1,500.00");
  });

  it("formats dates and handles bad input", () => {
    expect(formatDate("2026-11-26T10:30:00.000Z", "yyyy-MM-dd")).toBe("2026-11-26");
    expect(formatDate("not-a-date")).toBe("");
    expect(getAge("2000-05-10", new Date("2026-11-26"))).toBe(26);
  });
});

describe("getPageNumbers", () => {
  it("collapses distant pages into ellipses", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
  });
});
