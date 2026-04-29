// Quiz Data - Array of objects
const quizData = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "Hyperlinks and Text Markup Language",
            "Home Tool Markup Language",
            "Hyper Tool Multi Language"
        ],
        correctAnswer: 0
    },
    {
        question: "Which of the following is correct about features of JavaScript?",
        options: [
            "JavaScript is a lightweight, interpreted programming language.",
            "JavaScript is designed for creating network-centric applications.",
            "JavaScript is complementary to and integrated with Java.",
            "All of the above."
        ],
        correctAnswer: 3
    },
    {
        question: "How do you select an element with id 'demo' in CSS?",
        options: [
            ".demo",
            "#demo",
            "*demo",
            "demo"
        ],
        correctAnswer: 1
    },
    {
        question: "Which built-in method adds one or more elements to the end of an array and returns the new length of the array?",
        options: [
            "last()",
            "put()",
            "push()",
            "pop()"
        ],
        correctAnswer: 2
    },
    {
        question: "What is the CSS property used to make text bold?",
        options: [
            "font-weight",
            "text-style",
            "font-style",
            "bold"
        ],
        correctAnswer: 0
    }
];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestions = document.getElementById('total-questions');
const progressBar = document.getElementById('progress-bar');

const timerText = document.getElementById('timer-text');
const timerCircleFg = document.getElementById('timer-circle');

const resultMessage = document.getElementById('result-message');
const scorePercentage = document.getElementById('score-percentage');
const scorePoints = document.getElementById('score-points');
const totalScoreEl = document.getElementById('total-score');
const highScoreDisplay = document.getElementById('high-score-display');
const scoreCircle = document.querySelector('.score-circle');

// State Variables
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
const TIME_LIMIT = 15;
let timerInterval;

// Initialization
function init() {
    totalQuestions.textContent = quizData.length;
    totalScoreEl.textContent = quizData.length;
    loadHighScore();
    initTheme();

    // Event Listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', handleNextButton);
    restartBtn.addEventListener('click', resetQuiz);
    themeToggle.addEventListener('click', toggleTheme);
}

// Theme Management (Dark/Light Mode)
function initTheme() {
    const savedTheme = localStorage.getItem('quiz-theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

function toggleTheme() {
    if (document.body.getAttribute('data-theme') === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('quiz-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('quiz-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

// Local Storage for High Score
function loadHighScore() {
    const highScore = localStorage.getItem('quiz-high-score') || 0;
    
    // Check if the high score display element exists before modifying it
    if (highScoreDisplay) {
        highScoreDisplay.textContent = highScore;
    }
}

function saveHighScore(percentage) {
    const currentHighScore = parseInt(localStorage.getItem('quiz-high-score') || 0);
    if (percentage > currentHighScore) {
        localStorage.setItem('quiz-high-score', percentage);
    }
}

// Screen Navigation
function showScreen(screenToShow) {
    [startScreen, quizScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

// Quiz Flow logic
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showScreen(quizScreen);
    loadQuestion();
}

function loadQuestion() {
    resetState();
    const currentQuestion = quizData[currentQuestionIndex];
    
    // Update UI
    questionText.textContent = currentQuestion.question;
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    
    // Update Progress Bar
    const progressPercentage = ((currentQuestionIndex) / quizData.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Render Options
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('div');
        button.classList.add('option');
        button.innerHTML = `<span>${option}</span>`;
        button.dataset.index = index;
        button.addEventListener('click', () => selectAnswer(button, index));
        optionsContainer.appendChild(button);
    });

    startTimer();
}

function resetState() {
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = '';
    clearInterval(timerInterval);
    resetTimerUI();
}

// Answer Selection Logic
function selectAnswer(selectedBtn, selectedIndex) {
    clearInterval(timerInterval); // Stop timer on selection
    
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;
    const allOptions = optionsContainer.children;

    // Update Score
    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
        selectedBtn.innerHTML += '<i class="fa-solid fa-circle-check"></i>';
    } else {
        selectedBtn.classList.add('wrong');
        selectedBtn.innerHTML += '<i class="fa-solid fa-circle-xmark"></i>';
        
        // Highlight correct answer
        const correctBtn = allOptions[currentQuestion.correctAnswer];
        correctBtn.classList.add('correct');
        correctBtn.innerHTML += '<i class="fa-solid fa-circle-check"></i>';
    }

    // Disable all options
    Array.from(allOptions).forEach(btn => {
        btn.classList.add('disabled');
        // Remove click listeners by cloning and replacing (vanilla JS trick)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    nextBtn.classList.remove('hidden');
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Timer Logic
function startTimer() {
    timeLeft = TIME_LIMIT;
    updateTimerUI();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        
        if (timeLeft <= 0) {
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    timerText.textContent = timeLeft;
    
    // Calculate stroke dashoffset for circular progress
    // Total length is 283
    const dashoffset = 283 - (283 * timeLeft) / TIME_LIMIT;
    timerCircleFg.style.strokeDashoffset = dashoffset;

    // Change color as time runs out
    if (timeLeft <= 5) {
        timerCircleFg.style.stroke = 'var(--error-color)';
        timerText.style.color = 'var(--error-color)';
    } else if (timeLeft <= 10) {
        timerCircleFg.style.stroke = 'var(--warning-color)';
        timerText.style.color = 'var(--warning-color)';
    } else {
        timerCircleFg.style.stroke = 'var(--timer-color)';
        timerText.style.color = 'var(--timer-color)';
    }
}

function resetTimerUI() {
    timerCircleFg.style.strokeDashoffset = 0;
    timerCircleFg.style.stroke = 'var(--timer-color)';
    timerText.style.color = 'var(--timer-color)';
}

function handleTimeOut() {
    clearInterval(timerInterval);
    const currentQuestion = quizData[currentQuestionIndex];
    const allOptions = optionsContainer.children;
    
    // Highlight correct answer since time ran out
    const correctBtn = allOptions[currentQuestion.correctAnswer];
    correctBtn.classList.add('correct');
    correctBtn.innerHTML += '<i class="fa-solid fa-circle-check"></i>';

    // Disable all options
    Array.from(allOptions).forEach(btn => {
        btn.classList.add('disabled');
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    nextBtn.classList.remove('hidden');
}

// Result Screen Logic
function showResults() {
    showScreen(resultScreen);
    
    const percentage = Math.round((score / quizData.length) * 100);
    
    scorePoints.textContent = score;
    scorePercentage.textContent = `${percentage}%`;
    
    // Update conic gradient based on score
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    
    scoreCircle.style.background = `conic-gradient(${primaryColor} ${percentage}%, ${secondaryColor} 0%)`;

    if (percentage >= 80) {
        resultMessage.textContent = "Excellent! You have mastered the basics.";
    } else if (percentage >= 50) {
        resultMessage.textContent = "Good job! But there is room for improvement.";
    } else {
        resultMessage.textContent = "Keep practicing! You'll get better.";
    }

    saveHighScore(percentage);
    loadHighScore(); // Update the start screen high score
}

function resetQuiz() {
    // Reset to start screen
    showScreen(startScreen);
    // Remove the final progress bar width state if needed
    progressBar.style.width = '0%';
}

// Start Application
init();
