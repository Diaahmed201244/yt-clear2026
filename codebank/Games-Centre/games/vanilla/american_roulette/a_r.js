let nums = ["00", 27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2,0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1];
let two2oneNums = [
	[3,6,9,12,15,18,21,24,27,30,33,36],
	[2,5,8,11,14,17,20,23,26,29,32,35],
	[1,4,7,10,13,16,19,22,25,28,31,34]
];
let thirdsNums = [
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
	[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
];
let redNums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
let blackNums = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
let oddNums = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35];
let evenNums = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36];
let firstHalfNums = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
let secondHalfNums = [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];

const roll = document.querySelector(".roll");
const wheel = document.querySelector("#rouletteWheel");
const evenBtn = document.querySelector(".even");
const oddBtn = document.querySelector(".odd");
const blackBtn = document.querySelector(".black");
const redBtn = document.querySelector(".red");
const firstHalf = document.querySelector(".firstHalf");
const secondHalf = document.querySelector(".secondHalf");
const firstThird = document.querySelector(".firstThird");
const secondThird = document.querySelector(".secondThird");
const lastThird = document.querySelector(".lastThird");
const ballAnim = document.querySelector(".ballAnim");
const balls = document.querySelectorAll(".ball");
const betBtnsSVG = document.querySelectorAll(".placeBet");
const two2one = document.querySelectorAll(".two2one");

let totalMoney = localStorage.getItem('rouletteBalance') ? parseInt(localStorage.getItem('rouletteBalance')) : 100;
let history = [];

const randInt = (min, max) => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + Math.floor((max - min + 1) * (array[0] / 0x100000000));
  } else {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

betBtnsSVG.forEach((btn) => {
	btn.addEventListener("click", (evt) => {
		btn.classList.toggle("active");
	});
});


function spinWheel() {
	// empty messages
	document.querySelector(".winner").textContent = "";
	document.querySelector("#winnerMsg").textContent = ``;

	// Check balance before spinning
	const bets = document.querySelectorAll(".active");
	const totalBets = bets.length;
	if (totalBets > totalMoney) {
		alert('Insufficient balance to place all bets!');
		return;
	}

	// give us a random angle to end on between 5 and 10 spins
	const winAngle = randInt(1800, 3600);

	// set the animation attribute values to the win angle
	ballAnim.setAttribute("values", `0 50 50; ${winAngle} 50 50`);

	// use the angle to calculate what the winning number is
	const index = Math.round(winAngle / (360 / 38)) % 38;
	const winNumber = nums[index];

	// start the animations
	balls.forEach((ball) => {
		ball.beginElement();
	}, false);

	// deduct money for each bet
	bets.forEach((bet) => {
		totalMoney--;
		updateMoney();
	});
	
	let hasWin = false;

	// run this after a roll delay
	balls[0].addEventListener('endEvent', (event) => {
		// Add to history
		history.push(winNumber);
		if (history.length > 5) history.shift();
		updateHistory();

		// check individual bets
		bets.forEach((bet) => {
			const betNumber = bet.querySelector("text").textContent;
			if (betNumber === winNumber.toString()) {
				totalMoney += 36;
				updateMoney();
				hasWin = true;
				win();
			}
		});

		// how we check our non-individual number winners
    const checkWinner = (elt, arr, winnings = 1) => {
      if (!elt) return;
      if (elt.classList.contains("active")) {
        if (arr.includes(winNumber)) {
          totalMoney += winnings;
          updateMoney();
          hasWin = true;
          win();
        }
      }
    }
		
		checkWinner(redBtn, redNums, 2);
		checkWinner(blackBtn, blackNums, 2);
		checkWinner(evenBtn, evenNums, 2);
		checkWinner(oddBtn, oddNums, 2);
		checkWinner(firstHalf, firstHalfNums, 2);
		checkWinner(secondHalf, secondHalfNums, 2);
		checkWinner(firstThird, thirdsNums[0], 3);
		checkWinner(secondThird, thirdsNums[1], 3);
		checkWinner(lastThird, thirdsNums[2], 3);
		checkWinner(two2one[0], two2oneNums[0], 3);
		checkWinner(two2one[1], two2oneNums[1], 3);
		checkWinner(two2one[2], two2oneNums[2], 3);
		
		document.querySelector(".winner").textContent = winNumber;

		if (!hasWin) {
			lose();
		}

		// Notify dashboard when game ends
		if (window.gameIntegration) {
			window.gameIntegration.gameOver({
				score: totalMoney,
				won: hasWin
			});
		}
	});
}

function updateMoney() {
	document.querySelector(".money").innerHTML = totalMoney;
	localStorage.setItem('rouletteBalance', totalMoney);
}

function confetti(element, options) {
  // Simple confetti using CSS animations
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = '50%';
    confetti.style.top = '0';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '1000';
    confetti.style.animation = 'confetti-fall 3s linear forwards';
    document.body.appendChild(confetti);
    setTimeout(() => document.body.removeChild(confetti), 3000);
  }
}

function win() {
	document.querySelector("#winnerMsg").textContent = `Winner!`;
  confetti(document.querySelector(".confetti"), { spread: window.innerWidth });
}

function lose() {
	document.querySelector("#winnerMsg").textContent = `House wins`;
}

function updateHistory() {
  const histDiv = document.getElementById('history');
  if (histDiv) {
    histDiv.innerHTML = '<h3>Last 5 Spins:</h3>' + history.slice(-5).map(h => `<p>Number: ${h}</p>`).join('');
  }
}

roll.addEventListener("click", spinWheel);
wheel.addEventListener("click", spinWheel);

// Initialize history display
updateHistory();
updateMoney();
// ========================================
// Game Integration - Auto-added
// ========================================
(function() {
    const gameIntegration = window.gameIntegration;
    if (!gameIntegration) {
        console.warn('[Game] gameIntegration not available');
        return;
    }

    // Notify dashboard game is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            gameIntegration.ready();
        });
    } else {
        gameIntegration.ready();
    }

    // Track when game should end
    // You may need to manually call gameIntegration.gameOver({ score: X, won: true/false })
    // when your game ends
    console.log('[Game] Integration active - remember to call gameIntegration.gameOver() when game ends');
})();