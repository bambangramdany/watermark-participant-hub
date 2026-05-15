const loggedUser = JSON.parse(localStorage.getItem("wph_logged_user"));

if (!loggedUser) {
  window.location.href = "login.html";
}

document.getElementById("userInfo").innerHTML = `
  Logged as: <strong>${loggedUser.email}</strong> (${loggedUser.role})
`;

document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("wph_logged_user");
  window.location.href = "login.html";
});

const isViewer = loggedUser.role === "Viewer";

let events = [];
let participants = [];

const eventModal = document.getElementById("eventModal");
const participantModal = document.getElementById("participantModal");

const openEventForm = document.getElementById("openEventForm");
const closeEventForm = document.getElementById("closeEventForm");
const eventForm = document.getElementById("eventForm");

const openParticipantForm = document.getElementById("openParticipantForm");
const closeParticipantForm = document.getElementById("closeParticipantForm");
const participantForm = document.getElementById("participantForm");

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function getStatusClass(status) {
  return String(status || "Pending").toLowerCase().replaceAll(" ", "-");
}

function getEventName(eventId) {
  const event = events.find(item => item.id === eventId);
  return event ? event.event_name : "-";
}

async function fetchEvents() {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Failed to load events.");
    return;
  }

  events = data || [];
  renderEventOptions();
  renderEvents();
  renderDashboard();
}

async function fetchParticipants() {
  const { data, error } = await supabaseClient
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Failed to load participants.");
    return;
  }

  participants = data || [];
  renderParticipants();
  renderRecentParticipants();
  renderDashboard();
}

async function createEvent(payload) {
  const { error } = await supabaseClient
    .from("events")
    .insert([payload]);

  if (error) {
    console.error(error);
    alert("Failed to create event.");
    return;
  }

  showToast("Event saved!");
  await fetchEvents();
}

async function createParticipant(payload) {
  const { error } = await supabaseClient
    .from("participants")
    .insert([payload]);

  if (error) {
    console.error(error);
    alert("Failed to create participant.");
    return;
  }

  showToast("Participant saved!");
  await fetchParticipants();
}

async function deleteEvent(id) {
  const confirmDelete = confirm("Delete this event?");
  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete event. Make sure this event has no participants.");
    return;
  }

  showToast("Event deleted!");
  await fetchEvents();
}

async function deleteParticipant(id) {
  const confirmDelete = confirm("Delete this participant?");
  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("participants")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete participant.");
    return;
  }

  showToast("Participant deleted!");
  await fetchParticipants();
}

function renderDashboard() {
  const totalEvents = events.length;
  const totalParticipants = participants.length;

  const verified = participants.filter(p =>
    ["Verified", "Finalized"].includes(p.status)
  ).length;

  const pending = participants.filter(p =>
    !p.status || p.status === "Pending"
  ).length;

  document.getElementById("totalEvents").textContent = totalEvents;
  document.getElementById("totalParticipants").textContent = totalParticipants;
  document.getElementById("verifiedParticipants").textContent = verified;
  document.getElementById("pendingParticipants").textContent = pending;
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

  events.forEach(event => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${event.event_name}</td>
      <td>${event.event_date || "-"}</td>
      <td>${event.venue || "-"}</td>
      <td>
        <span class="badge ${event.status === "Active" ? "active" : "draft"}">
          ${event.status || "Draft"}
        </span>
      </td>
      <td>
        ${
          isViewer
            ? "-"
            : `<button class="small-btn danger" onclick="deleteEvent('${event.id}')">Delete</button>`
        }
      </td>
    `;

    table.appendChild(row);
  });
}

function renderEventOptions() {
  const select = document.getElementById("participantEvent");
  select.innerHTML = "";

  if (events.length === 0) {
    select.innerHTML = `<option value="">Create event first</option>`;
    return;
  }

  events.forEach(event => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = event.event_name;
    select.appendChild(option);
  });
}

function renderParticipants() {
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

  participants.forEach(participant => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${participant.full_name}</td>
      <td>${participant.company || "-"}</td>
      <td>${getEventName(participant.event_id)}</td>
      <td>${participant.whatsapp || "-"}</td>
      <td>${participant.email || "-"}</td>
      <td>
        <strong>${participant.table_number || "-"}</strong><br>
        <span>${participant.meal_notes || ""}</span>
      </td>
      <td>
        <span class="badge ${getStatusClass(participant.status)}">
          ${participant.status || "Pending"}
        </span>
      </td>
      <td>
        ${
          isViewer
            ? "-"
            : `<button class="small-btn danger" onclick="deleteParticipant('${participant.id}')">Delete</button>`
        }
      </td>
    `;

    table.appendChild(row);
  });
}

function renderRecentParticipants() {
  const list = document.getElementById("recentParticipants");
  list.innerHTML = "";

  if (participants.length === 0) {
    list.innerHTML = `<p class="empty-state">No participant yet.</p>`;
    return;
  }

  participants.slice(0, 6).forEach(participant => {
    const item = document.createElement("div");
    item.className = "participant-item";

    item.innerHTML = `
      <div>
        <p>${participant.full_name}</p>
        <span>${participant.company || "-"} • ${participant.table_number || "No table"}</span>
      </div>
      <span class="badge ${getStatusClass(participant.status)}">
        ${participant.status || "Pending"}
      </span>
    `;

    list.appendChild(item);
  });
}

if (isViewer) {
  openEventForm.style.display = "none";
  openParticipantForm.style.display = "none";
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

eventForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const payload = {
    event_name: document.getElementById("eventName").value,
    event_date: document.getElementById("eventDate").value || null,
    venue: document.getElementById("eventVenue").value,
    status: document.getElementById("eventStatus").value
  };

  await createEvent(payload);

  eventForm.reset();
  eventModal.classList.remove("show");
});

participantForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const selectedEventId = document.getElementById("participantEvent").value;

  if (!selectedEventId) {
    alert("Please create event first.");
    return;
  }

  const payload = {
    event_id: selectedEventId,
    full_name: document.getElementById("participantName").value,
    company: document.getElementById("participantCompany").value,
    whatsapp: document.getElementById("participantWhatsapp").value,
    email: document.getElementById("participantEmail").value,
    table_number: document.getElementById("participantTableNumber").value,
    meal_notes: document.getElementById("participantMealNotes").value,
    status: document.getElementById("participantStatus").value
  };

  await createParticipant(payload);

  participantForm.reset();
  participantModal.classList.remove("show");
});

async function initApp() {
  await fetchEvents();
  await fetchParticipants();
}

initApp();
