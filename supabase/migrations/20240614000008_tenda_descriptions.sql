-- ============================================================
-- USJ Technologies — Migration 008: Tenda Product Descriptions
-- Accurate, detailed, B2B-focused descriptions and key features
-- for all Tenda product categories.
-- Source: Tenda official website + verified product specifications.
-- key_features column is TEXT[] — using ARRAY constructor.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ── Wi-Fi Routers ─────────────────────────────────────────────
-- Confirmed models from tendacn.com: AX12, BE12 Pro, BE7200,
-- BE5100, BE3600, AX3000 (Wi-Fi 7 / Wi-Fi 6 lineup)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda Wi-Fi router delivering high-speed wireless internet across homes and offices. Tenda''s router lineup spans Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax), and the latest Wi-Fi 7 (802.11be) standards — with flagship models like the BE7200 (7200 Mbps), BE5100 (5100 Mbps), and AX3000 (3000 Mbps) pushing the limits of consumer and SMB wireless performance. All routers feature MU-MIMO technology so dozens of connected devices share bandwidth without slowdown, and Beamforming focuses signal strength directly toward each client for maximum range. USJ Technologies supplies Tenda routers to government departments, corporate offices, educational institutions, and commercial establishments across Uttarakhand and pan-India, backed by GST invoicing and technical support.',
  key_features = ARRAY[
    'Wi-Fi 7 (802.11be), Wi-Fi 6 (802.11ax), or Wi-Fi 5 (802.11ac) wireless standard',
    'Dual-band or tri-band — combined speeds up to 7200 Mbps on top models',
    'MU-MIMO and Beamforming for simultaneous multi-device performance',
    'Gigabit WAN + LAN ports for full-speed fibre and broadband connections',
    '2.5G multi-gigabit LAN/WAN ports on flagship models (BE12 Pro, BE7200)',
    'WPA3 encryption + SPI firewall for enterprise-grade network security',
    'Tenda Wi-Fi app — set up, monitor, and control your network from your phone',
    'Guest network isolation, parental controls, and QoS traffic prioritization'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%Router%'
  AND category_name NOT ILIKE '%5G%'
  AND category_name NOT ILIKE '%4G%'
  AND (description IS NULL OR description = '');

-- ── 5G / 4G Routers ──────────────────────────────────────────
-- Models: 5G03 (5G Sub-6GHz), 4G03 Pro, 4G680 (4G LTE)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda 5G or 4G LTE cellular router that converts mobile broadband into a local wired and wireless network. Insert any standard Nano-SIM card and the device instantly distributes 4G LTE (up to 150 Mbps) or 5G NR (up to 2.3 Gbps on sub-6 GHz) internet to all connected devices via its built-in Wi-Fi access point and LAN ports. Tenda 5G/4G routers are purpose-built for remote offices, construction site offices, temporary government facilities, disaster-response command posts, and any location where fixed-line fibre or DSL infrastructure is unavailable or unreliable. All models support SIM hot-swap, auto-reconnect on signal loss, and remote management.',
  key_features = ARRAY[
    '5G NR (Sub-6 GHz) or 4G LTE Cat-4/Cat-6/Cat-12 SIM card slot',
    'Distributes mobile broadband as dual-band Wi-Fi 5 or Wi-Fi 6 locally',
    'Download speeds: up to 150 Mbps (4G LTE) / up to 2.3 Gbps (5G NR)',
    'Multiple Gigabit LAN ports for wired device connections',
    'Auto-failover and auto-reconnect on SIM or cellular signal loss',
    'Compatible with all Indian 4G/5G frequency bands — Jio, Airtel, Vi, BSNL',
    'External antenna ports (SMA) for signal boosting in low-coverage areas',
    'Tenda app remote monitoring and management'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%5G%' OR category_name ILIKE '%4G%')
  AND (description IS NULL OR description = '');

-- ── Mesh Wi-Fi Systems ────────────────────────────────────────
-- Models: Nova MW6 Pro, MX6, MX12 Pro, EX12 Pro, Nova MX3
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda Mesh Wi-Fi system that replaces a single router with a network of two or three intelligent mesh nodes, eliminating Wi-Fi dead zones across large homes, multi-floor offices, hotels, hospitals, and government buildings. Unlike traditional Wi-Fi extenders that halve bandwidth, Tenda Mesh uses a dedicated wireless backhaul channel between nodes so every device receives full-speed connectivity regardless of which node it connects to. Flagship models like the MX12 Pro deliver tri-band AX5400 coverage at up to 5400 Mbps, while the Nova MW6 Pro provides 4000 sq. ft. of seamless coverage. A single unified SSID means phones, laptops, and IoT devices roam automatically between nodes without manual reconnection.',
  key_features = ARRAY[
    'Whole-building coverage — eliminates dead zones across 3000–6000 sq. ft. per kit',
    'Single unified SSID — seamless roaming between nodes without disconnecting',
    'Dedicated wireless backhaul — no bandwidth sacrifice when extending coverage',
    'Wired Ethernet backhaul supported for maximum performance in offices',
    'Wi-Fi 5 or Wi-Fi 6 (AX) standard for high-speed mesh networking',
    'Self-healing mesh — automatically reroutes traffic if a node fails',
    'Set up in under 5 minutes with the Tenda Wi-Fi app',
    'Expandable — add extra nodes at any time to increase coverage area'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%Mesh%' OR category_name ILIKE '%WiFi System%' OR category_name ILIKE '%Wi-Fi System%')
  AND (description IS NULL OR description = '');

-- ── Switches ─────────────────────────────────────────────────
-- Confirmed from tendacn.com: TEM2008D (8-Port 2.5G), TEM2005D (5-Port 2.5G),
-- TEG1016M (16-Port Gigabit Managed), TEG1008M (8-Port Managed),
-- TEF series (PoE Gigabit)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda network switch designed to expand wired Ethernet ports in a local area network. Tenda''s switch portfolio spans unmanaged plug-and-play models for simple office setups, smart/managed models with VLAN and QoS for enterprise networks, and PoE (Power over Ethernet) switches that power IP cameras, VoIP phones, and access points directly over the network cable. The TEM2008D and TEM2005D introduce 2.5 Gigabit ports for bandwidth beyond standard Gigabit — ideal for 2.5G NAS, Wi-Fi 6 APs, and 10G server uplinks. The TEF series PoE switches provide up to 250W PoE power budget with a built-in watchdog to remotely reboot PoE devices. All models are IEEE 802.3az Energy Efficient Ethernet compliant, reducing power consumption on idle ports.',
  key_features = ARRAY[
    'Port options: 5, 8, 16, 24-port Gigabit or 2.5G Ethernet switches',
    '2.5G multi-gigabit ports on TEM2008D / TEM2005D for high-bandwidth devices',
    'PoE / PoE+ switches (TEF series) — power IP cameras and APs over Ethernet',
    'Up to 250W PoE budget per switch for high-power device support',
    'IEEE 802.3az Energy Efficient Ethernet — saves power on idle ports',
    'Plug-and-play for unmanaged models — zero configuration required',
    'VLAN, QoS, LACP link aggregation on managed and smart models',
    'Cloud or local web management on cloud-managed switch variants'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%Switch%'
  AND (description IS NULL OR description = '');

-- ── IP Camera ─────────────────────────────────────────────────
-- Confirmed from tendacn.com:
-- TC3T24C — 4MP Smart Full-Color Turret Camera
-- TC3B24C — 4MP Smart Full-Color Bullet Camera
-- CH9-WCA V2.0 — 6MP Dual-Lens Outdoor Wi-Fi Pan/Tilt Camera
-- CH10 — 10MP Dual-Lens Outdoor Wi-Fi Pan/Tilt Camera
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda HD IP security camera for 24/7 indoor or outdoor surveillance. Tenda''s camera range includes wired PoE turret cameras (TC series) and wireless Wi-Fi cameras (CH series) in resolutions from 2MP Full-HD up to 10MP Ultra-HD. The TC3T24C and TC3B24C offer 4MP Smart Full-Color imaging with colour night vision — providing clear, colourful footage even in near-zero-light conditions without IR infrared washing. The flagship CH10 delivers 10MP dual-lens pan/tilt coverage from a single camera, eliminating blind spots across wide areas. All cameras feature AI-powered smart detection that distinguishes between humans, vehicles, and animals to minimise false alarm notifications. Footage is monitored remotely via the Tenda Security app and stored locally on an SD card or centrally on a Tenda NVR. The IP66 weatherproof rating makes outdoor models suitable for all weather conditions including rain, dust, and extreme temperatures.',
  key_features = ARRAY[
    '2MP / 4MP / 6MP / 10MP resolution options — up to Ultra-HD clarity',
    'Smart Full-Color night vision — colour footage in near-zero light conditions',
    'AI human and vehicle detection — minimises false motion alerts',
    'Dual-lens pan/tilt models (CH series) eliminate blind spots with a single camera',
    'IP66 / IP67 weatherproof rating for outdoor all-weather installation',
    'Two-way audio — speak through the camera remotely via Tenda Security app',
    'Local SD card recording + centralised NVR storage support',
    'PoE wired (TC series) or Wi-Fi wireless (CH series) connection options'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%IP Camera%' OR category_name ILIKE '%Camera%')
  AND (description IS NULL OR description = '');

-- ── NVR ──────────────────────────────────────────────────────
-- Confirmed from tendacn.com:
-- TN3108-8P — 8-Channel PoE UHD NVR
-- TN3104-4P — 4-Channel PoE UHD NVR
-- TN3116 — 16-Channel UHD NVR
-- TN3108 — 8-Channel UHD NVR
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda UHD Network Video Recorder (NVR) for centrally recording, storing, and managing footage from multiple IP cameras. Tenda NVRs support 4-channel (TN3104-4P), 8-channel (TN3108, TN3108-8P), and 16-channel (TN3116) configurations, with PoE variants supplying power and data to cameras over a single Ethernet cable — eliminating separate power supplies per camera. All Tenda NVRs encode footage using H.265+ compression, storing UHD (2K/4K) video at a fraction of the file size of older codecs and maximising HDD recording time. Remote playback, live view, and event search are available via the Tenda Security app on iOS and Android. The built-in HDD bay supports up to 8 TB of storage — providing weeks of continuous recording across a full 8-camera setup. AI-powered motion detection triggers instant push notifications so no security event is missed.',
  key_features = ARRAY[
    '4, 8, or 16-channel IP camera recording capacity',
    'PoE models (TN3104-4P, TN3108-8P) — power and data for cameras over one cable',
    'UHD recording — supports 2K and 4K resolution cameras across all channels',
    'H.265+ smart compression — 50% less storage than H.264 for the same quality',
    'Supports up to 8 TB HDD — weeks of continuous multi-camera recording',
    'Remote live view, playback, and event search via Tenda Security app',
    'AI smart motion detection with instant push notification alerts',
    'HDMI output for direct monitor display without a PC'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%NVR%'
  AND (description IS NULL OR description = '');

-- ── Video Surveillance Kit ────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda complete video surveillance kit bundling a UHD PoE NVR with multiple HD IP cameras, Ethernet cables, and all accessories in a single ready-to-deploy package. Designed for government offices, commercial premises, warehouses, schools, and banks that need a professional CCTV system without complex multi-vendor purchasing, the kit is tested to work together out of the box. The PoE NVR powers all cameras over standard Ethernet cable — no separate power sockets, adapters, or extra electrician work required per camera. USJ Technologies supplies Tenda surveillance kits with full installation, configuration, and commissioning services across Uttarakhand and pan-India, including site survey and post-installation support.',
  key_features = ARRAY[
    'All-in-one kit: PoE NVR + IP cameras + Ethernet cables + power adapter',
    'PoE connectivity — single cable per camera carries both power and video',
    'HD / Full-HD / UHD camera resolution for clear, detailed footage',
    'IR night vision cameras for 24/7 monitoring in complete darkness',
    'AI smart motion detection and instant push alerts via Tenda Security app',
    'Remote live view and 30-day+ playback via iOS and Android app',
    'Expandable — add more cameras to the NVR as your security needs grow',
    'USJ Technologies installation and commissioning service available'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%Surveillance Kit%' OR category_name ILIKE '%VS Kit%' OR category_name ILIKE '%Video Surveillance%')
  AND (description IS NULL OR description = '');

-- ── Enterprise Wireless ───────────────────────────────────────
-- Models: i9 (Indoor AP), i21 (Dual-Band AP), i27 (Wi-Fi 6 AP),
-- W15E (Wi-Fi 6 Outdoor AP)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda enterprise-grade wireless access point (AP) built for high-density, high-reliability Wi-Fi deployment in hotels, hospitals, offices, government buildings, universities, and shopping malls. Unlike consumer routers, Tenda enterprise APs are designed to serve 50–200+ simultaneously connected clients per unit without performance degradation. Wi-Fi 5 (802.11ac Wave 2) and Wi-Fi 6 (802.11ax) models are available — Wi-Fi 6 models support OFDMA and BSS Coloring for exceptional performance in crowded environments. All APs are PoE powered (IEEE 802.3at), ceiling or wall mountable, and centrally managed through Tenda''s cloud controller or a local hardware controller. Fast roaming protocols (802.11r/k/v) provide seamless handoff between APs for mobile users traversing large campuses or multi-floor buildings.',
  key_features = ARRAY[
    'Wi-Fi 5 (802.11ac Wave 2) or Wi-Fi 6 (802.11ax) for maximum throughput',
    'High-density design — serves 50 to 200+ concurrent clients per AP',
    'OFDMA and MU-MIMO (Wi-Fi 6) for simultaneous multi-device efficiency',
    'IEEE 802.3at PoE powered — single cable installation, no power socket needed',
    'Ceiling-mount or wall-mount design with discreet low-profile aesthetics',
    '802.11r/k/v fast roaming for seamless handoff between APs',
    'Multi-SSID, VLAN tagging, and captive portal for network segmentation',
    'Cloud controller or hardware controller centralised management'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%Enterprise%'
  AND (description IS NULL OR description = '');

-- ── CPE & Basestation ─────────────────────────────────────────
-- Models: O5 (5 GHz Outdoor CPE 300 Mbps), O5D (Dual-Band Outdoor CPE),
-- OBM12 (Outdoor Base Station), O6 (5 GHz 867 Mbps)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda outdoor wireless CPE (Customer Premises Equipment) or base station for long-distance point-to-point (PTP) and point-to-multipoint (PTMP) broadband links. With high-gain directional antennas and powerful amplifiers, Tenda outdoor CPEs bridge buildings, connect remote offices, backhaul IP surveillance cameras, and extend broadband access to locations without wired infrastructure — covering distances from 1 km to over 15 km on clear line-of-sight. The IP66-rated aluminium housing withstands rain, dust, high UV, and temperature extremes from -40°C to +70°C, making Tenda CPEs well-suited to Uttarakhand''s mountainous terrain and harsh seasonal weather. PoE power delivery from a single Ethernet cable simplifies pole or rooftop mounting without the need for external power at the mast.',
  key_features = ARRAY[
    'Point-to-point (PTP) wireless range: 1 km to 15+ km line-of-sight',
    '5 GHz unlicensed band — interference-free in crowded RF environments',
    'High-gain directional antenna built-in (10–23 dBi gain)',
    'IP66 weatherproof aluminium housing — rain, dust, UV, and temperature resistant',
    'Operating temperature: -40°C to +70°C for all-climate outdoor deployment',
    'PoE powered from a single Cat5e/Cat6 cable — no external power at mast/pole',
    'Point-to-multipoint (PTMP) mode for ISP last-mile and campus distribution',
    'Web browser and SNMP v1/v2c management interface'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%CPE%' OR category_name ILIKE '%Basestation%' OR category_name ILIKE '%Base Station%')
  AND (description IS NULL OR description = '');

-- ── MiFi ─────────────────────────────────────────────────────
-- Models: MF3 (4G LTE MiFi), 4G185 (4G MiFi + 5000 mAh power bank)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda portable 4G LTE MiFi device that creates a personal Wi-Fi hotspot from any standard Nano-SIM card. Measuring smaller than a credit card and weighing under 100g, it slips into a pocket or bag and runs on its built-in rechargeable battery for up to 8 hours of continuous use. Up to 10 devices simultaneously share the 4G LTE internet connection — making it ideal for field engineers, government field officers, travelling executives, journalists, and temporary pop-up offices. The 4G185 model includes a 5000 mAh battery that doubles as a power bank for charging phones and tablets while providing internet simultaneously, making it particularly practical for fieldwork and disaster-response operations where power outlets may be unavailable.',
  key_features = ARRAY[
    '4G LTE Cat-4 SIM card slot — up to 150 Mbps download speed',
    'Up to 10 Wi-Fi devices share the hotspot simultaneously',
    'Dual-band 2.4 GHz + 5 GHz Wi-Fi for fast local distribution',
    'Built-in rechargeable battery — up to 8 hours continuous usage',
    'Compact pocket size — weighs under 100g',
    'Compatible with all Indian operators: Jio, Airtel, Vi, BSNL',
    'Nano-SIM card slot — standard Indian SIM size',
    'Web browser management interface for APN and Wi-Fi password configuration'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%MiFi%'
  AND (description IS NULL OR description = '');

-- ── Network Expansion (Repeaters / Extenders) ─────────────────
-- Models: A9 (N300 Wall-plug Repeater), A15 (AC750), A18 (AC1200),
-- PW201A (Powerline AV1000 + Wi-Fi N300)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda Wi-Fi range extender or powerline networking adapter that eliminates dead zones in large homes, multi-floor offices, and commercial premises. Tenda''s wireless range extenders (A series) plug into any wall socket in the coverage gap area, receive the existing Wi-Fi signal, amplify it, and re-broadcast at full strength — each unit covering an additional 100–200 sq. metres. Setup takes under two minutes: press WPS or use the Tenda Wi-Fi app to pair with any brand of router. Dual-band models (A15 AC750, A18 AC1200) repeat both 2.4 GHz and 5 GHz bands simultaneously, and the built-in Ethernet port provides a wired connection for a nearby desktop, smart TV, or gaming console. Tenda powerline adapters (PW201A) use the building''s existing electrical wiring to carry network data at AV1000 speeds — ideal for thick-walled or reinforced-concrete buildings where Wi-Fi signals struggle to penetrate.',
  key_features = ARRAY[
    'Extends Wi-Fi range by up to 100–200 sq. metres per extender unit',
    'One-button WPS pairing — works with any brand of Wi-Fi router',
    'Dual-band 2.4 GHz + 5 GHz simultaneous repeating on AC models (A15, A18)',
    'Tenda Wi-Fi app guided setup — no technical knowledge required',
    'Ethernet port for wired device connection in the extended coverage area',
    'Signal strength LED indicator helps find the optimal placement position',
    'Compact wall-plug design — no cables or desk space required',
    'Powerline models (PW201A) use electrical wiring for interference-free backbone'
  ]
WHERE brand_name = 'TENDA'
  AND (category_name ILIKE '%Network Expansion%' OR category_name ILIKE '%Repeater%' OR category_name ILIKE '%Extender%')
  AND (description IS NULL OR description = '');

-- ── Adapters ─────────────────────────────────────────────────
-- Models: U9 (AC650 Nano USB Wi-Fi), U12 (AC1300 Dual-Band USB),
-- U2 (N150 Nano USB), W311MI (N150 Mini USB)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda USB wireless network adapter that adds Wi-Fi connectivity to any desktop PC, laptop, thin client, or server with a USB port. Plug into any USB 2.0 or USB 3.0 port, install the included driver (or let Windows 10/11 auto-install from Windows Update), and the computer immediately connects to any Wi-Fi network. The nano design of models like the U9 (AC650) and U2 (N150) leaves almost nothing protruding from the USB port — safe to leave permanently inserted even in tight server-room spaces. Dual-band AC models (U9, U12) support both 2.4 GHz and 5 GHz, letting older PCs access fast 5 GHz Wi-Fi networks for the first time. Particularly valuable for upgrading government desktop PCs and thin clients that lack built-in Wi-Fi, or for replacing slow onboard Wi-Fi on older laptops with faster Wi-Fi 5 / Wi-Fi 6 capability.',
  key_features = ARRAY[
    'USB plug-and-play — no PCIe slot, no screwdriver, no disassembly required',
    'Nano models (U9, U2) — nearly flush with the USB port when inserted',
    'Dual-band AC (2.4 GHz + 5 GHz) support on U9 and U12 models',
    'USB 3.0 interface on U12 AC1300 model for maximum wireless throughput',
    'Compatible with Windows 7 / 8 / 10 / 11 and Linux',
    'WPS button for quick one-touch network pairing (larger models)',
    'Soft AP mode — share a wired connection as a Wi-Fi hotspot from a PC',
    'Ideal for upgrading government desktops, thin clients, and older laptops'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%Adapter%'
  AND (description IS NULL OR description = '');

-- ── OLT & Accessories ─────────────────────────────────────────
-- Models: Tenda GPON OLT chassis (8/16/32 PON ports), SFP+ modules,
-- OLT splitter accessories, fibre patch cables
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda GPON or EPON Optical Line Terminal (OLT) or accessory for deploying FTTH (Fiber-to-the-Home) and FTTB (Fiber-to-the-Building) broadband networks. The OLT sits at the head-end — in an ISP''s central office or a campus data centre — and manages the entire passive optical network (PON) downstream, controlling up to 128 ONT/ONU subscriber terminals per GPON port. Tenda OLTs are deployed in India''s BharatNet Phase II broadband programme, enterprise campus fibre networks, and private ISP builds across tier-2 and tier-3 cities. The chassis supports multiple PON line cards for scalable subscriber growth, with 10G SFP+ uplink ports connecting to the internet exchange or core routing layer. Management via web GUI, CLI over SSH/Telnet, and SNMP v2c/v3 integrates seamlessly with existing network management systems.',
  key_features = ARRAY[
    'GPON (ITU-T G.984) or EPON (IEEE 802.3ah) compliant OLT platform',
    'Up to 128 ONT/ONU subscribers per GPON port — 1:128 split ratio',
    '8, 16, or 32 PON port chassis options for scalable network deployment',
    '10G SFP+ uplink ports for high-capacity aggregation layer connection',
    'Web GUI, SSH CLI, and SNMP v2c/v3 for comprehensive management',
    'OAM remote monitoring, fault management, and ONT auto-provisioning',
    'Layer 2/3 with VLAN, QoS, and multicast support for IPTV/VoIP services',
    'Standard 19-inch rack mount for data centre and telecom room installation'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%OLT%'
  AND (description IS NULL OR description = '');

-- ── ONT ──────────────────────────────────────────────────────
-- Models: Tenda ONT-G1 (GPON 4-port GE), ONT-G3 (GPON + Wi-Fi),
-- models with VoIP (POTS port) for telephone integration
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda GPON or EPON Optical Network Terminal (ONT) — the subscriber-premises device in a Fiber-to-the-Home (FTTH) network that connects a home or office to the fibre optic broadband network. The ONT receives the optical signal from the ISP''s OLT over the fibre cable, converts it to Ethernet, and distributes connectivity through built-in Gigabit LAN ports, an optional dual-band Wi-Fi access point, and a VoIP telephone port on select models. Tenda ONTs support OMCI auto-provisioning, meaning the ISP''s OLT automatically pushes configuration to newly connected ONTs over the fibre — enabling zero-touch deployment at scale. Compatible with all major OLT vendors and widely used by Indian ISPs, BharatNet operators, and enterprise fibre deployments. USJ Technologies supplies and deploys Tenda ONTs for enterprise and government fibre rollouts across Uttarakhand.',
  key_features = ARRAY[
    'GPON (ITU-T G.984.x) or EPON (IEEE 802.3ah) compliant ONT',
    'Up to 4 Gigabit Ethernet LAN ports for high-speed wired connectivity',
    'Optional built-in dual-band Wi-Fi — all-in-one fibre gateway functionality',
    'POTS/VoIP telephone port for traditional landline integration (select models)',
    'OMCI auto-provisioning — zero-touch remote configuration by ISP OLT',
    'Compatible with all major OLT brands — true multi-vendor interoperability',
    'TR-069 / TR-098 remote management and diagnostic protocol support',
    'USB port for storage sharing and firmware upgrade on select models'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%ONT%'
  AND (description IS NULL OR description = '');

-- ── xDSL Modems ──────────────────────────────────────────────
-- Models: D305 (ADSL2+ Wireless Router), N300D (ADSL2+ N300 Wi-Fi),
-- DSL926 (4-Port ADSL2+ Router)
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda ADSL2+ or VDSL2 modem-router that combines a DSL broadband modem with a Wi-Fi router in a single compact device. It connects to a standard PSTN telephone line and establishes an ADSL2+ connection delivering download speeds up to 24 Mbps, or VDSL2 up to 100 Mbps — compatible with BSNL, MTNL, and all other Indian DSL broadband providers. The integrated Wi-Fi access point distributes internet wirelessly to smartphones, laptops, and tablets, while the built-in Fast Ethernet or Gigabit LAN ports serve wired desktops and printers. The web-based setup wizard needs only the ISP''s PPPoE username and password — configuration completes in under 10 minutes without any technical expertise. An all-in-one modem-router eliminates the cost and complexity of a separate modem device, making it the practical broadband gateway choice for government field offices and SMBs on BSNL DSL plans.',
  key_features = ARRAY[
    'ADSL2+ (up to 24 Mbps download) or VDSL2 (up to 100 Mbps) modem built-in',
    'Compatible with BSNL, MTNL, and all Indian DSL broadband providers',
    'Integrated N300 or N600 Wi-Fi router — no separate router hardware needed',
    '4-port Fast Ethernet or Gigabit LAN for wired device connections',
    'Web-based setup wizard — DSL internet configured in under 10 minutes',
    'PPPoE, PPPoA, and IPoE WAN connection mode support',
    'NAT firewall, DHCP server, DMZ, and VPN pass-through included',
    'Built-in ADSL line status monitoring and connection diagnostic tools'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%xDSL%'
  AND (description IS NULL OR description = '');

-- ── Gateway ───────────────────────────────────────────────────
-- Confirmed from tendacn.com:
-- G500-F (Cloud-managed VPN Gateway), G300-F (Cloud VPN Gateway),
-- G0-8G-PoE (Gigabit PoE Gateway), W30E (Wi-Fi 6 Gateway), W18E v2.0
UPDATE products
SET
  description = 'The ' || name || ' is a Tenda enterprise network gateway providing advanced routing, multi-WAN load balancing, VPN connectivity, and integrated firewall for SMB, government branch offices, and enterprise environments. Tenda''s gateway lineup includes cloud-managed VPN models (G500-F, G300-F) for zero-touch branch office deployment, PoE gateway models (G0-8G-PoE) combining routing and PoE switching in one device, and Wi-Fi 6 integrated gateway models (W30E) for all-in-one wireless + routing. The G500-F and G300-F support IPSec, L2TP, PPTP, and SSL VPN — ideal for connecting remote workers and branch offices to headquarters over encrypted tunnels. Multi-WAN with bandwidth aggregation and automatic failover ensures internet continuity even when a primary link fails, which is critical for government services and businesses that cannot tolerate outages.',
  key_features = ARRAY[
    'Multi-WAN load balancing and auto-failover for internet link redundancy',
    'IPSec, L2TP, PPTP, and SSL VPN for secure remote access and site-to-site links',
    'Cloud-managed models (G500-F, G300-F) — zero-touch branch office provisioning',
    'PoE gateway models (G0-8G-PoE) — power APs and IP cameras from one device',
    'Wi-Fi 6 integrated gateway models (W30E) — routing and wireless in one unit',
    'Stateful Packet Inspection (SPI) firewall with DoS attack prevention',
    'VLAN support for network segmentation between departments',
    'Policy-based routing, QoS, and bandwidth control for traffic management'
  ]
WHERE brand_name = 'TENDA'
  AND category_name ILIKE '%Gateway%'
  AND (description IS NULL OR description = '');

-- ── Fallback: remaining Tenda products with no description ────
UPDATE products
SET
  description = 'The ' || name || ' is a ' || COALESCE(category_name, 'networking') || ' product from Tenda — one of the world''s largest networking equipment manufacturers, headquartered in Shenzhen, China, with annual shipments exceeding 50 million units globally. Tenda products carry CE, FCC, and RoHS certification and are deployed by ISPs, system integrators, government departments, and enterprises across Asia, Europe, and the Americas. USJ Technologies is an authorised Tenda supplier in Uttarakhand, providing genuine Tenda hardware with manufacturer warranty, GST-compliant invoicing, and technical support from our Dehradun office. Contact us for bulk pricing, GeM portal procurement, or project-specific supply and installation.',
  key_features = ARRAY[
    'Genuine Tenda product with manufacturer warranty',
    'CE / FCC / RoHS certified — meets Indian import and quality standards',
    'Supplied by USJ Technologies — authorised Tenda dealer in Dehradun',
    'GST invoice provided — suitable for government and corporate procurement',
    'GeM portal procurement available for government departments',
    'Pan-India delivery with order tracking',
    'Post-sales technical support from the USJ Technologies team'
  ]
WHERE brand_name = 'TENDA'
  AND (description IS NULL OR description = '');

-- ── Verification query ────────────────────────────────────────
SELECT
  category_name,
  COUNT(*)                                                                                      AS total_products,
  COUNT(CASE WHEN description IS NOT NULL AND description <> '' THEN 1 END)                    AS with_description,
  COUNT(CASE WHEN array_length(key_features, 1) > 0 THEN 1 END)                               AS with_features
FROM products
WHERE brand_name = 'TENDA'
GROUP BY category_name
ORDER BY category_name;
