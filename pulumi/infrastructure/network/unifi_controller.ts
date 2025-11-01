/**
 * The unifi controller is responsible for managing unifi products such
 * as the AP, and switch.
 **/

import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import {
  Hosts,
  HostsConfiguration,
  ProxmoxNodeNames,
  ProxmoxConfiguration,
} from "../types";
import { buildLxcConfiguration } from "./lxc_config";

const config = new pulumi.Config();

const hostsConfig = config.requireObject<HostsConfiguration>("hosts");
const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");

export const unifiControllerContainer = new proxmox.ct.Container(
  hostsConfig.unifiController.hostname,
  buildLxcConfiguration(ProxmoxNodeNames.NETWORKING, Hosts.UNIFI, {
    description: "Unifi controller",
    memory: {
      dedicated: 4096,
    },
  }),
  {
    provider,
  },
);
