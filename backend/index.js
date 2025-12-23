import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

/**
 * MEDICINE REMINDER
 */
app.post("/api/medicine-reminder", async (req, res) => {
  try {
    const { patientId, medicineName, time } = req.body;

    res.json({
      message: `Reminder set for ${medicineName} at ${time}`,
      patientId,
    });
  } catch {
    res.status(500).json({ error: "Reminder setup failed" });
  }
});

/**
 * MEDICINE ORDERING (OPTIONAL)
 */
app.post("/api/order-medicine", async (req, res) => {
  try {
    const { patientId, medicines } = req.body;

    res.json({
      status: "Order placed",
      patientId,
      medicines,
    });
  } catch {
    res.status(500).json({ error: "Order failed" });
  }
});

/**
 * EMERGENCY – DEMO HOSPITAL ROUTING
 */
app.post("/api/find-hospital", async (req, res) => {
  res.json({
    hospitals: [
      {
        name: "District Government Hospital",
        distance: "3.2 km",
        route: "Via Main Road",
      },
      {
        name: "Community Health Center",
        distance: "5.1 km",
        route: "Via Village Road",
      },
    ],
  });
});

/**
 * PATIENT–DOCTOR MESSAGING SYSTEM
 */

// In-memory storage
const messageStore = new Map();

/**
 * Generate patient response (doctor note / prescription)
 */
app.post("/api/patient-response", async (req, res) => {
  try {
    const { note, medication, language } = req.body;

    let responseText = "";
    let icons = [];

    if (medication && medication.trim()) {
      responseText = `Take ${medication} as prescribed. Complete the full course.`;
      icons = ["SUN", "MOON", "FOOD"];
    } else if (note && note.trim()) {
      responseText = `${note} Please rest and stay hydrated.`;
      icons = ["SUN"];
    } else {
      responseText =
        "Please follow the prescribed treatment and contact us if symptoms persist.";
      icons = ["SUN"];
    }

    res.json({
      text: responseText,
      icons,
      language: language || "English",
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate response",
      status: "error",
    });
  }
});

/**
 * Send doctor message
 */
app.post("/api/send-doctor-message", async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      message,
      content,
      doctorName,
      specialization,
      doctorSpecialization,
      type,
      messageType,
      timestamp,
    } = req.body;

    // Accept both `message` and `content` from the frontend payload
    const resolvedMessage = (message || content || "").toString().trim();

    if (!patientId || !resolvedMessage) {
      return res.status(400).json({ error: "Missing patientId or message" });
    }

    const resolvedType = type || messageType || "DOCTOR_NOTE";
    const resolvedSpecialization =
      doctorSpecialization || specialization || "General Medicine";

    const msg = {
      id: `MSG-${Date.now()}`,
      patientId,
      doctorId: doctorId || "DOCTOR",
      doctorName: doctorName || "Unknown Doctor",
      specialization: resolvedSpecialization,
      type: resolvedType,
      content: resolvedMessage,
      timestamp: timestamp || Date.now(),
      read: false,
    };

    if (!messageStore.has(patientId)) {
      messageStore.set(patientId, []);
    }

    messageStore.get(patientId).push(msg);

    console.log("💾 Doctor message saved:", {
      patientId,
      doctorName: msg.doctorName,
      type: msg.type,
      content: resolvedMessage.substring(0, 50) + "...",
    });

    res.json({ success: true, messageId: msg.id, message: msg });
  } catch (error) {
    console.error("❌ Message send failed:", error);
    res.status(500).json({ error: "Message send failed" });
  }
});

/**
 * Get patient messages
 */
app.get("/api/get-patient-messages", async (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: "Missing patientId" });
  }

  const messages = messageStore.get(patientId) || [];
  res.json({ messages });
});

/**
 * Mark message read
 */
app.post("/api/mark-message-read", async (req, res) => {
  const { patientId, messageId } = req.body;

  const messages = messageStore.get(patientId) || [];
  const msg = messages.find((m) => m.id === messageId);

  if (msg) {
    msg.read = true;
    msg.readAt = Date.now();
  }

  res.json({ success: true });
});

/**
 * Unread count
 */
app.get("/api/get-unread-count", async (req, res) => {
  const { patientId } = req.query;

  const messages = messageStore.get(patientId) || [];
  const unreadCount = messages.filter((m) => !m.read).length;

  res.json({ unreadCount });
});

/**
 * RURAL SYNC PACKET STORAGE & RETRIEVAL
 * Low-bandwidth delta-sync model for doctors
 */

// WARNING: In-memory storage is volatile and will be lost on server restart.
// For production, replace with a persistent database (e.g., Redis, MongoDB, or a SQL database).
const syncPacketStore = new Map();

/**
 * Use real patient context from vault data - NO DEMO DATA GENERATION
 */
function useRealPatientContext(vault) {
  // Validate that we have essential patient data
  if (!vault || !vault.name || !vault.age || vault.age <= 0) {
    console.log("⚠️ Missing essential patient data:", {
      hasVault: !!vault,
      hasName: !!vault?.name,
      hasAge: !!vault?.age,
    });
    return null;
  }

  console.log("✅ Using real patient data:", {
    name: vault.name,
    age: vault.age,
    location: vault.location,
    state: vault.state,
    phoneNumber: vault.phoneNumber,
    district: vault.district,
  });

  // Use actual vault data, no demo generation
  return {
    // Complete real patient demographic information
    name: vault.name,
    age: vault.age,
    phoneNumber: vault.phoneNumber || "",
    houseNumber: vault.houseNumber || "",
    streetVillage: vault.streetVillage || vault.location || "",
    district: vault.district || "",
    state: vault.state || "",
    language: vault.language || "English",

    // Real medical data if available, otherwise empty arrays
    medicalHistory: vault.medicalHistory || [],
    currentMedications: vault.currentMedications || [],
    activeReminders: vault.activeReminders || 0,
    previousInteractions: vault.previousInteractions || 0,

    // Real emergency contact if available
    emergencyContact: vault.emergencyContact || {
      name: "",
      phone: vault.phoneNumber || "",
      relationship: "Primary Contact",
    },

    // Real risk factors if available
    riskFactors: vault.riskFactors || [],
    allergies: vault.allergies || [],
  };
}

/**
 * Store sync packet when patient submits symptoms
 */
app.post("/api/delta-sync", async (req, res) => {
  try {
    const { vault, newSymptoms, currentSymptoms } = req.body;

    // 🔐 Safety check
    if (!vault || !newSymptoms) {
      return res.status(400).json({
        error: "Missing vault or symptoms data",
      });
    }

    console.log("📦 Delta sync received:", {
      vault: { name: vault.name, age: vault.age },
      newSymptoms,
      hasCurrentSymptoms: !!currentSymptoms,
    });

    let suggestedSpecialty = "General Medicine";
    let urgency = "NORMAL";

    const symptomLower = newSymptoms.toLowerCase();

    if (symptomLower.includes("chest") || symptomLower.includes("heart")) {
      suggestedSpecialty = "Cardiology";
      urgency = "HIGH";
    } else if (symptomLower.includes("skin") || symptomLower.includes("rash")) {
      suggestedSpecialty = "Dermatology";
    } else if (
      symptomLower.includes("bone") ||
      symptomLower.includes("joint")
    ) {
      suggestedSpecialty = "Orthopedics";
    } else if (
      symptomLower.includes("child") ||
      symptomLower.includes("baby")
    ) {
      suggestedSpecialty = "Pediatrics";
    } else if (
      symptomLower.includes("pregnancy") ||
      symptomLower.includes("gynec")
    ) {
      suggestedSpecialty = "Gynaecology";
    }

    // Use real patient context from vault data
    const realPatientContext = useRealPatientContext(vault);

    // Validate that we have essential patient data before creating sync packet
    if (!realPatientContext) {
      return res.status(400).json({
        error:
          "Incomplete patient profile. Please ensure patient name and age are provided.",
      });
    }

    console.log("📦 Creating sync packet with real patient data:", {
      patientName: realPatientContext.name,
      patientAge: realPatientContext.age,
      patientLocation: realPatientContext.streetVillage,
      patientState: realPatientContext.state,
    });

    // Create sync packet with REAL patient data - no demo generation
    const syncPacket = {
      packetId: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId:
        vault.patientId ||
        `PATIENT_${realPatientContext.name}_${realPatientContext.age}`,
      patientName: realPatientContext.name,
      payloadSize: `${Math.ceil(newSymptoms.length / 100)}KB`,
      summary: `Patient ${realPatientContext.name} (${realPatientContext.age}y, ${realPatientContext.streetVillage}, ${realPatientContext.state}) reports: ${newSymptoms}`,
      historyContext: `Resident of ${realPatientContext.streetVillage}, ${realPatientContext.state}`,
      suggestedSpecialty: suggestedSpecialty,
      urgency: urgency,
      timestamp: Date.now(),
      // REAL patient context for comprehensive doctor view
      patientContext: realPatientContext,
      // Current symptoms with detailed information
      currentSymptoms: currentSymptoms || {
        description: newSymptoms,
        severity: urgency === "HIGH" ? "HIGH" : "MEDIUM",
        duration: "Current episode",
        additionalNotes: "Patient submitted via mobile app",
      },
    };

    // Store packet in backend memory
    syncPacketStore.set(syncPacket.packetId, syncPacket);

    console.log("💾 Real patient sync packet stored:", {
      packetId: syncPacket.packetId,
      patientName: syncPacket.patientName,
      patientAge: syncPacket.patientContext.age,
      patientLocation: syncPacket.patientContext.streetVillage,
      patientContext: !!syncPacket.patientContext,
      currentSymptoms: !!syncPacket.currentSymptoms,
    });

    res.json({
      summary: `Patient ${realPatientContext.name} (${realPatientContext.age}y, ${realPatientContext.streetVillage}, ${realPatientContext.state}) reports: ${newSymptoms}`,
      urgency,
      suggestedSpecialty,
      packetSize: syncPacket.payloadSize,
      patientId: syncPacket.patientId,
    });
  } catch (err) {
    console.error("❌ Delta sync error:", err);
    res.status(500).json({ error: "Delta sync failed" });
  }
});

/**
 * Fetch sync packets for doctor dashboard
 * Supports polling for low-bandwidth scenarios
 */
app.get("/api/fetch-sync-packets", async (req, res) => {
  try {
    const { specialty, lastPacketId } = req.query;

    let packets = Array.from(syncPacketStore.values());

    // Filter by specialty if specified
    if (specialty) {
      packets = packets.filter((p) => p.suggestedSpecialty === specialty);
    }

    // Sort by timestamp (newest first)
    packets.sort((a, b) => b.timestamp - a.timestamp);

    // Return packets after the lastPacketId if provided (for incremental sync)
    if (lastPacketId) {
      const lastIndex = packets.findIndex((p) => p.packetId === lastPacketId);
      if (lastIndex >= 0) {
        packets = packets.slice(0, lastIndex);
      }
    }

    console.log(
      `📡 Returning ${packets.length} sync packets for specialty: ${
        specialty || "ALL"
      }`
    );

    res.json({
      packets: packets,
      totalCount: syncPacketStore.size,
      lastSync: Date.now(),
    });
  } catch (err) {
    console.error("❌ Fetch sync packets error:", err);
    res.status(500).json({ error: "Failed to fetch sync packets" });
  }
});

/**
 * Mark packet as processed by doctor
 */
app.post("/api/mark-packet-processed", async (req, res) => {
  try {
    const { packetId, doctorId } = req.body;

    if (!packetId) {
      return res.status(400).json({ error: "Missing packetId" });
    }

    // Remove packet from store after processing
    if (syncPacketStore.has(packetId)) {
      syncPacketStore.delete(packetId);
      console.log("✅ Packet marked as processed:", packetId);
    }

    res.json({
      success: true,
      processedBy: doctorId || "DOCTOR",
    });
  } catch (err) {
    console.error("❌ Mark packet processed error:", err);
    res.status(500).json({ error: "Failed to mark packet as processed" });
  }
});

app.listen(4000, () => {
  console.log("✅ Backend running on port 4000");
  console.log("📡 Rural Sync & Messaging Ready");
  console.log("📋 Sync Packet Storage: Active");
});
