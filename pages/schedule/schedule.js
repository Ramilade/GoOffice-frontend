import { API_URL } from "../../settings.js";
import {
  hideLoading,
  sanitizeStringWithTableRows,
  showLoading,
} from "../../utils.js";

let employeeId;
let currentDate;
let selectedDate = null;
let morningShiftId;
let afternoonShiftId;


export async function initSchedule() {
  employeeId = await fetchEmployeeId();
  createCurrentDate();
  createWeekContainers();
  attachEventListeners();
  createCalendar();
}
async function fetchEmployeeId() {
  const response = await fetch(API_URL + "employee/findbyid", {
    credentials: "include",
  });
  const id = await response.json();
  return id;
}

function createCurrentDate() {
  currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Set to Monday of the current week
}

function attachEventListeners() {
  document.getElementById("bookMorning").addEventListener("click", function () {
    bookShift("morning", employeeId, selectedDate);
  });

  document
    .getElementById("bookAfternoon")
    .addEventListener("click", function () {
      bookShift("afternoon", employeeId, selectedDate);
    });

  document
    .getElementById("cancelShift1")
    .addEventListener("click", function () {
      cancelShift(morningShiftId);
    });

  document
    .getElementById("cancelShift2")
    .addEventListener("click", function () {
      cancelShift(afternoonShiftId);
    });
}

function isDateBeforeToday(date) {
  const today = new Date();
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const parsedDateWithoutTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const currentHours = today.getHours();

  return (
    todayWithoutTime.getTime() > parsedDateWithoutTime.getTime() ||
    (todayWithoutTime.getTime() === parsedDateWithoutTime.getTime() &&
      currentHours >= 17)
  );
}

function createWeekContainers() {
  const template = document.querySelector(".template");
  for (let i = 1; i <= 4; i++) {
    const weekContainer = document.createElement("div");
    weekContainer.id = `week${i}`;
    weekContainer.classList.add("week");
    template.appendChild(weekContainer);
  }
}

function createCalendar() {
  for (let i = 0; i < 4; i++) {
    const weekContainer = document.getElementById(`week${i + 1}`);
    const weekStart = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() - 3);
    const weekNumber = getWeekNumber(weekStart);
    const weekLabel = document.createElement("h3");
    weekLabel.innerHTML = `Week ${weekNumber}: ${weekStart.toDateString()} - ${weekEnd.toDateString()}`;
    weekContainer.appendChild(weekLabel);

    const days = document.createElement("div");
    days.classList.add("days");
    weekContainer.appendChild(days);

    for (let j = 1; j <= 5; j++) {
      const day = document.createElement("div");
      day.classList.add("day");

      // Create a new date object to pass to the showModal function
      const clickedDate = new Date(weekStart);

      if (!isDateBeforeToday(clickedDate)) {
          const dayElement = document.querySelector(
            `.day[data-date="${clickedDate.toISOString().substring(0, 10)}"]`
          );
      } else {
        day.classList.add("disabled-date"); // This class will be used to style disabled dates
      }
      days.appendChild(day);
      fetchAndDisplayBookings(clickedDate, day, employeeId); // Correctly pass day element here
      weekStart.setDate(weekStart.getDate() + 1);
    }
  }
}

async function showModal(date) {
  const modal = document.getElementById("modal");
  const modalDate = document.getElementById("modalDate");
  const closeBtn = document.getElementsByClassName("close")[0];

  selectedDate = date;

  const bookings = await fetchBookings(date);
  getShiftInfo(bookings, employeeId)

  updateButtonStates(bookings);

  modal.style.display = "block";
  modalDate.innerText = date.toDateString();

  displayEmployeeNames(bookings);


  
  closeBtn.onclick = function () {
    modal.style.display = "none";
    location.reload();
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      location.reload();
    }
  };
}

async function fetchBookings(date) {
  try {
    const response = await fetch(
      API_URL +
        "booking/findbookingsbydate/" +
        date.toISOString().split("T")[0],
      {
        credentials: "include",
      }
    );

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

function updateButtonStates(bookings) {
  const bookMorningBtn = document.getElementById("bookMorning");
  const bookAfternoonBtn = document.getElementById("bookAfternoon");
  const cancelShiftMorningBtn = document.getElementById("cancelShift1");
  const cancelShiftAfternoonBtn = document.getElementById("cancelShift2");

  let morningShifts = 7;
  let afternoonShifts = 7;
  let currentUserMorningBooked = false;
  let currentUserAfternoonBooked = false;

  bookings.forEach((booking) => {
    const shiftStart = new Date(booking.shiftStart);
    const shiftEnd = new Date(booking.shiftEnd);

    if (shiftStart.getHours() === 8 && shiftEnd.getHours() === 12) {
      morningShifts--;
      if (booking.employeeResponse?.employeeId === employeeId) {
        currentUserMorningBooked = true;
      }
    } else if (shiftStart.getHours() === 12 && shiftEnd.getHours() === 17) {
      afternoonShifts--;
      if (booking.employeeResponse?.employeeId === employeeId) {
        currentUserAfternoonBooked = true;
      }
    }
  });

  if (morningShifts <= 0) {
    bookMorningBtn.setAttribute("disabled", "disabled");
  } else {
    bookMorningBtn.removeAttribute("disabled");
  }

  if (afternoonShifts <= 0) {
    bookAfternoonBtn.setAttribute("disabled", "disabled");
  } else {
    bookAfternoonBtn.removeAttribute("disabled");
  }

  if (currentUserMorningBooked) {
    bookMorningBtn.style.display = "none";
    cancelShiftMorningBtn.style.display = "block";
  } else {
    bookMorningBtn.style.display = "block";
    cancelShiftMorningBtn.style.display = "none";
  }

  if (currentUserAfternoonBooked) {
    bookAfternoonBtn.style.display = "none";
    cancelShiftAfternoonBtn.style.display = "block";
  } else {
    bookAfternoonBtn.style.display = "block";
    cancelShiftAfternoonBtn.style.display = "none";
  }
}

function displayEmployeeNames(bookings) {
  const employeeNamesContainerMorning = document.getElementById("employeeNamesMorning");
  const employeeNamesContainerAfternoon = document.getElementById("employeeNamesAfternoon");
  employeeNamesContainerMorning.innerHTML = ""; // Clear the container before adding new employee names
  employeeNamesContainerAfternoon.innerHTML = "";
  

  const uniqueEmployeesMorning = new Set(); // Use a Set to store unique employee names
  const uniqueEmployeesAfternoon = new Set();
  bookings.forEach((booking) => {
    const employeeName = booking.employeeResponse.name;
    const shiftStart = new Date(booking.shiftStart);
    if(shiftStart.getHours() === 8){
      uniqueEmployeesMorning.add("◾️ " + employeeName);
    } else {
      uniqueEmployeesAfternoon.add("◾️ " + employeeName);
    }
  });

  uniqueEmployeesMorning.forEach((name) => {
    const nameElement = document.createElement("p");
    nameElement.innerText = name;
    employeeNamesContainerMorning.appendChild(nameElement);
  });

  uniqueEmployeesAfternoon.forEach((name) => {
    const nameElement = document.createElement("p");
    nameElement.innerText = name;
    employeeNamesContainerAfternoon.appendChild(nameElement);
  });
}

async function fetchAndDisplayBookings(date, dayElement, employeeId) {

  const bookings = await fetchBookings(date);

  let morningShifts = 7;
  let afternoonShifts = 7;
  let currentUserMorningBooked = false;
  let currentUserAfternoonBooked = false;
  let flagDisplay1 = "none";
  let flagDisplay2 = "none";

  bookings.forEach((booking) => {
    const shiftStart = new Date(booking.shiftStart);
    const shiftEnd = new Date(booking.shiftEnd);

    if (
      date.toISOString().split("T")[0] ===
      shiftStart.toISOString().split("T")[0]
    ) {
      if (booking.employeeResponse.employeeId === employeeId) {
        if (shiftStart.getHours() === 8 && shiftEnd.getHours() === 12) {
          currentUserMorningBooked = true;
          flagDisplay1 = "inline";
        } else if (shiftStart.getHours() === 12 && shiftEnd.getHours() === 17) {
          currentUserAfternoonBooked = true;
          flagDisplay2 = "inline";
        }
      }

    if (shiftStart.getHours() === 8 && shiftEnd.getHours() === 12) {
      morningShifts--;
    } else if (shiftStart.getHours() === 12 && shiftEnd.getHours() === 17) {
      afternoonShifts--;
    }

      
    }
  });


  // Inside fetchAndDisplayBookings function
  dayElement.innerHTML = `<div class="day-content"><span">${getDayName(
    date
  )} ${date.getDate()}/${
    date.getMonth() + 1
  }</span><br><div style="text-align:center">
  <span>🌞: ${morningShifts}</span><span class="flag" style="display:${flagDisplay1}; ">  ✔️</span>
  <span> <br>🌚: ${afternoonShifts}</span><span class="flag" style="display:${flagDisplay2}; ">  ✔️</span></div></div>`;

  const cancelShiftMorningBtn = document.getElementById("cancelShift1");
  const cancelShiftAfternoonBtn = document.getElementById("cancelShift2");

  if (currentUserMorningBooked) {
    document.getElementById("bookMorning").style.display = "none";
    cancelShiftMorningBtn.style.display = "block";
  } else {
    document.getElementById("bookMorning").style.display = "block";
    cancelShiftMorningBtn.style.display = "none";
  }

  if (currentUserAfternoonBooked) {
    document.getElementById("bookAfternoon").style.display = "none";
    cancelShiftAfternoonBtn.style.display = "block";
  } else {
    document.getElementById("bookAfternoon").style.display = "block";
    cancelShiftAfternoonBtn.style.display = "none";
  }

  if (currentUserMorningBooked) {
    document.getElementById("bookMorning").setAttribute("disabled", "disabled");
  } else {
    document.getElementById("bookMorning").removeAttribute("disabled");
  }

  if (currentUserAfternoonBooked) {
    document
      .getElementById("bookAfternoon")
      .setAttribute("disabled", "disabled");
  } else {
    document.getElementById("bookAfternoon").removeAttribute("disabled");
  }

  dayElement.addEventListener("click", () => {
    showModal(date)
  });
}

function getDayName(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

function getWeekNumber(date) {
  const tempDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  tempDate.setDate(tempDate.getDate() + (1 - tempDate.getDay()) + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
  }
  
  return 1 + Math.ceil((firstThursday - tempDate) / 604800000);
}

//Function to convert the JavaScript Date object to the correct local time string
function toLocalISOString(date) {
  const tzOffset = -date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + tzOffset);
  return localDate.toISOString().split(".")[0];
}

async function bookShift(shiftType, employeeId, date) {
  const shiftStart = new Date(date);
  const shiftEnd = new Date(date);
  shiftStart.setMinutes(0);
  shiftStart.setSeconds(0);
  shiftEnd.setMinutes(0);
  shiftEnd.setSeconds(0);

  if (shiftType === "morning") {
    shiftStart.setHours(8);
    shiftEnd.setHours(12);
  } else if (shiftType === "afternoon") {
    shiftStart.setHours(12);
    shiftEnd.setHours(17);
  }

  const booking = {
    shiftStart: toLocalISOString(shiftStart),
    shiftEnd: toLocalISOString(shiftEnd),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    employeeId: employeeId.toString(),
  };

  try {
    const response = await fetch(API_URL + "booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      console.error("Failed to create booking:", errorJson.message, booking);
      throw new Error(errorJson.message);
    }

    const dayElement = document.querySelector(
      `.day[data-date="${selectedDate.toISOString().substring(0, 10)}"]`
    );
    if (dayElement !== null) {
      await fetchAndDisplayBookings(selectedDate, dayElement, employeeId);
    }
    showModal(selectedDate); // Refresh the modal after booking
  } catch (error) {
    console.error(error);
  }
}

async function getShiftInfo(bookings, employeeId) {

  let morningShifts = 7;
  let afternoonShifts = 7;
  let currentUserMorningBooked = false;
  let currentUserAfternoonBooked = false;

  bookings.forEach((booking) => {
    const shiftStart = new Date(booking.shiftStart);
    const shiftEnd = new Date(booking.shiftEnd);

    if (booking.employeeResponse.employeeId === employeeId) {
      if (shiftStart.getHours() === 8 && shiftEnd.getHours() === 12) {
        currentUserMorningBooked = true;
        morningShiftId = booking.bookingId;
      } else if (shiftStart.getHours() === 12 && shiftEnd.getHours() === 17) {
        currentUserAfternoonBooked = true;
        afternoonShiftId = booking.bookingId;
      }
    }

    if (shiftStart.getHours() === 8 && shiftEnd.getHours() === 12) {
      morningShifts--;
    } else if (shiftStart.getHours() === 12 && shiftEnd.getHours() === 17) {
      afternoonShifts--;
    }
  });

  return {
    morningShifts: morningShifts,
    afternoonShifts: afternoonShifts,
    currentUserMorningBooked: currentUserMorningBooked,
    currentUserAfternoonBooked: currentUserAfternoonBooked,
  };
}

async function cancelShift(shiftId) {
  try {
    if (!shiftId) {
      throw new Error("Shift ID is undefined.");
    }

    const response = await fetch(API_URL + "booking/delete/" + shiftId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete shift.");
    }

    showModal(selectedDate);
  } catch (error) {
    console.error(error);
  }
}
