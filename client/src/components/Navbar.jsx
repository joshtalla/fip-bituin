import { useContext, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { signOut } from "../services/authService";

const Navbar = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const params = new URLSearchParams(search);
  const isPromptBoardSearch =
    pathname === "/prompts" && params.get("showSearch") === "1";

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Unable to sign out:", error.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="navbar z-10">
      <div className="navbar-inner">
        <div className="logo">bituin.</div>
        <ul className="nav-links">
          <li>
            <NavLink
              to="/prompts"
              end
              className={({ isActive }) =>
                isActive && !isPromptBoardSearch ? "active" : undefined
              }
            >
              prompts
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/prompts?showSearch=1"
              className={() => (isPromptBoardSearch ? "active" : undefined)}
            >
              search
            </NavLink>
          </li>
          {user && (
            <li>
              <button
                type="button"
                className="nav-button"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "signing out..." : "logout"}
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
