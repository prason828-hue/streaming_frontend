import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionStatus,
  subscribe,
  unsubscribe,
} from "./subscriptionApi";
import { useAuth } from "../auth/AuthContext";

export default function SubscribeButton({ channelId }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelId) return;
    let cancelled = false;

    getSubscriptionStatus(channelId)
      .then((data) => {
        if (cancelled) return;
        setSubscribed(data.subscribed);
        setCount(data.subscriberCount);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  async function handleClick() {
    if (!user) {
      navigate("/login");
      return;
    }
    setWorking(true);
    setError("");
    try {
      const data = subscribed
        ? await unsubscribe(channelId)
        : await subscribe(channelId);
      setSubscribed(data.subscribed);
      setCount(data.subscriberCount);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setWorking(false);
    }
  }

  if (loading) return null;

  // Label logic:
  // - Not subscribed → "Subscribe"
  // - Subscribed + hovering → "Unsubscribe" (red tint so it's obviously destructive)
  // - Subscribed + not hovering → "Subscribed ✓"
  let label = "Subscribe";
  if (working) {
    label = "…";
  } else if (subscribed) {
    label = hovered ? "Unsubscribe" : "Subscribed ✓";
  }

  return (
    <div className="subscribe">
      <button
        className={[
          "subscribe__btn",
          subscribed ? "subscribe__btn--subscribed" : "",
          subscribed && hovered ? "subscribe__btn--unsubscribe" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={working}
      >
        {label}
      </button>
      <span className="subscribe__count">
        {count.toLocaleString()} subscriber{count !== 1 ? "s" : ""}
      </span>
      {error && <span className="subscribe__error">{error}</span>}
    </div>
  );
}
