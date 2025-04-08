import { Outlet } from "react-router-dom";
import Header from "./Header"
import Footer from "./Footer";

const Main = () => {
    return(
        <div className="h-screen overflow-x-hidden">
        <Header />
        <Outlet />
        <Footer />
        </div>
    )
}

export default Main;