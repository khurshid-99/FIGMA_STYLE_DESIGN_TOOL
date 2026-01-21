const canvas = document.querySelector(".canvas");
const buttons = document.querySelectorAll(".floating_toolbar .icon");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((btn) => (btn.dataset.active = "false"));
    button.dataset.active = "true";
  });
});
