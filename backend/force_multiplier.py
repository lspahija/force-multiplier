import logging
import os
from types import SimpleNamespace
import openai
import json

MOCK_COMPLETION = os.getenv("MOCK_COMPLETION", False)


async def apply_feedback(document, document_is_code, feedback, api_key):
    diff = await get_diff(document=document, document_is_code=document_is_code, feedback=feedback, api_key=api_key)
    modified_document = apply_diff(document=document, diff=diff)
    return modified_document


async def get_diff(document, document_is_code, feedback, api_key):
    messages = [
        {
            "role": "system",
            "content": get_system_prompt(document_is_code)
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

    completion = get_mock_completion(document) if MOCK_COMPLETION else await get_completion(messages, api_key)
    logging.info(completion)

    return json.loads(completion, object_hook=lambda d: SimpleNamespace(**d))


async def get_completion(messages, api_key):
    res = await openai.ChatCompletion.acreate(
        model="gpt-4-0613",
        messages=messages,
        api_key=api_key,
        timeout=15,
        temperature=1,
        functions=[
            {
                "name": "apply_diff",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "comment": {
                            "type": "string"
                        },
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
                        }
                    },
                    "required": ["diff"]
                },
            },
            {
                "name": "report_irrelevant_feedback",
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
    )

    first_choice = res.choices[0]

    try:
        return process_result(first_choice)
    except InadequateFeedbackException as e:
        print(str(e))
        raise e


def process_result(res):
    if res.finish_reason != "function_call":
        raise InadequateFeedbackException(res.message.content)

    function_call = res.message.function_call

    if function_call.name != "apply_diff":
        raise InadequateFeedbackException(function_call.arguments)

    return function_call.arguments


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


def apply_diff(document, diff):
    new_document = ""
    current_index = 0

    for change in sorted(diff.diff, key=lambda x: document.find(x.start)):
        start = change.start
        end = change.end
        replacement = change.replacement

        block_start_index = document.find(start, current_index)
        block_end_index = document.find(end, block_start_index + len(start)) + len(end)

        if block_start_index != -1 and block_end_index != -1:
            new_document += document[current_index:block_start_index] + replacement
            current_index = block_end_index

    new_document += document[current_index:]
    return new_document


def get_system_prompt(is_code):
    if is_code:
        return """
    I am an AI capable of editing code based on user feedback. You can give me some code and your feedback about the code, and I will propose changes.

    In response to your feedback, I will identify specific sections of code to be replaced. For each section, I will provide the unique 'start' string and unique 'end' string of the block of code to be replaced, as well as the replacement code.
    Note: The 'end' string is the first instance of the specified 'end' string that comes after the 'start' string within the block to be replaced.

    Here's an example:

    Given the code:
        function Car() {
          const [text, setText] = React.useState('Hi, I am a Car!');
        
          const handleClick = () => {
            setText('You clicked the car!');
          };
        
          return (
            <h2 style={{ color: 'blue' }} onClick={handleClick}>
              {text}
            </h2>
          );
        }

    And the feedback:
        "add a counter and button to increment the counter"

    I might suggest:
    {
        "comment": "A new counter state variable needs to be added as well as a function to handle incrementing it. Finally, a button with an onClick handler to trigger the increment function is required."
        "diff": [
            {
                    "comment":"Adding a new state variable between the end of the exiting state variable and the rest of the code",
                    "start": "Car!');",
                    "end": "const",
                    "replacement": "Car!');
                      const [counter, setCounter] = React.useState(0);
                    
                      const"
            },
            {
                "comment":"Adding a new function to increment the state variable between the handleClick function and the rest of the code",
                "start": "};",
                "end": "return",
                "replacement": "};

                              const handleIncrement = () => setCounter(counter + 1);
                            
                              return"
            },
            {
                "comment":"Adding a div tag before the starting h2 tag to encapsulate other tags I will add later",
                "start": "return (",
                "end": "<h2",
                "replacement": "return (
                                    <div>
                                      <h2"
            },
            {
                "comment":"Displaying the counter and new button, while keeping the existing tags and parentheses in place, to ensure nothing breaks",
                "start": "</h2>",
                "end": ");",
                "replacement": "</h2>
                                  <h3>Counter: {counter}</h3>
                                  <button onClick={handleIncrement}>Increment Counter</button>
                                </div>
                              );"
            }
        ]
    }
    
    Note how all of the above replacements begin with the "start" string and finish with the "end" string, allowing me to insert code between these two strings without losing those strings.
    I will strictly call the apply_diff function with my response as arguments. I will make no comments outside the "comment" field. 
    If I am absolutely unable to interpret the feedback in relation to the code, I will call the report_irrelevant_feedback function.
    I will only ever call one of these two functions. I will not respond without calling one of these two functions, to guarantee that you can parse my response.
    The 'start' and 'end' strings are inclusive in the block of code that will be replaced. This means that if I want to insert code between two strings, my 'replacement' code will always start with my exact 'start' string and end with my exact 'end' string. This ensures that the 'start' and 'end' strings are not unwittingly dropped.
    """
    else:
        return """
           I am an AI capable of editing text based on user feedback. You can give me a document and your feedback about the document, and I will propose changes.
       
           In response to your feedback, I will identify specific sections of text to be replaced. For each section, I will provide the unique 'start' string and unique 'end' string of the block of text to be replaced, as well as the replacement text.
           Note: The 'end' string is the first instance of the specified 'end' string that comes after the 'start' string within the block to be replaced.
       
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
           
           I will strictly call the apply_diff function with my response as arguments. I will make no comments outside the "comment" field. 
           If I am absolutely unable to interpret the feedback in relation to the document, I will call the report_irrelevant_feedback function.
           I will only ever call one of these two functions. I will not respond without calling one of these two functions, to guarantee that you can parse my response.
           The 'start' and 'end' strings are inclusive in the block of text that will be replaced. This means that if I want to insert text between two strings, my 'replacement' text will start with the 'start' string and end with the 'end' string, which ensures that the 'start' and 'end' strings will not be removed.
           """


class InadequateFeedbackException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
