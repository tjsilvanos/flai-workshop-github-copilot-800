from django.contrib import admin
from .models import User, Team, Activity, Leaderboard, Workout


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['_id', 'username', 'email', 'first_name', 'last_name', 'team_id', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    list_filter = ['created_at']
    readonly_fields = ['_id', 'created_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['_id', 'name', 'created_by', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    readonly_fields = ['_id', 'created_at']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['_id', 'user_id', 'activity_type', 'duration', 'distance', 'calories_burned', 'date', 'created_at']
    search_fields = ['user_id', 'activity_type']
    list_filter = ['activity_type', 'date', 'created_at']
    readonly_fields = ['_id', 'created_at']
    ordering = ['-date']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['_id', 'user_id', 'username', 'total_activities', 'total_calories', 'total_duration', 'total_distance', 'rank', 'updated_at']
    search_fields = ['username', 'user_id']
    list_filter = ['updated_at']
    readonly_fields = ['_id', 'updated_at']
    ordering = ['-total_calories']


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['_id', 'name', 'activity_type', 'difficulty_level', 'estimated_duration', 'estimated_calories', 'created_at']
    search_fields = ['name', 'description', 'activity_type']
    list_filter = ['difficulty_level', 'activity_type', 'created_at']
    readonly_fields = ['_id', 'created_at']
