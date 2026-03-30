import '@/app/globals.css'
import { User } from 'lucide-react'

import { ecommerceConfig as config } from '@/app/config'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'
import { Footer } from '@/components/footer/Footer'
import { Header } from '@/components/header/Header'
import { Providers } from '@/components/providers/Providers'
import { CartBadge } from '@/components/ui/CartBadge'
import { ChatAssistant } from '@/features/chat/ChatAssistant'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `S&W - ${config.name}`,
  icons: {
    icon: config.assets.favicon,
  },
}

/**
 * Root Layout — The main layout structure with an optional AI sidebar.
 *
 * The layout uses a two-column flex structure:
 *   ┌──────────────────────┬──────────────┐
 *   │       Header         │              │
 *   ├──────────────────────┤  AI Assistant │
 *   │    Main Content      │   Sidebar    │
 *   ├──────────────────────┤   (400px)    │
 *   │       Footer         │              │
 *   └──────────────────────┴──────────────┘
 *
 * When the AI sidebar is closed, the main content takes the full width.
 * When opened, the sidebar slides in from the right and the main content
 * shrinks to make room — no overlay, no content hiding.
 *
 * The sidebar is rendered via the `<ChatAssistant>` component which embeds
 * the Agent Studio Chat widget. The sidebar width is controlled by the
 * `--assistant-panel-width` CSS variable (400px).
 */
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body>
      <Providers config={config}>
        <Header
          variant="standard"
          logo="/images/ecommerce/S&W - Ecommerce - logo.svg"
          basePath="">
          <Header.CenterSection>
            <AutocompleteWidget
              basePath=""
              placeholder="What are you looking for today?"
              showSuggestions
            />
          </Header.CenterSection>
          <Header.RightSection>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground p-2 transition-colors"
              aria-label="Account">
              <User className="h-5 w-5" />
            </button>
            <CartBadge href="/cart" />
          </Header.RightSection>
        </Header>

        {/*
          Two-column layout: main content + optional AI sidebar.
          The sidebar is part of the document flow, not a fixed overlay.
          When opened, it pushes the main content to the left.
        */}
        <div className="flex flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer variant="standard" name={config.name} />
          </div>
          <ChatAssistant />
        </div>
      </Providers>
    </body>
  </html>
)

export default RootLayout
