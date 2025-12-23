# Prescription Sending & Patient Switching Fix Plan

## Issues Identified

### 1. Prescription Sending Issues

- **API Parameter Mismatch**: Frontend sends `messageType` but backend expects `type`
- **Missing Parameters**: Backend expects `doctorId` but frontend doesn't provide it
- **Content Structure**: Backend expects simple string but gets complex structured data

### 2. Patient Switching Issues

- **Data Not Clearing Properly**: Some state variables not reset during patient switch
- **Incomplete Data Clearing**: Some patient-specific data remains after switch
- **State Management**: Patient profile switching needs better state isolation

## Fix Strategy

### Phase 1: Backend API Fix

1. Update `/api/send-doctor-message` to handle both `messageType` and `type`
2. Make `doctorId` parameter optional (use fallback)
3. Fix parameter structure to match frontend expectations

### Phase 2: Frontend Fix

1. Update `handleDoctorSubmit` to send correct parameters
2. Fix `handlePatientSwitch` to properly clear all patient data
3. Ensure complete state isolation between patients

### Phase 3: Testing & Validation

1. Test prescription sending from doctor to patient
2. Test patient switching functionality
3. Verify data isolation between patients

## Implementation Steps

1. **Backend Updates** (index.js)

   - Fix `/api/send-doctor-message` endpoint
   - Handle parameter variations
   - Improve error handling

2. **Frontend Updates** (App.tsx)

   - Update `handleDoctorSubmit` function
   - Fix `handlePatientSwitch` function
   - Ensure proper state management

3. **Testing**
   - Verify prescription delivery
   - Test patient switching
   - Confirm data isolation

## Expected Outcome

- ✅ Doctors can successfully send prescriptions to patients
- ✅ Patients can switch between profiles seamlessly
- ✅ Complete data isolation between different patients
- ✅ Proper error handling and user feedback
