import streamlit as st
import openai
import json

SYSTEM_PROMPT = """
You are a high-caliber AI Assistant capable of understanding and modifying text based on user feedback. I will provide you with a piece of text and then give my feedback on it. For any feedback I give, I want you to modify the text such that you provide the unique starting words and unique ending words of the block of text you wish to replace in the original text followed by the replacement text. It would look something like this:

[
    {
        "start": "Some relevant tasks",
        "end": "are able.",
        "replacement": "<your replacement text>"
    }
]

If you wish to replace multiple multiple blocks of text, you can include multiple such objects in the JSON list.
"""

def get_diff(document, feedback):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": f"""
                document:
                {document}
                ------------
                my feedback:
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
    return json.loads(completion)


def apply_completion_to_document(document, completion):
    for change in completion:
        start = change["start"]
        end = change["end"]
        replacement = change["replacement"]

        start_index = document.find(start)
        end_index = document.find(end) + len(end)

        if start_index != -1 and end_index != -1:
            document = document[:start_index] + replacement + document[end_index:]

    return document


def display_initial_document_form():
    with st.form(key='initial-document'):
        document = st.text_area('Document')
        submit_button = st.form_submit_button('Submit')
        if submit_button:
            st.session_state.initial_document = document
            st.experimental_rerun()


def display_feedback_form():
    with st.form(key='user-feedback'):
        feedback = st.text_area('Your feedback')
        submitted = st.form_submit_button('Submit')
        if submitted:
            completion = get_diff(st.session_state.initial_document, feedback)
            st.session_state.initial_document = apply_completion_to_document(
                st.session_state.initial_document,
                completion
            )

    st.write(st.session_state.initial_document)


if 'initial_document' not in st.session_state or st.session_state.initial_document == '':
    display_initial_document_form()
else:
    display_feedback_form()
