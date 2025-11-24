import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Fade,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import Grid,{GridProps} from "@mui/material/Grid";
import {
  Hotel,
  Book,
  History,
  AdminPanelSettings,
  TrendingUp,
  Star,
  Wifi,
  LocalParking,
  Restaurant,
  FitnessCenter,
  Pool,
  Business as BusinessIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {capitalize} from '../utilities/utilities'

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setDashboardStats({
        totalBookings: '',
        totalRevenue: '',
        occupancyRate: ''
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const customerActions = [
    {
      title: 'Book a Room',
      description: 'Find and reserve the perfect room for your stay',
      icon: <Hotel sx={{ fontSize: 48 }} />,
      action: () => navigate('/book-room'),
      color: 'primary',
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    },
    {
      title: 'My Bookings',
      description: 'View and manage your current and past reservations',
      icon: <History sx={{ fontSize: 48 }} />,
      action: () => navigate('/my-bookings'),
      color: 'secondary',
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
    }
  ];

  const adminActions = [
    {
      title: 'Admin Dashboard',
      description: 'Access comprehensive analytics and reports',
      icon: <AdminPanelSettings sx={{ fontSize: 48 }} />,
      action: () => navigate('/admin'),
      color: 'warning',
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
    }
  ];
  const hotelAmenities = [
    { name: 'Free WiFi', icon: <Wifi />, available: true },
    { name: 'Parking', icon: <LocalParking />, available: true },
    { name: 'Restaurant', icon: <Restaurant />, available: true },
    { name: 'Fitness Center', icon: <FitnessCenter />, available: true },
    { name: 'Swimming Pool', icon: <Pool />, available: true },
    { name: 'Business Center', icon: <BusinessIcon />, available: true }
  ];

  //const actions = user?.role === 'admin' ? [...customerActions, ...adminActions] : customerActions;
  let actions;

  if (user?.role === 'admin') {
    actions = [...adminActions];
  } 
  else if (user?.role === 'customer') {
    actions = customerActions;
  } 
  else {
    actions = [];
  }
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        pb: 4
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ pt: 4, pb: 2 }}>          {/* Hero Section */}
          <Fade in={true} timeout={800}>
            <Paper
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 4,
                borderRadius: 3,
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: alpha(theme.palette.common.white, 0.1),
                  borderRadius: '50%',
                  transform: 'translate(50px, -50px)',
                }
              }}
            >
              <Grid container alignItems="center" spacing={3}>
                <Grid item xs={12} md={8}  component="div" {...({} as GridProps)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        mr: 2,
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Welcome back, {user?.firstName}!
                      </Typography>
                      
                      {(user.role) && (
                      <Chip
                        icon={user.role === 'admin' ? <AdminPanelSettings /> : <PersonIcon />}
                        label={capitalize(user?.role)}
                        sx={{
                          backgroundColor: alpha(theme.palette.common.white, 0.2),
                          textAlign: 'center',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    {user?.role === 'admin' 
                      ? 'Manage your hotel operations and monitor performance metrics.'
                      : 'Experience luxury accommodations and world-class service.'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} component="div" {...({} as GridProps)}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Today's Date
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Fade>          {/* Stats Cards for Admin */}
          {user?.role === 'admin' && (
            <Fade in={true} timeout={1000}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
                  <Card sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
                    <CardContent>
                      <DateRangeIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                      {loading ? (
                        <Skeleton width="60%" height={32} sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {dashboardStats?.totalBookings}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Total Bookings
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
                  <Card sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
                    <CardContent>
                      <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                      {loading ? (
                        <Skeleton width="60%" height={32} sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          ${dashboardStats?.totalRevenue?.toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
                  <Card sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Hotel sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                      {loading ? (
                        <Skeleton width="60%" height={32} sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                          {dashboardStats?.occupancyRate}%
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Occupancy Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}

          {/* Quick Actions */}
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Quick Actions
          </Typography>

          <Fade in={true} timeout={1200}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {actions.length !== 0 && actions.map((item, index) => (
                <Grid item xs={12} md={user?.role === 'admin' ? 3 : 6} key={index} component="div" {...({} as GridProps)}>
                  <Card
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: item.gradient,
                      }
                    }}
                    onClick={item.action}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Box 
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: alpha(theme.palette[item.color].main, 0.1),
                          color: theme.palette[item.color].main,
                          mb: 3
                        }}
                      >
                        {item.icon}
                      </Box>
                      
                      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {item.description}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        color={item.color as
                        | "inherit"
                        | "primary"
                        | "secondary"
                        | "error"
                        | "info"
                        | "success"
                        | "warning"}
                        size="large"
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          background: item.gradient,
                          '&:hover': {
                            boxShadow: `0 8px 25px ${alpha(theme.palette[item.color].main, 0.3)}`,
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action();
                        }}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Fade>

          {/* Hotel Amenities */}
          <Fade in={true} timeout={1400}>
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Hotel Amenities
              </Typography>
              <Grid container spacing={2}>
                {hotelAmenities.map((amenity, index) => (
                  <Grid item xs={6} sm={4} md={2} key={index} component="div" {...({} as GridProps)}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          mb: 1
                        }}
                      >
                        {amenity.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {amenity.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>

          
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
