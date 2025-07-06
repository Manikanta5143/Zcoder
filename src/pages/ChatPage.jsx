import React, { useState } from 'react';
import Chat from '../components/Chat/Chat';
import UserList from '../components/Chat/UserList';
import GroupList from '../components/Chat/GroupList';
import { useAuthContext } from '../hooks/useAuthContext';
import './ChatPage.css'
import { useNavigate } from 'react-router-dom'

const mockUsers = ['Manikanta', 'Praneeth', 'Prajith', 'Sathish'];
const mockGroups = [
  { id: 'general', name: 'General' },
  { id: 'devs', name: 'Developers' }
];

const ChatPage = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [chatPartner, setChatPartner] = useState(null);
  const [group, setGroup] = useState(null);
  const navigate = useNavigate();

  if (!isAuthenticated || !user || !user.username) {
    return <div className="chatpage-login-msg">Please log in to use the chat.</div>;
  }

  return (
    <div className="chatpage-root">
      <div className="chatpage-sidebar">
        <button className="chatpage-back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <UserList users={mockUsers} onSelectUser={u => { setChatPartner(u); setGroup(null); }} currentUser={user.username} />
        <GroupList groups={mockGroups} onSelectGroup={g => { setGroup(g); setChatPartner(null); }} />
      </div>
      <div className="chatpage-main">
        {chatPartner && (
          <Chat currentUser={user.username} chatPartner={chatPartner} isGroup={false} />
        )}
        {group && (
          <Chat currentUser={user.username} groupId={group.id} isGroup={true} />
        )}
        {!chatPartner && !group && <div className="chatpage-placeholder">Select a user or group to chat.</div>}
      </div>
    </div>
  );
};

export default ChatPage; 