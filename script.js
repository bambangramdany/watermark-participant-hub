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
    status: "Verified",
    arrivalStatus: "Not Arrived",
    adminNotes: ""
  },
  {
    id: "participant-002",
    eventId: "event-001",
    name: "Andi Pratama",
    company: "PT Contoh Sejahtera",
    whatsapp: "081298765432",
    email: "andi@example.com",
    status: "Pending",
    arrivalStatus: "Not Arrived",
    adminNotes: ""
  }
];

let events = JSON.parse(localStorage.getItem("wph_events")) || defaultEvents;
let participants = JSON.parse(localStorage.getItem("wph_participants")) || defaultParticipants;
let confirmations = JSON.parse(localStorage.getItem("wph_confirmations")) || [];
let checkins = JSON.parse(localStorage.getItem("wph_checkins")) || [];

let selectedParticipantId = null;

const eventModal = document.getElementById("eventModal");
const participantModal = document.getElementById("participantModal");
const detailModal = document.getElementById("detailModal");

const openEventForm = document.getElementById("openEventForm");
const closeEventForm = document.getElementById("closeEventForm");
const openParticipantForm = document.getElementById("openParticipantForm");
const closeParticipantForm = document.getElementById("closeParticipantForm");
const closeDetailModal = document.getElementById("closeDetailModal");

const eventForm = document.getElementById("eventForm");
const participantForm = document.getElementById("participantForm");
const saveVerificationBtn = document.getElementById("saveVerificationBtn");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const eventFilter = document.getElementById("eventFilter");
const exportCsvBtn = document.getElementById("exportCsvBtn");

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

function saveCheckins() {
  localStorage.setItem("wph_checkins", JSON.stringify(checkins));
}

function getEventName(eventId) {
  const event = events.find(item => item.id === eventId);
  return event ? event.name : "No Event";
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function getParticipantById(participantId) {
  return participants.find(item => item.id === participantId);
}

function getConfirmationByParticipantId(participantId) {
  return confirmations.find(item => item.participantId === participantId);
}

function getCheckinByParticipantId(participantId) {
  return checkins.find(item => item.participantId === participantId);
}

function getBaseUrl() {
  return window.location.origin + window.location.pathname.replace("index.html", "");
}

function getConfirmationUrl(participantId) {
  return `${getBaseUrl()}confirmation.html?id=${participantId}`;
}

function getCheckinUrl(participantId) {
  return `${getBaseUrl()}checkin.html?id=${participantId}`;
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
  navigator.clipboard.writeText(getConfirmationUrl(participantId));
  showToast("Confirmation link copied!");
}

function copyCheckinLink(participantId) {
  navigator.clipboard.writeText(getCheckinUrl(participantId));
  showToast("Check-in link copied!");
}

function renderDashboard() {
  const total = participants.length;
  const arrived = participants.filter(p => getCheckinByParticipantId(p.id)).length;
  const notArrived = total - arrived;
  const rate = total > 0 ? Math.round((arrived / total) * 100) : 0;

  document.getElementById("totalParticipants").textContent = total;
  document.getElementById("arrivedParticipants").textContent = arrived;
  document.getElementById("notArrivedParticipants").textContent = notArrived;
  document.getElementById("arrivalRate").textContent = `${rate}%`;
}

function renderNoShowList() {
  const list = document.getElementById("noShowList");
  list.innerHTML = "";

  const notArrivedParticipants = participants.filter(p => !getCheckinByParticipantId(p.id));

  if (notArrivedParticipants.length === 0) {
    list.innerHTML = `<p class="empty-state">All participants have arrived. Mantap, panitia bisa napas sedikit.</p>`;
    return;
  }

  notArrivedParticipants.slice(0, 8).forEach(participant => {
    const item = document.createElement("div");
    item.className = "participant-item";

    item.innerHTML = `
      <div>
        <p>${participant.name}</p>
        <span>${participant.company}</span>
      </div>
      <span class="badge pending">Not Arrived</span>
    `;

    list.appendChild(item);
  });
}

function renderEventFilterOptions() {
  eventFilter.innerHTML = `<option value="">All Events</option>`;

  events.forEach(event => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = event.name;
    eventFilter.appendChild(option);
  });
}

function renderEventOptions() {
  const select = document.getElementById("participantEvent");
  select.innerHTML = "";

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

function renderParticipantTable() {
  const table = document.getElementById("participantTable");
  table.innerHTML = "";

  const searchValue = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedEvent = eventFilter.value;

  const filteredParticipants = participants.filter(participant => {
    const matchSearch =
      participant.name.toLowerCase().includes(searchValue) ||
      participant.company.toLowerCase().includes(searchValue);

    const matchStatus = !selectedStatus || participant.status === selectedStatus;
    const matchEvent = !selectedEvent || participant.eventId === selectedEvent;

    return matchSearch && matchStatus && matchEvent;
  });

  if (filteredParticipants.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">No participant found.</td>
      </tr>
    `;
    return;
  }

  filteredParticipants.forEach(participant => {
    const confirmation = getConfirmationByParticipantId(participant.id);
    const checkin = getCheckinByParticipantId(participant.id);

    const confirmationStatus = confirmation ? "Submitted" : "Not Submitted";
    const arrivalStatus = checkin ? "Arrived" : "Not Arrived";

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
        <br><br>
        <span class="badge ${checkin ? "verified" : "pending"}">
          ${arrivalStatus}
        </span>
      </td>
      <td>
        <div style="margin-bottom:6px;">
          <span class="badge ${confirmation ? "submitted" : "pending"}">
            ${confirmationStatus}
          </span>
        </div>

        <a class="btn-link small-btn" href="${getConfirmationUrl(participant.id)}" target="_blank">Confirm</a>
        <button class="small-btn copy-btn" onclick="copyConfirmationLink('${participant.id}')">Copy Confirm</button>

        <br>

        <a class="btn-link small-btn detail-btn" href="${getCheckinUrl(participant.id)}" target="_blank">Check-in</a>
        <button class="small-btn copy-btn" onclick="copyCheckinLink('${participant.id}')">Copy Check-in</button>
      </td>
      <td>
        <button class="small-btn detail-btn" onclick="openParticipantDetail('${participant.id}')">Detail</button>
        <button class="small-btn danger" onclick="deleteParticipant('${participant.id}')">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

function openParticipantDetail(participantId) {
  const participant = getParticipantById(participantId);
  const confirmation = getConfirmationByParticipantId(participantId);
  const checkin = getCheckinByParticipantId(participantId);
  const detailContent = document.getElementById("detailContent");

  selectedParticipantId = participantId;

  detailContent.innerHTML = `
    <div class="detail-grid">
      <div class="detail-card">
        <h4>Participant Profile</h4>
        <p><strong>Name:</strong> ${participant.name}</p>
        <p><strong>Company:</strong> ${participant.company}</p>
        <p><strong>Event:</strong> ${getEventName(participant.eventId)}</p>
        <p><strong>WhatsApp:</strong> ${participant.whatsapp}</p>
        <p><strong>Email:</strong> ${participant.email}</p>
        <p><strong>Status:</strong> <span class="badge ${getStatusClass(participant.status)}">${participant.status}</span></p>
        <p><strong>Arrival:</strong> ${checkin ? "Arrived" : "Not Arrived"}</p>
        ${checkin ? `<p><strong>Checked-in At:</strong> ${new Date(checkin.checkedInAt).toLocaleString("id-ID")}</p>` : ""}
      </div>

      <div class="detail-card">
        <h4>Confirmation Data</h4>
        ${
          confirmation
            ? `
              <p><strong>Attendance:</strong> ${confirmation.attendance}</p>
              <p><strong>Hotel:</strong> ${confirmation.hotelNeeded}</p>
              <p><strong>Transport:</strong> ${confirmation.transportNeeded}</p>
              <p><strong>Food Restriction:</strong> ${confirmation.foodRestriction || "-"}</p>
              <p><strong>Notes:</strong> ${confirmation.notes || "-"}</p>
            `
            : `<p class="empty-state">No confirmation yet.</p>`
        }
      </div>
    </div>
  `;

  document.getElementById("adminStatus").value = participant.status;
  document.getElementById("adminNotes").value = participant.adminNotes || "";

  detailModal.classList.add("show");
}

function saveVerification() {
  const status = document.getElementById("adminStatus").value;
  const notes = document.getElementById("adminNotes").value;

  participants = participants.map(participant => {
    if (participant.id === selectedParticipantId) {
      return {
        ...participant,
        status,
        adminNotes: notes
      };
    }

    return participant;
  });

  saveParticipants();
  detailModal.classList.remove("show");
  refreshApp();

  showToast("Verification updated!");
}

function deleteEvent(index) {
  const selectedEvent = events[index];
  const linkedParticipants = participants.filter(p => p.eventId === selectedEvent.id);

  if (linkedParticipants.length > 0) {
    alert("This event still has participants.");
    return;
  }

  events.splice(index, 1);
  saveEvents();
  refreshApp();
}

function deleteParticipant(participantId) {
  const confirmDelete = confirm("Are you sure you want to delete this participant?");
  if (!confirmDelete) return;

  participants = participants.filter(item => item.id !== participantId);
  confirmations = confirmations.filter(item => item.participantId !== participantId);
  checkins = checkins.filter(item => item.participantId !== participantId);

  saveParticipants();
  saveConfirmations();
  saveCheckins();

  refreshApp();
}

function exportParticipantsCsv() {
  const rows = [
    [
      "Name",
      "Company",
      "Event",
      "WhatsApp",
      "Email",
      "Status",
      "Arrival Status",
      "Checked-in At"
    ]
  ];

  participants.forEach(participant => {
    const checkin = getCheckinByParticipantId(participant.id);

    rows.push([
      participant.name,
      participant.company,
      getEventName(participant.eventId),
      participant.whatsapp,
      participant.email,
      participant.status,
      checkin ? "Arrived" : "Not Arrived",
      checkin ? new Date(checkin.checkedInAt).toLocaleString("id-ID") : ""
    ]);
  });

  const csvContent = rows.map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "watermark-participants-arrival-report.csv";
  link.click();

  showToast("CSV exported!");
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

closeDetailModal.addEventListener("click", () => {
  detailModal.classList.remove("show");
});

saveVerificationBtn.addEventListener("click", saveVerification);

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

  const newParticipant = {
    id: generateId("participant"),
    eventId: document.getElementById("participantEvent").value,
    name: document.getElementById("participantName").value,
    company: document.getElementById("participantCompany").value,
    whatsapp: document.getElementById("participantWhatsapp").value,
    email: document.getElementById("participantEmail").value,
    status: document.getElementById("participantStatus").value,
    arrivalStatus: "Not Arrived",
    adminNotes: ""
  };

  participants.push(newParticipant);
  saveParticipants();

  participantForm.reset();
  participantModal.classList.remove("show");

  refreshApp();
});

searchInput.addEventListener("input", renderParticipantTable);
statusFilter.addEventListener("change", renderParticipantTable);
eventFilter.addEventListener("change", renderParticipantTable);
exportCsvBtn.addEventListener("click", exportParticipantsCsv);

function refreshApp() {
  checkins = JSON.parse(localStorage.getItem("wph_checkins")) || [];

  renderDashboard();
  renderEventOptions();
  renderEventFilterOptions();
  renderEvents();
  renderNoShowList();
  renderParticipantTable();
}

refreshApp();
