'use client'

import { Check } from 'lucide-react'
import { motion } from 'motion/react'

import { EASE_SMOOTH } from '@/lib/animations'

export const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.4, ease: EASE_SMOOTH }}
    className="bg-success mx-auto flex h-20 w-20 items-center justify-center rounded-full">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3, ease: EASE_SMOOTH }}>
      <Check className="text-success-foreground h-10 w-10" strokeWidth={3} />
    </motion.div>
  </motion.div>
)
