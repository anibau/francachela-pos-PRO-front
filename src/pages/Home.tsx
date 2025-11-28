import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  Gift,
  Star 
} from "lucide-react";

const menuCards = [
  {
    title: "Punto de Venta",
    description: "Procesar ventas rápidamente",
    details: "Interfaz optimizada para ventas táctiles, gestión de tickets múltiples y aplicación automática de promociones.",
    link: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Dashboard",
    description: "Métricas y reportes",
    details: "Visualiza ventas, productos más vendidos, ranking de clientes y KPIs importantes de tu negocio.",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventario",
    description: "Gestionar productos",
    details: "Control de stock, precios, códigos de barras y alertas de inventario mínimo.",
    link: "/productos",
    icon: Package,
  },
  {
    title: "Clientes",
    description: "Registro, puntos de fidelidad y ventas fiadas",
    details: "Registro, puntos de fidelidad y ventas fiadas",
    link: "/clientes",
    icon: Users,
  },
  {
    title: "Ventas",
    description: "Historial detallado y reportes de ventas",
    details: "Historial detallado y reportes de ventas",
    link: "/ventas",
    icon: TrendingUp,
  },
  {
    title: "Promociones",
    description: "Combos, descuentos y ofertas especiales",
    details: "Combos, descuentos y ofertas especiales",
    link: "/promociones",
    icon: Gift,
  },
  {
    title: "Catálogo",
    description: "Vista pública para pedidos por WhatsApp",
    details: "Vista pública para pedidos por WhatsApp",
    link: "/landing",
    icon: Star,
  },
];

const statsCards = [
  { label: "Ventas de hoy", value: "S/. 2,450", color: "text-success" },
  { label: "Tickets procesados", value: "47", color: "text-primary" },
  { label: "Productos por agotar", value: "12", color: "text-warning" },
  { label: "Clientes registrados", value: "156", color: "text-muted-foreground" },
];

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Francachela POS
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Sistema completo de punto de venta y administración para tu licorería.
          Gestiona ventas, inventario, clientes y promociones de manera eficiente.
        </p>
      </div>

      {/* Main Menu Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="font-medium">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {card.details}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center">
              <p className={`text-3xl font-bold mb-2 ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
