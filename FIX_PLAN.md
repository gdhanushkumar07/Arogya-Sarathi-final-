# Doctor → Patient Message Visibility Fix Plan (Arogya Sarathi)

## Issue Summary

Messages sent by doctors are not visible to patients in the Arogya Sarathi application because:

1. Doctor creates messages locally in vault but doesn't save to backend
2. Patient fetches from backend API but finds empty store
3. Missing integration between local vault and backend message persistence

## Root Cause

In `handleDoctorSubmit` function (App.tsx line ~1200):

- Creates `doctorMessage` locally in vault ✅
- Calls `/api/patient-response` for translation ✅
- Does NOT call `/api/send-doctor-message` to persist ❌
- Result: Messages exist locally but not in backend storage

## Fix Strategy

**1. Backend Updates (index.js)**

- Add `POST /api/messages` endpoint for saving doctor messages
- Update `GET /api/messages/:patientId` for fetching messages
- Use existing in-memory `messageStore` (no database needed)
- Ensure proper error handling and validation

**2. Frontend Updates (App.tsx)**

- Update `handleDoctorSubmit` to call backend after creating local message
- Add proper patientId to message payload
- Ensure message fetching works correctly
- Keep all existing UI, styling, and logic unchanged

**3. Message Flow Fix**

```
Doctor Submits → Local Message Created → Backend API Call → Message Saved → Patient Can See
```

## Files to Update

1. `/backend/index.js` - Add message persistence endpoints
2. `/App.tsx` - Update `handleDoctorSubmit` to use backend persistence

## Testing Strategy

1. Doctor sends message to patient
2. Patient logs in → Should see message
3. Patient refreshes → Message persists
4. Verify all existing functionality remains intact

## Key Constraints

- NO database - use in-memory storage only
- NO UI/layout/styling changes
- NO unrelated logic changes
- Keep all other features exactly the same
- Fix ONLY the message sync issue

## Implementation Steps

1. Add missing backend endpoints
2. Update doctor submit logic to persist to backend
3. Test message visibility end-to-end
4. Verify no regression in existing features
