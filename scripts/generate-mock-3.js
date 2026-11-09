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
    stem: "In what year was the Association of Operating Room Technicians (AORT) formally created, which later changed its name in 1978 to the Association of Surgical Technologists (AST)?",
    options: ["1955", "1969", "1985", "1992"],
    correct: [1],
    explanation: "AORT was established in 1969 under the auspices of AORN, and later became the independent Association of Surgical Technologists (AST) in 1978.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 12",
    topic: "History of AST",
    difficulty: "medium"
  },
  {
    sort_order: 2,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Under the legal doctrine of 'res ipsa loquitur', which scenario in the operating room would most clearly apply?",
    options: [
      "A patient develops an unavoidable wound infection from normal skin flora",
      "A laparotomy sponge is unintentionally left inside the patient's peritoneal cavity",
      "The surgeon elects to use an alternative suture size during an emergency",
      "A patient experiences an allergic reaction to a drug with no documented allergy history"
    ],
    correct: [1],
    explanation: "Res ipsa loquitur ('the thing speaks for itself') applies when injury occurs that normally would not happen without negligence, such as a retained surgical instrument or sponge.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 36",
    topic: "Legal Doctrines",
    difficulty: "easy"
  },
  {
    sort_order: 3,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Which allied health committee reviews and evaluates surgical technology education programs according to national accreditation standards set by CAAHEP?",
    options: ["ARC/STSA", "NBSTSA", "OSHA", "TJC"],
    correct: [0],
    explanation: "The Accreditation Review Council on Education in Surgical Technology and Surgical Assisting (ARC/STSA) directly evaluates educational programs under CAAHEP accreditation standards.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 17",
    topic: "Accreditation Agencies",
    difficulty: "medium"
  },
  {
    sort_order: 4,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "A CST accidentally drops a contaminated instrument into an open sterile basin on the back table. What is the mandatory ethical and professional response?",
    options: [
      "Remove only the dropped instrument and continue the procedure",
      "Spray the basin with alcohol solution and wipe it with a sterile towel",
      "Break down the entire contaminated table, inform the surgical team, and set up a fresh sterile table",
      "Cover the basin with a blue drape and proceed"
    ],
    correct: [2],
    explanation: "Strict surgical conscience demands that contamination is acknowledged immediately. Once a sterile basin or table is contaminated, the entire field is compromised and must be replaced completely.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 24",
    topic: "Surgical Conscience",
    difficulty: "medium"
  },
  {
    sort_order: 5,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Who is legally authorized to sign an operative informed consent form on behalf of an unconscious adult trauma patient when no legal surrogate or family is reachable and immediate surgery is required to save life or limb?",
    options: [
      "The surgical technologist and circulator together",
      "Two consulting physicians under the doctrine of implied consent (emergency exception)",
      "The hospital administrator on call",
      "The operating room charge nurse"
    ],
    correct: [1],
    explanation: "Under emergency implied consent doctrine, when a patient is unable to consent and delay would threaten life or limb, surgery may proceed with documented concurrence of two physicians.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 42",
    topic: "Informed Consent",
    difficulty: "medium"
  },

  // =========================================================================
  // SECTION 2: Physical Environment and Safety Standards (5 Questions)
  // =========================================================================
  {
    sort_order: 6,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the recommended ambient room temperature range for a standard operating room suite according to ANSI/ASHRAE/ASHE standards?",
    options: ["58°F to 62°F", "68°F to 73°F (20°C to 23°C)", "75°F to 80°F", "82°F to 86°F"],
    correct: [1],
    explanation: "The standard OR temperature range is 68°F to 73°F (20°C to 23°C). Pediatric and burn cases are exceptions where temperatures are elevated to prevent hypothermia.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 89",
    topic: "OR Environmental Controls",
    difficulty: "easy"
  },
  {
    sort_order: 7,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "How many total air exchanges per hour (ACH) are required in the operating room, and how many of those must be fresh outdoor air?",
    options: [
      "Minimum 10 total ACH with 1 outdoor air exchange",
      "Minimum 20 total ACH with at least 4 outdoor air exchanges",
      "Minimum 30 total ACH with 15 outdoor air exchanges",
      "Minimum 5 total ACH with 0 outdoor air exchanges"
    ],
    correct: [1],
    explanation: "Standard regulatory codes mandate a minimum of 20 total air changes per hour (ACH) in the OR, with at least 4 being fresh outside air exchanges through HEPA filtration.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 91",
    topic: "OR Ventilation Systems",
    difficulty: "hard"
  },
  {
    sort_order: 8,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which class of fire extinguisher is specifically designed for surgical electrical fires involving electrosurgical units, monitors, and light sources?",
    options: ["Class A (water/foam)", "Class B (dry powder/oil)", "Class C (carbon dioxide / halon / clean agent)", "Class D (combustible metals)"],
    correct: [2],
    explanation: "Class C fire extinguishers use non-conductive clean agents (CO2 or Halon replacement) specifically formulated to extinguish energized electrical equipment without electrocution hazard.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 114",
    topic: "Fire Safety Classes",
    difficulty: "easy"
  },
  {
    sort_order: 9,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the primary danger associated with methyl methacrylate (bone cement) vapor exposure to surgical personnel during total joint arthroplasty?",
    options: [
      "Transient hypotensive reactions, headache, eye/airway irritation, and central nervous system depression",
      "Immediate hypothermia and shivering",
      "Anaphylactoid bronchospasm in 100% of exposed staff",
      "Permanent acoustic hearing loss"
    ],
    correct: [0],
    explanation: "Methyl methacrylate vapors cause eye/respiratory mucous membrane irritation, headache, dizziness, nausea, and can induce transient hypotension and vasodilation in exposed individuals.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 106",
    topic: "Chemical Safety",
    difficulty: "medium"
  },
  {
    sort_order: 10,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which zone of the surgical suite strictly requires personnel to wear full surgical attire (scrub suit, hair covering, and mask) when entering?",
    options: ["Unrestricted area", "Semi-restricted area", "Restricted area", "Pre-op holding area"],
    correct: [2],
    explanation: "The Restricted Area (operating rooms, clean core, sterile scrub sinks) requires full surgical attire including scrub suit, head covering, and surgical mask.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 86",
    topic: "Surgical Suite Zoning",
    difficulty: "easy"
  },

  // =========================================================================
  // SECTION 3: Surgical Asepsis and Sterility (10 Questions)
  // =========================================================================
  {
    sort_order: 11,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "Which microbial endospore test organism is utilized as the biological indicator for monitoring Ethylene Oxide (EtO) gas and dry heat sterilization?",
    options: [
      "Geobacillus stearothermophilus",
      "Bacillus atrophaeus",
      "Pseudomonas aeruginosa",
      "Clostridium tetani"
    ],
    correct: [1],
    explanation: "Bacillus atrophaeus (formerly B. subtilis) endospores are exceptionally resistant to ethylene oxide and dry heat, making them the standard biological challenge indicator.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 211",
    topic: "Biological Indicators",
    difficulty: "medium"
  },
  {
    sort_order: 12,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "When a sterile basin of sterile saline is placed on the ring stand, what is the sterility status of the edges and lip of the pour bottle once opened?",
    options: [
      "The entire bottle remains sterile inside and outside",
      "The lip of the bottle is considered contaminated once the cap is removed and liquid pour begins; unpoured contents cannot be recapped and reused",
      "The cap may be replaced if done within 30 seconds",
      "The bottle can be used on multiple surgical cases if stored in sub-sterile"
    ],
    correct: [1],
    explanation: "Once a sterile liquid container is opened, the rim/lip is considered contaminated. Liquids must be poured in a single continuous delivery without dripping, and unused portions discarded.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 194",
    topic: "Pouring Sterile Solutions",
    difficulty: "easy"
  },
  {
    sort_order: 13,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What is the minimum recommended duration for a surgical scrub when using an alcohol-based chlorhexidine surgical hand rub on clean, dry hands?",
    options: ["10 seconds", "According to manufacturer instructions (typically 1 to 2 minutes covering all surfaces)", "10 minutes", "15 minutes"],
    correct: [1],
    explanation: "Alcohol-based surgical rubs require following manufacturer instructions (IFU), usually applying 2-3 pumps and rubbing thoroughly until completely dry for 1.5 to 2 minutes.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 180",
    topic: "Surgical Hand Antisepsis",
    difficulty: "easy"
  },
  {
    sort_order: 14,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What physical phenomenon occurs when moisture permeates from an unsterile surface through a sterile drape to the sterile field, carrying microorganisms with it?",
    options: ["Capillary action / strike-through", "Flocculation", "Cavitation", "Thermal bridging"],
    correct: [0],
    explanation: "Strike-through contamination occurs when liquid soaks through a porous drape or packaging, allowing microorganisms to wick through via capillary action from a non-sterile surface.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 183",
    topic: "Strike-Through Contamination",
    difficulty: "easy"
  },
  {
    sort_order: 15,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "When gowning and gloving using the closed-glove technique, where must the hands remain relative to the gown sleeves until gloves are seated?",
    options: [
      "Hands must extend 2 inches beyond the knitted cuffs",
      "Hands must remain completely inside the sleeves and behind the cuffs",
      "Only the thumb may emerge from the cuff",
      "Gloves must be placed by the circulating nurse"
    ],
    correct: [1],
    explanation: "In closed gloving, the surgical technologist's hands must not extend past the cuff edge of the gown sleeve until the glove is pulled over the cuff and onto the hand.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 188",
    topic: "Closed Gloving Technique",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "What is the primary mode of sterilization used in the low-temperature STERRAD system for moisture- and heat-sensitive endoscopes?",
    options: [
      "Cobalt-60 gamma radiation",
      "Hydrogen peroxide gas plasma",
      "Glutaraldehyde soaking for 10 hours",
      "High-pressure superheated steam"
    ],
    correct: [1],
    explanation: "The STERRAD system uses vaporized hydrogen peroxide followed by radiofrequency energy to generate low-temperature reactive gas plasma that sterilizes without heat or toxic aeration.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 220",
    topic: "Gas Plasma Sterilization",
    difficulty: "medium"
  },
  {
    sort_order: 17,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "Which chemical indicator class responds to all critical parameters of steam sterilization (time, temperature, and saturated steam) and correlates with biological indicator kill?",
    options: ["Class 1 (Process indicator)", "Class 2 (Bowie-Dick)", "Class 5 (Integrating indicator)", "Class 4 (Multi-parameter indicator)"],
    correct: [2],
    explanation: "Class 5 integrating chemical indicators monitor all critical sterilization parameters over a specific temperature range and correlate with biological death curves.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 212",
    topic: "Chemical Indicators",
    difficulty: "hard"
  },
  {
    sort_order: 18,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "How should items with lumened cannulas (such as suction tips and endoscopic trocars) be prepared before being placed in a steam autoclave?",
    options: [
      "Flushed with residual mineral oil",
      "Flushed with a small amount of sterile distilled water to facilitate steam displacement",
      "Both ends tightly sealed with waterproof tape",
      "Packed inside airtight rubber sleeves"
    ],
    correct: [1],
    explanation: "Lumens must be flushed with residual distilled water immediately before steam sterilization so that boiling moisture generates steam inside the lumen to drive out air.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 206",
    topic: "Instrument Packaging",
    difficulty: "medium"
  },
  {
    sort_order: 19,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "If a sterile item falls below the level of the operating table or edge of the sterile back table, what is its sterility status?",
    options: [
      "Still sterile if it fell less than 6 inches",
      "Immediately contaminated, as any surface or item below table level is outside the sterile field",
      "Sterile if caught before touching the floor",
      "Sterile if wiped with Betadine"
    ],
    correct: [1],
    explanation: "Tables are sterile only at the table surface height. Anything that drops below table level is considered contaminated and cannot be brought back into the sterile field.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 185",
    topic: "Table Level Sterility",
    difficulty: "easy"
  },
  {
    sort_order: 20,
    section: "Surgical Asepsis and Sterility",
    type: "mcq_single",
    stem: "In ultrasonic cleaning, micro-bubbles form and violently collapse under high frequency sound waves to scrub soil off surgical instruments. What is this process called?",
    options: ["Cavitation", "Desiccation", "Ionization", "Emulsification"],
    correct: [0],
    explanation: "Cavitation is the generation and explosive implosion of microscopic vacuum bubbles in an ultrasonic bath, dislodging blood and debris from serrations and box locks.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 198",
    topic: "Decontamination & Cavitation",
    difficulty: "easy"
  },

  // =========================================================================
  // SECTION 4: Instrumentation, Equipment, and Supplies (15 Questions)
  // =========================================================================
  {
    sort_order: 21,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which knife blade has an angled, triangular cutting point with a straight sharp edge, commonly used for stab incisions in drainage placement or vascular arteriotomy?",
    options: ["#10 blade", "#11 blade", "#12 blade", "#15 blade"],
    correct: [1],
    explanation: "The #11 blade has a sharp pointed tip and straight cutting edge, specifically utilized for puncture incisions, arthroscopic portals, and initial arteriotomy.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 345",
    topic: "Scalpel Blades",
    difficulty: "easy"
  },
  {
    sort_order: 22,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which heavy surgical scissors feature thick, sturdy blades designed for cutting tough fibrous fascia and trimming synthetic surgical mesh?",
    options: ["Iris scissors", "Metzenbaum scissors", "Mayo scissors (curved or straight)", "Tenotomy scissors"],
    correct: [2],
    explanation: "Curved Mayo scissors have heavy, thick blades intended for dense tissue like fascia, tendons, and cartilage. Straight Mayo scissors are used for cutting sutures.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 347",
    topic: "Surgical Scissors",
    difficulty: "easy"
  },
  {
    sort_order: 23,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which small, delicate hemostatic clamp has fine transversal serrations along its entire jaw length and is used to clamp delicate bleeders in pediatric or plastic surgery?",
    options: ["Pean clamp", "Rochester-Carmalt clamp", "Halsted mosquito clamp", "Heaney clamp"],
    correct: [2],
    explanation: "The Halsted mosquito clamp is a small, delicate clamp designed to occlude small bleeding capillaries and vessels in superficial or delicate dissections.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 350",
    topic: "Hemostatic Clamps",
    difficulty: "easy"
  },
  {
    sort_order: 24,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which tissue forceps has multiple fine interlocking teeth (often 4x5 or 5x6) along its tip margins and is commonly used to grasp thyroid or tonsillar tissue?",
    options: ["Allis tissue forceps", "Adson brown tissue forceps", "Russian tissue forceps", "DeBakey vascular forceps"],
    correct: [0],
    explanation: "Allis tissue forceps have inward-curved jaws with multiple delicate teeth (4x5 or 5x6) designed for holding tissue that will be excised or for securing fascia borders.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 353",
    topic: "Tissue Forceps",
    difficulty: "medium"
  },
  {
    sort_order: 25,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which premier atraumatic vascular tissue forceps features a distinctive patented ribbed parallel fine-grooved serration designed to grip blood vessels without puncturing endothelium?",
    options: ["Bonney forceps", "DeBakey vascular tissue forceps", "Ferris-Smith forceps", "Rat-tooth forceps"],
    correct: [1],
    explanation: "DeBakey forceps have fine, atraumatic longitudinal ridges that grip vascular adventitia and bowel walls securely without tearing delicate endothelial layers.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 356",
    topic: "Vascular Forceps",
    difficulty: "easy"
  },
  {
    sort_order: 26,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which hand-held double-ended retractor features a wide flat paddle on one end and a smaller right-angle hook on the other, commonly used in pairs for superficial exposure?",
    options: ["Army-Navy (US Army) retractor", "Deaver retractor", "Harrington sweetheart retractor", "Richardson retractor"],
    correct: [0],
    explanation: "The Army-Navy retractor is a flat, double-ended hand-held retractor used in pairs to expose subcutaneous fat and superficial muscle tissue.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 360",
    topic: "Hand-Held Retractors",
    difficulty: "easy"
  },
  {
    sort_order: 27,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which deep, curved hand-held abdominal retractor resembles a question mark and is used to retract deep abdominal organs (liver, spleen) during open laparotomy?",
    options: ["Senn retractor", "Deaver retractor", "Volkmann rake", "Skin hook"],
    correct: [1],
    explanation: "The Deaver retractor is a broad, curved strip of stainless steel shaped like a question mark, used for deep retraction of abdominal viscera.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 361",
    topic: "Deep Abdominal Retractors",
    difficulty: "easy"
  },
  {
    sort_order: 28,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which fine-angled suction tip is equipped with an integrated thumb-hole stylet and vacuum regulator, commonly used in neurosurgery, orthopedics, and ENT?",
    options: ["Yankauer suction tip", "Frazier suction tip", "Poole suction tip", "Baron suction tip"],
    correct: [1],
    explanation: "The Frazier suction tip is a delicate metal tube with a finger porthole allowing the surgeon to regulate suction intensity precisely in confined surgical fields.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 365",
    topic: "Suction Instruments",
    difficulty: "easy"
  },
  {
    sort_order: 29,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What is the primary clinical advantage of synthetic monofilament sutures (such as PDS or Monocryl) compared to braided multifilament sutures?",
    options: [
      "Monofilament sutures have higher knot security with only 2 throws",
      "Monofilament sutures harbor less bacteria in their structure and glide smoothly through tissue without wicking infection",
      "Monofilament sutures dissolve within 24 hours",
      "Monofilament sutures are opaque on X-rays"
    ],
    correct: [1],
    explanation: "Monofilament sutures consist of a single smooth strand that does not harbor bacteria in interstitial braid crevices, making them ideal for contaminated or infection-prone wounds.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 390",
    topic: "Suture Characteristics",
    difficulty: "medium"
  },
  {
    sort_order: 30,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which natural non-absorbable suture is made from silkworm cocoons, handles like silk, and is widely favored for tying off vessels (ligatures) and GI anastomosis?",
    options: ["Surgical silk", "Surgical stainless steel", "Nylon (Ethilon)", "Polypropylene"],
    correct: [0],
    explanation: "Surgical silk is a natural braided protein fiber from silkworm larvae, prized by surgeons for its superior handling characteristics, pliability, and tight knot security.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 394",
    topic: "Silk Sutures",
    difficulty: "easy"
  },
  {
    sort_order: 31,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which surgical needle point has three cutting edges with the third cutting edge positioned on the outer convex curvature to prevent cutout through wound margins?",
    options: ["Conventional cutting needle", "Reverse cutting needle", "Taper cut needle", "Blunt needle"],
    correct: [1],
    explanation: "The reverse cutting needle features its cutting edge on the outer curvature, which prevents the needle from tearing through skin or eye tissue toward the wound edge.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 400",
    topic: "Surgical Needles",
    difficulty: "medium"
  },
  {
    sort_order: 32,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "During a procedure using a monopolar active electrosurgical pencil, what device must be used to safely park the active electrode when not in the surgeon's hand?",
    options: [
      "Resting directly on the patient's chest drapes",
      "Placed inside a non-conductive rigid safety holster attached to the sterile drape",
      "Held continuously by the CST",
      "Placed in a wet towel basin"
    ],
    correct: [1],
    explanation: "The electrosurgical pencil must always be placed into a non-conductive plastic holster when not in use to prevent accidental foot-switch activation and drape fires.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 327",
    topic: "ESU Holster Safety",
    difficulty: "easy"
  },
  {
    sort_order: 33,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which linear gastrointestinal cutting and stapling instrument simultaneously places two double staggered rows of titanium staples and divides the tissue between them?",
    options: ["TA (Thoracoabdominal) stapler", "GIA (Gastrointestinal Anastomosis) stapler", "EEA (End-to-End Anastomosis) stapler", "LDS (Ligating-Dividing Stapler)"],
    correct: [1],
    explanation: "The GIA (Gastrointestinal Anastomosis) stapler inserts parallel staggered staple rows while an advancing internal blade simultaneously cuts the tissue between the rows.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 374",
    topic: "Surgical Staplers",
    difficulty: "medium"
  },
  {
    sort_order: 34,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which small radiopaque neurosurgical patties are soaked in saline or thrombin and used to protect brain and spinal cord parenchyma?",
    options: ["Cottonoids (neuro patties)", "Kittner peanuts", "Cherry sponges", "Ray-Tec 4x4s"],
    correct: [0],
    explanation: "Cottonoid patties (neuro sponges) are compressed felted cotton pads with attached radiopaque strings used for delicate neurosurgical neural protection and hemostasis.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 311",
    topic: "Neurosurgical Sponges",
    difficulty: "easy"
  },
  {
    sort_order: 35,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What is the primary function of an ultrasonic harmonic scalpel during laparoscopic cholecystectomy or colectomy?",
    options: [
      "Electrocauterization using 500,000 Hz electrical current",
      "Rapid mechanical vibration at 55,500 Hz that denatures proteins and seals vessels with minimal lateral thermal tissue spread",
      "Cryogenic freezing of tissue margins",
      "Laser beam vaporization"
    ],
    correct: [1],
    explanation: "The harmonic scalpel converts electrical energy into ultrasonic vibrations (55,500 vibrations per second), cutting and coagulating vessels at lower temperatures with minimal lateral thermal injury.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 330",
    topic: "Ultrasonic Scalpels",
    difficulty: "medium"
  },

  // =========================================================================
  // SECTION 5: Hemostasis, Wound Healing, and Wound Closure (5 Questions)
  // =========================================================================
  {
    sort_order: 36,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which plant-derived absorbable hemostatic agent made from oxidized regenerated cellulose is knitted into sheets (trade name Surgicel) and can be laid into bleeding capillary beds?",
    options: [
      "Avitene",
      "Oxidized regenerated cellulose (Surgicel)",
      "Topical thrombin powder",
      "Silver nitrate"
    ],
    correct: [1],
    explanation: "Surgicel (oxidized regenerated cellulose) swells into a dark gelatinous mass upon contact with blood, serving as a mechanical matrix that accelerates clot formation.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 381",
    topic: "Oxidized Cellulose Hemostat",
    difficulty: "easy"
  },
  {
    sort_order: 37,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Why must topical thrombin NEVER be injected into a patient's vascular bloodstream?",
    options: [
      "It causes instantaneous, massive systemic intravascular coagulation leading to fatal thrombosis",
      "It dissolves all existing blood clots",
      "It inactivates anesthetic gases",
      "It alters blood typing compatibility"
    ],
    correct: [0],
    explanation: "Thrombin accelerates conversion of fibrinogen to fibrin. Direct intravenous injection causes catastrophic, fatal disseminated intravascular thrombosis and pulmonary embolism.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 383",
    topic: "Thrombin Safety Warning",
    difficulty: "easy"
  },
  {
    sort_order: 38,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "During which phase of wound healing do fibroblasts synthesize collagen rapidly to bridge the wound, and capillaries bud to establish vascular granulation tissue?",
    options: [
      "Lag / inflammatory phase",
      "Proliferation (fibroblastic) phase (days 5 to 20)",
      "Maturation (remodeling) phase (day 21 to 1 year)",
      "Hemostasis phase"
    ],
    correct: [1],
    explanation: "The proliferation phase begins around day 4-5 and continues through day 20. Fibroblasts synthesize collagen and ground substance while angiogenetic sprouts form granulation tissue.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 414",
    topic: "Proliferative Wound Healing",
    difficulty: "medium"
  },
  {
    sort_order: 39,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the serious postoperative surgical complication wherein the abdominal fascial layers separate, and abdominal viscera protrude outside the open wound?",
    options: ["Wound dehiscence with evisceration", "Hypertrophic scarring", "Hematoma", "Keloid formation"],
    correct: [0],
    explanation: "Dehiscence is the separation of wound layers. Evisceration is the protrusion of internal abdominal viscera (intestines) through the dehisced wound, representing a surgical emergency.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 422",
    topic: "Wound Complications",
    difficulty: "easy"
  },
  {
    sort_order: 40,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "According to CDC wound classifications, an exploratory laparotomy performed for a ruptured perforated sigmoid diverticulum with purulent fecal peritonitis is classified as:",
    options: [
      "Class I: Clean",
      "Class II: Clean-Contaminated",
      "Class III: Contaminated",
      "Class IV: Dirty / Infected"
    ],
    correct: [3],
    explanation: "Class IV (Dirty/Infected) wounds involve active clinical infection, devitalized tissue, or perforated viscera with established fecal contamination prior to surgery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 421",
    topic: "Wound Classification",
    difficulty: "easy"
  },

  // =========================================================================
  // SECTION 6: Surgical Anatomy & Physiology (10 Questions)
  // =========================================================================
  {
    sort_order: 41,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "List the anatomical abdominal wall tissue layers in the correct chronological order from superficial skin to deep peritoneal cavity:",
    options: [
      "Skin &rarr; Subcutaneous fat (Camper's & Scarpa's) &rarr; Anterior rectus sheath &rarr; Rectus abdominis muscle &rarr; Posterior rectus sheath &rarr; Transversalis fascia &rarr; Preperitoneal fat &rarr; Peritoneum",
      "Skin &rarr; Peritoneum &rarr; Muscle &rarr; Fascia &rarr; Fat",
      "Skin &rarr; Transversalis fascia &rarr; Rectus muscle &rarr; Subcutaneous fat &rarr; Peritoneum",
      "Skin &rarr; Scarpa's fascia &rarr; Peritoneum &rarr; Rectus muscle &rarr; Transversalis fascia"
    ],
    correct: [0],
    explanation: "Standard laparotomy traverses: Skin, subcutaneous Camper's and Scarpa's fascial fat, anterior fascia, rectus abdominis muscle, posterior fascia, transversalis fascia, preperitoneal fat, and parietal peritoneum.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 474",
    topic: "Abdominal Wall Layers",
    difficulty: "hard"
  },
  {
    sort_order: 42,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which major abdominal endocrine and exocrine organ lies retroperitoneally with its head nestled in the C-loop of the duodenum and its tail touching the splenic hilum?",
    options: ["Liver", "Pancreas", "Gallbladder", "Adrenal gland"],
    correct: [1],
    explanation: "The pancreas is a transverse retroperitoneal organ whose head is enclosed by the duodenum, body extends across the aorta, and tail reaches the spleen hilum.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 512",
    topic: "Pancreatic Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 43,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What anatomical duct merges with the main pancreatic duct (duct of Wirsung) to form the ampulla of Vater prior to entering the second portion of the duodenum?",
    options: ["Cystic duct", "Common bile duct", "Thoracic duct", "Right hepatic duct"],
    correct: [1],
    explanation: "The common bile duct unites with the pancreatic duct of Wirsung to form the hepatopancreatic ampulla (ampulla of Vater), guarded by the sphincter of Oddi.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 508",
    topic: "Biliary Ductal Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 44,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which vascular structure must be carefully preserved during a carotid endarterectomy to avoid postoperative hoarseness and vocal cord paralysis?",
    options: ["Recurrent laryngeal nerve and vagus nerve", "Phrenic nerve", "Facial nerve mandibular branch", "Accessory nerve"],
    correct: [0],
    explanation: "The vagus nerve (CN X) runs within the carotid sheath, giving off the recurrent laryngeal nerve. Surgical stretch or transection causes vocal cord paresis and hoarseness.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 632",
    topic: "Carotid Neck Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 45,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which structure connects the stomach's greater curvature to the transverse colon, draping down like a fatty vascular apron over the small intestines?",
    options: ["Lesser omentum", "Greater omentum", "Mesoappendix", "Falciform ligament"],
    correct: [1],
    explanation: "The greater omentum is a large four-layered peritoneal fold hanging like an apron from the stomach's greater curvature over the bowel loops, containing abundant macrophages.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 478",
    topic: "Peritoneal Folds & Omentum",
    difficulty: "easy"
  },
  {
    sort_order: 46,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the primary anatomical landmark that separates the upper gastrointestinal tract from the lower gastrointestinal tract at the junction of the duodenum and jejunum?",
    options: ["Ligament of Treitz (suspensory muscle of duodenum)", "Pyloric sphincter", "Ileocecal valve", "Sphincter of Oddi"],
    correct: [0],
    explanation: "The ligament of Treitz is a suspensory fibromuscular band marking the duodenojejunal flexure and anatomically distinguishing the upper GI tract from the lower GI tract.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 492",
    topic: "GI Anatomical Landmarks",
    difficulty: "medium"
  },
  {
    sort_order: 47,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During thyroidectomy, which tiny paired endocrine glands located on the posterior thyroid capsules must be identified and preserved to prevent severe hypocalcemic tetany?",
    options: ["Adrenal glands", "Parathyroid glands", "Thymus glands", "Pineal bodies"],
    correct: [1],
    explanation: "The four parathyroid glands regulate systemic calcium homeostasis via parathyroid hormone (PTH). Accidental excision triggers severe hypocalcemia and muscle tetany.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 15, pg 460",
    topic: "Endocrine Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 48,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which muscle forms the primary rotator cuff of the shoulder along with the infraspinatus, teres minor, and subscapularis?",
    options: ["Supraspinatus muscle", "Deltoid muscle", "Pectoralis major", "Latissimus dorsi"],
    correct: [0],
    explanation: "The four rotator cuff muscles (SITS) are: Supraspinatus, Infraspinatus, Teres minor, and Subscapularis. Supraspinatus tendon tears are the most frequent surgical indication.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 598",
    topic: "Orthopedic Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 49,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which cranial nerve innervates the muscles of facial expression and exits the skull base through the stylomastoid foramen, coursing directly through the parotid gland?",
    options: ["Cranial Nerve V (Trigeminal)", "Cranial Nerve VII (Facial)", "Cranial Nerve IX (Glossopharyngeal)", "Cranial Nerve XII (Hypoglossal)"],
    correct: [1],
    explanation: "Cranial Nerve VII (Facial nerve) controls facial expression. Its motor branches arborize through the substance of the parotid gland, requiring nerve monitoring during parotidectomy.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 17, pg 528",
    topic: "Cranial Nerves",
    difficulty: "medium"
  },
  {
    sort_order: 50,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which functional kidney unit is responsible for filtering blood plasma, reabsorbing essential solutes, and generating urine?",
    options: ["Nephron", "Renal calyx", "Renal pelvis", "Ureter"],
    correct: [0],
    explanation: "The nephron is the structural and functional filtration unit of the kidney, consisting of the glomerulus, Bowman's capsule, proximal/distal tubules, and loop of Henle.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 19, pg 578",
    topic: "Renal Physiology",
    difficulty: "easy"
  }
];

const mock3Data = {
  test_slug: "st-mock-3",
  test_meta: {
    title: "ST – Mock 3 (Comprehensive Tournament Simulation)",
    event: "ST",
    kind: "mock",
    total_questions: 50,
    duration_min: 60,
    instant_feedback: false,
    is_free: false,
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

const targetPath = path.resolve(process.cwd(), "data", "st-mock-3-50q.json");
fs.writeFileSync(targetPath, JSON.stringify(mock3Data, null, 2), "utf-8");
console.log(`Generated st-mock-3-50q.json with ${questions.length} questions.`);

