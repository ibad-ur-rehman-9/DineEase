import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRestaurant } from '../context/RestaurantContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, LogOut, User, Bell, Globe, Palette, HelpCircle, Info, Check, Phone, Mail, MessageCircle, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, textSize, setTextSize, soundEnabled, setSoundEnabled, pushEnabled, setPushEnabled } = useTheme();
  const { addActivity } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState('account');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Account state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // FAQ and Support modals
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addActivity(user?.name || 'User', 'Updated profile information', 'login');
      toast.success('Profile updated successfully');
    }, 1000);
  };

  const handleUpdatePin = () => {
    if (currentPin !== '1111' && currentPin !== '2222' && currentPin !== '3333' && currentPin !== '4444') {
      toast.error('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4) {
      toast.error('New PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('New PINs do not match');
      return;
    }
    setIsUpdatingPin(true);
    setTimeout(() => {
      setIsUpdatingPin(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      addActivity(user?.name || 'User', 'Changed PIN', 'login');
      toast.success('PIN updated successfully');
    }, 1000);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    toast.success(`Language changed to ${lang}`);
  };

  const categories = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Settings & Profile</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="bg-card border-b lg:border-b-0 lg:border-r border-border lg:w-64 p-4">
          {/* Profile Header */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{user?.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">EMP-{user?.employeeId}</p>
          </div>

          {/* Categories */}
          <nav className="space-y-1">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                  ${selectedCategory === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl space-y-6">
            {selectedCategory === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
                  <p className="text-muted-foreground">Manage your account information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="employee-id">Employee ID</Label>
                    <Input id="employee-id" value={user?.employeeId} disabled className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
                  </div>

                  <div>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Change PIN</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-pin">Current PIN</Label>
                      <Input id="current-pin" type="password" maxLength={4} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="new-pin">New PIN</Label>
                      <Input id="new-pin" type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                      <Input id="confirm-pin" type="password" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="mt-2" />
                    </div>
                    <Button variant="outline" onClick={handleUpdatePin} disabled={isUpdatingPin}>
                      {isUpdatingPin ? 'Updating...' : 'Update PIN'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Appearance</h2>
                  <p className="text-muted-foreground">Customize how DineEase looks</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {['light', 'dark', 'system'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`p-4 rounded-lg border-2 transition-all capitalize
                            ${theme === t ? 'border-primary bg-primary/10' : 'border-border'}
                          `}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Text Size</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' }
                      ].map(({ label, value }) => (
                        <button
                          key={value}
                          onClick={() => setTextSize(value as 'small' | 'medium' | 'large')}
                          className={`p-4 rounded-lg border-2 transition-all
                            ${textSize === value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Notifications</h2>
                  <p className="text-muted-foreground">Manage notification preferences</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <Label htmlFor="sound">Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">Play sound for new orders and alerts</p>
                    </div>
                    <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when app is closed</p>
                    </div>
                    <Switch id="push" checked={pushEnabled} onCheckedChange={setPushEnabled} />
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'language' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Language</h2>
                  <p className="text-muted-foreground">Choose your preferred language</p>
                </div>

                <div className="space-y-2">
                  {['English', 'Urdu', 'Roman Urdu'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between
                        ${selectedLanguage === lang ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}
                      `}
                    >
                      <span>{lang}</span>
                      {selectedLanguage === lang && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'help' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Help & Support</h2>
                  <p className="text-muted-foreground">Get assistance and learn more</p>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowFaqModal(true)}>
                    <HelpCircle className="w-5 h-5 mr-2" />
                    View FAQ
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowSupportModal(true)}>
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact your manager or DineEase support team.
                  </p>
                </div>
              </div>
            )}

            {selectedCategory === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">About DineEase</h2>
                  <p className="text-muted-foreground">App information and credits</p>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                      <span className="text-4xl font-bold text-primary-foreground">DE</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">DineEase</h3>
                    <p className="text-muted-foreground">Restaurant Management System</p>
                  </div>

                  <div className="space-y-2 text-sm text-center">
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      Version 1.0.0
                    </p>
                    <p className="text-muted-foreground">© 2026 DineEase. All rights reserved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="pt-6 border-t border-border">
              <Button
                variant="destructive"
                onClick={() => setShowLogoutDialog(true)}
                className="w-full sm:w-auto"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? Any unsynced orders will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Frequently Asked Questions</DialogTitle>
            <DialogDescription>
              Find answers to common questions about using DineEase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { q: 'How do I reset my PIN?', a: 'Go to Settings > Account > Change PIN. Enter your current PIN and set a new 4-digit PIN.' },
              { q: 'How do I process a refund?', a: 'Only managers can process refunds. Contact your manager or use the manager dashboard.' },
              { q: 'What do the table colors mean?', a: 'Free (green), Seated (yellow), Ordered (orange), Ready (light green), Bill Pending (red), Cleaning (gray).' },
              { q: 'How do I report a kitchen issue?', a: 'In the kitchen ticket detail view, click "Report Issue" and describe the problem.' },
              { q: 'Can I change my language?', a: 'Yes, go to Settings > Language and select your preferred language.' },
            ].map((faq, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowFaqModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Get help from the DineEase support team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+92 300 1234567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@dineease.pk</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 9 AM - 11 PM</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm font-medium mb-2">Send us a message</p>
              <textarea
                className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[100px] resize-none"
                placeholder="Describe your issue..."
              />
              <Button className="w-full mt-3" onClick={() => {
                toast.success('Message sent! We will respond shortly.');
                setShowSupportModal(false);
              }}>
                Send Message
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
