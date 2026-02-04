from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Team, Activity, Leaderboard, Workout
from .serializers import (
    UserSerializer, TeamSerializer, ActivitySerializer, 
    LeaderboardSerializer, WorkoutSerializer
)
from pymongo import MongoClient
from django.conf import settings


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def by_username(self, request):
        username = request.query_params.get('username', None)
        if username:
            users = User.objects.filter(username__icontains=username)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        return Response({'error': 'Username parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.none()  # Empty queryset to avoid ORM issues
    serializer_class = TeamSerializer
    
    def get_mongo_connection(self):
        """Get MongoDB connection"""
        client = MongoClient('localhost', 27017)
        db = client['octofit_db']
        return db
    
    def list(self, request):
        """Override list to fetch from MongoDB directly"""
        try:
            db = self.get_mongo_connection()
            teams = list(db.teams.find())
            
            # Convert ObjectId to string and format data
            for team in teams:
                team['_id'] = str(team['_id'])
                # Ensure members is a list
                if 'members' not in team:
                    team['members'] = []
                # Add member_count
                team['member_count'] = len(team['members'])
            
            return Response(teams)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch teams: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """Override retrieve to fetch from MongoDB directly"""
        try:
            db = self.get_mongo_connection()
            team = db.teams.find_one({'_id': int(pk)})
            
            if not team:
                return Response(
                    {'error': 'Team not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            team['_id'] = str(team['_id'])
            if 'members' not in team:
                team['members'] = []
            team['member_count'] = len(team['members'])
            
            return Response(team)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch team: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        try:
            db = self.get_mongo_connection()
            user_id = request.data.get('user_id')
            
            if not user_id:
                return Response(
                    {'error': 'user_id required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            team = db.teams.find_one({'_id': int(pk)})
            if not team:
                return Response(
                    {'error': 'Team not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            members = team.get('members', [])
            if user_id in members:
                return Response(
                    {'error': 'User already in team'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            db.teams.update_one(
                {'_id': int(pk)},
                {'$push': {'members': user_id}}
            )
            
            return Response({'status': 'member added'})
        except Exception as e:
            return Response(
                {'error': f'Failed to add member: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        try:
            db = self.get_mongo_connection()
            user_id = request.data.get('user_id')
            
            if not user_id:
                return Response(
                    {'error': 'user_id required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            team = db.teams.find_one({'_id': int(pk)})
            if not team:
                return Response(
                    {'error': 'Team not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            members = team.get('members', [])
            if user_id not in members:
                return Response(
                    {'error': 'User not in team'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            db.teams.update_one(
                {'_id': int(pk)},
                {'$pull': {'members': user_id}}
            )
            
            return Response({'status': 'member removed'})
        except Exception as e:
            return Response(
                {'error': f'Failed to remove member: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        user_id = request.query_params.get('user_id', None)
        if user_id:
            activities = Activity.objects.filter(user_id=user_id)
            serializer = self.get_serializer(activities, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        activity_type = request.query_params.get('type', None)
        if activity_type:
            activities = Activity.objects.filter(activity_type__icontains=activity_type)
            serializer = self.get_serializer(activities, many=True)
            return Response(serializer.data)
        return Response({'error': 'type parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    
    @action(detail=False, methods=['get'])
    def top(self, request):
        limit = int(request.query_params.get('limit', 10))
        leaderboard = Leaderboard.objects.all()[:limit]
        serializer = self.get_serializer(leaderboard, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_stats(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate user statistics from activities
        activities = Activity.objects.filter(user_id=user_id)
        total_activities = activities.count()
        total_calories = sum(activity.calories_burned for activity in activities)
        total_duration = sum(activity.duration for activity in activities)
        total_distance = sum(activity.distance or 0 for activity in activities)
        
        # Get username
        try:
            user = User.objects.get(_id=user_id)
            username = user.username
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update or create leaderboard entry
        leaderboard, created = Leaderboard.objects.update_or_create(
            user_id=user_id,
            defaults={
                'username': username,
                'total_activities': total_activities,
                'total_calories': total_calories,
                'total_duration': total_duration,
                'total_distance': total_distance
            }
        )
        
        serializer = self.get_serializer(leaderboard)
        return Response(serializer.data)


class WorkoutViewSet(viewsets.ModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    
    @action(detail=False, methods=['get'])
    def by_difficulty(self, request):
        difficulty = request.query_params.get('difficulty', None)
        if difficulty:
            workouts = Workout.objects.filter(difficulty_level__iexact=difficulty)
            serializer = self.get_serializer(workouts, many=True)
            return Response(serializer.data)
        return Response({'error': 'difficulty parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        activity_type = request.query_params.get('type', None)
        if activity_type:
            workouts = Workout.objects.filter(activity_type__icontains=activity_type)
            serializer = self.get_serializer(workouts, many=True)
            return Response(serializer.data)
        return Response({'error': 'type parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def recommend(self, request):
        user_id = request.query_params.get('user_id', None)
        if not user_id:
            return Response({'error': 'user_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user's recent activities to determine preferences
        recent_activities = Activity.objects.filter(user_id=user_id).order_by('-date')[:5]
        
        if not recent_activities:
            # If no activities, recommend beginner workouts
            workouts = Workout.objects.filter(difficulty_level='beginner')[:3]
        else:
            # Find most common activity type
            activity_types = [activity.activity_type for activity in recent_activities]
            most_common_type = max(set(activity_types), key=activity_types.count) if activity_types else None
            
            if most_common_type:
                workouts = Workout.objects.filter(activity_type__icontains=most_common_type)[:3]
            else:
                workouts = Workout.objects.all()[:3]
        
        serializer = self.get_serializer(workouts, many=True)
        return Response(serializer.data)
