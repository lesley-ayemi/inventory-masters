# Inventory Masters

Website for Inventory Masters: inventory management, ERP optimisation and Lean operational excellence services. Built with Node.js, Express and EJS.

## Run it

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # restarts on file changes
```

Set `PORT` to use a different port.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content.js` | All site copy (services, pillars, roadmap, contact details). Edit text here. |
| `views/index.ejs` | The home page layout |
| `views/partials/` | Header, footer and icons |
| `public/css/styles.css` | Styles |
| `public/js/main.js` | Mobile menu, scroll animations, contact form |
| `server.js` | Express server and the `/api/contact` endpoint |

## Contact form

Enquiries are validated on the server and saved to `data/enquiries.json` (ignored by git). To get them by email instead, change `saveEnquiry` in `server.js` to send through a mail service.
