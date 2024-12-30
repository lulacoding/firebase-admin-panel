import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  PeopleOutline,
  Store,
  LocalOffer,
  AdminPanelSettings,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 2 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: 'primary.main' }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGarageSales: 0,
    totalListings: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching stats...');
        
        // Get users
        const usersQuery = query(collection(db, 'users'));
        const usersSnap = await getDocs(usersQuery);
        const totalUsers = usersSnap.size;
        console.log('Total users:', totalUsers);

        // Get active listings
        const listingsQuery = query(
          collection(db, 'listings'),
          where('status', '==', 'active')
        );
        const listingsSnap = await getDocs(listingsQuery);
        const totalActiveListings = listingsSnap.size;
        console.log('Total active listings:', totalActiveListings);

        // Get all listings
        const allListingsQuery = query(collection(db, 'listings'));
        const allListingsSnap = await getDocs(allListingsQuery);
        const totalListings = allListingsSnap.size;
        console.log('Total listings:', totalListings);

        // Get admins
        const adminsQuery = query(
          collection(db, 'users'),
          where('admin', '==', true)
        );
        const adminsSnap = await getDocs(adminsQuery);
        const totalAdmins = adminsSnap.size;
        console.log('Total admins:', totalAdmins);

        setStats({
          totalUsers,
          totalGarageSales: totalActiveListings,
          totalListings,
          totalAdmins,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard stats. Please check your permissions.');
        setStats({
          totalUsers: 0,
          totalGarageSales: 0,
          totalListings: 0,
          totalAdmins: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleOutline fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Garage Sales"
            value={stats.totalGarageSales}
            icon={<Store fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={stats.totalListings}
            icon={<LocalOffer fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Admin Users"
            value={stats.totalAdmins}
            icon={<AdminPanelSettings fontSize="large" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 