import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-screen">
      <div className="auth-screen__brand">
        <div className="auth-screen__mark">⌁</div>
        <h1 className="auth-screen__title">
          Streamora
          <span className="auth-screen__cursor" />
        </h1>
        <p className="auth-screen__tagline">
          Empowering creators to share stories, entertain audiences, and build
          communities through seamless video streaming.
        </p>
        <div className="auth-screen__status">
          <span className="auth-screen__dot" />
          Building Something Amazing
        </div>
      </div>

      <div className="auth-screen__panel">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
