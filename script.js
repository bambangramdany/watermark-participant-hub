const events = [
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

  events.forEach(event => {
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

renderDashboard();
renderEvents();
renderParticipants();
