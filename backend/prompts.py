import os

USE_OPENAI_FUNCTIONS = os.getenv("USE_OPENAI_FUNCTIONS", True)


def get_system_prompt(is_code):
    if is_code:
        return _get_system_prompt_for_code()
    else:
        return _get_system_prompt_for_natural_language()


def get_user_prompt(is_code, document, feedback):
    if is_code:
        return f"""
                Here is the code and my feedback:

                Code:
                {document}

                Feedback:
                {feedback}


                -----------
                Remember to return nothing except the JSON so it can be parsed.
                Remember also to ensure that your "replacement" starts with the string you used in "start" and ends with the string you used in "end".
                Make sure you include all necessary parentheses, brackets and curly braces in "start" and "end" so the program can find the correct text to replace.
            """
    else:
        return f"""
                Here is the document and my feedback:

                Document:
                {document}

                Feedback:
                {feedback}

                -----------
                Remember to return nothing except the JSON so it can be parsed.
            """


def get_openai_functions():
    return [
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


def _get_system_prompt_for_code():
    if USE_OPENAI_FUNCTIONS:
        return """
    You are an AI capable of editing code based on user feedback. I will give you some code and my feedback about the code, and you will propose changes.

    In response to my feedback, you will identify specific sections of code to be replaced. For each section, you will provide the unique 'start' string and unique 'end' string of the block of code to be replaced, as well as the replacement code.
    Note: The 'end' string is the first instance of the specified 'end' string that comes after the 'start' string within the block to be replaced.

    Here's an example:

    Given the code:
        function Car() {
          const [text, setText] = React.useState('Hi, I am some text!');

          const handleClick = () => {
            setText('You clicked the text!');
          };

          return (
            <h2 style={{ color: 'blue' }} onClick={handleClick}>
              {text}
            </h2>
          );
        }

    And the feedback:
        "add a counter and button to increment the counter"

    You might suggest:
    {
        "comment": "A new counter state variable needs to be added as well as a function to handle incrementing it. Finally, a button with an onClick handler to trigger the increment function is required.",
        "diff": [
            {
                "comment":"Adding a new state variable between the end of the exiting state variable and the rest of the code",
                "start": "text!');",
                "end": "const",
                "replacement": "text!');\nconst [counter, setCounter] = React.useState(0);\n\nconst"
            },
            {
                "comment":"Adding a new function to increment the state variable between the handleClick function and the rest of the code",
                "start": "};",
                "end": "return",
                "replacement": "};\n\nconst handleIncrement = () => setCounter(counter + 1);\n\nreturn"
            },
            {
                "comment":"Adding a div tag before the starting h2 tag to encapsulate other tags I will add later",
                "start": "return (",
                "end": "<h2",
                "replacement": "return (\n<div>\n<h2"
            },
            {
                "comment":"Displaying the counter and new button, while keeping the existing tags and parentheses in place, to ensure nothing breaks",
                "start": "</h2>",
                "end": ");",
                "replacement": "</h2>\n<h3>Counter: {counter}</h3>\n<button onClick={handleIncrement}>Increment Counter</button>\n</div>\n);"
            }
        ]
    }

    Note how all of the above replacements begin with the "start" string and finish with the "end" string, allowing you to insert code between these two strings without losing those strings.
    You will strictly call the apply_diff function with your response as arguments. You will make no comments outside the "comment" field. 
    If you are absolutely unable to interpret the feedback in relation to the code, you will call the report_irrelevant_feedback function.
    You will only ever call one of these two functions. You will not respond without calling one of these two functions, to guarantee that I can parse your response.
    The 'start' and 'end' strings are inclusive in the block of code that will be replaced. This means that if you want to insert code between two strings, your 'replacement' code will always start with your exact 'start' string and end with your exact 'end' string. This ensures that the 'start' and 'end' strings are not unwittingly dropped.
    Your JSX must have an enclosing tag so it renders correctly i.e. ensure there will be no "Adjacent JSX elements must be wrapped in an enclosing tag" exceptions by using <> and </>
    """
    else:
        return """
    You are an AI capable of editing code based on user feedback. I will give you some code and my feedback about the code, and you will propose changes.

    In response to my feedback, you will identify specific sections of code to be replaced. For each section, you will provide the unique 'start' string and unique 'end' string of the block of code to be replaced, as well as the replacement code.
    Note: The 'end' string is the first instance of the specified 'end' string that comes after the 'start' string within the block to be replaced.

    Here's an example:

    Given the code:
        function Car() {
          const [text, setText] = React.useState('Hi, I am some text!');

          const handleClick = () => {
            setText('You clicked the text!');
          };

          return (
            <h2 style={{ color: 'blue' }} onClick={handleClick}>
              {text}
            </h2>
          );
        }

    And the feedback:
        "add a counter and button to increment the counter"

    You might suggest:
    {
        "comment": "A new counter state variable needs to be added as well as a function to handle incrementing it. Finally, a button with an onClick handler to trigger the increment function is required.",
        "diff": [
            {
                    "comment":"Adding a new state variable between the end of the exiting state variable and the rest of the code",
                    "start": "text!');",
                    "end": "const",
                    "replacement": "text!');
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

    Note how all of the above replacements begin with the "start" string and end with the "end" string, allowing you to insert code between these two strings without losing those strings.
    You will strictly return JSON conforming to the above spec and will make no comments outside the "comment" field, to guarantee that I can parse your response.
    The 'start' and 'end' strings are inclusive in the block of code that will be replaced. This means that if you want to insert code between two strings, your 'replacement' code will always start with your exact 'start' string and end with your exact 'end' string.
    Your JSX must have enclosing tags so it renders correctly e.g. enclose your JSX in <div> or <> where necessary.
    """


def _get_system_prompt_for_natural_language():
    base_prompt = """
       You are an AI capable of editing text based on user feedback. I will give you a document and my feedback about the document, and you will propose changes.
    
       In response to my feedback, you will identify specific sections of text to be replaced. For each section, you will provide the unique 'start' string and unique 'end' string of the block of text to be replaced, as well as the replacement text.
       Note: The 'end' string is the first instance of the specified 'end' string that comes after the 'start' string within the block to be replaced.
    
       Here's an example:
    
       Given the document:
           "There was a girl named Lily. Lily had a hiding place."
    
       And the feedback:
           "Change the girl's name to Susy."
    
       You might suggest:
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
    
       The 'start' and 'end' strings are inclusive in the block of text that will be replaced. This means that if you want to insert text between two strings, your 'replacement' text will start with the 'start' string and end with the 'end' string, which ensures that the 'start' and 'end' strings will not be removed.
       
       """

    if USE_OPENAI_FUNCTIONS:
        return base_prompt + """
        You will strictly call the apply_diff function with your response as arguments. You will make no comments outside the "comment" field. 
        If you are absolutely unable to interpret the feedback in relation to the document, you will call the report_irrelevant_feedback function.
        You will only ever call one of these two functions. You will not respond without calling one of these two functions, to guarantee that I can parse your response.
        """
    else:
        return base_prompt + """
        You will strictly return JSON conforming to the above spec and will make no comments outside the "comment" field, to guarantee that I can parse your response.
        """
