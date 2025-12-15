import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Grid,
  Button, Chip, Box, Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

const AdminDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const monthStr = selectedMonth.toISOString().slice(0, 7);
    console.log('Fetching:', `/api/dashboard/?month=${monthStr}`);  
    const response = await axios.get(`/api/dashboard/?month=${monthStr}`);
    console.log('API Response:', response.data);  
    setDashboardData(response.data);
  } catch (error) {
    console.error('Dashboard error:', error.response?.data || error.message);
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
          Admin Dashboard
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Select Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              views={['year', 'month']}
              slotProps={{ textField: { sx: { minWidth: 200 } } }}
            />
            <Button 
              variant="contained" 
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Box>
        </Paper>

        {dashboardData && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total NGOs Reporting
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.total_ngos}
                  </Typography>
                  <Chip label={dashboardData.month} size="small" color="primary" />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total People Helped
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.total_people_helped.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Events
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.total_events.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Funds (₹)
                  </Typography>
                  <Typography variant="h4" component="div">
                    ₹{dashboardData.total_funds.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default AdminDashboard;
