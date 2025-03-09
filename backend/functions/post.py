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
            if posts_new and max_id and since_id:
                for post in posts_new:
                    pid = int(post.get('id', 0))
                    if (pid >= int(max_id) and pid <= int(since_id)):
                        posts_new_boolean = False  # If any post is within range, switch to old posts mode
                        break
                    else:
                        posts_new_boolean = True
            elif posts_new:
                posts_new_boolean = True
                
    current_max_id = int(max_id) if max_id else None
    if not posts_new_boolean:
        posts_old_response = requests.get(url_old, headers=headers)
        if posts_old_response.status_code == 200:
            posts_old = posts_old_response.json()
            if posts_old:
                current_max_id = int(posts_old[-1].get('id', 0))
        else:
            errors.append(f"Old posts failed: {posts_old_response.status_code}")
        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    all_posts = posts_new if posts_new_boolean else posts_old

    current_new_max_id = int(posts_new[-1].get('id', 0)) if posts_new_boolean and posts_new else None

    for _ in range(iterations):
        if not current_max_id and not current_new_max_id:
            break

        if posts_new_boolean and current_new_max_id is not None:
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_new_max_id - 1}"
        else:
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break

        new_posts = response.json()
        if not new_posts:
            break

        for post in new_posts:
            pid = int(post.get('id', 0))
            if max_id and since_id and (pid >= int(max_id) and pid <= int(since_id)):
                posts_new_boolean = False
                break
            else:
                break

        if not posts_new_boolean:
            # Fetch again using max_id to ensure we're not getting posts within the forbidden range
            current_new_max_id = None
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                break
            new_posts = response.json()
            if not new_posts:
                break

        all_posts.extend(new_posts)
        if new_posts and posts_new_boolean:
            current_new_max_id = int(new_posts[-1].get('id', 0))
        elif new_posts and not posts_new_boolean:
            current_max_id = int(new_posts[-1].get('id', 0))

    return all_posts