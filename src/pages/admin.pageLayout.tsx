import { AdminRoute } from "../components/ProtectedRoute";
import { SharedLayout } from "../components/SharedLayout";

// Protect the admin route so only admins can access it
// Also wrap in SharedLayout to keep the header/footer consistent, 
// though a dedicated AdminLayout might be preferred in a larger app.
// For now, reusing SharedLayout is fine as per instructions to use known components.
export default [AdminRoute, SharedLayout];