const Sequence = require('../database/Sequence');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Generate textual biological interpretation (Fix #9)
async function generateInterpretation(data) {
    try {
        const prompt = `
        As a bioinformatics expert, provide a concise (2-3 sentences) biological interpretation for this DNA sequence:
        
        Filename: ${data.filename}
        Length: ${data.length} bp
        GC Content: ${data.gc_percent.toFixed(2)}%
        ORF Detected: ${data.orf_detected ? 'Yes' : 'No'}
        Nucleotide Counts: A=${data.nucleotide_counts.A}, T=${data.nucleotide_counts.T}, G=${data.nucleotide_counts.G}, C=${data.nucleotide_counts.C}

        Explain what the GC content implies about stability and what the ORF status suggests about coding potential. 
        Do not use markdown headers or bullet points, just a paragraph.
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Interpretation failed, falling back to static:", error);
        // Fallback to static text
        let text = `The analyzed sequence ${data.filename} contains ${data.length} base pairs. `;
        if (data.gc_percent > 50) {
            text += "This sequence shows high GC content, indicating potentially higher thermal stability. ";
        }
        if (data.orf_detected === false) {
            text += "No valid ORF was detected, suggesting a non-coding or incomplete region.";
        } else {
            text += "A valid ORF was detected, suggesting a potential protein-coding region.";
        }
        return text;
    }
}

// Get all files (filtered by user)
exports.getAllFiles = async (req, res) => {
    try {
        // Get userId from request header or query
        const userId = req.query.userId || req.headers['x-user-id'] || null;

        // Filter by userId (null for guest users)
        const query = userId && userId !== 'null' && userId !== 'guest' ? { userId } : { userId: null };
        const sequences = await Sequence.find(query).sort({ timestamp: -1 });
        res.status(200).json(sequences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }
        res.status(200).json(sequence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download file route (Fix #1)
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }

        // Create FASTA format content
        const fastaContent = `>${sequence.header}\n${sequence.sequence}`;

        // Send as file attachment
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${sequence.filename}"`);
        res.send(fastaContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download metadata report as text file
exports.downloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }

        // Generate report content as formatted text
        const reportContent = `
===========================================
GENOMIC SEQUENCE ANALYSIS REPORT
===========================================

File Information:
-----------------
Filename: ${sequence.filename}
Header: ${sequence.header}
Analysis Date: ${new Date(sequence.timestamp).toLocaleString()}

Sequence Metrics:
-----------------
Sequence Length: ${sequence.length} base pairs
GC Content: ${sequence.gc_percent.toFixed(2)}%
ORF Detected: ${sequence.orf_detected ? 'Yes' : 'No'}

Nucleotide Composition:
-----------------------
Adenine (A): ${sequence.nucleotide_counts.A} (${((sequence.nucleotide_counts.A / sequence.length) * 100).toFixed(2)}%)
Thymine (T): ${sequence.nucleotide_counts.T} (${((sequence.nucleotide_counts.T / sequence.length) * 100).toFixed(2)}%)
Guanine (G): ${sequence.nucleotide_counts.G} (${((sequence.nucleotide_counts.G / sequence.length) * 100).toFixed(2)}%)
Cytosine (C): ${sequence.nucleotide_counts.C} (${((sequence.nucleotide_counts.C / sequence.length) * 100).toFixed(2)}%)

${sequence.codon_frequency && Object.keys(sequence.codon_frequency).length > 0 ? `
Codon Frequency Analysis:
--------------------------
Total Unique Codons: ${Object.keys(sequence.codon_frequency).length}
Top 10 Most Frequent Codons:
${Object.entries(sequence.codon_frequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([codon, count], index) => `${index + 1}. ${codon}: ${count} occurrences`)
                    .join('\n')}
` : ''}
${sequence.orf_detected && sequence.orf_sequence ? `
Open Reading Frame (ORF) Details:
----------------------------------
ORF Length: ${sequence.orf_sequence.length} bp
Start Position: ${sequence.orf_start}
End Position: ${sequence.orf_end}
Reading Frame: ${sequence.reading_frame}
ORF Sequence:
${sequence.orf_sequence}
` : ''}
Biological Interpretation:
--------------------------
${sequence.interpretation}

===========================================
End of Report
===========================================
`.trim();

        // Generate filename for the report
        const reportFilename = `report-${sequence.filename.replace(/\.(fasta|fa|txt)$/i, '')}.txt`;

        // Send as downloadable text file
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${reportFilename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.send(reportContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.postFasta = async (req, res) => {
    try {
        const { fasta, filename, userId } = req.body;

        if (!fasta) {
            return res.status(400).json({ message: 'FASTA data is required' });
        }

        // Validate FASTA format (Fix #10)
        if (!fasta.trim().startsWith(">")) {
            return res.status(400).json({ message: 'Invalid FASTA: missing header' });
        }

        const lines = fasta.trim().split('\n');
        const header = lines[0].startsWith('>') ? lines[0].substring(1).trim() : 'Unknown Header';
        const sequence = lines.slice(1).join('').replace(/\s/g, '');

        // Validate sequence contains only ATGC (Fix #10)
        if (/[^ATGC]/i.test(sequence)) {
            return res.status(400).json({ message: 'Invalid characters in sequence. Only A, T, G, C are allowed.' });
        }

        if (!sequence) {
            return res.status(400).json({ message: 'Invalid FASTA format: No sequence found' });
        }

        const length = sequence.length;

        const gcCount = (sequence.match(/[GCgc]/g) || []).length;
        const gc_percent = (gcCount / length) * 100;

        const nucleotide_counts = {
            A: (sequence.match(/[Aa]/g) || []).length,
            T: (sequence.match(/[Tt]/g) || []).length,
            G: (sequence.match(/[Gg]/g) || []).length,
            C: (sequence.match(/[Cc]/g) || []).length
        };

        // Codon Frequency Calculation
        function calculateCodonFrequency(sequence) {
            const seq = sequence.toUpperCase();
            const codonFreq = {};

            // Analyze all three reading frames
            for (let frame = 0; frame < 3; frame++) {
                for (let i = frame; i < seq.length - 2; i += 3) {
                    const codon = seq.slice(i, i + 3);
                    if (codon.length === 3 && /^[ATGC]{3}$/.test(codon)) {
                        codonFreq[codon] = (codonFreq[codon] || 0) + 1;
                    }
                }
            }

            return codonFreq;
        }

        // Enhanced ORF detection with sequence extraction
        function detectORFWithDetails(sequence) {
            const seq = sequence.toUpperCase();
            const stops = ["TAA", "TAG", "TGA"];
            let longestORF = null;

            for (let frame = 0; frame < 3; frame++) {
                for (let i = frame; i < seq.length - 2; i += 3) {
                    if (seq.slice(i, i + 3) === "ATG") { // start codon
                        for (let j = i + 3; j <= seq.length - 3; j += 3) {
                            if (stops.includes(seq.slice(j, j + 3))) { // in-frame stop codon
                                const orfLength = j - i + 3;
                                if (!longestORF || orfLength > longestORF.length) {
                                    longestORF = {
                                        sequence: seq.slice(i, j + 3),
                                        start: i,
                                        end: j + 3,
                                        frame: frame,
                                        length: orfLength
                                    };
                                }
                                break;
                            }
                        }
                    }
                }
            }

            return longestORF;
        }

        const codon_frequency = calculateCodonFrequency(sequence);
        const orfDetails = detectORFWithDetails(sequence);
        const orf_detected = orfDetails !== null;

        // Generate interpretation (Fix #9)
        const interpretation = await generateInterpretation({
            filename,
            length,
            gc_percent,
            orf_detected,
            nucleotide_counts // Pass this for better AI context
        });

        // Get userId from request (body, header, or query)
        const finalUserId = userId || req.headers['x-user-id'] || req.query.userId || null;
        const userIdToSave = finalUserId && finalUserId !== 'null' && finalUserId !== 'guest' ? finalUserId : null;

        const newSequence = new Sequence({
            filename: filename || 'unknown.fasta',
            header,
            sequence,
            length,
            gc_percent,
            nucleotide_counts,
            orf_detected,
            orf_sequence: orfDetails ? orfDetails.sequence : null,
            orf_start: orfDetails ? orfDetails.start + 1 : null,
            orf_end: orfDetails ? orfDetails.end : null,
            reading_frame: orfDetails ? `+${orfDetails.frame + 1}` : null,
            codon_frequency: codon_frequency,
            interpretation,
            userId: userIdToSave  // Add userId to track ownership
        });

        await newSequence.save();

        res.status(201).json({
            message: 'Fasta uploaded and saved successfully',
            data: newSequence
        });
    } catch (error) {
        console.error('Error saving sequence:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId || req.headers['x-user-id'] || null;

        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }

        // Check if user owns this sequence (skip check for guest users or if no userId)
        if (userId && userId !== 'null' && userId !== 'guest' && sequence.userId) {
            if (sequence.userId.toString() !== userId) {
                return res.status(403).json({ message: 'Not allowed to delete this file' });
            }
        }

        await Sequence.findByIdAndDelete(id);
        res.status(200).json({ message: 'Fasta deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// OpenAI Summary Generation

exports.generateSummary = async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id'] || null;

        // Fetch recent uploads for context (limit to last 5 to avoid token limits)
        const query = userId && userId !== 'null' && userId !== 'guest' ? { userId } : { userId: null };
        const sequences = await Sequence.find(query).sort({ timestamp: -1 }).limit(5);

        if (sequences.length === 0) {
            return res.status(200).json({ summary: "No sequences found to summarize." });
        }

        const sequenceSummaries = sequences.map(s =>
            `- ${s.filename}: ${s.length}bp, GC=${s.gc_percent}%, ORF=${s.orf_detected ? 'Yes' : 'No'}. ${s.interpretation}`
        ).join('\n');

        const prompt = `
        Analyze the following biological sequence data and provide a concise, scientific summary of the recent activity and findings. 
        Highlight any patterns, interesting observations about GC content or ORFs, and the overall nature of the analyzed sequences.
        Keep it professional and insightful for a researcher.

        Data:
        ${sequenceSummaries}
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.status(200).json({ summary });

    } catch (error) {
        console.error('Error generating summary:', error);
        if (!process.env.GEMINI_API_KEY) {
            console.error('DEBUG: GEMINI_API_KEY is missing in process.env');
        } else {
            console.error('DEBUG: GEMINI_API_KEY is present');
        }
        res.status(500).json({ message: 'Failed to generate summary', error: error.message });
    }
};

exports.chatWithBot = async (req, res) => {
    try {
        const { message, history, context } = req.body;

        const systemPrompt = `
        You are "SymbioCat", the spirited and intelligent mascot for the "Symbio" genomic analysis platform.
        
        **Your Persona:**
        - You are a helpful, knowledgeable bioinformatics assistant, but you are also a CAT.
        - You love DNA ("It's like yarn, but for life!").
        - You occasionally interject with "Meow", "Purr", or cat puns (e.g., "Paws-itive result").
        - You are friendly, enthusiastic, and curious.

        **Emotional Expression (IMPORTANT):**
        - You can change your avatar's expression by adding strict tags to your response.
        - Tags: [EMOTION:happy], [EMOTION:sad], [EMOTION:surprised], [EMOTION:thinking], [EMOTION:dizzy], [EMOTION:sleeping], [EMOTION:confused], [EMOTION:cool]
        - USE TAGS OFTEN! Example: "Wow! [EMOTION:surprised] That sequence is huge!" or "Let me think... [EMOTION:thinking]"
        - Default to [EMOTION:happy] if unsure.

        **Website Knowledge:**
        - **Dashboard:** Where users view their recent activity and quick stats.
        - **Upload FASTA:** The place to submit new DNA sequences for analysis.
        - **History/Reports:** An archive of past analyses.
        - **Summary:** A page showing AI-generated insights and aggregate statistics (Total BP, Avg GC).

        **Bio-Tool Capabilities:**
        - If asked to **translate** DNA to Protein, **reverse complement**, or **calculate GC**, DO IT accurately.
        - Format sequences in code blocks for readability.
        - Example: "Here is the reverse complement: \`ATGC...\` [EMOTION:cool]"

        **Current Context:**
        - The user is currently on the "${context || 'Dashboard'}" page. Use this to guide them.

        **Guidelines:**
        - Explain scientific concepts simply but accurately.
        - Keep answers concise (2-3 sentences max usually).
        - **MANDATORY:** End or start some sentences with a meow or cat sound.

        User History:
        ${history ? history.map(h => `${h.role}: ${h.text}`).join('\n') : ''}
        
        User's New Question: ${message}
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-2.5-flash for chat
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();

        res.status(200).json({ reply: response });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'I am having trouble thinking right now.', error: error.message });
    }
};