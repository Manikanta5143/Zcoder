import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FaMoon,
    FaBell,
    FaBars,
    FaTimes,
    FaChevronDown,
    FaUserCircle,
    FaSignOutAlt,
    FaBookmark,
    FaComments,
    FaCode,
    FaFileAlt,
    FaTrophy
} from "react-icons/fa";

import { useLogout } from "../../hooks/useLogout";
import { useAuthContext } from "../../hooks/useAuthContext";

import "./Nav.css";

const Nav = () => {
  const { logout } = useLogout();
  const { isAuthenticated, user } = useAuthContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <>
      <nav className="navbar">

        {/* ---------- Logo ---------- */}

        <NavLink to="/" className="logo">
          <img
            src="/letter-z.svg"
            alt="Zcoder"
            className="logo-image"
          />

          <span className="logo-text">
          coder
          </span>
        </NavLink>

        {/* ---------- Desktop Links ---------- */}

        <div className="nav-center">

          <NavLink to="/contests">
            <FaTrophy />
            <span>Contests</span>
          </NavLink>

          <NavLink to="/practice">
            <FaCode />
            <span>Practice</span>
          </NavLink>

          <NavLink to="/submissions">
            <FaFileAlt />
            <span>Submissions</span>
          </NavLink>

          <NavLink to="/bookmarks">
            <FaBookmark />
            <span>Bookmarks</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/chat">
              <FaComments />
              <span>Chat</span>
            </NavLink>
          )}

        </div>

        {/* ---------- Right Side ---------- */}

        <div className="nav-right">

          {/* Dark Mode */}

          <button className="icon-button">
            <FaMoon />
          </button>

          {/* Notifications */}

          {isAuthenticated && (
            <button className="icon-button notification-btn">

              <FaBell />

              <span className="notification-dot">
                3
              </span>

            </button>
          )}

          {/* User */}

          {isAuthenticated ? (

            <div className="profile">

              <button
                className="profile-button"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
              >

                <div className="avatar">

                  {user?.username?.charAt(0).toUpperCase()}

                </div>

                <span>

                  {user?.username}

                </span>

                <FaChevronDown />

              </button>

              {profileOpen && (

                <div className="profile-menu">

                  <NavLink
                    to="/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >

                    <FaUserCircle />

                    Profile

                  </NavLink>

                  <button onClick={handleLogout}>

                    <FaSignOutAlt />

                    Logout

                  </button>

                </div>

              )}

            </div>

          ) : (

            <div className="auth-buttons">

              <NavLink
                to="/login"
                className="login-btn"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="signup-btn"
              >
                Signup
              </NavLink>

            </div>

          )}

          {/* Mobile Menu */}

          <button
            className="menu-btn"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >

            {menuOpen ? (
              <FaTimes />
            ) : (
              <FaBars />
            )}

          </button>

        </div>

      </nav>

      {/* ---------- Mobile Sidebar ---------- */}

      <div
        className={`mobile-menu ${
          menuOpen ? "show" : ""
        }`}
      >

        <NavLink
          to="/contests"
          onClick={() => setMenuOpen(false)}
        >
          <FaTrophy />
          Contests
        </NavLink>

        <NavLink
          to="/practice"
          onClick={() => setMenuOpen(false)}
        >
          <FaCode />
          Practice
        </NavLink>

        <NavLink
          to="/submissions"
          onClick={() => setMenuOpen(false)}
        >
          <FaFileAlt />
          Submissions
        </NavLink>

        <NavLink
          to="/bookmarks"
          onClick={() => setMenuOpen(false)}
        >
          <FaBookmark />
          Bookmarks
        </NavLink>

        {isAuthenticated && (

          <>

            <NavLink
              to="/chat"
              onClick={() => setMenuOpen(false)}
            >
              <FaComments />
              Chat
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
            >
              <FaUserCircle />
              Profile
            </NavLink>

            <button
              className="logout-mobile"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Logout
            </button>

          </>

        )}

        {!isAuthenticated && (

          <>

            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              onClick={() => setMenuOpen(false)}
            >
              Signup
            </NavLink>

          </>

        )}

      </div>
    </>
  );
};

export default Nav;