import { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Button, Chip, Avatar, CircularProgress 
} from '@mui/material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { makeUserAdmin } from '../../services/adminService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('email'));
        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastSignIn: doc.data().lastSignIn?.toDate().toLocaleDateString() || 'Never'
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
      setUsers(users.map(user => 
        user.id === uid ? {...user, admin: true} : user
      ));
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Last Sign In</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.photoURL} alt={user.displayName}>
                      {user.displayName?.charAt(0) || user.email?.charAt(0)}
                    </Avatar>
                    <Typography>{user.displayName || 'No name'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.admin ? 'Admin' : 'User'} 
                    color={user.admin ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{user.lastSignIn}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.disabled ? 'Disabled' : 'Active'} 
                    color={user.disabled ? 'error' : 'success'}
                  />
                </TableCell>
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

export default UsersPage; 