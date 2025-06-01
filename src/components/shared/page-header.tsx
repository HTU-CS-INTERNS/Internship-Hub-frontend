import type { LucideIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ href?: string; label: string }>;
}

export default function PageHeader({ title, description, icon: Icon, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {crumb.href && index < breadcrumbs.length -1 ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary hidden sm:block" />}
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm md:text-base text-muted-foreground font-body">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0 w-full md:w-auto">{actions}</div>}
      </div>
    </div>
  );
}
