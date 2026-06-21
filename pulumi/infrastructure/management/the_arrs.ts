/**
 * The "arrs" are LXC containers for "arr" services:
 *
 * Sonarr
 * Radarr
 **/

import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { Hosts, ProxmoxNodeNames, HostsConfiguration } from "../types";
import { lxcUbuntuTemplate } from "./lxc_template";
import { buildLxcConfiguration } from "../lxc_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

export const sonarrContainer = new proxmox.ct.Container(
  hostsConfig.sonarr.hostname,
  buildLxcConfiguration(
    ProxmoxNodeNames.MANAGEMENT,
    Hosts.SONARR,
    {
      description: "Sonarr",
    },
    lxcUbuntuTemplate.id,
  ),
  { provider },
);

export const radarrContainer = new proxmox.ct.Container(
  hostsConfig.radarr.hostname,
  buildLxcConfiguration(
    ProxmoxNodeNames.MANAGEMENT,
    Hosts.RADARR,
    {
      description: "Radarr",
    },
    lxcUbuntuTemplate.id,
  ),
  { provider },
);
