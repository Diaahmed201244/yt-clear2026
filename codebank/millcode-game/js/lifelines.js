// Lifelines System - Enhanced with Anti-Cheat Features
class LifelinesSystem {
    constructor(game) {
        this.game = game;
        this.state = {
            fiftyFiftyUsed: false,
            phoneFriendUsed: false,
            askAIUsed: false,
            friendResponseTime: 0,
            aiResponseTime: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 50:50 Lifeline
        document.getElementById('lifeline-5050').addEventListener('click', () => {
            this.useFiftyFifty();
        });

        // Phone a Friend Lifeline
        document.getElementById('lifeline-friend').addEventListener('click', () => {
            this.usePhoneFriend();
        });

        // Ask AI Lifeline
        document.getElementById('lifeline-ai').addEventListener('click', () => {
            this.useAskAI();
        });
    }

    useFiftyFifty() {
        if (this.state.fiftyFiftyUsed || !this.game.state.gameActive) {
            return;
        }

        this.state.fiftyFiftyUsed = true;
        this.game.state.lifelines.fiftyFifty = false;
        
        // Disable the button
        document.getElementById('lifeline-5050').disabled = true;
        document.getElementById('lifeline-5050').style.opacity = '0.5';

        // Hide 2 wrong answers with animation
        this.animateFiftyFifty();
        
        // Log usage for anti-cheat
        this.logLifelineUsage('fiftyFifty');
    }

    animateFiftyFifty() {
        const correctAnswer = this.game.state.currentQuestion.correct_answer;
        const wrongAnswers = ['A', 'B', 'C', 'D'].filter(letter => letter !== correctAnswer);
        
        // Randomly select 2 wrong answers to hide
        this.game.shuffleArray(wrongAnswers);
        const answersToHide = wrongAnswers.slice(0, 2);

        // Animate hiding with delay
        answersToHide.forEach((letter, index) => {
            setTimeout(() => {
                const btn = document.getElementById(`answer-${letter}`);
                btn.classList.add('hide-option');
                
                // Add shake effect to remaining wrong answer
                if (index === 1) {
                    const remainingWrong = wrongAnswers[2];
                    const remainingBtn = document.getElementById(`answer-${remainingWrong}`);
                    remainingBtn.style.animation = 'wrongShake 0.5s ease-in-out';
                    setTimeout(() => {
                        remainingBtn.style.animation = '';
                    }, 500);
                }
            }, index * 300);
        });
    }

    usePhoneFriend() {
        if (this.state.phoneFriendUsed || !this.game.state.gameActive) {
            return;
        }

        this.state.phoneFriendUsed = true;
        this.game.state.lifelines.phoneFriend = false;
        
        // Disable the button
        document.getElementById('lifeline-friend').disabled = true;
        document.getElementById('lifeline-friend').style.opacity = '0.5';

        // Show phone call animation
        this.showPhoneCallAnimation();
        
        // Simulate friend response with typing effect
        this.simulateFriendResponse();
        
        // Log usage for anti-cheat
        this.logLifelineUsage('phoneFriend');
    }

    showPhoneCallAnimation() {
        const friendBtn = document.getElementById('lifeline-friend');
        friendBtn.innerHTML = '<span class="lifeline-icon">📞</span><span class="lifeline-label">يتصل...</span>';
        
        // Add ringing animation
        friendBtn.style.animation = 'pulse 1s infinite';
    }

    simulateFriendResponse() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');

        // Show modal
        title.textContent = 'اتصال بصديق';
        body.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        footer.style.display = 'none';
        modal.style.display = 'flex';

        // Simulate typing with delay based on question difficulty
        const difficulty = this.game.state.currentQuestion.difficulty;
        let delay = 2000; // Default 2 seconds
        
        if (difficulty === 'hard') delay = 4000;
        else if (difficulty === 'medium') delay = 3000;

        setTimeout(() => {
            const suggestion = this.generateFriendSuggestion();
            body.innerHTML = `
                <div class="friend-response">
                    <p style="color: var(--gold-color); font-weight: 600;">صديقي يقول:</p>
                    <p style="margin-top: 15px; font-size: 1.2rem;">"${suggestion}"</p>
                    <div style="margin-top: 20px; font-size: 0.9rem; color: var(--text-muted);">
                        <p>ملاحظة: هذه مساعدة تقديرية فقط</p>
                        <p>الوقت المتبقي: ${this.game.state.timeLeft} ثانية</p>
                    </div>
                </div>
            `;
            
            // Add close button after response
            footer.style.display = 'flex';
            modal.style.display = 'flex';
            
        }, delay);
    }

    generateFriendSuggestion() {
        const question = this.game.state.currentQuestion;
        const answers = ['A', 'B', 'C', 'D'];
        
        // AI-based suggestion logic with confidence levels
        let suggestion = '';
        let confidence = Math.random();
        
        if (confidence > 0.8) {
            // High confidence - suggest correct answer
            suggestion = `أنا متأكد أن الإجابة الصحيحة هي ${question.correct_answer}`;
        } else if (confidence > 0.6) {
            // Medium confidence - suggest with doubt
            const wrongAnswers = answers.filter(a => a !== question.correct_answer);
            const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            suggestion = `أعتقد أن الإجابة可能是 ${randomWrong}، لكن لست متأكداً تماماً`;
        } else {
            // Low confidence - random guess
            const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
            suggestion = `لا أعرف الإجابة بالتأكيد، لكن قد تكون ${randomAnswer}`;
        }
        
        return suggestion;
    }

    useAskAI() {
        if (this.state.askAIUsed || !this.game.state.gameActive) {
            return;
        }

        this.state.askAIUsed = true;
        this.game.state.lifelines.askAI = false;
        
        // Disable the button
        document.getElementById('lifeline-ai').disabled = true;
        document.getElementById('lifeline-ai').style.opacity = '0.5';

        // Show AI processing animation
        this.showAIProcessingAnimation();
        
        // Fetch AI hint
        this.fetchAIHint();
        
        // Log usage for anti-cheat
        this.logLifelineUsage('askAI');
    }

    showAIProcessingAnimation() {
        const aiBtn = document.getElementById('lifeline-ai');
        aiBtn.innerHTML = '<span class="lifeline-icon">🤖</span><span class="lifeline-label">يُعالج...</span>';
        
        // Add processing animation
        aiBtn.style.background = 'linear-gradient(45deg, #3b82f6, #8b5cf6)';
        aiBtn.style.animation = 'spin 1s linear infinite';
    }

    async fetchAIHint() {
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');

        // Show processing state
        title.textContent = 'مساعدة AI';
        body.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="margin: 0 auto 20px;"></div>
                <p>جاري تحليل السؤال باستخدام الذكاء الاصطناعي...</p>
                <div style="margin-top: 20px; font-size: 0.8rem; color: var(--text-muted);">
                    هذه المساعدة احتمالية صحتها 85%
                </div>
            </div>
        `;
        footer.style.display = 'none';
        modal.style.display = 'flex';

        try { 
            // Simulate API call delay
            await this.delay(2000);
            
            // Generate AI hint
            const hint = this.generateAIHint();
            
            body.innerHTML = `
                <div class="ai-hint">
                    <div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 10px; border: 1px solid #3b82f6;">
                        <h4 style="color: #60a5fa; margin-bottom: 10px;">تحليل AI:</h4>
                        <p style="line-height: 1.6;">${hint.analysis}</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.2); border-radius: 10px; border: 1px solid #22c55e;">
                        <h4 style="color: #22c55e; margin-bottom: 10px;">التوصية:</h4>
                        <p style="font-size: 1.2rem; font-weight: 600;">${hint.recommendation}</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">درجة الثقة: ${hint.confidence}%</p>
                    </div>
                </div>
            `;
            
            footer.style.display = 'flex';
            modal.style.display = 'flex';
            
        } catch (error) {
            console.error('AI hint failed:', error);
            body.innerHTML = `
                <div style="text-align: center; color: var(--danger-color);">
                    <p>فشل في الاتصال بخدمة AI</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">يرجى المحاولة مرة أخرى لاحقاً</p>
                </div>
            `;
            footer.style.display = 'flex';
            modal.style.display = 'flex';
        }
    }

    generateAIHint() {
        const question = this.game.state.currentQuestion;
        const difficulty = question.difficulty;
        
        // AI analysis logic
        let analysis = '';
        let recommendation = '';
        let confidence = 85; // Base confidence

        if (difficulty === 'easy') {
            analysis = 'هذا سؤال سهل نسبياً، معظم الناس يعرفون الإجابة الصحيحة.';
            confidence = 90;
        } else if (difficulty === 'medium') {
            analysis = 'سؤال متوسط الصعوبة يتطلب بعض المعرفة العامة.';
            confidence = 85;
        } else {
            analysis = 'سؤال صعب جداً، حتى الخبراء قد يخطئون في الإجابة.';
            confidence = 75;
        }

        // Generate recommendation
        const answers = ['A', 'B', 'C', 'D'];
        const correctIndex = answers.indexOf(question.correct_answer);
        
        // Add some uncertainty to make it realistic
        if (Math.random() > 0.7) {
            // Sometimes suggest wrong answer to simulate AI error
            const wrongAnswers = answers.filter(a => a !== question.correct_answer);
            const wrongAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            recommendation = `أقترح الإجابة: ${wrongAnswer} (مع احتمال خطأ 15%)`;
            confidence = 70;
        } else {
            recommendation = `أقترح الإجابة: ${question.correct_answer}`;
        }

        return {
            analysis: analysis,
            recommendation: recommendation,
            confidence: confidence
        };
    }

    logLifelineUsage(type) {
        // Log for anti-cheat analysis
        const usageLog = {
            type: type,
            timestamp: Date.now(),
            level: this.game.state.level,
            question: this.game.state.currentQuestion.question.substring(0, 50),
            timeLeft: this.game.state.timeLeft
        };
        
        console.log('Lifeline used:', usageLog);
        
        // Check for suspicious patterns
        this.checkSuspiciousLifelineUsage(type);
    }

    checkSuspiciousLifelineUsage(type) {
        // Anti-cheat: Check if player uses lifelines too frequently
        const totalQuestions = this.game.state.questionIndex;
        const lifelineUsageCount = Object.values(this.state).filter(used => used).length;
        
        if (totalQuestions > 0) {
            const usageRate = lifelineUsageCount / totalQuestions;
            
            if (usageRate > 0.6) { // Using lifelines in 60% of questions
                this.game.markSuspiciousActivity('excessive_lifeline_usage');
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Reset lifelines for new game
    reset() {
        this.state = {
            fiftyFiftyUsed: false,
            phoneFriendUsed: false,
            askAIUsed: false,
            friendResponseTime: 0,
            aiResponseTime: 0
        };

        // Re-enable buttons
        const buttons = ['lifeline-5050', 'lifeline-friend', 'lifeline-ai'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.animation = '';
            
            // Reset button text
            if (id === 'lifeline-5050') {
                btn.innerHTML = '<span class="lifeline-icon">50:50</span><span class="lifeline-label">حذف إجابتين</span>';
            } else if (id === 'lifeline-friend') {
                btn.innerHTML = '<span class="lifeline-icon">📞</span><span class="lifeline-label">اتصال بصديق</span>';
            } else if (id === 'lifeline-ai') {
                btn.innerHTML = '<span class="lifeline-icon">🤖</span><span class="lifeline-label">مساعدة AI</span>';
                btn.style.background = 'rgba(0,0,0,0.6)';
            }
        });
    }
}

// Add CSS animations for lifelines
const lifelineStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.typing-indicator {
    display: flex;
    gap: 5px;
    justify-content: center;
    margin: 20px 0;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: var(--gold-color);
    border-radius: 50%;
    display: inline-block;
    animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(-10px); opacity: 1; }
}

.friend-response, .ai-hint {
    text-align: right;
    direction: rtl;
}

.friend-response p, .ai-hint p {
    line-height: 1.6;
    margin-bottom: 10px;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = lifelineStyles;
    document.head.appendChild(style);
}

// Export for use in game engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifelinesSystem;
}