import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    activity_type: 'Running',
    duration: '',
    distance: '',
    calories_burned: '',
    date: '',
    notes: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
      const baseURL = codespace 
        ? `https://${codespace}-8000.app.github.dev/api/activities/`
        : 'http://localhost:8000/api/activities/';
      
      console.log('Fetching activities from:', baseURL);
      
      const response = await apiService.getActivities();
      console.log('Activities API response:', response);
      console.log('Activities data:', response.data);
      
      // Handle both paginated (.results) and plain array responses
      const data = response.data.results || response.data;
      console.log('Processed activities data:', data);
      
      setActivities(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        user_id: activity.user_id,
        activity_type: activity.activity_type,
        duration: activity.duration,
        distance: activity.distance || '',
        calories_burned: activity.calories_burned,
        date: activity.date,
        notes: activity.notes || ''
      });
    } else {
      setEditingActivity(null);
      setFormData({
        user_id: '',
        activity_type: 'Running',
        duration: '',
        distance: '',
        calories_burned: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingActivity(null);
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
      const submitData = {
        ...formData,
        duration: parseInt(formData.duration),
        distance: formData.distance ? parseFloat(formData.distance) : null,
        calories_burned: parseInt(formData.calories_burned)
      };

      if (editingActivity) {
        await apiService.updateActivity(editingActivity._id, submitData);
      } else {
        await apiService.createActivity(submitData);
      }
      
      handleCloseModal();
      fetchActivities();
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Failed to save activity. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await apiService.deleteActivity(id);
        fetchActivities();
      } catch (err) {
        console.error('Error deleting activity:', err);
        setError('Failed to delete activity. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

  const getActivityBadgeColor = (type) => {
    const colors = {
      'Running': 'primary',
      'Cycling': 'success',
      'Swimming': 'info',
      'Weightlifting': 'danger',
      'Yoga': 'secondary',
      'Boxing': 'warning',
      'Cardio': 'dark'
    };
    return colors[type] || 'secondary';
  };

  if (loading) {
    return (
      <Container>
        <div className="main-content text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading activities...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>🏃 Activities</h1>
          <Button variant="success" onClick={() => handleShowModal()}>
            + Add Activity
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        {activities.length === 0 ? (
          <Alert variant="info">
            No activities found. Click "Add Activity" to create your first activity!
          </Alert>
        ) : (
          <Table striped bordered hover responsive className="table mt-4">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Activity Type</th>
                <th>Duration (min)</th>
                <th>Distance (km)</th>
                <th>Calories</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id}>
                  <td>{formatDate(activity.date)}</td>
                  <td>
                    <span className={`badge bg-${getActivityBadgeColor(activity.activity_type)}`}>
                      {activity.activity_type}
                    </span>
                  </td>
                  <td>{activity.duration || 'N/A'}</td>
                  <td>{activity.distance || 'N/A'}</td>
                  <td>{activity.calories_burned}</td>
                  <td>{activity.notes || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <Button 
                        size="sm" 
                        variant="warning" 
                        onClick={() => handleShowModal(activity)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDelete(activity._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Activity Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Activity Type</Form.Label>
                <Form.Select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Weightlifting">Weightlifting</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Boxing">Boxing</option>
                  <option value="Cardio">Cardio</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Distance (km)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Calories Burned</Form.Label>
                <Form.Control
                  type="number"
                  name="calories_burned"
                  value={formData.calories_burned}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingActivity ? 'Update' : 'Create'} Activity
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
}

export default Activities;
