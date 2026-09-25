import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { ProxmoxConfiguration, ProxmoxNodeNames } from "../types";

const config = new pulumi.Config();
const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.APPS];

// Browse cloud images here to get a different release
//
// https://cloud-images.ubuntu.com/releases/
//
// Matches the 26.04 release already used for the LXC template
// (apps/lxc_template.ts).

// contentType "import" (not "iso") is what makes this usable as a VM
// disk source via importFrom below - Proxmox 8.1+'s native cloud image
// import feature, not a boot ISO.
export const ubuntuCloudImage = new proxmox.download.File(
  "mgmtUbuntu2604CloudImage",
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
// only to be cloned from (see buildVmConfiguration). Rebuild this (e.g.
// bump the image/checksum) to roll a newer base image out to future VMs;
// existing clones are unaffected until recreated.
export const ubuntuVmTemplate = new proxmox.vm.VirtualMachine(
  "mgmtUbuntuVmTemplate",
  {
    nodeName: nodeConfig.name,
    name: "template-ubuntu-2604-cloudimg",
    template: true,
    started: false,
    agent: {
      enabled: true,
    },
    // Without this, the provider defaults to a physical CD-ROM
    // passthrough device rather than a genuinely empty virtual drive.
    // Harmless on the template itself (it's never started), but clones
    // inherit this device as-is alongside whatever buildVmConfiguration
    // sets separately - so it has to be fixed here too, not just there.
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
    // Can't target "disks[0].speed" directly - the engine rejects
    // ignoreChanges on a path that's entirely added/removed, so the
    // whole disks array is ignored instead.
    ignoreChanges: ["disks"],
  },
);
