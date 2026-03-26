'use client'

import { useEffect } from 'react'

const BACK_ARROW_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 12H5"/>
    <path d="m12 19-7-7 7-7"/>
  </svg>
`

/**
 * In the detached autocomplete overlay (mobile), replaces the magnifier
 * submit button with a back arrow that closes the overlay.
 */
export const useDetachedBackButton = () => {
  useEffect(() => {
    const patchSubmitButton = () => {
      const overlay = document.querySelector('.ais-AutocompleteDetachedOverlay')
      if (!overlay) return

      const submitBtn = overlay.querySelector<HTMLButtonElement>(
        '.ais-AutocompleteSubmitButton',
      )
      if (!submitBtn || submitBtn.dataset.patched) return

      submitBtn.dataset.patched = 'true'
      submitBtn.innerHTML = BACK_ARROW_SVG
      submitBtn.type = 'button'

      submitBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const cancelBtn = overlay.querySelector<HTMLButtonElement>(
          '.ais-AutocompleteDetachedCancelButton',
        )
        cancelBtn?.click()
      })
    }

    patchSubmitButton()

    const observer = new MutationObserver(() => patchSubmitButton())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])
}
