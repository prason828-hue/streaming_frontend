import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "./userApi";
import { loadAssetBlobUrl } from "../../shared/config";
import { useAuth } from "../auth/AuthContext";

export default function ProfileView() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getMyProfile()
      .then(async (data) => {
        if (cancelled) return;
        setProfile(data);
        setUser((u) => ({ ...u, ...data }));

        if (data.profilePic) {
          try {
            const blobUrl = await loadAssetBlobUrl(data.profilePic);
            if (!cancelled) {
              blobUrlRef.current = blobUrl;
              setAvatarSrc(blobUrl);
            }
          } catch {
            if (!cancelled) setAvatarSrc(null);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load your profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="boot-screen">
        <span className="boot-screen__cursor" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile public-profile--error">
        <p>{error}</p>
        <Link className="auth-link" to="/">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="public-profile">
      <div className="public-profile__avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Your avatar" />
        ) : (
          <span className="profile-editor__avatar-placeholder">No image</span>
        )}
      </div>

      <h1 className="public-profile__name">
        {profile.name || profile.username}
      </h1>
      <p className="public-profile__handle">@{profile.username}</p>
      <p className="public-profile__handle">{profile.email}</p>

      {profile.contentType && (
        <span className="public-profile__tag">{profile.contentType}</span>
      )}

      {profile.about && (
        <p className="public-profile__about">{profile.about}</p>
      )}

      {profile.dob && (
        <p className="public-profile__about">Born {profile.dob}</p>
      )}

      <div className="public-profile__stats">
        <div>
          <strong>{profile.subscribers ?? 0}</strong>
          <span>subscribers</span>
        </div>
        <div>
          <strong>{profile.videos?.length ?? 0}</strong>
          <span>videos</span>
        </div>
      </div>

      <div className="dashboard__header-actions">
        <Link className="auth-button" to="/profile/edit">
          Edit profile
        </Link>
        <Link className="auth-link" to="/">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
