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
  FiMoreVertical,
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

  const messagesEndRef = useRef(null);

  const roomId = isGroup
    ? `room:group:${groupId}`
    : [currentUser, chatPartner].sort().join("_");

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

          <div className="chat-avatar">

            {(isGroup ? groupId : chatPartner)
              ?.charAt(0)
              .toUpperCase()}

          </div>

          <div className="chat-user-info">

            <h2>

              {isGroup ? groupId : chatPartner}

            </h2>

            <span className="online-status">

              🟢 Online

            </span>

          </div>

        </div>

        <div className="chat-actions">

          <button>

            <FiSearch />

          </button>

          <button>

            <FiPhone />

          </button>

          <button>

            <FiVideo />

          </button>

          <button>

            <FiMoreVertical />

          </button>

        </div>

      </div>

      {/* ===============================
            TYPING INDICATOR
      =============================== */}

      {isTyping && (

        <div className="typing-indicator">

          <span>

            {chatPartner} is typing...

          </span>

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

      <div
  className="chat-body"
  ref={messagesContainerRef}
>

        {error && (

          <div className="error">

            {error}

          </div>

        )}

        {!error && chat.length === 0 && (

          <div className="empty-chat">

            <div className="empty-icon">

              💬

            </div>

            <h2>

              Start Conversation

            </h2>

            <p>

              Send your first message.

            </p>

          </div>

        )}
                {chat.map((msg) => {

          const isMe = msg.sender === currentUser;

          return (

            <div
              key={msg._id}
              className={`message-row ${
                isMe ? "my-row" : "other-row"
              } ${
                deletingId === msg._id ? "fade-out" : ""
              }`}
            >

              {!isMe && (

                <div className="message-avatar">

                  {msg.sender.charAt(0).toUpperCase()}

                </div>

              )}

              <div
                className={`message-card ${
                  isMe ? "my-message" : "other-message"
                }`}
              >

                {!isMe && (

                  <div className="sender-name">

                    {msg.sender}

                  </div>

                )}

                <div className="message-text">

                  {msg.content}

                </div>

                <div className="message-footer">

                  <span>

                    {msg.timestamp
                      ? dayjs(msg.timestamp).format("hh:mm A")
                      : ""}

                  </span>

                  {isMe && (

                    <span className="message-status">

                      ✓✓

                    </span>

                  )}

                </div>

              </div>

              {isMe && (

                <button
                  className="delete-message"
                  onClick={() =>
                    handleDeleteClick(msg._id)
                  }
                >

                  <FiTrash2 />

                </button>

              )}

            </div>

          );

        })}

        {/* Auto Scroll */}


      </div>

      {/* Continue in Part 3 */}
            {/* ===============================
              INPUT AREA
      =============================== */}

      <div className="chat-input-container">

        <button className="input-icon">

          <FiPaperclip />

        </button>

        <button className="input-icon">

          <FiSmile />

        </button>

        <div className="chat-input-box">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
          />

        </div>

        {message.trim() ? (

          <button
            className="send-btn"
            onClick={sendMessage}
          >

            <FiSend />

          </button>

        ) : (

          <button className="mic-btn">

            <FiMic />

          </button>

        )}

      </div>

      {/* ===============================
          DELETE CONFIRMATION MODAL
      =============================== */}

      {confirmDeleteId && (

        <div className="modal-overlay">

          <div className="modal-box">

            <h3>

              Delete Message

            </h3>

            <p>

              Are you sure you want to delete this message?

            </p>

            <div className="modal-buttons">

              <button
                className="modal-cancel"
                onClick={cancelDelete}
              >

                Cancel

              </button>

              <button
                className="modal-delete"
                onClick={confirmDelete}
              >

                Delete

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Chat;

