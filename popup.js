document.addEventListener("DOMContentLoaded", () => {
  const tabUrlDiv = document.getElementById("tabUrl");
  const copyTabYtdlp = document.getElementById("copyTabYtdlp");
  const copyTabYtdlpCookies = document.getElementById("copyTabYtdlpCookies");
  const copyTabUrl = document.getElementById("copyTabUrl");
  const browserSelect = document.getElementById("browser");
  const qualitySelect = document.getElementById("quality");
  const formatSelect = document.getElementById("format");
  const filenameInput = document.getElementById("filename");
  const manifestListDiv = document.getElementById("manifestList");
  const commandsCard = document.getElementById("commandsCard");
  const ffmpegCommandDiv = document.getElementById("ffmpegCommand");
  const ytdlpCommandDiv = document.getElementById("ytdlpCommand");
  const copyFfmpegBtn = document.getElementById("copyFfmpegBtn");
  const copyYtdlpBtn = document.getElementById("copyYtdlpBtn");
  const ytdlpCookiesFileSection = document.getElementById(
    "ytdlpCookiesFileSection",
  );
  const ytdlpCookiesFileCommandDiv = document.getElementById(
    "ytdlpCookiesFileCommand",
  );
  const copyYtdlpCookiesFileBtn = document.getElementById(
    "copyYtdlpCookiesFileBtn",
  );
  const cookieWarn = document.getElementById("cookieWarn");
  const refreshBtn = document.getElementById("refresh");
  const clearAllBtn = document.getElementById("clearAll");

  let currentTabUrl = "";
  let currentTabId = null;
  let selectedManifest = null;

  // ── Helpers ──────────────────────────────────────────────

  function ts() {
    const d = new Date();
    return `video_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }
  function p(n) {
    return String(n).padStart(2, "0");
  }

  function outName() {
    const v = filenameInput.value.trim();
    const ext = formatSelect.value;
    if (v) return v.includes(".") ? v : `${v}.${ext}`;
    return `${ts()}.${ext}`;
  }

  function browser() {
    return browserSelect.value;
  }

  // Whether the selected browser uses a locked Chromium cookie DB
  function isChromiumBrowser() {
    return ["edge", "chrome", "brave"].includes(browser());
  }

  function updateCookieWarning() {
    const show = isChromiumBrowser();
    cookieWarn.style.display = show ? "" : "none";
    ytdlpCookiesFileSection.style.display =
      show && selectedManifest ? "" : "none";
    copyTabYtdlpCookies.style.display = show ? "" : "none";
  }

  // ── Command generators ───────────────────────────────────

  function ytdlpForPage(url) {
    const q = qualitySelect.value;
    const fmt = formatSelect.value;
    const name = outName();
    let fSel =
      q === "best"
        ? "bestvideo+bestaudio/best"
        : `bestvideo[height<=?${q.replace("p", "")}]+bestaudio/best[height<=?${q.replace("p", "")}]`;
    return `yt-dlp --cookies-from-browser ${browser()} -f "${fSel}" --merge-output-format ${fmt} -o "${name}" "${url}"`;
  }

  function ytdlpCookiesFileForPage(url) {
    const q = qualitySelect.value;
    const fmt = formatSelect.value;
    const name = outName();
    let fSel =
      q === "best"
        ? "bestvideo+bestaudio/best"
        : `bestvideo[height<=?${q.replace("p", "")}]+bestaudio/best[height<=?${q.replace("p", "")}]`;
    return `yt-dlp --cookies cookies.txt -f "${fSel}" --merge-output-format ${fmt} -o "${name}" "${url}"`;
  }

  function ytdlpForManifest(url) {
    const q = qualitySelect.value;
    const fmt = formatSelect.value;
    const name = outName();
    let fSel =
      q === "best"
        ? "bestvideo+bestaudio/best"
        : `bestvideo[height<=?${q.replace("p", "")}]+bestaudio/best[height<=?${q.replace("p", "")}]`;
    return `yt-dlp --cookies-from-browser ${browser()} -f "${fSel}" --merge-output-format ${fmt} -o "${name}" "${url}"`;
  }

  function ytdlpCookiesFileForManifest(url) {
    const q = qualitySelect.value;
    const fmt = formatSelect.value;
    const name = outName();
    let fSel =
      q === "best"
        ? "bestvideo+bestaudio/best"
        : `bestvideo[height<=?${q.replace("p", "")}]+bestaudio/best[height<=?${q.replace("p", "")}]`;
    return `yt-dlp --cookies cookies.txt -f "${fSel}" --merge-output-format ${fmt} -o "${name}" "${url}"`;
  }

  function ffmpegForManifest(url, type) {
    const name = outName();
    const referer = currentTabUrl
      ? ` -headers "Referer: ${new URL(currentTabUrl).origin}/"`
      : "";
    if (type === "direct") {
      return `ffmpeg${referer} -i "${url}" -c copy "${name}"`;
    }
    return `ffmpeg -protocol_whitelist file,http,https,tcp,tls${referer} -i "${url}" -c copy "${name}"`;
  }

  // ── Copy helper ──────────────────────────────────────────

  function copyText(text, btn, defaultLabel) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = defaultLabel), 1500);
      })
      .catch(() => {
        btn.textContent = "Copy Failed";
        setTimeout(() => (btn.textContent = defaultLabel), 1500);
      });
  }

  // ── Tab URL section ──────────────────────────────────────

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentTabUrl = tabs[0].url;
      currentTabId = tabs[0].id;
      tabUrlDiv.textContent = currentTabUrl;
      loadManifests();
    }
  });

  copyTabYtdlp.addEventListener("click", () => {
    if (currentTabUrl)
      copyText(
        ytdlpForPage(currentTabUrl),
        copyTabYtdlp,
        "Copy yt-dlp Command",
      );
  });

  copyTabYtdlpCookies.addEventListener("click", () => {
    if (currentTabUrl)
      copyText(
        ytdlpCookiesFileForPage(currentTabUrl),
        copyTabYtdlpCookies,
        "Copy yt-dlp (cookies.txt)",
      );
  });

  copyTabUrl.addEventListener("click", () => {
    if (currentTabUrl) copyText(currentTabUrl, copyTabUrl, "Copy URL");
  });

  // ── Manifest list ────────────────────────────────────────

  function loadManifests() {
    if (currentTabId == null) return;
    chrome.runtime.sendMessage(
      { type: "getManifests", tabId: currentTabId },
      (resp) => {
        if (chrome.runtime.lastError || !resp) {
          renderManifests([]);
          return;
        }
        renderManifests(resp.manifests || []);
      },
    );
  }

  function renderManifests(list) {
    manifestListDiv.innerHTML = "";
    if (list.length === 0) {
      manifestListDiv.innerHTML =
        '<p class="empty-msg">Play a video on SharePoint to capture stream URLs.</p>';
      return;
    }
    list.forEach((m, i) => {
      const row = document.createElement("div");
      row.className =
        "manifest-row" +
        (selectedManifest && selectedManifest.cleanedUrl === m.cleanedUrl
          ? " selected"
          : "");
      row.innerHTML = `<span class="badge ${m.type}">${m.label || m.type.toUpperCase()}</span>
        <span class="manifest-url" title="${m.cleanedUrl}">${m.cleanedUrl}</span>`;
      row.addEventListener("click", () => selectManifest(m));
      manifestListDiv.appendChild(row);
    });
  }

  function selectManifest(m) {
    selectedManifest = m;
    commandsCard.style.display = "";
    updateCommands();
    // Re-render to highlight selection
    loadManifests();
  }

  function updateCommands() {
    if (!selectedManifest) return;
    ffmpegCommandDiv.textContent = ffmpegForManifest(
      selectedManifest.cleanedUrl,
      selectedManifest.type,
    );
    ytdlpCommandDiv.textContent = ytdlpForManifest(selectedManifest.cleanedUrl);
    ytdlpCookiesFileCommandDiv.textContent = ytdlpCookiesFileForManifest(
      selectedManifest.cleanedUrl,
    );
    updateCookieWarning();
  }

  // ── Buttons ──────────────────────────────────────────────

  refreshBtn.addEventListener("click", loadManifests);

  clearAllBtn.addEventListener("click", () => {
    if (currentTabId == null) return;
    chrome.runtime.sendMessage(
      { type: "clearManifests", tabId: currentTabId },
      () => {
        selectedManifest = null;
        commandsCard.style.display = "none";
        loadManifests();
      },
    );
  });

  copyFfmpegBtn.addEventListener("click", () => {
    copyText(ffmpegCommandDiv.textContent, copyFfmpegBtn, "Copy FFmpeg");
  });

  copyYtdlpBtn.addEventListener("click", () => {
    copyText(ytdlpCommandDiv.textContent, copyYtdlpBtn, "Copy yt-dlp");
  });

  copyYtdlpCookiesFileBtn.addEventListener("click", () => {
    copyText(
      ytdlpCookiesFileCommandDiv.textContent,
      copyYtdlpCookiesFileBtn,
      "Copy yt-dlp (cookies.txt)",
    );
  });

  // Recalculate commands when options change
  [qualitySelect, formatSelect, filenameInput, browserSelect].forEach((el) => {
    el.addEventListener("change", () => {
      updateCommands();
      updateCookieWarning();
    });
  });

  // Init cookie warning on load
  updateCookieWarning();

  // Live-listen for new manifests
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "manifestDetected" && msg.data.tabId === currentTabId) {
      loadManifests();
    }
  });
});
