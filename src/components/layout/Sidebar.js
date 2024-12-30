import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Listings', icon: <StoreIcon />, path: '/listings' },
  ];

  return (
    <nav className="sidebar">
      <List>
        {menuItems.map((item) => (
          <ListItem
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            sx={{
              color: 'white',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </nav>
  );
};

export default Sidebar; 