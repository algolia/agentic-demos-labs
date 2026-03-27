import '@/app/globals.css'
import { User } from 'lucide-react'

import { ecommerceConfig as config } from '@/app/config'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'
import { Footer } from '@/components/footer/Footer'
import { Header } from '@/components/header/Header'
import { Providers } from '@/components/providers/Providers'
import { CartBadge } from '@/components/ui/CartBadge'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `S&W - ${config.name}`,
  icons: {
    icon: config.assets.favicon,
  },
}

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
        <main className="flex-1">
          {children}
        </main>
        <Footer variant="standard" name={config.name} />
      </Providers>
    </body>
  </html>
)

export default RootLayout
