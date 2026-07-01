import "./ChatSidebar.css";
import { FiSearch, FiPlus } from "react-icons/fi";

const ChatSidebar = ({
    users = [],
    selectedUser,
    setSelectedUser
}) => {

    return (

        <div className="chat-sidebar">

            <div className="sidebar-top">

                <h2>Chats</h2>

                <button className="new-chat">

                    <FiPlus />

                </button>

            </div>

            <div className="search-box">

                <FiSearch />

                <input

                    type="text"

                    placeholder="Search conversations..."

                />

            </div>

            <div className="chat-users">

                {users.map((user) => (

                    <div

                        key={user.username}

                        className={`user-card ${
                            selectedUser === user.username
                                ? "active"
                                : ""
                        }`}

                        onClick={() => setSelectedUser(user.username)}

                    >

                        <div className="avatar-wrapper">

                            <img

                                src={`https://ui-avatars.com/api/?name=${user.username}&background=2563eb&color=fff`}

                                alt={user.username}

                            />

                            <span className="online-dot"></span>

                        </div>

                        <div className="user-details">

                            <h4>{user.username}</h4>

                            <p>

                                {user.lastMessage || "Start chatting..."}

                            </p>

                        </div>

                        <span className="time">

                            {user.time || ""}

                        </span>

                    </div>

                ))}

            </div>

        </div>

    );

};

export default ChatSidebar;
