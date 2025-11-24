import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Fade,
  useTheme,
  alpha,
  CardMedia,
  Divider,
  IconButton
  
} from '@mui/material';
import Grid,{GridProps} from "@mui/material/Grid";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { 
  Hotel, 
  People, 
  AttachMoney,
  KingBed,
  Wifi,
  LocalParking,
  FitnessCenter,
  Restaurant,
  Balcony,
  Tv,
  Pool,
  Spa,
  RoomService,
  AcUnit,
  CalendarToday,
  LocationOn,
  Star,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import dayjs, { Dayjs } from "dayjs";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RoomBooking = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [bookingData, setBookingData] = useState({
    checkInDate: dayjs().add(1, 'day'),
    checkOutDate: dayjs().add(2, 'day'),
    guests: 1,
    specialRequests: ''
  });

  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      const roomsData = response.data;

      // For each room, fetch image URLs
      const roomsWithImages = await Promise.all(
        roomsData.map(async (room) => {
          try {
            console.log(room.room_type_id);
            const imgRes = await axios.get(`/api/room-images/${room.room_type_id}`);
            // Save the first image or null if none
            const imageUrl = imgRes.data.images.length > 0 ? imgRes.data.images[0] : null;
            return { ...room, imageUrl };
          } catch (err) {
            console.error(`Failed to fetch images for room type ${room.room_type_id}`);
            return { ...room, imageUrl: null };
          }
        })
      );

      setRooms(roomsWithImages);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rooms');
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingPayload = {
        room_id: selectedRoom.id,
        check_in_date: bookingData.checkInDate.format('YYYY-MM-DD'),
        check_out_date: bookingData.checkOutDate.format('YYYY-MM-DD'),
        guests: bookingData.guests,
        special_requests: bookingData.specialRequests
      };

      const response = await axios.post('/api/bookings', bookingPayload);
      
      setSuccess(`Booking successful! Booking ID: ${response.data.bookingId}`);

      fetchRooms();

      
      setBookingDialog(false);
      setSelectedRoom(null);
      
      // Reset form
      setBookingData({
        checkInDate: dayjs().add(1, 'day'),
        checkOutDate: dayjs().add(2, 'day'),
        guests: 1,
        specialRequests: ''
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    return bookingData.checkOutDate.diff(bookingData.checkInDate, 'day');
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price_per_night * calculateNights();
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%), url('/hotel-hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={1000}>
            <Box>
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
                Find Your Room
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>          {rooms.map((room) => (
            <Grid item xs={12} md={6} lg={4} key={room.id} component="div" {...({} as GridProps)}>
              <Fade in={true} timeout={800} style={{ transitionDelay: `${rooms.indexOf(room) * 100}ms` }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={room.imageUrl || '/placeholder-room.jpg'}
                      alt={`Room ${room.room_number}`}
                      sx={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        p: 0.5,
                      }}
                    >
                    </Box>
                    <Chip 
                      label={room.status} 
                      color={room.status === 'available' ? 'success' : 'error'}
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Room {room.room_number}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h5" color="primary.main" gutterBottom sx={{ fontWeight: 700 }}>
                      {room.room_type_name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                      {room.room_type_description}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} component="div" {...({} as GridProps)}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Floor {room.floor}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} component="div" {...({} as GridProps)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography 
                            variant="h5" 
                            color="primary.main" 
                            sx={{ fontWeight: 700 }}
                          >
                            ${room.price_per_night}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            /night
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Amenities:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {room.amenities?.includes('WiFi') && (
                          <Chip label="WiFi" icon={<Wifi />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('TV') && (
                          <Chip label="TV" icon={<Tv />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('Fitness') && (
                          <Chip label="Fitness" icon={<FitnessCenter />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('Mini Bar') && (
                          <Chip label="Mini Bar" icon={<Restaurant />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('Balcony') && (
                          <Chip label="Balcony" icon={<Balcony />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('Spa') && (
                          <Chip label="Spa" icon={<Spa />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('Room Service') && (
                          <Chip label="Room Service" icon={<RoomService />} size="small" variant="outlined" />
                        )}
                        {room.amenities?.includes('AC') && (
                          <Chip label="AC" icon={<AcUnit />} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBookRoom(room)}
                      disabled={room.status !== 'available'}
                      size="large"
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: room.status === 'available' 
                          ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`
                          : theme.palette.grey[300],
                        '&:hover': {
                          background: room.status === 'available' 
                            ? `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
                            : theme.palette.grey[300],
                          boxShadow: room.status === 'available' ? '0 6px 20px rgba(44, 62, 80, 0.3)' : 'none',
                        },
                        '&:disabled': {
                          background: theme.palette.grey[300],
                          color: theme.palette.grey[600],
                        }
                      }}
                    >
                      {room.status === 'available' ? 'Book Now' : 'Not Available'}
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Book Room {selectedRoom?.room_number} - {selectedRoom?.room_type_name}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <DatePicker
                  label="Check-in Date"
                  value={bookingData.checkInDate}
                  onChange={(newValue) => setBookingData({
                    ...bookingData,
                    checkInDate: newValue
                  })}
                  minDate={dayjs()}
                  // renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <DatePicker
                  label="Check-out Date"
                  value={bookingData.checkOutDate}
                  onChange={(newValue) => setBookingData({
                    ...bookingData,
                    checkOutDate: newValue
                  })}
                  minDate={bookingData.checkInDate.add(1, 'day')}
                  //renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} component="div" {...({} as GridProps)}>
                <FormControl fullWidth>
                  <InputLabel>Number of Guests</InputLabel>
                  <Select
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      guests: e.target.value
                    })}
                    label="Number of Guests"
                  >
                    {Array.from(
                      { length: selectedRoom?.max_occupancy},
                      (_, i) => i + 1
                    ).map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              
              <Grid item xs={12} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Special Requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    specialRequests: e.target.value
                  })}
                  multiline
                  rows={3}
                  placeholder="Any special requests or preferences..."
                />
              </Grid>
              
              {selectedRoom && (
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Booking Summary
                    </Typography>
                    <Typography variant="body2">
                      Nights: {calculateNights()}
                    </Typography>
                    <Typography variant="body2">
                      Rate: ${selectedRoom.price_per_night}/night
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      Total: ${calculateTotalPrice()}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              variant="contained"
              disabled={loading || calculateNights() <= 0}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogActions>        </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default RoomBooking;
