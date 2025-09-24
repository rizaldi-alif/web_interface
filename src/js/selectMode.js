function setSelectedMode(mode) {
  selectedModeText.innerText = mode;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("opacity-100");

  // Hilangkan setelah 3 detik
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

dropdownButton.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// Tutup dropdown kalau klik di luar
window.addEventListener("click", (e) => {
  if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.add("hidden");
  }
});

// Ubah event listener di dropdown jadi seperti ini:
dropdownMenu.querySelectorAll("a").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const mode = item.textContent;
    const message = `M${item.id}`;
    selectedMode.textContent = mode;

    dropdownMenu.classList.add("hidden");

    showJoyStick(item.id);

    // Tampilkan toast
    showToast(`Mode changed to: ${mode}`);
    sendWebSocketMessage(message);
    console.log(message);
  });
});
