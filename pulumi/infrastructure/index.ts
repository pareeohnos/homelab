require("dotenv").config({
  path: "../../.env",
});

// Network
import { networkBridges, networkVlans } from "./network/network";
import { routerVm } from "./network/router";
import { dnsServerContainer } from "./network/dns";
import { unifiControllerContainer } from "./network/unifi_controller";

// Management
import { homeAssistantVm } from "./management/home_assistant";
import { nzbgetContainer } from "./management/nzbget";
import { sonarrContainer, radarrContainer } from "./management/the_arrs";

/**
 * Network host
 *
 * The following resources are all for the primary network host "Himalayas".
 * This machine manages the network and anything network related.
 **/
export const himalayasBridges = networkBridges;
export const himalayasVlans = networkVlans;
export const himalayasRouterVm = routerVm;
export const himalayasDnsServer = dnsServerContainer;
export const himalayasUnifiController = unifiControllerContainer;

/**
 * Management host
 *
 * The following resources are all for the management host "Alps". This contains
 * VM's for the management and running of the rest of the homelabe. For example,
 * a kubernetes master node, HomeAssistant, Git etc
 **/
export const managementHomeAssistantVm = homeAssistantVm;
export const managementSonarrContainer = sonarrContainer;
export const managementRadarrContainer = radarrContainer;
export const managementNzggetContainer = nzbgetContainer;
