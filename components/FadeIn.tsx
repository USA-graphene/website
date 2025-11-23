'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
    children: ReactNode
    delay?: number
    className?: string
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function FadeInStagger({ children, className = '', faster = false }: { children: ReactNode, className?: string, faster?: boolean }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ staggerChildren: faster ? 0.1 : 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
