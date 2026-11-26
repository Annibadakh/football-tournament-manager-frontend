import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import AppToaster from "@/components/layout/AppToaster";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ThemeProvider from "@/context/ThemeProvider";
import AppRoutes from "@/routes/AppRoutes";
import store from "@/store";

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>
      <AppToaster />
    </ThemeProvider>
  </Provider>
);

export default App;
