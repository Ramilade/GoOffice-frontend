import { API_URL } from "../../settings.js";
import { hideLoading, sanitizeStringWithTableRows, showLoading } from "../../utils.js";

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export async function initSchedule() {
    document.addEventListener('DOMContentLoaded', () => {
        initSchedule();
      });
  generateCalendar();

  document.getElementById("calendar").addEventListener("click", (e) => {
    const clickedElement = e.target;
    const dayElement = clickedElement.classList.contains("day")
      ? clickedElement
      : clickedElement.closest(".day");
    if (dayElement) {
      const selectedElement = document.querySelector(".day.selected");
      if (selectedElement) {
        selectedElement.classList.remove("selected");
      }
      dayElement.classList.add("selected");
    }
  });
  
  
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
    calendarHTML += `
      <div class="week">
        <h3>Week ${weekNumber}</h3>
        <div class="days">`;
        for (let j = 0; j < DAYS_OF_WEEK.length; j++) {
          const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + j);
          if (currentDate.getMonth() === startDate.getMonth()) {
            const dayNumber = currentDate.getDate();
            const options = { day: '2-digit', month: '2-digit', timeZone: 'Europe/Copenhagen' };
            const dateString = currentDate.toLocaleDateString('en-DK', options);
            const isPast = currentDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);

            calendarHTML += `
              <div class="day ${isPast ? 'past' : ''}" data-date="${currentDate.toISOString()}">
                <div class="day-name">${DAYS_OF_WEEK[j]}</div>
                <div class="day-number">${dateString}</div>
              </div>`;
          } else {
            calendarHTML += `<div class="day"></div>`;
          }
        }
    calendarHTML += `</div>`;
    calendarHTML += `
      <div class="booking-options">
        <div class="book-form-container"></div>
      </div>
    </div>`;
  }

  

  // Set calendar HTML
  document.getElementById('calendar').innerHTML = calendarHTML;

  // Add click event listeners to days
  const days = document.querySelectorAll('.day');
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    day.addEventListener('click', function() {
      if (!day.classList.contains('booked')) {
        const bookingOptions = day.closest('.week').querySelector('.booking-options .book-form-container');
        const formHTML = `
          <form class="book-form">
            <label>
              <input type="radio" name="shift" value="morning"> Morning
            </label>
            <label>
              <input type="radio" name="shift" value="afternoon"> Afternoon
            </label>
            <label>
              <input type="radio" name="shift" value="full-day"> Full day
            </label>
            <button type="submit">Book</button>
          </form>
        `;
        bookingOptions.innerHTML = formHTML;

        const form = bookingOptions.querySelector('.book-form');
        form.addEventListener('submit', function(event) {
          event.preventDefault();
          const shift = form.elements['shift'].value;
          ///////////////////////////////////////////////////////////////////////////////////////////
          const employeeId = 1; // hardcoded for now, should be retrieved from the logged in user
          ///////////////////////////////////////////////////////////////////////////////////////////
          bookShift(day, shift, employeeId);
        });
      }
    });
  }


  
    // Reset booked shifts
    document.querySelectorAll('.day').forEach(day => day.classList.remove('booked'));
  

  }

  async function bookShift(day, shift, employeeId) {
    const shiftStart = new Date(day.dataset.date);
    // Set the start and end hours of the shift by local time plus 2 hours hence the odd numbers due to UTC times
    shiftStart.setHours(10);
    const shiftEnd = new Date(shiftStart);
    if (shift === 'morning') {
      shiftEnd.setHours(14);
    } else if (shift === 'afternoon') {
      shiftStart.setHours(14);
    } else {
      shiftEnd.setHours(19);
    }
  
    const booking = {
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      employeeId: employeeId.toString(),
    };
  
    try {
      const response = await fetch(API_URL + 'booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
      });
  
      if (!response.ok) {
        
        throw new Error('Failed to create booking');
      }
  
  
    } catch (error) {
      console.error(error);
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


