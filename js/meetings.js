// =============================================
// Business Meetings & Dialogue System
// =============================================

const MEETINGS_DATA = [
    {
        id: 'zara',
        name: 'زارا غولدشتاين',
        rank: 'خبيرة استثمار',
        icon: '💸',
        intro: 'أهلاً بك. هل تبحث عن نصيحة مالية أم صفقة استثمارية؟',
        dialogue: {
            start: {
                text: 'سوق الأسهم متقلب اليوم. كيف ترى استراتيجيتك القادمة؟',
                options: [
                    { text: 'أريد استثماراً آمناً ومنخفض المخاطر.', next: 'safe' },
                    { text: 'أنا هنا للمخاطرة الكبيرة من أجل أرباح ضخمة!', next: 'risky' },
                    { text: 'أبحث عن شريكة عمل لمشاريعي الكبرى.', next: 'partner' }
                ]
            },
            safe: {
                text: 'الحذر ذكاء. سأقوم بتوجيه مدراء أعمالك لتحسين الكفاءة بنسبة 10% لمدة 10 دقائق.',
                onEnter: () => activateBooster(1.1, 600),
                options: [{ text: 'شكراً لكِ زارا.', next: 'end' }]
            },
            risky: {
                text: 'هذا ما أحب سماعه! خذ هذه المنحة الاستثمارية، لكن استخدمها بحكمة.',
                onEnter: () => { gameData.cash += gameData.passiveIncome * 1800; updateUI(); },
                options: [{ text: 'سأفعل ذلك بكل تأكيد!', next: 'end' }]
            },
            partner: {
                text: 'ربما في المستقبل. حالياً، دعنا نبدأ بصفقة صغيرة لمضاعفة أرباحك لفترة قصيرة.',
                onEnter: () => activateBooster(2, 300),
                options: [{ text: 'صفقة رابحة!', next: 'end' }]
            }
        }
    },
    {
        id: 'elon',
        name: 'إيلون نوفا',
        rank: 'رائد تكنولوجيا',
        icon: '🚀',
        intro: 'المستقبل في المريخ، لكن المال هنا على الأرض. هل أنت مستعد للابتكار؟',
        dialogue: {
            start: {
                text: 'شركتي الجديدة تحتاج لممول جريء مثلك. هل تشاركنا الرؤية؟',
                options: [
                    { text: 'أنا مهتم بالتكنولوجيا الفضائية.', next: 'space' },
                    { text: 'هل هناك أرباح سريعة؟', next: 'money' }
                ]
            },
            space: {
                text: 'رائع! سأقوم بتحديث أنظمة مشاريعك لتزيد سرعة إنتاجها بشكل خيالي.',
                onEnter: () => activateBooster(3, 120),
                options: [{ text: 'إلى القمر!', next: 'end' }]
            },
            money: {
                text: 'الابتكار يحتاج صبراً، لكن خذ هذه الشفرة البرمجية لزيادة قوة ضغطاتك مؤقتاً.',
                onEnter: () => { activeBooster.multiplier *= 5; activeBooster.active = true; activeBooster.timeRemaining += 60; updateUI(); },
                options: [{ text: 'هذا مفيد جداً.', next: 'end' }]
            }
        }
    }
];

let currentDialogueNpc = null;
let currentDialogueNode = null;

function renderMeetings() {
    const list = document.getElementById('meetings-list');
    if (!list) return;
    list.innerHTML = '';

    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 30 minutes

    MEETINGS_DATA.forEach(npc => {
        const lastMeeting = gameData.meetings.completed[npc.id] || 0;
        const isAvailable = (now - lastMeeting) > cooldown;
        
        const div = document.createElement('div');
        div.className = `item-card ${isAvailable ? '' : 'disabled'}`;
        div.innerHTML = `
            <div class="item-icon" style="font-size:2rem;">${npc.icon}</div>
            <div class="item-info">
                <div class="item-name">${npc.name}</div>
                <div class="item-desc">${npc.rank}</div>
                <div class="item-income">${isAvailable ? 'متاح للاجتماع ✅' : 'في اجتماع آخر...'}</div>
            </div>
            <div class="item-action">
                <button class="buy-btn" onclick="startMeeting('${npc.id}')" ${isAvailable ? '' : 'disabled'}>
                    ${isAvailable ? 'ابدأ الاجتماع' : 'انتظر...'}
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}

window.startMeeting = function(npcId) {
    const npc = MEETINGS_DATA.find(n => n.id === npcId);
    if (!npc) return;

    currentDialogueNpc = npc;
    currentDialogueNode = 'start';
    
    document.getElementById('npc-name').innerText = npc.name;
    document.getElementById('npc-rank').innerText = npc.rank;
    document.getElementById('npc-avatar').innerText = npc.icon;
    document.getElementById('dialogue-overlay').style.display = 'flex';
    
    showDialogueNode();
    if(typeof playSound === 'function') playSound('click');
};

function showDialogueNode() {
    const node = currentDialogueNpc.dialogue[currentDialogueNode];
    if (!node) {
        closeMeeting();
        return;
    }

    if (node.onEnter) node.onEnter();

    document.getElementById('dialogue-text').innerText = node.text;
    const optionsEl = document.getElementById('dialogue-options');
    optionsEl.innerHTML = '';

    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'dialogue-option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => {
            if (opt.next === 'end') {
                closeMeeting();
            } else {
                currentDialogueNode = opt.next;
                showDialogueNode();
            }
            if(typeof playSound === 'function') playSound('click');
        };
        optionsEl.appendChild(btn);
    });
}

function closeMeeting() {
    document.getElementById('dialogue-overlay').style.display = 'none';
    if (currentDialogueNpc) {
        gameData.meetings.completed[currentDialogueNpc.id] = Date.now();
        saveGame();
        renderMeetings();
    }
    currentDialogueNpc = null;
    currentDialogueNode = null;
    if(typeof playSound === 'function') playSound('win');
}
