import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

const LoginPage = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="login-container">
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        size="large"
      >
        Sign in with Google
      </Button>
      {isAdmin === false && (
        <Typography color="error" sx={{ mt: 2 }}>
          You must be an admin to access this panel.
        </Typography>
      )}
    </Box>
  );
};

export default LoginPage; 