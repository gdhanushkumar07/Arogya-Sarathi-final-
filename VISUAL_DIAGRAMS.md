# 📊 Visual Diagrams & Data Flows

## 1. Before vs After

### ❌ Before (Broken)

```
BROWSER localStorage
├── hv_user_role: "PATIENT"
├── hv_vault_PAT-JOHN-25-BANGALORE: {
│   ├── patientId: "PAT-JOHN-25-BANGALORE"
│   ├── records: [{
│   │   ├── type: "VISUAL_TRIAGE"
│   │   └── media: {} ← File object lost!
│   └── }]
└── }
    └── hv_vault_DOC-SMITH-CARDIO: {} ← Different key!

PROBLEM:
  Patient uses key: hv_vault_PAT-JOHN
  Doctor uses key: hv_vault_DOC-SMITH
  These are DIFFERENT!
  → Doctor can't see patient's image
```

### ✅ After (Fixed)

```
BROWSER localStorage
└── medicalCases: [{
    ├── caseId: "CASE-PAT-JOHN-1234567890"
    ├── patientId: "PAT-JOHN"
    ├── patientName: "John Doe"
    ├── images: [{
    │   ├── imageId: "IMG-1234"
    │   ├── filename: "rash.jpg"
    │   └── base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." ✅ Full image
    │   }]
    ├── replies: [{
    │   ├── replyId: "REPLY-5678"
    │   ├── doctorName: "Dr. Smith"
    │   ├── specialization: "Dermatology"
    │   └── content: "This looks like eczema..."
    │   }]
    ├── status: "REVIEWED"
    ├── createdAt: 1703000000000
    └── updatedAt: 1703001000000
    }]

SOLUTION:
  Both Patient and Doctor use key: medicalCases
  This is THE SAME key!
  → Doctor immediately sees patient's image
  → All replies saved in same object
  → Patient sees replies on refresh
```

---

## 2. Data Flow Diagram

### Patient Uploads Image

```
┌─────────────────────────────────────┐
│  Patient Click: Choose Image        │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Browser File Input Dialog          │
│  User selects: rash.jpg             │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  handleImageUpload()                │
│  event.target.files[0] → File obj   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  validateFileSize(file)             │
│  ✅ 500KB < 5MB limit               │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  fileToBase64(file)                 │
│  File object → Data URL             │
│  "data:image/jpeg;base64,/9j..."    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  createImageThumbnail(base64)       │
│  Compress: 665KB → 180KB            │
│  "data:image/jpeg;base64,/9j..."    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  createMedicalCase(...)             │
│  ├─ patientId                       │
│  ├─ patientName                     │
│  ├─ images[0].base64Data ← Thumbnail│
│  └─ replies: []                     │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  localStorage.setItem(              │
│    'medicalCases',                  │
│    JSON.stringify(allCases)          │
│  )                                  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  localStorage['medicalCases']       │
│  = [{image, replies: []}]           │
│  ✅ Data persisted!                  │
└─────────────────────────────────────┘
```

### Doctor Views Cases

```
┌─────────────────────────────────────┐
│  Doctor Login                       │
│  useEffect(() => {                  │
│    getAllCases()                    │
│  })                                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  getAllCases()                      │
│  localStorage.getItem('medicalCases')│
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Parse JSON                         │
│  JSON.parse(stored)                 │
│  → [case1, case2, case3]            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Return All Cases                   │
│  ✅ Doctor sees:                     │
│  - Case ID                          │
│  - Patient name                     │
│  - Images                           │
│  - Previous replies                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Render in DoctorDashboard          │
│  Cases displayed in grid            │
│  Click case → View details          │
└─────────────────────────────────────┘
```

### Doctor Sends Reply

```
┌─────────────────────────────────────┐
│  Doctor Types in UI                 │
│  Type: PRESCRIPTION                 │
│  Medication: Hydrocortisone 1%      │
│  Notes: Apply twice daily           │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Doctor Click: Send to Patient      │
│  handleSendReply()                  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  addDoctorReply(...)                │
│  ├─ caseId: "CASE-PAT-JOHN"         │
│  ├─ doctorId: "DOC-001"             │
│  ├─ doctorName: "Dr. Smith"         │
│  ├─ content: "Apply twice daily"    │
│  ├─ type: "PRESCRIPTION"            │
│  └─ medication: "Hydrocortisone..."  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Fetch case from storage            │
│  getCaseById(caseId)                │
│  Find in localStorage['medicalCases']│
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Create Reply Object                │
│  {                                  │
│    replyId: "REPLY-5678"            │
│    doctorName: "Dr. Smith"          │
│    content: "Apply twice daily"     │
│    timestamp: 1703001000000         │
│  }                                  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Add to case.replies array          │
│  medicalCase.replies.push(reply)    │
│  medicalCase.updatedAt = now()      │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Save back to localStorage          │
│  localStorage.setItem(              │
│    'medicalCases',                  │
│    JSON.stringify(updatedCases)      │
│  )                                  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Success!                           │
│  ✅ Reply saved to same case object  │
│  ✅ Patient can fetch it on refresh  │
└─────────────────────────────────────┘
```

### Patient Sees Doctor's Reply

```
┌─────────────────────────────────────┐
│  Patient Login / Refresh Page       │
│  useEffect(() => {                  │
│    getCasesByPatient(patientId)     │
│  })                                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  getCasesByPatient(patientId)       │
│  getAllCases()                      │
│  .filter(c => c.patientId ===...)   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Return patient's cases             │
│  Only cases where patient is author │
│  [{                                 │
│    images: [...],                   │
│    replies: [← Doctor's reply!]     │
│  }]                                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Render in PatientImageUpload       │
│  Show case with:                    │
│  - Original images                  │
│  - Doctor's reply text              │
│  - Doctor's name & specialty        │
│  - Timestamp of reply               │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  ✅ Patient Sees:                    │
│  "Dr. Smith (Dermatology):          │
│   Apply Hydrocortisone 1% cream     │
│   twice daily for 2 weeks"          │
└─────────────────────────────────────┘
```

---

## 3. File Conversion Process

```
INPUT: File object from <input type="file">
┌──────────────────────────────────┐
│ File {                           │
│   name: "rash.jpg"               │
│   size: 512000                   │
│   type: "image/jpeg"             │
│   lastModified: 1234567890       │
│ }                                │
└──────────────────────────────────┘
        ↓
        │ FileReader API
        │ reader.readAsDataURL(file)
        ↓
┌──────────────────────────────────┐
│ Data URL (Base64 encoded)        │
│                                  │
│ "data:image/jpeg;base64,         │
│ /9j/4AAQSkZJRgABAQEAYABgAAD...  │
│ ...very long string...           │
│ ...every character is ASCII...   │
│ ...can be stored as JSON...      │
│ "                                │
└──────────────────────────────────┘
        ↓
        │ JSON.stringify()
        │ (can now serialize!)
        ↓
┌──────────────────────────────────┐
│ JSON in localStorage             │
│                                  │
│ {                                │
│   "medicalCases": [{             │
│     "images": [{                 │
│       "base64Data":              │
│       "data:image/jpeg;base64,..."│
│     }]                           │
│   }]                             │
│ }                                │
└──────────────────────────────────┘
        ↓
        │ Retrieve and display
        │ <img src={getImageUrl(base64)} />
        ↓
┌──────────────────────────────────┐
│ Output: <img> displays image     │
│                                  │
│ <img src="data:image/jpeg;..."/> │
│         ↓                        │
│    Browser renders image         │
└──────────────────────────────────┘
```

---

## 4. Storage Structure

### localStorage Keys

```
localStorage = {
  // OLD KEYS (to be removed):
  "hv_user_role": "PATIENT",
  "hv_patient_profile": {...},
  "hv_vault_PAT-JOHN": {...},
  "hv_doctor_profile": {...},
  "hv_vault_DOC-SMITH": {...},
  
  // NEW SHARED KEY:
  "medicalCases": [...] ← ✅ Use this!
}
```

### medicalCases Structure

```
medicalCases = [
  {
    // CASE METADATA
    caseId: "CASE-PAT-JOHN-1703000000000",
    status: "PENDING" | "REVIEWED" | "RESOLVED",
    createdAt: 1703000000000,
    updatedAt: 1703001000000,
    
    // PATIENT INFO
    patientId: "PAT-JOHN",
    patientName: "John Doe",
    patientAge: 25,
    patientPhone: "9876543210",
    patientDistrict: "Bangalore",
    patientState: "Karnataka",
    
    // IMAGES (uploaded by patient)
    images: [
      {
        imageId: "IMG-1703000000001",
        filename: "rash.jpg",
        base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        uploadedAt: 1703000000000,
        type: "IMAGE"
      },
      {
        imageId: "IMG-1703000000002",
        filename: "closeup.jpg",
        base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        uploadedAt: 1703000000100,
        type: "IMAGE"
      }
    ],
    
    // REPLIES (added by doctors)
    replies: [
      {
        replyId: "REPLY-1703000500000",
        doctorId: "DOC-001",
        doctorName: "Dr. Smith",
        specialization: "Dermatology",
        type: "PRESCRIPTION",
        medication: "Hydrocortisone 1% cream",
        content: "Apply twice daily for 2 weeks",
        timestamp: 1703000500000
      },
      {
        replyId: "REPLY-1703000600000",
        doctorId: "DOC-002",
        doctorName: "Dr. Johnson",
        specialization: "General Medicine",
        type: "DOCTOR_NOTE",
        medication: undefined,
        content: "Also recommended: increase water intake, avoid allergens",
        timestamp: 1703000600000
      }
    ]
  },
  
  {
    // ANOTHER CASE...
    caseId: "CASE-PAT-JANE-1703000100000",
    // ... similar structure ...
  }
]
```

---

## 5. Role-Based Data Access

### Patient Sees

```
Login: PATIENT (PAT-JOHN)
        ↓
getAllCases() returns all [{...}, {...}, ...]
        ↓
Filter: cases where patientId == "PAT-JOHN"
        ↓
Patient's View:
├─ My Case 1
│  ├─ My images
│  └─ Doctor's replies to MY case
├─ My Case 2
│  ├─ My images
│  └─ Doctor's replies to MY case
└─ (Can't see other patient's cases)
```

### Doctor Sees

```
Login: DOCTOR (DOC-SMITH)
        ↓
getAllCases() returns all [{...}, {...}, ...]
        ↓
Filter: cases where suggestedSpecialty matches specialty
        ↓
Doctor's View:
├─ Patient 1's Case
│  ├─ Patient 1's images ← Can see
│  └─ All replies (including mine)
├─ Patient 2's Case
│  ├─ Patient 2's images ← Can see
│  └─ All replies
├─ Patient 3's Case
│  └─ (Even if I haven't replied yet)
└─ (Can see ALL cases in system!)
```

---

## 6. Storage Size Growth

### As Cases Accumulate

```
1st image upload:
  Image: 500KB
  Base64: 665KB
  JSON: 700KB
  Total stored: 700KB
  ✅ 6.5% of quota used

2nd image upload:
  Per case: 700KB
  Total: 1.4MB
  ✅ 13% of quota used

3rd image upload:
  Total: 2.1MB
  ✅ 21% of quota used

4th image upload:
  Total: 2.8MB
  ✅ 28% of quota used

5th image upload:
  Total: 3.5MB
  ✅ 35% of quota used

6th image upload:
  Total: 4.2MB
  ⚠️  42% of quota used (getting full)

7th image upload:
  Total: 4.9MB
  ⚠️  49% of quota used (almost full)

8th image upload:
  Total: 5.6MB
  ❌ 56% of quota used (EXCEEDS LIMIT!)
  ERROR: QuotaExceededError


SOLUTION: Use thumbnails
  Image: 500KB
  Thumbnail: 150KB
  Base64: 200KB
  JSON: 220KB per case
  
  With thumbnails:
  10 images: 2.2MB (still plenty of room!)
  20 images: 4.4MB (still OK!)
```

---

## 7. Comparison: Before vs After

### Data Visibility

```
BEFORE (Broken):
┌─────────────────────────────────┐
│ localStorage                    │
├─────────────────────────────────┤
│                                 │
│ Patient View:                   │
│ ├─ Own vault: {images}          │
│ └─ Doctor vault: Can't access   │
│                                 │
│ Doctor View:                    │
│ ├─ Own vault: empty             │
│ └─ Patient vault: Can't access  │
│                                 │
│ RESULT: No communication! ❌    │
└─────────────────────────────────┘


AFTER (Fixed):
┌─────────────────────────────────┐
│ localStorage['medicalCases']    │
├─────────────────────────────────┤
│                                 │
│ Patient View:                   │
│ ├─ My cases: {images + replies} │
│ └─ Others' cases: Don't display │
│                                 │
│ Doctor View:                    │
│ ├─ All cases: {images + replies}│
│ └─ Can add replies to any case  │
│                                 │
│ RESULT: Full communication! ✅  │
└─────────────────────────────────┘
```

### Data Persistence

```
BEFORE (Broken):
Page Refresh
  ↓
localStorage read
  ↓
Image File object
  ↓
JSON.stringify() → {} (empty!)
  ↓
❌ Image lost!


AFTER (Fixed):
Page Refresh
  ↓
localStorage read
  ↓
Image Base64 string
  ↓
JSON.stringify() → "data:image/..."
  ↓
✅ Image restored!
```

---

## 8. Timeline: Patient to Doctor to Patient

```
T0:00 - Patient Login
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: []             │
└──────────────────────────────┘

T0:05 - Patient Uploads Image
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{             │
│   images: [img]              │
│   replies: []                │
│ }]                           │
└──────────────────────────────┘

T0:10 - Patient Logs Out
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{...}] ← Still here!
└──────────────────────────────┘

T0:15 - Doctor Logs In (same browser)
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{             │
│   images: [img] ← Doctor sees!
│   replies: []                │
│ }]                           │
└──────────────────────────────┘

T0:20 - Doctor Sends Reply
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{             │
│   images: [img]              │
│   replies: [reply] ← Added!  │
│ }]                           │
└──────────────────────────────┘

T0:25 - Doctor Logs Out
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{...}] ← Still here!
└──────────────────────────────┘

T0:30 - Patient Logs Back In (refresh)
┌──────────────────────────────┐
│ Browser Storage:             │
│ medicalCases: [{             │
│   images: [img]              │
│   replies: [reply] ← Patient sees!
│ }]                           │
└──────────────────────────────┘
```

---

## 9. Component Interaction Diagram

```
                           ┌─────────────────┐
                           │   App.tsx       │
                           │ (Main Component)│
                           └────────┬────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
        │   userRole     │  │ userRole       │  │ userRole    │
        │                │  │                │  │             │
        │   PATIENT      │  │   DOCTOR       │  │  PHARMACY   │
        │   ↓            │  │   ↓            │  │  ↓          │
        │ ┌──────────────┤  │ ┌──────────────┤  │ ┌─────────┐  │
        │ │PatientImage  │  │ │DoctorDashbrd│  │ │Pharmacy │  │
        │ │Upload        │  │ │             │  │ │Ordering │  │
        └─┤component     │  │ │ - getAllCases  │ │ └─────────┘  │
          │ - fileToBase64  │ │ - getCaseById  │ └──────────────┘
          │ - createCase    │ │ - addReply     │
          │ - showCases     │ │ - showCases    │
          └──┬───────────────┤ │               │
             │               │ │               │
             └──────┬────────┴─┴───────────────┘
                    │
        ┌───────────▼──────────────┐
        │  medicalCasesService.ts  │
        │  (Shared Storage Logic)  │
        │                          │
        │ ┌──────────────────────┐ │
        │ │ MEDICAL_CASES_KEY    │ │
        │ │ 'medicalCases'       │ │
        │ └──────────────────────┘ │
        │                          │
        │ - createMedicalCase()    │
        │ - getAllCases()          │
        │ - getCasesByPatient()    │
        │ - addDoctorReply()       │
        │ - addImageToCase()       │
        │ - deleteCase()           │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │  localStorage            │
        │  (Browser Storage)       │
        │  ~5-10MB per origin      │
        └──────────────────────────┘
            │
            └─── Image 1: Base64 string
            └─── Image 2: Base64 string
            └─── Reply 1: JSON object
            └─── Reply 2: JSON object
```

---

## 10. Error Handling Flow

```
Upload Image
  ↓
┌─ File selected?
│  ├─ No → Show error "Please select file"
│  └─ Yes ↓
│
└─ File < 5MB?
   ├─ No → Show error "File too large"
   └─ Yes ↓
      ├─ Convert to Base64
      │  ├─ Error → Show "Conversion failed"
      │  └─ Success ↓
      │
      ├─ Create thumbnail
      │  ├─ Error → Show "Compression failed"
      │  └─ Success ↓
      │
      ├─ Create medical case
      │  ├─ Error → Show "Save failed"
      │  └─ Success ↓
      │
      └─ ✅ Show success "Image uploaded!"


Send Doctor Reply
  ├─ Case selected?
  │  ├─ No → Show error "Select case first"
  │  └─ Yes ↓
  │
  ├─ Message entered?
  │  ├─ No → Show error "Enter message"
  │  └─ Yes ↓
  │
  ├─ Prescription type?
  │  ├─ Yes → Medication entered?
  │  │  ├─ No → Show error "Enter medication"
  │  │  └─ Yes ↓
  │  └─ No → Continue ↓
  │
  ├─ Add reply to case
  │  ├─ Error → Show "Failed to send"
  │  └─ Success ↓
  │
  └─ ✅ Show success "Reply sent!"
```

---

This visual guide helps understand the complete system! 🎉
