import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReportSubmission from './components/ReportSubmission';
import BulkUpload from './components/BulkUpload';
import AdminDashboard from './components/AdminDashboard';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { Container } from '@mui/material';


const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              NGO Reporting System
            </Typography>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>
              Single Report
            </Link>
            <Link to="/bulk" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>
              Bulk Upload
            </Link>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              Admin Dashboard
            </Link>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<ReportSubmission />} />
            <Route path="/bulk" element={<BulkUpload />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
