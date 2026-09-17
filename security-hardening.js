(() => {
  'use strict';

  const desktopPointer = window.matchMedia('(pointer: fine)');
  const editableSelector = 'input, textarea, select, [contenteditable="true"], [data-allow-copy]';
  const isEditable = target => target instanceof Element && Boolean(target.closest(editableSelector));
  const stop = event => event.preventDefault();

  ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => {
    document.addEventListener(type, stop, { passive: false });
  });

  document.addEventListener('touchmove', event => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });

  document.addEventListener('dblclick', stop, { passive: false });
  document.addEventListener('wheel', event => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });

  document.addEventListener('dragstart', event => {
    if (event.target instanceof Element && event.target.closest('img, picture, svg, video')) {
      event.preventDefault();
    }
  });

  document.addEventListener('contextmenu', event => {
    if (desktopPointer.matches) event.preventDefault();
  });

  document.addEventListener('selectstart', event => {
    if (desktopPointer.matches && !isEditable(event.target)) event.preventDefault();
  });

  document.addEventListener('copy', event => {
    if (desktopPointer.matches && !isEditable(event.target)) event.preventDefault();
  });

  document.addEventListener('cut', event => {
    if (desktopPointer.matches && !isEditable(event.target)) event.preventDefault();
  });

  document.addEventListener('keydown', event => {
    const key = String(event.key || '').toLowerCase();
    const command = event.ctrlKey || event.metaKey;
    const zoomShortcut = command && ['+', '-', '=', '0'].includes(key);
    const sourceShortcut = command && key === 'u';
    const saveOrPrintShortcut = command && ['s', 'p'].includes(key);
    const windowsDevtools = event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key);
    const macDevtools = event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key);

    if (zoomShortcut || (desktopPointer.matches && (
      event.key === 'F12' || sourceShortcut || saveOrPrintShortcut || windowsDevtools || macDevtools
    ))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const lockMedia = root => {
    if (root instanceof HTMLImageElement) root.draggable = false;
    if (root instanceof Element || root instanceof Document) {
      root.querySelectorAll('img').forEach(image => { image.draggable = false; });
    }
  };

  const ready = () => {
    lockMedia(document);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => lockMedia(node)));
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
