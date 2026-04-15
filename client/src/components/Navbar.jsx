import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const isPromptBoardSearch =
    pathname === "/prompts" && params.get("showSearch") === "1";

  return (
    <nav className="navbar z-10">
      <div className="logo">bitluin.</div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end>
            profile
          </NavLink>
        </li>
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
          <NavLink to="/explore" end>
            explore
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
      </ul>
    </nav>
  );
};

export default Navbar;
