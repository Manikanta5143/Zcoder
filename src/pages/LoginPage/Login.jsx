import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";
import { useLogin } from '../../hooks/useLogin';
import styles from './Login.module.css';

const Login = () => {

  const {
  login,
  error,
  loading,
  unverified,
  resendVerification,
  resendLoading,
} = useLogin();

  const [user1, setUser] = useState({
    username: "",
    password: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user1,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(user1);
  };
  if (resendLoading) {
  return (
    <div className={styles.loaderContainer}>

      <div className={styles.logoWrapper}>

        <div className={styles.ring}></div>

        <img
          src="/letter-z.svg"
          alt="ZCoder"
          className={styles.logo}
        />

      </div>

      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h2>Sending Verification Email</h2>

      <p>Please wait while we send your verification link...</p>

    </div>
  );
}

  return (
    <section className={styles.sectionForm}>
      <div className={styles.wrapper}>

        <h1>LOGIN</h1>

        {error && (
    <div className={styles.errorBox}>
        {error}
    </div>
)}

{unverified && (
  <button
    className={styles.resendButton}
    onClick={resendVerification}
    disabled={resendLoading}
  >
    {resendLoading ? (
      <>
        <span className={styles.spinner}></span>
        Sending Email...
      </>
    ) : (
      "Resend Verification Email"
    )}
  </button>
)}

        <form onSubmit={handleSubmit}>

          <div className={styles.inputBox}>
            <input
              name="username"
              className={styles.input}
              type="text"
              placeholder="Username / Email"
              autoComplete="off"
              required
              value={user1.username}
              onChange={handleInput}
            />
            <FaUser className={styles.icon} />
          </div>

          <div className={styles.inputBox}>
            <input
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              value={user1.password}
              onChange={handleInput}
            />
            <FaLock className={styles.icon} />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className={styles.registerLink}>
            <p>
              Don't have an account?{" "}
              <NavLink to="/signup">Signup</NavLink>
            </p>
          </div>

        </form>

      </div>
    </section>
  );
};

export default Login;