from functools import wraps
from flask import session, jsonify, request

def authenticate_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json() or {}
        access_token = data.get('accessToken')

        if not access_token:
            return jsonify({"error": "User not authenticated"}), 401

        # Authentication successful
        print("Authentication successful")
        return f(*args, **kwargs)

    return decorated_function