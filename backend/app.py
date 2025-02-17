from flask import Flask
from flask_session import Session
from dotenv import load_dotenv 
from flask_cors import CORS
import os
from routes.auth_routes import auth_routes
from routes.posts_route import post_routes
import redis
from datetime import timedelta

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "https://vyox.onrender.com",
            "allow_headers": ["Accept", "Content-Type", "Origin", "Authorization"],
            "expose_headers": ["Accept", "Content-Type", "Origin", "Authorization"]
        }
    },
    supports_credentials=True
)

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')
app.config.update({
    'SESSION_TYPE': 'redis',
    'SESSION_REDIS': redis.Redis(
        host=os.getenv('REDIS_HOST'),
        port=int(os.getenv('REDIS_PORT')),
        password=os.getenv('REDIS_PASS'),
        ssl=True,
        ssl_cert_reqs=None  # Disable certificate verification
    ),
    'SESSION_PERMANENT': True,
    'PERMANENT_SESSION_LIFETIME': timedelta(days=30),  # Set session lifetime
    'SESSION_COOKIE_SECURE': True,
    'SESSION_COOKIE_SAMESITE': 'None',
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_REFRESH_EACH_REQUEST': False
})

# Initialize session after config
Session(app)

app.register_blueprint(auth_routes)
app.register_blueprint(post_routes)

if __name__ == '__main__':
    app.run(debug=True)