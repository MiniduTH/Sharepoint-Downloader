console.log("Background script loaded");

// Classify and clean a URL, returning { cleanedUrl, type, label } or null
function classifyUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    const host = u.hostname.toLowerCase();

    // 1. SharePoint videomanifest (DASH / HLS / smooth)
    if (path.includes("/transform/videomanifest")) {
      let type = "dash";
      if (url.includes("format=hls")) type = "hls";
      return { cleanedUrl: url, type, label: "Video Manifest" };
    }

    // 2. Media proxy service (mediap.svc.ms) — actual stream chunks/manifests
    if (host.includes("mediap.svc.ms")) {
      if (path.endsWith(".m3u8") || url.includes(".m3u8")) {
        return {
          cleanedUrl: url.split("?")[0],
          type: "hls",
          label: "HLS Manifest (mediap)",
        };
      }
      if (path.endsWith(".mpd") || url.includes(".mpd")) {
        return {
          cleanedUrl: url.split("?")[0],
          type: "dash",
          label: "DASH Manifest (mediap)",
        };
      }
      // Catch-all for other mediap requests that look like manifests
      if (path.includes("manifest") || path.includes("Manifest")) {
        return {
          cleanedUrl: url,
          type: "dash",
          label: "Stream Manifest (mediap)",
        };
      }
      return null; // Ignore individual segment fetches
    }

    // 3. Standalone .m3u8 / .mpd files
    if (path.endsWith(".m3u8") || path.match(/\.m3u8($|\?)/)) {
      return {
        cleanedUrl: url.split("?")[0],
        type: "hls",
        label: "HLS Manifest",
      };
    }
    if (path.endsWith(".mpd") || path.match(/\.mpd($|\?)/)) {
      return {
        cleanedUrl: url.split("?")[0],
        type: "dash",
        label: "DASH Manifest",
      };
    }

    // 4. SharePoint direct-download links
    if (host.includes("sharepoint.com") && path.includes("download.aspx")) {
      return { cleanedUrl: url, type: "direct", label: "Direct Download" };
    }

    // 5. SharePoint OneDrive transcode API segments (mid-playback encrypted segments)
    //    Strip per-segment params so all segments of the same video deduplicate to one entry.
    if (
      host.includes("sharepoint.com") &&
      path.includes("/onedrive.transcode")
    ) {
      const u2 = new URL(url);
      // Keep only identity/auth params; drop segment-specific ones
      const dropParams = new Set([
        "part",
        "track",
        "quality",
        "segmentTime",
        "wsd",
        "ppd",
        "ppst",
        "headerOffset",
        "headerSize",
        "correlationid",
        "psi",
        "ccat",
        "PlaybackSessionData",
      ]);
      for (const k of dropParams) u2.searchParams.delete(k);
      return {
        cleanedUrl: u2.toString(),
        type: "direct",
        label: "SP Transcode (use Current Page tab for yt-dlp)",
      };
    }

    return null;
  } catch {
    return null;
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      const result = classifyUrl(details.url);
      if (!result) return;

      const manifestData = {
        originalUrl: details.url,
        cleanedUrl: result.cleanedUrl,
        type: result.type,
        label: result.label,
        timestamp: Date.now(),
        tabId: details.tabId,
      };

      // Store per-tab list (keep last 20 per tab)
      const storageKey = `manifests_${details.tabId}`;
      chrome.storage.local.get(storageKey, (stored) => {
        const list = stored[storageKey] || [];
        // Avoid duplicates by cleanedUrl
        if (!list.some((m) => m.cleanedUrl === manifestData.cleanedUrl)) {
          list.push(manifestData);
          if (list.length > 20) list.shift();
          chrome.storage.local.set({ [storageKey]: list });
        }
      });

      // Also keep a global "lastManifest" for backward compat
      chrome.storage.local.set({ lastManifest: manifestData });

      chrome.runtime.sendMessage(
        { type: "manifestDetected", data: manifestData },
        () => {
          if (chrome.runtime.lastError) {
            /* popup closed, ignore */
          }
        },
      );
    } catch (error) {
      console.error("Error in webRequest listener:", error);
    }
  },
  { urls: ["<all_urls>"] },
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getManifests") {
    const tabId = message.tabId;
    const storageKey = `manifests_${tabId}`;
    chrome.storage.local.get([storageKey, "lastManifest"], (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ manifests: [], lastManifest: null });
      } else {
        sendResponse({
          manifests: result[storageKey] || [],
          lastManifest: result.lastManifest || null,
        });
      }
    });
    return true;
  }
  if (message.type === "clearManifests") {
    const tabId = message.tabId;
    chrome.storage.local.remove(`manifests_${tabId}`, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
