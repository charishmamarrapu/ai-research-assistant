import requests
import streamlit as st
import os

from pypdf import PdfReader

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

from langchain_google_genai import ChatGoogleGenerativeAI

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3
)

# Page config
st.set_page_config(
    page_title="ScholarAI",
    page_icon="📚",
    layout="wide"
)

# Sidebar
with st.sidebar:

    st.title("📚 ScholarAI")

    st.write("AI Research Assistant for Students")

    st.divider()

    if st.button("🗑 Clear Chat"):
        st.session_state.chat_history = []

    st.divider()

    st.write("""
    ### Features
    ✅ Multi PDF Chat  
    ✅ AI Summaries  
    ✅ Research Assistance  
    ✅ Semantic Search  
    ✅ Research Paper Search
    """)

# Main title
st.title("📚 AI Research Assistant")

st.write("Upload PDFs and ask questions from them.")

# Chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# Upload PDFs
uploaded_files = st.file_uploader(
    "Upload PDFs",
    type="pdf",
    accept_multiple_files=True
)

# PDF CHAT SECTION
if uploaded_files:

    text = ""

    with st.spinner("Reading PDFs..."):

        # Read all PDFs
        for uploaded_file in uploaded_files:

            pdf_reader = PdfReader(uploaded_file)

            for page in pdf_reader.pages:

                extracted_text = page.extract_text()

                if extracted_text:
                    text += extracted_text

    st.success("✅ PDFs Loaded Successfully!")

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = text_splitter.split_text(text)

    # Create embeddings
    with st.spinner("Creating embeddings..."):

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # Create vector store
        vector_store = FAISS.from_texts(
            chunks,
            embedding=embeddings
        )

    st.success("✅ Vector Store Created!")

    # PDF SUMMARY SECTION
    if st.button("📄 Summarize PDFs"):

        summary_prompt = f"""
        You are an AI research assistant.

        Give a detailed summary of these documents.

        Include:
        - Main topics
        - Key points
        - Methodologies
        - Important findings
        - Conclusions

        Documents:
        {text[:15000]}
        """

        with st.spinner("Generating summary..."):

            summary_response = llm.invoke(
                summary_prompt
            )

            st.subheader("📄 PDF Summary")

            st.write(
                summary_response.content
            )

    # DISPLAY CHAT HISTORY
    for role, message in st.session_state.chat_history:

        with st.chat_message(role):
            st.write(message)

    # CHAT INPUT
    question = st.chat_input(
        "Ask a question from PDFs..."
    )

    # User question
    if question:

        # Show user message
        with st.chat_message("user"):
            st.write(question)

        # Similarity search
        docs = vector_store.similarity_search(
            question,
            k=3
        )

        # Combine retrieved chunks
        context = "\n".join(
            [doc.page_content for doc in docs]
        )

        # Prompt
        prompt = f"""
        You are an intelligent AI research assistant for students.

        Use the provided context to answer accurately.

        Rules:
        - Give clear and concise answers
        - Explain technical concepts simply
        - If answer is not found, say:
          "I could not find this in the uploaded documents."

        Context:
        {context}

        Question:
        {question}
        """

        # Generate response
        with st.spinner("Generating answer..."):

            response = llm.invoke(prompt)

            answer = response.content

        # Save chat history
        st.session_state.chat_history.append(
            ("user", question)
        )

        st.session_state.chat_history.append(
            ("assistant", answer)
        )

        # Display assistant response
        with st.chat_message("assistant"):
            st.write(answer)

else:

    st.info("👆 Please upload PDFs to begin.")

# RESEARCH PAPER SEARCH SECTION
st.divider()

st.header("🔎 Research Paper Search")

st.write(
    "Search research papers online using Semantic Scholar API."
)

research_topic = st.text_input(
    "Enter research topic"
)

if st.button("Search Papers"):

    if research_topic:

        with st.spinner("Searching research papers..."):

            try:

                # Semantic Scholar API
                url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={research_topic}&limit=5&fields=title,abstract,year"

                response = requests.get(url)

                data = response.json()

                papers = data.get("data", [])

                if papers:

                    # Store all abstracts
                    all_abstracts = ""

                    st.success("✅ Papers Found!")

                    for paper in papers:

                        title = paper.get(
                            "title",
                            "No Title"
                        )

                        abstract = paper.get(
                            "abstract",
                            "No Abstract Available"
                        )

                        year = paper.get(
                            "year",
                            "N/A"
                        )

                        # Save abstract
                        all_abstracts += abstract + "\n"

                        # Display paper
                        st.subheader(title)

                        st.write(
                            f"📅 Year: {year}"
                        )

                        st.write(abstract)

                        st.divider()

                    # AI RESEARCH INSIGHTS
                    st.subheader(
                        "🤖 AI Research Insights"
                    )

                    summary_prompt = f"""
                    Analyze these research papers and provide:

                    - Main research trends
                    - Common findings
                    - Future scope
                    - Challenges
                    - Overall summary

                    Research Papers:
                    {all_abstracts[:12000]}
                    """

                    with st.spinner(
                        "Generating AI insights..."
                    ):

                        summary_response = llm.invoke(
                            summary_prompt
                        )

                        st.write(
                            summary_response.content
                        )

                else:

                    st.warning(
                        "No papers found."
                    )

            except Exception as e:

                st.error(
                    f"Error: {str(e)}"
                )

    else:

        st.warning(
            "Please enter a research topic."
        )