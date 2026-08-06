import { useState } from "react";
import "./Auth.css";

function Auth() {

  const [isRegister, setIsRegister] = useState(false);

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // LOGIN DATA
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // REGISTER DATA
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CUSTOMER"
  });


  // =========================
  // LOGIN INPUT
  // =========================

  const handleLoginChange = (e) => {

    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });

  };


  // =========================
  // REGISTER INPUT
  // =========================

  const handleRegisterChange = (e) => {

    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });

  };


  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {

    e.preventDefault();

    console.log("Login Data:", loginData);

    // Backend:
    // http://localhost:8080/auth/login

    try {

      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(loginData)
        }
      );

      const data = await response.json();

      console.log("Login Response:", data);

      if (!response.ok) {

        alert("Login failed!");

        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      alert("Login successful!");

      console.log("JWT Token:", data.token);

    } catch (error) {

      console.error("Login Error:", error);

      alert(
        "Cannot connect to the backend."
      );

    }

  };


  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {

    e.preventDefault();

    console.log("Register Data:", registerData);

    // Backend:
    // http://localhost:8080/auth/register

    try {

      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(registerData)
        }
      );

      const data = await response.json();

      console.log("Register Response:", data);

      if (!response.ok) {

        alert(
          data.message ||
          "Registration failed!"
        );

        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      alert("Registration successful!");

      console.log(
        "Registered User:",
        registerData
      );

      console.log(
        "JWT Token:",
        data.token
      );

      // Go to login after successful registration
      setIsRegister(false);

      // Clear registration form
      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        role: "CUSTOMER"
      });

    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );

      alert(
        "Cannot connect to the backend."
      );

    }

  };


  return (

    <div className="app">

      <div
        className={`auth-container ${
          isRegister ? "register-mode" : ""
        }`}
      >

        {/* ============================= */}
        {/* LOGIN FORM */}
        {/* ============================= */}

        <div className="form-container login-form">

          <div className="form-content">

            <div className="brand">
              🛒 <span>ShopStack</span>
            </div>

            <h1>Welcome Back!</h1>

            <p className="subtitle">
              Login to continue shopping with us.
            </p>


            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="input-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <label>Password</label>

                <div className="password-wrapper">

                  <input
                    type={
                      showLoginPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowLoginPassword(
                        !showLoginPassword
                      )
                    }
                    aria-label={
                      showLoginPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showLoginPassword
                      ? "🙈"
                      : "👁️"}

                  </button>

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="main-button"
              >
                Login
              </button>

            </form>


            <p className="switch-text">

              Don't have an account?

              <button
                type="button"
                className="switch-button"
                onClick={() =>
                  setIsRegister(true)
                }
              >
                Register
              </button>

            </p>

          </div>

        </div>


        {/* ============================= */}
        {/* REGISTER FORM */}
        {/* ============================= */}

        <div className="form-container register-form">

          <div className="form-content">

            <div className="brand">
              🛒 <span>ShopStack</span>
            </div>

            <h1>Create Account</h1>

            <p className="subtitle">
              Join ShopStack and start shopping today.
            </p>


            <form onSubmit={handleRegister}>

              {/* FULL NAME */}

              <div className="input-group">

                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="input-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <label>Password</label>

                <div className="password-wrapper">

                  <input
                    type={
                      showRegisterPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowRegisterPassword(
                        !showRegisterPassword
                      )
                    }
                    aria-label={
                      showRegisterPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showRegisterPassword
                      ? "🙈"
                      : "👁️"}

                  </button>

                </div>

              </div>


              {/* ============================= */}
              {/* ROLE */}
              {/* ============================= */}

              <div className="input-group">

                <label>Register As</label>

                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  required
                >

                  <option value="CUSTOMER">
                    Customer
                  </option>

                  <option value="VENDOR">
                    Vendor
                  </option>

                </select>

              </div>


              {/* REGISTER BUTTON */}

              <button
                type="submit"
                className="main-button"
              >
                Register
              </button>

            </form>


            <p className="switch-text">

              Already have an account?

              <button
                type="button"
                className="switch-button"
                onClick={() =>
                  setIsRegister(false)
                }
              >
                Login
              </button>

            </p>

          </div>

        </div>


        {/* ============================= */}
        {/* SLIDING PANEL */}
        {/* ============================= */}

        <div className="slider-panel">

          <div className="slider-content">

            {/* LOGIN MODE */}

            {!isRegister && (

              <>

                <div className="slider-icon">
                  🛍️
                </div>

                <h2>New Here?</h2>

                <p>
                  Create your account and discover
                  amazing products at ShopStack.
                </p>

                <button
                  className="outline-button"
                  onClick={() =>
                    setIsRegister(true)
                  }
                >
                  Create Account
                </button>

              </>

            )}


            {/* REGISTER MODE */}

            {isRegister && (

              <>

                <div className="slider-icon">
                  👋
                </div>

                <h2>Already a Member?</h2>

                <p>
                  Welcome back! Login to continue
                  your shopping journey.
                </p>

                <button
                  className="outline-button"
                  onClick={() =>
                    setIsRegister(false)
                  }
                >
                  Login
                </button>

              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}

export default Auth;