/**
 * The DNS is managed by Technitium, running in an LXC on Proxmox
 **/

import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { Hosts, ProxmoxNodeNames, HostsConfiguration } from "../types";
import { buildLxcConfiguration } from "./lxc_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");

export const dnsServerContainer = new proxmox.ct.Container(
  hostsConfig.dns.hostname,
  buildLxcConfiguration(ProxmoxNodeNames.NETWORKING, Hosts.DNS, {
    description: "Technitium DNS server",
  }),
  {
    provider,
  },
);
