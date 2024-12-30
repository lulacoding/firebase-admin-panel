import { db } from './firebase';
import { collection, doc, writeBatch, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { getGeocode } from 'use-places-autocomplete';
import { getAuth } from 'firebase/auth';

const DUMMY_USERS = [
  { uid: 'dummy1', displayName: 'Sarah Johnson', email: 'sarah.j@example.com' },
  { uid: 'dummy2', displayName: 'Mike Thompson', email: 'mike.t@example.com' },
  { uid: 'dummy3', displayName: 'Emma Wilson', email: 'emma.w@example.com' }
];

// Sydney boundaries (approximate)
const SYDNEY_BOUNDS = {
  north: -33.4489,
  south: -34.1706,
  west: 150.5209,
  east: 151.3430
};

// Major Sydney regions to ensure realistic locations
const SYDNEY_REGIONS = [
  { name: 'North Shore', postcode: '2060', state: 'NSW' },
  { name: 'Eastern Suburbs', postcode: '2021', state: 'NSW' },
  { name: 'Inner West', postcode: '2042', state: 'NSW' },
  { name: 'Western Sydney', postcode: '2150', state: 'NSW' },
  { name: 'Northern Beaches', postcode: '2100', state: 'NSW' }
];

const CATEGORIES = ['Furniture', 'Electronics', 'Clothing', 'Books', 'Tools', 'Kitchen', 'Garden', 'Toys', 'Sports'];

const ITEMS = {
  Furniture: ['Vintage Dining Table', 'Leather Sofa', 'Bookshelf', 'Coffee Table', 'Bed Frame'],
  Electronics: ['Old TV', 'Stereo System', 'Vintage Radio', 'Computer Monitor', 'Speakers'],
  Clothing: ['Designer Clothes', 'Vintage Clothing', 'Kids Clothes', 'Shoes', 'Accessories'],
  Books: ['Book Collection', 'Textbooks', 'Novels', 'Comics', 'Magazines'],
  Tools: ['Power Tools', 'Hand Tools', 'Garden Tools', 'Tool Box', 'Workbench'],
  Kitchen: ['Appliances', 'Cookware', 'Dishes', 'Utensils', 'Small Appliances'],
  Garden: ['Plants', 'Pots', 'Garden Furniture', 'Lawn Mower', 'Garden Decor'],
  Toys: ['Kids Toys', 'Board Games', 'Video Games', 'Puzzles', 'Outdoor Toys'],
  Sports: ['Exercise Equipment', 'Sports Gear', 'Bicycles', 'Camping Gear', 'Golf Clubs']
};

const TAGS = [
  'vintage', 'antique', 'like-new', 'collectible', 'rare',
  'moving-sale', 'estate-sale', 'downsizing', 'renovation',
  'must-go', 'negotiable', 'bulk-deals', 'cheap'
];

function getRandomItems(category, count = 3) {
  const items = ITEMS[category];
  const selected = new Set();
  while (selected.size < count && selected.size < items.length) {
    selected.add(items[Math.floor(Math.random() * items.length)]);
  }
  return Array.from(selected);
}

function getRandomTags(count = 3) {
  const selected = new Set();
  while (selected.size < count) {
    selected.add(TAGS[Math.floor(Math.random() * TAGS.length)]);
  }
  return Array.from(selected);
}

function generateEventDates(isMultiDay) {
  const now = new Date();
  const startDate = new Date(now.setDate(now.getDate() + Math.floor(Math.random() * 14)));
  const endDate = isMultiDay 
    ? new Date(startDate.getTime() + (Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000)
    : startDate;

  return [{
    startDate: startDate,
    endDate: endDate,
    startTime: '09:00',
    endTime: '16:00'
  }];
}

function getRandomCoordinate(min, max) {
  return Math.random() * (max - min) + min;
}

async function generateRandomLocation() {
  try {
    // Wait for Google Maps to load
    if (!window.google) {
      await new Promise(resolve => {
        const checkGoogle = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogle);
            resolve();
          }
        }, 100);
      });
    }

    // Generate random coordinates within Sydney bounds
    const latitude = getRandomCoordinate(SYDNEY_BOUNDS.south, SYDNEY_BOUNDS.north);
    const longitude = getRandomCoordinate(SYDNEY_BOUNDS.west, SYDNEY_BOUNDS.east);

    // Get region based on coordinates (simplified version)
    const region = SYDNEY_REGIONS[Math.floor(Math.random() * SYDNEY_REGIONS.length)];

    // Use Google Geocoding API to get actual address
    const results = await getGeocode({
      location: { lat: latitude, lng: longitude }
    });

    if (results && results[0]) {
      const address = results[0];
      const addressComponents = address.address_components;

      // Extract address components
      const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
      const street = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
      const suburb = addressComponents.find(c => c.types.includes('locality'))?.long_name || region.name;

      return {
        address: `${streetNumber} ${street}`,
        suburb,
        state: region.state,
        postcode: region.postcode,
        coordinates: {
          latitude,
          longitude
        }
      };
    }

    // Fallback if geocoding fails
    return {
      address: `${Math.floor(Math.random() * 200) + 1} ${['Park', 'Beach', 'Forest', 'Hill'][Math.floor(Math.random() * 4)]} Street`,
      ...region,
      coordinates: {
        latitude,
        longitude
      }
    };
  } catch (error) {
    console.error('Error generating location:', error);
    // Return fallback location
    const region = SYDNEY_REGIONS[Math.floor(Math.random() * SYDNEY_REGIONS.length)];
    return {
      address: `${Math.floor(Math.random() * 200) + 1} ${['Park', 'Beach', 'Forest', 'Hill'][Math.floor(Math.random() * 4)]} Street`,
      ...region,
      coordinates: {
        latitude: getRandomCoordinate(SYDNEY_BOUNDS.south, SYDNEY_BOUNDS.north),
        longitude: getRandomCoordinate(SYDNEY_BOUNDS.west, SYDNEY_BOUNDS.east)
      }
    };
  }
}

const generateDummyListings = async (count = 10) => {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  const listings = [];

  try {
    // Verify admin status
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('You must be logged in to generate dummy data');
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || !userDoc.data().admin) {
      throw new Error('You must have admin privileges to generate dummy data');
    }

    // First ensure dummy users exist
    for (const user of DUMMY_USERS) {
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        ...user,
        createdAt: now,
        lastLogin: now,
        listings: []
      }, { merge: true });
    }

    // Generate listings
    for (let i = 0; i < count; i++) {
      const author = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
      const location = await generateRandomLocation(); // Generate random location
      const categories = [CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]];
      const isMultiDay = Math.random() > 0.7;

      const listingRef = doc(collection(db, 'listings'));
      const listing = {
        authorId: author.uid,
        title: `${author.displayName}'s ${categories[0]} Sale`,
        description: `${getRandomItems(categories[0]).join(', ')} and more! ${isMultiDay ? 'Multi-day sale!' : 'One day only!'}`,
        status: 'active',
        dateCreated: now,
        eventDates: generateEventDates(isMultiDay),
        isMultiDay,
        location,
        tags: getRandomTags(),
        views: Math.floor(Math.random() * 50),
        images: [],
        categories,
        featured: Math.random() > 0.8,
        lastUpdated: now
      };

      batch.set(listingRef, listing);
      listings.push({ id: listingRef.id, ...listing });

      // Update user's listings array
      const userRef = doc(db, 'users', author.uid);
      batch.update(userRef, {
        listings: arrayUnion(listingRef.id)
      });

      // Initialize view stats
      const viewsRef = doc(db, 'views', listingRef.id);
      batch.set(viewsRef, {
        count: listing.views,
        uniqueVisitors: [],
        lastViewed: now
      });
    }

    await batch.commit();
    console.log(`Successfully generated ${count} dummy listings`);
    return listings;
  } catch (error) {
    console.error('Error generating dummy listings:', error);
    throw new Error(error.message || 'Failed to generate dummy listings. Please check your permissions.');
  }
};

export default generateDummyListings; 