# Security

GoldenHour is a demonstration, not validated for real emergency dispatch.

## Trust boundary

There is no backend. **Firestore Security Rules (`firestore.rules`) are the only trusted enforcement point**; everything in the browser is untrusted. Guarantees live in the rules and are covered by rules tests.

## Roles

| Role | Source | Who can create it |
|---|---|---|
| dispatcher, hospital, ambulance | `users/{uid}` with `role`, `active`, `hospitalId` or `ambulanceId` | Only `web/scripts/provision.mjs`, run by a project owner |
| reporter | none: any signed-in user, including guests | Anyone |

No client can write `users/{uid}`, so no one can grant themselves a role. Set `active: false` to disable a staff account. Email or Google sign-ups get reporter powers only.

## What the rules enforce

- **Least access:** dispatch sees all cases; a crew only its assigned case; a hospital only while active on a case; a reporter only their own case or one proven by receipt.
- **Receipts, not IDs:** a receipt is `<caseId>.<secret>`; only the SHA-256 of the secret is stored. Guessing is infeasible.
- **Data minimisation:** asked hospitals see a non-identifying brief; the phone number goes to dispatch, the crew, the reporter and, after destination approval, that one hospital.
- **Evidence:** readable only by those who can read the case; allow-listed types, size caps and immutable chunks; hospitals lose access on decline.
- **Workflow integrity:** a destination needs an accepted, fully confirmed offer; transport needs a destination and the crew's acknowledgement; closing needs the hospital's receipt confirmation; deadlines use the server clock.
- **One ambulance, one case:** two dispatchers cannot double-book a unit.
- **AI documents:** written only by dispatch, labelled AI-generated; the shared handoff needs a named reviewer.
- **Ending a case:** only with a written reason, only before the patient is on board, and nothing is deleted.
- **Audit trail:** events are append-only and attributed to the signed-in role.

Verify: `npm run test:emu` and `node web/scripts/mutate-rules.mjs` (each deliberately weakened rule set must fail the tests).

## AI

Gemini runs through Firebase AI Logic; the API key is held by Firebase, never in the frontend or repo. App Check protects the endpoint. Report text and files are sent to Google for analysis, so use synthetic data only. Diagnosis, treatment advice, resource claims and dispatch recommendations are stripped and flagged.

## Limitations

1. Escalation runs in an open dispatcher console; with none open nothing advances. A real system needs a server-side scheduler.
2. Dispatchers are trusted by the rules; the audit trail records but cannot prevent misuse.
3. Hospital confirmations are self-reported.
4. Evidence lives in Firestore and inherits its free-plan quotas.
5. Anyone can start a guest session and file spam reports; App Check is not enforced on Firestore.
6. Sign out on shared computers; offline caches and queued uploads are erased on sign-out.
7. Demo hospital capabilities are invented. No penetration test, privacy assessment or clinical review has been done.
