import requests
from flask import jsonify

def fetch_multiple_old_posts(instance_url, headers, new_max_id, url_old, since_id, max_id, iterations=4, limit=40):
    errors = []

    if new_max_id:
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={new_max_id - 1}"
        postsNew = requests.get(url, headers=headers)
        posts_new = postsNew.json()
        if posts_new[-1].get('id', '') > max_id:
            posts_new_boolean = True
        else:
            posts_new_boolean = False

    if posts_new_boolean == False:
        postsOld = requests.get(url_old, headers=headers)
        if postsOld.status_code == 200:
            posts_old = postsOld.json()
        else:
            errors.append(f"Old posts failed: {postsOld.status_code}")

        if errors:
            return jsonify({"error": "Failed to fetch posts", "details": errors}), 400
    
    if posts_new_boolean == True:
        all_posts = posts_new
    else:
        all_posts = posts_old

    if posts_old:
        current_max_id = posts_old[-1].get('id', '')
    else:
        current_max_id = max_id
    if posts_new_boolean == True:
        current_new_max_id = posts_new[-1].get('id', '')
    
    for _ in range(iterations):
        if not current_max_id or current_new_max_id:
            break

        if posts_new_boolean == True and current_new_max_id > max_id:
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_new_max_id - 1}"
        else:
            posts_new_boolean == False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            break
        
        new_posts = response.json()
        if not new_posts:
            break
        
        if new_posts[-1].get('id', '') < max_id:
            posts_new_boolean == False
            url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id - 1}"
            response = requests.get(url, headers=headers)

        all_posts.extend(new_posts)
        if posts_new_boolean == True:
            current_new_max_id = new_posts[-1].get('id', '')
        else:
            current_new_max_id = new_posts[-1].get('id', '')
    
    return all_posts
