let players = [];
let scores = [0, 0, 0, 0];
let currentRanks = {};
let pigActions = [];
let rottenPigActions = [];
let stackActions = [];
let roundNumber = 1;
let toiTrangPlayer = null; 

const betSelect = document.getElementById("betSelect");
const customBetBox = document.getElementById("customBetBox");
const lowBetInput = document.getElementById("lowBetInput");
const highBetInput = document.getElementById("highBetInput");
const toiTrangMultiplierSelect = document.getElementById("toiTrangMultiplierSelect");
const gietMultiplierSelect = document.getElementById("gietMultiplierSelect");

const setupSection = document.getElementById("setupSection");
const scoreSection = document.getElementById("scoreSection");
const gameSection = document.getElementById("gameSection");
const historySection = document.getElementById("historySection");

const startBtn = document.getElementById("startBtn");
const calculateBtn = document.getElementById("calculateBtn");
const clearRoundBtn = document.getElementById("clearRoundBtn");
const resetBtn = document.getElementById("resetBtn");

const rankArea = document.getElementById("rankArea");
const currentBetText = document.getElementById("currentBetText");
const scoreBoard = document.getElementById("scoreBoard");
const totalScoreText = document.getElementById("totalScoreText");
const messageBox = document.getElementById("messageBox");
const historyList = document.getElementById("historyList");

const cutterSelect = document.getElementById("cutterSelect");
const victimSelect = document.getElementById("victimSelect");
const pigTypeSelect = document.getElementById("pigTypeSelect");
const addPigBtn = document.getElementById("addPigBtn");
const pigList = document.getElementById("pigList");

const rottenWinnerSelect = document.getElementById("rottenWinnerSelect");
const rottenVictimSelect = document.getElementById("rottenVictimSelect");
const rottenBlackInput = document.getElementById("rottenBlackInput");
const rottenRedInput = document.getElementById("rottenRedInput");
const rottenTriplePairInput = document.getElementById("rottenTriplePairInput");
const addRottenPigBtn = document.getElementById("addRottenPigBtn");
const rottenPigList = document.getElementById("rottenPigList");

const stackerSelect = document.getElementById("stackerSelect");
const stackVictimSelect = document.getElementById("stackVictimSelect");
const stackAddSelect = document.getElementById("stackAddSelect");
const addStackBtn = document.getElementById("addStackBtn");
const stackList = document.getElementById("stackList");

// Chức năng mới: Manual Adjust
const manualPlayerSelect = document.getElementById("manualPlayerSelect");
const manualPointInput = document.getElementById("manualPointInput");
const manualAdjustBtn = document.getElementById("manualAdjustBtn");

betSelect.addEventListener("change", toggleCustomBetBox);
startBtn.addEventListener("click", startGame);
calculateBtn.addEventListener("click", calculateRound);
clearRoundBtn.addEventListener("click", clearCurrentRound);
resetBtn.addEventListener("click", resetGame);

addPigBtn.addEventListener("click", addPigAction);
addRottenPigBtn.addEventListener("click", addRottenPigAction);
addStackBtn.addEventListener("click", addStackAction);
manualAdjustBtn.addEventListener("click", manualAdjustScore);

function toggleCustomBetBox() {
    if (betSelect.value === "custom") {
        customBetBox.classList.remove("hidden");
    } else {
        customBetBox.classList.add("hidden");
    }
}

function getBetValues() {
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

function getSpecialPoint(type) {
    const bet = getBetValues();
    if (type === "black") return bet.low;
    if (type === "red") return bet.high;
    if (type === "triplePair") return bet.high;
    if (type === "fourKind") return bet.high;
    return 0;
}

function getSpecialName(type) {
    if (type === "black") return "heo đen";
    if (type === "red") return "heo đỏ";
    if (type === "triplePair") return "3 đôi thông";
    if (type === "fourKind") return "tứ quý";
    return "";
}

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

    currentBetText.textContent = `Mức cược: ${bet.low} - ${bet.high}`;

    setupSection.classList.add("hidden");
    scoreSection.classList.remove("hidden");
    gameSection.classList.remove("hidden");
    historySection.classList.remove("hidden");
    resetBtn.classList.remove("hidden");

    renderRankArea();
    renderAllSelects();
    renderScoreBoard();
    renderActionLists();
    renderHistory();

    showMessage("Chia bài thôi! Hãy chọn kết quả sau khi ván kết thúc.", "success");
    saveGameData();
}

function renderRankArea() {
    rankArea.innerHTML = "";

    players.forEach((player, index) => {
        const card = document.createElement("div");
        card.className = "player-card";

        card.innerHTML = `
            <div class="player-name">${player}</div>
            <div class="rank-buttons">
                <button class="rank-btn" onclick="selectRank(${index}, 'nhat')">Nhất</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'nhi')">Nhì</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'ba')">Ba</button>
                <button class="rank-btn" onclick="selectRank(${index}, 'bet')">Bét</button>
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

function renderScoreBoard() {
    scoreBoard.innerHTML = "";
    players.forEach((player, index) => {
        const item = document.createElement("div");
        item.className = "player-score";
        
        // Gán màu điểm
        let colorClass = "text-neutral";
        if (scores[index] > 0) colorClass = "text-win";
        else if (scores[index] < 0) colorClass = "text-lose";

        item.innerHTML = `
            <div class="name">${player}</div>
            <div class="point ${colorClass}">${scores[index]}</div>
        `;
        scoreBoard.appendChild(item);
    });
    const totalScore = scores.reduce((sum, point) => sum + point, 0);
    totalScoreText.textContent = totalScore;
}

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
}

function renderPigList() {
    pigList.innerHTML = "";
    if (pigActions.length === 0) {
        pigList.innerHTML = `<p class="action-empty">Chưa có chặt heo.</p>`;
        return;
    }
    pigActions.forEach((action, index) => {
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div><strong>${players[action.cutterIndex]}</strong> chém ${getSpecialName(action.pigType)} <strong>${players[action.victimIndex]}</strong></div>
            <button class="remove-btn" onclick="removePigAction(${index})">X</button>
        `;
        pigList.appendChild(item);
    });
}

function removePigAction(index) {
    pigActions.splice(index, 1);
    renderPigList();
}

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
}

function renderRottenPigList() {
    rottenPigList.innerHTML = "";
    if (rottenPigActions.length === 0) {
        rottenPigList.innerHTML = `<p class="action-empty">Chưa có thúi heo.</p>`;
        return;
    }
    rottenPigActions.forEach((action, index) => {
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div><strong>${players[action.victimIndex]}</strong> thúi heo, đền cho <strong>${players[action.winnerIndex]}</strong></div>
            <button class="remove-btn" onclick="removeRottenPigAction(${index})">X</button>
        `;
        rottenPigList.appendChild(item);
    });
}

function removeRottenPigAction(index) {
    rottenPigActions.splice(index, 1);
    renderRottenPigList();
}

function addStackAction() {
    const stackerIndex = Number(stackerSelect.value);
    const stackVictimIndex = Number(stackVictimSelect.value);
    const stackType = stackAddSelect.value;

    if (stackerIndex === stackVictimIndex) {
        showMessage("Người chồng và bị chồng không được trùng nhau.", "error");
        return;
    }

    const basePoint = getLastCutPointByPlayer(stackVictimIndex);
    if (basePoint === 0) {
        showMessage("Người bị chồng chưa có lượt chặt trước đó để tạo thành vòng chồng.", "error");
        return;
    }

    const addPoint = getSpecialPoint(stackType);
    const stackPoint = basePoint + addPoint;

    stackActions.push({ stackerIndex, stackVictimIndex, stackType, basePoint, addPoint, stackPoint });
    renderStackList();
    showMessage("Đã thêm chặt chồng.", "success");
}

function renderStackList() {
    stackList.innerHTML = "";
    if (stackActions.length === 0) {
        stackList.innerHTML = `<p class="action-empty">Chưa có chặt chồng.</p>`;
        return;
    }
    stackActions.forEach((action, index) => {
        const item = document.createElement("div");
        item.className = "action-item";
        item.innerHTML = `
            <div><strong>${players[action.stackerIndex]}</strong> chồng lên <strong>${players[action.stackVictimIndex]}</strong></div>
            <button class="remove-btn" onclick="removeStackAction(${index})">X</button>
        `;
        stackList.appendChild(item);
    });
}

function removeStackAction(index) {
    stackActions.splice(index, 1);
    renderStackList();
}

// LOGIC CHÍNH: TÍNH ĐIỂM
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

    pigActions.forEach(action => {
        roundScores[action.cutterIndex] += action.pigPoint;
        roundScores[action.victimIndex] -= action.pigPoint;
    });

    if (toiTrangPlayer === null) {
        rottenPigActions.forEach(action => {
            roundScores[action.winnerIndex] += action.rottenPoint;
            roundScores[action.victimIndex] -= action.rottenPoint;
        });
    }

    stackActions.forEach(action => {
        roundScores[action.stackerIndex] += action.stackPoint;
        roundScores[action.stackVictimIndex] -= action.stackPoint;
    });

    const roundTotal = roundScores.reduce((sum, point) => sum + point, 0);
    if (roundTotal !== 0) {
        showMessage(`Lỗi tính điểm! Tổng điểm lệch: ${roundTotal}.`, "error");
        return;
    }

    scores = scores.map((score, index) => score + roundScores[index]);

    addHistory(roundScores, rankText, `Bàn ${roundNumber}`);
    renderScoreBoard();
    clearCurrentRound(false);

    showMessage(toiTrangPlayer !== null ? "Thành công: Đã chốt điểm Tới Trắng!" : "Thành công: Đã chốt điểm ván chơi!", "success");
    roundNumber++;
    saveGameData();
}

// LOGIC MỚI: CHỈNH SỬA ĐIỂM THỦ CÔNG
function manualAdjustScore() {
    const pIdx = Number(manualPlayerSelect.value);
    const val = Number(manualPointInput.value);

    if (!val || isNaN(val)) {
        showMessage("Vui lòng nhập số điểm hợp lệ (+ hoặc -).", "error");
        return;
    }

    scores[pIdx] += val;
    
    // Tạo mảng điểm ảo để tái sử dụng hàm in lịch sử
    const fakeRoundScores = [0, 0, 0, 0];
    fakeRoundScores[pIdx] = val;

    addHistory(fakeRoundScores, "Thao tác sửa lỗi", "⚙️ Sửa điểm nhanh");
    
    renderScoreBoard();
    manualPointInput.value = "";
    saveGameData();
    showMessage(`Đã cập nhật ${val > 0 ? '+'+val : val} điểm cho ${players[pIdx]}.`, "success");
}

function addHistory(roundScores, detailText, title) {
    let scoreRows = "";
    players.forEach((player, index) => {
        const point = roundScores[index];
        if (point !== 0) {
            const colorClass = point > 0 ? "text-win" : "text-lose";
            const sign = point > 0 ? "+" : "";
            scoreRows += `
                <div class="history-score-row">
                    <span>${player}</span> 
                    <strong class="${colorClass}">${sign}${point}</strong>
                </div>
            `;
        }
    });

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
        <div class="history-header">
            <span>${title}</span>
        </div>
        <div class="history-detail">${detailText}</div>
        <div class="history-scores">${scoreRows}</div>
    `;

    if (historyList.querySelector(".action-empty")) historyList.innerHTML = "";
    historyList.prepend(item);
}

function renderActionLists() {
    renderPigList();
    renderRottenPigList();
    renderStackList();
}

function renderHistory() {
    historyList.innerHTML = `<p class="action-empty">Chưa có dữ liệu ván chơi.</p>`;
}

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

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "message-box";

    if (type === "success") messageBox.classList.add("message-success");
    else if (type === "error") messageBox.classList.add("message-error");
    else messageBox.classList.add("message-warning");
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

    setupSection.classList.remove("hidden");
    scoreSection.classList.add("hidden");
    gameSection.classList.add("hidden");
    historySection.classList.add("hidden");
    resetBtn.classList.add("hidden");

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

    messageBox.className = "message-box";
    messageBox.textContent = "";
    clearSavedGameData();
}

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
        historyHTML: historyList.innerHTML
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

    betSelect.value = gameData.betValue || "3-6";
    lowBetInput.value = gameData.lowBet || "";
    highBetInput.value = gameData.highBet || "";
    toiTrangMultiplierSelect.value = gameData.toiTrangMultiplierValue || "2"; 
    gietMultiplierSelect.value = gameData.gietMultiplierValue || "2"; 

    if (betSelect.value === "custom") customBetBox.classList.remove("hidden");
    else customBetBox.classList.add("hidden");

    if (players.length === 4) {
        setupSection.classList.add("hidden");
        scoreSection.classList.remove("hidden");
        gameSection.classList.remove("hidden");
        historySection.classList.remove("hidden");
        resetBtn.classList.remove("hidden");

        currentBetText.textContent = `Mức cược: ${getBetValues().low} - ${getBetValues().high}`;
        renderRankArea();
        renderAllSelects();
        renderScoreBoard();
        renderActionLists();
        historyList.innerHTML = gameData.historyHTML || `<p class="action-empty">Chưa có dữ liệu ván chơi.</p>`;
        showMessage("Khôi phục bàn chơi dang dở thành công!", "success");
    }
}

function clearSavedGameData() {
    localStorage.removeItem("tienLenScoreData");
}

loadGameData();