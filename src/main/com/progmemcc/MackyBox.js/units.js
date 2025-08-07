fetch("https://raw.githubusercontent.com/ProgMEM-CC/MackyBox.js/main/lib/dev/window.js")
  .then(res => res.text())
  .then(eval)
  .catch(err => console.error("Failed to load window.js:", err));
