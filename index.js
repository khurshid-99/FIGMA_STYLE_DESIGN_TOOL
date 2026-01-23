const canvas = document.querySelector(".canvas");
const buttons = document.querySelectorAll(".floating_toolbar .icon");

const detilesPnal = document.querySelector(".right");

const xInput = document.querySelector(".x_input");
const yInput = document.querySelector(".y_input");

const wInput = document.querySelector(".width_input");
const hInput = document.querySelector(".height_input");

// console.log(wInput);

const opacityInput = document.querySelector(".opacity_input");

const colorInput = document.querySelector(".color_input");

const strokeColor = document.querySelector(".stroke_input");
const strokeWidth = document.querySelector(".stroke_input_width");
const strokeStyle = document.querySelector(".stroke_input_style");

const roundedInput = document.querySelector(".rounded_input");

const zIndexInput = document.querySelector(".z_index");

const layersList = document.querySelector(".layers-list");

let selectId = null;
let activeTool = null;

const EDGE_SIZE = 6;

// localStorage.clear()
const getShapes = () => {
  return JSON.parse(localStorage.getItem("shaps")) || [];
};

const setShapes = (shapes) => {
  localStorage.setItem("shaps", JSON.stringify(shapes));
};

const tools = {
  square: {
    width: "100px",
    height: "100px",
    background: "#ffffff",
  },
  triangle: {
    width: 0,
    height: 0,

    borderLeft: "50px solid transparent",
    borderRight: "50px solid transparent",
    borderBottom: "100px solid #0c8ce9",
  },
  text: {
    width: "150px",
    height: "auto",
    color: "#000000",
    fontSize: "20px",
    fontWeight: "400",
    fontFamily: "Arial",
  },
};

const makeDraggable = (element, id) => {
  // console.log(element);

  let isDraggable = false;
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener("mousedown", (e) => {
    const edge = getHoverEdge(e, element);
    if (edge) return;

    isDraggable = true;

    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;

    element.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDraggable) return;

    element.style.left = e.clientX - offsetX + "px";
    element.style.top = e.clientY - offsetY + "px";

    if (selectId === id) {
      xInput.value = parseInt(element.style.left);
      yInput.value = parseInt(element.style.top);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (!isDraggable) return;

    isDraggable = false;

    element.style.cursor = "grab";

    const shapes = getShapes();
    const index = shapes.findIndex((shap) => shap.id === id);

    if (index !== -1) {
      shapes[index].styles.left = element.style.left;
      shapes[index].styles.top = element.style.top;

      setShapes(shapes);
    }
  });
};

const handleCreateShape = (tool) => {
  const div = document.createElement("div");
  const id = crypto.randomUUID();

  div.id = id;
  div.className = "shap";

  const styles = {
    position: "absolute",
    left: "50px",
    top: "50px",
    opacity: 1,
    "z-index": 1,
    transform: "rotate(0deg)",

    "border-width": "0px",
    "border-style": "solid",
    "border-color": "#000000",
    "border-radius": "0px",
  };

  // 🔥 TEXT TOOL
  if (tool === "text") {
    div.classList.add("text");
    div.textContent = "Double click to edit";
    div.contentEditable = false;

    Object.assign(styles, {
      width: "150px",
      height: "auto",
      background: "transparent",
      color: "#000000",
      "font-size": "20px",
      "font-weight": "400",
      "white-space": "pre-wrap",
      cursor: "text",
      padding: "4px",
    });

    enableTextEditing(div, id);
  }
  // 🔲 NORMAL SHAPES
  else {
    Object.assign(styles, {
      width: "100px",
      height: "100px",
      background: "#ffffff",
    });
  }

  Object.assign(div.style, styles);
  canvas.appendChild(div);

  makeDraggable(div, id);
  enableEdgeResize(div);

  const shapes = getShapes();
  shapes.push({
    id,
    tool,
    shap: "shap",
    styles,
    text: tool === "text" ? div.textContent : "",
  });

  setShapes(shapes);
  renderLayers();
};

const activeButtonHandler = () => {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTool = button.dataset.tool;

      buttons.forEach((btn) => (btn.dataset.active = "false"));
      button.dataset.active = "true";

      handleCreateShape(activeTool);
    });
  });
};
activeButtonHandler();

const restoreShaps = () => {
  const shaps = getShapes();

  shaps.forEach((shape) => {
    const { id, styles, tool, shap, text } = shape;

    const div = document.createElement("div");

    div.id = id;
    div.className = shap;
    Object.assign(div.style, styles);


    if (tool === "text") {
      div.classList.add("text");
      div.textContent = text || "Double click to edit";
      enableTextEditing(div, id);
    }

    canvas.appendChild(div);

    makeDraggable(div, id);
    enableEdgeResize(div);
  });

  renderLayers();
};

restoreShaps();

const toggleDetailsPanel = () => {
  if (selectId) {
    detilesPnal.style.display = "block";
  } else {
    detilesPnal.style.display = "none";
  }
};

const selectElement = () => {
  canvas.addEventListener("mousedown", (e) => {
    // console.log(e.target.classList.contains("canvas"));

    if (e.target.classList.contains("canvas")) {
      if (selectId) {
        const prevEl = document.getElementById(selectId);
        if (prevEl) {
          prevEl.style.outline = "none";
        }
      }

      selectId = null;
      removeResizeHandles();
      canvas.style.cursor = "default";
      toggleDetailsPanel();
      return;
    }

    const id = e.target.id;

    if (selectId === id) return;

    if (selectId) {
      const prevEl = document.getElementById(selectId);
      if (prevEl) {
        prevEl.style.outline = "none";
      }
    }

    selectId = id;
    e.target.style.outline = "2px solid #0c8ce9";

    addResizeHandles(e.target);

    showDetils();
    toggleDetailsPanel();
  });
};

selectElement();

const deletElement = () => {
  document.addEventListener("keydown", (e) => {
    // console.log(e);

    if (!selectId) return;

    if (e.key !== "Delete") return;

    const el = document.getElementById(selectId);
    // console.log(e.key);

    if (el) {
      el.remove();
    }

    const shapes = getShapes();
    const updateShape = shapes.filter((shap) => shap.id !== selectId);
    setShapes(updateShape);

    // console.log("Deleted shap", selectId);
    selectId = null;
    toggleDetailsPanel();
    removeResizeHandles();
    renderLayers();
  });
};

deletElement();

const showDetils = () => {
  const shap = getShapes();
  if (!selectId) return;
  const shape = shap.find((s) => s.id === selectId);

  if (!shape) return;

  const styles = shape.styles;

  // console.log(styles);

  xInput.value = parseInt(styles.left);
  yInput.value = parseInt(styles.top);

  wInput.value = parseInt(styles.width);
  hInput.value = parseInt(styles.height);

  opacityInput.value = Number(styles.opacity);

  colorInput.value = rgbToHex(styles.background || "#ffffff");

  strokeWidth.value = parseInt(styles["border-width"]);
  strokeStyle.value = styles["border-style"];
  strokeColor.value = rgbToHex(styles["border-color"] || "#000000");

  roundedInput.value = parseInt(styles["border-radius"]);
  zIndexInput.value = parseInt(styles["z-index"]);
};

// I am not create this function, this function is create by GPT
const rgbToHex = (color) => {
  if (!color || color.startsWith("#")) return color;

  const rgb = color.match(/\d+/g);
  if (!rgb) return "#000000";

  return (
    "#" + rgb.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")
  );
};

const updateStyles = (key, value) => {
  if (!selectId) return;

  if (value < 0) return;

  const shapes = getShapes();
  const shape = shapes.find((s) => s.id === selectId);

  const el = document.getElementById(selectId);

  if (!shape || !el) return;

  shape.styles[key] = value;
  el.style[key] = value;

  setShapes(shapes);
};

xInput.addEventListener("input", () =>
  updateStyles("left", xInput.value + "px"),
);
yInput.addEventListener("input", () =>
  updateStyles("top", yInput.value + "px"),
);

wInput.addEventListener("input", () =>
  updateStyles("width", Number(wInput.value) ? wInput.value + "px" : "10px"),
);

hInput.addEventListener("input", () =>
  updateStyles("height", Number(hInput.value) ? hInput.value + "px" : "5px"),
);

opacityInput.addEventListener("input", () =>
  updateStyles("opacity", Number(opacityInput.value)),
);

colorInput.addEventListener("input", () =>
  updateStyles("background", colorInput.value),
);

strokeColor.addEventListener("input", () =>
  updateStyles("border-color", strokeColor.value),
);

strokeWidth.addEventListener("input", () =>
  updateStyles(
    "border-width",
    strokeWidth.value ? strokeWidth.value + "px" : "0px",
  ),
);
strokeStyle.addEventListener("change", () =>
  updateStyles("border-style", strokeStyle.value),
);

roundedInput.addEventListener("input", () =>
  updateStyles("border-radius", roundedInput.value + "px"),
);

zIndexInput.addEventListener("input", () => {
  if (!selectId) return;

  const z = Number(zIndexInput.value) || 1;

  updateStyles("z-index", z);

  const el = document.getElementById(selectId);
  if (el) el.style.zIndex = z;

  renderLayers();
});

// ---

const keyboardHandler = () => {
  document.addEventListener("keydown", (e) => {
    if (!selectId) return;

    const element = document.getElementById(selectId);
    if (!element) return;

    const shapes = getShapes();
    const shape = shapes.find((s) => s.id === selectId);
    if (!shape) return;

    if (e.key === "ArrowUp") {
      shape.styles.top = parseInt(shape.styles.top) - 1 + "px";
    }

    if (e.key === "ArrowDown") {
      shape.styles.top = parseInt(shape.styles.top) + 1 + "px";
    }

    if (e.key === "ArrowLeft") {
      shape.styles.left = parseInt(shape.styles.left) - 1 + "px";
    }

    if (e.key === "ArrowRight") {
      shape.styles.left = parseInt(shape.styles.left) + 1 + "px";
    }

    element.style.top = shape.styles.top;
    element.style.left = shape.styles.left;

    showDetils();
    setShapes(shapes);
  });
};

keyboardHandler();

// ------

const addResizeHandles = (element) => {
  removeResizeHandles();

  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle ${pos}`;
    element.appendChild(handle);

    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      startResize(e, element, pos);
    });
  });
};

const removeResizeHandles = () => {
  document.querySelectorAll(".resize-handle").forEach((h) => h.remove());
};

const getHoverEdge = (e, element) => {
  const rect = element.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (x <= EDGE_SIZE) return "l";
  if (x >= rect.width - EDGE_SIZE) return "r";
  if (y <= EDGE_SIZE) return "t";
  if (y >= rect.height - EDGE_SIZE) return "b";

  return null;
};

function enableEdgeResize(element) {
  element.addEventListener("mousemove", (e) => {
    if (selectId !== element.id) return;

    const edge = getHoverEdge(e, element);

    if (edge === "l" || edge === "r") {
      element.style.cursor = "ew-resize";
    } else if (edge === "t" || edge === "b") {
      element.style.cursor = "ns-resize";
    } else {
      element.style.cursor = "grab";
    }
  });

  element.addEventListener("mousedown", (e) => {
    if (selectId !== element.id) return;

    const edge = getHoverEdge(e, element);
    if (!edge) return;

    e.stopPropagation();
    startResize(e, element, edge);
  });
}

const startResize = (e, element, position) => {
  e.stopPropagation();

  const startX = e.clientX;
  const startY = e.clientY;

  // console.log(startX);

  const startWidth = element.offsetWidth;
  const startHeight = element.offsetHeight;
  const startLeft = element.offsetLeft;
  const startTop = element.offsetTop;

  // console.log(startWidth);

  const minSize = 20;

  const onMouseMove = (e) => {
    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    // console.log(dx);

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (position.includes("r")) newWidth = startWidth + dx;
    if (position.includes("l")) {
      newWidth = startWidth - dx;
      newLeft = startLeft + dx;
    }

    if (position.includes("b")) newHeight = startHeight + dy;
    if (position.includes("t")) {
      newHeight = startHeight - dy;
      newTop = startTop + dy;
    }

    if (newWidth < minSize || newHeight < minSize) return;

    // console.log(newWidth);

    element.style.width = newWidth + "px";
    element.style.height = newHeight + "px";
    element.style.left = newLeft + "px";
    element.style.top = newTop + "px";

    updateShapeDuringResize(newWidth, newHeight, newLeft, newTop);
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

const updateShapeDuringResize = (w, h, l, t) => {
  const shapes = getShapes();
  const shape = shapes.find((s) => s.id === selectId);
  if (!shape) return;

  shape.styles.width = w + "px";
  shape.styles.height = h + "px";
  shape.styles.left = l + "px";
  shape.styles.top = t + "px";

  wInput.value = w;
  hInput.value = h;
  xInput.value = l;
  yInput.value = t;

  setShapes(shapes);
};

// ---------

function renderLayers() {
  const shapes = getShapes();

  // sort by z-index (top first)
  shapes.sort((a, b) => b.styles["z-index"] - a.styles["z-index"]);

  layersList.innerHTML = "";

  shapes.forEach((shape) => {
    const li = document.createElement("li");
    li.className = "layers-item";
    li.textContent = shape.tool || "shape";

    if (shape.id === selectId) {
      li.classList.add("active");
    }

    li.addEventListener("click", () => {
      selectShapeFromLayer(shape.id);
    });

    const controls = document.createElement("div");
    controls.className = "layers-controls";

    const upBtn = document.createElement("button");
    upBtn.textContent = "⬆️";
    upBtn.onclick = (e) => {
      e.stopPropagation();
      changeZIndex(shape.id, +1);
    };

    const downBtn = document.createElement("button");
    downBtn.textContent = "⬇️";
    downBtn.onclick = (e) => {
      e.stopPropagation();
      changeZIndex(shape.id, -1);
    };

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    li.appendChild(controls);

    layersList.appendChild(li);
  });
}

const selectShapeFromLayer = (id) => {
  if (selectId) {
    const prev = document.getElementById(selectId);
    if (prev) prev.style.outline = "none";
  }

  selectId = id;

  const el = document.getElementById(id);
  if (!el) return;

  el.style.outline = "2px solid #0c8ce9";
  addResizeHandles(el);

  showDetils();
  toggleDetailsPanel();
  renderLayers();
};

const changeZIndex = (id, direction) => {
  const shapes = getShapes();
  const shape = shapes.find((s) => s.id === id);
  if (!shape) return;

  let z = parseInt(shape.styles["z-index"]) || 1;
  z += direction;

  if (z < 1) z = 1;

  shape.styles["z-index"] = z;

  const el = document.getElementById(id);
  if (el) el.style.zIndex = z;

  zIndexInput.value = z;

  setShapes(shapes);
  renderLayers();
};

// ---
function enableTextEditing(element, id) {
  element.addEventListener("dblclick", (e) => {
    if (selectId !== id) return;

    e.stopPropagation();
    element.contentEditable = true;
    element.focus();
  });

  element.addEventListener("blur", () => {
    element.contentEditable = false;

    const shapes = getShapes();
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;

    shape.text = element.textContent;
    setShapes(shapes);
    renderLayers();
  });
}
