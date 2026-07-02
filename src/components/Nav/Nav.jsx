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
import { useNotifications } from "../../hooks/useNotifications";

import "./Nav.css";

const Nav = () => {
  const { logout } = useLogout();
  const { isAuthenticated, user } = useAuthContext();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
            <div className="notification-container">
              <button 
                className="icon-button notification-btn"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-dot">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="notification-menu">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="mark-read-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ul className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No notifications yet.</div>
                    ) : (
                      notifications.map(notif => {
                        let iconClass = 'accepted';
                        let iconText = '🏆';
                        if (notif.type === 'WrongAnswer') {
                          iconClass = 'wronganswer';
                          iconText = '❌';
                        } else if (notif.type === 'Accepted') {
                          iconClass = 'accepted';
                          iconText = '✓';
                        } else if (notif.type === 'Achievement') {
                          iconClass = 'achievement';
                          iconText = '⭐';
                        }

                        return (
                          <li 
                            key={notif._id} 
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                            onClick={() => setNotifOpen(false)}
                          >
                            <div className={`notification-item-icon ${iconClass}`}>
                              {iconText}
                            </div>
                            <div className="notification-item-content">
                              <span className="notification-item-title">{notif.title}</span>
                              <span className="notification-item-desc">{notif.message}</span>
                              <span className="notification-item-time">
                                {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
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