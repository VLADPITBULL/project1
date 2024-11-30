$(document).ready(function () {
    const SESSION_TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const MAX_DAYS = 7;
  
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
  
    const generateDates = () => {
      const dates = [];
      for (let i = -MAX_DAYS; i <= MAX_DAYS; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(formatDate(date));
      }
      return dates;
    };
  
    const initLocalStorage = () => {
      if (!localStorage.getItem("bookings")) {
        const data = generateDates().reduce((acc, date) => {
          acc[date] = SESSION_TIMES.reduce((sessions, time) => {
            sessions[time] = Array(64).fill(false); // 64 мест
            return sessions;
          }, {});
          return acc;
        }, {});
        localStorage.setItem("bookings", JSON.stringify(data));
      }
    };
  
    const loadBookings = () => JSON.parse(localStorage.getItem("bookings"));
    const saveBookings = (data) => localStorage.setItem("bookings", JSON.stringify(data));
  
    const renderDates = () => {
      const dates = generateDates();
      const $dateSelect = $("#date");
      $dateSelect.empty();
      dates.forEach((date) => {
        const option = `<option value="${date}">${date}</option>`;
        $dateSelect.append(option);
      });
    };
  
    const renderSessions = (date) => {
      const $sessionList = $("#sessions-list");
      $sessionList.empty();
      const bookings = loadBookings();
      const isArchived = new Date(date) < today;
  
      SESSION_TIMES.forEach((time) => {
        const li = `<li class="${isArchived ? "archived" : ""}" data-time="${time}">
          ${time}
        </li>`;
        $sessionList.append(li);
      });
  
      $("#sessions-list li").click(function () {
        if ($(this).hasClass("archived")) return;
        $("#sessions-list li").removeClass("selected");
        $(this).addClass("selected");
        renderSeats(date, $(this).data("time"));
      });
    };
  
    const renderSeats = (date, time) => {
      const $seatMap = $("#seat-map");
      $seatMap.empty();
      const bookings = loadBookings();
      const seats = bookings[date][time];
      seats.forEach((isBooked, index) => {
        const seat = `<div class="seat ${isBooked ? "booked" : ""}" data-index="${index}">
          ${index + 1}
        </div>`;
        $seatMap.append(seat);
      });
  
      $(".seat").click(function () {
        if ($(this).hasClass("booked")) return;
        $(this).toggleClass("selected");
        $("#reserve-btn").prop("disabled", !$(".seat.selected").length);
      });
    };
  
    $("#reserve-btn").click(function () {
      const date = $("#date").val();
      const time = $("#sessions-list li.selected").data("time");
      const bookings = loadBookings();
      $(".seat.selected").each(function () {
        const index = $(this).data("index");
        bookings[date][time][index] = true;
      });
      saveBookings(bookings);
      renderSeats(date, time);
      $(this).prop("disabled", true);
    });
  
    // Инициализация
    initLocalStorage();
    renderDates();
  
    $("#date").change(function () {
      renderSessions($(this).val());
    });
  
    $("#date").trigger("change");
  });
  