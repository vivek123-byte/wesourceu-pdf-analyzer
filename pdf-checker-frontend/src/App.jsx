import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [rule1, setRule1] = useState("");
  const [rule2, setRule2] = useState("");
  const [rule3, setRule3] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const API_BASE_URL = "http://localhost:5000";
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid PDF file (.pdf).");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }

    if (![rule1, rule2, rule3].some((r) => r.trim().length > 0)) {
      setError("Please provide at least one rule.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rule1", rule1);
    formData.append("rule2", rule2);
    formData.append("rule3", rule3);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/pdf/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Something went wrong while analyzing the PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="app-title">PDF Rule Checker</h1>
        <p className="app-subtitle">
          Upload a PDF, enter up to three rules, and let AI check the document
          with evidence and reasoning.
        </p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">PDF file</label>
            <input
              type="file"
              accept="application/pdf"
              className="form-file"
              onChange={handleFileChange}
            />
            <span className="info-text">
              Accepts PDFs between 2–10 pages for best results.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Rule 1</label>
            <input
              type="text"
              className="form-input"
              value={rule1}
              onChange={(e) => setRule1(e.target.value)}
              placeholder='e.g. "Document should mention supervisor name."'
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rule 2</label>
            <input
              type="text"
              className="form-input"
              value={rule2}
              onChange={(e) => setRule2(e.target.value)}
              placeholder='e.g. "The document must mention who is responsible"'
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rule 3</label>
            <input
              type="text"
              className="form-input"
              value={rule3}
              onChange={(e) => setRule3(e.target.value)}
              placeholder='e.g. "Document should have at least 2 page"'
            />
          </div>

          <div className="actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Checking..." : "Check Document"}
            </button>
            {!loading && (
              <span className="info-text">
                All fields are processed on your local backend.
              </span>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}
        </form>

        {result && result.success && (
          <section className="results-container">
            <div className="results-header">
              <h2 className="results-title">Analysis Results</h2>
              <span className="results-meta">
                File: <strong>{result.data.fileName}</strong> · Pages:{" "}
                <strong>{result.data.totalPages}</strong>
              </span>
            </div>

            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th>Status</th>
                    <th>Evidence</th>
                    <th>Reasoning</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.results.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.rule}</td>
                      <td
                        className={
                          r.status === "pass" ? "status-pass" : "status-fail"
                        }
                      >
                        {r.status.toUpperCase()}
                      </td>
                      <td>{r.evidence}</td>
                      <td>{r.reasoning}</td>
                      <td>{r.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
