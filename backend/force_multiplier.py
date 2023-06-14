import logging
import os
from types import SimpleNamespace
import openai
import json

MOCK_COMPLETION = os.getenv("MOCK_COMPLETION", False)


def apply_feedback(document, feedback):
    diff = apply_diff(document=document, diff=get_diff(document=document, feedback=feedback))
    return diff


def get_diff(document, feedback):
    system_prompt = """
    I am an AI capable of editing text based on user feedback. You can give me a document and your feedback about the document, and I will propose changes.

    In response to your feedback, I will identify specific sections of text to be replaced. For each section, I will provide the unique starting words and unique ending words of the block of text to be replaced, as well as the replacement text.

    Note: The 'end' text is the first instance of the specified ending text that comes after the 'start' text within the block to be replaced.

    Here's an example:

    Given the document:
        "There was a girl named Lily. Lily had a hiding place."

    And the feedback:
        "Change the girl's name to Susy."

    I might suggest:
    {
        "diff": [
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
        "comment": "I will include a comment here only if really necessary"
    }
    
    Each block of text to be replaced is represented as a JSON object with the keys 'start', 'end', and 'replacement'. If multiple blocks of text need to be replaced, I will return a list of such JSON objects.
    If the feedback makes sense, I will return my response as arguments to the apply_diff function. If the feedback is irrelevant to the document, I will return my response as an argument to the report_irrelevant_feedback function.
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

    completion = get_mock_completion(document) if MOCK_COMPLETION else get_completion(messages)
    logging.info(completion)

    return json.loads(completion, object_hook=lambda d: SimpleNamespace(**d))


def get_completion(messages):
    res = openai.ChatCompletion.create(
        model="gpt-4-0613",
        messages=messages,
        timeout=15,
        temperature=1,
        functions=[
            {
                "name": "apply_diff",
                "description": "This function replaces a document's text between the start and end tokens, inclusive, with the replacement. A comment is optionally included if it's absolutely necessary to explain the diff",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "diff": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "start": {
                                        "type": "string"
                                    },
                                    "end": {
                                        "type": "string"
                                    },
                                    "replacement": {
                                        "type": "string"
                                    }
                                },
                                "required": ["start", "end", "replacement"]
                            }
                        },
                        "comment": {
                            "type": "string"
                        }
                    },
                    "required": ["diff"]
                },
            },
            {
                "name": "report_irrelevant_feedback",
                "description": "This function allows the caller to report the reason that the feedback does not apply to the document.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "reason": {
                            "type": "string"
                        }
                    },
                    "required": ["reason"]
                },
            }
        ]
    ).choices[0]

    try:
        return process_result(res)
    except Exception as e:
        print(str(e))
        raise e


def process_result(res):
    if res.finish_reason != "function_call":
        raise Exception(res.message.content)

    function_call = res.message.function_call

    if function_call.name != "apply_diff":
        raise Exception(function_call.arguments)

    return function_call.arguments


def get_mock_completion(document):
    words = document.split()
    if len(words) == 0:
        return None
    first_word = words[0]
    last_word = words[-1]

    return f"""
    [
        {{
            "start": "{first_word}",
            "end": "{last_word}",
            "replacement": "This is a mocked replacement."
        }}
    ]"""


def apply_diff(document, diff):
    for change in diff.diff:
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
