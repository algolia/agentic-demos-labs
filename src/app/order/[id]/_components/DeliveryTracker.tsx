'use client'

import { Check, Package, Truck } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { EASE_SMOOTH } from '@/lib/animations'

const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const CURRENT_STEP = 1

export const DeliveryTracker = () => {
  const [steps, setSteps] = useState([
    { id: 1, label: 'Confirmed', date: '', icon: <Check className="h-4 w-4" /> },
    { id: 2, label: 'In Transit', date: '', icon: <Truck className="h-4 w-4" /> },
    { id: 3, label: 'Delivered', date: '', icon: <Package className="h-4 w-4" /> },
  ])

  useEffect(() => {
    const now = new Date()
    setSteps([
      { id: 1, label: 'Confirmed', date: formatDate(now), icon: <Check className="h-4 w-4" /> },
      { id: 2, label: 'In Transit', date: formatDate(new Date(now.getTime() + 2 * 86400000)), icon: <Truck className="h-4 w-4" /> },
      { id: 3, label: 'Delivered', date: formatDate(new Date(now.getTime() + 5 * 86400000)), icon: <Package className="h-4 w-4" /> },
    ])
  }, [])

  return (
    <div className="border-border bg-card rounded-card border p-6">
      <div className="mb-6 flex items-center gap-2">
        <Truck className="text-primary h-5 w-5" />
        <h2 className="text-lg font-semibold">Delivery Estimate</h2>
      </div>

      <div className="relative">
        {/* Progress Bar Background */}
        <div className="bg-muted absolute top-5 right-6 left-6 h-0.5" />

        {/* Progress Bar Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${((CURRENT_STEP - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_SMOOTH }}
          className="bg-primary absolute top-5 left-6 h-0.5"
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id <= CURRENT_STEP
            const isCurrent = step.id === CURRENT_STEP

            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.3,
                    ease: EASE_SMOOTH,
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  } ${isCurrent ? 'ring-primary/20 ring-4' : ''}`}>
                  {step.icon}
                </motion.div>
                <span
                  className={`mt-2 text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {step.date}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <a
        href="#"
        className="text-primary mt-6 block text-center text-sm hover:underline">
        Track your order →
      </a>
    </div>
  )
}
