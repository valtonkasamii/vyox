from flask import Flask, session
from dotenv import load_dotenv 
from flask_cors import CORS
import os
from routes.auth_routes import auth_routes
from routes.posts_route import post_routes

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

app.register_blueprint(auth_routes)
app.register_blueprint(post_routes)

if __name__ == '__main__':
    app.run(debug=True)