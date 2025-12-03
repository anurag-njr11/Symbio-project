const Sequence = require('../database/Sequence');

exports.getAll = async (req, res) => {
    try {
        const sequences = await Sequence.find().sort({ createdAt: -1 });
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

exports.postFasta = async (req, res) => {
    try {
        const { fasta, filename } = req.body;

        if (!fasta) {
            return res.status(400).json({ message: 'FASTA data is required' });
        }

        const lines = fasta.trim().split('\n');
        const header = lines[0].startsWith('>') ? lines[0].substring(1).trim() : 'Unknown Header';
        const sequence = lines.slice(1).join('').replace(/\s/g, '');

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

        const newSequence = new Sequence({
            filename: filename || 'unknown.fasta',
            header,
            sequence,
            length,
            gc_percent,
            nucleotide_counts
        });

        await newSequence.save();

        res.status(201).json({ message: 'Fasta uploaded and saved successfully', data: newSequence });
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