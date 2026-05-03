import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUp } from "../services/authService";
import "./Auth.css";

// static dropdown options for form
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


// validation schema for signup form
// ensures all fields are filled and valid for submission
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  location: yup.string().required("Location is required"),
  language: yup.string().required("Language preference is required"),
});

export default function Signup() {
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // react-hook-form setup with Yup validation
  const {
    register,               // connects inputs to form state
    handleSubmit,           // wraps submit handler with validation
    setValue,               // manually updates form values (used in dropdowns)
    watch,                  // watches values (used to display selected dropdown option)
    setError,               // manually sets backend/auth errors
    formState: { errors, isSubmitting },      // validation + loading state
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      location: "",
      language: "",
    },
  });

  // watch selected dropdown values for display
  const selectedLocation = watch("location");
  const selectedLanguage = watch("language");

  // handles signup submission
  // calls auth service and redirects on success
  const onSubmit = async (data) => {
    try {
      await signUp(data.email, data.password);
      navigate("/prompts");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error.message || "Signup failed",
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-noise"></div>

      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-heading-block">
            <h1 className="signup-title">find your way home...</h1>
            <p className="signup-subtext">fill out all fields below.</p>
          </div>

          {/* back button to go back to login page */}
          <button
            className="signup-back"
            type="button"
            aria-label="Go back"
            onClick={() => navigate("/login")}
          >
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

        {/* signup form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="signup-card">
            <div className="signup-grid">

              {/* email input */}
              <div className="signup-field">
                <label htmlFor="signup-email">e-mail</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="input e-mail"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="auth-error">{errors.email.message}</p>
                )}
              </div>

              {/* password input */}
              <div className="signup-field">
                <label htmlFor="signup-password">password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="input password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="auth-error">{errors.password.message}</p>
                )}
              </div>

              {/* location dropdown */}
              <div className="signup-field">
                <label>your location</label>
                <input type="hidden" {...register("location")} />

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
                            setValue("location", location, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setLocationOpen(false);
                          }}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {errors.location && (
                  <p className="auth-error">{errors.location.message}</p>
                )}
              </div>

              {/* language dropdown */}
              <div className="signup-field">
                <label>language preference</label>
                <input type="hidden" {...register("language")} />

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
                            setValue("language", language, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setLanguageOpen(false);
                          }}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {errors.language && (
                  <p className="auth-error">{errors.language.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* backend/auth error display */}
          {errors.root && (
            <p className="auth-error">{errors.root.message}</p>
          )}

          {/* submit button */}
          <div className="signup-footer">
            <button
              className="auth-button signup-continue-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "loading..." : "continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
