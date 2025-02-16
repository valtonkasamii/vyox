import requests
from PIL import Image
from io import BytesIO
import logging
from nsfw_detector import predict

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_nsfw(image_url, threshold=0.50):
    """
    Check if an image is NSFW.

    Args:
        image_url (str): URL of the image to check.
        threshold (float): NSFW confidence threshold (default: 0.85).

    Returns:
        bool: True if the image is NSFW, False otherwise.
    """
    try:
        # Download the image
        response = requests.get(image_url, timeout=5)
        if response.status_code != 200:
            logger.warning(f"Failed to download image: HTTP {response.status_code}")
            return False

        # Load the image and predict
        image = Image.open(BytesIO(response.content))
        predictions = predict.classify(image)

        # Check if the image is NSFW
        return predictions.get('nsfw', 0) > threshold

    except requests.exceptions.RequestException as e:
        logger.warning(f"Network error while downloading image: {e}")
        return False
    except Exception as e:
        logger.error(f"Error while processing image: {e}")
        return False
