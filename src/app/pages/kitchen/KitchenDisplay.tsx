import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Clock, AlertCircle, Volume2, VolumeX, User, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { toast } from 'sonner';

const priorityColors = {
  normal: 'bg-success border-success',
  vip: 'bg-warning border-warning',
  late: 'bg-destructive border-destructive animate-pulse',
};

const priorityLabels = {
  normal: '🟢 Normal',
  vip: '🟡 VIP',
  late: '🔴 Late',
};

export default function KitchenDisplay() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { tickets, tickMinute, resetDemo, startCooking, markTicketReady } = useRestaurant();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string>('all');

  // Auto-enable dark mode for kitchen display
  useEffect(() => {
    const previousTheme = theme;
    setTheme('dark');

    return () => {
      // Restore previous theme when leaving kitchen
      setTheme(previousTheme);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tickMinute();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const newTickets = tickets.filter(t => t.status === 'new');
  const preparingTickets = tickets.filter(t => t.status === 'preparing');
  const readyTickets = tickets.filter(t => t.status === 'ready');

  const avgPrepTime = Math.floor(
    tickets.reduce((sum, t) => sum + Math.floor((Date.now() - t.createdAt) / 60000), 0) / (tickets.length || 1)
  );

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <div
      className={`bg-card border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer
        ${priorityColors[ticket.priority]}
      `}
      onClick={() => navigate('/kitchen/ticket', { state: { ticket } })}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {ticket.orderNumber}
            </h3>
            <p className="text-sm opacity-90">{ticket.tableNumber}</p>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Clock className="w-4 h-4" />
            <span className={Math.floor((Date.now() - ticket.createdAt) / 60000) >= 15 ? 'font-bold' : ''}>
              {String(Math.floor((Date.now() - ticket.createdAt) / 60000)).padStart(2, '0')}:
              {String(Math.floor(((Date.now() - ticket.createdAt) % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {ticket.items.map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.quantity}×
                </Badge>
                <span className="font-medium">{item.name}</span>
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="text-xs opacity-75 ml-10">{item.modifiers.join(', ')}</p>
              )}
              {item.notes && (
                <div className="flex items-start gap-1 ml-10 mt-1 text-xs bg-warning/20 p-1 rounded">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{item.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-current/20">
          <span className="text-xs opacity-75">Waiter: {ticket.waiterName}</span>
          {ticket.status === 'new' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                startCooking(ticket.id, user?.name ?? 'Kitchen');
                toast.success(`Started ${ticket.orderNumber}`);
              }}
            >
              Start Cooking
            </Button>
          )}
          {ticket.status === 'preparing' && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                markTicketReady(ticket.id, user?.name ?? 'Kitchen');
                toast.success(`Ready: ${ticket.orderNumber}`);
              }}
            >
              Mark Ready
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kitchen Display System</h1>
            <p className="text-sm text-muted-foreground">Evening Shift • Cook: {user?.name}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
              <Clock className="w-4 h-4" />
              <span>Avg: <span className="font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {avgPrepTime}m
              </span></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">{tickets.filter(t => t.priority === 'late').length}</span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                resetDemo();
                toast('Demo reset');
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Reset demo data"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Settings"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* New Column */}
          <div className="space-y-3">
            <div className="bg-info text-white px-4 py-2 rounded-lg">
              <h2 className="font-semibold">New ({newTickets.length})</h2>
            </div>
            <div className="space-y-3">
              {newTickets.length === 0 ? (
                <div className="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                  No new tickets
                </div>
              ) : (
                newTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="space-y-3">
            <div className="bg-warning text-white px-4 py-2 rounded-lg">
              <h2 className="font-semibold">Preparing ({preparingTickets.length})</h2>
            </div>
            <div className="space-y-3">
              {preparingTickets.length === 0 ? (
                <div className="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                  No tickets in progress
                </div>
              ) : (
                preparingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="space-y-3">
            <div className="bg-success text-white px-4 py-2 rounded-lg">
              <h2 className="font-semibold">Ready ({readyTickets.length})</h2>
            </div>
            <div className="space-y-3">
              {readyTickets.length === 0 ? (
                <div className="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                  No ready orders
                </div>
              ) : (
                readyTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-2xl font-bold mb-2">Kitchen is clear!</h3>
            <p className="text-muted-foreground">No active tickets — relax</p>
          </div>
        )}
      </main>
    </div>
  );
}
