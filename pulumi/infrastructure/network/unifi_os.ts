import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import {
  Hosts,
  ProxmoxNodeNames,
  HostsConfiguration,
  ProxmoxConfiguration,
} from "../types";
import { ubuntuVmTemplate } from "./vm_template";
import { buildVmConfiguration } from "../vm_config";

const config = new pulumi.Config();

const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const hostsConfig = config.requireObject<HostsConfiguration>("hosts");
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.NETWORKING];

export const unifiOsVm = new proxmox.vm.VirtualMachine(
  hostsConfig.unifiOs.hostname,
  buildVmConfiguration(
    ProxmoxNodeNames.NETWORKING,
    Hosts.UNIFI_OS,
    ubuntuVmTemplate.vmId,
    {
      description: "UniFi OS Server",
      cpu: {
        cores: 2,
        // Default type lacks modern instruction set support (SSE4.2/
        // AVX etc) that bundled dependencies like MongoDB can require -
        // see apps/immich.ts for the same fix applied to numpy. Single-
        // node-per-physical-host homelab, so no live-migration
        // portability to lose by passing through the host's real CPU.
        type: "host",
      },
      disks: [
        {
          datastoreId: nodeConfig.dataStoreId,
          interface: "scsi0",
          size: 32,
          discard: "on",
          backup: true,
          iothread: true,
          fileFormat: "raw",
          ssd: true,
        },
      ],
      memory: {
        dedicated: 4096,
      },
    },
  ),
  {
    provider,
    ignoreChanges: [
      // The provider always reads back a populated disks[].speed block
      // (iopsRead/Write etc, all zero/"unlimited") even though it's
      // never set here, so it shows as a perpetual diff on every
      // preview/up.
      "disks",
      // VM resources read back the SSH key with its trailing newline
      // stripped, so it always looks changed even when getSshKey()'s
      // output hasn't. Cosmetic only - not the case for LXC containers.
      "initialization.userAccount.keys",
    ],
  },
);
