import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Hotel as HotelIcon,
  Dashboard as DashboardIcon,
  BookOnline as BookIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  CleaningServices
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const getUserInitials = () => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <AppBar 
      position="static" 
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <HotelIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff 30%, #f8f9fa 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            Luxury Hotel
          </Typography>
        </Box>
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              startIcon={<DashboardIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                }
              }}
            >
              Dashboard
            </Button>
            
            {user.role === 'customer' && (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/book-room')}
                  startIcon={<BookIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                    }
                  }}
                >
                  Book Room
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/my-bookings')}
                  startIcon={<HistoryIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                    }
                  }}
                >
                  Bookings
                </Button>
              </>
            )}
            
            {user.role === 'admin' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/admin')}
                startIcon={<AdminIcon />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  }
                }}
              >
                Admin Panel
              </Button>

              
              
            )}


            {user.role === 'admin' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/report')}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  }
                }}
              >
                Financial Report
              </Button>
            )}

            {user.role === 'staff' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/cleaning-requests')}
                startIcon={<CleaningServices />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  }
                }}
              >
                Cleaning Staff Panel
              </Button>
            )}
            
            <IconButton 
              onClick={handleMenuOpen}
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: theme.palette.secondary.main,
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
              }}
            >
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2, color: theme.palette.error.main }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.common.white, 0.3),
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  borderColor: alpha(theme.palette.common.white, 0.5),
                }
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                  boxShadow: '0 4px 16px rgba(231, 76, 60, 0.3)',
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
