function focusableElements(container) {
  return [...container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden);
}

export function createModalController(modal, openButton, closeButton) {
  let returnFocus = openButton;

  function open() {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    closeButton.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }

  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = focusableElements(modal);
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return { open, close };
}

export function setupTabs(tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  function activate(tab) {
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.setAttribute('aria-selected', String(active));
      candidate.classList.toggle('active', active);
      candidate.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(candidate.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activate(tabs[nextIndex]);
    });
  });
}

export async function copyTextFromElement(element) {
  const value = element.textContent || '';
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand('copy');
  selection.removeAllRanges();
  if (!copied) throw new Error('Clipboard permission is unavailable. Select and copy the text manually.');
  return true;
}

export function announce(element, message) {
  element.textContent = message;
}
