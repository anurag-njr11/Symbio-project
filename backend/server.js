require('dotenv').config();
const express = require('express');
const connectDB = require('./database/database');
const { getAll, getById, postFasta, deleteById } = require('./controllers/controller');

const app = express();

connectDB();


app.use(express.json());

app.get('/api/fasta', getAll);
app.get('/api/fasta/:id', getById);
app.post('/api/fasta', postFasta);
app.delete('/api/fasta/:id', deleteById);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
