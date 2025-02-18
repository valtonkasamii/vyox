from flask import Flask
from flask_session import Session
from dotenv import load_dotenv 
from flask_cors import CORS
import os
from routes.auth_routes import auth_routes
from routes.posts_route import post_routes

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    origins="http://localhost:5000",
    allow_headers=["Accept", "Content-Type", "Origin", "Authorization"],
    expose_headers=["Accept", "Content-Type", "Origin", "Authorization"],
    supports_credentials=True
)

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

app.register_blueprint(auth_routes)
app.register_blueprint(post_routes)

if __name__ == '__main__':
    app.run(debug=True)