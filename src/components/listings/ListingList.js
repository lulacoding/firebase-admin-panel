import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, Chip 
} from '@mui/material';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ListingList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(
          collection(db, 'listings'), 
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const listingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
        }));
        setListings(listingData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <Typography>Loading listings...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Garage Sale Listings
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>{listing.title}</TableCell>
                <TableCell>{listing.location}</TableCell>
                <TableCell>{listing.createdAt}</TableCell>
                <TableCell>
                  <Chip 
                    label={listing.status} 
                    color={listing.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListingList; 