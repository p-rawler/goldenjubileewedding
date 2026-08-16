# Molly & Paul M. Wasswa - Golden Jubilee Invitation

A polished, responsive, static website for the 50th Golden Jubilee celebration on Friday, 4 September 2026. It uses the supplied invitation card as its visual reference and source asset.

## Run locally

No build is required. Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080/index.html`. A personalized test link is `http://localhost:8080/index.html?guest=gideon-kalanzi`.

## Add and edit guests

Guests live in `guests.js`. Each guest has a display name, an optional table number, and an optional party size:

```js
window.WEDDING_GUESTS = {
  "gideon-kalanzi": { name: "Gideon Kalanzi", table: "12", partySize: "2" },
  "jane-namuli": { name: "Jane Namuli", table: "8", partySize: "1" }
};
```

- `name` is shown in the personal greeting and WhatsApp RSVP message.
- `table` is shown as the guest's reserved table. Leave it empty to show “To be assigned”.
- `partySize` is shown as the number of seats reserved. Leave it empty to hide this line.

For backwards compatibility, a simple name such as `"jane-namuli": "Jane Namuli"` also works, but it cannot hold the table or party size.

If `?guest=` is missing or unknown, the invitation uses “Guest” and hides table-specific details.

## Generate guest links

Open `generator.html` after editing `guests.js`.

The generator loads existing guest records and creates clean codes, individual invitation URLs, and a complete copy-ready replacement block for `guests.js`. You may also type one guest per line using this format:

```text
Name | Table number | Party size
Gideon Kalanzi | 12 | 2
Jane Namuli | 8 | 1
```

The table number and party size are optional. Use the copy buttons for individual links, every link, or the complete guest-record block.

## RSVP and calendar

The RSVP buttons open WhatsApp for `+256 793 709243` and include the personalized guest name. The invitation offers both a downloadable `.ics` calendar file and a Google Calendar link.

## Static hosting

Upload the project files to any static host. Keep these together:

```text
index.html
generator.html
styles.css
script.js
generator.js
guests.js
CardPhoto.pdf
assets/
```

## GitHub Pages

1. Create a GitHub repository and upload this project.
2. In the repository, choose **Settings → Pages**.
3. Set the deployment source to your main branch and the root (`/`) folder.
4. Save and wait for the Pages URL.

Personal invitations will use URLs like:

```text
https://your-username.github.io/your-repository/index.html?guest=gideon-kalanzi
```

## Privacy note

This is a static site. Anyone who can access the hosted files can read the guest data in `guests.js`, including names, table numbers, and party sizes. Do not store phone numbers, private notes, home addresses, or sensitive information there.
