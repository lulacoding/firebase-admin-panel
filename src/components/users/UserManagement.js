import { useState, useEffect } from 'react';
import { makeUserAdmin } from '../../services/adminService';
import { auth, db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      setUsers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    };

    fetchUsers();
  }, []);

  const handleMakeAdmin = async (uid) => {
    try {
      await makeUserAdmin(uid);
      alert('Successfully made user an admin!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleMakeAdmin(user.id)}>
                  Make Admin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement; 