from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Team, Activity, Leaderboard, Workout
from .serializers import (
    UserSerializer, TeamSerializer, ActivitySerializer, 
    LeaderboardSerializer, WorkoutSerializer
)


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
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        if user_id:
            if user_id not in team.members:
                team.members.append(user_id)
                team.save()
                return Response({'status': 'member added'})
            return Response({'error': 'User already in team'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        if user_id:
            if user_id in team.members:
                team.members.remove(user_id)
                team.save()
                return Response({'status': 'member removed'})
            return Response({'error': 'User not in team'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)


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
