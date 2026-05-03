import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Search, Download, User, Filter, X, Calendar, Check } from 'lucide-react';
import { useRestaurant, type ActivityType } from '../../context/RestaurantContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const activityTypes: ActivityType[] = ['login', 'logout', 'seat', 'order_sent', 'kitchen_start', 'kitchen_ready', 'bill_requested', 'payment', 'issue', 'export', 'shift'];

export default function StaffActivity() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const { activity, exportCsv } = useRestaurant();

  const getStartOfDay = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getEndOfDay = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };

  const getStartOfWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const filteredActivity = activity.filter(entry => {
    // Search filter
    const matchesSearch = entry.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(entry.type);

    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = entry.time >= getStartOfDay() && entry.time <= getEndOfDay();
    } else if (dateFilter === 'yesterday') {
      matchesDate = entry.time >= getStartOfDay(1) && entry.time <= getEndOfDay(1);
    } else if (dateFilter === 'week') {
      matchesDate = entry.time >= getStartOfWeek();
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const toggleType = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setDateFilter('all');
  };

  const activeFilterCount = selectedTypes.length + (dateFilter !== 'all' ? 1 : 0);

  const typeColors: Record<string, string> = {
    issue: 'bg-destructive/10 text-destructive',
    export: 'bg-warning/10 text-warning',
    shift: 'bg-info/10 text-info',
    login: 'bg-success/10 text-success',
    payment: 'bg-primary/10 text-primary',
    order_sent: 'bg-success/10 text-success',
    bill_requested: 'bg-warning/10 text-warning',
    kitchen_ready: 'bg-info/10 text-info',
    kitchen_start: 'bg-muted text-muted-foreground',
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Staff Activity Feed</h1>
            <p className="text-sm text-muted-foreground">Audit log of all staff actions</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 relative"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const csv = exportCsv('activity', 'Manager');
                download('staff-activity.csv', csv);
                toast.success('Exported CSV');
              }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            {filteredActivity.map((entry) => (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{entry.staff}</span>
                      <Badge className={`text-xs ${typeColors[entry.type] ?? 'bg-muted text-muted-foreground'}`}>
                        {String(entry.type).replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{entry.action}</p>
                    <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(entry.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredActivity.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No activity matches your filters.</p>
              {activeFilterCount > 0 && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Activity</DialogTitle>
            <DialogDescription>
              Select filters to narrow down the activity feed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Date Filter */}
            <div>
              <Label className="mb-3 block">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'week', label: 'Last 7 Days' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setDateFilter(id as any)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                      ${dateFilter === id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{label}</span>
                      {dateFilter === id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <Label className="mb-3 block">Activity Types</Label>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${selectedTypes.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      {selectedTypes.includes(type) && <Check className="w-3 h-3" />}
                      <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={() => setShowFilterModal(false)}>
              <Check className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
