import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { DollarSign, Users, Clock, Table, TrendingUp, AlertCircle, User, BarChart3, Activity, FileText, Check, X, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRestaurant } from '../../context/RestaurantContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

type Alert = {
  id: string;
  type: 'void' | 'discount' | 'late' | 'complaint' | 'low-stock';
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  details?: {
    table?: string;
    orderId?: string;
    staff?: string;
    amount?: number;
  };
  resolved?: boolean;
};

const revenueData = [
  { hour: '12 PM', today: 8500, lastWeek: 7200 },
  { hour: '1 PM', today: 12000, lastWeek: 10500 },
  { hour: '2 PM', today: 15000, lastWeek: 13000 },
  { hour: '3 PM', today: 10000, lastWeek: 9000 },
  { hour: '4 PM', today: 6000, lastWeek: 5500 },
  { hour: '5 PM', today: 9000, lastWeek: 8000 },
  { hour: '6 PM', today: 18000, lastWeek: 16000 },
  { hour: '7 PM', today: 22000, lastWeek: 19000 },
];

const topItems = [
  { name: 'Chicken Biryani', orders: 45, revenue: 38250 },
  { name: 'Mutton Karahi', orders: 28, revenue: 33600 },
  { name: 'Seekh Kebab', orders: 38, revenue: 22800 },
  { name: 'Chicken Tikka', orders: 32, revenue: 22400 },
  { name: 'Fresh Lime', orders: 52, revenue: 10400 },
];


export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tables, orders, tickets, activity, exportCsv, addActivity } = useRestaurant();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());

  // Generate dynamic alerts from real data
  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];
    const now = Date.now();

    // Check for late tickets (high priority)
    tickets.filter(t => t.status === 'preparing' || t.status === 'new').forEach(ticket => {
      const elapsed = Math.floor((now - ticket.startedAt) / 60000);
      if (elapsed > ticket.estimatedMinutes + 5) {
        newAlerts.push({
          id: `late-${ticket.id}`,
          type: 'late',
          message: `Order #${ticket.orderNumber} is ${elapsed} min (target: ${ticket.estimatedMinutes})`,
          time: 'Just now',
          severity: 'high',
          details: {
            orderId: ticket.orderNumber,
            table: ticket.tableNumber
          }
        });
      }
    });

    // Check for tables with long turn times (medium priority)
    tables.filter(t => t.status === 'occupied' || t.status === 'ordered').forEach(table => {
      if (table.elapsedMinutes && table.elapsedMinutes > 90) {
        newAlerts.push({
          id: `long-turn-${table.id}`,
          type: 'complaint',
          message: `Table ${table.number} occupied for ${table.elapsedMinutes} min`,
          time: 'Ongoing',
          severity: 'medium',
          details: {
            table: table.number
          }
        });
      }
    });

    // Recent activity-based alerts
    const recentActivity = activity.slice(0, 20);
    
    // Discount alerts from activity
    const discountActivity = recentActivity.find(a => a.type === 'payment' && a.action.includes('%'));
    if (discountActivity) {
      newAlerts.push({
        id: 'discount-1',
        type: 'discount',
        message: discountActivity.action,
        time: new Date(discountActivity.time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
        severity: 'low'
      });
    }

    return newAlerts;
  }, [tickets, tables, activity]);

  const handleReviewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertDialog(true);
  };

  const handleResolveAlert = (alertId: string) => {
    setResolvedAlerts(prev => new Set(prev).add(alertId));
    setShowAlertDialog(false);
    addActivity(user?.name || 'Manager', `Resolved alert: ${selectedAlert?.type}`, 'issue');
    toast.success('Alert marked as resolved');
  };

  const handleDismissAlert = (alertId: string) => {
    setResolvedAlerts(prev => new Set(prev).add(alertId));
    toast('Alert dismissed');
  };

  const visibleAlerts = alerts.filter(a => !resolvedAlerts.has(a.id));

  const ordersList = Object.values(orders);
  const paidOrders = ordersList.filter(o => o.status === 'paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);
  const covers = tables.filter(t => t.status !== 'free' && t.status !== 'cleaning').reduce((s, t) => s + t.seats, 0);
  const openTables = tables.filter(t => t.status !== 'free').length;
  const avgTurnTime = Math.round(
    tables.filter(t => t.status !== 'free' && t.elapsedMinutes !== undefined).reduce((s, t) => s + (t.elapsedMinutes ?? 0), 0) /
    (tables.filter(t => t.status !== 'free' && t.elapsedMinutes !== undefined).length || 1)
  );

  const kpiData = {
    revenue: { value: revenue || 124500, change: 12, label: 'Today\'s Revenue' },
    covers: { value: covers || 87, change: -3, label: 'Covers Served' },
    avgTurnTime: { value: avgTurnTime || 42, change: -8, label: 'Avg Table Turn (min)' },
    openTables: { value: openTables || 12, change: 0, label: 'Open Tables' },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-sm text-muted-foreground">Karachi – Clifton Branch • {user?.name}</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Profile"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
          </button>
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{kpiData.revenue.label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary truncate" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Rs. {kpiData.revenue.value.toLocaleString()}
                </h3>
                <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
                  <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${kpiData.revenue.change > 0 ? 'text-success' : 'text-destructive'}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${kpiData.revenue.change > 0 ? 'text-success' : 'text-destructive'}`}>
                    {kpiData.revenue.change > 0 ? '+' : ''}{kpiData.revenue.change}%
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{kpiData.covers.label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {kpiData.covers.value}
                </h3>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${kpiData.covers.change > 0 ? 'text-success' : 'text-destructive'}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${kpiData.covers.change > 0 ? 'text-success' : 'text-destructive'}`}>
                    {kpiData.covers.change > 0 ? '+' : ''}{kpiData.covers.change}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{kpiData.avgTurnTime.label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {kpiData.avgTurnTime.value}m
                </h3>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${kpiData.avgTurnTime.change < 0 ? 'text-success' : 'text-destructive'}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${kpiData.avgTurnTime.change < 0 ? 'text-success' : 'text-destructive'}`}>
                    {kpiData.avgTurnTime.change}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{kpiData.openTables.label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {kpiData.openTables.value}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">of 20 total</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Table className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Revenue Chart */}
          <Card className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Line type="monotone" dataKey="today" stroke="var(--color-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="lastWeek" stroke="var(--color-muted-foreground)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Items */}
          <Card className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Top Selling Items</h2>
            <div className="space-y-2 sm:space-y-3">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.orders} orders</p>
                  </div>
                  <p className="font-semibold text-sm sm:text-base" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Rs. {item.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Alerts */}
          <Card className="p-3 sm:p-4 lg:p-6 lg:col-span-2">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Alerts</h2>
            <div className="space-y-2 sm:space-y-3">
              {visibleAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5
                    ${alert.severity === 'high' ? 'text-destructive' :
                      alert.severity === 'medium' ? 'text-warning' : 'text-info'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                  <div className="flex gap-1">
                    {alert.severity === 'high' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-shrink-0 text-xs sm:text-sm"
                        onClick={() => handleReviewAlert(alert)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0 px-2"
                      onClick={() => handleDismissAlert(alert.id)}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              {visibleAlerts.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-muted-foreground">All clear ✓ No items need your attention</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-3 sm:p-4 lg:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/manager/activity')}>
                <Activity className="w-4 h-4 mr-2" />
                Staff Activity
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate('/manager/reports')}>
                <FileText className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() => {
                  const csv = exportCsv('orders', user?.name ?? 'Manager');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'export-orders.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  toast.success('Exported orders CSV');
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Alert Review Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Review Alert
            </DialogTitle>
            <DialogDescription>
              Review and take action on this alert
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedAlert && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-l-4
                  ${selectedAlert.severity === 'high' ? 'bg-destructive/10 border-destructive' :
                    selectedAlert.severity === 'medium' ? 'bg-warning/10 border-warning' :
                    'bg-info/10 border-info'}
                `}>
                  <p className="font-medium text-foreground">{selectedAlert.message}</p>
                  <Badge
                    variant={selectedAlert.severity === 'high' ? 'destructive' :
                            selectedAlert.severity === 'medium' ? 'default' :
                            'secondary'}
                    className="mt-2"
                  >
                    {selectedAlert.severity} priority
                  </Badge>
                </div>

                {selectedAlert.details && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedAlert.details.table && (
                        <>
                          <span className="text-muted-foreground">Table:</span>
                          <span>{selectedAlert.details.table}</span>
                        </>
                      )}
                      {selectedAlert.details.orderId && (
                        <>
                          <span className="text-muted-foreground">Order:</span>
                          <span>#{selectedAlert.details.orderId}</span>
                        </>
                      )}
                      {selectedAlert.details.staff && (
                        <>
                          <span className="text-muted-foreground">Staff:</span>
                          <span>{selectedAlert.details.staff}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="manager-notes">Manager Notes</Label>
                  <textarea
                    id="manager-notes"
                    className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px] resize-none"
                    placeholder="Add notes about this alert..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAlertDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleResolveAlert(selectedAlert.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
