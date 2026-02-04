from django.core.management.base import BaseCommand
from pymongo import MongoClient
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        # Connect to MongoDB
        client = MongoClient('localhost', 27017)
        db = client['octofit_db']
        
        self.stdout.write(self.style.SUCCESS('Connected to octofit_db'))
        
        # Drop existing collections to start fresh
        collections = ['users', 'teams', 'activities', 'leaderboard', 'workouts']
        for collection in collections:
            db[collection].drop()
            self.stdout.write(self.style.WARNING(f'Dropped collection: {collection}'))
        
        # Create unique index on email field
        db.users.create_index('email', unique=True)
        self.stdout.write(self.style.SUCCESS('Created unique index on users.email'))
        
        # Create Teams
        teams_data = [
            {
                '_id': 1,
                'name': 'Team Marvel',
                'description': 'Assemble! The mightiest heroes of Earth',
                'created_at': datetime.now(),
                'members': []
            },
            {
                '_id': 2,
                'name': 'Team DC',
                'description': 'Justice League - Defending truth and justice',
                'created_at': datetime.now(),
                'members': []
            }
        ]
        db.teams.insert_many(teams_data)
        self.stdout.write(self.style.SUCCESS('Created teams'))
        
        # Create Users (Superheroes)
        users_data = [
            # Team Marvel
            {
                '_id': 1,
                'username': 'ironman',
                'email': 'tony.stark@avengers.com',
                'full_name': 'Tony Stark',
                'team_id': 1,
                'created_at': datetime.now(),
                'avatar': '🦾'
            },
            {
                '_id': 2,
                'username': 'captainamerica',
                'email': 'steve.rogers@avengers.com',
                'full_name': 'Steve Rogers',
                'team_id': 1,
                'created_at': datetime.now(),
                'avatar': '🛡️'
            },
            {
                '_id': 3,
                'username': 'blackwidow',
                'email': 'natasha.romanoff@avengers.com',
                'full_name': 'Natasha Romanoff',
                'team_id': 1,
                'created_at': datetime.now(),
                'avatar': '🕷️'
            },
            {
                '_id': 4,
                'username': 'thor',
                'email': 'thor.odinson@asgard.com',
                'full_name': 'Thor Odinson',
                'team_id': 1,
                'created_at': datetime.now(),
                'avatar': '⚡'
            },
            {
                '_id': 5,
                'username': 'hulk',
                'email': 'bruce.banner@avengers.com',
                'full_name': 'Bruce Banner',
                'team_id': 1,
                'created_at': datetime.now(),
                'avatar': '💚'
            },
            # Team DC
            {
                '_id': 6,
                'username': 'superman',
                'email': 'clark.kent@dailyplanet.com',
                'full_name': 'Clark Kent',
                'team_id': 2,
                'created_at': datetime.now(),
                'avatar': '🦸'
            },
            {
                '_id': 7,
                'username': 'batman',
                'email': 'bruce.wayne@wayneenterprises.com',
                'full_name': 'Bruce Wayne',
                'team_id': 2,
                'created_at': datetime.now(),
                'avatar': '🦇'
            },
            {
                '_id': 8,
                'username': 'wonderwoman',
                'email': 'diana.prince@themyscira.com',
                'full_name': 'Diana Prince',
                'team_id': 2,
                'created_at': datetime.now(),
                'avatar': '⚔️'
            },
            {
                '_id': 9,
                'username': 'flash',
                'email': 'barry.allen@starlabs.com',
                'full_name': 'Barry Allen',
                'team_id': 2,
                'created_at': datetime.now(),
                'avatar': '⚡'
            },
            {
                '_id': 10,
                'username': 'aquaman',
                'email': 'arthur.curry@atlantis.com',
                'full_name': 'Arthur Curry',
                'team_id': 2,
                'created_at': datetime.now(),
                'avatar': '🔱'
            }
        ]
        db.users.insert_many(users_data)
        self.stdout.write(self.style.SUCCESS('Created users (superheroes)'))
        
        # Update teams with member IDs
        db.teams.update_one({'_id': 1}, {'$set': {'members': [1, 2, 3, 4, 5]}})
        db.teams.update_one({'_id': 2}, {'$set': {'members': [6, 7, 8, 9, 10]}})
        
        # Create Activities
        activity_types = ['Running', 'Cycling', 'Swimming', 'Weightlifting', 'Yoga', 'Boxing', 'Cardio']
        activities_data = []
        activity_id = 1
        
        for user in users_data:
            # Create 5-10 activities per user
            num_activities = random.randint(5, 10)
            for i in range(num_activities):
                days_ago = random.randint(0, 30)
                activity_date = datetime.now() - timedelta(days=days_ago)
                
                activities_data.append({
                    '_id': activity_id,
                    'user_id': user['_id'],
                    'activity_type': random.choice(activity_types),
                    'duration_minutes': random.randint(15, 120),
                    'calories_burned': random.randint(100, 800),
                    'distance_km': round(random.uniform(1, 20), 2),
                    'date': activity_date,
                    'notes': f"Great workout session #{i+1}"
                })
                activity_id += 1
        
        db.activities.insert_many(activities_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(activities_data)} activities'))
        
        # Create Workouts (suggested workouts for heroes)
        workouts_data = [
            {
                '_id': 1,
                'name': 'Super Soldier Training',
                'description': 'High-intensity training for peak performance',
                'activity_type': 'Weightlifting',
                'duration_minutes': 60,
                'difficulty': 'Hard',
                'calories_target': 600,
                'suitable_for': [1, 2, 6, 7]
            },
            {
                '_id': 2,
                'name': 'Speed Force Sprint',
                'description': 'Lightning-fast cardio workout',
                'activity_type': 'Running',
                'duration_minutes': 30,
                'difficulty': 'Medium',
                'calories_target': 400,
                'suitable_for': [9]
            },
            {
                '_id': 3,
                'name': 'Asgardian Strength',
                'description': 'Build godly strength with heavy lifting',
                'activity_type': 'Weightlifting',
                'duration_minutes': 90,
                'difficulty': 'Expert',
                'calories_target': 800,
                'suitable_for': [4, 5]
            },
            {
                '_id': 4,
                'name': 'Amazonian Warrior Routine',
                'description': 'Combat-ready full-body workout',
                'activity_type': 'Boxing',
                'duration_minutes': 45,
                'difficulty': 'Hard',
                'calories_target': 500,
                'suitable_for': [3, 8]
            },
            {
                '_id': 5,
                'name': 'Atlantean Swim',
                'description': 'Master the depths with swimming',
                'activity_type': 'Swimming',
                'duration_minutes': 60,
                'difficulty': 'Medium',
                'calories_target': 450,
                'suitable_for': [10]
            }
        ]
        db.workouts.insert_many(workouts_data)
        self.stdout.write(self.style.SUCCESS('Created workout suggestions'))
        
        # Create Leaderboard entries
        leaderboard_data = []
        
        # Calculate total points for each user based on activities
        for user in users_data:
            user_activities = [a for a in activities_data if a['user_id'] == user['_id']]
            total_calories = sum(a['calories_burned'] for a in user_activities)
            total_distance = sum(a['distance_km'] for a in user_activities)
            total_duration = sum(a['duration_minutes'] for a in user_activities)
            
            # Calculate points (calories + distance * 10 + duration)
            points = total_calories + int(total_distance * 10) + total_duration
            
            leaderboard_data.append({
                '_id': user['_id'],
                'user_id': user['_id'],
                'username': user['username'],
                'team_id': user['team_id'],
                'total_points': points,
                'total_activities': len(user_activities),
                'total_calories': total_calories,
                'total_distance_km': round(total_distance, 2),
                'total_duration_minutes': total_duration,
                'last_updated': datetime.now()
            })
        
        # Sort by points descending
        leaderboard_data.sort(key=lambda x: x['total_points'], reverse=True)
        
        # Add rank
        for rank, entry in enumerate(leaderboard_data, 1):
            entry['rank'] = rank
        
        db.leaderboard.insert_many(leaderboard_data)
        self.stdout.write(self.style.SUCCESS('Created leaderboard entries'))
        
        # Print summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Database Population Complete!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(f'Teams: {db.teams.count_documents({})}')
        self.stdout.write(f'Users: {db.users.count_documents({})}')
        self.stdout.write(f'Activities: {db.activities.count_documents({})}')
        self.stdout.write(f'Workouts: {db.workouts.count_documents({})}')
        self.stdout.write(f'Leaderboard Entries: {db.leaderboard.count_documents({})}')
        
        # Close connection
        client.close()
