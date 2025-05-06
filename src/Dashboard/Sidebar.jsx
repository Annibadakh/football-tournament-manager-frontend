import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, clickSidebar, userRole }) => {
    const location = useLocation(); 
    const links = [
        { path: "addtournament", label: "Add Tournament", role: "admin"},
        { path: "addteam", label: "Add Team", role: "admin"},
        { path: "addplayers", label: "Add Players", role: "captain"},
        { path: "addmatches", label: "Add Matches", role: "admin"},
        { path: "scorer", label: "Match", role: "scorer"},
        { path: "superadmin", label: "Add Admin", role: "superadmin"},
    ];

  const isActive = (path) => location.pathname === path;
    return(
        <>
        
        <aside className={`absolute z-50 top-0 bottom-0 left-0 sm:relative bg-primary text-white transition-all duration-200 
        ${isSidebarOpen ? "w-56 p-4" : "w-0 overflow-hidden"}`}>
            <nav className={`${isSidebarOpen ? "block" : "hidden"}`}>
                <ul>
                    {links.map(({ path, label, role }) => {
                        if (role && role !== userRole.role) return null;
                        return (
                            <li
                                key={path}
                                onClick={clickSidebar}
                                className={`py-2 px-4 mb-1 rounded-full ${isActive(`/dashboard/${path}`) ? "bg-secondary" : "hover:bg-secondary"}`}
                            >
                                <Link to={path}>{label}</Link>
                            </li>
                        );
                    })}
                </ul>
            </nav> 
        </aside>
        
        </>
    )
};

export default Sidebar;