import express from 'express';
import { recallMemories } from './memory.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

// Route pour récupérer les souvenirs
app.get('/api/memories/:userId', async (req, res) => {
    try {
        const memories = await recallMemories(req.params.userId);
        res.json(memories);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des souvenirs' });
    }
});

app.listen(port, () => {
    console.log(`Interface de visualisation des souvenirs disponible sur http://localhost:${port}`);
}); 