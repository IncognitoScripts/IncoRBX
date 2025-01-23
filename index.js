const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const scripts = {};

app.use(bodyParser.json());
app.use(express.static('public')); // serve the frontend

// helper function to obfuscate a script using percent encoding
function obfuscateScript(script) {
    return encodeURIComponent(script);
}

// endpoint to upload script
app.post('/upload', (req, res) => {
    const scriptContent = req.body.script;
    const obfuscate = req.body.obfuscate || false;

    if (!scriptContent) return res.status(400).json({ success: false });

    const id = uuidv4();
    scripts[id] = obfuscate ? obfuscateScript(scriptContent) : scriptContent;

    res.json({ success: true, id, obfuscated: obfuscate });
});

// endpoint to serve raw scripts
app.get('/raw/:id', (req, res) => {
    const id = req.params.id;
    const script = scripts[id];

    if (!script) return res.status(404).send('script not found');

    // if the script is obfuscated, wrap it with decoding logic
    if (script.includes('%')) {
        const wrappedScript = `
            local function decodeChar(hex)
                return string.char(tonumber(hex, 16))
            end

            local function decodeString(str)
                return (str:gsub("%%(%x%x)", decodeChar))
            end

            loadstring(decodeString("${script}"))()
        `;
        res.type('text/plain').send(wrappedScript);
    } else {
        res.type('text/plain').send(script);
    }
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
