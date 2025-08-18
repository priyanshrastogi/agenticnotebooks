/**
 * Smooth scrolls to an element on the page
 * @param elementId - The ID of the element to scroll to (without the #)
 * @param options - Additional scrolling options
 */
export const scrollToElement = (
  elementId: string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView(options);
  }
};

/**
 * Handles smooth scrolling for anchor links
 * @param e - The click event
 * @param href - The href attribute of the anchor
 * @returns Whether the event was handled
 */
export const handleSmoothScroll = (
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string
): boolean => {
  if (href.startsWith('#')) {
    e.preventDefault();
    const targetId = href.substring(1);
    scrollToElement(targetId);
    return true;
  }
  return false;
};
