import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Download, FileText, Calendar, ChevronLeft, ChevronRight, TrendingUp, Users, Utensils, PieChart, Printer, Check } from 'lucide-react';
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

type DateRange = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

const reportTypes = [
  { id: 'sales', label: 'Sales Report', icon: TrendingUp },
  { id: 'items', label: 'Items Report', icon: Utensils },
  { id: 'staff', label: 'Staff Performance', icon: Users },
  { id: 'categories', label: 'Category Analysis', icon: PieChart },
];

export default function Reports() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { orders, menu, activity, exportCsv } = useRestaurant();

  const getDateRange = () => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: new Date(customStartDate), end: new Date(customEndDate) };
        }
        break;
    }
    return { start, end };
  };

  const { start, end } = getDateRange();

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderTime = new Date(o.timestamp).getTime();
      return orderTime >= start.getTime() && orderTime <= end.getTime() && o.status !== 'cancelled';
    });
  }, [orders, start, end]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Top items
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = { name: item.name, count: 0, revenue: 0 };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.price * item.quantity;
      });
    });
    const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Category breakdown
    const categoryCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menuItemId);
        const category = menuItem?.category || 'Other';
        if (!categoryCounts[category]) {
          categoryCounts[category] = { name: category, count: 0, revenue: 0 };
        }
        categoryCounts[category].count += item.quantity;
        categoryCounts[category].revenue += item.price * item.quantity;
      });
    });
    const categories = Object.values(categoryCounts).sort((a, b) => b.revenue - a.revenue);

    // Staff activity
    const staffActivity = activity.filter(a => {
      const actTime = a.time;
      return actTime >= start.getTime() && actTime <= end.getTime();
    });

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItems,
      categories,
      staffActivity
    };
  }, [filteredOrders, menu, activity, start, end]);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (dateRange === 'today') return 'Today';
    if (dateRange === 'yesterday') return 'Yesterday';
    if (dateRange === '7days') return 'Last 7 Days';
    if (dateRange === '30days') return 'Last 30 Days';
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString('en-PK', options)} - ${new Date(customEndDate).toLocaleDateString('en-PK', options)}`;
    }
    return 'Custom Range';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/manager')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Reports & Export</h1>
            <p className="text-sm text-muted-foreground">Generate and download reports</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Report Type Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${selectedReport === type.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Rs. {stats.totalRevenue.toLocaleString('en-PK')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{formatDateRange()}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {stats.totalOrders.toLocaleString('en-PK')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{formatDateRange()}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Rs. {stats.avgOrderValue.toLocaleString('en-PK')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{formatDateRange()}</p>
            </Card>
          </div>

          {/* Report Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {(() => {
                  const ReportIcon = reportTypes.find(t => t.id === selectedReport)?.icon || FileText;
                  return <ReportIcon className="w-5 h-5" />;
                })()}
                {reportTypes.find(t => t.id === selectedReport)?.label} Preview
              </h2>
              <Badge variant="outline">{formatDateRange()}</Badge>
            </div>

            <div className="space-y-4">
              {selectedReport === 'sales' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Paid Orders</p>
                      <p className="text-xl font-bold">
                        {filteredOrders.filter(o => o.status === 'paid').length}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Kitchen Orders</p>
                      <p className="text-xl font-bold">
                        {filteredOrders.filter(o => o.status === 'kitchen').length}
                      </p>
                    </div>
                  </div>
                  {filteredOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No orders found in this date range
                    </p>
                  )}
                </div>
              )}

              {selectedReport === 'items' && (
                <div className="space-y-2">
                  {stats.topItems.length > 0 ? (
                    stats.topItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.count} sold</p>
                          <p className="text-sm text-muted-foreground">Rs. {item.revenue.toLocaleString('en-PK')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              )}

              {selectedReport === 'staff' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                    <span>Staff</span>
                    <span>Logins</span>
                    <span>Orders</span>
                    <span>Payments</span>
                  </div>
                  {stats.staffActivity.length > 0 ? (
                    Object.entries(
                      stats.staffActivity.reduce((acc, act) => {
                        if (!acc[act.staff]) acc[act.staff] = { login: 0, order_sent: 0, payment: 0 };
                        if (act.type === 'login') acc[act.staff].login++;
                        if (act.type === 'order_sent') acc[act.staff].order_sent++;
                        if (act.type === 'payment') acc[act.staff].payment++;
                        return acc;
                      }, {} as Record<string, { login: number; order_sent: number; payment: number }>)
                    ).map(([staff, counts]) => (
                      <div key={staff} className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg">
                        <span className="font-medium">{staff}</span>
                        <span>{counts.login}</span>
                        <span>{counts.order_sent}</span>
                        <span>{counts.payment}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No staff activity in this period</p>
                  )}
                </div>
              )}

              {selectedReport === 'categories' && (
                <div className="space-y-2">
                  {stats.categories.length > 0 ? (
                    stats.categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium capitalize">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{cat.count} items</p>
                          <p className="text-sm text-muted-foreground">Rs. {cat.revenue.toLocaleString('en-PK')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Export Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Export Report</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => setShowDateModal(true)}
                >
                  <Calendar className="w-4 h-4" />
                  {formatDateRange()}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => {
                    window.print();
                    toast('Opened print dialog');
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  className="gap-2 flex-1"
                  onClick={() => {
                    // Demo: "PDF" is represented as printing a simple page in-browser.
                    window.print();
                    toast('Opened print dialog (demo PDF)');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => {
                    const kind = selectedReport === 'staff' ? 'activity' : selectedReport === 'sales' ? 'orders' : selectedReport === 'items' ? 'orders' : 'orders';
                    const csv = exportCsv(kind as any, 'Manager');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report-${selectedReport}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    toast.success('Downloaded CSV');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Reports will be generated based on your selected filters
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Date Range Modal */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogDescription>
              Choose a preset or custom date range for your report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Preset Ranges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setDateRange(id as DateRange)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                    ${dateRange === id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    {dateRange === id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setDateRange('custom')}
                className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all mb-3
                  ${dateRange === 'custom'
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>Custom Range</span>
                  {dateRange === 'custom' && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>

              {dateRange === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowDateModal(false);
              toast.success(`Date range updated to ${formatDateRange()}`);
            }}>
              Apply Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
