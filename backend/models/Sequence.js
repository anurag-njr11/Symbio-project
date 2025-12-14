const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    sequence: {
        type: String,
        required: true
    },
    length: {
        type: Number,
        required: true
    },
    gc_percent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    orf_detected: {
        type: Boolean,
        default: false
    },
    interpretation: {
        type: String,
        default: ''
    },
    nucleotide_counts: {
        A: { type: Number, default: 0 },
        T: { type: Number, default: 0 },
        G: { type: Number, default: 0 },
        C: { type: Number, default: 0 }
    },
    codon_frequency: {
        type: Map,
        of: Number,
        default: {}
    },
    orf_sequence: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // null for guest users
    }
}, {
    collection: 'sequences'  // Name of your MongoDB collection
});

// Create indexes for fast queries
sequenceSchema.index({ timestamp: -1 });  // Fast recent uploads
sequenceSchema.index({ filename: 1 });    // Fast filename search
sequenceSchema.index({ header: 1 });      // Fast header search

module.exports = mongoose.model('Sequence', sequenceSchema);
