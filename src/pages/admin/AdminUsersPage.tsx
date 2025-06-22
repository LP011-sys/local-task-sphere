
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />
        <AdminUserManagement />
      </div>
    </div>
  );
}
