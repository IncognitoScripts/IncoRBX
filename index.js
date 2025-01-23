const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const scripts = {};

// Middleware
app.use(bodyParser.json());

// Serve the frontend (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to upload script
app.post('/upload', (req, res) => {
    const scriptContent = req.body.script;
    if (!scriptContent) return res.status(400).json({ success: false });

    const id = uuidv4();
    scripts[id] = scriptContent;

    res.json({ success: true, id });
});

// Endpoint to serve raw scripts
app.get('/raw/:id', (req, res) => {
    const id = req.params.id;
    const script = scripts[id];

    if (!script) return res.status(404).send('Script not found');
    res.type('text/plain').send(script);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
