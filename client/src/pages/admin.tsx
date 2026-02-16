import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TransformationRow {
  id: string;
  style: string;
  status: string;
  createdAt: string;
  hasImage: boolean;
}

interface AdminData {
  transformations: TransformationRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("admin_token")
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransformations = useCallback(
    async (p: number, status: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: "30",
        });
        if (status) params.set("status", status);
        const res = await fetch(`/api/admin/transformations?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setToken(null);
          sessionStorage.removeItem("admin_token");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        toast({ title: "Error", description: "Failed to load transformations", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [token, toast]
  );

  useEffect(() => {
    if (token) fetchTransformations(page, statusFilter);
  }, [token, page, statusFilter, fetchTransformations]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
        return;
      }
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem("admin_token", t);
    } catch {
      toast({ title: "Error", description: "Login request failed", variant: "destructive" });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transformation? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/transformations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Deleted", description: `Transformation ${id.slice(0, 8)}... removed` });
        fetchTransformations(page, statusFilter);
      } else {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Delete request failed", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("admin_token");
    setData(null);
  };

  const styleColors: Record<string, string> = {
    "oil-painting": "bg-amber-100 text-amber-800",
    acrylic: "bg-blue-100 text-blue-800",
    "pencil-sketch": "bg-gray-100 text-gray-800",
    watercolor: "bg-cyan-100 text-cyan-800",
    charcoal: "bg-stone-200 text-stone-800",
    pastel: "bg-pink-100 text-pink-800",
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
  };

  // ── Login screen ──
  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-sm p-8">
          <h1 className="text-2xl font-bold mb-1 text-center">Admin</h1>
          <p className="text-muted-foreground text-center mb-6 text-sm">
            View all transformed images
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user">Username</Label>
              <Input
                id="admin-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pass">Password</Label>
              <Input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loggingIn}>
              {loggingIn ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ── Admin dashboard ──
  return (
    <div className="py-6 px-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transformations</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.total} total &middot; Page {data.page} of {data.pages}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-1.5 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      )}

      {/* Grid */}
      {data && !loading && (
        <>
          {data.transformations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transformations found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {data.transformations.map((t) => (
                <Card key={t.id} className="overflow-hidden group relative">
                  {/* Image */}
                  <div
                    className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
                    onClick={() =>
                      t.hasImage
                        ? setSelectedImage(`/api/transform/${t.id}/image`)
                        : null
                    }
                  >
                    {t.hasImage ? (
                      <img
                        src={`/api/transform/${t.id}/image?w=300&q=70`}
                        alt={`${t.style} transformation`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No image
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${styleColors[t.style] || "bg-gray-100 text-gray-800"}`}
                      >
                        {t.style}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[t.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.id.slice(0, 8)}... &middot;{" "}
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    &times;
                  </button>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {data.page} / {data.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8 text-lg font-bold flex items-center justify-center shadow-lg"
            >
              &times;
            </button>
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 bg-white/90 text-black text-xs px-3 py-1.5 rounded-md shadow hover:bg-white transition-colors"
            >
              Open full size
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
