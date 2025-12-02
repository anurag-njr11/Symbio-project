export const parseFasta = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            try {
                // Simple FASTA parser
                const lines = text.split(/\r?\n/);
                let header = '';
                let sequence = '';

                for (const line of lines) {
                    if (line.startsWith('>')) {
                        // If we already have a header and sequence, we might stop (handling single file for now)
                        if (header) break;
                        header = line.substring(1).trim();
                    } else {
                        sequence += line.trim().toUpperCase();
                    }
                }

                if (!sequence) {
                    // Fallback if no header found or just raw sequence
                    if (!header) header = 'Untitled Sequence';
                    if (!sequence) sequence = text.replace(/\s/g, '').toUpperCase();
                }

                // Analysis
                const length = sequence.length;
                const nucleotide_counts = {
                    A: (sequence.match(/A/g) || []).length,
                    T: (sequence.match(/T/g) || []).length,
                    G: (sequence.match(/G/g) || []).length,
                    C: (sequence.match(/C/g) || []).length,
                };

                const gc_count = nucleotide_counts.G + nucleotide_counts.C;
                const gc_percent = length > 0 ? ((gc_count / length) * 100).toFixed(2) : 0;

                // Simple ORF detection (ATG ... TAA/TAG/TGA)
                // This is a very basic check, not a full ORF finder
                const hasStart = sequence.includes('ATG');
                const hasStop = /TAA|TAG|TGA/.test(sequence);
                const orf_detected = hasStart && hasStop;

                const result = {
                    id: Date.now().toString(),
                    filename: file.name,
                    header,
                    sequence: sequence.substring(0, 50) + '...', // Store truncated for preview if needed
                    length,
                    gc_percent,
                    nucleotide_counts,
                    orf_detected,
                    timestamp: new Date().toISOString()
                };

                resolve(result);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};
