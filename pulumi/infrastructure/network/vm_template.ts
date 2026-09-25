import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { ProxmoxConfiguration, ProxmoxNodeNames } from "../types";

const config = new pulumi.Config();
const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.NETWORKING];

// Browse cloud images here to get a different release
//
// https://cloud-images.ubuntu.com/releases/
//
// Matches the 26.04 release already used for the apps node's own VM
// template (apps/vm_template.ts).
export const ubuntuCloudImage = new proxmox.download.File(
  "himalayasUbuntu2604CloudImage",
  {
    contentType: "import",
    datastoreId: "local",
    nodeName: nodeConfig.name,
    fileName: "ubuntu-26.04-server-cloudimg-amd64.qcow2",
    url: "https://cloud-images.ubuntu.com/releases/26.04/release/ubuntu-26.04-server-cloudimg-amd64.img",
    checksum: "4908fb59ccd4e87ae4e8e973b7ef56f535448eacb24a87fd787270c0048987bc",
    checksumAlgorithm: "sha256",
  },
  { provider },
);

// One-time "golden" VM, built once and never started itself - it exists
// only to be cloned from (see vm_config.ts's buildVmConfiguration).
// Rebuild this (e.g. bump the image/checksum) to roll a newer base
// image out to future VMs on this node; existing clones are unaffected
// until recreated.
export const ubuntuVmTemplate = new proxmox.vm.VirtualMachine(
  "himalayasUbuntuVmTemplate",
  {
    nodeName: nodeConfig.name,
    name: "template-ubuntu-2604-cloudimg",
    template: true,
    started: false,
    agent: {
      enabled: true,
    },
    // Without this, the provider defaults to a physical CD-ROM
    // passthrough device rather than a genuinely empty virtual drive -
    // QEMU then fails to start entirely, since the Proxmox host has no
    // physical optical drive to pass through. Clones inherit this
    // device as-is, so it has to be fixed here, not just on the clone.
    cdrom: {
      fileId: "none",
      interface: "ide0",
    },
    cpu: {
      cores: 1,
    },
    memory: {
      dedicated: 512,
    },
    disks: [
      {
        datastoreId: nodeConfig.dataStoreId,
        interface: "scsi0",
        importFrom: ubuntuCloudImage.id,
      },
    ],
    networkDevices: [
      {
        bridge: nodeConfig.network.lanBridgeId,
      },
    ],
    initialization: {
      datastoreId: nodeConfig.dataStoreId,
    },
    operatingSystem: {
      // Proxmox's ostype for a modern (2.6+ kernel) Linux guest.
      type: "l26",
    },
  },
  {
    provider,
    // The provider always reads back a populated disks[].speed block
    // (iopsRead/Write etc, all zero/"unlimited") even though it's never
    // set here, so it shows as a perpetual diff on every preview/up.
    ignoreChanges: ["disks"],
  },
);
