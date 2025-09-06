'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  isLoading?: boolean;
  className?: string;
  iconBgColor?: string;
  iconTextColor?: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  progress,
  badge,
  action,
  isLoading = false,
  className,
  iconBgColor = "bg-primary/10",
  iconTextColor = "text-primary",
  valueColor = "text-foreground"
}) => {
  if (isLoading) {
    return (
      <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend?.isPositive === true ? TrendingUp : 
                   trend?.isPositive === false ? TrendingDown : Minus;

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardDescription className="text-sm font-medium">{title}</CardDescription>
              {badge && (
                <Badge variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            <CardTitle className={cn("text-2xl font-bold mt-1", valueColor)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </CardTitle>
          </div>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBgColor, iconTextColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-2">
            <TrendIcon className={cn(
              "w-4 h-4",
              trend.isPositive === true ? "text-green-600" :
              trend.isPositive === false ? "text-red-600" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              trend.isPositive === true ? "text-green-600" :
              trend.isPositive === false ? "text-red-600" : "text-muted-foreground"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          </div>
        )}
        
        {progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progress.label || 'Progress'}</span>
              <span className="font-medium">
                {progress.value}{progress.max ? `/${progress.max}` : '%'}
              </span>
            </div>
            <Progress 
              value={progress.max ? (progress.value / progress.max) * 100 : progress.value} 
              className="h-2" 
            />
          </div>
        )}
      </CardContent>
      
      {action && (
        <CardFooter className="pt-3">
          {action.href ? (
            <Link href={action.href} className="w-full">
              <Button variant="outline" className="w-full rounded-md text-sm">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              className="w-full rounded-md text-sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export interface MetricsSectionProps {
  title: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  title,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {format(new Date(lastUpdated), 'h:mm a')}
            </p>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};

// Quick stats component for smaller metric displays
export interface QuickStatProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  isLoading?: boolean;
}

export const QuickStat: React.FC<QuickStatProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend.isPositive === true ? "text-green-600" :
            trend.isPositive === false ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
};
