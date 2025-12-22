export const geminiService = {
  async speechToText(base64Audio: string, language: string) {
    const res = await fetch("http://localhost:4000/api/speech-to-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: base64Audio, language }),
    });
    return (await res.json()).text;
  },

  async triageVisualData(base64Image: string) {
    const res = await fetch("http://localhost:4000/api/visual-triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });
    return res.json();
  },

  async generateDeltaSync(vault: any, symptoms: string) {
    const res = await fetch("http://localhost:4000/api/delta-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vault, newSymptoms: symptoms }),
    });
    return res.json();
  },

  async generatePatientResponse(
    note: string,
    medication: string,
    language: string
  ) {
    const res = await fetch("http://localhost:4000/api/patient-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, medication, language }),
    });
    return res.json();
  },

  async textToSpeech(text: string) {
    const res = await fetch("http://localhost:4000/api/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return (await res.json()).audio;
  },
};
