
import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  admin: "Admin Dashboard",
  users: "User Management",
  tasks: "Task Oversight", 
  reports: "Reports & Disputes",
  analytics: "Analytics",
  push: "Push Notifications",
};

export default function AdminBreadcrumb() {
  const location = useLocation();
  
  // Split the pathname and filter out empty strings
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  // Only show breadcrumbs for admin routes
  if (!pathSegments.includes("admin")) {
    return null;
  }

  // Find the admin index and get relevant segments
  const adminIndex = pathSegments.indexOf("admin");
  const relevantSegments = pathSegments.slice(adminIndex);

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home size={16} />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {relevantSegments.map((segment, index) => {
            const isLast = index === relevantSegments.length - 1;
            const path = "/" + pathSegments.slice(0, adminIndex + index + 1).join("/");
            const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <React.Fragment key={segment}>
                <BreadcrumbSeparator>
                  <ChevronRight size={16} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-primary">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={path}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
