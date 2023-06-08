from types import SimpleNamespace

import openai
import json


def apply_feedback(document, feedback):
    return apply_diff(
        document=document,
        diff=get_diff(document=document, feedback=feedback)
    )


def get_diff(document, feedback):
    system_prompt = """
    I am an AI capable of editing text based on user feedback. You can give me a document and your feedback about the document, and I will propose changes.

    In response to your feedback, I will identify specific sections of text to be replaced. For each section, I will provide the unique starting words and unique ending words of the block of text to be replaced, as well as the replacement text.

    Note: The 'end' text is the first instance of the specified ending text that comes after the 'start' text within the block to be replaced.

    Here's an example:

    Given the document:
        "Once upon a time in a small, quaint village nestled deep within a lush forest, there lived a young girl named Lily. She possessed a heart filled with curiosity and a mind eager for adventure. Lily had a secret hiding place in the hollow of an ancient oak tree, where she would spend countless hours reading books and imagining far-off lands."

    And the feedback:
        "Change the girl's name to Susy."

    I might suggest:
    [
        {
            "start": "named",
            "end": "Lily.",
            "replacement": "named Susy."
        },
        {
            "start": "Lily had",
            "end": "a",
            "replacement": "Susy had a"
        }
    ]
    
    I won't response with anything other than JSON.
    
    Each block of text to be replaced is represented as a JSON object with the keys 'start', 'end', and 'replacement'. If multiple blocks of text need to be replaced, I will return a list of such JSON objects.
    """

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": f"""
                Here is the document and my feedback:
            
                Document:
                {document}
            
                Feedback:
                {feedback}
            """
        }
    ]

    res = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        timeout=15
    )
    completion = res['choices'][0]['message']['content']
    print(completion)
    return json.loads(completion, object_hook=lambda d: SimpleNamespace(**d))


def apply_diff(document, diff):
    for change in diff:
        start = change.start
        end = change.end
        replacement = change.replacement

        block_start_index = document.find(start)
        if block_start_index != -1:
            remaining_document = document[block_start_index + len(start):]
            block_end_index = remaining_document.find(end) + len(end)

            if block_end_index != -1:
                document = document[:block_start_index] + replacement + remaining_document[block_end_index:]

    return document
