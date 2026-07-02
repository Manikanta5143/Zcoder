import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import "./Chat.css";

import {
  FiSmile,
  FiPaperclip,
  FiSend,
  FiMic,
  FiSearch,
  FiPhone,
  FiVideo,
  FiMoreHorizontal,
  FiTrash2
} from "react-icons/fi";

const socket = io("http://localhost:8008");

function Chat({ currentUser, chatPartner, isGroup, groupId }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);

  const roomId = isGroup
    ? `room:group:${groupId}`
    : [currentUser, chatPartner].sort().join("_");

  // Load avatar based on partner name for high-fidelity look
  const partnerAvatar = !isGroup && chatPartner === "Manikanta"
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    : chatPartner === "Praneeth"
      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      : chatPartner === "Prajith"
        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        : null;

  /* ===============================
        FETCH CHAT HISTORY
  =============================== */
  useEffect(() => {
    setChat([]);
    setError(null);

    fetch(`http://localhost:8008/api/messages/${encodeURIComponent(roomId)}`)
      .then((res) => res.json())
      .then((data) => {
        setChat(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Could not load chat history.");
      });
  }, [roomId]);

  /* ===============================
        SOCKET
  =============================== */
  useEffect(() => {
    socket.emit("join_room", roomId);

    const listener = (msg) => {
      setChat((prev) => [...prev, msg]);
    };

    socket.on("receive_message", listener);

    return () => socket.off("receive_message", listener);
  }, [roomId]);

  /* ===============================
        AUTO SCROLL
  =============================== */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat]);

  /* ===============================
        SEND MESSAGE
  =============================== */
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      roomId,
      sender: currentUser,
      content: message,
      isGroup,
    });

    setMessage("");
  };

  /* ===============================
        DELETE MESSAGE
  =============================== */
  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);

    setTimeout(async () => {
      try {
        await fetch(`http://localhost:8008/api/messages/${id}`, {
          method: "DELETE",
        });

        setChat((prev) =>
          prev.filter((msg) => msg._id !== id)
        );
      } catch {
        setError("Failed to delete message");
      }
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="chat-container">
      {/* ===============================
              CHAT HEADER
      =============================== */}
      <div className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar-wrapper">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={chatPartner} className="chat-avatar-img" />
            ) : (
              <div className="chat-avatar-placeholder">
                {(isGroup ? groupId : chatPartner)?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="chat-online-green-dot"></span>
          </div>

          <div className="chat-user-info">
            <h2>{isGroup ? (groupId === "general" ? "Code Warriors" : "DSA Study Group") : chatPartner}</h2>
            <span className="online-status">Online</span>
          </div>
        </div>

        <div className="chat-actions">
          <button className="chat-action-icon-btn" title="Phone Call">
            <FiPhone />
          </button>
          <button className="chat-action-icon-btn" title="Video Call">
            <FiVideo />
          </button>
          <button className="chat-action-icon-btn" title="Options">
            <FiMoreHorizontal />
          </button>
        </div>
      </div>

      {/* ===============================
            TYPING INDICATOR
      =============================== */}
      {isTyping && (
        <div className="typing-indicator">
          <span>{chatPartner} is typing...</span>
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {/* ===============================
              CHAT BODY
      =============================== */}
      <div className="chat-body" ref={messagesContainerRef}>
        {error && <div className="error">{error}</div>}

        {!error && chat.length === 0 && (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h2>Start Conversation</h2>
            <p>Send your first message.</p>
          </div>
        )}

        {chat.map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div
              key={msg._id}
              className={`message-row ${isMe ? "my-row" : "other-row"} ${deletingId === msg._id ? "fade-out" : ""
                }`}
            >
              {!isMe && (
                <div className="message-avatar-circle">
                  {partnerAvatar ? (
                    <img src={partnerAvatar} alt={chatPartner} className="chat-body-avatar-img" />
                  ) : (
                    msg.sender.charAt(0).toUpperCase()
                  )}
                </div>
              )}

              <div className={`message-card-bubble ${isMe ? "my-message" : "other-message"}`}>
                <div className="message-text">{msg.content}</div>
                <div className="message-footer-time-check">
                  <span className="msg-time">
                    {msg.timestamp ? dayjs(msg.timestamp).format("hh:mm A") : dayjs().format("hh:mm A")}
                  </span>
                  {isMe && <span className="message-double-checks">✓✓</span>}
                </div>
              </div>

              {isMe && (
                <button
                  className="delete-message-btn"
                  onClick={() => handleDeleteClick(msg._id)}
                  title="Delete message"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ===============================
              INPUT AREA
      =============================== */}
      <div className="chat-input-container">
        <div className="chat-input-bar-wrapper">
          <button className="attachment-clip-btn">
            <FiPaperclip />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="chat-message-input-field"
          />

          <button className="send-message-circle-btn" onClick={sendMessage} title="Send Message">
            <FiSend />
          </button>
        </div>
      </div>

      {/* ===============================
          DELETE CONFIRMATION MODAL
      =============================== */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Message</h3>
            <p>Are you sure you want to delete this message?</p>
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="modal-delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
