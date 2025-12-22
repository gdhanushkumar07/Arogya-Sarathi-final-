import { MedicineReminder, ReminderTime } from "../types";

class ReminderService {
  private reminderChecks: Map<string, NodeJS.Timeout> = new Map();

  // Get reminders for a specific patient
  getPatientReminders(patientId: string): MedicineReminder[] {
    const storageKey = `hv_reminders_${patientId}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Save reminders for a specific patient
  savePatientReminders(patientId: string, reminders: MedicineReminder[]): void {
    const storageKey = `hv_reminders_${patientId}`;
    localStorage.setItem(storageKey, JSON.stringify(reminders));
  }

  // Create a new medicine reminder
  createReminder(reminder: Omit<MedicineReminder, "id">): MedicineReminder {
    const newReminder: MedicineReminder = {
      ...reminder,
      id: `REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reminderTimes: reminder.timeSchedule.map((time) => ({
        time,
        taken: false,
        skipped: false,
      })),
    };

    const reminders = this.getPatientReminders(reminder.patientId);
    reminders.push(newReminder);
    this.savePatientReminders(reminder.patientId, reminders);

    // Start reminder notifications
    this.startReminderCheck(newReminder);

    return newReminder;
  }

  // Update reminder status (taken/skipped)
  updateReminderStatus(
    patientId: string,
    reminderId: string,
    timeIndex: number,
    status: "taken" | "skipped"
  ): void {
    const reminders = this.getPatientReminders(patientId);
    const reminderIndex = reminders.findIndex((r) => r.id === reminderId);

    if (
      reminderIndex >= 0 &&
      reminderIndex < reminders[reminderIndex].reminderTimes.length
    ) {
      const reminderTime = reminders[reminderIndex].reminderTimes[timeIndex];

      if (status === "taken") {
        reminderTime.taken = true;
        reminderTime.takenAt = Date.now();
        reminderTime.skipped = false;
        reminderTime.skippedAt = undefined;
      } else {
        reminderTime.skipped = true;
        reminderTime.skippedAt = Date.now();
        reminderTime.taken = false;
        reminderTime.takenAt = undefined;
      }

      this.savePatientReminders(patientId, reminders);
    }
  }

  // Check if it's time for a reminder
  private isReminderTime(timeString: string): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return currentTime === timeString;
  }

  // Start checking for reminders (called when app loads)
  startReminderChecks(patientId: string): void {
    const reminders = this.getPatientReminders(patientId);
    reminders.forEach((reminder) => {
      if (reminder.isActive) {
        this.startReminderCheck(reminder);
      }
    });
  }

  // Start checking for a specific reminder
  private startReminderCheck(reminder: MedicineReminder): void {
    // Clear existing check if any
    const existingCheck = this.reminderChecks.get(reminder.id);
    if (existingCheck) {
      clearInterval(existingCheck);
    }

    // Check every minute for reminder time
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      reminder.reminderTimes.forEach((reminderTime, index) => {
        if (
          reminderTime.time === currentTime &&
          !reminderTime.taken &&
          !reminderTime.skipped &&
          reminder.isActive
        ) {
          this.showReminderNotification(reminder, reminderTime, index);
        }
      });
    }, 60000); // Check every minute

    this.reminderChecks.set(reminder.id, checkInterval);
  }

  // Show browser notification
  private async showReminderNotification(
    reminder: MedicineReminder,
    reminderTime: ReminderTime,
    timeIndex: number
  ): Promise<void> {
    // Show in-app notification
    const event = new CustomEvent("medicineReminder", {
      detail: {
        reminder,
        reminderTime,
        timeIndex,
      },
    });
    window.dispatchEvent(event);

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      const notification = new Notification("Medicine Reminder", {
        body: `Time to take ${reminder.medicineName} - ${reminder.dosage}`,
        icon: "/favicon.ico",
        tag: `medicine-${reminder.id}-${timeIndex}`,
      });

      notification.onclick = () => {
        window.focus();
        // Open app to medicine reminders
        const focusEvent = new CustomEvent("focusMedicineReminders", {
          detail: { reminderId: reminder.id },
        });
        window.dispatchEvent(focusEvent);
      };
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  // Stop all reminder checks
  stopAllReminderChecks(): void {
    this.reminderChecks.forEach((check) => {
      clearInterval(check);
    });
    this.reminderChecks.clear();
  }

  // Get today's reminder status for a patient
  getTodaysReminderStatus(patientId: string): {
    totalReminders: number;
    takenReminders: number;
    skippedReminders: number;
    upcomingReminders: number;
  } {
    const reminders = this.getPatientReminders(patientId);
    const activeReminders = reminders.filter((r) => r.isActive);

    let totalReminders = 0;
    let takenReminders = 0;
    let skippedReminders = 0;
    let upcomingReminders = 0;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    activeReminders.forEach((reminder) => {
      reminder.reminderTimes.forEach((reminderTime) => {
        totalReminders++;

        if (reminderTime.taken) {
          takenReminders++;
        } else if (reminderTime.skipped) {
          skippedReminders++;
        } else if (reminderTime.time > currentTime) {
          upcomingReminders++;
        }
      });
    });

    return {
      totalReminders,
      takenReminders,
      skippedReminders,
      upcomingReminders,
    };
  }

  // Toggle reminder active status
  toggleReminderStatus(
    patientId: string,
    reminderId: string,
    isActive: boolean
  ): void {
    const reminders = this.getPatientReminders(patientId);
    const reminderIndex = reminders.findIndex((r) => r.id === reminderId);

    if (reminderIndex >= 0) {
      reminders[reminderIndex].isActive = isActive;
      this.savePatientReminders(patientId, reminders);

      if (isActive) {
        this.startReminderCheck(reminders[reminderIndex]);
      } else {
        const existingCheck = this.reminderChecks.get(reminderId);
        if (existingCheck) {
          clearInterval(existingCheck);
          this.reminderChecks.delete(reminderId);
        }
      }
    }
  }

  // Delete a reminder
  deleteReminder(patientId: string, reminderId: string): void {
    const reminders = this.getPatientReminders(patientId);
    const filteredReminders = reminders.filter((r) => r.id !== reminderId);
    this.savePatientReminders(patientId, filteredReminders);

    // Stop checking for this reminder
    const existingCheck = this.reminderChecks.get(reminderId);
    if (existingCheck) {
      clearInterval(existingCheck);
      this.reminderChecks.delete(reminderId);
    }
  }
}

// Export singleton instance
export const reminderService = new ReminderService();
