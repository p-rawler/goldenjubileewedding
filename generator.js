(function () {
  "use strict";

  var guests = window.WEDDING_GUESTS || {};
  var form = document.getElementById("guest-form");
  var baseUrlInput = document.getElementById("base-url");
  var namesInput = document.getElementById("names-input");
  var entriesOutput = document.getElementById("entries-output");
  var linksBody = document.getElementById("links-body");
  var status = document.getElementById("copy-status");
  var generatedRows = [];

  function guestRecord(value) {
    return typeof value === "string" ? { name: value, table: "", partySize: "" } : {
      name: (value && value.name) || "", table: (value && value.table) || "", partySize: (value && value.partySize) || ""
    };
  }

  function currentInviteUrl() {
    var url = new URL("index.html", window.location.href);
    url.search = "";
    url.hash = "";
    return url.href;
  }

  function canonicalName(name) { return name.trim().replace(/\s+/g, " ").toLowerCase(); }

  function cleanCode(name) {
    var code = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
    return code || "guest";
  }

  function escapeJs(value) { return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }

  function existingCodeByName() {
    return Object.keys(guests).reduce(function (map, code) {
      var record = guestRecord(guests[code]);
      if (record.name && !map[canonicalName(record.name)]) map[canonicalName(record.name)] = code;
      return map;
    }, {});
  }

  function recordsFromGuests() {
    return Object.keys(guests).map(function (code) {
      var record = guestRecord(guests[code]);
      return { name: record.name, table: record.table, partySize: record.partySize };
    });
  }

  function recordsFromTextarea() {
    var seen = {};
    return namesInput.value.split(/\r?\n/).map(function (line) {
      var parts = line.split("|").map(function (part) { return part.trim().replace(/\s+/g, " "); });
      return { name: parts[0] || "", table: parts[1] || "", partySize: parts[2] || "" };
    }).filter(function (record) {
      var key = canonicalName(record.name);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function inviteLinkFor(code) {
    var url = new URL(baseUrlInput.value || currentInviteUrl());
    url.searchParams.set("guest", code);
    return url.href;
  }

  function buildRows(records) {
    var existing = existingCodeByName();
    var usedCodes = {};
    return records.map(function (record) {
      var baseCode = existing[canonicalName(record.name)] || cleanCode(record.name);
      var code = baseCode;
      var suffix = 2;
      while (usedCodes[code]) { code = baseCode + "-" + suffix; suffix += 1; }
      usedCodes[code] = true;
      return { name: record.name, table: record.table, partySize: record.partySize, code: code, link: inviteLinkFor(code) };
    });
  }

  function guestsJsBlock(rows) {
    if (!rows.length) return "window.WEDDING_GUESTS = {};";
    return "window.WEDDING_GUESTS = {\n" + rows.map(function (row, index) {
      return '  "' + row.code + '": { name: "' + escapeJs(row.name) + '", table: "' + escapeJs(row.table) + '", partySize: "' + escapeJs(row.partySize) + '" }' + (index === rows.length - 1 ? "" : ",");
    }).join("\n") + "\n};";
  }

  function renderRows(rows) {
    generatedRows = rows;
    entriesOutput.textContent = guestsJsBlock(rows);
    linksBody.innerHTML = "";
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td></td><td></td><td></td><td><code></code></td><td><a target=\"_blank\" rel=\"noopener\"></a></td><td></td>";
      tr.children[0].textContent = row.name;
      tr.children[1].textContent = row.table || "—";
      tr.children[2].textContent = row.partySize || "—";
      tr.children[3].querySelector("code").textContent = row.code;
      var link = tr.children[4].querySelector("a");
      link.href = row.link;
      link.textContent = row.link;
      var copyButton = document.createElement("button");
      copyButton.className = "small-button";
      copyButton.type = "button";
      copyButton.textContent = "Copy";
      copyButton.addEventListener("click", function () { copyText(row.link, "Copied link for " + row.name); });
      tr.children[5].appendChild(copyButton);
      linksBody.appendChild(tr);
    });
  }

  function copyText(text, message) {
    function done() {
      if (!status) return;
      status.textContent = message || "Copied";
      window.setTimeout(function () { status.textContent = ""; }, 2200);
    }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done); return; }
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    done();
  }

  function regenerate() { renderRows(buildRows(recordsFromTextarea())); }

  function loadGuests() {
    var rows = recordsFromGuests();
    namesInput.value = rows.length ? rows.map(function (row) { return row.name + " | " + row.table + " | " + row.partySize; }).join("\n") : "Gideon Kalanzi |  | ";
    regenerate();
  }

  baseUrlInput.value = currentInviteUrl();
  loadGuests();
  form.addEventListener("submit", function (event) { event.preventDefault(); regenerate(); });
  document.getElementById("reload-guests").addEventListener("click", loadGuests);
  document.getElementById("copy-all-links").addEventListener("click", function () {
    copyText(generatedRows.map(function (row) { return row.name + ": " + row.link; }).join("\n"), "Copied all links");
  });
  document.addEventListener("click", function (event) {
    var targetId = event.target.getAttribute("data-copy-target");
    var target = targetId && document.getElementById(targetId);
    if (target) copyText(target.textContent, "Copied guests.js records");
  });
})();
