import * as proxmox from "@muhlba91/pulumi-proxmoxve";

const provider = new proxmox.Provider("alps", {
  endpoint: process.env.ALPS_PROXMOX_ENDPOINT,
  insecure: process.env.ALPS_PROXMOX_INSECURE === "true",
  apiToken: process.env.ALPS_PROXMOX_TOKEN_SECRET,
});

export default provider;
