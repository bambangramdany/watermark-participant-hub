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

document.getElementById(
  "userInfo"
).innerHTML = `
  Logged as:
  <strong>${loggedUser.email}</strong>
  (${loggedUser.role})
`;

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

logoutBtn.addEventListener(
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
// ROLE PERMISSION
// ======================

const isSuperAdmin =
  loggedUser.role ===
  "Super Admin";

const isRegistration =
  loggedUser.role ===
  "Registration";

const isViewer =
  loggedUser.role ===
  "Viewer";

// ======================
// DEFAULT DATA
// ======================

const defaultEvents = [
  {
    id: "event-001",
    name: "Daikin National Gathering",
    date: "2026-06-12",
    venue: "JCC",
    status: "Active"
  }
];

const defaultParticipants = [
  {
    id: "participant-001",
    name: "Bambang Ramdany",
    company:
      "PT Sinematik Anak Bangsa",
    tableNumber: "Table 8",
    status: "Finalized"
  },
  {
    id: "participant-002",
    name: "Andi Pratama",
    company:
      "PT Contoh Sejahtera",
    tableNumber: "Table 12",
    status: "Verified"
  }
];

let events =
  JSON.parse(
    localStorage.getItem(
      "wph_events"
    )
  ) || defaultEvents;

let participants =
  JSON.parse(
    localStorage.getItem(
      "wph_participants"
    )
  ) || defaultParticipants;

// ======================
// RENDER DASHBOARD
// ======================

function renderDashboard() {
  const total =
    participants.length;

  const arrived =
    participants.filter(
      p => p.arrivalStatus ===
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
// EVENT LIST
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
      <td>${event.name}</td>
      <td>${event.date}</td>
      <td>${event.venue}</td>
      <td>${event.status}</td>
    `;

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
// PARTICIPANT TABLE
// ======================

function renderParticipants() {
  const table =
    document.getElementById(
      "participantTable"
    );

  table.innerHTML = "";

  participants.forEach(
    participant => {

      let actionButtons = `
        <a
          class="btn-link small-btn"
          href="invitation.html?id=${participant.id}"
          target="_blank"
        >
          Invitation
        </a>
      `;

      if (
        isSuperAdmin ||
        isRegistration
      ) {
        actionButtons += `
          <a
            class="btn-link small-btn"
            href="checkin.html?id=${participant.id}"
            target="_blank"
          >
            Check-in
          </a>
        `;
      }

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
          ${actionButtons}
        </td>
      `;

      table.appendChild(row);
    }
  );
}

// ======================
// PERMISSION HIDE
// ======================

if (isViewer) {
  document.getElementById(
    "openEventForm"
  ).style.display = "none";

  document.getElementById(
    "openParticipantForm"
  ).style.display = "none";
}

// ======================
// INIT
// ======================

renderDashboard();
renderEvents();
renderNoShowList();
renderParticipants();
