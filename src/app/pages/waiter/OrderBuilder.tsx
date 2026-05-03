import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Search, ArrowLeft, Send, Save, Percent, Plus, Minus, Trash2, StickyNote, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const categories = ['All', 'Starters', 'Mains', 'Breads', 'Drinks', 'Desserts'];

export default function OrderBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const table = location.state?.table;
  const existing = location.state?.existing;

  const { menu, getActiveOrderForTable, startOrResumeOrder, upsertOrderItem, removeOrderItem, setOrderNotes, sendOrderToKitchen } = useRestaurant();
  const waiterName = 'Waiter';
  const tableId: string | null = table?.id ?? null;
  const tableNumber: string = table?.number ?? 'Walk-in';
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Create/resume the order once per table/walk-in.
    const id = startOrResumeOrder(tableId, tableNumber, waiterName);
    setOrderId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, tableNumber]);

  const activeOrder = useMemo(() => {
    if (!tableId) return null;
    return getActiveOrderForTable(tableId);
  }, [getActiveOrderForTable, tableId]);

  const orderItems = activeOrder?.items ?? [];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [orderNotes, setOrderNotesLocal] = useState('');

  // Discount state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ percent: number; reason: string } | null>(null);

  // Draft state
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (menuItem: any) => {
    if (!orderId) return;
    upsertOrderItem(orderId, menuItem, 1);
    toast.success(`Added ${menuItem.name}`);
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const menuItem = menu.find(m => m.id === menuItemId);
    if (!menuItem) return;
    if (!orderId) return;
    upsertOrderItem(orderId, menuItem, delta);
  };

  const handleRemoveItem = (menuItemId: string) => {
    const item = orderItems.find(i => i.menuItemId === menuItemId);
    if (!orderId) return;
    removeOrderItem(orderId, menuItemId);
    if (item) toast(`Removed ${item.name}`);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * ((appliedDiscount?.percent ?? 0) / 100));
  };

  const calculateTax = () => {
    const discountedSubtotal = calculateSubtotal() - calculateDiscountAmount();
    return Math.round(discountedSubtotal * 0.13);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount() + calculateTax();
  };

  const handleApplyDiscount = () => {
    if (discountPercent < 0 || discountPercent > 100) {
      toast.error('Discount must be between 0-100%');
      return;
    }
    if (discountPercent > 20 && !discountReason) {
      toast.error('Reason required for discounts over 20%');
      return;
    }
    setAppliedDiscount({ percent: discountPercent, reason: discountReason });
    toast.success(`Applied ${discountPercent}% discount`);
    setShowDiscountModal(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountPercent(0);
    setDiscountReason('');
    toast('Discount removed');
  };

  const handleSaveDraft = () => {
    if (orderItems.length === 0) {
      toast.error('Cannot save empty order as draft');
      return;
    }
    setIsDraftSaved(true);
    toast.success('Order saved as draft ✓');
    setTimeout(() => navigate('/waiter/tables'), 300);
  };

  const handleSendToKitchen = () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    if (!orderId) return;
    sendOrderToKitchen(orderId);
    toast.success('Order sent to kitchen ✓');
    setTimeout(() => navigate('/waiter/tables'), 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/waiter/tables')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Back to table map"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate sm:whitespace-normal sm:overflow-visible">
                {table ? table.number : 'Walk-in Order'}
              </h1>
              {table && (
                <p className="text-sm text-muted-foreground truncate sm:whitespace-normal sm:overflow-visible">
                  {table.seats} guests
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Menu Section - Left */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredMenu.map(item => (
                <div
                  key={item.id}
                  className={`bg-card border border-border rounded-xl p-4 transition-all hover:shadow-md
                    ${!item.inStock ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                      <div className="flex gap-1 mb-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-lg font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        Rs. {item.price}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      disabled={!item.inStock}
                      className="ml-2"
                    >
                      {item.inStock ? <Plus className="w-4 h-4" /> : 'Out'}
                    </Button>
                  </div>
                  {!item.inStock && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Sold out today
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {filteredMenu.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items found</p>
              </div>
            )}
          </div>
        </main>

        {/* Order Summary - Right */}
        <aside className="bg-card border-t lg:border-t-0 lg:border-l border-border lg:w-96 xl:w-[28rem] flex flex-col">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {orderItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No items added yet</p>
                <p className="text-sm text-muted-foreground">Tap a dish to start</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orderItems.map(item => (
                  <div key={item.menuItemId} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.modifiers.join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        Rs. {item.price * item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.menuItemId)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Actions */}
          <div className="border-t border-border p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="space-y-2 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">Rs. {calculateSubtotal()}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-success">
                  <span>Discount ({appliedDiscount.percent}%)</span>
                  <span className="font-semibold">- Rs. {calculateDiscountAmount()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (13%)</span>
                <span className="font-semibold">Rs. {calculateTax()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">Rs. {calculateTotal()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowNotes(!showNotes)}>
                <StickyNote className="w-4 h-4 mr-2" />
                Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowDiscountModal(true)}
              >
                <Percent className="w-4 h-4 mr-2" />
                {appliedDiscount ? `Discount ${appliedDiscount.percent}%` : 'Discount'}
              </Button>
            </div>

            {appliedDiscount && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    Discount {appliedDiscount.percent}% applied
                    {appliedDiscount.reason && <span className="text-muted-foreground"> - {appliedDiscount.reason}</span>}
                  </span>
                </div>
                <button onClick={handleRemoveDiscount} className="text-destructive hover:text-destructive/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showNotes && (
              <div className="space-y-2">
                <Input
                  value={orderNotes}
                  onChange={(e) => {
                    setOrderNotesLocal(e.target.value);
                    if (orderId) setOrderNotes(orderId, e.target.value);
                  }}
                  placeholder="Add kitchen note (e.g., less spicy, allergy)"
                />
              </div>
            )}

            <Button
              onClick={handleSendToKitchen}
              disabled={orderItems.length === 0}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Send to Kitchen
            </Button>

            <Button variant="outline" className="w-full" onClick={handleSaveDraft}>
              <Save className="w-5 h-5 mr-2" />
              {isDraftSaved ? 'Draft Saved ✓' : 'Save as Draft'}
            </Button>
          </div>
        </aside>
      </div>

      {/* Discount Modal */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Enter discount percentage. Discounts over 20% require manager approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="discount-percent">Discount Percentage</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="discount-percent"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current discount: Rs. {Math.round(calculateSubtotal() * (discountPercent / 100))}
              </p>
            </div>

            <div>
              <Label htmlFor="discount-reason">Reason (required for {'>'}20%)</Label>
              <Input
                id="discount-reason"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="e.g., VIP customer, complaint resolution"
                className="mt-2"
              />
            </div>

            {discountPercent > 20 && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  Discounts over 20% require manager approval. A notification will be sent to the manager.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDiscountModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyDiscount}>
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
