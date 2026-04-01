// Question Loader - Fetches questions from external APIs
class QuestionLoader {
    constructor() {
        this.apiEndpoints = {
            opentdb: 'https://opentdb.com/api.php',
            triviaApi: 'https://the-trivia-api.com/v2/questions',
            quizApi: 'https://quizapi.io/api/v1/questions'
        };
        
        this.categories = {
            general: 9,
            sports: 21,
            music: 12,
            art: 25,
            movies: 11,
            politics: 24
        };
        
        this.difficultyMap = {
            easy: 'easy',
            medium: 'medium',
            hard: 'hard'
        };
    }

    async loadQuestions() {
        console.log('Loading questions from external APIs...');
        
        try { 
            // Try primary API first (OpenTDB)
            const questions = await this.fetchFromOpenTDB();
            
            if (questions.length >= 75) { // Need 15 levels × 5 questions = 75
                console.log(`Successfully loaded ${questions.length} questions from OpenTDB`);
                return this.processQuestions(questions);
            }
            
            // Fallback to The Trivia API
            const fallbackQuestions = await this.fetchFromTriviaAPI();
            const allQuestions = [...questions, ...fallbackQuestions];
            
            if (allQuestions.length >= 75) {
                console.log(`Loaded ${allQuestions.length} questions (OpenTDB + Trivia API)`);
                return this.processQuestions(allQuestions);
            }
            
            // Final fallback to local questions
            console.warn('External APIs failed, using fallback questions');
            return this.loadFallbackQuestions();
            
        } catch (error) {
            console.error('Error loading questions:', error);
            return this.loadFallbackQuestions();
        }
    }

    async fetchFromOpenTDB() {
        const categories = Object.values(this.categories);
        const allQuestions = [];
        
        // Fetch 15 questions per category to ensure we have enough
        for (const categoryId of categories) {
            try { 
                const url = `${this.apiEndpoints.opentdb}?amount=15&category=${categoryId}&type=multiple&encode=url3986`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`OpenTDB API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    const processedQuestions = data.results.map(q => ({
                        question: this.decodeHtml(q.question),
                        correct_answer: this.decodeHtml(q.correct_answer),
                        incorrect_answers: q.incorrect_answers.map(ans => this.decodeHtml(ans)),
                        category: this.mapCategory(q.category),
                        difficulty: q.difficulty,
                        type: 'text'
                    }));
                    
                    allQuestions.push(...processedQuestions);
                }
            } catch (error) {
                console.warn(`Failed to fetch from OpenTDB category ${categoryId}:`, error);
            }
        }
        
        return allQuestions;
    }

    async fetchFromTriviaAPI() {
        try { 
            const response = await fetch(`${this.apiEndpoints.triviaApi}?limit=50`);
            
            if (!response.ok) {
                throw new Error(`Trivia API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.map(q => ({
                question: q.question.text,
                correct_answer: q.correctAnswer,
                incorrect_answers: q.incorrectAnswers,
                category: this.mapCategory(q.category),
                difficulty: q.difficulty,
                type: 'text'
            }));
            
        } catch (error) {
            console.warn('Failed to fetch from The Trivia API:', error);
            return [];
        }
    }

    async fetchFromQuizAPI() {
        try { 
            // Note: QuizAPI requires an API key, so this is a placeholder
            const response = await fetch(`${this.apiEndpoints.quizApi}?limit=50&apiKey=YOUR_API_KEY`);
            
            if (!response.ok) {
                throw new Error(`QuizAPI error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.map(q => ({
                question: q.question,
                correct_answer: q.correct_answer,
                incorrect_answers: q.answers.filter(ans => ans !== q.correct_answer),
                category: q.category,
                difficulty: q.difficulty,
                type: 'text'
            }));
            
        } catch (error) {
            console.warn('Failed to fetch from QuizAPI:', error);
            return [];
        }
    }

    mapCategory(apiCategory) {
        // Map API categories to our internal categories
        const categoryMap = {
            'General Knowledge': 'general_knowledge',
            'Sports': 'sports',
            'Music': 'music',
            'Art': 'art',
            'Movies': 'movies',
            'Politics': 'politics',
            'Science': 'general_knowledge',
            'History': 'general_knowledge',
            'Geography': 'general_knowledge'
        };
        
        return categoryMap[apiCategory] || 'general_knowledge';
    }

    decodeHtml(html) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = html;
        return textArea.value;
    }

    processQuestions(questions) {
        // Remove duplicates based on question text
        const uniqueQuestions = [];
        const seenQuestions = new Set();
        
        questions.forEach(question => {
            const questionText = question.question.toLowerCase();
            if (!seenQuestions.has(questionText)) {
                seenQuestions.add(questionText);
                uniqueQuestions.push(question);
            }
        });
        
        // Shuffle questions
        this.shuffleArray(uniqueQuestions);
        
        // Ensure we have at least 75 questions
        if (uniqueQuestions.length < 75) {
            console.warn(`Only ${uniqueQuestions.length} unique questions available, duplicating some`);
            while (uniqueQuestions.length < 75) {
                uniqueQuestions.push(...uniqueQuestions.slice(0, Math.min(75 - uniqueQuestions.length, uniqueQuestions.length)));
            }
        }
        
        // Select exactly 75 questions
        return uniqueQuestions.slice(0, 75);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async loadFallbackQuestions() {
        console.log('Loading fallback questions from local data...');
        
        try { 
            const response = await fetch('../data/fallback-questions.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch fallback questions: ${response.status}`);
            }
            const fallbackQuestions = await response.json();
            
            if (fallbackQuestions && fallbackQuestions.length > 0) {
                return this.processQuestions(fallbackQuestions);
            }
        } catch (error) {
            console.error('Error loading fallback questions:', error);
        }
        
        // Emergency fallback - create basic questions
        return this.createEmergencyQuestions();
    }

    createEmergencyQuestions() {
        console.warn('Creating emergency fallback questions');
        
        const emergencyQuestions = [
            {
                question: "ما هو عاصمة مصر؟",
                correct_answer: "القاهرة",
                incorrect_answers: ["الإسكندرية", "الجيزة", "بورسعيد"],
                category: "general_knowledge",
                difficulty: "easy",
                type: "text"
            },
            {
                question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
                correct_answer: "المشتري",
                incorrect_answers: ["زحل", "الأرض", "المريخ"],
                category: "general_knowledge",
                difficulty: "easy",
                type: "text"
            },
            {
                question: "من هو مخترع المصباح الكهربائي؟",
                correct_answer: "توماس إديسون",
                incorrect_answers: ["نيكولا تسلا", "ألبرت أينشتاين", "غوغلييلمو ماركوني"],
                category: "general_knowledge",
                difficulty: "medium",
                type: "text"
            },
            {
                question: "ما هي أطول نهر في العالم؟",
                correct_answer: "نيل",
                incorrect_answers: ["الأمازون", "الميسيسيبي", "النيل"],
                category: "general_knowledge",
                difficulty: "medium",
                type: "text"
            },
            {
                question: "ما هو العنصر الكيميائي الذي يرمز له بالرمز Au؟",
                correct_answer: "الذهب",
                incorrect_answers: ["الفضة", "الحديد", "النحاس"],
                category: "general_knowledge",
                difficulty: "easy",
                type: "text"
            }
        ];
        
        // Duplicate questions to reach 75
        const fullQuestions = [];
        while (fullQuestions.length < 75) {
            fullQuestions.push(...emergencyQuestions);
        }
        
        return fullQuestions.slice(0, 75);
    }

    // Advanced question types for anti-cheat
    createImageQuestion() {
        return {
            question: "من هو هذا اللاعب؟",
            correct_answer: "لاعب مشهور",
            incorrect_answers: ["لاعب آخر", "لاعب ثالث", "لاعب رابع"],
            category: "sports",
            difficulty: "medium",
            type: "image",
            imageUrl: this.generateRandomImageUrl()
        };
    }

    createAudioQuestion() {
        return {
            question: "ما هذا اللحن؟",
            correct_answer: "أغنية مشهورة",
            incorrect_answers: ["أغنية أخرى", "أغنية ثالثة", "أغنية رابعة"],
            category: "music",
            difficulty: "hard",
            type: "audio",
            audioUrl: this.generateRandomAudioUrl()
        };
    }

    createLogicQuestion() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';
        const correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;
        
        return {
            question: `إذا كان ${num1} ${operation} ${num2} = ؟`,
            correct_answer: correctAnswer.toString(),
            incorrect_answers: [
                (correctAnswer + 1).toString(),
                (correctAnswer - 1).toString(),
                (correctAnswer + 2).toString()
            ],
            category: "logic",
            difficulty: "easy",
            type: "math"
        };
    }

    generateRandomImageUrl() {
        // Generate a random image URL for testing
        const width = 400;
        const height = 300;
        return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
    }

    generateRandomAudioUrl() {
        // For testing, we'll use a placeholder
        // In production, this would be actual audio files
        return `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=`;
    }
}

// Export for use in game engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionLoader;
}