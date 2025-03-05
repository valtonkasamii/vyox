from flask import jsonify
import requests

def fetch_multiple_old_posts(instance_url, headers, new_max_id, since_id, max_id, url_old, iterations=4, limit=40):
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
                # Check if the last post's ID is greater than the max_id from the frontend
                for post in posts_new:
                    if int(post.get('id', 0)) <= since_id and int(post.get('id', 0)) >= max_id:
                        posts_new_boolean = False
                    else:
                        posts_new_boolean = True
    
    current_max_id = int(max_id)
    # If no new posts, fall back to old posts
    if not posts_new_boolean:
        posts_old_response = requests.get(url_old, headers=headers)
        if posts_old_response.status_code == 200:
            posts_old = posts_old_response.json()
            current_max_id = int(posts_old[-1].get('id', 0))
        else:
            errors.append(f"Old posts failed: {posts_old_response.status_code}")

        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    all_posts = posts_new if posts_new_boolean else posts_old
    
    if posts_new_boolean:
        for post in posts_new:
            current_new_max_id = int(posts_new[-1].get('id', 0))
            if int(post.get('id', 0)) >= int(max_id) and int(post.get('id', 0)) <= int(since_id):
                posts_new_boolean = False
                current_new_max_id = None
    else:
        current_new_max_id = None
        posts_new_boolean = False 

    for _ in range(iterations):
        if not current_max_id and not current_new_max_id:
            break

        for post in all_posts:
            if (posts_new_boolean and int(post.get('id', 0)) >= int(max_id) and int(post.get('id', 0)) <= int(since_id)) or not posts_new_boolean:
                posts_new_boolean = False
                url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
                break
            else:
                url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_new_max_id - 1}"
                 break
                
        response = requests.get(url, headers=headers)
                if response.status_code != 200:
                break

                new_posts = response.json()
                if not new_posts:
                    break
        # Check if the last post's ID is greater than the max_id from the frontend
        if posts_new_boolean:
            for post in new_posts:
                if int(post.get('id', 0)) >= int(max_id) and int(post.get('id', 0)) <= int(since_id):
                    posts_new_boolean = False
                    url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
                    response = requests.get(url, headers=headers)
                    break
                    if response.status_code != 200:
                        break
                    new_posts = response.json()

        all_posts.extend(new_posts)
        if new_posts and posts_new_boolean:
            current_new_max_id = int(new_posts[-1].get('id', 0))
        elif new_posts and not posts_new_boolean:
            current_max_id = int(new_posts[-1].get('id', 0))  # Update pagination cursor
    
    return all_posts