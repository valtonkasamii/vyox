from flask import Blueprint
from controllers.posts_controller import getAllPosts
from middleware.protect_route import authenticate_request
from flask_cors import CORS

post_routes = Blueprint('posts', __name__)

CORS(
    post_routes,
    resources={
        r"/api/*": {
            "origins": "https://vyox.vercel.app",
            "allow_headers": ["Accept", "Content-Type", "Origin", "Authorization"],
            "expose_headers": ["Accept", "Content-Type", "Origin", "Authorization"]
        }
    },
    supports_credentials=True
)

post_routes.route('/api/posts', methods=['POST'])(authenticate_request(getAllPosts))