// ============================================================
// TIẾN LÊN SCORE — SCRIPT.JS
// Theme: Casino Royale — Tab-based Layout
// Giữ nguyên 100% logic tính điểm, thêm Tab + Toast system
// ============================================================

// === STATE ===
let players = [];
let scores = [0, 0, 0, 0];
let currentRanks = {};
let pigActions = [];
let rottenPigActions = [];
let stackActions = [];
let roundNumber = 1;
let toiTrangPlayer = null;
let historyData = [];
let isGameStarted = false;

// === DOM REFERENCES — Setup ===
const betSelect = document.getElementById("betSelect");
const customBetBox = document.getElementById("customBetBox");
const lowBetInput = document.getElementById("lowBetInput");
const highBetInput = document.getElementById("highBetInput");
const toiTrangMultiplierSelect = document.getElementById("toiTrangMultiplierSelect");
const gietMultiplierSelect = document.getElementById("gietMultiplierSelect");
const startBtn = document.getElementById("startBtn");

// === DOM REFERENCES — Score & Game ===
const scoreSection = document.getElementById("scoreSection");
const gameSection = document.getElementById("gameSection");
const currentBetText = document.getElementById("currentBetText");
const scoreBoard = document.getElementById("scoreBoard");
const totalScoreText = document.getElementById("totalScoreText");
const rankArea = document.getElementById("rankArea");
const messageBox = document.getElementById("messageBox");

// === DOM REFERENCES — Actions ===
const calculateBtn = document.getElementById("calculateBtn");
const clearRoundBtn = document.getElementById("clearRoundBtn");
const resetBtn = document.getElementById("resetBtn");

// === DOM REFERENCES — Pig Actions ===
const cutterSelect = document.getElementById("cutterSelect");
const victimSelect = document.getElementById("victimSelect");
const pigTypeSelect = document.getElementById("pigTypeSelect");
const addPigBtn = document.getElementById("addPigBtn");
const pigList = document.getElementById("pigList");

// === DOM REFERENCES — Rotten Pig Actions ===
const rottenWinnerSelect = document.getElementById("rottenWinnerSelect");
const rottenVictimSelect = document.getElementById("rottenVictimSelect");
const rottenBlackInput = document.getElementById("rottenBlackInput");
const rottenRedInput = document.getElementById("rottenRedInput");
const rottenTriplePairInput = document.getElementById("rottenTriplePairInput");
const addRottenPigBtn = document.getElementById("addRottenPigBtn");
const rottenPigList = document.getElementById("rottenPigList");

// === DOM REFERENCES — Stack Actions ===
const stackerSelect = document.getElementById("stackerSelect");
const stackVictimSelect = document.getElementById("stackVictimSelect");
const stackAddSelect = document.getElementById("stackAddSelect");
const addStackBtn = document.getElementById("addStackBtn");
const stackList = document.getElementById("stackList");

// === DOM REFERENCES — Manual Adjust ===
const manualPlayerSelect = document.getElementById("manualPlayerSelect");
const manualPointInput = document.getElementById("manualPointInput");
const manualAdjustBtn = document.getElementById("manualAdjustBtn");

// === DOM REFERENCES — In-game Bet Changer ===
const ingameBetSelect = document.getElementById("ingameBetSelect");
const ingameCustomBetBox = document.getElementById("ingameCustomBetBox");
const ingameLowBet = document.getElementById("ingameLowBet");
const ingameHighBet = document.getElementById("ingameHighBet");
const ingameBetApplyBtn = document.getElementById("ingameBetApplyBtn");

// === DOM REFERENCES — Navigation & Tabs ===
const bottomNav = document.getElementById("bottomNav");
const toastContainer = document.getElementById("toastContainer");
const historyList = document.getElementById("historyList");

// === DOM REFERENCES — Stats ===
const statsRounds = document.getElementById("statsRounds");
const statsTotal = document.getElementById("statsTotal");

// ============================================================
// TAB NAVIGATION SYSTEM
// ============================================================

/**
 * Chuyển tab - Ẩn tất cả panel, hiện panel được chọn
 * @param {string} tabId - ID của tab panel cần hiển thị
 */
function switchTab(tabId) {
    // Ẩn tất cả tab panels
    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
    });

    // Bỏ active tất cả nav tabs
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // Hiện tab panel được chọn
    const targetPanel = document.getElementById(tabId);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }

    // Active nav tab tương ứng
    const targetNav = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    if (targetNav) {
        targetNav.classList.add("active");
    }

    // Cuộn lên đầu khi chuyển tab
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ẩn bảng điểm mini ở các tab khác
    const miniScoreboard = document.getElementById("miniScoreboard");
    if (miniScoreboard) {
        if (tabId !== "tabGame") {
            miniScoreboard.style.display = "none";
        } else {
            miniScoreboard.style.display = "";
        }
    }
}

// Gắn event cho tất cả nav tabs
document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
    });
});

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

/**
 * Hiển thị toast notification
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: "success", "error", "warning"
 */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        toast.classList.add("toast-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 3000);
}

/**
 * Compatibility wrapper — gọi showToast thay vì messageBox
 * Giữ nguyên signature cũ để code logic không cần sửa
 */
function showMessage(message, type) {
    showToast(message, type);
}

// ============================================================
// BET MANAGEMENT
// ============================================================

betSelect.addEventListener("change", toggleCustomBetBox);

function toggleCustomBetBox() {
    if (betSelect.value === "custom") {
        customBetBox.classList.remove("hidden");
    } else {
        customBetBox.classList.add("hidden");
    }
}

ingameBetSelect.addEventListener("change", () => {
    if (ingameBetSelect.value === "custom") {
        ingameCustomBetBox.classList.remove("hidden");
    } else {
        ingameCustomBetBox.classList.add("hidden");
    }
});

/**
 * Lấy giá trị mức cược hiện tại
 * Khi đang chơi, ưu tiên lấy từ in-game bet
 */
function getBetValues() {
    if (isGameStarted) {
        if (ingameBetSelect.value === "custom") {
            return {
                low: Number(ingameLowBet.value),
                high: Number(ingameHighBet.value)
            };
        }
        const parts = ingameBetSelect.value.split("-");
        return {
            low: Number(parts[0]),
            high: Number(parts[1])
        };
    }
    if (betSelect.value === "custom") {
        return {
            low: Number(lowBetInput.value),
            high: Number(highBetInput.value)
        };
    }
    const parts = betSelect.value.split("-");
    return {
        low: Number(parts[0]),
        high: Number(parts[1])
    };
}

ingameBetApplyBtn.addEventListener("click", applyIngameBet);

function applyIngameBet() {
    const newBet = getBetValues();
    if (newBet.low <= 0 || newBet.high <= 0 || isNaN(newBet.low) || isNaN(newBet.high)) {
        showMessage("Vui lòng nhập mức cược hợp lệ.", "error");
        return;
    }
    if (newBet.high <= newBet.low) {
        showMessage("Điểm cao phải lớn hơn điểm thấp.", "error");
        return;
    }
    // Sync lại betSelect gốc
    betSelect.value = ingameBetSelect.value;
    if (ingameBetSelect.value === "custom") {
        lowBetInput.value = ingameLowBet.value;
        highBetInput.value = ingameHighBet.value;
        customBetBox.classList.remove("hidden");
    } else {
        customBetBox.classList.add("hidden");
    }
    currentBetText.textContent = `Mức cược: ${newBet.low} - ${newBet.high}`;
    showMessage(`Đã đổi mức cược thành ${newBet.low} - ${newBet.high}!`, "success");
    saveGameData();
    closeModal('modalSettings');
}

/**
 * Lấy điểm đặc biệt theo loại
 */
function getSpecialPoint(type) {
    const bet = getBetValues();
    if (type === "black") return bet.low;
    if (type === "red") return bet.high;
    if (type === "triplePair") return bet.high;
    if (type === "fourKind") return bet.high;
    return 0;
}

/**
 * Lấy tên hiển thị của loại đặc biệt
 */
function getSpecialName(type) {
    if (type === "black") return "heo đen";
    if (type === "red") return "heo đỏ";
    if (type === "triplePair") return "3 đôi thông";
    if (type === "fourKind") return "tứ quý";
    return "";
}

// ============================================================
// GAME FLOW
// ============================================================

startBtn.addEventListener("click", startGame);
calculateBtn.addEventListener("click", calculateRound);
clearRoundBtn.addEventListener("click", clearCurrentRound);
resetBtn.addEventListener("click", resetGame);

addPigBtn.addEventListener("click", addPigAction);
addRottenPigBtn.addEventListener("click", addRottenPigAction);
addStackBtn.addEventListener("click", addStackAction);
manualAdjustBtn.addEventListener("click", manualAdjustScore);

/**
 * Bắt đầu game — Validate, khởi tạo state, chuyển sang tab Game
 */
function startGame() {
    const bet = getBetValues();

    if (bet.low <= 0 || bet.high <= 0 || isNaN(bet.low) || isNaN(bet.high)) {
        alert("Vui lòng nhập mức cược hợp lệ.");
        return;
    }

    if (bet.high <= bet.low) {
        alert("Điểm cao phải lớn hơn điểm thấp.");
        return;
    }

    players = [
        document.getElementById("player1").value.trim() || "Người 1",
        document.getElementById("player2").value.trim() || "Người 2",
        document.getElementById("player3").value.trim() || "Người 3",
        document.getElementById("player4").value.trim() || "Người 4"
    ];

    scores = [0, 0, 0, 0];
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];
    toiTrangPlayer = null;
    roundNumber = 1;
    historyData = [];
    isGameStarted = true;

    // Sync in-game bet với setup bet
    ingameBetSelect.value = betSelect.value;
    if (betSelect.value === "custom") {
        ingameLowBet.value = lowBetInput.value;
        ingameHighBet.value = highBetInput.value;
        ingameCustomBetBox.classList.remove("hidden");
    } else {
        ingameCustomBetBox.classList.add("hidden");
    }

    currentBetText.textContent = `Mức cược: ${bet.low} - ${bet.high}`;

    // Hiện bottom nav và chuyển sang tab Game
    bottomNav.classList.add("visible");
    switchTab("tabGame");

    renderRankArea();
    renderAllSelects();
    renderScoreBoard();
    renderActionLists();
    renderHistory();
    updateStats();

    showMessage("Chia bài thôi! Hãy chọn kết quả sau khi ván kết thúc.", "success");
    saveGameData();
}

// ============================================================
// RANK AREA — Layout 2 cột cho 4 người chơi
// ============================================================

function renderRankArea() {
    rankArea.innerHTML = "";

    players.forEach((player, index) => {
        const card = document.createElement("div");
        card.className = "player-card";
        card.setAttribute("data-player", index);

        card.innerHTML = `
            <div class="player-name">${player}</div>
            <div class="rank-buttons-main">
                <button class="rank-btn" onclick="selectRank(${index}, 'nhat')">Nhất</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'nhi')">Nhì</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'ba')">Ba</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'bet')">Bét</button>
            </div>
            <div class="rank-buttons-extra">
                <button class="rank-btn bi-giet-btn" onclick="selectRank(${index}, 'bi_giet')">Bị giết</button>
                <button class="rank-btn hoa-btn" onclick="selectRank(${index}, 'hoa')">Hòa</button>
                <button class="rank-btn toi-trang-btn" onclick="selectToiTrang(${index})">Tới trắng</button>
            </div>
        `;

        rankArea.appendChild(card);
    });

    updateRankButtons();
}

function selectRank(playerIndex, rank) {
    toiTrangPlayer = null;

    if (currentRanks[playerIndex] === rank) {
        delete currentRanks[playerIndex];
        updateRankButtons();
        return;
    }

    const uniqueRanks = ['nhat', 'nhi', 'ba', 'bet', 'hoa'];
    if (uniqueRanks.includes(rank)) {
        for (let key in currentRanks) {
            if (currentRanks[key] === rank) {
                delete currentRanks[key];
            }
        }
    }

    currentRanks[playerIndex] = rank;
    updateRankButtons();
}

function selectToiTrang(playerIndex) {
    toiTrangPlayer = playerIndex;
    currentRanks = {};
    updateRankButtons();
}

function updateRankButtons() {
    const cards = document.querySelectorAll(".player-card");
    cards.forEach((card, playerIndex) => {
        const buttons = card.querySelectorAll(".rank-btn");
        buttons.forEach(button => {
            button.classList.remove("active", "active-gold");
            const text = button.textContent.trim();

            if (toiTrangPlayer !== null) {
                if (text === "Tới trắng" && toiTrangPlayer === playerIndex) {
                    button.classList.add("active-gold");
                }
            } else {
                if (text === "Nhất" && currentRanks[playerIndex] === "nhat") button.classList.add("active");
                else if (text === "Nhì" && currentRanks[playerIndex] === "nhi") button.classList.add("active");
                else if (text === "Ba" && currentRanks[playerIndex] === "ba") button.classList.add("active");
                else if (text === "Bét" && currentRanks[playerIndex] === "bet") button.classList.add("active");
                else if (text === "Bị giết" && currentRanks[playerIndex] === "bi_giet") button.classList.add("active");
                else if (text === "Hòa" && currentRanks[playerIndex] === "hoa") button.classList.add("active");
            }
        });
    });
}

// ============================================================
// SELECT DROPDOWNS — Render cho tất cả combo boxes
// ============================================================

function renderAllSelects() {
    const selects = [
        cutterSelect, victimSelect,
        rottenWinnerSelect, rottenVictimSelect,
        stackerSelect, stackVictimSelect,
        manualPlayerSelect
    ];

    selects.forEach(select => {
        select.innerHTML = "";
        players.forEach((player, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = player;
            select.appendChild(option);
        });
    });
}

// ============================================================
// SCOREBOARD
// ============================================================

function renderScoreBoard() {
    // Capture old scores for animation comparison
    const oldItems = scoreBoard.querySelectorAll(".player-score .point");
    const oldScores = [];
    oldItems.forEach(el => {
        oldScores.push(parseInt(el.textContent) || 0);
    });

    scoreBoard.innerHTML = "";
    players.forEach((player, index) => {
        const item = document.createElement("div");
        item.className = "player-score";

        let colorClass = "text-neutral";
        if (scores[index] > 0) colorClass = "text-win";
        else if (scores[index] < 0) colorClass = "text-lose";

        item.innerHTML = `
            <div class="name">${player}</div>
            <div class="point ${colorClass}">${scores[index]}</div>
        `;

        // Trigger score pop + flash animation if score changed
        if (oldScores.length === 4 && oldScores[index] !== scores[index]) {
            item.classList.add("score-pop");
            if (scores[index] > oldScores[index]) {
                item.classList.add("flash-green");
            } else if (scores[index] < oldScores[index]) {
                item.classList.add("flash-red");
            }
            // Remove animation classes after they finish
            setTimeout(() => {
                item.classList.remove("score-pop", "flash-green", "flash-red");
            }, 500);
        }

        scoreBoard.appendChild(item);
    });
    const totalScore = scores.reduce((sum, point) => sum + point, 0);
    totalScoreText.textContent = totalScore;

    // Build mini scoreboard
    const miniScoreInner = document.getElementById("miniScoreInner");
    if(miniScoreInner) {
        miniScoreInner.innerHTML = "";
        players.forEach((player, index) => {
            let colorClass = "text-neutral";
            if (scores[index] > 0) colorClass = "text-win";
            else if (scores[index] < 0) colorClass = "text-lose";
            
            miniScoreInner.innerHTML += `
                <div class="mini-score-item">
                    <span class="mini-name">${player}</span>
                    <span class="mini-point ${colorClass}">${scores[index]}</span>
                </div>
            `;
        });
    }
}

// ============================================================
// PIG ACTIONS — Chặt heo
// ============================================================

function getLastCutPointByPlayer(playerIndex) {
    for (let i = stackActions.length - 1; i >= 0; i--) {
        if (stackActions[i].stackerIndex === playerIndex) return stackActions[i].stackPoint;
    }
    for (let i = pigActions.length - 1; i >= 0; i--) {
        if (pigActions[i].cutterIndex === playerIndex) return pigActions[i].pigPoint;
    }
    return 0;
}

function addPigAction() {
    const cutterIndex = Number(cutterSelect.value);
    const victimIndex = Number(victimSelect.value);
    const pigType = pigTypeSelect.value;
    const pigPoint = getSpecialPoint(pigType);

    if (cutterIndex === victimIndex) {
        showMessage("Người chặt và bị chặt không được trùng nhau.", "error");
        return;
    }
    pigActions.push({ cutterIndex, victimIndex, pigType, pigPoint });
    renderPigList();
    showMessage("Đã thêm chặt heo.", "success");
    closeModal('modalCut');
}

function renderPigList() {
    pigList.innerHTML = "";
    if (pigActions.length === 0) {
        return;
    }
    pigActions.forEach((action, index) => {
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div class="action-item-icon">🗡️</div>
            <div class="action-item-text"><strong>${players[action.cutterIndex]}</strong> chém ${getSpecialName(action.pigType)} <strong>${players[action.victimIndex]}</strong></div>
            <button class="remove-btn" onclick="removePigAction(${index})">✕</button>
        `;
        pigList.appendChild(item);
    });
}

function removePigAction(index) {
    pigActions.splice(index, 1);
    renderPigList();
}

// ============================================================
// ROTTEN PIG ACTIONS — Thúi heo
// ============================================================

function addRottenPigAction() {
    const winnerIndex = Number(rottenWinnerSelect.value);
    const victimIndex = Number(rottenVictimSelect.value);
    const blackCount = Number(rottenBlackInput.value) || 0;
    const redCount = Number(rottenRedInput.value) || 0;
    const triplePairCount = Number(rottenTriplePairInput.value) || 0;

    if (winnerIndex === victimIndex) {
        showMessage("Người được cộng và người bị thúi không được trùng nhau.", "error");
        return;
    }
    const rottenPoint = blackCount * getSpecialPoint("black") + redCount * getSpecialPoint("red") + triplePairCount * getSpecialPoint("triplePair");
    if (rottenPoint === 0) {
        showMessage("Vui lòng nhập ít nhất một mục bị thúi.", "error");
        return;
    }
    rottenPigActions.push({ winnerIndex, victimIndex, blackCount, redCount, triplePairCount, rottenPoint });
    rottenBlackInput.value = 0;
    rottenRedInput.value = 0;
    rottenTriplePairInput.value = 0;
    renderRottenPigList();
    showMessage("Đã thêm thúi heo.", "success");
    closeModal('modalRotten');
}

function renderRottenPigList() {
    rottenPigList.innerHTML = "";
    if (rottenPigActions.length === 0) {
        return;
    }
    rottenPigActions.forEach((action, index) => {
        let details = [];
        if (action.blackCount > 0) details.push(`${action.blackCount} heo đen`);
        if (action.redCount > 0) details.push(`${action.redCount} heo đỏ`);
        if (action.triplePairCount > 0) details.push(`${action.triplePairCount}x3 đôi thông`);
        
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div class="action-item-icon">💩</div>
            <div class="action-item-text"><strong>${players[action.victimIndex]}</strong> thúi (${details.join(", ")}), đền <strong>${players[action.winnerIndex]}</strong></div>
            <button class="remove-btn" onclick="removeRottenPigAction(${index})">✕</button>
        `;
        rottenPigList.appendChild(item);
    });
}

function removeRottenPigAction(index) {
    rottenPigActions.splice(index, 1);
    renderRottenPigList();
}

// ============================================================
// STACK ACTIONS — Chặt chồng
// ============================================================

function addStackAction() {
    const stackerIndex = Number(stackerSelect.value);
    const stackVictimIndex = Number(stackVictimSelect.value);

    if (stackerIndex === stackVictimIndex) {
        showMessage("Người chồng và bị chồng không được trùng nhau.", "error");
        return;
    }

    const basePoint = getLastCutPointByPlayer(stackVictimIndex);
    if (basePoint === 0) {
        showMessage("Người bị chồng chưa có lượt chặt trước đó để tạo thành vòng chồng.", "error");
        return;
    }

    const addPoint = getSpecialPoint("fourKind"); // Fixed penalty for stack
    const stackPoint = basePoint + addPoint;

    stackActions.push({ stackerIndex, stackVictimIndex, stackType: "chồng", basePoint, addPoint, stackPoint });
    renderStackList();
    showMessage("Đã thêm chặt chồng.", "success");
    closeModal('modalStack');
}

function renderStackList() {
    stackList.innerHTML = "";
    if (stackActions.length === 0) {
        return;
    }
    stackActions.forEach((action, index) => {
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div class="action-item-icon">⚡</div>
            <div class="action-item-text"><strong>${players[action.stackerIndex]}</strong> chồng lên <strong>${players[action.stackVictimIndex]}</strong></div>
            <button class="remove-btn" onclick="removeStackAction(${index})">✕</button>
        `;
        stackList.appendChild(item);
    });
}

function removeStackAction(index) {
    stackActions.splice(index, 1);
    renderStackList();
}

// ============================================================
// LOGIC CHÍNH: TÍNH ĐIỂM (giữ nguyên 100%)
// ============================================================

function calculateRound() {
    const bet = getBetValues();
    const roundScores = [0, 0, 0, 0];
    let rankText = "";

    if (toiTrangPlayer !== null) {
        const multiplier = Number(toiTrangMultiplierSelect.value) || 2;
        const penalty = bet.high * multiplier;

        players.forEach((_, index) => {
            if (index === toiTrangPlayer) roundScores[index] += penalty * 3;
            else roundScores[index] -= penalty;
        });
        rankText = `Tới trắng: ${players[toiTrangPlayer]}`;
    } else {
        const counts = { nhat: 0, nhi: 0, ba: 0, bet: 0, bi_giet: 0, hoa: 0 };
        for (let idx in currentRanks) counts[currentRanks[idx]]++;

        const totalPlayersRanked = Object.keys(currentRanks).length;
        let mode = "";

        if (totalPlayersRanked === 4) {
            if (counts.nhat === 1 && counts.nhi === 1 && counts.ba === 1 && counts.bet === 1) mode = "normal";
            else if (counts.nhat === 1 && counts.nhi === 1 && counts.ba === 1 && counts.bi_giet === 1) mode = "giet1";
            else if (counts.nhat === 1 && counts.hoa === 1 && counts.bi_giet === 2) mode = "giet2";
            else if (counts.nhat === 1 && counts.bi_giet === 3) mode = "giet3";
        }

        if (mode === "") {
            showMessage("Tổ hợp sai! Hãy chọn đủ 4 người. Hợp lệ: (Nhất-Nhì-Ba-Bét), 1 ngộp, 2 ngộp, hoặc 3 ngộp.", "error");
            return;
        }

        const penaltyGiet = bet.high * (Number(gietMultiplierSelect.value) || 2);
        const rankNames = { nhat: "Nhất", nhi: "Nhì", ba: "Ba", bet: "Bét", bi_giet: "Bị giết", hoa: "Hòa" };

        let rankParts = [];
        for (let playerIndex in currentRanks) {
            const rank = currentRanks[playerIndex];
            const pIdx = Number(playerIndex);

            rankParts.push(`${players[pIdx]}: ${rankNames[rank]}`);

            if (mode === "normal") {
                if (rank === "nhat") roundScores[pIdx] += bet.high;
                if (rank === "nhi") roundScores[pIdx] += bet.low;
                if (rank === "ba") roundScores[pIdx] -= bet.low;
                if (rank === "bet") roundScores[pIdx] -= bet.high;
            } else if (mode === "giet1") {
                if (rank === "nhat") roundScores[pIdx] += penaltyGiet;
                if (rank === "nhi") roundScores[pIdx] += bet.low;
                if (rank === "ba") roundScores[pIdx] -= bet.low;
                if (rank === "bi_giet") roundScores[pIdx] -= penaltyGiet;
            } else if (mode === "giet2") {
                if (rank === "nhat") roundScores[pIdx] += penaltyGiet * 2;
                if (rank === "hoa") roundScores[pIdx] += 0;
                if (rank === "bi_giet") roundScores[pIdx] -= penaltyGiet;
            } else if (mode === "giet3") {
                if (rank === "nhat") roundScores[pIdx] += penaltyGiet * 3;
                if (rank === "bi_giet") roundScores[pIdx] -= penaltyGiet;
            }
        }
        rankText = rankParts.join(", ");
    }

    let actionLines = [];

    pigActions.forEach(action => {
        roundScores[action.cutterIndex] += action.pigPoint;
        roundScores[action.victimIndex] -= action.pigPoint;
        actionLines.push(`🗡️ <strong>${players[action.cutterIndex]}</strong> chém ${getSpecialName(action.pigType)} <strong>${players[action.victimIndex]}</strong>`);
    });

    if (toiTrangPlayer === null) {
        rottenPigActions.forEach(action => {
            roundScores[action.winnerIndex] += action.rottenPoint;
            roundScores[action.victimIndex] -= action.rottenPoint;
            let details = [];
            if (action.blackCount > 0) details.push(`${action.blackCount} heo đen`);
            if (action.redCount > 0) details.push(`${action.redCount} heo đỏ`);
            if (action.triplePairCount > 0) details.push(`${action.triplePairCount}x3 đôi thông`);
            actionLines.push(`💩 <strong>${players[action.victimIndex]}</strong> thúi (${details.join(", ")}), đền <strong>${players[action.winnerIndex]}</strong>`);
        });
    }

    function findVictimOf(cutterIndex, point, stackActionsBeforeThis) {
        for (let i = stackActionsBeforeThis.length - 1; i >= 0; i--) {
            if (stackActionsBeforeThis[i].stackerIndex === cutterIndex && stackActionsBeforeThis[i].stackPoint === point) {
                return stackActionsBeforeThis[i].stackVictimIndex;
            }
        }
        for (let i = pigActions.length - 1; i >= 0; i--) {
            if (pigActions[i].cutterIndex === cutterIndex && pigActions[i].pigPoint === point) {
                return pigActions[i].victimIndex;
            }
        }
        return -1;
    }

    stackActions.forEach((action, index) => {
        // Hoàn tiền cho nạn nhân trước đó của người bị chồng
        const originalVictim = findVictimOf(action.stackVictimIndex, action.basePoint, stackActions.slice(0, index));
        if (originalVictim !== -1) {
            roundScores[action.stackVictimIndex] -= action.basePoint;
            roundScores[originalVictim] += action.basePoint;
        }

        // Người chồng ăn tiền từ người bị chồng
        roundScores[action.stackerIndex] += action.stackPoint;
        roundScores[action.stackVictimIndex] -= action.stackPoint;
        actionLines.push(`⚡ <strong>${players[action.stackerIndex]}</strong> chồng lên <strong>${players[action.stackVictimIndex]}</strong>`);
    });

    const roundTotal = roundScores.reduce((sum, point) => sum + point, 0);
    if (roundTotal !== 0) {
        showMessage(`Lỗi tính điểm! Tổng điểm lệch: ${roundTotal}.`, "error");
        return;
    }

    scores = scores.map((score, index) => score + roundScores[index]);

    let ranksObj = { ...currentRanks };
    if (toiTrangPlayer !== null) ranksObj = { [toiTrangPlayer]: "toi_trang" };

    addHistory(roundScores, rankText, `Bàn ${roundNumber}`, `${bet.low} - ${bet.high}`, ranksObj, actionLines);
    renderScoreBoard();
    clearCurrentRound(false);

    showMessage(toiTrangPlayer !== null ? "Thành công: Đã chốt điểm Tới Trắng!" : "Thành công: Đã chốt điểm ván chơi!", "success");
    roundNumber++;
    updateStats();
    saveGameData();
}

// ============================================================
// MANUAL SCORE ADJUSTMENT
// ============================================================

function manualAdjustScore() {
    const pIdx = Number(manualPlayerSelect.value);
    const val = Number(manualPointInput.value);

    if (!val || isNaN(val)) {
        showMessage("Vui lòng nhập số điểm hợp lệ (+ hoặc -).", "error");
        return;
    }

    scores[pIdx] += val;

    const fakeRoundScores = [0, 0, 0, 0];
    fakeRoundScores[pIdx] = val;

    addHistory(fakeRoundScores, "Thao tác sửa lỗi", "⚙️ Sửa điểm nhanh", "");

    renderScoreBoard();
    manualPointInput.value = "";
    updateStats();
    saveGameData();
    showMessage(`Đã cập nhật ${val > 0 ? '+' + val : val} điểm cho ${players[pIdx]}.`, "success");
    closeModal('modalSettings');
}

// ============================================================
// HISTORY MANAGEMENT
// ============================================================

function addHistory(roundScores, detailText, title, betInfo, ranksObj = {}, actionLines = []) {
    const cumulativeScores = [...scores];
    historyData.unshift({
        roundScores: [...roundScores],
        detailText,
        title,
        betInfo,
        cumulativeScores,
        ranksObj: { ...ranksObj },
        actionLines: [...actionLines]
    });

    renderHistoryFromData();
}

function renderHistoryFromData() {
    historyList.innerHTML = "";
    if (historyData.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <div class="empty-icon">🃏</div>
                <p>Chưa có dữ liệu ván chơi</p>
            </div>
        `;
        return;
    }

    historyData.forEach((entry, histIndex) => {
        const { roundScores, detailText, title, betInfo, cumulativeScores, ranksObj, actionLines } = entry;

        let scoreRows = "";
        players.forEach((player, index) => {
            const point = roundScores[index];
            let colorClass = "text-neutral";
            let sign = "";
            if (point > 0) { colorClass = "text-win"; sign = "+"; }
            else if (point < 0) { colorClass = "text-lose"; }

            let rankBadge = "";
            if (ranksObj && ranksObj[index]) {
                const rankNameMap = { nhat: "Nhất", nhi: "Nhì", ba: "Ba", bet: "Bét", bi_giet: "Bị giết", hoa: "Hòa", toi_trang: "Tới trắng" };
                const rName = rankNameMap[ranksObj[index]] || ranksObj[index];
                rankBadge = `<span class="history-rank-badge rank-${ranksObj[index]}">${rName}</span>`;
            }

            scoreRows += `
                <div class="history-score-row">
                    <span class="history-player-name">${player} ${rankBadge}</span>
                    <strong class="${colorClass}">${sign}${point}</strong>
                </div>
            `;
        });

        let cumRows = "";
        players.forEach((player, index) => {
            const cumPoint = cumulativeScores[index];
            let cumColor = "text-neutral";
            if (cumPoint > 0) cumColor = "text-win";
            else if (cumPoint < 0) cumColor = "text-lose";
            cumRows += `
                <div class="history-cum-item">
                    <span class="cum-name">${player}</span>
                    <span class="cum-point ${cumColor}">${cumPoint}</span>
                </div>
            `;
        });

        const roundTotal = roundScores.reduce((s, p) => s + p, 0);
        let actionHtml = "";
        if (actionLines && actionLines.length > 0) {
            const linesHtml = actionLines.map(l => `<div>${l}</div>`).join('');
            actionHtml = `<div class="history-actions-box">${linesHtml}</div>`;
        }

        let mainDetail = "";
        if (!ranksObj || Object.keys(ranksObj).length === 0) {
            mainDetail = detailText;
        }

        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
            <div class="history-header">
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span>${title}</span>
                    ${betInfo ? `<span style="font-size: 11px; font-weight: normal; color: var(--text-muted); text-transform: lowercase;">(mức cược: ${betInfo})</span>` : ""}
                </div>
                <div class="history-header-actions">
                    <span class="history-round-total">Σ ${roundTotal === 0 ? "✓" : roundTotal}</span>
                    <button class="history-delete-btn" onclick="deleteHistoryRound(${histIndex})" title="Xóa bàn này">✕</button>
                </div>
            </div>
            ${mainDetail ? `<div class="history-detail">${mainDetail}</div>` : ''}
            ${actionHtml}
            <div class="history-scores">${scoreRows}</div>
            <div class="history-cumulative">
                ${cumRows}
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteHistoryRound(histIndex) {
    const entry = historyData[histIndex];
    if (!confirm(`Xóa "${entry.title}"? Điểm sẽ được tính lại.`)) return;

    // Trừ điểm ván bị xóa khỏi tổng
    entry.roundScores.forEach((point, i) => {
        scores[i] -= point;
    });

    // Xóa ván khỏi lịch sử
    historyData.splice(histIndex, 1);

    // Tính lại tổng điểm tích lũy cho tất cả ván còn lại
    recalculateCumulativeScores();

    renderScoreBoard();
    renderHistoryFromData();
    updateStats();
    saveGameData();
    showMessage(`Đã xóa bàn và tính lại điểm.`, "warning");
}

function recalculateCumulativeScores() {
    const tempScores = [0, 0, 0, 0];
    for (let i = historyData.length - 1; i >= 0; i--) {
        historyData[i].roundScores.forEach((point, pIdx) => {
            tempScores[pIdx] += point;
        });
        historyData[i].cumulativeScores = [...tempScores];
    }
}

function renderActionLists() {
    renderPigList();
    renderRottenPigList();
    renderStackList();
}

function renderHistory() {
    if (historyData.length > 0) {
        renderHistoryFromData();
    } else {
        historyList.innerHTML = `
            <div class="history-empty">
                <div class="empty-icon">🃏</div>
                <p>Chưa có dữ liệu ván chơi</p>
            </div>
        `;
    }
}

// ============================================================
// STATS — Cập nhật thống kê
// ============================================================

function updateStats() {
    if (statsRounds) statsRounds.textContent = historyData.length;
    if (statsTotal) {
        const total = scores.reduce((s, p) => s + p, 0);
        statsTotal.textContent = total;
    }
}

// ============================================================
// ROUND MANAGEMENT
// ============================================================

function clearCurrentRound(showNotify = true) {
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];
    toiTrangPlayer = null;

    rottenBlackInput.value = 0;
    rottenRedInput.value = 0;
    rottenTriplePairInput.value = 0;

    renderRankArea();
    renderActionLists();

    if (showNotify) showMessage("Đã làm sạch bàn hiện tại.", "warning");
}

function resetGame() {
    const check = confirm("Xóa toàn bộ dữ liệu bàn này và quay lại thiết lập ban đầu?");
    if (!check) return;

    players = [];
    scores = [0, 0, 0, 0];
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];
    toiTrangPlayer = null;
    roundNumber = 1;
    historyData = [];
    isGameStarted = false;

    // Ẩn bottom nav, chuyển về tab Setup
    bottomNav.classList.remove("visible");
    switchTab("tabSetup");

    document.getElementById("player1").value = "";
    document.getElementById("player2").value = "";
    document.getElementById("player3").value = "";
    document.getElementById("player4").value = "";

    betSelect.value = "3-6";
    lowBetInput.value = "";
    highBetInput.value = "";
    toiTrangMultiplierSelect.value = "2";
    gietMultiplierSelect.value = "2";
    customBetBox.classList.add("hidden");

    // Reset in-game bet
    ingameBetSelect.value = "3-6";
    ingameLowBet.value = "";
    ingameHighBet.value = "";
    ingameCustomBetBox.classList.add("hidden");

    clearSavedGameData();
}

// ============================================================
// LOCAL STORAGE — Lưu & Khôi phục
// ============================================================

function saveGameData() {
    const gameData = {
        players: players,
        scores: scores,
        roundNumber: roundNumber,
        betValue: betSelect.value,
        lowBet: lowBetInput.value,
        highBet: highBetInput.value,
        toiTrangMultiplierValue: toiTrangMultiplierSelect.value,
        gietMultiplierValue: gietMultiplierSelect.value,
        historyData: historyData,
        ingameBetValue: ingameBetSelect.value,
        ingameLowBetVal: ingameLowBet.value,
        ingameHighBetVal: ingameHighBet.value
    };
    localStorage.setItem("tienLenScoreData", JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = localStorage.getItem("tienLenScoreData");
    if (!savedData) return;

    const gameData = JSON.parse(savedData);
    players = gameData.players || [];
    scores = gameData.scores || [0, 0, 0, 0];
    roundNumber = gameData.roundNumber || 1;
    historyData = gameData.historyData || [];

    betSelect.value = gameData.betValue || "3-6";
    lowBetInput.value = gameData.lowBet || "";
    highBetInput.value = gameData.highBet || "";
    toiTrangMultiplierSelect.value = gameData.toiTrangMultiplierValue || "2";
    gietMultiplierSelect.value = gameData.gietMultiplierValue || "2";

    if (betSelect.value === "custom") customBetBox.classList.remove("hidden");
    else customBetBox.classList.add("hidden");

    // Restore in-game bet
    ingameBetSelect.value = gameData.ingameBetValue || gameData.betValue || "3-6";
    ingameLowBet.value = gameData.ingameLowBetVal || "";
    ingameHighBet.value = gameData.ingameHighBetVal || "";
    if (ingameBetSelect.value === "custom") ingameCustomBetBox.classList.remove("hidden");
    else ingameCustomBetBox.classList.add("hidden");

    if (players.length === 4) {
        isGameStarted = true;

        // Hiện bottom nav và chuyển sang tab Game
        bottomNav.classList.add("visible");
        switchTab("tabGame");

        currentBetText.textContent = `Mức cược: ${getBetValues().low} - ${getBetValues().high}`;
        renderRankArea();
        renderAllSelects();
        renderScoreBoard();
        renderActionLists();
        renderHistory();
        updateStats();
        showMessage("Khôi phục bàn chơi dang dở thành công!", "success");
    }
}

function clearSavedGameData() {
    localStorage.removeItem("tienLenScoreData");
}

// === KHỞI CHẠY ===
loadGameData();

// ============================================================
// THEME TOGGLE — Light/Dark Mode
// ============================================================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector(".theme-icon");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = theme === "dark" ? "#000000" : "#f8f9fa";
    }
    localStorage.setItem("tienLenTheme", theme);
}

// Load saved theme or default to light
const savedTheme = localStorage.getItem("tienLenTheme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});

// ============================================================
// RIPPLE EFFECT LOGIC
// ============================================================
document.addEventListener('click', function (e) {
    const target = e.target.closest('.btn, .rank-btn, .nav-tab, .bet-change-btn');
    if (!target) return;

    const circle = document.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;
    const rect = target.getBoundingClientRect();

    // Calculate click coordinates relative to the button
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add('ripple');

    const existingRipple = target.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    target.appendChild(circle);

    setTimeout(() => {
        circle.remove();
    }, 600);
});

// ============================================================
// SCROLL REVEAL LOGIC
// ============================================================
let revealDelay = 0;
let revealTimeout = null;

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${revealDelay}ms`;
            entry.target.classList.add('revealed');

            revealDelay += 60; // Thêm độ trễ để tạo hiệu ứng xếp tầng
            if (revealTimeout) clearTimeout(revealTimeout);
            revealTimeout = setTimeout(() => { revealDelay = 0; }, 150);
        } else {
            entry.target.style.transitionDelay = '0ms';
            entry.target.classList.remove('revealed');
        }
    });
}, { threshold: 0.05 });

function observeElements() {
    document.querySelectorAll('.card, .player-card, .history-item, .extra-box, .mini-box').forEach((el) => {
        if (!el.classList.contains('reveal-item')) {
            el.classList.add('reveal-item');
            revealObserver.observe(el);
        }
    });
}

const mutationObserver = new MutationObserver((mutations) => {
    let shouldObserve = false;
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) shouldObserve = true;
    });
    if (shouldObserve) {
        observeElements();
    }
});
mutationObserver.observe(document.body, { childList: true, subtree: true });
observeElements();

// ============================================================
// SMOOTH ACCORDION (DETAILS) LOGIC - OPTIMIZED
// ============================================================
document.querySelectorAll('details').forEach((el) => {
    const summary = el.querySelector('summary');
    const content = el.querySelector('.extra-content');
    
    if (content) {
        // Wrap content to perfectly hide padding without stutter
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        wrapper.style.willChange = 'height, opacity, transform';
        wrapper.style.transition = 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        // Move content inside wrapper
        content.parentNode.insertBefore(wrapper, content);
        wrapper.appendChild(content);

        summary.addEventListener('click', (e) => {
            e.preventDefault();

            if (!el.open) {
                // Opening
                el.open = true;
                wrapper.style.height = '0px';
                wrapper.style.opacity = '0';
                wrapper.style.transform = 'translateY(-10px)';
                
                // Force reflow
                void wrapper.offsetHeight;
                
                // Measure exact target height from inner content
                const targetHeight = content.offsetHeight;
                wrapper.style.height = targetHeight + 'px';
                wrapper.style.opacity = '1';
                wrapper.style.transform = 'translateY(0)';

                setTimeout(() => {
                    if (el.open) {
                        wrapper.style.height = 'auto';
                    }
                }, 300);
            } else {
                // Closing
                wrapper.style.height = content.offsetHeight + 'px';
                
                // Force reflow
                void wrapper.offsetHeight;
                
                wrapper.style.height = '0px';
                wrapper.style.opacity = '0';
                wrapper.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    el.open = false;
                }, 300);
            }
        });
    }
});

// ============================================================
// SEGMENTED CONTROL LOGIC
// ============================================================
document.querySelectorAll('.segment-control').forEach(control => {
    const btns = control.querySelectorAll('.segment-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const wrapper = control.closest('.extra-content');
            wrapper.querySelectorAll('.segment-content').forEach(content => {
                content.classList.remove('active');
            });

            const targetId = btn.getAttribute('data-target');
            const targetContent = wrapper.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            const details = wrapper.closest('details');
            if (details && details.open) {
                details.style.height = 'auto';
            }
        });
    });
});

// ============================================================
// STICKY MINI SCOREBOARD OBSERVER
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const scoreSection = document.getElementById("scoreSection");
    const miniScoreboard = document.getElementById("miniScoreboard");
    
    if(scoreSection && miniScoreboard) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Nếu scoreSection đi ra ngoài viewport (khi cuộn xuống), hiện mini scoreboard
                if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                    miniScoreboard.classList.remove("hidden-mini");
                } else {
                    miniScoreboard.classList.add("hidden-mini");
                }
            });
        }, {
            root: null,
            threshold: 0,
            rootMargin: "-64px 0px 0px 0px"
        });

        observer.observe(scoreSection);
    }
});

// ============================================================
// MODAL SYSTEM
// ============================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

function closeModalOutside(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}