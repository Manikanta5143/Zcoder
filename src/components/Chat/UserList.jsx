import React from "react";
import "./UserList.css";

function UserList({ users, onSelectUser, currentUser }) {
  return (
    <div className="chat-user-list">

      <div className="chat-user-list-header">
        <h3>Users</h3>
        <span>{users.length - 1}</span>
      </div>

      <ul className="user-list">

        {users
          .filter((u) => u !== currentUser)
          .map((user) => (
            <li
              key={user}
              className="chat-user-list-item"
              onClick={() => onSelectUser(user)}
            >
              <div className="avatar-wrapper">

                <div className="avatar">
                  {user.charAt(0).toUpperCase()}
                </div>

                <span className="online-dot"></span>

              </div>

              <div className="user-info">

                <h4>{user}</h4>

                <p></p>

              </div>

              <div className="chat-meta">

                <span className="chat-time">
                  Online
                </span>

              </div>

            </li>
          ))}

      </ul>

    </div>
  );
}

export default UserList;