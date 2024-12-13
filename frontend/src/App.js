import React, { useState } from 'react';
import './App.css';
import AdminPage from './AdminPage';
import FacultyPage from './FacultyPage';
import logo from './images/set-bright-school-stationery-orange-wall_197531-12538.jpg';  // Import the logo image

function App() {
  const [page, setPage] = useState('home');

  const navigateToAdmin = () => {
    setPage('admin');
  };

  const navigateToFaculty = () => {
    setPage('faculty');
  };

  const handleBack = () => {
    setPage('home');
  };

  // Set background image style
  const homePageStyle = {
    background: `url(${logo}) center center no-repeat`,
    backgroundSize: 'cover',
    height: '100vh', // Adjust this to control the height
    color: '#fff',  // Optional: For better contrast on the text
  };

  return (
    <div className="App">
      {page === 'home' && (
        <div className="home-page" style={homePageStyle}>
          <h1>Welcome to the Attendance System</h1>
          <p>Select your role to continue:</p>
          <div className="button-group">
            <button className="role-button" onClick={navigateToAdmin}>
              Admin
            </button>
            <button className="role-button" onClick={navigateToFaculty}>
              Faculty
            </button>
          </div>
        </div>
      )}

      {page === 'admin' && <AdminPage onBack={handleBack} />}
      {page === 'faculty' && <FacultyPage onBack={handleBack} />}
    </div>
  );
}

export default App;
