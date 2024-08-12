const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Crear una instancia de Express
const app = express();

// Configurar middlewares
app.use(bodyParser.json());
app.use(cors());

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/la_venganza_de_sofia', {
 
}).then(() => {
    console.log('Conectado a la base de datos MongoDB');
}).catch((error) => {
    console.error('Error al conectar a la base de datos MongoDB:', error);
});

// Definir un esquema y un modelo para los puntajes
const scoreSchema = new mongoose.Schema({
    name: String,
    score: Number,
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener todos los puntajes
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los puntajes', error });
    }
});

// Ruta para guardar un nuevo puntaje
app.post('/api/scores', async (req, res) => {
    try {
        const newScore = new Score(req.body);
        await newScore.save();
        res.status(201).json(newScore);
    } catch (error) {
        res.status(400).json({ message: 'Error al guardar el puntaje', error });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
