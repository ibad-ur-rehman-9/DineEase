import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { UtensilsCrossed, ChefHat, BarChart3, LogOut } from 'lucide-react';
import type { UserRole } from '../context/AuthContext';

const roleConfig = {
  waiter: {
    icon: UtensilsCrossed,
    title: 'Waiter',
    description: 'Take orders & manage tables',
    route: '/waiter/tables',
    color: 'bg-info hover:bg-info/90',
  },
  kitchen: {
    icon: ChefHat,
    title: 'Kitchen',
    description: 'View & prepare incoming tickets',
    route: '/kitchen',
    color: 'bg-warning hover:bg-warning/90',
  },
  manager: {
    icon: BarChart3,
    title: 'Manager',
    description: 'Monitor restaurant performance',
    route: '/manager',
    color: 'bg-success hover:bg-success/90',
  },
};

export default function RoleSelection() {
  const { user, selectRole, logout } = useAuth();
  const navigate = useNavigate();
  const [rememberChoice, setRememberChoice] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Auto-redirect for single-role users, but only once
    if (user.role && user.role !== null && !user.roles && !hasNavigated.current) {
      hasNavigated.current = true;
      const config = roleConfig[user.role];
      setTimeout(() => navigate(config.route), 300);
    }
  }, [user, navigate]);

  const navigateToRole = (role: UserRole) => {
    if (!role) return;

    selectRole(role);
    const config = roleConfig[role];
    setTimeout(() => navigate(config.route), 300);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (rememberChoice && user) {
      localStorage.setItem(`remember-role-${user.employeeId}`, role || '');
    }
    navigateToRole(role);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const availableRoles = user.roles || [user.role].filter(Boolean) as UserRole[];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Hello, {user.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Which role are you working as today?
          </p>
          <p className="text-sm text-muted-foreground">
            Employee ID: {user.employeeId}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {(['waiter', 'kitchen', 'manager'] as UserRole[]).map((role) => {
            if (!role) return null;
            const config = roleConfig[role];
            const Icon = config.icon;
            const isAvailable = availableRoles.includes(role);

            return (
              <button
                key={role}
                onClick={() => isAvailable && handleRoleSelect(role)}
                disabled={!isAvailable}
                className={`
                  group relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all
                  ${isAvailable
                    ? 'bg-card hover:shadow-lg hover:-translate-y-1 border-2 border-border hover:border-primary cursor-pointer'
                    : 'bg-muted/50 border-2 border-border/50 cursor-not-allowed opacity-60'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                `}
                aria-label={`Select ${config.title} role`}
                aria-disabled={!isAvailable}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity
                  ${isAvailable ? 'group-hover:opacity-20' : ''}
                `}
                  style={{ background: isAvailable ? config.color.split(' ')[0].replace('bg-', '#') : '#ccc' }}
                />

                {/* Content */}
                <div className="relative space-y-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center
                    ${isAvailable ? config.color.replace('hover:bg-', 'bg-').split(' ')[0] + '/20' : 'bg-muted'}
                  `}>
                    <Icon className={`w-7 h-7 ${isAvailable ? 'text-foreground' : 'text-muted-foreground'}`} />
                  </div>

                  <div className="text-left space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {config.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>

                  {!isAvailable && (
                    <div className="text-xs text-destructive font-medium">
                      Not assigned to this role
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Remember Choice */}
        {availableRoles.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberChoice}
              onCheckedChange={(checked) => setRememberChoice(checked === true)}
            />
            <label
              htmlFor="remember"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Remember my choice for next time
            </label>
          </div>
        )}

        {/* Logout */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
