// Utility functions for DNA sequence analysis and chart data preparation

/**
 * Count codon frequencies in a DNA sequence
 * @param {string} sequence - DNA sequence string
 * @returns {Array} Array of {codon, count} objects sorted by frequency
 */
export const getCodonFrequencies = (sequence) => {
    const codonCounts = {};

    // Extract codons (3-letter sequences)
    for (let i = 0; i <= sequence.length - 3; i += 3) {
        const codon = sequence.substring(i, i + 3).toUpperCase();
        if (codon.length === 3 && /^[ATGC]{3}$/.test(codon)) {
            codonCounts[codon] = (codonCounts[codon] || 0) + 1;
        }
    }

    // Convert to array and sort by frequency
    const sortedCodons = Object.entries(codonCounts)
        .map(([codon, count]) => ({ codon, count }))
        .sort((a, b) => b.count - a.count);

    // Return top 8 most frequent codons
    return sortedCodons.slice(0, 8);
};

/**
 * Calculate GC% in sliding windows
 * @param {string} sequence - DNA sequence string
 * @param {number} windowSize - Size of sliding window (default: 50)
 * @returns {Array} Array of {window, gcPercent} objects
 */
export const getSlidingGCContent = (sequence, windowSize = 50) => {
    const windows = [];

    for (let i = 0; i <= sequence.length - windowSize; i += windowSize) {
        const window = sequence.substring(i, i + windowSize).toUpperCase();
        const gcCount = (window.match(/[GC]/g) || []).length;
        const gcPercent = (gcCount / window.length) * 100;

        windows.push({
            window: Math.floor(i / windowSize) + 1,
            position: i,
            gcPercent: parseFloat(gcPercent.toFixed(2))
        });
    }

    return windows;
};

/**
 * Calculate cumulative nucleotide counts across sequence
 * @param {string} sequence - DNA sequence string
 * @param {number} step - Step size for sampling (default: 10)
 * @returns {Object} Object with arrays for each nucleotide
 */
export const getCumulativeNucleotideCounts = (sequence, step = 10) => {
    const data = {
        positions: [],
        A: [],
        T: [],
        G: [],
        C: []
    };

    let counts = { A: 0, T: 0, G: 0, C: 0 };

    for (let i = 0; i < sequence.length; i++) {
        const base = sequence[i].toUpperCase();
        if (counts.hasOwnProperty(base)) {
            counts[base]++;
        }

        // Sample at intervals to avoid too many data points
        if (i % step === 0 || i === sequence.length - 1) {
            data.positions.push(i);
            data.A.push(counts.A);
            data.T.push(counts.T);
            data.G.push(counts.G);
            data.C.push(counts.C);
        }
    }

    return data;
};

/**
 * Find ORF regions in sequence
 * @param {string} sequence - DNA sequence string
 * @returns {Array} Array of {start, end, length} objects
 */
export const findORFRegions = (sequence) => {
    const orfs = [];
    const startCodon = 'ATG';
    const stopCodons = ['TAA', 'TAG', 'TGA'];

    for (let i = 0; i <= sequence.length - 3; i++) {
        if (sequence.substring(i, i + 3).toUpperCase() === startCodon) {
            // Found start codon, look for stop codon
            for (let j = i + 3; j <= sequence.length - 3; j += 3) {
                const codon = sequence.substring(j, j + 3).toUpperCase();
                if (stopCodons.includes(codon)) {
                    orfs.push({
                        start: i,
                        end: j + 3,
                        length: j + 3 - i,
                        startCodon: startCodon,
                        stopCodon: codon
                    });
                    break;
                }
            }
        }
    }

    return orfs;
};

/**
 * Calculate AT/GC ratio
 * @param {Object} nucleotideCounts - Object with A, T, G, C counts
 * @returns {number} GC ratio (0-1)
 */
export const calculateGCRatio = (nucleotideCounts) => {
    const { A = 0, T = 0, G = 0, C = 0 } = nucleotideCounts;
    const total = A + T + G + C;
    return total > 0 ? ((G + C) / total) : 0;
};
