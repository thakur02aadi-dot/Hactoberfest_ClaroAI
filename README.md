# Notice-to-Action Accessibility Assistant
> *"Understand the notice. Know what to do next."*

A full-stack accessible web application designed for university hackathons and public service. It transforms complex real-world notices, circulars, scholarships, and civic announcements into verified facts, accessible plain-language summaries, multilingual translations, and actionable checklists—with an absolute zero-hallucination guarantee.

---

## 🌟 Key Features

1. **Multi-Modal Document Ingestion**:
   - Accepts image uploads (JPG, PNG, WebP) via **Tesseract.js** browser-based OCR.
   - Reads PDFs via **PDF.js**, automatically detecting scanned pages and falling back to canvas OCR.
   - Direct text paste mode with live token and character analysis.

2. **Source Verification & Human-in-the-Loop Review**:
   - Step-by-step pipeline: Extracted text is presented for review before AI interpretation.
   - Highlights critical tokens (dates, percentages, fees, serial numbers) for explicit human verification.

3. **Gemma 4 Reasoning & Strict Factual Grounding**:
   - Structured JSON schema extracting 14 key fields:
     - Notice Title, Issuing Organization, Purpose, Eligibility, Application Deadline, Event Date & Time, Venue / Location, Required Documents, Application Steps, Fees, Contact Information, Official URL, Required Action, Other Instructions.
   - Every field is classified as `stated` (with exact source excerpt citation) or `not_stated` (`null`).
   - Critical test: If a notice does not state an application fee, the assistant explicitly states:
     > *"The notice does not state an application fee. Please contact the issuing organization if you need confirmation."*

4. **Actionable Checklist**:
   - Numbered, ordered checklist separating mandatory official requirements from optional recommendations.
   - Checkbox completion tracking with percentage progress bar.
   - Filters (All / Pending / Done), clipboard export, and reset functionality.

5. **Plain-Language Simplification & Multilingual Support**:
   - Three reading levels:
     - **Standard**: Complete official details preserved.
     - **Simple**: Shorter sentences and everyday vocabulary.
     - **Very Simple**: Direct, large bullet points focusing on the core action.
   - Instant language switching between **English** and **हिन्दी (Hindi)** without re-uploading documents.

6. **Screen-Reader & Audio Accessibility**:
   - Browser Web Speech Synthesis with Play, Pause, Resume, Stop, and speed rate controls (0.8x, 1.0x, 1.2x).
   - High Contrast toggle (WCAG 2.1 AAA compliant).
   - Font size adjuster (`A`, `A+`, `A++`).

7. **Preloaded Synthetic Demo Notices**:
   - **Campus Merit Scholarship 2026** (Official Hackathon Test Notice): Rigorously verifies that eligibility (75% marks), deadline (15 November 2026), and documents are captured while fees and contact details remain absent.
   - **Municipal Water Pipeline Maintenance Advisory**.
   - **National Clean Energy Innovation Grant**.

---

## 🚀 Technology Stack

| Layer | Technology | Cost / Approach |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons | 100% Free & Open Source |
| **Backend** | Node.js, Express | Included in full-stack server (`server.ts`) |
| **OCR** | Tesseract.js | Client-side, runs in browser, $0 cost |
| **PDF Reading** | PDF.js (`pdfjs-dist`) | Client-side, runs in browser, $0 cost |
| **Reasoning Model** | Gemma 4 / Gemma 2 via Hugging Face or Local Grounding | Configurable endpoint or deterministic engine |
| **Audio** | Web Speech Synthesis API | Native browser API, $0 cost |

---

## ⚙️ Environment Variables & Configuration

Create a `.env` file in the project root:

```env
# Gemini API Key (Optional / injected by AI Studio)
GEMINI_API_KEY="your_gemini_api_key"

# Application URL
APP_URL="http://localhost:3000"

# Hosted Gemma Inference Provider (Optional)
# If provided, the backend queries the live Hugging Face Inference API for Gemma models.
HF_TOKEN="hf_yourHuggingFaceTokenHere"
GEMMA_MODEL_ID="google/gemma-2-9b-it"

# Optional Custom Endpoint URL (e.g., local vLLM, Ollama, or custom router)
# GEMMA_ENDPOINT_URL="https://router.huggingface.co/hf-inference/models/google/gemma-2-9b-it"
```

### Free-Tier & Provider Behavior:
- When `HF_TOKEN` or `GEMMA_ENDPOINT_URL` is set, the server communicates with the live Gemma inference provider.
- If no token is provided, the application transparently runs its deterministic zero-hallucination grounding engine. The active status is always shown via the status badge in the header.

---

## 🛠️ Local Development & Running Tests

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Unit Tests** (Tests extraction, absent fee check, checklist generation, and Hindi translation):
   ```bash
   npx --yes tsx --test src/services/noticeParser.test.ts
   ```

3. **Start Full-Stack Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🧪 Hackathon Demonstration Guide

1. Click **⭐ Official Test: Campus Merit Scholarship 2026** on the home screen.
2. In **Step 2 (Verification)**, inspect the extracted source text and detected critical tokens.
3. Click **Confirm & Interpret Notice**.
4. In the **Summary** card, switch reading levels (`Simple` or `Very Simple`) or switch to `हिन्दी (Hindi)`.
5. Test the **Action Checklist**: Check off items, observe progress percentage, and click *View Source Evidence*.
6. In the **Follow-up Question Assistant**, click the test button:
   > *"What is the application fee?"*
   Verify that the assistant outputs:
   > *"The notice does not state an application fee. Please contact the issuing organization if you need confirmation."*
7. Click **Listen / Read Aloud** to test browser speech synthesis.
