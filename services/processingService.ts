// Rule-based processing service for HealthVault
// Replaces AI functionality with simple deterministic logic

export interface TriageResult {
  findings: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  category: string;
}

export interface DeltaSyncResult {
  summary: string;
  suggestedSpecialty: string;
  packetSize: string;
}

export interface PatientResponse {
  text: string;
  icons: ("SUN" | "MOON" | "FOOD")[];
}

class ProcessingService {
  // Rule-based visual triage - simple pattern matching
  triageVisualData(imageData: string): TriageResult {
    // Simple rule-based analysis based on common patterns
    // In demo, return deterministic results based on image characteristics

    const imageHash = this.simpleHash(imageData);
    const patterns = [
      { keyword: "rash", urgency: "MEDIUM" as const, category: "Dermatology" },
      { keyword: "wound", urgency: "HIGH" as const, category: "Surgery" },
      {
        keyword: "fracture",
        urgency: "HIGH" as const,
        category: "Orthopedics",
      },
      { keyword: "eye", urgency: "MEDIUM" as const, category: "Ophthalmology" },
      { keyword: "skin", urgency: "LOW" as const, category: "Dermatology" },
    ];

    // Simple pattern matching
    const matchedPattern = patterns[imageHash % patterns.length];

    return {
      findings: `Visual analysis indicates potential ${matchedPattern.category} concern`,
      urgency: matchedPattern.urgency,
      category: matchedPattern.category,
    };
  }

  // Rule-based delta sync - categorize by keywords
  generateDeltaSync(vault: any, symptoms: string): DeltaSyncResult {
    const symptomKeywords = symptoms.toLowerCase();

    // Simple rule-based categorization
    let specialty = "General Medicine";
    let urgency = "Routine consultation recommended";

    if (
      symptomKeywords.includes("chest") ||
      symptomKeywords.includes("heart")
    ) {
      specialty = "Cardiology";
      urgency = "Cardiac symptoms - urgent evaluation needed";
    } else if (
      symptomKeywords.includes("brain") ||
      symptomKeywords.includes("head")
    ) {
      specialty = "Neurology";
      urgency = "Neurological symptoms - specialist review required";
    } else if (
      symptomKeywords.includes("bone") ||
      symptomKeywords.includes("joint")
    ) {
      specialty = "Orthopedics";
      urgency = "Orthopedic evaluation recommended";
    } else if (
      symptomKeywords.includes("skin") ||
      symptomKeywords.includes("rash")
    ) {
      specialty = "Dermatology";
      urgency = "Dermatological assessment suggested";
    }

    return {
      summary: `Patient reports: ${symptoms.substring(0, 100)}${
        symptoms.length > 100 ? "..." : ""
      }`,
      suggestedSpecialty: specialty,
      packetSize: "8KB",
    };
  }

  // Rule-based speech to text - simple keyword mapping
  async speechToText(audioData: string, language: string): Promise<string> {
    // Simulate processing time
    await this.delay(1000);

    // Simple rule-based transcription based on audio hash
    const audioHash = this.simpleHash(audioData);
    const responses = [
      "I have a headache and fever",
      "My stomach is hurting",
      "I feel dizzy and nauseous",
      "I have chest pain",
      "My back is hurting",
    ];

    return responses[audioHash % responses.length];
  }

  // Rule-based patient response generation
  generatePatientResponse(
    clinicalContext: string,
    medication: string,
    language: string
  ): PatientResponse {
    const responses = {
      prescription: {
        text: `Take ${medication} as prescribed. Complete the full course even if you feel better. Contact your doctor if symptoms persist.`,
        icons: ["SUN", "MOON", "FOOD"] as ("SUN" | "MOON" | "FOOD")[],
      },
      advice: {
        text: `${clinicalContext} Follow up as recommended. Maintain good hydration and rest.`,
        icons: ["SUN"] as ("SUN" | "MOON" | "FOOD")[],
      },
    };

    const isPrescription = medication && medication.trim().length > 0;
    return isPrescription ? responses.prescription : responses.advice;
  }

  // Rule-based text to speech - simple audio generation
  async textToSpeech(text: string): Promise<string | null> {
    // Simulate processing
    await this.delay(500);

    // Return null for demo - would generate audio in real implementation
    return null;
  }

  // Utility: Simple hash function for deterministic results
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Utility: Simulate processing delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const processingService = new ProcessingService();
