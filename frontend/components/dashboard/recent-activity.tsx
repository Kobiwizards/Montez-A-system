import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CreditCard, Droplets, Wrench, Bell, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'payment' | 'maintenance' | 'water' | 'notification' | 'alert';
  title: string;
  description: string;
  date: string;
  user?: string;
  apartment?: string;
  amount?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  limit?: number;
}

export function RecentActivity({ activities = [], limit = 5 }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'water':
        return <Droplets className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const displayedActivities = activities.slice(0, limit);

  if (displayedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>No recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest activities across the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary-800/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)} bg-secondary-800`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(activity.date, 'short')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {activity.user && (
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                      {activity.user}
                    </span>
                  )}
                  {activity.apartment && (
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                      {activity.apartment}
                    </span>
                  )}
                  {activity.amount !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                      KSh {activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
