# Style rules for all TurboDial documents (standing rules from Miguel)

These apply to every plan, SOP and guide in this folder, now and in the future.

1. **Plain words, no jargon.** Write for non-technical staff. Say what people see and click. If a technical word can't be avoided, explain it in a few words.
2. **Short.** Don't be wordy. Use numbered steps, short sentences and tables.
3. **Corporate, professional design** for PDFs:
   - a cover page and a contents page;
   - navy headings, with a small label above each heading (for example "SOP 3");
   - numbered steps in circles;
   - shaded boxes for tips and warnings;
   - each SOP starts on a new page.

   Build every PDF with `build_sops.sh`, which uses `sop_template.html` and `sop_style.css`.
4. **Timeless content in SOPs.**
   - No "to check" markers.
   - No "Assumed or still to check" section.
   - No "found today" notes, and no counts or statuses that go out of date.

   Write each step as the way to do it. Open questions go to TurboDial support or into the game plan, never into an SOP.
5. **SOPs are split by role:**
   - `TD2_SOP_Admins`: Owner, Admin and Supervisor tasks, plus everything an agent does;
   - `TD2_SOP_Agents`: daily calling, texting and the Chrome extension only.

   The Chrome extension is always **SOP 2**.
6. **Privacy.** Never include contacts' or leads' phone numbers, emails or names, or any API key or password. Club Wealth's own business numbers and staff names are fine.
7. **Always keep:**
   - the "Do not set up" box (PlusThis numbers, system numbers, wrong-number lines);
   - the "Never click Release Number" warning;
   - "Keep Local Presence off".
8. **Game plans:**
   - written in **ASD-STE100 Simplified Technical English**:
     - one instruction per sentence;
     - active voice;
     - steps in the imperative, 20 words or fewer;
     - descriptions 25 words or fewer;
     - a condition comes before its instruction;
     - "Warning:" and "Note:" boxes.
   - A plan holds only the plan:
     - fixed dates and steps;
     - owners;
     - go/no-go criteria;
     - tests;
     - undo steps;
     - communication;
     - close criteria.
   - No "to decide" items and no questions for vendors.
9. **The phone number list is always its own PDF** (`TD2_Phone_Number_List`, landscape), separate from the plan.
