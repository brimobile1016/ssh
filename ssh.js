const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

/**
 * Fungsi untuk login SSH dan menjalankan perintah
 * @param {string} host - IP VPS
 * @param {string} username - Username SSH (misal: root)
 * @param {string} password - Password SSH
 * @param {string} command - Perintah bash yang akan dijalankan
 * @returns {Promise<Object>} - Hasil output stdout dan stderr
 */
async function runSSHCommand(host, username, password, command) {
    console.log('\n==============================');
    console.log('[INFO] Menyiapkan data SSH...');

    if (!host || !username || !password || !command) {
        console.log('[ERROR] Parameter tidak lengkap!');
        throw new Error('Parameter tidak lengkap. host, username, password, dan command dibutuhkan.');
    }

    console.log(`[INFO] Host     : ${host}`);
    console.log(`[INFO] Username : ${username}`);
    console.log(`[INFO] Command  : ${command}`);

    try {
        console.log('[INFO] Menghubungkan ke SSH...');
        await ssh.connect({ host, username, password });
        console.log('[SUCCESS] Login SSH berhasil.');

        console.log('[INFO] Menjalankan perintah di VPS...');
        const result = await ssh.execCommand(command, { cwd: '/root' });

        // Tampilkan seluruh stdout untuk debugging
        console.log('[DEBUG] Output asli (STDOUT):\n', result.stdout || '[kosong]');
        console.log('[DEBUG] Output asli (STDERR):\n', result.stderr || '[kosong]');

        // Filter stdout dari "Installing cPanel licensing system ..." sampai akhir
        const marker = 'Installing cPanel licensing system ...';
        let filteredStdout = '';

        if (result.stdout && result.stdout.includes(marker)) {
            const startIndex = result.stdout.indexOf(marker);
            filteredStdout = result.stdout.slice(startIndex).trim();
        } else {
            filteredStdout = '[Tanda "Installing cPanel licensing system ..." tidak ditemukan dalam output.]';
        }

        return {
            status: true,
            creator: 'King Of Bear',
            result: {
            stdout: filteredStdout,
            stderr: result.stderr
            }
        };
    } catch (error) {
        console.log('[FAIL] Login SSH atau eksekusi gagal.');
        console.log('[ERROR]', error.message);
        return {
            status: false,
            message: 'Gagal login SSH atau menjalankan perintah.',
            error: error.message
        };
    } finally {
        console.log('[INFO] Menutup koneksi SSH...');
        ssh.dispose();
        console.log('[INFO] Selesai.');
        console.log('==============================\n');
    }
}

module.exports = { runSSHCommand };
