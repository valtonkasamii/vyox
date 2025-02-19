from flask import redirect, session, request, url_for, jsonify
import requests
import os

def login():
    client_id = os.getenv('FEDIVERSE_CLIENT_KEY')
    instance_url = os.getenv('FEDIVERSE_INSTANCE_URL')
    
    # Redirect to Mastodon OAuth
    oauth_url = f"{instance_url}/oauth/authorize?client_id={client_id}&response_type=code&scope=read write follow&redirect_uri={url_for('auth.callback', _external=True)}&force_login=true"
    return redirect(oauth_url)


def callback():
    code = request.args.get('code')
    client_id = os.getenv('FEDIVERSE_CLIENT_KEY')
    client_secret = os.getenv('FEDIVERSE_CLIENT_SECRET')
    instance_url = os.getenv('FEDIVERSE_INSTANCE_URL')

    token_url = f"{instance_url}/oauth/token"
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': url_for('auth.callback', _external=True),
    }
    response = requests.post(token_url, data=data)
    if response.status_code == 200:
        access_token = response.json()['access_token']
        return redirect(f"https://vyox.vercel.app/access_token/{access_token}")
    else:
        return jsonify({"error": "OAuth failed", "details": response.json()}), 400
    
def getme():
    data = request.get_json() or {}
    access_token = data.get('accessToken')

    instance_url = os.getenv('FEDIVERSE_INSTANCE_URL')

    if not access_token:
        return jsonify({"error": "No access token provided"}), 401

    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{instance_url}/api/v1/accounts/verify_credentials"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        flask_response = jsonify({
        "username": user_data.get("username"),
        "name": user_data.get("display_name"),
        "profile_pic": user_data.get("avatar"),
        "followers_count": user_data.get("followers_count"),
        "following_count": user_data.get("following_count"),
        "statuses_count": user_data.get("statuses_count"),
        "other_data": user_data,
        "access_token": access_token
    })
        flask_response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        flask_response.headers["Pragma"] = "no-cache"
        flask_response.headers["Expires"] = "0"
        return flask_response, 200
    else:
        return jsonify({"error": "Failed to retrieve user data", "details": response.json()}), response.status_code   


def logout():
        # Clear the entire session
        print("Session cleared")

        response = jsonify({"message": "Logout successful"}), 200
        return response 