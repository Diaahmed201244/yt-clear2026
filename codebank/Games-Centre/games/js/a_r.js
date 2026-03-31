let nums = ["00", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"];
let wheelNums = [...nums, "0"]; // 38 pockets, 0 at end for American
let two2oneNums = [
  ["3","6","9","12","15","18","21","24","27","30","33","36"], // 3rd column
  ["2","5","8","11","14","17","20","23","26","29","32","35"], // 2nd column
  ["1","4","7","10","13","16","19","22","25","28","31","34"]  // 1st column
];
let thirdsNums = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
  ["25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"]
];
let redNums = ["1","3","5","7","9","12","14","16","18","19","21","23","25","27","30","32","34","36"];
let blackNums = ["2","4","6","8","10","11","13","15","17","20","22","24","26","28","29","31","33","35"];
let oddNums = ["1","3","5","7","9","11","13","15","17","19","21","23","25","27","29","31","33","35"];
let evenNums = ["2","4","6","8","10","12","14","16","18","20","22","24","26","28","30","32","34","36"];
let firstHalfNums = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18"];
let secondHalfNums = ["19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36"];

const roll = document.querySelector(".roll");
const clearBtn = document.querySelector(".clear");
const wheel = document.querySelector("#rouletteWheel");
const betBtnsSVG = document.querySelectorAll(".placeBet");
const two2oneBtns = document.querySelectorAll(".two2one");
const redBtn = document.querySelector(".placeBet.red");
const blackBtn = document.querySelector(".placeBet.black");
const evenBtn = document.querySelector(".placeBet.even");
const oddBtn = document.querySelector(".placeBet.odd");
const firstHalf = document.querySelector(".placeBet.firstHalf");
const secondHalf = document.querySelector(".placeBet.secondHalf");
const firstThird = document.querySelector(".placeBet.firstThird");
const secondThird = document.querySelector(".placeBet.secondThird");
const lastThird = document.querySelector(".placeBet.lastThird");
const ballAnim = document.querySelector(".ballAnim");
const balls = document.querySelectorAll(".ball");
const rotateMe = document.querySelector("#rotateMe");

let betSize = 1;
let totalMoney = localStorage.getItem('rouletteBalance') ? parseInt(localStorage.getItem('rouletteBalance')) : 100;
let history = [];
let chipElements = new Map();

const randInt = (min, max) => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + Math.floor((max - min + 1) * (array[0] / 0x100000000));
  } else {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

function updateChips() {
  chipElements.forEach((elements, btn) => {
    const text = elements[1];
    text.textContent = betSize;
  });
}

betBtnsSVG.forEach((btn) => {
  btn.addEventListener("click", (evt) => {
    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      if (chipElements.has(btn)) {
        chipElements.get(btn).forEach(el => el.remove());
        chipElements.delete(btn);
      }
    } else {
      btn.classList.add("active");
      const chip = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      chip.setAttribute('cx', btn.querySelector('text') ? btn.querySelector('text').getAttribute('x') : '5');
      chip.setAttribute('cy', btn.querySelector('text') ? btn.querySelector('text').getAttribute('y') : '5');
      chip.setAttribute('r', '4');
      chip.setAttribute('fill', 'blue');
      btn.appendChild(chip);

      const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      text.setAttribute('x', chip.getAttribute('cx'));
      text.setAttribute('y', parseFloat(chip.getAttribute('cy')) + 3);
      text.setAttribute('font-size', '3');
      text.setAttribute('fill', 'white');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = betSize;
      btn.appendChild(text);

      chipElements.set(btn, [chip, text]);
    }
  });
});

clearBtn.addEventListener('click', () => {
  betBtnsSVG.forEach(btn => {
    btn.classList.remove('active');
    if (chipElements.has(btn)) {
      chipElements.get(btn).forEach(el => el.remove());
      chipElements.delete(btn);
    }
  });
  two2oneBtns.forEach(btn => {
    btn.classList.remove('active');
    if (chipElements.has(btn)) {
      chipElements.get(btn).forEach(el => el.remove());
      chipElements.delete(btn);
    }
  });
});

function spinWheel() {
  // Clear previous winners
  document.querySelectorAll('.placeBet, .two2one, text.moneyDot').forEach(el => el.classList.remove('winning'));

  // Check balance
  const allBets = document.querySelectorAll('.placeBet.active, .two2one.active');
  const totalBets = allBets.length * betSize;
  if (totalBets > totalMoney) {
    alert(`Insufficient balance! Total bet: ${totalBets}, Balance: ${totalMoney}`);
    return;
  }

  // Create audio for spin
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Start high
  oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 4); // Ramp down over spin
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 4);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 4);

  // Bet size input
  let betInput = document.getElementById('betSizeInput');
  if (!betInput) {
    betInput = document.createElement('input');
    betInput.id = 'betSizeInput';
    betInput.type = 'number';
    betInput.min = '1';
    betInput.value = betSize;
    betInput.style.position = 'fixed';
    betInput.style.top = '10px';
    betInput.style.right = '10px';
    betInput.style.zIndex = '1000';
    betInput.onchange = (e) => {
      betSize = parseInt(e.target.value) || 1;
      updateChips();
    };
    document.body.appendChild(betInput);
  }

  // Random spins 5-10 full rotations + fraction
  const fullSpins = randInt(5, 10);
  const fraction = randInt(0, 37) / 38 * 360;
  const totalRot = fullSpins * 360 + fraction;
  const index = Math.floor((360 - fraction) / (360 / 38)) % 38;
  const winNumber = wheelNums[index];

  // Animate wheel with easing (use CSS for smooth)
  const wheelAnim = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
  wheelAnim.setAttribute('attributeName', 'transform');
  wheelAnim.setAttribute('attributeType', 'XML');
  wheelAnim.setAttribute('type', 'rotate');
  wheelAnim.setAttribute('values', `0 50 50; -${totalRot} 50 50`);
  wheelAnim.setAttribute('dur', '4s');
  wheelAnim.setAttribute('fill', 'freeze');
  wheelAnim.setAttribute('keySplines', '0.25 0.1 0.25 1; 0.25 0.1 0.25 1'); // Easing for smooth spin
  rotateMe.appendChild(wheelAnim);

  // Ball animation
  ballAnim.setAttribute("values", `0 50 50; -${totalRot + 720} 50 50`); // Ball travels extra
  balls.forEach((ball) => {
    ball.beginElement();
  });

  // Deduct bets
  totalMoney -= totalBets;
  updateMoney();

  let hasWin = false;
  let totalWinnings = 0;

  // Once end event
  balls[0].addEventListener('endEvent', (event) => {
    history.push(winNumber);
    if (history.length > 5) history.shift();
    updateHistory();

    // Clear previous anim
    rotateMe.querySelector('animateTransform')?.remove();

    // Highlight wheel number
    const wheelTexts = wheel.querySelectorAll('text');
    wheelTexts.forEach(text => {
      if (text.textContent === winNumber) {
        text.classList.add('winning');
      }
    });

    // Pre-cache bets for faster check (perf)
    const straightUpBets = new Map();
    document.querySelectorAll('.placeBet:not(.split):not(.street):not(.corner):not(.firstThird):not(.secondThird):not(.lastThird):not(.firstHalf):not(.secondHalf):not(.even):not(.odd):not(.red):not(.black):not(.two2one)').forEach((bet) => {
      if (bet.classList.contains('active')) {
        const betNumber = bet.querySelector('text').textContent;
        straightUpBets.set(betNumber, bet);
      }
    });
    
    const straightBet = straightUpBets.get(winNumber);
    if (straightBet) {
      totalWinnings += 36 * betSize;
      straightBet.classList.add('winning');
      hasWin = true;
    }

    // Split
    document.querySelectorAll('.placeBet.split.active').forEach((bet) => {
      const numbers = bet.getAttribute('data-numbers').split(',');
      if (numbers.includes(winNumber)) {
        totalWinnings += 18 * betSize;
        bet.classList.add('winning');
        hasWin = true;
      }
    });

    // Street
    document.querySelectorAll('.placeBet.street.active').forEach((bet) => {
      const numbers = bet.getAttribute('data-numbers').split(',');
      if (numbers.includes(winNumber)) {
        totalWinnings += 12 * betSize;
        bet.classList.add('winning');
        hasWin = true;
      }
    });

    // Corner
    document.querySelectorAll('.placeBet.corner.active').forEach((bet) => {
      const numbers = bet.getAttribute('data-numbers').split(',');
      if (numbers.includes(winNumber)) {
        totalWinnings += 9 * betSize;
        bet.classList.add('winning');
        hasWin = true;
      }
    });

    // Dozens and columns
    const checkWinner = (btn, arr, payout) => {
      if (btn && btn.classList.contains("active")) {
        if (arr.includes(winNumber)) {
          totalWinnings += payout * betSize;
          btn.classList.add('winning');
          hasWin = true;
        }
      }
    };
    checkWinner(redBtn, redNums, 2);
    checkWinner(blackBtn, blackNums, 2);
    checkWinner(evenBtn, evenNums, 2);
    checkWinner(oddBtn, oddNums, 2);
    checkWinner(firstHalf, firstHalfNums, 2);
    checkWinner(secondHalf, secondHalfNums, 2);
    checkWinner(firstThird, thirdsNums[0], 3);
    checkWinner(secondThird, thirdsNums[1], 3);
    checkWinner(lastThird, thirdsNums[2], 3);
    two2oneBtns.forEach((btn, i) => {
      checkWinner(btn, two2oneNums[i], 3);
    });

    totalMoney += totalWinnings;
    updateMoney();

    document.querySelector("#win").textContent = winNumber;
    document.querySelector("#winnerMsg").textContent = hasWin ? "Winner!" : "House wins";
    if (hasWin) {
      confetti();
    }
  }, {once: true});
}

function updateMoney() {
  document.querySelector(".money").innerHTML = totalMoney;
  localStorage.setItem('rouletteBalance', totalMoney.toString());
}

function confetti() {
  // Canvas-based particles for better perf
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: 0,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      life: 1.0,
      size: Math.random() * 10 + 5
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= 0.01;
      p.vx *= 0.99;
      
      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }
    });
    
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

function updateHistory() {
  const histDiv = document.getElementById('history');
  if (histDiv) {
    histDiv.innerHTML = '<h3>Last 5 Spins:</h3>' + history.slice(-5).map(h => `<p>Number: ${h}</p>`).join('');
  }
}

roll.addEventListener("click", spinWheel);
wheel.addEventListener("click", spinWheel);

updateHistory();
updateMoney();
