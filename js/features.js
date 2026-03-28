// =============================================
// Stock Market, Navigation, Prestige, Achievements, Leaderboard
// =============================================

// --- Stocks ---
// --- Stocks Logic ---
function updateStockDashboard() {
    const sTab = document.getElementById('stocks-tab');
    if (sTab && sTab.classList.contains('active')) {
        renderStocksSidebar();
        renderStockChart(gameData.selectedStockId);
    }
}

window.buyStock = function(stockId) {
    const stock = gameData.stocks[stockId];
    if (gameData.cash >= stock.price) {
        gameData.cash -= stock.price;
        stock.owned++;
        updateUI();
        updateStockDashboard();
        if(typeof playSound === 'function') playSound('buy');
    }
};

window.sellStock = function(stockId) {
    const stock = gameData.stocks[stockId];
    if (stock.owned > 0) {
        stock.owned--;
        gameData.cash += stock.price;
        updateUI();
        updateStockDashboard();
        if(typeof playSound === 'function') playSound('coin');
    }
};

// SMA Toggle Listener
document.addEventListener('DOMContentLoaded', () => {
    const smaToggle = document.getElementById('toggle-sma');
    if(smaToggle) {
        smaToggle.addEventListener('change', () => {
            renderStockChart(gameData.selectedStockId);
        });
    }
});

let stockChartInstance = null;
function renderStockChart(stockId) {
    const ctx = document.getElementById('stock-chart');
    if (!ctx) return;
    const stock = gameData.stocks[stockId];
    const history = stock.history || [];
    const showSMA = document.getElementById('toggle-sma')?.checked || false;

    const labels = history.map((_, i) => i);
    const data = history.map(h => h);

    const datasets = [{
        label: stock.name.split(' ')[0],
        data: data,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0
    }];

    if(showSMA && data.length > 5) {
        const smaData = data.map((_, i, arr) => {
            if(i < 4) return null;
            const sub = arr.slice(i-4, i+1);
            return sub.reduce((a, b) => a + b, 0) / 5;
        });
        datasets.push({
            label: 'SMA (5)',
            data: smaData,
            borderColor: '#00bcd4',
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            pointRadius: 0
        });
    }

    if (stockChartInstance) {
        stockChartInstance.data.labels = labels;
        stockChartInstance.data.datasets = datasets;
        stockChartInstance.update('none');
    } else {
        stockChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { 
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                    }
                },
                animation: { duration: 0 }
            }
        });
    }
}

window.switchStock = function(stockId) {
    gameData.selectedStockId = stockId;
    renderStocksSidebar();
    updateUI();
    renderStockChart(stockId);
};

function renderStocksSidebar() {
    const list = document.getElementById('stocks-sidebar-list');
    if(!list) return;
    list.innerHTML = '';
    Object.keys(gameData.stocks).forEach(sid => {
        const s = gameData.stocks[sid];
        const active = gameData.selectedStockId === sid;
        const trendIcon = s.trend > 0 ? '▲' : '▼';
        const trendClass = s.trend > 0 ? 'trend-up' : 'trend-down';
        
        list.innerHTML += `
            <div class="sidebar-stock-item ${active ? 'active' : ''}" onclick="switchStock('${sid}')">
                <div class="ss-info">
                    <span class="ss-name">${s.name.split(' ')[0]}</span>
                    <span class="ss-price">${formatMoney(s.price)}$</span>
                </div>
                <div class="ss-trend ${trendClass}">${trendIcon}</div>
            </div>`;
    });
}

// Stock price updates
setInterval(() => {
    Object.keys(gameData.stocks).forEach(stockId => {
        const stock = gameData.stocks[stockId];
        const oldPrice = stock.price;
        const changePercent = (Math.random() * 0.20) - 0.10;
        let newPrice = stock.price + (stock.price * changePercent);
        if (newPrice < 10) newPrice = 10 + Math.random() * 20;
        stock.price = Math.floor(newPrice);
        stock.trend = stock.price - oldPrice;
        
        if(!stock.history) stock.history = [];
        stock.history.push(stock.price);
        if(stock.history.length > 30) stock.history.shift();
    });
    
    const stocksTab = document.getElementById('stocks-tab');
    if (stocksTab && stocksTab.classList.contains('active')) {
        renderStocksSidebar();
        renderStockChart(gameData.selectedStockId);
    }
}, 5000);

// --- Bottom Navigation ---
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.target);
        if(target) target.classList.add('active');
        // Trigger renders for specific tabs
        if(btn.dataset.target === 'achievements-tab') renderAchievements();
        if(btn.dataset.target === 'leaderboard-tab') renderLeaderboard();
        if(btn.dataset.target === 'stocks-tab') { renderStocksSidebar(); renderStockChart(gameData.selectedStockId); }
        if(btn.dataset.target === 'meetings-tab') renderMeetings();
    });
});

// --- Sub-Tabs Navigation (Businesses / Managers / Upgrades) ---
const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const subContents = document.querySelectorAll('.sub-content');

subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        subTabBtns.forEach(b => b.classList.remove('active'));
        subContents.forEach(c => c.style.display = 'none');
        btn.classList.add('active');
        const target = document.getElementById(`sub-${btn.dataset.sub}`);
        if(target) target.style.display = 'block';
    });
});

// --- Prestige ---
const PRESTIGE_THRESHOLD = 1_000_000_000;
document.getElementById('prestige-btn').addEventListener('click', () => {
    if (gameData.cash < PRESTIGE_THRESHOLD) {
        alert(`تحتاج إلى ${formatMoney(PRESTIGE_THRESHOLD)}$ لتفعيل خيار التقاعد!`);
        return;
    }
    if (!confirm('هل أنت متأكد؟\nثروتك ستتصفر، لكنك ستحصل على ⭐ نقطة تقاعد جديدة تمنحك +25% أرباحاً دائماً!')) return;
    gameData.prestige.points++;
    gameData.prestige.permanentMultiplier = 1.0 + (gameData.prestige.points * 0.25);
    gameData.cash = 0;
    gameData.clickPower = 1;
    businessItems.forEach(item => gameData.businesses[item.id] = 0);
    luxuryItems.forEach(item => gameData.luxuries[item.id] = false);
    calculatePassiveIncome();
    renderShops();
    updateUI();
    saveGame();
    alert(`🏆 تهانيك! وصلت للمستوى ${gameData.prestige.points}\nمضاعف دائم: x${gameData.prestige.permanentMultiplier.toFixed(2)}`);
});

// --- Real Estate Rendering ---
function renderRealEstate() {
    const rList = document.getElementById('realestate-list');
    if (!rList) return;
    rList.innerHTML = '';
    
    // Update Land Info
    const totalLandEl = document.getElementById('total-land');
    const availableLandEl = document.getElementById('available-land');
    if (totalLandEl) totalLandEl.innerText = gameData.land.toLocaleString();
    if (availableLandEl) availableLandEl.innerText = (gameData.land - gameData.usedLand).toLocaleString();

    realEstateItems.forEach(item => {
        const count = gameData.realEstate[item.id] || 0;
        const availableLand = gameData.land - gameData.usedLand;
        const canAfford = gameData.cash >= item.cost;
        const hasLand = item.type === 'land' || availableLand >= item.landRequired;
        
        const div = document.createElement('div');
        div.className = `item-card ${(!canAfford || !hasLand) ? 'disabled' : ''}`;
        
        let actionBtn = '';
        if (item.type === 'land') {
            actionBtn = `<button class="buy-btn" onclick="buyRealEstate('${item.id}')">${formatMoney(item.cost)}$</button>`;
        } else {
            // Property - with Sell option
            actionBtn = `
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button class="buy-btn" onclick="buyRealEstate('${item.id}')" style="font-size:0.85rem;">شراء: ${formatMoney(item.cost)}$</button>
                    ${count > 0 ? `<button class="danger-btn" onclick="sellRealEstate('${item.id}')" style="font-size:0.75rem; margin-top:0; padding:4px;">بيع: ${formatMoney(item.cost*0.7)}$</button>` : ''}
                </div>`;
        }

        div.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name} ${count > 0 ? `<span class="item-count">x${count}</span>` : ''}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-income">${item.type === 'land' ? `مساحة: +${item.size}م²` : `إيجار: +${formatMoney(item.income)}$/ث | أرض: ${item.landRequired}م²`}</div>
            </div>
            <div class="item-action">
                ${actionBtn}
            </div>`;
        rList.appendChild(div);
    });
}

// --- Achievements ---
const ACHIEVEMENTS = [
    { id: 'ach_1M', title: 'المليونير الأول', desc: 'اجمع أول مليون دولار', icon: '💰', condition: g => g.cash >= 1e6, reward: 50000 },
    { id: 'ach_100M', title: 'المتميز', desc: 'اجمع 100 مليون دولار', icon: '💲', condition: g => g.cash >= 1e8, reward: 1e6 },
    { id: 'ach_1B', title: 'الملياردير', desc: 'بلغ مليار دولار', icon: '🏆', condition: g => g.cash >= 1e9, reward: 1e7 },
    { id: 'ach_1T', title: 'سيد التريليونات', desc: 'بلغ تريليون دولار', icon: '🌟', condition: g => g.cash >= 1e12, reward: 1e10 },
    { id: 'ach_click100', title: 'أصابع التاجر', desc: 'اضغط 100 مرة', icon: '👆', condition: g => g.totalClicks >= 100, reward: 500 },
    { id: 'ach_click1000', title: 'ملك الضغطات', desc: 'اضغط 1000 مرة', icon: '✋', condition: g => g.totalClicks >= 1000, reward: 10000 },
    { id: 'ach_click10000', title: 'أسطورة النقرات', desc: 'اضغط 10,000 مرة', icon: '🖐️', condition: g => g.totalClicks >= 10000, reward: 100000 },
    { id: 'ach_10biz', title: 'رجل أعمال', desc: 'امتلك 10 مشاريع', icon: '🏢', condition: g => Object.values(g.businesses).reduce((a,b)=>a+b,0) >= 10, reward: 5000 },
    { id: 'ach_50biz', title: 'إمبراطورية تجارية', desc: 'امتلك 50 مشروعاً', icon: '🏗️', condition: g => Object.values(g.businesses).reduce((a,b)=>a+b,0) >= 50, reward: 500000 },
    { id: 'ach_prestige', title: 'وارث الثروة', desc: 'قم بأول تقاعد', icon: '🔄', condition: g => g.prestige && g.prestige.points >= 1, reward: 100000 },
    { id: 'ach_prestige5', title: 'سلالة الأثرياء', desc: '5 عمليات تقاعد', icon: '👨‍👦‍👦', condition: g => g.prestige && g.prestige.points >= 5, reward: 5000000 },
    { id: 'ach_stock', title: 'متتبع البورصة', desc: 'امتلك سهماً واحداً', icon: '📈', condition: g => g.stocks && Object.values(g.stocks).some(s => s.owned > 0), reward: 20000 },
    { id: 'ach_stock10', title: 'ذئب وول ستريت', desc: 'امتلك 10 أسهم', icon: '🐺', condition: g => g.stocks && Object.values(g.stocks).reduce((a,s)=>a+s.owned,0) >= 10, reward: 200000 },
    { id: 'ach_allgames', title: 'لاعب محترف', desc: 'العب 20 لعبة مصغرة', icon: '🎮', condition: g => g.stats && g.stats.minigamesPlayed >= 20, reward: 50000 }
];

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (!gameData.achievements.includes(ach.id) && ach.condition(gameData)) {
            gameData.achievements.push(ach.id);
            gameData.cash += ach.reward;
            const banner = document.createElement('div');
            banner.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(45deg,#1a1a2e,#2a1f3d);border:2px solid var(--gold);color:var(--gold);padding:15px 25px;border-radius:12px;z-index:10000;text-align:center;animation:fadeInDown 0.5s ease;font-size:1rem;box-shadow:0 0 30px rgba(255,215,0,0.4);`;
            banner.innerHTML = `${ach.icon} <b>إنجاز جديد!</b><br>${ach.title}<br><small style="color:var(--green-money)">+${formatMoney(ach.reward)}$ مكافأة</small>`;
            document.body.appendChild(banner);
            setTimeout(() => banner.remove(), 4000);
            renderAchievements();
            updateUI();
            saveGame();
        }
    });
}

function renderAchievements() {
    const aList = document.getElementById('achievements-list');
    if (!aList) return;
    aList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = gameData.achievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = `item-card ${unlocked ? '' : 'disabled'}`;
        div.style.opacity = unlocked ? '1' : '0.5';
        div.innerHTML = `
            <div class="item-icon">${ach.icon}</div>
            <div class="item-info">
                <div class="item-name">${ach.title} ${unlocked ? '✅' : '🔒'}</div>
                <div class="item-desc">${ach.desc}</div>
                <div class="item-income">مكافأة: +${formatMoney(ach.reward)}$</div>
            </div>`;
        aList.appendChild(div);
    });
}

// Update Achievement check to include Real Estate
const ORIGINAL_ACHIEVEMENTS = [...ACHIEVEMENTS];
ACHIEVEMENTS.push(
    { id: 'ach_land', title: 'صاحب أملاك', desc: 'امتلك 1000 متر مربع من الأرض', icon: '🗺️', condition: g => g.land >= 1000, reward: 500000 },
    { id: 'ach_villa', title: 'حياة الملوك', desc: 'امتلك أول فيلا فاخرة', icon: '🏡', condition: g => g.realEstate['prop_villa'] > 0, reward: 1000000 }
);

setInterval(checkAchievements, 5000);

// --- Leaderboard ---
const NPC_BILLIONAIRES = [
    { name: 'Carlos Morales', icon: '💼', wealth: 850000000, growthRate: 0.003 },
    { name: 'Zara Goldstein', icon: '💸', wealth: 1200000000, growthRate: 0.0025 },
    { name: 'Ivan Petrov', icon: '🏛️', wealth: 500000000, growthRate: 0.004 },
    { name: 'Sophie Chen', icon: '💎', wealth: 3000000000, growthRate: 0.002 },
    { name: 'Malik Al-Rashid', icon: '🛢️', wealth: 2200000000, growthRate: 0.0015 },
    { name: 'Priya Kapoor', icon: '💻', wealth: 700000000, growthRate: 0.0035 },
    { name: 'Elon Nova', icon: '🚀', wealth: 5000000000, growthRate: 0.001 }
];

function renderLeaderboard() {
    const lList = document.getElementById('leaderboard-list');
    if (!lList) return;
    const allPlayers = [
        { name: 'أنت 📱', icon: '🏅', wealth: gameData.cash },
        ...NPC_BILLIONAIRES
    ].sort((a, b) => b.wealth - a.wealth);
    lList.innerHTML = `<div style="text-align:center;color:var(--gold);font-size:1.1rem;font-weight:bold;margin-bottom:12px;padding:8px;">🌍 قائمة أثرياء العالم</div>`;
    const medals = ['🥇','🥈','🥉'];
    allPlayers.forEach((player, index) => {
        const isYou = player.name.includes('أنت');
        const div = document.createElement('div');
        div.className = 'item-card';
        div.style.border = isYou ? '2px solid var(--gold)' : '';
        div.innerHTML = `
            <div class="item-icon" style="font-size:1.8rem;">${medals[index] || (index+1)+'️⃣'}</div>
            <div class="item-info">
                <div class="item-name" style="color:${isYou ? 'var(--gold)' : 'var(--text-primary)'}">${player.icon} ${player.name}</div>
                <div class="item-income">${formatMoney(player.wealth)}$</div>
            </div>`;
        lList.appendChild(div);
    });
}

setInterval(() => {
    NPC_BILLIONAIRES.forEach(npc => npc.wealth *= (1 + npc.growthRate));
    const lb = document.getElementById('leaderboard-tab');
    if (lb && lb.classList.contains('active')) renderLeaderboard();
}, 3000);

// --- Random Events ---
setInterval(() => {
    if (Math.random() < 0.05) spawnGoldenBriefcase();
}, 15000);

function spawnGoldenBriefcase() {
    if(document.querySelector('.golden-briefcase')) return;
    const briefcase = document.createElement('div');
    briefcase.className = 'golden-briefcase';
    briefcase.innerText = '💼';
    briefcase.style.top = (20 + Math.random() * 60) + '%';
    document.body.appendChild(briefcase);
    briefcase.addEventListener('click', () => {
        const reward = Math.max(100, gameData.passiveIncome * 120);
        gameData.cash += reward;
        updateUI();
        const rect = briefcase.getBoundingClientRect();
        createClickParticle(rect.left, rect.top, `+${formatMoney(reward)}$`);
        briefcase.remove();
        alert(`🎁 لقد عثرت على حقيبة أموال تحتوي على ${formatMoney(reward)}$!`);
    });
    setTimeout(() => { if (briefcase.parentNode) briefcase.remove(); }, 12000);
}

// --- Reset ---
resetBtn.addEventListener('click', () => {
    if(confirm('هل أنت متأكد من تصفير اللعبة ومسح كل ثروتك؟ لا يمكنك التراجع!')) {
        localStorage.removeItem('billionaireSave');
        location.reload();
    }
});
