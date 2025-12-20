const Sequence = require('../database/Sequence');
const PDFDocument = require('pdfkit');

const safe = (v) => {
    if (v === null || v === undefined) return "Not determined";
    if (typeof v === 'object') return "Not determined";
    return String(v);
};

const formatCodonFrequency = (codonFreq) => {
    if (!codonFreq) return [];

    let codonObj = codonFreq;
    if (codonFreq instanceof Map) {
        codonObj = Object.fromEntries(codonFreq);
    }

    const entries = Object.entries(codonObj)
        .map(([codon, count]) => ({
            codon: String(codon),
            count: Number(count) || 0
        }))
        .sort((a, b) => b.count - a.count);

    const totalCodons = entries.reduce((sum, item) => sum + item.count, 0);

    const codonToAA = {
        'TTT': 'Phe', 'TTC': 'Phe', 'TTA': 'Leu', 'TTG': 'Leu',
        'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
        'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile', 'ATG': 'Met',
        'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
        'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser',
        'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
        'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
        'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
        'TAT': 'Tyr', 'TAC': 'Tyr', 'TAA': 'Stop', 'TAG': 'Stop',
        'CAT': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
        'AAT': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
        'GAT': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
        'TGT': 'Cys', 'TGC': 'Cys', 'TGA': 'Stop', 'TGG': 'Trp',
        'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
        'AGT': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
        'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly'
    };

    return entries.map(item => ({
        codon: item.codon,
        count: item.count,
        percentage: totalCodons > 0 ? ((item.count / totalCodons) * 100).toFixed(2) : '0.00',
        aminoAcid: codonToAA[item.codon] || 'Unknown'
    }));
};

const drawNucleotideChart = (doc, nucleotideCounts, total, startY) => {
    const bases = ['A', 'T', 'G', 'C'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const maxBarWidth = 150;
    const barHeight = 25;
    const startX = 150;

    // Title at explicit startY (no negative offset)
    doc.fontSize(12).fillColor('#000').text('Nucleotide Distribution', startX + 20, startY);

    const chartContentStart = startY + 30; // Space below title

    bases.forEach((base, index) => {
        const count = nucleotideCounts[base] || 0;
        const percentage = (count / total) * 100;
        const barWidth = (count / total) * maxBarWidth;
        const y = chartContentStart + (index * 35);

        doc.rect(startX, y, barWidth, barHeight).fillColor(colors[index]).fill();
        doc.fillColor('#000').fontSize(14).text(base, startX - 30, y + 6);
        doc.text(`${count} (${percentage.toFixed(1)}%)`, startX + maxBarWidth + 10, y + 6);
    });

    // Return the Y position where the chart ends
    return chartContentStart + (bases.length * 35);
};

const drawCodonChart = (doc, codonData, startY) => {
    const maxBarWidth = 120;
    const barHeight = 18;
    const startX = 180;
    const top10 = codonData.slice(0, 10);
    const maxCount = top10[0]?.count || 1;

    // Title at explicit startY
    doc.fontSize(12).fillColor('#000').text('Top 10 Codon Frequencies', startX - 50, startY);

    const chartContentStart = startY + 30;

    top10.forEach((item, index) => {
        const barWidth = (item.count / maxCount) * maxBarWidth;
        const y = chartContentStart + (index * 24);

        doc.rect(startX, y, barWidth, barHeight).fillColor('#6366f1').fill();
        doc.fillColor('#000').fontSize(11);
        doc.text(`${item.codon} (${item.aminoAcid})`, startX - 100, y + 3, { width: 95, align: 'right' });
        doc.text(`${item.count} (${item.percentage}%)`, startX + maxBarWidth + 5, y + 3);
    });

    return chartContentStart + (top10.length * 24);
};

exports.downloadReportPDF = async (req, res) => {
    let doc;
    try {
        const { id } = req.params;
        const sequence = await Sequence.findById(id).lean();

        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }

        const filename = safe(sequence.filename);
        const header = safe(sequence.header);
        const length = Number(sequence.length) || 0;
        const gcPercent = Number(sequence.gc_percent) || 0;
        const nucleotideCounts = sequence.nucleotide_counts || { A: 0, T: 0, G: 0, C: 0 };
        const orfDetected = Boolean(sequence.orf_detected);
        const orfSequence = sequence.orf_sequence ? String(sequence.orf_sequence) : null;
        const orfStart = sequence.orf_start != null ? Number(sequence.orf_start) : null;
        const orfEnd = sequence.orf_end != null ? Number(sequence.orf_end) : null;
        const readingFrame = sequence.reading_frame != null ? Number(sequence.reading_frame) : null;
        const interpretation = sequence.interpretation ? String(sequence.interpretation) : null;

        const codonData = formatCodonFrequency(sequence.codon_frequency);
        const totalCodons = codonData.reduce((sum, item) => sum + item.count, 0);
        const uniqueCodons = codonData.length;

        const reportFilename = `genomic-report-${filename.replace(/\.(fasta|fa|txt)$/i, '')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportFilename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(20).fillColor('#1e3a8a').text('GENOMIC SEQUENCE ANALYSIS REPORT', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(14).fillColor('#000').text(filename, { align: 'center' });
        doc.fontSize(12).fillColor('#666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(0.6);

        doc.fontSize(16).fillColor('#000').text('EXECUTIVE SUMMARY', { underline: true });
        doc.moveDown(0.3);
        const execSummary = `This computational analysis examined a ${length.toLocaleString()} base pair genomic sequence with a GC content of ${gcPercent.toFixed(2)}%, classified as ${gcPercent < 40 ? 'low' : gcPercent <= 60 ? 'moderate' : 'high'} GC composition. ${orfDetected ? `Open reading frame analysis identified a potential coding region of ${orfSequence.length} bp, suggesting protein-coding capability with an estimated translation product of approximately ${Math.floor(orfSequence.length / 3)} amino acids.` : 'No open reading frame was detected, indicating potential non-coding or regulatory function.'} Codon usage analysis revealed ${uniqueCodons} unique codons across ${totalCodons.toLocaleString()} total codons, providing insights into translational efficiency and evolutionary optimization. The nucleotide composition exhibits ${((nucleotideCounts.A + nucleotideCounts.G) / length * 100).toFixed(1)}% purine content and ${((nucleotideCounts.T + nucleotideCounts.C) / length * 100).toFixed(1)}% pyrimidine content, reflecting the molecular structure and potential functional characteristics of this sequence.`;
        doc.fontSize(14).text(execSummary, { align: 'justify', width: 495 });
        doc.moveDown(0.6);

        doc.fontSize(16).text('SEQUENCE METADATA', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(14);
        doc.text(`File: ${filename} | Header: ${header}`, { align: 'justify' });
        doc.text(`Length: ${length.toLocaleString()} bp | Upload: ${new Date(sequence.timestamp).toLocaleString()}`, { align: 'justify' });
        doc.text(`Analysis ID: ${safe(sequence._id)} | User: ${sequence.userId ? 'Authenticated' : 'Guest'}`, { align: 'justify' });
        doc.moveDown(0.6);

        doc.fontSize(16).text('NUCLEOTIDE COMPOSITION ANALYSIS', { underline: true });
        doc.moveDown(0.3);

        const nucChartEndY = drawNucleotideChart(doc, nucleotideCounts, length, doc.y);
        doc.y = nucChartEndY + 20; // Explicitly set Y below the chart with padding
        doc.x = 50; // Reset X to margin to prevent text overflow

        const atContent = ((nucleotideCounts.A + nucleotideCounts.T) / length * 100).toFixed(2);
        const purineContent = ((nucleotideCounts.A + nucleotideCounts.G) / length * 100).toFixed(2);
        const pyrimidineContent = ((nucleotideCounts.T + nucleotideCounts.C) / length * 100).toFixed(2);

        const nucText = `The sequence exhibits ${atContent}% AT content versus ${gcPercent.toFixed(2)}% GC content, with purine bases (adenine and guanine) comprising ${purineContent}% and pyrimidine bases (thymine and cytosine) comprising ${pyrimidineContent}% of the total composition. ${gcPercent < 40 ? 'Low GC content is characteristic of AT-rich genomic regions, typically associated with reduced thermal stability of DNA duplexes, lower melting temperatures, and potential localization in non-coding sequences, introns, or intergenic regions. Such composition may reflect evolutionary adaptation to specific environmental conditions or functional constraints.' : gcPercent <= 60 ? 'Moderate GC content is typical of protein-coding genes in many eukaryotic organisms, providing balanced thermal stability and optimal conditions for transcription and translation. This composition suggests potential functional significance and is consistent with actively transcribed genomic regions.' : 'High GC content indicates strong thermal stability of DNA duplexes, elevated melting temperatures, and potential association with promoter regions, CpG islands, or genomes from thermophilic organisms. GC-rich regions often exhibit distinct chromatin structures and may influence gene regulation through effects on DNA methylation and nucleosome positioning.'}`;
        doc.fontSize(14).text(nucText, { align: 'justify', width: 495 });

        // Ensure we don't start a new page just for the header if we're near the bottom
        if (doc.y > 650) doc.addPage();
        else doc.moveDown(2); // Add some space if we are continuing on same page

        doc.fontSize(16).text('CODON FREQUENCY AND USAGE BIAS', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(14).text(`Total Codons: ${totalCodons.toLocaleString()} | Unique Codons: ${uniqueCodons}`, { align: 'justify' });
        doc.moveDown(0.4);

        if (codonData.length > 0) {
            const tableTop = doc.y;
            doc.fontSize(13).fillColor('#1e40af');
            doc.text('Codon', 60, tableTop, { width: 50 });
            doc.text('Count', 110, tableTop, { width: 60 });
            doc.text('Freq %', 170, tableTop, { width: 50 });
            doc.text('AA', 220, tableTop, { width: 60 });
            doc.text('Codon', 300, tableTop, { width: 50 });
            doc.text('Count', 350, tableTop, { width: 60 });
            doc.text('Freq %', 410, tableTop, { width: 50 });
            doc.text('AA', 460, tableTop, { width: 60 });

            doc.moveTo(60, tableTop + 15).lineTo(540, tableTop + 15).strokeColor('#3b82f6').stroke();
            doc.moveDown(0.8);

            doc.fillColor('#000').fontSize(12);
            const top20 = codonData.slice(0, 20);
            for (let i = 0; i < top20.length; i += 2) {
                const rowY = doc.y;
                const item1 = top20[i];
                const item2 = top20[i + 1];

                doc.text(item1.codon, 60, rowY, { width: 50 });
                doc.text(String(item1.count), 110, rowY, { width: 60 });
                doc.text(item1.percentage, 170, rowY, { width: 50 });
                doc.text(item1.aminoAcid, 220, rowY, { width: 60 });

                if (item2) {
                    doc.text(item2.codon, 300, rowY, { width: 50 });
                    doc.text(String(item2.count), 350, rowY, { width: 60 });
                    doc.text(item2.percentage, 410, rowY, { width: 50 });
                    doc.text(item2.aminoAcid, 460, rowY, { width: 60 });
                }
                doc.moveDown(0.5);
            }

            doc.moveDown(0.6);
            const codonChartEndY = drawCodonChart(doc, codonData, doc.y);
            doc.y = codonChartEndY + 20;
            doc.x = 50; // Reset X to margin

            const codonText = `Codon usage bias reflects the non-random utilization of synonymous codons during translation, influenced by tRNA abundance, translation efficiency, and evolutionary optimization. The genetic code's degeneracy allows multiple codons to encode the same amino acid, yet highly expressed genes exhibit strong preferences for specific synonymous codons that correspond to abundant tRNA species. In this sequence, the observed codon distribution reveals ${codonData[0].codon} as the most frequent codon (${codonData[0].percentage}%), encoding ${codonData[0].aminoAcid}. The presence of start codons (ATG) and stop codons (TAA, TAG, TGA) delineates potential open reading frames and translation termination sites. Deviations from expected codon frequencies may indicate recent horizontal gene transfer, artificial codon optimization, or species-specific translation machinery adaptations.`;
            doc.fontSize(14).text(codonText, { align: 'justify', width: 495 });
        }

        doc.addPage();
        doc.fontSize(16).fillColor(orfDetected ? '#16a34a' : '#dc2626').text(`OPEN READING FRAME ANALYSIS: ${orfDetected ? 'POSITIVE' : 'NEGATIVE'}`, { underline: true });
        doc.fillColor('#000').moveDown(0.4);

        if (orfDetected && orfSequence) {
            doc.fontSize(14);
            doc.text(`ORF Length: ${orfSequence.length} bp | Start Position: ${orfStart !== null ? orfStart : 'Not determined'} | End Position: ${orfEnd !== null ? orfEnd : 'Not determined'} | Reading Frame: ${readingFrame !== null ? readingFrame : 'Not determined'}`, { align: 'justify' });
            doc.text(`Predicted Protein Length: ~${Math.floor(orfSequence.length / 3)} amino acids`, { align: 'justify' });
            doc.moveDown(0.4);

            doc.fontSize(14).text('ORF Nucleotide Sequence:', { underline: true });
            doc.moveDown(0.2);
            doc.font('Courier').fontSize(10);
            const chunkSize = 70;
            for (let i = 0; i < Math.min(orfSequence.length, 560); i += chunkSize) {
                doc.text(orfSequence.slice(i, i + chunkSize));
            }
            if (orfSequence.length > 560) doc.text('... (sequence truncated for display)');
            doc.font('Helvetica').fontSize(14);
            doc.moveDown(0.4);

            const orfText = `The detected open reading frame spans ${orfSequence.length} nucleotides (${Math.floor(orfSequence.length / 3)} codons), initiating with the canonical start codon ATG${orfStart !== null ? ` at nucleotide position ${orfStart}` : ''} and extending to ${orfEnd !== null ? `position ${orfEnd}` : 'an undetermined terminus'}. This ORF represents a potential protein-coding region capable of producing a polypeptide of approximately ${Math.floor(orfSequence.length / 3)} amino acids through ribosomal translation. The presence of a valid ORF suggests this sequence may encode a functional protein, though experimental validation through techniques such as RT-PCR, Western blotting, or mass spectrometry is required to confirm actual expression and translation. The reading frame designation indicates the nucleotide offset from which translation would initiate, critical for maintaining the correct amino acid sequence. However, this analysis does not account for post-transcriptional modifications, alternative splicing, or regulatory elements that may influence actual protein production.`;
            doc.text(orfText, { align: 'justify', width: 495 });
        } else {
            const noOrfText = `No valid open reading frame was detected in this sequence using standard ORF detection criteria (minimum length threshold, start codon ATG, in-frame stop codons). This finding suggests several possible interpretations: the sequence may represent a non-coding genomic region such as an intron, untranslated region (UTR), or intergenic spacer; the sequence may be incomplete or fragmented, lacking the full coding region; alternative start codons (e.g., CTG, GTG) or non-canonical translation initiation mechanisms may be required; or the sequence may encode regulatory RNA molecules such as microRNA, long non-coding RNA, or other functional RNA species that do not undergo translation. Additionally, reverse complement analysis was not performed, and the true coding potential may exist on the opposite DNA strand. These results should be interpreted as computational predictions requiring experimental validation.`;
            doc.fontSize(14).text(noOrfText, { align: 'justify', width: 495 });
        }
        doc.moveDown(0.6);

        doc.fontSize(16).text('AI-ASSISTED BIOLOGICAL INTERPRETATION', { underline: true });
        doc.moveDown(0.3);
        if (interpretation) {
            doc.fontSize(14).text(interpretation, { align: 'justify', width: 495 });
        } else {
            doc.fontSize(14).text('No AI-generated interpretation available for this sequence. Manual analysis of GC content, codon usage, and ORF status provides computational predictions that require experimental validation for functional assignment.', { align: 'justify', width: 495 });
        }
        doc.moveDown(0.6);

        doc.fontSize(16).text('LIMITATIONS AND ASSUMPTIONS', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(14);
        doc.text('• Analysis assumes standard genetic code; alternative genetic codes not considered', { align: 'justify' });
        doc.text('• ORF detection limited to forward reading frames; reverse complement not analyzed', { align: 'justify' });
        doc.text('• Short sequence length limits statistical power and biological inference', { align: 'justify' });
        doc.text('• No homology searches, phylogenetic analysis, or organism identification performed', { align: 'justify' });
        doc.text('• Regulatory elements, splice sites, and post-transcriptional modifications not assessed', { align: 'justify' });
        doc.moveDown(0.6);

        doc.fontSize(16).text('CONCLUSION', { underline: true });
        doc.moveDown(0.3);
        const conclusion = `Comprehensive computational analysis of ${filename} (${length.toLocaleString()} bp, ${gcPercent.toFixed(2)}% GC content) ${orfDetected ? `identified a potential protein-coding region of ${orfSequence.length} bp with predicted translation capacity of approximately ${Math.floor(orfSequence.length / 3)} amino acids` : 'revealed no open reading frame, suggesting non-coding or regulatory function'}. Codon frequency analysis identified ${uniqueCodons} unique codons from ${totalCodons.toLocaleString()} total codons, providing insights into translation patterns and evolutionary optimization. These findings represent computational predictions based on sequence composition and structural features. Experimental validation through molecular biology techniques is recommended for definitive functional assignment and biological characterization.`;
        doc.fontSize(14).text(conclusion, { align: 'justify', width: 495 });

        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);

        if (doc) {
            try {
                doc.destroy();
            } catch (e) {
                console.error('Error destroying PDF:', e);
            }
        }

        if (!res.headersSent) {
            res.status(500).json({ message: 'PDF generation failed', error: error.message });
        }
    }
};
