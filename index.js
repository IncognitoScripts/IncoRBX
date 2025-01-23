const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const scripts = {};

app.use(bodyParser.json());
app.use(express.static('public')); // serve the frontend

// endpoint to upload script
app.post('/upload', (req, res) => {
    const scriptContent = req.body.script;
    if (!scriptContent) return res.status(400).json({ success: false });

    const id = uuidv4();
    scripts[id] = { raw: scriptContent }; // store raw script as-is

    res.json({ success: true, id });
});

// endpoint to serve raw scripts
app.get('/raw/:id', (req, res) => {
    const id = req.params.id;
    const script = scripts[id]?.raw; // get raw script

    if (!script) return res.status(404).send('script not found');
    res.type('text/plain').send(script);
});

// endpoint to obfuscate a script
app.post('/obfuscate', (req, res) => {
    const scriptContent = req.body.script;
    if (!scriptContent) return res.status(400).json({ success: false });

    // percent-encode the script
    const encoded = encodeURIComponent(scriptContent);
    const obfuscated = `
        function decodeChar(hex) return string.char(tonumber(hex, 16)) end
        function decodeString(str) local output, _ = string.gsub(str, "%%(%x%x)", decodeChar) return output end
        loadstring(decodeString("${encoded}"))()
    `;

    res.json({ success: true, obfuscated });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
