import * as pulumi from "@pulumi/pulumi";
import { VirtualMachineArgs } from "@muhlba91/pulumi-proxmoxve/vm";
import {
  Hosts,
  HostsConfiguration,
  NetworkConfiguration,
  ProxmoxConfiguration,
  ProxmoxNodeNames,
} from "./types";
import { getSshKey } from "./utils";

// Builds a VM by cloning a pre-built cloud-init template (see
// management/vm_template.ts) rather than installing an OS from scratch -
// the disk image already has an OS on it, so there's no installer step to
// automate. Per-VM identity (hostname/IP/SSH keys) is applied via
// cloud-init on first boot, the same way buildLxcConfiguration configures
// a container clone.
export const buildVmConfiguration = (
  proxmoxNode: ProxmoxNodeNames,
  hostname: Hosts,
  templateVmId: pulumi.Input<number>,
  overrides?: Partial<VirtualMachineArgs>,
): VirtualMachineArgs => {
  const config = new pulumi.Config();
  const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
  const networkConfig = config.requireObject<NetworkConfiguration>("network");
  const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

  const nodeConfig = proxmoxConfig.nodes[proxmoxNode];
  const hostConfig = hostsConfig[hostname];

  return Object.assign(
    {
      agent: {
        enabled: true,
      },
      clone: {
        vmId: templateVmId,
        full: true,
      },
      cpu: {
        cores: 1,
      },
      initialization: {
        datastoreId: nodeConfig.dataStoreId,
        dns: {
          domain: networkConfig.domain,
        },
        ipConfigs: [
          {
            ipv4: {
              address: `${hostConfig.ipAddress}/24`,
              gateway: `10.0.${hostConfig.vlanId}.1`,
            },
          },
        ],
        userAccount: {
          keys: [getSshKey()],
        },
      },
      memory: {
        dedicated: 1024,
      },
      name: hostConfig.hostname,
      networkDevices: [
        {
          bridge: nodeConfig.network.lanBridgeId,
          firewall: false,
          vlanId: hostConfig.vlanId,
        },
      ],
      nodeName: nodeConfig.name,
      onBoot: true,
      protection: true,
      tags: (hostConfig.tags ?? []).sort(),
    },
    overrides ?? {},
  );
};
