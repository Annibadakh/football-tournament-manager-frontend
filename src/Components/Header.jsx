import { Link } from "react-router-dom";
import logo from './tournament.png';
import { useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  }
  return (
  
    <nav className='flex justify-between gap-2 px-8 md:px-20 py-4 sm:py-1 items-center shadow-custom min-h-18 bg-white'>
    <div>
        <img src={logo} className='hidden sm:block h-16' alt="logo" />
    </div>
                
    <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/matches">Matches</Link>
        <Link to="/pointstable">Ponts Table</Link>
        <Link to="/live">Live Match</Link>
        
    </div>
                
    <div>
        <button onClick={handleLogin} className="bg-green-700 text-white px-4 py-2 rounded">Login</button>
    </div>
    </nav>
  );
};

export default Header;
