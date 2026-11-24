# TurboDial 2 move: game plan, week of Nov 23, 2026

**Status:** DRAFT v1, 11/24. Built from the 11/17 backup file and the 11/17 email to TurboDial support. TurboDial's answers and Miguel's decisions are not in yet, so every day below is **proposed**.
**Who does the work:** Miguel and the team make every change. This plan only says what to do.
**Per-number checklist:** `turbodial/TD2_setup_checklist_by_batch.md`, also as `.csv` to paste into a sheet.

---

## 1. Before any batch: 4 gates

Don't move a number until all 4 are true.

| # | Gate | Why | Who |
|---|---|---|---|
| G1 | **Caller ID fixed.** A test call and a test text from TD2 show the user's **own** number, not (253) 215-8426 ("Becky" / AIM Team, a PlusThis number). | On 11/17, Camille's calls and her text went out as 215-8426. Without this fix, every RM would call out as "Becky". | TurboDial support says how. Miguel sets it. |
| G2 | **The route is ready before the number moves.** The number's Inbound Call Route exists in Call Route Builder **before** the number is switched. | On 11/17, a number with no route went straight to voicemail and nobody's phone rang. | Miguel |
| G3 | **Texting works.** Voice and SMS are both ON for the number, and the "(calls only)" label is gone. | Most numbers show "(calls only)". We don't yet know what turns SMS on. | TurboDial support, then Miguel |
| G4 | **The owner has a TD2 login,** with a Calling Device and a Caller ID set to their own number. | The Owner and Forward SMS To fields need a real TD2 user. | Miguel |

**If G1 isn't answered by TurboDial yet:** move only the pilot (B1). Each pilot user picks their own number in "Sending From" / Caller ID on every call and text, and checks it.

---

## 2. Order of work, by day (proposed: Miguel to confirm)

Thanksgiving is Thu 11/26. **Don't move anything Thu–Sun.** Nobody would be watching for missed calls.

| Day | Batch | Numbers | What | Done when |
|---|---|---|---|---|
| **Tue 11/24** | **Prep** | none | Get TurboDial's answers (section 7). Create or confirm TD2 users for the 4 RMs and Events/Client Care. Make the Section 6 decisions. | Gates G1–G4 answered |
| Tue 11/24 | **B0** Fix the 4 already on TD2 | 4 | Type the Name. Check each route. Decide whether Andrea's and Liz's numbers stay under "Events Team" or move to their own users. Re-test Camille's 215-8230 (this was the caller ID bug). | All 4 pass the tests in section 3 |
| Tue PM / Wed AM | **B1 Pilot** | 2 | Beula (253) 201-8421 (low use) and Camille (253) 215-8864 (low use). | All tests pass. Wait 2 hours, and check that no call or text went to TD1 instead |
| **Wed 11/25 AM** | **B2a** RMs: Francis + Beula | 17 | One person at a time. Test after each person, not at the end. | Tests pass for each person |
| Wed 11/25 midday | **B2b** RMs: Ebi + Marcia | 19 | Same. | Same |
| Wed 11/25 PM | **B3a** Events / Client Care / admin seats | 5 | Liz 312-1677, Am 242-6028 (redo the "Larch VM" greeting first), Jizel 201-6860, admin4 204-3895 and 343-5064. | Same |
| **Mon 11/30 AM** | **B3b** Office / Client Care main line (206) 460-1572 | 1 | Alone, and early morning. This is the busiest shared line: it rings 6 seats, records calls and has voicemail. Re-record the "Office VM" greeting in TD2 first. | Ring group, voicemail and recording all tested |
| Mon 11/30 | **B4** Other users: Andrew, Joe, Vanessa, Regine, Becky | 25 | One person at a time. | Same |
| Tue 12/1 | **B5** In use, no owner | 6 | Only after Miguel names an owner for each. Note: (253) 353-7544 sent 1000+ texts in 30 days. | Same |
| Tue 12/1 onward | **B6** Unused 30 days | 42 | Only the ones whose owner says "still needed". The rest stay on TD1 for now. | Same |
| When decided | **HOLD** | 17 | Former staff: Anastasia 9, Dolly 1, Nyza 1. No owner, no label: 4. Parked wrong-number lines: 2. | Decision recorded |

**Total TD1 numbers to set up:** 4 already on TD2, plus 128 to move (79 "Move" and 49 "unused"), plus up to 6 "Review" numbers if approved.

**Rule for every batch:** one person at a time, at most 10 numbers in a row, then test. If any test fails, stop the batch (see section 4).

### DO NOT SET UP, ever, in this project

- **30 PlusThis numbers and 3 system numbers.** They are routed by the PlusThis and ListingAppointments Twilio apps. Don't add them to TD2 and don't change them in Twilio.
  - This includes (253) 215-8426 "AIM Team" (the wrong caller ID number), (253) 201-1402 "Client Care", (727) 287-5993, (253) 447-5788 and (253) 793-1397.
- **The 2 parked wrong-number lines**, (253) 201-3281 and (253) 205-0538 (Ebi's). Don't set them up unless Omerson says so.
- **Don't change the Twilio apps or messaging services** used by PlusThis, ListingAppointments or CWU. Don't release any Twilio number.
- Twilio marks these numbers "DO NOT MODIFY-MANAGED BY TURBODIAL ONLY". Changes happen in TurboDial, not in the Twilio console, except in the last-resort rollback in section 4.

---

## 3. Per-number steps and tests

### Steps

Exact clicks are **to check** on the real screen. The SOPs will confirm them.

1. **Call Route Builder:** build the route.
   - Ring the Owner (or the ring group listed for the number).
   - If no answer, do what the checklist says:
     - "Forward after 2 rings → (206) 300-1000" means a forward step to the office cell;
     - "nothing" means it rings, then ends. Ask Miguel whether TD2 should add voicemail here.
2. **Phone Numbers > Add Phone Number:** add the number. (To check: does this switch the Twilio number to TD2 at once?)
3. Type the values from the checklist row:
   - **Name**, exactly as shown, including any stars or tags;
   - **Owner** and **Forward SMS To**;
   - **Inbound Call Route**;
   - **Public for Caller ID**;
   - **Voice ON / SMS ON**;
   - **Record inbound calls**.
4. Tick R, A and F in the checklist.

### Tests the team runs after each person

Use a team test phone, not a contact.

| Test | How | Pass |
|---|---|---|
| **In** | Call the number from the test phone. | The right person's TD2 rings. |
| No answer | Call again and don't pick up. | It goes to the no-answer step (the office cell forward, or voicemail). |
| **Out** | The owner calls the test phone from the TD2 Dialer. | The test phone shows the **owner's number**, not 215-8426 or another number. |
| **TxO** | The owner texts the test phone from TD2 Contact Messages. | "Sending From" is the owner's number, and the test phone shows it. |
| **TxI** | Reply to that text from the test phone. | The reply appears in TD2 for the owner. **Also check it did NOT land only in TD1** (see the texting risk below). |

Write the date and initials in "Done in TD2" when all 5 pass.

### ⚠ Texting risk: please read

In Twilio, **161 numbers share one messaging service, "TurboDial Numbers"**. That includes Camille's number, which is already on TD2. Incoming texts may follow that service's setting, not the number's TD2 setting. So a moved number could still deliver incoming texts to TD1, or vice versa.

The TxI test catches this. If it fails, **don't touch the messaging service**. Ask TurboDial support (question Q4).

---

## 4. Rollback: if a batch breaks

Go in order. Stop at the first step that works.

1. **Fastest safety net, inside TD2 (seconds).** Change that number's Inbound Call Route to forward straight to the office cell (206) 300-1000. Calls get answered while you fix things.
2. **Point the number back to TD1.** (To check with TurboDial.) In TD1, open the number's settings (screens 1–3) and save them again with the values in the Numbers tab: Assigned User, Ring list, After no answer.
   - TD1 already flags a moved number as "Number Incorrectly Configured in Twilio", so TD1 may offer to fix it.
   - Ask TurboDial support whether removing the number from TD2 hands it back to TD1 automatically.
3. **Last resort, only with TurboDial support on the line.** In the Twilio console, for that one number only, set Voice back from the "default-inbound" app to the TD1 webhook.
   - The exact TD1 URLs are in the `raw/` folder next to the backup. Miguel, please share that folder.
   - Never touch PlusThis, ListingAppointments or CWU numbers or apps.
4. Write down what broke, which number and the time. Pause the remaining batches until it's understood.

**TD1 stays on throughout.** Don't delete users, numbers, voicemails, recordings or greetings in TD1.

---

## 5. Recordings: what to redo in TD2

- **TD1 has 364 recordings.**
  - 297 belong to logins that have left or aren't in this move. They stay in TD1 as records.
  - 57 belong to current staff.
- Audio isn't downloaded and TD2 Voice Drops is empty, so **people re-record their own in TD2**. That's simpler and gives fresh audio.

**Must redo before the number moves (greetings in use):**

| Greeting | Used on | Batch |
|---|---|---|
| "Larch VM" (10 s, admin2) | Am (253) 242-6028 | B3a |
| "Office VM" (24 s) | Office (206) 460-1572 | B3b |

**Voice drops: likely redo.** Each person confirms their own. Event-specific drops for dates already past can be skipped.

| Person | Recordings to consider |
|---|---|
| Francis | "FXN – Generic VM", "AI Summit invite", current event invites and reminders (AZ, VA, Fairfax: 11/16–11/17), "Attended Event FU", "Non-Attendees FU" |
| Beula | "Beula EVERYDAY", "TX invite", "Saddle Brook" |
| Ebi | "EBI Personalized." (09/23/2026), "EBI CW personalized" |
| Marcia | "Marcia Everyday Updated" |
| Andrew / Joe / Vanessa | "ANDREW EVERYDAY" / "Joe Every Day" / "VANESSA EVERYDAY", "Generic VM", "UNIONDALE NY", "WHITE PLAINS, NY" |
| Regine | "Regine" (12/2025). Ask if still used. |

Skip the untitled, date-only clips like "09.29.26 (5s)". They look like tests or old greetings.

**Keeping TD1 records viewable:**

- Don't cancel TD1 until TurboDial says how long voicemails, recordings and history stay viewable, and whether they can be exported (Q6).
- The recordings have Twilio Recording SIDs, so the audio likely also lives in our Twilio account (to check). Nobody should delete Twilio recordings.

---

## 6. Decisions for Miguel

1. **Target days.** Confirm or change section 2.
2. **Pilot numbers.** Beula 201-8421 and Camille 215-8864, or others?
3. **Andrea's and Liz's numbers, and 201-0542.** Keep them on the "Events Team" user, or give each their own TD2 user?
4. **"Am" and "Jizel".** Own TD2 logins, or keep the shared admin2 / admin3 seats?
5. **Former staff numbers.** Anastasia ("Tasia", 9 numbers, 2 still in use: 201-1390 and 201-1567), Dolly (1), Nyza (201-1375, in use). For each: move to someone else, keep on TD1, or leave for Omerson to decide.
6. **6 in-use numbers with no owner** (B5): who owns each? (253) 353-7544 sends 1000+ texts a month.
7. **42 unused numbers** (B6): ask each owner, or skip them all for now?
8. **"Nothing on no answer".** Many numbers just ring and then end. Add TD2 voicemail, or keep them as they are?
9. **"Text Only" numbers** (Francis 201-1203, Marcia 215-8581): voice off, or on?
10. **Account Default caller ID.** Pick it once TurboDial explains it. It must **not** be a PlusThis number. A neutral main line, such as the Office (206) 460-1572, is one option.

---

## 7. Open questions for TurboDial support

The 11/17 email was sent. Their reply isn't in this file. Miguel, please paste it in.

- **Q1. Caller ID.**
  - How do we make each user call and text from their own number by default?
  - What should the account Default caller ID be?
  - Can we stop users from using numbers that aren't theirs?
  - Can we hide the 32 PlusThis-app numbers?
- **Q2. Moving a number.** Does "Add Phone Number" switch the number in Twilio at once? Can we build the route first so there's no gap?
- **Q3. No route.** Is there a default route, or a warning, for a number with no Inbound Call Route?
- **Q4. Texting.**
  - What turns SMS on (the "(calls only)" label)?
  - Do the 161 numbers in the "TurboDial Numbers" messaging service send incoming texts to TD1 or to TD2?
  - Does a moved number need any change there? (They should make that change, not us.)
- **Q5. Rollback.** What's the supported way to hand a number back to TD1?
- **Q6. TD1 records.**
  - How long do voicemails (~6,447), recordings (364), greetings and call history stay viewable?
  - Can we export them?
- **Q7. Voice drops.** Is there any upload path for audio files into TD2 Voice Drops?

---

## 8. Who does what

| Who | Does |
|---|---|
| **Miguel** | Makes the decisions in section 6. Creates TD2 users. Builds routes and types each number's settings from the checklist. Runs the rollback if needed. |
| **Team (Camille and the Events / Client Care staff)** | Runs the test calls and texts after each person. Ticks the checklist. Re-records the Office and Larch greetings. |
| **RMs (Francis, Beula, Ebi, Marcia)** | Confirm their number list. Re-record their own voice drops. Check that caller ID shows their own number on their first calls. |
| **Omerson** | Decides on the parked lines and the former-staff numbers. |
| **TurboDial support / Ahyr** | Answers Q1–Q7. Is on hand for the B1 pilot and for any Twilio-side rollback. |

---

## What this plan is based on

**Checked in the files:**

- Counts per category, per person and per batch, taken from the TD2 Setup and Numbers tabs.
- PlusThis and system numbers, and which Twilio app each is on.
- The "TurboDial Numbers" messaging service holds 161 numbers.
- The 2 greetings in use, and the 57 recordings that belong to current staff.

**Assumed, to check:**

- All TD2 click paths.
- What "Add Phone Number" does in Twilio.
- How rollback works.
- How texting is routed.
- That recording audio is kept in Twilio.

**Not seen:** TurboDial support's reply, the current TD2 user list and the `raw/` folder.
