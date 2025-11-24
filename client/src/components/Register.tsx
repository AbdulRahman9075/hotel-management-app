import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  LinearProgress,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import Grid,{GridProps} from "@mui/material/Grid";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  AccountCircle,
  Hotel as HotelIcon,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    cnic: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 75) {
      setError('Password should be stronger. Include uppercase, lowercase, numbers, and be at least 8 characters.');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return theme.palette.error.main;
    if (passwordStrength < 50) return theme.palette.warning.main;
    if (passwordStrength < 75) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
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
          <Grid container spacing={4} alignItems="center">
            {/* Right side - Registration Form */}
            <Grid item xs={12} md={7} component="div" {...({} as GridProps)}>
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
                  Register as a Customer
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

                {success && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': { fontSize: '0.9rem' }
                    }}
                  >
                    {success}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="CNIC"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
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
                      />
                      {formData.password && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              Password Strength:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: getPasswordStrengthColor(),
                                fontWeight: 600 
                              }}
                            >
                              {getPasswordStrengthText()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.grey[400], 0.3),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getPasswordStrengthColor(),
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                        helperText={
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'Passwords do not match'
                            : ''
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* <Grid item xs={12} component="div" {...({} as GridProps)}>
                      <FormControl fullWidth required>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          label="Account Type"
                        >
                          <MenuItem value="customer">Customer</MenuItem>
                          <MenuItem value="admin">Administrator</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid> */}
                  </Grid>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || passwordStrength < 75}
                    size="large"
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                        boxShadow: '0 6px 20px rgba(44, 62, 80, 0.3)',
                      },
                      '&:disabled': {
                        background: theme.palette.grey[300],
                      }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Button 
                        variant="text" 
                        onClick={() => navigate('/login')}
                        sx={{ fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Sign In Here
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
