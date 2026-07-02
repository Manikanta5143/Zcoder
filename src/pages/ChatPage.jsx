import React, { useState, useEffect } from "react";
import Chat from "../components/Chat/Chat";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPhone, FiVideo, FiUsers, FiPlus, FiChevronRight, FiCompass } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import "./ChatPage.css";
import Loader from "../components/Loader/Loader";

const ChatPage = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const [chatPartner, setChatPartner] = useState(null);
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("All"); // "All" | "Users" | "Groups"
  const [searchQuery, setSearchQuery] = useState("");

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

  // Pre-configured list of conversations matching Image 2 reference + mockUsers
  const conversationsList = [
    {
      id: "manikanta",
      name: "Manikanta",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      message: "Hey! How's your preparation going?",
      time: "2m",
      unread: 2,
      isGroup: false,
      online: true
    },
    {
      id: "general",
      name: "Code Warriors",
      avatar: null,
      message: "Bob: Check out this solution",
      time: "15m",
      unread: 0,
      isGroup: true,
      online: false
    },
    {
      id: "praneeth",
      name: "praneeth",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      message: "Thanks for the help!",
      time: "1h",
      unread: 0,
      isGroup: false,
      online: true
    },
    {
      id: "devs",
      name: "DSA Study Group",
      avatar: null,
      message: "Sarah: New problem uploaded",
      time: "2h",
      unread: 0,
      isGroup: true,
      online: false
    },
    {
      id: "satish",
      name: "satish",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      message: "Let's solve this together",
      time: "1d",
      unread: 0,
      isGroup: false,
      online: true
    },
    {
      id: "competitive_coders",
      name: "Competitive Coders",
      avatar: null,
      message: "Alex: Contest tomorrow!",
      time: "2d",
      unread: 0,
      isGroup: true,
      online: false
    },
    {
      id: "Manikanta",
      name: "Manikanta",
      avatar: null,
      message: "Start a chat...",
      time: "3d",
      unread: 0,
      isGroup: false,
      online: true
    },
    {
      id: "Praneeth",
      name: "Praneeth",
      avatar: null,
      message: "Start a chat...",
      time: "4d",
      unread: 0,
      isGroup: false,
      online: true
    }
  ];

  // Right sidebar details
  const onlineUsers = [
    { name: "Manikanta", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "praneeth", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "satish", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  ];

  const chatGroups = [
    { id: "general", name: "Code Warriors" },
    { id: "devs", name: "DSA Study Group" }
  ];

  // Filters search list
  const filteredConversations = conversationsList.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "Users") return !conv.isGroup;
    if (activeTab === "Groups") return conv.isGroup;
    return true;
  });

  const handleSelectConv = (conv) => {
    if (conv.isGroup) {
      setGroup({ id: conv.id, name: conv.name });
      setChatPartner(null);
    } else {
      setChatPartner(conv.name);
      setGroup(null);
    }
  };

  return (
    <div className="chatpage-root-container">
      {/* 1. Left Sidebar panel */}
      <aside className="chatpage-left-sidebar">
        <div className="sidebar-top-header">
          <h2>Conversations</h2>
          <div className="search-plus-row">
            <div className="sidebar-search-box">
              <FiSearch className="search-mag-icon" />
              <input
                type="text"
                placeholder="Search users or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="add-chat-btn" title="Create Chat">
              <FiPlus />
            </button>
          </div>
        </div>

        {/* Tab switcher buttons */}
        <div className="sidebar-tab-controls">
          <button
            className={`tab-switch-btn ${activeTab === "All" ? "active" : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={`tab-switch-btn ${activeTab === "Users" ? "active" : ""}`}
            onClick={() => setActiveTab("Users")}
          >
            Users
          </button>
          <button
            className={`tab-switch-btn ${activeTab === "Groups" ? "active" : ""}`}
            onClick={() => setActiveTab("Groups")}
          >
            Groups
          </button>
        </div>

        {/* Conversations Scroll Box */}
        <div className="sidebar-conversations-list">
          {filteredConversations.map((conv) => {
            const isActive = conv.isGroup
              ? group && group.id === conv.id
              : chatPartner === conv.name;

            return (
              <div
                key={conv.id}
                className={`conversation-row-item ${isActive ? "active" : ""}`}
                onClick={() => handleSelectConv(conv)}
              >
                {/* Avatar with optional online dot */}
                <div className="avatar-wrapper">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {conv.isGroup ? <FiUsers /> : conv.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conv.online && <span className="online-green-dot"></span>}
                </div>

                <div className="row-meta-content">
                  <div className="row-title-time">
                    <span className="conv-name">{conv.name}</span>
                    <span className="conv-time">{conv.time}</span>
                  </div>
                  <div className="row-message-unread">
                    <span className="conv-msg-preview">{conv.message}</span>
                    {conv.unread > 0 && (
                      <span className="conv-unread-badge">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade to Pro Banner at bottom */}
        <div className="upgrade-pro-banner-box">
          <button className="upgrade-pro-action-btn">
            <FaCrown className="crown-pro-icon" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
      </aside>

      {/* 2. Middle Main Chat pane */}
      <main className="chatpage-middle-main">
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
          <div className="chatpage-placeholder-state">
            <div className="placeholder-icon-box">💬</div>
            <h2>Welcome to ZCoder Chat</h2>
            <p>Select a user or a group from the left sidebar to start collaborating.</p>
          </div>
        )}
      </main>

      {/* 3. Right Sidebar panel */}
      <aside className="chatpage-right-sidebar">
        {/* Online Users Card */}
        <div className="right-panel-card online-users-card">
          <h3>Online Users ({onlineUsers.length})</h3>
          <div className="right-card-list">
            {onlineUsers.map((u, idx) => (
              <div key={idx} className="right-list-row-user">
                <div className="small-avatar-wrapper">
                  <img src={u.avatar} alt={u.name} className="small-avatar-img" />
                </div>
                <span className="user-label-name">{u.name}</span>
                <span className="green-indicator-dot-right"></span>
              </div>
            ))}
          </div>
          <button className="view-all-users-btn">View All Users</button>
        </div>

        {/* Chat Groups Card */}
        <div className="right-panel-card chat-groups-card">
          <h3>Chat Groups ({chatGroups.length})</h3>
          <div className="right-card-list">
            {chatGroups.map((g) => (
              <div
                key={g.id}
                className="right-list-row-group"
                onClick={() => handleSelectConv({ id: g.id, name: g.name, isGroup: true })}
              >
                <div className="small-icon-wrapper-group">
                  <FiUsers className="group-list-row-icon" />
                </div>
                <span className="group-label-name">{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ChatPage;