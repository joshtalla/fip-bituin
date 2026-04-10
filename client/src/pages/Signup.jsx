import { useState } from "react";
import "./Auth.css";

const locations = [
  "Australia",
  "Canada",
  "Philippines",
  "Saudi Arabia",
  "United States",
  "United Kingdom",
];

const languages = [
  "English",
  "French",
  "Ilocano",
  "Kapampangan",
  "Tagalog",
  "Waray",
];

export default function Signup() {
  const [locationOpen, setLocationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  return (
    <div className="auth-page">
      <div className="auth-noise"></div>

      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-heading-block">
            <h1 className="signup-title">find your way home...</h1>
            <p className="signup-subtext">fill out all fields below.</p>
          </div>

          <button className="signup-back" type="button" aria-label="Go back">
            <svg
              className="signup-back-icon"
              viewBox="0 0 58 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M27.83 39.0625L13.77 25L27.83 10.9375M15.72 25H44.23"
                stroke="#8C97BC"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="signup-card">
          <div className="signup-grid">
            <div className="signup-field">
              <label htmlFor="signup-email">e-mail</label>
              <input id="signup-email" type="email" placeholder="input e-mail" />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="input password"
              />
            </div>

            <div className="signup-field">
              <label>your location</label>

              <div className="custom-dropdown">
                <button
                  type="button"
                  className={`custom-dropdown-trigger ${locationOpen ? "open" : ""}`}
                  onClick={() => {
                    setLocationOpen(!locationOpen);
                    setLanguageOpen(false);
                  }}
                >
                  <span className={selectedLocation ? "selected" : "placeholder"}>
                    {selectedLocation || "choose location"}
                  </span>
                  <span className="custom-dropdown-arrow">
                    {locationOpen ? "⌃" : "⌄"}
                  </span>
                </button>

                {locationOpen && (
                  <div className="custom-dropdown-menu">
                    {locations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        className="custom-dropdown-option"
                        onClick={() => {
                          setSelectedLocation(location);
                          setLocationOpen(false);
                        }}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="signup-field">
              <label>language preference</label>

              <div className="custom-dropdown">
                <button
                  type="button"
                  className={`custom-dropdown-trigger ${languageOpen ? "open" : ""}`}
                  onClick={() => {
                    setLanguageOpen(!languageOpen);
                    setLocationOpen(false);
                  }}
                >
                  <span className={selectedLanguage ? "selected" : "placeholder"}>
                    {selectedLanguage || "choose language"}
                  </span>
                  <span className="custom-dropdown-arrow">
                    {languageOpen ? "⌃" : "⌄"}
                  </span>
                </button>

                {languageOpen && (
                  <div className="custom-dropdown-menu">
                    {languages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        className="custom-dropdown-option"
                        onClick={() => {
                          setSelectedLanguage(language);
                          setLanguageOpen(false);
                        }}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="signup-footer">
          <button className="auth-button signup-continue-button" type="button">
            continue
          </button>
        </div>
      </div>
    </div>
  );
}