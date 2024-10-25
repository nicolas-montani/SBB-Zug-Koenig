import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getDatabase, ref, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoyq5kK7mNpXFgBgR9QTz-4rLzXJvdAcc",
    authDomain: "sbb-zug-koenig.firebaseapp.com",
    projectId: "sbb-zug-koenig",
    databaseURL: "https://sbb-zug-koenig-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "sbb-zug-koenig.appspot.com",
    messagingSenderId: "1072715642091",
    appId: "1:1072715642091:web:a15dd2b681e3577026baae",
    measurementId: "G-PQY92PKZG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const responsesRef = ref(db, 'responses');

// Quiz Questions
const questions = [
    {
        id: 1,
        text: "In welchem Umlauf-Zug hat sich ein Defekt erreignet? (Ex: 712-1)",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
    },
    {
        id: 2,
        text: "Was ist die Serienummer des kaputten Wagen? (Ex: 50 85 26-94 901-3)",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
       
    },
    {
        id: 3,
        text: "Wie würdest du den defekt schätzen?",
        type: "sortable",
        answers: [
            "Sehr wichtig - habe einen wichtigen Termin",
            "Wichtig - aber etwas Verspätung ist okay",
            "Nicht so wichtig - bin flexibel",
            "Egal - Kann Warten"
        ]
    },
    {
        id: 4,
        text: "Wo hasst du einen ersatzwagen gefunden? (Ex. Basel) ",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
       
    },
];

let currentQuestion = 0;
let userAnswers = [];

// Event Handlers Setup
function setupEventHandlers() {
    const responseForm = document.getElementById('responseForm');

    responseForm.addEventListener("submit", handleSubmit);
}

// Quiz Functions
function showQuestion(questionIndex) {
    const container = document.getElementById('question-container');
    const progressDiv = document.getElementById('progress');

    container.innerHTML = '';
    progressDiv.textContent = `Frage ${questionIndex + 1} von ${questions.length}`;

    if (questionIndex >= questions.length) {
        showResponseForm();
        return;
    }

    const question = questions[questionIndex];
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    
    const questionTitle = document.createElement('h5');
    questionTitle.textContent = question.text;
    questionDiv.appendChild(questionTitle);

    if (question.type === "sortable") {
        createSortableQuestion(questionDiv, question);
    } else {
        createRegularQuestion(questionDiv, question);
    }

    container.appendChild(questionDiv);
}

function createRegularQuestion(containerDiv, question) {
    const answersDiv = document.createElement('div');
    answersDiv.className = 'answers';

    question.answers.forEach(answer => {
        if (answer === "Manuell eingeben") {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Antwort hier';
            input.id = 'manualAnswer';
            answersDiv.appendChild(input);

            const submitButton = document.createElement('button');
            submitButton.className = 'waves-effect waves-light btn-large';
            submitButton.style.display = 'block';
            submitButton.style.marginBottom = '10px';
            submitButton.style.color = "white";
            submitButton.style.backgroundColor = "red";
            submitButton.textContent = 'Antwort senden';
            submitButton.onclick = () => {
                const manualAnswer = document.getElementById('manualAnswer').value;
                if (manualAnswer) {
                    userAnswers.push(manualAnswer);
                    currentQuestion++;
                    showQuestion(currentQuestion);
                }
            };
            answersDiv.appendChild(submitButton);
        } else {
            const button = document.createElement('button');
            button.className = 'waves-effect waves-light btn-large';
            button.style.display = 'block';
            button.style.marginBottom = '10px';
            button.textContent = answer;
            button.onclick = () => {
                userAnswers.push(answer);
                currentQuestion++;
                showQuestion(currentQuestion);
            };
            answersDiv.appendChild(button);
        }
    });

    containerDiv.appendChild(answersDiv);
}

function createSortableQuestion(containerDiv, question) {
    const list = document.createElement('ul');
    list.className = 'collection';

    question.answers.forEach(answer => {
        const item = document.createElement('li');
        item.className = 'collection-item';
        item.draggable = true;
        item.textContent = answer;
        list.appendChild(item);
    });

    setupDragAndDrop(list);

    const submitButton = document.createElement('button');
    submitButton.className = 'waves-effect waves-light btn';
    submitButton.textContent = 'Weiter';
    submitButton.onclick = () => {
        const sortedAnswers = Array.from(list.children).map(item => item.textContent);
        userAnswers.push(sortedAnswers);
        currentQuestion++;
        showQuestion(currentQuestion);
    };

    containerDiv.appendChild(list);
    containerDiv.appendChild(submitButton);
}

function setupDragAndDrop(list) {
    let draggedItem = null;

    list.addEventListener('dragstart', function(e) {
        draggedItem = e.target;
        setTimeout(() => e.target.style.opacity = '0.5', 0);
    });

    list.addEventListener('dragend', function(e) {
        setTimeout(() => e.target.style.opacity = '1', 0);
    });

    list.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    list.addEventListener('drop', function(e) {
        e.preventDefault();
        const target = e.target;
        if (target.className === 'collection-item' && target !== draggedItem) {
            const allItems = [...list.children];
            const draggedIdx = allItems.indexOf(draggedItem);
            const droppedIdx = allItems.indexOf(target);

            if (draggedIdx < droppedIdx) {
                target.parentNode.insertBefore(draggedItem, target.nextSibling);
            } else {
                target.parentNode.insertBefore(draggedItem, target);
            }
        }
    });
}

function showResponseForm() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('responseForm').classList.remove('hidden');
    
    // Pre-fill the response with quiz answers
    document.getElementById('message').value = formatQuizResponses();
    Materialize.updateTextFields();
}

function formatQuizResponses() {
    let response = "Quiz Answers:\n\n";
    questions.forEach((question, index) => {
        response += `${question.text}\n`;
        response += `Answer: ${Array.isArray(userAnswers[index]) ? userAnswers[index].join(' > ') : userAnswers[index]}\n\n`;
    });
    return response;
}

// CRUD Operations
function handleSubmit(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName');
    const message = document.getElementById('message');
    const comment = document.getElementById('comment');
    const hiddenId = document.getElementById('hiddenId');

    if (!fullName.value || !message.value) return null;

    const id = hiddenId.value || Date.now().toString();

    set(ref(db, 'responses/' + id), {
        fullName: fullName.value,
        message: message.value,
        comment: comment.value,
        answers: userAnswers,
        createdAt: serverTimestamp()
    }).then(() => {
        clearForm();
        showThankYouMessage();
    }).catch((error) => {
        console.error("Error writing new message to Firebase Database", error);
    });
}

function clearForm() {
    document.getElementById('fullName').value = "";
    document.getElementById('message').value = "";
    document.getElementById('comment').value = "";
    document.getElementById('hiddenId').value = "";
}

function showThankYouMessage() {
    const container = document.getElementById('responseForm');
    container.innerHTML = `
        <div class="completion-message">
            Vielen Dank für deine Teilnahme!
            <br><br>
            <button class="waves-effect waves-light btn" onclick="location.reload()">Neu starten</button>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventHandlers();
    showQuestion(currentQuestion);
});




// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// console.log(app)
// const db = getDatabase(app)
// //var db = app.database();
// console.log(db)

// const responsesRef = ref(db, 'responses');
// console.log(responsesRef)
// //var responsesRef = db.ref("/responses");