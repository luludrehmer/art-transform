/**
 * Associates a Stock Location with the Sales Channel used by the Publishable API Key.
 * Fixes "Sales channel is not associated with any stock location for variant".
 * Run: npm run medusa-setup-stock-location
 * Requires: MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env
 * Optional: MEDUSA_SALES_CHANNEL_ID (if unset, uses first sales channel)
 */

import "dotenv/config";

const BACKEND = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "") || "";
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "";
const PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "";
const SALES_CHANNEL_ID = process.env.MEDUSA_SALES_CHANNEL_ID || "";

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BACKEND}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Medusa auth failed: ${res.status} - ${await res.text()}`);
  }
  const data = await res.json();
  return data.token ?? data.user?.token ?? (data as { access_token?: string }).access_token ?? "";
}

async function api(path: string, method: string, token: string, body?: object) {
  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Medusa API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  if (!BACKEND || !EMAIL || !PASSWORD) {
    console.error("Set MEDUSA_BACKEND_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  console.log("Logging in to Medusa...");
  const token = await getAdminToken();
  if (!token) {
    console.error("No token returned from Medusa auth");
    process.exit(1);
  }

  // 1. Resolve sales channel ID
  let salesChannelId = SALES_CHANNEL_ID;
  if (!salesChannelId) {
    const channelsRes = await api("/admin/sales-channels", "GET", token);
    const channels = channelsRes.sales_channels || [];
    salesChannelId = channels[0]?.id;
    if (!salesChannelId) {
      console.error("No sales channel found. Set MEDUSA_SALES_CHANNEL_ID or create one in Admin.");
      process.exit(1);
    }
    console.log("Using sales channel:", salesChannelId);
  }

  // 2. List stock locations (with sales_channels relation)
  const locRes = await api("/admin/stock-locations?fields=*sales_channels", "GET", token);
  const locations = locRes.stock_locations || [];

  // 3. Find location already associated with our sales channel
  let targetLoc = locations.find((l: { sales_channels?: { id: string }[] }) =>
    l.sales_channels?.some((sc: { id: string }) => sc.id === salesChannelId)
  );

  if (!targetLoc) {
    // 4. Use first location or create one
    targetLoc = locations[0];
    if (!targetLoc) {
      const created = await api("/admin/stock-locations", "POST", token, {
        name: "Default Warehouse",
      });
      targetLoc = created.stock_location;
      if (!targetLoc) {
        console.error("Failed to create stock location");
        process.exit(1);
      }
      console.log("Created stock location:", targetLoc.id, targetLoc.name);
    } else {
      console.log("Using existing stock location:", targetLoc.id, targetLoc.name);
    }

    // 5. Associate sales channel with stock location
    await api(`/admin/stock-locations/${targetLoc.id}/sales-channels`, "POST", token, {
      add: [salesChannelId],
      remove: [],
    });
    console.log("Associated sales channel with stock location.");
  } else {
    console.log("Stock location already associated:", targetLoc.id, targetLoc.name);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
