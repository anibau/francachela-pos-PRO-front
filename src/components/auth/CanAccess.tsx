import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/contexts/AuthContext';

interface CanAccessProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccess({ roles, children, fallback = null }: CanAccessProps) {
  const { hasPermission } = useAuth();
  if (!hasPermission(roles)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
