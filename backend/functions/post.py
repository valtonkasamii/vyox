from flask import jsonify
import requests

from flask import jsonify
import requests

def fetch_multiple_old_posts(instance_url, headers, new_max_id, since_id, max_id, url_old, iterations=4, limit=40):
    errors = []
    posts_new = []
    posts_old = []
    posts_new_boolean = False

    # 1. Fetch newer posts (if new_max_id is provided)
    if new_max_id:
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(new_max_id) - 1}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            posts_new = response.json()
            # Check if any post ID is between since_id and max_id
            posts_new_boolean = True
            for post in posts_new:
                post_id = int(post.get('id', 0))
                if max_id <= post_id <= since_id:  # Check for IDs between max_id and since_id
                    posts_new_boolean = False
                    break

    # 2. Fallback to old posts (if no new posts or overlap found)
    current_max_id = int(max_id)
    if not posts_new_boolean:
        response = requests.get(url_old, headers=headers)
        if response.status_code == 200:
            posts_old = response.json()
            if posts_old:
                current_max_id = int(posts_old[-1].get('id', 0))  # Update current_max_id
        else:
            errors.append(f"Old posts failed: {response.status_code}")

    # Combine new and old posts
    all_posts = posts_new if posts_new_boolean else posts_old

    # 3. Pagination logic
    for _ in range(iterations):
        if not current_max_id:
            break

        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            break

        new_posts = response.json()
        if not new_posts:
            break

        # Filter out posts with IDs between since_id and max_id
        valid_posts = [p for p in new_posts 
                      if not (max_id <= int(p.get('id', 0)) <= since_id)]
        
        all_posts.extend(valid_posts)
        current_max_id = int(new_posts[-1].get('id', 0))  # Update pagination cursor

    return all_posts