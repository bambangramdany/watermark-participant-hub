const defaultEvents = [
  {
    id: "event-001",
    name: "Daikin National Gathering",
    date: "2026-06-12",
    venue: "Jakarta Convention Center",
    status: "Active"
  },
  {
    id: "event-002",
    name: "Corporate Meeting 2026",
    date: "2026-07-03",
    venue: "Hotel Indonesia Kempinski",
    status: "Draft"
  }
];

const defaultParticipants = [
  {
    id: "participant-001",
    eventId: "event-001",
    name: "Bambang Ramdany",
    company: "PT Sinematik Anak Bangsa",
    whatsapp: "081234567890",
    email: "bambang@example.com",
    status: "Confirmed"
  },
  {
    id: "participant-002",
    eventId: "event-001",
    name: "Andi Pratama",
    company: "PT Contoh Sejahtera",
    whatsapp: "081298765432",
    email: "andi@example.com",
    status: "Pending"
  },
  {
    id: "participant-003",
    eventId: "event-002",
    name: "Sarah Wijaya",
    company: "PT Maju Bersama",
    whatsapp: "081277788899",
    email: "sarah@example.com",
    status: "Confirmed"
  }
];

let events = JSON.parse(localStorage.getItem("wph_events")) || defaultEvents;
let participants = JSON.parse(localStorage.getItem("wph_participants")) || defaultParticipants;
let confirmations = JSON.parse(localStorage.getItem("wph_confirmations")) || [];

const eventModal = document.getElementById("eventModal");
const participantModal = document.getElementById("participantModal");

const openEventForm = document.getElementById("openEventForm");
const closeEventForm = document.getElementById("closeEventForm");
const eventForm = document.getElementById("eventForm");

const openParticipantForm = document.getElementById("openParticipantForm");
const closeParticipantForm = document.getElementById("closeParticipantForm");
const participantForm = document.getElementById("participantForm");

function generateId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function saveEvents() {
  localStorage.setItem("wph_events", JSON.stringify(events));
}

function saveParticipants() {
  localStorage.setItem("wph_participants", JSON.stringify(participants));
}

function saveConfirmations() {
  localStorage.setItem("wph_confirmations", JSON.stringify(confirmations));
}

function getEventName(eventId) {
  const event = events.find(item => item.id === eventId);
  return event ? event.name : "No Event";
}

function getStatusClass(status) {
  return status.toLowerCase();
}

function getConfirmationByParticipantId(participantId) {
  return confirmations.find(item => item.participantId === participantId);
}

function getConfirmationUrl(participantId) {
  const baseUrl = window.location.origin + window.location.pathname.replace("index.html", "");
  return `${baseUrl}confirmation.html?id=${participantId}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function copyConfirmationLink(participantId) {
  const link = getConfirmationUrl(participantId);
  navigator.clipboard.writeText(link);
  showToast("Confirmation link copied!");
}

function renderDashboard() {
  document.getElementById("totalEvents").textContent = events.length;
  document.getElementById("totalParticipants").textContent = participants.length;

  const confirmed = participants.filter(p => p.status === "Confirmed" || p.status === "Submitted").length;
  const pending = participants.filter(p => p.status === "Pending").length;

  document.getElementById("confirmedParticipants").textContent = confirmed;
  document.getElementById("pendingParticipants").textContent = pending;
}

function renderEventOptions() {
  const select = document.getElementById("participantEvent");
  select.innerHTML = "";

  if (events.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Please create event first";
    select.appendChild(option);
    return;
  }

  events.forEach(event => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = event.name;
    select.appendChild(option);
  });
}

function renderEvents() {
  const table = document.getElementById("eventTable");
  table.innerHTML = "";

  if (events.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No event data yet.</td>
      </tr>
    `;
    return;
  }

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

function renderParticipantStatusList() {
  const list = document.getElementById("participantList");
  list.innerHTML = "";

  if (participants.length === 0) {
    list.innerHTML = `<p class="empty-state">No participant data yet.</p>`;
    return;
  }

  participants.slice(-5).reverse().forEach(participant => {
    const item = document.createElement("div");
    item.className = "participant-item";

    item.innerHTML = `
      <div>
        <p>${participant.name}</p>
        <span>${participant.company}</span>
      </div>
      <span class="badge ${getStatusClass(participant.status)}">
        ${participant.status}
      </span>
    `;

    list.appendChild(item);
  });
}

function renderParticipantTable() {
  const table = document.getElementById("participantTable");
  table.innerHTML = "";

  if (participants.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">No participant data yet.</td>
      </tr>
    `;
    return;
  }

  participants.forEach((participant, index) => {
    const confirmation = getConfirmationByParticipantId(participant.id);
    const confirmationStatus = confirmation ? "Submitted" : "Not Submitted";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${participant.name}</td>
      <td>${participant.company}</td>
      <td>${getEventName(participant.eventId)}</td>
      <td>${participant.whatsapp}</td>
      <td>${participant.email}</td>
      <td>
        <span class="badge ${getStatusClass(participant.status)}">
          ${participant.status}
        </span>
      </td>
      <td>
        <div style="margin-bottom:6px;">
          <span class="badge ${confirmation ? "submitted" : "pending"}">${confirmationStatus}</span>
        </div>
        <a class="btn-link small-btn" href="${getConfirmationUrl(participant.id)}" target="_blank">Open</a>
        <button class="small-btn copy-btn" onclick="copyConfirmationLink('${participant.id}')">Copy Link</button>
      </td>
      <td>
        <button class="small-btn danger" onclick="deleteParticipant(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

function deleteEvent(index) {
  const selectedEvent = events[index];
  const linkedParticipants = participants.filter(p => p.eventId === selectedEvent.id);

  if (linkedParticipants.length > 0) {
    alert("This event still has participants. Please delete related participants first.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this event?");
  if (!confirmDelete) return;

  events.splice(index, 1);
  saveEvents();
  refreshApp();
}

function deleteParticipant(index) {
  const confirmDelete = confirm("Are you sure you want to delete this participant?");
  if (!confirmDelete) return;

  const deletedParticipant = participants[index];
  participants.splice(index, 1);
  confirmations = confirmations.filter(item => item.participantId !== deletedParticipant.id);

  saveParticipants();
  saveConfirmations();
  refreshApp();
}

openEventForm.addEventListener("click", () => {
  eventModal.classList.add("show");
});

closeEventForm.addEventListener("click", () => {
  eventModal.classList.remove("show");
});

openParticipantForm.addEventListener("click", () => {
  renderEventOptions();
  participantModal.classList.add("show");
});

closeParticipantForm.addEventListener("click", () => {
  participantModal.classList.remove("show");
});

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newEvent = {
    id: generateId("event"),
    name: document.getElementById("eventName").value,
    date: document.getElementById("eventDate").value,
    venue: document.getElementById("eventVenue").value,
    status: document.getElementById("eventStatus").value
  };

  events.push(newEvent);
  saveEvents();

  eventForm.reset();
  eventModal.classList.remove("show");

  refreshApp();
});

participantForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const selectedEventId = document.getElementById("participantEvent").value;

  if (!selectedEventId) {
    alert("Please create an event first.");
    return;
  }

  const newParticipant = {
    id: generateId("participant"),
    eventId: selectedEventId,
    name: document.getElementById("participantName").value,
    company: document.getElementById("participantCompany").value,
    whatsapp: document.getElementById("participantWhatsapp").value,
    email: document.getElementById("participantEmail").value,
    status: document.getElementById("participantStatus").value
  };

  participants.push(newParticipant);
  saveParticipants();

  participantForm.reset();
  participantModal.classList.remove("show");

  refreshApp();
});

window.addEventListener("click", function (e) {
  if (e.target === eventModal) {
    eventModal.classList.remove("show");
  }

  if (e.target === participantModal) {
    participantModal.classList.remove("show");
  }
});

function refreshApp() {
  renderDashboard();
  renderEventOptions();
  renderEvents();
  renderParticipantStatusList();
  renderParticipantTable();
}

refreshApp();
