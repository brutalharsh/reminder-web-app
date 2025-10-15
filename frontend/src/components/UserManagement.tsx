import React, { useState } from "react";
import axios from "axios";
import { User } from "../types";
import { UserPlus, Trash2, X } from "lucide-react";
import "./UserManagement.css";

interface UserManagementProps {
  users: User[];
  onUsersChange: () => void;
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUsersChange,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !discordId.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://34.70.121.37:5001/api/users", {
        name,
        discordId,
      });

      setName("");
      setDiscordId("");
      onUsersChange();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to add user";
      setError(errorMessage);
      console.error("Error adding user:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`http://34.70.121.37:5001/api/users/${userId}`);
      onUsersChange();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      console.error("Error details:", err.response?.data);
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h2>Manage Users</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form className="add-user-form" onSubmit={handleAddUser}>
          <div className="form-group">
            <input
              type="text"
              placeholder="User Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Discord ID (e.g., 123456789012345678)"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="add-user-button" disabled={loading}>
            <UserPlus size={20} />
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>

        <div className="users-list">
          <h3>Existing Users</h3>
          {users.length === 0 ? (
            <p className="no-users">No users added yet</p>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user._id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-discord">
                      Discord: {user.discordId}
                    </span>
                  </div>
                  <button
                    className="delete-user-button"
                    onClick={() => handleDeleteUser(user._id)}
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
