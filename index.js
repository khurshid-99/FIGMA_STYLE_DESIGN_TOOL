const canvas = document.querySelector(".canvas");
const buttons = document.querySelectorAll(".floating_toolbar .icon");

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
};

const makeDraggable = (element, id) => {
  // console.log(element);

  let isDraggable = false;
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener("mousedown", (e) => {
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

let activeTool = null;
const handleCreateShape = (tool) => {
  const div = document.createElement("div");

  const id = crypto.randomUUID();

  div.id = id;
  div.className = "shap";
  const styles = {
    position: "absolute",

    width: "100px",
    height: "100px",
    background: "#ffffff",
    "z-index": 1,
    transform: "rotate(0deg)",
    left: "50px",
    top: "50px",
    opacity: 1,

    "border-width": "0px",
    "border-style": "solid",
    "border-color": "#000000",
  };

  Object.assign(div.style, styles);

  canvas.appendChild(div);

  makeDraggable(div, id);

  const shapes = getShapes();

  shapes.push({
    id,
    styles,
    tool,
    shap: "shap",
  });
  setShapes(shapes);
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

  shaps.forEach(({ id, styles, tool, shap }) => {
    const div = document.createElement("div");

    div.id = id;
    div.className = shap;
    Object.assign(div.style, styles);

    canvas.appendChild(div);

    makeDraggable(div, id);
  });
};

restoreShaps();

let selectId = null;
const selectElement = () => {
  canvas.addEventListener("mousedown", (e) => {
    // console.log(e.target.classList.contains("canvas"));
    if (e.target.classList.contains("canvas")) return;

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

    showDetils();
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
  });
};

deletElement();

const showDetils = () => {
  const shap = getShapes();
  if (!selectId) return;
  const shape = shap.find((s) => s.id === selectId);

  if (!shape) return;

  const styles = shape.styles;

  console.log(styles);

  xInput.value = parseInt(styles.left);
  yInput.value = parseInt(styles.top);

  wInput.value = parseInt(styles.width);
  hInput.value = parseInt(styles.height);

  opacityInput.value = Number(styles.opacity);

  colorInput.value = rgbToHex(styles.background || "#ffffff");

  strokeWidth.value = parseInt(styles["border-width"]);
  strokeStyle.value = styles["border-style"];
  strokeColor.value = rgbToHex(styles["border-color"] || "#000000");
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
