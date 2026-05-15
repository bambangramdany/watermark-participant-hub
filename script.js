// ======================
// LOGIN CHECK
// ======================

const loggedUser =
  JSON.parse(
    localStorage.getItem(
      "wph_logged_user"
    )
  );

if (!loggedUser) {
  window.location.href =
    "login.html";
}

// ======================
// USER INFO
// ======================

document.getElementById(
  "userInfo"
).innerHTML = `
  Logged as:
  <strong>${loggedUser.email}</strong>
  (${loggedUser.role})
`;

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    function () {
      localStorage.removeItem(
        "wph_logged_user"
      );

      window.location.href =
        "login.html";
    }
  );

// ======================
// ROLE
// ======================

const isViewer =
  loggedUser.role ===
  "Viewer";

// ======================
// LOCAL PARTICIPANT TEMP
// ======================

let participants =
  JSON.parse(
    localStorage.getItem(
      "wph_participants"
    )
  ) || [];

// ======================
// EVENTS FROM SUPABASE
// ======================

let events = [];

// ======================
// FETCH EVENTS
// ======================

async function fetchEvents() {
  const { data, error } =
    await supabaseClient
      .from("events")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    alert(
      "Failed load events"
    );
    return;
  }

  events = data;

  renderEvents();
}

// ======================
// CREATE EVENT
// ======================

async function createEvent(
  payload
) {
  const { error } =
    await supabaseClient
      .from("events")
      .insert([
        {
          event_name:
            payload.event_name,
          event_date:
            payload.event_date,
          venue:
            payload.venue,
          status:
            payload.status
        }
      ]);

  if (error) {
    console.error(error);

    alert(
      "Failed create event"
    );

    return;
  }

  fetchEvents();
}

// ======================
// DELETE EVENT
// ======================

async function deleteEvent(id) {
  const confirmDelete =
    confirm(
      "Delete this event?"
    );

  if (!confirmDelete) return;

  const { error } =
    await supabaseClient
      .from("events")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(error);

    alert(
      "Failed delete event"
    );

    return;
  }

  fetchEvents();
}

// ======================
// DASHBOARD
// ======================

function renderDashboard() {
  const total =
    participants.length;

  const arrived =
    participants.filter(
      p =>
        p.arrivalStatus ===
        "Arrived"
    ).length;

  const notArrived =
    total - arrived;

  const rate =
    total > 0
      ? Math.round(
          (arrived / total) * 100
        )
      : 0;

  document.getElementById(
    "totalParticipants"
  ).textContent = total;

  document.getElementById(
    "arrivedParticipants"
  ).textContent = arrived;

  document.getElementById(
    "notArrivedParticipants"
  ).textContent = notArrived;

  document.getElementById(
    "arrivalRate"
  ).textContent = `${rate}%`;
}

// ======================
// EVENT TABLE
// ======================

function renderEvents() {
  const table =
    document.getElementById(
      "eventTable"
    );

  table.innerHTML = "";

  events.forEach(event => {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${event.event_name}</td>

      <td>${event.event_date || "-"}</td>

      <td>${event.venue || "-"}</td>

      <td>
        <span class="badge ${
          event.status === "Active"
            ? "active"
            : "draft"
        }">
          ${event.status}
        </span>
      </td>
    `;

    if (!isViewer) {
      row.innerHTML += `
        <td>
          <button
            class="small-btn danger"
            onclick="deleteEvent('${event.id}')"
          >
            Delete
          </button>
        </td>
      `;
    }

    table.appendChild(row);
  });
}

// ======================
// NOSHOW
// ======================

function renderNoShowList() {
  const list =
    document.getElementById(
      "noShowList"
    );

  list.innerHTML = "";

  const noShows =
    participants.filter(
      p =>
        p.arrivalStatus !==
        "Arrived"
    );

  noShows.forEach(participant => {
    const item =
      document.createElement("div");

    item.className =
      "participant-item";

    item.innerHTML = `
      <div>
        <p>${participant.name}</p>

        <span>
          ${participant.company}
        </span>
      </div>

      <span class="badge pending">
        Not Arrived
      </span>
    `;

    list.appendChild(item);
  });
}

// ======================
// PARTICIPANTS TEMP
// ======================

function renderParticipants() {
  const table =
    document.getElementById(
      "participantTable"
    );

  table.innerHTML = "";

  participants.forEach(
    participant => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${participant.name}</td>

        <td>${participant.company}</td>

        <td>
          ${participant.tableNumber || "-"}
        </td>

        <td>
          ${participant.status}
        </td>

        <td>
          <a
            class="btn-link small-btn"
            href="invitation.html?id=${participant.id}"
            target="_blank"
          >
            Invitation
          </a>
        </td>
      `;

      table.appendChild(row);
    }
  );
}

// ======================
// MODAL
// ======================

const eventModal =
  document.getElementById(
    "eventModal"
  );

const openEventForm =
  document.getElementById(
    "openEventForm"
  );

const closeEventForm =
  document.getElementById(
    "closeEventForm"
  );

const eventForm =
  document.getElementById(
    "eventForm"
  );

if (!isViewer) {
  openEventForm.addEventListener(
    "click",
    () => {
      eventModal.classList.add(
        "show"
      );
    }
  );
} else {
  openEventForm.style.display =
    "none";
}

closeEventForm.addEventListener(
  "click",
  () => {
    eventModal.classList.remove(
      "show"
    );
  }
);

// ======================
// SUBMIT EVENT
// ======================

eventForm.addEventListener(
  "submit",
  async function (e) {
    e.preventDefault();

    const payload = {
      event_name:
        document.getElementById(
          "eventName"
        ).value,

      event_date:
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

    await createEvent(payload);

    eventForm.reset();

    eventModal.classList.remove(
      "show"
    );
  }
);

// ======================
// INIT
// ======================

renderDashboard();
renderNoShowList();
renderParticipants();
fetchEvents();
