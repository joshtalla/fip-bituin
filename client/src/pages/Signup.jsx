
import BackArrow from '../components/back-arrow.png'
import { NavLink } from 'react-router-dom';
import './pages-css/Signup.css'

const SignUp = () => {
    return(
        <>
            <div className="container-column">
                <div className="container-row-split">
                    <h2 className='top-sign-up'>Find your way home...</h2>
                    <li className="arrow-link">
                        <NavLink to="/" end>
                            <button className='arrow-back-button'>
                                <img className="back-arrow" src={BackArrow}/>
                            </button>
                        </NavLink>
                    </li>
                </div>
                <p className='instructions-sign-up'>fill out all fields below:</p>
                <div className="sign-up-container">
                    <div className="container-row-split">
                        <div className="container-quadrant">
                            <p className=''>email</p>
                            <input type="text" id="email" className="email-box" placeholder='input e-mail'/>
                        </div>
                        <div className="container-quadrant">
                            <p>password</p>
                            <input type="text" id="password" className="email-box" placeholder='input password'/>
                        </div>
                    </div>
                    <div className="container-row-split">
                        <div className="container-quadrant">
                            <p>your location</p>
                            <select value="location">
                                <option value="" disabled selected hidden>choose location</option>
                            </select>
                        </div>
                        <div className="container-quadrant">
                            <p>language preference</p>
                            <select value="location" placeholder="choose language">
                                <option value="" disabled selected hidden>choose language</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignUp;
