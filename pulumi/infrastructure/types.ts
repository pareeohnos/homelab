import { NetworkBridgeArgs } from "@muhlba91/pulumi-proxmoxve/network";

export enum ProxmoxNodeNames {
  NETWORKING = "networking",
  MANAGEMENT = "management",
}

export enum Hosts {
  // Networking hosts
  DNS = "dns",
  ROUTER = "router",
  UNIFI = "unifiController",

  // Management hosts
  HOME_ASSISTANT = "homeAssistant",
  SONARR = "sonarr",
  RADARR = "radarr",
  NZB_GET = "nzbget",
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
