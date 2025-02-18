from flask import Blueprint
from controllers.auth_controller import login, callback, getme, logout
from middleware.protect_route import authenticate_request
from flask_cors import CORS

auth_routes = Blueprint('auth', __name__)

CORS(
    auth_routes,
    resources={
        r"/api/*": {
            "origins": "https://vyox.vercel.app",
            "allow_headers": ["Accept", "Content-Type", "Origin", "Authorization"],
            "expose_headers": ["Accept", "Content-Type", "Origin", "Authorization"]
        }
    },
    supports_credentials=True
)

auth_routes.route('/api/login', methods=['GET'])(login)
auth_routes.route('/api/callback', methods=['GET'])(callback)
auth_routes.route('/api/me', methods=['POST'])(authenticate_request(getme))
auth_routes.route('/api/logout', methods=['POST'])(authenticate_request(logout))