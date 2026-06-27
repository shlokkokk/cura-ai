const caseStudies = [
  {
    id: "case-1",
    name: "Amina Hassan",
    age: 27,
    gender: "Female",
    role: "Teacher",
    complaint: "Fever, cough, and shortness of breath",
    specialty: "Respiratory Medicine",
    complexity: "Moderate",
    urgency: "Urgent but stable",
    personality: "Anxious but cooperative",
    summary: "A young adult presenting with infectious respiratory symptoms and pleuritic chest discomfort.",
    vitals: "Temp 38.6 C, HR 108, RR 24, BP 108/68, SpO2 93%",
    history: "Asthma in childhood, no regular medicines, non-smoker.",
    keyFacts: [
      { label: "Onset", value: "3 days, worsening since yesterday" },
      { label: "Associated symptoms", value: "Productive cough, chills, right-sided chest pain" },
      { label: "Risk factors", value: "Recent exposure to sick students at work" },
      { label: "Hidden clue", value: "Pain increases when taking a deep breath" }
    ],
    expectedDiagnosis: ["community acquired pneumonia", "pneumonia"],
    differentialDiagnoses: [
      "Bronchitis",
      "Pulmonary embolism",
      "Viral lower respiratory tract infection"
    ],
    redFlags: [
      "Worsening shortness of breath",
      "Low oxygen saturation",
      "Pleuritic chest pain",
      "Fever with productive cough"
    ],
    expectedQuestions: [
      "When did the symptoms start and how have they progressed?",
      "Are you producing sputum or mucus?",
      "Do you have chest pain when breathing or coughing?",
      "How severe is the shortness of breath?",
      "Any smoking history, asthma, or drug allergies?"
    ],
    recommendedTests: [
      "Chest X-ray",
      "Pulse oximetry",
      "Complete blood count",
      "Inflammatory markers if available"
    ],
    communicationGoals: [
      "Acknowledge anxiety and reassure the patient while assessing severity",
      "Explain why worsening breathing symptoms need careful assessment"
    ],
    keywords: ["fever", "cough", "shortness of breath", "chest pain", "sputum", "duration", "allergy", "medication", "history", "smoke"],
    hints: [
      "Can you describe when the fever and cough started?",
      "Have you brought up any sputum or mucus when coughing?",
      "Do you have chest pain when breathing deeply?"
    ],
    scriptedAnswers: [
      { match: ["fever", "when start", "duration", "how long"], answer: "I've had a fever and cough for about three days, but the breathing became harder since last night." },
      { match: ["cough", "sputum", "mucus", "phlegm"], answer: "Yes, I'm coughing up yellowish mucus, and it feels worse when I lie flat." },
      { match: ["breath", "shortness", "stairs", "walking"], answer: "Even walking across the room makes me feel a bit out of breath today." },
      { match: ["pain", "chest"], answer: "There is a sharp pain on the right side of my chest when I take a deep breath or cough." },
      { match: ["history", "medical", "asthma"], answer: "I had asthma as a child, but it hasn't bothered me for years." },
      { match: ["smoke", "smoking", "tobacco"], answer: "No, I don't smoke." },
      { match: ["allergy", "allergies"], answer: "I don't have any known drug allergies." }
    ],
    fallbackResponses: [
      "I'm feeling pretty worried because I normally recover quickly from coughs, but this one is getting worse.",
      "I mostly want to know why breathing feels more painful than usual.",
      "I can answer more about the fever, cough, chest pain, or my medical history."
    ],
    evaluationFocus: [
      "Ask about onset and progression",
      "Clarify sputum and pleuritic chest pain",
      "Assess severity of breathlessness and risk factors"
    ]
  },
  {
    id: "case-2",
    name: "Daniel Reed",
    age: 58,
    gender: "Male",
    role: "Accountant",
    complaint: "Crushing chest pressure radiating to left arm",
    specialty: "Cardiology",
    complexity: "High",
    urgency: "Time-critical",
    personality: "Stoic and minimizing symptoms",
    summary: "A high-risk cardiovascular presentation where the patient underreports severity.",
    vitals: "Temp 36.8 C, HR 102, RR 20, BP 154/92, SpO2 97%",
    history: "Type 2 diabetes, hypertension, elevated cholesterol.",
    keyFacts: [
      { label: "Onset", value: "Started 45 minutes ago while climbing stairs" },
      { label: "Associated symptoms", value: "Sweating, nausea, mild shortness of breath" },
      { label: "Risk factors", value: "Diabetes, hypertension, dyslipidemia" },
      { label: "Hidden clue", value: "Patient says it is 'probably indigestion'" }
    ],
    expectedDiagnosis: ["acute coronary syndrome", "myocardial infarction", "heart attack", "stemi", "nstemi"],
    differentialDiagnoses: [
      "Gastroesophageal reflux disease",
      "Pulmonary embolism",
      "Aortic dissection",
      "Musculoskeletal chest pain"
    ],
    redFlags: [
      "Chest pressure radiating to the left arm or jaw",
      "Exertional onset",
      "Sweating and nausea",
      "Major cardiovascular risk factors"
    ],
    expectedQuestions: [
      "When did the pain start and what were you doing?",
      "Does it radiate anywhere?",
      "Any sweating, nausea, or shortness of breath?",
      "Do you have diabetes, hypertension, or cholesterol problems?",
      "Any smoking history or cardiac medication use?"
    ],
    recommendedTests: [
      "ECG",
      "Cardiac troponin",
      "Continuous vital sign monitoring",
      "Urgent emergency assessment"
    ],
    communicationGoals: [
      "Treat the complaint as urgent even if the patient minimizes symptoms",
      "Communicate concern calmly and clearly"
    ],
    keywords: ["chest", "arm", "pain", "pressure", "sweat", "nausea", "history", "diabetes", "blood pressure", "smoke"],
    hints: [
      "Did the pain start at rest or during exertion?",
      "Does the discomfort radiate anywhere?",
      "Do you have diabetes, hypertension, or cholesterol problems?"
    ],
    scriptedAnswers: [
      { match: ["start", "onset", "when", "doing"], answer: "It started while I was climbing the office stairs. I thought it would pass, but it hasn't." },
      { match: ["pain", "pressure", "where", "radiate", "arm"], answer: "It's a heavy pressure in the middle of my chest, and it spreads into my left arm and jaw." },
      { match: ["sweat", "sweating", "nausea", "vomit"], answer: "I did get sweaty and a little nauseated, but I figured it was just stress." },
      { match: ["history", "medical", "diabetes", "hypertension", "cholesterol"], answer: "I have diabetes and high blood pressure, and my doctor has mentioned cholesterol too." },
      { match: ["smoke", "smoking"], answer: "I quit smoking five years ago after smoking for a long time." },
      { match: ["medication", "medicines"], answer: "I take metformin, amlodipine, and a cholesterol tablet, though I sometimes miss doses." }
    ],
    fallbackResponses: [
      "It's probably nothing serious, but the pressure is definitely not normal for me.",
      "I don't usually come in for small problems, so this is unusual.",
      "You can ask about the pain, my medical history, or what I was doing when it began."
    ],
    evaluationFocus: [
      "Recognize red-flag cardiac symptoms",
      "Probe radiation, exertional onset, and associated diaphoresis",
      "Connect risk factors to an emergent diagnosis"
    ]
  },
  {
    id: "case-3",
    name: "Fatima Noor",
    age: 34,
    gender: "Female",
    role: "Shop owner",
    complaint: "Fatigue, excessive thirst, and frequent urination",
    specialty: "Endocrinology",
    complexity: "Moderate",
    urgency: "Needs prompt follow-up",
    personality: "Open, thoughtful, slightly embarrassed",
    summary: "A metabolic case focused on symptom clustering, family history, and lifestyle factors.",
    vitals: "Temp 36.7 C, HR 88, RR 16, BP 132/84, SpO2 99%",
    history: "Mother has diabetes, gained weight over the last year.",
    keyFacts: [
      { label: "Onset", value: "Several weeks" },
      { label: "Associated symptoms", value: "Blurred vision, tiredness after meals" },
      { label: "Risk factors", value: "Family history, sedentary routine, increased weight" },
      { label: "Hidden clue", value: "Keeps waking up at night to urinate" }
    ],
    expectedDiagnosis: ["type 2 diabetes", "diabetes mellitus", "diabetes"],
    differentialDiagnoses: [
      "Urinary tract disorder",
      "Diabetes insipidus",
      "Thyroid dysfunction"
    ],
    redFlags: [
      "Persistent polydipsia",
      "Frequent urination including nocturia",
      "Blurred vision",
      "Strong family history of diabetes"
    ],
    expectedQuestions: [
      "How long have the thirst and urination changes been happening?",
      "Have you had weight change, blurred vision, or fatigue?",
      "Is there a family history of diabetes?",
      "What are your diet and activity patterns like?",
      "Any recurrent infections or recent health changes?"
    ],
    recommendedTests: [
      "Random blood glucose",
      "Fasting plasma glucose",
      "HbA1c",
      "Urinalysis"
    ],
    communicationGoals: [
      "Reduce embarrassment and normalize discussion of symptoms",
      "Explain why testing is important without alarming the patient"
    ],
    keywords: ["thirst", "urination", "pee", "vision", "blurred", "family", "weight", "diet", "exercise"],
    hints: [
      "How long have the thirst and urination changes been happening?",
      "Has your weight, vision, or energy level changed lately?",
      "Is there any family history of diabetes?"
    ],
    scriptedAnswers: [
      { match: ["thirst", "drink", "water", "how much"], answer: "I'm drinking water constantly and still feel thirsty most of the day." },
      { match: ["urination", "urine", "pee", "night"], answer: "I'm going to the bathroom a lot, especially overnight, which never used to happen." },
      { match: ["vision", "blur", "eyes"], answer: "My vision gets blurry sometimes, especially when I'm tired." },
      { match: ["family", "history", "diabetes"], answer: "Yes, my mother has diabetes, so that's part of why I'm worried." },
      { match: ["weight", "diet", "exercise"], answer: "I've gained some weight this year, and I haven't had much time to exercise." }
    ],
    fallbackResponses: [
      "It's hard to explain, but I just don't feel like myself lately.",
      "I'm tired all the time, and the thirst is becoming really annoying.",
      "You can ask me more about my thirst, bathroom trips, vision, or family history."
    ],
    evaluationFocus: [
      "Identify classic diabetic symptoms",
      "Explore family history and lifestyle risk",
      "Connect blurred vision and nocturia to hyperglycemia"
    ]
  },
  {
    id: "case-4",
    name: "James Okoro",
    age: 42,
    gender: "Male",
    role: "Software Developer",
    complaint: "Severe headache with visual disturbance",
    specialty: "Neurology",
    complexity: "High",
    urgency: "Urgent assessment needed",
    personality: "Precise and analytical, wants detailed answers",
    summary: "A patient with recurrent headaches who presents with a new and different headache pattern requiring serious exclusion of secondary causes.",
    vitals: "Temp 37.0 C, HR 78, RR 16, BP 148/94, SpO2 99%",
    history: "History of migraines since age 20, occasional ibuprofen use, sedentary desk job.",
    keyFacts: [
      { label: "Onset", value: "Sudden onset 2 hours ago, worst headache of his life" },
      { label: "Associated symptoms", value: "Nausea, photophobia, neck stiffness" },
      { label: "Risk factors", value: "Hypertension, heavy caffeine use, high-stress lifestyle" },
      { label: "Hidden clue", value: "This headache is different from his usual migraines" }
    ],
    expectedDiagnosis: ["subarachnoid hemorrhage", "sah", "thunderclap headache", "intracranial hemorrhage"],
    differentialDiagnoses: [
      "Migraine with aura",
      "Meningitis",
      "Hypertensive emergency",
      "Cluster headache"
    ],
    redFlags: [
      "Worst headache of life with sudden onset",
      "Neck stiffness",
      "Pattern different from usual migraines",
      "Uncontrolled hypertension"
    ],
    expectedQuestions: [
      "Can you describe exactly how the headache started?",
      "Is this headache different from your usual migraines?",
      "Do you have any neck stiffness or sensitivity to light?",
      "Have you checked your blood pressure recently?",
      "Any recent head trauma, fever, or change in consciousness?"
    ],
    recommendedTests: [
      "Non-contrast CT head (urgent)",
      "Lumbar puncture if CT is negative",
      "Complete neurological examination",
      "Blood pressure monitoring"
    ],
    communicationGoals: [
      "Take the patient's analytical questions seriously and provide clear explanations",
      "Convey urgency without causing panic"
    ],
    keywords: ["headache", "worst", "sudden", "neck", "stiff", "vision", "light", "nausea", "migraine", "different", "blood pressure", "fever"],
    hints: [
      "Can you describe how this headache started compared to your usual migraines?",
      "Do you have any neck stiffness or sensitivity to light?",
      "Have you experienced any changes in vision or consciousness?"
    ],
    scriptedAnswers: [
      { match: ["start", "onset", "when", "began", "how"], answer: "It hit me like a thunderclap about two hours ago. One moment I was fine, the next my head felt like it was exploding." },
      { match: ["different", "usual", "migraine", "compare", "normal"], answer: "This is nothing like my usual migraines. Those build up slowly. This was instant and far worse, the worst headache I've ever had." },
      { match: ["neck", "stiff", "move"], answer: "Actually yes, my neck does feel quite stiff. It's uncomfortable to bend my chin down." },
      { match: ["vision", "light", "photo", "aura"], answer: "The light is really bothering me, more than with my migraines. I saw some flickering spots right when it started." },
      { match: ["nausea", "vomit", "sick"], answer: "I feel very nauseated and I vomited once shortly after the headache started." },
      { match: ["blood pressure", "hypertension", "bp"], answer: "My doctor told me my blood pressure was high at my last checkup, but I haven't been taking anything for it." },
      { match: ["fever", "temperature", "infection"], answer: "I don't think I have a fever, but I'm sweating from the pain." },
      { match: ["trauma", "injury", "fall", "hit"], answer: "No, I haven't had any head injuries recently." },
      { match: ["medication", "medicine", "drug"], answer: "Just ibuprofen occasionally for my migraines. No regular medications." },
      { match: ["history", "medical", "condition"], answer: "Just the migraines since my twenties, and the high blood pressure they found recently." },
      { match: ["consciousness", "faint", "blackout", "confused"], answer: "I haven't passed out, but I feel a bit foggy and the pain makes it hard to concentrate." },
      { match: ["caffeine", "coffee", "stress"], answer: "I drink about five or six cups of coffee a day. Work has been incredibly stressful lately." }
    ],
    fallbackResponses: [
      "This pain is unlike anything I've experienced. I need to know what's causing it.",
      "I keep track of my migraines and this does not fit the pattern at all.",
      "You can ask me about the headache characteristics, neck symptoms, vision, or my medical history."
    ],
    evaluationFocus: [
      "Distinguish thunderclap headache from typical migraine",
      "Identify red flags suggesting subarachnoid hemorrhage",
      "Recognize the urgency for neuroimaging"
    ]
  },
  {
    id: "case-5",
    name: "Sarah Mitchell",
    age: 19,
    gender: "Female",
    role: "University Student",
    complaint: "Severe right lower abdominal pain with nausea",
    specialty: "General Surgery",
    complexity: "Moderate",
    urgency: "Urgent surgical review",
    personality: "Scared and tearful, first time in hospital",
    summary: "A young patient presenting with acute abdominal pain consistent with appendicitis, anxious about hospital procedures.",
    vitals: "Temp 38.1 C, HR 98, RR 18, BP 118/72, SpO2 99%",
    history: "No significant past medical history, no previous surgeries.",
    keyFacts: [
      { label: "Onset", value: "Started around the belly button 12 hours ago, now right lower abdomen" },
      { label: "Associated symptoms", value: "Nausea, one episode of vomiting, loss of appetite" },
      { label: "Risk factors", value: "Young age (peak incidence), no prior episodes" },
      { label: "Hidden clue", value: "Pain worsened significantly with walking and during the car ride to hospital" }
    ],
    expectedDiagnosis: ["appendicitis", "acute appendicitis"],
    differentialDiagnoses: [
      "Ovarian cyst torsion",
      "Mesenteric lymphadenitis",
      "Urinary tract infection",
      "Ectopic pregnancy"
    ],
    redFlags: [
      "Migrating pain from periumbilical to right iliac fossa",
      "Rebound tenderness and guarding",
      "Low-grade fever with anorexia",
      "Pain worsened by movement"
    ],
    expectedQuestions: [
      "Where did the pain start and where is it now?",
      "Have you lost your appetite or had any nausea and vomiting?",
      "Does the pain get worse when you walk, cough, or move?",
      "When was your last menstrual period?",
      "Any urinary symptoms like burning or frequency?"
    ],
    recommendedTests: [
      "Complete blood count with differential",
      "C-reactive protein",
      "Urinalysis",
      "Abdominal ultrasound or CT abdomen",
      "Pregnancy test"
    ],
    communicationGoals: [
      "Reassure the anxious and scared patient while maintaining clinical focus",
      "Explain what appendicitis means and why surgery may be needed in simple terms"
    ],
    keywords: ["pain", "move", "walk", "appetite", "nausea", "vomit", "period", "menstrual", "urination", "burning", "fever", "right", "belly"],
    hints: [
      "Where exactly did the pain start and has it moved?",
      "Does the pain get worse when you walk or cough?",
      "Have you lost your appetite since the pain started?"
    ],
    scriptedAnswers: [
      { match: ["start", "where", "began", "move", "location"], answer: "It started around my belly button last night, but now it's really bad down on the right side." },
      { match: ["worse", "walk", "cough", "movement", "bump", "car"], answer: "Yes! Walking is really painful and every bump on the car ride here made me cry. Even coughing hurts." },
      { match: ["appetite", "eat", "food", "hungry"], answer: "I haven't wanted to eat anything since last night. The thought of food makes me feel sick." },
      { match: ["nausea", "vomit", "sick", "throw"], answer: "I threw up once this morning and I still feel really nauseated." },
      { match: ["period", "menstrual", "pregnant", "last period"], answer: "My last period was about two weeks ago and it was normal. I'm not sexually active." },
      { match: ["urine", "urination", "burning", "pee", "frequency"], answer: "No burning or anything, just the pain in my tummy that's making everything uncomfortable." },
      { match: ["fever", "temperature", "hot"], answer: "I felt a bit warm this morning. My mum checked and said it was a slight fever." },
      { match: ["history", "medical", "surgery", "hospital"], answer: "I've never been in hospital before and I've never had surgery. This is really scary for me." },
      { match: ["allergy", "allergies", "medication", "medicine"], answer: "No allergies and I don't take any medicines regularly, just paracetamol sometimes." },
      { match: ["touch", "press", "tender", "examine"], answer: "Please be gentle. When the other doctor pressed on the right side and let go quickly, the pain was horrible." }
    ],
    fallbackResponses: [
      "I'm really scared. I've never had pain like this before. Is it something serious?",
      "The pain is getting worse and I just want it to stop. What's happening to me?",
      "You can ask me about where the pain is, whether I've eaten, or anything else that might help."
    ],
    evaluationFocus: [
      "Recognize the classic migration of appendicitis pain",
      "Ask about movement, appetite, and GI symptoms",
      "Exclude gynecological and urological differentials in a young female"
    ]
  }
];

const moreCases = require('./more-cases.json');
caseStudies.push(...moreCases);

module.exports = {
  caseStudies
};
