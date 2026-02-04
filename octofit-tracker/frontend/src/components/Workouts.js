import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { apiService } from '../services/api';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activity_type: 'Running',
    target_duration: '',
    target_distance: '',
    target_calories: '',
    difficulty_level: 'Intermediate'
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
      const baseURL = codespace 
        ? `https://${codespace}-8000.app.github.dev/api/workouts/`
        : 'http://localhost:8000/api/workouts/';
      
      console.log('Fetching workouts from:', baseURL);
      
      const response = await apiService.getWorkouts();
      console.log('Workouts API response:', response);
      console.log('Workouts data:', response.data);
      
      // Handle both paginated (.results) and plain array responses
      const data = response.data.results || response.data;
      console.log('Processed workouts data:', data);
      
      setWorkouts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load workouts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (workout = null) => {
    if (workout) {
      setSelectedWorkout(workout);
      setFormData({
        name: workout.name,
        description: workout.description || '',
        activity_type: workout.activity_type,
        target_duration: workout.target_duration || '',
        target_distance: workout.target_distance || '',
        target_calories: workout.target_calories || '',
        difficulty_level: workout.difficulty_level || 'Intermediate'
      });
    } else {
      setSelectedWorkout(null);
      setFormData({
        name: '',
        description: '',
        activity_type: 'Running',
        target_duration: '',
        target_distance: '',
        target_calories: '',
        difficulty_level: 'Intermediate'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
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
        target_duration: formData.target_duration ? parseInt(formData.target_duration) : null,
        target_distance: formData.target_distance ? parseFloat(formData.target_distance) : null,
        target_calories: formData.target_calories ? parseInt(formData.target_calories) : null
      };

      if (selectedWorkout) {
        await apiService.updateWorkout(selectedWorkout._id, submitData);
      } else {
        await apiService.createWorkout(submitData);
      }
      
      handleCloseModal();
      fetchWorkouts();
    } catch (err) {
      console.error('Error saving workout:', err);
      setError('Failed to save workout. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await apiService.deleteWorkout(id);
        fetchWorkouts();
      } catch (err) {
        console.error('Error deleting workout:', err);
        setError('Failed to delete workout. Please try again.');
      }
    }
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      'Beginner': 'success',
      'Intermediate': 'warning',
      'Advanced': 'danger'
    };
    return badges[level] || 'secondary';
  };

  if (loading) {
    return (
      <Container>
        <div className="main-content text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading workouts...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>💪 Workout Plans</h1>
            <p className="lead">Personalized workout suggestions to help you reach your goals</p>
          </div>
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Create New Workout
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && workouts.length === 0 ? (
          <Alert variant="info">No workouts available yet. Create your first workout plan!</Alert>
        ) : (
          <Row>
            {workouts.map((workout) => (
              <Col md={6} lg={4} key={workout._id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">{workout.name}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Badge bg={getDifficultyBadge(workout.difficulty_level)} className="mb-2">
                      {workout.difficulty_level}
                    </Badge>
                    <Badge bg="secondary" className="mb-2 ms-2">
                      {workout.activity_type}
                    </Badge>
                    <p className="mt-2">{workout.description}</p>
                    
                    <div className="mt-3">
                      {workout.target_duration && (
                        <p className="mb-1"><strong>Duration:</strong> {workout.target_duration} min</p>
                      )}
                      {workout.target_distance && (
                        <p className="mb-1"><strong>Distance:</strong> {workout.target_distance} km</p>
                      )}
                      {workout.target_calories && (
                        <p className="mb-1"><strong>Calories:</strong> {workout.target_calories}</p>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleShowModal(workout)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(workout._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedWorkout ? 'Edit Workout' : 'Create New Workout'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Workout Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Activity Type *</Form.Label>
                    <Form.Select
                      name="activity_type"
                      value={formData.activity_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Running">Running</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Swimming">Swimming</option>
                      <option value="Walking">Walking</option>
                      <option value="Weightlifting">Weightlifting</option>
                      <option value="Yoga">Yoga</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Difficulty Level *</Form.Label>
                    <Form.Select
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleChange}
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Duration (min)</Form.Label>
                    <Form.Control
                      type="number"
                      name="target_duration"
                      value={formData.target_duration}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Distance (km)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="target_distance"
                      value={formData.target_distance}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Calories</Form.Label>
                    <Form.Control
                      type="number"
                      name="target_calories"
                      value={formData.target_calories}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {selectedWorkout ? 'Update' : 'Create'} Workout
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
}

export default Workouts;
