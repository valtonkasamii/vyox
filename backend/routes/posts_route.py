from flask import Blueprint
from controllers.posts_controller import getAllPosts
from middleware.protect_route import authenticate_request

post_routes = Blueprint('posts', __name__)

post_routes.route('/posts', methods=['POST'])(authenticate_request(getAllPosts))