const BLOCKED_KEYS = new Set(['F12']);
const BLOCKED_CTRL_SHIFT_KEYS = new Set(['I', 'J', 'C']);
const BLOCKED_CTRL_KEYS = new Set(['U', 'S']);

const isEnabled = () =>
  import.meta.env.VITE_ENABLE_ANTI_INSPECT === 'true';

const shouldBlockKey = (event) => {
  const key = event.key.toUpperCase();

  return (
    BLOCKED_KEYS.has(event.key) ||
    (event.ctrlKey && event.shiftKey && BLOCKED_CTRL_SHIFT_KEYS.has(key)) ||
    (event.metaKey && event.altKey && BLOCKED_CTRL_SHIFT_KEYS.has(key)) ||
    (event.ctrlKey && BLOCKED_CTRL_KEYS.has(key)) ||
    (event.metaKey && BLOCKED_CTRL_KEYS.has(key))
  );
};

export const initAntiInspect = () => {
  if (!isEnabled() || typeof window === 'undefined') {
    return () => {};
  }

  const blockEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  const handleKeyDown = (event) => {
    if (shouldBlockKey(event)) {
      return blockEvent(event);
    }
    return undefined;
  };

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('contextmenu', blockEvent, true);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('contextmenu', blockEvent, true);
  };
};
