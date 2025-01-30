from langdetect import detect_langs, LangDetectException
import string
import re

def has_a_tags(text):
    return bool(re.search(r'<a\b[^>]*>.*?</a>', text, flags=re.IGNORECASE))

def is_english(text, min_confidence=0.7):
   
    cleaned = re.sub(r'\s+', ' ', text).strip()  # Normalize whitespace
    
    # Skip empty strings after cleaning
    if not cleaned:
        return False
    
    try:
        # 1. Language confidence check
        langs = detect_langs(cleaned)
        english_conf = next((l.prob for l in langs if l.lang == 'en'), 0)
        if english_conf < min_confidence:
            return False
        
        # 2. Strict character validation
        valid_chars = set(
            string.ascii_letters +  
            string.digits +         
            string.whitespace +     
            string.punctuation +    
            "'’@#%"                
        )
        
        # Check ALL characters are valid
        for char in cleaned:
            if char not in valid_chars:
                return False
        
        return True
    
    except LangDetectException:
        return False