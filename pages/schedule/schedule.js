import { API_URL } from "../../settings.js";
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export async function initSchedule() {
  generateCalendar();
}



function generateCalendar() {
  // Get current date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // Determine the start of the week
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(currentYear, currentMonth, currentDate - dayOfWeek + 1);

  // Create calendar HTML
  let calendarHTML = '';
  for (let i = 0; i < 4; i++) {
    const startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + (i * 7));
    const endDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + (i * 7) + 6);
    const weekNumber = startDate.getWeek();
    calendarHTML += `<div class="week"><h3>Week ${weekNumber}</h3><div class="days">`;
    for (let j = 0; j < DAYS_OF_WEEK.length; j++) {
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + j);
      if (currentDate.getMonth() === startDate.getMonth()) {
        const dayNumber = currentDate.getDate();
        const options = { day: '2-digit', month: '2-digit', timeZone: 'Europe/Copenhagen' };
        const dateString = currentDate.toLocaleDateString('en-DK', options);
        calendarHTML += `<div class="day"><div class="day-name">${DAYS_OF_WEEK[j]}</div><div class="day-number">${dateString}</div></div>`;
      } else {
        calendarHTML += `<div class="day"></div>`;
      }
    }
    calendarHTML += `</div></div>`;
  }

  // Set calendar HTML
  document.getElementById('calendar').innerHTML = calendarHTML;

  // Add click event listeners to weeks
  const weeks = document.querySelectorAll('.week');
  for (let i = 0; i < weeks.length; i++) {
    weeks[i].addEventListener('click', function() {
      const days = this.querySelector('.days');
      if (days.style.display === 'none') {
        days.style.display = 'grid';
      } else {
        days.style.display = 'none';
      }
    });
  }
}

// Extend the Date object to add a getWeek() method
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
};


