import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RoleRoute from "@/routes/RoleRoute";
import { createAppStore } from "@/store";
import { SESSION_STATUS } from "@/store/slices/authSlice";
import { ACCOUNT_ROLE, ACCOUNT_STATUS } from "@/constants/user.constants";

const renderAt = (authState, element = <RoleRoute />) => {
  const store = createAppStore({
    auth: { accessToken: "t", status: SESSION_STATUS.READY, ...authState },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={element}>
            <Route path="/dashboard" element={<p>Dashboard</p>} />
          </Route>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/verify" element={<p>Verify page</p>} />
          <Route path="/unauthorized" element={<p>Unauthorized page</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const member = { accountRole: ACCOUNT_ROLE.MEMBER, accountStatus: ACCOUNT_STATUS.VERIFIED };

describe("RoleRoute", () => {
  it("waits while the session is being restored", () => {
    renderAt({ user: null, status: SESSION_STATUS.CHECKING });
    expect(screen.getByText("Checking your session...")).toBeInTheDocument();
  });

  it("sends logged-out users to login", () => {
    renderAt({ user: null });
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("sends unverified users to verification", () => {
    renderAt({ user: { ...member, accountStatus: ACCOUNT_STATUS.PENDING_VERIFICATION } });
    expect(screen.getByText("Verify page")).toBeInTheDocument();
  });

  it("blocks roles that aren't allowed", () => {
    renderAt({ user: member }, <RoleRoute allowedRoles={[ACCOUNT_ROLE.ADMIN]} />);
    expect(screen.getByText("Unauthorized page")).toBeInTheDocument();
  });

  it("renders the page for an allowed, verified user", () => {
    renderAt({ user: member });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
