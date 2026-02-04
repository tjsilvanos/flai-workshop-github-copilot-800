#!/usr/bin/env python3
"""
Test script to verify user update functionality including team assignment
"""
import requests
import json

# Base URL for API
BASE_URL = "http://localhost:8000/api"

def test_user_update():
    print("=" * 60)
    print("Testing User Update Functionality")
    print("=" * 60)
    
    # 1. Get all users
    print("\n1. Fetching all users...")
    response = requests.get(f"{BASE_URL}/users/")
    if response.status_code == 200:
        users = response.json()
        if isinstance(users, dict) and 'results' in users:
            users = users['results']
        print(f"✓ Found {len(users)} users")
        if users:
            test_user = users[0]
            print(f"  Testing with user: {test_user['username']} (ID: {test_user['_id']})")
        else:
            print("✗ No users found to test with")
            return
    else:
        print(f"✗ Failed to fetch users: {response.status_code}")
        return
    
    # 2. Get all teams
    print("\n2. Fetching all teams...")
    response = requests.get(f"{BASE_URL}/teams/")
    if response.status_code == 200:
        teams = response.json()
        if isinstance(teams, dict) and 'results' in teams:
            teams = teams['results']
        print(f"✓ Found {len(teams)} teams")
        if teams:
            test_team = teams[0]
            print(f"  Will assign to team: {test_team['name']} (ID: {test_team['_id']})")
        else:
            test_team = None
            print("  No teams found, will test with null team")
    else:
        print(f"✗ Failed to fetch teams: {response.status_code}")
        test_team = None
    
    # 3. Update user with team assignment
    print("\n3. Updating user with team assignment...")
    update_data = {
        "first_name": test_user['first_name'],
        "last_name": "Updated",  # Change last name to verify update
        "username": test_user['username'],
        "email": test_user['email'],
        "team_id": test_team['_id'] if test_team else None
    }
    
    print(f"  Update payload: {json.dumps(update_data, indent=2)}")
    response = requests.put(
        f"{BASE_URL}/users/{test_user['_id']}/",
        json=update_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        updated_user = response.json()
        print(f"✓ User updated successfully")
        print(f"  Last name: {test_user['last_name']} → {updated_user['last_name']}")
        print(f"  Team ID: {test_user.get('team_id')} → {updated_user.get('team_id')}")
    else:
        print(f"✗ Failed to update user: {response.status_code}")
        print(f"  Response: {response.text}")
        return
    
    # 4. Verify the update
    print("\n4. Verifying the update...")
    response = requests.get(f"{BASE_URL}/users/{test_user['_id']}/")
    if response.status_code == 200:
        verified_user = response.json()
        print(f"✓ User verified successfully")
        print(f"  Name: {verified_user['first_name']} {verified_user['last_name']}")
        print(f"  Team ID: {verified_user.get('team_id')}")
        
        if verified_user['last_name'] == "Updated":
            print("✓ Last name update confirmed")
        else:
            print("✗ Last name update failed")
            
        if test_team and verified_user.get('team_id') == test_team['_id']:
            print("✓ Team assignment confirmed")
        elif not test_team and not verified_user.get('team_id'):
            print("✓ Null team assignment confirmed")
        else:
            print("✗ Team assignment mismatch")
    else:
        print(f"✗ Failed to verify user: {response.status_code}")
    
    # 5. Test partial update (PATCH)
    print("\n5. Testing partial update (change only team)...")
    partial_data = {
        "team_id": None  # Remove team assignment
    }
    
    response = requests.patch(
        f"{BASE_URL}/users/{test_user['_id']}/",
        json=partial_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        updated_user = response.json()
        print(f"✓ Partial update successful")
        print(f"  Team ID: {updated_user.get('team_id')}")
        if not updated_user.get('team_id'):
            print("✓ Team successfully removed")
    else:
        print(f"✗ Failed partial update: {response.status_code}")
        print(f"  Response: {response.text}")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_user_update()
    except Exception as e:
        print(f"\n✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
