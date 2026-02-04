import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge, ListGroup } from 'react-bootstrap';
import apiService from '../services/api';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    created_by: ''
  });

  useEffect(() => {
    fetchTeamsAndUsers();
  }, []);

  const fetchTeamsAndUsers = async () => {
    try {
      setLoading(true);
      const [teamsResponse, usersResponse] = await Promise.all([
        apiService.getTeams(),
        apiService.getUsers()
      ]);
      setTeams(teamsResponse.data);
      setUsers(usersResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        description: team.description || '',
        created_by: team.created_by || ''
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        description: '',
        created_by: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTeam) {
        await apiService.updateTeam(selectedTeam._id, formData);
      } else {
        await apiService.createTeam(formData);
      }
      
      handleCloseModal();
      fetchTeamsAndUsers();
    } catch (err) {
      console.error('Error saving team:', err);
      setError('Failed to save team. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await apiService.deleteTeam(id);
        fetchTeamsAndUsers();
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Failed to delete team. Please try again.');
      }
    }
  };

  const getUsersByTeam = (teamId) => {
    return users.filter(user => user.team_id === teamId);
  };

  const getTeamAvatar = (teamName) => {
    if (teamName.toLowerCase().includes('marvel')) return '🦸‍♂️';
    if (teamName.toLowerCase().includes('dc')) return '🦇';
    return '🏆';
  };

  if (loading) {
    return (
      <Container>
        <div className="main-content text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading teams...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Teams</h1>
          <Button variant="success" onClick={() => handleShowModal()}>
            + Create Team
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        {teams.length === 0 ? (
          <Alert variant="info">
            No teams found. Click "Create Team" to create your first team!
          </Alert>
        ) : (
          <Row>
            {teams.map((team) => {
              const teamMembers = getUsersByTeam(team._id);
              const actualMemberCount = team.member_count || teamMembers.length;
              
              return (
                <Col key={team._id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-primary text-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                            {getTeamAvatar(team.name)}
                          </span>
                          {team.name}
                        </h5>
                        <Badge bg="light" text="dark">
                          {actualMemberCount} {actualMemberCount === 1 ? 'Member' : 'Members'}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text className="text-muted mb-3">
                        {team.description || 'No description available'}
                      </Card.Text>
                      
                      {teamMembers.length > 0 && (
                        <div className="mb-3">
                          <h6 className="mb-2">Team Members:</h6>
                          <ListGroup variant="flush">
                            {teamMembers.slice(0, 3).map((user) => (
                              <ListGroup.Item key={user._id} className="px-0 py-1">
                                <small>
                                  👤 {user.first_name} {user.last_name} 
                                  <span className="text-muted"> (@{user.username})</span>
                                </small>
                              </ListGroup.Item>
                            ))}
                            {teamMembers.length > 3 && (
                              <ListGroup.Item className="px-0 py-1">
                                <small className="text-muted">
                                  + {teamMembers.length - 3} more member{teamMembers.length - 3 !== 1 ? 's' : ''}
                                </small>
                              </ListGroup.Item>
                            )}
                          </ListGroup>
                        </div>
                      )}
                      
                      {actualMemberCount > 0 && teamMembers.length === 0 && (
                        <div className="mb-3">
                          <small className="text-muted">
                            This team has {actualMemberCount} member{actualMemberCount !== 1 ? 's' : ''}
                          </small>
                        </div>
                      )}
                      
                      <div className="d-flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="flex-grow-1"
                          onClick={() => handleShowModal(team)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDelete(team._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                    <Card.Footer className="text-muted">
                      <small>
                        Created: {new Date(team.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Create/Edit Team Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedTeam ? 'Edit Team' : 'Create New Team'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Team Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter team name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter team description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Created By (User ID)</Form.Label>
                <Form.Control
                  type="text"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {selectedTeam ? 'Update' : 'Create'} Team
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
}

export default Teams;
