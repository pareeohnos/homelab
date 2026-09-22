import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { Hosts, ProxmoxNodeNames, HostsConfiguration } from "../types";
import { ubuntuVmTemplate } from "./vm_template";
import { buildVmConfiguration } from "../vm_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

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
      },
      memory: {
        dedicated: 8192,
      },
    },
  ),
  {
    provider,
    ignoreChanges: [
      // The provider always reads back a populated disks[].speed block
      // (iopsRead/Write etc, all zero/"unlimited") even though it's never
      // set here, so it shows as a perpetual diff on every preview/up.
      // Can't target "disks[0].speed" directly - the engine rejects
      // ignoreChanges on a path that's entirely added/removed, so the
      // whole disks array is ignored instead.
      "disks",
      // VM resources read back the SSH key with its trailing newline
      // stripped, so it always looks changed even when getSshKey()'s
      // output hasn't. Cosmetic only - not the case for LXC containers,
      // which is why this isn't ignored there.
      "initialization.userAccount.keys",
    ],
  },
);
