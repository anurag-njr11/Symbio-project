const express = require('express');
const router = express.Router();
const {
    getAllFiles,
    getById,
    postFasta,
    deleteById,
    downloadFile
} = require('../controllers/sequenceController');
const { downloadReportPDF } = require('../controllers/pdfController');

// FASTA/Sequence routes
router.get('/fasta', getAllFiles);
router.get('/fasta/:id', getById);
router.post('/fasta', postFasta);
router.delete('/fasta/:id', deleteById);

// File download routes
router.get('/files/:id/download', downloadFile);
router.get('/files/:id/report', downloadReportPDF);

module.exports = router;
