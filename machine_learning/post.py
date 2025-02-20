import requests
import logging
import tempfile
import os
import tensorflow as tf

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None  # Cache the model globally

def is_nsfw(image_url, threshold=0.99):
    """
    Check if an image is NSFW using a pre-trained TensorFlow/Keras model.
    Returns True if NSFW probability >= threshold.
    """
    global model
    # Update the path to the correct location
    model_path = os.path.abspath("C:/Users/valto/OneDrive/Desktop/vyox/backend/machine_learning/nsfw_mobilenet2.224x224.h5")

    # Check if the model file exists
    if not os.path.exists(model_path):
        logger.error(f"Model file not found: {model_path}")
        logger.error("Please ensure 'nsfw_mobilenet2.224x224.h5' is in the correct directory.")
        return False

    # Load the model if not loaded
    if model is None:
        try:
            model = tf.keras.models.load_model(model_path)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    # Download the image
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download image: {e}")
        return False

    tmp_path = None
    try:
        # Save to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    tmp_file.write(chunk)
            tmp_path = tmp_file.name

        # Preprocess the image
        img = tf.keras.utils.load_img(tmp_path, target_size=(224, 224))
        img_array = tf.keras.utils.img_to_array(img)
        img_array = tf.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize

        # Predict
        predictions = model.predict(img_array)
        # Assuming the output order is: [neutral, porn, sexy, hentai, drawings]
        nsfw_prob = predictions[0][1] + predictions[0][2] + predictions[0][3]

        logger.info(f"NSFW Probability: {nsfw_prob:.4f}")
        return nsfw_prob >= threshold

    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return False
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
                logger.debug(f"Deleted temp file: {tmp_path}")
            except OSError as e:
                logger.warning(f"Failed to delete temp file: {e}")