import React from "react";
import "./GroupList.css";

function GroupList({ groups, onSelectGroup }) {
  return (
    <div className="chat-group-list">

      <div className="chat-group-header">
        <h3>Groups</h3>

        <button className="create-group-btn">
          +
        </button>
      </div>

      <ul className="group-list">

        {groups.map((group) => (

          <li
            key={group.id}
            className="chat-group-item"
            onClick={() => onSelectGroup(group)}
          >

            <div className="group-avatar">

              👥

            </div>

            <div className="group-info">

              <h4>{group.name}</h4>

              <p>Group Conversation</p>

            </div>

            <span className="group-members">

              {Math.floor(Math.random()*10)+2}

            </span>

          </li>

        ))}

      </ul>

    </div>
  );
}

export default GroupList;