from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User, Team, Activity, Leaderboard, Workout
from bson import ObjectId


class UserAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_create_user(self):
        response = self.client.post('/api/users/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')
    
    def test_get_users(self):
        User.objects.create(**self.user_data)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class TeamAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='teamowner',
            email='owner@example.com',
            password='pass123',
            first_name='Team',
            last_name='Owner'
        )
        self.team_data = {
            'name': 'Test Team',
            'description': 'A test team',
            'created_by': self.user._id,
            'members': []
        }
    
    def test_create_team(self):
        response = self.client.post('/api/teams/', self.team_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.get().name, 'Test Team')
    
    def test_get_teams(self):
        Team.objects.create(**self.team_data)
        response = self.client.get('/api/teams/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ActivityAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='activeuser',
            email='active@example.com',
            password='pass123',
            first_name='Active',
            last_name='User'
        )
        self.activity_data = {
            'user_id': self.user._id,
            'activity_type': 'running',
            'duration': 30,
            'distance': 5.0,
            'calories_burned': 300,
            'date': '2026-02-04',
            'notes': 'Morning run'
        }
    
    def test_create_activity(self):
        response = self.client.post('/api/activities/', self.activity_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Activity.objects.count(), 1)
        self.assertEqual(Activity.objects.get().activity_type, 'running')
    
    def test_get_activities(self):
        Activity.objects.create(**self.activity_data)
        response = self.client.get('/api/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class LeaderboardAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            username='leaderuser',
            email='leader@example.com',
            password='pass123',
            first_name='Leader',
            last_name='User'
        )
        self.leaderboard_data = {
            'user_id': self.user._id,
            'username': self.user.username,
            'total_activities': 5,
            'total_calories': 1500,
            'total_duration': 150,
            'total_distance': 25.0
        }
    
    def test_create_leaderboard_entry(self):
        response = self.client.post('/api/leaderboard/', self.leaderboard_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Leaderboard.objects.count(), 1)
    
    def test_get_leaderboard(self):
        Leaderboard.objects.create(**self.leaderboard_data)
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class WorkoutAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.workout_data = {
            'name': 'Morning Cardio',
            'description': 'A great morning workout',
            'activity_type': 'cardio',
            'difficulty_level': 'intermediate',
            'estimated_duration': 45,
            'estimated_calories': 400,
            'exercises': [
                {'name': 'Jumping Jacks', 'sets': 3, 'reps': 20},
                {'name': 'Burpees', 'sets': 3, 'reps': 15}
            ]
        }
    
    def test_create_workout(self):
        response = self.client.post('/api/workouts/', self.workout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(Workout.objects.get().name, 'Morning Cardio')
    
    def test_get_workouts(self):
        Workout.objects.create(**self.workout_data)
        response = self.client.get('/api/workouts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
