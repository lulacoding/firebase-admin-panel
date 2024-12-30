import { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Chip, IconButton, CircularProgress, Avatar,
  Button, Snackbar, Alert 
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import generateDummyListings from '../../services/dummyData';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, 'listings'), 
          orderBy('dateCreated', 'desc')
        );
        const snapshot = await getDocs(q);
        const listingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dateCreated: doc.data().dateCreated?.toDate().toLocaleDateString() || 'N/A',
          startDate: doc.data().eventDates?.[0]?.startDate?.toDate().toLocaleDateString() || 'N/A',
          endDate: doc.data().eventDates?.[0]?.endDate?.toDate().toLocaleDateString() || 'N/A'
        }));
        console.log('Fetched listings:', listingData);
        setListings(listingData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, 'listings', id));
        setListings(listings.filter(listing => listing.id !== id));
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
    }
  };

  const handleGenerateDummy = async () => {
    try {
      setLoading(true);
      await generateDummyListings(10);
      // Refresh listings
      const q = query(collection(db, 'listings'), orderBy('dateCreated', 'desc'));
      const snapshot = await getDocs(q);
      const listingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateCreated: doc.data().dateCreated?.toDate().toLocaleDateString() || 'N/A',
        startDate: doc.data().eventDates?.[0]?.startDate?.toDate().toLocaleDateString() || 'N/A',
        endDate: doc.data().eventDates?.[0]?.endDate?.toDate().toLocaleDateString() || 'N/A'
      }));
      setListings(listingData);
      setSnackbar({
        open: true,
        message: 'Successfully generated dummy listings!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating dummy data:', error);
      setSnackbar({
        open: true,
        message: 'Error generating dummy listings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Garage Sale Listings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateDummy}
          disabled={loading}
        >
          Generate Dummy Listings
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {listing.images?.[0] && (
                      <Avatar
                        src={listing.images[0].url}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    )}
                    <Typography>{listing.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {`${listing.location?.suburb || ''}, ${listing.location?.state || ''}`}
                </TableCell>
                <TableCell>
                  {listing.isMultiDay ? (
                    `${listing.startDate} - ${listing.endDate}`
                  ) : (
                    listing.startDate
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={listing.status} 
                    color={
                      listing.status === 'active' ? 'success' : 
                      listing.status === 'completed' ? 'default' : 'error'
                    }
                  />
                </TableCell>
                <TableCell>{listing.views || 0}</TableCell>
                <TableCell>{listing.dateCreated}</TableCell>
                <TableCell>
                  <IconButton 
                    color="info"
                    onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    color="primary"
                    onClick={() => window.open(`/listing/edit/${listing.id}`, '_blank')}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListingsPage; 