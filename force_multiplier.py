import streamlit as st
import openai
import json


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

    Each block of text to be replaced is represented as a dictionary with the keys 'start', 'end', and 'replacement'. If multiple blocks of text need to be replaced, I will return a list of such dictionaries.
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
    with st.spinner('Processing...'):
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

        block_start_index = document.find(start)
        if block_start_index != -1:
            remaining_document = document[block_start_index + len(start):]
            block_end_index = remaining_document.find(end) + len(end)

            if block_end_index != -1:
                document = document[:block_start_index] + replacement + remaining_document[block_end_index:]

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
            st.success('Document Updated!')

    wrap_text = st.checkbox('Wrap text')
    if wrap_text:
        st.write(st.session_state.initial_document)
    else:
        st.text(st.session_state.initial_document)


st.markdown("<h1 style='text-align: center;'>Force Multiplier</h1>", unsafe_allow_html=True)

if not st.session_state.get('initial_document'):
    display_initial_document_form()
else:
    display_feedback_form()
