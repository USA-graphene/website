'use client'
import { useEffect } from 'react'

/**
 * Fire-and-forget visitor tracker.
 * Place this once in the root layout — it POSTs to /api/visitors on every page load.
 * It has no visible UI; counting is invisible to the visitor.
 */
export default function VisitorTracker() {
  useEffect(() => {
    // Ignore bots, crawlers, and server-side renders
    if (typeof navigator === 'undefined') return
    fetch('/api/visitors/', { method: 'POST' }).catch(() => {/* silent */})
  }, [])

  return null
}
