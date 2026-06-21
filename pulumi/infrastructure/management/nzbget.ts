import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { Hosts, ProxmoxNodeNames, HostsConfiguration } from "../types";
import { lxcUbuntuTemplate } from "./lxc_template";
import { buildLxcConfiguration } from "../lxc_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

export const nzbgetContainer = new proxmox.ct.Container(
  hostsConfig.nzbget.hostname,
  buildLxcConfiguration(
    ProxmoxNodeNames.MANAGEMENT,
    Hosts.NZB_GET,
    {
      description: "NZBGet",
    },
    lxcUbuntuTemplate.id,
  ),
  { provider },
);
