const canvas = document.querySelector(".canvas");
const buttons = document.querySelectorAll(".floating_toolbar .icon");
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
    background: "white",
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
  console.log(element);

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
    background: "white",
    zIndex: 0,
    transform: "rotate(0deg)",
    left: "50px",
    top: "50px",

    border: "0px solid #0c8ce9",
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
        prevEl.style.border = "none";
      }
    }

    selectId = id;
    e.target.style.border = "2px solid #0c8ce9";
  });
};

selectElement();

const deletElement = () => {
  document.addEventListener("keydown", (e) => {
    // console.log(e);

    if (!selectId) return;

    if (e.key !== "Delete" && e.key !== "Backspace") return;

    const el = document.getElementById(selectId);
    console.log(e.key);

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
