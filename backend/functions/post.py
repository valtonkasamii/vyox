from flask import jsonify
import requests

def fetch_multiple_old_posts(instance_url, headers, new_max_id, url_old, since_id, max_id, iterations=4, limit=40):
    errors = []
    posts_new_boolean = False
    posts_new = []
    posts_old = []
    
    # Try to fetch newer posts first
    if new_max_id:
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(new_max_id) - 1}"
        posts_new_response = requests.get(url, headers=headers)
        if posts_new_response.status_code == 200:
            posts_new = posts_new_response.json()
            if posts_new:
                # Check if we have newer posts than current max_id
                last_new_id = int(posts_new[-1].get('id', ''))
                posts_new_boolean = last_new_id > int(max_id)
    
    current_max_id = int(max_id)
    # If no new posts, fall back to old posts
    if not posts_new_boolean:
        posts_old_response = requests.get(url_old, headers=headers)
        if posts_old_response.status_code == 200:
            posts_old = posts_old_response.json()
            current_max_id = int(posts_old[-1].get('id', ''))
        else:
            errors.append(f"Old posts failed: {posts_old_response.status_code}")

        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    all_posts = posts_new if posts_new_boolean else posts_old

    if posts_new_boolean and int(posts_new[-1].get('id', '')) > int(max_id):
        current_new_max_id = int(posts_new[-1].get('id', ''))
    else:
        posts_new_boolean = False 

    for _ in range(iterations):
        if not current_max_id and not current_new_max_id:
            break

        if posts_new_boolean and int(current_new_max_id) > int(max_id):
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_new_max_id - 1}"
        else:
            posts_new_boolean = False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break

        new_posts = response.json()
        if not new_posts:
            break

        if int(new_posts[-1].get('id', '')) < int(max_id):
            posts_new_boolean = False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                break
            new_posts = response.json()

        all_posts.extend(new_posts)
        if new_posts and posts_new_boolean:
            current_new_max_id = int(new_posts[-1].get('id', ''))
            # Update current_max_id when fetching old posts to avoid infinite loops
        else:
            current_max_id = int(new_posts[-1].get('id', ''))  # Critical fix: Update pagination cursor
    
    return all_posts