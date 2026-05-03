import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, Clock, AlertCircle, Check } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { toast } from 'sonner';

export default function TicketDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, markTicketReady, reportKitchenIssue } = useRestaurant();
  const ticketFromNav = location.state?.ticket;
  const ticket = useMemo(() => {
    if (ticketFromNav?.id) return tickets.find(t => t.id === ticketFromNav.id) ?? ticketFromNav;
    return ticketFromNav ?? tickets[0];
  }, [ticketFromNav, tickets]);

  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/kitchen')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Back to KDS"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Order {ticket.orderNumber} • {ticket.tableNumber}
            </h1>
            <p className="text-sm text-muted-foreground">Waiter: {ticket.waiterName}</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Timer */}
          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
              <p className="text-4xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {String(Math.floor((Date.now() - ticket.createdAt) / 60000)).padStart(2, '0')}:
                {String(Math.floor(((Date.now() - ticket.createdAt) % 60000) / 1000)).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Items ({ticket.items.length})</h2>
            <div className="space-y-4">
              {ticket.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id={`item-${idx}`}
                    className="mt-1"
                    checked={checked[idx] ?? false}
                    onCheckedChange={(v) => setChecked(prev => ({ ...prev, [idx]: v === true }))}
                  />
                  <div className="flex-1">
                    <label htmlFor={`item-${idx}`} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{item.quantity}×</Badge>
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.modifiers.join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-warning/20 rounded">
                          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium">{item.notes}</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                reportKitchenIssue(ticket.id, 'Kitchen', 'Missing ingredient / substitution needed');
                toast('Issue reported to manager');
              }}
            >
              Report Issue
            </Button>
            <Button
              className="flex-1 h-12"
              size="lg"
              onClick={() => {
                markTicketReady(ticket.id, 'Kitchen');
                toast.success('Marked ready');
                setTimeout(() => navigate('/kitchen'), 300);
              }}
            >
              <Check className="w-5 h-5 mr-2" />
              Mark All Ready
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
