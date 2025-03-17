# Homelab

Home consists of

- OPNSense router
- Technitium DNS
- Unifi Controller

VLANs

- **10** : Management/Infrastructure (switches, DNS etc)
- **20** : Trusted devices (our PCs, phones etc)
- **30** : Guest
- **40** : Media (Plex, Apple TV)
- **50** : IOT
- **60** : Security (cameras)
- **70** : Homelab (dev stuff, playing with things)

## 1. Preparation

The below steps are required before everything can be setup.

### LXC template

Proxmox will need an LXC container template ready for the containers that this
project will create. Initially however it will have no internet connection, so
will require manually uploading

- Go to CT Templates
- Click "Templates"
- Attempt to download one, but copy the URL that it's trying to download
- Manually download, and then upload to Proxmox

Now it's ready.

### Proxmox users

For proxmox instances, a new user is required for the automation scripts to communicate.

```bash
pveum role add pulumi-role -privs "VM.Allocate VM.Clone VM.Config.CDROM VM.Config.CPU VM.Config.Cloudinit VM.Config.Disk VM.Config.HWType VM.Config.Memory VM.Config.Network VM.Config.Options VM.Monitor VM.Audit VM.PowerMgmt Datastore.AllocateSpace Datastore.Audit Sys.Modify SDN.Use"
pveum user add pulumi@pve
pveum aclmod / -user pulumi@pve -role pulumi-role
pveum user token add pulumi@pve pulumi-token --privsep=0
```

You'll get some output a bit like the following:

┌──────────────┬──────────────────────────────────────┐
│ key          │ value                                │
╞══════════════╪══════════════════════════════════════╡
│ full-tokenid │ pulumi@pve!pulumi-token              │
├──────────────┼──────────────────────────────────────┤
│ info         │ {"privsep":"0"}                      │
├──────────────┼──────────────────────────────────────┤
│ value        │ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx │
└──────────────┴──────────────────────────────────────┘

Make a note of the tokens, specifically `full-tokenid` and `value`.
Update `.env` file to include the values:

```bash
NETWORK_PROXMOX_ENDPOINT="https://10.0.10.254:8006"
NETWORK_PROXMOX_INSECURE=true
NETWORK_PROXMOX_TOKEN_SECRET={FULL TOKEN ID HERE}={VALUE HERE}
```

---

## Setup infrastructure

Pulumi is used to setup the various hosts in the homelab. This will create any VMs
and containers required.

```bash
pulumi up
```

## Network

Now that the VMs themselves are setup, we need to start building the network

### Install OPNSense

For the time being, OPNSense is not installed automatically and requires a manual
step. Install OPNSense in the newly created router vm. Ensure that its IP address
on the LAN is configured correctly to match the management VLAN (10.0.10.1).

***NOTE***: Kept getting error about "Access denied" to DVD drive trying to install
OPNSense.
Go into BIOS of VM and disable secure boot.

### Configure OPNSense

Import config xml file

### Software

Ansible
