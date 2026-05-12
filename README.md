# 📘 **Symbio-NLM: DNA Insight & Summary Web Application**

*A Full-Stack Genomics Analysis Platform with AI-Powered Interpretation*

---

## 🔬 **Overview**

**Symbio-NLM** is a full-stack educational genomics platform designed to upload DNA FASTA sequences, extract structured biological metadata, visualize genomic patterns, and generate AI-driven interpretations.

The platform replicates a simplified workflow of real-world bioinformatics pipelines and includes:

* FASTA validation and parsing
* Biological feature extraction (GC%, ORF detection, nucleotide distribution)
* Interactive dashboards
* Advanced genomic visualizations
* AI-powered natural-language summaries
* An integrated AI chatbot
* Secure authentication (Email + Google, Microsoft, GitHub OAuth)
* PDF report generation

This project demonstrates end-to-end capability across **backend processing**, **front-end visualization**, and **AI-enhanced biological interpretation**.

---

## 🎯 **Core Objectives**

1. Accept DNA FASTA uploads through a clean and intuitive UI.
2. Parse sequences for essential biological insights.
3. Store all analyses in a secure database.
4. Display results through an interactive, biology-themed dashboard.
5. Enable sequence-specific AI summary generation.
6. Provide an AI chatbot for general genomics assistance.
7. Generate shareable PDF reports.

---

## 🚀 **Key Features**

---

# 🧬 **1. FASTA Upload & Validation**

Users can upload `.fasta` or `.fa` sequence files through:

* File browser
* Drag-and-drop upload area
* Real-time FASTA validation
* Header + first-60bp preview prior to submission

The system validates:

* Presence of a FASTA header (`>` line)
* Only biological nucleotide characters (A, T, G, C)
* Sequence formatting and noise removal

Upon submission, the file is sent to the backend for parsing and metadata extraction.

---

# 🔎 **2. Backend DNA Parsing & Metadata Extraction**

Your backend (Node.js + Express + MongoDB) extracts:

* **Header / Sequence Title**
* **Sequence Length (bp)**
* **GC-Content (%)**
* **Nucleotide Counts (A, T, G, C)**
* **ORF Detection (ATG → stop codon)**
* **Timestamp and unique ID**

These are computed server-side for accuracy and stored in MongoDB.
Backend reference example: sequence model schema 

---

# 🧱 **3. Database Architecture**

MongoDB stores:

* File metadata
* Raw sequences
* Extracted biological features
* User accounts
* OAuth credentials
* Timestamps

---

# 📊 **4. Interactive Genomic Dashboard (PowerBI-Style)**

Each uploaded sequence has a full dashboard including:

### **Biometric Cards**

* Sequence length
* GC percentage
* ORF detection badge
* Nucleotide composition cards

### **Advanced Genomic Visualizations (React + Recharts + GSAP)**

Compact, scientific, power-dashboard-style charts:

* Codon frequency distribution
* Sliding GC% window line plot
* GC vs AT ratio gauge
* ORF map strip visualization
* Cumulative nucleotide trends
* Bar charts + donut charts

All charts are animated using **GSAP**, providing a clean, modern biology-themed UI.

---

# 🤖 **5. AI-Powered Sequence-Specific Summary (Report Tab)**

Inside each **individual report**, the app generates a **dynamic natural-language genomic interpretation** using AI.

Each summary is tailored to the sequence’s metadata:

* GC%
* Length
* ORF presence
* Nucleotide composition
* Header / title

The result is a scientifically-informed explanation of the sequence’s potential biological characteristics.

---

# 💬 **6. Integrated AI Chatbot**

A full chatbot panel allows users to ask:

* Genomics questions
* DNA sequence interpretation queries
* Biological terminology explanations
* Conceptual support

This does **not** affect per-sequence summaries.

---

# 🧾 **7. Global Project Summary (Summary Tab)**

The Summary Tab includes:

* Total sequences uploaded
* Average GC content
* Combined nucleotide totals
* Total ORFs detected
* Aggregated base pairs

Optionally, it can generate a **project-wide AI summary** based on the full dataset.

---

# 🧰 **8. PDF Report Generation**

Users can convert sequence metadata + AI summaries into a well-formatted **PDF report**, using the server-side PDF controller.

---

# 🔐 **9. Authentication & Security**

Full authentication stack includes:

* JWT
* OAuth
* Secure password hashing
* Session management
* Protected routes

Backend authentication controller handles email login and OAuth integration.

---

# 🎨 **10. GSAP-Enhanced Scientific UI Design**

The UI is designed with:

* Light-theme, biology-inspired visuals
* Floating background animations
* Smooth chart transitions
* Professional dashboard layout
* Glassmorphism components

---

# 🧪 **Tech Stack**

### **Frontend**

* React
* React Router
* GSAP (animations)
* Recharts (scientific visualizations)
* TailwindCSS

### **Backend**

* Node.js
* Express
* MongoDB / Mongoose
* Passport.js (OAuth)
* AI Integration (Gemini 2.5 flash)
* PDFKit / Puppeteer (report generation)

---

# 📂 **Repository Structure (Simplified)**

```
/frontend
   /components
   /pages
   /charts
   /ux
   App.jsx

/backend
   server.js
   controller.js
   pdfController.js
   authController.js
   passport.js
   database.js
   Sequence.js
   User.js

.env (ignored)
```

---

# 🧭 **System Workflow**

1. User uploads FASTA
2. Backend parses + stores metadata
3. Dashboard displays genomic cards + charts
4. User opens detailed report view
5. AI generates sequence-specific summary
6. User exports PDF or interacts with chatbot
7. Summary tab computes project-level statistics

---

# 🏁 **Conclusion**

**Symbio-NLM** is a complete educational genomics analysis system incorporating:

* Real bioinformatics parsing
* Scientific visualization
* Interactive dashboards
* Per-sequence AI summaries
* AI chatbot assistance
* Full authentication workflow
* PDF reporting
* Clean, animated, biology-themed UI

It demonstrates strong capabilities in **full-stack development, computational biology, AI integration, and UI/UX design**.

---

# 📜 **License**

This project is for educational and academic purposes.
All confidential information and private API keys must remain secure.
