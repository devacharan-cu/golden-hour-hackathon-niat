# Demo walkthrough

One phone and three laptops run a full emergency: the **phone** is the reporter, **laptop 1** the dispatcher, **laptop 2** the crew, **laptop 3** the hospital. Every role is a separate signed-in session and nothing is shortcut. About 8 to 10 minutes, internet needed on all devices.

Use synthetic patient details only. In a real emergency in India, call 112.

## Setup

Create the staff accounts with `node web/scripts/provision.mjs --prod` (or `--emulator` for a local demo) and sign in on each laptop:

| Device | Role | Account |
|---|---|---|
| Phone | Reporter | none (guest) |
| Laptop 1 | Dispatcher | `dispatcher1@goldenhour.demo` |
| Laptop 2 | Crew, Medic 1 and Medic 2 (second window) | `crew1@…`, `crew2@…` |
| Laptop 3 | Hospital that accepts / declines (second window) | `wenlock@…`, `yenepoya@…` |

Keep the dispatcher window open throughout: it runs the hospital pre-alert, deadlines and re-routing. On the phone, allow camera, microphone and location.

## Script

1. **Phone, report:** *Snakebite*, *Critical*, 1 patient; location by GPS or a demo place; a description; a photo (live camera), a voice note, a video or a file. Review, then **Send to dispatch**. The tracking page shows the Relay Track, a receipt code, and each file moving to *Uploaded and confirmed*.
2. **Dispatcher, review:** the case appears instantly, marked *Your move*. Load the files (each shows *Checksum verified*). Run **Analyse report**, edit the AI draft, then **Review done**.
3. **Dispatcher, assign:** offer to Medic 1. **Crew** declines with a reason; offer to Medic 2.
4. **Crew, accept and drive:** accept, then share live GPS or run the simulated drive. The marker moves on every screen.
5. **Hospitals, pre-alert:** the case appears with a countdown. Confirm antivenom in stock and ability to receive, then accept. The second hospital declines, optionally suggesting another, and loses access to the case immediately.
6. **Dispatcher, destination:** approve the recommended hospital, or override with a written reason. The crew must acknowledge it; the hospital now sees the reporter's phone number.
7. **Crew, transport:** at the scene, acknowledge the destination, pick up the patient, arrive at the hospital.
8. **Hospital, handover:** **Confirm we received the patient.** Closing is locked until then.
9. **Dispatcher, close:** the ambulance is freed and the phone shows the case as completed.
10. **History and receipt:** search the case in History; reopen it on another device with the receipt code; create an account and see the report under *Your reports*.

## Also worth showing

- **False or accidental report:** the reporter withdraws before a crew is offered, or dispatch ends the case with a reason. It stays in History.
- **Offline:** send a report in airplane mode; it saves on the device and uploads itself when the network returns.
- **Escalation:** let every hospital decline, or wait 90 seconds; the next hospitals are asked automatically.
- **Dark mode:** the sun/moon button.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Cannot sign in | Check the email and password. *Account menu, Leave and erase this device* resets a shared browser |
| Nothing reaches hospitals | A signed-in dispatcher window must be open |
| Camera does not open | Allow the camera for the site, or use *Use my phone's camera app* |
| GPS does nothing | Allow location, or use the simulated drive |
| "The AI is not available" | The free tier was busy; press **Run the AI again** or continue from the original report |
