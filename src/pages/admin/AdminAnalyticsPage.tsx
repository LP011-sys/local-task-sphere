
import AdminAnalyticsPanel from "@/components/admin/AdminAnalyticsPanel";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminBreadcrumb />
        <AdminAnalyticsPanel />
      </div>
    </div>
  );
}
