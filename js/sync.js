// =============================================
// Phone/PC Sync System (No Server Required)
// Uses Base64 encoded JSON export/import + QR Code generation
// =============================================

// --- Export ---
document.getElementById('export-btn').addEventListener('click', () => {
    try {
        const data = JSON.stringify(gameData);
        const encoded = btoa(unescape(encodeURIComponent(data)));
        navigator.clipboard.writeText(encoded).then(() => {
            alert('✅ تم نسخ كود الحفظ إلى الحافظة!\n\nالصقه في جهازك الآخر لاستيراد بيانات اللعبة.');
        }).catch(() => {
            // Fallback for browsers that don't support clipboard API
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
});
document.getElementById('confirm-import-btn').addEventListener('click', () => {
    const code = document.getElementById('import-textarea').value.trim();
    if (!code) { alert('الرجاء لصق كود الحفظ!'); return; }
    try {
        const decoded = decodeURIComponent(escape(atob(code)));
        const importedData = JSON.parse(decoded);
        
        // Validate basic structure
        if (typeof importedData.cash !== 'number' || typeof importedData.clickPower !== 'number') {
            alert('❌ كود غير صالح!');
            return;
        }
        
        if (!confirm('⚠️ سيتم استبدال بيانات لعبتك الحالية. هل أنت متأكد؟')) return;
        
        // Merge imported data
        const defaultStocks = JSON.parse(JSON.stringify(gameData.stocks));
        gameData = { ...gameData, ...importedData };
        
        // Ensure all fields exist
        if(!gameData.stocks) gameData.stocks = defaultStocks;
        else {
            Object.keys(defaultStocks).forEach(k => {
                if(!gameData.stocks[k]) gameData.stocks[k] = defaultStocks[k];
            });
        }
        if(!gameData.prestige) gameData.prestige = { points: 0, permanentMultiplier: 1.0 };
        if(!gameData.stats) gameData.stats = { minigamesPlayed: 0, maxCashReached: 0 };
        if(!gameData.achievements) gameData.achievements = [];
        if(!gameData.lastWheelSpin) gameData.lastWheelSpin = 0;
        businessItems.forEach(item => { if(gameData.businesses[item.id] === undefined) gameData.businesses[item.id] = 0; });
        luxuryItems.forEach(item => { if(gameData.luxuries[item.id] === undefined) gameData.luxuries[item.id] = false; });
        
        // Recalculate click power from luxuries
        let totalClickBoost = 1;
        luxuryItems.forEach(item => { if(gameData.luxuries[item.id]) totalClickBoost += item.clickBoost; });
        gameData.clickPower = totalClickBoost;
        
        calculatePassiveIncome();
        saveGame();
        renderShops();
        updateUI();
        
        document.getElementById('import-overlay').style.display = 'none';
        alert('✅ تم استيراد البيانات بنجاح! مرحباً بعودتك.');
    } catch(e) {
        alert('❌ كود غير صالح! تأكد من نسخ الكود كاملاً.\n' + e.message);
    }
});

// --- QR Code Generation (using QRious library) ---

// Create a minimal version of game data for QR (strip defaults to reduce size)
function getCompactSaveData() {
    const compact = {
        c: Math.floor(gameData.cash),
        cp: gameData.clickPower,
        tc: gameData.totalClicks,
        tp: gameData.timePlayed,
        b: {},
        l: {},
        s: {},
        p: gameData.prestige,
        st: gameData.stats,
        a: gameData.achievements,
        lw: gameData.lastWheelSpin
    };
    // Only include non-zero businesses
    Object.keys(gameData.businesses).forEach(k => {
        if (gameData.businesses[k] > 0) compact.b[k] = gameData.businesses[k];
    });
    // Only include owned luxuries
    Object.keys(gameData.luxuries).forEach(k => {
        if (gameData.luxuries[k]) compact.l[k] = true;
    });
    // Only include stocks with owned > 0
    Object.keys(gameData.stocks).forEach(k => {
        if (gameData.stocks[k].owned > 0) compact.s[k] = gameData.stocks[k].owned;
    });
    return compact;
}

// Restore full game data from compact format
function restoreFromCompact(compact) {
    if (compact.c !== undefined) gameData.cash = compact.c;
    if (compact.cp !== undefined) gameData.clickPower = compact.cp;
    if (compact.tc !== undefined) gameData.totalClicks = compact.tc;
    if (compact.tp !== undefined) gameData.timePlayed = compact.tp;
    if (compact.b) {
        Object.keys(compact.b).forEach(k => gameData.businesses[k] = compact.b[k]);
    }
    if (compact.l) {
        Object.keys(compact.l).forEach(k => gameData.luxuries[k] = compact.l[k]);
    }
    if (compact.s) {
        Object.keys(compact.s).forEach(k => {
            if (gameData.stocks[k]) gameData.stocks[k].owned = compact.s[k];
        });
    }
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
        
        // QR code max capacity is ~4296 alphanumeric chars (version 40)
        // QRious handles up to ~2953 bytes at error correction level L
        if (encoded.length > 2500) {
            alert('⚠️ بيانات اللعبة كبيرة جداً لـ QR Code (' + encoded.length + ' حرف).\nاستخدم خيار "تصدير البيانات" بدلاً من ذلك لنسخ الكود يدوياً.');
            return;
        }
        
        // Generate real scannable QR code using QRious
        new QRious({
            element: document.getElementById('qr-canvas'),
            value: encoded,
            size: 250,
            level: 'L',
            background: '#ffffff',
            foreground: '#000000',
            padding: 10
        });
        
        document.getElementById('qr-overlay').style.display = 'flex';
    } catch(e) {
        alert('❌ خطأ في إنشاء QR Code: ' + e.message);
    }
});

document.getElementById('close-qr-btn').addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'none';
});

// =============================================
// Initialize Game
// =============================================
loadGame();
