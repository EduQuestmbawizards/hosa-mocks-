const fs = require("fs");
const path = require("path");

// ===========================================================================
// PRACTICE SET B: Surgical Instrumentation & Mayo Stand Setup (30 Questions)
// ===========================================================================
const practiceBQuestions = [
  {
    sort_order: 1,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which knife handle is long and slender, designed to hold small blades (#10, #11, #12, #15) in deep, narrow surgical cavities (such as tonsillectomy or pelvic surgery)?",
    options: ["#3 handle", "#4 handle", "#7 handle", "#9 handle"],
    correct: [2],
    explanation: "#7 knife handle is long, thin, and contoured to hold blades (#10, #11, #12, #15) in deep, confined cavities.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 344",
    topic: "Scalpel Handles",
    difficulty: "easy"
  },
  {
    sort_order: 2,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which scalpel handle is larger and heavier, designed to hold larger blades like #20, #21, and #22 for thick tissue incisions in autopsies or heavy trauma?",
    options: ["#3 handle", "#4 handle", "#7 handle", "#3L handle"],
    correct: [1],
    explanation: "#4 scalpel handle is wider and accommodates the larger #20-series blades (#20 through #25).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 345",
    topic: "Scalpel Handles",
    difficulty: "easy"
  },
  {
    sort_order: 3,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which delicate dissecting scissors feature fine, sharp-tipped blades used extensively in ophthalmic, plastic, and reconstructive microsurgery?",
    options: ["Iris scissors", "Lister bandage scissors", "Mayo scissors", "Smith wire scissors"],
    correct: [0],
    explanation: "Iris scissors have very small, razor-sharp blades originally created for ophthalmic iridectomy, now ubiquitous in plastic and fine soft tissue surgery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 349",
    topic: "Delicate Scissors",
    difficulty: "easy"
  },
  {
    sort_order: 4,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What specialized angled scissors have a blunt probe nodule on the lower blade to slip safely beneath dressings, casts, or umbilical cords without piercing patient skin?",
    options: ["Lister bandage scissors", "Potts-Smith scissors", "Jorgenson scissors", "Stevens tenotomy scissors"],
    correct: [0],
    explanation: "Lister bandage scissors feature an angled blade with a rounded, blunt probe tip on the lower blade designed to slide against patient skin without cutting it.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 350",
    topic: "Bandage Scissors",
    difficulty: "easy"
  },
  {
    sort_order: 5,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which vascular scissors are angled at 45 or 60 degrees, designed specifically for extending an arteriotomy in coronary or peripheral vascular vessels?",
    options: ["Potts-Smith scissors", "Mayo curved scissors", "Metzenbaum scissors", "Iris scissors"],
    correct: [0],
    explanation: "Potts-Smith scissors have angled fine blades tailored to extend incisions into arteries and veins smoothly without tearing the opposite vessel wall.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 626",
    topic: "Vascular Scissors",
    difficulty: "medium"
  },
  {
    sort_order: 6,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which hemostatic clamp has transverse serrations extending only halfway down the length of its jaws?",
    options: ["Kelly clamp", "Crile clamp", "Pean clamp", "Mosquito clamp"],
    correct: [0],
    explanation: "Kelly clamps feature serrations along only the distal half of the jaws, whereas Crile clamps have serrations along the full length of the jaws.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 351",
    topic: "Hemostatic Clamps",
    difficulty: "medium"
  },
  {
    sort_order: 7,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which heavy hemostatic forceps has full transverse serrations and broad jaws, used for clamping large vascular pedicles and tough fibrous tissue bundles?",
    options: ["Rochester-Pean clamp", "Halsted mosquito", "Allis clamp", "Babcock clamp"],
    correct: [0],
    explanation: "Rochester-Pean clamps are heavy, robust forceps with transverse serrations along the full jaw length designed to occlude larger blood vessels and tissue pedicles.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 352",
    topic: "Heavy Clamps",
    difficulty: "easy"
  },
  {
    sort_order: 8,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which tissue forceps has a small, delicate triangular fenestration with fine 1x2 teeth at the tip, commonly used by plastic and general surgeons for grasping skin edges during suturing?",
    options: ["Adson tissue forceps with teeth", "DeBakey forceps", "Russian forceps", "Singley forceps"],
    correct: [0],
    explanation: "Adson tissue forceps feature a broad thumb grasp tapering to fine tips with 1x2 interlocking teeth, ideal for handling skin margins during subcuticular closure.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 355",
    topic: "Tissue Forceps",
    difficulty: "easy"
  },
  {
    sort_order: 9,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which heavy tissue forceps features large rounded, cup-shaped spoon tips with radiating circular teeth, frequently used for grasping dense tissues or retrieving gallstones?",
    options: ["Russian tissue forceps", "DeBakey forceps", "Adson brown forceps", "Gerald forceps"],
    correct: [0],
    explanation: "Russian tissue forceps have broad, circular, spoon-shaped tips with radiating grooves, providing a secure grip on slippery pelvic tissues, liver, or gallstones.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 357",
    topic: "Tissue Forceps",
    difficulty: "medium"
  },
  {
    sort_order: 10,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which perforated towel clamp has sharp, curved interlocking points used to anchor surgical drapes or hold reduction on small bone fragments?",
    options: ["Backhaus towel clamp", "Edna (non-perforating) clamp", "Babcock clamp", "Foerster sponge clamp"],
    correct: [0],
    explanation: "The Backhaus towel clamp has sharp piercing points designed to penetrate drapes and secure towels. Once clamped through drapes, the tips are contaminated.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 359",
    topic: "Towel Clamps",
    difficulty: "easy"
  },
  {
    sort_order: 11,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "If a sharp Backhaus towel clamp is removed from a draped patient during surgery, what is the sterility status of the clamp tips?",
    options: [
      "The tips are considered contaminated and the clamp must be passed off the field without touching the sterile table",
      "The tips remain sterile if Betadine was applied to the drape",
      "The clamp can be reused anywhere on the Mayo stand",
      "The clamp can be wiped with a wet Ray-Tec and reused"
    ],
    correct: [0],
    explanation: "Because the sharp tips penetrated through sterile drapes into unsterile patient skin, the tips are contaminated and must be immediately removed from the sterile field.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 7, pg 185",
    topic: "Aseptic Technique with Clamps",
    difficulty: "easy"
  },
  {
    sort_order: 12,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which handheld retractor features a solid right-angle blade with a concave lip on a sturdy handle, widely used in pairs for deep abdominal wall and laparotomy exposure?",
    options: ["Richardson retractor", "Senn retractor", "Skin hook", "Gelpi retractor"],
    correct: [0],
    explanation: "The Richardson retractor is a standard right-angle abdominal wall retractor with a contoured handle and curved lip, designed for heavy fascial and muscular retraction.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 361",
    topic: "Abdominal Retractors",
    difficulty: "easy"
  },
  {
    sort_order: 13,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which double-ended hand-held retractor has a narrow right-angle blade on one end and a three-pronged rake (sharp or blunt) on the other, commonly used in plastic and hand surgery?",
    options: ["Senn retractor", "Army-Navy retractor", "Deaver retractor", "Harrington retractor"],
    correct: [0],
    explanation: "The Senn retractor is a small handheld instrument with a solid right-angle blade on one end and a 3-pronged rake on the opposite end, used in superficial soft tissue work.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 362",
    topic: "Handheld Retractors",
    difficulty: "easy"
  },
  {
    sort_order: 14,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which deep visceral retractor features a heart-shaped, flexible blade with a padded tip designed to retract the liver during upper GI and biliary surgery without bruising parenchyma?",
    options: ["Harrington (sweetheart) retractor", "Balfour retractor", "Richardson retractor", "Weitlaner retractor"],
    correct: [0],
    explanation: "The Harrington retractor features a wide, heart-shaped blade with a rounded smooth tip specifically designed to retract the liver gently during open laparotomy.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 502",
    topic: "Visceral Retractors",
    difficulty: "medium"
  },
  {
    sort_order: 15,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which bone cutting instrument has sharp scoop-shaped, cup-like jaws designed to bite away and gouge out small pieces of cortical bone or tissue?",
    options: ["Rongeur", "Bone curette", "Osteotome", "Periosteal elevator"],
    correct: [0],
    explanation: "A rongeur (single- or double-action) has sharp cupped jaws used to bite away bone fragments, cartilage, or spur tissue in orthopedic and spinal surgeries.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 606",
    topic: "Orthopedic Cutting Instruments",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which chisel-like instrument is beveled on both sides and used with a surgical mallet to cut or shape bone during orthopedic reconstructions?",
    options: ["Osteotome", "Bone chisel (beveled on one side only)", "Bone curette", "Gigli saw"],
    correct: [0],
    explanation: "An osteotome is beveled on both cutting sides (sloping from both faces to the edge) for dividing bone; a chisel is beveled on one side only.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 607",
    topic: "Bone Shaping Instruments",
    difficulty: "medium"
  },
  {
    sort_order: 17,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which instrument is used to scrape away diseased bone, cartilage, or uterine endometrial lining during diagnostic and therapeutic procedures?",
    options: ["Curette", "Rasp", "Elevator", "Mallet"],
    correct: [0],
    explanation: "A curette has a cup, ring, or oval scoop with sharp or blunt edges used to debride, scrape, and sample biological tissue from cavities or bone surfaces.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 18, pg 548",
    topic: "Curettes",
    difficulty: "easy"
  },
  {
    sort_order: 18,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which instrument with a sharp, slightly curved flat edge is used by the CST to strip periosteum cleanly off bone shafts before plating?",
    options: ["Periosteal elevator (e.g., Cobb, Key, or Freer)", "Bone file", "Kern clamp", "Lowman clamp"],
    correct: [0],
    explanation: "Periosteal elevators (such as the Key, Cobb, or Freer) feature flat, slightly curved blades designed to peel and elevate periosteal tissue off cortical bone surfaces.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 605",
    topic: "Elevators",
    difficulty: "easy"
  },
  {
    sort_order: 19,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which flexible wire saw with detachable T-shaped handles is used for manual transection of bone, such as in amputations or cranial flap elevation?",
    options: ["Gigli saw", "Charriere saw", "Satterlee saw", "Liston saw"],
    correct: [0],
    explanation: "The Gigli saw is a flexible twisted wire with sharp teeth pulled back and forth across bone between two manual handles to perform controlled osteotomies.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 609",
    topic: "Manual Bone Saws",
    difficulty: "medium"
  },
  {
    sort_order: 20,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which forceps has long, thin ring-handled shanks terminating in smooth, ring-shaped fenestrations used to hold Ray-Tec sponges for prep sticks or deep cavity swabbing?",
    options: ["Foerster sponge forceps", "Kocher clamp", "Allis clamp", "Tenaculum"],
    correct: [0],
    explanation: "The Foerster sponge-holding forceps (ring forceps) has smooth or serrated circular loop jaws designed to hold folded gauze sponges for abdominal prepping or deep blotting.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 356",
    topic: "Sponge Forceps",
    difficulty: "easy"
  },
  {
    sort_order: 21,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What is the primary function of a laparoscopic Veress needle?",
    options: [
      "Blind percutaneous entry through the fascia into the peritoneal cavity to instill CO2 gas and establish initial pneumoperitoneum safely",
      "Suturing the bladder neck",
      "Aspirating pelvic abscesses",
      "Harvesting bone marrow"
    ],
    correct: [0],
    explanation: "The Veress needle features a sharp outer cannula with an internal spring-loaded blunt stylet designed to safely puncture the abdominal wall for blind CO2 insufflation.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 13, pg 434",
    topic: "Laparoscopic Access",
    difficulty: "easy"
  },
  {
    sort_order: 22,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which alternative laparoscopic entry technique uses a blunt-tipped cannula (Hasson trocar) placed under direct surgical cutdown visualization to eliminate blind trocar visceral injury?",
    options: ["Open (Hasson) laparoscopy technique", "Closed Veress technique", "Pneumatic needle technique", "Percutaneous trocar puncture"],
    correct: [0],
    explanation: "The Hasson open technique involves making a small periumbilical incision, incising fascia under direct vision, placing stay sutures, and inserting a blunt Hasson trocar.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 13, pg 436",
    topic: "Hasson Open Technique",
    difficulty: "medium"
  },
  {
    sort_order: 23,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What is the recommended maximum intra-abdominal pressure (IAP) setting on the CO2 insufflator during adult laparoscopic surgery to prevent vena cava compression and respiratory compromise?",
    options: ["5 to 8 mmHg", "12 to 15 mmHg", "25 to 30 mmHg", "40 to 50 mmHg"],
    correct: [1],
    explanation: "Standard adult laparoscopic pneumoperitoneum is maintained between 12 and 15 mmHg. Pressures above 15 mmHg impede venous return to the heart and reduce cardiac output.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 13, pg 438",
    topic: "Insufflation Pressures",
    difficulty: "medium"
  },
  {
    sort_order: 24,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What solution should be kept on the sterile Mayo stand to clean tissue coagulum and blood from the tips of electrosurgical pencils and bipolar forceps?",
    options: ["Sterile water and a scratch pad (ESU tip cleaner)", "Sterile saline solution", "Alcohol prep pads", "Hydrogen peroxide"],
    correct: [0],
    explanation: "Sterile water is preferred over saline for cleaning electrocautery tips and wiping instruments because saline contains sodium chloride, which corrodes and pits stainless steel.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 368",
    topic: "Instrument Care on Sterile Field",
    difficulty: "easy"
  },
  {
    sort_order: 25,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "How should delicate microsurgical and eye instruments be cleaned and handled during surgery?",
    options: [
      "Wiped gently with a lint-free non-fibrous microsponge (e.g., Weck-cel) and kept in a designated silicone protective rack",
      "Scrubbed with coarse abrasive pads",
      "Stacked beneath heavy retractor trays",
      "Allowed to dry with blood on hinges"
    ],
    correct: [0],
    explanation: "Microsurgical instruments have fragile tips that bend easily. They must be cleaned with lint-free microsponges (Weck-Cel) and protected in tip-guards or silicone-cushioned trays.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 11, pg 372",
    topic: "Microsurgical Instruments",
    difficulty: "easy"
  },
  {
    sort_order: 26,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which uterine dilator set consists of double-ended graduated cylindrical metal rods with slightly curved rounded tips, numbered in half-millimeter increments for cervical dilation?",
    options: ["Hegar cervical dilators", "Pratt dilators", "Bakes bile duct dilators", "Bougie esophageal dilators"],
    correct: [0],
    explanation: "Hegar dilators are curved, double-ended, smooth cylindrical dilators used sequentially to dilate the cervical os prior to curettage or hysteroscopy.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 18, pg 549",
    topic: "Cervical Dilators",
    difficulty: "easy"
  },
  {
    sort_order: 27,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which set of graduated malleable metal probes with oval olive-shaped tips is used by the surgeon to explore and calibrate the common bile duct during open CBD exploration?",
    options: ["Bakes bile duct dilators", "Hegar dilators", "Van Buren sounds", "Pratt dilators"],
    correct: [0],
    explanation: "Bakes dilators have flexible shafts with graduated olive-shaped tips used to explore, dilate, and calibrate the common bile duct and sphincter of Oddi.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 506",
    topic: "Biliary Dilators",
    difficulty: "medium"
  },
  {
    sort_order: 28,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which self-retaining retractor is specifically designed for mastoidectomy, laminectomy, and anterior cervical discectomy with interchangeable blunt and sharp blades on a pivoting frame?",
    options: ["Beckman-Weitlaner retractor / Cloward retractor", "Balfour retractor", "Senn retractor", "Deaver retractor"],
    correct: [0],
    explanation: "The Beckman (or Cloward) retractor features hinged arms with interchangeable blades that articulate to conform to spinal or mastoid operative margins.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 23, pg 690",
    topic: "Spinal Retractors",
    difficulty: "medium"
  },
  {
    sort_order: 29,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "What mechanical counting device on the Mayo stand is essential for securely organizing and safely counting detached surgical needles during a procedure?",
    options: ["Magnetic or foam needle counter box", "Kick bucket", "Towel roll", "Basin of saline"],
    correct: [0],
    explanation: "Used needles must be parked immediately into numbered foam or magnetic needle count boxes to keep sharps immobilized, visible, and safely countable.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 314",
    topic: "Sharps Count Equipment",
    difficulty: "easy"
  },
  {
    sort_order: 30,
    section: "Instrumentation, Equipment, and Supplies",
    type: "mcq_single",
    stem: "Which vascular bulldog clamp is small, spring-loaded, cross-action, and used directly on smaller peripheral blood vessels to temporarily halt blood flow during microvascular repair?",
    options: ["Dieffenbach / Glover bulldog clamp", "Kocher clamp", "Backhaus clamp", "Rochester-Carmalt clamp"],
    correct: [0],
    explanation: "Bulldog clamps are miniature, spring-loaded vascular clamps with atraumatic teeth that pinch small vessels temporarily without crushing the lumen.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 627",
    topic: "Microvascular Clamps",
    difficulty: "medium"
  }
];

// ===========================================================================
// PRACTICE SET C: Hemostasis, Sutures & Wound Healing (30 Questions)
// ===========================================================================
const practiceCQuestions = [
  {
    sort_order: 1,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which parameter indicates the smallest diameter suture strand according to the United States Pharmacopeia (USP) standard numbering system?",
    options: ["#1 suture", "#2-0 suture", "#4-0 suture", "#7-0 suture"],
    correct: [3],
    explanation: "In USP suture sizing, each zero added designates a thinner diameter. #7-0 is much smaller in diameter than 4-0, 2-0, or #1.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 386",
    topic: "Suture Sizing USP",
    difficulty: "easy"
  },
  {
    sort_order: 2,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which suture size is standard for microvascular anastomosis of 1 to 2 mm digital or coronary vessels?",
    options: ["#10-0 or #8-0 Prolene", "#0 Vicryl", "#2 Ethibond", "#3-0 Silk"],
    correct: [0],
    explanation: "Microvascular anastomosis of tiny vessels requires microscopic monofilament suture such as 8-0, 9-0, or 10-0 polypropylene.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 387",
    topic: "Microvascular Suture Sizes",
    difficulty: "easy"
  },
  {
    sort_order: 3,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which natural absorbable suture is derived from the submucosal layer of sheep intestine or serosal layer of beef intestine, treated with chromium salt solution to slow enzymatic breakdown?",
    options: ["Chromic surgical gut", "Plain gut", "Vicryl", "PDS"],
    correct: [0],
    explanation: "Chromic gut is collagen treated with chromium salts to resist rapid enzymatic digestion, extending absorption time to 10-21 days compared to plain gut (7-10 days).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 388",
    topic: "Surgical Gut Sutures",
    difficulty: "easy"
  },
  {
    sort_order: 4,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Why are surgical gut sutures packaged in foil packets soaked in an alcohol-water conditioning fluid?",
    options: [
      "To keep the natural collagen strands pliable and prevent them from drying, stiffening, and snapping",
      "To sterilize the suture immediately before handoff",
      "To dissolve the knots",
      "To prevent allergic reactions"
    ],
    correct: [0],
    explanation: "Natural gut sutures dry out and become brittle if exposed to air. The packaging fluid maintains moisture and flexibility; gut should be used promptly after opening without excessive wiping.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 389",
    topic: "Gut Suture Handling",
    difficulty: "medium"
  },
  {
    sort_order: 5,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which synthetic absorbable monofilament suture composed of poliglecaprone 25 is celebrated for smooth passage through skin during subcuticular closure, absorbing in 90 to 120 days?",
    options: ["Monocryl (poliglecaprone 25)", "PDS", "Silk", "Stainless steel"],
    correct: [0],
    explanation: "Monocryl (poliglecaprone 25) is an absorbable monofilament suture with low tissue reactivity and excellent knotting, popular for cosmetically sensitive subcuticular skin closures.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 390",
    topic: "Monocryl Suture",
    difficulty: "medium"
  },
  {
    sort_order: 6,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which non-absorbable suture has the highest tensile strength, is biologically inert, and is used for sternotomy bone closure and tendon repairs?",
    options: ["Surgical stainless steel", "Polypropylene", "Nylon", "Silk"],
    correct: [0],
    explanation: "Stainless steel suture is completely inert, possesses the highest tensile strength of any suture material, and is standard for wiring median sternotomies and heavy orthopedic fixations.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 393",
    topic: "Steel Suture",
    difficulty: "easy"
  },
  {
    sort_order: 7,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What type of needle has a round tapered body that narrows smoothly to a sharp point, used exclusively on soft tissues like bowel, peritoneum, and subcutaneous fat?",
    options: ["Taper point needle", "Cutting needle", "Reverse cutting needle", "Trocar point needle"],
    correct: [0],
    explanation: "Taper point needles puncture and stretch tissue fibers without slicing, making them the standard choice for visceral gastrointestinal and vascular soft tissues.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 399",
    topic: "Taper Needles",
    difficulty: "easy"
  },
  {
    sort_order: 8,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Why are cutting or reverse cutting needles used on skin instead of taper needles?",
    options: [
      "Skin has a dense, tough keratinized epidermal and dermal collagen layer that requires sharp cutting edges to penetrate without tearing or bending the needle",
      "Cutting needles create smaller puncture holes in skin",
      "Taper needles dissolve in skin",
      "Cutting needles prevent scarring"
    ],
    correct: [0],
    explanation: "Skin dermis is tough and fibrous. Taper needles cannot penetrate skin without excessive force and needle bending; cutting edges slice through the dense dermal collagen smoothly.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 401",
    topic: "Skin Needles",
    difficulty: "easy"
  },
  {
    sort_order: 9,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What type of continuous suture technique runs around the lumen of a tubular organ (such as the base of the appendix or gall bladder stump) to invert the stump when cinched tight?",
    options: ["Pursestring suture", "Figure-of-eight suture", "Horizontal mattress suture", "Interrupted simple suture"],
    correct: [0],
    explanation: "A pursestring suture is a continuous circular inverting stitch placed around the cecal base of the appendix; cinching it tight inverts the contaminated stump into the bowel lumen.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 406",
    topic: "Pursestring Suture Technique",
    difficulty: "easy"
  },
  {
    sort_order: 10,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which interrupted suture technique forms a supportive cross-stitch that distributes wound tension across broad surfaces, frequently used for heavy fascial defect closures?",
    options: ["Figure-of-eight suture", "Continuous running locking stitch", "Subcuticular running stitch", "Lembert stitch"],
    correct: [0],
    explanation: "Figure-of-eight sutures create a cross-brace pattern that holds tension securely over wide fascial tears or anchors heavy pedicles.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 408",
    topic: "Figure-of-Eight Suture",
    difficulty: "medium"
  },
  {
    sort_order: 11,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What small plastic or rubber tubing sleeves are threaded over heavy retention sutures to prevent the suture from cutting into the patient's skin under tension?",
    options: ["Bolsters / bumpers", "T-tubes", "Wick drains", "Towel clips"],
    correct: [0],
    explanation: "Retention bolsters (plastic or rubber bridges/bumpers) cushion retention sutures against the skin, distributing high closure tension and preventing necrosis.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 410",
    topic: "Retention Suture Bolsters",
    difficulty: "easy"
  },
  {
    sort_order: 12,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the primary cellular component that synthesizes the extracellular collagen matrix and ground substance during the proliferative phase of wound healing?",
    options: ["Fibroblast", "Neutrophil", "Erythrocyte", "Basophil"],
    correct: [0],
    explanation: "Fibroblasts are specialized connective tissue cells that migrate into the wound bed to generate collagen fibrils, fibronectin, and glycosaminoglycans.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 413",
    topic: "Wound Cellular Physiology",
    difficulty: "easy"
  },
  {
    sort_order: 13,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which phase of normal physiological blood clotting involves platelets adhering to exposed subendothelial collagen and aggregating to form a primary platelet plug?",
    options: ["Primary hemostasis", "Secondary hemostasis (coagulation cascade)", "Fibrinolysis", "Clot retraction"],
    correct: [0],
    explanation: "Primary hemostasis encompasses vascular spasm, platelet adhesion via von Willebrand factor to exposed collagen, and aggregation to create the temporary platelet plug.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 376",
    topic: "Primary Hemostasis",
    difficulty: "medium"
  },
  {
    sort_order: 14,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the final enzyme in the coagulation cascade that catalyzes the conversion of soluble fibrinogen into insoluble, cross-linked fibrin strands?",
    options: ["Thrombin", "Prothrombinase", "Plasmin", "Factor VIII"],
    correct: [0],
    explanation: "Thrombin (Factor IIa) cleaves fibrinogen peptides to yield fibrin monomers, which polymerize and cross-link to solidify the definitive blood clot.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 377",
    topic: "Coagulation Cascade",
    difficulty: "medium"
  },
  {
    sort_order: 15,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What drug is administered intravenously by the anesthesia provider to provide systemic anticoagulation during vascular bypass clamping, and which drug acts as its specific reversal antidote?",
    options: [
      "Heparin sodium; Protamine sulfate",
      "Coumadin; Vitamin K",
      "Aspirin; Platelet infusion",
      "Lovenox; Calcium gluconate"
    ],
    correct: [0],
    explanation: "Heparin prevents clot formation during arterial cross-clamping. Protamine sulfate is a strongly basic protein that binds heparin to completely neutralize its anticoagulant effect.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 629",
    topic: "Heparin & Protamine",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which passive gravity surgical drain consists of a flat, soft latex or silicone ribbon that allows wound exudate to drain by capillary action onto a dressing sponge?",
    options: ["Penrose drain", "Jackson-Pratt drain", "Hemovac drain", "Chest tube"],
    correct: [0],
    explanation: "A Penrose drain is an open, passive drain that relies on capillary action and gravity to convey drainage into surrounding absorbent sterile gauze pads.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 320",
    topic: "Passive Drains",
    difficulty: "easy"
  },
  {
    sort_order: 17,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which specialized T-shaped latex drain is placed inside the common bile duct during choledochotomy to stent the duct and facilitate continuous external bile drainage?",
    options: ["T-tube", "Foley catheter", "Malecot catheter", "Penrose drain"],
    correct: [0],
    explanation: "A T-tube is inserted into the common bile duct with its crossbars in the duct and long stem exiting the abdominal wall, maintaining duct patency and decompressing biliary pressure.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 510",
    topic: "Biliary T-Tubes",
    difficulty: "easy"
  },
  {
    sort_order: 18,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is an abnormal, hypertrophic scar formation extending far beyond the original surgical incision margins, characterized by excessive, disorganized collagen deposition?",
    options: ["Keloid", "Cicatrix", "Granuloma", "Dehiscence"],
    correct: [0],
    explanation: "Keloids are benign, raised fibrous lesions caused by excessive collagen synthesis that invade normal surrounding skin beyond initial wound boundaries, common in darker skin types.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 424",
    topic: "Scar Abnormalities",
    difficulty: "easy"
  },
  {
    sort_order: 19,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which patient factor significantly impairs normal surgical wound collagen synthesis, angiogenesis, and fibroblast proliferation?",
    options: [
      "Uncontrolled diabetes mellitus and chronic corticosteroid therapy",
      "Adequate nutritional protein intake",
      "Normothermia in the postoperative recovery unit",
      "Adequate tissue oxygenation"
    ],
    correct: [0],
    explanation: "Hyperglycemia impairs leukocyte phagocytosis, while corticosteroids inhibit the inflammatory response, capillary budding, and fibroblast collagen synthesis.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 423",
    topic: "Wound Healing Inhibitors",
    difficulty: "easy"
  },
  {
    sort_order: 20,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What liquid skin adhesive composed of octylcyanoacrylate (Dermabond) is applied topically over approximated skin edges to seal small incisions without staples or suture removal?",
    options: ["Skin adhesive glue (Dermabond)", "Mastisol", "Tincture of benzoin", "Collodion"],
    correct: [0],
    explanation: "Dermabond (2-octyl cyanoacrylate) is a sterile topical liquid adhesive that polymerizes into a flexible waterproof bridge over clean skin edges, sloughing off in 7-10 days.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 427",
    topic: "Skin Adhesives",
    difficulty: "easy"
  },
  {
    sort_order: 21,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the primary difference between monofilament and multifilament braided sutures regarding knot security?",
    options: [
      "Multifilament braided sutures have higher friction between strands and hold knots more securely with fewer throws than slick monofilaments",
      "Monofilament sutures hold knots with only 1 throw",
      "Braided sutures always require 8 throws",
      "There is no difference in knot holding"
    ],
    correct: [0],
    explanation: "Braided sutures generate high surface friction, producing secure knots that resist slippage. Slick monofilaments require 5-6 throws to prevent unraveling.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 387",
    topic: "Knot Security",
    difficulty: "medium"
  },
  {
    sort_order: 22,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which small titanium or absorbable clips are applied across blood vessels using a pistol-grip applier to provide rapid permanent hemostasis?",
    options: ["Hemostatic ligating clips (Hemoclips)", "Skin staples", "Towel clamps", "Babcock clamps"],
    correct: [0],
    explanation: "Ligating clips (titanium, tantalum, or polymer) are squeezed across vessel pedicles to occlude lumens quickly in laparoscopic and open vascular procedures.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 384",
    topic: "Ligating Clips",
    difficulty: "easy"
  },
  {
    sort_order: 23,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What type of dressing uses sterile petrolatum-impregnated or silicone gauze (such as Xeroform) placed directly on the wound bed to allow exudate to pass through without adhering?",
    options: ["Non-adherent contact layer", "Pressure dressing", "Rigid dressing", "Occlusive colostomy wafer"],
    correct: [0],
    explanation: "The primary non-adherent layer (Xeroform/Adaptic) prevents dressing gauze from sticking to delicate new epithelial cells during healing and bandage removal.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 426",
    topic: "Wound Dressings",
    difficulty: "easy"
  },
  {
    sort_order: 24,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which CDC wound classification applies to a total hip arthroplasty performed in a laminar-flow operating room with primary wound closure?",
    options: ["Class I: Clean", "Class II: Clean-Contaminated", "Class III: Contaminated", "Class IV: Dirty"],
    correct: [0],
    explanation: "Elective orthopedic joint replacements are Class I (Clean) because they are uninfected, elective, closed primarily, and do not enter respiratory, GI, or GU systems.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 420",
    topic: "CDC Wound Classification",
    difficulty: "easy"
  },
  {
    sort_order: 25,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the purpose of placing a wet-to-dry dressing on an infected, open surgical cavity?",
    options: [
      "To mechanically debride necrotic debris and slough as the dried gauze is removed from the wound",
      "To completely sterilize the wound overnight",
      "To prevent granulation tissue from forming",
      "To dissolve underlying bone"
    ],
    correct: [0],
    explanation: "In wet-to-dry dressings, moist saline gauze embeds in necrotic slough as it dries; upon peel removal, it mechanically debrides the wound bed to encourage fresh granulation.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 428",
    topic: "Wound Debridement Dressings",
    difficulty: "medium"
  },
  {
    sort_order: 26,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which factor provides the greatest barrier to microorganism proliferation in healing surgical wounds?",
    options: [
      "Active phagocytosis by tissue macrophages and adequate microvascular perfusion",
      "Heavy topical ointment application",
      "Complete limb immobilization in a fiberglass cast",
      "Daily ice pack application"
    ],
    correct: [0],
    explanation: "Macrophages phagocytose bacteria and cellular debris while releasing angiogenic growth factors; robust local blood perfusion supplies oxygen and antibiotics.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 413",
    topic: "Infection Defense Mechanisms",
    difficulty: "medium"
  },
  {
    sort_order: 27,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is the typical time frame for skin suture or staple removal following an uncomplicated abdominal or orthopedic incision?",
    options: ["7 to 10 days", "24 hours", "30 days", "6 weeks"],
    correct: [0],
    explanation: "Skin staples and non-absorbable sutures are typically removed at 7 to 10 days postoperatively once the epithelial seal has formed, preventing suture track scarring.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 425",
    topic: "Suture Removal Timing",
    difficulty: "easy"
  },
  {
    sort_order: 28,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "Which synthetic non-absorbable braided suture coated with silicone or PTFE (trade name Ethibond or Tevdek) is preferred for heart valve sewing rings and tendon repairs?",
    options: ["Polyester suture (Ethibond)", "Plain gut", "Chromic gut", "Vicryl"],
    correct: [0],
    explanation: "Braided polyester sutures (Ethibond) provide permanent high tensile strength and smooth handling, ideal for attaching prosthetic heart valves and anchoring tendons.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 392",
    topic: "Polyester Sutures",
    difficulty: "medium"
  },
  {
    sort_order: 29,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What is an abnormal epithelialized tract communicating between an internal hollow organ and the external skin surface called?",
    options: ["Fistula", "Sinus tract", "Hematoma", "Seroma"],
    correct: [0],
    explanation: "A fistula is an abnormal conduit connecting two visceral epithelial cavities or an internal organ to the exterior skin (e.g., enterocutaneous fistula).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 423",
    topic: "Wound Complications",
    difficulty: "medium"
  },
  {
    sort_order: 30,
    section: "Hemostasis, Wound Healing, and Wound Closure",
    type: "mcq_single",
    stem: "What localized collection of extravasated blood within surgical tissue layers causes pressure, pain, and secondary infection if not evacuated?",
    options: ["Hematoma", "Seroma", "Abscess", "Cicatrix"],
    correct: [0],
    explanation: "A hematoma is a localized pool of clotted blood outside blood vessels that increases wound tension, compromises microvascular perfusion, and serves as a bacterial culture medium.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 12, pg 422",
    topic: "Hematoma",
    difficulty: "easy"
  }
];

// ===========================================================================
// PRACTICE SET D: Surgical Anatomy & Procedural Steps (30 Questions)
// ===========================================================================
const practiceDQuestions = [
  {
    sort_order: 1,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During a laparoscopic cholecystectomy, which two anatomical structures must be positively identified, double-clipped, and divided prior to removing the gallbladder from the liver bed?",
    options: [
      "Cystic duct and cystic artery",
      "Common bile duct and hepatic artery",
      "Portal vein and common hepatic duct",
      "Falciform ligament and left gastric artery"
    ],
    correct: [0],
    explanation: "The Critical View of Safety requires dissecting Calot's triangle until only two structures enter the gallbladder: the cystic duct and the cystic artery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 504",
    topic: "Laparoscopic Cholecystectomy",
    difficulty: "easy"
  },
  {
    sort_order: 2,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What small, blind-ended lymphatic organ arises from the posteromedial wall of the cecum approximately 2 cm below the ileocecal valve?",
    options: ["Vermiform appendix", "Meckel's diverticulum", "Sigmoid epiploic appendage", "Spleen"],
    correct: [0],
    explanation: "The vermiform appendix arises from the cecum where the three taeniae coli converge on the posteromedial cecal wall.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 488",
    topic: "Cecal Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 3,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which anatomical structure carries sperm from the epididymis through the inguinal canal into the ejaculatory duct, and is isolated and transected during a vasectomy?",
    options: ["Ductus (vas) deferens", "Spermatic vein", "Pampiniform plexus", "Cremaster muscle"],
    correct: [0],
    explanation: "The vas deferens is the muscular tube coursing within the spermatic cord that propels spermatozoa from the epididymis to the prostatic urethra.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 19, pg 584",
    topic: "Male Reproductive Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 4,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During open inguinal hernia repair, which anatomical layer of the spermatic cord is incised longitudinally to expose the indirect hernia sac?",
    options: ["Cremasteric muscle and fascia", "Dartos muscle", "Rectus sheath", "Scarpa's fascia"],
    correct: [0],
    explanation: "The spermatic cord is enveloped by external spermatic fascia, cremasteric muscle/fascia, and internal spermatic fascia; opening the cremasteric fibers exposes the anteromedial hernia sac.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 484",
    topic: "Inguinal Hernia Repair",
    difficulty: "medium"
  },
  {
    sort_order: 5,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which retroperitoneal endocrine glands sit like caps atop the superior poles of each kidney and produce adrenaline, aldosterone, and cortisol?",
    options: ["Adrenal (suprarenal) glands", "Parathyroid glands", "Thymus glands", "Islets of Langerhans"],
    correct: [0],
    explanation: "The adrenal glands reside in Gerota's fascia above each kidney; the cortex secretes steroid hormones (aldosterone/cortisol) and the medulla secretes catecholamines (epinephrine).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 19, pg 579",
    topic: "Adrenal Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 6,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which vessel is clamped first during carotid endarterectomy to prevent embolization of plaque fragments into the cerebral circulation?",
    options: ["Internal carotid artery", "External carotid artery", "Common carotid artery", "Superior thyroid artery"],
    correct: [0],
    explanation: "The internal carotid artery (ICA) is clamped first so that any micro-thrombi loosened during surgical manipulation are diverted harmlessly into the external carotid circulation rather than the brain.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 633",
    topic: "Carotid Endarterectomy Clamping",
    difficulty: "hard"
  },
  {
    sort_order: 7,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In coronary artery bypass graft (CABG) surgery, which in-situ arterial graft is harvested from the anterior chest wall to revascularize the left anterior descending (LAD) coronary artery?",
    options: ["Internal mammary (internal thoracic) artery", "Radial artery", "Gastroepiploic artery", "Femoral artery"],
    correct: [0],
    explanation: "The Left Internal Mammary Artery (LIMA) is the conduit of choice for LAD bypass due to its superior long-term patency exceeding 90% at 10 years.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 22, pg 664",
    topic: "CABG Conduits",
    difficulty: "medium"
  },
  {
    sort_order: 8,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the primary anatomical landmark for identifying the recurrent laryngeal nerve during thyroid lobectomy?",
    options: [
      "Tracheoesophageal groove and inferior thyroid artery crossing",
      "Superior vena cava",
      "Carotid bifurcation",
      "Hyoid bone"
    ],
    correct: [0],
    explanation: "The recurrent laryngeal nerve ascends within the tracheoesophageal groove, closely related to the branches of the inferior thyroid artery before entering the larynx.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 15, pg 462",
    topic: "Thyroidectomy Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 9,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which anatomical joint in the human body is classified as a ball-and-socket synovial joint with the greatest range of multi-axial motion?",
    options: ["Glenohumeral (shoulder) joint", "Tibiofemoral (knee) joint", "Humeroulnar (elbow) joint", "Subtalar joint"],
    correct: [0],
    explanation: "The glenohumeral joint is a ball-and-socket joint that permits flexion, extension, abduction, adduction, circumduction, and rotation, sacrificing skeletal stability for mobility.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 597",
    topic: "Joint Classifications",
    difficulty: "easy"
  },
  {
    sort_order: 10,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In total knee arthroplasty (TKA), which major knee ligament is routinely sacrificed during bone resection and replaced by the prosthetic polyethylene tibial insert?",
    options: ["Anterior cruciate ligament (ACL)", "Patellar tendon", "Medial collateral ligament (MCL)", "Lateral collateral ligament (LCL)"],
    correct: [0],
    explanation: "The anterior cruciate ligament (ACL) is excised during tibial and femoral plateau preparation in standard total knee replacements; the posterior cruciate may be preserved or sacrificed.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 612",
    topic: "Total Knee Arthroplasty",
    difficulty: "medium"
  },
  {
    sort_order: 11,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which cranial meningeal layer is the tough, fibrous, outermost membrane lining the interior of the cranium and forming the falx cerebri and tentorium cerebelli?",
    options: ["Dura mater", "Arachnoid mater", "Pia mater", "Ependyma"],
    correct: [0],
    explanation: "The dura mater ('tough mother') is the thickest, outermost protective meningeal layer adhering directly to the inner table of cranial bones.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 23, pg 682",
    topic: "Meningeal Layers",
    difficulty: "easy"
  },
  {
    sort_order: 12,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During craniotomy, where does cerebrospinal fluid (CSF) circulate between the delicate middle and inner meningeal layers?",
    options: ["Subarachnoid space", "Epidural space", "Subdural space", "Central canal"],
    correct: [0],
    explanation: "CSF flows continuously through the subarachnoid space situated between the arachnoid membrane and the underlying pia mater that clings to cerebral convolutions.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 23, pg 683",
    topic: "CSF Circulation",
    difficulty: "easy"
  },
  {
    sort_order: 13,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which long bone in the lower extremity is the non-weight-bearing lateral stabilizer commonly harvested for vascularized fibular autografts in mandible or spine reconstruction?",
    options: ["Fibula", "Tibia", "Femur", "Patella"],
    correct: [0],
    explanation: "The fibula bears minimal axial skeletal weight (<15%), making its mid-shaft and peroneal vascular pedicle ideal for composite microvascular bony autografts.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 602",
    topic: "Lower Extremity Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 14,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the primary anatomical landmark used to localize the transverse colon during exploratory laparotomy?",
    options: [
      "The greater omentum attached along its anterior surface and the three longitudinal taeniae coli bands",
      "Peyer's patches",
      "Brunner's glands",
      "Islets of Langerhans"
    ],
    correct: [0],
    explanation: "The large intestine is recognized by three longitudinal muscle bands (taeniae coli), sacculations (haustra), epiploic fatty appendages, and the attached greater omentum on the transverse colon.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 493",
    topic: "Colonic Anatomy",
    difficulty: "medium"
  },
  {
    sort_order: 15,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During a cesarean section delivery, what transverse lower abdominal incision through skin and subcutaneous fat along the Pfannenstiel line is standard?",
    options: ["Pfannenstiel curved low transverse incision", "McBurney muscle-splitting incision", "Kocher subcostal incision", "Chevron bilateral subcostal incision"],
    correct: [0],
    explanation: "The Pfannenstiel incision is a curved transverse incision made 2-3 cm above the pubic symphysis along natural skin lines, offering superior cosmetic healing and fascial strength.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 18, pg 552",
    topic: "Obstetric Incisions",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which incision provides optimal open surgical exposure to the gallbladder, liver, and biliary tree in the right upper quadrant?",
    options: ["Right subcostal (Kocher) incision", "McBurney incision", "Pfannenstiel incision", "Midline longitudinal incision"],
    correct: [0],
    explanation: "The right subcostal (Kocher) incision parallels the right costal margin 2 cm below the ribs, offering direct visualization of the liver, gallbladder, and biliary ductal system.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 500",
    topic: "Abdominal Incisions",
    difficulty: "easy"
  },
  {
    sort_order: 17,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which anatomical structure separates the thoracic cavity from the abdominopelvic cavity and functions as the primary skeletal muscle of inspiration?",
    options: ["Diaphragm", "Transversus abdominis", "Intercostal muscles", "Psoas major"],
    correct: [0],
    explanation: "The diaphragm is a dome-shaped musculotendinous partition separating thorax and abdomen, innervated by the phrenic nerves (C3, C4, C5).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 22, pg 646",
    topic: "Diaphragm Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 18,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which three structures pass through distinct openings in the diaphragm?",
    options: [
      "Inferior vena cava (T8), Esophagus (T10), and Aorta (T12)",
      "Trachea, Carotid artery, and Jugular vein",
      "Femoral artery, Femoral vein, and Saphenous nerve",
      "Celiac axis, Renal artery, and Ureter"
    ],
    correct: [0],
    explanation: "The three major diaphragmatic hiatuses are: caval opening (T8) for IVC, esophageal hiatus (T10) for esophagus and vagus nerves, and aortic hiatus (T12) for descending aorta and thoracic duct.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 475",
    topic: "Diaphragmatic Apertures",
    difficulty: "hard"
  },
  {
    sort_order: 19,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the primary anatomical function of the spleen in human immunology and hematology?",
    options: [
      "Filtering aged senescent erythrocytes, storing platelets, and mounting IgM antibody immune responses against encapsulated bacteria",
      "Secreting digestive enzymes into the duodenum",
      "Producing bile acids",
      "Concentrating urine"
    ],
    correct: [0],
    explanation: "The spleen's red pulp filters old RBCs and debris; its white pulp contains lymphoid follicles producing antibodies against encapsulated pathogens (Pneumococcus, Meningococcus).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 515",
    topic: "Splenic Physiology",
    difficulty: "medium"
  },
  {
    sort_order: 20,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During an open abdominal aortic aneurysm (AAA) repair, which major renal vessels crossing anterior to the aorta must be mobilized to safely place the proximal aortic cross-clamp?",
    options: ["Left renal vein", "Inferior mesenteric artery", "Right ovarian artery", "Portal vein"],
    correct: [0],
    explanation: "The left renal vein crosses anteriorly over the abdominal aorta directly beneath the origin of the SMA; mobilizing it is crucial for exposing the infrarenal aortic neck.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 21, pg 636",
    topic: "AAA Vascular Anatomy",
    difficulty: "hard"
  },
  {
    sort_order: 21,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In ophthalmology, what is the clear, circular, avascular anterior portion of the fibrous outer tunic of the eye that refracts light into the pupil?",
    options: ["Cornea", "Sclera", "Choroid", "Retina"],
    correct: [0],
    explanation: "The cornea is the transparent anterior window of the eye that accounts for roughly two-thirds of the optical refractive power, receiving oxygen directly from air and tears.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 14, pg 444",
    topic: "Ocular Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 22,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During cataract extraction (phacoemulsification), what cloudy, opaque natural anatomical structure is fragmented and replaced by an artificial intraocular lens (IOL)?",
    options: ["Crystalline lens", "Cornea", "Vitreous humor", "Iris"],
    correct: [0],
    explanation: "A cataract is an opacification of the natural biconvex crystalline lens of the eye; phacoemulsification uses ultrasonic energy to break it apart inside the capsular bag.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 14, pg 448",
    topic: "Cataract Surgery",
    difficulty: "easy"
  },
  {
    sort_order: 23,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which anatomical ossicle in the middle ear is shaped like a stirrup and connects the incus to the oval window of the cochlea?",
    options: ["Stapes", "Malleus (hammer)", "Incus (anvil)", "Tympanic membrane"],
    correct: [0],
    explanation: "The three auditory ossicles are Malleus, Incus, and Stapes. The stapes footplate vibrates against the oval window fluid of the inner ear.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 17, pg 524",
    topic: "Middle Ear Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 24,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In ENT surgery, which surgical procedure involves creating a microscopic opening in the tympanic membrane to suction middle ear fluid and insert pressure-equalizing (PE) tubes?",
    options: ["Myringotomy", "Mastoidectomy", "Tympanoplasty", "Stapedectomy"],
    correct: [0],
    explanation: "Myringotomy (tympanostomy) is an incisional slit made in the inferior quadrant of the eardrum to ventilate the middle ear space and place PE tubes for chronic otitis media.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 17, pg 526",
    topic: "Myringotomy",
    difficulty: "easy"
  },
  {
    sort_order: 25,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which major salivary gland is the largest, located anterior and inferior to the external ear canal, and produces watery serous saliva transmitted through Stensen's duct?",
    options: ["Parotid gland", "Submandibular gland", "Sublingual gland", "Thyroid gland"],
    correct: [0],
    explanation: "The parotid gland is the largest salivary gland, draining via Stensen's duct into the oral vestibule opposite the second upper molar.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 17, pg 530",
    topic: "Salivary Gland Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 26,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "During lumbar laminectomy for herniated disc removal, which yellow, elastic ligament connecting the laminae of adjacent vertebrae is incised to enter the spinal canal?",
    options: ["Ligamentum flavum", "Posterior longitudinal ligament", "Anterior longitudinal ligament", "Interspinous ligament"],
    correct: [0],
    explanation: "The ligamentum flavum ('yellow ligament') connects adjacent vertebral laminae; surgeons excise it to expose the underlying thecal sac and nerve roots.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 23, pg 686",
    topic: "Spinal Ligaments",
    difficulty: "medium"
  },
  {
    sort_order: 27,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "What is the primary anatomical function of the meniscus fibrocartilage pads in the human knee joint?",
    options: [
      "Shock absorption, load distribution, and deepening the tibial articulating surface for the femoral condyles",
      "Producing red blood cells",
      "Connecting the patella to the fibula",
      "Preventing venous stasis"
    ],
    correct: [0],
    explanation: "The medial and lateral crescent-shaped menisci act as shock absorbers that disperse 50-70% of compressive axial loads and lubricate the knee joint.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 601",
    topic: "Knee Meniscus Anatomy",
    difficulty: "easy"
  },
  {
    sort_order: 28,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which ligament in the ankle is the most commonly torn ligament in inversion ankle sprains and sports reconstructions?",
    options: ["Anterior talofibular ligament (ATFL)", "Deltoid ligament", "Calcaneonavicular ligament", "Plantar fascia"],
    correct: [0],
    explanation: "The Anterior Talofibular Ligament (ATFL) spans from the lateral malleolus to the talus neck and is the primary lateral stabilizer injured during hyper-inversion trauma.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 20, pg 603",
    topic: "Ankle Ligaments",
    difficulty: "medium"
  },
  {
    sort_order: 29,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "In urology, what is the triangular smooth anatomical region of the bladder floor bounded by the bilateral ureteral orifices and the internal urethral meatus?",
    options: ["Trigone of the bladder", "Detrusor dome", "Urachus", "Prostatic utricle"],
    correct: [0],
    explanation: "The trigone is a smooth triangular mucosal area at the bladder base formed between the two ureteric openings superiorly and the internal urethral sphincter inferiorly.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 19, pg 581",
    topic: "Bladder Trigone",
    difficulty: "easy"
  },
  {
    sort_order: 30,
    section: "Surgical Anatomy & Physiology",
    type: "mcq_single",
    stem: "Which major abdominal vein is formed by the union of the superior mesenteric vein and the splenic vein, carrying nutrient-rich deoxygenated blood to the liver for metabolic processing?",
    options: ["Hepatic portal vein", "Inferior vena cava", "Renal vein", "Azygos vein"],
    correct: [0],
    explanation: "The hepatic portal vein forms behind the pancreatic neck by the confluence of the splenic vein and superior mesenteric vein, conducting blood to hepatic sinusoids.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 16, pg 505",
    topic: "Hepatic Portal System",
    difficulty: "medium"
  }
];

// ===========================================================================
// PRACTICE SET E: OR Safety, Environmental Controls & Legal Ethics (30 Qs)
// ===========================================================================
const practiceEQuestions = [
  {
    sort_order: 1,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which patient surgical position involves the patient lying flat on their back with legs abducted and elevated in padded stirrups, exposing the perineum for pelvic, rectal, or gynecological procedures?",
    options: ["Lithotomy position", "Trendelenburg position", "Prone position", "Fowler's position"],
    correct: [0],
    explanation: "Lithotomy position places the patient supine with hips flexed and legs raised in padded stirrups. Both legs must be raised and lowered simultaneously by two staff members.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 300",
    topic: "Patient Positioning",
    difficulty: "easy"
  },
  {
    sort_order: 2,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Why must both of the patient's legs be raised and lowered simultaneously and slowly by two surgical team members when placing a patient into or out of lithotomy stirrups?",
    options: [
      "To prevent sudden severe hypotension from rapid blood pooling and to avoid hip dislocation or lumbar torsional strain",
      "To prevent contamination of the anesthesia circuit",
      "To test knee flexion angles",
      "To keep the patient awake"
    ],
    correct: [0],
    explanation: "Lowering legs rapidly shifts 500-1000 mL of blood from the central torso into lower extremities, causing sudden cardiovascular collapse and dangerous hypotension.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 301",
    topic: "Lithotomy Safety",
    difficulty: "medium"
  },
  {
    sort_order: 3,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which nerve in the lower extremity is at high risk for compression palsy if the lateral knee or fibular head presses against metal lithotomy stirrup uprights without adequate gel padding?",
    options: ["Common peroneal (fibular) nerve", "Femoral nerve", "Sciatic nerve", "Obturator nerve"],
    correct: [0],
    explanation: "The common peroneal nerve wraps around the neck of the fibula; compression against unpadded stirrups produces foot drop (inability to dorsiflex the foot).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 302",
    topic: "Nerve Injury Prevention",
    difficulty: "medium"
  },
  {
    sort_order: 4,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "In which surgical position is the operating table tilted head-down with the pelvis higher than the head, allowing gravity to shift abdominal viscera cephalad toward the diaphragm?",
    options: ["Trendelenburg position", "Reverse Trendelenburg position", "Sims position", "Jackknife (Kraske) position"],
    correct: [0],
    explanation: "Trendelenburg position tilts the head downward 15-30 degrees, shifting bowel out of the pelvis to improve visibility during lower abdominal and pelvic laparoscopic surgery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 298",
    topic: "Trendelenburg Position",
    difficulty: "easy"
  },
  {
    sort_order: 5,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the primary respiratory complication of prolonged steep Trendelenburg position?",
    options: [
      "Elevated diaphragmatic pressure causing reduced lung compliance, decreased tidal volume, and elevated intracranial/intraocular pressure",
      "Severe hypocapnia",
      "Increased vital lung capacity",
      "Bronchospasm from cold air"
    ],
    correct: [0],
    explanation: "Abdominal viscera push upward against the diaphragm in Trendelenburg position, reducing lung compliance and tidal volume while venous pooling elevates ICP and IOP.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 299",
    topic: "Positioning Pathophysiology",
    difficulty: "medium"
  },
  {
    sort_order: 6,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which position is standard for operative exposure during thyroidectomy, carotid endarterectomy, and laparoscopic cholecystectomy, where the table is tilted head-up and feet-down?",
    options: ["Reverse Trendelenburg position", "Trendelenburg position", "Prone position", "Lateral kidney position"],
    correct: [0],
    explanation: "Reverse Trendelenburg tilts the patient head-up, facilitating venous drainage from the neck/head and allowing gravity to pull abdominal viscera caudad for gallbladder exposure.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 299",
    topic: "Reverse Trendelenburg",
    difficulty: "easy"
  },
  {
    sort_order: 7,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "In the lateral decubitus position used for nephrectomy or thoracotomy, what soft supportive device must be placed under the dependent axilla to protect the brachial plexus from compression?",
    options: ["Axillary roll", "Footboard", "Chest bolster", "Mayo stand"],
    correct: [0],
    explanation: "An axillary roll is positioned just caudad to the dependent axilla on the lateral chest wall to relieve direct pressure on the brachial plexus and axillary vascular bundle.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 304",
    topic: "Axillary Roll Safety",
    difficulty: "medium"
  },
  {
    sort_order: 8,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "When transferring an anesthetized patient from the operating table to the transport stretcher, who is in charge of directing the timing and movement of the transfer team?",
    options: [
      "The anesthesia care provider at the patient's head",
      "The surgical technologist at the sterile field",
      "The orderly at the foot of the bed",
      "The recovery room nurse"
    ],
    correct: [0],
    explanation: "The anesthesia provider maintains airway stability and cervical spine alignment at the patient's head and always calls the verbal count to initiate patient transfer.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 296",
    topic: "Patient Transfer Safety",
    difficulty: "easy"
  },
  {
    sort_order: 9,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the primary physiological mechanism that causes perioperative hypothermia in surgical patients under general anesthesia?",
    options: [
      "Anesthetic-induced inhibition of hypothalamic thermoregulation combined with vasodilation and cold laminar airflow in the OR",
      "Excessive IV fluid warmth",
      "Surgical scrub solutions",
      "Electrosurgical grounding pads"
    ],
    correct: [0],
    explanation: "General and regional anesthetics suppress the hypothalamus, preventing shivering and vasoconstriction. Peripheral vasodilation redistributes core heat to the cool body shell.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 308",
    topic: "Thermoregulation",
    difficulty: "medium"
  },
  {
    sort_order: 10,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which active warming system uses a motorized generator to blow temperature-controlled warmed air through disposable channeled blankets (e.g., Bair Hugger) to prevent hypothermia?",
    options: ["Forced-air warming system", "Radiant heat lamp", "Cotton thermal blanket", "Circulating water mattress"],
    correct: [0],
    explanation: "Forced-air warming units (Bair Hugger) deliver convective heated air across the patient's cutaneous surface, representing the standard clinical defense against hypothermia.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 309",
    topic: "Hypothermia Prevention",
    difficulty: "easy"
  },
  {
    sort_order: 11,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What life-threatening pharmacogenetic skeletal muscle crisis is triggered by volatile inhalational anesthetics (sevoflurane, desflurane) or succinylcholine, requiring immediate administration of dantrolene sodium?",
    options: ["Malignant hyperthermia (MH)", "Neuroleptic malignant syndrome", "Anaphylaxis", "Thyroid storm"],
    correct: [0],
    explanation: "Malignant hyperthermia is an inherited hypermetabolic disorder caused by uncontrolled calcium release in skeletal muscle. Dantrolene sodium (Ryanodex) is the specific intracellular calcium-channel blocker.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 9, pg 278",
    topic: "Malignant Hyperthermia",
    difficulty: "easy"
  },
  {
    sort_order: 12,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the earliest and most sensitive clinical sign of developing malignant hyperthermia in an anesthetized patient?",
    options: [
      "Unexplained rapid increase in end-tidal carbon dioxide (elevated ETCO2) and tachycardia",
      "Sudden fever reaching 108°F",
      "Cyanosis of fingertips",
      "Dilated pupils"
    ],
    correct: [0],
    explanation: "Hypercapnia (elevated ETCO2) from hypermetabolism is the earliest sign of MH, occurring long before the dramatic late spike in body temperature.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 9, pg 280",
    topic: "MH Clinical Manifestations",
    difficulty: "medium"
  },
  {
    sort_order: 13,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What immediate action should the surgical team take if a drape fire breaks out on the patient in the operating room?",
    options: [
      "Immediately smother the flame with wet towels/saline, disconnect oxygen/breathing circuits, remove burning drapes from patient, and assess patient injury",
      "Call the municipal fire department and evacuate the building immediately leaving the patient",
      "Spray the patient's wound with dry chemical powder",
      "Turn off room lights"
    ],
    correct: [0],
    explanation: "Immediate response: halt ventilation gases, extinguish flames with sterile water or saline, strip smoldering drapes off the patient to the floor, and maintain patient airway.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 113",
    topic: "OR Fire Protocol",
    difficulty: "easy"
  },
  {
    sort_order: 14,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "Which civil legal tort involves touching a patient without legal authorization or consent, such as performing a bilateral tubal ligation when consent was signed for appendectomy only?",
    options: ["Battery", "Assault", "Slander", "Defamation"],
    correct: [0],
    explanation: "Battery is the intentional, non-consensual physical contact with another person. Performing an unconsented procedure or operating on the wrong site constitutes civil battery.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 33",
    topic: "Civil Torts",
    difficulty: "easy"
  },
  {
    sort_order: 15,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What legal term defines an act of omission (failing to do what a reasonable, prudent healthcare professional would do) or commission (doing what should not have been done)?",
    options: ["Negligence", "Malice", "Battery", "Breach of warranty"],
    correct: [0],
    explanation: "Negligence is the departure from standard professional care that a reasonably prudent surgical technologist or nurse would exercise under similar circumstances.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 32",
    topic: "Negligence & Malpractice",
    difficulty: "easy"
  },
  {
    sort_order: 16,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What are the four mandatory legal elements that a plaintiff must prove to substantiate medical malpractice against a healthcare professional?",
    options: [
      "Duty of care, Breach of duty, Causation (proximate cause), and Damages (actual harm)",
      "Intention, Anger, Retaliation, and Injury",
      "Contract, Fee payment, Negligence, and Discharge",
      "Licensure, Insurance, Fault, and Guilt"
    ],
    correct: [0],
    explanation: "A malpractice lawsuit requires proving all four 'D's: Duty owed, Dereliction (breach) of duty, Direct proximate causation, and actual Damages suffered by the patient.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 35",
    topic: "Malpractice Elements",
    difficulty: "medium"
  },
  {
    sort_order: 17,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What is the primary objective of the Joint Commission Universal Protocol and pre-incision 'Time-Out' performed immediately before incision?",
    options: [
      "To verify correct patient identity, correct procedure, correct surgical site and side, and confirm prophylactic antibiotic administration",
      "To check staff vacation schedules",
      "To count sterile instruments",
      "To calibrate anesthesia machines"
    ],
    correct: [0],
    explanation: "The surgical 'Time-Out' ensures the entire surgical team pauses all activity immediately prior to skin incision to actively agree on patient identity, procedure, side, site, implants, and fire risk.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 316",
    topic: "Time-Out Universal Protocol",
    difficulty: "easy"
  },
  {
    sort_order: 18,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What standard counting sequence should the surgical technologist and circulating nurse follow when executing surgical counts?",
    options: [
      "Surgical field &rarr; Mayo stand &rarr; Back table &rarr; Off-field (kick buckets and trash)",
      "Off-field &rarr; Back table &rarr; Mayo stand &rarr; Field",
      "Field only",
      "Trash buckets first"
    ],
    correct: [0],
    explanation: "Counts always follow a standardized spatial progression: closest to the patient wound (surgical field) &rarr; Mayo stand &rarr; back table &rarr; off-field kick buckets and sponge baggers.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 313",
    topic: "Count Sequence",
    difficulty: "easy"
  },
  {
    sort_order: 19,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What is the primary danger when laser energy strikes reflective, shiny stainless steel instruments in the surgical field?",
    options: [
      "Specular reflection of the beam diverting into adjacent tissues or personnel eyes, causing accidental retinal burns",
      "Instrument magnetization",
      "Instrument corrosion",
      "Static electricity"
    ],
    correct: [0],
    explanation: "Specular reflection from shiny metal mirrors laser beams unpredictably into non-target patient organs or OR personnel eyes; black anodized (ebonized) instruments absorb beam reflections.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 105",
    topic: "Laser Beam Reflections",
    difficulty: "medium"
  },
  {
    sort_order: 20,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What color eyewear filter is required for surgical team members to protect their retinas when operating an Argon laser?",
    options: ["Amber / Orange", "Clear glass", "Red", "Blue"],
    correct: [0],
    explanation: "Argon lasers emit visible blue-green light (488-514 nm); protective goggles must feature amber/orange optical density filters to block this wavelength.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 105",
    topic: "Laser Eye Protection",
    difficulty: "hard"
  },
  {
    sort_order: 21,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Why are safety belts placed over the patient's thighs 2 inches proximal to the knees once the patient is positioned on the operating table?",
    options: [
      "To prevent the patient from falling off the narrow operating table during anesthesia induction, position changes, or emergence",
      "To occlude arterial blood flow",
      "To anchor the sterile drape",
      "To check leg reflexes"
    ],
    correct: [0],
    explanation: "The safety strap is placed snugly over the thighs (2 inches above knees) with a two-finger space beneath to ensure the patient does not shift or fall from the table.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 297",
    topic: "Patient Safety Straps",
    difficulty: "easy"
  },
  {
    sort_order: 22,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "When using an ESU pencil near the head or neck during surgery under supplemental oxygen delivered via nasal cannula, what precaution must be strictly enforced?",
    options: [
      "Stop or reduce oxygen delivery during electrocautery activation and ensure no oxygen pocketing occurs under drapes",
      "Increase oxygen flow to 100%",
      "Use wet Ray-Tec sponges without water",
      "Avoid wearing gloves"
    ],
    correct: [0],
    explanation: "Oxygen pooling under drapes creates an oxygen-enriched atmosphere (>21%) that ignites explosively with a single spark from an active electrocautery pencil.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 112",
    topic: "Oxygen Enrichment Fire Hazards",
    difficulty: "medium"
  },
  {
    sort_order: 23,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which document must be readily available in the operating suite for every hazardous chemical used (such as formalin, glutaraldehyde, and bone cement) detailing emergency exposure and spill protocols?",
    options: ["Safety Data Sheet (SDS)", "Surgical logbook", "Pathology requisition", "Operating permit"],
    correct: [0],
    explanation: "OSHA mandates that Safety Data Sheets (SDS, formerly MSDS) be immediately accessible to all employees for every hazardous chemical present in the facility.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 107",
    topic: "OSHA Safety Data Sheets",
    difficulty: "easy"
  },
  {
    sort_order: 24,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "In what container must surgical tissue specimens slated for routine permanent histology sections be preserved by the surgical technologist?",
    options: [
      "In a leakproof container submerged in 10% neutral buffered formalin",
      "In sterile distilled water",
      "In 70% alcohol",
      "Wrapped in dry gauze"
    ],
    correct: [0],
    explanation: "Routine permanent pathology specimens are placed in 10% neutral buffered formalin solution (which fixes tissue proteins). Fresh frozen sections and stones are exceptions sent dry.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 324",
    topic: "Specimen Preservation",
    difficulty: "easy"
  },
  {
    sort_order: 25,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "How should a tissue specimen intended for immediate intraoperative 'Frozen Section' diagnosis be sent to the pathology laboratory by the CST?",
    options: [
      "Sent immediately FRESH and DRY in a sterile specimen cup without any formalin or liquid fixative",
      "Submerged in formalin",
      "Soaked in sterile saline",
      "Placed in an autoclave"
    ],
    correct: [0],
    explanation: "Frozen section specimens must be sent fresh and dry immediately so pathologists can freeze, slice, and stain the tissue within minutes without formalin artifact.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 10, pg 325",
    topic: "Frozen Section Handling",
    difficulty: "easy"
  },
  {
    sort_order: 26,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What is an event called that results in unanticipated death or serious physical or psychological injury to a patient (such as wrong-site surgery or retained foreign object)?",
    options: ["Sentinel event", "Near miss", "Tort", "Misdemeanor"],
    correct: [0],
    explanation: "The Joint Commission defines a Sentinel Event as an unexpected occurrence involving death or serious physical or psychological injury that signals the need for immediate investigation (root cause analysis).",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 40",
    topic: "Sentinel Events",
    difficulty: "easy"
  },
  {
    sort_order: 27,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What is an 'advance directive' in medical legal ethics?",
    options: [
      "A legal document stating a patient's medical wishes and care choices in the event they become incapacitated (e.g., Living Will or Durable Power of Attorney)",
      "A surgeon's operative preference card",
      "A nurse's transfer orders",
      "A hospital billing policy"
    ],
    correct: [0],
    explanation: "Advance directives are legal documents (such as living wills and durable powers of attorney for healthcare) that outline an individual's treatment preferences if they lose decision-making capacity.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 2, pg 43",
    topic: "Advance Directives",
    difficulty: "easy"
  },
  {
    sort_order: 28,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "Which agency regulates the efficacy and labeling of hospital disinfectants and chemical sterilants in the United States?",
    options: ["Environmental Protection Agency (EPA)", "Department of Transportation (DOT)", "Federal Trade Commission (FTC)", "Joint Commission"],
    correct: [0],
    explanation: "The EPA evaluates and registers hospital disinfectants used on environmental surfaces to ensure antimicrobial claims and environmental safety.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 97",
    topic: "Regulatory Agencies",
    difficulty: "medium"
  },
  {
    sort_order: 29,
    section: "Physical Environment and Safety Standards",
    type: "mcq_single",
    stem: "What device is worn on the collar outside the lead apron by OR personnel to monitor cumulative monthly radiation exposure during fluoroscopy procedures?",
    options: ["Film badge dosimeter (radiation dosimeter)", "Pulse oximeter", "Magnetic sensor", "Barometer"],
    correct: [0],
    explanation: "Personnel radiation dosimeters (film badges, TLDs, or OSLDs) monitor cumulative ionizing radiation doses to ensure occupational exposures remain below ALARA limits.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 4, pg 109",
    topic: "Radiation Dosimetry",
    difficulty: "easy"
  },
  {
    sort_order: 30,
    section: "Profession of CST",
    type: "mcq_single",
    stem: "What term describes the professional obligation to maintain one's clinical competency through ongoing continuing education, certifications, and recertification cycles throughout one's surgical technology career?",
    options: ["Continuing Professional Development (CPD)", "Statute of limitations", "Respondeat superior", "Vicarious liability"],
    correct: [0],
    explanation: "Continuing Professional Development (CPD) requires certified surgical technologists to earn continuing education credits (CEs) periodically to maintain NBSTSA active certification.",
    source_ref: "AST Core Curriculum 6th Ed., Ch. 1, pg 21",
    topic: "Continuing Competency",
    difficulty: "easy"
  }
];

// Write file helper
function writeJson(fileName, slug, title, isFree, questions) {
  const data = {
    test_slug: slug,
    test_meta: {
      title: title,
      event: "ST",
      kind: "practice",
      total_questions: questions.length,
      duration_min: 45,
      instant_feedback: true,
      is_free: isFree,
      shuffle_questions: false
    },
    questions: questions
  };
  const targetPath = path.resolve(process.cwd(), "data", fileName);
  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Generated ${fileName} with ${questions.length} questions.`);
}

writeJson("st-practice-set-b-30q.json", "st-practice-set-b", "ST – Practice Set B: Surgical Instrumentation & Mayo Stand Setup", false, practiceBQuestions);
writeJson("st-practice-set-c-30q.json", "st-practice-set-c", "ST – Practice Set C: Hemostasis, Sutures & Wound Closure", false, practiceCQuestions);
writeJson("st-practice-set-d-30q.json", "st-practice-set-d", "ST – Practice Set D: Surgical Anatomy & Procedural Steps", false, practiceDQuestions);
writeJson("st-practice-set-e-30q.json", "st-practice-set-e", "ST – Practice Set E: OR Safety, Environmental Controls & Legal Ethics", false, practiceEQuestions);

