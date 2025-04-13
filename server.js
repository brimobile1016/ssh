const express = require('express');
const { runSSHCommand } = require('./ssh');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis (HTML) dan assets
app.use(express.static(path.join(__dirname, 'views')));

// Halaman form input
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint untuk eksekusi SSH
app.post('/api/login-ssh', async (req, res) => {
    console.log(req.body); // Debugging untuk memeriksa apakah body terkirim dengan benar
    const { host, username, password, command } = req.body;

    try {
        const result = await runSSHCommand(host, username, password, command);
        res.json({
            status: result.status,
            creator: result.creator,
            stdout: result.result.stdout,
            stderr: result.result.stderr,
        });
    } catch (error) {
        res.json({
            status: false,
            creator: 'King Of Bear',
            message: 'Gagal login SSH atau menjalankan perintah.',
            error: error.message,
        });
    }
});



// Halaman untuk menampilkan hasil eksekusi SSH
app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'result.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
