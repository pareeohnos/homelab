# Homelab

Home consists of

- OPNSense router
- Technitium DNS
- Unifi Controller
- Home assistant

### VLANs

The network is segregated into the following VLANs

- **10** : Management/Infrastructure (switches, DNS etc)
- **20** : Trusted devices (our PCs, phones etc)
- **30** : Guest
- **40** : Media (Plex, Apple TV)
- **50** : IOT
- **60** : Security (cameras)
- **70** : Homelab (dev stuff, playing with things)

### Physical hosts

The below hosts are physical machines, mostly virtulisation hosts such as
proxmox or kubernetes nodes.

- Himalayas - network proxmox host. 10.0.10.254
- Alps - management proxmox host. 10.0.10.253

### Static IP Addresses + hostnames

- DNS server - lxc-dns-01 (10.0.10.2)
- Unifi network application - lxc-unifi-controller-01 (10.0.10.3)

Key URLs

- OPNSense - `vm-router-01.home.hooper.co.uk` or `10.0.10.1`
- DNS server - `lxc-dns-01.home.hooper.co.uk:5380/`
- Unifi controller - `lxc-unifi-controller-01.home.hooper.co.uk:8443`
- Home assistant - `vm-home-assistant-01`

### All hosts

- OPNSense - `vm-router-01.home.hooper.co.uk` or `10.0.10.1`. VLAN 10
- DNS server - `lxc-dns-01.home.hooper.co.uk:5380/` VLAN 10
- Unifi controller - `lxc-unifi-controller-01.home.hooper.co.uk:8443` VLAN 10

- Home assistant - `vm-home-assistant-01`, 10.0.70.2 VLAN 70

- OPNSense

## 1. Preparation

The below steps are required before everything can be setup. For any of the
steps involving Proxmox, it will need repeating for each proxmox host.

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
pveum role add pulumi-role -privs "VM.Allocate VM.Clone VM.Config.CDROM VM.Config.CPU VM.Config.Cloudinit VM.Config.Disk VM.Config.HWType VM.Config.Memory VM.Config.Network VM.Config.Options VM.Monitor VM.Audit VM.PowerMgmt Datastore.AllocateSpace Datastore.Audit Sys.Modify SDN.Use Sys.Console"
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

**Note** Replace the IP address with the proxmox host being managed

### Proxmox post-install

Run this is a proxmox shell

```bash
bash -c "$(wget -qLO - https://github.com/tteck/Proxmox/raw/main/misc/post-pve-install.sh)"
```

---

## Setup infrastructure

Pulumi is used to setup the various hosts in the homelab. This will create any VMs
and containers required. The pulumi configuration is split into multiple apps.
For setting up the intrastructure, the `infrastructure` project is required.

```bash
cd pulumi/infrastructure
pulumi up
```

## Setup network

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

## Software

Now we're on to Ansible. First things first, grab any dependencies we have. The
second install line will just ensure that everything is fully up to date.

```bash
ansible-galaxy install -r requirements.yml
ansible-galaxy install -r requirements.yml --force
```

Next we're going to lock down the servers. This will setup a
new `ansible` user, and prevent ssh access for the `root` user. The existing
authorized SSH key that the `root` user has will be copied to the `ansible`
user, so you will still be able to connect on the management VLAN.

```bash
ansible-playbook playbooks/lockdown.yml
```

Once this has finished, you will no longer be able to access the hosts via the
`root` user.

To continue, you'll need to ensure that the `OPNSense` router has internet, as
the remaining steps are going to download packages.


### DNS server

The `dns` playbook can be used to install technitium DNS server

```bash
cd ansible
ansible-playbook playbooks/dns.yml
```

Once the DNS server itself is up and running, `pulumi` can be used to maintain
the DNS rules. The pulumi directory has a `dns` project in it, and a configuration
file `Pulumi.yaml` containing all of the DNS rules.

To add new DNS zones and rules, simply alter then in the `Pulumi.yaml` file and
then re-run `pulumi up`.

```bash
cd pululmi/dns
pulumi up
```

### Unifi controller

The `unifi` playbook can be used to install the unifi network application.

```bash
ansible-playbook playbooks/unifi.yml
```

Once finished, the unifi controller will be available at `https://lxc-unifi-controller-01.home.hooper.co.uk:8443`

To configure the switch itself, ensure that the controller has some additional
ports open with ufw

8080/tcp for inform/adoption process
8443/tcp for web interface

Switch uses VLAN 1 for management by default and its hard to make it do anything
else. Configure OPNSense to have a default interface on LAN and permit all
traffic to mgmt vlan. Then set inform URL on switch and it should work.


```bash
set-inform 10.0.10.3:8080/inform
```


## Other

Some useful bits of info

- Default `proxmox` username is `root`
- Default `technitium` username is `admin`

## Troublshooting

I had issues with pulumi terraform packages not building correctly. Once a new
provider is installed try the following if it's not working

```bash
cd sdks/<package>
touch pnpm-workspace.yaml
pnpm install
pnpm run build
pnpm run postinstall
cd ../..
rm -rf node_modules/@pulumi/<package name>
pnpm install
```

Make sure any `import` statements reference the right folders (e.g. /bin) for
where the built typescript lives, otherwise it complains about not being able
to manage types from node_modules
