(function(){
  if (!window._eagFrameCount) window._eagFrameCount = 0;
  if (!window._eagZIndex) window._eagZIndex = 10000;
  if (!window._eagWindows) window._eagWindows = {};
  if (!window._eagFocusedId) window._eagFocusedId = null;

  if (!window._eagDock) {
    const dock = document.createElement("div");
    dock.id = "eagDock";
    dock.style.position = "fixed";
    dock.style.bottom = "0";
    dock.style.left = "50%";
    dock.style.transform = "translateX(-50%)";
    dock.style.height = "60px";
    dock.style.background = "rgba(240,240,240,0.95)";
    dock.style.borderTop = "1px solid #ccc";
    dock.style.borderRadius = "20px 20px 0 0";
    dock.style.padding = "0 15px";
    dock.style.display = "flex";
    dock.style.alignItems = "center";
    dock.style.gap = "10px";
    dock.style.zIndex = 999999;
    dock.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    dock.style.userSelect = "none";
    document.body.appendChild(dock);
    window._eagDock = dock;
    window._eagDockVisible = true;
  }

  if (!document.getElementById("eagFrameStyles")) {
    const s = document.createElement("style");
    s.id = "eagFrameStyles";
    s.textContent = `
      .eagWrap {
        position: fixed;
        top: 100px;
        left: 100px;
        width: 800px;
        height: 500px;
        background: #d8d8d8;
        border-radius: 20px;
        box-shadow: inset 0 1px #fff, 0 4px 10px rgba(0,0,0,0.2);
        border: 1px solid #aaa;
        font-family: Helvetica, sans-serif;
        z-index: 99999;
        overflow: hidden;
        transition: height 0.2s ease;
        user-select: none;
      }
      .eagHeader {
        height: 40px;
        background: linear-gradient(#f0f0f0, #ccc);
        padding: 5px 10px;
        cursor: move;
        border-bottom: 1px solid #aaa;
        display: flex;
        align-items: center;
        font-size: 14px;
        border-radius: 20px 20px 0 0;
        user-select: none;
        justify-content: space-between;
      }
      .eagTitle {
        flex-grow: 1;
        margin-left: 10px;
        font-weight: 600;
      }
      .eagButtons {
        display: flex;
        gap: 8px;
        margin-right: 8px;
        align-items: center;
      }
      .eagButton {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.15);
        box-shadow: inset 0 1px rgba(255,255,255,0.6);
        cursor: pointer;
      }
      .eagClose {
        background: #ff605c;
      }
      .eagMinimize {
        background: #ffbd44;
      }
      .eagMaximize {
        background: #00ca56;
      }
      .eagIframe {
        width: 100%;
        height: calc(100% - 40px);
        border: none;
        display: block;
        border-radius: 0 0 20px 20px;
      }
      .eagResizeHandle {
        position: absolute;
        width: 16px;
        height: 16px;
        bottom: 8px;
        right: 8px;
        cursor: se-resize;
        border-radius: 4px;
        user-select: none;
      }
      .eagWrap.hidden {
        display: none !important;
      }
      #eagDock .dockIcon {
        background: #ddd;
        border-radius: 10px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 13px;
        color: #333;
        font-family: Helvetica, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        user-select: none;
        transition: background 0.2s ease;
        white-space: nowrap;
      }
      #eagDock .dockIcon:hover {
        background: #bbb;
      }
      #eagDock.hidden {
        transform: translateX(-50%) translateY(100%);
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(s);
  }

  window.showSiteFrame = function (barTitle, siteUrl, resizable = true) {
    window._eagFrameCount++;
    const id = "eagFrame" + window._eagFrameCount;

    const wrap = document.createElement("div");
    wrap.classList.add("eagWrap");
    wrap.id = id;
    wrap.style.zIndex = ++window._eagZIndex;

    const header = document.createElement("div");
    header.className = "eagHeader";

    const buttons = document.createElement("div");
    buttons.className = "eagButtons";

    const closeBtn = document.createElement("div");
    closeBtn.className = "eagButton eagClose";
    const minBtn = document.createElement("div");
    minBtn.className = "eagButton eagMinimize";
    const maxBtn = document.createElement("div");
    maxBtn.className = "eagButton eagMaximize";

    buttons.appendChild(closeBtn);
    buttons.appendChild(minBtn);
    buttons.appendChild(maxBtn);

    const titleSpan = document.createElement("span");
    titleSpan.className = "eagTitle";
    titleSpan.textContent = barTitle;

    header.appendChild(buttons);
    header.appendChild(titleSpan);

    const iframe = document.createElement("iframe");
    iframe.className = "eagIframe";
    iframe.src = siteUrl;
    iframe.allowFullscreen = true;

    wrap.appendChild(header);
    wrap.appendChild(iframe);

    let resizeHandle;
    if (resizable) {
      resizeHandle = document.createElement("div");
      resizeHandle.className = "eagResizeHandle";
      wrap.appendChild(resizeHandle);
    }

    document.body.appendChild(wrap);

    function focusWindow() {
      window._eagZIndex++;
      wrap.style.zIndex = window._eagZIndex;
      window._eagFocusedId = id;
    }
    focusWindow();

    wrap.addEventListener("mousedown", () => focusWindow());

    let isDragging = false,
        offsetX = 0,
        offsetY = 0;

    header.addEventListener("mousedown", (e) => {
      if ([closeBtn, minBtn, maxBtn].includes(e.target)) return;
      isDragging = true;
      offsetX = e.clientX - wrap.offsetLeft;
      offsetY = e.clientY - wrap.offsetTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      wrap.style.left = x + "px";
      wrap.style.top = y + "px";
    });

    if (resizable && resizeHandle) {
      let isResizing = false, startX, startY, startW, startH;
      resizeHandle.addEventListener("mousedown", (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = wrap.offsetWidth;
        startH = wrap.offsetHeight;
        document.body.style.userSelect = "none";
      });
      document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        wrap.style.width = Math.max(300, startW + (e.clientX - startX)) + "px";
        wrap.style.height = Math.max(200, startH + (e.clientY - startY)) + "px";
      });
      document.addEventListener("mouseup", () => {
        isResizing = false;
        document.body.style.userSelect = "";
      });
    }

    function createDockIcon(id, title) {
      const icon = document.createElement("div");
      icon.className = "dockIcon";
      icon.textContent = title;
      icon.title = title;
      icon.onclick = () => {
        if (wrap.classList.contains("hidden")) {
          // Animate back from dock to window
          wrap.classList.remove("hidden");
          wrap.style.transformOrigin = "bottom center";
          wrap.style.transform = "scaleY(0)";
          wrap.style.opacity = "0";
          setTimeout(() => {
            wrap.style.transition = "transform 0.3s ease, opacity 0.3s ease";
            wrap.style.transform = "scaleY(1)";
            wrap.style.opacity = "1";
          }, 10);
          setTimeout(() => {
            wrap.style.transition = "";
          }, 310);
        }
        focusWindow();
        _eagDock.removeChild(icon);
      };
      return icon;
    }

    closeBtn.onclick = () => {
      const win = window._eagWindows[id];
      if (win?.dockIcon) _eagDock.removeChild(win.dockIcon);
      delete window._eagWindows[id];
      if (window._eagFocusedId === id) window._eagFocusedId = null;
      wrap.remove();
    };

    minBtn.onclick = () => {
      const dockIcon = createDockIcon(id, barTitle);
      const rect = wrap.getBoundingClientRect();
      const dockRect = _eagDock.getBoundingClientRect();

      const clone = wrap.cloneNode(true);
      clone.style.pointerEvents = "none";
      clone.style.position = "fixed";
      clone.style.left = rect.left + "px";
      clone.style.top = rect.top + "px";
      clone.style.width = rect.width + "px";
      clone.style.height = rect.height + "px";
      clone.style.transition = "all 0.3s ease";
      document.body.appendChild(clone);

      setTimeout(() => {
        clone.style.left = dockRect.left + dockRect.width / 2 - 50 + "px";
        clone.style.top = dockRect.top + "px";
        clone.style.width = "100px";
        clone.style.height = "10px";
        clone.style.opacity = "0";
        clone.style.transform = "scaleY(0)";
      }, 10);

      setTimeout(() => {
        clone.remove();
        wrap.classList.add("hidden");
        _eagDock.appendChild(dockIcon);
        if (window._eagFocusedId === id) window._eagFocusedId = null;
      }, 310);
    };

    maxBtn.onclick = () => {
      if (wrap.classList.contains("maximized")) {
        wrap.style.width = "800px";
        wrap.style.height = "500px";
        wrap.style.top = "100px";
        wrap.style.left = "100px";
        wrap.classList.remove("maximized");
      } else {
        wrap.style.width = window.innerWidth + "px";
        wrap.style.height = window.innerHeight + "px";
        wrap.style.top = "0px";
        wrap.style.left = "0px";
        wrap.classList.add("maximized");
      }
      focusWindow();
    };

    window._eagWindows[id] = {
      wrap,
      iframe,
      minBtn,
      closeBtn,
      focusWindow,
      dockIcon: null,
    };

    // Focus on click so keyboard goes to right iframe
    iframe.addEventListener("focus", () => {
      window._eagFocusedId = id;
      focusWindow();
    });

    return id;
  };

  window.toggleDock = function () {
    if (!_eagDock) return;
    if (_eagDockVisible) {
      _eagDock.classList.add("hidden");
      _eagDockVisible = false;
    } else {
      _eagDock.classList.remove("hidden");
      _eagDockVisible = true;
    }
  };

  // Keyboard forwarding logic:
  document.addEventListener("keydown", (e) => {
    const focusedId = window._eagFocusedId;
    const win = focusedId ? window._eagWindows[focusedId] : null;

    // CTRL + E: toggle minimize/restore of focused window
    if (e.ctrlKey && (e.key === "e" || e.key === "E")) {
      e.preventDefault();
      if (win) {
        // Trigger minimize if visible, else restore from dock if dockIcon present
        if (!win.wrap.classList.contains("hidden")) {
          win.minBtn.click();
        } else if (win.dockIcon) {
          // Simulate dock icon click to restore
          win.dockIcon.click();
        }
      }
      return;
    }

    // CTRL + = : toggle dock visibility
    if (e.ctrlKey && (e.key === "=")) {
      e.preventDefault();
      window.toggleDock();
      return;
    }

    // CTRL + - : panic close all windows or close focused window
    if (e.ctrlKey && (e.key === "-")) {
      e.preventDefault();
      if (win) {
        win.closeBtn.click();
      } else {
        // Panic close all
        Object.keys(window._eagWindows).forEach((id) => {
          window._eagWindows[id].closeBtn.click();
        });
      }
      return;
    }

    // For other keys, forward to focused iframe if possible
    if (win && win.iframe && win.iframe.contentWindow) {
      // Construct a new KeyboardEvent and dispatch it inside the iframe
      try {
        // We clone the event to avoid issues
        const eventInside = new KeyboardEvent(e.type, e);
        win.iframe.contentWindow.dispatchEvent(eventInside);
        // Note: some browsers restrict this due to cross-origin, if so event won't go
      } catch (err) {
        // Ignore cross-origin or error
      }
    }
  });
})();
