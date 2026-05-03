import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Bell, User, Plus, Clock, Users, DollarSign, Utensils, Trash2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant, type Table } from '../../context/RestaurantContext';
import { toast } from 'sonner';

const statusColors = {
  free: 'bg-status-free border-status-free text-white',
  seated: 'bg-status-seated border-status-seated text-white',
  // `ordered` uses a light accent background; use dark text for contrast in light theme.
  ordered: 'bg-status-ordered border-status-ordered text-accent-foreground',
  ready: 'bg-status-ready border-status-ready text-white',
  bill: 'bg-status-bill border-status-bill text-white',
  cleaning: 'bg-muted border-muted-foreground text-muted-foreground',
};

const statusLabels = {
  free: 'Free',
  seated: 'Seated',
  ordered: 'Ordered',
  ready: 'Ready',
  bill: 'Bill Pending',
  cleaning: 'Cleaning',
};

type DemoNotificationType = 'order' | 'kitchen' | 'payment' | 'info';

type DemoNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: DemoNotificationType;
  isRead: boolean;
};

export default function TableMap() {
  const { user, logout } = useAuth();
  const { tables, notifications, addNotification, markAllNotificationsRead, seatGuests, markCleaningDone, requestBill } = useRestaurant();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const filteredTables = selectedSection === 'all'
    ? tables
    : tables.filter(t => t.section === selectedSection);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleSeatGuests = () => {
    if (selectedTable) {
      seatGuests(selectedTable.id, user?.name ?? 'Waiter', user?.name?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? 'WT');
      toast.success(`Seated guests at ${selectedTable.number}`);
      navigate('/waiter/order', { state: { table: selectedTable } });
    }
  };

  const handleViewOrder = () => {
    if (selectedTable) {
      navigate('/waiter/order', { state: { table: selectedTable, existing: true } });
    }
  };

  const handleRequestBill = () => {
    if (selectedTable) {
      requestBill(selectedTable.id, user?.name ?? 'Waiter');
      navigate('/waiter/bill', { state: { table: selectedTable } });
    }
  };

  const waiterNotifications = notifications.filter(n => n.audience === 'waiter' || n.audience === 'all');
  const unreadCount = waiterNotifications.filter(n => !n.isRead).length;

  const typeBadge = (type: DemoNotificationType) => {
    switch (type) {
      case 'kitchen':
        return 'bg-success/15 text-success';
      case 'payment':
        return 'bg-destructive/10 text-destructive';
      case 'order':
        return 'bg-warning/20 text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const addDemoNotification = () => {
    const samples: Array<{ title: string; message: string; type: DemoNotificationType }> = [
      { title: 'Kitchen update', message: 'Ticket moved to Preparing.', type: 'kitchen' },
      { title: 'Order note', message: '“Less spicy” note added to a table.', type: 'order' },
      { title: 'Payment', message: 'Mobile payment received for T-08.', type: 'payment' },
      { title: 'Info', message: 'Peak hour: prioritize seated tables.', type: 'info' },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    addNotification({
      title: pick.title,
      message: pick.message,
      time: Date.now(),
      type: pick.type,
      isRead: false,
      audience: 'waiter',
    });
  };

  const markAllRead = () => {
    markAllNotificationsRead('waiter');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top App Bar */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate sm:whitespace-normal sm:overflow-visible">
              Karachi – Clifton Branch
            </h1>
            <p className="text-sm text-muted-foreground truncate sm:whitespace-normal sm:overflow-visible">
              Waiter: {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Notifications">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-destructive text-destructive-foreground rounded-full text-xs font-semibold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[22rem] p-0 overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addDemoNotification}
                      className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground inline-flex items-center gap-1"
                      aria-label="Add demo notification"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Demo
                    </button>
                    <button
                      onClick={markAllRead}
                      className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground inline-flex items-center gap-1"
                      aria-label="Mark all as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Read
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-auto">
                  {waiterNotifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {waiterNotifications.map(n => (
                        <li key={n.id} className={`p-3 ${n.isRead ? 'bg-card' : 'bg-muted/40'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeBadge(n.type)}`}>
                                  {n.type.toUpperCase()}
                                </span>
                                <p className="font-semibold text-sm text-foreground truncate">{n.title}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(n.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.isRead && <span className="mt-1 w-2 h-2 rounded-full bg-destructive" aria-label="Unread" />}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Section Filters */}
        <aside className="bg-card border-b lg:border-b-0 lg:border-r border-border p-3 sm:p-4 lg:w-48 overflow-x-visible">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3 hidden lg:block">Sections</h2>
          <nav className="flex flex-wrap lg:flex-col gap-1 sm:gap-2" role="navigation" aria-label="Floor sections">
            {[
              { id: 'all', label: 'All Tables', icon: Utensils },
              { id: 'indoor', label: 'Indoor', icon: null },
              { id: 'outdoor', label: 'Outdoor', icon: null },
              { id: 'bar', label: 'Bar', icon: null },
              { id: 'private', label: 'Private Room', icon: null },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedSection(id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left
                  ${selectedSection === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content - Floor Map */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-3 sm:gap-4 text-sm">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${statusColors[status as keyof typeof statusColors].split(' ')[0]}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Table Grid (original layout) */}
          <div className="relative bg-muted/30 rounded-xl p-3 sm:p-6 lg:p-8 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`
                    relative p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border-2 transition-all transform active:scale-95 sm:hover:scale-105
                    ${statusColors[table.status]}
                    ${selectedTable?.id === table.id ? 'ring-2 sm:ring-4 ring-primary ring-offset-1 sm:ring-offset-2' : ''}
                    focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-primary focus:ring-offset-1 sm:focus:ring-offset-2
                  `}
                  aria-label={`${table.number}, ${table.seats} seats, ${statusLabels[table.status]}`}
                >
                  <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                      {table.number}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs sm:text-sm opacity-90">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{table.seats}</span>
                    </div>
                    {table.waiter && (
                      <div className="text-xs opacity-75">
                        {table.waiter}
                      </div>
                    )}
                    {table.elapsedTime !== undefined && (
                      <div className="flex items-center justify-center gap-1 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>{table.elapsedTime}m</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Right Panel - Table Details */}
        {selectedTable && (
          <aside className="bg-card border-t lg:border-t-0 lg:border-l border-border p-4 sm:p-6 lg:w-80 xl:w-96">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{selectedTable.number}</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedTable.seats} seats</span>
                  </div>
                  <div>
                    <Badge variant="outline" className={statusColors[selectedTable.status]}>
                      {statusLabels[selectedTable.status]}
                    </Badge>
                  </div>
                  {selectedTable.waiter && (
                    <div>Waiter: {selectedTable.waiter}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {selectedTable.status === 'free' && (
                  <Button onClick={handleSeatGuests} className="w-full" size="lg">
                    <Users className="w-5 h-5 mr-2" />
                    Seat Guests
                  </Button>
                )}

                {selectedTable.status === 'seated' && (
                  <Button onClick={handleSeatGuests} className="w-full" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Start New Order
                  </Button>
                )}

                {(selectedTable.status === 'ordered' || selectedTable.status === 'bill') && (
                  <Button onClick={handleViewOrder} variant="outline" className="w-full" size="lg">
                    <Utensils className="w-5 h-5 mr-2" />
                    View Order
                  </Button>
                )}

                {selectedTable.status === 'ordered' && (
                  <Button onClick={handleRequestBill} className="w-full" size="lg">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Request Bill
                  </Button>
                )}

                {selectedTable.status === 'bill' && (
                  <Button onClick={handleRequestBill} className="w-full" size="lg">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Process Payment
                  </Button>
                )}

                {selectedTable.status === 'cleaning' && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      markCleaningDone(selectedTable.id, user?.name ?? 'Staff');
                      toast.success(`${selectedTable.number} is now free`);
                      setSelectedTable(null);
                    }}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Mark Cleaning Done
                  </Button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/waiter/order', { state: { walkIn: true } })}
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full shadow-lg
          border-4 border-background hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2"
        aria-label="New walk-in order"
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
}
