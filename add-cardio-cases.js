const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'more-cases.json');
let cases = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newCases = Array.from({ length: 9 }).map((_, i) => ({
  id: `case-cardio-${i+100}`,
  name: `Cardio Patient ${i+1}`,
  age: 50 + i,
  role: "Patient",
  complaint: "Chest pain and shortness of breath",
  specialty: "Cardiology",
  complexity: "Moderate",
  urgency: "Urgent",
  personality: "Anxious",
  summary: "Patient with typical angina symptoms.",
  vitals: "Temp 37.0 C, HR 90, RR 18, BP 130/85, SpO2 96%",
  history: "Hypertension, Hyperlipidemia",
  keyFacts: [
    { label: "Onset", value: "Gradual over last 2 hours" },
    { label: "Associated symptoms", "value": "Shortness of breath, sweating" }
  ],
  expectedDiagnosis: ["angina", "myocardial infarction", "acute coronary syndrome"],
  differentialDiagnoses: ["GERD", "Panic attack", "Pulmonary embolism"],
  redFlags: ["Radiating chest pain", "Diaphoresis"],
  expectedQuestions: ["Does the pain radiate anywhere?", "Are you short of breath?"],
  recommendedTests: ["ECG", "Troponin", "Chest X-ray"],
  communicationGoals: ["Reassure patient", "Explain need for urgent ECG"],
  keywords: ["chest", "pain", "sweat", "breath", "radiate"],
  hints: ["Ask if the pain moves to the jaw or arm.", "Ask about sweating."],
  scriptedAnswers: [
    { match: ["radiate", "move", "arm", "jaw"], answer: "The pain seems to go down my left arm." },
    { match: ["sweat", "diaphoresis"], answer: "Yes, I feel very clammy and sweaty." },
    { match: ["breath", "short"], answer: "I feel like I can't catch my breath properly." }
  ],
  fallbackResponses: ["My chest feels very tight.", "I'm worried it's a heart attack."],
  evaluationFocus: ["Recognize cardiac chest pain", "Order appropriate investigations"]
}));

cases.push(...newCases);
fs.writeFileSync(filePath, JSON.stringify(cases, null, 2));
console.log('Added 9 cardiology cases');
