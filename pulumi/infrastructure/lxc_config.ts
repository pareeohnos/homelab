import * as pulumi from "@pulumi/pulumi";
import { ContainerArgs } from "@muhlba91/pulumi-proxmoxve/ct";
import {
  Hosts,
  HostsConfiguration,
  NetworkConfiguration,
  ProxmoxConfiguration,
  ProxmoxNodeNames,
} from "./types";
import { getSshKey } from "./utils";

export const buildLxcConfiguration = (
  proxmoxNode: ProxmoxNodeNames,
  hostname: Hosts,
  overrides?: Partial<ContainerArgs>,
  templatefileId?: String | pulumi.OutputInstance<String>,
): ContainerArgs => {
  const config = new pulumi.Config();
  const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
  const networkConfig = config.requireObject<NetworkConfiguration>("network");
  const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

  const nodeConfig = proxmoxConfig.nodes[proxmoxNode];
  const hostConfig = hostsConfig[hostname];

  return Object.assign(
    {
      console: {
        enabled: true,
      },
      cpu: {
        cores: 1,
      },
      disk: {
        acl: false,
        datastoreId: nodeConfig.dataStoreId,
        mountOptions: [],
        quota: false,
        replicate: false,
        size: 8,
      },
      features: {
        nesting: true,
        mounts: [],
      },
      initialization: {
        dns: {
          domain: networkConfig.domain,
        },
        hostname: hostConfig.hostname,
        ipConfigs: [
          {
            ipv4: {
              address: `${hostConfig.ipAddress}/24`,
              gateway: hostsConfig.router.ipAddress,
            },
          },
        ],
        userAccount: {
          keys: [getSshKey()],
        },
      },
      networkInterfaces: [
        {
          name: "eth0",
          enabled: true,
          bridge: nodeConfig.network.lanBridgeId,
          firewall: false,
          vlanId: hostConfig.vlanId,
        },
      ],
      nodeName: nodeConfig.name,
      operatingSystem: {
        templateFileId: templatefileId || nodeConfig.lxcTemplateFileId,
        type: "ubuntu",
      },
      protection: true,
      startOnBoot: true,
      tags: (hostConfig.tags ?? []).sort(),
      unprivileged: true,
    },
    overrides ?? {},
  );
};
