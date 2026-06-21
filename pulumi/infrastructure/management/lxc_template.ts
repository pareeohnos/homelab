import * as pulumi from "@pulumi/pulumi";
import * as proxmox from "@muhlba91/pulumi-proxmoxve";
import provider from "./provider";
import { ProxmoxConfiguration, ProxmoxNodeNames } from "../types";

const config = new pulumi.Config();
const proxmoxConfig = config.requireObject<ProxmoxConfiguration>("proxmox");
const nodeConfig = proxmoxConfig.nodes[ProxmoxNodeNames.MANAGEMENT];

// Browse images here to get a different file
//
// http://download.proxmox.com/images/system/

export const lxcUbuntuTemplate = new proxmox.download.File(
  "mgmtUbuntu2604Template",
  {
    contentType: "vztmpl",
    datastoreId: "local",
    nodeName: nodeConfig.name,
    url: "http://download.proxmox.com/images/system/ubuntu-26.04-standard_26.04-1_amd64.tar.zst",
    fileName: "ubuntu-26.04-standard_26.04-1_amd64.tar.zst",
    checksum:
      "d5607f124d01f8ddfebd8e7da34c0022fb2a464e1662ee1e39a13f5ed1bae08a7364c486247fbd9f69f26c710729884ee5047aadb89f33a40066cd5f0d9def88",
    checksumAlgorithm: "sha512",
  },
  { provider },
);
