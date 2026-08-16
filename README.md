# Golden Jubilee Wedding Invitation

Static wedding invitation website for Molly and Paul M. Wasswa's Golden Jubilee celebration.

## Run Locally

This site has no build step. You can open `index.html` directly in a browser.

For a local web server, run this from the project folder:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/index.html
```

## Add Guests

Guest personalization is stored in `guests.js`.

```js
window.WEDDING_GUESTS = {
  "gideon-kalanzi": "Gideon Kalanzi",
  "jane-namuli": "Jane Namuli"
};
```

Each key is the guest code used in the URL. Each value is the name shown on the invitation.

Example personalized link:

```text
index.html?guest=gideon-kalanzi
```

If a guest code is missing, the invitation falls back to `Guest`.

## Generate Links

Open `generator.html`.

The generator loads the names already in `guests.js`, creates clean guest codes, and shows:

- Personalized invite links
- A complete copy-ready `guests.js` block
- Copy buttons for individual links, all links, and guest entries

You can also paste or type names into the generator, one guest per line, then click `Generate Links`.

## RSVP

The RSVP buttons open WhatsApp for:

```text
+256 793 709243
```

When a personalized guest link is used, the WhatsApp message includes that guest's display name.

## Static Hosting

Upload these files and folders to any static host:

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

No server-side code is required.

## GitHub Pages

1. Create a GitHub repository.
2. Commit and push the site files.
3. In GitHub, open `Settings` > `Pages`.
4. Set the source to your main branch and root folder.
5. Save, then use the Pages URL GitHub provides.

Personalized links will look like:

```text
https://your-username.github.io/your-repo/index.html?guest=gideon-kalanzi
```

## Privacy Note

This is a static website. Every name in `guests.js` is visible to anyone who can access the hosted site files. Do not put private notes, phone numbers, addresses, or sensitive guest details in `guests.js`.
