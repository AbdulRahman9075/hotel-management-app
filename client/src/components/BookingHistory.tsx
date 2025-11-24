import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Fade,
  useTheme,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Button,
  Skeleton,
  Divider
} from '@mui/material';
import Grid,{GridProps} from "@mui/material/Grid";
import {
  Hotel,
  CalendarToday,
  People,
  AttachMoney,
  Visibility,
  Cancel,
  CheckCircle,
  CleaningServices,
  Schedule,
  LocationOn,
  Receipt
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { orange } from '@mui/material/colors';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  //
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [cleaningDialog, setCleaningDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
      rating: 5,
      comment: ''
    });

  const [cleaningData, setCleaningData] = useState({
      request_type: '',
      notes: ''
    });




  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data);
    } catch (error) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'checked_in':
        return 'info';
      case 'checked_out':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };



  

  const handleTransaction = async (booking) => {
    setLoading(true);
    setError('');

    try {
      const transactionPayload = {
        booking_id: booking.id,
        amount: Number(booking.total_amount),
        payment_method: 'cash',
        
      };
      console.log(transactionPayload);
      const response = await axios.post('/api/transactions', transactionPayload);
      console.log(response)
      setSuccess(`Payment Successful for Booking ID: ${transactionPayload.booking_id}`);
      await fetchBookings();

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process transaction');
    } finally {
      setLoading(false);
    }

  }
  const handleReviewSubmit = async () => {
      setLoading(true);
      setError('');
  
      try {
        const reviewPayload = {
          booking_id: selectedBooking.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        };
        const response = await axios.post('/api/reviews', reviewPayload);
        
        setSuccess(`Review Submitted! Booking ID: ${reviewPayload.booking_id}`);
        setReviewDialog(false);
        setSelectedBooking(null);
        
        // Reset form
        setReviewData({
          rating: 5,
          comment: ''
        });
  
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to give review');
      } finally {
        setLoading(false);
      }
    };

  const makeCleaningRequest = async () => {
    setLoading(true);
    setError('');
  
    try {
      const cleaningPayload = {
        booking_id: selectedBooking.id,
        request_type: cleaningData.request_type,
        notes: cleaningData.notes
      };
      const response = await axios.post('/api/cleaning-requests', cleaningPayload);
      
      setSuccess(`Request Submitted! Booking ID: ${cleaningPayload.booking_id}`);
      setCleaningDialog(false);
      setSelectedBooking(null);
      
      // Reset form
      setCleaningData({
        request_type: '',
        notes: ''
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send cleaning request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ pt: 8, pb: 4 }}>
            <Skeleton variant="text" width="60%" height={80} sx={{ mx: 'auto', mb: 4 }} />
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} key={item} component="div" {...({} as GridProps)}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={1000}>
            <Box>
              <Receipt sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Booking History
              </Typography>
              <Typography 
                variant="h5" 
                sx={{
                  opacity: 0.9,
                  maxWidth: 600,
                  mx: 'auto',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Track your reservations and past stays
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
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


          {bookings.length === 0 ? (
            <Fade in={true} timeout={800}>
              <Card 
                sx={{
                  textAlign: 'center',
                  py: 8,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <CardContent>
                  <Receipt sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    No Bookings Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You haven't made any bookings yet. Start exploring our rooms!
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 3 }}
                    onClick={() => window.location.href = '/book-room'}
                  >
                    Browse Rooms
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          ) : (
            
            <Grid container spacing={3}>
              {bookings.map((booking, index) => (
                <Grid item xs={12} key={booking.id} component="div" {...({} as GridProps)}>
                  <Fade in={true} timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card 
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        },
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} md={8} component="div" {...({} as GridProps)}>
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  Room {booking.room_number} - {booking.room_type_name}
                                </Typography>
                                
                                { (user.role === 'customer') && (
                                  <>
                                  <Chip 
                                    label={booking.booking_status} 
                                    color={getStatusColor(booking.booking_status)}
                                    sx={{
                                      ml: 2,
                                      fontWeight: 600,
                                      textTransform: 'capitalize'
                                    }}
                                  />
                                  { (booking.booking_status === 'unpaid') && (
                                  <Button 
                                    variant="contained" 
                                    sx={{ 
                                      marginLeft: 5,
                                      
                                    }}
                                    onClick={() => {
                                      handleTransaction(booking);
                                    }}
                                    
                                  >
                                    Pay
                                  </Button>
                                  )}
                                  <Button
                                    
                                    variant="contained"
                                    onClick={()=> {
                                      setSelectedBooking(booking);
                                      setReviewDialog(true);
                                    }}
                                    
                                    sx={{
                                      marginLeft: 5,
                                    }}
                                  >
                                    Review
                                  </Button>
                                </>
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Booking ID: {booking.id}
                              </Typography>
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarToday sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Check-in: {formatDate(booking.check_in_date)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Schedule sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Check-out: {formatDate(booking.check_out_date)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <People sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Guests: {booking.guests}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <LocationOn sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Floor: {booking.floor}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {booking.special_requests && (
                              <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  Special Requests:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {booking.special_requests}
                                </Typography>
                              </Box>
                            )}
                          </Grid>

                          <Grid item xs={12} md={4} component="div" {...({} as GridProps)}>
                            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 2 }}>
                                <AttachMoney sx={{ color: 'primary.main'}} />
                                <Typography 
                                  variant="h4" 
                                  color="primary.main" 
                                  sx={{ fontWeight: 700 }}
                                >
                                  {booking.total_amount}
                                </Typography>
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Booked on: {formatDate(booking.booking_date)}
                              </Typography>
                              {(booking.booking_status == 'confirmed') && (
                                <IconButton 
                                  onClick={() =>
                                    {
                                      setSelectedBooking(booking);
                                      setCleaningDialog(true);

                                    }
                                  } 
                                  sx={{ 
                                    color: theme.palette.grey[600],
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                    }
                                  }}
                                >
                                  <CleaningServices/>
                                </IconButton>
                              )}
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                
                                
                                {/* {booking.booking_status === 'pending' && (
                                  <Tooltip title="Cancel Booking">
                                    <IconButton 
                                      color="error"
                                      sx={{ 
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                        '&:hover': {
                                          bgcolor: alpha(theme.palette.error.main, 0.2),
                                        }
                                      }}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                )} */}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>



              ))}
            </Grid>
          )}
        </Box>
      </Container>
    
    <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>
                    Give Review <br/>{selectedBooking?.room_number} - {selectedBooking?.room_type_name}
                  </DialogTitle>
                  
                  <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Check-in Date"
                          value={selectedBooking?.check_in_date ? new Date(selectedBooking?.check_in_date).toLocaleDateString() : ''}
                          disabled
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Check-out Date"
                          value={selectedBooking?.check_out_date ? new Date(selectedBooking?.check_out_date).toLocaleDateString() : ''}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} component="div" {...({} as GridProps)}>
                        <FormControl fullWidth>
                          <InputLabel>Rating</InputLabel>
                          <Select
                            value={reviewData.rating}
                            onChange={(e) => setReviewData({
                              ...reviewData,
                              rating: e.target.value
                            })}
                            label="Number of Guests"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <MenuItem key={num} value={num}>{num}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Comment"
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            comment: e.target.value
                          })}
                          multiline
                          rows={3}
                          placeholder="comment your experience.."
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  
                  <DialogActions>
                    <Button onClick={() => setReviewDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReviewSubmit}
                      variant="contained"
                    >
                      {loading ? 'Review...' : 'Submit Review'}
                    </Button>
                  </DialogActions>        </Dialog>

    <Dialog open={cleaningDialog} onClose={() => setCleaningDialog(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>
                    Cleaning Request Details <br/>{selectedBooking?.room_number} - {selectedBooking?.room_type_name}
                  </DialogTitle>
                  
                  <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Check-in Date"
                          value={selectedBooking?.check_in_date ? new Date(selectedBooking?.check_in_date).toLocaleDateString() : ''}
                          disabled
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Check-out Date"
                          value={selectedBooking?.check_out_date ? new Date(selectedBooking?.check_out_date).toLocaleDateString() : ''}
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Request Type"
                          value={cleaningData.request_type}
                          onChange={(e) => setCleaningData({
                            ...cleaningData,
                            request_type: e.target.value
                          })}
                          rows={1}
                          placeholder="Define type"
                        />
                      </Grid>
                      <Grid item xs={12} component="div" {...({} as GridProps)}>
                        <TextField
                          fullWidth
                          label="Notes"
                          value={cleaningData.notes}
                          onChange={(e) => setCleaningData({
                            ...cleaningData,
                            notes: e.target.value
                          })}
                          multiline
                          rows={3}
                          placeholder="Any further details..."
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  
                  <DialogActions>
                    <Button onClick={() => setCleaningDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={makeCleaningRequest}
                      variant="contained"
                    >
                      {loading ? 'Request...' : 'Submit Request'}
                    </Button>
                  </DialogActions>        </Dialog>
    
    </Box>
  );
};

export default BookingHistory;
