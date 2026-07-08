# Prompt: Convert Master Docx to KDP-Ready Reflowable Ebook (v3)

Fully resolved — all formatting rules confirmed against actual table
structure in the current master file. Ready to use as-is.

---

## PROMPT

I have a master Word document (comptia-final.docx) for a CompTIA A+
study guide that I need converted into a KDP-ready reflowable ebook
docx. Please inspect the attached file first — verify actual styles,
table shapes, header/footer content, and run structure before writing
any code. Do not assume prior formatting patterns still apply; this
file may have changed since any earlier conversation.

### 1. Emoji Removal (strict rules)

Remove emoji from:

- Heading 1 paragraphs
- Heading 2 paragraphs
- Body text paragraphs
- Image captions (if present)

Allowed emoji — do NOT remove these, anywhere in the document:

- ✔
- ℹ️
- ⚠️

Remove:

- All other emoji
- Variation selectors (U+FE00–U+FE0F)
- Zero-width joiners (U+200D)

If a run becomes fully empty after stripping, delete the run entirely
(prevents stray invisible characters from causing rendering glitches).

### 2. Callout Standardization

Inspect every paragraph using a callout style. Standard is:

- ⚠️ Exam Trap
- ℹ️ Exam Tip
- ✔ Pro Tip

Rules:

- Replace 💡 with ✔ wherever it appears in a Pro Tip callout
- Ensure every callout paragraph begins with the correct emoji + label
- Flag (or fix) any callout missing its label prefix
- Flag (or fix) any callout using the wrong emoji

Note: these may already be fixed in the current file — verify first,
report what (if anything) needed correcting.

### 3. Table Flattening Logic (with exception lists)

Inspect every table. Classify it using the exception lists in 3A/3B
below. Flatten everything NOT on an exception list using these rules:

**2-column tables:** each row → `Term — description`

**3-column tables:** each row →
`Term` + soft break + `ColumnHeader1: value` + soft break + `ColumnHeader2: value`

**4+ column tables:** each row →
`Term` + soft break + `ColumnHeader: value` (repeated per remaining column)

**Paragraph styles:**

- First flattened row after a heading → "First Paragraph" style
- All subsequent flattened rows → "Body Text" style

**Merged cell handling (critical):**
python-docx duplicates a merged cell's Cell object across every grid
position it spans. You must:

- Deduplicate cells by identity (not just value) per row before
  extracting text
- Audit every table for `gridSpan` usage before flattening — do not
  assume only specific tables (e.g., RAID, Motherboard Components)
  use merges; check all of them
- Handle full-width merged note-rows (e.g., a JBOD-style single-cell
  note spanning the whole table width) by outputting it as plain text,
  not forced into the Term/value pattern

**Identifying exception-list tables:** do NOT rely on page numbers to
identify these tables — page numbers shift with any content edit and
will misidentify tables almost immediately. Identify each table by its
actual header row text / content (a title, a distinctive header
column, or the paragraph immediately preceding it), and confirm the
match before flattening or reformatting.

### 3A. Exception List — Comparison Tables (convert to bullet lists)

These tables become bullet-list comparison structures instead of the
standard flatten pattern:

- Wi-Fi 6E
- TCP vs UDP
- OSI vs TCP/IP (side-by-side)
- Hypervisor Types
- Snapshots and Cloning
- Storage Drive Comparison
- MBR vs GPT Comparison
- File System Comparison
- What is an Embedded System?
- Thread vs Other IoT Protocols
- Windows 10/11 Edition Comparison — ADDITIONAL RULE: replace ❌ with
  the word "NO" and ✅ with the word "YES" in this table only (these
  icons are not known to appear in any other table — confirm this
  during inspection before applying the replacement elsewhere)
- 32-bit vs 64-bit

**Bullet list format — CONFIRMED, verified against actual table
structure (TCP vs UDP: header row is `Feature | TCP (...) | UDP (...)`):**

For each row, the first column's value becomes a bold, non-bulleted
heading line. Each remaining column becomes its own bullet item,
formatted as `ColumnHeaderText: cell value` — using the actual column
HEADER text (not a generic label) as the bullet prefix.

Example (row = `Connection Type | Connection-oriented: establishes a
connection before sending data. | Connectionless: sends data without
establishing a connection first.`, header = `Feature | TCP
(Transmission Control Protocol) | UDP (User Datagram Protocol)`):

```
Connection Type
• TCP (Transmission Control Protocol): Connection-oriented:
  establishes a connection before sending data.
• UDP (User Datagram Protocol): Connectionless: sends data without
  establishing a connection first.
```

Apply this same pattern to every table in this exception list,
adjusting for however many comparison columns each table actually has
(some may compare only 2 things, others more).

### 3B. Exception List — Special Formatting Tables — CONFIRMED

These are sequential process/procedure tables, not comparison data.
Verified against actual structure — two distinct shapes exist:

**Shape A — 2-column, description pre-combined in the action cell**
(e.g. the IETAID summary table: `Step | Action`, where Step values
look like `1 - I`, `2 - E`, and Action values already read like
`Identify the Problem: Gather information, question the user,
identify recent changes, and check documentation.`):

Format each row as:

```
Step {Step value} — {Action value}
```//literal word "Step" prepended, em dash separator, then the
Action cell as-is (it already contains its own "Title: description" split)

Example output: `Step 1 - I — Identify the Problem: Gather
information, question the user, identify recent changes, and check
documentation.`

**Shape B — 3-column, title and description are separate cells**
(e.g. a fuller troubleshooting-method table: `Step | Official Action |
Deep Dive & Exam Focus`, where Step is just a number, Official Action
is a short title, and the third column is a longer explanation):

Format each row as:
```

Step {Step value} — {Official Action value}: {third column value}

```

Example, using real data from this table (`1 | Identify the Problem |
Question the user to find out what recent changes were made.`):

`Step 1 — Identify the Problem: Question the user to find out what
recent changes were made.`

**Applies to:** TCP/IP Model, OSI Model (7 Layers), Motherboard
Components, 7-Step Malware Removal, 6-Step Troubleshooting Method,
Ticket Lifecycle, CompTIA Troubleshooting Process (IETAID).

Before writing the script, inspect each of these 7 tables individually
to confirm whether it matches Shape A or Shape B (or is a genuine
comparison/reference table like TCP/IP Model or Motherboard Components
that may need the 3A bullet treatment instead of a process format —
verify which category each one actually falls into rather than
assuming all 7 are sequential steps).

### 4. Images — centering and alt text

- Center every image in the document (check paragraph alignment)
- Every image must have alt text (`docPr` `descr` attribute populated)
  — verify none are missing before finalizing; report any that are

### 5. Remove Headers and Footers

This is a reflowable Kindle ebook — headers/footers (running titles,
page numbers) are meaningless in reflowable format. For every section:
- Clear `section.header`
- Clear `section.footer`
- Remove any page number fields, running titles, etc. contained in them

### 6. Remove Excess Blank Paragraphs

- Collapse runs of 2+ consecutive empty paragraphs down to at most 1
- Preserve intentional single spacer paragraphs
- Check how single-spacer gaps are used elsewhere in the document for
  consistency before deciding whether 1 or 0 is correct in each case

### 7. Preserve Glossary Priority Bullets — DO NOT strip or alter

Glossary bullets use literal colored "●" characters (not real Word
list bullets — no `numPr`) to indicate priority: red = High,
amber/gold = Medium, green = Low. You must:
- Detect these bullet runs
- Preserve their exact color
- Preserve their run structure (don't merge them into adjacent runs)
- Do NOT strip them during emoji-cleanup passes
- Do NOT treat them as emoji or stray characters

### Verification Required Before Delivering the Script

- Re-open the output and confirm: zero tables remain outside the
  exception lists, all images are centered with alt text,
  headers/footers are empty across all sections, no runs of 2+ blank
  paragraphs remain, and glossary bullets retain their original colors
- Spot check at least 3 flattened tables (including at least one with
  a merged cell), all Section 3A bullet-list conversions, and (once
  defined) all Section 3B special-formatting conversions — convert to
  PDF and visually review
- Report exact counts: tables flattened, tables converted to bullet
  lists, headings emoji-stripped, callouts fixed, blank paragraphs
  removed, any images still missing alt text, etc.

---

## Note for next use

Table identification is now content-based, not page-number-based, per
your instruction — this is more durable but does mean the AI needs to
actually search for each table's identifying header/content in the
current file rather than trusting a static list. If you rename a
table's header wording significantly, update this list to match.
```
