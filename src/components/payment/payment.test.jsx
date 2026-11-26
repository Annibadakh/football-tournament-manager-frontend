import { render, screen } from "@testing-library/react";
import PaymentCard from "@/components/payment/PaymentCard";
import {
  OFFLINE_PAYMENT_MODE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  paymentMethodLabel,
} from "@/constants/payment.constants";
import { TEAM_STATUS } from "@/constants/team.constants";
import * as paymentService from "@/services/payment.service";
import { validateWithSchema } from "@/utils/form";
import { offlinePaymentSchema } from "@/validations/payment.schema";

vi.mock("@/services/payment.service", () => ({
  getTeamPayments: vi.fn(),
  createPaymentOrder: vi.fn(),
  verifyPayment: vi.fn(),
  recordPaymentFailure: vi.fn(),
  viewReceipt: vi.fn(),
  downloadReceipt: vi.fn(),
}));

const CHARGES = { entryFee: 1500, convenienceFee: 36, total: 1536, convenienceFeePercent: 2.36 };
const PAID = {
  id: "pay-1",
  method: PAYMENT_METHOD.OFFLINE,
  offlineMode: OFFLINE_PAYMENT_MODE.UPI,
  status: PAYMENT_STATUS.PAID,
  amount: 1500,
  receiptNumber: "MDN-2027-000007",
  reference: "UTR 4455",
  paidAt: "2027-03-01T10:00:00Z",
};

const renderCard = (props, data) => {
  paymentService.getTeamPayments.mockResolvedValue({ ok: true, data });
  return render(
    <PaymentCard
      team={{ id: "team-1", status: TEAM_STATUS.AWAITING_PAYMENT }}
      isCaptain={false}
      isManager={false}
      onTeamChanged={() => {}}
      onRecordOffline={() => {}}
      {...props}
    />,
  );
};

describe("offline payment schema", () => {
  it("parses the amount and requires a mode", () => {
    const result = validateWithSchema(offlinePaymentSchema, {
      amount: "1500",
      mode: null,
      reference: "",
    });
    expect(result.errors.mode).toBe("Choose how the team paid");
    const ok = validateWithSchema(offlinePaymentSchema, {
      amount: "1500.50",
      mode: OFFLINE_PAYMENT_MODE.CASH,
      reference: "  ",
    });
    expect(ok.data).toEqual({ amount: 1500.5, mode: OFFLINE_PAYMENT_MODE.CASH });
  });

  it("rejects sub-paise amounts", () => {
    expect(
      validateWithSchema(offlinePaymentSchema, { amount: "10.005", mode: 1 }).errors.amount,
    ).toBe("Use at most 2 decimals");
  });
});

describe("payment labels", () => {
  it("names online and offline methods", () => {
    expect(paymentMethodLabel({ method: PAYMENT_METHOD.ONLINE })).toBe("Online · Razorpay");
    expect(paymentMethodLabel(PAID)).toBe("Offline · UPI");
  });
});

describe("PaymentCard", () => {
  it("shows the captain the fee breakdown and a pay button", async () => {
    renderCard(
      { isCaptain: true },
      {
        charges: CHARGES,
        isOnlineEnabled: true,
        canPayOnline: true,
        lastFailureReason: "UPI request expired",
        payments: [],
      },
    );
    expect(await screen.findByRole("button", { name: /Pay ₹1,536/ })).toBeInTheDocument();
    expect(screen.getByText("Convenience fee (2.36%)")).toBeInTheDocument();
    expect(screen.getByText(/Last attempt failed: UPI request expired/)).toBeInTheDocument();
  });

  it("tells the captain to pay offline when online payment is off", async () => {
    renderCard(
      { isCaptain: true },
      { charges: CHARGES, isOnlineEnabled: false, canPayOnline: false, payments: [] },
    );
    expect(await screen.findByText(/Online payment isn't available yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pay/ })).not.toBeInTheDocument();
  });

  it("lets the organizer record an offline payment, without the convenience fee", async () => {
    renderCard(
      { isManager: true },
      { charges: CHARGES, isOnlineEnabled: true, canPayOnline: false, payments: [] },
    );
    expect(
      await screen.findByRole("button", { name: /Record offline payment/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Convenience fee/)).not.toBeInTheDocument();
  });

  it("lists receipts with view and download", async () => {
    renderCard(
      { isCaptain: true, team: { id: "team-1", status: TEAM_STATUS.CONFIRMED } },
      { charges: CHARGES, isOnlineEnabled: true, canPayOnline: false, payments: [PAID] },
    );
    expect(await screen.findByText(/MDN-2027-000007/)).toBeInTheDocument();
    expect(screen.getByText(/Offline · UPI/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "View receipt MDN-2027-000007" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download receipt MDN-2027-000007" }),
    ).toBeInTheDocument();
  });

  it("renders nothing for a confirmed team with no payments", async () => {
    const { container } = renderCard(
      { isCaptain: true, team: { id: "team-1", status: TEAM_STATUS.CONFIRMED } },
      { charges: null, payments: [] },
    );
    await vi.waitFor(() => expect(paymentService.getTeamPayments).toHaveBeenCalled());
    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
