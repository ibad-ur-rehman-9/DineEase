import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, CreditCard, Smartphone, Wallet, Users, Check, Printer, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurant, type PaymentMethod } from '../../context/RestaurantContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export default function BillPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const table = location.state?.table;
  const { getActiveOrderForTable, processPayment } = useRestaurant();

  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeOrder = table?.id ? getActiveOrderForTable(table.id) : null;
  const items = activeOrder?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round(taxableAmount * 0.13);
  const tipAmount = Math.round((taxableAmount + tax) * (tip / 100));
  const grandTotal = taxableAmount + tax + tipAmount;

  const handleConfirmPayment = () => {
    setShowConfirmDialog(true);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setShowConfirmDialog(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    toast.success('Paid ✓ Receipt sent');

    if (activeOrder) {
      processPayment(activeOrder.id, 'Waiter', paymentMethod, discount, tip);
    }

    setTimeout(() => navigate('/waiter/tables'), 500);
  };

  const tipOptions = [
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: 'Custom', value: 0 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate('/waiter/tables')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Back to table map"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate sm:whitespace-normal sm:overflow-visible">
              Bill & Payment - {table?.number || 'Walk-in'}
            </h1>
            <p className="text-sm text-muted-foreground truncate sm:whitespace-normal sm:overflow-visible">
              {table?.seats || 2} guests • Waiter: Muhammad Mustafa
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Bill Items - Left */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Order Items</h2>

              {/* Items List */}
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <Badge variant="secondary" className="text-xs">×{item.quantity}</Badge>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      Rs. {item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    No items found for this table yet.
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Discount
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-24"
                    placeholder="0"
                  />
                  <span className="flex items-center text-muted-foreground">%</span>
                  {discount > 10 && (
                    <Badge variant="outline" className="ml-auto">Manager approval required</Badge>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-border text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rs. {subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({discount}%)</span>
                    <span>- Rs. {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (13%)</span>
                  <span className="font-semibold">Rs. {tax}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Payment Section - Right */}
        <aside className="bg-card border-t lg:border-t-0 lg:border-l border-border lg:w-96 xl:w-[28rem] flex flex-col">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
            {/* Tip Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Add Tip
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tipOptions.map(option => (
                  <button
                    key={option.label}
                    onClick={() => setTip(option.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all
                      ${tip === option.value
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-card hover:bg-muted'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {tip === 0 && (
                <Input
                  type="number"
                  min="0"
                  placeholder="Custom tip amount"
                  className="mt-2"
                  onChange={(e) => setTip(Number(e.target.value))}
                />
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${paymentMethod === 'cash'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-muted'
                    }
                  `}
                >
                  <Wallet className="w-6 h-6" />
                  <span className="text-sm font-medium">Cash</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${paymentMethod === 'card'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-muted'
                    }
                  `}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-medium">Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${paymentMethod === 'mobile'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-muted'
                    }
                  `}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-sm font-medium">Mobile</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('split')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${paymentMethod === 'split'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-muted'
                    }
                  `}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">Split</span>
                </button>
              </div>
            </div>

            {/* Receipt Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="print"
                  checked={printReceipt}
                  onCheckedChange={(checked) => setPrintReceipt(checked === true)}
                />
                <label htmlFor="print" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email"
                  checked={emailReceipt}
                  onCheckedChange={(checked) => setEmailReceipt(checked === true)}
                />
                <label htmlFor="email" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email Receipt
                </label>
              </div>
            </div>
          </div>

          {/* Grand Total & Confirm */}
          <div className="border-t border-border p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span>Grand Total</span>
              <span className="text-primary">Rs. {grandTotal}</span>
            </div>

            <Button
              onClick={handleConfirmPayment}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirm Payment & Close Table
            </Button>
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment for {table?.number}?</DialogTitle>
            <DialogDescription>
              This will close the table and cannot be undone after confirming.
              Grand Total: Rs. {grandTotal}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-semibold">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
}
