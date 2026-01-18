test_api_key_prompt = (
    'Only reply with the single lowercase word "yes" if you are able to accept and '
    'answer requests right now. If you are not able to accept requests, reply with '
    'the single lowercase word "no". Do not add any punctuation or extra words.'
)


def generate_title_prompt(text):
    prompt = (
        "You are a title generator.\n"
        "Return ONLY a short title following these STRICT rules:\n"
        "- Exactly 4 or5 words\n"
        "- No punctuation or quotation marks\n"
        "- No prefixes like 'Title:' or any explanations\n"
        "- Output plain text only\n\n"
        f"Conversation:\n{text}\n"
    )
    return prompt
