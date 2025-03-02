import requests
from flask import jsonify

def fetch_multiple_old_posts(instance_url, headers, new_max_id, url_old, since_id, max_id, iterations=4, limit=40):
    errors = []
    posts_new_boolean = False
    posts_new = []
    posts_old = []
    
    if new_max_id:
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(new_max_id) - 1}"
        posts_new_response = requests.get(url, headers=headers)  # Fixed variable name typo (postsNew -> posts_new_response)
        if posts_new_response.status_code == 200:
            posts_new = posts_new_response.json()
            if posts_new and int(posts_new[-1].get('id', '0')) > int(max_id):
                posts_new_boolean = True
            else:
                posts_new_boolean = False
        else:
            errors.append(f"New posts failed: {posts_new_response.status_code}")

    if not posts_new_boolean:
        posts_old_response = requests.get(url_old, headers=headers)  # Fixed variable name typo (postsOld -> posts_old_response)
        if posts_old_response.status_code == 200:
            posts_old = posts_old_response.json()
        else:
            errors.append(f"Old posts failed: {posts_old_response.status_code}")

        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    all_posts = posts_new if posts_new_boolean else posts_old

    # Safely get current max IDs
    current_max_id = posts_old[-1].get('id', max_id) if posts_old else max_id  # Added fallback to max_id
    current_new_max_id = posts_new[-1].get('id', current_max_id) if posts_new_boolean and posts_new else current_max_id

    for _ in range(iterations):
        if not current_max_id or not current_new_max_id:
            break

        if posts_new_boolean and int(current_new_max_id) > int(max_id):
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(current_new_max_id) - 1}"
        else:
            posts_new_boolean = False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(current_max_id) - 1}"
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break

        new_posts = response.json()
        if not new_posts:
            break

        if int(new_posts[-1].get('id', '0')) < int(max_id):
            posts_new_boolean = False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(current_max_id) - 1}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                break
            new_posts = response.json()

        all_posts.extend(new_posts)
        if new_posts:
            current_new_max_id = new_posts[-1].get('id', '')
            # Update current_max_id when fetching old posts to avoid infinite loops
            if not posts_new_boolean:
                current_max_id = new_posts[-1].get('id', current_max_id)  # Critical fix: Update pagination cursor
    
    return all_posts