import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

const Header = () => {
  const { user } = useAuth();

  return (
    <header>
      <div className="user-info">
        {user?.email}
      </div>
      <button onClick={() => signOut(auth)}>
        Logout
      </button>
    </header>
  );
};

export default Header; 