import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateProfile, uploadProfileImage } from "./userApi";
import { CONTENT_TYPES, loadAssetBlobUrl } from "../../shared/config";
import { useAuth } from "../auth/AuthContext";

export default function ProfileEditor() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    name: "",
    about: "",
    dob: "",
    contentType: CONTENT_TYPES[0],
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Tracks the most recent blob URL we created ourselves (from the saved
  // profile picture or right after an upload) so we can revoke it before
  // creating a new one or on unmount. Doesn't track the locally-selected
  // file preview, which the browser owns independently.
  const ownedBlobUrlRef = useRef(null);

  function setOwnedPreview(blobUrl) {
    if (ownedBlobUrlRef.current) {
      URL.revokeObjectURL(ownedBlobUrlRef.current);
    }
    ownedBlobUrlRef.current = blobUrl;
    setPreview(blobUrl);
  }

  // Load the existing profile (if any) on mount, so returning users see
  // their saved details instead of a blank "create" form.
  useEffect(() => {
    let cancelled = false;

    getMyProfile()
      .then(async (profile) => {
        if (cancelled) return;
        setForm({
          name: profile.name || "",
          about: profile.about || "",
          dob: profile.dob || "",
          contentType: profile.contentType || CONTENT_TYPES[0],
        });
        setUser((u) => ({ ...u, ...profile }));

        if (profile.profilePic) {
          try {
            const blobUrl = await loadAssetBlobUrl(profile.profilePic);
            if (!cancelled) setOwnedPreview(blobUrl);
          } catch {
            if (!cancelled) setOwnedPreview(null);
          }
        }
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err.message || "Couldn't load your profile");
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
      if (ownedBlobUrlRef.current) {
        URL.revokeObjectURL(ownedBlobUrlRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    setDetailsError("");
    setDetailsSaved(false);
    setSavingDetails(true);
    try {
      const updated = await updateProfile(form);
      setUser((u) => ({ ...u, ...updated }));
      setDetailsSaved(true);
    } catch (err) {
      setDetailsError(err.message || "Couldn't save profile");
    } finally {
      setSavingDetails(false);
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setUploadError("");
    if (selected) {
      // Locally-selected file preview — this is a browser-owned object URL
      // pointing at a file already on disk client-side, no network
      // request involved, so ngrok's interstitial doesn't apply here.
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleImageSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const updated = await uploadProfileImage(file);
      setUser((u) => ({ ...u, ...updated }));
      const blobUrl = await loadAssetBlobUrl(updated.profilePic);
      setOwnedPreview(blobUrl);
      setFile(null);
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="boot-screen">
        <span className="boot-screen__cursor" />
      </div>
    );
  }

  return (
    <div className="profile-editor">
      <header className="profile-editor__header">
        <h1 className="profile-editor__title">Edit profile</h1>
        <button
          className="auth-button auth-button--ghost"
          onClick={() => navigate("/profile")}
        >
          View profile
        </button>
      </header>

      {loadError && <p className="auth-error">{loadError}</p>}

      <section className="profile-editor__section">
        <h2 className="profile-editor__section-title">Profile picture</h2>
        <form
          className="profile-editor__image-form"
          onSubmit={handleImageSubmit}
        >
          <div className="profile-editor__avatar">
            {preview ? (
              <img src={preview} alt="Profile preview" />
            ) : (
              <span className="profile-editor__avatar-placeholder">
                No image
              </span>
            )}
          </div>
          <div className="profile-editor__image-controls">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {uploadError && <p className="auth-error">{uploadError}</p>}
            <button
              className="auth-button"
              type="submit"
              disabled={!file || uploading}
            >
              {uploading ? "Uploading…" : "Upload picture"}
            </button>
          </div>
        </form>
      </section>

      <section className="profile-editor__section">
        <h2 className="profile-editor__section-title">Details</h2>
        <form className="auth-form" onSubmit={handleDetailsSubmit}>
          <label className="auth-field">
            <span>Display name</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="auth-field">
            <span>About</span>
            <textarea
              name="about"
              rows={4}
              value={form.about}
              onChange={handleChange}
            />
          </label>

          <label className="auth-field">
            <span>Date of birth</span>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </label>

          <label className="auth-field">
            <span>Content type</span>
            <select
              name="contentType"
              value={form.contentType}
              onChange={handleChange}
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          {detailsError && <p className="auth-error">{detailsError}</p>}
          {detailsSaved && <p className="profile-editor__saved">Saved.</p>}

          <button
            className="auth-button"
            type="submit"
            disabled={savingDetails}
          >
            {savingDetails ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
