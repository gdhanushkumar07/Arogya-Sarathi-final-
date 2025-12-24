/**
 * Symptom History Service
 *
 * PURPOSE:
 * ========
 * Store symptoms on the patient's local device AND sync them with the backend.
 * This ensures patients can see their symptom history even after:
 * - Page refresh
 * - Browser restart
 * - Switching patients
 *
 * PROBLEM FIXED:
 * ==============
 * Previously, symptoms were only stored in vault.records (in-memory state)
 * and marked as SYNCED after sending to backend. When page reloaded,
 * vault.records would be empty again since the backend didn't send them back.
 *
 * SOLUTION:
 * =========
 * 1. Store symptoms in localStorage under patient-specific key
 * 2. Keep a persistent record of all symptom submissions
 * 3. Include symptom history in patient vault restoration
 */

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

    console.log(`✅ Symptom stored for patient ${patientId}:`, {
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
        console.log(`📭 No symptom history found for patient ${patientId}`);
        return [];
      }

      const symptoms = JSON.parse(stored) as PatientSymptom[];
      console.log(
        `📋 Retrieved ${symptoms.length} symptoms for patient ${patientId}`
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
      `✅ Marked ${symptomIds.length} symptoms as synced for patient ${patientId}`
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
    console.log(`🗑️ Cleared symptom history for patient ${patientId}`);
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
