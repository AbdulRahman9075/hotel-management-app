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


const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const CleaningStaffPanel = () => {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cleaningRequests, setCleaningRequests] = useState(null);
  const [cleaningData, setCleaningData] = useState({
      cleaning_id: null,
      status: 'assigned'
  });
  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data from all available endpoints
      const [cleaningRes] = await Promise.all([
        axios.get('http://localhost:5000/api/cleaning-request-details', { headers })
      ]);
      console.log(cleaningRes);
      // Extract data from the responses
      setRequests(cleaningRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const updateRequestStatus = async () => {
    setLoading(true);
    setError('');
  
    try {
      const cleaningPayload = {
        cleaning_id: cleaningData.cleaning_id,
        status: cleaningData.status
      };
      const actionPayload = {
        action: `cleaning Request:${cleaningData.cleaning_id} ${cleaningData.status}`
      }

      const response = await axios.put('/api/cleaning-requests/update', cleaningPayload);
      const activitylogresp = await axios.post('/api/create-activity-log', actionPayload);
      console.log(activitylogresp);
      setSuccess(`Request Status Updated! Cleaning ID: ${cleaningPayload.cleaning_id}`);
      setOpenRequestDialog(false);
      setSelectedRequest(null);
      
      fetchDashboardData();

      // Reset form
      setCleaningData({
        cleaning_id: null,
        status: 'assigned'
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update cleaning request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'assigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      case 'assigned':
        return <Pending />;
      default:
        return <Pending />;
    }
  };

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
           Cleaning Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your cleaning requests
          </Typography>
        </Box>
      </Fade>
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

      
      {/*********Cleaning Requests********/}
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
              Cleaning Requests
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Request Date</TableCell>
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
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No Cleaning Requests
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.slice(0, 10).map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.room_number}</TableCell>
                        <TableCell>{user.room_type_name}</TableCell>
                        <TableCell>
                            <Chip
                            icon={getStatusIcon(user.status)}
                            label={user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                            color={getStatusColor(user.status)}
                            size="small"
                            />
                        </TableCell>
                        <TableCell>{user.request_type || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(user.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="warning"
                            onClick={() => {
                              setSelectedRequest(user);
                              setOpenRequestDialog(true);
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

      {/* Request Details Dialog */}
      <Dialog
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6">{selectedRequest.room_type_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {selectedRequest.id}
                  </Typography>
                </Box>
              </Box>
                        {/* // <TableCell>{user.id}</TableCell>
                        // <TableCell>{user.room_number}</TableCell>
                        // <TableCell>{user.room_type_name}</TableCell>
                        // <TableCell>{user.status}</TableCell>
                        // <TableCell>{user.request_type}</TableCell>
                        // <TableCell>
                        //   {new Date(user.request_date).toLocaleDateString()}
                        // </TableCell> */}
              <Grid container spacing={2}>
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    value={selectedRequest.room_number || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label="Request Type"
                    value={selectedRequest.request_type || 'Not provided'}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} component="div" {...({} as GridProps)}>
                  <TextField
                    fullWidth
                    label={"Request Date"}
                    value={new Date(selectedRequest.request_date).toLocaleDateString()}
                    disabled
                  />
                </Grid>
                {selectedRequest.notes && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#bce7f1d6', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Notes:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {selectedRequest.notes}
                    </Typography>
                    </Box>
                )}

                
                {/* <Grid item xs={12} component="div" {...({} as GridProps)}>
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
                              <MenuItem key={req.id} value={req.id}>
                                {req.id}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                </Grid> */}

                <Grid item xs={12} sm={6} component="div" {...({} as GridProps)}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={cleaningData.status}
                  onChange={(e) => setCleaningData({
                    ...cleaningData,
                    cleaning_id:selectedRequest.id,
                    status: e.target.value
                    })}
                >
                  
                  {(selectedRequest.status == "assigned") && (<MenuItem value="in_progress">In Progress</MenuItem>)}
                  {(selectedRequest.status == "in_progress") && (<MenuItem value="completed">Completed</MenuItem>)}
                </TextField>
              </Grid>
                
            



              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Close</Button>
          <Button onClick={updateRequestStatus}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CleaningStaffPanel;