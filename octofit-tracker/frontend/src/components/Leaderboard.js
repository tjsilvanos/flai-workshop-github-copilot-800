import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { apiService } from '../services/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
      const baseURL = codespace 
        ? `https://${codespace}-8000.app.github.dev/api/leaderboard/`
        : 'http://localhost:8000/api/leaderboard/';
      
      console.log('Fetching leaderboard from:', baseURL);
      
      const response = await apiService.getLeaderboard();
      console.log('Leaderboard API response:', response);
      console.log('Leaderboard data:', response.data);
      
      // Handle both paginated (.results) and plain array responses
      const data = response.data.results || response.data;
      console.log('Processed leaderboard data:', data);
      
      setLeaderboard(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="main-content text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading leaderboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="main-content">
        <h1>🏆 Leaderboard</h1>
        <p className="lead">Compete with others and see who's at the top!</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && leaderboard.length === 0 ? (
          <Alert variant="info">No leaderboard data available yet.</Alert>
        ) : (
          <Table striped bordered hover responsive className="table mt-4">
            <thead className="table-dark">
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Team</th>
                <th>Total Activities</th>
                <th>Total Calories</th>
                <th>Total Distance (km)</th>
                <th>Total Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.user_id || entry._id || index}>
                  <td>
                    <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'danger' : 'primary'}>
                      #{index + 1}
                    </Badge>
                  </td>
                  <td>
                    <strong>{entry.username || entry.user_name || 'Unknown User'}</strong>
                    <br />
                    <small className="text-muted">{entry.email}</small>
                  </td>
                  <td>{entry.team_name || 'No Team'}</td>
                  <td>{entry.total_activities || 0}</td>
                  <td>{entry.total_calories || 0}</td>
                  <td>{(entry.total_distance || 0).toFixed(2)}</td>
                  <td>{entry.total_duration || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
}

export default Leaderboard;
