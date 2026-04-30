import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function ProtectedRoute({ requireAuth = true, redirectTo, children }) {
	const { user, loading } = useContext(AuthContext);
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center text-center font-poppins text-xl text-[#FFFCEF]">
				Loading...
			</div>
		);
	}

	if (requireAuth && !user) {
		return <Navigate to={redirectTo || "/login"} replace state={{ from: location }} />;
	}

	if (!requireAuth && user) {
		return <Navigate to={redirectTo || "/prompts"} replace />;
	}

	return children || <Outlet />;
}
