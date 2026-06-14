-- ============================================================
-- USJ Technologies — Migration 009: Fix Tenda key_features
-- Descriptions were already set by migration 008, so the
-- WHERE (description IS NULL OR description = '') condition
-- skipped key_features updates. This migration sets key_features
-- unconditionally for all Tenda categories.
-- Run this in Supabase SQL Editor.
-- ============================================================

UPDATE products SET key_features = ARRAY[
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
  AND category_name NOT ILIKE '%4G%';

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%5G%' OR category_name ILIKE '%4G%');

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%Mesh%' OR category_name ILIKE '%WiFi System%' OR category_name ILIKE '%Wi-Fi System%');

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%Switch%';

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%IP Camera%' OR category_name ILIKE '%Camera%');

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%NVR%';

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%Surveillance Kit%' OR category_name ILIKE '%VS Kit%' OR category_name ILIKE '%Video Surveillance%');

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%Enterprise%';

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%CPE%' OR category_name ILIKE '%Basestation%' OR category_name ILIKE '%Base Station%');

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%MiFi%';

UPDATE products SET key_features = ARRAY[
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
  AND (category_name ILIKE '%Network Expansion%' OR category_name ILIKE '%Repeater%' OR category_name ILIKE '%Extender%');

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%Adapter%';

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%OLT%';

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%ONT%';

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%xDSL%';

UPDATE products SET key_features = ARRAY[
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
  AND category_name ILIKE '%Gateway%';

-- Fallback: any remaining Tenda products still with empty key_features
UPDATE products SET key_features = ARRAY[
  'Genuine Tenda product with manufacturer warranty',
  'CE / FCC / RoHS certified — meets Indian import and quality standards',
  'Supplied by USJ Technologies — authorised Tenda dealer in Dehradun',
  'GST invoice provided — suitable for government and corporate procurement',
  'GeM portal procurement available for government departments',
  'Pan-India delivery with order tracking',
  'Post-sales technical support from the USJ Technologies team'
]
WHERE brand_name = 'TENDA'
  AND (key_features IS NULL OR array_length(key_features, 1) IS NULL OR array_length(key_features, 1) = 0);

-- Verify
SELECT
  category_name,
  COUNT(*)                                                                           AS total_products,
  COUNT(CASE WHEN description IS NOT NULL AND description <> '' THEN 1 END)         AS with_description,
  COUNT(CASE WHEN array_length(key_features, 1) > 0 THEN 1 END)                    AS with_features
FROM products
WHERE brand_name = 'TENDA'
GROUP BY category_name
ORDER BY category_name;
