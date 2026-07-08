-- ============================================================
-- USJ Technologies — Migration: ENTER & ZOOOK Product Descriptions
-- Category-level SEO descriptions and key features for all
-- ENTER and ZOOOK products.
-- Run in Supabase SQL Editor.
-- ============================================================


-- ============================================================
-- ENTER BRAND
-- ============================================================

-- ── Motherboards ─────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER brand desktop motherboard designed for reliable, cost-effective PC builds in home, office, and institutional environments. ENTER motherboards support Intel processors across multiple generations — from LGA775 (G41) and LGA1155 (H61, H81) to LGA1151 (H110, H310, B450, H510, A520, H610) — providing a stable upgrade path for system builders and IT administrators. Each board features standard ATX or micro-ATX form factors compatible with most desktop PC cabinets, dual-channel DDR3 or DDR4 RAM slots, PCIe expansion slots for graphics cards and peripheral cards, and onboard audio and LAN. ENTER motherboards are widely used in government offices, educational institutions, cyber cafes, and commercial establishments across India for their competitive pricing, GeM availability, and reliable after-sales support through USJ Technologies.',
  key_features = ARRAY[
    'Supports Intel processors — LGA775, LGA1155, LGA1151 socket options',
    'DDR3 or DDR4 dual-channel memory slots (up to 16GB/32GB depending on model)',
    'PCIe x16 slot for dedicated graphics card installation',
    'Onboard Intel HD graphics, audio (Realtek), and Gigabit LAN',
    'Standard ATX/mATX form factor — compatible with all standard PC cabinets',
    'Multiple USB 2.0 and USB 3.0 ports for peripherals',
    'SATA III ports for HDD and SSD storage devices',
    'Available on GeM portal — suitable for government and institutional procurement'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Motherboard%' OR name ILIKE '%motherboard%' OR slug ILIKE '%motherboard%' OR slug ILIKE '%-h61%' OR slug ILIKE '%-h81%' OR slug ILIKE '%-h110%' OR slug ILIKE '%-h310%' OR slug ILIKE '%-h510%' OR slug ILIKE '%-h610%' OR slug ILIKE '%-b450%' OR slug ILIKE '%-a520%' OR slug ILIKE '%-g41%')
  AND (description IS NULL OR description = '');

-- ── Graphics Cards ────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER brand dedicated graphics card for desktop PCs, delivering improved visual performance for office productivity, multimedia, design work, and light gaming. ENTER''s graphics card lineup includes entry-level GT210 (1GB DDR3), GT610 (2GB DDR3), and GT730 (4GB DDR3) cards for daily office tasks and multi-monitor setups, as well as mid-range GTX 1660 Ti (6GB GDDR6) and AMD RX 580 (8GB GDDR5) cards for demanding applications and gaming. All models connect via PCIe x16 slots and support HDMI, DVI, and VGA outputs for flexible display configurations. USJ Technologies supplies ENTER graphics cards to government departments, educational institutions, gaming centers, and commercial establishments across India, with GeM-registered procurement support and GST invoicing.',
  key_features = ARRAY[
    'PCIe x16 interface — compatible with all modern desktop motherboards',
    'Range from entry-level GT210 1GB to mid-range GTX 1660 Ti 6GB GDDR6',
    'HDMI, DVI, and VGA display outputs for multi-monitor configurations',
    'Passive cooling on entry models; active fan cooling on mid-range cards',
    'DirectX support for multimedia, design, and gaming workloads',
    'Plug-and-play installation — no additional power connector on entry models',
    'AMD RX 580 8GB GDDR5 for high-performance computing and rendering',
    'Available for GeM government procurement through USJ Technologies'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Graphics%' OR slug ILIKE '%gt210%' OR slug ILIKE '%gt610%' OR slug ILIKE '%gt730%' OR slug ILIKE '%gtx%' OR slug ILIKE '%rx-580%' OR slug ILIKE '%graphic%')
  AND (description IS NULL OR description = '');

-- ── Monitors ─────────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER brand LED monitor designed for extended daily use in offices, educational institutions, government departments, and homes. ENTER monitors range from compact 15.4-inch and 17.1-inch square panels to wide 19-inch, 20-inch, 22-inch, 24-inch, 27-inch, and 32-inch curved borderless models — covering the full spectrum of desktop workspace requirements. All models feature LED backlighting for energy efficiency, anti-glare panels to reduce eye strain during long working hours, VGA and HDMI inputs for universal device compatibility, and VESA-compatible mounts for wall or arm installation. The borderless series delivers ultra-thin bezels for a modern aesthetic and multi-monitor setups. USJ Technologies supplies ENTER monitors to government offices, schools, colleges, and commercial businesses across India, with GeM registration for institutional procurement.',
  key_features = ARRAY[
    'Screen sizes from 15.4 inch to 32 inch curved — full range for all workspace needs',
    'LED backlit panel — energy efficient, lower power consumption than LCD',
    'Anti-glare coating reduces eye strain during extended working hours',
    'VGA and HDMI inputs for compatibility with desktops, laptops, and set-top boxes',
    'Borderless ultra-thin bezel design on newer models for multi-monitor setups',
    'VESA mount compatible — can be wall-mounted or used with monitor arms',
    'Adjustable tilt stand for ergonomic viewing angle',
    'Available on GeM for government and institutional procurement'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Monitor%' OR slug ILIKE '%-mo-%' OR slug ILIKE '%monitor%')
  AND (description IS NULL OR description = '');

-- ── Laptop Batteries ─────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER replacement laptop battery engineered to restore full battery life to ageing laptops from major brands including HP, Dell, Acer, Lenovo, and Toshiba. ENTER laptop batteries are manufactured to match or exceed OEM specifications — delivering the same rated capacity (mAh), voltage, and cell count as the original battery that shipped with your laptop. Each battery undergoes rigorous quality testing including overcharge protection, short-circuit protection, and temperature management circuits to ensure safe, reliable operation. Compatible models include HP Pavilion, ProBook, CQ series; Dell Inspiron, Latitude, Vostro series; Acer TravelMate and Aspire series; and Lenovo IdeaPad G series. USJ Technologies supplies ENTER laptop batteries to IT service centres, corporate offices, and educational institutions across India with GST invoicing and technical support.',
  key_features = ARRAY[
    'Drop-in replacement — matches OEM voltage, capacity, and cell count exactly',
    'Compatible with HP, Dell, Acer, Lenovo, Toshiba laptop models',
    'Overcharge, over-discharge, and short-circuit protection circuits built in',
    'Grade A lithium-ion cells — maintains capacity over hundreds of charge cycles',
    'Plug-and-play installation — no tools or drivers required',
    'GST invoice included — suitable for corporate and institutional procurement',
    '4-cell and 6-cell variants available depending on laptop model',
    'Available for bulk ordering through USJ Technologies B2B channel'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Battery%' OR slug ILIKE '%battery%' OR slug ILIKE '%-aa%' OR slug ILIKE '%-ab%' OR slug ILIKE '%-ac%')
  AND (description IS NULL OR description = '');

-- ── Laptop Adapters ───────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER universal laptop power adapter providing reliable charging for a wide range of laptop brands and models. ENTER laptop adapters are available in multiple wattage options — 40W standard and 61W Type-C PD — to support everything from ultrabooks to standard business laptops. The universal design includes multiple interchangeable tip connectors compatible with HP, Dell, Acer, Lenovo, Asus, Toshiba, and other major brands. The 61W Type-C PD model supports USB Power Delivery for charging modern laptops, tablets, and smartphones via a single cable. All adapters feature overvoltage, overcurrent, and short-circuit protection along with an auto-switching 100-240V input for use across all Indian power standards. Ideal for office hot-desking environments, schools, and IT asset management where a single universal charger serves multiple device types.',
  key_features = ARRAY[
    'Universal compatibility — works with HP, Dell, Acer, Lenovo, Asus, Toshiba',
    '40W standard and 61W Type-C USB PD variants available',
    'Multiple interchangeable tips included for different laptop connector types',
    'USB Power Delivery (PD) on Type-C model for modern laptops and tablets',
    'Auto-switching 100-240V input — compatible with all Indian power outlets',
    'Overvoltage, overcurrent, and short-circuit protection',
    'Compact, lightweight design for travel and hot-desk environments',
    'GST invoice and bulk pricing available through USJ Technologies'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Adapter%' OR slug ILIKE '%adapter%' OR slug ILIKE '%laptop-adapter%')
  AND (description IS NULL OR description = '');

-- ── USB Hubs & Type-C Accessories ────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER USB hub or Type-C adapter expanding the connectivity of desktop PCs, laptops, and tablets with additional ports. ENTER''s connectivity range includes USB 2.0 4-port hubs for basic peripheral expansion, USB 3.0 4-port hubs for high-speed data transfer, and Type-C multi-port adapters in 3-in-1, 4-in-1, 5-in-1 configurations combining USB-A, USB-C, HDMI, SD card, and Gigabit LAN ports. The USB-to-LAN and Type-C-to-LAN adapters provide wired Gigabit Ethernet connectivity to ultrabooks and tablets that lack a built-in LAN port — essential for office environments where Wi-Fi is unreliable. All products are plug-and-play compatible with Windows, macOS, and Linux — no driver installation required. Widely used in government offices, schools, and corporate environments for expanding legacy and modern device connectivity.',
  key_features = ARRAY[
    'USB 2.0 and USB 3.0 hub variants — 4-port and 7-port configurations',
    'Type-C multi-port adapters in 3-in-1, 4-in-1, 5-in-1 configurations',
    'USB-to-LAN and Type-C-to-Gigabit-LAN for wired Ethernet on slim laptops',
    'Type-C to HDMI adapter for connecting laptops to projectors and monitors',
    'Plug-and-play on Windows, macOS, Linux — no drivers required',
    'Compact bus-powered design — no external power supply needed',
    'USB 3.0 models support data transfer speeds up to 5 Gbps',
    'Available for bulk procurement with GeM and GST invoicing'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Hub%' OR category_name ILIKE '%Adapter%' OR category_name ILIKE '%Type-C%' OR slug ILIKE '%-hub%' OR slug ILIKE '%-c2hd%' OR slug ILIKE '%-c3h%' OR slug ILIKE '%-c4u%' OR slug ILIKE '%-c5h%' OR slug ILIKE '%-ucl%' OR slug ILIKE '%-ul100%' OR slug ILIKE '%-ucuc%')
  AND (description IS NULL OR description = '');

-- ── PCI Cards (Parallel, Serial, USB, FireWire, Sound, LAN) ──
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER PCI or PCIe expansion card adding essential legacy or high-speed ports to desktop PCs. ENTER''s expansion card range covers every connectivity need: parallel port cards for legacy printers and industrial equipment, serial port cards for POS systems and industrial devices, USB 3.0 host cards for high-speed peripherals, FireWire (IEEE 1394) cards for audio/video equipment, sound cards for improved audio output, and Gigabit Ethernet LAN cards for network connectivity. These cards are the standard solution for government offices, banks, manufacturing plants, and educational institutions that need to maintain legacy peripheral connectivity on modern motherboards that no longer include these ports. All cards are PCI or PCIe x1 interface and install in standard desktop PC expansion slots.',
  key_features = ARRAY[
    'PCI and PCIe x1 interface — fits all standard desktop PC motherboards',
    'Parallel port cards for legacy printers, scanners, and industrial equipment',
    'Serial port cards for POS terminals, barcode scanners, and industrial devices',
    'USB 3.0 / USB 2.0 host cards — add high-speed USB ports to older PCs',
    'FireWire IEEE 1394 cards for DV cameras and professional audio equipment',
    '4-channel PCI sound card for improved audio on office and multimedia PCs',
    'Gigabit Ethernet 10/100/1000 LAN card for network connectivity',
    'Plug-and-play with Windows XP through Windows 11'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%PCI%' OR category_name ILIKE '%Card%' OR slug ILIKE '%-pci%' OR slug ILIKE '%-1pe%' OR slug ILIKE '%-1s1p%' OR slug ILIKE '%-2se1p%' OR slug ILIKE '%-4s-%' OR slug ILIKE '%-fwa%' OR slug ILIKE '%-eusb4%' OR slug ILIKE '%-usb4%' OR slug ILIKE '%-100e%' OR slug ILIKE '%-1p-%' OR slug ILIKE '%-2s-%')
  AND (description IS NULL OR description = '');

-- ── Networking Cables & Connectors ───────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER brand networking cable or connector for structured LAN cabling in offices, data centers, and institutional buildings. ENTER Cat5e and Cat6e cables are available in 100-meter and 305-meter drum rolls — the industry standard lengths for network cabling projects. Cat6e supports Gigabit Ethernet (10/100/1000 Mbps) and is backward compatible with Cat5e infrastructure, making it the recommended standard for all new installations. ENTER RJ45 connectors (Cat5 and Cat6) are compatible with standard crimping tools and used by network engineers for on-site cable termination. All cables feature copper conductors, PVC insulation, and comply with TIA/EIA-568 standards for structured cabling. USJ Technologies supplies ENTER networking cables and connectors for government building cabling projects, office LAN installations, and institutional IT infrastructure across India.',
  key_features = ARRAY[
    'Cat5e and Cat6e UTP cable in 100m and 305m drum rolls',
    'Supports Gigabit Ethernet (10/100/1000 Mbps) and PoE installations',
    'Bare copper conductors for maximum signal quality and performance',
    'PVC jacket — suitable for indoor structured cabling installations',
    'RJ45 connectors for Cat5 and Cat6 in packs for field termination',
    'Complies with TIA/EIA-568 structured cabling standards',
    'Compatible with all standard patch panels, keystone jacks, and switches',
    'Bulk pricing available for large cabling projects via USJ Technologies'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Cable%' OR category_name ILIKE '%Connector%' OR slug ILIKE '%-c6e%' OR slug ILIKE '%-m5%' OR slug ILIKE '%-c6rj45%')
  AND (description IS NULL OR description = '');

-- ── Power Supply / UPS ────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER power solution — either a SMPS desktop power supply or a line-interactive UPS — for reliable, protected power delivery to desktop computers and office equipment. The ENTER E-500F is a 500W SMPS power supply providing stable DC power to all desktop PC components with standard 24-pin ATX, 4-pin CPU, SATA, and Molex connectors. The ENTER E-U1200 is a line-interactive UPS providing 1200VA of backup power with automatic voltage regulation (AVR) to protect computers from power cuts, voltage fluctuations, and surges — a critical requirement in areas with unstable electricity supply. USJ Technologies supplies ENTER power solutions to government offices, schools, banks, and commercial establishments across India, available on GeM for institutional procurement.',
  key_features = ARRAY[
    '500W SMPS with 24-pin ATX, CPU 4-pin, SATA, and Molex power connectors',
    '1200VA line-interactive UPS with automatic voltage regulation (AVR)',
    'UPS provides 15-20 minutes backup time for safe shutdown during power cuts',
    'Protection from overvoltage, undervoltage, surges, and short circuits',
    'Cold start function — powers on from battery without mains electricity',
    'LED status indicators for mains power, battery, and fault conditions',
    'Compatible with all standard desktop PCs and office equipment',
    'Available on GeM portal for government and institutional procurement'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Power%' OR category_name ILIKE '%UPS%' OR slug ILIKE '%-500f%' OR slug ILIKE '%-u1200%' OR slug ILIKE '%power-supply%' OR slug ILIKE '%ups%')
  AND (description IS NULL OR description = '');

-- ── Thin Client ───────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER thin client — a compact, energy-efficient computing terminal designed for office environments where centralized server-based computing is preferred over individual desktop PCs. ENTER thin clients connect to a central server or virtual desktop infrastructure (VDI) and stream the computing environment to the user, with all processing handled remotely. This dramatically reduces hardware costs, maintenance overhead, and energy consumption compared to traditional desktops — a single server can power dozens of thin client workstations. Ideal for government offices, banks, call centers, schools, and enterprises that require centralized data management, simplified IT administration, and consistent user environments across all workstations. Includes standard connectivity: USB ports, VGA/HDMI display output, and Ethernet LAN.',
  key_features = ARRAY[
    'Compact fanless design — silent operation, minimal desk footprint',
    'Energy efficient — consumes as little as 5-15W vs 200W+ for a desktop PC',
    'Connects to Windows RDS, Citrix, VMware, or Linux server environments',
    'USB 2.0 ports for keyboard, mouse, and peripheral connectivity',
    'VGA and/or HDMI display output for standard monitor connection',
    'Gigabit Ethernet LAN for reliable server connectivity',
    'Centralized management — updates and maintenance done server-side only',
    'Available on GeM for government department procurement'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Thin Client%' OR slug ILIKE '%-fl300%' OR slug ILIKE '%thin-client%' OR slug ILIKE '%fl200%')
  AND (description IS NULL OR description = '');

-- ── Wireless LAN Adapter ──────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER USB wireless LAN adapter adding Wi-Fi connectivity to desktop PCs or older laptops that lack built-in wireless capability. Simply plug into any available USB port and connect to any 802.11b/g/n or dual-band 802.11ac Wi-Fi network — no PCIe slot required, no internal installation needed. The E-W170 delivers 150Mbps on the 2.4GHz band for everyday browsing, email, and office applications. The 600Mbps dual-band Bluetooth Wi-Fi USB adapter adds simultaneous 2.4GHz and 5GHz Wi-Fi plus Bluetooth 4.0 connectivity, enabling both wireless internet and Bluetooth peripherals from a single USB port. Compatible with Windows XP through Windows 11 with automatic driver installation.',
  key_features = ARRAY[
    'USB plug-and-play — no PCIe slot or internal installation required',
    '150Mbps (2.4GHz) and 600Mbps dual-band (2.4GHz + 5GHz) variants',
    'Dual-band + Bluetooth combo model adds BT 4.0 from the same USB adapter',
    'Compatible with all 802.11b/g/n/ac Wi-Fi routers and access points',
    'WPA2/WPA3 encryption support for secure wireless connections',
    'Compact nano design — stays plugged in without protruding from laptop',
    'Windows XP / 7 / 8 / 10 / 11 driver support',
    'Ideal for desktop PCs and older laptops needing Wi-Fi'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Wireless%' OR slug ILIKE '%-w170%' OR slug ILIKE '%wireless-lan%' OR slug ILIKE '%-bt-%' OR slug ILIKE '%600m-bt%')
  AND (description IS NULL OR description = '');

-- ── Sound Card ────────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER sound card providing improved audio output and input capabilities for desktop PCs and laptops. The USB sound card adds 3.5mm audio output (speakers/headphones) and microphone input to any PC or laptop via USB — a simple plug-and-play solution for systems with damaged onboard audio or for adding audio to thin clients and mini PCs. The PCI 4-channel sound card installs in a PCI slot and delivers surround-sound audio output for multimedia, gaming, and content creation. Compatible with standard 3.5mm headphones, speakers, and microphones. USJ Technologies supplies ENTER sound cards for government offices, schools, call centers, and multimedia workstations.',
  key_features = ARRAY[
    'USB sound card: plug-and-play audio for any PC, laptop, or thin client',
    'PCI 4-channel: surround-sound audio for multimedia and gaming PCs',
    '3.5mm headphone output and microphone input ports',
    'Improves audio quality over basic onboard motherboard audio',
    'USB model is bus-powered — no separate power supply needed',
    'Compatible with Windows XP through Windows 11',
    'Works with all standard 3.5mm speakers, headphones, and microphones',
    'Ideal for replacing damaged onboard audio on office PCs'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Sound%' OR slug ILIKE '%-4s-%' OR slug ILIKE '%-us-%' OR slug ILIKE '%sound-card%')
  AND (description IS NULL OR description = '');

-- ── Induction Charging Pads (ENTERGO) ────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTERGO wireless induction charging pad for smartphones supporting Qi wireless charging. Simply place your Qi-enabled Android or iPhone on the pad and charging begins instantly — no cables, no fumbling with connectors. ENTERGO AuraPad wireless chargers are available in three variants: AuraPad Neo (standard 10W), AuraPad Prime (15W fast charge), and AuraPad Zen (premium design with 15W fast charge). All models feature a non-slip surface to hold your phone in place, LED indicator for charging status, and built-in protection against overcharging and overheating. Compatible with all Qi-standard smartphones including iPhone 8 and later, Samsung Galaxy, OnePlus, and other Android devices with wireless charging support. Compact and desk-friendly — ideal for office desks, bedside tables, and reception areas.',
  key_features = ARRAY[
    'Qi wireless charging — compatible with iPhone 8+, Samsung, OnePlus, and more',
    '10W standard and 15W fast charging variants available',
    'Non-slip rubber base holds phone securely during charging',
    'LED charging indicator — confirms device is correctly placed and charging',
    'Overcharge, overheat, and foreign object protection built in',
    'Compact round design fits cleanly on office desks and bedside tables',
    'No cable connection to phone required — true wireless convenience',
    'USB-A input cable included (USB adapter sold separately)'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (slug ILIKE '%aurapad%' OR slug ILIKE '%induction-pad%')
  AND (description IS NULL OR description = '');

-- ── USB Charger (ENTERGO) ────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTERGO USB wall charger providing fast, reliable charging for smartphones, tablets, earbuds, and other USB devices. The Rock 1 NC charger delivers optimized output wattage for rapid charging compatible with Qualcomm Quick Charge and standard USB charging protocols. The compact single-port design plugs directly into any standard Indian 3-pin power socket — ideal for home, office, and travel use. USJ Technologies supplies ENTERGO chargers for corporate gifting, bulk office procurement, and retail sale.',
  key_features = ARRAY[
    'USB-A output port with intelligent charging protocol detection',
    'Compatible with all USB-charged smartphones, tablets, and accessories',
    'Compact plug design — minimal space usage at wall outlet',
    'Built-in protection against overcharge, overvoltage, and short circuit',
    'Standard Indian 3-pin plug — works in all Indian power sockets',
    'LED indicator for power status',
    'Bulk pricing available through USJ Technologies B2B channel',
    'Cable sold separately — works with any standard USB cable'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (slug ILIKE '%usb-charger%' OR slug ILIKE '%rock-1%')
  AND (description IS NULL OR description = '');

-- ── Speaker (ENTER) ──────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER USB-powered multimedia speaker for desktop PCs, laptops, and mobile devices. The E-S280WD is a 2.0 wooden cabinet USB speaker delivering warm, resonant audio output with enhanced bass response compared to standard plastic speakers — the wooden enclosure reduces resonance and improves sound quality for music, video calls, and multimedia playback. Powered entirely via USB — no separate power adapter required. Compatible with all Windows, macOS, and Linux computers, as well as Android and iOS devices via USB OTG. Ideal for office workstations, reception desks, classrooms, and home use.',
  key_features = ARRAY[
    'Wooden cabinet enclosure for warm, resonant audio with improved bass',
    'USB powered — no separate power adapter, single cable for power and audio',
    '2.0 stereo speaker configuration for clear left-right channel separation',
    '3.5mm auxiliary input for connecting non-USB audio sources',
    'Volume control knob for convenient adjustment',
    'Compatible with Windows, macOS, Linux, Android (USB OTG)',
    'Compact desktop footprint — suitable for office and home workstations',
    'Available for bulk procurement with GST invoicing'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (category_name ILIKE '%Speaker%' OR slug ILIKE '%-s280%' OR slug ILIKE '%speaker%')
  AND (description IS NULL OR description = '');


-- ============================================================
-- ZOOOK BRAND
-- ============================================================

-- ── Bluetooth Speakers ────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK portable Bluetooth speaker delivering powerful, room-filling audio in a compact, carry-anywhere design. ZOOOK''s speaker lineup covers every use case — from ultra-compact pocket speakers for personal use to large party speakers with LED lighting effects and karaoke microphone support for outdoor events and celebrations. Key technologies across the range include Bluetooth 5.0 for a stable 10-metre wireless connection to any smartphone, tablet, or laptop; passive radiator or dual subwoofer bass enhancement for deep, punchy low frequencies; IPX5 or IPX7 water resistance on outdoor models for pool parties and rainy conditions; and built-in 1500mAh to 5000mAh rechargeable batteries providing 4 to 12 hours of playback per charge. Many models also include AUX-in, USB playback, FM radio, and hands-free calling via built-in microphone. USJ Technologies supplies ZOOOK speakers to retail stores, corporate gifting programs, and institutions across India, available in bulk with GeM registration support.',
  key_features = ARRAY[
    'Bluetooth 5.0 wireless connection — stable up to 10 metres range',
    'Passive radiator or dual subwoofer for deep, powerful bass output',
    'IPX5/IPX7 water resistance on select models for outdoor and party use',
    'Built-in rechargeable battery — 4 to 12 hours playback per charge',
    'AUX-in, USB drive playback, FM radio, and TF card support on select models',
    'Hands-free calling via built-in microphone',
    'LED lighting effects and party mode on select models',
    'TWS (True Wireless Stereo) pairing — connect two speakers for stereo audio'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Speaker%' OR category_name ILIKE '%Bluetooth Speaker%')
  AND (description IS NULL OR description = '');

-- ── Bluetooth Earphones / Earbuds ────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK wireless Bluetooth earphone or earbud delivering clear audio and all-day comfort for calls, music, and workouts. ZOOOK''s earphone and earbud range spans in-ear neckband earphones with magnetic snap clasps, truly wireless earbuds (TWS) in a compact charging case, and sport earphones with ear hooks for secure fit during exercise. Bluetooth 5.0 ensures a stable, low-latency connection to smartphones and tablets within 10 metres. Key features across the range include up to 30 hours total playtime (earbuds + case), Environmental Noise Cancellation (ENC) for clear hands-free calling in noisy environments, touch or button controls, and IPX4 sweat resistance for gym and outdoor use. The built-in microphone enables seamless switching between music and calls. ZOOOK earphones are among the most popular affordable wireless audio products in India, widely used by students, professionals, and fitness enthusiasts.',
  key_features = ARRAY[
    'Bluetooth 5.0 for stable, low-latency wireless connection',
    'TWS truly wireless earbuds with compact charging case',
    'Up to 6 hours single charge + up to 24 hours total with case',
    'Environmental Noise Cancellation (ENC) for clear call quality',
    'IPX4 sweat and splash resistance for gym and outdoor use',
    'Touch or button controls — play, pause, skip, volume, voice assistant',
    'Built-in microphone for hands-free calls',
    'Neckband variants with magnetic snap for secure storage when not in use'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Earphone%' OR category_name ILIKE '%Earbud%' OR category_name ILIKE '%TWS%')
  AND (description IS NULL OR description = '');

-- ── Wired Headphones / Headsets ──────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK wired headphone or headset designed for extended music listening, online gaming, video calls, and multimedia use. ZOOOK wired headphones feature large 40mm or 50mm drivers for powerful, detailed audio output with enhanced bass response. Models range from lightweight over-ear headphones for music and casual use to full-sized gaming headsets with surround-sound processing, LED lighting, and noise-cancelling boom microphones for competitive gaming and communication. The built-in microphone on headset models provides clear voice pickup for online gaming, Zoom/Teams calls, and customer service environments. All models connect via standard 3.5mm audio jack — compatible with laptops, PCs, gaming consoles, and smartphones.',
  key_features = ARRAY[
    '40mm or 50mm neodymium drivers for powerful, detailed audio',
    'Over-ear cushioned design for comfort during extended use',
    '3.5mm universal audio jack — works with PC, laptop, mobile, and console',
    'Built-in microphone on headset models for calls and gaming',
    'Noise-cancelling boom microphone on gaming models for clear voice capture',
    'Adjustable headband for comfortable fit across different head sizes',
    'LED lighting on gaming headset models',
    'Foldable design on select models for portability'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Headphone%' OR category_name ILIKE '%Headset%' OR category_name ILIKE '%Wired%')
  AND (description IS NULL OR description = '');

-- ── Power Banks ───────────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK portable power bank providing on-the-go charging for smartphones, earbuds, tablets, and other USB devices. ZOOOK power banks range from ultra-compact 2200mAh pocket models that charge a phone once to high-capacity 10000mAh and 13000mAh units providing multiple charges over several days. Key features across the range include dual USB-A output ports for charging two devices simultaneously, USB-C PD (Power Delivery) input and output on flagship models for fast charging, built-in LED indicators showing remaining battery level, and compact lightweight designs for easy pocket or bag carry. Fast charge variants (Turbo Charge, Dash Charge series) support 18W or higher quick-charge output compatible with Qualcomm Quick Charge and USB PD protocols. All ZOOOK power banks carry BIS certification for the Indian market and are available through USJ Technologies for retail and bulk B2B orders.',
  key_features = ARRAY[
    'Capacity range from 2200mAh to 13000mAh for different use cases',
    'Dual USB-A output — charge two devices simultaneously',
    'USB-C PD input/output on fast charge models (18W+)',
    'LED battery level indicator — 4-dot display showing remaining charge',
    'Compact, lightweight design for pocket and bag carry',
    'BIS certified — meets Indian Bureau of Standards safety requirements',
    'Compatible with all USB-charged smartphones, earbuds, and tablets',
    'Available in bulk with GST invoicing through USJ Technologies'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Power Bank%' OR slug ILIKE '%zp-pb%' OR slug ILIKE '%powermate%' OR slug ILIKE '%power-mate%' OR slug ILIKE '%airpower%' OR slug ILIKE '%air-power%' OR slug ILIKE '%charge-pro%' OR slug ILIKE '%rapid-power%')
  AND (description IS NULL OR description = '');

-- ── Cables & Chargers ─────────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK charging cable or wall charger designed for fast, reliable power delivery to smartphones, tablets, and other USB devices. ZOOOK cables include Micro-USB, USB-C, Lightning, and multi-tip variants in standard 1-metre and extended 2-metre lengths, with nylon braided, TPE, or flat cable constructions for tangle-free durability. Fast charge cables support up to 65W Power Delivery for compatible devices. ZOOOK wall chargers range from standard 5W single-port adapters to 65W GaN (Gallium Nitride) multi-port chargers that simultaneously fast-charge a laptop, phone, and tablet from a single compact adapter. All products carry BIS certification and feature overvoltage, overcurrent, and short-circuit protection for safe charging. ZOOOK accessories are available for retail and bulk B2B procurement through USJ Technologies.',
  key_features = ARRAY[
    'Micro-USB, USB-C, Lightning, and multi-tip cable variants',
    'Nylon braided and TPE cable constructions for tangle-free durability',
    'Fast charge support up to 65W USB Power Delivery on premium models',
    'Wall chargers from 5W standard to 65W GaN multi-port',
    'GaN charger: charges laptop + phone + tablet from a single compact adapter',
    'BIS certified — meets Indian Bureau of Standards safety requirements',
    'Overvoltage, overcurrent, and short-circuit protection built in',
    'Available for bulk B2B orders with GST invoicing'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Cable%' OR category_name ILIKE '%Charger%' OR slug ILIKE '%zf-%' OR slug ILIKE '%zt-%' OR slug ILIKE '%cable%' OR slug ILIKE '%charge%' OR slug ILIKE '%tangent%' OR slug ILIKE '%chargelnk%' OR slug ILIKE '%chargemate%' OR slug ILIKE '%turbo-charge%' OR slug ILIKE '%dash-charge%' OR slug ILIKE '%speedo-c%')
  AND (description IS NULL OR description = '');

-- ── Mouse Pads & Desk Accessories ─────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK desk accessory — either a large gaming or office mouse pad, wireless charging pad, or multi-function desk mat — designed to improve workspace comfort, precision, and organisation. ZOOOK gaming mouse pads feature micro-textured surfaces optimised for both optical and laser mouse sensors, providing consistent, precise cursor tracking for gaming and design work. Extended desk mat variants cover the full keyboard and mouse area in one piece, protecting the desk surface and providing a unified aesthetic. The Magic Pad wireless charging variant combines a large desk mat with built-in Qi wireless charging — providing cable-free phone charging while maintaining a full-size mouse pad surface. Non-slip rubber bases prevent sliding during intense use.',
  key_features = ARRAY[
    'Micro-textured surface for precise optical and laser mouse tracking',
    'Extended desk mat variants cover full keyboard + mouse area',
    'Magic Pad: built-in Qi wireless charging pad integrated into desk mat',
    'Non-slip rubber base prevents sliding during gaming and daily use',
    'Smooth cloth surface for fast mouse movement',
    'Stitched edges prevent fraying and extend product lifespan',
    'Water-resistant surface coating for spill protection',
    'Available in multiple sizes for different desk configurations'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Pad%' OR category_name ILIKE '%Mouse Pad%' OR slug ILIKE '%magic-pad%' OR slug ILIKE '%digi-pad%' OR slug ILIKE '%finger-pad%' OR slug ILIKE '%palm-pad%' OR slug ILIKE '%travel-pad%' OR slug ILIKE '%qwerty-pad%' OR slug ILIKE '%-zk-%')
  AND (description IS NULL OR description = '');

-- ── USB Hubs & Type-C Accessories (ZOOOK) ────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK USB Type-C hub or adapter expanding the connectivity of modern laptops, MacBooks, and tablets with additional ports. ZOOOK Compumate USB-C hubs are available in 4-in-1, 5-in-1, and 8-in-1 configurations combining USB-A 3.0 ports, USB-C PD passthrough charging, HDMI 4K output, SD/TF card readers, and Gigabit Ethernet in a single compact hub. The C-L1000 Type-C to Gigabit LAN adapter provides reliable wired Ethernet connectivity to USB-C only laptops and MacBooks. All hubs support plug-and-play on Windows, macOS, and iPadOS — no drivers required. Ideal for business professionals, students, and creative workers who need expanded connectivity without carrying multiple individual adapters.',
  key_features = ARRAY[
    'USB-C hub in 4-in-1, 5-in-1, 8-in-1 configurations',
    'USB-A 3.0 ports for high-speed peripherals up to 5Gbps',
    'HDMI output up to 4K@30Hz for external monitor or projector connection',
    'USB-C PD passthrough charging — charge laptop while using the hub',
    'SD and TF card reader for photographers and content creators',
    'Gigabit Ethernet adapter for reliable wired internet on USB-C laptops',
    'Plug-and-play on Windows, macOS, iPadOS — no drivers required',
    'Compact portable design fits in laptop bag pockets'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Hub%' OR category_name ILIKE '%Type-C%' OR slug ILIKE '%-c-hub%' OR slug ILIKE '%-c-l1000%' OR slug ILIKE '%compumate%' OR slug ILIKE '%oximate%')
  AND (description IS NULL OR description = '');

-- ── Smart Home / Security (ZOOOK) ────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK smart home or security product — either a smart Wi-Fi power strip, smart plug, infrared thermometer, or security camera — designed for intelligent home and office automation. ZOOOK Smart Connect strips and plugs allow remote control of connected appliances via a smartphone app from anywhere with internet, with scheduling, energy monitoring, and voice assistant compatibility (Alexa, Google Assistant). The ZOOOK Infra Temp is a non-contact infrared thermometer for instant, hygienic temperature measurement — widely used in offices, schools, clinics, and public spaces. The ArmourShield product line includes screen protectors for premium smartphone models in tempered glass and flexible film variants.',
  key_features = ARRAY[
    'Smart Wi-Fi power strip with individual socket control via smartphone app',
    'Works with Amazon Alexa and Google Assistant voice commands',
    'Schedule timers for automatic on/off of connected appliances',
    'Energy monitoring on select models — track power consumption per socket',
    'Non-contact infrared thermometer for instant, hygienic temperature reading',
    'Infrared thermometer range: 32°C to 42.5°C with 0.1°C accuracy',
    'Screen protector variants in 9H tempered glass and flexible film',
    'Surge protection built into smart strip models'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Smart%' OR category_name ILIKE '%Security%' OR slug ILIKE '%smart-connect%' OR slug ILIKE '%acti-secure%' OR slug ILIKE '%armor-shield%' OR slug ILIKE '%infra-temp%' OR slug ILIKE '%eagle-cam%' OR slug ILIKE '%cameraman%')
  AND (description IS NULL OR description = '');

-- ── Keyboards & Remotes (ZOOOK) ──────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK wireless keyboard, air mouse remote, or presentation remote designed for smart TVs, Android TV boxes, media players, and computer presentations. ZOOOK air remotes combine a QWERTY keyboard with gyroscope-based air mouse functionality — allowing full text input and cursor control without a desk surface, ideal for controlling smart TVs and Android boxes from the couch. Presentation clicker remotes feature laser pointer and wireless slide advance/back buttons compatible with PowerPoint, Keynote, and Google Slides across USB dongle distances of 10-15 metres. All products connect via USB nano-receiver (plug-and-play) or Bluetooth and are compatible with Windows, Android, and Linux.',
  key_features = ARRAY[
    'Air mouse + QWERTY keyboard in one remote — no flat surface needed',
    'Gyroscope air mouse for cursor control on smart TVs and Android boxes',
    'Presentation remote with laser pointer and slide control buttons',
    'USB nano-receiver — plug-and-play, no drivers required',
    '10-15 metre wireless range for living room and conference room use',
    'Rechargeable battery via USB on select models',
    'Compatible with Windows, macOS, Android, and Linux',
    'Ideal for smart TV control, home theater, and boardroom presentations'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Keyboard%' OR category_name ILIKE '%Remote%' OR slug ILIKE '%zk-%' OR slug ILIKE '%zmt-bk%' OR slug ILIKE '%zmt-ap%' OR slug ILIKE '%clicker%' OR slug ILIKE '%slideshow%')
  AND (description IS NULL OR description = '');

-- ── Microphones (ZOOOK) ──────────────────────────────────────
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK microphone designed for karaoke, live singing, content creation, podcasting, and voice recording. ZOOOK Karaoke microphones feature built-in Bluetooth wireless connectivity for pairing directly to a smartphone or Bluetooth speaker, with real-time echo and reverb effects for enhanced singing performance. The Communicate USB microphone provides plug-and-play voice capture for video calls, online teaching, podcasting, and streaming — connecting directly to a PC or laptop via USB without any driver installation. All microphones feature cardioid or omnidirectional pickup patterns for clear voice capture with reduced background noise. ZOOOK microphones are popular for home karaoke setups, YouTube content creation, and online education.',
  key_features = ARRAY[
    'Bluetooth wireless karaoke microphone — pairs to any Bluetooth speaker',
    'Built-in echo and reverb effects for enhanced karaoke performance',
    'USB microphone for plug-and-play connection to PC and laptop',
    'Cardioid pickup pattern for clear voice, reduced background noise',
    'Built-in rechargeable battery on wireless models (3-5 hours)',
    'Compatible with karaoke apps on Android and iOS',
    'Volume and echo control buttons on the microphone body',
    'LED indicator for power, pairing, and charge status'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (category_name ILIKE '%Microphone%' OR category_name ILIKE '%Mic%' OR slug ILIKE '%karaoke%' OR slug ILIKE '%communicate%' OR slug ILIKE '%zmt-cm%')
  AND (description IS NULL OR description = '');

-- ── Catch-all for remaining ZOOOK products without description ─
UPDATE products
SET
  description = 'The ' || name || ' is a ZOOOK brand electronics accessory available through USJ Technologies — an authorized ZOOOK distributor and GeM registered seller. USJ Technologies supplies ZOOOK products to retail stores, corporate buyers, government departments, and institutional buyers across India with competitive B2B pricing, GST invoicing, and pan-India delivery. Contact USJ Technologies for bulk pricing, GeM procurement, and product availability.',
  key_features = ARRAY[
    'Authorized ZOOOK product supplied by USJ Technologies',
    'Available for individual, bulk, and institutional orders',
    'GeM registered — available for government procurement',
    'GST invoice provided for all B2B and institutional orders',
    'Pan-India delivery from Dehradun, Uttarakhand',
    'Technical support and after-sales service available',
    'Contact USJ Technologies for bulk pricing and availability'
  ]
WHERE brand_name ILIKE '%ZOOOK%'
  AND (description IS NULL OR description = '');

-- ── Catch-all for remaining ENTER products without description ─
UPDATE products
SET
  description = 'The ' || name || ' is an ENTER brand computer hardware or accessory available through USJ Technologies — an authorized ENTER distributor and GeM registered seller in India. USJ Technologies supplies ENTER products to government departments, educational institutions, corporate offices, and retail stores across India, with GeM-registered procurement support, GST invoicing, and pan-India delivery. Contact USJ Technologies for bulk pricing, GeM order support, and product availability.',
  key_features = ARRAY[
    'Authorized ENTER product supplied by USJ Technologies',
    'Available for individual, bulk, and institutional orders',
    'GeM registered — available for government procurement',
    'GST invoice provided for all B2B and institutional orders',
    'Pan-India delivery from Dehradun, Uttarakhand',
    'Technical support and after-sales service available',
    'Contact USJ Technologies for bulk pricing and availability'
  ]
WHERE brand_name ILIKE '%ENTER%'
  AND (description IS NULL OR description = '');

-- ── Verify counts ─────────────────────────────────────────────
SELECT
  brand_name,
  COUNT(*) AS total_products,
  COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) AS with_description,
  COUNT(CASE WHEN description IS NULL OR description = '' THEN 1 END) AS still_missing
FROM products
WHERE brand_name ILIKE '%ENTER%' OR brand_name ILIKE '%ZOOOK%'
GROUP BY brand_name
ORDER BY brand_name;
