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

    # Build URLs
    base_url = f"{instance_url}/api/v1/timelines/public?remote=true&limit=40"
    url_old = f"{base_url}&max_id={int(max_id) - 1}" if max_id else base_url
    # Fetch posts
    posts_new = []
    errors = []

    response_new = requests.get(base_url, headers=headers)
    if response_new.status_code == 200:
        posts_new_first = response_new.json()
        for post in posts_new_first:
            if post.get('id', 0) <= since_id and post.get('id', 0) >= max_id:
                posts_new = False
            else:
                posts_new = posts_new_first
    else:
        errors.append(f"New posts failed: {response_new.status_code}")

    # Fetch additional old posts if needed
    new_max_id = False
    if posts_new:
        new_max_id = posts_new[-1].get('id', 0)

    multiple_old_posts = []
    if posts_new:
        try:
            multiple_old_posts = fetch_multiple_old_posts(
                instance_url=instance_url,
                headers=headers,
                new_max_id=new_max_id,
                since_id=since_id,
                max_id=max_id,
                url_old=url_old
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