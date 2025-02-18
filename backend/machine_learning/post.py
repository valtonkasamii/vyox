import requests
import logging
from nsfw_detector import predict
import tempfile
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



def is_nsfw(image_url, threshold=0.85):
    """
    Check if an image is NSFW.

    Args:
        image_url (str): URL of the image to check.
        threshold (float): NSFW confidence threshold (default: 0.85).

    Returns:
        bool: True if the image is NSFW, False otherwise.
    """
    