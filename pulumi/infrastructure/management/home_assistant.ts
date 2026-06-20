import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { HostsConfiguration, ProxmoxConfiguration } from "../types";
import { remote } from "@pulumi/command";

const config = new pulumi.Config();

const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const hostsConfig = config.requireObject<HostsConfiguration>("hosts");
const nodeConfig = proxmoxConfig.nodes.management;
const version = "17.1";
const filename = `haos_ova-${version}.qcow2`;
const homeAssistantURL = `https://github.com/home-assistant/operating-system/releases/download/${version}/${filename}.xz`;

// const redownloadImage = "0";
const downloadHomeAssistant = new remote.Command("DownloadHomeAssistant", {
  connection: {
    host: "10.0.10.253",
    user: "ansible",
  },
  create: `
wget -nc -P /tmp/pulumi/ ${homeAssistantURL}
xz -d /tmp/pulumi/${filename}.xz
sudo mv /tmp/pulumi/${filename} /var/lib/vz/import/${filename}
sudo chown root:root /var/lib/vz/import/${filename}
`,
});

export const homeAssistantVm = new proxmox.vm.VirtualMachine(
  "homeAssistantVm",
  {
    nodeName: nodeConfig.name,
    name: hostsConfig.homeAssistant.hostname,
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
      fileId: "none",
      interface: "ide0",
    },
    description: "Home assistant home automation",
    disks: [
      {
        datastoreId: nodeConfig.dataStoreId,
        interface: "scsi0",
        size: 64,
        discard: "on",
        backup: true,
        iothread: true,
        fileFormat: "raw",
        ssd: true,
        importFrom: `local:import/${filename}`,
      },
    ],
    efiDisk: {
      datastoreId: nodeConfig.dataStoreId,
      type: "4m",
      preEnrolledKeys: false,
    },
    keyboardLayout: "en-gb",
    networkDevices: [
      {
        bridge: "vmbr0",
        disconnected: false,
        enabled: true,
        firewall: false,
        model: "virtio",
        queues: 4,
        vlanId: hostsConfig.homeAssistant.vlanId,
      },
    ],
    onBoot: true,
    operatingSystem: {
      type: "l26",
    },
    started: true,
    tags: (hostsConfig.homeAssistant.tags ?? []).sort(),
  },
  { provider, dependsOn: [downloadHomeAssistant] },
);
