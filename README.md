# PDF Rule Checker – Full Stack Assignment

A full stack web app where users upload a PDF (2–10 pages), enter up to three natural‑language rules, and an AI model evaluates each rule with pass/fail status, one evidence sentence, short reasoning, and a confidence score (0–100).

---

## Features

- Upload a PDF file (validated to be between 2 and 10 pages).
- Enter 1–3 simple rules in plain English, for example:
  - “The document must have a purpose section.”
  - “The document must mention at least one date.”
  - “The document must mention who is responsible.”
- Backend checks the document using an LLM (Google Gemini) and returns structured results.
- Frontend shows a clean results table with:
  - Rule text
  - Status (PASS / FAIL)
  - Evidence sentence
  - Short reasoning (1–2 sentences)
  - Confidence score (0–100)

---

## Tech Stack

**Frontend**

- React (Vite)
- Axios
- Custom CSS

**Backend**

- Node.js
- Express.js
- Multer (for file uploads, in memory)
- unpdf (for PDF text and page count extraction)
- Google Gemini API (`@google/generative-ai`)

---

## Project Structure

wesourceu/
pdf-checker-backend/ # Express API + PDF parsing + Gemini integration
pdf-checker-frontend/ # React UI (Vite) for upload + rule input + results
README.md

### Backend (pdf-checker-backend)

- `index.js` – Entry point: loads env variables, imports `app`, starts the server.
- `src/app.js` – Express app configuration (CORS, JSON parsing, routes, health check).
- `src/routes/pdfRoutes.js` – PDF route definitions + multer config for file upload.
- `src/controllers/pdfController.js` – Handles HTTP request/response for `/api/pdf/analyze`.
- `src/services/pdfService.js` – Core logic:
  - Clean rules
  - Extract PDF text + page count
  - Enforce 2–10 pages
  - Call Gemini
  - Post‑process results
- `src/services/geminiService.js` – Builds the prompt, calls Gemini model, parses JSON output.
- `src/utils/pdfExtractor.js` – Uses `unpdf` to get `{ totalPages, text }` from a PDF buffer.

### Frontend (pdf-checker-frontend)

- `src/App.jsx` – Main React component:
  - File input for PDF
  - Three rule inputs
  - Submit button with loading state
  - Error message display
  - Results table
- `src/App.css` – Styling for:
  - Card layout
  - Form
  - Primary button
  - Responsive results table

---

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm (or yarn/pnpm)
- Google Gemini API key

---

## Backend Setup

cd pdf-checker-backend
npm install

Edit ".env":
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

Start the backend: npm start

The API will run at : http://localhost:5000

### Backend Endpoints

- `GET /ping` – Health check that returns `{ "ok": true }` to confirm the server is running.

- `POST /api/pdf/analyze` – Main endpoint (multipart/form-data):

  - Fields:
    - `file` – required PDF file (2–10 pages)
    - `rule1`, `rule2`, `rule3` – optional strings (at least one non‑empty)
  - On success returns:

    ```
    {
      "success": true,
      "message": "PDF parsed and rules captured successfully",
      "data": {
        "fileName": "document.pdf",
        "totalPages": 4,
        "results": [
          {
            "rule": "Document must mention a date.",
            "status": "pass",
            "evidence": "Found in page 1: 'Published 2024'.",
            "reasoning": "The document mentions a year in the publication line.",
            "confidence": 92
          }
        ]
      }
    }
    ```

  - On error returns `success: false` with an explanatory `message`.

---

## Frontend Setup

cd pdf-checker-frontend
npm install
Edit `.env`:VITE_API_BASE_URL=http://localhost:5000

Start the frontend:npm run dev

Vite will serve the app at :http://localhost:5173
---

## How to Use

1. Make sure the backend is running on `http://localhost:5000`.
2. Start the frontend and open `http://localhost:5173` in your browser.
3. In the UI:
   - Upload a `.pdf` file between 2 and 10 pages.
   - Enter 1–3 rules (at least one rule is required).
   - Click **“Check Document”**.
4. After a short loading time, you will see:
   - File name and total page count.
   - A table with one row per rule showing:
     - Rule
     - Status (PASS/FAIL)
     - Evidence
     - Reasoning
     - Confidence

---

## Validation & Error Handling

**Frontend**

- Prevents form submission if:
  - No file is selected.
  - The selected file is not a PDF.
  - All three rule fields are empty.
- Shows clear error messages under the form.

**Backend**

- Rejects requests without a file.
- Normalizes rules and requires at least one non‑empty rule.
- Uses `unpdf` to:
  - Read PDF
  - Count pages
  - Extract merged text
- Enforces assignment requirement:
  - PDF must be between 2 and 10 pages (inclusive).
- Truncates very long text before sending to Gemini.
- Handles invalid JSON from LLM and responds with a clear error string.

---

## Design & Architecture

- **Layered structure**:
  - Routes → Controllers → Services → Utils in the backend.
  - LLM integration kept in its own service (`geminiService`).
- **Deterministic + AI mix**:
  - Page count rule (“at least 2 pages”) is enforced using actual metadata, not only AI output.
  - Semantic rules (e.g. “mention a date”) are evaluated by Gemini using the extracted text.
- **File handling**:
  - Files are handled in memory (no disk storage) using `multer.memoryStorage()`.
- **UI/UX**:
  - Single card layout with clear hierarchy (title, subtitle, form, results).
  - One‑column form with labeled fields.
  - High‑contrast primary button and results table with alternating rows and PASS/FAIL colors.

---

## Possible Improvements

- More accurate page‑level evidence by keeping per‑page text instead of a single merged string.
- Dynamic number of rules (add/remove rule inputs in the UI).

---

## License

This project is provided as part of a full‑stack developer assignment and is intended for evaluation purpose.
