from flask import Blueprint
from controllers.auth_controller import login, callback, getme, logout
from middleware.protect_route import authenticate_request

auth_routes = Blueprint('auth', __name__)

auth_routes.route('/login', methods=['GET'])(login)
auth_routes.route('/callback', methods=['GET'])(callback)
auth_routes.route('/me', methods=['GET'])(authenticate_request(getme))
auth_routes.route('/logout', methods=['POST'])(authenticate_request(logout))