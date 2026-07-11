-- ============================================================
-- Forged Customs — Demo / Showcase Seed Data
-- Central Kentucky automotive custom shop — realistic fake data.
--
-- Paste this into the Supabase SQL Editor and click Run.
-- All rows use fixed UUIDs so the script is safe to re-run
-- (ON CONFLICT DO NOTHING / DO UPDATE keeps it idempotent).
--
-- Covers: customers · vehicles · service_notes · jobs · quotes ·
--         follow_ups · parts · part_batches · part_movements ·
--         count_sessions · count_entries · purchase_orders ·
--         purchase_order_items · messages
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- CUSTOMERS  (10 — realistic Central KY names & sources)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.customers
  (id, created_at, updated_at, first_name, last_name, email, phone, source, notes)
VALUES
  ('a1000001-0000-4000-8000-000000000001', now()-interval'8 months',  now()-interval'8 months',
   'Travis',   'Combs',     'travis.combs@gmail.com',       '(859) 555-0101', 'referral',
   'Referred by Derek Mullins. Serious build guy — always comes in with receipts and a plan.'),

  ('a1000002-0000-4000-8000-000000000001', now()-interval'6 months',  now()-interval'6 months',
   'Brittany', 'Hale',      'brittany.hale@outlook.com',    '(502) 555-0102', 'social',
   'Found us on Instagram. Wants the Bronco looking trail-ready before fall.'),

  ('a1000003-0000-4000-8000-000000000001', now()-interval'13 months', now()-interval'3 months',
   'Derek',    'Mullins',   'derek.mullins@yahoo.com',      '(859) 555-0103', 'website',
   'Long-time customer. Has sent three referrals — give VIP treatment.'),

  ('a1000004-0000-4000-8000-000000000001', now()-interval'4 months',  now()-interval'4 months',
   'Savannah', 'Price',     'savannah.price@gmail.com',     '(859) 555-0104', 'walk-in',
   'Walked in after seeing the Wrangler build at Cars & Coffee Lexington.'),

  ('a1000005-0000-4000-8000-000000000001', now()-interval'11 months', now()-interval'5 months',
   'Marcus',   'Singleton', 'marcus.singleton@gmail.com',   '(502) 555-0105', 'referral',
   'State trooper. Very particular about fitment and KY lighting compliance.'),

  ('a1000006-0000-4000-8000-000000000001', now()-interval'2 months',  now()-interval'2 months',
   'Kayla',    'Watts',     'kayla.watts@icloud.com',       '(859) 555-0106', 'website',
   'Just moved from Louisville. Loves the stealth-black Tundra content.'),

  ('a1000007-0000-4000-8000-000000000001', now()-interval'15 months', now()-interval'7 months',
   'Justin',   'Napier',    'justin.napier@hotmail.com',    '(859) 555-0107', 'referral',
   'Repeat customer — first Sierra ceramic/powder, now rock light upgrade.'),

  ('a1000008-0000-4000-8000-000000000001', now()-interval'5 months',  now()-interval'5 months',
   'Amanda',   'Stivers',   'amanda.stivers@gmail.com',     '(859) 555-0108', 'social',
   'TikTok referral. Gladiator in Nacho Yellow — Satin Bronze wheels are her vision.'),

  ('a1000009-0000-4000-8000-000000000001', now()-interval'3 months',  now()-interval'1 month',
   'Cole',     'Barnett',   'cole.barnett@gmail.com',       '(859) 555-0109', 'walk-in',
   'Dropped in with the Ranger. Wants powder on bumper and wheels. May add pods later.'),

  ('a1000010-0000-4000-8000-000000000001', now()-interval'5 weeks',   now()-interval'5 weeks',
   'Tiffany',  'Rudd',      'tiffany.rudd@outlook.com',     '(859) 555-0110', 'website',
   'Quote request only so far. Outback Wilderness — roof rack lights and pods.')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- VEHICLES  (one per customer)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.vehicles
  (id, customer_id, created_at, updated_at, year, make, model, trim, vin, license_plate, color, notes)
VALUES
  ('b2000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001',
   now()-interval'8 months', now()-interval'8 months',
   2019, 'RAM',    '1500',         'TRX',               '1C6SRFU9KN800001', 'KY · TRX19',
   'Granite Crystal', 'Level kit, 37s, stock wheels. Full rock-light rig plan.'),

  ('b2000002-0000-4000-8000-000000000002', 'a1000002-0000-4000-8000-000000000001',
   now()-interval'6 months', now()-interval'6 months',
   2022, 'Ford',   'Bronco',       'Outer Banks',        '1FMEE5DP0NL800002', 'KY · BRN22',
   'Cactus Gray', 'Stock wheels coming off — customer wants Satin Bronze Metallic powder.'),

  ('b2000003-0000-4000-8000-000000000002', 'a1000003-0000-4000-8000-000000000001',
   now()-interval'13 months', now()-interval'3 months',
   2020, 'Chevy',  'Silverado',    '2500HD LTZ',         '1GC4YNEY0LF800003', 'KY · SIL20',
   'Midnight Black', 'Phase 1 lighting done. Phase 2 = ditch lights in shop now.'),

  ('b2000004-0000-4000-8000-000000000002', 'a1000004-0000-4000-8000-000000000001',
   now()-interval'4 months', now()-interval'4 months',
   2021, 'Jeep',   'Wrangler',     'Unlimited Rubicon',  '1C4HJXFN0MW800004', 'KY · RUB21',
   'Sarge Green', 'Full exterior overhaul — sliders, bumper powder, ceramic coat, lights.'),

  ('b2000005-0000-4000-8000-000000000002', 'a1000005-0000-4000-8000-000000000001',
   now()-interval'11 months', now()-interval'5 months',
   2018, 'Ford',   'F-150',        'Raptor',             '1FTFW1RG9JFA00005', 'KY · RAP18',
   'Lead Foot Gray', 'All lighting must be amber-compliant per KY statute.'),

  ('b2000006-0000-4000-8000-000000000002', 'a1000006-0000-4000-8000-000000000001',
   now()-interval'2 months', now()-interval'2 months',
   2023, 'Toyota', 'Tundra',       'TRD Pro',            '5TFLA5ABXPX800006', 'KY · TRD23',
   'Ice Cap White', 'Stealth-black lighting package — all black housings and hardware.'),

  ('b2000007-0000-4000-8000-000000000002', 'a1000007-0000-4000-8000-000000000001',
   now()-interval'11 months', now()-interval'7 months',
   2017, 'GMC',    'Sierra',       '1500 Denali',        '1GTR2VE06HZ800007', 'KY · DNL17',
   'Onyx Black', 'Ceramic coat + wheel powder done. Now adding rock light kit.'),

  ('b2000008-0000-4000-8000-000000000002', 'a1000008-0000-4000-8000-000000000001',
   now()-interval'5 months', now()-interval'5 months',
   2020, 'Jeep',   'Gladiator',    'Mojave',             '1C6JJTEG0LL800008', 'KY · GLB20',
   'Nacho Yellow', 'Satin Bronze wheel powder — great contrast to body color.'),

  ('b2000009-0000-4000-8000-000000000002', 'a1000009-0000-4000-8000-000000000001',
   now()-interval'3 months', now()-interval'1 month',
   2019, 'Ford',   'Ranger',       'Lariat',             '1FTER4FH4KLA00009', 'KY · RNG19',
   'Magnetic Gray', 'Front bumper + 4 wheels in Flat White Matte. Possibly adding pods.'),

  ('b2000010-0000-4000-8000-000000000002', 'a1000010-0000-4000-8000-000000000001',
   now()-interval'5 weeks', now()-interval'5 weeks',
   2022, 'Subaru', 'Outback',      'Wilderness',         'JF2GTHMC1N0800010', 'KY · SUB22',
   'Geyser Blue', 'Roof rack + 2x Stedi mini pods forward, interior rocker switch.')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- SERVICE NOTES  (vehicle timeline entries)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.service_notes
  (id, vehicle_id, created_at, updated_at, occurred_on, category, summary, detail)
VALUES
  ('d3000001-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000002',
   now()-interval'7 months', now()-interval'7 months', (current_date-210),
   'lighting', 'Initial consultation — rock light plan',
   'Walked through 4-zone under-body rock light plan with Travis. Approved Baja Designs S8 30" across windshield frame. Will schedule once parts arrive.'),

  ('d3000002-0000-4000-8000-000000000001', 'b2000003-0000-4000-8000-000000000002',
   now()-interval'9 months', now()-interval'9 months', (current_date-270),
   'lighting', 'Phase 1 — full LED lighting delivery',
   'Installed Rigid E-Series 30" roof bar, Baja Designs S2 Pro bumper pods (pair), KC HiLiTES 8-pc rock kit with 4-zone harness. All zones tested clean on test drive.'),

  ('d3000003-0000-4000-8000-000000000001', 'b2000003-0000-4000-8000-000000000002',
   now()-interval'6 months', now()-interval'6 months', (current_date-180),
   'note', 'Customer call — zone 3 rock light not syncing',
   'Derek called to report zone 3 (passenger rear) not firing from switch panel. Likely relay or pig-tail issue. Scheduled warranty return.'),

  ('d3000004-0000-4000-8000-000000000001', 'b2000003-0000-4000-8000-000000000002',
   now()-interval'6 months', now()-interval'6 months', (current_date-178),
   'lighting', 'Warranty fix — zone 3 relay replaced',
   'Found corrosion at pig-tail connector near driver-side rocker. Replaced relay and re-crimped connector. Zone 3 verified working. No charge.'),

  ('d3000005-0000-4000-8000-000000000001', 'b2000005-0000-4000-8000-000000000002',
   now()-interval'7 months', now()-interval'7 months', (current_date-210),
   'lighting', 'Delivered amber compliance lighting build',
   'Installed amber Baja Designs S8 30" roof bar + amber S2 bumper pods. All output verified amber per KY statute. Marcus signed off on install. Outstanding result.'),

  ('d3000006-0000-4000-8000-000000000001', 'b2000007-0000-4000-8000-000000000002',
   now()-interval'9 months', now()-interval'9 months', (current_date-270),
   'coating', 'Sierra Denali — ceramic coat + Jet Black Gloss wheels',
   'Full Gyeon Quartz ceramic coat applied to all body panels. Factory Denali wheels blasted and powdered in Jet Black Gloss. Turned out extremely sharp.'),

  ('d3000007-0000-4000-8000-000000000001', 'b2000008-0000-4000-8000-000000000002',
   now()-interval'5 months', now()-interval'5 months', (current_date-150),
   'powder', 'Gladiator Mojave — Satin Bronze Metallic wheels delivered',
   'All 5 factory wheels blasted and powdered in Satin Bronze Metallic. Fantastic contrast with Nacho Yellow body. Amanda was thrilled — immediately shared on Instagram.'),

  ('d3000008-0000-4000-8000-000000000001', 'b2000004-0000-4000-8000-000000000002',
   now()-interval'4 months', now()-interval'4 months', (current_date-115),
   'note', 'Drop-off documented — pre-work inspection',
   'Wrangler Rubicon dropped off for full exterior overhaul. Photographed all existing scratches and dings before work begins. Customer signed damage waiver.')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- JOBS  (kanban: new · scheduled · in_shop · ready · delivered)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.jobs
  (id, created_at, updated_at, customer_id, vehicle_id, title, summary, status, stage, scheduled_for)
VALUES
  -- ── new (2) ────────────────────────────────────────────────
  ('c4000001-0000-4000-8000-000000000003',
   now()-interval'3 days', now()-interval'3 days',
   'a1000001-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000002',
   'RAM TRX — Full Rock Light Rig',
   '8-piece KC HiLiTES rock light kit with 4-zone wiring harness. Customer-supplied switch panel to integrate.',
   'new', NULL, NULL),

  ('c4000010-0000-4000-8000-000000000003',
   now()-interval'1 day', now()-interval'1 day',
   'a1000010-0000-4000-8000-000000000001', 'b2000010-0000-4000-8000-000000000002',
   'Outback Wilderness — Roof Rack Light Package',
   'Mount customer-supplied roof rack. Install 2x Stedi 3" mini pods forward-facing. Run hidden interior switch to dashboard.',
   'new', NULL, NULL),

  -- ── scheduled (2) ──────────────────────────────────────────
  ('c4000002-0000-4000-8000-000000000003',
   now()-interval'3 weeks', now()-interval'3 weeks',
   'a1000002-0000-4000-8000-000000000001', 'b2000002-0000-4000-8000-000000000002',
   'Bronco Outer Banks — Satin Bronze Wheel Powder',
   'Strip factory Outer Banks wheels, media blast, and powder all 5 (including spare) in Satin Bronze Metallic.',
   'scheduled', NULL, (current_date+4)),

  ('c4000009-0000-4000-8000-000000000003',
   now()-interval'1 week', now()-interval'1 week',
   'a1000009-0000-4000-8000-000000000001', 'b2000009-0000-4000-8000-000000000002',
   'Ranger Lariat — Bumper & Wheel Powder Coat',
   'Powder front aftermarket bumper + all 4 factory alloys in Flat White Matte. Customer may add pod quote later.',
   'scheduled', NULL, (current_date+10)),

  -- ── in_shop (3, different stages) ──────────────────────────
  ('c4000003-0000-4000-8000-000000000003',
   now()-interval'5 days', now()-interval'1 day',
   'a1000003-0000-4000-8000-000000000001', 'b2000003-0000-4000-8000-000000000002',
   'Silverado 2500 — Phase 2 Ditch Light Upgrade',
   'Add 4x Rigid D-Series Pro ditch-mount pods, re-route switch panel, integrate into existing 4-zone harness.',
   'in_shop', 'other', NULL),

  ('c4000004-0000-4000-8000-000000000003',
   now()-interval'9 days', now()-interval'2 days',
   'a1000004-0000-4000-8000-000000000001', 'b2000004-0000-4000-8000-000000000002',
   'Wrangler Rubicon — Full Exterior Build',
   'Powder front/rear bumpers + sliders in Armor Gray Textured. Full Gyeon ceramic coat. Baja S8 windshield bar. 8-pc rock light kit.',
   'in_shop', 'coat', NULL),

  ('c4000005-0000-4000-8000-000000000003',
   now()-interval'6 days', now()-interval'12 hours',
   'a1000005-0000-4000-8000-000000000001', 'b2000005-0000-4000-8000-000000000002',
   'Raptor — Amber Ditch & Chase Light Upgrade',
   'Swap ditch pods to Baja Designs LP9 amber, add 2x rear chase LED pods, full harness re-route and cleanup.',
   'in_shop', 'qc', NULL),

  -- ── ready (2) ──────────────────────────────────────────────
  ('c4000006-0000-4000-8000-000000000003',
   now()-interval'3 weeks', now()-interval'1 day',
   'a1000006-0000-4000-8000-000000000001', 'b2000006-0000-4000-8000-000000000002',
   'Tundra TRD Pro — Stealth Black Lighting Build',
   'Full black lighting: Rigid 30" E-Series black-housing bar, 4x black S2 bumper pods, 8-pc KC black rock light kit.',
   'ready', NULL, NULL),

  ('c4000011-0000-4000-8000-000000000003',
   now()-interval'4 weeks', now()-interval'2 days',
   'a1000007-0000-4000-8000-000000000001', 'b2000007-0000-4000-8000-000000000002',
   'Sierra Denali — Rock Light Addition',
   '4-zone Baja Designs rock light kit on existing Sierra. Customer returning for second build — wired to stock switch.',
   'ready', NULL, NULL),

  -- ── delivered (3) ──────────────────────────────────────────
  ('c4000007-0000-4000-8000-000000000003',
   now()-interval'4 months', now()-interval'4 months',
   'a1000005-0000-4000-8000-000000000001', 'b2000005-0000-4000-8000-000000000002',
   'Raptor — Full Amber Compliance Lighting Build',
   'Complete amber lighting rig: S8 30" roof bar, S2 bumper pods, all output verified KY-compliant. Full wiring documentation.',
   'delivered', NULL, NULL),

  ('c4000008-0000-4000-8000-000000000003',
   now()-interval'5 months', now()-interval'5 months',
   'a1000008-0000-4000-8000-000000000001', 'b2000008-0000-4000-8000-000000000002',
   'Gladiator Mojave — Satin Bronze Wheel Powder',
   'Blasted and powdered all 5 factory Gladiator wheels in Satin Bronze Metallic. Stunning contrast with Nacho Yellow.',
   'delivered', NULL, NULL),

  ('c4000012-0000-4000-8000-000000000003',
   now()-interval'9 months', now()-interval'9 months',
   'a1000007-0000-4000-8000-000000000001', 'b2000007-0000-4000-8000-000000000002',
   'Sierra Denali — Ceramic Coat & Jet Black Wheels',
   'Gyeon Quartz full ceramic detail + factory Denali wheels in Jet Black Gloss. Justin''s first build with us.',
   'delivered', NULL, NULL)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- QUOTES  (pipeline: new · contacted · quoted · converted · lost)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.quotes
  (id, created_at, updated_at, source, status,
   customer_id, vehicle_id, job_id,
   lead_first_name, lead_last_name, lead_email, lead_phone, lead_city,
   vehicle_year, vehicle_make, vehicle_model, vehicle_trim,
   services_interest, timeline, budget, desired_look, message, staff_notes, estimated_total_cents)
VALUES
  -- new — website
  ('e5000001-0000-4000-8000-000000000004',
   now()-interval'2 days', now()-interval'2 days',
   'website', 'new', NULL, NULL, NULL,
   'Brandon', 'Tackett', 'brandon.tackett@gmail.com', '(606) 555-0201', 'Morehead',
   '2021', 'Toyota', 'Tacoma', 'TRD Off-Road',
   ARRAY['lighting','powder'], '1–2 months', '$1,000–$2,500',
   'Stealth black everything',
   'Interested in an LED light bar and black wheel powder. Saw your Tundra build on Instagram.',
   NULL, NULL),

  ('e5000002-0000-4000-8000-000000000004',
   now()-interval'1 day', now()-interval'1 day',
   'website', 'new', NULL, NULL, NULL,
   'Sarah', 'Ledford', 'sarah.ledford@icloud.com', '(859) 555-0202', 'Berea',
   '2023', 'Ford', 'Bronco Sport', 'Big Bend',
   ARRAY['lighting'], 'ASAP', '$500–$1,000',
   'Fun and bright trail rig',
   'Just want some pod lights for weekend trails. Nothing crazy — maybe 2–4 pods and a switch.',
   NULL, NULL),

  -- contacted — phone lead
  ('e5000003-0000-4000-8000-000000000004',
   now()-interval'10 days', now()-interval'3 days',
   'phone', 'contacted', NULL, NULL, NULL,
   'Nathan', 'Caudill', 'nathan.caudill@yahoo.com', '(502) 555-0203', 'Frankfort',
   '2020', 'Chevy', 'Colorado', 'Z71',
   ARRAY['powder','coating'], '2–3 months', '$2,500–$5,000',
   'Rugged matte military look',
   'Powder on bumper + Rhino-liner look on lower rockers. Also asking about ceramic coat.',
   'Left voicemail 7/2. Called back 7/3 — scheduled phone consult for 7/14.', NULL),

  -- quoted — waiting on customer
  ('e5000004-0000-4000-8000-000000000004',
   now()-interval'4 weeks', now()-interval'10 days',
   'website', 'quoted', NULL, NULL, NULL,
   'Rachel', 'Bowling', 'rachel.bowling@gmail.com', '(859) 555-0204', 'Danville',
   '2019', 'Jeep', 'Wrangler', 'Sport S',
   ARRAY['lighting','powder','fabrication'], '1 month', '$3,000–$6,000',
   'Trail-ready, aggressive look',
   'Full overhaul — Baja S8 bar, bumper powder, maybe custom sliders. Very motivated buyer.',
   'Sent quote for $4,850 on 6/28. No response — following up this week.', 485000),

  ('e5000005-0000-4000-8000-000000000004',
   now()-interval'2 weeks', now()-interval'5 days',
   'email', 'quoted', NULL, NULL, NULL,
   'Tyler', 'Hatfield', 'tyler.hatfield@outlook.com', '(859) 555-0205', 'Irvine',
   '2022', 'RAM', '1500', 'Rebel',
   ARRAY['lighting'], 'Flexible', '$1,500–$3,000',
   'Race-inspired LED setup',
   'Chase lights rear and a spot bar up top. White LEDs only. Has a specific mount in mind.',
   'Quoted $2,200 via email 7/1. No reply yet — text nudge planned for 7/12.', 220000),

  -- converted — linked to delivered job
  ('e5000006-0000-4000-8000-000000000004',
   now()-interval'5 months', now()-interval'4 months',
   'staff', 'converted',
   'a1000005-0000-4000-8000-000000000001',
   'b2000005-0000-4000-8000-000000000002',
   'c4000007-0000-4000-8000-000000000003',
   'Marcus', 'Singleton', 'marcus.singleton@gmail.com', '(502) 555-0105', 'Frankfort',
   '2018', 'Ford', 'F-150', 'Raptor',
   ARRAY['lighting'], '2–4 weeks', '$2,000–$4,000',
   'Amber-compliant duty lighting',
   'Full amber rig — KY trooper needs everything by the book.',
   'Converted to job. Delivered — customer extremely satisfied.', 310000),

  -- lost — price shopper
  ('e5000007-0000-4000-8000-000000000004',
   now()-interval'7 weeks', now()-interval'5 weeks',
   'website', 'lost', NULL, NULL, NULL,
   'Kevin', 'Justice', 'kevin.justice@gmail.com', '(859) 555-0206', 'London',
   '2016', 'Jeep', 'Cherokee', 'Trailhawk',
   ARRAY['lighting'], '1 month', 'Under $500',
   'Just want it to look cool',
   'Asking for a full light bar, pods, and rock lights for under $500. Not realistic.',
   'Budget far below minimum. Price-shopped — went with a no-name Amazon kit. Not a fit.', NULL)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- FOLLOW-UPS
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.follow_ups
  (id, created_at, updated_at, title, notes, kind, status, due_on, customer_id, job_id)
VALUES
  ('f6000001-0000-4000-8000-000000000007',
   now()-interval'4 months', now()-interval'4 months',
   'Post-delivery check — Raptor amber build',
   'Call Marcus to confirm all amber zones working correctly after first week of use. Ask about road vibration.',
   'post_delivery', 'done', (current_date-110),
   'a1000005-0000-4000-8000-000000000001', 'c4000007-0000-4000-8000-000000000003'),

  ('f6000002-0000-4000-8000-000000000007',
   now()-interval'5 months', now()-interval'5 months',
   'Google Review Request — Gladiator Satin Bronze',
   'Text Amanda asking for a Google or Facebook review. The build came out incredible — easy sell.',
   'review_request', 'done', (current_date-140),
   'a1000008-0000-4000-8000-000000000001', 'c4000008-0000-4000-8000-000000000003'),

  ('f6000003-0000-4000-8000-000000000007',
   now()-interval'10 days', now()-interval'10 days',
   'Follow up — Rachel Bowling Wrangler quote ($4,850)',
   'No response to quote sent 6/28. Call or text to see if she has questions or needs adjustments.',
   'general', 'pending', (current_date+2),
   NULL, NULL),

  ('f6000004-0000-4000-8000-000000000007',
   now()-interval'5 days', now()-interval'5 days',
   'Follow up — Tyler Hatfield RAM Rebel quote ($2,200)',
   'Email sent 7/1, no reply. Text nudge planned for 7/12. He seemed motivated — worth a personal follow-up.',
   'general', 'pending', (current_date+1),
   NULL, NULL),

  ('f6000005-0000-4000-8000-000000000007',
   now()-interval'3 weeks', now()-interval'3 weeks',
   'Pickup call — Tundra stealth build (Kayla Watts)',
   'Tundra is done and ready. Call Kayla to confirm pickup time. She mentioned mornings work best.',
   'post_delivery', 'pending', current_date,
   'a1000006-0000-4000-8000-000000000001', 'c4000006-0000-4000-8000-000000000003'),

  ('f6000006-0000-4000-8000-000000000007',
   now()-interval'9 months', now()-interval'9 months',
   'Post-delivery check — Sierra Denali ceramic coat',
   'Call Justin 2 weeks post-delivery. Ask about ceramic coat performance and any water-spot issues.',
   'post_delivery', 'done', (current_date-240),
   'a1000007-0000-4000-8000-000000000001', 'c4000012-0000-4000-8000-000000000003'),

  ('f6000007-0000-4000-8000-000000000007',
   now()-interval'1 month', now()-interval'1 month',
   'Seasonal push — summer ceramic coat refresh campaign',
   'Reach out to all ceramic coat customers about a mid-summer top-coat refresh at a discount. Good summer revenue play.',
   'seasonal', 'pending', (current_date+14),
   NULL, NULL),

  ('f6000008-0000-4000-8000-000000000007',
   now()-interval'2 days', now()-interval'2 days',
   'Review request — Sierra rock lights (Justin Napier)',
   'Text Justin once he picks up. Second build, happy customer — prime candidate for a 5-star review.',
   'review_request', 'pending', (current_date+3),
   'a1000007-0000-4000-8000-000000000001', 'c4000011-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- PARTS  (22 SKUs across all categories)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.parts
  (id, created_at, updated_at, sku, name, category, item_type, uom,
   cost_cents, price_cents, on_hand, min_qty, par_qty,
   vendor, vendor_sku, lead_time_days, location, notes, active)
VALUES
  -- lighting
  ('00000001-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 weeks',
   'BD-S8-30W', 'Baja Designs S8 LED Light Bar 30"',
   'lighting', 'part', 'each', 69500, 94900, 4.00, 1.00, 3.00,
   'Baja Designs', 'BD-S8-30-WIDE', 14, 'Shelf A-1',
   'Best-seller. Confirm with install before reordering.', true),

  ('00000002-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 month',
   'RIG-DS-PRO-2', 'Rigid Industries D-Series Pro Pod (pair)',
   'lighting', 'part', 'pair', 38500, 54900, 5.00, 2.00, 4.00,
   'Rigid Industries', '110312', 10, 'Shelf A-2',
   'White/combo beam — customer specifies at order.', true),

  ('00000003-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'3 weeks',
   'KC-ROCK-8PK', 'KC HiLiTES Rock Light Kit 8-piece',
   'lighting', 'kit', 'each', 24800, 36500, 5.00, 2.00, 4.00,
   'KC HiLiTES', 'KC-91106', 7, 'Shelf A-3',
   'Always pairs with 40A relay harness.', true),

  ('00000004-0000-4000-8000-000000000005', now()-interval'8 months', now()-interval'2 months',
   'STEDI-3MINI-2', 'Stedi 3" CREE Mini LED Pod (pair)',
   'lighting', 'part', 'pair', 8900, 13900, 9.00, 3.00, 6.00,
   'Stedi', 'STEDI-ST3303', 21, 'Shelf A-4',
   'Great budget entry-level option for roof rack and A-pillar mounts.', true),

  ('00000005-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 week',
   'HARNESS-40A', 'Relay Wiring Harness 40A (universal)',
   'lighting', 'part', 'each', 2200, 4500, 12.00, 5.00, 10.00,
   'LightWire Pro', 'LWP-H40A', 5, 'Shelf A-5',
   'Stock heavy — goes with every kit install.', true),

  -- powder
  ('00000006-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 week',
   'PWD-JBG-1LB', 'Powder — Jet Black Gloss (1 lb)',
   'powder', 'consumable', 'lb', 1850, 3200, 8.50, 3.00, 6.00,
   'Prismatic Powders', 'JBG-1', 3, 'Powder Room B-1',
   NULL, true),

  ('00000007-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'3 days',
   'PWD-SBM-1LB', 'Powder — Satin Bronze Metallic (1 lb)',
   'powder', 'consumable', 'lb', 2100, 3600, 6.00, 2.00, 5.00,
   'Prismatic Powders', 'SBM-1', 3, 'Powder Room B-2',
   'Very popular finish right now. Order ahead of busy season.', true),

  ('00000008-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 weeks',
   'PWD-FWM-1LB', 'Powder — Flat White Matte (1 lb)',
   'powder', 'consumable', 'lb', 1800, 3100, 5.00, 2.00, 5.00,
   'Prismatic Powders', 'FWM-1', 3, 'Powder Room B-3',
   NULL, true),

  ('00000009-0000-4000-8000-000000000005', now()-interval'8 months', now()-interval'1 month',
   'PWD-CAR-1LB', 'Powder — Candy Apple Red (1 lb)',
   'powder', 'consumable', 'lb', 2400, 4100, 3.00, 1.00, 3.00,
   'Prismatic Powders', 'CAR-1', 3, 'Powder Room B-4',
   'Slow mover — check job need before ordering.', true),

  ('00000010-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 week',
   'PWD-AGT-1LB', 'Powder — Armor Gray Textured (1 lb)',
   'powder', 'consumable', 'lb', 1950, 3300, 7.00, 3.00, 6.00,
   'Prismatic Powders', 'AGT-1', 3, 'Powder Room B-5',
   'Popular for frame, slider, and skid-plate work.', true),

  -- paint
  ('00000011-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 months',
   'PRIMER-EP-GAL', '2K Epoxy Primer — Gallon',
   'paint', 'consumable', 'gal', 4800, 7200, 3.00, 1.00, 2.00,
   'Sherwin-Williams', 'EPOXY-2K-1G', 5, 'Paint Room C-1',
   NULL, true),

  ('00000012-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 month',
   'CLEAR-2K-QT', '2K Clear Coat — Quart',
   'paint', 'consumable', 'qt', 2200, 3800, 5.00, 2.00, 4.00,
   'Sherwin-Williams', 'CLEAR-2K-QT', 5, 'Paint Room C-2',
   NULL, true),

  -- coating
  ('00000013-0000-4000-8000-000000000005', now()-interval'8 months', now()-interval'3 weeks',
   'CERAMIC-30ML', 'Gyeon Quartz Ceramic Coat 30ml Kit',
   'coating', 'consumable', 'kit', 4500, 8900, 8.00, 3.00, 6.00,
   'Gyeon Quartz', 'Q2M-WetCoat-30', 7, 'Detailing Room D-1',
   'Store below 25°C. Check expiry on each kit before use.', true),

  ('00000014-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 weeks',
   'RHINO-GAL', 'Rhino Bedliner Coating — Gallon',
   'coating', 'consumable', 'gal', 3800, 6500, 4.00, 1.00, 3.00,
   'Rhino Linings', 'RL-BED-GAL', 10, 'Coating Room D-2',
   NULL, true),

  -- fabrication
  ('00000015-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 month',
   'DOM-175-120-FT', 'DOM Tubing 1.75" x .120" wall — per ft',
   'fabrication', 'part', 'ft', 450, 800, 60.00, 20.00, 40.00,
   'Metal Supermarkets', 'DOM-175-120', 3, 'Fab Shop E-1',
   'Cut to length on order.', true),

  ('00000016-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 months',
   'PLATE-316-4X8', 'Steel Plate 3/16" — 4''x8'' Sheet',
   'fabrication', 'part', 'sheet', 18500, 28000, 3.00, 1.00, 2.00,
   'Metal Supermarkets', 'PLATE-316-48', 3, 'Fab Shop E-2',
   NULL, true),

  -- consumable
  ('00000017-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 week',
   'SCOTCH-6PK', '3M Scotchbrite Pads — 6-pack',
   'consumable', 'consumable', 'pack', 850, 1600, 14.00, 5.00, 10.00,
   '3M', '3M-SCBR-6PK', 5, 'Supplies F-1',
   NULL, true),

  ('00000018-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 weeks',
   'TAPE-2IN-3PK', 'Masking Tape 2" — 3-pack',
   'consumable', 'consumable', 'pack', 420, 900, 10.00, 4.00, 8.00,
   '3M', '3M-2090-3PK', 5, 'Supplies F-2',
   NULL, true),

  ('00000019-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 month',
   'ACETONE-GAL', 'Acetone — Gallon',
   'consumable', 'consumable', 'gal', 1200, 2200, 6.00, 2.00, 4.00,
   'Klean-Strip', 'KS-GAL-ACE', 5, 'Supplies F-3',
   NULL, true),

  ('00000020-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'1 week',
   'DEGR-GAL', 'Surface Degreaser — Gallon',
   'consumable', 'consumable', 'gal', 1400, 2500, 5.00, 2.00, 4.00,
   'Zep', 'ZEP-DEGR-GAL', 5, 'Supplies F-4',
   NULL, true),

  -- tool / other
  ('00000021-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'2 months',
   'BLAST-AO-50LB', 'Blast Media — Aluminum Oxide 80-grit 50 lb',
   'other', 'consumable', 'bag', 2800, 4500, 4.00, 1.00, 3.00,
   'National Abrasives', 'NAT-AO80-50', 7, 'Blast Room G-1',
   'Recycle and sift — typically lasts 3–4 cycles before disposal.', true),

  ('00000022-0000-4000-8000-000000000005', now()-interval'1 year', now()-interval'3 months',
   'MIG-ER70-10LB', 'MIG Wire ER70S-6 .030" — 10 lb spool',
   'fabrication', 'consumable', 'spool', 2600, 4800, 3.00, 1.00, 2.00,
   'Lincoln Electric', 'ED023334', 7, 'Fab Shop E-3',
   NULL, true)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- PART BATCHES  (batch/lot tracking for powders and coatings)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.part_batches
  (id, created_at, updated_at, part_id, batch_number, received_on,
   unit_cost_cents, quantity_received, quantity_remaining, expires_on, notes)
VALUES
  ('07000001-0000-4000-8000-000000000003',
   now()-interval'3 months', now()-interval'3 months',
   '00000007-0000-4000-8000-000000000005',
   'SBM-2026-A', (current_date-90), 2100, 10.00, 6.00, NULL,
   'First run of Satin Bronze Metallic. Very popular — moving fast.'),

  ('07000002-0000-4000-8000-000000000003',
   now()-interval'6 months', now()-interval'6 months',
   '00000006-0000-4000-8000-000000000005',
   'JBG-2026-A', (current_date-180), 1850, 12.00, 8.50, NULL,
   'Jet Black Gloss running stock — reorder on next PO.'),

  ('07000003-0000-4000-8000-000000000003',
   now()-interval'1 month', now()-interval'1 month',
   '00000013-0000-4000-8000-000000000005',
   'CER-2026-A', (current_date-30), 4500, 10.00, 8.00, (current_date+335),
   'Gyeon ceramic coat — sealed and stored at 18°C. Expiry tracked.'),

  ('07000004-0000-4000-8000-000000000003',
   now()-interval'4 months', now()-interval'4 months',
   '00000010-0000-4000-8000-000000000005',
   'AGT-2026-A', (current_date-120), 1950, 10.00, 7.00, NULL,
   'Armor Gray Textured — solid mover for frame and skid-plate jobs.')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- PART MOVEMENTS  (immutable stock ledger)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.part_movements
  (id, occurred_at, part_id, movement_type, quantity, unit_cost_cents, job_id, reason, notes)
VALUES
  -- Initial receives
  ('08000001-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000001-0000-4000-8000-000000000005', 'receive',  4.00, 69500, NULL, NULL, 'Initial stock — 4 units S8 30"'),
  ('08000002-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000002-0000-4000-8000-000000000005', 'receive',  6.00, 38500, NULL, NULL, 'Initial stock — 6 pairs D-Series Pro'),
  ('08000003-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000003-0000-4000-8000-000000000005', 'receive',  8.00, 24800, NULL, NULL, 'Initial stock — 8 rock light kits'),
  ('08000004-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000005-0000-4000-8000-000000000005', 'receive', 20.00,  2200, NULL, NULL, 'Initial harness stock — 20 units'),
  ('08000005-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000006-0000-4000-8000-000000000005', 'receive', 12.00,  1850, NULL, NULL, 'Initial Jet Black Gloss powder — 12 lb'),
  ('08000006-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000007-0000-4000-8000-000000000005', 'receive', 10.00,  2100, NULL, NULL, 'Initial Satin Bronze Metallic — 10 lb'),
  ('08000007-0000-4000-8000-000000000002', now()-interval'1 year',
   '00000017-0000-4000-8000-000000000005', 'receive', 20.00,   850, NULL, NULL, 'Initial consumables — 20 Scotchbrite packs'),

  -- Usage on delivered jobs
  ('08000008-0000-4000-8000-000000000002', now()-interval'4 months',
   '00000001-0000-4000-8000-000000000005', 'use', -1.00, 69500,
   'c4000007-0000-4000-8000-000000000003', NULL, 'Raptor amber build — S8 30" roof bar'),
  ('08000009-0000-4000-8000-000000000002', now()-interval'4 months',
   '00000005-0000-4000-8000-000000000005', 'use', -2.00, 2200,
   'c4000007-0000-4000-8000-000000000003', NULL, 'Raptor — 2 relay harnesses for amber rig'),
  ('08000010-0000-4000-8000-000000000002', now()-interval'5 months',
   '00000006-0000-4000-8000-000000000005', 'use', -1.50, 1850,
   'c4000008-0000-4000-8000-000000000003', NULL, 'Gladiator 5 wheels — 1.5 lb Jet Black Gloss'),
  ('08000011-0000-4000-8000-000000000002', now()-interval'5 months',
   '00000017-0000-4000-8000-000000000005', 'use', -2.00, 850,
   'c4000008-0000-4000-8000-000000000003', NULL, 'Scotchbrite pads — wheel blast and prep'),
  ('08000012-0000-4000-8000-000000000002', now()-interval'9 months',
   '00000013-0000-4000-8000-000000000005', 'use', -1.00, 4500,
   'c4000012-0000-4000-8000-000000000003', NULL, 'Sierra Denali — full ceramic coat panel application'),
  ('08000013-0000-4000-8000-000000000002', now()-interval'9 months',
   '00000006-0000-4000-8000-000000000005', 'use', -2.00, 1850,
   'c4000012-0000-4000-8000-000000000003', NULL, 'Sierra factory wheels x4 — Jet Black Gloss'),

  -- Restocks
  ('08000014-0000-4000-8000-000000000002', now()-interval'6 weeks',
   '00000001-0000-4000-8000-000000000005', 'receive',  3.00, 69500, NULL, NULL, 'PO-2026-041 receive — 3 units S8 30"'),
  ('08000015-0000-4000-8000-000000000002', now()-interval'6 weeks',
   '00000002-0000-4000-8000-000000000005', 'receive',  2.00, 38500, NULL, NULL, 'PO-2026-041 receive — 2 pairs D-Series Pro'),
  ('08000016-0000-4000-8000-000000000002', now()-interval'6 weeks',
   '00000005-0000-4000-8000-000000000005', 'receive',  5.00, 2200, NULL, NULL, 'PO-2026-041 receive — 5 relay harnesses'),
  ('08000017-0000-4000-8000-000000000002', now()-interval'1 week',
   '00000007-0000-4000-8000-000000000005', 'receive',  5.00, 2100, NULL, NULL, 'PO-2026-058 receive — 5 lb Satin Bronze'),
  ('08000018-0000-4000-8000-000000000002', now()-interval'1 week',
   '00000006-0000-4000-8000-000000000005', 'receive',  5.00, 1850, NULL, NULL, 'PO-2026-058 receive — 5 lb Jet Black Gloss'),

  -- Adjust (damage write-off)
  ('08000019-0000-4000-8000-000000000002', now()-interval'1 month',
   '00000019-0000-4000-8000-000000000005', 'adjust', -1.00, 1200,
   NULL, 'damage', 'Acetone container cracked on shelf — disposed of safely'),

  -- Current in-shop usage
  ('08000020-0000-4000-8000-000000000002', now()-interval'5 days',
   '00000002-0000-4000-8000-000000000005', 'use', -1.00, 38500,
   'c4000003-0000-4000-8000-000000000003', NULL, 'Silverado Phase 2 — D-Series Pro ditch pods'),
  ('08000021-0000-4000-8000-000000000002', now()-interval'5 days',
   '00000005-0000-4000-8000-000000000005', 'use', -1.00, 2200,
   'c4000003-0000-4000-8000-000000000003', NULL, 'Silverado — relay harness for ditch lights'),
  ('08000022-0000-4000-8000-000000000002', now()-interval'8 days',
   '00000010-0000-4000-8000-000000000005', 'use', -2.50, 1950,
   'c4000004-0000-4000-8000-000000000003', NULL, 'Wrangler bumpers + sliders — 2.5 lb Armor Gray Textured'),
  ('08000023-0000-4000-8000-000000000002', now()-interval'8 days',
   '00000017-0000-4000-8000-000000000005', 'use', -1.00, 850,
   'c4000004-0000-4000-8000-000000000003', NULL, 'Scotchbrite pads — Wrangler bumper blast prep')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- COUNT SESSIONS + ENTRIES
-- ──────────────────────────────────────────────────────────────

-- Committed quarterly count
INSERT INTO public.count_sessions
  (id, created_at, updated_at, title, status, location, opened_at, committed_at, notes)
VALUES
  ('01000001-0000-4000-8000-000000000008',
   now()-interval'2 months', now()-interval'2 months',
   'Q2 2026 Full Inventory Count', 'committed', 'All Rooms',
   now()-interval'2 months',
   now()-interval'2 months'+interval'3 hours',
   'Quarterly count, two-person team. Minor consumable variances noted and adjusted.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.count_entries
  (id, created_at, updated_at, session_id, part_id, expected_qty, actual_qty, notes)
VALUES
  ('02000001-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000001-0000-4000-8000-000000000005', 5.00, 5.00, NULL),
  ('02000002-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000002-0000-4000-8000-000000000005', 7.00, 6.00,
   'Off by 1 — likely used on Silverado Phase 2 before ledger entry. Adjusted.'),
  ('02000003-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000003-0000-4000-8000-000000000005', 6.00, 5.00,
   'Short 1 kit — possible mispick on last order.'),
  ('02000004-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000005-0000-4000-8000-000000000005', 15.00, 14.00,
   'Off by 1 — variance within acceptable tolerance.'),
  ('02000005-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000006-0000-4000-8000-000000000005', 9.00, 8.50, NULL),
  ('02000006-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000007-0000-4000-8000-000000000005', 8.00, 8.00, NULL),
  ('02000007-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000013-0000-4000-8000-000000000005', 9.00, 9.00, NULL),
  ('02000008-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000017-0000-4000-8000-000000000005',17.00, 16.00, NULL),
  ('02000009-0000-4000-8000-000000000009', now()-interval'2 months', now()-interval'2 months',
   '01000001-0000-4000-8000-000000000008', '00000021-0000-4000-8000-000000000005', 5.00, 4.00,
   'Used 1 bag mid-count before count was locked. Noted in count notes.')
ON CONFLICT (id) DO NOTHING;

-- In-progress spot check (triggered by Silverado discrepancy)
INSERT INTO public.count_sessions
  (id, created_at, updated_at, title, status, location, opened_at, notes)
VALUES
  ('01000002-0000-4000-8000-000000000008',
   now()-interval'1 day', now()-interval'1 day',
   'Lighting Shelf Spot Check — July', 'in_progress', 'Shelf A (Lighting)',
   now()-interval'1 day',
   'Spot check prompted by D-Series Pro unit discrepancy from Q2 count. Verifying lighting row.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.count_entries
  (id, created_at, updated_at, session_id, part_id, expected_qty, actual_qty, notes)
VALUES
  ('02000010-0000-4000-8000-000000000009', now()-interval'1 day', now()-interval'1 day',
   '01000002-0000-4000-8000-000000000008', '00000001-0000-4000-8000-000000000005', 4.00, 4.00, NULL),
  ('02000011-0000-4000-8000-000000000009', now()-interval'1 day', now()-interval'1 day',
   '01000002-0000-4000-8000-000000000008', '00000002-0000-4000-8000-000000000005', 6.00, 5.00,
   'Still off by 1 pair. Raising discrepancy — checking recent job pulls.'),
  ('02000012-0000-4000-8000-000000000009', now()-interval'1 day', now()-interval'1 day',
   '01000002-0000-4000-8000-000000000008', '00000003-0000-4000-8000-000000000005', 5.00, 5.00, NULL),
  ('02000013-0000-4000-8000-000000000009', now()-interval'1 day', now()-interval'1 day',
   '01000002-0000-4000-8000-000000000008', '00000004-0000-4000-8000-000000000005', 9.00, 9.00, NULL),
  ('02000014-0000-4000-8000-000000000009', now()-interval'1 day', now()-interval'1 day',
   '01000002-0000-4000-8000-000000000008', '00000005-0000-4000-8000-000000000005',12.00,12.00, NULL)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- PURCHASE ORDERS
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.purchase_orders
  (id, created_at, updated_at, po_number, vendor, status, ordered_on, expected_on, received_on, notes)
VALUES
  ('01000001-0000-4000-8000-000000000006',
   now()-interval'6 weeks', now()-interval'5 weeks',
   'PO-2026-041', 'Baja Designs / Rigid Industries', 'received',
   (current_date-42), (current_date-28), (current_date-27),
   'Summer build season restock — S8 bars, D-Series pods, harnesses. All received on time.'),

  ('01000002-0000-4000-8000-000000000006',
   now()-interval'2 weeks', now()-interval'1 week',
   'PO-2026-058', 'Prismatic Powders', 'partial_received',
   (current_date-14), (current_date-5), NULL,
   'Ordered 5 colors. Bronze and Black arrived. White, Red, Gray still in transit.'),

  ('01000003-0000-4000-8000-000000000006',
   now()-interval'3 days', now()-interval'3 days',
   'PO-2026-062', 'Metal Supermarkets', 'sent',
   (current_date-3), (current_date+2), NULL,
   'DOM tubing + plate for Wrangler sliders and upcoming fab jobs. Rush order.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.purchase_order_items
  (id, created_at, updated_at, purchase_order_id, part_id, label, vendor_sku,
   quantity_ordered, quantity_received, unit_cost_cents, notes)
VALUES
  -- PO-2026-041 (received in full)
  ('02000001-0000-4000-8000-000000000006', now()-interval'6 weeks', now()-interval'5 weeks',
   '01000001-0000-4000-8000-000000000006', '00000001-0000-4000-8000-000000000005',
   'Baja Designs S8 LED Light Bar 30"', 'BD-S8-30-WIDE', 3.00, 3.00, 69500, NULL),

  ('02000002-0000-4000-8000-000000000006', now()-interval'6 weeks', now()-interval'5 weeks',
   '01000001-0000-4000-8000-000000000006', '00000002-0000-4000-8000-000000000005',
   'Rigid Industries D-Series Pro Pod (pair)', '110312', 2.00, 2.00, 38500, NULL),

  ('02000003-0000-4000-8000-000000000006', now()-interval'6 weeks', now()-interval'5 weeks',
   '01000001-0000-4000-8000-000000000006', '00000005-0000-4000-8000-000000000005',
   'Relay Wiring Harness 40A', 'LWP-H40A', 5.00, 5.00, 2200, NULL),

  -- PO-2026-058 (partial — Bronze and Black in, rest pending)
  ('02000004-0000-4000-8000-000000000006', now()-interval'2 weeks', now()-interval'1 week',
   '01000002-0000-4000-8000-000000000006', '00000007-0000-4000-8000-000000000005',
   'Powder — Satin Bronze Metallic (1 lb)', 'SBM-1', 5.00, 5.00, 2100, 'Received in full.'),

  ('02000005-0000-4000-8000-000000000006', now()-interval'2 weeks', now()-interval'1 week',
   '01000002-0000-4000-8000-000000000006', '00000006-0000-4000-8000-000000000005',
   'Powder — Jet Black Gloss (1 lb)', 'JBG-1', 5.00, 5.00, 1850, 'Received in full.'),

  ('02000006-0000-4000-8000-000000000006', now()-interval'2 weeks', now()-interval'1 week',
   '01000002-0000-4000-8000-000000000006', '00000008-0000-4000-8000-000000000005',
   'Powder — Flat White Matte (1 lb)', 'FWM-1', 4.00, 0.00, 1800, 'Pending — not yet shipped.'),

  ('02000007-0000-4000-8000-000000000006', now()-interval'2 weeks', now()-interval'1 week',
   '01000002-0000-4000-8000-000000000006', '00000009-0000-4000-8000-000000000005',
   'Powder — Candy Apple Red (1 lb)', 'CAR-1', 3.00, 0.00, 2400, 'Pending — not yet shipped.'),

  ('02000008-0000-4000-8000-000000000006', now()-interval'2 weeks', now()-interval'1 week',
   '01000002-0000-4000-8000-000000000006', '00000010-0000-4000-8000-000000000005',
   'Powder — Armor Gray Textured (1 lb)', 'AGT-1', 4.00, 0.00, 1950, 'Pending — not yet shipped.'),

  -- PO-2026-062 (sent, not received)
  ('02000009-0000-4000-8000-000000000006', now()-interval'3 days', now()-interval'3 days',
   '01000003-0000-4000-8000-000000000006', '00000015-0000-4000-8000-000000000005',
   'DOM Tubing 1.75" x .120" wall — per ft', 'DOM-175-120', 40.00, 0.00, 450,
   'For Wrangler slider build and upcoming fab jobs.'),

  ('02000010-0000-4000-8000-000000000006', now()-interval'3 days', now()-interval'3 days',
   '01000003-0000-4000-8000-000000000006', '00000016-0000-4000-8000-000000000005',
   'Steel Plate 3/16" — 4''x8'' Sheet', 'PLATE-316-48', 2.00, 0.00, 18500,
   'Bumper gussets and skid plate fab.')
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- MESSAGES  (SMS + email, in + out)
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.messages
  (id, created_at, updated_at, customer_id, job_id,
   channel, direction, to_address, from_address, subject, body, template, status, sent_at)
VALUES
  -- Tundra ready — outbound SMS
  ('01000001-0000-4000-8000-000000000010',
   now()-interval'1 day', now()-interval'1 day',
   'a1000006-0000-4000-8000-000000000001', 'c4000006-0000-4000-8000-000000000003',
   'sms', 'out', '+18595550106', '+18595550000', NULL,
   'Hey Kayla! Your Tundra is done and looks INCREDIBLE — stealth black build came out exactly as planned. Ready for pickup anytime this week. Give us a call or swing by!',
   'ready_for_pickup', 'sent', now()-interval'1 day'),

  -- Kayla reply — inbound SMS
  ('01000002-0000-4000-8000-000000000010',
   now()-interval'23 hours', now()-interval'23 hours',
   'a1000006-0000-4000-8000-000000000001', 'c4000006-0000-4000-8000-000000000003',
   'sms', 'in', '+18595550000', '+18595550106', NULL,
   'OMG yes!! I''ll be there tomorrow morning, around 9. I''m so excited!!!',
   NULL, 'sent', now()-interval'23 hours'),

  -- Sierra Denali rock lights ready — outbound SMS
  ('01000003-0000-4000-8000-000000000010',
   now()-interval'2 days', now()-interval'2 days',
   'a1000007-0000-4000-8000-000000000001', 'c4000011-0000-4000-8000-000000000003',
   'sms', 'out', '+18595550107', '+18595550000', NULL,
   'Justin! Your Sierra is ready to roll. All 4 rock light zones wired and tested — solid. Come grab it whenever works for you.',
   'ready_for_pickup', 'sent', now()-interval'2 days'),

  -- Rachel Bowling quote follow-up — outbound email
  ('01000004-0000-4000-8000-000000000010',
   now()-interval'5 days', now()-interval'5 days',
   NULL, NULL,
   'email', 'out', 'rachel.bowling@gmail.com', 'shop@forgedcustoms.com',
   'Your Wrangler Build Quote — Forged Customs',
   E'Hey Rachel,\n\nJust following up on the build quote we sent for your Wrangler Sport S. We included the full Baja S8 lighting package, Armor Gray Textured bumper powder, and the custom slider estimate.\n\nTotal came to $4,850 — happy to adjust the scope if anything doesn''t fit your plans.\n\nWe''re currently booking about 2–3 weeks out. The sooner we hear back, the sooner we can lock in your slot.\n\nThanks for reaching out,\nForged Customs\n(859) 555-0000',
   'quote_nudge', 'sent', now()-interval'5 days'),

  -- Bronco drop-off confirmation — outbound email
  ('01000005-0000-4000-8000-000000000010',
   now()-interval'3 weeks', now()-interval'3 weeks',
   'a1000002-0000-4000-8000-000000000001', 'c4000002-0000-4000-8000-000000000003',
   'email', 'out', 'brittany.hale@outlook.com', 'shop@forgedcustoms.com',
   'Bronco Drop-Off Confirmed',
   E'Hi Brittany,\n\nYou''re all set! Your Bronco Outer Banks is on the schedule for drop-off next week.\n\nWe''ll be blasting and powdering all 5 wheels (including the spare) in Satin Bronze Metallic. Estimated turnaround is 3–4 business days once we have the vehicle.\n\nSee you then — feel free to call or text with any questions.\n\n— Forged Customs',
   'appointment', 'sent', now()-interval'3 weeks'),

  -- Raptor delivery notification — outbound SMS (historical)
  ('01000006-0000-4000-8000-000000000010',
   now()-interval'4 months', now()-interval'4 months',
   'a1000005-0000-4000-8000-000000000001', 'c4000007-0000-4000-8000-000000000003',
   'sms', 'out', '+15025550105', '+18595550000', NULL,
   'Marcus — your Raptor is done! All amber lighting verified compliant. Clean install top to bottom. Come pick it up whenever you''re free.',
   'ready_for_pickup', 'sent', now()-interval'4 months'),

  -- Marcus reply (inbound)
  ('01000007-0000-4000-8000-000000000010',
   now()-interval'4 months'+interval'90 minutes', now()-interval'4 months'+interval'90 minutes',
   'a1000005-0000-4000-8000-000000000001', 'c4000007-0000-4000-8000-000000000003',
   'sms', 'in', '+18595550000', '+15025550105', NULL,
   'Perfect. On my way. Seriously guys, top-notch work every time. Thank you.',
   NULL, 'sent', now()-interval'4 months'+interval'90 minutes'),

  -- Tyler Hatfield quote nudge — outbound email
  ('01000008-0000-4000-8000-000000000010',
   now()-interval'10 days', now()-interval'10 days',
   NULL, NULL,
   'email', 'out', 'tyler.hatfield@outlook.com', 'shop@forgedcustoms.com',
   'Your RAM Rebel LED Quote — Still Available',
   E'Hey Tyler,\n\nWanted to follow up on the LED setup quote we sent over — chase lights rear and a spot bar up top, coming in around $2,200.\n\nLet us know if you have any questions or want to tweak the package. We''re booking a couple weeks out right now so just say the word.\n\nThanks,\nForged Customs',
   'quote_nudge', 'sent', now()-interval'10 days')
ON CONFLICT (id) DO NOTHING;

