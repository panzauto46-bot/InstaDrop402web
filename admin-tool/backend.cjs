const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 8888;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to the file we want to edit automatically
const TARGET_FILE = path.join(__dirname, '..', 'src', 'config', 'stacks.ts');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint: Nyalakan Server
app.post('/start-server', (req, res) => {
    // start cmd /k means: Open new CMD window and Keep it open
    exec('start cmd /k "npm run start"', { cwd: path.join(__dirname, '..') }, (err) => {
        if (err) return res.json({ success: false, message: 'Gagal membuka terminal server.' });
        res.json({ success: true, message: 'Terminal Server dibuka!' });
    });
});

// Endpoint: Nyalakan Tunnel (AUTO RECONNECT)
app.post('/start-tunnel', (req, res) => {
    // Launch the batch file that contains the loop
    exec('start cmd /k "start-tunnel-loop.bat"', { cwd: path.join(__dirname, '..') }, (err) => {
        if (err) return res.json({ success: false, message: 'Gagal membuka terminal tunnel.' });
        res.json({ success: true, message: 'Tunnel (AUTO-RECONNECT) dimulai! 🛡️' });
    });
});

// API endpoint to handle the update
app.post('/update-url', (req, res) => {
    const newUrl = req.body.url;

    if (!newUrl || !newUrl.startsWith('http')) {
        return res.json({ success: false, message: 'URL tidak valid! Harus dimulai dengan http/https' });
    }

    // 1. Read the current file content
    fs.readFile(TARGET_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'Gagal membaca file config.' });
        }

        // 2. Replace the URL line using regex
        // Looks for strategies like: export const API_BASE = '...';
        const updatedContent = data.replace(
            /export const API_BASE = '.*';/,
            `export const API_BASE = '${newUrl}';`
        );

        // 3. Write back the changes
        fs.writeFile(TARGET_FILE, updatedContent, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, message: 'Gagal menulis file config.' });
            }

            // 4. Run Git commands automatically
            console.log('File updated, running git commands...');

            // Chain of commands: git add -> commit -> push
            exec('git add . && git commit -m "Update Serveo URL via Admin Tool" && git push', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.json({ success: false, message: 'Gagal Push ke GitHub. Cek koneksi internet.' });
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);

                res.json({ success: true, message: 'BERHASIL! URL diupdate & dideploy. Tunggu 2 menit untuk Netlify refresh.' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Admin Tool berjalan di: http://localhost:${PORT}`);
    // Auto open browser
    exec(`start http://localhost:${PORT}`);
});
