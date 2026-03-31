const nums = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, '00'];

const redNums = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const blackNums = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const evenNums = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
const oddNums = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
const lowNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18];
const highNums = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
const firstDozen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const secondDozen = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const thirdDozen = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
const firstColumn = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
const secondColumn = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const thirdColumn = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

let gameMode = 'single';
let players = [{balance: parseInt(localStorage.getItem('rouletteBalance')) || 100}];
let currentPlayer = 0;
let history = JSON.parse(localStorage.getItem('rouletteHistory')) || [];
let playerBets = []; // Array of Maps for each player
let betAmount = 1;
let isSpinning = false;

const moneyEl = document.querySelector('.money');
const balancesEl = document.createElement('div');
balancesEl.id = 'player-balances';
balancesEl.style.margin = '10px';
document.querySelector('.container').appendChild(balancesEl);
const historyEl = document.getElementById('history');
const rollBtn = document.querySelector('.roll');
const clearBtn = document.getElementById('clearBets');
const betInput = document.getElementById('betAmount');
const turnBtn = document.createElement('button');
turnBtn.id = 'turn-btn';
turnBtn.textContent = 'Next Player';
turnBtn.style.display = 'none';
document.querySelector('.bet-controls').appendChild(turnBtn);

updateBalance();
updateBalances();
updateHistory();

betInput.addEventListener('change', (e) => {
  betAmount = Math.max(1, Math.min(parseInt(e.target.value) || 1, players[currentPlayer].balance / 10));
  betInput.value = betAmount;
});

rollBtn.addEventListener('click', spinWheel);

clearBtn.addEventListener('click', clearBets);

turnBtn.addEventListener('click', () => {
  if (gameMode === 'multi') {
    currentPlayer = (currentPlayer + 1) % players.length;
    updatePlayerUI();
  }
});

document.querySelectorAll('.placeBet').forEach(bet => {
  bet.addEventListener('click', () => placeBet(bet));
});

function updatePlayerUI() {
  updateBalance();
  updateBalances();
  // Clear active bets for new player
  document.querySelectorAll('.placeBet').forEach(bet => bet.classList.remove('active'));
  playerBets[currentPlayer] = new Map();
}

function placeBet(betEl) {
  if (isSpinning) return;
  if (players[currentPlayer].balance < betAmount) {
    alert('Insufficient balance!');
    return;
  }
  const id = betEl.id || betEl.querySelector('text').textContent.trim();
  if (!playerBets[currentPlayer]) playerBets[currentPlayer] = new Map();
  const current = playerBets[currentPlayer].get(id) || 0;
  playerBets[currentPlayer].set(id, current + betAmount);
  betEl.classList.add('active');
  updateBetDisplay(betEl, current + betAmount);
  players[currentPlayer].balance -= betAmount;
  updateBalance();
}

function updateBetDisplay(betEl, amount) {
  let display = betEl.querySelector('.bet-amount');
  if (!display) {
    display = document.createElement('text');
    display.classList.add('bet-amount');
    display.setAttribute('fill', '#ffd700');
    display.setAttribute('font-size', '4');
    betEl.appendChild(display);
  }
  display.textContent = amount;
}

function clearBets() {
  playerBets = players.map(() => new Map());
  document.querySelectorAll('.placeBet').forEach(bet => {
    bet.classList.remove('active');
    const display = bet.querySelector('.bet-amount');
    if (display) display.remove();
  });
  // Refund current player's bets
  const currentTotal = Array.from(playerBets[currentPlayer].entries()).reduce((sum, [, amt]) => sum + amt, 0);
  players[currentPlayer].balance += currentTotal;
  updateBalance();
  updateBalances();
}

function spinWheel() {
  if (isSpinning) return;
  // In multi, allow spin after all players bet or per round
  isSpinning = true;
  rollBtn.disabled = true;

  // For multi, aggregate all player bets for spin
  const allBets = new Map();
  playerBets.forEach(pBets => {
    pBets.forEach((amt, id) => {
      allBets.set(id, (allBets.get(id) || 0) + amt);
    });
  });
  if (allBets.size === 0) {
    isSpinning = false;
    rollBtn.disabled = false;
    return;
  }

  const wheel = document.getElementById('rouletteWheel');
  const ball = wheel.querySelector('.ball');
  const angle = Math.random() * 3600 + 1800;
  const finalAngle = angle % 360;
  const winIndex = Math.floor((360 - finalAngle + 85.2) / 9.474);
  const winNumber = nums[winIndex % nums.length];

  wheel.style.transition = 'none';
  wheel.style.transform = `rotate(0deg)`;
  ball.style.transition = 'none';
  ball.style.cy = '5';

  setTimeout(() => {
    wheel.style.transition = `transform 6s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    wheel.style.transform = `rotate(${-angle}deg)`;
    ball.style.transition = 'cy 6s ease-out';
    ball.style.cy = '17';
    ball.beginElement();
  }, 100);

  setTimeout(() => {
    isSpinning = false;
    rollBtn.disabled = false;
    // Clear all bets
    playerBets = players.map(() => new Map());
    document.querySelectorAll('.placeBet').forEach(bet => {
      bet.classList.remove('active');
      const display = bet.querySelector('.bet-amount');
      if (display) display.remove();
    });
    history.unshift(winNumber);
    if (history.length > 5) history.pop();
    localStorage.setItem('rouletteHistory', JSON.stringify(history));
    updateHistory();

    // Payout per player
    playerBets.forEach((pBets, pIndex) => {
      const payout = calculatePayoutForPlayer(winNumber, pBets);
      players[pIndex].balance += payout;
    });
    if (gameMode === 'single') localStorage.setItem('rouletteBalance', players[0].balance);
    updateBalance();
    updateBalances();

    let totalPayout = 0;
    playerBets.forEach(pBets => {
      totalPayout += calculatePayoutForPlayer(winNumber, pBets);
    });

    if (totalPayout > 0) {
      showConfetti();
      highlightWinningBets(winNumber);
    }

    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${-finalAngle}deg)`;

    // Next player in multi
    if (gameMode === 'multi') {
      currentPlayer = (currentPlayer + 1) % players.length;
      updatePlayerUI();
    }
  }, 6100);
}

function calculatePayoutForPlayer(winNumber, pBets) {
  let payout = 0;
  const num = typeof winNumber === 'string' ? winNumber : parseInt(winNumber);
  const isDoubleZero = winNumber === '00';

  pBets.forEach((amount, id) => {
    let multiplier = 0;
    if (id === winNumber.toString()) {
      multiplier = 35; // straight up
    } else if (id === 'RED' && redNums.includes(num) && !isDoubleZero) {
      multiplier = 1; // even money
    } else if (id === 'BLACK' && blackNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === 'EVEN' && evenNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === 'ODD' && oddNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '1 to 18' && lowNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '19 to 36' && highNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '1st 12' && firstDozen.includes(num)) {
      multiplier = 2;
    } else if (id === '2nd 12' && secondDozen.includes(num)) {
      multiplier = 2;
    } else if (id === '3rd 12' && thirdDozen.includes(num)) {
      multiplier = 2;
    } else if (firstColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    } else if (secondColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    } else if (thirdColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    }
    payout += amount * multiplier;
  });

  return payout;
}

function totalPayout() {
  let total = 0;
  playerBets.forEach(pBets => {
    total += calculatePayoutForPlayer(nums[Math.floor(Math.random()*nums.length)], pBets);
  });
  return total;
}

function calculatePayout(winNumber) {
  let payout = 0;
  const num = typeof winNumber === 'string' ? winNumber : parseInt(winNumber);
  const isDoubleZero = winNumber === '00';

  currentBets.forEach((amount, id) => {
    let multiplier = 0;
    if (id === winNumber.toString()) {
      multiplier = 35; // straight up
    } else if (id === 'RED' && redNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === 'BLACK' && blackNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === 'EVEN' && evenNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === 'ODD' && oddNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '1 to 18' && lowNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '19 to 36' && highNums.includes(num) && !isDoubleZero) {
      multiplier = 1;
    } else if (id === '1st 12' && firstDozen.includes(num)) {
      multiplier = 2;
    } else if (id === '2nd 12' && secondDozen.includes(num)) {
      multiplier = 2;
    } else if (id === '3rd 12' && thirdDozen.includes(num)) {
      multiplier = 2;
    } else if (firstColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    } else if (secondColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    } else if (thirdColumn.includes(num) && betEl.classList.contains('two2one')) {
      multiplier = 2;
    }
    payout += amount * multiplier;
  });

  return payout;
}

function updateBalance() {
  moneyEl.textContent = players[currentPlayer].balance;
}

function updateBalances() {
  balancesEl.innerHTML = players.map((p, i) => `<span style="margin-right: 20px; font-weight: ${i === currentPlayer ? 'bold' : 'normal'}">Player ${i+1}: ${p.balance}</span>`).join('');
}

function updateHistory() {
  historyEl.innerHTML = '<strong>Last 5 Spins:</strong> ' + history.slice(0,5).map(n => `<span style="background: #e0e0e0; padding: 2px 5px; margin: 0 2px; border-radius: 3px;">${n}</span>`).join(' ') || 'No spins yet';
}

function showConfetti() {
  const confettiEl = document.querySelector('.confetti');
  confettiEl.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: hsl(${Math.random() * 360}, 100%, 50%);
      pointer-events: none;
      z-index: 1000;
      animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards, confetti-rotate ${Math.random() * 3 + 2}s linear forwards;
      transform-origin: center;
    `;
    confettiEl.appendChild(div);
  }
  setTimeout(() => confettiEl.innerHTML = '', 5000);
}

function highlightWinningBets(winNumber) {
  document.querySelectorAll('.placeBet').forEach(bet => {
    const id = bet.id || bet.querySelector('text').textContent.trim();
    const num = typeof winNumber === 'string' ? winNumber : winNumber.toString();
    if (id === num || // straight
        (redNums.includes(parseInt(winNumber)) && id === 'RED' && num !== '00') ||
        (blackNums.includes(parseInt(winNumber)) && id === 'BLACK' && num !== '00') ||
        (evenNums.includes(parseInt(winNumber)) && id === 'EVEN' && num !== '00') ||
        (oddNums.includes(parseInt(winNumber)) && id === 'ODD' && num !== '00') ||
        (lowNums.includes(parseInt(winNumber)) && id === '1 to 18' && num !== '00') ||
        (highNums.includes(parseInt(winNumber)) && id === '19 to 36' && num !== '00') ||
        (firstDozen.includes(parseInt(winNumber)) && id === '1st 12') ||
        (secondDozen.includes(parseInt(winNumber)) && id === '2nd 12') ||
        (thirdDozen.includes(parseInt(winNumber)) && id === '3rd 12') ||
        (firstColumn.includes(parseInt(winNumber)) && bet.classList.contains('two2one')) ||
        (secondColumn.includes(parseInt(winNumber)) && bet.classList.contains('two2one')) ||
        (thirdColumn.includes(parseInt(winNumber)) && bet.classList.contains('two2one'))) {
      bet.style.background = 'rgba(255, 215, 0, 0.3)';
      bet.style.transition = 'background 0.3s';
      setTimeout(() => bet.style.background = '', 3000);
    }
  });
}