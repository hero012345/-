// =============================================
// Mini-Games: Apple Catcher, Crash, Cups, Coin Flip, Dice, Slots, Memory, Wheel
// =============================================

// --- Apple Catcher ---
const startAppleBtn = document.getElementById('start-apple-btn');
const closeMgBtn = document.getElementById('close-mg-btn');
const mgOverlay = document.getElementById('minigame-overlay');
const mgArea = document.getElementById('mg-area');
const mgBasket = document.getElementById('mg-basket');
const mgTimeEl = document.getElementById('mg-time');
const mgScoreEl = document.getElementById('mg-score');

let mgIntervals = [], mgScore = 0, mgTimeLeft = 30, isMgActive = false;

startAppleBtn.addEventListener('click', () => { mgOverlay.style.display = 'flex'; startGameLoop(); });
closeMgBtn.addEventListener('click', () => endGameLoop(false));

mgArea.addEventListener('mousemove', (e) => {
    if(!isMgActive) return;
    const rect = mgArea.getBoundingClientRect();
    let newLeft = Math.max(30, Math.min(e.clientX - rect.left, rect.width - 30));
    mgBasket.style.left = `${newLeft}px`;
});
mgArea.addEventListener('touchmove', (e) => {
    if(!isMgActive) return;
    const rect = mgArea.getBoundingClientRect();
    let newLeft = Math.max(30, Math.min(e.touches[0].clientX - rect.left, rect.width - 30));
    mgBasket.style.left = `${newLeft}px`;
});

function startGameLoop() {
    isMgActive = true; mgScore = 0; mgTimeLeft = 30;
    mgScoreEl.innerText = '0$'; mgTimeEl.innerText = mgTimeLeft;
    mgArea.querySelectorAll('.mg-apple').forEach(a => a.remove());
    mgBasket.style.left = '50%';
    mgIntervals.push(setInterval(() => { mgTimeLeft--; mgTimeEl.innerText = mgTimeLeft; if(mgTimeLeft <= 0) endGameLoop(true); }, 1000));
    mgIntervals.push(setInterval(spawnApple, 600));
    mgIntervals.push(setInterval(checkCollisions, 50));
}

function spawnApple() {
    if(!isMgActive) return;
    const apple = document.createElement('div');
    apple.innerText = '🍎'; apple.className = 'mg-apple';
    const rect = mgArea.getBoundingClientRect();
    apple.style.left = `${20 + Math.random() * (rect.width - 40)}px`;
    mgArea.appendChild(apple);
    setTimeout(() => { if(apple.parentNode) apple.remove(); }, 2000);
}

function checkCollisions() {
    const basketRect = mgBasket.getBoundingClientRect();
    mgArea.querySelectorAll('.mg-apple').forEach(apple => {
        const aRect = apple.getBoundingClientRect();
        if(aRect.bottom >= basketRect.top && aRect.top <= basketRect.bottom && aRect.right >= basketRect.left && aRect.left <= basketRect.right) {
            apple.remove();
            const val = 5 * gameData.clickPower;
            mgScore += val;
            mgScoreEl.innerText = `${formatMoney(mgScore)}$`;
            createClickParticle(aRect.left, aRect.top, `+${formatMoney(val)}$`);
            if(typeof playSound === 'function') playSound('coin');
        }
    });
}

function endGameLoop(completed) {
    isMgActive = false;
    mgIntervals.forEach(clearInterval); mgIntervals = [];
    mgOverlay.style.display = 'none';
    if (completed && mgScore > 0) {
        gameData.cash += mgScore;
        gameData.stats.minigamesPlayed++;
        if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1);
        updateUI();
        if(Math.random() < 0.20) {
            activateBooster(2, 60);
            alert(`🎉 ربحت ${formatMoney(mgScore)}$\n🎁 مكافأة: x2 لمدة 60 ثانية!`);
        } else {
            alert(`🎉 ربحت ${formatMoney(mgScore)}$ من بيع التفاح.`);
        }
        if(typeof playSound === 'function') playSound('win');
    } else if (completed) {
        if(typeof playSound === 'function') playSound('lose');
    }
}

// --- Crash Game ---
const openCrashBtn = document.getElementById('open-crash-btn');
const closeCrashBtn = document.getElementById('close-crash-btn');
const crashOverlay = document.getElementById('crash-overlay');
const crashBetInput = document.getElementById('crash-bet-input');
const crashMultiplierEl = document.getElementById('crash-multiplier');
const crashActionBtn = document.getElementById('crash-action-btn');
const crashPlane = document.getElementById('crash-plane');

let crashState = { active: false, multiplier: 1.00, crashPoint: 1.00, betAmount: 0, interval: null };

openCrashBtn.addEventListener('click', () => { crashOverlay.style.display = 'flex'; resetCrashUI(); });
closeCrashBtn.addEventListener('click', () => { if(crashState.active) endCrash(false); crashOverlay.style.display = 'none'; });

function resetCrashUI() {
    crashMultiplierEl.innerText = '1.00x'; crashMultiplierEl.classList.remove('crashed'); crashMultiplierEl.style.color = 'var(--green-money)';
    crashActionBtn.innerHTML = '<span class="btn-text"><span class="title">بدء الرهان</span></span>';
    crashActionBtn.style.background = 'linear-gradient(45deg, var(--accent), #8a84ff)';
    crashBetInput.disabled = false; crashState.active = false;
    crashPlane.classList.remove('crashed'); crashPlane.style.bottom = '5px'; crashPlane.style.left = '5px';
}

crashActionBtn.addEventListener('click', () => {
    if (!crashState.active) {
        const bet = parseFloat(crashBetInput.value);
        if (isNaN(bet) || bet <= 0) { alert('الرجاء إدخال مبلغ صحيح!'); return; }
        if (bet > gameData.cash) { alert('ليس لديك رصيد كافٍ!'); return; }
        gameData.cash -= bet; updateUI();
        crashState.betAmount = bet; crashState.active = true; crashState.multiplier = 1.00;
        if(typeof playSound === 'function') playSound('buy');
        const r = Math.random();
        if (r < 0.1) crashState.crashPoint = 1.00;
        else if (r < 0.6) crashState.crashPoint = 1 + Math.random() * 2;
        else if (r < 0.9) crashState.crashPoint = 3 + Math.random() * 5;
        else crashState.crashPoint = 8 + Math.random() * 12;
        crashBetInput.disabled = true;
        crashState.interval = setInterval(() => {
            crashState.multiplier += 0.01;
            crashMultiplierEl.innerText = crashState.multiplier.toFixed(2) + 'x';
            let progress = Math.min((crashState.multiplier - 1) / 5, 1);
            crashPlane.style.bottom = 5 + (progress * 100) + 'px';
            crashPlane.style.left = 5 + (progress * 70) + '%';
            const currentWin = (crashState.betAmount * crashState.multiplier).toFixed(2);
            crashActionBtn.innerHTML = `<span class="btn-text"><span class="title">سحب ${formatMoney(parseFloat(currentWin))}$</span></span>`;
            crashActionBtn.style.background = 'linear-gradient(45deg, var(--green-money), #00c652)';
            if (crashState.multiplier >= crashState.crashPoint) endCrash(false);
        }, 50);
        gameData.stats.minigamesPlayed++;
        if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1);
    } else {
        endCrash(true);
    }
});

function endCrash(success) {
    clearInterval(crashState.interval); crashState.active = false;
    if (success) {
        const winnings = crashState.betAmount * crashState.multiplier;
        gameData.cash += winnings; updateUI();
        crashMultiplierEl.style.color = 'var(--gold)';
        crashActionBtn.innerHTML = `<span class="btn-text"><span class="title">نجاح! ربحت ${formatMoney(winnings)}$</span></span>`;
    } else {
        crashPlane.classList.add('crashed');
        crashMultiplierEl.innerText = crashState.multiplier.toFixed(2) + 'x CRASHED!';
        crashMultiplierEl.classList.add('crashed');
        crashActionBtn.innerHTML = '<span class="btn-text"><span class="title">جولة جديدة...</span></span>';
        crashActionBtn.style.background = 'linear-gradient(45deg, var(--red-danger), #ff1100)';
        if(typeof playSound === 'function') playSound('lose');
        setTimeout(() => { if(crashOverlay.style.display === 'flex' && !crashState.active) resetCrashUI(); }, 3000);
    }
    crashBetInput.disabled = false;
}

// --- 3 Cups ---
const openCupsBtn = document.getElementById('open-cups-btn');
const closeCupsBtn = document.getElementById('close-cups-btn');
const cupsOverlay = document.getElementById('cups-overlay');
const cupsBetInput = document.getElementById('cups-bet-input');
const startCupsBtn = document.getElementById('start-cups-btn');
const cupsMsg = document.getElementById('cups-msg');
const cups = [document.getElementById('cup-0'), document.getElementById('cup-1'), document.getElementById('cup-2')];
let cupsState = { active: false, waitingForPick: false, betAmount: 0, winningIndex: 0, positions: [20, 120, 220], shuffleInterval: null };

openCupsBtn.addEventListener('click', () => { cupsOverlay.style.display = 'flex'; resetCupsUI(); });
closeCupsBtn.addEventListener('click', () => { cupsState.waitingForPick = false; cupsState.active = false; cupsOverlay.style.display = 'none'; });

function resetCupsUI() {
    cupsState.active = false; cupsState.waitingForPick = false;
    cupsBetInput.disabled = false; startCupsBtn.disabled = false; startCupsBtn.style.opacity = '1';
    cupsMsg.innerText = 'راهن لتبدأ اللعبة (الربح × 4)'; cupsMsg.style.color = 'var(--text-secondary)';
    cupsState.positions = [20, 120, 220];
    cups.forEach((cup, i) => { cup.innerText = '🥤'; cup.style.left = cupsState.positions[i] + 'px'; cup.classList.add('disabled'); });
}

startCupsBtn.addEventListener('click', () => {
    const bet = parseFloat(cupsBetInput.value);
    if (isNaN(bet) || bet <= 0) { alert('أدخل مبلغاً صحيحاً!'); return; }
    if (bet > gameData.cash) { alert('رصيد غير كافٍ!'); return; }
    gameData.cash -= bet; updateUI();
    cupsState.betAmount = bet; cupsState.active = true; cupsState.winningIndex = Math.floor(Math.random() * 3);
    cupsBetInput.disabled = true; startCupsBtn.disabled = true; startCupsBtn.style.opacity = '0.5';
    cupsMsg.innerText = 'يتم خلط الأكواب...'; cupsMsg.style.color = 'var(--gold)';
    cups[cupsState.winningIndex].innerText = '⚽';
    gameData.stats.minigamesPlayed++;
    if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1);
    setTimeout(() => {
        cups.forEach(cup => cup.innerText = '🥤');
        cupsState.shuffleInterval = setInterval(() => {
            const i1 = Math.floor(Math.random() * 3), i2 = Math.floor(Math.random() * 3);
            const temp = cupsState.positions[i1]; cupsState.positions[i1] = cupsState.positions[i2]; cupsState.positions[i2] = temp;
            cups.forEach((cup, i) => cup.style.left = cupsState.positions[i] + 'px');
        }, 300);
        setTimeout(() => {
            clearInterval(cupsState.shuffleInterval);
            cups.forEach(cup => cup.classList.remove('disabled'));
            cupsMsg.innerText = 'اختر الكوب!'; cupsState.waitingForPick = true;
        }, 2100);
    }, 1000);
});

cups.forEach((cup, index) => {
    cup.addEventListener('click', () => {
        if (!cupsState.waitingForPick) return;
        cupsState.waitingForPick = false;
        cups.forEach(c => c.classList.add('disabled'));
        if (index === cupsState.winningIndex) {
            cup.innerText = '⚽';
            const winAmt = cupsState.betAmount * 4;
            gameData.cash += winAmt; updateUI();
            cupsMsg.innerText = `رائع! ربحت ${formatMoney(winAmt)}$`; cupsMsg.style.color = 'var(--green-money)';
        } else {
            cup.innerText = '❌'; cups[cupsState.winningIndex].innerText = '⚽';
            cupsMsg.innerText = 'خطأ! خسرت رهانك.'; cupsMsg.style.color = 'var(--red-danger)';
            if(typeof playSound === 'function') playSound('lose');
        }
        setTimeout(() => { startCupsBtn.disabled = false; startCupsBtn.style.opacity = '1'; cupsBetInput.disabled = false; cupsState.active = false; }, 2000);
    });
});

// --- Coin Flip ---
const coinflipOverlay = document.getElementById('coinflip-overlay');
const coinflipBet = document.getElementById('coinflip-bet-input');
const coinDisplay = document.getElementById('coin-display');
const coinflipMsg = document.getElementById('coinflip-msg');

document.getElementById('open-coinflip-btn').addEventListener('click', () => { coinflipOverlay.style.display = 'flex'; coinflipMsg.innerText = 'اختر صورة أو كتابة (ربح ×2)'; coinflipMsg.style.color = 'var(--text-secondary)'; coinDisplay.innerText = '🪙'; });
document.getElementById('close-coinflip-btn').addEventListener('click', () => coinflipOverlay.style.display = 'none');

function playCoinFlip(choice) {
    const bet = parseFloat(coinflipBet.value);
    if (isNaN(bet) || bet <= 0) { alert('أدخل مبلغاً صحيحاً!'); return; }
    if (bet > gameData.cash) { alert('رصيد غير كافٍ!'); return; }
    gameData.cash -= bet; gameData.stats.minigamesPlayed++; if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1); updateUI();
    coinDisplay.classList.add('flipping');
    document.getElementById('coin-heads').disabled = true;
    document.getElementById('coin-tails').disabled = true;
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    setTimeout(() => {
        coinDisplay.classList.remove('flipping');
        coinDisplay.innerText = result === 'heads' ? '👑' : '🦅';
        if (choice === result) {
            const win = bet * 2;
            gameData.cash += win; updateUI();
            coinflipMsg.innerText = `🎉 فزت! ربحت ${formatMoney(win)}$`; coinflipMsg.style.color = 'var(--green-money)';
            if(typeof playSound === 'function') playSound('win');
        } else {
            coinflipMsg.innerText = `😞 خسرت! كانت ${result === 'heads' ? 'صورة' : 'كتابة'}`; coinflipMsg.style.color = 'var(--red-danger)';
            if(typeof playSound === 'function') playSound('lose');
        }
        document.getElementById('coin-heads').disabled = false;
        document.getElementById('coin-tails').disabled = false;
    }, 700);
}

document.getElementById('coin-heads').addEventListener('click', () => playCoinFlip('heads'));
document.getElementById('coin-tails').addEventListener('click', () => playCoinFlip('tails'));

// --- Dice Roll ---
const diceOverlay = document.getElementById('dice-overlay');
const diceBet = document.getElementById('dice-bet-input');
const diceDisplay = document.getElementById('dice-display');
const diceMsg = document.getElementById('dice-msg');
const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];

document.getElementById('open-dice-btn').addEventListener('click', () => { diceOverlay.style.display = 'flex'; diceMsg.innerText = 'خمّن الرقم (×6) أو فوق/تحت (×2)'; diceMsg.style.color = 'var(--text-secondary)'; diceDisplay.innerText = '🎲'; });
document.getElementById('close-dice-btn').addEventListener('click', () => diceOverlay.style.display = 'none');

function rollDice(guess, type) {
    const bet = parseFloat(diceBet.value);
    if (isNaN(bet) || bet <= 0) { alert('أدخل مبلغاً صحيحاً!'); return; }
    if (bet > gameData.cash) { alert('رصيد غير كافٍ!'); return; }
    gameData.cash -= bet; gameData.stats.minigamesPlayed++; if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1); updateUI();
    diceDisplay.classList.add('rolling');
    // disable buttons
    diceOverlay.querySelectorAll('button:not(#close-dice-btn)').forEach(b => b.disabled = true);
    const result = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
        diceDisplay.classList.remove('rolling');
        diceDisplay.innerText = diceFaces[result - 1];
        let won = false, multiplier = 1;
        if (type === 'exact' && guess === result) { won = true; multiplier = 6; }
        else if (type === 'under' && result <= 3) { won = true; multiplier = 2; }
        else if (type === 'over' && result >= 4) { won = true; multiplier = 2; }
        if (won) {
            const win = bet * multiplier;
            gameData.cash += win; updateUI();
            diceMsg.innerText = `🎉 فزت! الرقم ${result} - ربحت ${formatMoney(win)}$`; diceMsg.style.color = 'var(--green-money)';
        } else {
            diceMsg.innerText = `😞 الرقم ${result} - خسرت!`; diceMsg.style.color = 'var(--red-danger)';
        }
        diceOverlay.querySelectorAll('button:not(#close-dice-btn)').forEach(b => b.disabled = false);
    }, 600);
}

document.querySelectorAll('.dice-num-btn').forEach(btn => {
    btn.addEventListener('click', () => rollDice(parseInt(btn.dataset.num), 'exact'));
});
document.getElementById('dice-under').addEventListener('click', () => rollDice(0, 'under'));
document.getElementById('dice-over').addEventListener('click', () => rollDice(0, 'over'));

// --- Slot Machine ---
const slotsOverlay = document.getElementById('slots-overlay');
const slotsBet = document.getElementById('slots-bet-input');
const slotsMsg = document.getElementById('slots-msg');
const reels = [document.getElementById('reel-0'), document.getElementById('reel-1'), document.getElementById('reel-2')];
const slotSymbols = ['🍒','🍋','🍊','💎','7️⃣','🔔','⭐','🍇'];

document.getElementById('open-slots-btn').addEventListener('click', () => { slotsOverlay.style.display = 'flex'; slotsMsg.innerText = '3 متطابقة = ×10 | 2 متطابقة = ×3'; slotsMsg.style.color = 'var(--text-secondary)'; });
document.getElementById('close-slots-btn').addEventListener('click', () => slotsOverlay.style.display = 'none');

document.getElementById('spin-slots-btn').addEventListener('click', () => {
    const bet = parseFloat(slotsBet.value);
    if (isNaN(bet) || bet <= 0) { alert('أدخل مبلغاً!'); return; }
    if (bet > gameData.cash) { alert('رصيد غير كافٍ!'); return; }
    gameData.cash -= bet; gameData.stats.minigamesPlayed++; if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1); updateUI();
    document.getElementById('spin-slots-btn').disabled = true;
    reels.forEach(r => r.classList.add('spinning'));
    // Rapid symbol changes
    const spinTimers = reels.map((reel, i) => {
        return setInterval(() => { reel.innerText = slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; }, 80);
    });
    // Stop each reel sequentially
    const results = [];
    reels.forEach((reel, i) => {
        setTimeout(() => {
            clearInterval(spinTimers[i]);
            reel.classList.remove('spinning');
            const sym = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            reel.innerText = sym;
            results.push(sym);
            if (results.length === 3) {
                // Check wins
                if (results[0] === results[1] && results[1] === results[2]) {
                    const win = bet * 10;
                    gameData.cash += win; updateUI();
                    slotsMsg.innerText = `🎉🎉🎉 جاك بوت! ربحت ${formatMoney(win)}$`; slotsMsg.style.color = 'var(--gold)';
                    if(typeof playSound === 'function') playSound('win');
                } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
                    const win = bet * 3;
                    gameData.cash += win; updateUI();
                    slotsMsg.innerText = `🎉 زوج! ربحت ${formatMoney(win)}$`; slotsMsg.style.color = 'var(--green-money)';
                    if(typeof playSound === 'function') playSound('coin');
                } else {
                    slotsMsg.innerText = '😞 لا تطابق... حاول مرة أخرى!'; slotsMsg.style.color = 'var(--red-danger)';
                    if(typeof playSound === 'function') playSound('lose');
                }
                document.getElementById('spin-slots-btn').disabled = false;
            }
        }, 500 + i * 500);
    });
});

// --- Memory Cards ---
const memoryOverlay = document.getElementById('memory-overlay');
const memoryGrid = document.getElementById('memory-grid');
const memoryMovesEl = document.getElementById('memory-moves');
const memoryPairsEl = document.getElementById('memory-pairs');

const memoryEmojis = ['💰','💎','🏆','🚀','👑','⭐'];
let memoryCards = [], memoryFlipped = [], memoryMatched = 0, memoryMoves = 0, memoryLocked = false;

document.getElementById('open-memory-btn').addEventListener('click', () => { memoryOverlay.style.display = 'flex'; initMemory(); });
document.getElementById('close-memory-btn').addEventListener('click', () => memoryOverlay.style.display = 'none');

function initMemory() {
    memoryMatched = 0; memoryMoves = 0; memoryFlipped = []; memoryLocked = false;
    memoryMovesEl.innerText = '0'; memoryPairsEl.innerText = '0/6';
    const pairs = [...memoryEmojis, ...memoryEmojis];
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    memoryGrid.innerHTML = '';
    memoryCards = pairs.map((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = idx;
        card.innerText = '❓';
        card.addEventListener('click', () => flipMemoryCard(card));
        memoryGrid.appendChild(card);
        return card;
    });
    gameData.stats.minigamesPlayed++;
    if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1);
}

function flipMemoryCard(card) {
    if (memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.innerText = card.dataset.emoji;
    memoryFlipped.push(card);
    if(typeof playSound === 'function') playSound('click');
    if (memoryFlipped.length === 2) {
        memoryMoves++;
        memoryMovesEl.innerText = memoryMoves;
        memoryLocked = true;
        if (memoryFlipped[0].dataset.emoji === memoryFlipped[1].dataset.emoji) {
            memoryFlipped.forEach(c => c.classList.add('matched'));
            memoryMatched++;
            memoryPairsEl.innerText = `${memoryMatched}/6`;
            memoryFlipped = []; memoryLocked = false;
            if (memoryMatched === 6) {
                const reward = Math.max(100, gameData.clickPower * 50) * Math.max(1, Math.floor(20 / memoryMoves));
                gameData.cash += reward; updateUI();
                if(typeof playSound === 'function') playSound('win');
                setTimeout(() => alert(`🎉 أكملت اللعبة في ${memoryMoves} محاولة!\nربحت ${formatMoney(reward)}$`), 300);
            }
        } else {
            if(typeof playSound === 'function') playSound('click');
            setTimeout(() => {
                memoryFlipped.forEach(c => { c.classList.remove('flipped'); c.innerText = '❓'; });
                memoryFlipped = []; memoryLocked = false;
            }, 800);
        }
    }
}

// --- Wheel of Fortune ---
const wheelOverlay = document.getElementById('wheel-overlay');
const wheelCanvas = document.getElementById('wheel-canvas');
const wheelMsg = document.getElementById('wheel-msg');
const spinWheelBtn = document.getElementById('spin-wheel-btn');
const WHEEL_COOLDOWN = 300000; // 5 minutes

const wheelSegments = [
    { label: '100$', value: 100, color: '#e74c3c' },
    { label: '500$', value: 500, color: '#3498db' },
    { label: '1,000$', value: 1000, color: '#2ecc71' },
    { label: 'x2 بوستر', value: 'booster', color: '#9b59b6' },
    { label: '5,000$', value: 5000, color: '#f39c12' },
    { label: '250$', value: 250, color: '#1abc9c' },
    { label: '10,000$', value: 10000, color: '#e67e22' },
    { label: 'حظ سعيد!', value: 'luck', color: '#e91e63' }
];

let wheelAngle = 0;

function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const cx = 150, cy = 150, r = 140;
    const segAngle = (2 * Math.PI) / wheelSegments.length;
    ctx.clearRect(0, 0, 300, 300);
    wheelSegments.forEach((seg, i) => {
        const startAngle = i * segAngle;
        const endAngle = startAngle + segAngle;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = seg.color; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        // Label
        ctx.save(); ctx.translate(cx, cy);
        ctx.rotate(startAngle + segAngle / 2);
        ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Tajawal'; ctx.fillText(seg.label, r - 15, 5);
        ctx.restore();
    });
    // Center circle
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e'; ctx.fill();
    ctx.strokeStyle = var_gold(); ctx.lineWidth = 3; ctx.stroke();
}

function var_gold() { return '#FFD700'; }

document.getElementById('open-wheel-btn').addEventListener('click', () => {
    wheelOverlay.style.display = 'flex';
    checkWheelCooldown();
    drawWheel();
});
document.getElementById('close-wheel-btn').addEventListener('click', () => wheelOverlay.style.display = 'none');

function checkWheelCooldown() {
    const now = Date.now();
    const elapsed = now - (gameData.lastWheelSpin || 0);
    if (elapsed < WHEEL_COOLDOWN) {
        const remaining = Math.ceil((WHEEL_COOLDOWN - elapsed) / 1000);
        wheelMsg.innerText = `انتظر ${remaining} ثانية لأدور مرة أخرى`;
        spinWheelBtn.disabled = true; spinWheelBtn.style.opacity = '0.4';
    } else {
        wheelMsg.innerText = 'أدر العجلة مجاناً!';
        spinWheelBtn.disabled = false; spinWheelBtn.style.opacity = '1';
    }
}

spinWheelBtn.addEventListener('click', () => {
    const now = Date.now();
    if (now - (gameData.lastWheelSpin || 0) < WHEEL_COOLDOWN) { checkWheelCooldown(); return; }
    gameData.lastWheelSpin = now;
    gameData.stats.minigamesPlayed++;
    if(typeof updateQuestProgress === 'function') updateQuestProgress('minigame', 1);
    spinWheelBtn.disabled = true; spinWheelBtn.style.opacity = '0.4';
    wheelMsg.innerText = 'العجلة تدور...'; wheelMsg.style.color = 'var(--gold)';
    
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const targetAngle = spins * 360 + Math.random() * 360;
    wheelCanvas.style.transform = `rotate(${targetAngle}deg)`;
    
    setTimeout(() => {
        // Determine which segment is at top (pointer is at top)
        const normalizedAngle = targetAngle % 360;
        const segAngle = 360 / wheelSegments.length;
        // The pointer is at top (270 deg in standard math angles if right=0, or just top-centered)
        const segIndex = Math.floor(((360 - normalizedAngle + segAngle / 2) % 360) / segAngle);
        const segment = wheelSegments[segIndex % wheelSegments.length];
        
        if (segment.value === 'booster') {
            activateBooster(2, 120);
            wheelMsg.innerText = '🎉 ربحت بوستر x2 لمدة دقيقتين!'; wheelMsg.style.color = 'var(--green-money)';
        } else if (segment.value === 'luck') {
            const luckReward = Math.max(500, gameData.passiveIncome * 60);
            gameData.cash += luckReward; updateUI();
            wheelMsg.innerText = `🍀 حظ سعيد! ربحت ${formatMoney(luckReward)}$`; wheelMsg.style.color = 'var(--green-money)';
        } else {
            gameData.cash += segment.value; updateUI();
            wheelMsg.innerText = `🎉 ربحت ${formatMoney(segment.value)}$`; wheelMsg.style.color = 'var(--green-money)';
        }
        if(typeof playSound === 'function') playSound('win');
        saveGame();
        setTimeout(checkWheelCooldown, 1000);
    }, 4200);
});
