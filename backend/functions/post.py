import requests
from flask import jsonify

def fetch_multiple_old_posts(instance_url, headers, new_max_id, url_old, since_id, max_id, iterations=4, limit=40):
    errors = []
    posts_new_boolean = False
    posts_new = []
    posts_old = []
    
    if new_max_id:
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={int(new_max_id) - 1}"
        postsNew = requests.get(url, headers=headers)
        if postsNew.status_code == 200:
            posts_new = postsNew.json()
            if posts_new and int(posts_new[-1].get('id', '0')) > int(max_id):
                posts_new_boolean = True
            else:
                posts_new_boolean = False
        else:
            errors.append(f"New posts failed: {postsNew.status_code}")

    if not posts_new_boolean:
        postsOld = requests.get(url_old, headers=headers)
        if postsOld.status_code == 200:
            posts_old = postsOld.json()
        else:
            errors.append(f"Old posts failed: {postsOld.status_code}")

        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    all_posts = posts_new if posts_new_boolean else posts_old

    # Get current max IDs safely
    current_max_id = posts_old[-1].get('id', '') if posts_old else max_id
    current_new_max_id = (posts_new[-1].get('id', '')
                          if posts_new_boolean and posts_new else current_max_id)

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
    
    return all_posts