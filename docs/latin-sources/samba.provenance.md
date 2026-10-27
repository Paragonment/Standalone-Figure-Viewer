# Samba dataset - provenance

Output: `samba.csv` - 53 figures, 326 step rows (Bronze 31, Silver 10, Gold 12).
Generator: `scripts/samba_build.py`; validator: `scripts/samba_validate.py` (19 fields, header, consecutive steps,
levels, figure-level fields on step 1 only, no em dash, and every figure's beats total a whole number of 2/4 bars).

## Sources

1. ISTD Latin American Professional Modular Examinations Syllabus (June 2018) -
   https://www.istd.org/documents/latin-american-professional-modular-examinations-syllabus-2018/latin-modular-syllabus-june-18-complete-.pdf
   This is the authoritative figure list and level split (Associate = Bronze figures 1-16, Licentiate = Silver 17-23,
   Fellow = Gold 24-31). All level assignments follow it.
2. Dance Central International Samba pages (Laird-style charts that give count, feet positions, turn and footwork for Leader and Follower) -
   https://www.dancecentral.info/ballroom/international-style/samba and the figure subpages, e.g. /basic-movements, /whisk, /samba-walks,
   /rhythm-bounce, /volta-movements, /traveling-bota-fogos-forward, /traveling-bota-fogos-back, /criss-cross-bota-fogos-shadow-bota-fogos,
   /bota-fogos-to-promenade-and-counter-promenade, /criss-cross-voltas, /solo-spot-volta, /foot-changes, /shadow-travelling-volta,
   /reverse-turn, /corta-jaca, /closed-rocks, /open-rocks, /back-rocks, /plait, /rolling-off-the-arm, /argentine-crosses, /maypole,
   /shadow-circular-volta, /contra-botafogos, /roundabout, /natural-roll, /reverse-roll, /promenade-and-counter-promenade-runs,
   /three-step-turn, /samba-locks, /cruzados-walks-and-locks.
   The wording ("Take minimal weight to... and replace", "Pressure on IE of T", the Foot Change numbering 1-8, the "1 a 2 a 3 a 4" volta count
   and the "1 2 3" rhythm) follows Laird's technique closely. I treated it as the Laird-derived source.
3. Ballroomguide.com samba technique (mirror at idans.nl, read via the Wayback Machine) - full Man/Lady charts with steps, turn, alignment,
   moving direction, timing, position and footwork, plus notes and precede/follow tables. Example pages:
   https://web.archive.org/web/2025/http://idans.nl/workshop/latin/samba/volta.html (and natural_basic.html, reverse_basic.html,
   side_basic.html, progressive_basic.html, whisk.html, samba_walks_pp.html, side_samba_walk.html, stationary_samba_walks.html,
   travel_bf_fwd.html, travel_bf_back.html, criss_cross_bf.html, shadow_bota_fogos.html, bf_pp_cpp.html, criss_cross_volta.html,
   solo_spot_volta.html, continuous_solo_spot_volta.html, shadow_travelling_voltas.html, shadow_circ_voltas.html, reverse_turn.html,
   corta_jaca.html, closed_rocks.html, open_rocks.html, back_rocks.html, plait.html, rolling_off_arm.html, argentine_crosses.html,
   maypole.html, contra_bf.html, roundabout.html, natural_roll.html, reverse_roll.html, p_cp_runs.html, three_step_turn.html,
   locks.html, cruzados.html, foot_change_1..7_*.html).
   I used this source mainly for alignments, positions and step-level notes. Its volta description text appears to be Laird's.
   Its Foot Change charts use a different method, flicks, which looks like IDTA or the newer ISTD technique, so I used them only for cross-checks.
4. Wikipedia "Samba (ballroom dance)" and "Botafogo (dance move)", for general timing confirmation: 1 a 2 = 3/4, 1/4, 1.

I could not get a full copy of Walter Laird's "Technique of Latin Dancing". The Scribd and PDFCoffee copies were not readable
without download walls, and I did not try to work around them. Laird was therefore only checked through the Laird-derived sources (2 and the volta text in 3).

## Verification per figure

Each figure was checked against both source 2 and source 3 unless noted otherwise. "Laird-derived" means the content was checked against source 2.

- Laird-derived and corroborated by a second source (2 and 3): Natural, Reverse, Side and Progressive Basic Movements; Whisks to L and R
  (including the Lady's underarm turns); Samba Walks in PP; Side Samba Walk; Stationary Samba Walks; Travelling Voltas; Travelling Bota Fogos
  Forward and Back; Criss Cross Bota Fogos; Bota Fogos to PP and CPP; Criss Cross Voltas; Solo Spot Voltas; Shadow Travelling Voltas;
  Reverse Turn; Corta Jaca; Closed Rocks; Open Rocks; Back Rocks; Plait; Rolling off the Arm; Argentine Crosses; Maypole; Contra Bota Fogos;
  Roundabout; Natural Roll; Reverse Roll; Promenade and Counter Promenade Runs; Three Step Turn; Samba Locks; Cruzados Walks and Locks.
- Laird-derived (source 2) only, because source 3 uses a different method: all Foot Changes (Closed to R Shadow, R Shadow to Closed,
  PP to R Shadow, R Shadow to PP, PP to R Contra, R Contra to PP, R Contra to Open CPP, RSP to R Shadow).
- Source 3 only, with the volta technique from source 2: Shadow Bota Fogos; Shadow Circular Voltas (step detail).
- Weakly sourced: Rhythm Bounce. Both sources describe it only in prose, so I charted it as 4 counts of bounce with no weight change.

## Corrections made during review

- Source 3's Man turn directions on the Travelling Bota Fogos are reversed relative to its own alignments, and its turn amounts on
  steps 8-9 of the Bota Fogos Back are inconsistent. I recomputed every turn from the alignments, following the rule that a forward
  Bota Fogo turns towards the stepping foot and both partners rotate the same way. The result matches source 2's 3/8 turn over 8-9 on the Bota Fogos Back.
- Source 3's Reverse Turn and Reverse Roll list "RF crosses in front of LF" on the Latin Cross step, which is impossible after an RF
  side step. I corrected this to "LF crosses in front of RF", which source 2 confirms.
- Source 3's Contra Bota Fogos has the Lady commencing with LF. I corrected this to the same foot as the Man (RF), as source 2 says.
- Source 3's Cruzados has "RF back" for the second walk. I treated this as a typo for a forward walk.
- Source 3 gives Open Rocks as 6 steps, while source 2 gives 9 (three rocks). I used 9. For the Man's rock action in Closed and Open Rocks I used
  source 2's "Replace wt" wording rather than source 3's "crosses behind".
- Source 2 gives the Lady's last turn in Rolling off the Arm as 1/4. I changed it to 1/2 so that each roll totals one complete turn, which source 3 agrees with.
- I checked the Lady's alignments in Open Rocks and Closed Rocks for consistency, and every figure's beat total against whole bars.

## Conventions used

- Counts: 1 a 2 (3/4, 1/4, 1) for Bota Fogo-type figures, recounted per bar. Two-bar Volta figures use 1 a 2 a 3 a 4
  (3/4, 1/4 ... 1), as in source 2. SQQ figures use 1 2 & (1, 1/2, 1/2), QQS figures use 1 & 2, and the "1 2 3" rhythm is 3/4, 1/2, 3/4.
- "Latin Cross" is used for the crossed foot position in Samba, following Laird and source 3. Source 2 calls it "Cuban Cross".
- Footwork follows Laird's abbreviations: BF, B, T, IE of T, HF, H, F (flat). The "a" side and back steps with part weight are IE of T.
- Bounce or no bounce is stated in the Lead and Follow Action on step 1.
- Samba Walks and Voltas give "Moving LOD" or "Body facing ..." where the body and foot directions differ.

## Remaining uncertainties

- The whisk step 2 footwork is uncertain: source 2 gives T and source 3 gives IE of T. I used T. Laird may give B.
- Plait footwork is uncertain. For the Man, source 3 gives "T, other foot flat" and source 2 gives BF; I used "T then flat". For the Lady, source 2 gives B and source 3 gives BF; I used BF.
- On the Corta Jaca part-weight back steps, source 3 gives T and source 2 gives B. I used T.
- The Reverse Turn total turn varies (3/4 in source 3, about 7/8 in source 2). I used 3/4 with source 3's alignments.
- The Three Step Turn Lady's timing is unclear: QQS in source 3, and "1 2 3" in source 2. I used QQS with Lady counts noted in the Follow Action, and turn amounts from source 3 (about 1 3/4 L).
- In Promenade and Counter Promenade Runs, I used source 2's feet positions, which start with a side step and replace to PP.
  Source 3 starts with a forward step. The alignments were derived from the turn amounts.
- I represented the Foot Changes with the Man's "Hold" on the a as a row with no weight change. For the R Contra to Open CPP Foot Change, the
  Man has an empty row on the Lady's 4th "a" because his timing (1a2 1a2) differs from hers (1a2a3a4).
- These figures are charted only in one representative form, with variants described in the General Notes: Side Basic (commenced RF),
  Samba Locks (12 steps), Cruzados (commenced RF, 2 walks and 1 lock) and Rhythm Bounce. Foot Change PP to R Contra uses the "Rock Fwd and Back" method.
- These are not charted as separate figures: Continuous Solo Spot Voltas, the Dropped Volta, the Rolling off the Arm spin endings and the generic
  Spot or Circular Volta. All are mentioned in the notes of the related figures.
- Shadow Bota Fogos is listed separately here following source 3. The ISTD list names only "Criss Cross Bota Fogos", and source 2 treats the
  two names as one figure.
