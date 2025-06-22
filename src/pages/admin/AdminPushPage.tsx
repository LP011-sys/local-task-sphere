
import AdminPushPanel from "@/components/admin/AdminPushPanel";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminPushPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />
        <AdminPushPanel />
      </div>
    </div>
  );
}
