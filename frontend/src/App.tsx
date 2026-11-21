import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { TripsPage } from "./pages/trips/TripsPage";
import { CreateTripPage } from "./pages/create/CreateTripPage";
import { TripDetailPage } from "./pages/detail/TripDetailPage";
import { ExplorePage } from "./pages/explore/ExplorePage";
import { BookingsPage } from "./pages/bookings/BookingsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

import { DestinationDetailPage } from "./pages/explore/DestinationDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Authentication Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/redirect" element={<Navigate to="/trips" replace />} />

        {/* Protected App Routes (Wrapped in ProtectedRoute & Shell Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/create" element={<CreateTripPage />} />
          <Route path="/trips/:tripId" element={<TripDetailPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destinations/:placeId" element={<DestinationDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/funds" element={<Navigate to="/trips" replace />} />
          <Route path="/settle" element={<Navigate to="/trips" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

