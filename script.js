// ==============================
// DEFAULT DATA
// ==============================

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
    adminNotes: ""
  }
];

// ==============================
// STORAGE
// ==============================

let events =
  JSON.parse(localStorage.getItem("wph_events")) || defaultEvents;

let participants =
  JSON.parse(localStorage.getItem("wph_participants")) ||
  defaultParticipants;

let confirmations =
  JSON.parse(localStorage.getItem("wph_confirmations")) || [];

let selectedParticipantId = null;

// ==============================
// ELEMENTS
// ==============================

const eventModal = document.getElementById("eventModal");
const participantModal = document.getElementById("participantModal");
const detailModal = document.getElementById("detailModal");

const openEventForm = document.getElementById("openEventForm");
const closeEventForm = document.getElementById("closeEventForm");

const openParticipantForm =
  document.getElementById("openParticipantForm");

const closeParticipantForm =
  document.getElementById("closeParticipantForm");

const closeDetailModal =
  document.getElementById("closeDetailModal");

const eventForm = document.getElementById("eventForm");
const participantForm =
  document.getElementById("participantForm");

const saveVerificationBtn =
  document.getElementById("saveVerificationBtn");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const eventFilter = document.getElementById("eventFilter");

const exportCsvBtn = document.getElementById("exportCsvBtn");

// ==============================
// HELPERS
// ==============================

function generateId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function saveEvents() {
  localStorage.setItem("wph_events", JSON.stringify(events));
}

function saveParticipants() {
  localStorage.setItem(
    "wph_participants",
    JSON.stringify(participants)
  );
}

function saveConfirmations() {
  localStorage.setItem(
    "wph_confirmations",
    JSON.stringify(confirmations)
  );
}

function getEventName(eventId) {
  const event = events.find((item) => item.id === eventId);
  return event ? event.name : "No Event";
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function getParticipantById(participantId) {
  return participants.find(
    (item) => item.id === participantId
  );
}

function getConfirmationByParticipantId(participantId) {
  return confirmations.find(
    (item) => item.participantId === participantId
  );
}

function getConfirmationUrl(participantId) {
  const baseUrl =
    window.location.origin +
    window.location.pathname.replace("index.html", "");

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

// ==============================
// DASHBOARD
// ==============================

function renderDashboard() {
  document.getElementById("totalEvents").textContent =
    events.length;

  document.getElementById("totalParticipants").textContent =
    participants.length;

  const confirmed = participants.filter((p) =>
    ["Submitted", "Verified", "Finalized"].includes(p.status)
  ).length;

  const pending = participants.filter(
    (p) => p.status === "Pending"
  ).length;

  document.getElementById(
    "confirmedParticipants"
  ).textContent = confirmed;

  document.getElementById(
    "pendingParticipants"
  ).textContent = pending;
}

// ==============================
// FILTERS
// ==============================

function renderEventFilterOptions() {
  eventFilter.innerHTML =
    `<option value="">All Events</option>`;

  events.forEach((event) => {
    const option = document.createElement("option");

    option.value = event.id;
    option.textContent = event.name;

    eventFilter.appendChild(option);
  });
}

// ==============================
// EVENT OPTIONS
// ==============================

function renderEventOptions() {
  const select =
    document.getElementById("participantEvent");

  select.innerHTML = "";

  events.forEach((event) => {
    const option = document.createElement("option");

    option.value = event.id;
    option.textContent = event.name;

    select.appendChild(option);
  });
}

// ==============================
// EVENT TABLE
// ==============================

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
        <span class="badge ${
          event.status === "Active"
            ? "active"
            : "draft"
        }">
          ${event.status}
        </span>
      </td>

      <td>
        <button
          class="small-btn danger"
          onclick="deleteEvent(${index})"
        >
          Delete
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

// ==============================
// RECENT PARTICIPANT
// ==============================

function renderParticipantStatusList() {
  const list =
    document.getElementById("participantList");

  list.innerHTML = "";

  participants
    .slice(-5)
    .reverse()
    .forEach((participant) => {
      const item = document.createElement("div");

      item.className = "participant-item";

      item.innerHTML = `
        <div>
          <p>${participant.name}</p>
          <span>${participant.company}</span>
        </div>

        <span class="badge ${getStatusClass(
          participant.status
        )}">
          ${participant.status}
        </span>
      `;

      list.appendChild(item);
    });
}

// ==============================
// PARTICIPANT TABLE
// ==============================

function renderParticipantTable() {
  const table =
    document.getElementById("participantTable");

  table.innerHTML = "";

  const searchValue =
    searchInput.value.toLowerCase();

  const selectedStatus =
    statusFilter.value;

  const selectedEvent =
    eventFilter.value;

  const filteredParticipants =
    participants.filter((participant) => {
      const matchSearch =
        participant.name
          .toLowerCase()
          .includes(searchValue) ||
        participant.company
          .toLowerCase()
          .includes(searchValue);

      const matchStatus =
        !selectedStatus ||
        participant.status === selectedStatus;

      const matchEvent =
        !selectedEvent ||
        participant.eventId === selectedEvent;

      return (
        matchSearch &&
        matchStatus &&
        matchEvent
      );
    });

  if (filteredParticipants.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          No participant found.
        </td>
      </tr>
    `;

    return;
  }

  filteredParticipants.forEach(
    (participant, index) => {
      const confirmation =
        getConfirmationByParticipantId(
          participant.id
        );

      const confirmationStatus =
        confirmation
          ? "Submitted"
          : "Not Submitted";

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${participant.name}</td>

        <td>${participant.company}</td>

        <td>${getEventName(
          participant.eventId
        )}</td>

        <td>${participant.whatsapp}</td>

        <td>${participant.email}</td>

        <td>
          <span class="badge ${getStatusClass(
            participant.status
          )}">
            ${participant.status}
          </span>
        </td>

        <td>
          <div style="margin-bottom:6px;">
            <span class="badge ${
              confirmation
                ? "submitted"
                : "pending"
            }">
              ${confirmationStatus}
            </span>
          </div>

          <a
            class="btn-link small-btn"
            href="${getConfirmationUrl(
              participant.id
            )}"
            target="_blank"
          >
            Open
          </a>

          <button
            class="small-btn copy-btn"
            onclick="copyConfirmationLink('${
              participant.id
            }')"
          >
            Copy Link
          </button>
        </td>

        <td>
          <button
            class="small-btn detail-btn"
            onclick="openParticipantDetail('${
              participant.id
            }')"
          >
            Detail
          </button>

          <button
            class="small-btn danger"
            onclick="deleteParticipant(${index})"
          >
            Delete
          </button>
        </td>
      `;

      table.appendChild(row);
    }
  );
}

// ==============================
// DETAIL
// ==============================

function openParticipantDetail(participantId) {
  const participant =
    getParticipantById(participantId);

  const confirmation =
    getConfirmationByParticipantId(
      participantId
    );

  const detailContent =
    document.getElementById("detailContent");

  selectedParticipantId =
    participantId;

  detailContent.innerHTML = `
    <div class="detail-grid">

      <div class="detail-card">
        <h4>Participant Profile</h4>

        <p><strong>Name:</strong>
        ${participant.name}</p>

        <p><strong>Company:</strong>
        ${participant.company}</p>

        <p><strong>Event:</strong>
        ${getEventName(participant.eventId)}</p>

        <p><strong>WhatsApp:</strong>
        ${participant.whatsapp}</p>

        <p><strong>Email:</strong>
        ${participant.email}</p>

        <p>
          <strong>Status:</strong>

          <span class="badge ${getStatusClass(
            participant.status
          )}">
            ${participant.status}
          </span>
        </p>
      </div>

      <div class="detail-card">
        <h4>Confirmation Data</h4>

        ${
          confirmation
            ? `
              <p><strong>Attendance:</strong>
              ${confirmation.attendance}</p>

              <p><strong>Hotel:</strong>
              ${confirmation.hotelNeeded}</p>

              <p><strong>Transport:</strong>
              ${confirmation.transportNeeded}</p>

              <p><strong>Food Restriction:</strong>
              ${
                confirmation.foodRestriction ||
                "-"
              }</p>

              <p><strong>Notes:</strong>
              ${confirmation.notes || "-"}</p>
            `
            : `
              <p class="empty-state">
                No confirmation yet.
              </p>
            `
        }
      </div>
    </div>
  `;

  document.getElementById(
    "adminStatus"
  ).value = participant.status;

  document.getElementById(
    "adminNotes"
  ).value =
    participant.adminNotes || "";

  detailModal.classList.add("show");
}

// ==============================
// SAVE VERIFICATION
// ==============================

function saveVerification() {
  const status =
    document.getElementById(
      "adminStatus"
    ).value;

  const notes =
    document.getElementById(
      "adminNotes"
    ).value;

  participants =
    participants.map((participant) => {
      if (
        participant.id ===
        selectedParticipantId
      ) {
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

// ==============================
// COPY LINK
// ==============================

function copyConfirmationLink(
  participantId
) {
  navigator.clipboard.writeText(
    getConfirmationUrl(participantId)
  );

  showToast("Confirmation link copied!");
}

// ==============================
// DELETE
// ==============================

function deleteEvent(index) {
  const selectedEvent = events[index];

  const linkedParticipants =
    participants.filter(
      (p) =>
        p.eventId === selectedEvent.id
    );

  if (linkedParticipants.length > 0) {
    alert(
      "This event still has participants."
    );

    return;
  }

  events.splice(index, 1);

  saveEvents();

  refreshApp();
}

function deleteParticipant(index) {
  participants.splice(index, 1);

  saveParticipants();

  refreshApp();
}

// ==============================
// EXPORT CSV
// ==============================

function exportParticipantsCsv() {
  const rows = [
    [
      "Name",
      "Company",
      "Event",
      "WhatsApp",
      "Email",
      "Status"
    ]
  ];

  participants.forEach((participant) => {
    rows.push([
      participant.name,
      participant.company,
      getEventName(participant.eventId),
      participant.whatsapp,
      participant.email,
      participant.status
    ]);
  });

  const csvContent = rows
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const link =
    document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download =
    "watermark-participants.csv";

  link.click();

  showToast("CSV exported!");
}

// ==============================
// EVENTS
// ==============================

openEventForm.addEventListener(
  "click",
  () => {
    eventModal.classList.add("show");
  }
);

closeEventForm.addEventListener(
  "click",
  () => {
    eventModal.classList.remove("show");
  }
);

openParticipantForm.addEventListener(
  "click",
  () => {
    renderEventOptions();

    participantModal.classList.add(
      "show"
    );
  }
);

closeParticipantForm.addEventListener(
  "click",
  () => {
    participantModal.classList.remove(
      "show"
    );
  }
);

closeDetailModal.addEventListener(
  "click",
  () => {
    detailModal.classList.remove(
      "show"
    );
  }
);

saveVerificationBtn.addEventListener(
  "click",
  saveVerification
);

eventForm.addEventListener(
  "submit",
  function (e) {
    e.preventDefault();

    const newEvent = {
      id: generateId("event"),
      name:
        document.getElementById(
          "eventName"
        ).value,
      date:
        document.getElementById(
          "eventDate"
        ).value,
      venue:
        document.getElementById(
          "eventVenue"
        ).value,
      status:
        document.getElementById(
          "eventStatus"
        ).value
    };

    events.push(newEvent);

    saveEvents();

    eventForm.reset();

    eventModal.classList.remove(
      "show"
    );

    refreshApp();
  }
);

participantForm.addEventListener(
  "submit",
  function (e) {
    e.preventDefault();

    const newParticipant = {
      id: generateId("participant"),
      eventId:
        document.getElementById(
          "participantEvent"
        ).value,
      name:
        document.getElementById(
          "participantName"
        ).value,
      company:
        document.getElementById(
          "participantCompany"
        ).value,
      whatsapp:
        document.getElementById(
          "participantWhatsapp"
        ).value,
      email:
        document.getElementById(
          "participantEmail"
        ).value,
      status:
        document.getElementById(
          "participantStatus"
        ).value,
      adminNotes: ""
    };

    participants.push(newParticipant);

    saveParticipants();

    participantForm.reset();

    participantModal.classList.remove(
      "show"
    );

    refreshApp();
  }
);

// ==============================
// FILTER EVENTS
// ==============================

searchInput.addEventListener(
  "input",
  renderParticipantTable
);

statusFilter.addEventListener(
  "change",
  renderParticipantTable
);

eventFilter.addEventListener(
  "change",
  renderParticipantTable
);

exportCsvBtn.addEventListener(
  "click",
  exportParticipantsCsv
);

// ==============================
// REFRESH
// ==============================

function refreshApp() {
  renderDashboard();
  renderEventOptions();
  renderEventFilterOptions();
  renderEvents();
  renderParticipantStatusList();
  renderParticipantTable();
}

refreshApp();
