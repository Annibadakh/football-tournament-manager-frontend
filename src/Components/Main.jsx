import { Outlet } from "react-router-dom";
import Header from "./Header"

const Main = () => {
    return(
        <div className="h-screen overflow-x-hidden">
        <Header />
        <Outlet />
        </div>
    )
}

export default Main;