import { Link } from "react-router-dom";
import logo from './tournament.png';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className='bg-white shadow-custom px-4 sm:px-8 md:px-20 py-4 sm:py-2 flex items-center justify-between relative'>
      {/* Logo */}
      <div>
        <img src={logo} className='hidden sm:block h-12 sm:h-16' alt="logo" />
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex space-x-4 items-center">
        <Link to="/" className="hover:text-green-700">Home</Link>
        <Link to="/committee" className="hover:text-green-700">Committee</Link>

        <Link to="/tournaments" className="hover:text-green-700">Tournaments</Link>
        <Link to="/matches" className="hover:text-green-700">Matches</Link>
        <Link to="/pointstable" className="hover:text-green-700">Points Table</Link>
        <Link to="/live" className="hover:text-green-700">Live Match</Link>
      </div>

      {/* Login Button */}
      <div className="hidden md:block">
        <button onClick={handleLogin} className="bg-green-700 text-white px-4 py-2 rounded">Login</button>
      </div>

      {/* Hamburger Icon */}
      <h2 className="md:hidden color-black">Football Tournament Manager</h2>
      <div className="md:hidden">
        
        <button onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 w-56 bg-white shadow-md py-4 z-10 md:hidden flex flex-col items-center space-y-4">
          <Link to="/" onClick={toggleMenu} className="hover:text-green-700">Home</Link>
          <Link to="/committee" onClick={toggleMenu} className="hover:text-green-700">Committee</Link>
          <Link to="/tournaments" onClick={toggleMenu} className="hover:text-green-700">Tournaments</Link>
          
          <Link to="/matches" onClick={toggleMenu} className="hover:text-green-700">Matches</Link>
          <Link to="/pointstable" onClick={toggleMenu} className="hover:text-green-700">Points Table</Link>
          <Link to="/live" onClick={toggleMenu} className="hover:text-green-700">Live Match</Link>
          <button onClick={() => { handleLogin(); toggleMenu(); }} className="bg-green-700 text-white px-4 py-2 rounded">
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
