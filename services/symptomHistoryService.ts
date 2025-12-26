export interface PatientSymptom {
  id: string;
  patientId: string;
  content: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  timestamp: number;
  synced: boolean; // Has this been sent to backend?
  syncedAt?: number; // When was it synced?
}

export class SymptomHistoryService {
  // Storage Keys - Patient-specific
  private static getSymptomKey(patientId: string): string {
    return `symptoms_history_${patientId}`;
  }

  /**
   * Add a new symptom to history
   */
  static addSymptom(
    patientId: string,
    content: string,
    severity: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM"
  ): PatientSymptom {
    const symptom: PatientSymptom = {
      id: `SYM-${Date.now()}`,
      patientId,
      content,
      severity,
      timestamp: Date.now(),
      synced: false,
    };

    // Get existing symptoms
    const existing = this.getSymptomHistory(patientId);

    // Add new symptom
    const updated = [...existing, symptom];

    // Save to localStorage
    const key = this.getSymptomKey(patientId);
    localStorage.setItem(key, JSON.stringify(updated));

    console.log(`Symptom stored for patient ${patientId}:`, {
      id: symptom.id,
      content: symptom.content,
      severity: symptom.severity,
    });

    return symptom;
  }

  /**
   * Get all symptoms for a patient
   */
  static getSymptomHistory(patientId: string): PatientSymptom[] {
    try {
      const key = this.getSymptomKey(patientId);
      const stored = localStorage.getItem(key);

      if (!stored) {
        console.log(`No symptom history found for patient ${patientId}`);
        return [];
      }

      const symptoms = JSON.parse(stored) as PatientSymptom[];
      console.log(
        `Retrieved ${symptoms.length} symptoms for patient ${patientId}`
      );
      return symptoms;
    } catch (error) {
      console.error("Failed to load symptom history:", error);
      return [];
    }
  }

  /**
   * Mark symptoms as synced to backend
   */
  static markSymptomsSynced(patientId: string, symptomIds: string[]): void {
    const symptoms = this.getSymptomHistory(patientId);

    const updated = symptoms.map((s) =>
      symptomIds.includes(s.id)
        ? { ...s, synced: true, syncedAt: Date.now() }
        : s
    );

    const key = this.getSymptomKey(patientId);
    localStorage.setItem(key, JSON.stringify(updated));

    console.log(
      `Marked ${symptomIds.length} symptoms as synced for patient ${patientId}`
    );
  }

  /**
   * Get unsynced symptoms
   */
  static getUnsyncedSymptoms(patientId: string): PatientSymptom[] {
    const all = this.getSymptomHistory(patientId);
    return all.filter((s) => !s.synced);
  }

  /**
   * Clear symptom history for a patient (use with caution)
   */
  static clearHistory(patientId: string): void {
    const key = this.getSymptomKey(patientId);
    localStorage.removeItem(key);
    console.log(`Cleared symptom history for patient ${patientId}`);
  }

  /**
   * Export symptoms as CSV for medical records
   */
  static exportSymptoms(patientId: string): string {
    const symptoms = this.getSymptomHistory(patientId);

    let csv = "Date,Time,Symptom,Severity,Synced\n";

    symptoms.forEach((s) => {
      const date = new Date(s.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      csv += `${dateStr},${timeStr},"${s.content}",${s.severity},${
        s.synced ? "Yes" : "No"
      }\n`;
    });

    return csv;
  }

  /**
   * Get stats about symptoms
   */
  static getStats(patientId: string) {
    const symptoms = this.getSymptomHistory(patientId);

    const stats = {
      total: symptoms.length,
      synced: symptoms.filter((s) => s.synced).length,
      unsynced: symptoms.filter((s) => !s.synced).length,
      highSeverity: symptoms.filter((s) => s.severity === "HIGH").length,
      mediumSeverity: symptoms.filter((s) => s.severity === "MEDIUM").length,
      lowSeverity: symptoms.filter((s) => s.severity === "LOW").length,
      lastSymptomAt:
        symptoms.length > 0 ? symptoms[symptoms.length - 1].timestamp : null,
    };

    return stats;
  }
}

export default SymptomHistoryService;
