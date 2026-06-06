# 📚 ScholarAI – AI Research Assistant

A full-stack AI-powered Research Assistant built using Retrieval-Augmented Generation (RAG) and Google Gemini to help users interact with PDF documents and explore research papers intelligently.

## 🚀 Features

📄 PDF Upload & Analysis — Upload PDFs and extract content

💬 AI Question Answering — Ask questions and get context-aware answers

🔍 RAG Pipeline — Semantic search using FAISS vector database

📚 Research Paper Search — Discover relevant research papers

🧠 AI-Generated Insights — Summarize papers and identify key trends

⚡ Interactive Chat Interface — Student-friendly learning experience

## 🛠️ Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Frontend   | React + Vite            |
| Backend    | FastAPI + Python        |
| AI Model   | Google Gemini 2.5 Flash |
| Vector DB  | FAISS                   |
| Embeddings | Sentence Transformers   |
| Framework  | LangChain               |

## ⚙️ Setup Instructions

### Clone Repository

git clone https://github.com/charishmamarrapu/ai-research-assistant.git
cd ai-research-assistant

### Install Dependencies

pip install -r requirements.txt
npm install

### Add API Key

Create a `.env` file:

GOOGLE_API_KEY=your_gemini_api_key

### Run Backend

uvicorn main:app --reload

### Run Frontend

npm run dev

Open: http://localhost:5173


## 📁 Project Structure

```text
ai-research-assistant/
├── backend/
│   ├── main.py
│   ├── utils/
│   │   ├── pdf_loader.py
│   │   ├── vector_store.py
│   │   └── gemini_helper.py
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── assets/
│
├── public/
├── package.json
└── README.md
```
