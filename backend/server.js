require('dotenv').config();
const express = require('express');
const connectDB = require('./database/database');
const { getById, postFasta, deleteById, downloadFile, downloadReport, getAllFiles } = require('./controllers/controller');

const app = express();

connectDB();


app.use(express.json());

app.get('/api/fasta', getAllFiles);
app.get('/api/fasta/:id', getById);
app.get('/api/files/:id/download', downloadFile);
app.get('/api/files/:id/report', downloadReport);
app.post('/api/fasta', postFasta);
app.delete('/api/fasta/:id', deleteById);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
