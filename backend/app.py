from flask import Flask, Session
from dotenv import load_dotenv 
from flask_cors import CORS
import os
from routes.auth_routes import auth_routes
from routes.posts_route import post_routes
import redis

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {
        "origins": "https://vyox-frontend.onrender.com",
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }},
)

@app.after_request
def add_cors_headers(response):
    # Allow your frontend origin
    response.headers['Access-Control-Allow-Origin'] = 'https://vyox-frontend.onrender.com'
    # Allow credentials (cookies)
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    # Allow specific headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    # Allow specific methods
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH'
    return response

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

Session(app)
app.config['SESSION_TYPE'] = 'redis'  # Use Redis for session storage
app.config['SESSION_REDIS'] = redis.Redis(
    host=os.getenv('REDIS_HOST'),  # Replace with your Upstash Redis host
    port=os.getenv('PORT'),  # Replace with your Upstash Redis port
    password=os.getenv('REDIS_PASS'),  # Replace with your Upstash Redis password
    ssl=True  # Enable SSL for secure connection
)
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

app.register_blueprint(auth_routes)
app.register_blueprint(post_routes)

if __name__ == '__main__':
    app.run(debug=True)