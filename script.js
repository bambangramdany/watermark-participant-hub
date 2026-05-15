const defaultEvents = [
  {
    name: "Daikin National Gathering",
    date: "2026-06-12",
    venue: "Jakarta Convention Center",
    status: "Active"
  },
  {
    name: "Corporate Meeting 2026",
    date: "2026-07-03",
    venue: "Hotel Indonesia Kempinski",
    status: "Draft"
  }
];

const participants = [
  {
    name: "Bambang Ramdany",
    company: "PT Sinematik Anak Bangsa",
    status: "Confirmed"
  },
  {
    name: "Andi Pratama",
    company: "PT Contoh Sejahtera",
    status: "Pending"
  },
  {
    name: "Sarah Wijaya",
    company: "PT Maju Bersama",
    status: "Confirmed"
  },
  {
    name: "Rudi Hartono",
    company: "PT Event Nusantara",
    status: "Pending"
  }
];

let events = JSON.parse(localStorage.getItem("wph_events")) || defaultEvents;

const eventModal = document.getElementById("eventModal");
const openEventForm = document.getElementById("openEventForm");
const closeEventForm = document.getElementById("closeEventForm");
const eventForm = document.getElementById("eventForm");

function saveEvents() {
  localStorage.setItem("wph_events", JSON.stringify(events));
}

function renderDashboard() {
  document.getElementById("totalEvents").textContent = events.length;
  document.getElementById("totalParticipants").textContent = participants.length;

  const confirmed = participants.filter(p => p.status === "Confirmed").length;
  const pending = participants.filter(p => p.status === "Pending").length;

  document.getElementById("confirmedParticipants").textContent = confirmed;
  document.getElementById("pendingParticipants").textContent = pending;
}

function renderEvents() {
  const table = document.getElementById("eventTable");
  table.innerHTML = "";

  events.forEach((event, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${event.name}</td>
      <td>${event.date}</td>
      <td>${event.venue}</td>
      <td>
        <span class="badge ${event.status === "Active" ? "active" : "draft"}">
          ${event.status}
        </span>
      </td>
      <td>
        <button class="small-btn danger" onclick="deleteEvent(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

function renderParticipants() {
  const list = document.getElementById("participantList");
  list.innerHTML = "";

  participants.forEach(participant => {
    const item = document.createElement("div");
    item.className = "participant-item";

    item.innerHTML = `
      <div>
        <p>${participant.name}</p>
        <span>${participant.company}</span>
      </div>
      <span class="badge ${participant.status === "Confirmed" ? "active" : "draft"}">
        ${participant.status}
      </span>
    `;

    list.appendChild(item);
  });
}

function deleteEvent(index) {
  const confirmDelete = confirm("Are you sure you want to delete this event?");
  if (!confirmDelete) return;

  events.splice(index, 1);
  saveEvents();
  renderDashboard();
  renderEvents();
}

openEventForm.addEventListener("click", () => {
  eventModal.classList.add("show");
});

closeEventForm.addEventListener("click", () => {
  eventModal.classList.remove("show");
});

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newEvent = {
    name: document.getElementById("eventName").value,
    date: document.getElementById("eventDate").value,
    venue: document.getElementById("eventVenue").value,
    status: document.getElementById("eventStatus").value
  };

  events.push(newEvent);
  saveEvents();

  eventForm.reset();
  eventModal.classList.remove("show");

  renderDashboard();
  renderEvents();
});

renderDashboard();
renderEvents();
renderParticipants();
