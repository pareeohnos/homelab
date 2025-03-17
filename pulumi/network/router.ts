import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { HostsConfiguration, ProxmoxConfiguration } from "../types";
import { networkBridges } from "./network";

const config = new pulumi.Config();

const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

export const routerVm = new proxmox.vm.VirtualMachine(
  "routerVM",
  {
    nodeName: proxmoxConfig.nodes.networking.name,
    name: hostsConfig.router.hostname,
    bios: "ovmf",
    cpu: {
      cores: 4,
      sockets: 1,
    },
    machine: "q35",
    memory: {
      dedicated: 4096,
    },
    cdrom: {
      enabled: false,
      // fileId: "local:iso/OPNsense-25.1-dvd-amd64.iso",
      interface: "ide0",
    },
    description: "OPNSense firewall and router",
    disks: [
      {
        datastoreId: proxmoxConfig.dataStoreId,
        interface: "scsi0",
        size: 64,
        discard: "on",
        backup: true,
        iothread: true,
        fileFormat: "raw",
        ssd: true,
      },
    ],
    efiDisk: {
      datastoreId: proxmoxConfig.dataStoreId,
      type: "4m",
      preEnrolledKeys: true,
    },
    keyboardLayout: "en-gb",
    networkDevices: networkBridges.map((bridge) => ({
      bridge: bridge.name,
      disconnected: false,
      enabled: true,
      firewall: false,
      model: "virtio",
      queues: 4,
    })),
    onBoot: true,
    operatingSystem: {
      type: "l26",
    },
    started: true,
    tags: (hostsConfig.router.tags ?? []).sort(),
  },
  { provider },
);
