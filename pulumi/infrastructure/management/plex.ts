import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import {
  Hosts,
  ProxmoxNodeNames,
  HostsConfiguration,
  ProxmoxConfiguration,
} from "../types";
import { lxcUbuntuTemplate } from "./lxc_template";
import { buildLxcConfiguration } from "../lxc_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");
const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.MANAGEMENT];

export const plexContainer = new proxmox.ct.Container(
  hostsConfig.plex.hostname,
  buildLxcConfiguration(
    ProxmoxNodeNames.MANAGEMENT,
    Hosts.PLEX,
    {
      cpu: {
        cores: 2,
      },
      description: "Plex",
      disk: {
        acl: false,
        datastoreId: nodeConfig.dataStoreId,
        mountOptions: [],
        quota: false,
        replicate: false,
        size: 64,
      },
    },
    lxcUbuntuTemplate.id,
  ),
  { provider },
);
