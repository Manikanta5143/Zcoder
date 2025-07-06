import React from 'react';

function GroupList({ groups, onSelectGroup }) {
  return (
    <div className="chat-group-list">
      <h3 className="chat-group-list-title">Groups</h3>
      <ul>
        {groups.map(group => (
          <li key={group.id} className="chat-group-list-item">
            <button className="chat-group-list-btn" onClick={() => onSelectGroup(group)}>{group.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupList; 