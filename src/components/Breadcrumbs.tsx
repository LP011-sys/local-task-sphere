
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
  '/dashboard/customer': 'dashboard',
  '/dashboard/provider': 'dashboard',
  '/post-task': 'postTask',
  '/offers': 'offers',
  '/favorites': 'favorites',
  '/chat': 'chat',
  '/profile': 'profile',
  '/referral': 'referral',
  '/review': 'review',
  '/admin': 'admin',
  '/complete-profile/customer': 'profile',
  '/complete-profile/provider': 'profile',
  '/premium': 'premium',
  '/provider/tasks': 'taskFeed',
  '/provider/offers': 'myOffers',
  '/provider/earnings': 'earnings',
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
    
    // Try to get translation key from routeLabels, fallback to segment
    const translationKey = routeLabels[currentPath] || segment;
    const label = t(translationKey, { defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1) });
    
    breadcrumbItems.push({
      path: currentPath,
      label,
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
