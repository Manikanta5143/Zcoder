import React, { useState } from "react";
import Chat from "../components/Chat/Chat";
import UserList from "../components/Chat/UserList";
import GroupList from "../components/Chat/GroupList";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css";
import Loader from "../components/Loader/Loader";
import { useEffect } from "react";
const mockUsers = [
  "Manikanta",
  "Praneeth",
  "Prajith",
  "Sathish",
];

const mockGroups = [
  {
    id: "general",
    name: "General",
  },
  {
    id: "devs",
    name: "Developers",
  },
];

const ChatPage = () => {
  const { user, isAuthenticated } = useAuthContext();

  const [chatPartner, setChatPartner] = useState(null);
  const [group, setGroup] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
  if (!isAuthenticated || !user || !user.username) {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }
}, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user || !user.username) {
     return (
    <Loader
      title="Login to view this page"
      subtitle="Please wait while we take you to the login page."
    />
  );
}
  

  return (
    <div className="chatpage-root">

      {/* =========================
              LEFT SIDEBAR
      ========================= */}

      <aside className="chatpage-sidebar">

        {/* Logo */}

        <div className="sidebar-header">

          <div className="sidebar-logo">

            <div className="logo-circle">

              💬

            </div>

            <div>

              <h2>ZCoder Chat</h2>

              <p>Connect & Collaborate</p>

            </div>

          </div>

        </div>

        {/* Back Button */}

        <button
          className="chatpage-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* Search */}

        <div className="sidebar-search">

          <input
            type="text"
            placeholder="Search users..."
          />

        </div>

        {/* Users */}
<UserList
  users={mockUsers}
  currentUser={user.username}
  onSelectUser={(selectedUser) => {
    setChatPartner(selectedUser);
    setGroup(null);
  }}
/>

<GroupList
  groups={mockGroups}
  onSelectGroup={(selectedGroup) => {
    setGroup(selectedGroup);
    setChatPartner(null);
  }}
/>

      </aside>

      {/* =========================
              CHAT AREA
      ========================= */}

      <main className="chatpage-main">

        {chatPartner && (

          <Chat
            currentUser={user.username}
            chatPartner={chatPartner}
            isGroup={false}
          />

        )}

        {group && (

          <Chat
            currentUser={user.username}
            groupId={group.id}
            isGroup={true}
          />

        )}

        {!chatPartner && !group && (

          <div className="chatpage-placeholder">

            <div className="placeholder-icon">
              💬
            </div>

            <h2>Welcome to ZCoder Chat</h2>

            <p>

              Select a user or a group from the left sidebar to start
              collaborating.

            </p>

          </div>

        )}

      </main>

    </div>
  );
};

export default ChatPage;