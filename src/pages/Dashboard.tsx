import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { salesService } from "@/services/salesService";
import { productsService } from "@/services/productsService";
import { clientsService } from "@/services/clientsService";
import { showErrorToast } from "@/utils/errorHandler";
import InventarioStats from "@/components/Dashboard/InventarioStats";
import ClienteStats from "@/components/Dashboard/ClienteStats";
import GastosStats from "@/components/Dashboard/GastosStats";
import VentasStats from '@/components/Dashboard/VentasStats';
import { GastosStats as GastosStatsNew } from "@/components/Dashboard/GastosStats";
import { ClientesStats } from "@/components/Dashboard/ClientesStats";


export default function Dashboard() {

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de ventas y métricas principales</p>
      </div>
      {/*Estadisticas de ventas */}
      <VentasStats />

      {/* Estadísticas de Inventario */}
      <InventarioStats />

      {/* Estadísticas de Cliente */}
      <ClienteStats />

      {/* Estadísticas de Gastos - REQUERIMIENTO 7c */}
      <GastosStatsNew />

      {/* Estadísticas de Clientes Top y Cumpleañeros - REQUERIMIENTOS 7d y 7e */}
      <ClientesStats />
    </div>
  );
}
