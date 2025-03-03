from flask import jsonify, request
import requests
import os
from dotenv import load_dotenv
from data_science.post import is_english, has_a_tags
from functions.post import fetch_multiple_old_posts

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

    # Build base URL
    base_url = f"{instance_url}/api/v1/timelines/public?remote=true&limit=40"
    
    # Fetch initial posts
    initial_url = base_url
    if max_id:
        initial_url += f"&max_id={max_id}"
    
    posts_new = []
    response = requests.get(initial_url, headers=headers)
    if response.status_code == 200:
        posts_new = response.json()
    else:
        return jsonify({"error": "Failed to fetch initial posts"}), 400

    # Determine new max_id from the response
    new_max_id = posts_new[-1]['id'] if posts_new else None
    
    # Fetch older posts using the updated max_id
    multiple_old_posts = []
    if posts_new:
        try:
            multiple_old_posts = fetch_multiple_old_posts(
                instance_url=instance_url,
                headers=headers,
                current_max_id=new_max_id,
                iterations=3
            )
        except Exception as e:
            print(f"Error fetching old posts: {str(e)}")

    combined_posts = posts_new + multiple_old_posts

    # Filtering
    filtered_posts = []
    for post in combined_posts:
        content = post.get('content', '')
        if len(content) > 60 and is_english(content):
            # Only add posts that don't have <a> tags in the content
            if not has_a_tags(content):
                filtered_posts.append(post)

    # Deduplicate posts by account.username (keep first occurrence)
    seen_accounts = set()
    deduplicated_posts = []
    for post in filtered_posts:
        account_username = post.get('account', {}).get('username')
        if account_username and account_username not in seen_accounts:
            seen_accounts.add(account_username)
            deduplicated_posts.append(post)

    return jsonify(deduplicated_posts), 200