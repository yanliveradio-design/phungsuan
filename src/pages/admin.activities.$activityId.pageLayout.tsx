import { AdminRoute } from "../components/ProtectedRoute";
import { SharedLayout } from "../components/SharedLayout";

// Protect the admin route so only admins can access it
// Also wrap in SharedLayout to keep the header/footer consistent
export default [AdminRoute, SharedLayout];