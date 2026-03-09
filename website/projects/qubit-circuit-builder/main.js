const title = document.querySelector(".simple-page__title");

if (title) {
  document.title = title.textContent || "Qubit Circuit Builder";
}
