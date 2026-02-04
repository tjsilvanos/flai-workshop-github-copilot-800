from rest_framework import serializers
from .models import User, Team, Activity, Leaderboard, Workout


class UserSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['_id', 'username', 'email', 'password', 'first_name', 'last_name', 'team_id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        return user


class TeamSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Team
        fields = ['_id', 'name', 'description', 'created_by', 'members', 'created_at']


class ActivitySerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Activity
        fields = ['_id', 'user_id', 'activity_type', 'duration', 'distance', 'calories_burned', 'date', 'notes', 'created_at']


class LeaderboardSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Leaderboard
        fields = ['_id', 'user_id', 'username', 'team_id', 'team_name', 'total_activities', 'total_calories', 'total_duration', 'total_distance', 'rank', 'updated_at']


class WorkoutSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Workout
        fields = ['_id', 'name', 'description', 'activity_type', 'difficulty_level', 'estimated_duration', 'estimated_calories', 'exercises', 'created_at']
