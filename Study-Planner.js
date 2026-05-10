// Load data from localStorage
let studyList = JSON.parse(localStorage.getItem("studyList")) || [];

// Select elements
const form = document.querySelector("form");
const subject = document.getElementById("subject");
const difficulty = document.getElementById("difficulty");
const deadline = document.getElementById("deadline");
const output = document.getElementById("output");

// Show existing data on page load
displayData();

// Form submit
form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validation
    if (!subject.value || !difficulty.value || !deadline.value) {
        alert("Please fill all fields!");
        return;
    }

    const studyData = {
        subject: subject.value,
        difficulty: Number(difficulty.value),
        deadline: deadline.value
    };

    // Add to list
    studyList.push(studyData);

    // Save to localStorage
    localStorage.setItem("studyList", JSON.stringify(studyList));

    // Clear inputs
    subject.value = "";
    difficulty.value = "";
    deadline.value = "";

    // Update UI
    displayData();
});

// Display function
function displayData() {
    calculateStudyTime();

    if (studyList.length === 0) {
        output.innerHTML = '<h2 class = "empty-msg">No Study Plan Yet</h2>';
        return;
    }

    // Sort by priority (highest first)
    studyList.sort((a, b) => priority(b) - priority(a));

    output.innerHTML = `
    <div class="top-bar">
        <h2>Your Study Plan</h2>
        <button id="clearBtn" class="clear-btn">Clear All</button>
    </div>

    <div class="cards-container"></div>
`;

    const clearBtn = document.getElementById("clearBtn");

    clearBtn.addEventListener("click", () => {
        studyList = [];
        localStorage.removeItem("studyList");
        displayData();
    });

    const cardsContainer = document.querySelector(".cards-container");

    studyList.forEach((sub) => {
        let days = getDaysLeft(sub.deadline);
        let prior = priority(sub);

        if (typeof days === "string") {
            cardsContainer.innerHTML += `
    <div class="card low">
        <p style="color:yellow; font-weight:bold;">
            ⚠️ Deadline already passed!
        </p>
    </div>
`;
            return;
        }

        cardClass = prior > 1 ? "high" : "low";
        cardsContainer.innerHTML += `
            <div class="card ${cardClass}">
                <h3><strong>➡  </strong>${sub.subject}</h3>
                <p><strong>Days Left:</strong> ${days}</p>
                <p><strong>Priority:</strong> ${prior.toFixed(2)}</p>
                <p><strong>Study Time:</strong> ${sub.hours.toFixed(2)}hrs/day</p>
            </div>
        `;
    });
}

// Calculate days left
function getDaysLeft(deadline) {
    let today = new Date();
    let examDate = new Date(deadline);

    // Remove time difference issue
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    if (examDate < today) {
        return "⚠️ Deadline already passed!";
    }

    let diff = examDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Calculate priority
function priority(data) {
    let days = getDaysLeft(data.deadline);

    if (typeof days !== "number" || days <= 0) {
        return 0;
    }

    let difficultyValue = Number(data.difficulty);

    if (!difficultyValue) return 0;

    return difficultyValue / days;
}

function calculateStudyTime() {
    let totalPriority = 0;

    // Calculate total priority
    studyList.forEach(sub => {
        totalPriority += priority(sub);
    });

    // Assign study hours
    studyList.forEach(sub => {
        let p = priority(sub);

        if (totalPriority === 0) {
            sub.hours = 0;
        } else {
            sub.hours = (p / totalPriority) * 5; // 5 hrs/day
        }
    });
}


