import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedCreators } from "./recommendationApi";

export default function SuggestedCreators() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    getSuggestedCreators(8).then(setCreators).catch(() => {});
  }, []);

  if (!creators.length) return null;

  return (
    <section className="suggested-creators">
      <h2 className="video-list__title">👥 Suggested Creators</h2>
      <div className="suggested-creators__list">
        {creators.map((c) => (
          <Link key={c.id} className="creator-chip" to={`/u/${c.username}`}>
            <div className="creator-chip__avatar">
              {c.profilePic
                ? <img src={c.profilePic} alt={c.username} />
                : <span>{c.username?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="creator-chip__info">
              <p className="creator-chip__name">{c.name || c.username}</p>
              <p className="creator-chip__sub">{c.subscribers} subscribers</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
