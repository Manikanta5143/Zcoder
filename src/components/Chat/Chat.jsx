import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import './Chat.css';

const socket = io('http://localhost:8008');

function Chat({ currentUser, chatPartner, isGroup, groupId }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const roomId = isGroup
    ? `room:group:${groupId}`
    : [currentUser, chatPartner].sort().join('_');

  useEffect(() => {
    setChat([]);
    setError(null);
    fetch(`http://localhost:8008/api/messages/${encodeURIComponent(roomId)}`)
      .then(res => res.json())
      .then(data => setChat(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load chat history.'));
  }, [roomId]);

  useEffect(() => {
    socket.emit('join_room', roomId);
    const listener = (msg) => setChat(prev => [...prev, msg]);
    socket.on('receive_message', listener);
    return () => socket.off('receive_message', listener);
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', {
        roomId,
        sender: currentUser,
        content: message,
        isGroup
      });
      setMessage('');
    }
  };

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
          method: 'DELETE'
        });
        setChat(prev => prev.filter(msg => msg._id !== id));
        setDeletingId(null);
      } catch {
        setError('Failed to delete message');
        setDeletingId(null);
      }
    }, 400);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {isGroup ? `Group: ${groupId}` : chatPartner}
      </div>

      <div className="chat-body">
        {error && <div className="error">{error}</div>}
        {!error && chat.length === 0 && <div className="empty">No messages yet.</div>}
        {chat.map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div
              key={msg._id}
              className={`chat-message ${isMe ? 'me' : 'other'} ${deletingId === msg._id ? 'fade-out' : ''}`}
            >
              <div>{msg.content}</div>
              <div className="timestamp">
                {msg.sender} • {msg.timestamp ? dayjs(msg.timestamp).format('HH:mm') : ''}
              </div>
              {isMe && (
                <button
                  onClick={() => handleDeleteClick(msg._id)}
                  className="delete-button always-visible"
                >
                  🗑️
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* WhatsApp-style delete confirmation */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-text">Delete this message?</div>
            <div className="modal-buttons">
              <button onClick={cancelDelete} className="modal-cancel">Cancel</button>
              <button onClick={confirmDelete} className="modal-delete">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
