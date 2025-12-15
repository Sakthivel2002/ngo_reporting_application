import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ReportSubmission = () => {
  const [formData, setFormData] = useState({
    ngo_id: '',
    month: new Date(),
    people_helped: '',
    events_conducted: '',
    funds_utilized: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const monthStr = formData.month.toISOString().slice(0, 7);
      const payload = {
        ngo_id: formData.ngo_id,
        month: monthStr,
        people_helped: parseInt(formData.people_helped),
        events_conducted: parseInt(formData.events_conducted),
        funds_utilized: parseFloat(formData.funds_utilized)
      };

      const response = await axios.post('/api/report/', payload);
      setMessage(`Success! ${response.data.created ? 'Created' : 'Updated'} report ${response.data.report_id}`);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Submit Monthly Report
        </Typography>
        
        {message && (
          <Alert severity={message.includes('Success') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="NGO ID"
            value={formData.ngo_id}
            onChange={(e) => setFormData({...formData, ngo_id: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          
          <DatePicker
            label="Month"
            value={formData.month}
            onChange={(newValue) => setFormData({...formData, month: newValue})}
            views={['year', 'month']}
            sx={{ mb: 2, width: '100%' }}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <TextField
            fullWidth
            label="People Helped"
            type="number"
            value={formData.people_helped}
            onChange={(e) => setFormData({...formData, people_helped: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Events Conducted"
            type="number"
            value={formData.events_conducted}
            onChange={(e) => setFormData({...formData, events_conducted: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Funds Utilized (₹)"
            type="number"
            step="0.01"
            value={formData.funds_utilized}
            onChange={(e) => setFormData({...formData, funds_utilized: e.target.value})}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default ReportSubmission;
