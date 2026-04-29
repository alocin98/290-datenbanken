const statusElement = document.querySelector("#status");
const toggleButton = document.querySelector("#toggle-button");

// #region query-example
toggleButton?.addEventListener("click", () => {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = "Das Element wurde per Javascript aktualisiert.";
  statusElement.classList.toggle("is-active");
});
// #endregion query-example

// #region style-example
if (statusElement) {
  statusElement.style.borderColor = "#165f68";
}
// #endregion style-example
