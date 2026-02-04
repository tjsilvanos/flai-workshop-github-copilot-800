import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    team_id: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
      const baseURL = codespace 
        ? `https://${codespace}-8000.app.github.dev/api/users/`
        : 'http://localhost:8000/api/users/';
      
      console.log('Fetching users from:', baseURL);
      
      const response = await apiService.getUsers();
      console.log('Users API response:', response);
      console.log('Users data:', response.data);
      
      // Handle both paginated (.results) and plain array responses
      const data = response.data.results || response.data;
      console.log('Processed users data:', data);
      
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
      const baseURL = codespace 
        ? `https://${codespace}-8000.app.github.dev/api/teams/`
        : 'http://localhost:8000/api/teams/';
      
      console.log('Fetching teams from:', baseURL);
      
      const response = await apiService.getTeams();
      console.log('Teams API response:', response);
      console.log('Teams data:', response.data);
      
      // Handle both paginated (.results) and plain array responses
      const data = response.data.results || response.data;
      console.log('Processed teams data:', data);
      
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        team_id: user.team_id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        team_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setSaving(false);
    setValidationErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      team_id: '',
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!editingUser && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Clean up formData - don't send empty password for updates
      const dataToSend = { ...formData };
      if (editingUser && !dataToSend.password) {
        delete dataToSend.password;
      }
      // Convert empty team_id to null
      if (!dataToSend.team_id) {
        dataToSend.team_id = null;
      }
      
      if (editingUser) {
        await apiService.updateUser(editingUser._id, dataToSend);
      } else {
        await apiService.createUser(dataToSend);
      }
      handleCloseModal();
      await fetchUsers();
      
      // Show success message briefly
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail ||
                       'Failed to save user. Please try again.';
      setError(errorMsg);
      console.error('Error saving user:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const getFullName = (user) => {
    return `${user.first_name} ${user.last_name}`.trim() || 'N/A';
  };

  const getTeamName = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t._id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading users...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>👥 Users</h1>
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Add New User
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Table striped bordered hover responsive className="table mt-4">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Team</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No users found. Add your first user!</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td><strong>{getFullName(user)}</strong></td>
                  <td>
                    <Badge bg="primary">{user.username}</Badge>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {user.team_id ? (
                      <Badge bg="success">{getTeamName(user.team_id)}</Badge>
                    ) : (
                      <Badge bg="secondary">No Team</Badge>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleShowModal(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                isInvalid={!!validationErrors.first_name}
                placeholder="Enter first name"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.first_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                isInvalid={!!validationErrors.last_name}
                placeholder="Enter last name"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.last_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!validationErrors.username}
                placeholder="Enter username (min 3 characters)"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
                placeholder="Enter email"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Password {editingUser && '(leave blank to keep current)'}
                {!editingUser && <span className="text-danger"> *</span>}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!validationErrors.password}
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password (min 6 characters)"}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Team</Form.Label>
              <Form.Select
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
              >
                <option value="">No Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Assign this user to a team or leave as "No Team"
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingUser ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingUser ? 'Update User' : 'Create User'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Users;
