const el = document.getElementById('character');

el.addEventListener('mouseenter', () => {
  // When mouse is over the character, stop ignoring mouse events
  window.electronAPI.setIgnoreMouse(false);
});

el.addEventListener('mouseleave', () => {
  // When mouse leaves, pass clicks through to the windows below
  // forward: true ensures mousemove events still trigger mouseenter later
  window.electronAPI.setIgnoreMouse(true, { forward: true });
});

// Initial state: ignore mouse so user can click icons behind the empty space
window.electronAPI.setIgnoreMouse(true, { forward: true });