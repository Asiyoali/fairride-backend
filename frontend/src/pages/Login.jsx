/* React Router Navigation */
import { useNavigate } from "react-router-dom";

/* React Hooks */
import { useState } from "react";

/* React Router Link */
import { Link } from "react-router-dom";

/* Backend Login Service */
import { loginUser } from "../services/authService";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8));
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    if (password.length !== 8) {
      alert("Password must be exactly 8 characters.");
      return;
    }

    try {

      const data = await loginUser({
        email,
        password
      });

      /* Save Token */
      localStorage.setItem("token", data.token);

      /* Save User Information */
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login successful");

      console.log(data);

      setEmail("");
      setPassword("");

      /* Role Based Redirect */
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      }
      else if (data.user.role === "driver") {
        navigate("/driver-dashboard");
      }
      else {
        navigate("/dashboard");
      }

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-left">

          <h1>Welcome Back</h1>

          <p>
            Login to FairRide and continue managing smart airport taxi requests.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleLogin}
          autoComplete="off"
        >

          <h2>Login</h2>

          <input className="hidden-autofill-field" type="text" autoComplete="username" />
          <input className="hidden-autofill-field" type="password" autoComplete="current-password" />

          <input
            type="email"
            name="fairride-login-email"
            placeholder="Enter gmail"
            value={email}
            autoComplete="off"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="fairride-login-password"
              placeholder="Enter password"
              value={password}
              maxLength={8}
              autoComplete="new-password"
              onChange={handlePasswordChange}
            />

            <button
              type="button"
              className={`password-toggle ${showPassword ? "is-visible" : ""}`}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <line x1="4" y1="20" x2="20" y2="4" />}
              </svg>
            </button>
          </div>

          <button type="submit">
            Login
          </button>

          <p className="auth-text">
            Don’t have an account?
            <Link to="/register">
              {" "}Register
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;
