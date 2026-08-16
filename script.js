(function () {
  "use strict";

  var eventDetails = {
    title: "Golden Jubilee Wedding Celebration - Molly and Paul M. Wasswa",
    start: new Date("2026-09-04T11:00:00+03:00"),
    end: new Date("2026-09-04T18:30:00+03:00"),
    location: "Victory Doxa Passover Festival Grounds, opposite Electoral Commission, Lubowa, Kigo Rd, Kampala",
    description: "Golden Jubilee wedding anniversary celebration for Molly and Paul M. Wasswa."
  };

  var guests = window.WEDDING_GUESTS || {};
  var params = new URLSearchParams(window.location.search);
  var guestCode = (params.get("guest") || "").trim().toLowerCase();

  function guestRecord(value) {
    if (typeof value === "string") return { name: value, table: "", partySize: "" };
    if (value && typeof value === "object") return { name: value.name || "Guest", table: value.table || "", partySize: value.partySize || "" };
    return { name: "Guest", table: "", partySize: "" };
  }

  var guest = guestRecord(guests[guestCode]);

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function setHref(id, value) {
    var node = document.getElementById(id);
    if (node) node.href = value;
  }

  function whatsappLink(name) {
    var message = "Hello, this is " + name + ". I am confirming attendance for Molly and Paul M. Wasswa's Golden Jubilee celebration on 4 September 2026.";
    return "https://wa.me/256793709243?text=" + encodeURIComponent(message);
  }

  function calendarStamp(date) { return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }

  function googleCalendarLink() {
    var link = new URL("https://calendar.google.com/calendar/render");
    link.searchParams.set("action", "TEMPLATE");
    link.searchParams.set("text", eventDetails.title);
    link.searchParams.set("dates", calendarStamp(eventDetails.start) + "/" + calendarStamp(eventDetails.end));
    link.searchParams.set("details", eventDetails.description);
    link.searchParams.set("location", eventDetails.location);
    return link.toString();
  }

  function escapeIcs(value) { return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }

  function downloadCalendarFile() {
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Molly Paul Golden Jubilee//Invitation//EN", "BEGIN:VEVENT",
      "UID:molly-paul-golden-jubilee-20260904@example.com", "DTSTAMP:" + calendarStamp(new Date()),
      "DTSTART:" + calendarStamp(eventDetails.start), "DTEND:" + calendarStamp(eventDetails.end),
      "SUMMARY:" + escapeIcs(eventDetails.title), "DESCRIPTION:" + escapeIcs(eventDetails.description),
      "LOCATION:" + escapeIcs(eventDetails.location), "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "molly-paul-golden-jubilee.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function updateCountdown() {
    var remaining = eventDetails.start.getTime() - Date.now();
    var countdown = document.getElementById("countdown");
    if (!countdown) return;
    if (remaining <= 0) { countdown.classList.add("is-complete"); remaining = 0; }
    var values = {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor((remaining % 86400000) / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000)
    };
    Object.keys(values).forEach(function (key) {
      var node = countdown.querySelector('[data-countdown="' + key + '"]');
      if (node) node.textContent = String(values[key]).padStart(key === "days" ? 1 : 2, "0");
    });
  }

  setText("guest-name", guest.name);
  setText("guest-name-card", guest.name);
  setText("guest-table", guest.table ? "Table " + guest.table : "To be assigned");
  setText("guest-party", guest.partySize ? "Reserved for " + guest.partySize + (guest.partySize === "1" ? " guest" : " guests") : "");

  var rsvp = whatsappLink(guest.name);
  setHref("hero-rsvp-link", rsvp);
  setHref("detail-rsvp-link", rsvp);
  setHref("google-calendar-link", googleCalendarLink());

  var calendarButton = document.getElementById("download-calendar");
  if (calendarButton) calendarButton.addEventListener("click", downloadCalendarFile);
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();
