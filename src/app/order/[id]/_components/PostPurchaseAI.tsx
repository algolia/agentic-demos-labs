'use client'

import {
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'

import { useOpenAssistantPanel } from '@/features/aiAssistant/hooks/useOpenAssistantPanel'
import type { OrderContextData } from '@/features/aiAssistant/types'
import { EASE_SMOOTH } from '@/lib/animations'
import type { Order } from '@/stores/order'

interface AILink {
  icon: React.ReactNode
  title: string
  description: string
  question: string
}

const AI_LINKS: AILink[] = [
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'How to care for your products',
    description: 'Get personalized maintenance tips',
    question: 'How should I care for and maintain the products I just ordered?',
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Common questions answered',
    description: 'Find answers instantly with AI',
    question:
      'What are the most common questions about the products I ordered?',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Contact customer support',
    description: 'Chat with our support team',
    question: 'I have a question about my recent order. Can you help me?',
  },
]

interface PostPurchaseAIProps {
  order: Order
  basePath?: string
}

export const PostPurchaseAI = ({
  order,
  basePath = '',
}: PostPurchaseAIProps) => {
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const orderContext: OrderContextData = {
    orderId: order.id,
    items: order.items.map((item) => {
      return {
        objectID: item.objectID,
        name: item.name,
        image: item.image,
        price: item.price,
      }
    }),
  }

  const handleAskQuestion = (question: string) => {
    openWithMessage(question, {
      clearHistory: true,
      expanded: true,
      navigate: false,
      orderContext,
    })
  }

  return (
    <div className="border-border bg-card rounded-card border p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="text-accent h-5 w-5" />
        <h2 className="text-lg font-semibold">Ask AI</h2>
      </div>

      <p className="text-muted-foreground mb-6 text-sm">
        Based on your purchase, here are some ways our AI assistant can help
        you.
      </p>

      {/* Links */}
      <div className="space-y-3">
        {AI_LINKS.map((link, index) => (
          <motion.button
            key={link.title}
            type="button"
            onClick={() => handleAskQuestion(link.question)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1 * index + 0.2,
              duration: 0.3,
              ease: EASE_SMOOTH,
            }}
            className="border-border hover:border-accent/50 hover:bg-muted/50 group flex w-full cursor-pointer items-center gap-4 rounded-lg border p-4 text-left transition-all">
            <div className="text-accent shrink-0">{link.icon}</div>
            <div className="flex-1">
              <p className="font-medium">{link.title}</p>
              <p className="text-muted-foreground text-sm">
                {link.description}
              </p>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-accent h-5 w-5 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
