import streamlit as st

from force_multiplier import apply_feedback


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
            with st.spinner('Processing...'):
                st.session_state.initial_document = apply_feedback(
                    document=st.session_state.initial_document,
                    feedback=feedback
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
