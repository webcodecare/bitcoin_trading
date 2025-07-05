import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch as UISwitch } from "@/components/ui/switch";
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
  Coins, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Ticker {
  id: string;
  symbol: string;
  description: string;
  isEnabled: boolean;
  createdAt: string;
}

export default function AdminTickers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateTickerOpen, setIsCreateTickerOpen] = useState(false);
  const [newTicker, setNewTicker] = useState({
    symbol: "",
    description: "",
    isEnabled: true,
  });

  const authToken = localStorage.getItem("token");

  const { data: tickers, isLoading: isLoadingTickers } = useQuery({
    queryKey: ["/api/admin/tickers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tickers", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tickers");
      return await response.json() as Ticker[];
    },
  });

  const updateTickerMutation = useMutation({
    mutationFn: async ({ tickerId, updates }: { tickerId: string; updates: Partial<Ticker> }) => {
      const response = await fetch(`/api/admin/tickers/${tickerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update ticker");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickers"] });
      toast({ title: "Ticker updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update ticker", variant: "destructive" });
    },
  });

  const createTickerMutation = useMutation({
    mutationFn: async (tickerData: typeof newTicker) => {
      const response = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(tickerData),
      });
      if (!response.ok) throw new Error("Failed to create ticker");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickers"] });
      setNewTicker({ symbol: "", description: "", isEnabled: true });
      setIsCreateTickerOpen(false);
      toast({ title: "Ticker created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create ticker", variant: "destructive" });
    },
  });

  const deleteTickerMutation = useMutation({
    mutationFn: async (tickerId: string) => {
      const response = await fetch(`/api/admin/tickers/${tickerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete ticker");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickers"] });
      toast({ title: "Ticker deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ticker", variant: "destructive" });
    },
  });

  const filteredTickers = tickers?.filter(ticker => 
    ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticker.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tickerStats = {
    total: tickers?.length || 0,
    enabled: tickers?.filter(t => t.isEnabled).length || 0,
    disabled: tickers?.filter(t => !t.isEnabled).length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="ml-64 flex-1">
          {/* Top Bar */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Coins className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Ticker Management</h1>
              </div>
              <Dialog open={isCreateTickerOpen} onOpenChange={setIsCreateTickerOpen}>
                <DialogTrigger asChild>
                  <Button className="crypto-gradient text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ticker
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Ticker</DialogTitle>
                    <DialogDescription>
                      Add a new cryptocurrency ticker to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        value={newTicker.symbol}
                        onChange={(e) => setNewTicker({ ...newTicker, symbol: e.target.value })}
                        placeholder="BTCUSDT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newTicker.description}
                        onChange={(e) => setNewTicker({ ...newTicker, description: e.target.value })}
                        placeholder="Bitcoin / Tether USD"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <UISwitch
                        checked={newTicker.isEnabled}
                        onCheckedChange={(checked: boolean) => setNewTicker({ ...newTicker, isEnabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateTickerOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createTickerMutation.mutate(newTicker)}
                      disabled={createTickerMutation.isPending}
                      className="crypto-gradient text-white"
                    >
                      Create Ticker
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Tickers Content */}
          <div className="p-6 space-y-6">
            {/* Search and Stats */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex space-x-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Total Tickers</div>
                  <div className="text-2xl font-bold">{tickerStats.total}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Enabled</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {tickerStats.enabled}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Disabled</div>
                  <div className="text-2xl font-bold text-red-400">
                    {tickerStats.disabled}
                  </div>
                </Card>
              </div>
            </div>

            {/* Tickers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tickers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTickers ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading tickers...
                        </TableCell>
                      </TableRow>
                    ) : filteredTickers?.map((ticker) => (
                      <TableRow key={ticker.id}>
                        <TableCell className="font-semibold font-mono">
                          {ticker.symbol}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticker.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <UISwitch
                              checked={ticker.isEnabled}
                              onCheckedChange={(checked: boolean) =>
                                updateTickerMutation.mutate({
                                  tickerId: ticker.id,
                                  updates: { isEnabled: checked },
                                })
                              }
                            />
                            <Badge variant={ticker.isEnabled ? "default" : "secondary"}>
                              {ticker.isEnabled ? (
                                <><CheckCircle className="mr-1 h-3 w-3" /> Enabled</>
                              ) : (
                                <><XCircle className="mr-1 h-3 w-3" /> Disabled</>
                              )}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(ticker.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteTickerMutation.mutate(ticker.id)}
                              disabled={deleteTickerMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Popular Tickers */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Popular Tickers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { symbol: "BTCUSDT", name: "Bitcoin" },
                    { symbol: "ETHUSDT", name: "Ethereum" },
                    { symbol: "BNBUSDT", name: "Binance Coin" },
                    { symbol: "ADAUSDT", name: "Cardano" },
                    { symbol: "SOLUSDT", name: "Solana" },
                    { symbol: "XRPUSDT", name: "Ripple" },
                    { symbol: "DOTUSDT", name: "Polkadot" },
                    { symbol: "MATICUSDT", name: "Polygon" },
                  ].map((crypto) => (
                    <Button
                      key={crypto.symbol}
                      variant="outline"
                      className="h-16 flex-col"
                      onClick={() => {
                        setNewTicker({
                          symbol: crypto.symbol,
                          description: `${crypto.name} / Tether USD`,
                          isEnabled: true,
                        });
                        setIsCreateTickerOpen(true);
                      }}
                    >
                      <div className="font-mono font-semibold">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}