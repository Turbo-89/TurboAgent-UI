# Intelligence UI

## Purpose

The `/intelligence` page shows read-only intelligence job definitions from the backend and lets a user run manual dry-runs. It is for reviewing proposed AI, SEO, local SEO, structured data, ads, and content strategy intelligence only.

## Backend

The page uses `NEXT_PUBLIC_BACKEND_BASE_URL` through `lib/backend.ts`.

Endpoints used:

- `GET /api/intelligence/jobs`
- `POST /api/intelligence/jobs/{job_id}/dry-run`

## Safety

The UI does not include approval, deploy, publish, merge, write, schedule, or ads-change controls. Dry-run results are displayed as proposals and keep `approval_required` visible.

The chat page and workspace tree behavior are not changed.

## Validation

Run:

```powershell
npm run build
```

Manual check:

- `/intelligence` loads the job list.
- `weekly_ai_seo_watch` dry-run displays a report.
- `monthly_rookdetectie_geuropsporing_watch` dry-run displays a report.
- No approve, deploy, write, publish, merge, scheduling, or ads-change button exists.
