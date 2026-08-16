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

  function currentInviteUrl() {
    var url = new URL("index.html", window.location.href);
    url.search = "";
    url.hash = "";
    return url.href;
  }

  function canonicalName(name) {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function cleanCode(name) {
    var code = name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

    return code || "guest";
  }

  function escapeJs(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function existingCodeByName() {
    return Object.keys(guests).reduce(function (map, code) {
      var name = guests[code];
      var key = canonicalName(name);
      if (!map[key]) {
        map[key] = code;
      }
      return map;
    }, {});
  }

  function namesFromGuests() {
    return Object.keys(guests).map(function (code) {
      return guests[code];
    });
  }

  function uniqueNamesFromTextarea() {
    var seen = {};
    return namesInput.value
      .split(/\r?\n/)
      .map(function (name) {
        return name.trim().replace(/\s+/g, " ");
      })
      .filter(function (name) {
        if (!name) {
          return false;
        }
        var key = canonicalName(name);
        if (seen[key]) {
          return false;
        }
        seen[key] = true;
        return true;
      });
  }

  function inviteLinkFor(code) {
    var url = new URL(baseUrlInput.value || currentInviteUrl());
    url.searchParams.set("guest", code);
    return url.href;
  }

  function buildRows(names) {
    var existing = existingCodeByName();
    var usedCodes = {};

    return names.map(function (name) {
      var baseCode = existing[canonicalName(name)] || cleanCode(name);
      var code = baseCode;
      var suffix = 2;

      while (usedCodes[code]) {
        code = baseCode + "-" + suffix;
        suffix += 1;
      }

      usedCodes[code] = true;

      return {
        name: name,
        code: code,
        link: inviteLinkFor(code),
        entry: '  "' + code + '": "' + escapeJs(name) + '"'
      };
    });
  }

  function guestsJsBlock(rows) {
    if (!rows.length) {
      return "window.WEDDING_GUESTS = {};";
    }

    return (
      "window.WEDDING_GUESTS = {\n" +
      rows
        .map(function (row, index) {
          return row.entry + (index === rows.length - 1 ? "" : ",");
        })
        .join("\n") +
      "\n};"
    );
  }

  function renderRows(rows) {
    generatedRows = rows;
    entriesOutput.textContent = guestsJsBlock(rows);
    linksBody.innerHTML = "";

    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td></td><td><code></code></td><td><a target=\"_blank\" rel=\"noopener\"></a></td><td></td>";

      tr.children[0].textContent = row.name;
      tr.children[1].querySelector("code").textContent = row.code;
      var link = tr.children[2].querySelector("a");
      link.href = row.link;
      link.textContent = row.link;

      var copyButton = document.createElement("button");
      copyButton.className = "small-button";
      copyButton.type = "button";
      copyButton.textContent = "Copy";
      copyButton.addEventListener("click", function () {
        copyText(row.link, "Copied link for " + row.name);
      });

      tr.children[3].appendChild(copyButton);
      linksBody.appendChild(tr);
    });
  }

  function copyText(text, message) {
    var done = function () {
      if (status) {
        status.textContent = message || "Copied";
        window.setTimeout(function () {
          status.textContent = "";
        }, 2200);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
      return;
    }

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

  function regenerate() {
    renderRows(buildRows(uniqueNamesFromTextarea()));
  }

  function loadGuestNamesIntoTextarea() {
    var names = namesFromGuests();
    namesInput.value = names.length ? names.join("\n") : "Gideon Kalanzi";
    regenerate();
  }

  baseUrlInput.value = currentInviteUrl();
  loadGuestNamesIntoTextarea();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    regenerate();
  });

  document.getElementById("reload-guests").addEventListener("click", loadGuestNamesIntoTextarea);

  document.getElementById("copy-all-links").addEventListener("click", function () {
    var text = generatedRows
      .map(function (row) {
        return row.name + ": " + row.link;
      })
      .join("\n");
    copyText(text, "Copied all links");
  });

  document.addEventListener("click", function (event) {
    var targetId = event.target.getAttribute("data-copy-target");
    if (!targetId) {
      return;
    }
    var target = document.getElementById(targetId);
    if (target) {
      copyText(target.textContent, "Copied guests.js block");
    }
  });
})();
