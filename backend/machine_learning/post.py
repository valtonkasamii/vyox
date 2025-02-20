def is_nsfw(image_url, threshold=0.99):
    """
    Check if an image is NSFW using a pre-trained TensorFlow/Keras model.
    Returns True if NSFW probability >= threshold.
    """