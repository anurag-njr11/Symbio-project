const Sequence = require('../models/Sequence');

class SequenceService {
    // Validate FASTA format
    validateFasta(fasta) {
        if (!fasta.trim().startsWith(">")) {
            throw new Error('Invalid FASTA: missing header');
        }

        const lines = fasta.trim().split('\n');
        const header = lines[0].startsWith('>') ? lines[0].substring(1).trim() : 'Unknown Header';
        const sequence = lines.slice(1).join('').replace(/\s/g, '');

        // Validate sequence contains only ATGC
        if (/[^ATGC]/i.test(sequence)) {
            throw new Error('Invalid characters in sequence. Only A, T, G, C are allowed.');
        }

        if (!sequence) {
            throw new Error('Invalid FASTA format: No sequence found');
        }

        return { header, sequence };
    }

    calculateNucleotideCounts(sequence) {
        return {
            A: (sequence.match(/[Aa]/g) || []).length,
            T: (sequence.match(/[Tt]/g) || []).length,
            G: (sequence.match(/[Gg]/g) || []).length,
            C: (sequence.match(/[Cc]/g) || []).length
        };
    }

    // Calculate Codon Counts
    calculateCodonCounts(sequence) {
        const codons = {};
        const cleanSequence = sequence.toUpperCase().replace(/[^ATGC]/g, '');

        for (let i = 0; i < cleanSequence.length - 2; i += 3) {
            const codon = cleanSequence.slice(i, i + 3);
            codons[codon] = (codons[codon] || 0) + 1;
        }
        return codons;
    }

    // Calculate GC content
    calculateGCContent(sequence) {
        const gcCount = (sequence.match(/[GCgc]/g) || []).length;
        return (gcCount / sequence.length) * 100;
    }

    // Detect Open Reading Frame (ORF) and return sequence
    detectORF(sequence) {
        const seq = sequence.toUpperCase();
        const stops = ["TAA", "TAG", "TGA"];
        let longestOrf = "";
        let found = false;

        for (let frame = 0; frame < 3; frame++) {
            for (let i = frame; i < seq.length - 2; i += 3) {
                if (seq.slice(i, i + 3) === "ATG") { // start codon
                    for (let j = i + 3; j < seq.length - 2; j += 3) {
                        const codon = seq.slice(j, j + 3);
                        if (stops.includes(codon)) { // in-frame stop codon
                            const orfLen = (j + 3) - i;
                            const currentOrf = seq.substring(i, j + 3);

                            if (currentOrf.length > longestOrf.length) {
                                longestOrf = currentOrf;
                                found = true;
                            }
                            break; // Stop searching this start codon, move to next
                        }
                    }
                }
            }
        }

        return { detected: found, sequence: longestOrf || "" };
    }

    // Get all sequences for a user
    async getAllSequences(userId) {
        const query = userId && userId !== 'null' && userId !== 'guest' ? { userId } : { userId: null };
        return await Sequence.find(query).sort({ timestamp: -1 });
    }

    // Get sequence by ID
    async getSequenceById(id) {
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            throw new Error('Sequence not found');
        }
        return sequence;
    }

    // Create new sequence
    async createSequence(sequenceData) {
        const newSequence = new Sequence(sequenceData);
        return await newSequence.save();
    }

    // Delete sequence
    async deleteSequence(id, userId) {
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            throw new Error('Sequence not found');
        }

        // Check if user owns this sequence (skip check for guest users or if no userId)
        if (userId && userId !== 'null' && userId !== 'guest' && sequence.userId) {
            if (sequence.userId.toString() !== userId) {
                throw new Error('Not allowed to delete this file');
            }
        }

        await Sequence.findByIdAndDelete(id);
        return { message: 'Fasta deleted successfully' };
    }

    // Get recent sequences for summary (limit to 5)
    async getRecentSequences(userId) {
        const query = userId && userId !== 'null' && userId !== 'guest' ? { userId } : { userId: null };
        return await Sequence.find(query).sort({ timestamp: -1 }).limit(5);
    }
}

module.exports = new SequenceService();
