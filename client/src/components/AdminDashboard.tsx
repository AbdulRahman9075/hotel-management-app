//room_type_name
//customer_name
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  useTheme,
  Skeleton,
  Alert,
  Fade,
  Zoom
} from '@mui/material';
import Grid,{GridProps} from "@mui/material/Grid";
import {
  People,
  Hotel,
  AttachMoney,
  TrendingUp,
  Visibility,
  Edit,
  Delete,
  Add,
  PersonAdd,
  Dashboard as DashboardIcon,
  CalendarToday,
  CheckCircle,
  Cancel,
  Pending
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
  color: 'white',
  borderRadius: 16,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const AdminDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<{ [key: string]: number }>({
    totalUsers: 0,
    totalRooms: 0,
    totalRevenue: 0,
    totalBookings: 0
  });
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cleaningRequests, setCleaningRequests] = useState(null);
  const [currentBookings, setCurrentBookings] = useState(true);
  const [cleaningData, setCleaningData] = useState({
      cleaning_id: null,
      staff_id: null
  });
  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data from all available endpoints
      const [dashboardRes, bookingsRes, usersRes, roomsRes,customerRes,staffRes,CleaningRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard', { headers }),
        axios.get('http://localhost:5000/api/bookings', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers }),
        axios.get('http://localhost:5000/api/admin/rooms', { headers }),
        axios.get('http://localhost:5000/api/admin/customers', { headers }),
        axios.get('http://localhost:5000/api/admin/staff', { headers }),
        axios.get('http://localhost:5000/api/cleaning-requests', { headers })
      ]);
      // console.log(roomsRes);
      // Extract data from the responses
      const { stats } = dashboardRes.data;
      
      setStats(stats);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
      setCustomers(customerRes.data);
      setStaff(staffRes.data);
      setCleaningRequests(CleaningRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/bookings/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      setOpenBookingDialog(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking status');
    }
  };

  const assignCleaningRequest = async () => {
    setLoading(true);
    setError('');
  
    try {
      const cleaningPayload = {
        cleaning_id: cleaningData.cleaning_id,
        staff_id: cleaningData.staff_id
      };
      console.log(cleaningPayload);
      const response = await axios.put('/api/admin/cleaning-requests/assign', cleaningPayload);
      
      setSuccess(`Request Assigned! Staff ID: ${cleaningPayload.staff_id}`);

      fetchDashboardData();
      
      setOpenUserDialog(false);
      setSelectedUser(null);
      
      // Reset form
      setCleaningData({
        cleaning_id: null,
        staff_id: null
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign cleaning request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'unpaid':
        return 'warning';
      default:
        return 'default';
    }
  };
  const toggleCurrentBookings = () => {
    if(currentBookings){
      setCurrentBookings(false);
    }
    else{
      setCurrentBookings(true);
    }
  }
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      case 'unpaid':
        return <Pending />;
      default:
        return <Pending />;
    }
  };

  const StatCardComponent = ({ title, value, icon, color, subtitle }) => (
    <Zoom in={!loading} timeout={600}>
      <StatCard color={color}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" component="div" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
                {loading ? <Skeleton width={60} /> : value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </StatCard>
    </Zoom>
  );
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <DashboardIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your hotel operations efficiently
          </Typography>
        </Box>
      </Fade>      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
          <StatCardComponent
            title="Total Customers"
            value={stats.total_customers}
            icon={<People sx={{ fontSize: 30 }} />}
            color="#4CAF50"
            subtitle="Registered customers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
          <StatCardComponent
            title="Total Rooms"
            value={stats.total_rooms}
            icon={<Hotel sx={{ fontSize: 30 }} />}
            color="#2196F3"
            subtitle="All rooms"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
          <StatCardComponent
            title="Today's Revenue"
            value={`$${stats.today_revenue?.toLocaleString() || 0}`}
            icon={<AttachMoney sx={{ fontSize: 30 }} />}
            color="#FF9800"
            subtitle="Today's earnings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div" {...({} as GridProps)}>
          <StatCardComponent
            title="Active Bookings"
            value={stats.active_bookings}
            icon={<CalendarToday sx={{ fontSize: 30 }} />}
            color="#9C27B0"
            subtitle="Confirmed bookings"
          />
        </Grid>
      </Grid>
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

      <Fade in={true} timeout={1000}>
        <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Bookings
            </Typography>

            <Button
              variant="contained"
              onClick={toggleCurrentBookings}
              sx={{
                bgcolor: currentBookings ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                color: currentBookings ? '#000' : '#fff',
                '&:hover': {
                  bgcolor: currentBookings ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                }
              }}
            >
              Current Only
            </Button>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check-in</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check-out</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton height={30} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No bookings found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (                    bookings.filter(
                                      (booking) => {
                      if (currentBookings) {
                        const today = new Date().setHours(0, 0, 0, 0);
                        const checkout = new Date(booking.check_out_date).setHours(0, 0, 0, 0);
                        return checkout >= today;
                      }
                      return true; 
                    }
                  ).slice(0, 10).map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{`${booking.first_name} ${booking.last_name}`}</TableCell>
                        <TableCell>{booking.room_number} - {booking.room_type_name}</TableCell>
                        <TableCell>{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(booking.check_out_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(booking.booking_status)}
                            label={booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                            color={getStatusColor(booking.booking_status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="warning"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setOpenBookingDialog(true);
                            }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/********CUSTOMERS*******/}
      <Fade in={true} timeout={1200}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              p: 2
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Current Customers
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton height={30} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No Customers Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.slice(0, 10).map((user) => (
                      <TableRow key={user.customer_id} hover>
                        <TableCell>{user.customer_id}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                              {user.first_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            {(user.first_name+' '+user.last_name)}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="warning"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenUserDialog(true);
                            }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>
      {/*********STAFF********/}
      <Fade in={true} timeout={1200}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              p: 2
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Staff
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hired On</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton height={30} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No Staff Available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.slice(0, 10).map((user) => (
                      <TableRow key={user.staff_id} hover>
                        <TableCell>{user.staff_id}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                              {user.first_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            {(user.first_name+' '+user.last_name)}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>{user.role || 'N/A'}</TableCell>
                        <TableCell>
                          {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="warning"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenUserDialog(true);
                            }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/*************************/}


      {/* Booking Details Dialog */}
      <Dialog
        open={openBookingDialog}
        onClose={() => setOpenBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Booking Details - #{selectedBooking?.id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={(selectedBooking.first_name+' '+selectedBooking.last_name) || selectedBooking.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Room"
                  value={selectedBooking.room_number || selectedBooking.room_type_name || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  value={selectedBooking.check_in_date ? new Date(selectedBooking.check_in_date).toLocaleDateString() : ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Check-out Date"
                  value={selectedBooking.check_out_date ? new Date(selectedBooking.check_out_date).toLocaleDateString() : ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  value={`$${selectedBooking.total_amount || 0}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={selectedBooking.booking_status}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
                >
                  <MenuItem value="checked_in">Checked In</MenuItem>
                  <MenuItem value="checked_out">Checked Out</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateBookingStatus(selectedBooking?.id, selectedBooking?.status)}
            variant="contained"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Details - {(selectedUser?.first_name+' '+selectedUser?.last_name)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: theme.palette.primary.main }}>
                  {selectedUser.first_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{(selectedUser?.first_name+' '+selectedUser?.last_name)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {selectedUser.role?selectedUser.staff_id:selectedUser.customer_id}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={selectedUser.email || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={selectedUser.phone || 'Not provided'}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label={selectedUser.role?"Hire Date":"Joined Date"}
                    value={selectedUser.role?new Date(selectedUser.hire_date).toLocaleDateString():new Date(selectedUser.created_at).toLocaleDateString()}
                    disabled
                  />
                </Grid>
                {(selectedUser.role) && (
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label= "Role"
                    value={selectedUser.role}
                    disabled
                  />
                </Grid>
                )}

                {(selectedUser.role && selectedUser.role=='cleaning') && (
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <FormControl fullWidth>
                          <InputLabel></InputLabel>
                          <Select
                            value={cleaningData.staff_id}
                            onChange={(e) => setCleaningData({
                              ...cleaningData,
                              cleaning_id:e.target.value,
                              staff_id: selectedUser.staff_id
                            })}
                            label="Cleaning Requests"
                          >
                            {cleaningRequests.map(req => (
                              
                              (req.status === 'pending') && <MenuItem key={req.id} value={req.id}>
                                {req.id}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                  <Button sx = {{mt: 2}} onClick={assignCleaningRequest}>Assign</Button>
                </Grid>
                
                )}



              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;