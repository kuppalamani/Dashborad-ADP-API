import React, { useState } from "react";
import { Upload, BarChart2, AlertCircle, Cloud } from "lucide-react";

export default function WelcomePage({ onFileUpload, uploading, uploadError }) {
  const [dragging, setDragging] = useState(false);
  const [oneDriveUrl, setOneDriveUrl] = useState("");
  const [odLoading, setOdLoading] = useState(false);
  const [odError, setOdError] = useState("");

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileUpload({ target: { files: [file], value: "" } });
  };

  // Convert any OneDrive / SharePoint share link into a direct download URL
  function resolveDownloadUrl(raw) {
    const url = raw.trim();

    // ── 1. Already a direct download URL ──────────────────────────
    if (url.includes("download.aspx") || url.includes("?download=1") || url.includes("&download=1")) {
      return url;
    }

    // ── 2. SharePoint personal/business share link ─────────────────
    // e.g. https://aquera-my.sharepoint.com/:x:/p/username/ExxxABC?e=abc
    //   → https://aquera-my.sharepoint.com/:x:/p/username/ExxxABC?e=abc&download=1
    if (url.includes("sharepoint.com")) {
      const sep = url.includes("?") ? "&" : "?";
      return url + sep + "download=1";
    }

    // ── 3. Short OneDrive link: 1drv.ms ───────────────────────────
    // Append &download=1 — the redirect chain will follow to download
    if (url.includes("1drv.ms")) {
      const sep = url.includes("?") ? "&" : "?";
      return url + sep + "download=1";
    }

    // ── 4. onedrive.live.com share link ───────────────────────────
    if (url.includes("onedrive.live.com")) {
      return url.replace("redir?", "download?").replace("resid=", "resid=") + "&download=1";
    }

    throw new Error("Unrecognised link format. Please use the Share → Copy link button from OneDrive or SharePoint.");
  }

  const handleOneDrive = async () => {
    if (!oneDriveUrl.trim()) { setOdError("Please paste your OneDrive share link."); return; }
    setOdLoading(true); setOdError("");
    try {
      const downloadUrl = resolveDownloadUrl(oneDriveUrl);

      const res = await fetch(downloadUrl, { mode: "cors" });

      if (!res.ok) {
        // Provide helpful guidance based on status code
        if (res.status === 403 || res.status === 401) {
          throw new Error("Access denied (403). In OneDrive link settings, set 'The link works for' to Anyone → Can view, then click Apply and copy the new link.");
        }
        if (res.status === 400) {
          throw new Error("Bad request (400). Make sure you copied the full share link from the Share button, with 'Anyone' access selected.");
        }
        throw new Error(`Download failed (${res.status}). Check the link is set to Anyone can view.`);
      }

      const blob = await res.blob();
      if (blob.size < 100) throw new Error("Downloaded file is empty — check your link and permissions.");

      const file = new File([blob], "onedrive-sheet.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      onFileUpload({ target: { files: [file], value: "" } });
    } catch (err) {
      // Network/CORS errors
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("CORS")) {
        setOdError("CORS error: the browser blocked the download. Use the workaround below — download the file from OneDrive manually and upload it here with the Upload Excel button.");
      } else {
        setOdError(err.message);
      }
    } finally {
      setOdLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f4f0ff 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", padding: 24 }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(79,110,247,0.3)" }}>
          <BarChart2 size={30} color="#fff" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4f6ef7", letterSpacing: "0.15em", textTransform: "uppercase" }}>Aquera</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 520 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#1a2035", letterSpacing: "-0.04em", margin: 0, lineHeight: 1.1 }}>
          Welcome to<br />
          <span style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Aqure — Team SRE
          </span>
        </h1>
        <p style={{ fontSize: 15, color: "#8292b0", marginTop: 14, lineHeight: 1.6 }}>
          Upload your API usage Excel sheet to get instant analytics.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* ── Upload card ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ background: "#fff", borderRadius: 20, border: `2px dashed ${dragging ? "#4f6ef7" : uploadError ? "#ef4444" : "#c5cfe0"}`, padding: "32px 28px", textAlign: "center", boxShadow: dragging ? "0 0 0 4px rgba(79,110,247,0.1)" : "0 4px 24px rgba(30,50,120,0.06)", cursor: "pointer" }}>
          <label style={{ cursor: "pointer" }}>
            <input type="file" accept=".xlsx,.xls" onChange={onFileUpload} style={{ display: "none" }} disabled={uploading} />
            <div style={{ width: 52, height: 52, background: uploadError ? "rgba(239,68,68,0.08)" : "rgba(79,110,247,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              {uploadError ? <AlertCircle size={24} color="#ef4444" /> : <Upload size={24} color="#4f6ef7" />}
            </div>
            {uploading ? (
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2035", marginBottom: 10 }}>Parsing file…</div>
                <div style={{ width: "50%", height: 4, background: "#e8edf5", borderRadius: 2, margin: "0 auto", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #4f6ef7, #7c3aed)", borderRadius: 2, width: "40%", animation: "slide 1.2s ease-in-out infinite" }} />
                </div>
              </div>
            ) : uploadError ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>Upload failed</div>
                <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, lineHeight: 1.5 }}>{uploadError}</div>
                <div style={{ fontSize: 12, color: "#8292b0" }}>Click to try again</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2035", marginBottom: 6 }}>{dragging ? "Drop here" : "Click to upload Excel"}</div>
                <div style={{ fontSize: 12, color: "#8292b0" }}>Supports .xlsx and .xls · drag &amp; drop works too</div>
              </div>
            )}
          </label>
        </div>

        {/* ── OneDrive card ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e8edf5", padding: "24px 28px", boxShadow: "0 4px 24px rgba(30,50,120,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, background: "rgba(0,120,212,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Cloud size={18} color="#0078d4" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2035" }}>Load from OneDrive</div>
              <div style={{ fontSize: 11, color: "#8292b0" }}>Paste your OneDrive share link below</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={oneDriveUrl}
              onChange={(e) => { setOneDriveUrl(e.target.value); setOdError(""); }}
              placeholder="https://1drv.ms/x/... or SharePoint link"
              style={{ flex: 1, background: "#f4f6fb", border: `1.5px solid ${odError ? "#ef4444" : "#e8edf5"}`, borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#1a2035", outline: "none", fontFamily: "DM Sans, sans-serif" }}
              onKeyDown={(e) => e.key === "Enter" && handleOneDrive()}
            />
            <button onClick={handleOneDrive} disabled={odLoading}
              style={{ background: "#0078d4", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: odLoading ? "wait" : "pointer", whiteSpace: "nowrap", fontFamily: "DM Sans, sans-serif" }}>
              {odLoading ? "Loading…" : "Load"}
            </button>
          </div>

          {odError && <div style={{ marginTop: 8, fontSize: 11, color: "#ef4444", lineHeight: 1.5 }}>{odError}</div>}

          <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(0,120,212,0.05)", borderRadius: 8, border: "1px solid rgba(0,120,212,0.1)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0078d4", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>How to get the correct link</div>
            <div style={{ fontSize: 11, color: "#8292b0", lineHeight: 1.9 }}>
              1. Open your Excel file in OneDrive / SharePoint<br />
              2. Click <strong style={{ color: "#1a2035" }}>Share</strong> (top right)<br />
              3. Click <strong style={{ color: "#1a2035" }}>Link settings</strong> (gear / pencil icon)<br />
              4. Select <strong style={{ color: "#1a2035" }}>Anyone</strong> → set to <strong style={{ color: "#1a2035" }}>Can view</strong><br />
              5. Click <strong style={{ color: "#1a2035" }}>Apply</strong>, then <strong style={{ color: "#1a2035" }}>Copy link</strong><br />
              6. Paste the full link above and click Load
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(245,158,11,0.07)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#b45309", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>⚠ If loading still fails</div>
            <div style={{ fontSize: 11, color: "#8292b0", lineHeight: 1.7 }}>
              Browser security (CORS) may block direct SharePoint downloads.<br />
              <strong style={{ color: "#1a2035" }}>Easiest fix:</strong> In OneDrive, click <strong style={{ color: "#1a2035" }}>Download</strong> to save the file locally, then use the <strong style={{ color: "#1a2035" }}>Upload Excel</strong> button above.
            </div>
          </div>
        </div>

        {/* Format hint */}
        <div style={{ background: "rgba(79,110,247,0.06)", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(79,110,247,0.12)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#4f6ef7", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Expected Format</div>
          <div style={{ fontSize: 11, color: "#8292b0", lineHeight: 1.8 }}>
            Columns: <strong style={{ color: "#1a2035" }}>Connector</strong> · <strong style={{ color: "#1a2035" }}>oid</strong> · <strong style={{ color: "#1a2035" }}>Tenant Name</strong> · date columns in <strong style={{ color: "#1a2035" }}>d/m/yy</strong> format
          </div>
        </div>
      </div>

      <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
    </div>
  );
}
