import * as proxmox from "@muhlba91/pulumi-proxmoxve";

const provider = new proxmox.Provider("proxmoxve", {
  endpoint: process.env.NETWORK_PROXMOX_ENDPOINT,
  insecure: process.env.NETWORK_PROXMOX_INSECURE === "true",
  apiToken: process.env.NETWORK_PROXMOX_TOKEN_SECRET,
});

export default provider;
