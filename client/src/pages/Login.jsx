import "./Auth.css";
import bituinLogo from "../assets/bituin-logo.svg";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn } from "../services/authService";

// validation schema for login form using yup
// ensures valid email format and pw meets minimal length (8 characters)
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const navigate = useNavigate();

  // react-hook-form setup with Yup validatin
  const {
    register,             // connects inputs to form state
    handleSubmit,         // wraps submit handler with validation
    formState: { errors, isSubmitting }, // errors + loading state
    setError,             // used to manually set backend/auth errors
  } = useForm({
    resolver: yupResolver(schema),
  });

  // handles login submission
  // calls auth service and redirects to prompts on success
  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
      navigate("/prompts");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error.message || "Authentication failed",
      });
    }
  };

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

        {/* login form */}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>

          {/* email input */}
          <input
            type="email"
            placeholder="e-mail"
            className="auth-input"
            {...register("email")}
          />
          {errors.email && (
            <p className="auth-error">{errors.email.message}</p>
          )}

          {/* password input */}
          <input
            type="password"
            placeholder="password"
            className="auth-input"
            {...register("password")}
          />
          {errors.password && (
            <p className="auth-error">{errors.password.message}</p>
          )}

          {/* backend/auth error */}
          {errors.root && (
            <p className="auth-error">{errors.root.message}</p>
          )}

          <div className="auth-footer">
            <div className="auth-link">
              <span>new?</span>
              <Link to="/signup">sign up!</Link>
            </div>

            {/* submit button with loading state */}
            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "loading..." : "login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}