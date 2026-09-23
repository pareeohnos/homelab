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
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.MANAGEMENT];

export const immichVm = new proxmox.vm.VirtualMachine(
  hostsConfig.immich.hostname,
  buildVmConfiguration(
    ProxmoxNodeNames.MANAGEMENT,
    Hosts.IMMICH,
    ubuntuVmTemplate.vmId,
    {
      description: "Immich photo management",
      cpu: {
        cores: 2,
        // Default type lacks SSE4.2/x86-64-v2, which the ML container's
        // numpy wheel requires ("RuntimeError: NumPy was built with
        // baseline optimizations... but your machine doesn't support").
        // Single-node homelab, so no live-migration portability to lose
        // by passing through the host's real CPU features.
        type: "host",
      },
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
        },
      ],
      memory: {
        dedicated: 8192,
      },
    },
  ),
  {
    provider,
    ignoreChanges: [
      // VM resources read back the SSH key with its trailing newline
      // stripped, so it always looks changed even when getSshKey()'s
      // output hasn't. Cosmetic only - not the case for LXC containers,
      // which is why this isn't ignored there.
      "initialization.userAccount.keys",
    ],
  },
);
