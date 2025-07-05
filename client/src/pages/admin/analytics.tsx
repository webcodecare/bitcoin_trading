import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Database,
  Calendar,
  Download,
  Upload,
  Trash2,
  Play,
  Pause,
  Settings,
  Plus
} from "lucide-react";

interface AnalyticsModule {
  id: string;
  name: string;
  type: "heatmap" | "cycle" | "forecast";
  isEnabled: boolean;
  lastUpdated?: string;
  dataPoints: number;
  updateInterval: string;
  status: "active" | "updating" | "error" | "paused";
}

interface DataImport {
  id: string;
  ticker: string;
  type: "heatmap" | "cycle" | "forecast";
  source: string;
  status: "pending" | "processing" | "completed" | "failed";
  recordsImported: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"modules" | "data" | "imports">("modules");

  // Fetch analytics modules
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["/api/admin/analytics/modules"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/modules");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics modules");
      }
      return await response.json();
    }
  });

  // Fetch data imports
  const { data: imports, isLoading: isLoadingImports } = useQuery({
    queryKey: ["/api/admin/analytics/imports"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/imports");
      if (!response.ok) {
        throw new Error("Failed to fetch data imports");
      }
      return await response.json();
    }
  });

  // Toggle module mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await fetch(`/api/admin/analytics/modules/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (!response.ok) {
        throw new Error("Failed to toggle module");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/modules"] });
      toast({
        title: "Success",
        description: "Module status updated"
      });
    }
  });

  // Update module data mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch(`/api/admin/analytics/modules/${moduleId}/update`, {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Failed to update module data");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/modules"] });
      toast({
        title: "Success",
        description: "Module data update initiated"
      });
    }
  });

  // Import data mutation
  const importDataMutation = useMutation({
    mutationFn: async ({ ticker, type, source }: { ticker: string; type: string; source: string }) => {
      const response = await fetch("/api/admin/analytics/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, type, source })
      });
      if (!response.ok) {
        throw new Error("Failed to start data import");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/imports"] });
      toast({
        title: "Success",
        description: "Data import started"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-emerald-500">Active</Badge>;
      case "updating":
        return <Badge variant="secondary" className="bg-blue-500">Updating</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "heatmap":
        return <BarChart3 className="w-4 h-4" />;
      case "cycle":
        return <TrendingUp className="w-4 h-4" />;
      case "forecast":
        return <Activity className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const activeModules = modules?.filter((m: AnalyticsModule) => m.isEnabled).length || 0;
  const totalDataPoints = modules?.reduce((sum: number, m: AnalyticsModule) => sum + m.dataPoints, 0) || 0;
  const pendingImports = imports?.filter((i: DataImport) => i.status === "pending" || i.status === "processing").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Management</h1>
          <p className="text-muted-foreground">Manage 200-week heatmap, cycle indicators, and forecast data</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Points</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Imports</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingImports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {modules?.length > 0 ? 
                new Date(Math.max(...modules.map((m: AnalyticsModule) => 
                  m.lastUpdated ? new Date(m.lastUpdated).getTime() : 0
                ))).toLocaleDateString() : 
                "Never"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === "modules" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("modules")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Modules
        </Button>
        <Button
          variant={selectedTab === "data" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("data")}
        >
          <Database className="w-4 h-4 mr-2" />
          Data Management
        </Button>
        <Button
          variant={selectedTab === "imports" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("imports")}
        >
          <Upload className="w-4 h-4 mr-2" />
          Data Imports
        </Button>
      </div>

      {/* Analytics Modules Tab */}
      {selectedTab === "modules" && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Modules</CardTitle>
            <p className="text-sm text-muted-foreground">Configure and monitor analytics computation modules</p>
          </CardHeader>
          <CardContent>
            {isLoadingModules ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Points</TableHead>
                    <TableHead>Update Interval</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules?.map((module: AnalyticsModule) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(module.type)}
                          <span className="font-medium">{module.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{module.type}</TableCell>
                      <TableCell>{getStatusBadge(module.status)}</TableCell>
                      <TableCell>{module.dataPoints.toLocaleString()}</TableCell>
                      <TableCell>{module.updateInterval}</TableCell>
                      <TableCell>
                        {module.lastUpdated ? 
                          new Date(module.lastUpdated).toLocaleString() : 
                          "Never"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={module.isEnabled}
                            onCheckedChange={(enabled) => 
                              toggleModuleMutation.mutate({ id: module.id, enabled })
                            }
                            disabled={toggleModuleMutation.isPending}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateModuleMutation.mutate(module.id)}
                            disabled={updateModuleMutation.isPending || module.status === "updating"}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!modules || modules.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No analytics modules configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Management Tab */}
      {selectedTab === "data" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage historical data for analytics modules</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 200-Week Heatmap Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">200-Week SMA Heatmap</h3>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">2,847</div>
                        <div className="text-sm text-muted-foreground">Total Data Points</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">5 years</div>
                        <div className="text-sm text-muted-foreground">Historical Range</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">Daily</div>
                        <div className="text-sm text-muted-foreground">Update Frequency</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 2-Year Cycle Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">2-Year Cycle Indicator</h3>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">1,423</div>
                        <div className="text-sm text-muted-foreground">Cycle Points</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">3 cycles</div>
                        <div className="text-sm text-muted-foreground">Complete Cycles</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">Weekly</div>
                        <div className="text-sm text-muted-foreground">Update Frequency</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Forecast Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Cycle Forecaster</h3>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">365</div>
                        <div className="text-sm text-muted-foreground">Forecast Days</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">92.3%</div>
                        <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">Daily</div>
                        <div className="text-sm text-muted-foreground">Update Frequency</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Imports Tab */}
      {selectedTab === "imports" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Import History</CardTitle>
                <p className="text-sm text-muted-foreground">Monitor data import jobs and their status</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Analytics Data</DialogTitle>
                    <DialogDescription>
                      Import historical data for analytics calculations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Ticker Symbol</Label>
                      <Input placeholder="BTC" />
                    </div>
                    <div>
                      <Label>Data Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="heatmap">200-Week Heatmap</SelectItem>
                          <SelectItem value="cycle">2-Year Cycle</SelectItem>
                          <SelectItem value="forecast">Forecast Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Source</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="binance">Binance</SelectItem>
                          <SelectItem value="coinbase">Coinbase</SelectItem>
                          <SelectItem value="manual">Manual Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button>Start Import</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingImports ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports?.slice(0, 10).map((importJob: DataImport) => (
                    <TableRow key={importJob.id}>
                      <TableCell className="font-medium">{importJob.ticker}</TableCell>
                      <TableCell className="capitalize">{importJob.type}</TableCell>
                      <TableCell>{importJob.source}</TableCell>
                      <TableCell>{getStatusBadge(importJob.status)}</TableCell>
                      <TableCell>{importJob.recordsImported.toLocaleString()}</TableCell>
                      <TableCell>{new Date(importJob.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {importJob.completedAt ? 
                          new Date(importJob.completedAt).toLocaleString() : 
                          "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!imports || imports.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No data imports found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}