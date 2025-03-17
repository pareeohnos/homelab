/**
 * Setup the network of the networking proxmox instance. This
 * will configure network bridges required for OPNSense to
 * communicate with the rest of the network and the other
 * VMs on this instance
 **/

import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { ProxmoxConfiguration } from "../types";
import { NetworkBridgeArgs } from "@muhlba91/pulumi-proxmoxve/network";

const config = new pulumi.Config();

const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");

// Create the network bridges as defined in the configuration
let interfaceNumber = 1;

export const networkBridges =
  proxmoxConfig.nodes.networking.network.bridges.map((bridge) => {
    const name = bridge.name || `vmbr${interfaceNumber}`;

    return new proxmox.network.NetworkBridge(
      name as string,
      {
        name,
        autostart: bridge.autostart,
        ports: bridge.ports,
        comment: bridge.comment,
        vlanAware: bridge.vlanAware ?? false,
        nodeName: proxmoxConfig.nodes.networking.name,
      } as NetworkBridgeArgs,
      { provider },
    );
  });
