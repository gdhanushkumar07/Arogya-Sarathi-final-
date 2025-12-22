import React, { useState, useEffect } from "react";
import {
  Pill,
  Clock,
  Check,
  X,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { MedicineReminder, ReminderTime } from "../types";
import { reminderService } from "../services/reminderService";

interface MedicineReminderProps {
  patientId: string;
  onBack: () => void;
}

const MedicineReminder: React.FC<MedicineReminderProps> = ({
  patientId,
  onBack,
}) => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] =
    useState<MedicineReminder | null>(null);
  const [todayStatus, setTodayStatus] = useState({
    totalReminders: 0,
    takenReminders: 0,
    skippedReminders: 0,
    upcomingReminders: 0,
  });

  const [newReminder, setNewReminder] = useState({
    medicineName: "",
    dosage: "",
    timeSchedule: ["08:00"],
    instructions: "",
    startDate: Date.now(),
    endDate: undefined as number | undefined,
  });

  useEffect(() => {
    loadReminders();
    loadTodayStatus();
    startReminderChecks();
  }, [patientId]);

  const loadReminders = () => {
    const patientReminders = reminderService.getPatientReminders(patientId);
    setReminders(patientReminders);
  };

  const loadTodayStatus = () => {
    const status = reminderService.getTodaysReminderStatus(patientId);
    setTodayStatus(status);
  };

  const startReminderChecks = () => {
    reminderService.startReminderChecks(patientId);
  };

  const handleCreateReminder = () => {
    if (!newReminder.medicineName || !newReminder.dosage) {
      alert("Please fill in medicine name and dosage");
      return;
    }

    const reminder: Omit<MedicineReminder, "id"> = {
      patientId,
      medicineName: newReminder.medicineName,
      dosage: newReminder.dosage,
      timeSchedule: newReminder.timeSchedule,
      startDate: newReminder.startDate,
      endDate: newReminder.endDate,
      isActive: true,
      instructions: newReminder.instructions,
      prescribedBy: "Dr. Demo", // In real app, this would come from doctor profile
      prescribedDate: Date.now(),
      reminderTimes: [],
    };

    const createdReminder = reminderService.createReminder(reminder);
    setReminders((prev) => [...prev, createdReminder]);
    setShowCreateForm(false);
    setNewReminder({
      medicineName: "",
      dosage: "",
      timeSchedule: ["08:00"],
      instructions: "",
      startDate: Date.now(),
      endDate: undefined,
    });
    loadTodayStatus();
  };

  const handleUpdateReminderStatus = (
    reminderId: string,
    timeIndex: number,
    status: "taken" | "skipped"
  ) => {
    reminderService.updateReminderStatus(
      patientId,
      reminderId,
      timeIndex,
      status
    );
    loadReminders();
    loadTodayStatus();
  };

  const handleToggleReminderStatus = (
    reminderId: string,
    isActive: boolean
  ) => {
    reminderService.toggleReminderStatus(patientId, reminderId, isActive);
    loadReminders();
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      reminderService.deleteReminder(patientId, reminderId);
      loadReminders();
      loadTodayStatus();
    }
  };

  const addTimeSlot = () => {
    setNewReminder((prev) => ({
      ...prev,
      timeSchedule: [...prev.timeSchedule, "20:00"],
    }));
  };

  const removeTimeSlot = (index: number) => {
    setNewReminder((prev) => ({
      ...prev,
      timeSchedule: prev.timeSchedule.filter((_, i) => i !== index),
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTimeStatus = (reminderTime: ReminderTime) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    if (reminderTime.taken) return "taken";
    if (reminderTime.skipped) return "skipped";
    if (reminderTime.time <= currentTime) return "overdue";
    return "upcoming";
  };

  const getTimeStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "text-green-600 bg-green-50";
      case "skipped":
        return "text-red-600 bg-red-50";
      case "overdue":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Medicine Reminders
            </h1>
            <p className="text-indigo-100 text-sm">Never miss your medicines</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="p-4">
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-indigo-900">Today's Progress</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {todayStatus.takenReminders}
              </div>
              <div className="text-sm text-indigo-700">Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {todayStatus.upcomingReminders}
              </div>
              <div className="text-sm text-orange-700">Upcoming</div>
            </div>
          </div>
          {todayStatus.totalReminders > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-indigo-700 mb-1">
                <span>Progress</span>
                <span>
                  {Math.round(
                    (todayStatus.takenReminders / todayStatus.totalReminders) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (todayStatus.takenReminders /
                        todayStatus.totalReminders) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Add Medicine Reminder</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Paracetamol"
                  value={newReminder.medicineName}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      medicineName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 500mg"
                  value={newReminder.dosage}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      dosage: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Schedule
                </label>
                {newReminder.timeSchedule.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="time"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...newReminder.timeSchedule];
                        newTimes[index] = e.target.value;
                        setNewReminder((prev) => ({
                          ...prev,
                          timeSchedule: newTimes,
                        }));
                      }}
                    />
                    {newReminder.timeSchedule.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTimeSlot}
                  className="text-indigo-600 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Time
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Take after meals"
                  value={newReminder.instructions}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReminder}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="p-4 space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reminders yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first medicine reminder to get started
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Add Reminder
            </button>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {reminder.medicineName}
                  </h3>
                  <p className="text-gray-600 font-medium">{reminder.dosage}</p>
                  <p className="text-sm text-gray-500">
                    Prescribed by {reminder.prescribedBy} on{" "}
                    {formatDate(reminder.prescribedDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleToggleReminderStatus(
                        reminder.id,
                        !reminder.isActive
                      )
                    }
                    className={`p-2 rounded-lg ${
                      reminder.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Bell
                      className={`w-4 h-4 ${
                        reminder.isActive ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {reminder.instructions && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    {reminder.instructions}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">
                  Today's Schedule
                </h4>
                {reminder.reminderTimes.map((reminderTime, index) => {
                  const status = getTimeStatus(reminderTime);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${getTimeStatusColor(
                        status
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{reminderTime.time}</span>
                        {status === "overdue" &&
                          !reminderTime.taken &&
                          !reminderTime.skipped && (
                            <AlertCircle className="w-4 h-4" />
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!reminderTime.taken && !reminderTime.skipped && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateReminderStatus(
                                  reminder.id,
                                  index,
                                  "taken"
                                )
                              }
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateReminderStatus(
                                  reminder.id,
                                  index,
                                  "skipped"
                                )
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {reminderTime.taken && (
                          <span className="text-xs font-medium text-green-700">
                            Taken
                          </span>
                        )}
                        {reminderTime.skipped && (
                          <span className="text-xs font-medium text-red-700">
                            Skipped
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicineReminder;
