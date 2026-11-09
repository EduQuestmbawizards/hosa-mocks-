const fs = require("fs");
const path = require("path");

const questions = [
  // =========================================================================
  // SECTION 1: Profession of CST (5 Questions)
  // =========================================================================
  {
    sort_order: 1,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Which organization is responsible for creating and maintaining the Core Curriculum for Surgical Technology, establishing nationwide educational standards?",
    options: [
      "Association of Surgical Technologists (AST)",
      "National Board of Surgical Technology and Surgical Assisting (NBSTSA)",
      "Commission on Accreditation of Allied Health Education Programs (CAAHEP)",
      "The Joint Commission (TJC)"
    ],
    correct: [0],
    explanation: "The Association of Surgical Technologists (AST) is the professional organization that develops, publishes, and periodically revises the Core Curriculum for Surgical Technology.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 14-16",
    topic: "Professional Organizations",
    difficulty: "medium"
  },
  {
    sort_order: 2,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "A surgical technologist notices a small tear in their sterile glove while draping the patient. Although no one else saw it, the technologist immediately steps away to re-glove. This action demonstrates which ethical principle?",
    options: [
      "Respondeat superior",
      "Surgical conscience",
      "Primum non nocere",
      "Doctrine of borrowed servant"
    ],
    correct: [1],
    explanation: "Surgical conscience is the foundational professional commitment to strictly adhere to aseptic principles and self-report errors or contamination even when not observed by others.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 22",
    topic: "Surgical Conscience",
    difficulty: "easy"
  },
  {
    sort_order: 3,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Under the legal doctrine of 'respondeat superior,' which of the following is true?",
    options: [
      "The surgical technologist is solely liable for all equipment failures in the OR",
      "The employer/hospital may be held legally liable for the negligent actions of its employees within their scope of employment",
      "The patient automatically consents to emergency surgery without signature",
      "The surgeon cannot be questioned regarding instrument counts"
    ],
    correct: [1],
    explanation: "Respondeat superior ('let the master answer') holds an employer legally responsible for wrongful acts committed by an employee within their authorized scope of employment.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 38",
    topic: "Legal Doctrines",
    difficulty: "medium"
  },
  {
    sort_order: 4,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Which credentialing organization administers the national CST (Certified Surgical Technologist) examination?",
    options: [
      "AORN",
      "NBSTSA",
      "ARC/STSA",
      "ASA"
    ],
    correct: [1],
    explanation: "The National Board of Surgical Technology and Surgical Assisting (NBSTSA) is the national certifying agency that administers the CST and CSFA credentialing examinations.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 18",
    topic: "Certification & Credentialing",
    difficulty: "easy"
  },
  {
    sort_order: 5,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "During a surgical count, a Ray-Tec sponge is unaccounted for prior to peritoneal closure. What is the immediate first action the surgical technologist must take?",
    options: [
      "Request an immediate intraoperative X-ray",
      "Notify the surgeon and recount all sponges immediately",
      "Document the loss on the incident log and resume closure",
      "Search the laundry hamper outside the operating room"
    ],
    correct: [1],
    explanation: "Upon discovering an incorrect count, the surgical technologist and circulator must immediately inform the operating surgeon and repeat the count. The field, kick buckets, and table are searched before obtaining radiological imaging.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 312",
    topic: "Surgical Counts",
    difficulty: "medium"
  },

  // =========================================================================
  // SECTION 2: Physical Environment and Safety Standards (5 Questions)
  // =========================================================================
  {
    sort_order: 6,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "According to standard OR regulatory guidelines, what is the required relative humidity range in the operating room to inhibit microbial growth and prevent electrostatic spark discharge?",
    options: [
      "10% to 20%",
      "20% to 60%",
      "65% to 80%",
      "80% to 95%"
    ],
    correct: [1],
    explanation: "The recommended relative humidity in the operating suite is 20% to 60% (ANSI/ASHRAE/ASHE standards). Humidity below 20% increases static spark fire risk, while humidity above 60% promotes bacterial growth.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 88",
    topic: "OR Environmental Controls",
    difficulty: "medium"
  },
  {
    sort_order: 7,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Why are operating rooms maintained under positive air pressure relative to surrounding hallways and sub-sterile rooms?",
    options: [
      "To prevent anesthetic gases from entering patient rooms",
      "To force airborne contaminants out of the OR when doors are opened",
      "To reduce humidity inside the sterile core",
      "To maintain warmer temperatures for the patient"
    ],
    correct: [1],
    explanation: "Positive air pressure ensures that when doors open, air rushes out of the operating room into corridors, preventing corridor airborne dust and microorganisms from entering the sterile surgical suite.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 90",
    topic: "Ventilation & Positive Airflow",
    difficulty: "easy"
  },
  {
    sort_order: 8,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which type of surgical mask must all operative personnel wear when using a CO2 or Nd:YAG laser in the surgical suite?",
    options: [
      "Standard duckbill procedural paper mask",
      "High-filtration particulate mask with side shielding",
      "Surgical cloth face covering",
      "Clear plastic fluid shield without filter"
    ],
    correct: [1],
    explanation: "Laser smoke plume contains hazardous cellular debris, mutagenic viral particles, and carcinogens. Personnel must wear high-filtration laser masks filtering particles down to 0.1 microns.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 104",
    topic: "Laser Safety",
    difficulty: "medium"
  },
  {
    sort_order: 9,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "In the surgical suite fire safety acronym 'RACE', what does the letter 'A' represent?",
    options: [
      "Apply sterile water to drapes",
      "Alarm or alert personnel and activate emergency pull stations",
      "Assess the depth of burn injury",
      "Assemble evacuation team"
    ],
    correct: [1],
    explanation: "RACE stands for: R = Rescue/Remove patient, A = Alert/Alarm (pull fire alarm & call code red), C = Confine/Contain the fire, E = Extinguish/Evacuate.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 112",
    topic: "OR Fire Safety",
    difficulty: "easy"
  },
  {
    sort_order: 10,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What are the three fundamental cardinal principles of radiation protection (ALARA) used by the surgical technologist during C-arm fluoroscopy?",
    options: [
      "Voltage, current, and pulse rate",
      "Time, distance, and shielding",
      "Collimation, magnification, and filtration",
      "Dosimeter, lead glass, and thyroid collar"
    ],
    correct: [1],
    explanation: "The three cardinal safety principles for radiation safety are: minimizing exposure Time, maximizing Distance from the radiation source (inverse-square law), and utilizing lead Shielding (aprons/thyroid shields).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 108",
    topic: "Radiation Safety",
    difficulty: "easy"
  },

  // =========================================================================
  // SECTION 3: Surgical Asepsis and Sterility (10 Questions)
  // =========================================================================
  {
    sort_order: 11,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What is the recognized non-sterile safety border margin along the outer perimeter of a sterile drape or wrapper once opened on a back table?",
    options: [
      "1/4 inch",
      "1/2 inch",
      "1 inch",
      "2 inches"
    ],
    correct: [2],
    explanation: "By standard AST and AORN surgical guidelines, the outer 1-inch border of an opened sterile field wrapper or table cover is considered contaminated and non-sterile.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 182",
    topic: "Sterile Field Margins",
    difficulty: "easy"
  },
  {
    sort_order: 12,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "Which biological indicator organism is specifically used to verify spore kill in dynamic-air-removal (pre-vacuum) steam autoclaves?",
    options: [
      "Bacillus atrophaeus",
      "Geobacillus stearothermophilus",
      "Clostridium perfringens",
      "Staphylococcus aureus"
    ],
    correct: [1],
    explanation: "Geobacillus stearothermophilus spores are highly heat-resistant and are the standard biological indicator used to monitor steam sterilization cycles.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 210",
    topic: "Biological Indicators",
    difficulty: "medium"
  },
  {
    sort_order: 13,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What is the primary function of the daily Bowie-Dick (DART) test performed on pre-vacuum steam sterilizers?",
    options: [
      "To test for viable endospores",
      "To verify air removal and detect air leaks in the vacuum chamber",
      "To test the water hardness of boiler feedlines",
      "To measure chamber temperature uniformity"
    ],
    correct: [1],
    explanation: "The Bowie-Dick test is performed daily before the first dynamic air-removal cycle to ensure all residual air has been effectively evacuated from the chamber, preventing cold air pockets.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 214",
    topic: "Bowie-Dick Test",
    difficulty: "medium"
  },
  {
    sort_order: 14,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What are the standard time, temperature, and pressure parameters for immediate-use steam sterilization (IUSS / flash) of unwrapped, non-porous metal instruments with no lumens in a pre-vacuum sterilizer?",
    options: [
      "250°F (121°C) at 15 psi for 30 minutes",
      "270°F (132°C) at 27-30 psi for 3 minutes",
      "270°F (132°C) at 15 psi for 10 minutes",
      "320°F (160°C) at 45 psi for 1 minute"
    ],
    correct: [1],
    explanation: "In a dynamic air-removal (pre-vacuum) sterilizer, unwrapped non-porous items with no lumens require exposure at 270°F to 275°F (132°C–135°C) at 27–30 psi for a minimum of 3 minutes.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 202",
    topic: "Steam Sterilization Parameters",
    difficulty: "medium"
  },
  {
    sort_order: 15,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "When two sterile team members pass each other in the sterile field, how must they position their bodies to prevent accidental contamination?",
    options: [
      "Back-to-back or front-to-front",
      "Right side to left side with arms extended",
      "One member ducking beneath the other",
      "Sideways at an arm's length"
    ],
    correct: [0],
    explanation: "Sterile surgical team members must always pass each other either back-to-back (non-sterile back to non-sterile back) or face-to-face (sterile front to sterile front) while keeping hands folded at chest level.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 186",
    topic: "Aseptic Technique in OR",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "Which gas sterilization method requires an extensive mandatory aeration cycle of 8 to 12 hours due to toxic, mutagenic residue absorption into plastic and rubber tubing?",
    options: [
      "Hydrogen peroxide gas plasma (STERRAD)",
      "Ethylene oxide (EtO)",
      "Peracetic acid (Steris)",
      "Glutaraldehyde liquid chemical immersion"
    ],
    correct: [1],
    explanation: "Ethylene oxide (EtO) is toxic, carcinogenic, and mutagenic. It requires extensive aeration (8-12 hours at 50-60°C) to off-gas residual EtO from porous materials before patient use.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 218",
    topic: "Ethylene Oxide Sterilization",
    difficulty: "medium"
  },
  {
    sort_order: 17,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "Which area of a sterile surgical gown is considered sterile once donned?",
    options: [
      "The entire gown from neckline to hem, including the back",
      "From chest level to the level of the sterile field, and sleeves from 2 inches above the elbow to the cuff",
      "From waist level down to the shoes and all sleeve surfaces",
      "The front of the gown only up to the chin"
    ],
    correct: [1],
    explanation: "The sterile area of a gown is strictly limited to the front from the chest (mid-chest/nipple line) down to the level of the sterile field/operating table, and the sleeves from 2 inches above the elbow to the cuff neckline/stockinette cuff.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 184",
    topic: "Gown Sterility Boundaries",
    difficulty: "easy"
  },
  {
    sort_order: 18,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What is the modern concept of sterility maintenance for packaged sterile supplies?",
    options: [
      "Time-related: all items expire precisely 30 days after autoclaving",
      "Event-related: items remain sterile indefinitely unless package integrity is compromised or opened",
      "Location-related: items must remain inside the main autoclave chamber until the case starts",
      "Lot-related: items expire when the master chemical indicator sheet changes color"
    ],
    correct: [1],
    explanation: "Event-related sterility states that a sterile package remains sterile unless an event occurs (such as tearing, puncture, moisture contamination/strike-through, or broken seals) compromising barrier integrity.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 226",
    topic: "Event-Related Sterility",
    difficulty: "easy"
  },
  {
    sort_order: 19,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "When opening a sterile envelope-wrapped instrument tray on a back table, which fold is opened first?",
    options: [
      "The flap closest to the surgical technologist",
      "The right lateral flap",
      "The uppermost flap furthest away from the body",
      "The left lateral flap"
    ],
    correct: [2],
    explanation: "The first flap opened must always be the one furthest away from the body (opening away from you), followed by lateral flaps, and the flap closest to the body is opened last to avoid reaching over an uncovered sterile field.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 192",
    topic: "Opening Sterile Supplies",
    difficulty: "medium"
  },
  {
    sort_order: 20,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "During the traditional surgical hand scrub using the timed or counted stroke method, how should fingers, hands, and arms be washed?",
    options: [
      "Distal to proximal: from fingertips working down to 2 inches above the elbow, keeping hands elevated above elbows",
      "Proximal to distal: starting at elbows down to fingertips with hands pointed downward",
      "Hands and arms submerged together in an antiseptic basin",
      "Palms first, then elbows, ending at fingertips"
    ],
    correct: [0],
    explanation: "Scrubbing proceeds from cleanest area (fingertips) to dirtiest area (elbows), scrubbing all 4 planes of each finger, hand, forearm, and ending 2 inches above the elbow, keeping hands held higher than elbows at all times.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 178",
    topic: "Surgical Hand Scrub",
    difficulty: "easy"
  },

  // =========================================================================
  // SECTION 4: Instrumentation, Equipment, and Supplies (15 Questions)
  // =========================================================================
  {
    sort_order: 21,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which scalpel blade size is most commonly mounted on a #3 scalpel handle for creating standard skin incisions in abdominal laparotomy?",
    options: [
      "#10 blade",
      "#11 blade",
      "#12 blade",
      "#20 blade"
    ],
    correct: [0],
    explanation: "A #10 curved blade loaded on a #3 handle is the standard choice for initial adult laparotomy skin incisions. (#11 is used for puncture/stab incisions, #12 for tonsillectomy/ENT, #20 fits a #4 handle).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 344",
    topic: "Scalpels & Blades",
    difficulty: "easy"
  },
  {
    sort_order: 22,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which curved scissor features delicate tips specifically designed for dissecting fine, friable visceral tissue and peritoneum?",
    options: [
      "Curved Mayo scissors",
      "Metzenbaum scissors",
      "Lister bandage scissors",
      "Straight suture scissors"
    ],
    correct: [1],
    explanation: "Metzenbaum scissors are longer and more delicate, designed strictly for blunt and sharp dissection of delicate visceral and soft tissue. (Mayo scissors are heavy and used on tough fascia).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 348",
    topic: "Surgical Scissors",
    difficulty: "easy"
  },
  {
    sort_order: 23,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which traumatic vascular/tissue clamp features 1x2 or 2x3 sharp interlocking teeth at the jaws and is designed to securely grasp tough, fibrous fascia?",
    options: [
      "Babcock clamp",
      "Allis clamp",
      "Kocher (Ochsner) clamp",
      "Halsted mosquito clamp"
    ],
    correct: [2],
    explanation: "The Kocher (Ochsner) clamp has heavy transversal serrations with sharp interlocking teeth at the tip, designed to aggressively grasp tough, slippery tissues like fascia and bone fragments.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 352",
    topic: "Grasping Clamps",
    difficulty: "medium"
  },
  {
    sort_order: 24,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which atraumatic grasping instrument with smooth, loop-shaped fenestrated jaws is specifically selected to hold delicate tubular structures like the appendix or fallopian tube?",
    options: [
      "Allis tissue forceps",
      "Babcock intestinal forceps",
      "Tenaculum",
      "Backhaus towel clamp"
    ],
    correct: [1],
    explanation: "Babcock clamps feature broad, flared, fenestrated jaws with no sharp teeth, allowing secure handling of delicate hollow organs (appendix, fallopian tubes, ureters) without crushing tissue.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 354",
    topic: "Atraumatic Clamps",
    difficulty: "easy"
  },
  {
    sort_order: 25,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which self-retaining abdominal retractor uses bilateral curved blades and an interchangeable central bladder blade for major open pelvic or lower abdominal surgery?",
    options: [
      "Weitlaner retractor",
      "Gelpi retractor",
      "Balfour retractor",
      "Army-Navy retractor"
    ],
    correct: [2],
    explanation: "The Balfour retractor is a deep, self-retaining abdominal retractor equipped with lateral adjustable blades and a detachable suprapubic bladder blade for deep pelvic exposure.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 362",
    topic: "Self-Retaining Retractors",
    difficulty: "medium"
  },
  {
    sort_order: 26,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which suction tip has a perforated outer sheath designed to prevent the omentum or bowel from being sucked into the lumen during abdominal laparotomy?",
    options: [
      "Yankauer suction tip",
      "Frazier suction tip",
      "Poole suction tip",
      "Baron suction tip"
    ],
    correct: [2],
    explanation: "The Poole suction tip has a removable perforated outer guard sleeve that disperses suction force across dozens of holes, preventing soft visceral tissue (omentum/bowel) from occlusion and trauma.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 366",
    topic: "Surgical Suction Tips",
    difficulty: "easy"
  },
  {
    sort_order: 27,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Where should the electrosurgical dispersive patient return electrode (grounding pad) be placed on a patient undergoing surgery with a monopolar ESU pencil?",
    options: [
      "Over a prominent bony landmark such as the iliac crest",
      "Over clean, dry, well-vascularized large muscle mass (such as the thigh)",
      "Directly over a surgical scar or metallic joint replacement",
      "Underneath the patient's heels"
    ],
    correct: [1],
    explanation: "The dispersive pad must be placed over a large, clean, well-vascularized muscle mass (e.g., anterolateral thigh) with full skin contact. Never place over bony prominences, hair, scar tissue, or metal implants.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 326",
    topic: "Electrosurgery Safety",
    difficulty: "easy"
  },
  {
    sort_order: 28,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which type of suture is classified as synthetic, absorbable, braided, and known by the trade name Vicryl?",
    options: [
      "Polyglactin 910",
      "Polydioxanone (PDS)",
      "Polypropylene (Prolene)",
      "Polyglyconate (Maxon)"
    ],
    correct: [0],
    explanation: "Polyglactin 910 is marketed under the brand name Vicryl. It is a synthetic, braided, absorbable suture widely used for soft tissue approximation.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 388",
    topic: "Suture Materials",
    difficulty: "medium"
  },
  {
    sort_order: 29,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which non-absorbable monofilament suture is the material of choice for vascular anastomoses due to its high tensile strength and minimal tissue drag?",
    options: [
      "Surgical silk",
      "Chromic surgical gut",
      "Polypropylene (Prolene)",
      "Polyglactin 910 (Vicryl)"
    ],
    correct: [2],
    explanation: "Polypropylene (Prolene) is inert, monofilament, smooth, non-absorbable, and holds knots securely, making it the premier choice for cardiovascular and peripheral vascular anastomoses.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 392",
    topic: "Vascular Sutures",
    difficulty: "easy"
  },
  {
    sort_order: 30,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which needle point style is specifically designed to penetrate delicate parenchyma (such as the liver or kidney) without cutting into fragile capillaries?",
    options: [
      "Reverse cutting needle",
      "Conventional cutting needle",
      "Blunt taper needle",
      "Trocar needle point"
    ],
    correct: [2],
    explanation: "Blunt point needles push tissue fibers aside rather than piercing or slicing them, preventing needle-puncture hemorrhage in friable organs like the liver, spleen, and kidneys.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 402",
    topic: "Surgical Needles",
    difficulty: "medium"
  },
  {
    sort_order: 31,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What is the function of an insufflator during diagnostic and operative laparoscopy?",
    options: [
      "Delivers sterile irrigation fluid under pulsatile pressure",
      "Instills medical-grade CO2 gas into the peritoneal cavity to create a pneumoperitoneum",
      "Evacuates blood through a closed drainage cannula",
      "Warms the operating table blanket"
    ],
    correct: [1],
    explanation: "The electronic carbon dioxide insufflator regulates pressure, flow rate, and volume of CO2 gas into the abdominal cavity, lifting the abdominal wall to establish operative working room (pneumoperitoneum).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 13, pg 432",
    topic: "Laparoscopic Equipment",
    difficulty: "easy"
  },
  {
    sort_order: 32,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which type of non-retaining urinary drainage catheter has a straight tip with a single eye and is used exclusively for one-time bladder decompression (in-and-out)?",
    options: [
      "Foley retention catheter",
      "Robinson (red rubber) catheter",
      "Malecot catheter",
      "Pezzer mushroom catheter"
    ],
    correct: [1],
    explanation: "The Robinson (plain red rubber) catheter is a straight single-lumen catheter without a balloon, utilized for immediate pre-operative bladder drainage before trocar placement or pelvic surgery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 304",
    topic: "Catheters & Tubes",
    difficulty: "easy"
  },
  {
    sort_order: 33,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "During a microvascular or neurosurgical procedure, which type of electrosurgery is required because it uses no grounding pad and confines thermal energy strictly between its two tines?",
    options: [
      "Monopolar coagulating mode",
      "Bipolar electrosurgery",
      "Harmonic scalpel",
      "Radiofrequency ablation"
    ],
    correct: [1],
    explanation: "Bipolar electrosurgery passes current exclusively between the two active tips of the forceps, eliminating the need for a patient dispersive pad and avoiding stray electrical damage in delicate neural or vascular structures.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 328",
    topic: "Bipolar Electrosurgery",
    difficulty: "easy"
  },
  {
    sort_order: 34,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which surgical sponge is radiopaque, packaged in bundles of 10, and used specifically during open abdominal procedures for packing viscera and absorbing large volumes of blood?",
    options: [
      "Ray-Tec (4x4) sponge",
      "Laparotomy (lap / tape) sponge",
      "Cottonoid neuro patty",
      "Kittner dissector"
    ],
    correct: [1],
    explanation: "Laparotomy sponges (lap sponges/tapes) come in packs of 5, are radiopaque with a sewn-in blue loop, and are used for deep cavity absorption and retraction of abdominal viscera.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 310",
    topic: "Surgical Sponges",
    difficulty: "easy"
  },
  {
    sort_order: 35,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "When testing surgical scissors for sharpness, Metzenbaum dissecting scissors should smoothly cut through which test material to the very tip?",
    options: [
      "Single layer of red rubber sheet",
      "Single layer of wet facial tissue",
      "Double layer of sterile glove latex (yellow test material)",
      "Standard index card stock"
    ],
    correct: [2],
    explanation: "Metzenbaum and delicate tissue scissors are inspected by cutting through yellow silicone/latex test material (0.01-inch thickness), cutting cleanly without snagging or pushing material to the tip.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 370",
    topic: "Instrument Inspection",
    difficulty: "hard"
  },

  // =========================================================================
  // SECTION 5: Hemostasis, Wound Healing, and Wound Closure (5 Questions)
  // =========================================================================
  {
    sort_order: 36,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which topical chemical hemostatic agent is prepared from purified bovine collagen and must be applied completely dry with dry instruments because it sticks tenaciously to wet gloves?",
    options: [
      "Microfibrillar collagen (Avitene)",
      "Oxidized regenerated cellulose (Surgicel)",
      "Absorbable gelatin sponge (Gelfoam)",
      "Silver nitrate stick"
    ],
    correct: [0],
    explanation: "Avitene (microfibrillar collagen hemostat) triggers rapid platelet aggregation. It must be kept bone dry prior to placement, handling only with completely dry forceps to prevent it from sticking to the instrument.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 382",
    topic: "Topical Hemostats",
    difficulty: "medium"
  },
  {
    sort_order: 37,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What mechanical hemostatic agent made from refined beeswax is warmed and molded by the surgical technologist to occlude bleeding vessels in cancellous bone during craniotomy or sternotomy?",
    options: [
      "Bone wax",
      "Methyl methacrylate",
      "Surgifoam",
      "Calcium chloride"
    ],
    correct: [0],
    explanation: "Bone wax (refined beeswax with softening agents) is rolled into small pea-sized balls and applied directly onto bleeding cut bone edges to physically plug marrow canals.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 380",
    topic: "Mechanical Hemostasis",
    difficulty: "easy"
  },
  {
    sort_order: 38,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the initial phase of wound healing that begins at the moment of injury and lasts approximately 1 to 4 days, characterized by vasoconstriction, clotting, and leukocyte migration?",
    options: [
      "Inflammatory (lag) phase",
      "Proliferation phase",
      "Remodeling (maturation) phase",
      "Fibroblastic phase"
    ],
    correct: [0],
    explanation: "The Inflammatory (or lag) phase lasts from day 1 to day 4-5. It is dominated by hemostasis, edema, erythema, and phagocytosis by neutrophils and macrophages clearing cellular debris.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 412",
    topic: "Wound Healing Phases",
    difficulty: "medium"
  },
  {
    sort_order: 39,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "A surgical wound that is left open to heal from the bottom up by formation of granulation tissue, wound contraction, and epithelialization is healing by:",
    options: [
      "First intention (primary union)",
      "Second intention (granulation)",
      "Third intention (delayed primary closure)",
      "Fourth intention"
    ],
    correct: [1],
    explanation: "Second intention (granulation) occurs when extensive tissue loss, infection, or necrosis prevents approximation of wound edges. The wound cavity fills from the base with vascular granulation tissue.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 416",
    topic: "Healing by Intention",
    difficulty: "easy"
  },
  {
    sort_order: 40,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "According to CDC surgical wound classifications, what is the classification of an elective cholecystectomy where the gallbladder was successfully removed without bile spillage and no infection was present?",
    options: [
      "Class I: Clean",
      "Class II: Clean-Contaminated",
      "Class III: Contaminated",
      "Class IV: Dirty / Infected"
    ],
    correct: [1],
    explanation: "Class II (Clean-Contaminated) wounds occur when an operative tract (respiratory, alimentary, genital, or urinary tract) is entered under controlled conditions without unusual contamination or gross spillage.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 420",
    topic: "Wound Classification",
    difficulty: "medium"
  },

  // =========================================================================
  // SECTION 6: Surgical Anatomy & Physiology (10 Questions)
  // =========================================================================
  {
    sort_order: 41,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In which anatomical abdominal quadrant is the gallbladder located?",
    options: [
      "Left upper quadrant (LUQ)",
      "Right upper quadrant (RUQ)",
      "Left lower quadrant (LLQ)",
      "Right lower quadrant (RLQ)"
    ],
    correct: [1],
    explanation: "The gallbladder sits in a fossa on the visceral inferior surface of the liver located in the Right Upper Quadrant (RUQ).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 498",
    topic: "Abdominal Topography",
    difficulty: "easy"
  },
  {
    sort_order: 42,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What three anatomical structures form the critical boundaries of Calot's triangle (hepatobiliary triangle), which must be clearly dissected during cholecystectomy?",
    options: [
      "Cystic duct, common hepatic duct, and inferior edge of the liver",
      "Common bile duct, pancreatic duct, and duodenum",
      "Portal vein, hepatic artery, and celiac trunk",
      "Falciform ligament, ligamentum teres, and gallbladder neck"
    ],
    correct: [0],
    explanation: "Calot's triangle is bounded medially by the common hepatic duct, inferiorly by the cystic duct, and superiorly by the visceral surface/inferior border of the liver. The cystic artery traverses this triangle.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 504",
    topic: "Biliary Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 43,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "When making a midline abdominal incision from xiphoid to pubis, which fibrous, avascular anatomical structure is incised between the bilateral rectus abdominis muscle bellies?",
    options: [
      "Linea alba",
      "Scarpa's fascia",
      "Ligament of Treitz",
      "Inguinal ligament"
    ],
    correct: [0],
    explanation: "The linea alba is a dense, fibrous band formed by the confluence of the abdominal aponeuroses down the anterior midline between the rectus abdominis muscles.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 472",
    topic: "Abdominal Wall Layers",
    difficulty: "easy"
  },
  {
    sort_order: 44,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "A patient presents with acute appendicitis. Tenderness and surgical incision for open appendectomy are typically localized at McBurney's point, which is located:",
    options: [
      "Two inches superior to the umbilicus in the midline",
      "One-third the distance along an imaginary line from the right anterior superior iliac spine (ASIS) to the umbilicus",
      "Midway between the xiphoid process and the costal margin",
      "Directly over the pubic symphysis"
    ],
    correct: [1],
    explanation: "McBurney's point is situated approximately one-third of the distance along the line drawn from the right anterior superior iliac spine (ASIS) to the umbilicus, corresponding to the base of the appendix.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 488",
    topic: "Gastrointestinal Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 45,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In an indirect inguinal hernia, where does the peritoneal hernia sac protrude relative to the inferior epigastric vessels?",
    options: [
      "Medial to the inferior epigastric vessels through Hesselbach's triangle",
      "Lateral to the inferior epigastric vessels through the deep (internal) inguinal ring",
      "Directly through the femoral canal below the inguinal ligament",
      "Through the obturator foramen"
    ],
    correct: [1],
    explanation: "An indirect inguinal hernia leaves the abdominal cavity lateral to the inferior epigastric vessels by passing through the internal (deep) inguinal ring into the inguinal canal. (Direct hernias occur medial to these vessels inside Hesselbach's triangle).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 480",
    topic: "Hernia Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 46,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What are the three anatomical boundaries of Hesselbach's triangle where direct inguinal hernias occur?",
    options: [
      "Inferior epigastric vessels, rectus abdominis muscle border, and inguinal (Poupart's) ligament",
      "Femoral vein, lacunar ligament, and pectineal ligament",
      "Internal ring, external ring, and spermatic cord",
      "Sartorius muscle, adductor longus, and inguinal ligament"
    ],
    correct: [0],
    explanation: "Hesselbach's triangle is defined superolaterally by the inferior epigastric vessels, medially by the lateral edge of the rectus abdominis muscle, and inferiorly by the inguinal ligament.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 482",
    topic: "Hesselbach's Triangle",
    difficulty: "medium"
  },
  {
    sort_order: 47,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During a total abdominal hysterectomy, which ligament containing the uterine artery and vein must be carefully identified, clamped, and ligated to avoid life-threatening hemorrhage?",
    options: [
      "Round ligament",
      "Cardinal (Mackenrodt's) ligament",
      "Ovarian ligament",
      "Infundibulopelvic ligament"
    ],
    correct: [1],
    explanation: "The cardinal (transverse cervical or Mackenrodt's) ligaments provide primary lateral pelvic support to the cervix and uterus and carry the uterine blood vessels, requiring precise ligation.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 18, pg 542",
    topic: "Pelvic & Gynecologic Anatomy",
    difficulty: "hard"
  },
  {
    sort_order: 48,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which major vein is the longest vein in the human body, running subcutaneously from the medial foot up to the femoral vein in the groin, and frequently harvested for coronary artery bypass graft (CABG)?",
    options: [
      "Small saphenous vein",
      "Great saphenous vein",
      "Cephalic vein",
      "Basilic vein"
    ],
    correct: [1],
    explanation: "The great (greater) saphenous vein originates on the dorsum of the foot, ascends anterior to the medial malleolus, passes up the medial leg and thigh, and drains into the common femoral vein at the fossa ovalis.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 624",
    topic: "Vascular Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 49,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the dense fibrous connective tissue capsule that completely envelops the kidney, adrenal gland, and perirenal fat pad?",
    options: [
      "Glisson's capsule",
      "Gerota's fascia (renal fascia)",
      "Buck's fascia",
      "Tenon's capsule"
    ],
    correct: [1],
    explanation: "Gerota's fascia (renal fascia) is the strong fibrous membrane enclosing the kidney, perinephric fat, and suprarenal (adrenal) gland, anchoring them to the posterior abdominal wall.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 19, pg 576",
    topic: "Genitourinary Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 50,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which heart valve prevents backflow of oxygenated blood from the left ventricle into the left atrium during ventricular systole?",
    options: [
      "Tricuspid valve",
      "Pulmonary semilunar valve",
      "Aortic semilunar valve",
      "Bicuspid (mitral) valve"
    ],
    correct: [3],
    explanation: "The bicuspid (mitral) valve has two cusps and guards the left atrioventricular orifice, closing during ventricular contraction (systole) to prevent blood from regurgitating into the left atrium.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 22, pg 658",
    topic: "Cardiothoracic Anatomy",
    difficulty: "easy"
  }
];

const mock1Data = {
  test_slug: "st-mock-1",
  test_meta: {
    title: "ST – Free Diagnostic Mock 1 (Official Blueprint)",
    event: "ST",
    kind: "mock",
    total_questions: 50,
    duration_min: 60,
    instant_feedback: false,
    is_free: true,
    shuffle_questions: false,
    category_counts: {
      "Profession of CST": 5,
      "Physical Environment and Safety Standards": 5,
      "Surgical Asepsis and Sterility": 10,
      "Instrumentation, Equipment, and Supplies": 15,
      "Hemostasis, Wound Healing, and Wound Closure": 5,
      "Surgical Anatomy & Physiology": 10
    }
  },
  questions: questions
};

const targetPath = path.resolve(process.cwd(), "data", "st-mock-1-50q.json");
fs.writeFileSync(targetPath, JSON.stringify(mock1Data, null, 2), "utf-8");
console.log(`Generated st-mock-1-50q.json with ${questions.length} questions.`);

