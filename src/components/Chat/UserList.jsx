import React from 'react';

function UserList({ users, onSelectUser, currentUser }) {
  return (
    <div className="chat-user-list">
      <h3 className="chat-user-list-title">Users</h3>
      <ul>
        {users.filter(u => u !== currentUser).map(user => (
          <li key={user} className="chat-user-list-item">
            <button className="chat-user-list-btn" onClick={() => onSelectUser(user)}>{user}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList; 