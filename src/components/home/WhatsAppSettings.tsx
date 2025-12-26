import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  QrCode, 
  RefreshCw, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";
import { whatsappService } from '@/services/whatsappService';

interface WhatsAppStatus {
  connected: boolean;
  session?: string;
  phone?: string;
  message?: string;
}

interface QRResponse {
  qr?: string;
  message?: string;
}

export default function WhatsAppSettings() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qrData, setQrData] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState({
    status: false,
    qr: false,
    reconnect: false,
    logout: false,
  });
  const [lastResponse, setLastResponse] = useState<string>('');

  // Cargar estado inicial
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    try {
      const response = await whatsappService.getStatus();
      setStatus(response);
      setLastResponse(JSON.stringify(response, null, 2));
      
      if (response.connected) {
        toast.success('WhatsApp conectado correctamente');
      } else {
        toast.warning('WhatsApp desconectado');
      }
    } catch (error) {
      console.error('Error al obtener estado:', error);
      toast.error('Error al obtener estado de WhatsApp');
      setLastResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const loadQR = async () => {
    setLoading(prev => ({ ...prev, qr: true }));
    try {
      const response = await whatsappService.getQR();
      setQrData(response);
      setLastResponse(JSON.stringify(response, null, 2));
      
      if (response.qr) {
        toast.success('Código QR generado');
      } else {
        toast.info(response.message || 'No se pudo generar el código QR');
      }
    } catch (error) {
      console.error('Error al obtener QR:', error);
      toast.error('Error al obtener código QR');
      setLastResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(prev => ({ ...prev, qr: false }));
    }
  };

  const handleReconnect = async () => {
    setLoading(prev => ({ ...prev, reconnect: true }));
    try {
      const response = await whatsappService.reconnect();
      setLastResponse(JSON.stringify(response, null, 2));
      toast.success('Reconexión iniciada');
      
      // Recargar estado después de reconectar
      setTimeout(() => {
        loadStatus();
      }, 2000);
    } catch (error) {
      console.error('Error al reconectar:', error);
      toast.error('Error al reconectar WhatsApp');
      setLastResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(prev => ({ ...prev, reconnect: false }));
    }
  };

  const handleLogout = async () => {
    setLoading(prev => ({ ...prev, logout: true }));
    try {
      const response = await whatsappService.logout();
      setLastResponse(JSON.stringify(response, null, 2));
      toast.success('Sesión cerrada correctamente');
      
      // Limpiar datos locales
      setStatus(null);
      setQrData(null);
      
      // Recargar estado
      setTimeout(() => {
        loadStatus();
      }, 1000);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión de WhatsApp');
      setLastResponse(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(prev => ({ ...prev, logout: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold">Configuración WhatsApp</h2>
        </div>
        <p className="text-muted-foreground">
          Gestiona la conexión de WhatsApp para mensajes automáticos
        </p>
      </div>

      {/* Estado de Conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Estado de Conexión
          </CardTitle>
          <CardDescription>
            Estado actual del servicio WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Estado:</span>
            <Badge variant={status?.connected ? "default" : "destructive"}>
              {status?.connected ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {status?.connected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          {status?.phone && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Teléfono:</span>
              <span className="text-sm font-mono">{status.phone}</span>
            </div>
          )}
          
          {status?.session && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Sesión:</span>
              <span className="text-sm font-mono truncate max-w-32">{status.session}</span>
            </div>
          )}

          <Button 
            onClick={loadStatus} 
            disabled={loading.status}
            variant="outline"
            className="w-full"
          >
            {loading.status ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar Estado
          </Button>
        </CardContent>
      </Card>

      {/* Acciones de WhatsApp */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Código QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR
            </CardTitle>
            <CardDescription>
              Generar código QR para conectar WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrData?.qr && (
              <div className="flex justify-center">
                <img 
                  src={qrData.qr} 
                  alt="Código QR WhatsApp" 
                  className="max-w-48 max-h-48 border rounded-lg"
                />
              </div>
            )}
            
            <Button 
              onClick={loadQR} 
              disabled={loading.qr}
              className="w-full"
            >
              {loading.qr ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              Generar QR
            </Button>
          </CardContent>
        </Card>

        {/* Acciones de Conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Gestión de Conexión
            </CardTitle>
            <CardDescription>
              Reconectar o cerrar sesión de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleReconnect} 
              disabled={loading.reconnect}
              variant="outline"
              className="w-full"
            >
              {loading.reconnect ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reconectar
            </Button>
            
            <Button 
              onClick={handleLogout} 
              disabled={loading.logout}
              variant="destructive"
              className="w-full"
            >
              {loading.logout ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Respuesta del Backend */}
      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Última Respuesta del Backend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {lastResponse}
                </pre>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
