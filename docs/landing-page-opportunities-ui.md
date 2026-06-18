# Landing Page Opportunities UI

`/opportunities` is a read-only page for reviewing Turbo Services landing page opportunities from the backend opportunity planner.

## Backend

The page uses `NEXT_PUBLIC_BACKEND_BASE_URL` through `lib/backend.ts`.

Required backend endpoints:

- `GET /api/opportunities/status`
- `POST /api/opportunities/landing-pages`

## Behavior

- Shows Google Ads and GA4 provider readiness.
- Runs dry-run opportunity scans.
- Supports optional `service`, `region`, `max_opportunities`, and `read_live`.
- Includes a sample JSON mode for validating `rioolgeur Antwerpen` / `rookdetectie_geuropsporing` without live credentials.
- Displays returned signals and scored opportunities in the order returned by the backend.

The UI does not send approval, write, deploy, publish, merge, push-to-live, change-ads, scheduling, or GitHub actions.

## Validation

- `npm run build`
- Open `/opportunities`.
- Confirm provider status loads.
- Run an empty scan.
- Load the rioolgeur sample and run a scan.
- Confirm rookdetectie resolves as `rookdetectie_geuropsporing`.
