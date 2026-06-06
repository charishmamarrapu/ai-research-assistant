import { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {

  // CHAT STATE
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Upload a PDF and ask questions."
    }
  ]);

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  
  // RESEARCH STATE

  const [researchQuery, setResearchQuery] = useState("");
  const [researchData, setResearchData] = useState(null);
  const [researchLoading, setResearchLoading] = useState(false);

  
  // UPLOAD PDF
  
  const uploadPDF = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadStatus("Uploading PDF...");

      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      setUploadStatus(data.message);

    } catch (error) {
      console.error(error);
      setUploadStatus("Upload failed.");
    }
  };

  
  // CHAT
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.answer
      };

      setMessages([...updatedMessages, aiMessage]);

    } catch (error) {
      console.error(error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Error connecting to backend."
        }
      ]);
    }
  };

  
  // RESEARCH API
  
  const searchResearch = async () => {
    if (!researchQuery.trim()) return;

    try {
      setResearchLoading(true);

      const res = await fetch(
        `http://127.0.0.1:8000/research?query=${researchQuery}`
      );

      const data = await res.json();
      setResearchData(data);

      setResearchLoading(false);

    } catch (err) {
      console.error(err);
      setResearchLoading(false);
    }
  };

  
  // UI
  
  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <div className="w-80 bg-gray-950 border-r border-gray-800 p-4 flex flex-col gap-6">

        <h1 className="text-2xl font-bold">📚 ScholarAI</h1>

        <p className="text-gray-400 text-sm">
          AI Research Assistant
        </p>

        {/* Upload */}
        <div>
          <h2 className="text-sm font-semibold mb-2">📄 Upload PDF</h2>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full text-sm"
          />

          <button
            onClick={uploadPDF}
            className="mt-2 w-full bg-green-600 py-2 rounded-lg"
          >
            Upload
          </button>

          <p className="text-xs text-gray-400 mt-1">
            {uploadStatus}
          </p>
        </div>

        {/* Research */}
        <div>
          <h2 className="text-sm font-semibold mb-2">🔍 Research</h2>

          <input
            type="text"
            placeholder="Enter topic..."
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
          />

          <button
            onClick={searchResearch}
            className="mt-2 w-full bg-purple-600 py-2 rounded-lg"
          >
            Search
          </button>
        </div>

      </div>

      {/*  MAIN CONTENT  */}
      <div className="flex-1 flex flex-col">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-3xl p-4 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-900"
              }`}
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4 flex gap-4">

          <input
            type="text"
            placeholder="Ask a question from PDF..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-6 rounded-xl hover:bg-blue-700 transition"
          >
            Send
          </button>

        </div>

        {/*  RESEARCH RESULTS  */}
        <div className="p-6 border-t border-gray-800">

          {researchLoading && (
            <p className="text-gray-400 animate-pulse">
              🔎 Searching research papers...
            </p>
          )}

          {researchData?.papers?.length > 0 && (
            <div className="space-y-4">

              <h2 className="text-xl font-bold">📚 Research Papers</h2>

              {researchData.papers.map((paper, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-900 border border-gray-700 rounded-xl"
                >
                  <h3 className="text-blue-400 font-semibold">
                    {paper.title}
                  </h3>

                  <p className="text-gray-400 text-sm">
                    📅 {paper.year}
                  </p>

                  <p className="text-gray-300 text-sm mt-2">
                    {paper.abstract
                      ? paper.abstract.slice(0, 300)
                      : "No abstract available"}
                  </p>
                </div>
              ))}

              {/* AI INSIGHTS */}
              {researchData.insights && (
                <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-purple-900 to-blue-900">

                  <h2 className="text-xl font-bold">
                    🤖 AI Insights
                  </h2>

                  <p className="mt-2 whitespace-pre-line text-gray-200">
                    {researchData.insights}
                  </p>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;