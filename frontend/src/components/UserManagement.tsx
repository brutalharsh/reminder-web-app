import React, { useState } from 'react';
import { User } from '../types';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: Omit<User, '_id' | 'created_at'>) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
}) => {
  const [name, setName] = useState('');
  const [discordId, setDiscordId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ name, discordId });
    setName('');
    setDiscordId('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>User Management</h2>

        <form onSubmit={handleSubmit} className="add-user-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User Name"
            required
          />
          <input
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="Discord ID"
            required
          />
          <button type="submit" className="btn btn-primary">
            Add User
          </button>
        </form>

        <div className="user-list">
          <h3>Existing Users</h3>
          {users.length === 0 ? (
            <p>No users added yet</p>
          ) : (
            users.map(user => (
              <div key={user._id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-discord">{user.discordId}</span>
                </div>
                <button
                  onClick={() => onDeleteUser(user._id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;