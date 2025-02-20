import requests

def fetch_multiple_old_posts(instance_url, headers, postsOld, iterations=10, limit=40):
    all_posts = postsOld
    
    if not isinstance(postsOld, list) or not postsOld:
        return all_posts

    current_max_id = postsOld[-1].get('id', '')
    
    for _ in range(iterations):
        if not current_max_id:
            break
        
        url = f"{instance_url}/api/v1/timelines/public?remote=true&limit={limit}&max_id={current_max_id}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            break
        
        new_posts = response.json()
        if not new_posts:
            break
        
        all_posts.extend(new_posts)
        current_max_id = new_posts[-1].get('id', '')

    return all_posts
