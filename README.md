# Caitlin Gregory Photography Website

Static photography site with a small optional Node server for the live Instagram footer feed.

## Run Locally

This site can be viewed as HTML files without configuration. In that mode the footer shows local preview images that link to the Instagram profile.

To run the live-feed-capable server:

```powershell
npm start
```

Open `http://127.0.0.1:3000`.

On Windows, you can also double-click `start-website.bat`. Leave that window open while previewing the site. If it says Node.js is missing, install the LTS version of Node.js and run it again.

## Instagram Footer Feed

`footer.js` requests `/api/instagram-feed`. `server.js` calls Instagram from the server, returns only the six newest media records needed by the footer, and caches them for 15 minutes. The access token is never included in client-side HTML or JavaScript.

Setup steps:

1. Use an Instagram professional account for Caitlin Gregory Photography.
2. Create a Meta developer app and configure Instagram API with Instagram Login.
3. Authorize the Instagram account and obtain a usable long-lived access token with permission to read the account media.
4. Copy `.env.example` to `.env` and replace `INSTAGRAM_ACCESS_TOKEN` with that token.
5. Run `npm start`.

The token file is ignored by Git and blocked from the built-in web server.

## Contact Forms

The contact and about forms submit to `/api/contact`. The browser sends the form to this site's Node server, and `server.js` forwards it to Formspree from the private `.env` value. This keeps the real Formspree endpoint out of the public HTML and prevents visitors from landing on a Formspree error page.

Setup steps:

1. Create a Formspree form and copy its endpoint, such as `https://formspree.io/f/abcxyz`.
2. Copy `.env.example` to `.env`.
3. Set `FORMSPREE_ENDPOINT` to the real endpoint.
4. Restart the Node server with `npm start`.

Until `FORMSPREE_ENDPOINT` is configured, the form will show an on-page configuration message instead of submitting.

## Hosting

Install Node.js 18 or newer on the server and run:

```powershell
npm start
```

For a public website, use a process manager or service to keep Node running and place a reverse proxy such as IIS, Nginx, or Apache in front of `127.0.0.1:3000` for the domain and HTTPS certificate.

Environment values:

```dotenv
INSTAGRAM_ACCESS_TOKEN=your_private_token_here
FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
CONTACT_FORM_SUBJECT=New Caitlin Gregory Photography inquiry
HOST=127.0.0.1
PORT=3000
INSTAGRAM_CACHE_MINUTES=15
```

Until the Instagram token is configured, the footer remains visible with fallback images and direct links to the Instagram profile.
