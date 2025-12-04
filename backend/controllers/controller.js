const Sequence = require('../database/Sequence');

// Generate textual biological interpretation (Fix #9)
function generateInterpretation(data) {
    let text = `The analyzed sequence ${data.filename} contains ${data.length} base pairs. `;

    if (data.gc_percent > 50) {
        text += "This sequence shows high GC content, indicating potentially higher thermal stability. ";
    }
    if (!data.orf_detected) {
        text += "No valid ORF was detected, suggesting a non-coding or incomplete region.";
    } else {
        text += "A valid ORF was detected, suggesting a potential protein-coding region.";
    }

    return text;
}

// Get all files (Fix #4 - persist upload history)
exports.getAllFiles = async (req, res) => {
    try {
        const sequences = await Sequence.find().sort({ timestamp: -1 });
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
        res.status(500).json({ message: error.message });
    }
};


exports.postFasta = async (req, res) => {
    try {
        const { fasta, filename } = req.body;

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

        // ORF detection logic (Fix #7)
        const stops = ["TAA", "TAG", "TGA"];
        const orf_detected = sequence.toUpperCase().startsWith("ATG") &&
            stops.some(stop => sequence.toUpperCase().endsWith(stop));

        // Generate interpretation (Fix #9)
        const interpretation = generateInterpretation({
            filename,
            length,
            gc_percent,
            orf_detected
        });

        const newSequence = new Sequence({
            filename: filename || 'unknown.fasta',
            header,
            sequence,
            length,
            gc_percent,
            nucleotide_counts,
            orf_detected,
            interpretation
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
        const deletedSequence = await Sequence.findByIdAndDelete(id);
        if (!deletedSequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }
        res.status(200).json({ message: 'Fasta deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};