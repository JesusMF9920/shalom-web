"use client";

import { useState } from "react";
import {
  useSalesReport,
  useTopProducts,
  useInventoryReport,
} from "@/hooks/use-reports";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const { data: salesData, isLoading: salesLoading } = useSalesReport(
    parseInt(timeRange)
  );
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(10);
  const { data: inventoryData, isLoading: inventoryLoading } =
    useInventoryReport();

  const handleExport = (type: "sales" | "products" | "inventory") => {
    // Basic CSV export
    let csvContent = "";
    let filename = "";

    switch (type) {
      case "sales":
        csvContent =
          "Fecha,Ventas\n" +
          (salesData?.salesByDate
            .map((item) => `${item.date},${item.amount.toFixed(2)}`)
            .join("\n") || "");
        filename = "reporte-ventas.csv";
        break;
      case "products":
        csvContent =
          "Producto,Cantidad Vendida,Ingresos Totales\n" +
          (topProducts
            ?.map(
              (item) =>
                `"${item.name}",${item.totalSold},${item.totalRevenue.toFixed(
                  2
                )}`
            )
            .join("\n") || "");
        filename = "productos-top.csv";
        break;
      case "inventory":
        csvContent =
          "Producto,Tienda,Cantidad Actual,Cantidad Mínima\n" +
          (inventoryData?.lowStockItems
            .map(
              (item) =>
                `"${item.products?.name || "N/A"}","${
                  item.stores?.name || "N/A"
                }",${item.current_quantity || 0},${item.min_quantity || 0}`
            )
            .join("\n") || "");
        filename = "inventario-bajo-stock.csv";
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reportes y Analytics
          </h1>
          <p className="text-muted-foreground">
            Análisis de ventas e inventarios
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData?.totalSales?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesData?.totalTransactions || 0} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos con Stock Bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryData?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData?.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Más Vendidos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProducts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Top productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
            <CardDescription>
              Tendencia de ventas en los últimos {timeRange} días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData?.salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd/MM", { locale: es })
                    }
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    labelFormatter={(value) =>
                      format(new Date(value), "PPP", { locale: es })
                    }
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "Ventas",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 10 productos por ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "Ingresos",
                    ]}
                  />
                  <Bar dataKey="totalRevenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Productos con Stock Bajo</CardTitle>
              <CardDescription>
                Productos que requieren reposición inmediata
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("inventory")}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData?.lowStockItems
                    .slice(0, 5)
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.products?.name || "N/A"}</TableCell>
                        <TableCell>{item.stores?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {item.current_quantity || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.min_quantity || 0}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Productos Detallado</CardTitle>
              <CardDescription>
                Análisis detallado de productos más vendidos
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("products")}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts?.slice(0, 5).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.totalSold}</TableCell>
                      <TableCell>${product.totalRevenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
