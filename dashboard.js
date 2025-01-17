import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

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

let allResponses = [];

// Listen for changes in the responses
onValue(responsesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        allResponses = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
        }));
        
        updateDashboard();
        updateStats();
    }
});

// Update statistics on the dashboard
function updateStats() {
    const stats = {
        totalResponses: allResponses.length,
        uniqueLocations: new Set(allResponses.map(r => r.answers[2])).size,
        averageResponseTime: calculateAverageResponseTime(),
        totalReplacementWagons: allResponses.length
    };

    const statsRow = document.getElementById('statsRow');
    statsRow.innerHTML = `
        <div class="col s12 m3">
            <div class="card-panel stat-card">
                <div class="stat-number">${stats.totalResponses}</div>
                <div class="stat-label">Gesamtantworten</div>
            </div>
        </div>
        <div class="col s12 m3">
            <div class="card-panel stat-card">
                <div class="stat-number">${stats.uniqueLocations}</div>
                <div class="stat-label">Unique Standorte</div>
            </div>
        </div>
        <div class="col s12 m3">
            <div class="card-panel stat-card">
                <div class="stat-number">${stats.averageResponseTime}</div>
                <div class="stat-label">ø Antworzeit in m</div>
            </div>
        </div>
        <div class="col s12 m3">
            <div class="card-panel stat-card">
                <div class="stat-number">${stats.totalReplacementWagons}</div>
                <div class="stat-label">Ersatzwagen Total</div>
            </div>
        </div>
    `;
}

// Calculate average response time (dummy function)
function calculateAverageResponseTime() {
    return "~2";
}

// Update the dashboard with responses
function updateDashboard() {
    const container = document.getElementById('responsesContainer');
    container.innerHTML = '';

    const sortedResponses = [...allResponses].sort((a, b) => {
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    sortedResponses.forEach(response => {
        const card = createResponseCard(response);
        container.appendChild(card);
    });
}

// Create a response card element
function createResponseCard(response) {
    const div = document.createElement('div');
    div.className = 'card dashboard-card';
    
    const date = response.createdAt ? new Date(response.createdAt).toLocaleString() : 'Datum unbekannt';
    
    div.innerHTML = `
        <div class="card-content">
            <span class="card-title">${response.fullName}</span>
            <p class="grey-text">${date}</p>
            <div class="response-details">
                <p><strong>Umlauf:</strong> ${response.answers[0]}</p>
                <p><strong>Defekter Wagen:</strong> ${response.answers[1]}</p>
                <p><strong>Ersatzwagen Standort:</strong> ${response.answers[2]}</p>
                <p><strong>Ersatzwagen Nummer:</strong> ${response.answers[3]}</p>
                ${response.comment ? `<p><strong>Kommentar:</strong> ${response.comment}</p>` : ''}
            </div>
        </div>
    `;

    return div;
}

// Filter responses based on search input
window.filterResponses = function() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('responsesContainer');
    container.innerHTML = '';

    const filteredResponses = allResponses.filter(response => {
        const searchableText = `
            ${response.fullName}
            ${response.answers.join(' ')}
            ${response.comment || ''}
        `.toLowerCase();

        return searchableText.includes(searchText);
    });

    filteredResponses.forEach(response => {
        const card = createResponseCard(response);
        container.appendChild(card);
    });
};