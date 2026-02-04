from django.db import models
from bson import ObjectId


class User(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=lambda: str(ObjectId()))
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    team_id = models.CharField(max_length=24, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username


class Team(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=lambda: str(ObjectId()))
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.CharField(max_length=24)
    members = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'teams'
    
    def __str__(self):
        return self.name


class Activity(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=lambda: str(ObjectId()))
    user_id = models.CharField(max_length=24)
    activity_type = models.CharField(max_length=50)
    duration = models.IntegerField()  # in minutes
    distance = models.FloatField(null=True, blank=True)  # in km
    calories_burned = models.IntegerField()
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activities'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.activity_type} - {self.date}"


class Leaderboard(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=lambda: str(ObjectId()))
    user_id = models.CharField(max_length=24, unique=True)
    username = models.CharField(max_length=100)
    team_id = models.CharField(max_length=24, null=True, blank=True)
    team_name = models.CharField(max_length=100, null=True, blank=True)
    total_activities = models.IntegerField(default=0)
    total_calories = models.IntegerField(default=0)
    total_duration = models.IntegerField(default=0)  # in minutes
    total_distance = models.FloatField(default=0.0)  # in km
    rank = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leaderboard'
        ordering = ['-total_calories']
    
    def __str__(self):
        return f"{self.username} - {self.total_calories} calories"


class Workout(models.Model):
    _id = models.CharField(max_length=24, primary_key=True, default=lambda: str(ObjectId()))
    name = models.CharField(max_length=100)
    description = models.TextField()
    activity_type = models.CharField(max_length=50)
    difficulty_level = models.CharField(max_length=20)  # beginner, intermediate, advanced
    estimated_duration = models.IntegerField()  # in minutes
    estimated_calories = models.IntegerField()
    exercises = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'workouts'
    
    def __str__(self):
        return f"{self.name} - {self.difficulty_level}"
