import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
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
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser._id, formData);
      } else {
        await apiService.createUser(formData);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError('Failed to save user. Please try again.');
      console.error('Error saving user:', err);
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
          <h1>Users</h1>
          <Button variant="primary" onClick={() => handleShowModal()}>
            Add New User
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Table striped hover responsive className="table">
          <thead>
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
                      <Badge bg="success">Team Member</Badge>
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
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Enter last name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password {editingUser && '(leave blank to keep current)'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
                placeholder="Enter password"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Users;
