def get_mock_completion(document):
    words = document.split()
    if len(words) == 0:
        return None
    first_word = words[0]
    last_word = words[-1]

    return f"""
    {{
        "diff": [
        {{
            "start": "{first_word}",
            "end": "{last_word}",
            "replacement": "This is a mocked replacement."
        }}
    ]
    }}
    """
