import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthContext";
import { WebSocketProvider } from "../features/websocket/WebSocketContext";
import AuthLayout from "../features/auth/AuthLayout";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import Dashboard from "../features/user/Dashboard";
import ProfileEditor from "../features/user/ProfileEditor";
import ProfileView from "../features/user/ProfileView";
import PublicProfile from "../features/user/PublicProfile";
import VideoUpload from "../features/video/VideoUpload";
import VideoPlayer from "../features/video/VideoPlayer";
import VideoList from "../features/video/VideoList";
import MessagesPage from "../features/chat/MessagesPage";
import SearchResults from "../features/search/SearchResults";
import AnalyticsDashboard from "../features/analytics/AnalyticsDashboard";
import ProtectedRoute from "./ProtectedRoute";
import "../shared/styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <VideoUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/videos" element={<VideoList />} />
            <Route path="/videos/:videoId" element={<VideoPlayer />} />
            <Route path="/u/:username" element={<PublicProfile />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
