import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import logo from "./tournament.png";

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className='flex justify-between gap-2 px-8 md:px-20 py-4 sm:py-1 items-center shadow-custom min-h-18 bg-white'>
            <div>
                {<img src={logo} className='hidden sm:block h-16' alt="logo" />}
                {/* <h2>LOGO</h2> */}
            </div>
            
            <div>
                <h1 className='text-lg sm:text-2xl font-bold'>Tournament Manager</h1>
            </div>
            
            <div>
{/*             <button onClick={() => navigate('/')} className="bg-blue-500 text-white px-4 py-2 mx-2 rounded">Main</button> */}
                
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
        </nav>
    );
};

export default Header;
