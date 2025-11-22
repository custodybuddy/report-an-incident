# Diagnostic Audit: State Management & Persistence

## Summary
- Identified gaps in how the draft autosave flow coordinates with the restore prompt, leading to potential data loss before a user decision.
- Flagged missing cleanup when users withdraw consent, leaving sensitive drafts resident in web storage.
- Noted absent synchronization with storage events, which can leave the UI out of sync with the actual contents of session/local storage.

## Findings
1. **Autosave is disabled whenever a stored draft exists but the user has not responded to the restore prompt.** The `shouldPersistDraft` flag starts `false` and only flips to `true` after the stored draft is explicitly restored or discarded. If a draft exists, the prompt renders but persistence remains off, so any edits made before clicking either action are never written to storage and are lost on refresh/close. 【F:src/App.tsx†L26-L34】【F:src/App.tsx†L211-L223】【F:src/hooks/useIncidentDraftStorage.ts†L96-L108】
2. **Revoking consent does not clear previously persisted drafts.** Draft writes are gated on `incidentData.consentAcknowledged`, but there is no complementary branch to purge storage when a user unchecks consent. Once a draft has been persisted, toggling consent off stops new writes yet leaves the existing JSON blob in storage, potentially retaining data against user intent. 【F:src/hooks/useIncidentDraftStorage.ts†L96-L108】【F:src/hooks/useIncidentDraftStorage.ts†L90-L94】
3. **No storage-event synchronization leaves `storedDraft` stale across tabs or manual clears.** The hook reads storage once on mount and updates its state only when it writes or clears internally. External changes (another tab clearing storage, devtools clearing application data, or switching storage type) are never observed, so `hasStoredDraft` can present an outdated restore prompt and risk overwriting fresher data. 【F:src/hooks/useIncidentDraftStorage.ts†L28-L76】【F:src/hooks/useIncidentDraftStorage.ts†L90-L114】
