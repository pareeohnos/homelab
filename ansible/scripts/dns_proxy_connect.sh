#!/usr/bin/env bash
# Used as an SSH ProxyCommand (see group_vars/all/connection.yml) so Ansible
# can reach *.home.hooper.co.uk hosts over Tailscale. Tailscale's MagicDNS
# intercepts DNS on the control node and never forwards queries for this
# domain to the homelab's own DNS server, so plain hostname resolution
# fails. This resolves explicitly against that DNS server instead, then
# hands off to a plain TCP proxy via nc.
set -euo pipefail

host="$1"
port="$2"
dns_server="${ANSIBLE_DNS_SERVER:-10.0.10.1}"

if [[ "$host" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    ip="$host"
else
    ip=$(dig "@${dns_server}" +short "$host" | tail -1)
fi

if [[ -z "$ip" ]]; then
    echo "dns_proxy_connect: failed to resolve '$host' via $dns_server" >&2
    exit 1
fi

exec nc "$ip" "$port"
