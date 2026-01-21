const canvas = document.querySelector(".canvas");
const buttons = document.querySelectorAll(".floating_toolbar .icon");

const getShapes = () => {
  return JSON.parse(localStorage.getItem("shaps")) || [];
};

const setShapes = (shapes) => {
  localStorage.setItem("shaps", JSON.stringify(shapes));
};

let activeTool = null;

const handleCreateShape = (tool) => {
  const div = document.createElement("div");

  const id = crypto.randomUUID();

  div.id = id;
  const styles = {
    position: "absolute",

    width: "100px",
    height: "100px",
    background: "red",
    zIndex: 0,
    rotate: "0deg",
    left: "50px",
    top: "50px",
  };

  Object.assign(div.style, styles);

  // div.style.width = "100px";
  // div.style.height = "100px";
  // div.style.background = "white";

  canvas.appendChild(div);

  const shapes = getShapes();
  shapes.push({
  
    id,
    styles,
    tool,
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

  shaps.forEach(({ id, styles, tool }) => {
    const div = document.createElement("div");

    div.id = id;
    Object.assign(div.style, style);

    canvas.appendChild(div);
  });
};

restoreShaps();
