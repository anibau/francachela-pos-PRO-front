import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  Gift,
  Star,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import WhatsAppSettings from '@/components/home/WhatsAppSettings';

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


export default function Home() {
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);

  if (showWhatsAppSettings) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWhatsAppSettings(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>
        
        {/* Componente de configuración WhatsApp */}
        <WhatsAppSettings />
      </div>
    );
  }

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

      {/* WhatsApp Settings Card */}
      <div className="flex justify-center">
        <Card 
          className="w-full max-w-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
          onClick={() => setShowWhatsAppSettings(true)}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                Configuración WhatsApp
              </CardTitle>
            </div>
            <CardDescription className="font-medium">
              Gestionar conexión y mensajes automáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configura la conexión de WhatsApp para envío automático de mensajes de bienvenida y notificaciones a clientes.
            </p>
          </CardContent>
        </Card>
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
    </div>
  );
}
