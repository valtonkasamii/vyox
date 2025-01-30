from flask import jsonify, request
import requests
import os
from dotenv import load_dotenv
from data_science.post import is_english, has_a_tags
from functions.post import fetch_multiple_old_posts

load_dotenv()

def getAllPosts():
    data = request.get_json() or {}
    
    since_id = data.get('since_id')
    max_id = data.get('max_id')

    instance_url = os.getenv('FEDIVERSE_INSTANCE_URL')
    access_token = os.getenv('FEDIVERSE_ACCESS_TOKEN')
    
    if not instance_url or not access_token:
        return jsonify({"error": "Server misconfigured"}), 500

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    url_new = f"{instance_url}/api/v1/timelines/public?remote=true&limit=40"
    url_old = f"{instance_url}/api/v1/timelines/public?remote=true&limit=40"
    
    if since_id:
        url_new += f"&since_id={since_id}"
    if max_id:
        url_old += f"&max_id={max_id}"

    response_new = requests.get(url_new, headers=headers) if since_id else None
    response_old = requests.get(url_old, headers=headers)

    posts_new = []
    posts_old = []
    errors = []

    if since_id:
        if response_new.status_code == 200:
            posts_new = response_new.json()
        else:
            errors.append(f"New posts failed: {response_new.status_code}")

    if response_old.status_code == 200:
        posts_old = response_old.json()
    else:
        errors.append(f"Old posts failed: {response_old.status_code}")

    if errors:
        return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    multiple_old_posts = []
    if posts_old:
        try:
            multiple_old_posts = fetch_multiple_old_posts(
                instance_url=instance_url,
                headers=headers,
                postsOld=posts_old
            )
        except Exception as e:
            print(f"Error fetching old posts: {str(e)}")

    combined_posts = posts_new + multiple_old_posts
    filtered_posts = []
    for post in combined_posts:
        content = post.get('content', '')
        media_attachments = post.get('media_attachments', [])

        if (content and is_english(content)) or (not content and len(media_attachments) > 0):
            filtered_posts.append(post)

            filtered_posts = [
                post for post in filtered_posts
                    if not has_a_tags(post.get('content', ''))
                ]
    return jsonify(filtered_posts), 200