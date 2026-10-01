/**
 * Focus Management Utilities
 * Improves keyboard navigation and accessibility
 */

export class FocusManager {
  /**
   * Trap focus within a container (for modals, dialogs)
   */
  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstFocusable?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Restore focus to previously focused element
   */
  static createFocusTrap() {
    const previousFocus = document.activeElement as HTMLElement | null;

    return {
      release: () => {
        previousFocus?.focus();
      },
    };
  }

  /**
   * Move focus to next focusable element
   */
  static focusNext(currentElement: HTMLElement) {
    const focusable = this.getFocusableElements();
    const currentIndex = focusable.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % focusable.length;
    focusable[nextIndex]?.focus();
  }

  /**
   * Move focus to previous focusable element
   */
  static focusPrevious(currentElement: HTMLElement) {
    const focusable = this.getFocusableElements();
    const currentIndex = focusable.indexOf(currentElement);
    const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[prevIndex]?.focus();
  }

  /**
   * Get all focusable elements
   */
  static getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  /**
   * Set focus to element with specific ID
   */
  static focusById(id: string) {
    const element = document.getElementById(id);
    element?.focus();
    return element !== null;
  }

  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    if (element.tabIndex < 0) return false;
    if ('disabled' in element && (element as HTMLButtonElement).disabled) return false;
    if (element.hidden) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    
    return true;
  }
}

/**
 * Keyboard Navigation Helper
 */
export class KeyboardNavigator {
  /**
   * Handle arrow key navigation in a list
   */
  static handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number
  ): number {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      items[newIndex]?.focus();
    }

    return newIndex;
  }

  /**
   * Handle Enter/Space for activation
   */
  static handleActivation(
    event: KeyboardEvent,
    callback: () => void
  ): boolean {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
      return true;
    }
    return false;
  }

  /**
   * Handle Escape for closing
   */
  static handleEscape(
    event: KeyboardEvent,
    callback: () => void
  ): boolean {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
      return true;
    }
    return false;
  }
}
