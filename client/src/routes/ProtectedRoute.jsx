import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    // 🚧 DEV MODE BYPASS 🚧
    // Temporarily ignore authentication so we can test the UI!
    return children;

    /* --- COMMENTED OUT REAL AUTH LOGIC FOR NOW ---
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
    --------------------------------------------- */
};

export default ProtectedRoute;