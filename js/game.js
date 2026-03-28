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
    managers: {},
    upgrades: {},
    luxuries: {},
    stocks: {
        tech: { price: 150, owned: 0, trend: 0, name: 'TechCorp 💻', history: [] },
        oil: { price: 80, owned: 0, trend: 0, name: 'OilGroup 🛢️', history: [] },
        gold: { price: 200, owned: 0, trend: 0, name: 'GoldInc 🪙', history: [] },
        crypto: { price: 500, owned: 0, trend: 0, name: 'BitVault ₿', history: [] },
        bank: { price: 120, owned: 0, trend: 0, name: 'MegaBank 🏦', history: [] },
        pharma: { price: 300, owned: 0, trend: 0, name: 'PharmaCo 💊', history: [] },
        realestate: { price: 400, owned: 0, trend: 0, name: 'LandKing 🏘️', history: [] },
        gaming: { price: 250, owned: 0, trend: 0, name: 'GameDev 🎮', history: [] },
        ai: { price: 600, owned: 0, trend: 0, name: 'DeepAI 🤖', history: [] },
        energy: { price: 180, owned: 0, trend: 0, name: 'GreenPow ⚡', history: [] }
    },
    selectedStockId: 'tech',
    meetings: {
        completed: {},
        lastReset: Date.now()
    },
    realEstate: {}, // count of each property
    land: 0, // total land sqm owned
    usedLand: 0, // land sqm used for properties
    prestige: { points: 0, permanentMultiplier: 1.0 },
    stats: { minigamesPlayed: 0, maxCashReached: 0 },
    achievements: [],
    lastWheelSpin: 0,
    lastQuestDate: '',
    quests: [],
    lastSaveTime: Date.now()
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

const managersList = [
    { targetId: 'b1', name: 'جيمي', desc: 'يدير كشك الليموناضة', cost: 1000 },
    { targetId: 'b2', name: 'كارلوس', desc: 'يدير عربة التاكو', cost: 5000 },
    { targetId: 'b3', name: 'ماريا', desc: 'تدير المقهى', cost: 50000 },
    { targetId: 'b4', name: 'سام', desc: 'يدير مغسلة السيارات', cost: 500000 },
    { targetId: 'b5', name: 'الشيف غوردون', desc: 'يدير المطعم الفاخر', cost: 5000000 },
    { targetId: 'b6', name: 'السيد عقاري', desc: 'يدير العمارة السكنية', cost: 50000000 },
    { targetId: 'b7', name: 'بيل غيتور', desc: 'يدير شركة البرمجيات', cost: 500000000 },
    { targetId: 'b8', name: 'جولدن فينجر', desc: 'يدير منجم الذهب', cost: 5000000000 },
    { targetId: 'b9', name: 'كابتن كيرك', desc: 'يدير وكالة الفضاء', cost: 50000000000 },
    { targetId: 'b10', name: 'روبنسون', desc: 'يدير الجزيرة', cost: 5e11 },
    { targetId: 'b11', name: 'إيلون تويت', desc: 'يدير الأقمار الصناعية', cost: 5e12 },
    { targetId: 'b12', name: 'ماركوس', desc: 'يدير مستعمرة المريخ', cost: 5e13 },
    { targetId: 'b13', name: 'دوك براون', desc: 'يقود آلة الزمن', cost: 5e14 },
    { targetId: 'b14', name: 'عالم مجنون', desc: 'يدير المادة المظلمة', cost: 5e15 },
    { targetId: 'b15', name: 'دارث', desc: 'يحكم إمبراطورية المجرة', cost: 5e16 }
];

const upgradesList = [
    { targetId: 'b1', id: 'upg_b1', name: 'ليمون ذهبي', desc: 'يضاعف أرباح الليموناضة x2', cost: 2500 },
    { targetId: 'b2', id: 'upg_b2', name: 'صلصة حارة سرية', desc: 'يضاعف أرباح التاكو x2', cost: 15000 },
    { targetId: 'b3', id: 'upg_b3', name: 'حبوب بن سحرية', desc: 'يضاعف أرباح المقهى x2', cost: 150000 },
    { targetId: 'b4', id: 'upg_b4', name: 'رغوة نانو تكنولوجي', desc: 'يضاعف أرباح المغسلة x2', cost: 1500000 },
    { targetId: 'b5', id: 'upg_b5', name: 'نجمة ميشلان 3', desc: 'يضاعف أرباح المطعم x2', cost: 15000000 },
    { targetId: 'b6', id: 'upg_b6', name: 'مصاعد كريستال', desc: 'يضاعف إيجارات العمارة x2', cost: 150000000 },
    { targetId: 'b7', id: 'upg_b7', name: 'الذكاء العشوائي', desc: 'يضاعف أرباح البرمجيات x2', cost: 1.5e9 },
    { targetId: 'b8', id: 'upg_b8', name: 'طبقة ماسية', desc: 'يضاعف إنتاج الذهب x2', cost: 1.5e10 },
    { targetId: 'b9', id: 'upg_b9', name: 'محركات ضوء', desc: 'يضاعف أرباح الفضاء x2', cost: 1.5e11 },
    { targetId: 'b10', id: 'upg_b10', name: 'خدمة 10 نجوم', desc: 'يضاعف أرباح الجزيرة x2', cost: 1.5e12 },
    { targetId: 'b11', id: 'upg_b11', name: 'تغطية 10G', desc: 'يضاعف أرباح الأقمار x2', cost: 1.5e13 },
    { targetId: 'b12', id: 'upg_b12', name: 'هواء مضغوط مجاني', desc: 'يضاعف أرباح المريخ x2', cost: 1.5e14 },
    { targetId: 'b13', id: 'upg_b13', name: 'مكثف التدفق', desc: 'يضاعف أرباح الزمن x2', cost: 1.5e15 },
    { targetId: 'b14', id: 'upg_b14', name: 'ثقب دودي', desc: 'يضاعف طاقة المادة المظلمة x2', cost: 1.5e16 },
    { targetId: 'b15', id: 'upg_b15', name: 'تحكم عقلي شامل', desc: 'يضاعف دخل الإمبراطورية x2', cost: 1.5e17 }
];

const realEstateItems = [
    { id: 'land_sm', name: 'أرض صغيرة', desc: 'مساحة 100م² صالحة للبناء', icon: '🌱', cost: 100000, type: 'land', size: 100 },
    { id: 'land_md', name: 'أرض متوسطة', desc: 'مساحة 500م² للعمارات', icon: '📍', cost: 450000, type: 'land', size: 500 },
    { id: 'land_lg', name: 'أرض كبيرة', desc: 'مساحة 2000م² للمشاريع', icon: '🗺️', cost: 1800000, type: 'land', size: 2000 },
    { id: 'prop_villa', name: 'فيلا فاخرة', desc: 'تطلب 100م² أرض', icon: '🏡', cost: 750000, type: 'property', landRequired: 100, income: 4500 },
    { id: 'prop_apt', name: 'عمارة سكنية', desc: 'تطلب 500م² أرض', icon: '🏢', cost: 3800000, type: 'property', landRequired: 500, income: 28000 },
    { id: 'prop_mall', name: 'مول تجاري', desc: 'يتطلب 2000م² أرض', icon: '🛍️', cost: 22000000, type: 'property', landRequired: 2000, income: 190000 },
    { id: 'prop_sky', name: 'ناطحة سحاب', desc: 'تتطلب 5000م² أرض', icon: '🏙️', cost: 180000000, type: 'property', landRequired: 5000, income: 1600000 }
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
// Daily Quests System
// =============================================
const QUEST_TYPES = [
    { id: 'click', desc: 'اضغط {target} مرة', targetBase: 100, rewardBase: 50 },
    { id: 'minigame', desc: 'العب {target} ألعاب مصغرة', targetBase: 5, rewardBase: 200 },
    { id: 'buy_biz', desc: 'اشترِ {target} مشاريع', targetBase: 10, rewardBase: 100 },
];

function checkDailyQuests() {
    const today = new Date().toDateString(); // e.g., "Thu Mar 26 2026"
    if (gameData.lastQuestDate !== today) {
        // Generate new quests for today
        gameData.lastQuestDate = today;
        gameData.quests = [];
        
        // Pick 3 random quests
        const shuffled = [...QUEST_TYPES].sort(() => 0.5 - Math.random());
        for (let i = 0; i < 3; i++) {
            const template = shuffled[i % shuffled.length];
            const difficultyMult = 1 + Math.floor(Math.random() * 3); // 1 to 3
            
            gameData.quests.push({
                id: template.id,
                desc: template.desc.replace('{target}', template.targetBase * difficultyMult),
                target: template.targetBase * difficultyMult,
                progress: 0,
                reward: template.rewardBase * difficultyMult * Math.max(1, gameData.passiveIncome * 10),
                completed: false,
                claimed: false
            });
        }
        saveGame();
    }
    renderQuests();
    updateQuestTimer();
}

function updateQuestProgress(type, amount = 1) {
    if(!gameData.quests) return;
    let updated = false;
    gameData.quests.forEach(q => {
        if (q.id === type && !q.completed) {
            q.progress += amount;
            if (q.progress >= q.target) {
                q.progress = q.target;
                q.completed = true;
                // Visual notification
                const banner = document.createElement('div');
                banner.style.cssText = `position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#1a1a2e;border:2px solid var(--green-money);color:white;padding:10px 20px;border-radius:8px;z-index:9999;animation:fadeInDown 0.5s ease;`;
                banner.innerHTML = `✅ <b>اكتملت المهمة!</b><br>${q.desc}`;
                document.body.appendChild(banner);
                setTimeout(() => banner.remove(), 4000);
            }
            updated = true;
        }
    });
    if (updated) {
        renderQuests();
        saveGame();
    }
}

window.claimQuestReward = function(index) {
    const q = gameData.quests[index];
    if (q && q.completed && !q.claimed) {
        q.claimed = true;
        gameData.cash += q.reward;
        updateUI();
        renderQuests();
        saveGame();
        createClickParticle(window.innerWidth / 2, window.innerHeight / 2, `+${formatMoney(q.reward)}$`);
    }
};

function renderQuests() {
    const list = document.getElementById('quests-list');
    if (!list || !gameData.quests) return;
    list.innerHTML = '';
    
    gameData.quests.forEach((q, idx) => {
        let statusHtml = '';
        if (q.claimed) {
            statusHtml = `<span style="color:var(--text-secondary); font-size:0.85rem;">تم الاستلام ✅</span>`;
        } else if (q.completed) {
            statusHtml = `<button onclick="claimQuestReward(${idx})" style="background:var(--green-money); color:white; border:none; padding:4px 10px; border-radius:4px; font-weight:bold; cursor:pointer;">استلام +${formatMoney(q.reward)}$</button>`;
        } else {
            const percent = Math.floor((q.progress / q.target) * 100);
            statusHtml = `
                <div style="width:100px; background:rgba(0,0,0,0.5); height:10px; border-radius:5px; overflow:hidden; border:1px solid #333;">
                    <div style="width:${percent}%; background:var(--gold); height:100%;"></div>
                </div>
                <span style="font-size:0.75rem; color:var(--text-secondary);">${q.progress}/${q.target}</span>
            `;
        }
        
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; border-right:3px solid ${q.completed ? 'var(--green-money)' : 'var(--gold)'};">
                <span style="font-size:0.9rem; color:white;">${q.desc}</span>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                    ${statusHtml}
                </div>
            </div>
        `;
    });
}

function updateQuestTimer() {
    const timerEl = document.getElementById('quests-timer');
    if (!timerEl) return;
    setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diff = tomorrow - now;
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        timerEl.innerText = `التحديث: ${h}:${m}:${s}`;
        
        // Auto refresh quests at midnight
        if (h === '00' && m === '00' && s === '00') {
            setTimeout(checkDailyQuests, 2000);
        }
    }, 1000);
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
        if(!gameData.stocks) gameData.stocks = defaultStocks;
        else {
            Object.keys(defaultStocks).forEach(k => {
                if(!gameData.stocks[k]) gameData.stocks[k] = defaultStocks[k];
                if(!gameData.stocks[k].history) gameData.stocks[k].history = [];
            });
        }
        if(!gameData.selectedStockId) gameData.selectedStockId = 'tech';
        if(!gameData.meetings) gameData.meetings = { completed: {}, lastReset: Date.now() };
        if(!gameData.prestige) gameData.prestige = { points: 0, permanentMultiplier: 1.0 };
        if(!gameData.stats) gameData.stats = { minigamesPlayed: 0, maxCashReached: 0 };
        if(!gameData.achievements) gameData.achievements = [];
        if(!gameData.lastWheelSpin) gameData.lastWheelSpin = 0;
        if(!gameData.lastQuestDate) gameData.lastQuestDate = '';
        if(!gameData.quests) gameData.quests = [];
        // Ensure new businesses/luxuries/managers/upgrades
        businessItems.forEach(item => { if(gameData.businesses[item.id] === undefined) gameData.businesses[item.id] = 0; });
        luxuryItems.forEach(item => { if(gameData.luxuries[item.id] === undefined) gameData.luxuries[item.id] = false; });
        if(!gameData.realEstate) gameData.realEstate = {};
        if(gameData.land === undefined) gameData.land = 0;
        if(gameData.usedLand === undefined) gameData.usedLand = 0;
        if(!gameData.lastSaveTime) gameData.lastSaveTime = Date.now();
        
        // Calculate Offline Progress
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - gameData.lastSaveTime) / 1000);
        
        // Max offline time 24 hours (86400 seconds)
        const effectiveSeconds = Math.min(elapsedSeconds, 86400); 
        
        if (effectiveSeconds > 60) {
            // Need to calculate current passive income temporarily
            const currentIncome = calculatePassiveIncome();
            if (currentIncome > 0) {
                // Offline efficiency is 25% of active income
                const offlineEarnings = Math.floor(currentIncome * effectiveSeconds * 0.25);
                gameData.cash += offlineEarnings;
                
                // Show offline earnings notification after short delay
                setTimeout(() => {
                    const banner = document.createElement('div');
                    banner.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:linear-gradient(135deg,rgba(15,15,25,0.95),rgba(10,10,20,0.95));border:2px solid var(--gold);color:white;padding:25px;border-radius:12px;z-index:10000;text-align:center;animation:zoomIn 0.4s ease;box-shadow:0 0 40px rgba(255,215,0,0.5);width:90%;max-width:350px;`;
                    banner.innerHTML = `
                        <h2 style="color:var(--gold);margin-bottom:15px;font-size:1.5rem;">🌙 أرباحك أثناء غيابك</h2>
                        <p style="margin-bottom:10px;color:var(--text-secondary);">لقد كنت غائباً لمدة <b style="color:white;">${Math.floor(effectiveSeconds / 60)} دقيقة</b></p>
                        <p style="font-size:1.2rem;color:var(--green-money);font-weight:bold;margin-bottom:20px;">+${formatMoney(offlineEarnings)}$</p>
                        <button onclick="this.parentElement.remove()" class="main-action-btn" style="width:100%;justify-content:center;"><span class="btn-text"><span class="title">استلام</span></span></button>
                    `;
                    document.body.appendChild(banner);
                    createClickParticle(window.innerWidth / 2, window.innerHeight / 2, `+${formatMoney(offlineEarnings)}$`);
                }, 1000);
            }
        }
    }
    
    // Update last save time for the first time
    gameData.lastSaveTime = Date.now();
    
    updateUI();
    renderShops();
}

function saveGame() {
    gameData.lastSaveTime = Date.now();
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
    updateQuestProgress('click', 1);
    createClickParticle(e.clientX, e.clientY, `+${formatMoney(power)}$`);
    updateUI();
    if(typeof playSound === 'function') playSound('click');
});

function manualCollect(businessId) {
    const item = businessItems.find(b => b.id === businessId);
    const count = gameData.businesses[businessId] || 0;
    if (count > 0 && !gameData.managers[businessId]) {
        let currentIncome = count * item.baseIncome;
        if (gameData.upgrades[`upg_${businessId}`]) currentIncome *= 2;
        
        let finalMult = gameData.prestige ? gameData.prestige.permanentMultiplier : 1.0;
        if (activeBooster.active) finalMult *= activeBooster.multiplier;
        
        const earned = currentIncome * finalMult;
        gameData.cash += earned;
        
        // Visual feedback
        const card = document.getElementById(`card-${businessId}`);
        if (card) {
            const rect = card.getBoundingClientRect();
            createClickParticle(rect.left + rect.width / 2, rect.top, `+${formatMoney(earned)}$`);
        }
        
        updateUI();
        if(typeof playSound === 'function') playSound('coin');
    }
}

function getBusinessCost(item) {
    const count = gameData.businesses[item.id] || 0;
    return Math.floor(item.baseCost * Math.pow(item.multiplier, count));
}

function calculatePassiveIncome() {
    let income = 0;
    // Businesses
    businessItems.forEach(item => {
        const count = gameData.businesses[item.id] || 0;
        if (count > 0 && gameData.managers[item.id]) {
            let baseInc = count * item.baseIncome;
            if (gameData.upgrades[`upg_${item.id}`]) baseInc *= 2;
            income += baseInc;
        }
    });
    // Real Estate
    realEstateItems.forEach(item => {
        if (item.type === 'property') {
            const count = gameData.realEstate[item.id] || 0;
            if (count > 0) {
                income += count * item.income;
            }
        }
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

// Initialize Quests on load
setTimeout(checkDailyQuests, 500);

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
        const hasManager = gameData.managers[item.id];
        const hasUpgrade = gameData.upgrades[`upg_${item.id}`];
        let currentIncome = item.baseIncome * (hasUpgrade ? 2 : 1);
        
        const div = document.createElement('div');
        div.className = `item-card ${gameData.cash < cost ? 'disabled' : ''}`;
        div.id = `card-${item.id}`;
        
        // Manual collect button for businesses without managers
        let manualCollectBtn = '';
        if (count > 0 && !hasManager) {
            manualCollectBtn = `<button class="buy-btn" onclick="manualCollect('${item.id}')" style="background:var(--green-money);margin-top:5px;font-size:0.8rem;">تحصيل الدخل 💰</button>`;
        } else if (hasManager) {
            manualCollectBtn = `<div style="color:var(--gold);font-size:0.8rem;margin-top:5px;">تلقائي ⚙️</div>`;
        }

        div.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name} <span class="item-count">x${count}</span></div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-income">+${formatMoney(currentIncome)} $/ث ${count > 0 && !hasManager ? '<br><small style="color:var(--text-secondary)">(عيّن مدير للتحصيل التلقائي)</small>' : ''}</div>
                ${manualCollectBtn}
            </div>
            <div class="item-action" style="flex-direction:column;gap:5px;">
                <button class="buy-btn" onclick="buyBusiness('${item.id}')" style="font-size:0.9rem;padding:5px 10px;">${formatMoney(cost)}$</button>
            </div>`;
        bList.appendChild(div);
    });
    
    // Managers
    const mList = document.getElementById('managers-list');
    if (mList) {
        mList.innerHTML = '';
        managersList.forEach(mgr => {
            const bItem = businessItems.find(b => b.id === mgr.targetId);
            const count = gameData.businesses[mgr.targetId] || 0;
            const isOwned = gameData.managers[mgr.targetId];
            const locked = count === 0; // Must own business first
            
            const div = document.createElement('div');
            div.className = `item-card ${isOwned || gameData.cash < mgr.cost || locked ? 'disabled' : ''}`;
            div.innerHTML = `
                <div class="item-icon">👔</div>
                <div class="item-info">
                    <div class="item-name">${mgr.name} ${isOwned ? '✅' : ''}</div>
                    <div class="item-desc">${mgr.desc}</div>
                    <div class="item-income" style="color:var(--text-secondary)">${locked && !isOwned ? 'يتطلب شراء المشروع أولاً' : 'تحصيل تلقائي'}</div>
                </div>
                <div class="item-action">
                    <button class="buy-btn" onclick="buyManager('${mgr.targetId}')" ${locked && !isOwned ? 'disabled' : ''}>${isOwned ? 'مُعيّن' : formatMoney(mgr.cost)+'$'}</button>
                </div>`;
            mList.appendChild(div);
        });
    }

    // Upgrades
    const uList = document.getElementById('upgrades-list');
    if (uList) {
        uList.innerHTML = '';
        upgradesList.forEach(upg => {
            const bItem = businessItems.find(b => b.id === upg.targetId);
            const count = gameData.businesses[upg.targetId] || 0;
            const isOwned = gameData.upgrades[upg.id];
            const locked = count === 0;
            
            const div = document.createElement('div');
            div.className = `item-card ${isOwned || gameData.cash < upg.cost || locked ? 'disabled' : ''}`;
            div.innerHTML = `
                <div class="item-icon">⬆️</div>
                <div class="item-info">
                    <div class="item-name">${upg.name} ${isOwned ? '✅' : ''}</div>
                    <div class="item-desc">${upg.desc}</div>
                    <div class="item-income" style="color:var(--text-secondary)">${bItem ? 'لـ ' + bItem.name : ''}</div>
                </div>
                <div class="item-action">
                    <button class="buy-btn" onclick="buyUpgrade('${upg.id}')" ${locked && !isOwned ? 'disabled' : ''}>${isOwned ? 'مملوك' : formatMoney(upg.cost)+'$'}</button>
                </div>`;
            uList.appendChild(div);
        });
    }

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
        updateQuestProgress('buy_biz', 1);
        calculatePassiveIncome();
        renderShops();
        updateUI();
        if(typeof playSound === 'function') playSound('buy');
    }
};

window.buyManager = function(targetId) {
    const mgr = managersList.find(m => m.targetId === targetId);
    if (gameData.cash >= mgr.cost && !gameData.managers[targetId] && gameData.businesses[targetId] > 0) {
        gameData.cash -= mgr.cost;
        gameData.managers[targetId] = true;
        calculatePassiveIncome();
        renderShops();
        updateUI();
    }
};

window.buyUpgrade = function(upgradeId) {
    const upg = upgradesList.find(u => u.id === upgradeId);
    if (gameData.cash >= upg.cost && !gameData.upgrades[upgradeId] && gameData.businesses[upg.targetId] > 0) {
        gameData.cash -= upg.cost;
        gameData.upgrades[upgradeId] = true;
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

window.buyRealEstate = function(id) {
    const item = realEstateItems.find(r => r.id === id);
    if (!item) return;
    
    if (item.type === 'land') {
        if (gameData.cash >= item.cost) {
            gameData.cash -= item.cost;
            gameData.land += item.size;
            updateUI();
            renderShops(); // This will trigger real estate render too
        }
    } else {
        // Property
        const availableLand = gameData.land - gameData.usedLand;
        if (gameData.cash >= item.cost && availableLand >= item.landRequired) {
            gameData.cash -= item.cost;
            gameData.usedLand += item.landRequired;
            gameData.realEstate[id] = (gameData.realEstate[id] || 0) + 1;
            calculatePassiveIncome();
            updateUI();
            renderShops();
        } else if (availableLand < item.landRequired) {
            alert('❌ لا تمتلك مساحة أرض كافية لهذا العقار! اشترِ أرضاً أولاً.');
        }
    }
};

window.sellRealEstate = function(id) {
    const item = realEstateItems.find(r => r.id === id);
    if (!item || item.type === 'land') return; // Can't sell land for now to keep it simple
    
    const count = gameData.realEstate[id] || 0;
    if (count > 0) {
        if (!confirm(`هل أنت متأكد من بيع ${item.name} مقابل ${formatMoney(item.cost * 0.7)}$؟`)) return;
        gameData.cash += item.cost * 0.7; // Sell at 70% price
        gameData.usedLand -= item.landRequired;
        gameData.realEstate[id]--;
        calculatePassiveIncome();
        updateUI();
        renderShops();
    }
};
