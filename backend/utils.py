def clean_output(text):
    # Replace newlines with space
    cleaned = text.replace('\n', ' ').strip()
    # Optional: collapse multiple spaces into one
    cleaned = ' '.join(cleaned.split())
    return cleaned