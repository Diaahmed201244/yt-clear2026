// Millcode Game Engine - Core Logic with Anti-Cheat Systems
class MillcodeGame {
    constructor() {
        this.state = {
            level: 1,
            questionIndex: 0,
            score: 0,
            questions: [],
            currentQuestion: null,
            gameActive: false,
            timer: null,
            timeLeft: 0,
            startTime: 0,
            answers: [],
            suspicionMetrics: {
                blurCount: 0,
                tabSwitches: 0,
                copyPasteEvents: 0,
                rightClickCount: 0,
                consistentTiming: [],
                perfectAccuracy: 0,
                totalQuestions: 0
            },
            lifelines: {
                fiftyFifty: true,
                phoneFriend: true,
                askAI: true
            },
            challenges: {
                lastChallenge: 0,
                challengeFrequency: 0
            }
        };

        this.timerConfig = {
            1: { time: 15, penalty: 'none' },
            2: { time: 15, penalty: 'none' },
            3: { time: 14, penalty: 'none' },
            4: { time: 13, penalty: 'hide_one' },
            5: { time: 12, penalty: 'hide_one' },
            6: { time: 12, penalty: 'hide_one' },
            7: { time: 11, penalty: 'hide_two' },
            8: { time: 10, penalty: 'hide_two' },
            9: { time: 10, penalty: 'hide_two' },
            10: { time: 9, penalty: 'random_hide' },
            11: { time: 9, penalty: 'random_hide' },
            12: { time: 8, penalty: 'random_hide' },
            13: { time: 8, penalty: 'shake_screen' },
            14: { time: 7, penalty: 'shake_screen' },
            15: { time: 6, penalty: 'shake_screen' }
        };

        this.questionTypes = {
            TEXT: 'text',
            IMAGE: 'image',
            AUDIO: 'audio',
            LOGIC: 'logic',
            MATH: 'math'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAntiCheat();
        this.loadGame();
    }

    setupEventListeners() {
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target.dataset.answer));
        });

        // Lifelines
        document.getElementById('lifeline-5050').addEventListener('click', () => this.useLifeline('fiftyFifty'));
        document.getElementById('lifeline-friend').addEventListener('click', () => this.useLifeline('phoneFriend'));
        document.getElementById('lifeline-ai').addEventListener('click', () => this.useLifeline('askAI'));

        // Modal buttons
        document.getElementById('modal-confirm').addEventListener('click', () => this.handleModalConfirm());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());

        // Challenge buttons
        document.getElementById('challenge-submit').addEventListener('click', () => this.handleChallengeSubmit());
        document.getElementById('challenge-skip').addEventListener('click', () => this.handleChallengeSkip());

        // Window events for anti-cheat
        window.addEventListener('beforeunload', (e) => {
            if (this.state.gameActive) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupAntiCheat() {
        // Tab switching detection
        let lastFocusTime = Date.now();
        
        window.addEventListener('blur', () => {
            this.state.suspicionMetrics.blurCount++;
            lastFocusTime = Date.now();
            
            if (this.state.suspicionMetrics.blurCount >= 2) {
                this.showWarning("لا يمكن مغادرة اللعبة أثناء السؤال!");
                this.pauseGame();
            }
            
            if (this.state.suspicionMetrics.blurCount >= 3) {
                this.disqualifyPlayer("تم اكتشاف محاولة غش - مغادرة اللعبة متكررة");
            }
        });

        window.addEventListener('focus', () => {
            if (this.state.gameActive && this.state.timeLeft > 0) {
                const timeLost = Date.now() - lastFocusTime;
                if (timeLost > 1000) { // Lost more than 1 second
                    this.state.timeLeft = Math.max(0, this.state.timeLeft - Math.floor(timeLost / 1000));
                    this.updateTimerDisplay();
                }
            }
        });

        // Tab visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.markSuspiciousActivity('tab_hidden');
            }
        });

        // Copy/paste detection
        document.addEventListener('copy', () => this.markSuspiciousActivity('copy'));
        document.addEventListener('paste', () => this.markSuspiciousActivity('paste'));
        document.addEventListener('contextmenu', (e) => {
            this.state.suspicionMetrics.rightClickCount++;
            if (this.state.suspicionMetrics.rightClickCount > 5) {
                this.markSuspiciousActivity('excessive_right_click');
            }
        });

        // Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                this.markSuspiciousActivity('keyboard_shortcut');
            }
        });
    }

    markSuspiciousActivity(type) {
        console.warn(`Suspicious activity detected: ${type}`);
        // Log for analysis but don't immediately penalize
    }

    async loadGame() {
        this.showLoading(true);
        
        try { 
            // Load questions from external APIs
            await this.loadQuestions();
            this.showLoading(false);
            this.startGame();
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.showModal('خطأ في التحميل', 'فشل تحميل الأسئلة. يرجى التحقق من الاتصال بالإنترنت.', false);
        }
    }

    async loadQuestions() {
        const questionLoader = new QuestionLoader();
        this.state.questions = await questionLoader.loadQuestions();
        
        if (this.state.questions.length === 0) {
            throw new Error('No questions loaded');
        }
    }

    startGame() {
        this.state.gameActive = true;
        this.state.level = 1;
        this.state.questionIndex = 0;
        this.state.score = 0;
        this.state.answers = [];
        this.state.suspicionMetrics = {
            blurCount: 0,
            tabSwitches: 0,
            copyPasteEvents: 0,
            rightClickCount: 0,
            consistentTiming: [],
            perfectAccuracy: 0,
            totalQuestions: 0
        };

        this.updateUI();
        this.loadNextQuestion();
    }

    loadNextQuestion() {
        if (this.state.questionIndex >= this.state.questions.length) {
            this.endGame(true);
            return;
        }

        this.state.currentQuestion = this.state.questions[this.state.questionIndex];
        this.state.questionIndex++;
        this.state.startTime = Date.now();
        
        // Check for challenge
        if (this.shouldShowChallenge()) {
            this.showChallenge();
            return;
        }

        this.renderQuestion();
        this.startTimer();
    }

    shouldShowChallenge() {
        const now = Date.now();
        const timeSinceLastChallenge = now - this.state.challenges.lastChallenge;
        const minTimeBetweenChallenges = 60000; // 1 minute
        
        // Show challenge every 3-5 questions or if suspicious activity detected
        const shouldShowByCount = this.state.questionIndex % Math.floor(3 + Math.random() * 3) === 0;
        const shouldShowBySuspicion = this.state.suspicionMetrics.blurCount > 0 || 
                                     this.state.suspicionMetrics.copyPasteEvents > 2;

        return (shouldShowByCount || shouldShowBySuspicion) && 
               timeSinceLastChallenge > minTimeBetweenChallenges;
    }

    showChallenge() {
        const challengeType = this.getRandomChallenge();
        this.state.challenges.lastChallenge = Date.now();
        
        const challengeContainer = document.getElementById('challenge-container');
        const challengeTitle = document.getElementById('challenge-title');
        const challengeBody = document.getElementById('challenge-body');
        
        challengeTitle.textContent = 'تحدي التحقق';
        challengeBody.innerHTML = this.renderChallenge(challengeType);
        
        challengeContainer.style.display = 'flex';
    }

    getRandomChallenge() {
        const challenges = ['captcha', 'click_pattern', 'reaction_test'];
        return challenges[Math.floor(Math.random() * challenges.length)];
    }

    renderChallenge(type) {
        switch (type) {
            case 'captcha':
                const num1 = Math.floor(Math.random() * 10);
                const num2 = Math.floor(Math.random() * 10);
                return `
                    <p>لإثبات أنك إنسان، أجب عن هذا السؤال:</p>
                    <div class="math-equation">${num1} + ${num2} = ?</div>
                    <input type="number" id="captcha-answer" placeholder="أدخل الإجابة">
                `;
            
            case 'click_pattern':
                return `
                    <p>انقر على الأرقام بالترتيب:</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
                        <button class="pattern-btn" data-num="1">1</button>
                        <button class="pattern-btn" data-num="2">2</button>
                        <button class="pattern-btn" data-num="3">3</button>
                        <button class="pattern-btn" data-num="4">4</button>
                        <button class="pattern-btn" data-num="5">5</button>
                    </div>
                    <div id="pattern-feedback" style="margin-top: 10px; color: var(--text-muted);"></div>
                `;
            
            case 'reaction_test':
                return `
                    <p>انتظر حتى يصبح الدائرة خضراء، ثم انقر بسرعة!</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div id="reaction-circle" style="width: 100px; height: 100px; background: red; border-radius: 50%; margin: 0 auto; transition: background 2s;"></div>
                    </div>
                `;
        }
    }

    handleChallengeSubmit() {
        const challengeContainer = document.getElementById('challenge-container');
        const challengeType = this.getRandomChallenge();
        
        // For now, just pass the challenge
        challengeContainer.style.display = 'none';
        this.renderQuestion();
        this.startTimer();
    }

    handleChallengeSkip() {
        this.disqualifyPlayer("تم رفض التحقق من الهوية");
    }

    renderQuestion() {
        const question = this.state.currentQuestion;
        
        // Update question header
        document.getElementById('question-number').textContent = `السؤال ${this.state.questionIndex}`;
        document.getElementById('question-category').textContent = this.getCategoryName(question.category);
        
        // Render question text
        const questionText = document.getElementById('question-text');
        questionText.innerHTML = this.escapeHtml(question.question);
        
        // Render answers
        const answers = [question.correct_answer, ...question.incorrect_answers];
        this.shuffleArray(answers);
        
        const answerButtons = ['A', 'B', 'C', 'D'];
        answerButtons.forEach((letter, index) => {
            const btn = document.getElementById(`answer-${letter}`);
            const textSpan = document.getElementById(`answer-text-${letter}`);
            
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong', 'selected');
            btn.style.display = 'block';
            
            textSpan.textContent = this.escapeHtml(answers[index]);
            btn.dataset.answerText = answers[index];
        });

        // Update lifelines
        this.updateLifelines();
        
        // Update level display
        document.getElementById('current-level').textContent = this.state.level;
        
        // Check if final level protection needed
        if (this.state.level === 15) {
            this.applyFinalLevelProtection();
        }
    }

    applyFinalLevelProtection() {
        // Disable all lifelines for final question
        this.state.lifelines.fiftyFifty = false;
        this.state.lifelines.phoneFriend = false;
        this.state.lifelines.askAI = false;
        this.updateLifelines();
        
        // Reduce timer to 5 seconds
        this.state.timeLeft = 5;
        this.updateTimerDisplay();
    }

    startTimer() {
        const config = this.timerConfig[this.state.level];
        this.state.timeLeft = config.time;
        
        this.updateTimerDisplay();
        
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }

        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerDisplay();
            
            // Apply penalties based on level config
            if (this.state.timeLeft <= this.state.timeLeft * 0.5) {
                this.applyPenalty(config.penalty);
            }
            
            if (this.state.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerBar = document.getElementById('timer-bar');
        const config = this.timerConfig[this.state.level];
        
        timerText.textContent = this.state.timeLeft;
        
        // Update timer bar color and width
        const percentage = (this.state.timeLeft / config.time) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (this.state.timeLeft <= 5) {
            timerBar.style.background = 'linear-gradient(90deg, var(--danger-color), var(--warning-color))';
            timerText.style.color = 'var(--danger-color)';
            document.body.classList.add('shake-screen');
        } else if (this.state.timeLeft <= 10) {
            timerBar.style.background = 'linear-gradient(90deg, var(--warning-color), var(--gold-color))';
            timerText.style.color = 'var(--warning-color)';
        } else {
            timerBar.style.background = 'linear-gradient(90deg, var(--gold-color), var(--gold-dark))';
            timerText.style.color = 'var(--text-color)';
        }
    }

    applyPenalty(penalty) {
        switch (penalty) {
            case 'hide_one':
                this.hideRandomAnswer(1);
                break;
            case 'hide_two':
                this.hideRandomAnswer(2);
                break;
            case 'random_hide':
                if (Math.random() > 0.5) this.hideRandomAnswer(1);
                break;
            case 'shake_screen':
                document.body.classList.add('shake-screen');
                break;
        }
    }

    hideRandomAnswer(count) {
        const visibleAnswers = document.querySelectorAll('.answer-btn:not(.hide-option)');
        const answersToHide = Array.from(visibleAnswers).slice(0, count);
        
        answersToHide.forEach(btn => {
            btn.classList.add('hide-option');
        });
    }

    handleAnswer(selectedAnswer) {
        if (!this.state.gameActive) return;

        clearInterval(this.state.timer);
        
        const answerTime = Date.now() - this.state.startTime;
        this.state.suspicionMetrics.totalQuestions++;
        
        const correctAnswer = this.state.currentQuestion.correct_answer;
        const isCorrect = selectedAnswer === correctAnswer;
        
        // Update answer tracking
        this.state.answers.push({
            question: this.state.currentQuestion.question,
            selected: selectedAnswer,
            correct: correctAnswer,
            time: answerTime,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            this.state.suspicionMetrics.perfectAccuracy++;
        }

        // Show answer result
        this.showAnswerResult(selectedAnswer, isCorrect);
        
        // Calculate score
        const scoreData = this.calculateScore(answerTime);
        
        if (isCorrect) {
            this.state.score += scoreData.reward;
            this.updateScoreDisplay();
            
            // Check for level progression
            if (this.state.questionIndex % 5 === 0) {
                this.state.level++;
                if (this.state.level <= 15) {
                    this.showLevelUp(scoreData);
                    return;
                }
            }
            
            // Continue to next question
            setTimeout(() => {
                this.loadNextQuestion();
            }, 2000);
        } else {
            this.endGame(false);
        }
    }

    calculateScore(answerTimeMs) {
        const seconds = answerTimeMs / 1000;
        const baseReward = this.state.level * 1000;
        
        if (seconds <= 3) {
            return { 
                reward: baseReward * 3, 
                multiplier: 3,
                label: "⚡ إجابة برقية!"
            };
        } else if (seconds <= 6) {
            return { 
                reward: baseReward * 2, 
                multiplier: 2,
                label: "✓ إجابة سريعة"
            };
        } else if (seconds <= 10) {
            return { 
                reward: baseReward, 
                multiplier: 1,
                label: "✓ إجابة صحيحة"
            };
        } else {
            return { 
                reward: baseReward * 0.5, 
                multiplier: 0.5,
                label: "⚠️ إجابة بطيئة",
                warning: "التأخر يقلل المكافأة"
            };
        }
    }

    showAnswerResult(selectedAnswer, isCorrect) {
        const correctAnswer = this.state.currentQuestion.correct_answer;
        
        // Highlight correct answer
        document.getElementById(`answer-${correctAnswer}`).classList.add('correct');
        
        if (!isCorrect) {
            // Highlight wrong answer
            document.getElementById(`answer-${selectedAnswer}`).classList.add('wrong');
        }
    }

    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.state.score.toLocaleString();
    }

    updateLifelines() {
        document.getElementById('lifeline-5050').disabled = !this.state.lifelines.fiftyFifty;
        document.getElementById('lifeline-friend').disabled = !this.state.lifelines.phoneFriend;
        document.getElementById('lifeline-ai').disabled = !this.state.lifelines.askAI;
    }

    useLifeline(type) {
        switch (type) {
            case 'fiftyFifty':
                this.useFiftyFifty();
                break;
            case 'phoneFriend':
                this.usePhoneFriend();
                break;
            case 'askAI':
                this.useAskAI();
                break;
        }
    }

    useFiftyFifty() {
        this.state.lifelines.fiftyFifty = false;
        this.updateLifelines();
        
        // Hide 2 wrong answers
        const correctAnswer = this.state.currentQuestion.correct_answer;
        const wrongAnswers = ['A', 'B', 'C', 'D'].filter(letter => letter !== correctAnswer);
        
        // Randomly hide 2 wrong answers
        this.shuffleArray(wrongAnswers);
        wrongAnswers.slice(0, 2).forEach(letter => {
            document.getElementById(`answer-${letter}`).classList.add('hide-option');
        });
    }

    usePhoneFriend() {
        this.state.lifelines.phoneFriend = false;
        this.updateLifelines();
        
        // Show AI suggestion with typing effect
        const suggestion = this.getAISuggestion();
        this.showModal('اتصال بصديق', suggestion, false);
    }

    useAskAI() {
        this.state.lifelines.askAI = false;
        this.updateLifelines();
        
        // Fetch hint from external API or use predefined logic
        const hint = this.getAIHint();
        this.showModal('مساعدة AI', hint, false);
    }

    getAISuggestion() {
        const answers = ['A', 'B', 'C', 'D'];
        const suggestion = answers[Math.floor(Math.random() * answers.length)];
        return `صديقي يقترح الإجابة: ${suggestion}`;
    }

    getAIHint() {
        return 'هذه مساعدة AI احتمالية صحتها 85%';
    }

    pauseGame() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
    }

    endGame(won) {
        clearInterval(this.state.timer);
        this.state.gameActive = false;
        
        // Validate win legitimacy for final level
        if (won && this.state.level === 15) {
            const validation = this.validateWinLegitimacy();
            if (!validation.approved) {
                won = false;
                this.showModal('تحذير', validation.reason, false);
            }
        }
        
        if (won) {
            this.showModal('مبروك!', `لقد فزت بالمليون! المكافأة: ${this.state.score} كود`, true);
            this.sendReward(this.state.score, true);
        } else {
            const savedScore = Math.floor(this.state.score * 0.5);
            this.showModal('لقد خسرت', `لقد خسرت، لكنك تحفظ ${savedScore} كود`, true);
            this.sendReward(savedScore, false);
        }
    }

    validateWinLegitimacy() {
        const redFlags = [];
        
        // Check 1: Average answer time
        const avgTime = this.state.answers.reduce((a,b) => a + b.time, 0) / this.state.answers.length;
        if (avgTime > 8000) redFlags.push('slow_answers');
        
        // Check 2: Tab switches
        if (this.state.suspicionMetrics.blurCount > 0) redFlags.push('tab_switching');
        
        // Check 3: Perfect accuracy on hard questions
        const hardQuestionsCorrect = this.state.answers.filter(a => a.isCorrect).length;
        if (hardQuestionsCorrect === this.state.answers.length) {
            redFlags.push('suspicious_perfection');
        }
        
        // Decision:
        if (redFlags.length >= 2) {
            return { 
                approved: false, 
                reward: 0,
                reason: "تم اكتشاف نشاط مشبوه",
                flags: redFlags
            };
        }
        
        return { approved: true, reward: 1000000 };
    }

    sendReward(amount, finalWin) {
        window.parent.postMessage({
            type: 'millcode:reward',
            amount: amount,
            finalWin: finalWin
        }, '*');
    }

    showModal(title, body, showConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        
        const footer = document.getElementById('modal-footer');
        if (showConfirm) {
            footer.style.display = 'flex';
        } else {
            footer.style.display = 'none';
        }
        
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }

    showWarning(message) {
        this.showModal('تحذير', message, false);
    }

    disqualifyPlayer(reason) {
        this.state.gameActive = false;
        clearInterval(this.state.timer);
        this.showModal('تم الإقصاء', reason, true);
        this.sendReward(0, false);
    }

    showLoading(show) {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (show) {
            loadingScreen.style.display = 'flex';
            gameContainer.style.display = 'none';
        } else {
            loadingScreen.style.display = 'none';
            gameContainer.style.display = 'flex';
        }
    }

    // Utility functions
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    escapeHtml(text) {
        const map = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    getCategoryName(category) {
        const categoryMap = {
            'general_knowledge': 'عام',
            'sports': 'رياضة',
            'music': 'موسيقى',
            'art': 'فن',
            'movies': 'أفلام',
            'politics': 'سياسة'
        };
        return categoryMap[category] || category;
    }

    handleModalConfirm() {
        this.closeModal();
        if (this.state.gameActive) {
            this.loadNextQuestion();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MillcodeGame();
});