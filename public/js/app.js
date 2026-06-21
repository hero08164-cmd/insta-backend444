import { uploadPosts } from "./api.js";

const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");

    document
      .getElementById(tab.dataset.tab)
      .classList.add("active");
  });
});

const form = document.getElementById("uploadForm");

const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const files =
      document.getElementById("files").files;

    if (!files.length) {
      alert("Select at least one file.");
      return;
    }

    const title =
      document.getElementById("title").value;

    const caption =
      document.getElementById("caption").value;

    const type =
      document.getElementById("type").value;

    const formData = new FormData();

    const posts = [];

    for (const file of files) {
      formData.append("files", file);

      posts.push({
        title,
        caption,
        type
      });
    }

    formData.append(
      "posts",
      JSON.stringify(posts)
    );

    result.textContent = "Uploading...";

    const response = await uploadPosts(formData);

    result.textContent = JSON.stringify(
      response,
      null,
      2
    );

    alert("Upload Successful");
  } catch (error) {
    result.textContent = error.message;

    alert(error.message);
  }
});