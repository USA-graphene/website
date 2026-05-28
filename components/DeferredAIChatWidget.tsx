'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AIChatWidget = dynamic(() => import('@/components/AIChatWidget'), {
    ssr: false,
})

export default function DeferredAIChatWidget() {
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        const idleCallback = window.requestIdleCallback || ((callback: IdleRequestCallback) => {
            return window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1800)
        })
        const cancelIdleCallback = window.cancelIdleCallback || window.clearTimeout
        const id = idleCallback(() => setShouldLoad(true), { timeout: 2500 })

        return () => cancelIdleCallback(id)
    }, [])

    return shouldLoad ? <AIChatWidget /> : null
}
