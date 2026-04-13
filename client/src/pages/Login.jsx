import "./Auth.css";
import bituinLogo from "../assets/bituin-logo.svg";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-noise"></div>

      <div className="login-content">
        <div className="auth-brand">
          <img
            src={bituinLogo}
            alt="bituin logo"
            className="auth-logo-image"
          />
        </div>

        <div className="auth-form">
          <input
            type="email"
            placeholder="e-mail"
            className="auth-input"
          />

          <input
            type="password"
            placeholder="password"
            className="auth-input"
          />

          <div className="auth-footer">
            <div className="auth-link">
              <span>new?</span>
              <Link to="/signup">sign up!</Link>
            </div>

            <button className="auth-button">login</button>
          </div>
        </div>
      </div>
    </div>
  );
}