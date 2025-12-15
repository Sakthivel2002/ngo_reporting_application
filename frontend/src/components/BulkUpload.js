import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Box, LinearProgress, 
  Alert, Chip, CircularProgress, Paper 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollJobStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/job-status/${id}/`);
        setJobStatus(response.data);
        
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
        }
      } catch (error) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 1000);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/reports/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setJobId(response.data.job_id);
      pollJobStatus(response.data.job_id);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Bulk Report Upload
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CloudUploadIcon sx={{ mr: 2, fontSize: 48 }} color="primary" />
          <Box>
            <Typography variant="h6">Upload CSV File</Typography>
            <Typography variant="body2" color="text.secondary">
              NGO ID, Month (YYYY-MM), People Helped, Events Conducted, Funds Utilized
            </Typography>
          </Box>
        </Box>

        <input
          accept=".csv"
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            size="large"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
          >
            Choose CSV File
          </Button>
        </label>
        
        {file && (
          <Chip 
            label={file.name} 
            color="primary" 
            variant="filled" 
            sx={{ ml: 2 }}
            onDelete={() => setFile(null)}
          />
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleFileUpload}
          disabled={!file || uploading}
          sx={{ ml: 2 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload & Process'}
        </Button>
      </Paper>

      {jobStatus && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Job Status</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography>ID: {jobStatus.id.slice(0, 8)}...</Typography>
            <Typography>Status: <Chip label={jobStatus.status} color="info" /></Typography>
          </Box>
          
          {jobStatus.total_rows && (
            <>
              <Typography>Progress: {jobStatus.processed_rows}/{jobStatus.total_rows}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={jobStatus.progress} 
                sx={{ mt: 1, mb: 2 }}
              />
              <Typography>
                Success: {jobStatus.processed_rows - jobStatus.failed_rows}, 
                Failed: {jobStatus.failed_rows}
              </Typography>
            </>
          )}
          
          {jobStatus.errors && jobStatus.errors.length > 0 && (
            <Alert severity="warning">
              {jobStatus.errors.length} rows failed to process
            </Alert>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default BulkUpload;
