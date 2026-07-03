/**
 * identity-service.js — shared supplier identity + session helpers.
 *
 * Single source of truth for:
 *   - resolveIdentity(phone) : verify the live Auth session owns suppliers/{phone}
 *   - storeSession(...)      : write the 30-day session token (clears all others)
 *   - getValidSession(phone) : read a non-expired session token
 *
 * Replaces the copies previously duplicated in register.html,
 * register-spa.html and dashboard.html.
 */

import { app, db } from './firebase-config.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { doc, getDoc, collection, addDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const auth = getAuth(app);

// ════════════════════════════════════════════
// SESSION TOKEN HELPERS (30-day localStorage)
// ════════════════════════════════════════════
function sessionKey(phone) {
  return 'mm_session_' + phone;
}

export function getValidSession(phone) {
  try {
    const raw = localStorage.getItem(sessionKey(phone));
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.expiry || Date.now() > session.expiry) {
      localStorage.removeItem(sessionKey(phone));
      return null;
    }
    return session;
  } catch (_) { return null; }
}

// Writes the session token for `phone`, and clears every OTHER mm_session_*
// key first — only one valid session token may exist on a device at a time.
export function storeSession(phone, displayName, supplierType) {
  const keep = sessionKey(phone);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mm_session_') && key !== keep) {
      localStorage.removeItem(key);
    }
  }
  const session = {
    displayName,
    supplierType,
    expiry: Date.now() + 30 * 24 * 60 * 60 * 1000
  };
  localStorage.setItem(keep, JSON.stringify(session));
}

// ════════════════════════════════════════════
// IDENTITY RESOLUTION
// ════════════════════════════════════════════
// Confirms the live Firebase Auth session is allowed to open suppliers/{phone}.
// Reports a result — it does NOT redirect or touch the UI (caller decides).
// Returns one of:
//   { status: 'no-auth' }                              no live Auth session
//   { status: 'not-found', uid }                       no supplier doc yet (pending stage)
//   { status: 'verified', uid }                        doc exists, uid matches session
//   { status: 'blocked', storedUid, sessionUid }       uid mismatch — logged to auditLog
//   { status: 'error', error }                          read failed
export async function resolveIdentity(phone) {
  const user = auth.currentUser;
  if (!user) return { status: 'no-auth' };

  let snap;
  try {
    snap = await getDoc(doc(db, 'suppliers', phone));
  } catch (err) {
    return { status: 'error', error: err };
  }

  if (!snap.exists()) return { status: 'not-found', uid: user.uid };

  const storedUid = snap.data().uid || null;
  if (storedUid !== user.uid) {
    // Hard stop — session UID does not own this supplier record.
    // Best-effort append to the audit log; must never block the security stop.
    try {
      await addDoc(collection(db, 'auditLog'), {
        supplierId: phone,
        action:     'identity_mismatch_blocked',
        actor:      'system',
        oldValues:  { storedUid },
        newValues:  { sessionUid: user.uid },
        timestamp:  serverTimestamp()
      });
    } catch (logErr) {
      console.error('auditLog write failed (identity mismatch):', logErr);
    }
    return { status: 'blocked', storedUid, sessionUid: user.uid };
  }

  return { status: 'verified', uid: user.uid };
}
