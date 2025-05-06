import { useAuth } from "../Context/AuthContext"
import PaymentPage from "./PaymentPage";

const Home = () => {
    const {user} = useAuth();
    return (
        <>Home
        {user.role == "admin" && <PaymentPage />}
        </>
        
    )
}

export default Home;