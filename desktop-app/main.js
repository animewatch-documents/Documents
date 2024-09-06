const { app, BrowserWindow } = require('electron');
const path = require('path');
const RPC = require('discord-rpc');
const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');

const allowedDomains = [
    'https://www.animeizlesene.com',
    'https://animeizlesene.com'
];

const clientId = '1280327744512589937'; // Discord uygulamanızın client ID'sini buraya ekleyin

// GitHub'dan `main.js` dosyasını çekmek için kullanılan URL
const GITHUB_FILE_URL = 'https://raw.githubusercontent.com/animewatch-documents/Documents/main/desktop-app/main.js';
const LOCAL_FILE_PATH = path.join(__dirname, 'main.js');
const CHECK_INTERVAL = 60000; // 1 dakika

// Discord RPC istemcisini başlatma
RPC.register(clientId);
const rpc = new RPC.Client({ transport: 'ipc' });

// RPC aktivitelerini güncelleme
function updateRPC(title) {
    rpc.setActivity({
        details: 'Desktop-App', // Oynatıcı detay metni
        state: title, // Sayfanın başlığını burada göster
        startTimestamp: new Date(),
        largeImageKey: 'logo', // Büyük resim anahtarı (Discord'da bu görseli yüklemeniz gerekir)
        largeImageText: 'AnimeWatch Logo',
        smallImageKey: 'animewatch', // Küçük resim anahtarı (isteğe bağlı)
        smallImageText: 'Uygulama aktif',
        type: 3 // 'WATCHING' türünü belirtmek için type'ı 3 olarak ayarlıyoruz
    });
}

// Dosyayı GitHub'dan çekme ve güncelleme
async function updateMainJS() {
    try {
        const response = await fetch(GITHUB_FILE_URL);
        if (response.ok) {
            const newFileContent = await response.text();
            fs.writeFileSync(LOCAL_FILE_PATH, newFileContent, 'utf8');
            console.log('main.js güncellendi.');

            // Uygulama yeniden başlatılabilir
            exec('npm start', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Hata: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return;
                }
                console.log(`Stdout: ${stdout}`);
            });
        } else {
            console.error('Dosya çekilemedi:', response.statusText);
        }
    } catch (error) {
        console.error('Güncelleme hatası:', error);
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'default',
        maximizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            sandbox: true
        }
    });

    win.maximize();
    win.loadURL(allowedDomains[0]);

    // Sayfa başlığını güncelleme
    win.webContents.on('page-title-updated', (event, title) => {
        updateRPC(title); // Sayfa başlığını RPC'de güncelle
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isAllowedURL(url)) {
            return { action: 'allow' };
        } else {
            return { action: 'deny' };
        }
    });

    win.webContents.on('new-window', (event, url) => {
        if (!isAllowedURL(url)) {
            event.preventDefault();
        }
    });

    win.webContents.on('will-navigate', (event, url) => {
        if (!isAllowedURL(url)) {
            event.preventDefault();
        }
    });

    win.webContents.on('will-redirect', (event, url) => {
        if (!isAllowedURL(url)) {
            event.preventDefault();
        }
    });
}

function isAllowedURL(url) {
    return allowedDomains.some(domain => url.startsWith(domain));
}

app.whenReady().then(() => {
    createWindow();
    rpc.login({ clientId }).catch(console.error);
    setInterval(updateMainJS, CHECK_INTERVAL); // Belirli aralıklarla güncellemeyi kontrol et
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
