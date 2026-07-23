import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "./videoApi";

const CATEGORIES = [
  "Gaming",
  "Education",
  "Technology",
  "Travel",
  "Music",
  "Comedy",
  "Fitness",
  "Other",
];

export default function VideoUpload() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    tags: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleVideoChange(e) {
    setVideoFile(e.target.files?.[0] || null);
  }

  function handleThumbnailChange(e) {
    const file = e.target.files?.[0] || null;
    setThumbnail(file);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!videoFile) {
      setError("Please select a video file.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress("Uploading…");

    try {
      const video = await uploadVideo({
        videoFile,
        thumbnail,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags.trim(),
      });
      setProgress("Done!");
      navigate(`/videos/${video.id}`);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setProgress("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="video-upload">
      <h1 className="video-upload__title">Upload video</h1>

      <form className="auth-form video-upload__form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Video file *</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            disabled={uploading}
          />
          {videoFile && (
            <span className="video-upload__filename">{videoFile.name}</span>
          )}
        </label>

        <label className="auth-field">
          <span>Thumbnail (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={uploading}
          />
          {thumbnailPreview && (
            <img
              className="video-upload__thumb-preview"
              src={thumbnailPreview}
              alt="Thumbnail preview"
            />
          )}
        </label>

        <label className="auth-field">
          <span>Title *</span>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Give your video a title"
            disabled={uploading}
          />
        </label>

        <label className="auth-field">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="What's this video about?"
            disabled={uploading}
          />
        </label>

        <label className="auth-field">
          <span>Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={uploading}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>Tags</span>
          <input
            name="tags"
            type="text"
            value={form.tags}
            onChange={handleChange}
            placeholder="gaming, tutorial, fps  (comma-separated)"
            disabled={uploading}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {progress && <p className="video-upload__progress">{progress}</p>}

        <div className="video-upload__actions">
          <button className="auth-button" type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <button
            className="auth-button auth-button--ghost"
            type="button"
            onClick={() => navigate("/")}
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
