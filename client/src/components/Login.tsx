import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
  alpha
} from '@mui/material';

import Grid,{GridProps} from "@mui/material/Grid";

import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Hotel as HotelIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {/* Left side - Branding */}
            {/* <Grid item xs={12} md={6} component="div" {...({} as GridProps)}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
                  <HotelIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 2 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Luxury Hotel
                  </Typography>
                </Box>
              </Box>
            </Grid> */}

            {/* Right side - Login Form */}
            <Grid item xs={12} md={6} component="div" {...({} as GridProps)}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
                  Login
                </Typography>
                
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': { fontSize: '0.9rem' }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    size="large"
                    sx={{ 
                      mt: 2, 
                      mb: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                        boxShadow: '0 6px 20px rgba(44, 62, 80, 0.3)',
                      }
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Button 
                        variant="text" 
                        onClick={() => navigate('/register')}
                        sx={{ fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Create Account
                      </Button>
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Demo Accounts
                  </Typography>
                </Divider>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          borderColor: theme.palette.warning.main
                        }
                      }}
                      onClick={() => handleDemoLogin('admin@hotel.com', 'admin123')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 ,mt:1}}>
                        {/* <AdminIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mb: 1 }} /> */}
                        <Typography variant="subtitle2" fontWeight={600}>
                          Admin
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          borderColor: theme.palette.info.main
                        }
                      }}
                      onClick={() => handleDemoLogin('ali@example.com', 'customer123')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2,mt:1 }}>
                        {/* <PersonIcon sx={{ fontSize: 32, color: theme.palette.info.main, mb: 1 }} /> */}
                        <Typography variant="subtitle2" fontWeight={600}>
                          Customer
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          borderColor: theme.palette.warning.main
                        }
                      }}
                      onClick={() => handleDemoLogin('receptionist@example.com', 'reception123')}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2,mt:1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Receptionist
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid> */}
                  <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          borderColor: theme.palette.warning.main
                        }
                      }}
                      onClick={() => handleDemoLogin('cleaningstaff@example.com', 'staff123')}
                    >
                      <CardContent sx={{textAlign:'center', py: 2 ,mt:1 }}>
                        {/* <AdminIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mb: 1 }} /> */}
                        <Typography variant="subtitle2" fontWeight={600}>
                          Staff
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
              
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
