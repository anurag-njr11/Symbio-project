const Sequence = require('../database/Sequence');
const PDFDocument = require('pdfkit');

// Download metadata report as PDF file
exports.downloadReportPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }

        const doc = new PDFDocument();

        // Generate filename for the report
        const reportFilename = `report-${sequence.filename.replace(/\.(fasta|fa|txt)$/i, '')}.pdf`;

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportFilename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('GENOMIC SEQUENCE ANALYSIS REPORT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text('='.repeat(70), { align: 'center' });
        doc.moveDown(2);

        // File Information
        doc.fontSize(14).text('File Information:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(`Filename: ${sequence.filename}`);
        doc.text(`Header: ${sequence.header}`);
        doc.text(`Analysis Date: ${new Date(sequence.timestamp).toLocaleString()}`);
        doc.moveDown(2);

        // Sequence Metrics
        doc.fontSize(14).text('Sequence Metrics:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(`Sequence Length: ${sequence.length} base pairs`);
        doc.text(`GC Content: ${sequence.gc_percent}%`);
        doc.text(`ORF Detected: ${sequence.orf_detected ? 'Yes' : 'No'}`);
        doc.moveDown(2);

        // Nucleotide Composition
        doc.fontSize(14).text('Nucleotide Composition:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(`Adenine (A): ${sequence.nucleotide_counts.A} (${((sequence.nucleotide_counts.A / sequence.length) * 100).toFixed(2)}%)`);
        doc.text(`Thymine (T): ${sequence.nucleotide_counts.T} (${((sequence.nucleotide_counts.T / sequence.length) * 100).toFixed(2)}%)`);
        doc.text(`Guanine (G): ${sequence.nucleotide_counts.G} (${((sequence.nucleotide_counts.G / sequence.length) * 100).toFixed(2)}%)`);
        doc.text(`Cytosine (C): ${sequence.nucleotide_counts.C} (${((sequence.nucleotide_counts.C / sequence.length) * 100).toFixed(2)}%)`);
        doc.moveDown(2);

        // Biological Interpretation
        doc.fontSize(14).text('Biological Interpretation:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(sequence.interpretation, { align: 'justify' });
        doc.moveDown(2);

        doc.fontSize(10).text('='.repeat(70), { align: 'center' });
        doc.text('End of Report', { align: 'center' });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
