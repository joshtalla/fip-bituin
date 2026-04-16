
import { NavLink } from 'react-router-dom';
import './pages-css/MainMenu.css';
import menuStars from '../components/bitluin-menu-stars.png';

const MainMenu = () => {
    return(
    <div className='container'>
        <p className='menu-top-text'>anonymously bringing filipinos together!</p>
        <div className="logo-menu">
            bitluin.<img className="menuStars" src={menuStars} alt="two-stars"/>
        </div>
        <input type="text" id="email" className="email-box" placeholder='e-mail'/>
        <input type="text" id="password" className="password-box" placeholder='password'/>
        <div className="container-row-split">
            <p className='row-split-left'>
                new?<br />
                <li className='sign-up-text'>
                    <NavLink to="/sign-up" end>sign up!</NavLink>
                </li>
            </p>
            <button className="log-in-button">login</button>
        </div>
    </div>);
}

export default MainMenu;
