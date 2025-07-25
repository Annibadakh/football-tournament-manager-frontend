import { useAuth } from "../Context/AuthContext"
import PaymentPage from "./PaymentPage";

const Home = () => {
    const {user} = useAuth();
    return (
        <>
        {user.role == "admin" ? <PaymentPage /> : <h2>Home</h2>}
        </>
        
    )
}

export default Home;