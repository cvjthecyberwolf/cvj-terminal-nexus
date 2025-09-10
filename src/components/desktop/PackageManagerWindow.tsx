import { useState, useEffect } from "react";
import { Search, Package, Download, Trash2, RefreshCw, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { packageManager } from "@/lib/packageManager";
import { NativePackageManager } from "@/lib/nativePackageManager";

interface Package {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  size?: number;
}

interface PackageManagerWindowProps {
  onClose?: () => void;
}

const PackageManagerWindow = ({ onClose }: PackageManagerWindowProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [installedPackages, setInstalledPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const allPackages = await packageManager.searchPackages("");
      setPackages(allPackages);
      
      const installed = await packageManager.listInstalledPackages();
      setInstalledPackages(installed);
    } catch (error) {
      console.error("Failed to load packages:", error);
    }
    setLoading(false);
  };

  const searchPackages = async (query: string) => {
    if (!query.trim()) {
      await loadPackages();
      return;
    }

    setLoading(true);
    try {
      const results = await packageManager.searchPackages(query);
      setPackages(results);
    } catch (error) {
      console.error("Failed to search packages:", error);
    }
    setLoading(false);
  };

  const installPackage = async (packageName: string) => {
    setInstalling(packageName);
    try {
      await packageManager.installPackage(packageName);
      await loadPackages(); // Refresh the lists
    } catch (error) {
      console.error("Failed to install package:", error);
    }
    setInstalling(null);
  };

  const removePackage = async (packageName: string) => {
    setInstalling(packageName);
    try {
      await packageManager.removePackage(packageName);
      await loadPackages(); // Refresh the lists
    } catch (error) {
      console.error("Failed to remove package:", error);
    }
    setInstalling(null);
  };

  const updateRepositories = async () => {
    setLoading(true);
    try {
      await packageManager.updateRepositories();
      await loadPackages();
    } catch (error) {
      console.error("Failed to update repositories:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">CVJ Package Manager</h2>
          </div>
          <Button
            onClick={updateRepositories}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Update
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchPackages(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="available" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Packages ({filteredPackages.length})</TabsTrigger>
            <TabsTrigger value="installed">Installed ({installedPackages.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-4 h-full overflow-hidden">
            <div className="h-full overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading packages...</span>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No packages found matching your search." : "No packages available."}
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{pkg.name}</h3>
                          <Badge variant="secondary">{pkg.version}</Badge>
                          {pkg.installed && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Installed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pkg.description}
                        </p>
                        {pkg.size && (
                          <p className="text-xs text-muted-foreground">
                            Size: {(pkg.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!pkg.installed ? (
                          <Button
                            onClick={() => installPackage(pkg.name)}
                            disabled={installing === pkg.name}
                            size="sm"
                          >
                            {installing === pkg.name ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => removePackage(pkg.name)}
                            disabled={installing === pkg.name}
                            size="sm"
                            variant="destructive"
                          >
                            {installing === pkg.name ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="installed" className="mt-4 h-full overflow-hidden">
            <div className="h-full overflow-y-auto space-y-2">
              {installedPackages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No packages installed yet.
                </div>
              ) : (
                installedPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{pkg.name}</h3>
                          <Badge variant="secondary">{pkg.version}</Badge>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Installed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pkg.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => removePackage(pkg.name)}
                        disabled={installing === pkg.name}
                        size="sm"
                        variant="destructive"
                      >
                        {installing === pkg.name ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Install Section */}
      <div className="border-t border-border p-4">
        <h3 className="text-sm font-medium mb-3">Quick Install</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => installPackage('all-pentesting-tools')}
            disabled={installing === 'all-pentesting-tools'}
            size="sm"
            variant="outline"
          >
            All Security Tools
          </Button>
          <Button
            onClick={() => installPackage('essentials')}
            disabled={installing === 'essentials'}
            size="sm"
            variant="outline"
          >
            Essential Tools
          </Button>
          <Button
            onClick={() => installPackage('web-tools')}
            disabled={installing === 'web-tools'}
            size="sm"
            variant="outline"
          >
            Web Security
          </Button>
          <Button
            onClick={() => installPackage('network-tools')}
            disabled={installing === 'network-tools'}
            size="sm"
            variant="outline"
          >
            Network Tools
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageManagerWindow;