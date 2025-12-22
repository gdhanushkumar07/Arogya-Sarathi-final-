import "dotenv/config";
import express from "express";
import cors from "cors";
import { speechToText } from "./geminiService.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/speech-to-text", async (req, res) => {
  const { audio, language } = req.body;
  const text = await speechToText(audio, language);
  res.json({ text });
});
app.post("/api/delta-sync", async (req, res) => {
  try {
    const { vault, newSymptoms } = req.body;

    console.log("📦 Delta sync POST received:", { vault, newSymptoms });

    // Process symptoms and create meaningful medical summary
    let suggestedSpecialty = "General Medicine";
    let urgency = "MEDIUM";
    let summary = newSymptoms;

    // Basic AI routing logic based on symptoms
    const symptomLower = newSymptoms.toLowerCase();
    if (
      symptomLower.includes("chest") ||
      symptomLower.includes("heart") ||
      symptomLower.includes("pain chest")
    ) {
      suggestedSpecialty = "Cardiology";
      urgency = "HIGH";
    } else if (
      symptomLower.includes("skin") ||
      symptomLower.includes("rash") ||
      symptomLower.includes("itch")
    ) {
      suggestedSpecialty = "Dermatology";
    } else if (
      symptomLower.includes("bone") ||
      symptomLower.includes("joint") ||
      symptomLower.includes("back pain")
    ) {
      suggestedSpecialty = "Orthopedics";
    } else if (
      symptomLower.includes("child") ||
      symptomLower.includes("baby") ||
      symptomLower.includes("pediatric")
    ) {
      suggestedSpecialty = "Pediatrics";
    } else if (
      symptomLower.includes("woman") ||
      symptomLower.includes("pregnancy") ||
      symptomLower.includes("gynec")
    ) {
      suggestedSpecialty = "Gynaecology";
    }

    // Create summary based on patient context
    summary = `Patient ${vault.name} (${vault.age}y, ${vault.location}, ${vault.state}) reports: ${symptoms}`;

    res.json({
      summary: summary,
      urgency: urgency,
      packetSize: `${Math.ceil(symptoms.length / 100)}KB`,
      suggestedSpecialty: suggestedSpecialty,
    });
  } catch (err) {
    console.error("❌ Delta sync error:", err);
    res.status(500).json({ error: "Delta sync failed" });
  }
});

app.post("/api/visual-triage", async (req, res) => {
  try {
    const { image } = req.body;
    console.log("📷 Visual triage received");

    // Simulate AI visual analysis
    const findings = "Visual inspection suggests routine assessment needed";
    const urgency = "MEDIUM";

    res.json({
      findings: findings,
      urgency: urgency,
    });
  } catch (err) {
    console.error("❌ Visual triage error:", err);
    res.status(500).json({ error: "Visual triage failed" });
  }
});

app.post("/api/patient-response", async (req, res) => {
  try {
    const { note, medication, language } = req.body;
    console.log("💊 Patient response generated");

    // Simulate AI response generation
    let text = note;
    let icons = [];

    if (medication) {
      text = `Please take ${medication} as prescribed. ${note}`;
      // Add appropriate icons based on medication timing
      icons.push("SUN");
      icons.push("MOON");
    } else {
      text = note;
    }

    res.json({
      text: text,
      icons: icons,
    });
  } catch (err) {
    console.error("❌ Patient response error:", err);
    res.status(500).json({ error: "Patient response failed" });
  }
});

app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text } = req.body;
    console.log("🔊 Text-to-speech request");

    // For demo purposes, return null (no actual audio generation)
    // In production, this would integrate with TTS service
    res.json({ audio: null });
  } catch (err) {
    console.error("❌ Text-to-speech error:", err);
    res.status(500).json({ error: "Text-to-speech failed" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
// console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);
