// =============================================
// محرك لعبة محاكي الملياردير | Core Engine
// =============================================

let gameData = {
    cash: 0,
    clickPower: 1,
    passiveIncome: 0,
    totalClicks: 0,
    timePlayed: 0,
    businesses: {},
    luxuries: {},
    stocks: {
        tech: { price: 150, owned: 0, trend: 0, name: 'TechCorp 💻' },
        oil: { price: 80, owned: 0, trend: 0, name: 'OilGroup 🛢️' },
        gold: { price: 200, owned: 0, trend: 0, name: 'GoldInc 🪙' },
        crypto: { price: 500, owned: 0, trend: 0, name: 'BitVault ₿' },
        bank: { price: 120, owned: 0, trend: 0, name: 'MegaBank 🏦' },
        pharma: { price: 300, owned: 0, trend: 0, name: 'PharmaCo 💊' },
        realestate: { price: 400, owned: 0, trend: 0, name: 'LandKing 🏘️' },
        gaming: { price: 250, owned: 0, trend: 0, name: 'GameDev 🎮' },
        ai: { price: 600, owned: 0, trend: 0, name: 'DeepAI 🤖' },
        energy: { price: 180, owned: 0, trend: 0, name: 'GreenPow ⚡' }
    },
    prestige: { points: 0, permanentMultiplier: 1.0 },
    stats: { minigamesPlayed: 0, maxCashReached: 0 },
    achievements: [],
    lastWheelSpin: 0
};

let activeBooster = { active: false, multiplier: 1, timeRemaining: 0 };

const businessItems = [
    { id: 'b1', name: 'كشك ليموناضة', desc: 'بداية بسيطة في الشارع', icon: '🍋', baseCost: 15, baseIncome: 1, multiplier: 1.15 },
    { id: 'b2', name: 'عربة تاكو', desc: 'طعام سريع للطبقة العاملة', icon: '🌮', baseCost: 100, baseIncome: 5, multiplier: 1.15 },
    { id: 'b3', name: 'مقهى صغير', desc: 'قهوة للموظفين', icon: '☕', baseCost: 1100, baseIncome: 50, multiplier: 1.15 },
    { id: 'b4', name: 'مغسلة سيارات', desc: 'دخل ثابت يومياً', icon: '🚙', baseCost: 12000, baseIncome: 400, multiplier: 1.15 },
    { id: 'b5', name: 'مطعم فاخر', desc: 'أكلات راقية لرجال الأعمال', icon: '🍽️', baseCost: 130000, baseIncome: 2000, multiplier: 1.15 },
    { id: 'b6', name: 'عمارة سكنية', desc: 'إيجارات شهرية مضمونة', icon: '🏢', baseCost: 1400000, baseIncome: 15000, multiplier: 1.15 },
    { id: 'b7', name: 'شركة برمجيات', desc: 'تطبيقات تدر الملايين', icon: '💻', baseCost: 20000000, baseIncome: 100000, multiplier: 1.15 },
    { id: 'b8', name: 'منجم ذهب', desc: 'ثروات لا تنضب', icon: '⛏️', baseCost: 330000000, baseIncome: 1000000, multiplier: 1.15 },
    { id: 'b9', name: 'وكالة فضاء', desc: 'رحلات تجارية للمريخ', icon: '🚀', baseCost: 5000000000, baseIncome: 15000000, multiplier: 1.15 },
    { id: 'b10', name: 'جزيرة خاصة', desc: 'جنتك الخاصة للإيجار', icon: '🏝️', baseCost: 50000000000, baseIncome: 100000000, multiplier: 1.15 },
    { id: 'b11', name: 'شبكة أقمار صناعية', desc: 'إنترنت فضائي عالمي', icon: '🛰️', baseCost: 500000000000, baseIncome: 800000000, multiplier: 1.15 },
    { id: 'b12', name: 'مستعمرة المريخ', desc: 'اقتصاد كوكب جديد', icon: '🪐', baseCost: 5000000000000, baseIncome: 5000000000, multiplier: 1.15 },
    { id: 'b13', name: 'آلة الزمن', desc: 'استثمر في الماضي والمستقبل', icon: '⏳', baseCost: 50000000000000, baseIncome: 40000000000, multiplier: 1.15 },
    { id: 'b14', name: 'مصنع المادة المظلمة', desc: 'طاقة لا نهائية', icon: '🌌', baseCost: 500000000000000, baseIncome: 300000000000, multiplier: 1.15 },
    { id: 'b15', name: 'إمبراطورية المجرة', desc: 'حاكم الكون بالكامل', icon: '👑', baseCost: 5e15, baseIncome: 2e12, multiplier: 1.15 }
];

const luxuryItems = [
    { id: 'l1', name: 'بدلة رسمية', desc: '+2 للضغطة', icon: '👔', cost: 500, clickBoost: 2 },
    { id: 'l2', name: 'ساعة رولكس', desc: '+10 للضغطة', icon: '⌚', cost: 5000, clickBoost: 10 },
    { id: 'l3', name: 'سيارة مرسيدس', desc: '+50 للضغطة', icon: '🚙', cost: 150000, clickBoost: 50 },
    { id: 'l4', name: 'يخت فاخر', desc: '+500 للضغطة', icon: '🛥️', cost: 2000000, clickBoost: 500 },
    { id: 'l5', name: 'طائرة خاصة', desc: '+3,000 للضغطة', icon: '🛩️', cost: 50000000, clickBoost: 3000 },
    { id: 'l6', name: 'قصر ملكي', desc: '+15,000 للضغطة', icon: '🏰', cost: 500000000, clickBoost: 15000 },
    { id: 'l7', name: 'محطة فضائية', desc: '+80,000 للضغطة', icon: '🛸', cost: 10000000000, clickBoost: 80000 },
    { id: 'l8', name: 'كوكب خاص', desc: '+500,000 للضغطة', icon: '🌍', cost: 500000000000, clickBoost: 500000 }
];

// DOM Elements
const displayCash = document.getElementById('cash-amount');
const displayIncome = document.getElementById('income-per-second');
const displayRank = document.getElementById('player-rank');
const activeBoosterEl = document.getElementById('active-booster');
const workBtn = document.getElementById('work-btn');
const clickPowerText = document.getElementById('click-power-text');
const particlesContainer = document.getElementById('click-particles-container');
const statTotalClicks = document.getElementById('stat-total-clicks');
const statTimePlayed = document.getElementById('stat-time-played');
const resetBtn = document.getElementById('reset-game-btn');

// =============================================
// Utility Functions
// =============================================

function formatMoney(number) {
    if(number >= 1e15) return (number / 1e15).toFixed(2) + ' كوادريليون';
    if(number >= 1e12) return (number / 1e12).toFixed(2) + ' تريليون';
    if(number >= 1e9) return (number / 1e9).toFixed(2) + ' مليار';
    if(number >= 1e6) return (number / 1e6).toFixed(2) + ' مليون';
    return Math.floor(number).toLocaleString('en-US');
}

function createClickParticle(x, y, text) {
    const particle = document.createElement('div');
    particle.classList.add('click-particle');
    particle.innerText = text;
    particle.style.left = `${x - 20 + Math.random() * 40}px`;
    particle.style.top = `${y - 20 + Math.random() * 40}px`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function activateBooster(multiplier, durationSeconds) {
    activeBooster.active = true;
    activeBooster.multiplier = multiplier;
    activeBooster.timeRemaining = durationSeconds;
    activeBoosterEl.style.display = 'inline';
    activeBoosterEl.innerText = `⚡ x${multiplier} مسرّع (${durationSeconds}s)`;
    updateUI();
}

// =============================================
// Save / Load
// =============================================

function loadGame() {
    businessItems.forEach(item => { if(gameData.businesses[item.id] === undefined) gameData.businesses[item.id] = 0; });
    luxuryItems.forEach(item => { if(gameData.luxuries[item.id] === undefined) gameData.luxuries[item.id] = false; });
    
    const savedGame = localStorage.getItem('billionaireSave');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        // Deep merge stocks
        const defaultStocks = JSON.parse(JSON.stringify(gameData.stocks));
        gameData = { ...gameData, ...parsed };
        if(parsed.stocks) {
            Object.keys(defaultStocks).forEach(k => {
                if(!gameData.stocks[k]) gameData.stocks[k] = defaultStocks[k];
            });
        } else {
            gameData.stocks = defaultStocks;
        }
        if(!gameData.prestige) gameData.prestige = { points: 0, permanentMultiplier: 1.0 };
        if(!gameData.stats) gameData.stats = { minigamesPlayed: 0, maxCashReached: 0 };
        if(!gameData.achievements) gameData.achievements = [];
        if(!gameData.lastWheelSpin) gameData.lastWheelSpin = 0;
        // Ensure new businesses/luxuries
        businessItems.forEach(item => { if(gameData.businesses[item.id] === undefined) gameData.businesses[item.id] = 0; });
        luxuryItems.forEach(item => { if(gameData.luxuries[item.id] === undefined) gameData.luxuries[item.id] = false; });
    }
    
    updateUI();
    renderShops();
}

function saveGame() {
    localStorage.setItem('billionaireSave', JSON.stringify(gameData));
}

// =============================================
// Core Logic
// =============================================

workBtn.addEventListener('click', (e) => {
    let finalMult = gameData.prestige ? gameData.prestige.permanentMultiplier : 1.0;
    const power = gameData.clickPower * finalMult * (activeBooster.active ? activeBooster.multiplier : 1);
    gameData.cash += power;
    gameData.totalClicks++;
    createClickParticle(e.clientX, e.clientY, `+${formatMoney(power)}$`);
    updateUI();
});

function getBusinessCost(item) {
    const count = gameData.businesses[item.id] || 0;
    return Math.floor(item.baseCost * Math.pow(item.multiplier, count));
}

function calculatePassiveIncome() {
    let income = 0;
    businessItems.forEach(item => {
        income += (gameData.businesses[item.id] || 0) * item.baseIncome;
    });
    let finalMult = gameData.prestige ? gameData.prestige.permanentMultiplier : 1.0;
    if (activeBooster.active) finalMult *= activeBooster.multiplier;
    income *= finalMult;
    gameData.passiveIncome = income;
    return income;
}

function calculateRank() {
    const w = gameData.cash;
    if(w > 1e15) return "إمبراطور الكون 🌌";
    if(w > 1e12) return "سيد المجرة 🛸";
    if(w > 1e9) return "ملياردير عالمي 👑";
    if(w > 1e6) return "مليونير صاعد 💎";
    if(w > 1e5) return "رجل أعمال ناجح 📈";
    if(w > 1e4) return "مدير أعمال 💼";
    return "مبتدئ في عالم الأعمال 🚶";
}

// Game Loop
setInterval(() => {
    gameData.timePlayed++;
    if (activeBooster.active) {
        activeBooster.timeRemaining--;
        activeBoosterEl.innerText = `⚡ x${activeBooster.multiplier} مسرّع (${activeBooster.timeRemaining}s)`;
        if (activeBooster.timeRemaining <= 0) {
            activeBooster.active = false;
            activeBoosterEl.style.display = 'none';
        }
    }
    const income = calculatePassiveIncome();
    gameData.cash += income;
    if(gameData.cash > gameData.stats.maxCashReached) gameData.stats.maxCashReached = gameData.cash;
    updateUI();
    saveGame();
}, 1000);

// =============================================
// UI Management
// =============================================

function updateUI() {
    displayCash.innerText = formatMoney(gameData.cash);
    displayIncome.innerText = formatMoney(gameData.passiveIncome);
    displayRank.innerText = calculateRank();
    const currentClickPower = gameData.clickPower * (activeBooster.active ? activeBooster.multiplier : 1);
    clickPowerText.innerText = `+${formatMoney(currentClickPower)} $ للضغطة`;
    statTotalClicks.innerText = gameData.totalClicks.toLocaleString();
    statTimePlayed.innerText = Math.floor(gameData.timePlayed / 60) + ' دقيقة';
    const ppEl = document.getElementById('stat-prestige-points');
    const pmEl = document.getElementById('stat-prestige-mult');
    if(ppEl) ppEl.innerText = gameData.prestige.points;
    if(pmEl) pmEl.innerText = 'x' + gameData.prestige.permanentMultiplier.toFixed(2);
    updateShopButtons();
    // Prestige button
    const prestigeBtn = document.getElementById('prestige-btn');
    if(prestigeBtn) {
        prestigeBtn.style.opacity = gameData.cash >= 1e9 ? '1' : '0.4';
    }
}

function renderShops() {
    // Businesses
    const bList = document.getElementById('business-list');
    bList.innerHTML = '';
    businessItems.forEach(item => {
        const cost = getBusinessCost(item);
        const count = gameData.businesses[item.id] || 0;
        const div = document.createElement('div');
        div.className = `item-card ${gameData.cash < cost ? 'disabled' : ''}`;
        div.id = `card-${item.id}`;
        div.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name} <span class="item-count">x${count}</span></div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-income">+${formatMoney(item.baseIncome)} $/ث</div>
            </div>
            <div class="item-action">
                <button class="buy-btn" onclick="buyBusiness('${item.id}')">${formatMoney(cost)}$</button>
            </div>`;
        bList.appendChild(div);
    });
    // Luxuries
    const lList = document.getElementById('luxury-list');
    lList.innerHTML = '';
    luxuryItems.forEach(item => {
        const isOwned = gameData.luxuries[item.id];
        const div = document.createElement('div');
        div.className = `item-card ${isOwned || gameData.cash < item.cost ? 'disabled' : ''}`;
        div.id = `card-${item.id}`;
        div.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name} ${isOwned ? '✅' : ''}</div>
                <div class="item-desc">${item.desc}</div>
            </div>
            <div class="item-action">
                <button class="buy-btn" onclick="buyLuxury('${item.id}')">${isOwned ? 'مملوك' : formatMoney(item.cost)+'$'}</button>
            </div>`;
        lList.appendChild(div);
    });
    renderStocks();
}

function updateShopButtons() {
    businessItems.forEach(item => {
        const cost = getBusinessCost(item);
        const card = document.getElementById(`card-${item.id}`);
        if(card) {
            const btn = card.querySelector('.buy-btn');
            const count = gameData.businesses[item.id] || 0;
            btn.innerText = formatMoney(cost) + '$';
            card.querySelector('.item-count').innerText = 'x' + count;
            card.classList.toggle('disabled', gameData.cash < cost);
        }
    });
    luxuryItems.forEach(item => {
        const isOwned = gameData.luxuries[item.id];
        const card = document.getElementById(`card-${item.id}`);
        if(card) card.classList.toggle('disabled', isOwned || gameData.cash < item.cost);
    });
    updateStockButtons();
}

window.buyBusiness = function(id) {
    const item = businessItems.find(b => b.id === id);
    const cost = getBusinessCost(item);
    if (gameData.cash >= cost) {
        gameData.cash -= cost;
        gameData.businesses[id]++;
        calculatePassiveIncome();
        renderShops();
        updateUI();
    }
};

window.buyLuxury = function(id) {
    const item = luxuryItems.find(l => l.id === id);
    if (gameData.cash >= item.cost && !gameData.luxuries[id]) {
        gameData.cash -= item.cost;
        gameData.luxuries[id] = true;
        gameData.clickPower += item.clickBoost;
        renderShops();
        updateUI();
    }
};
