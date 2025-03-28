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
        ports: bridge.ports ?? undefined,
        comment: bridge.comment,
        vlanAware: bridge.vlanAware ?? false,
        nodeName: proxmoxConfig.nodes.networking.name,
      } as NetworkBridgeArgs,
      { provider },
    );
  });

export const networkVlans = [
  new proxmox.network.NetworkVlan(
    "vmbr2.10",
    {
      name: "vmbr2.10",
      nodeName: proxmoxConfig.nodes.networking.name,
      comment: "Proxmox management",
      interface: "vmbr2",
      autostart: true,
      gateway: "10.0.10.1",
      address: "10.0.10.254/24",
      vlan: 10,
    },
    { provider }, //, import: `${proxmoxConfig.nodes.networking.name}:vmbr2.10` },
  ),
];
