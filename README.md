# GoldenHour

Real-time emergency coordination for the first critical hour. A reporter describes an emergency with photos, a voice note, video or documents. A dispatcher assigns a crew. While the crew drives to the scene, the nearest hospitals that can treat the patient confirm their resources for that case. Dispatch approves a destination, the crew acknowledges it, and the hospital confirms receipt before the case can close.

**Live demo:** https://goldenhour-46131.web.app · **Demo walkthrough:** [DEMO.md](DEMO.md) · **Security:** [SECURITY.md](SECURITY.md)

Demonstration system with invented hospital data. In a real emergency in India, call 112.

## Whose move is it?

Every case is a hand-off between four roles: reporter, dispatcher, crew, hospital. The **Relay Track** at the top of every screen shows who holds the case. Whoever must act sees **Your move**; everyone else sees who they are waiting on.

## Workflow

1. **Reporter** files the emergency: type, severity, location (GPS only when tapped), description, optional evidence.
2. **Dispatcher** reviews it, optionally runs the AI briefing, and offers the case to one ambulance.
3. **Crew** accepts or declines. A declined unit cannot be re-offered that case.
4. **En route:** live GPS (labelled *Live GPS*) or a demonstration drive (labelled *Simulated*).
5. **Hospital pre-alert:** the five nearest eligible hospitals are asked, with the permitted evidence and briefing.
6. **Each hospital** confirms every required resource for this patient (for a snakebite, antivenom in stock) and that it can receive, then accepts or declines. A decline removes its access to the case.
7. **Destination:** dispatch sees an explained recommendation and approves it, or overrides with a written reason.
8. **Crew** acknowledges the destination, picks up the patient and transports.
9. **Hospital** confirms it received the patient.
10. **Dispatch** closes the case, the ambulance is released, and the audit trail updates.

Declines, 90-second deadlines, withdrawals, simultaneous incidents and competing dispatchers are handled. An ambulance holds one case at a time, enforced by the database rules.

## Features

| Area | What it does |
|---|---|
| Reporter | 4-step flow with review; live camera, video, voice recorder, gallery and file pickers; withdraw an untouched report; live tracking; receipt code to reopen a report on any device |
| Dispatcher | Live queue, evidence viewer with checksum verification, AI briefing review, crew assignment, hospital responses, destination approval, close, duplicate warnings, escalation, searchable history |
| Crew | Incoming dispatch, accept or decline, navigation link, real or simulated drive, destination acknowledgement |
| Hospital | Request inbox with countdown, per-case confirmation form, briefing and evidence, arrival confirmation, capability profile, availability, diversion |
| Accounts | Guest reporting always works. Email or Google accounts upgrade a guest in place. Staff accounts are provisioned by an administrator |
| Ending a case | Dispatch can end a case as false, accidental, duplicate or cancelled, with a reason and audit event. Nothing is deleted |
| Everyone | Light, dark or system theme, text size, calm motion, alerts, installable offline PWA |

**Evidence storage.** Files are stored as binary chunks in Firestore under the same rules as the case, each with a SHA-256 checksum verified before display. Limits: photo 5 MB, PDF 8 MB, audio 10 MB, video 15 MB, 10 files per report.

**AI briefing (assistive only).** Gemini through Firebase AI Logic returns a transcript, summary, facts, missing information, uncertainties, conflicts and a handoff. It never diagnoses, advises treatment or picks a hospital; such sentences are removed and flagged. The draft is visible to dispatch only until a human reviews it, and it is always labelled AI-generated. The API key stays in Firebase, never in the browser or the repo.

## Architecture

React + TypeScript + Vite · Leaflet/OpenStreetMap · Firebase Auth · Cloud Firestore · Firebase Hosting · Firebase AI Logic. Free Spark plan.

```
firestore.rules           roles, privacy, validation, deadlines, transitions
web/src/lib/relay.ts      whose move is it
web/src/lib/matching.ts   eligibility, waves, ranking, escalation planner
web/src/lib/workflow.ts   every state change, shared by the app and the tests
web/src/lib/evidence.ts   chunked storage, validation, compression, checksums
web/src/lib/ai.ts         prompt, schema, parsing, guardrails
web/scripts/provision.mjs creates staff accounts and role documents
```

## Run it

```bash
cd web && npm install
npm run dev          # against the Firebase project (needs an account)
npm run check        # lint, types, unit tests, emulator tests, build
npm run test:e2e     # real Chrome, many sessions, local emulators
```

Local demo with no cloud (needs the Firebase CLI and Java):

```bash
firebase emulators:start --only auth,firestore --project demo-goldenhour
node web/scripts/provision.mjs --emulator      # every password is Demo-pass-123!
VITE_USE_EMULATORS=1 npm run dev --prefix web
```

Under emulators the AI panel uses a labelled fake model.

**Production setup:** enable Email/Password, Anonymous and Google sign-in; enable Firebase AI Logic with the Gemini Developer API; run `node web/scripts/provision.mjs --prod` to create staff accounts; then `firebase deploy --only firestore:rules,hosting`.

## Limitations

- Hospital pre-alert, deadlines and re-routing run in an open dispatcher console; with none open they pause.
- Evidence is limited by file size and Firebase free-plan quotas.
- Hospital capabilities and availability are invented. Not for real dispatch.
