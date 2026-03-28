// =============================================
// Phone/PC Sync System (No Server Required)
// Uses Base64 encoded JSON export/import + QR Code generation
// =============================================

// --- Global Scanner Variable ---
let qrScannerStream = null;

// --- Export ---
document.getElementById('export-btn').addEventListener('click', () => {
    try {
        const data = JSON.stringify(gameData);
        const encoded = btoa(unescape(encodeURIComponent(data)));
        navigator.clipboard.writeText(encoded).then(() => {
            alert('✅ تم نسخ كود الحفظ إلى الحافظة!\n\nالصقه في جهازك الآخر لاستيراد بيانات اللعبة.');
        }).catch(() => {
            prompt('انسخ هذا الكود:', encoded);
        });
    } catch(e) {
        alert('❌ حدث خطأ في التصدير: ' + e.message);
    }
});

// --- Import ---
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-overlay').style.display = 'flex';
});
document.getElementById('close-import-btn').addEventListener('click', () => {
    document.getElementById('import-overlay').style.display = 'none';
    stopScanner();
});

// Confirm Import from Textarea
document.getElementById('confirm-import-btn').addEventListener('click', () => {
    const code = document.getElementById('import-textarea').value.trim();
    if (!code) { alert('الرجاء لصق كود الحفظ!'); return; }
    processImportCode(code);
});

function processImportCode(code) {
    try {
        const decoded = decodeURIComponent(escape(atob(code)));
        const importedData = JSON.parse(decoded);
        
        // Is it compact format (QR) or full format (Text)?
        if (importedData.c !== undefined) {
            // Compact
            if (!confirm('⚠️ تم العثور على بيانات من كود QR. هل تريد استبدال بياناتك الحالية؟')) return;
            restoreFromCompact(importedData);
        } else {
            // Full
            if (typeof importedData.cash !== 'number') {
                alert('❌ كود غير صالح!');
                return;
            }
            if (!confirm('⚠️ سيتم استبدال بيانات لعبتك الحالية. هل أنت متأكد؟')) return;
            
            // Merge logic
            gameData = { ...gameData, ...importedData };
        }
        
        // Ensure all critical fields exist after merge/restore
        ensureDataIntegrity();
        
        calculatePassiveIncome();
        saveGame();
        renderShops();
        updateUI();
        
        document.getElementById('import-overlay').style.display = 'none';
        stopScanner();
        alert('✅ تم استيراد البيانات بنجاح! مرحباً بعودتك.');
    } catch(e) {
        alert('❌ كود غير صالح! تأكد من نسخ الكود كاملاً.\n' + e.message);
    }
}

function ensureDataIntegrity() {
    if(!gameData.stocks) gameData.stocks = {};
    if(!gameData.realEstate) gameData.realEstate = {};
    if(gameData.land === undefined) gameData.land = 0;
    if(gameData.usedLand === undefined) gameData.usedLand = 0;
    if(!gameData.prestige) gameData.prestige = { points: 0, permanentMultiplier: 1.0 };
    if(!gameData.stats) gameData.stats = { minigamesPlayed: 0, maxCashReached: 0 };
    if(!gameData.achievements) gameData.achievements = [];
    
    businessItems.forEach(item => { if(gameData.businesses[item.id] === undefined) gameData.businesses[item.id] = 0; });
    luxuryItems.forEach(item => { if(gameData.luxuries[item.id] === undefined) gameData.luxuries[item.id] = false; });
    
    // Recalculate click power from luxuries
    let totalClickBoost = 1;
    luxuryItems.forEach(item => { if(gameData.luxuries[item.id]) totalClickBoost += item.clickBoost; });
    gameData.clickPower = totalClickBoost;
}

// --- QR Code Generation (using QRious library) ---

function getCompactSaveData() {
    const compact = {
        c: Math.floor(gameData.cash),
        cp: gameData.clickPower,
        tc: gameData.totalClicks,
        tp: gameData.timePlayed,
        b: {},
        l: {},
        s: {},
        re: gameData.realEstate || {},
        la: gameData.land || 0,
        ul: gameData.usedLand || 0,
        p: gameData.prestige,
        st: gameData.stats,
        a: gameData.achievements,
        lw: gameData.lastWheelSpin
    };
    Object.keys(gameData.businesses).forEach(k => { if (gameData.businesses[k] > 0) compact.b[k] = gameData.businesses[k]; });
    Object.keys(gameData.luxuries).forEach(k => { if (gameData.luxuries[k]) compact.l[k] = true; });
    Object.keys(gameData.stocks).forEach(k => { if (gameData.stocks[k].owned > 0) compact.s[k] = gameData.stocks[k].owned; });
    return compact;
}

function restoreFromCompact(compact) {
    if (compact.c !== undefined) gameData.cash = compact.c;
    if (compact.cp !== undefined) gameData.clickPower = compact.cp;
    if (compact.tc !== undefined) gameData.totalClicks = compact.tc;
    if (compact.tp !== undefined) gameData.timePlayed = compact.tp;
    if (compact.b) gameData.businesses = { ...gameData.businesses, ...compact.b };
    if (compact.l) gameData.luxuries = { ...gameData.luxuries, ...compact.l };
    if (compact.s) {
        Object.keys(compact.s).forEach(k => { if (gameData.stocks[k]) gameData.stocks[k].owned = compact.s[k]; });
    }
    if (compact.re) gameData.realEstate = compact.re;
    if (compact.la !== undefined) gameData.land = compact.la;
    if (compact.ul !== undefined) gameData.usedLand = compact.ul;
    if (compact.p) gameData.prestige = compact.p;
    if (compact.st) gameData.stats = compact.st;
    if (compact.a) gameData.achievements = compact.a;
    if (compact.lw) gameData.lastWheelSpin = compact.lw;
}

document.getElementById('qr-export-btn').addEventListener('click', () => {
    try {
        const compact = getCompactSaveData();
        const data = JSON.stringify(compact);
        const encoded = btoa(unescape(encodeURIComponent(data)));
        
        // QR version 40 at level H holds ~1273 bytes. 
        // QRious doesn't automatically switch versions well if overflowed.
        if (encoded.length > 1200) {
            alert('⚠️ بيانات اللعبة كبيرة جداً لـ QR Code (' + encoded.length + ' حرف).\nيرجى استخدام خيار "تصدير البيانات" العادي لنسخ الكود نصياً.');
            return;
        }
        
        const canvas = document.getElementById('qr-canvas');
        const qr = new QRious({
            element: canvas,
            value: encoded,
            size: 300, // Increased size for better readability
            level: 'H', // High error correction
            background: '#ffffff',
            foreground: '#000000',
            padding: 15
        });
        
        // Wait for next tick to ensure QR is fully rendered on canvas
        setTimeout(() => {
            const ctx = canvas.getContext('2d');
            const size = canvas.width;
            const center = size / 2;
            const logoBoxSize = 60; // Size of the white box behind emoji
            const emojiSize = 40;
            
            // 1. Draw a clean white square in the center (Quiet Zone)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(center - logoBoxSize/2, center - logoBoxSize/2, logoBoxSize, logoBoxSize);
            
            // 2. Optional: Draw a subtle gold border around the logo box
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(center - logoBoxSize/2, center - logoBoxSize/2, logoBoxSize, logoBoxSize);
            
            // 3. Draw the Emoji
            ctx.font = `${emojiSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💰', center, center);
            
            console.log("QR with logo generated successfully");
        }, 100);

        document.getElementById('qr-overlay').style.display = 'flex';
    } catch(e) {
        alert('❌ خطأ في إنشاء QR Code: ' + e.message);
    }
});

document.getElementById('close-qr-btn').addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'none';
});

// --- Camera Scanner Logic ---

const startScanBtn = document.getElementById('start-scan-btn');
const stopScanBtn = document.getElementById('stop-scan-btn');
const scannerContainer = document.getElementById('scanner-container');
const video = document.getElementById('scanner-video');
const scanCanvas = document.getElementById('scanner-canvas');

startScanBtn.addEventListener('click', startScanner);
stopScanBtn.addEventListener('click', stopScanner);

function startScanner() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('❌ متصفحك لا يدعم الوصول للكاميرا.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
            qrScannerStream = stream;
            video.srcObject = stream;
            video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            video.play();
            
            startScanBtn.style.display = 'none';
            stopScanBtn.style.display = 'block';
            scannerContainer.style.display = 'block';
            
            requestAnimationFrame(tick);
        })
        .catch(function(err) {
            alert('❌ فشل الوصول للكاميرا: ' + err.message);
        });
}

function stopScanner() {
    if (qrScannerStream) {
        qrScannerStream.getTracks().forEach(track => track.stop());
        qrScannerStream = null;
    }
    if (video) video.srcObject = null;
    
    startScanBtn.style.display = 'block';
    stopScanBtn.style.display = 'none';
    scannerContainer.style.display = 'none';
}

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && qrScannerStream) {
        scanCanvas.height = video.videoHeight;
        scanCanvas.width = video.videoWidth;
        const ctx = scanCanvas.getContext("2d");
        ctx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height);
        const imageData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            console.log("QR Found", code.data);
            processImportCode(code.data);
            return; // processImportCode handles stopping scanner
        }
    }
    if (qrScannerStream) {
        requestAnimationFrame(tick);
    }
}

// =============================================
// Initialize Game
// =============================================
loadGame();

