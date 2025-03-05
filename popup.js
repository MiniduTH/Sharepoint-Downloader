document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements with null checks
  const manifestUrlDiv = document.getElementById('manifestUrl');
  const ffmpegCommandDiv = document.getElementById('ffmpegCommand');
  const ytdlpCommandDiv = document.getElementById('ytdlpCommand');
  const refreshButton = document.getElementById('refresh');
  const copyFffmpegBtn = document.getElementById('copyFffmpegBtn'); // Fixed typo
  const copyYtdlpBtn = document.getElementById('copyYtdlpBtn');
  const qualitySelect = document.getElementById('quality');
  const formatSelect = document.getElementById('format');
  const filenameInput = document.getElementById('filename');
  const toggleUrlBtn = document.getElementById('toggleUrl');
  const toggleFffmpegBtn = document.getElementById('toggleFffmpeg'); // Fixed typo
  const toggleYtdlpBtn = document.getElementById('toggleYtdlp');

  // Check if all elements exist
  if (!manifestUrlDiv || !ffmpegCommandDiv || !ytdlpCommandDiv || !refreshButton || !copyFffmpegBtn || 
      !copyYtdlpBtn || !qualitySelect || !formatSelect || !filenameInput || !toggleUrlBtn || 
      !toggleFffmpegBtn || !toggleYtdlpBtn) {
    console.error('One or more DOM elements not found in popup.html');
    return;
  }

  let currentManifestData = null;

  // Function to generate a timestamp-based filename
  function generateTimestampFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `video_${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  // Function to generate FFmpeg command
  function generateFffmpegCommand(cleanedUrl, type, quality, format) {
    const userFilename = filenameInput.value.trim();
    const filename = userFilename || `${generateTimestampFilename()}.${format}`;
    return `ffmpeg -i "${cleanedUrl}" -c copy ${filename}`;
  }

  // Function to generate yt-dlp command
  function generateYtdlpCommand(cleanedUrl, quality, format) {
    const userFilename = filenameInput.value.trim();
    const filename = userFilename || `${generateTimestampFilename()}.${format}`;
    let qualityParam = '';
    if (quality !== 'best') {
      qualityParam = `--recode-video ${format} -f bestvideo[height<=?${quality.replace('p', '')}]+bestaudio/best[height<=?${quality.replace('p', '')}]`;
    } else {
      qualityParam = `--recode-video ${format} -f bestvideo+bestaudio/best`;
    }
    return `yt-dlp "${cleanedUrl}" ${qualityParam} -o "${filename}"`;
  }

  function updateUI(data) {
    if (data) {
      currentManifestData = data;
      if (manifestUrlDiv) manifestUrlDiv.textContent = data.cleanedUrl; // Add null check
      const ffmpegCommand = generateFffmpegCommand(
        data.cleanedUrl,
        data.type,
        qualitySelect.value,
        formatSelect.value
      );
      const ytdlpCommand = generateYtdlpCommand(
        data.cleanedUrl,
        qualitySelect.value,
        formatSelect.value
      );
      if (ffmpegCommandDiv) ffmpegCommandDiv.textContent = ffmpegCommand; // Add null check
      if (ytdlpCommandDiv) ytdlpCommandDiv.textContent = ytdlpCommand; // Add null check
      if (filenameInput && !filenameInput.value.trim()) {
        filenameInput.placeholder = generateTimestampFilename();
      }
    } else {
      if (manifestUrlDiv) manifestUrlDiv.textContent = 'No manifest captured yet.';
      if (ffmpegCommandDiv) ffmpegCommandDiv.textContent = 'FFmpeg command will appear here.';
      if (ytdlpCommandDiv) ytdlpCommandDiv.textContent = 'yt-dlp command will appear here.';
      if (filenameInput) {
        filenameInput.value = '';
        filenameInput.placeholder = 'video_YYYYMMDD_HHMMSS';
      }
    }
    // Reset toggle states with null checks
    if (manifestUrlDiv) manifestUrlDiv.classList.remove('expanded');
    if (ffmpegCommandDiv) ffmpegCommandDiv.classList.remove('expanded');
    if (ytdlpCommandDiv) ytdlpCommandDiv.classList.remove('expanded');
    if (toggleUrlBtn) toggleUrlBtn.textContent = 'Expand';
    if (toggleFffmpegBtn) toggleFffmpegBtn.textContent = 'Expand';
    if (toggleYtdlpBtn) toggleYtdlpBtn.textContent = 'Expand';
  }

  function fetchLastManifest() {
    try {
      chrome.runtime.sendMessage({ type: 'getLastManifest' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError.message);
          updateUI(null);
          return;
        }
        updateUI(response.data);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      updateUI(null);
    }
  }

  // Initial fetch
  fetchLastManifest();

  // Listen for new manifests
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'manifestDetected') {
      updateUI(message.data);
    }
  });

  // Add event listeners with null checks
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchLastManifest);
  }

  // Update commands on quality/format/filename change with null checks
  if (qualitySelect) {
    qualitySelect.addEventListener('change', () => {
      if (currentManifestData) {
        const ffmpegCommand = generateFffmpegCommand(
          currentManifestData.cleanedUrl,
          currentManifestData.type,
          qualitySelect.value,
          formatSelect.value
        );
        const ytdlpCommand = generateYtdlpCommand(
          currentManifestData.cleanedUrl,
          qualitySelect.value,
          formatSelect.value
        );
        if (ffmpegCommandDiv) ffmpegCommandDiv.textContent = ffmpegCommand;
        if (ytdlpCommandDiv) ytdlpCommandDiv.textContent = ytdlpCommand;
      }
    });
  }

  if (formatSelect) {
    formatSelect.addEventListener('change', () => {
      if (currentManifestData) {
        const ffmpegCommand = generateFffmpegCommand(
          currentManifestData.cleanedUrl,
          currentManifestData.type,
          qualitySelect.value,
          formatSelect.value
        );
        const ytdlpCommand = generateYtdlpCommand(
          currentManifestData.cleanedUrl,
          qualitySelect.value,
          formatSelect.value
        );
        if (ffmpegCommandDiv) ffmpegCommandDiv.textContent = ffmpegCommand;
        if (ytdlpCommandDiv) ytdlpCommandDiv.textContent = ytdlpCommand;
      }
    });
  }

  if (filenameInput) {
    filenameInput.addEventListener('change', () => {
      if (currentManifestData) {
        const ffmpegCommand = generateFffmpegCommand(
          currentManifestData.cleanedUrl,
          currentManifestData.type,
          qualitySelect.value,
          formatSelect.value
        );
        const ytdlpCommand = generateYtdlpCommand(
          currentManifestData.cleanedUrl,
          qualitySelect.value,
          formatSelect.value
        );
        if (ffmpegCommandDiv) ffmpegCommandDiv.textContent = ffmpegCommand;
        if (ytdlpCommandDiv) ytdlpCommandDiv.textContent = ytdlpCommand;
      }
    });
  }

  // Copy FFmpeg button with null check
  if (copyFffmpegBtn) {
    copyFffmpegBtn.addEventListener('click', () => {
      if (ffmpegCommandDiv) {
        const commandText = ffmpegCommandDiv.textContent;
        navigator.clipboard.writeText(commandText).then(() => {
          copyFffmpegBtn.textContent = 'Copied!';
          setTimeout(() => copyFffmpegBtn.textContent = 'Copy FFmpeg', 2000);
        }).catch((err) => {
          console.error('Failed to copy FFmpeg:', err);
          copyFffmpegBtn.textContent = 'Copy Failed';
        });
      }
    });
  }

  // Copy yt-dlp button with null check
  if (copyYtdlpBtn) {
    copyYtdlpBtn.addEventListener('click', () => {
      if (ytdlpCommandDiv) {
        const commandText = ytdlpCommandDiv.textContent;
        navigator.clipboard.writeText(commandText).then(() => {
          copyYtdlpBtn.textContent = 'Copied!';
          setTimeout(() => copyYtdlpBtn.textContent = 'Copy yt-dlp', 2000);
        }).catch((err) => {
          console.error('Failed to copy yt-dlp:', err);
          copyYtdlpBtn.textContent = 'Copy Failed';
        });
      }
    });
  }

  // Toggle URL visibility with null check
  if (toggleUrlBtn) {
    toggleUrlBtn.addEventListener('click', () => {
      if (manifestUrlDiv) {
        manifestUrlDiv.classList.toggle('expanded');
        toggleUrlBtn.textContent = manifestUrlDiv.classList.contains('expanded') ? 'Collapse' : 'Expand';
      }
    });
  }

  // Toggle FFmpeg visibility with null check
  if (toggleFffmpegBtn) {
    toggleFffmpegBtn.addEventListener('click', () => {
      if (ffmpegCommandDiv) {
        ffmpegCommandDiv.classList.toggle('expanded');
        toggleFffmpegBtn.textContent = ffmpegCommandDiv.classList.contains('expanded') ? 'Collapse' : 'Expand';
      }
    });
  }

  // Toggle yt-dlp visibility with null check
  if (toggleYtdlpBtn) {
    toggleYtdlpBtn.addEventListener('click', () => {
      if (ytdlpCommandDiv) {
        ytdlpCommandDiv.classList.toggle('expanded');
        toggleYtdlpBtn.textContent = ytdlpCommandDiv.classList.contains('expanded') ? 'Collapse' : 'Expand';
      }
    });
  }
});