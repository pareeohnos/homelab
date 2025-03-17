import { NetworkBridgeArgs } from "@muhlba91/pulumi-proxmoxve/network";

export enum ProxmoxNodeNames {
  NETWORKING = "networking",
}

export enum Hosts {
  DNS = "dns",
  ROUTER = "router",
  UNIFI = "unifiController",
}

export interface GeneralConfiguration {
  sshPublicKeyFilename: string;
}

interface HostConfiguration {
  hostname: string;
  ipAddress: string;
  tags?: Array<string>;
  vlanId: number;
}

export type HostsConfiguration = Record<Hosts, HostConfiguration>;

interface ProxmoxNetworkConfiguration {
  bridges: Array<NetworkBridgeArgs>;
  lanBridgeId: string;
}

interface ProxmoxNodeConfiguration {
  name: string;
  network: ProxmoxNetworkConfiguration;
}

type ProxmoxNodesConfiguration = Record<
  ProxmoxNodeNames,
  ProxmoxNodeConfiguration
>;

export interface ProxmoxConfiguration {
  dataStoreId: string;
  lxcTemplateFileId: string;
  nodes: ProxmoxNodesConfiguration;
}

export interface NetworkConfiguration {
  domain: string;
}
