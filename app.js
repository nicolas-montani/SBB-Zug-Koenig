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
        text: "In welchem Umlauf hat sich ein Defekt ereignet? (z.B.: 712-1)",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
    },
    {
        id: 2,
        text: "Was ist die Wagennummer des kaputten Wagens? (z.B.: 50 85 26-94 901-3)",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
    },
    {
        id: 3,
        text: "Wo hast du einen Ersatzwagen gefunden? (z.B.: Basel SBB)",
        type: "regular",
        answers: [
            "Manuell eingeben"
        ]
    }, 
    {
        id: 4,
        text: "Was ist die Wagennummer vom Ersatzwagen? (z.B.: 50 85 26-94 901-3)",
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
    let progressBar = document.querySelector('.progress-bar');

    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressDiv.appendChild(progressBar);
    }

    progressBar.style.width = `${(questionIndex / questions.length) * 100}%`;

    container.innerHTML = '';

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

function validateCirculationQuestionInput(input) {
    const regex = /^\d{3}-[1-4]$/;
    return regex.test(input);
}

function validateWagonNumberQuestionInput(input) {
    const regex = /^\d{2} \d{2} \d{2}-\d{2} \d{3}-\d$/;
    return regex.test(input);
}

function validateLocationQuestionInput(input) {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(input) && input.trim() !== "";
}

function createRegularQuestion(containerDiv, question) {
    const answersDiv = document.createElement('div');
    answersDiv.className = 'answers';

    question.answers.forEach(answer => {
        if (answer === "Manuell eingeben") {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Antwort hier';
            input.id = `manualAnswer-${question.id}`;
            answersDiv.appendChild(input);

            // Create error message container
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.id = `error-message-${question.id}`;
            errorMessageDiv.className = 'hidden';
            answersDiv.appendChild(errorMessageDiv);

            const submitButton = document.createElement('button');
            submitButton.className = 'waves-effect waves-light btn-large';
            submitButton.style.display = 'block';
            submitButton.style.marginBottom = '10px';
            submitButton.style.color = "white";
            submitButton.style.backgroundColor = "red";
            submitButton.textContent = 'Antwort senden';
            submitButton.onclick = () => {
                const manualAnswer = document.getElementById(`manualAnswer-${question.id}`).value;
                hideError(question.id); // Hide any previous error message

                if (question.id === 1 && !validateCirculationQuestionInput(manualAnswer)) {
                    showError('Bitte geben Sie eine gültige Antwort im Format ...-. ein, wobei die letzte Ziffer eine Zahl von 1-4 ist.', question.id);
                    return;
                }
                if ((question.id === 2 || question.id === 4) && !validateWagonNumberQuestionInput(manualAnswer)) {
                    showError("Bitte geben Sie eine gültige Antwort in folgendem Format: .. .. ..-.. ...-. (Beispiel:50 85 26-94 901-3)", question.id);
                    return;
                }
                if (question.id === 3 && !validateLocationQuestionInput(manualAnswer)) {
                    showError("Bitte geben Sie eine gültige Antwort ein. Die Antwort besteht nur aus Buchstaben!", question.id);
                    return;
                }

                if (manualAnswer) {
                    userAnswers[question.id - 1] = manualAnswer;
                    currentQuestion++;
                    showQuestion(currentQuestion);
                }
            };
            answersDiv.appendChild(submitButton);

            // Add event listener for Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    submitButton.click();
                }
            });
        } else {
            const button = document.createElement('button');
            button.className = 'waves-effect waves-light btn-large';
            button.style.display = 'block';
            button.style.marginBottom = '10px';
            button.textContent = answer;
            button.onclick = () => {
                userAnswers[question.id - 1] = answer;
                currentQuestion++;
                showQuestion(currentQuestion);
            };
            answersDiv.appendChild(button);

            // Add event listener for Enter key
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    button.click();
                }
            });
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

    // Add event listener for Enter key
    submitButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
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
    
    // Directly show answers
    const messageElement = document.getElementById('message');
    messageElement.value = formatQuizResponses();
    messageElement.setAttribute('readonly', true); // Make the textarea readonly
    Materialize.updateTextFields();
}

function formatQuizResponses() {
    let response = "";
    questions.forEach((question, index) => {
        response += `${question.text}\n`;
        response += `Antwort: ${Array.isArray(userAnswers[index]) ? userAnswers[index].join(' > ') : userAnswers[index]}`;
        if (index < questions.length - 1) {
            response += "\n\n";
        }
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
            <button class="waves-effect waves-light btn red" onclick="location.reload()">Neu starten</button>
        </div>
    `;
}

function showError(message, questionId) {
    const errorMessageDiv = document.getElementById(`error-message-${questionId}`);
    errorMessageDiv.innerHTML = `<b>${message}</b>`;
    errorMessageDiv.classList.remove('hidden');
    errorMessageDiv.style.color = 'red'; // Ensure the color is set to red
}

function hideError(questionId) {
    const errorMessageDiv = document.getElementById(`error-message-${questionId}`);
    errorMessageDiv.classList.add('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventHandlers();
    showQuestion(currentQuestion);
});