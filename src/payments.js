// payments.js — Stripe Checkout flow for subscription plans.
import { supabase } from './supabase.js'
import { createCheckout, confirmCheckout } from './api.js'

/**
 * startCheckout — creates a Stripe Checkout Session on the backend and
 * redirects the browser to Stripe's hosted payment page (cards/UPI in test mode).
 * On success Stripe redirects back to `/?sub=success&plan=...&session_id=...`,
 * which is handled by handleCheckoutReturn() on load.
 */
export async function startCheckout({ user, plan }) {
  if (!user?.id) throw new Error('Please log in to subscribe.')
  const planId = (plan || '').toLowerCase()
  const { url } = await createCheckout(user.id, planId)
  if (!url) throw new Error('Could not start checkout.')
  window.location.href = url   // leave the SPA → Stripe hosted checkout
}

/**
 * handleCheckoutReturn — call once on app load. If the URL carries a completed
 * Stripe session, verify it server-side, refresh the session so the new plan
 * applies app-wide, and clean the URL. Returns { ok, plan } or null.
 */
export async function handleCheckoutReturn(user) {
  const params = new URLSearchParams(window.location.search)
  const sub = params.get('sub')
  if (!sub) return null

  // Always strip the query params so a refresh/Back doesn't re-trigger.
  const clean = () => {
    try { window.history.replaceState(window.history.state, '', window.location.pathname) } catch {}
  }

  if (sub === 'cancel') { clean(); return { ok: false, cancelled: true } }

  const sessionId = params.get('session_id')
  const plan = (params.get('plan') || '').toLowerCase()
  if (sub !== 'success' || !sessionId || !user?.id) { clean(); return null }

  try {
    // 1) Server-side validation: backend retrieves the Stripe session and
    //    confirms payment_status === 'paid' before returning success.
    const res = await confirmCheckout(user.id, plan, sessionId)
    // 2) Activate using the user's OWN session (no backend service-role key
    //    required). The backend + webhook also record it authoritatively.
    try {
      await supabase.auth.updateUser({ data: {
        plan,
        subscription: plan,
        plan_expires: res?.period_end || null,
      }})
    } catch {}
    try { await supabase.auth.refreshSession() } catch {}
    clean()
    return { ok: true, plan: res?.plan || plan }
  } catch (e) {
    // The payment may well have succeeded — the backend webhook activates plans
    // independently. Refresh the session (it may already be Pro) and, if so,
    // treat it as success; otherwise report a soft "activating" state rather
    // than a scary server error.
    let activated = false
    try {
      const { data } = await supabase.auth.refreshSession()
      const p = (data?.user?.user_metadata?.plan || '').toLowerCase()
      activated = !!p && !['free', '', 'none'].includes(p)
    } catch {}
    clean()
    if (activated) return { ok: true, plan }
    return { ok: false, pending: true }
  }
}
