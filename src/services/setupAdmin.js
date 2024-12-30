import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const setupAdminUser = async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      admin: true,
      createdAt: new Date(),
      lastLogin: new Date(),
      listings: [],
      photoURL: user.photoURL || null
    }, { merge: true });
    
    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
}; 