import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import octofitLogo from './octofitapp-small.png';
import './App.css';
import Users from './components/Users';
import Activities from './components/Activities';
import Teams from './components/Teams';
import Leaderboard from './components/Leaderboard';
import Workouts from './components/Workouts';

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
        <h1>Welcome to OctoFit Tracker! 🎯</h1>
        <p className="lead">Track your fitness activities, compete with your team, and achieve your goals!</p>
        
        <Row className="mt-5">
          <Col md={6} lg={3} className="mb-4">
            <Link to="/users" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">👥 Users</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>View and manage user profiles and fitness statistics.</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Link to="/activities" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">🏃 Activities</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>Log your workouts, runs, and fitness activities with ease.</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          
          <Col md={6} lg={3} className="mb-4">
            <Link to="/teams" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">🏆 Teams</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>Create or join teams and compete together for fitness glory!</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          
          <Col md={6} lg={3} className="mb-4">
            <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">🏅 Leaderboard</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>Check your ranking and see how you stack up against others!</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Workouts Card */}
        <Row className="mt-4">
          <Col md={12} className="mb-4">
            <Link to="/workouts" style={{ textDecoration: 'none' }}>
              <Card className="shadow-sm" style={{ cursor: 'pointer' }}>
                <Card.Header className="bg-gradient">
                  <h5 className="mb-0 text-white">💪 Workout Plans</h5>
                </Card.Header>
                <Card.Body>
                  <Card.Text>Discover personalized workout suggestions tailored to your fitness goals and level!</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Sample Table to Showcase Styling */}
        <div className="mt-5">
          <h2>Recent Activities</h2>
          <Table striped bordered hover responsive className="table mt-4">
            <thead className="table-dark">
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
                <td><Badge bg="primary">Running</Badge></td>
                <td>45 min</td>
                <td>450</td>
                <td>2026-02-04</td>
                <td>
                  <div className="btn-group">
                    <Button size="sm" variant="info">View</Button>
                    <Button size="sm" variant="warning">Edit</Button>
                    <Button size="sm" variant="danger">Delete</Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Strength Training</td>
                <td><Badge bg="success">Weights</Badge></td>
                <td>60 min</td>
                <td>300</td>
                <td>2026-02-03</td>
                <td>
                  <div className="btn-group">
                    <Button size="sm" variant="info">View</Button>
                    <Button size="sm" variant="warning">Edit</Button>
                    <Button size="sm" variant="danger">Delete</Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Evening Yoga</td>
                <td><Badge bg="secondary">Yoga</Badge></td>
                <td>30 min</td>
                <td>150</td>
                <td>2026-02-02</td>
                <td>
                  <div className="btn-group">
                    <Button size="sm" variant="info">View</Button>
                    <Button size="sm" variant="warning">Edit</Button>
                    <Button size="sm" variant="danger">Delete</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/workouts" element={<Workouts />} />
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
