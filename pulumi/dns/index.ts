require("dotenv").config({
  path: "../../.env",
});

import * as pulumi from "@pulumi/pulumi";
import * as technitiumProvider from "@pulumi/technitium";
import { DNSConfiguration } from "./types";
import { DnsZone } from "@pulumi/technitium/bin/dnsZone";
import { DnsZoneRecord } from "@pulumi/technitium/bin/dnsZoneRecord";

const config = new pulumi.Config();
const provider = new technitiumProvider.Provider("technitium", {
  host: "http://10.0.10.2:5380",
  token: process.env.TECHNITIUM_API_TOKEN,
});

/**
 * DNS rules
 **/
const dnsConfig = config.getObject<DNSConfiguration>("dnsRules");
const technitiumDnsZones: Array<DnsZone> = [];
const technitiumDnsRecords: Array<DnsZoneRecord> = [];

dnsConfig?.zones.forEach((dnsZone) => {
  const zone = new DnsZone(
    dnsZone.name,
    {
      name: dnsZone.name,
      type: dnsZone.type,
      dnssecValidation: true,
    },
    { provider },
  );

  technitiumDnsZones.push(zone);

  dnsZone.records.forEach((record) => {
    const domain = `${record.hostname}.${dnsZone.name}`;
    const dnsRecord = new DnsZoneRecord(
      domain,
      {
        zone: zone.name.apply((name) => name),
        domain,
        type: record.type,
        comments: record.comments,
        ipAddress: record.ipAddress,
      },
      { provider },
    );

    technitiumDnsRecords.push(dnsRecord);
  });
});
