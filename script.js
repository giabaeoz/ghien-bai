let players = [];
let scores = [0, 0, 0, 0];
let currentRanks = {};
let pigActions = [];
let rottenPigActions = [];
let stackActions = [];
let roundNumber = 1;

const betSelect = document.getElementById("betSelect");
const customBetBox = document.getElementById("customBetBox");
const lowBetInput = document.getElementById("lowBetInput");
const highBetInput = document.getElementById("highBetInput");

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

betSelect.addEventListener("change", toggleCustomBetBox);
startBtn.addEventListener("click", startGame);
calculateBtn.addEventListener("click", calculateRound);
clearRoundBtn.addEventListener("click", clearCurrentRound);
resetBtn.addEventListener("click", resetGame);

addPigBtn.addEventListener("click", addPigAction);
addRottenPigBtn.addEventListener("click", addRottenPigAction);
addStackBtn.addEventListener("click", addStackAction);

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
        document.getElementById("player1").value.trim() || "Người chơi 1",
        document.getElementById("player2").value.trim() || "Người chơi 2",
        document.getElementById("player3").value.trim() || "Người chơi 3",
        document.getElementById("player4").value.trim() || "Người chơi 4"
    ];

    scores = [0, 0, 0, 0];
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];
    roundNumber = 1;

    currentBetText.textContent = `${bet.low} - ${bet.high}`;

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

    showMessage("Đã bắt đầu. Hãy chọn thứ hạng cho từng người chơi.", "success");
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
            </div>
        `;

        rankArea.appendChild(card);
    });

    updateRankButtons();
}

function selectRank(playerIndex, rank) {
    for (let key in currentRanks) {
        if (currentRanks[key] === rank) {
            delete currentRanks[key];
        }
    }

    currentRanks[playerIndex] = rank;
    updateRankButtons();
}

function updateRankButtons() {
    const cards = document.querySelectorAll(".player-card");

    cards.forEach((card, playerIndex) => {
        const buttons = card.querySelectorAll(".rank-btn");

        buttons.forEach(button => {
            button.classList.remove("active");

            const text = button.textContent.trim();

            if (
                text === "Nhất" && currentRanks[playerIndex] === "nhat" ||
                text === "Nhì" && currentRanks[playerIndex] === "nhi" ||
                text === "Ba" && currentRanks[playerIndex] === "ba" ||
                text === "Bét" && currentRanks[playerIndex] === "bet"
            ) {
                button.classList.add("active");
            }
        });
    });
}

function renderAllSelects() {
    const selects = [
        cutterSelect,
        victimSelect,
        stackerSelect,
        stackVictimSelect
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

        item.innerHTML = `
            <div class="name">${player}</div>
            <div class="point">${scores[index]}</div>
        `;

        scoreBoard.appendChild(item);
    });

    const totalScore = scores.reduce((sum, point) => sum + point, 0);
    totalScoreText.textContent = totalScore;
}

function getLastCutPointByPlayer(playerIndex) {
    for (let i = stackActions.length - 1; i >= 0; i--) {
        if (stackActions[i].stackerIndex === playerIndex) {
            return stackActions[i].stackPoint;
        }
    }

    for (let i = pigActions.length - 1; i >= 0; i--) {
        if (pigActions[i].cutterIndex === playerIndex) {
            return pigActions[i].pigPoint;
        }
    }

    return 0;
}

function addPigAction() {
    const cutterIndex = Number(cutterSelect.value);
    const victimIndex = Number(victimSelect.value);
    const pigType = pigTypeSelect.value;
    const pigPoint = getSpecialPoint(pigType);

    if (cutterIndex === victimIndex) {
        showMessage("Người chặt và người bị chặt không được trùng nhau.", "error");
        return;
    }

    pigActions.push({
        cutterIndex,
        victimIndex,
        pigType,
        pigPoint
    });

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
            ${players[action.cutterIndex]} chặt ${getSpecialName(action.pigType)} của ${players[action.victimIndex]}
            <br>
            +${action.pigPoint} / -${action.pigPoint}
            <br>
            <button class="remove-btn" onclick="removePigAction(${index})">Xóa</button>
        `;

        pigList.appendChild(item);
    });
}

function removePigAction(index) {
    pigActions.splice(index, 1);
    renderPigList();
}

function addRottenPigAction() {
    const blackCount = Number(rottenBlackInput.value) || 0;
    const redCount = Number(rottenRedInput.value) || 0;
    const triplePairCount = Number(rottenTriplePairInput.value) || 0;

    if (blackCount < 0 || redCount < 0 || triplePairCount < 0) {
        showMessage("Số lượng bị thúi không hợp lệ.", "error");
        return;
    }

    const rottenPoint =
        blackCount * getSpecialPoint("black") +
        redCount * getSpecialPoint("red") +
        triplePairCount * getSpecialPoint("triplePair");

    if (rottenPoint === 0) {
        showMessage("Bạn cần nhập ít nhất một mục bị thúi.", "error");
        return;
    }

    rottenPigActions.push({
        blackCount,
        redCount,
        triplePairCount,
        rottenPoint
    });

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
            Bét thúi: ${action.blackCount} heo đen, ${action.redCount} heo đỏ, ${action.triplePairCount} bộ 3 đôi thông
            <br>
            Người ba +${action.rottenPoint}, người bét -${action.rottenPoint}
            <br>
            <button class="remove-btn" onclick="removeRottenPigAction(${index})">Xóa</button>
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
        showMessage("Người chồng và người bị chồng không được trùng nhau.", "error");
        return;
    }

    const basePoint = getLastCutPointByPlayer(stackVictimIndex);

    if (basePoint === 0) {
        showMessage("Người bị chồng chưa có lượt chặt trước đó.", "error");
        return;
    }

    const addPoint = getSpecialPoint(stackType);
    const stackPoint = basePoint + addPoint;

    stackActions.push({
        stackerIndex,
        stackVictimIndex,
        stackType,
        basePoint,
        addPoint,
        stackPoint
    });

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
            ${players[action.stackerIndex]} chặt chồng ${players[action.stackVictimIndex]}
            <br>
            ${action.basePoint} + ${getSpecialName(action.stackType)} ${action.addPoint} = ${action.stackPoint}
            <br>
            <button class="remove-btn" onclick="removeStackAction(${index})">Xóa</button>
        `;

        stackList.appendChild(item);
    });
}

function removeStackAction(index) {
    stackActions.splice(index, 1);
    renderStackList();
}

function calculateRound() {
    const selectedRanks = Object.values(currentRanks);

    if (selectedRanks.length !== 4) {
        showMessage("Bạn cần chọn đủ Nhất, Nhì, Ba, Bét cho 4 người chơi.", "error");
        return;
    }

    const requiredRanks = ["nhat", "nhi", "ba", "bet"];

    for (let rank of requiredRanks) {
        if (!selectedRanks.includes(rank)) {
            showMessage("Mỗi thứ hạng chỉ được chọn một lần.", "error");
            return;
        }
    }

    const bet = getBetValues();
    const roundScores = [0, 0, 0, 0];

    let thirdPlayerIndex = null;
    let lastPlayerIndex = null;

    for (let playerIndex in currentRanks) {
        const rank = currentRanks[playerIndex];

        if (rank === "nhat") {
            roundScores[playerIndex] += bet.high;
        } else if (rank === "nhi") {
            roundScores[playerIndex] += bet.low;
        } else if (rank === "ba") {
            roundScores[playerIndex] -= bet.low;
            thirdPlayerIndex = Number(playerIndex);
        } else if (rank === "bet") {
            roundScores[playerIndex] -= bet.high;
            lastPlayerIndex = Number(playerIndex);
        }
    }

    pigActions.forEach(action => {
        roundScores[action.cutterIndex] += action.pigPoint;
        roundScores[action.victimIndex] -= action.pigPoint;
    });

    rottenPigActions.forEach(action => {
        roundScores[thirdPlayerIndex] += action.rottenPoint;
        roundScores[lastPlayerIndex] -= action.rottenPoint;
    });

    stackActions.forEach(action => {
        roundScores[action.stackerIndex] += action.stackPoint;
        roundScores[action.stackVictimIndex] -= action.stackPoint;
    });

    const roundTotal = roundScores.reduce((sum, point) => sum + point, 0);

    if (roundTotal !== 0) {
        showMessage(`Điểm bàn này bị sai. Tổng điểm là ${roundTotal}.`, "error");
        return;
    }

    scores = scores.map((score, index) => score + roundScores[index]);

    addHistory(roundScores);
    renderScoreBoard();
    clearCurrentRound(false);

    showMessage("Đã tính điểm. Tổng điểm hợp lệ.", "success");
    roundNumber++;
    saveGameData();
}

function addHistory(roundScores) {
    const rankNames = {
        nhat: "Nhất",
        nhi: "Nhì",
        ba: "Ba",
        bet: "Bét"
    };

    let rankText = "";

    for (let playerIndex in currentRanks) {
        rankText += `${players[playerIndex]}: ${rankNames[currentRanks[playerIndex]]}; `;
    }

    let scoreText = "";

    players.forEach((player, index) => {
        const point = roundScores[index];
        scoreText += point >= 0 ? `${player}: +${point}; ` : `${player}: ${point}; `;
    });

    const item = document.createElement("div");
    item.className = "history-item";

    item.innerHTML = `
        <strong>Bàn ${roundNumber}</strong><br>
        ${rankText}<br>
        Điểm: ${scoreText}
    `;

    if (historyList.querySelector(".action-empty")) {
        historyList.innerHTML = "";
    }

    historyList.prepend(item);
}

function renderActionLists() {
    renderPigList();
    renderRottenPigList();
    renderStackList();
}

function renderHistory() {
    historyList.innerHTML = `<p class="action-empty">Chưa có bàn nào.</p>`;
}

function clearCurrentRound(showNotify = true) {
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];

    rottenBlackInput.value = 0;
    rottenRedInput.value = 0;
    rottenTriplePairInput.value = 0;

    renderRankArea();
    renderActionLists();

    if (showNotify) {
        showMessage("Đã xóa bàn hiện tại.", "warning");
    }
}

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = "message-box";

    if (type === "success") {
        messageBox.classList.add("message-success");
    } else if (type === "error") {
        messageBox.classList.add("message-error");
    } else {
        messageBox.classList.add("message-warning");
    }
}

function resetGame() {
    const check = confirm("Bạn có chắc muốn chơi lại từ đầu không?");

    if (!check) return;

    players = [];
    scores = [0, 0, 0, 0];
    currentRanks = {};
    pigActions = [];
    rottenPigActions = [];
    stackActions = [];
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
        historyHTML: historyList.innerHTML
    };

    localStorage.setItem("tienLenScoreData", JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = localStorage.getItem("tienLenScoreData");

    if (!savedData) {
        return;
    }

    const gameData = JSON.parse(savedData);

    players = gameData.players || [];
    scores = gameData.scores || [0, 0, 0, 0];
    roundNumber = gameData.roundNumber || 1;

    betSelect.value = gameData.betValue || "3-6";
    lowBetInput.value = gameData.lowBet || "";
    highBetInput.value = gameData.highBet || "";

    if (betSelect.value === "custom") {
        customBetBox.classList.remove("hidden");
    } else {
        customBetBox.classList.add("hidden");
    }

    if (players.length === 4) {
        setupSection.classList.add("hidden");
        scoreSection.classList.remove("hidden");
        gameSection.classList.remove("hidden");
        historySection.classList.remove("hidden");
        resetBtn.classList.remove("hidden");

        currentBetText.textContent = `${getBetValues().low} - ${getBetValues().high}`;

        renderRankArea();
        renderAllSelects();
        renderScoreBoard();
        renderActionLists();

        historyList.innerHTML = gameData.historyHTML || `<p class="action-empty">Chưa có bàn nào.</p>`;

        showMessage("Đã khôi phục dữ liệu ván chơi trước đó.", "success");
    }
}

function clearSavedGameData() {
    localStorage.removeItem("tienLenScoreData");
}

loadGameData();