enum DNSRecordType {
  A = "A",
  AAAA = "AAA",
  NS = "NS",
  CNAME = "CNAME",
  PTR = "PTR",
  MX = "MX",
  TXT = "TXT",
  SRV = "SRV",
  DNAME = "DNAME",
  DS = "DS",
  SSHFP = "SSHFP",
  TLSA = "TLSA",
  SVCB = "SVCB",
  HTTPS = "HTTPS",
  URI = "URI",
  CAA = "CAA",
}

export interface DNSConfiguration {
  zones: Array<DNSZone>;
}

export interface DNSRecord {
  type: DNSRecordType;
  ipAddress: string;
  hostname: string;
  comments?: string;
}

export interface DNSZone {
  name: string;
  type: string;
  records: Array<DNSRecord>;
}
