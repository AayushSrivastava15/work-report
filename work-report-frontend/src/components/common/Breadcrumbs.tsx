import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  'work-entries': 'Work Entries',
  reports: 'Work Reports',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 mb-4">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-blue-600 transition-colors"
        title="Go to Dashboard"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 capitalize" aria-current="page">
                {label}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 transition-colors capitalize">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
