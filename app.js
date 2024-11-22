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
        text: "In welchem Umlauf hat sich ein Defekt ereignet? (z.B.: 712-(0)1)",
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
    const regex = /^\d{3}-\d{2}$/;
    return regex.test(input);
}

function validateWagonNumberQuestionInput(input) {
    const regex = /^\d{2} \d{2} \d{2}-\d{2} \d{3}-\d$/;
    return regex.test(input);
}

function validateLocationQuestionInput(input) {
    const regex = /^[a-zA-ZöÖüÜäÄ]+$/;
    return regex.test(input) && input.trim() !== "";
}


function createRegularQuestion(containerDiv, question) {
    const answersDiv = document.createElement('div');
    answersDiv.className = 'answers';

    question.answers.forEach(answer => {
        if (answer === "Manuell eingeben") {
            if (question.id === 1) {
                // Create special input for circulation number
                const inputGroup = document.createElement('div');
                inputGroup.className = 'input-group';
                inputGroup.style.display = 'flex';
                inputGroup.style.alignItems = 'center';
                inputGroup.style.gap = '8px';
                inputGroup.style.marginBottom = '20px';

                // Create three boxes for first three digits
                const firstThreeDigits = document.createElement('div');
                firstThreeDigits.style.display = 'flex';
                firstThreeDigits.style.gap = '8px';

                // Common input styles
                const inputStyle = {
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '16px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    padding: '0',
                    margin: '0',
                    boxShadow: 'none',
                    outline: 'none'
                };

                // Function to get next input element
                const getNextInput = (currentInput) => {
                    const allInputs = [...firstThreeDigits.querySelectorAll('input'), ...lastDigits.querySelectorAll('input')];
                    const currentIndex = allInputs.indexOf(currentInput);
                    return allInputs[currentIndex + 1];
                };

                // Function to get previous input element
                const getPrevInput = (currentInput) => {
                    const allInputs = [...firstThreeDigits.querySelectorAll('input'), ...lastDigits.querySelectorAll('input')];
                    const currentIndex = allInputs.indexOf(currentInput);
                    return allInputs[currentIndex - 1];
                };

                // Create first three inputs
                for (let i = 0; i < 3; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'digit-input';
                    input.inputMode = 'numeric';

                    Object.assign(input.style, inputStyle);

                    input.addEventListener('focus', () => {
                        input.style.borderColor = '#007bff';
                        input.select();
                    });

                    input.addEventListener('blur', () => {
                        input.style.borderColor = '#dee2e6';
                    });

                    input.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/[^0-9]/g, '');
                        e.target.value = value;

                        if (value.length === 1) {
                            const nextInput = getNextInput(e.target);
                            if (nextInput) {
                                nextInput.focus();
                            }
                        }
                    });

                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace') {
                            if (e.target.value === '') {
                                const prevInput = getPrevInput(e.target);
                                if (prevInput) {
                                    prevInput.focus();
                                    prevInput.value = '';
                                    e.preventDefault();
                                }
                            }
                        } else if (e.key === 'ArrowLeft') {
                            const prevInput = getPrevInput(e.target);
                            if (prevInput) {
                                prevInput.focus();
                                e.preventDefault();
                            }
                        } else if (e.key === 'ArrowRight') {
                            const nextInput = getNextInput(e.target);
                            if (nextInput) {
                                nextInput.focus();
                                e.preventDefault();
                            }
                        }
                    });

                    input.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                        const numericValue = pastedText.replace(/[^0-9]/g, '');
                        if (numericValue.length > 0) {
                            input.value = numericValue[0];
                            const nextInput = getNextInput(input);
                            if (nextInput) nextInput.focus();
                        }
                    });

                    firstThreeDigits.appendChild(input);
                }

                const dash = document.createElement('span');
                dash.textContent = '-';
                dash.style.fontSize = '20px';
                dash.style.color = '#495057';
                dash.style.margin = '0 4px';

                const lastDigits = document.createElement('div');
                lastDigits.style.display = 'flex';
                lastDigits.style.gap = '8px';

                // Create last two inputs
                for (let i = 0; i < 2; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.className = 'digit-input';
                    input.inputMode = 'numeric';
                    Object.assign(input.style, inputStyle);

                    input.addEventListener('focus', () => {
                        input.style.borderColor = '#007bff';
                        input.select();
                    });

                    input.addEventListener('blur', () => {
                        input.style.borderColor = '#dee2e6';
                    });

                    input.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/[^0-9]/g, '');
                        e.target.value = value;

                        if (value.length === 1) {
                            const nextInput = getNextInput(e.target);
                            if (nextInput) {
                                nextInput.focus();
                            }
                        }
                    });

                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace') {
                            if (e.target.value === '') {
                                const prevInput = getPrevInput(e.target);
                                if (prevInput) {
                                    prevInput.focus();
                                    prevInput.value = '';
                                    e.preventDefault();
                                }
                            }
                        } else if (e.key === 'ArrowLeft') {
                            const prevInput = getPrevInput(e.target);
                            if (prevInput) {
                                prevInput.focus();
                                e.preventDefault();
                            }
                        } else if (e.key === 'ArrowRight') {
                            const nextInput = getNextInput(e.target);
                            if (nextInput) {
                                nextInput.focus();
                                e.preventDefault();
                            }
                        }
                    });

                    input.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                        const numericValue = pastedText.replace(/[^0-9]/g, '');
                        if (numericValue.length > 0) {
                            input.value = numericValue[0];
                            const nextInput = getNextInput(input);
                            if (nextInput) nextInput.focus();
                        }
                    });

                    lastDigits.appendChild(input);
                }

                inputGroup.appendChild(firstThreeDigits);
                inputGroup.appendChild(dash);
                inputGroup.appendChild(lastDigits);
                answersDiv.appendChild(inputGroup);

                const submitButton = createSubmitButton();
                submitButton.onclick = () => {
                    const digits = Array.from(firstThreeDigits.querySelectorAll('input')).map(input => input.value);
                    const lastValues = Array.from(lastDigits.querySelectorAll('input')).map(input => input.value);
                    const fullValue = `${digits.join('')}-${lastValues.join('')}`;

                    if (!validateCirculationQuestionInput(fullValue)) {
                        alert('Bitte geben Sie eine gültige Antwort ein. Alle Felder müssen Zahlen sein.');
                        return;
                    }

                    userAnswers.push(fullValue);
                    currentQuestion++;
                    showQuestion(currentQuestion);
                };

                const allInputs = [...firstThreeDigits.querySelectorAll('input'), ...lastDigits.querySelectorAll('input')];
                allInputs.forEach(input => {
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            submitButton.click();
                        }
                    });
                });

                answersDiv.appendChild(submitButton);
            } else if (question.id === 2 || question.id === 4) {
                // Create special input for wagon number
                const inputGroup = document.createElement('div');
                inputGroup.className = 'input-group';
                inputGroup.style.display = 'flex';
                inputGroup.style.alignItems = 'center';
                inputGroup.style.gap = '8px';
                inputGroup.style.marginBottom = '20px';

                // Common input styles
                const inputStyle = {
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '16px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    padding: '0',
                    margin: '0',
                    boxShadow: 'none',
                    outline: 'none'
                };

                // Create input sections with their respective groups and separators
                const inputSections = [
                    { group: 2, separator: ' ' },   // 50
                    { group: 2, separator: ' ' },   // 85
                    { group: 2, separator: '' },   // 26
                    { group: 2, separator: ' ' },   // 94
                    { group: 3, separator: '-' },   // 901
                    { group: 1, separator: '' }     // 3
                ];

                let allInputs = [];

                inputSections.forEach((section, sectionIndex) => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.style.display = 'flex';
                    sectionDiv.style.gap = '4px';

                    // Create inputs for this section
                    for (let i = 0; i < section.group; i++) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.maxLength = 1;
                        input.className = 'digit-input';
                        input.inputMode = 'numeric';

                        Object.assign(input.style, inputStyle);

                        input.addEventListener('focus', () => {
                            input.style.borderColor = '#007bff';
                            input.select();
                        });

                        input.addEventListener('blur', () => {
                            input.style.borderColor = '#dee2e6';
                        });

                        input.addEventListener('input', (e) => {
                            let value = e.target.value.replace(/[^0-9]/g, '');
                            e.target.value = value;

                            if (value.length === 1) {
                                const nextInput = allInputs[allInputs.indexOf(e.target) + 1];
                                if (nextInput) {
                                    nextInput.focus();
                                }
                            }
                        });

                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Backspace') {
                                if (e.target.value === '') {
                                    const prevInput = allInputs[allInputs.indexOf(e.target) - 1];
                                    if (prevInput) {
                                        prevInput.focus();
                                        prevInput.value = '';
                                        e.preventDefault();
                                    }
                                }
                            } else if (e.key === 'ArrowLeft') {
                                const prevInput = allInputs[allInputs.indexOf(e.target) - 1];
                                if (prevInput) {
                                    prevInput.focus();
                                    e.preventDefault();
                                }
                            } else if (e.key === 'ArrowRight') {
                                const nextInput = allInputs[allInputs.indexOf(e.target) + 1];
                                if (nextInput) {
                                    nextInput.focus();
                                    e.preventDefault();
                                }
                            }
                        });

                        input.addEventListener('paste', (e) => {
                            e.preventDefault();
                            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                            const numericValue = pastedText.replace(/[^0-9]/g, '');
                            if (numericValue.length > 0) {
                                input.value = numericValue[0];
                                const nextInput = allInputs[allInputs.indexOf(input) + 1];
                                if (nextInput) nextInput.focus();
                            }
                        });

                        allInputs.push(input);
                        sectionDiv.appendChild(input);
                    }

                    inputGroup.appendChild(sectionDiv);

                    // Add separator if specified
                    if (section.separator) {
                        const separator = document.createElement('span');
                        separator.textContent = section.separator;
                        separator.style.fontSize = '20px';
                        separator.style.color = '#495057';
                        separator.style.margin = '0 4px';
                        inputGroup.appendChild(separator);
                    }
                });

                answersDiv.appendChild(inputGroup);

                const submitButton = createSubmitButton();
                submitButton.onclick = () => {
                    const values = allInputs.map(input => input.value);
                    const formattedValue =
                        `${values.slice(0, 2).join('')} ` +
                        `${values.slice(2, 4).join('')} ` +
                        `${values.slice(4, 6).join('')}-` +
                        `${values.slice(6, 8).join('')} ` +
                        `${values.slice(8, 11).join('')}-` +
                        `${values.slice(11).join('')}`;

                    if (!validateWagonNumberQuestionInput(formattedValue)) {
                        alert("Bitte geben Sie eine gültige Wagennummer ein.");
                        return;
                    }

                    userAnswers.push(formattedValue);
                    currentQuestion++;
                    showQuestion(currentQuestion);
                };

                allInputs.forEach(input => {
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            submitButton.click();
                        }
                    });
                });

                answersDiv.appendChild(submitButton);
            } else {
                // Original input handling for question 3 (location)
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Antwort hier';
                input.id = 'manualAnswer';
                answersDiv.appendChild(input);

                const submitButton = createSubmitButton();
                submitButton.onclick = () => {
                    const manualAnswer = input.value;
                    if (!validateLocationQuestionInput(manualAnswer)) {
                        alert("Bitte geben Sie eine gültige Antwort ein. Die Antwort besteht nur aus Buchstaben!");
                        return;
                    }

                    if (manualAnswer) {
                        userAnswers.push(manualAnswer);
                        currentQuestion++;
                        showQuestion(currentQuestion);
                    }
                };

                answersDiv.appendChild(submitButton);

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        submitButton.click();
                    }
                });
            }
        }
    });

    containerDiv.appendChild(answersDiv);
}

// Helper function to create consistently styled submit buttons
function createSubmitButton() {
    const submitButton = document.createElement('button');
    submitButton.className = 'waves-effect waves-light btn-large';
    submitButton.style.display = 'block';
    submitButton.style.marginBottom = '10px';
    submitButton.style.color = "white";
    submitButton.style.backgroundColor = "red";
    submitButton.textContent = 'Antwort senden';

    submitButton.addEventListener('mouseover', () => {
        submitButton.style.backgroundColor = '#c82333';
    });

    submitButton.addEventListener('mouseout', () => {
        submitButton.style.backgroundColor = '#dc3545';
    });

    return submitButton;
}

function showResponseForm() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('responseForm').classList.remove('hidden');

    const messageElement = document.getElementById('message');
    messageElement.value = formatQuizResponses();
    messageElement.setAttribute('readonly', true);
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

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    setupEventHandlers();
    showQuestion(currentQuestion);
});
