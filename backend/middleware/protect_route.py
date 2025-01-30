from functools import wraps
from flask import session, jsonify

def authenticate_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        access_token = session.get('access_token')

        if not access_token:
            return jsonify({"error": "User not authenticated"}), 401

        # Authentication successful
        print("Authentication successful")
        return f(*args, **kwargs)

    return decorated_function