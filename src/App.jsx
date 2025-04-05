import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { ProtectedRoute, ProtectedRoleBasedRoute } from './ProtectedRoute';
import Main from './Components/Main';
import Login from "./Components/Login";
import Dashboard from "./Dashboard/Dashboard";
import Settings from "./Dashboard/Settings";
import Home from "./Dashboard/Home";
import AddTournament from "./Dashboard/AddTournament";
import TeamForm from "./Dashboard/TeamForm";
import CaptainPlayers from "./Dashboard/CaptainPlayers";

function App() {
  return (
    <div className="font-custom">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="settings" element={<Settings />} />
              <Route path="addtournament" element={<AddTournament />} />
              <Route path="addteam" element={<TeamForm />} />
              <Route path="addplayers" element={<CaptainPlayers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
