import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  useTheme,
  Typography
} from '@mui/material';
import { 
  Home, 
  Event, 
  LibraryBooks, 
  AttachMoney, 
  People,
  Dashboard
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  
  const menuItems = [
    { icon: <Home />, text: "Home", path: "/" },
    { icon: <Event />, text: "Events", path: "/events" },
    { icon: <LibraryBooks />, text: "Sermons", path: "/sermons" },
    { icon: <AttachMoney />, text: "Donations", path: "/donations" },
    { icon: <People />, text: "Families", path: "/families" },
    { icon: <People />, text: "Members", path: "/members" },
  ];

  return (
    <Box sx={{ 
      pb: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography variant="h6" sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.primary.main,
          fontWeight: 'bold'
        }}>
          <Dashboard />
          Church Dashboard
        </Typography>
      </Box>
      <Divider />

      {/* Menu Items */}
      <List sx={{ 
        py: 0,
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '0.4em',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.background.paper,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 2,
        },
      }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path}
            key={item.path}
            selected={location.pathname === item.path}
            sx={{
              py: 1.25,
              px: 3,
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              color: theme.palette.primary.main,
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.dark,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.dark,
                }
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.primary.dark,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.dark,
                }
              },
              '&.Mui-selected:hover': {
                backgroundColor: theme.palette.action.selected,
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                variant: 'body1',
                fontWeight: 'medium'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;