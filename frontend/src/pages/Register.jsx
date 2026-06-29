import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState("passenger");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length !== 8) {
      alert("Password must be exactly 8 characters. Use letters, numbers, or both.");
      return;
    }

    try {
      const userData = {
        name,
        email,
        phone,
        password,
        role
      };

      if (role === "driver") {
        userData.licenseNumber = licenseNumber;
        userData.carNumber = carNumber;
        userData.carModel = carModel;
      }

      const data = await registerUser(userData);

      alert(data.message || "Account created successfully");
      console.log(data);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("passenger");
      setLicenseNumber("");
      setCarNumber("");
      setCarModel("");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Register failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h1>Join FairRide</h1>

          <p>
            Create your account and start using the smart airport taxi system.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleRegister} autoComplete="off">
          <h2>Register</h2>

          <input className="hidden-autofill-field" type="text" autoComplete="username" />
          <input className="hidden-autofill-field" type="password" autoComplete="new-password" />

          <select
            className="auth-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="passenger">Passenger</option>
            <option value="driver">Driver</option>
          </select>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            name="fairride-register-email"
            placeholder="Enter gmail"
            value={email}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="fairride-register-password"
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

          {role === "driver" && (
            <>
              <input
                type="text"
                placeholder="License Number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />

              <input
                type="text"
                placeholder="Car Number"
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
              />

              <input
                type="text"
                placeholder="Car Model"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
            </>
          )}

          <button type="submit">
            Create Account
          </button>

          <p className="auth-text">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
