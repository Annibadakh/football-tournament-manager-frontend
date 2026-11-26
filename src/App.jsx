import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import AppToaster from "@/components/layout/AppToaster";
import SessionBootstrap from "@/components/layout/SessionBootstrap";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ThemeProvider from "@/context/ThemeProvider";
import AppRoutes from "@/routes/AppRoutes";
import store from "@/store";
// Registers the token refresh handlers on the API client
import "@/services/session";

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <ErrorBoundary>
        <SessionBootstrap>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SessionBootstrap>
      </ErrorBoundary>
      <AppToaster />
    </ThemeProvider>
  </Provider>
);

export default App;
