from flask import jsonify, request
import requests
import os
from dotenv import load_dotenv
from data_science.post import is_english, has_a_tags
from functions.post import fetch_multiple_old_posts
from machine_learning.post import is_nsfw

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
    url_new = f"{base_url}&since_id={since_id}" if since_id else None
    url_old = f"{base_url}&max_id={max_id}" if max_id else base_url

    # Fetch posts
    posts_new = []
    posts_old = []
    errors = []

    if since_id and url_new:
        response_new = requests.get(url_new, headers=headers)
        if response_new.status_code == 200:
            posts_new = response_new.json()
        else:
            errors.append(f"New posts failed: {response_new.status_code}")

    response_old = requests.get(url_old, headers=headers)
    if response_old.status_code == 200:
        posts_old = response_old.json()
    else:
        errors.append(f"Old posts failed: {response_old.status_code}")

    if errors:
        return jsonify({"error": "Failed to fetch posts", "details": errors}), 400

    # Fetch additional old posts if needed
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

    # Filtering
    filtered_posts = []
    for post in combined_posts:
        content = post.get('content', '')
        media_attachments = post.get('media_attachments', [])
        if (content and is_english(content)) or (not content and len(media_attachments) > 0):
            # Only add posts that don't have <a> tags in the content
            if not has_a_tags(content):
                filtered_posts.append(post)

    # Deduplicate posts by account.acct (keep first occurrence)
    seen_accounts = set()
    deduplicated_posts = []
    for post in filtered_posts:
        account_acct = post.get('account', {}).get('acct')
        if account_acct not in seen_accounts:
            seen_accounts.add(account_acct)
            deduplicated_posts.append(post)

    # Filter posts with NSFW images
    safe_posts = []
    for post in deduplicated_posts:
        has_nsfw = False
        for media in post.get('media_attachments', []):
            if media['type'] == 'image' and is_nsfw(media['url']):
                has_nsfw = True
                break
        if not has_nsfw:
            safe_posts.append(post)

    return jsonify(safe_posts), 200
