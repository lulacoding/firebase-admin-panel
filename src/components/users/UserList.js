import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box 
} from '@mui/material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { makeUserAdmin } from '../../services/adminService';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('email'));
        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleMakeAdmin = async (uid) => {
    try {
      await makeUserAdmin(uid);
      // Refresh user list
      const updatedUsers = users.map(user => 
        user.id === uid ? {...user, admin: true} : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  if (loading) return <Typography>Loading users...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.displayName || 'N/A'}</TableCell>
                <TableCell>{user.admin ? 'Admin' : 'User'}</TableCell>
                <TableCell>
                  {!user.admin && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleMakeAdmin(user.id)}
                    >
                      Make Admin
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserList; 