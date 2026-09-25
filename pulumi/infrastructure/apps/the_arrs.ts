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
    ProxmoxNodeNames.APPS,
    Hosts.SONARR,
    {
      description: "Sonarr",
    },
    lxcUbuntuTemplate.id,
  ),
  {
    provider,
    ignoreChanges: [
      // Use `pct resize` in proxmox instead to avoid recreating the container
      "disk.size",
      // Bind mount points are managed by ansible (playbooks/mount_shares.yml,
      // roles/lxc_share_mounts) - Proxmox only allows the API user root@pam
      // to create bind-type mount points, which this project's Pulumi
      // service account intentionally isn't.
      "mountPoints",
    ],
  },
);

export const radarrContainer = new proxmox.ct.Container(
  hostsConfig.radarr.hostname,
  buildLxcConfiguration(
    ProxmoxNodeNames.APPS,
    Hosts.RADARR,
    {
      description: "Radarr",
    },
    lxcUbuntuTemplate.id,
  ),
  {
    provider,
    ignoreChanges: [
      // Use `pct resize` in proxmox instead to avoid recreating the container
      "disk.size",
      // Bind mount points are managed by ansible (playbooks/mount_shares.yml,
      // roles/lxc_share_mounts) - Proxmox only allows the API user root@pam
      // to create bind-type mount points, which this project's Pulumi
      // service account intentionally isn't.
      "mountPoints",
    ],
  },
);
