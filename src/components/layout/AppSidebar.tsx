import { ShoppingCart, LayoutDashboard, Package, Users, Gift, Home, TrendingUp, Receipt, DollarSign, Truck, Star, BarChart3, Settings2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type MenuItem = {
  title: string;
  url: string;
  icon: typeof Home;
  roles?: UserRole[];
};

const menuItems: MenuItem[] = [
  { title: "Inicio", url: "/home", icon: Home },
  { title: "Punto de Venta", url: "/pos", icon: ShoppingCart },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ['ADMIN'] },
  { title: "Inventario", url: "/productos", icon: Package, roles: ['ADMIN', 'SUPERVISOR'] },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Ventas", url: "/ventas", icon: TrendingUp },
  { title: "Corte Ventas", url: "/ventas-corte", icon: BarChart3, roles: ['ADMIN'] },
  { title: "Promociones", url: "/promociones", icon: Gift, roles: ['ADMIN'] },
  { title: "Delivery", url: "/delivery", icon: Truck },
  { title: "Puntos", url: "/puntos", icon: Star, roles: ['ADMIN'] },
  { title: "Config. Puntos", url: "/admin/configuracion-puntos", icon: Settings2, roles: ['ADMIN'] },
  { title: "Gastos", url: "/gastos", icon: Receipt },
  { title: "Caja", url: "/caja", icon: DollarSign },
];

export function AppSidebar() {
  const { hasPermission } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || hasPermission(item.roles),
  );

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-primary">Francachela</h2>
          <p className="text-sm text-muted-foreground">Sistema POS</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-accent"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
