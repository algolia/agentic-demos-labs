'use client'

/**
 * useAIButtonInjection — Injects an "AI mode" button into the autocomplete search bar.
 *
 * This hook demonstrates how to add a custom trigger that opens the Agent Studio
 * Chat widget from anywhere in your app. It uses DOM manipulation to insert a
 * styled button inside the autocomplete form, giving users a clear entry point
 * to the AI shopping assistant directly from the search bar.
 *
 * ## How it works
 *
 * 1. After the autocomplete form renders, we locate it via `.ais-AutocompleteForm`
 * 2. We create a `<button>` element with the `aa-AIButton` class (pre-styled in globals.css)
 * 3. On click, we programmatically click the Chat widget's built-in toggle button
 *    (`.ais-ChatToggleButton`) to open the chat panel
 *
 * ## Why DOM manipulation?
 *
 * The EXPERIMENTAL_Autocomplete component from react-instantsearch doesn't expose
 * a slot or prop for injecting custom elements into the search form. DOM injection
 * is a pragmatic workaround that keeps the integration clean without forking the
 * autocomplete component.
 *
 * ## Styling
 *
 * The button styles are defined in globals.css under the "AI Mode Button" section.
 * They handle positioning (absolute, inside the form), hover states, and the
 * disabled state when no agent ID is configured.
 */

import { useEffect } from 'react'
import { ecommerceConfig } from '@/app/config'

/**
 * SVG markup for the Sparkles icon (from Lucide).
 * We use raw SVG instead of importing the React component because this button
 * is created via DOM manipulation, not JSX rendering.
 */
const SPARKLES_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`

export const useAIButtonInjection = () => {
  const agentId = ecommerceConfig.features.agentStudio.shoppingAssistantAgentID

  useEffect(() => {
    // Don't inject the button if no agent ID is configured
    if (!agentId) return

    /**
     * We use a short delay to ensure the autocomplete form has rendered.
     * MutationObserver would be more robust, but for a demo app this is simpler
     * and the form renders almost immediately on mount.
     */
    const timer = setTimeout(() => {
      const form = document.querySelector('.ais-AutocompleteForm')
      if (!form || form.querySelector('.aa-AIButton')) return // Already injected

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'aa-AIButton'
      button.setAttribute('aria-label', 'Open AI Assistant')
      button.innerHTML = `${SPARKLES_SVG}<span>AI mode</span>`

      /**
       * On click, we open the Chat widget by programmatically clicking its
       * built-in toggle button. This is the simplest way to trigger the panel
       * since the Chat widget manages its own open/close state internally.
       */
      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const toggleButton = document.querySelector<HTMLButtonElement>(
          '.ais-ChatToggleButton',
        )
        if (toggleButton) {
          toggleButton.click()
        }
      })

      form.appendChild(button)
    }, 300)

    return () => {
      clearTimeout(timer)
      // Clean up the injected button on unmount
      document.querySelector('.aa-AIButton')?.remove()
    }
  }, [agentId])
}
