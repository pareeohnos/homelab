import { NetworkBridgeArgs } from "@muhlba91/pulumi-proxmoxve/network";

export enum ProxmoxNodeNames {
  NETWORKING = "networking",
  MANAGEMENT = "management",
}

export enum Hosts {
  DNS = "dns",
  ROUTER = "router",
  UNIFI = "unifiController",
  HOME_ASSISTANT = "homeAssistant",
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
  dataStoreId: string;
  lxcTemplateFileId: string;
  network: ProxmoxNetworkConfiguration;
}

type ProxmoxNodesConfiguration = Record<
  ProxmoxNodeNames,
  ProxmoxNodeConfiguration
>;

export interface ProxmoxConfiguration {
  nodes: ProxmoxNodesConfiguration;
}

export interface NetworkConfiguration {
  domain: string;
}
