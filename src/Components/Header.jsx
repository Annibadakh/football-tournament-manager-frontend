import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/live">Live Match</Link>
      </div>
      <Link to="/login" className="text-yellow-400">Login</Link>
    </nav>
  );
};

export default Header;
