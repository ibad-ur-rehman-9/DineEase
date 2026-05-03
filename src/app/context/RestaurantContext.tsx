import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TableSection = 'indoor' | 'outdoor' | 'bar' | 'private';
export type TableStatus = 'free' | 'seated' | 'ordered' | 'ready' | 'bill' | 'cleaning';

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'split';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'seat'
  | 'order_sent'
  | 'kitchen_start'
  | 'kitchen_ready'
  | 'bill_requested'
  | 'payment'
  | 'issue'
  | 'export'
  | 'shift';

export type NotificationType = 'order' | 'kitchen' | 'payment' | 'info' | 'manager';

export interface Table {
  id: string;
  number: string;
  seats: number;
  status: TableStatus;
  waiterInitials?: string;
  elapsedMinutes?: number;
  section: TableSection;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string | null;
  tableNumber: string;
  createdAt: number;
  updatedAt: number;
  waiterName: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  items: OrderItem[];
  notes?: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableId: string | null;
  tableNumber: string;
  waiterName: string;
  items: Array<{ name: string; quantity: number; modifiers?: string[]; notes?: string }>;
  status: 'new' | 'preparing' | 'ready';
  priority: 'normal' | 'vip' | 'late';
  createdAt: number;
}

export interface ActivityEntry {
  id: string;
  staff: string;
  action: string;
  time: number;
  type: ActivityType;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  time: number;
  type: NotificationType;
  isRead: boolean;
  audience: 'waiter' | 'kitchen' | 'manager' | 'all';
}

type RestaurantState = {
  tables: Table[];
  menu: MenuItem[];
  orders: Record<string, Order>;
  tickets: Ticket[];
  activity: ActivityEntry[];
  notifications: DemoNotification[];
  nextOrderNumber: number;
};

const STORAGE_KEY = 'dineease-demo-state-v1';

function now() {
  return Date.now();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function defaultState(): RestaurantState {
  const nowTime = now();
  const hourAgo = nowTime - 60 * 60 * 1000;
  const twoHoursAgo = nowTime - 2 * 60 * 60 * 1000;

  const baseTables: Table[] = [
    { id: 't1', number: 'T-01', seats: 4, status: 'free', section: 'indoor' },
    { id: 't2', number: 'T-02', seats: 2, status: 'seated', waiterInitials: 'MM', elapsedMinutes: 12, section: 'indoor' },
    { id: 't3', number: 'T-03', seats: 6, status: 'ordered', waiterInitials: 'MM', elapsedMinutes: 25, section: 'indoor' },
    { id: 't4', number: 'T-04', seats: 4, status: 'free', section: 'indoor' },
    { id: 't5', number: 'T-05', seats: 2, status: 'bill', waiterInitials: 'MM', elapsedMinutes: 55, section: 'indoor' },
    { id: 't6', number: 'T-06', seats: 4, status: 'cleaning', section: 'indoor' },
    { id: 't7', number: 'T-07', seats: 8, status: 'seated', waiterInitials: 'IA', elapsedMinutes: 8, section: 'outdoor' },
    { id: 't8', number: 'T-08', seats: 4, status: 'ordered', waiterInitials: 'IA', elapsedMinutes: 18, section: 'outdoor' },
    { id: 't9', number: 'T-09', seats: 6, status: 'free', section: 'outdoor' },
    { id: 't10', number: 'T-10', seats: 2, status: 'cleaning', section: 'outdoor' },
    { id: 't11', number: 'B-01', seats: 4, status: 'seated', waiterInitials: 'MM', elapsedMinutes: 35, section: 'bar' },
    { id: 't12', number: 'B-02', seats: 2, status: 'ordered', waiterInitials: 'IA', elapsedMinutes: 15, section: 'bar' },
    { id: 't13', number: 'P-01', seats: 10, status: 'free', section: 'private' },
    { id: 't14', number: 'P-02', seats: 8, status: 'seated', waiterInitials: 'MM', elapsedMinutes: 5, section: 'private' },
  ];

  const menu: MenuItem[] = [
    { id: 'm1', name: 'Chicken Biryani', price: 850, category: 'Mains', tags: ['Spicy', 'Bestseller'], inStock: true },
    { id: 'm2', name: 'Mutton Karahi', price: 1200, category: 'Mains', tags: ['Spicy', 'Premium'], inStock: true },
    { id: 'm3', name: 'Seekh Kebab (6pcs)', price: 600, category: 'Starters', tags: ['Bestseller'], inStock: true },
    { id: 'm4', name: 'Chicken Tikka (Leg)', price: 700, category: 'Starters', tags: ['Grilled'], inStock: true },
    { id: 'm5', name: 'Coke 500ml', price: 150, category: 'Drinks', tags: [], inStock: true },
    { id: 'm6', name: 'Fresh Lime Soda', price: 200, category: 'Drinks', tags: ['Refreshing'], inStock: true },
    { id: 'm7', name: 'Gulab Jamun (2pcs)', price: 300, category: 'Desserts', tags: ['Sweet'], inStock: true },
    { id: 'm8', name: 'Kheer (Bowl)', price: 250, category: 'Desserts', tags: ['Sweet'], inStock: true },
    { id: 'm9', name: 'Daal Makhani', price: 550, category: 'Mains', tags: ['Veg', 'Creamy'], inStock: true },
    { id: 'm10', name: 'Butter Naan', price: 50, category: 'Breads', tags: [], inStock: true },
    { id: 'm11', name: 'Garlic Naan', price: 70, category: 'Breads', tags: ['Garlic'], inStock: true },
    { id: 'm12', name: 'Raita', price: 100, category: 'Sides', tags: ['Cooling'], inStock: true },
    { id: 'm13', name: 'Green Salad', price: 150, category: 'Sides', tags: ['Healthy'], inStock: true },
    { id: 'm14', name: 'Mango Lassi', price: 250, category: 'Drinks', tags: ['Popular'], inStock: true },
    { id: 'm15', name: 'Prawn Biryani', price: 1400, category: 'Mains', tags: ['Seafood', 'Premium'], inStock: true },
  ];

  const activity: ActivityEntry[] = [
    { id: 'a1', staff: 'Sarah Ahmed', action: 'Opened morning shift at 10:00 AM', time: twoHoursAgo, type: 'shift' },
    { id: 'a2', staff: 'Ahmad Khan', action: 'Logged in as Kitchen Staff', time: twoHoursAgo + 5 * 60 * 1000, type: 'login' },
    { id: 'a3', staff: 'Muhammad Mustafa', action: 'Logged in as Waiter', time: twoHoursAgo + 10 * 60 * 1000, type: 'login' },
    { id: 'a4', staff: 'Muhammad Mustafa', action: 'Seated 4 guests at T-07 (Outdoor)', time: twoHoursAgo + 15 * 60 * 1000, type: 'seat' },
    { id: 'a5', staff: 'Ibad Ali', action: 'Logged in as Multi-role', time: twoHoursAgo + 20 * 60 * 1000, type: 'login' },
    { id: 'a6', staff: 'Muhammad Mustafa', action: 'Sent Order #135 to kitchen (T-07)', time: twoHoursAgo + 25 * 60 * 1000, type: 'order_sent' },
    { id: 'a7', staff: 'Ahmad Khan', action: 'Started cooking Order #135', time: twoHoursAgo + 26 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a8', staff: 'Sarah Ahmed', action: 'Exported daily sales report', time: twoHoursAgo + 30 * 60 * 1000, type: 'export' },
    { id: 'a9', staff: 'Muhammad Mustafa', action: 'Seated 2 guests at T-02', time: twoHoursAgo + 40 * 60 * 1000, type: 'seat' },
    { id: 'a10', staff: 'Muhammad Mustafa', action: 'Sent Order #136 to kitchen (T-02)', time: twoHoursAgo + 50 * 60 * 1000, type: 'order_sent' },
    { id: 'a11', staff: 'Ahmad Khan', action: 'Started cooking Order #136', time: twoHoursAgo + 51 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a12', staff: 'Ahmad Khan', action: 'Order #135 is ready for pickup', time: hourAgo + 5 * 60 * 1000, type: 'kitchen_ready' },
    { id: 'a13', staff: 'Muhammad Mustafa', action: 'Processed payment Rs. 3,450 for T-07', time: hourAgo + 10 * 60 * 1000, type: 'payment' },
    { id: 'a14', staff: 'Ibad Ali', action: 'Seated 6 guests at T-03', time: hourAgo + 15 * 60 * 1000, type: 'seat' },
    { id: 'a15', staff: 'Ibad Ali', action: 'Sent Order #137 to kitchen (T-03)', time: hourAgo + 20 * 60 * 1000, type: 'order_sent' },
    { id: 'a16', staff: 'Ahmad Khan', action: 'Started cooking Order #137', time: hourAgo + 21 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a17', staff: 'Ahmad Khan', action: 'Order #136 is ready for pickup', time: hourAgo + 30 * 60 * 1000, type: 'kitchen_ready' },
    { id: 'a18', staff: 'Muhammad Mustafa', action: 'Requested bill for T-02', time: hourAgo + 35 * 60 * 1000, type: 'bill_requested' },
    { id: 'a19', staff: 'Muhammad Mustafa', action: 'Processed payment Rs. 2,100 for T-02 (10% discount applied)', time: hourAgo + 40 * 60 * 1000, type: 'payment' },
    { id: 'a20', staff: 'Sarah Ahmed', action: 'Reviewed high priority alert', time: hourAgo + 45 * 60 * 1000, type: 'issue' },
    { id: 'a21', staff: 'Ibad Ali', action: 'Seated 4 guests at T-08', time: hourAgo + 50 * 60 * 1000, type: 'seat' },
    { id: 'a22', staff: 'Ibad Ali', action: 'Sent Order #138 to kitchen (T-08)', time: hourAgo + 55 * 60 * 1000, type: 'order_sent' },
    { id: 'a23', staff: 'Ahmad Khan', action: 'Started cooking Order #138', time: hourAgo + 56 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a24', staff: 'Ahmad Khan', action: 'Order #137 is ready for pickup', time: nowTime - 45 * 60 * 1000, type: 'kitchen_ready' },
    { id: 'a25', staff: 'Ibad Ali', action: 'Seated 4 guests at B-01 (Bar)', time: nowTime - 40 * 60 * 1000, type: 'seat' },
    { id: 'a26', staff: 'Muhammad Mustafa', action: 'Requested bill for T-03', time: nowTime - 35 * 60 * 1000, type: 'bill_requested' },
    { id: 'a27', staff: 'Muhammad Mustafa', action: 'Processed payment Rs. 5,200 for T-03', time: nowTime - 30 * 60 * 1000, type: 'payment' },
    { id: 'a28', staff: 'Ibad Ali', action: 'Sent Order #139 to kitchen (B-01)', time: nowTime - 25 * 60 * 1000, type: 'order_sent' },
    { id: 'a29', staff: 'Ahmad Khan', action: 'Started cooking Order #139', time: nowTime - 24 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a30', staff: 'Sarah Ahmed', action: 'Exported staff activity report', time: nowTime - 20 * 60 * 1000, type: 'export' },
    { id: 'a31', staff: 'Ibad Ali', action: 'Seated 2 guests at B-02', time: nowTime - 18 * 60 * 1000, type: 'seat' },
    { id: 'a32', staff: 'Ibad Ali', action: 'Sent Order #140 to kitchen (B-02)', time: nowTime - 15 * 60 * 1000, type: 'order_sent' },
    { id: 'a33', staff: 'Ahmad Khan', action: 'Started cooking Order #140', time: nowTime - 14 * 60 * 1000, type: 'kitchen_start' },
    { id: 'a34', staff: 'Muhammad Mustafa', action: 'Seated 8 guests at P-02 (Private)', time: nowTime - 10 * 60 * 1000, type: 'seat' },
    { id: 'a35', staff: 'Ahmad Khan', action: 'Order #138 is ready for pickup', time: nowTime - 8 * 60 * 1000, type: 'kitchen_ready' },
    { id: 'a36', staff: 'Sarah Ahmed', action: 'Generated sales report for today', time: nowTime - 5 * 60 * 1000, type: 'export' },
  ];

  const notifications: DemoNotification[] = [
    {
      id: 'n1',
      title: 'Order Ready',
      message: 'Order #142 is ready for pickup (Table T-03). Waiting since 12:30 PM',
      time: nowTime - 2 * 60 * 1000,
      type: 'kitchen',
      isRead: false,
      audience: 'waiter',
    },
    {
      id: 'n2',
      title: 'Bill Requested',
      message: 'Table T-05 requested the bill. Customer waiting.',
      time: nowTime - 6 * 60 * 1000,
      type: 'payment',
      isRead: false,
      audience: 'waiter',
    },
    {
      id: 'n3',
      title: 'Manager Alert',
      message: 'Order #140 has been in kitchen for 25 minutes. Check status.',
      time: nowTime - 10 * 60 * 1000,
      type: 'manager',
      isRead: false,
      audience: 'manager',
    },
    {
      id: 'n4',
      title: 'Kitchen Update',
      message: 'Order #139 is now being prepared by Ahmad.',
      time: nowTime - 20 * 60 * 1000,
      type: 'kitchen',
      isRead: true,
      audience: 'all',
    },
    {
      id: 'n5',
      title: 'New Order',
      message: 'Walk-in order #141 received from the counter.',
      time: nowTime - 30 * 60 * 1000,
      type: 'order',
      isRead: true,
      audience: 'kitchen',
    },
    {
      id: 'n6',
      title: 'System Info',
      message: 'Daily backup completed successfully.',
      time: nowTime - 60 * 60 * 1000,
      type: 'info',
      isRead: true,
      audience: 'manager',
    },
  ];

  const orders: Record<string, Order> = {};
  const tickets: Ticket[] = [];

  // Helper to create an order
  const createOrder = (id: string, tableId: string, tableNum: string, status: Order['status'],
                       items: OrderItem[], timeOffset: number, waiter: string, notes?: string) => {
    orders[id] = {
      id,
      tableId,
      tableNumber: tableNum,
      createdAt: nowTime - timeOffset,
      updatedAt: nowTime - timeOffset + 5 * 60 * 1000,
      waiterName: waiter,
      status,
      items,
      notes,
    };
  };

  // Helper to create a ticket
  const createTicket = (id: string, orderId: string, orderNum: string, tableId: string, tableNum: string,
                        items: Ticket['items'], status: Ticket['status'], priority: Ticket['priority'],
                        timeOffset: number, waiter: string, estimatedMins: number) => {
    tickets.push({
      id,
      orderId,
      orderNumber: orderNum,
      tableId,
      tableNumber: tableNum,
      waiterName: waiter,
      items,
      status,
      priority,
      createdAt: nowTime - timeOffset,
      estimatedMinutes: estimatedMins,
      startedAt: status !== 'new' ? nowTime - timeOffset + 2 * 60 * 1000 : undefined,
    });
  };

  // Order 1: T-05 Bill pending (already in demo)
  const orderT5Id = uid('o');
  createOrder(orderT5Id, 't5', 'T-05', 'sent',
    [
      { menuItemId: 'm1', name: 'Chicken Biryani', price: 850, quantity: 2, modifiers: ['Extra spicy'], notes: 'No onions please' },
      { menuItemId: 'm5', name: 'Coke 500ml', price: 150, quantity: 2 },
      { menuItemId: 'm10', name: 'Butter Naan', price: 50, quantity: 2 },
    ], 25 * 60 * 1000, 'Muhammad Mustafa', 'No onions on biryani');

  createTicket(uid('k'), orderT5Id, '#142', 't5', 'T-05',
    [
      { name: 'Chicken Biryani', quantity: 2, modifiers: ['Extra spicy'], notes: 'No onions please' },
      { name: 'Coke 500ml', quantity: 2 },
      { name: 'Butter Naan', quantity: 2 },
    ], 'ready', 'normal', 25 * 60 * 1000, 'Mustafa', 20);

  // Order 2: T-03 - Large family order currently in kitchen
  const orderT3Id = uid('o');
  createOrder(orderT3Id, 't3', 'T-03', 'sent',
    [
      { menuItemId: 'm1', name: 'Chicken Biryani', price: 850, quantity: 3 },
      { menuItemId: 'm2', name: 'Mutton Karahi', price: 1200, quantity: 1 },
      { menuItemId: 'm3', name: 'Seekh Kebab (6pcs)', price: 600, quantity: 2 },
      { menuItemId: 'm10', name: 'Butter Naan', price: 50, quantity: 6 },
      { menuItemId: 'm6', name: 'Fresh Lime Soda', price: 200, quantity: 4 },
      { menuItemId: 'm12', name: 'Raita', price: 100, quantity: 2 },
    ], 30 * 60 * 1000, 'Ibad Ali', 'Family dinner - special occasion');

  createTicket(uid('k'), orderT3Id, '#143', 't3', 'T-03',
    [
      { name: 'Chicken Biryani', quantity: 3 },
      { name: 'Mutton Karahi', quantity: 1, notes: 'Medium spicy' },
      { name: 'Seekh Kebab (6pcs)', quantity: 2 },
      { name: 'Butter Naan', quantity: 6 },
      { name: 'Fresh Lime Soda', quantity: 4 },
      { name: 'Raita', quantity: 2 },
    ], 'preparing', 'normal', 30 * 60 * 1000, 'Ibad', 35);

  // Order 3: T-08 - Couple order currently cooking
  const orderT8Id = uid('o');
  createOrder(orderT8Id, 't8', 'T-08', 'sent',
    [
      { menuItemId: 'm2', name: 'Mutton Karahi', price: 1200, quantity: 1 },
      { menuItemId: 'm4', name: 'Chicken Tikka (Leg)', price: 700, quantity: 1 },
      { menuItemId: 'm11', name: 'Garlic Naan', price: 70, quantity: 2 },
      { menuItemId: 'm14', name: 'Mango Lassi', price: 250, quantity: 2 },
    ], 20 * 60 * 1000, 'Ibad Ali');

  createTicket(uid('k'), orderT8Id, '#144', 't8', 'T-08',
    [
      { name: 'Mutton Karahi', quantity: 1, notes: 'Extra gravy' },
      { name: 'Chicken Tikka (Leg)', quantity: 1 },
      { name: 'Garlic Naan', quantity: 2 },
      { name: 'Mango Lassi', quantity: 2 },
    ], 'preparing', 'normal', 20 * 60 * 1000, 'Ibad', 25);

  // Order 4: B-01 Bar order - preparing
  const orderB1Id = uid('o');
  createOrder(orderB1Id, 't11', 'B-01', 'sent',
    [
      { menuItemId: 'm3', name: 'Seekh Kebab (6pcs)', price: 600, quantity: 1 },
      { menuItemId: 'm4', name: 'Chicken Tikka (Leg)', price: 700, quantity: 1 },
      { menuItemId: 'm5', name: 'Coke 500ml', price: 150, quantity: 2 },
    ], 35 * 60 * 1000, 'Muhammad Mustafa');

  createTicket(uid('k'), orderB1Id, '#145', 't11', 'B-01',
    [
      { name: 'Seekh Kebab (6pcs)', quantity: 1 },
      { name: 'Chicken Tikka (Leg)', quantity: 1 },
      { name: 'Coke 500ml', quantity: 2 },
    ], 'preparing', 'normal', 35 * 60 * 1000, 'Mustafa', 20);

  // Order 5: B-02 New order just sent
  const orderB2Id = uid('o');
  createOrder(orderB2Id, 't12', 'B-02', 'sent',
    [
      { menuItemId: 'm9', name: 'Daal Makhani', price: 550, quantity: 1 },
      { menuItemId: 'm10', name: 'Butter Naan', price: 50, quantity: 2 },
      { menuItemId: 'm6', name: 'Fresh Lime Soda', price: 200, quantity: 1 },
    ], 15 * 60 * 1000, 'Ibad Ali');

  createTicket(uid('k'), orderB2Id, '#146', 't12', 'B-02',
    [
      { name: 'Daal Makhani', quantity: 1, notes: 'Less butter' },
      { name: 'Butter Naan', quantity: 2 },
      { name: 'Fresh Lime Soda', quantity: 1 },
    ], 'new', 'normal', 15 * 60 * 1000, 'Ibad', 15);

  // Order 6: Walk-in (no table) - already paid
  const walkInId = uid('o');
  createOrder(walkInId, null, 'Walk-in', 'paid',
    [
      { menuItemId: 'm3', name: 'Seekh Kebab (6pcs)', price: 600, quantity: 1 },
      { menuItemId: 'm5', name: 'Coke 500ml', price: 150, quantity: 1 },
    ], 50 * 60 * 1000, 'Muhammad Mustafa');

  // Paid orders for revenue history
  const paidOrders = [
    { items: [{ menuItemId: 'm1', name: 'Chicken Biryani', price: 850, quantity: 2 }, { menuItemId: 'm10', name: 'Butter Naan', price: 50, quantity: 2 }], timeOffset: 110 * 60 * 1000, table: 'T-07' },
    { items: [{ menuItemId: 'm2', name: 'Mutton Karahi', price: 1200, quantity: 1 }, { menuItemId: 'm11', name: 'Garlic Naan', price: 70, quantity: 2 }], timeOffset: 100 * 60 * 1000, table: 'T-02' },
    { items: [{ menuItemId: 'm1', name: 'Chicken Biryani', price: 850, quantity: 3 }, { menuItemId: 'm3', name: 'Seekh Kebab (6pcs)', price: 600, quantity: 1 }, { menuItemId: 'm6', name: 'Fresh Lime Soda', price: 200, quantity: 3 }], timeOffset: 90 * 60 * 1000, table: 'T-03' },
  ];

  paidOrders.forEach((po, idx) => {
    const id = uid('o');
    createOrder(id, null, po.table, 'paid', po.items, po.timeOffset, 'Muhammad Mustafa');
  });

  return {
    tables: baseTables,
    menu,
    orders,
    tickets,
    activity,
    notifications,
    nextOrderNumber: 147,
  };
}

function loadState(): RestaurantState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as RestaurantState;
    if (!parsed?.tables || !parsed?.menu) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState(state: RestaurantState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type RestaurantContextType = RestaurantState & {
  resetDemo: () => void;
  tickMinute: () => void;

  // Tables
  seatGuests: (tableId: string, waiterName: string, waiterInitials?: string) => void;
  markCleaningDone: (tableId: string, staffName: string) => void;
  requestBill: (tableId: string, staffName: string) => void;

  // Orders
  getActiveOrderForTable: (tableId: string) => Order | null;
  startOrResumeOrder: (tableId: string | null, tableNumber: string, waiterName: string) => string; // orderId
  upsertOrderItem: (orderId: string, item: MenuItem, delta: number) => void;
  removeOrderItem: (orderId: string, menuItemId: string) => void;
  setOrderNotes: (orderId: string, notes: string) => void;
  sendOrderToKitchen: (orderId: string, priority?: Ticket['priority']) => void;
  processPayment: (orderId: string, staffName: string, method: PaymentMethod, discountPct: number, tipPct: number) => void;

  // Kitchen
  startCooking: (ticketId: string, staffName: string) => void;
  markTicketReady: (ticketId: string, staffName: string) => void;
  reportKitchenIssue: (ticketId: string, staffName: string, message?: string) => void;

  // Manager / misc
  addActivity: (staff: string, action: string, type: ActivityType) => void;
  addNotification: (n: Omit<DemoNotification, 'id'>) => void;
  markAllNotificationsRead: (audience: DemoNotification['audience']) => void;
  exportCsv: (kind: 'activity' | 'orders' | 'tables' | 'tickets', staffName: string) => string;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RestaurantState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addActivity = (staff: string, action: string, type: ActivityType) => {
    setState(prev => ({
      ...prev,
      activity: [{ id: uid('a'), staff, action, time: now(), type }, ...prev.activity].slice(0, 300),
    }));
  };

  const addNotification = (n: Omit<DemoNotification, 'id'>) => {
    setState(prev => ({
      ...prev,
      notifications: [{ ...n, id: uid('n') }, ...prev.notifications].slice(0, 200),
    }));
  };

  const markAllNotificationsRead = (audience: DemoNotification['audience']) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.audience === audience || n.audience === 'all' ? { ...n, isRead: true } : n
      ),
    }));
  };

  const resetDemo = () => setState(defaultState());

  const tickMinute = () => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.status === 'free' ? t : { ...t, elapsedMinutes: (t.elapsedMinutes ?? 0) + 1 }
      ),
      tickets: prev.tickets.map(k => ({
        ...k,
        priority: (now() - k.createdAt) >= 20 * 60 * 1000 ? 'late' : k.priority,
      })),
    }));
  };

  const getActiveOrderForTable = (tableId: string) => {
    const match = Object.values(state.orders).find(o => o.tableId === tableId && (o.status === 'draft' || o.status === 'sent'));
    return match ?? null;
  };

  const startOrResumeOrder = (tableId: string | null, tableNumber: string, waiterName: string) => {
    const existing = tableId ? getActiveOrderForTable(tableId) : null;
    if (existing) return existing.id;

    const id = uid('o');
    setState(prev => ({
      ...prev,
      orders: {
        ...prev.orders,
        [id]: {
          id,
          tableId,
          tableNumber,
          createdAt: now(),
          updatedAt: now(),
          waiterName,
          status: 'draft',
          items: [],
        },
      },
    }));
    addActivity(waiterName, `Started order for ${tableNumber}`, 'seat');
    return id;
  };

  const upsertOrderItem = (orderId: string, item: MenuItem, delta: number) => {
    setState(prev => {
      const order = prev.orders[orderId];
      if (!order) return prev;
      const existing = order.items.find(i => i.menuItemId === item.id);
      const nextQty = Math.max(0, (existing?.quantity ?? 0) + delta);
      const nextItems =
        nextQty === 0
          ? order.items.filter(i => i.menuItemId !== item.id)
          : existing
            ? order.items.map(i => (i.menuItemId === item.id ? { ...i, quantity: nextQty } : i))
            : [...order.items, { menuItemId: item.id, name: item.name, price: item.price, quantity: nextQty }];

      return {
        ...prev,
        orders: {
          ...prev.orders,
          [orderId]: { ...order, items: nextItems, updatedAt: now() },
        },
      };
    });
  };

  const removeOrderItem = (orderId: string, menuItemId: string) => {
    setState(prev => {
      const order = prev.orders[orderId];
      if (!order) return prev;
      return {
        ...prev,
        orders: {
          ...prev.orders,
          [orderId]: { ...order, items: order.items.filter(i => i.menuItemId !== menuItemId), updatedAt: now() },
        },
      };
    });
  };

  const setOrderNotes = (orderId: string, notes: string) => {
    setState(prev => {
      const order = prev.orders[orderId];
      if (!order) return prev;
      return { ...prev, orders: { ...prev.orders, [orderId]: { ...order, notes, updatedAt: now() } } };
    });
  };

  const seatGuests = (tableId: string, waiterName: string, waiterInitials?: string) => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? { ...t, status: 'seated', waiterInitials, elapsedMinutes: 0 } : t
      ),
    }));
    addActivity(waiterName, `Seated guests at ${state.tables.find(t => t.id === tableId)?.number ?? tableId}`, 'seat');
  };

  const requestBill = (tableId: string, staffName: string) => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.map(t => (t.id === tableId ? { ...t, status: 'bill' } : t)),
    }));
    addActivity(staffName, `Requested bill for ${state.tables.find(t => t.id === tableId)?.number ?? tableId}`, 'bill_requested');
    addNotification({
      title: 'Bill requested',
      message: `Bill requested for ${state.tables.find(t => t.id === tableId)?.number ?? 'a table'}.`,
      time: now(),
      type: 'payment',
      isRead: false,
      audience: 'manager',
    });
  };

  const markCleaningDone = (tableId: string, staffName: string) => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? { ...t, status: 'free', waiterInitials: undefined, elapsedMinutes: undefined } : t
      ),
    }));
    addActivity(staffName, `Marked cleaning done for ${state.tables.find(t => t.id === tableId)?.number ?? tableId}`, 'shift');
  };

  const sendOrderToKitchen = (orderId: string, priority: Ticket['priority'] = 'normal') => {
    setState(prev => {
      const order = prev.orders[orderId];
      if (!order) return prev;

      const orderNumber = `#${prev.nextOrderNumber}`;
      const ticket: Ticket = {
        id: uid('k'),
        orderId,
        orderNumber,
        tableId: order.tableId,
        tableNumber: order.tableNumber,
        waiterName: order.waiterName,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity, modifiers: i.modifiers, notes: i.notes })),
        status: 'new',
        priority,
        createdAt: now(),
      };

      const nextTables = order.tableId
        ? prev.tables.map(t => (t.id === order.tableId ? { ...t, status: 'ordered', elapsedMinutes: t.elapsedMinutes ?? 0 } : t))
        : prev.tables;

      return {
        ...prev,
        nextOrderNumber: prev.nextOrderNumber + 1,
        tickets: [ticket, ...prev.tickets],
        tables: nextTables,
        orders: {
          ...prev.orders,
          [orderId]: { ...order, status: 'sent', updatedAt: now() },
        },
      };
    });
    const order = state.orders[orderId];
    addActivity(order?.waiterName ?? 'Waiter', `Sent order to kitchen (${order?.tableNumber ?? 'Walk-in'})`, 'order_sent');
    addNotification({
      title: 'New ticket',
      message: `New ticket received for ${order?.tableNumber ?? 'Walk-in'}.`,
      time: now(),
      type: 'kitchen',
      isRead: false,
      audience: 'kitchen',
    });
  };

  const startCooking = (ticketId: string, staffName: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => (t.id === ticketId ? { ...t, status: 'preparing' } : t)),
    }));
    addActivity(staffName, `Started cooking ${state.tickets.find(t => t.id === ticketId)?.orderNumber ?? ''}`, 'kitchen_start');
  };

  const markTicketReady = (ticketId: string, staffName: string) => {
    setState(prev => {
      const ticket = prev.tickets.find(t => t.id === ticketId);
      if (!ticket) return prev;
      const nextTables = ticket.tableId
        ? prev.tables.map(tb => (tb.id === ticket.tableId ? { ...tb, status: 'ready' } : tb))
        : prev.tables;
      return {
        ...prev,
        tables: nextTables,
        tickets: prev.tickets.map(t => (t.id === ticketId ? { ...t, status: 'ready' } : t)),
      };
    });
    const t = state.tickets.find(x => x.id === ticketId);
    addActivity(staffName, `Marked ${t?.orderNumber ?? 'ticket'} ready`, 'kitchen_ready');
    addNotification({
      title: 'Order ready',
      message: `${t?.orderNumber ?? 'Order'} is ready for pickup (${t?.tableNumber ?? 'Walk-in'}).`,
      time: now(),
      type: 'kitchen',
      isRead: false,
      audience: 'waiter',
    });
  };

  const reportKitchenIssue = (ticketId: string, staffName: string, message?: string) => {
    const t = state.tickets.find(x => x.id === ticketId);
    addActivity(staffName, `Reported issue for ${t?.orderNumber ?? 'ticket'}${message ? `: ${message}` : ''}`, 'issue');
    addNotification({
      title: 'Kitchen issue',
      message: `Issue reported for ${t?.orderNumber ?? 'a ticket'}. Please review.`,
      time: now(),
      type: 'manager',
      isRead: false,
      audience: 'manager',
    });
  };

  const processPayment = (orderId: string, staffName: string, method: PaymentMethod, discountPct: number, tipPct: number) => {
    setState(prev => {
      const order = prev.orders[orderId];
      if (!order) return prev;

      const nextTables = order.tableId
        ? prev.tables.map(t => (t.id === order.tableId ? { ...t, status: 'cleaning' } : t))
        : prev.tables;

      return {
        ...prev,
        tables: nextTables,
        orders: {
          ...prev.orders,
          [orderId]: { ...order, status: 'paid', updatedAt: now() },
        },
      };
    });
    const order = state.orders[orderId];
    addActivity(staffName, `Processed payment (${method}) for ${order?.tableNumber ?? 'Walk-in'} (Discount ${discountPct}%, Tip ${tipPct}%)`, 'payment');
    addNotification({
      title: 'Payment processed',
      message: `Payment processed for ${order?.tableNumber ?? 'Walk-in'}.`,
      time: now(),
      type: 'payment',
      isRead: false,
      audience: 'manager',
    });
  };

  const exportCsv = (kind: 'activity' | 'orders' | 'tables' | 'tickets', staffName: string) => {
    addActivity(staffName, `Exported ${kind} CSV`, 'export');
    const rows: string[][] = [];

    if (kind === 'tables') {
      rows.push(['table', 'seats', 'status', 'section', 'waiter', 'elapsedMinutes']);
      state.tables.forEach(t => rows.push([t.number, String(t.seats), t.status, t.section, t.waiterInitials ?? '', String(t.elapsedMinutes ?? '')]));
    } else if (kind === 'tickets') {
      rows.push(['orderNumber', 'table', 'status', 'priority', 'waiter', 'createdAt']);
      state.tickets.forEach(t => rows.push([t.orderNumber, t.tableNumber, t.status, t.priority, t.waiterName, new Date(t.createdAt).toISOString()]));
    } else if (kind === 'orders') {
      rows.push(['orderId', 'table', 'status', 'waiter', 'itemsCount', 'updatedAt']);
      Object.values(state.orders).forEach(o => rows.push([o.id, o.tableNumber, o.status, o.waiterName, String(o.items.length), new Date(o.updatedAt).toISOString()]));
    } else {
      rows.push(['time', 'staff', 'type', 'action']);
      state.activity.forEach(a => rows.push([formatTime(a.time), a.staff, a.type, a.action]));
    }

    return rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
  };

  const value: RestaurantContextType = useMemo(() => ({
    ...state,
    resetDemo,
    tickMinute,
    seatGuests,
    markCleaningDone,
    requestBill,
    getActiveOrderForTable,
    startOrResumeOrder,
    upsertOrderItem,
    removeOrderItem,
    setOrderNotes,
    sendOrderToKitchen,
    processPayment,
    startCooking,
    markTicketReady,
    reportKitchenIssue,
    addActivity,
    addNotification,
    markAllNotificationsRead,
    exportCsv,
  }), [state]);

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return ctx;
}

