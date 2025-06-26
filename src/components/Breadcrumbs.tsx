
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  '/': 'home',
  '/dashboard/customer': 'customerDashboard',
  '/dashboard/provider': 'providerDashboard',
  '/post-task': 'postTask',
  '/offers': 'offers',
  '/favorites': 'favorites',
  '/chat': 'chat',
  '/profile': 'profile',
  '/referral': 'referral',
  '/review': 'review',
  '/admin': 'adminDashboard',
  '/complete-profile/customer': 'completeProfile',
  '/complete-profile/provider': 'completeProfile',
  '/premium': 'premium',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs for single-level paths or home
  if (pathSegments.length <= 1) {
    return null;
  }
  
  const breadcrumbItems = [];
  let currentPath = '';
  
  // Add home as the first item
  breadcrumbItems.push({
    path: '/',
    label: t('home'),
    isLast: false
  });
  
  // Build breadcrumb items from path segments
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    const label = routeLabels[currentPath] || segment;
    
    breadcrumbItems.push({
      path: currentPath,
      label: t(label) || segment,
      isLast
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-1">
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
