import { ShoppingCart, LayoutDashboard, Package, Users, Gift, Home, TrendingUp, Receipt, DollarSign } from "lucide-react";
import { NavLink } from "react-router-dom";
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

const menuItems = [
  { title: "Inicio", url: "/home", icon: Home },
  { title: "Punto de Venta", url: "/pos", icon: ShoppingCart },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inventario", url: "/productos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Ventas", url: "/ventas", icon: TrendingUp },
  // { title: "Promociones", url: "/promociones", icon: Gift },
  { title: "Gastos", url: "/gastos", icon: Receipt },
  { title: "Caja", url: "/caja", icon: DollarSign },
];

export function AppSidebar() {
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary font-medium"
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
