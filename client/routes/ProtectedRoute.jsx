import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    // Get the logged-in user's profile and loading state from the AuthContext.
    const { user, loading } = useContext(AuthContext);

    // If the user is still loading, return null which can be used by the parent
    //  component to show a loading screen.
    if (loading) {
        return null;
    }

    // If it isnt loading but there's no user, it means the user is not logged in. 
    // Therefore redirect to the login page.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If it isn't loading and there is a user, it means the user is logged in. 
    // Return 'children' which can be used to know that it is ok to display 
    // the pages that a logged-in user should see.
    return children;
};

export default ProtectedRoute;