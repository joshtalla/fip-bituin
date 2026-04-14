import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">bitluin.</div>
            <ul className="nav-links">
                <li><NavLink to="/profile" end>profile</NavLink></li>
                <li><NavLink to="/explore" end>explore</NavLink></li>
                <li><NavLink to="/search" end>search</NavLink></li>
            </ul>
        </nav>
    )
}

export default Navbar;
