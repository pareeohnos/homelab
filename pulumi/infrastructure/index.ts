require("dotenv").config({
  path: "../../.env",
});

// Network
import { networkBridges, networkVlans } from "./network/network";
import { routerVm } from "./network/router";
import { dnsServerContainer } from "./network/dns";
import { unifiControllerContainer } from "./network/unifi_controller";

// Apps
import { homeAssistantVm } from "./apps/home_assistant";
import { nzbgetContainer } from "./apps/nzbget";
import { sonarrContainer, radarrContainer } from "./apps/the_arrs";
import { plexContainer } from "./apps/plex";
import { immichVm } from "./apps/immich";

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
 * Apps host
 *
 * The following resources are all for the apps host "Alps". This hosts the
 * user-facing applications running in the homelab - media (Sonarr, Radarr,
 * NZBGet, Plex), photos (Immich), home automation (Home Assistant), etc.
 **/
export const appsHomeAssistantVm = homeAssistantVm;
export const appsSonarrContainer = sonarrContainer;
export const appsRadarrContainer = radarrContainer;
export const appsNzbGetContainer = nzbgetContainer;
export const appsPlexContainer = plexContainer;
export const appsImmichVm = immichVm;
