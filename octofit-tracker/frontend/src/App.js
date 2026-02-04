import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import octofitLogo from './octofitapp-small.png';
import './App.css';
import Users from './components/Users';
import Activities from './components/Activities';
import Teams from './components/Teams';

function NavigationBar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={octofitLogo}
            alt="OctoFit Tracker Logo"
            className="octofit-logo"
          />
          OctoFit Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className={isActive('/')}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/users" className={isActive('/users')}>Users</Nav.Link>
            <Nav.Link as={Link} to="/activities" className={isActive('/activities')}>Activities</Nav.Link>
            <Nav.Link as={Link} to="/teams" className={isActive('/teams')}>Teams</Nav.Link>
            <Nav.Link as={Link} to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Nav.Link>
            <Nav.Link as={Link} to="/workouts" className={isActive('/workouts')}>Workouts</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Dashboard() {
  return (
    <Container>
      <div className="main-content">
        <h1>Welcome to OctoFit Tracker!</h1>
        <p className="lead">Track your fitness activities, compete with your team, and achieve your goals!</p>
        
        <div className="row mt-5">
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Track Activities</h5>
              </div>
              <div className="card-body">
                <p className="card-text">Log your workouts, runs, and fitness activities with ease.</p>
                <Link to="/activities" className="btn btn-primary">Get Started</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Join Teams</h5>
              </div>
              <div className="card-body">
                <p className="card-text">Create or join teams and compete together for fitness glory!</p>
                <Link to="/teams" className="btn btn-success">View Teams</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Leaderboard</h5>
              </div>
              <div className="card-body">
                <p className="card-text">Check your ranking and see how you stack up against others!</p>
                <Link to="/leaderboard" className="btn btn-warning">View Rankings</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Table to Showcase Styling */}
        <div className="mt-5">
          <h2>Recent Activities</h2>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Morning Run</td>
                <td><span className="badge bg-primary">Running</span></td>
                <td>45 min</td>
                <td>450</td>
                <td>2026-02-04</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-info">View</button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Strength Training</td>
                <td><span className="badge bg-success">Weights</span></td>
                <td>60 min</td>
                <td>300</td>
                <td>2026-02-03</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-info">View</button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Evening Yoga</td>
                <td><span className="badge bg-secondary">Yoga</span></td>
                <td>30 min</td>
                <td>150</td>
                <td>2026-02-02</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-info">View</button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/leaderboard" element={<div className="container"><div className="main-content"><h1>Leaderboard</h1><p>Leaderboard page coming soon!</p></div></div>} />
          <Route path="/workouts" element={<div className="container"><div className="main-content"><h1>Workouts</h1><p>Workouts page coming soon!</p></div></div>} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <Container>
            <p>&copy; 2026 OctoFit Tracker. Built with ❤️ using React & Bootstrap</p>
            <p>
              <a href="https://github.com">GitHub</a> | <a href="/about">About</a> | <a href="/contact">Contact</a>
            </p>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;
