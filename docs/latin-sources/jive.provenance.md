# Jive dataset - provenance

Output: `jive.csv`. 30 figures and 289 step rows: Bronze 14, Silver 7, Gold 9.
Generator: `scripts/build_jive.py`. Validator: `scripts/validate.py`. The validator checks for 19 fields per row, steps numbered consecutively from 1, a valid Level, figure-level fields only on step 1, no em dash, and that the beat values add up to the last count.

## Was the Laird book itself available?

No. Walter Laird's book could not be read directly. All the copies found were blocked or behind a bot challenge:
- scribd.com/doc/17631600, /doc/26876202, /document/588645777
- slideshare felix3000ful
- dancerdates.net

No archive.org, pdfcoffee, vdocuments or dokumen.pub copy was found. Every row therefore comes from Laird-derived secondary sources, cross-checked against each other.

## Sources

1. **Dance Central** - https://www.dancecentral.info/ballroom/international-style/jive/<figure> (all 27 ISTD figures, plus the technique page).
   - What it gives: the man's and lady's steps, amounts of turn, leads, development notes, and preceding and following figures. For Stalking Walks it also gives footwork.
   - Its wording and turn amounts closely follow the ISTD/Laird charts. It is the primary source for every figure.
2. **BallroomDancers.com** - https://www.ballroomdancers.com/Dances/info.asp?sid=343..356,739
   - Free man's and lady's charts for the Bronze figures (parts.asp). Silver and Gold are behind a paywall.
   - The syllabus page (syllabus.asp?dance=JIV) gives the level list.
3. **DanceNote** - http://dancenote.net/mixfigure_one.php?figure_name=j_* (a Japanese site based on JBDF/ISTD).
   - Per-step charts with Footwork and Amount of Turn for 18 figures. Reverse Whip, Spanish Arms, Shoulder Spin, Chugging, Catapult, Curly Whip, Change of Hands Behind Back and Whip Throwaway have no chart there.
   - The list page (mixfigures.php?dance=jive) gives the ISTD level tags.
4. **University of Michigan ballroom team, International Syllabus** - https://public.websites.umich.edu/~umbdt/Documents/InternationalSyllabus.doc
   - The ISTD Jive list 1-27, plus 3b Overturned Fallaway Throwaway (Silver) and 6a Overturned Change of Places L to R (Gold).
5. **British Dance Council, Rules Appendix 1 (Latin)** - https://www.britishdancecouncil.com/wp-content/uploads/2024/03/RulesAppendix1Latin.pdf
   - The restricted syllabus Jive list, used to corroborate figure names. It is also the only source listing "Change of Place R to L with Double Spin".
6. **Roundalab Phase V/VI Jive standards** - https://roundalab.org/wp-content/uploads/Standards/5-JV.pdf and 6-JV.pdf
   - Used only to cross-check the Curly Whip and Catapult structure.
7. **ISTD Latin modular syllabus 2018** - istd.org
   - Confirms the Jive chassé and basic action are examined. It has no figure charts.

## Level assignment

Levels follow the ISTD numbering (sources 2, 3 and 4 agree):
- **Bronze:** figures 1-14. Pre-Bronze figures 1-8 are mapped to Bronze, because the ISTD Associate (Bronze) syllabus covers them.
- **Silver:** figures 15-20, plus Overturned Fallaway Throwaway.
- **Gold:** figures 21-27, plus Overturned Change of Places L to R and Change of Places R to L with Double Spin.

## How well each figure is corroborated

All figures rest on Laird-derived sources. None was checked against the book itself.

- **Two or more independent sources agree on steps and turns:**
  - Basic in Place
  - Fallaway Rock
  - Fallaway Throwaway
  - Link
  - Change of Places R to L
  - Change of Places L to R
  - Change of Hands Behind Back
  - Hip Bump
  - American Spin
  - Stop and Go
  - Mooch
  - Whip
  - Whip Throwaway
  - Windmill
  - Rolling off the Arm
  - Simple Spin
  - Miami Special
  - Toe Heel Swivels
  - Chicken Walks
  - Stalking Walks, Flicks and Break
  - Overturned Fallaway Throwaway

  Sources: Dance Central plus BallroomDancers and/or DanceNote.
- **Dance Central only** (other sources had no chart, or only a different round-dance version):
  - Reverse Whip
  - Spanish Arms
  - Shoulder Spin
  - Chugging
  - Catapult (structure also matches Roundalab)
  - Curly Whip
  - Overturned Change of Places L to R (from the "Development" notes)
  - Change of Places R to L with Double Spin (from the "Development" notes)
- **Walks:** a composite of all three sources. See the uncertainties below.

## Conventions

- **Timing:** counts run on consecutively through the figure, e.g. `1 2 3 a 4 5 a 6`. A Slow is written as a two-count range such as `7-8`.
- **Beat values:** a chassé is `3/4 1/4 1`. The 'a' of the Hip Bump and the Break steals 1/4 beat from the step before it.
- **Turn ranges:** amounts such as "over 3-5" refer to the CSV Step numbers, as Laird does, not to the musical counts.
- **Non-weight steps:** points, flicks, toe/heel placements, the Hip Bump and the Break hold each get their own row, because the source charts list them as steps.
- **Footwork:** rock steps, walks and closes are BF. The chassé is BF, B, BF (the 'a' step is on the ball with part weight). A spin step is B. Points are T or OE of T. Flick rows have empty footwork.
- **Hand holds:** "L to R hand hold" means the Man's L hand holds the Lady's R hand.

## Uncertainties

1. **Chassé footwork.** I could not confirm Laird's exact chassé footwork.
   - DanceNote gives B, BF/B, BF.
   - Dance Central's technique page describes a "ball - ball change" action.
   - I used BF, B, BF.
   - The Whip and Reverse Whip Cuban Cross steps are marked BF; DanceNote gives T for the Whip step 1.
2. **Lady's turn on step 1 of the fallaway figures.**
   - Dance Central gives 1/4 to R. BallroomDancers and DanceNote give 1/8.
   - I used 1/4 because only that value makes the later turns add up (in Fallaway Throwaway and Change of Places R to L the partners end facing).
   - BallroomDancers' 3/8 L over 2-5 in Fallaway Throwaway is consistent only with 1/8 on step 1 and Lady's step 5 ending at an angle.
3. **Change of Hands Behind Back.** BallroomDancers gives the Man 3/8 to R over 6-8. Dance Central gives 3/8 to L, which is consistent with the partners changing places, so I used that.
4. **Walks.** The ISTD figure "The Walks" (BDC: "Promenade Walks Slow and Quick") is described differently by each source.
   - I charted it as a Fallaway Rock, two chassés in PP, then two Slow walks and two Quick walks with the Lady twisting.
   - Laird may chart the Slow and Quick walks as two separate figures. Treat this figure's step structure as the least certain in the file.
5. **Curly Whip.** Dance Central charts 5 steps (the curl), followed by a Whip or Whip Throwaway. Roundalab charts 10 steps (curl plus Whip). I used 5, with a note on step 1.
6. **Chugging.** I copied Dance Central's turn amounts, including the Man's 1/2 to L over 12-14. They do not add up exactly; the source itself notes that rotation varies.
7. **Overturned Change of Places L to R.**
   - I set the Man's turn on 6-8 to Nil (up to 1/8 to R), so that the Lady's final 1/4 to R leaves the couple facing.
   - The exact Laird values are unknown.
8. **Change of Places R to L with Double Spin.** This is in the BDC list and on DanceNote, but not in the UMich list of ISTD figures 1-27. I placed it at Gold and its level is uncertain. The Lady's turn (1 1/8 to R on step 5, then 5/8 over 6-8) comes from Dance Central's development note.
9. **Not charted.** Basic in Fallaway is not a separate figure because it is Laird's name for the Fallaway Rock. Four BDC items have no chart: Chassés to L and R, Double Cross Whip, Ball Change, and Overturned Change of Places with Double Spin.
10. **Starting and ending hand holds** for Rolling off the Arm (Man's R to Lady's L) and Miami Special (ending in L Side Position) follow Dance Central.
