require("dotenv").config({
  path: "../.env",
});

import { networkBridges, networkVlans } from "./network/network";
import { routerVm } from "./network/router";
import { dnsServerContainer } from "./network/dns";
import { unifiControllerContainer } from "./network/unifi_controller";

export const bridges = networkBridges;
export const router = routerVm;
export const dnsServer = dnsServerContainer;
export const unifiController = unifiControllerContainer;
