import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { HostsConfiguration, ProxmoxConfiguration } from "../types";
import { remote } from "@pulumi/command";

const config = new pulumi.Config();

const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const hostsConfig = config.requireObject<HostsConfiguration>("hosts");
const nodeConfig = proxmoxConfig.nodes.apps;
const version = "17.1";
const filename = `haos_ova-${version}.qcow2`;
const homeAssistantURL = `https://github.com/home-assistant/operating-system/releases/download/${version}/${filename}.xz`;

// const redownloadImage = "0";
//
// KNOWN ISSUE: this resource's stored `stderr` output once grew to
// ~780KB of wget's \r-updating progress bar text (wget writes progress
// to stderr by default), which was large/noisy enough to crash the
// `command` provider plugin on every single diff of this otherwise
// unchanged resource - "exited prematurely" with no captured output,
// misleadingly looking like a memory/concurrency/version issue. Fixed
// once via direct state surgery (truncated the stored stderr via
// `pulumi stack export`/`import`), not by anything in this file - the
// `create` script here is deliberately left matching what's already
// stored (plain wget, no progress flags) so Pulumi sees no diff and
// never re-runs it.
//
// If this ever needs to genuinely re-execute (e.g. rebuilding the Alps
// host from scratch), two things to watch for:
// 1. Add a quiet/compact progress flag first (e.g. `wget
//    --progress=dot:giga`) so the same oversized-stderr problem doesn't
//    reoccur.
// 2. Separately, actually triggering an update/re-run of this resource
//    was observed to fail instantly with "EOF: running ..." even with
//    quiet output, a generous perDialTimeout, and an explicit
//    agentSocketPath - root cause not identified. Worth investigating
//    fresh (or just running the create script by hand over SSH and
//    importing the result into state, as was done here) rather than
//    assuming it'll just work.
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
  {
    provider,
    dependsOn: [downloadHomeAssistant],
    // The provider always reads back a populated disks[].speed block
    // (iopsRead/Write etc, all zero/"unlimited") even though it's never
    // set here, so it shows as a perpetual diff on every preview/up.
    // Can't target "disks[0].speed" directly - the engine rejects
    // ignoreChanges on a path that's entirely added/removed, so the
    // whole disks array is ignored instead.
    ignoreChanges: ["disks"],
  },
);
