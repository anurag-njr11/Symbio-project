const sequenceService = require('../services/sequenceService');
const aiService = require('../services/aiService');

// Get all files (filtered by user)
exports.getAllFiles = async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id'] || null;
        const sequences = await sequenceService.getAllSequences(userId);
        res.status(200).json(sequences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get sequence by ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await sequenceService.getSequenceById(id);
        res.status(200).json(sequence);
    } catch (error) {
        if (error.message === 'Sequence not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Download file route
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await sequenceService.getSequenceById(id);

        // Create FASTA format content
        const fastaContent = `>${sequence.header}\n${sequence.sequence}`;

        // Send as file attachment
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${sequence.filename}"`);
        res.send(fastaContent);
    } catch (error) {
        if (error.message === 'Sequence not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Download metadata report as text file
exports.downloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await sequenceService.getSequenceById(id);

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
GC Content: ${sequence.gc_percent}%
ORF Detected: ${sequence.orf_detected ? 'Yes' : 'No'}

Nucleotide Composition:
-----------------------
Adenine (A): ${sequence.nucleotide_counts.A} (${((sequence.nucleotide_counts.A / sequence.length) * 100).toFixed(2)}%)
Thymine (T): ${sequence.nucleotide_counts.T} (${((sequence.nucleotide_counts.T / sequence.length) * 100).toFixed(2)}%)
Guanine (G): ${sequence.nucleotide_counts.G} (${((sequence.nucleotide_counts.G / sequence.length) * 100).toFixed(2)}%)
Cytosine (C): ${sequence.nucleotide_counts.C} (${((sequence.nucleotide_counts.C / sequence.length) * 100).toFixed(2)}%)

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
        if (error.message === 'Sequence not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Upload FASTA sequence
exports.postFasta = async (req, res) => {
    try {
        const { fasta, filename, userId } = req.body;

        if (!fasta) {
            return res.status(400).json({ message: 'FASTA data is required' });
        }

        // Validate FASTA format
        const { header, sequence } = sequenceService.validateFasta(fasta);

        // Calculate metrics
        const length = sequence.length;
        const gc_percent = sequenceService.calculateGCContent(sequence);
        const nucleotide_counts = sequenceService.calculateNucleotideCounts(sequence);
        const orfResult = sequenceService.detectORF(sequence);
        const codon_frequency = sequenceService.calculateCodonFrequency(sequence);

        // Generate AI interpretation
        const interpretation = await aiService.generateInterpretation({
            filename,
            length,
            gc_percent,
            orf_detected: orfResult.detected,
            nucleotide_counts,
            codon_frequency
        });

        // Determine userId
        const finalUserId = userId || req.headers['x-user-id'] || req.query.userId || null;
        const userIdToSave = finalUserId && finalUserId !== 'null' && finalUserId !== 'guest' ? finalUserId : null;

        // Create sequence
        const newSequence = await sequenceService.createSequence({
            filename: filename || 'unknown.fasta',
            header,
            sequence,
            length,
            gc_percent,
            nucleotide_counts,
            orf_detected: orfResult.detected,
            orf_sequence: orfResult.sequence,
            codon_frequency,
            interpretation,
            userId: userIdToSave
        });

        res.status(201).json({
            message: 'Fasta uploaded and saved successfully',
            data: newSequence
        });
    } catch (error) {
        console.error('Error saving sequence:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete sequence
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId || req.headers['x-user-id'] || null;

        const result = await sequenceService.deleteSequence(id, userId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Sequence not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not allowed to delete this file') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Generate AI summary
exports.generateSummary = async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id'] || null;
        const sequences = await sequenceService.getRecentSequences(userId);

        const summary = await aiService.generateSummary(sequences);
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ message: 'Failed to generate summary', error: error.message });
    }
};

// Chat with bot
exports.chatWithBot = async (req, res) => {
    try {
        const { message, history, context } = req.body;
        const reply = await aiService.chatWithBot(message, history, context);
        res.status(200).json({ reply });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: error.message });
    }
};
