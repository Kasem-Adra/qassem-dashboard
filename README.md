# Qassem.net — Clean Code Structure

This version reorganizes the website into a cleaner structure.

## Files

- `index.html` — public website markup only.
- `dashboard.html` — dashboard markup only.
- `assets/css/site.css` — public website styles.
- `assets/css/dashboard.css` — dashboard styles.
- `assets/js/site.js` — public website logic.
- `assets/js/dashboard.js` — dashboard logic.
- `assets/default-content.js` — optional default content source if used by deployment.

## API flow

- Public website reads content from:
  `/api/content`

- Dashboard login:
  `/api/admin/login`

- Dashboard saves content to:
  `/api/admin/content`

## Identity

- Public brand: `Qassem.net`
- Official name: `Kasem Adra`

## Notes

This structure is easier to maintain than keeping CSS and JavaScript inside HTML files.
