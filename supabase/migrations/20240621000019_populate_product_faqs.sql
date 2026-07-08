-- ============================================================
-- USJ Technologies -- Migration 019: Populate Product-Specific FAQs

-- Products are grouped into category buckets below only to select
-- the right QUESTION TYPE for that kind of product (a router gets
-- SIM/coverage questions, a power bank gets mAh/fast-charge
-- questions, etc.)
--
-- 
-- Run in Supabase SQL Editor, or via `supabase db push`.
-- ============================================================

-- ---------- accessory_combo (4 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Do the keyboard and mouse in the ' || name || ' pair together on one receiver?', 'answer', 'Yes, the ' || name || ' is designed to pair both devices to a single USB receiver for a clutter-free connection.'),
    jsonb_build_object('question', 'Are batteries included with the ' || name || '?', 'answer', 'Please check the in-box contents on the ' || name || '''s product page.')
  )
WHERE slug = ANY(ARRAY[
    'usb-keyboard-mouse-combo-ignite-pro', 'usb-keyboard-mouse-combo-styletype-pro', 'usb-keyboard-mouse-combo-typemate-pro', 'wireless-keyboard-mouse-combo-saathi'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- accessory_headphone (11 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' have a built-in microphone?', 'answer', 'Please check the ' || name || '''s title and specifications, as some models in this range include an inline or boom microphone while others are audio-only.'),
    jsonb_build_object('question', 'Is the ' || name || ' compatible with my phone as well as my PC?', 'answer', 'If the ' || name || ' has a standard 3.5mm jack, it works across phones, laptops, and PCs -- check its connector type to confirm.'),
    jsonb_build_object('question', 'What is the cable length on the ' || name || '?', 'answer', 'Please check the ' || name || '''s specifications for its exact cable length.')
  )
WHERE slug = ANY(ARRAY[
    'eh-02a-headphones-with-mic', 'gangsta-wired-headphone', 'python-wired-headphone', 'single-pin-wired-headphone-with-mic-astra', 'usb-headset-talkmate', 'warlord-wired-headphone',
    'wired-gaming-headset-dominator', 'wired-headphone-with-mic-model-spartan', 'wired-headphone-with-mic-phantom-blue-', 'wired-headphone-with-mic-phantom-green-', 'wired-headphone-with-mic-phantom-red-'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- accessory_keyboard (6 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' wired or wireless?', 'answer', 'Please check the ' || name || '''s title and specifications to confirm whether it connects via USB cable or wireless receiver/Bluetooth.'),
    jsonb_build_object('question', 'Does the ' || name || ' work with both Windows and Mac?', 'answer', 'The ' || name || ' is primarily designed and tested for Windows; some keys may not map correctly on Mac, though basic typing functions should still work.'),
    jsonb_build_object('question', 'Is the ' || name || ' spill-resistant?', 'answer', 'Please check the ' || name || '''s product description for spill-resistance details.')
  )
WHERE slug = ANY(ARRAY[
    'apache-usb-keyboard', 'fighter-usb-keyboard-model', 'officemate-keyboard', 'usb-keyboard-easyclick', 'wired-mechanical-keyboard-phoenix-pro', 'wired-mini-keyboard-typist-mini'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- accessory_mouse (14 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' a wired or wireless mouse?', 'answer', 'Please check the ' || name || '''s title and specifications to confirm the connection type -- wired (USB) or wireless (2.4GHz receiver/Bluetooth).'),
    jsonb_build_object('question', 'What DPI does the ' || name || ' support, and can it be adjusted?', 'answer', 'Please check the ' || name || '''s specifications for its DPI range and whether it includes a DPI-switch button for adjusting sensitivity.'),
    jsonb_build_object('question', 'Does the ' || name || ' require batteries, and are they included?', 'answer', 'If the ' || name || ' is wireless, it typically requires AA/AAA batteries; check the product page to see if they''re included in the box.')
  )
WHERE slug = ANY(ARRAY[
    'grenade-usb-mouse', 'neon-usb-mouse', 'nero-wired-mouse', 'usb-optical-mouse-click', 'usb-optical-mouse-fastclick', 'wired-optical-mouse-black-cursor',
    'wired-optical-mouse-black-eternal', 'wireless-mouse-clickmate', 'wireless-mouse-cruizer', 'wireless-mouse-dazzler', 'wireless-mouse-swish-black-blue', 'wireless-mouse-swish-black-red',
    'wireless-optical-mouse-scroller', 'wireless-optical-mouse-voyager'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- accessory_speaker (7 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' need a power outlet, or does it run on USB power?', 'answer', 'Please check the ' || name || '''s specifications for its power source -- most computer speakers in this range are USB or DC-powered rather than battery-operated.'),
    jsonb_build_object('question', 'Can I connect the ' || name || ' to my phone as well as my PC?', 'answer', 'If the ' || name || ' has a standard 3.5mm aux input, yes -- check its connectivity options to confirm.')
  )
WHERE slug = ANY(ARRAY[
    'bluetooth-party-speaker-bass-attack', 'bluetooth-speaker-party-blaster-s10', 'bluetooth-speaker-party-blaster-s15', 'e-s280wd-usb-2.0-speaker-wooden', 'igloo-multimedia-2.0-mini-speaker-red', 'multimedia-2.0-mini-speaker-groove-blue',
    'usb-2.0-computer-speaker-music-eyes'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- accessory_webcam (3 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What resolution does the ' || name || ' record and stream in?', 'answer', 'Please check the ' || name || '''s specifications for its exact resolution (e.g., 720p, 1080p).'),
    jsonb_build_object('question', 'Does the ' || name || ' have a built-in microphone?', 'answer', 'Check the ' || name || '''s specifications -- most webcams in this range include a built-in mic suitable for calls.'),
    jsonb_build_object('question', 'Will the ' || name || ' work with Zoom, Teams, and other video call apps?', 'answer', 'Yes, the ' || name || ' uses standard USB video class (UVC) drivers recognized automatically by Windows, making it compatible with most video calling and streaming apps.')
  )
WHERE slug = ANY(ARRAY[
    'web-camera-snapcam', 'webcam-wowcam', 'zoom1-web-camera'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_adapter_hub (14 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' support data transfer as well as charging?', 'answer', 'Yes, the ' || name || ' supports data transfer through its USB ports; check its port list for pass-through power delivery support.'),
    jsonb_build_object('question', 'Will the ' || name || ' work with my laptop if it only has USB-C ports?', 'answer', 'Yes, the ' || name || ' expands a single USB-C port into multiple connections; check its exact port list to confirm it covers what you need.'),
    jsonb_build_object('question', 'Does the ' || name || ' need external power, or does it draw power from the laptop?', 'answer', 'Most hubs like the ' || name || ' draw power directly from the connected USB-C or USB port; check its specifications if it''s a higher-power multi-port model.')
  )
WHERE slug = ANY(ARRAY[
    '600m-bt-dual-band-wi-fi-bt-usb-adapter', 'e-c2hd-type-c-to-hdmi-adapter', 'e-c3h-type-c-to-3-in-1-hub', 'e-c4u3-type-c-to-4-port-usb-3.0-hub', 'e-c5h-type-c-to-5-in-1-hub', 'e-c6rj45-enter-connector-rj45-cat6',
    'e-u4h200-usb-2.0-hi-speed-4port-hub', 'e-u4p-usb-2.0-4-port-hub', 'e-uc2h4-type-c-to-4-port-usb-3.1-hub', 'e-ucl-type-c-to-lan', 'e-ucl1000-type-c-to-lan-gigabit', 'e-ucuc1-typc-c-to-usb-2.0-hub-card-reader',
    'e-ul100-usb-to-lan', 'e-w170-star-usb-to-wireless-lan-150mbps'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_cabinet (11 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What motherboard sizes (ATX, Micro-ATX) fit the ' || name || '?', 'answer', 'Please check the ' || name || '''s specifications for supported motherboard form factors before purchasing your components.'),
    jsonb_build_object('question', 'Does the ' || name || ' come with a power supply included?', 'answer', 'Check the ' || name || '''s title and in-box contents -- some cabinets are sold with an SMPS/power supply included, while others are case-only.'),
    jsonb_build_object('question', 'How many fans can the ' || name || ' support, and are any pre-installed?', 'answer', 'Fan mounting points and any pre-installed fans for the ' || name || ' are listed in its specifications.'),
    jsonb_build_object('question', 'Is there enough clearance for a full-size graphics card in the ' || name || '?', 'answer', 'Please check the ' || name || '''s maximum supported GPU length against your graphics card''s length.')
  )
WHERE slug = ANY(ARRAY[
    'computer-gaming-case-prince', 'computer-gaming-case-with-smps-razor', 'energy-computer-case-with-smps', 'fiesta-computer-cabinet', 'nyc-computer-cabinet', 'opera-computer-cabinet',
    'passion-computer-case-with-smps', 'simba-computer-case-with-smps', 'splendour-computer-cabinet', 'synergy-computer-case-with-smps', 'victoria-computer-cabinet'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_cable_connector (8 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What cable category is the ' || name || ' -- Cat5e or Cat6?', 'answer', 'Please check the ' || name || '''s title and specifications for its exact cable category and length, which determines the maximum supported network speed.'),
    jsonb_build_object('question', 'Is the ' || name || ' suitable for outdoor use?', 'answer', 'Please check the ' || name || '''s description for outdoor/UV-resistant rating; standard indoor cables are not designed for prolonged outdoor exposure.'),
    jsonb_build_object('question', 'What is the maximum network speed supported by the ' || name || '?', 'answer', 'This depends on the ' || name || '''s cable category -- Cat5e typically supports up to 1Gbps, while Cat6/Cat6e supports higher speeds over shorter distances.')
  )
WHERE slug = ANY(ARRAY[
    'enter-e-c6e100-cable-cat-6e-100-meters', 'enter-e-c6e305-cable-cat-6e-305-meters', 'enter-e-m5-connector-rj45-cat-5', 'entergo-usb-charger-rock-1-nc-without-cable', 'entergo-usb-charger-rock-1-nc-without-cable-copy-364', 'zoook-charge-pro-rapid-charge-sync-cable',
    'zoook-chargelnk-cable', 'zoook-tangent-rapid-charge-sync-cables'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_graphics_card (5 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Will the ' || name || ' fit in my PC case?', 'answer', 'Please check the ' || name || '''s physical length in its specifications against your cabinet''s available clearance before purchasing.'),
    jsonb_build_object('question', 'Does my power supply need to meet a minimum wattage for the ' || name || '?', 'answer', 'Yes, check the ' || name || '''s recommended PSU wattage and required connectors before installing it.'),
    jsonb_build_object('question', 'Does the ' || name || ' need a separate power connector, or does it draw power from the PCIe slot alone?', 'answer', 'Check the ' || name || '''s specifications -- higher-end cards require a 6-pin or 8-pin PCIe power connector, while lower-power cards run off the slot alone.'),
    jsonb_build_object('question', 'What resolution and games can the ' || name || ' handle smoothly?', 'answer', 'Performance depends on the ' || name || '''s VRAM and core count; refer to its product page for the recommended use case.')
  )
WHERE slug = ANY(ARRAY[
    'e-gt210-pci-e-graphics-card-1gb', 'e-gt610-pci-e-graphics-card-2gb', 'e-gt730-pci-e-graphics-card-4gb', 'enter-gtx-1660-ti-6gd6-v3-graphic-card', 'enter-rx-580-8gd5-graphic-card'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_laptop_adapter (2 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Will the ' || name || ' work with my laptop''s voltage requirements?', 'answer', 'The ' || name || ' includes multiple connector tips and adjustable voltage/wattage settings, but confirm your laptop''s required voltage and wattage matches before use.'),
    jsonb_build_object('question', 'Does the ' || name || ' include the connector tip for my laptop brand?', 'answer', 'Check the included tip list on the ' || name || '''s product page to confirm one fits your laptop''s charging port.'),
    jsonb_build_object('question', 'Is it safe to use the ' || name || ' instead of my laptop''s original adapter?', 'answer', 'Yes, provided the ' || name || '''s output voltage and wattage match your laptop''s requirements; insufficient wattage may cause slow charging or no charging while in use.')
  )
WHERE slug = ANY(ARRAY[
    'en-en45ac_004-laptop-adapter-universal-40w', 'en-en45ac_005-laptop-adapter-universal-61w-type-c'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_laptop_battery (16 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Will the ' || name || ' fit my exact laptop model?', 'answer', 'Please match your laptop''s exact model number and original battery part number against the compatibility list on the ' || name || '''s product page, as manufacturers use several variants across similar-looking models.'),
    jsonb_build_object('question', 'Is the ' || name || ' an original OEM battery or a compatible replacement?', 'answer', 'The ' || name || ' is a compatible replacement battery built to match OEM specifications; check the product listing for exact compatibility details.'),
    jsonb_build_object('question', 'How long does the ' || name || ' typically last?', 'answer', 'Battery life depends on usage patterns, but a healthy ' || name || ' typically lasts 2-3 years of regular use before capacity noticeably declines.'),
    jsonb_build_object('question', 'Do I need any tools to install the ' || name || ' myself?', 'answer', 'Most laptop batteries like the ' || name || ' are user-replaceable and require no tools, but some laptops need a back panel removed with a screwdriver -- check your laptop''s manual.')
  )
WHERE slug = ANY(ARRAY[
    'e1-aa2110-laptop-battery-for-hp-cq32-42-62-series-wd548aa-en', 'e1-aa2111-laptop-battery-for-acer-tm-4740-as10d41-en', 'e1-aa2112-laptop-battery-for-hp-pavilion-dv4-dv5-ks524aa-en', 'e1-aa2113-laptop-battery-for-hp-6360b-6460b-6560b-qk643aa-en', 'e1-aa2114-laptop-battery-for-toshiba-pa3817u-en', 'e2-ab3110-laptop-battery-for-13r-14r-15r-8nh55-en',
    'e2-ab3111-laptop-battery-for-e5420-latitude-en', 'e2-ab3112-laptop-battery-for-inspiron-15-3521-5521-6-cell-4dmng-en', 'e2-ab3113-laptop-battery-for-1525-y823g-en', 'e2-ab3114-laptop-battery-for-a840-860-f286h-en', 'e3-ac4110-laptop-battery-for-hp-15ac-hs04-en', 'e3-ac4111-laptop-battery-for-hp-250-series-oa04-en',
    'e3-ac4112-laptop-battery-for-lenovo-ideapad-g400s-g500s-4cell-121500043-en', 'e3-ac4113-laptop-battery-for-dell-inspirion-15-3558-40wh-4-cell-m5y1k-3451-en', 'e3-ac4114-laptop-battery-for-inspiron-15-3521-5521-4-cell-4dmng-en', 'e3-ac4115-laptop-battery-for-hp-jc04-for-hp-240-g6-245-g6-series-2lp34aa-en'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_monitor (9 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What ports does the ' || name || ' have for connecting my PC?', 'answer', 'Please check the ' || name || '''s specifications for its exact port list (HDMI, VGA, DisplayPort, etc.).'),
    jsonb_build_object('question', 'Is the ' || name || ' suitable for gaming, or just office use?', 'answer', 'Check the ' || name || '''s refresh rate and response time -- 75Hz+ refresh rates suit gaming, while standard 60Hz panels suit office and everyday use.'),
    jsonb_build_object('question', 'Does the ' || name || ' include built-in speakers?', 'answer', 'Please refer to the ' || name || '''s specifications to confirm whether built-in speakers are included.'),
    jsonb_build_object('question', 'Can the ' || name || ' be wall-mounted?', 'answer', 'Check the ' || name || '''s VESA mount pattern in its specifications to ensure compatibility with your wall mounting bracket.')
  )
WHERE slug = ANY(ARRAY[
    'en-e-mo-a01-19-wide-monitor', 'en-e-mo-a011-32-curved-borderless-monitor', 'en-e-mo-a012-w-22-borderless-monitor', 'en-e-mo-a013-w-24-borderless-monitor', 'en-e-mo-a014-27-borderless-monitor', 'en-e-mo-a02-17.1-square-monitor',
    'en-e-mo-a03-n-22-wide-monitor', 'en-e-mo-a06-15.4-wide-monitor', 'en-e-mo-a09-20-wide-monitor'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_motherboard (13 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Which CPU generations are compatible with the ' || name || '?', 'answer', 'Compatibility depends on the socket type and chipset of the ' || name || '; please check its CPU support list before purchasing a processor.'),
    jsonb_build_object('question', 'What type and maximum amount of RAM does the ' || name || ' support?', 'answer', 'Check the ' || name || '''s specifications for its supported RAM type (DDR3/DDR4) and maximum capacity before buying memory.'),
    jsonb_build_object('question', 'Does the ' || name || ' include onboard graphics, or do I need a separate GPU?', 'answer', 'The ' || name || ' likely includes onboard/integrated graphics via the CPU for basic display output; you''ll need a dedicated graphics card for gaming or heavy graphics workloads.'),
    jsonb_build_object('question', 'Is the ' || name || ' suitable for a gaming PC build?', 'answer', 'This depends on the ' || name || '''s chipset and your CPU/GPU choice -- entry-level boards are best suited for office and general-use builds.')
  )
WHERE slug = ANY(ARRAY[
    'e-a520-motherboard', 'e-b-h61', 'e-b450-motherboard', 'e-h110-motherboard-for-computer', 'e-h310', 'e-h510-enter-motherboard-for-computer',
    'e-h610-motherboard', 'e-h61s', 'e-h81-enter-motherboard-for-computer', 'e-h81s', 'e-mbg41-enter-motherboard-for-computer', 'e-mbh61-enter-motherboard-for-computer',
    'f-g41d2-motherboard-for-computer'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_pci_card (12 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Which PCI slot does the ' || name || ' require -- PCI or PCI Express?', 'answer', 'Check the ' || name || '''s title and specifications, as this range includes both legacy PCI and PCI Express (PCIe) cards which are not physically interchangeable.'),
    jsonb_build_object('question', 'Do I need to install drivers for the ' || name || ' to work?', 'answer', 'Most cards like the ' || name || ' are supported natively by Windows, but installing the manufacturer''s driver ensures full functionality and stability.'),
    jsonb_build_object('question', 'How many ports does the ' || name || ' add to my PC?', 'answer', 'Please check the ' || name || '''s specifications for the exact port count and type it adds.')
  )
WHERE slug = ANY(ARRAY[
    'e-1pe-pci-express1-port-parallel', 'e-1s1p-pci-1-port-serial-1-port-parallel', 'e-2se1p-pci-e-2-serial-1-parralel-card', 'e-eusb4-pci-express-usb3.0-4-port-card', 'e-usb4-pci-usb-host-card-4-port', 'enter-e-100e-pci-ethernet-10-100-mbps',
    'enter-e-1p-pci-to-1-port-parallel-card', 'enter-e-2s-pci-2-port-serial-card', 'enter-e-4s-sound-card-pci-4-channel', 'enter-e-fwa-pci-3-1-port-f-w-card-400mps', 'enter-e-us-usb-to-sound-card', 'intel-p-e-1000-pci-express-lan-card-10-100-1000'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_psu (1 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' enough to run my graphics card and system?', 'answer', 'Check your GPU and system''s total recommended wattage against the ' || name || '''s rated output, and ensure it has the required PCIe power connectors for your card.'),
    jsonb_build_object('question', 'What connectors are included with the ' || name || '?', 'answer', 'Please check the ' || name || '''s specifications for the exact list of connectors (24-pin, CPU, SATA, PCIe) included.'),
    jsonb_build_object('question', 'Is the ' || name || ' 80 Plus certified for efficiency?', 'answer', 'Please check the ' || name || '''s specifications for certification details.')
  )
WHERE slug = ANY(ARRAY[
    'e-500f-computer-power-supply-500w'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_thin_client (2 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What operating system does the ' || name || ' run?', 'answer', 'Please check the ' || name || '''s specifications for its supported OS; thin clients like the ' || name || ' are typically used to connect to a central server or virtual desktop.'),
    jsonb_build_object('question', 'Can the ' || name || ' be used as a standalone PC?', 'answer', 'The ' || name || ' is primarily designed to connect to a remote server/virtual desktop rather than run standalone applications; check its specifications for local processing capability.')
  )
WHERE slug = ANY(ARRAY[
    'e-fl300-thin-client', 'fl200-thin-client'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- enter_ups (1 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'How long will the ' || name || ' power my PC during an outage?', 'answer', 'Backup runtime depends on your connected load -- check the ' || name || '''s VA/wattage rating against your equipment''s power draw, or contact support for sizing guidance.'),
    jsonb_build_object('question', 'Does the ' || name || ' protect against voltage spikes as well as outages?', 'answer', 'Yes, the ' || name || ' is a line-interactive UPS providing both battery backup during outages and voltage regulation/surge protection during fluctuations.'),
    jsonb_build_object('question', 'Will the ' || name || ' beep during a power cut?', 'answer', 'The ' || name || ' emits an audible alarm during power outages and low-battery situations; check the manual for how to mute or adjust this.')
  )
WHERE slug = ANY(ARRAY[
    'e-u1200-line-interactive-ups'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_antenna (4 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Will the ' || name || ' work with my existing Tenda 4G/5G router?', 'answer', 'The ' || name || ' is designed to improve signal reception on compatible routers with a matching connector type. Please verify your router''s connector type matches the ' || name || ' before purchasing.'),
    jsonb_build_object('question', 'Does the ' || name || ' guarantee stronger signal in a low-coverage area?', 'answer', 'The ' || name || ' can meaningfully improve signal strength and stability, but results depend on your distance from the nearest tower; it cannot create signal where there is none.'),
    jsonb_build_object('question', 'Is outdoor mounting hardware included with the ' || name || '?', 'answer', 'Check the in-box contents on the ' || name || '''s product page -- most outdoor antenna models include basic mounting brackets.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-ant12-5g360', 'tenda-ant16-5g120', 'tenda-ant19-5g120', 'tenda-ant30-5g'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_camera (8 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' support night vision?', 'answer', 'Check the ' || name || '''s specifications for its infrared night vision range -- most models offer clear monitoring in low-light or no-light conditions.'),
    jsonb_build_object('question', 'Can I view the ' || name || '''s camera feed remotely on my phone?', 'answer', 'Yes, the ' || name || ' works with a companion app that lets you view live and recorded footage remotely over Wi-Fi or mobile data.'),
    jsonb_build_object('question', 'Does the ' || name || ' record to a memory card or need a subscription?', 'answer', 'Most models like the ' || name || ' support local microSD card recording without any subscription; cloud storage may be an optional paid add-on.'),
    jsonb_build_object('question', 'Is the ' || name || ' suitable for outdoor use?', 'answer', 'Please check the IP rating on the ' || name || '''s product page before installing it outdoors.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-i23', 'tenda-i24', 'tenda-i26', 'tenda-i27', 'tenda-i29', 'tenda-i36',
    'tenda-tc3b24c-4mm-6mm', 'tenda-tc3t24c-2-8mm-4mm'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_extender (4 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Will the ' || name || ' work with any router, or only Tenda routers?', 'answer', 'The ' || name || ' works with any standard Wi-Fi router (802.11 b/g/n/ac) regardless of brand, extending your existing network''s coverage.'),
    jsonb_build_object('question', 'Where should I place the ' || name || ' for best results?', 'answer', 'Place the ' || name || ' roughly halfway between your router and the area with weak signal, ideally where it still shows 2-3 bars from the main router.'),
    jsonb_build_object('question', 'Does using the ' || name || ' reduce my internet speed?', 'answer', 'Wireless repeating through the ' || name || ' can reduce throughput somewhat compared to a direct router connection, which is normal for all range extenders.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-re3l', 'tenda-re6l-pro', 'tenda-te3l', 'tenda-te6l-pro'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_gpon_ont (14 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' compatible with any ISP''s fiber network?', 'answer', 'The ' || name || ' supports standard GPON/EPON protocols, but compatibility can depend on your ISP''s provisioning. We recommend confirming with your ISP before installing the ' || name || '.'),
    jsonb_build_object('question', 'Do I need a separate router if I buy the ' || name || '?', 'answer', 'Check the ' || name || '''s feature list -- many of these units include a built-in Wi-Fi router, in which case a separate router isn''t required.'),
    jsonb_build_object('question', 'Can my ISP remotely configure the ' || name || '?', 'answer', 'Yes, most ISPs can manage the ' || name || ' remotely via TR-069, provided it''s compatible with their provisioning system.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-g0-5g-poe', 'tenda-g0-8g-poe', 'tenda-g1', 'tenda-g300-f', 'tenda-g500-f', 'tenda-hg1-v3-1',
    'tenda-hg10', 'tenda-hg10c', 'tenda-hg15', 'tenda-hg15c', 'tenda-hg21', 'tenda-hg24',
    'tenda-hg3', 'tenda-hg6c'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_mesh_wifi (23 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'How many ' || name || ' units do I need for my home?', 'answer', 'Coverage depends on your home''s size; as a general guide, one ' || name || ' unit covers roughly 1,500-2,000 sq ft. Check the available pack sizes on the ' || name || '''s product page.'),
    jsonb_build_object('question', 'Do all my mesh nodes need to be the ' || name || ', or can I mix models?', 'answer', 'For guaranteed compatibility and seamless roaming, we recommend using only ' || name || ' units together rather than mixing with other models.'),
    jsonb_build_object('question', 'Will my devices automatically switch between ' || name || ' nodes as I move around?', 'answer', 'Yes, the ' || name || ' mesh system uses a single Wi-Fi network name and automatically hands off your device to the nearest node as you move through your home.'),
    jsonb_build_object('question', 'Can I add more ' || name || ' nodes later if I need wider coverage?', 'answer', 'In most cases, yes -- additional ' || name || ' units can usually be added later to expand your mesh network.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-b6', 'tenda-b9', 'tenda-me3-pro-3-pack', 'tenda-me3-pro-3-pack-v2', 'tenda-me6-pro-3-pack', 'tenda-mx12-2-pack',
    'tenda-mx12-3-pack', 'tenda-mx12-3-pack-v4-0', 'tenda-mx15-pro-1-pack', 'tenda-mx15-pro-2-pack', 'tenda-mx15-pro-3-pack', 'tenda-mx21-pro-1-pack',
    'tenda-mx21-pro-2-pack', 'tenda-mx21-pro-3-pack', 'tenda-v12', 'tenda-v15', 'tenda-w12-v3-0', 'tenda-w13',
    'tenda-w15', 'tenda-w15-pro', 'tenda-w18e-v2-0', 'tenda-w30e', 'tenda-w311mi-v6-0'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_mobile_router (14 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' work with any SIM card, or only specific network providers?', 'answer', 'The ' || name || ' works with a nano-SIM from any GSM operator supporting its 4G/5G bands. Please check the operator''s band support against the ' || name || '''s specifications before purchase.'),
    jsonb_build_object('question', 'Can I use the ' || name || ' as my primary home router instead of a broadband connection?', 'answer', 'Yes, the ' || name || ' is designed to work as a standalone router using a mobile data SIM, giving you Wi-Fi for your whole home or office without a wired broadband line.'),
    jsonb_build_object('question', 'How many devices can connect to the ' || name || ' at the same time?', 'answer', 'The ' || name || ' typically supports around 30-32 concurrent Wi-Fi devices; check its specifications for the exact figure.'),
    jsonb_build_object('question', 'Is a SIM card included with the ' || name || '?', 'answer', 'No, a SIM card is not included with the ' || name || '. You will need to insert your own SIM from a local telecom operator and activate a data plan.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-4g01', 'tenda-4g03', 'tenda-4g03-pro', 'tenda-4g03-pro-v2-0', 'tenda-4g05', 'tenda-4g06',
    'tenda-4g07', 'tenda-4g08', 'tenda-4g09', 'tenda-4g180-v4-0', 'tenda-4g185-v4-0', 'tenda-5g01',
    'tenda-5g03', 'tenda-5g06'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_other (4 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What is the intended use case for the ' || name || '?', 'answer', 'Please refer to the ' || name || '''s product description and specifications for its intended networking use case, or reach out to our support team for guidance.'),
    jsonb_build_object('question', 'Is technical support available for setting up the ' || name || '?', 'answer', 'Yes, our support team can help you set up and configure the ' || name || ' -- reach out via the contact page for assistance.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-o9-1-pack', 'tenda-rx12-pro-v2-0', 'tenda-rx12l-pro', 'tenda-tm5'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_outdoor_ap (7 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' weatherproof for permanent outdoor installation?', 'answer', 'Check the IP rating in the ' || name || '''s specifications -- outdoor AP models are typically built with weatherproof housings suited for permanent mounting.'),
    jsonb_build_object('question', 'Do I need a separate PoE injector to power the ' || name || '?', 'answer', 'Most outdoor APs like the ' || name || ' are PoE-powered, and a PoE adapter/injector is typically included in the box unless stated otherwise.'),
    jsonb_build_object('question', 'Can multiple ' || name || ' units be used together to extend coverage?', 'answer', 'Yes, ' || name || ' units are commonly deployed in multiples to blanket larger outdoor areas such as campuses, farms, or warehouses.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-o1-5g-1-pack-2-pack', 'tenda-o3-1-pack', 'tenda-o6-1-pack', 'tenda-o8-1-pack', 'tenda-oap1200', 'tenda-oap3000-v1-0',
    'tenda-os3-1-pack-2-pack'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_poe_bridge (10 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What is the ' || name || ' wireless bridge kit used for?', 'answer', 'The ' || name || ' is used to create a wireless point-to-point or point-to-multipoint link, commonly for connecting buildings, CCTV setups, or outdoor Wi-Fi without running cables.'),
    jsonb_build_object('question', 'Is PoE (Power over Ethernet) included with the ' || name || '?', 'answer', 'Check the in-box contents on the ' || name || '''s product page -- most kits include a PoE injector/adapter so the unit can be powered over the same Ethernet cable carrying data.'),
    jsonb_build_object('question', 'What is the maximum distance the ' || name || ' can cover?', 'answer', 'Range for the ' || name || ' varies with line-of-sight and interference; please refer to its rated distance in the specifications.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-ch10', 'tenda-ch7-wca-v2-0', 'tenda-ch7-wca-v2-1', 'tenda-ch9-wca', 'tenda-ch9-wca-v2-0', 'tenda-cp7-v2-0',
    'tenda-cp7-v2-1', 'tenda-rh7-wca-v2-0', 'tenda-rh9-wca', 'tenda-rp7-v2-0'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_switch (33 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' a managed or unmanaged switch?', 'answer', 'Check the ' || name || '''s product title and specifications -- Tenda offers both unmanaged plug-and-play switches and managed/smart switches with web-based configuration.'),
    jsonb_build_object('question', 'Does the ' || name || ' support PoE for powering cameras or access points?', 'answer', 'PoE support and power budget vary by model -- check the ' || name || '''s specifications for total PoE wattage and number of PoE ports.'),
    jsonb_build_object('question', 'What is the maximum cable length between the ' || name || ' and a connected device?', 'answer', 'Standard Ethernet cabling supports up to 100 meters between the ' || name || ' and a connected device using Cat5e/Cat6 cable.'),
    jsonb_build_object('question', 'Can the ' || name || ' be mounted on a wall or rack?', 'answer', 'Check the ' || name || '''s specifications for mounting options -- most desktop switches support wall-mounting, while rack-mount models include ears for standard 19-inch racks.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-s105-v10-0', 'tenda-s108-v8-0', 'tenda-s16', 'tenda-sg103m', 'tenda-sg105-v6-0', 'tenda-sg105m',
    'tenda-sg108-v4-0', 'tenda-sg108m', 'tenda-teg1005d-v5-0', 'tenda-teg1008m-v4-0', 'tenda-teg1016m-v3-0', 'tenda-teg2206p-4-63w',
    'tenda-teg2210p-8-120w', 'tenda-teg2216d', 'tenda-teg2216m', 'tenda-teg2220p-16-250w', 'tenda-teg2226f', 'tenda-teg5328xp-24-410w',
    'tenda-tem2005d-v1-0', 'tenda-tem2008d-v1-0', 'tenda-tes7001', 'tenda-tes7002', 'tenda-tes7004', 'tenda-tes7008-v2-0',
    'tenda-tes7008-v3-0', 'tenda-tes7016', 'tenda-tk4p-4bc', 'tenda-tk8p-4bc', 'tenda-tk8p-4btc', 'tenda-tn3104-4p',
    'tenda-tn3108', 'tenda-tn3108-8p', 'tenda-tn3116'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_usb_wifi (8 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' need a driver installation?', 'answer', 'Most Windows versions will auto-detect the ' || name || ', but we recommend installing its driver from the included CD or Tenda''s website for full feature support.'),
    jsonb_build_object('question', 'Is the ' || name || ' compatible with Linux or Mac?', 'answer', 'Please check the ' || name || '''s supported OS list, as some USB Wi-Fi adapters in this range are Windows-only.'),
    jsonb_build_object('question', 'What Wi-Fi speeds does the ' || name || ' support?', 'answer', 'Refer to the ' || name || '''s specifications for its rated speed.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-mf3', 'tenda-mf6-v2-0', 'tenda-tx12-pro-v2-0', 'tenda-tx12l-pro', 'tenda-tx2l-pro', 'tenda-u11-pro-v1-0',
    'tenda-u11-v1-0', 'tenda-u2-v5-0'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- tenda_wifi_router (7 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What is the difference between the ' || name || ' and a mesh Wi-Fi system?', 'answer', 'The ' || name || ' is a standalone router that broadcasts Wi-Fi from a single point. If you have a large or multi-floor home, our mesh range may suit you better than the ' || name || '.'),
    jsonb_build_object('question', 'Can I use the ' || name || ' with my existing broadband modem?', 'answer', 'Yes, connect your modem to the ' || name || '''s WAN port, and it will handle the Wi-Fi and local network.'),
    jsonb_build_object('question', 'Does the ' || name || ' support parental controls and guest Wi-Fi?', 'answer', 'Check the ' || name || '''s feature list -- most Tenda routers include app-based parental controls and a separate guest network option.'),
    jsonb_build_object('question', 'Is a firmware update required after setting up the ' || name || '?', 'answer', 'We recommend checking for and installing the latest firmware for the ' || name || ' right after setup, as it improves stability and security.')
  )
WHERE slug = ANY(ARRAY[
    'tenda-a18-pro', 'tenda-a23-v2-0', 'tenda-a33', 'tenda-a33-v2-0', 'tenda-ax12', 'tenda-ax12-pro',
    'tenda-be12-pro'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_accessory_misc (31 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What is the ' || name || ' compatible with?', 'answer', 'Please check the ' || name || '''s product description and specifications for its exact list of compatible devices.'),
    jsonb_build_object('question', 'What''s included in the box with the ' || name || '?', 'answer', 'Please refer to the ''In the Box'' section on the ' || name || '''s product page for its exact contents.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-zmt-ap400', 'zoook-zmt-ap401', 'zoook-zmt-bk301', 'zoook-zmt-bk302', 'zoook-zmt-bk303', 'zoook-zmt-bk304',
    'zoook-zmt-bk305', 'zoook-zmt-ca104', 'zoook-zmt-cae115', 'zoook-zmt-cae200', 'zoook-zmt-cae201', 'zoook-zmt-cae203',
    'zoook-zmt-cai105', 'zoook-zmt-cai106', 'zoook-zmt-cai109', 'zoook-zmt-cai110', 'zoook-zmt-cai117', 'zoook-zmt-cai119',
    'zoook-zmt-cai120', 'zoook-zmt-cai121', 'zoook-zmt-cmh1', 'zoook-zmt-cmh2', 'zoook-zmt-cmv', 'zoook-zmt-glow',
    'zoook-zmt-gn', 'zoook-zmt-hurricane', 'zoook-zmt-pure-sense', 'zoook-zmt-safetygloves', 'zoook-zmt-small-wonder', 'zoook-zmt-transformer',
    'zoook-zmt-ts'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_charger_cable (8 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' support fast charging?', 'answer', 'Please check the ' || name || '''s specifications for supported fast-charging protocols and maximum output.'),
    jsonb_build_object('question', 'What connector type does the ' || name || ' have (USB-C, Micro-USB, Lightning)?', 'answer', 'Please check the ' || name || '''s title and specifications for its exact connector type(s).'),
    jsonb_build_object('question', 'How durable is the ' || name || ' for daily use?', 'answer', 'Please check the ' || name || '''s product description for build details such as braided housing or reinforced connectors.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-zf-cc1a', 'zoook-zf-cc2a', 'zoook-zf-cc2b', 'zoook-zf-cc3a', 'zoook-zf-cc6a', 'zoook-zf-charge-station-1',
    'zoook-zf-chargemate1', 'zoook-zf-icharge-pd'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_earbuds_tws (15 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' truly wireless, or is there a wire between the two earpieces?', 'answer', 'Check the ' || name || '''s title -- TWS (true wireless stereo) models have no wire between earpieces, while neckband-style models do.'),
    jsonb_build_object('question', 'How long is the ' || name || '''s battery life, including the charging case?', 'answer', 'Please check the ' || name || '''s specifications for earbud playtime and total playtime with the charging case included.'),
    jsonb_build_object('question', 'Is the ' || name || ' sweat or water resistant for workouts?', 'answer', 'Please check the ' || name || '''s IPX rating in its specifications to confirm sweat/water resistance for exercise use.'),
    jsonb_build_object('question', 'Does the ' || name || ' support touch controls?', 'answer', 'Check the ' || name || '''s product description for its exact control scheme -- most models support touch or tap controls for play/pause, calls, and track skipping.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-airbuds-c', 'zoook-airpower', 'zoook-earpod-c', 'zoook-zt-b21m', 'zoook-zt-bic1m', 'zoook-zt-bm1m',
    'zoook-zt-fic1m', 'zoook-zt-flash', 'zoook-zt-hdmi', 'zoook-zt-ric3m', 'zoook-zt-rm1m', 'zoook-zt-selaux',
    'zoook-zt-selaux1', 'zoook-zt-tc1a', 'zoook-zt-tc2a'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_general_accessory (171 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What devices is the ' || name || ' compatible with?', 'answer', 'Please check the ' || name || '''s product description and specifications for its full compatibility list.'),
    jsonb_build_object('question', 'What is included in the box with the ' || name || '?', 'answer', 'Please refer to the ''In the Box'' section on the ' || name || '''s product page for its exact contents.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-acti-secure', 'zoook-active', 'zoook-agile', 'zoook-air-power-pro', 'zoook-armor-shield', 'zoook-audible',
    'zoook-avanche', 'zoook-blade', 'zoook-blade-bold', 'zoook-bolt-101', 'zoook-bolt-102', 'zoook-bolt-extreme',
    'zoook-bravo', 'zoook-cameraman', 'zoook-charge-pro', 'zoook-charge-pro-2', 'zoook-charge-pro-3-max', 'zoook-chargemate2',
    'zoook-chord', 'zoook-clicker-ir-hub', 'zoook-clique', 'zoook-combat-pro', 'zoook-communicate', 'zoook-concord',
    'zoook-concord-pro', 'zoook-crescendo', 'zoook-dash', 'zoook-dash-charge', 'zoook-dash-jr', 'zoook-datacard',
    'zoook-dazzler', 'zoook-digi-pad', 'zoook-dominator', 'zoook-eagle-cam-100', 'zoook-euphoria', 'zoook-explode-104',
    'zoook-explode-111-bt', 'zoook-exterminator', 'zoook-finger-pad', 'zoook-fusion', 'zoook-gama', 'zoook-gamer-z1',
    'zoook-harmonybar', 'zoook-hdmilink-a300', 'zoook-herculean-pro-duet', 'zoook-hurricane', 'zoook-in-style', 'zoook-infinite',
    'zoook-jaguar', 'zoook-jazz-duo', 'zoook-jazz-rhythm', 'zoook-killer', 'zoook-lava', 'zoook-magic-pad',
    'zoook-magic-pad-combo', 'zoook-melody-bar', 'zoook-mighty', 'zoook-mobilemate', 'zoook-monster-x1', 'zoook-mystique',
    'zoook-opera', 'zoook-orbit-pro', 'zoook-oximate', 'zoook-palm-pad', 'zoook-panache', 'zoook-panache-2',
    'zoook-panther', 'zoook-party-rocker', 'zoook-pb-mobilemate', 'zoook-petal', 'zoook-posh', 'zoook-power-mate-4',
    'zoook-power-mate-5', 'zoook-power-mate-6', 'zoook-power-pro', 'zoook-powermate-1', 'zoook-powermate-2zp-pbs10b', 'zoook-powermate-3',
    'zoook-prodigy', 'zoook-prosound-x', 'zoook-qwerty-pad', 'zoook-rambo', 'zoook-rapid-power', 'zoook-resonance-max',
    'zoook-rhythm', 'zoook-rifle', 'zoook-rush', 'zoook-rush-extreme', 'zoook-samurai', 'zoook-sense',
    'zoook-shine', 'zoook-show-stopper-duet', 'zoook-slideshow', 'zoook-smart-connect-1', 'zoook-smart-connect-2', 'zoook-smart-connect-strip-pps2',
    'zoook-sniper', 'zoook-sonata', 'zoook-speedo-c', 'zoook-stallone', 'zoook-stealth', 'zoook-sterling',
    'zoook-stinger', 'zoook-stingray', 'zoook-studio', 'zoook-studio-blast', 'zoook-studio-master', 'zoook-studio-one',
    'zoook-studio-pro', 'zoook-studio-solo', 'zoook-studio-switch', 'zoook-sublime', 'zoook-supernova', 'zoook-tango',
    'zoook-terminator', 'zoook-thump', 'zoook-tornado', 'zoook-travel-buddy', 'zoook-travel-pad', 'zoook-tulip',
    'zoook-turbo-charge', 'zoook-turbo-charge-2', 'zoook-turbo-charge-3', 'zoook-twin-barrel', 'zoook-twist', 'zoook-up-beat',
    'zoook-velocity-8', 'zoook-vibe', 'zoook-wifi-mate', 'zoook-xtreme', 'zoook-xtreme-duo', 'zoook-zf-3ic',
    'zoook-zf-airmate', 'zoook-zf-auxc', 'zoook-zf-b3ic', 'zoook-zf-blic', 'zoook-zf-blic2', 'zoook-zf-blmc',
    'zoook-zf-blmc2', 'zoook-zf-c2ul', 'zoook-zf-carmate1', 'zoook-zf-clear', 'zoook-zf-cstretch', 'zoook-zf-cu2a',
    'zoook-zf-cu3a', 'zoook-zf-cu4p', 'zoook-zf-denim', 'zoook-zf-flexi-3', 'zoook-zf-hc2a', 'zoook-zf-imate',
    'zoook-zf-istretch', 'zoook-zf-mstretch', 'zoook-zf-muc1', 'zoook-zf-notecase', 'zoook-zf-optico-100', 'zoook-zf-pocket-pad',
    'zoook-zf-pps1', 'zoook-zf-rm12m', 'zoook-zf-rm1m', 'zoook-zf-roadster', 'zoook-zf-rocker-aux-connect', 'zoook-zf-shield-asahi',
    'zoook-zf-stellar-yu', 'zoook-zf-tc1uk', 'zoook-zk-zr-144', 'zoook-zk-zr-216', 'zoook-zk-zr-386', 'zoook-zoook-jazz-claws-2',
    'zoook-zoook-monster-x', 'zoook-zoookdualthrust', 'zoook-zoooklegend'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_hub_adapter (6 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'How many ports does the ' || name || ' have, and what type?', 'answer', 'Please check the ' || name || '''s title and specifications for its exact port count and types.'),
    jsonb_build_object('question', 'Does the ' || name || ' support video output to a monitor or TV?', 'answer', 'Check the ' || name || '''s specifications for HDMI/VGA output support if you need to connect a display.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-c-hd4k', 'zoook-c-hub-i4-compumate', 'zoook-c-hub-i5-compumate', 'zoook-c-hub-i8-compumate', 'zoook-c-hub-iu43', 'zoook-c-l1000'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_lifestyle_gadget (2 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'How accurate is the ' || name || ', and is it suitable for medical use?', 'answer', 'Please refer to the ' || name || '''s specifications for accuracy details; it''s intended for general everyday use and not as a substitute for certified medical devices.'),
    jsonb_build_object('question', 'What is included in the box with the ' || name || '?', 'answer', 'Please check the ''In the Box'' section on the ' || name || '''s product page for exact contents.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-infra-temp', 'zoook-zf-air-aroma-diffuser'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_powerbank (45 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'What is the battery capacity (mAh) of the ' || name || '?', 'answer', 'Please check the ' || name || '''s title and specifications for its exact mAh capacity.'),
    jsonb_build_object('question', 'Does the ' || name || ' support fast charging for my phone?', 'answer', 'Please check the ' || name || '''s specifications for supported fast-charging protocols (e.g., PD, QC) and output wattage.'),
    jsonb_build_object('question', 'How many devices can I charge at the same time with the ' || name || '?', 'answer', 'Check the ' || name || '''s number of output ports in its specifications to see how many devices it can charge simultaneously.'),
    jsonb_build_object('question', 'Can I bring the ' || name || ' on a flight?', 'answer', 'Power banks under 100Wh are generally allowed in carry-on baggage per most airline rules; check the ' || name || '''s Wh rating and your airline''s policy before travel.'),
    jsonb_build_object('question', 'How long does it take to fully charge the ' || name || ' itself?', 'answer', 'Charging time depends on the ' || name || '''s capacity and the input charger used; a higher-wattage charger may charge it faster where supported.')
  )
WHERE slug = ANY(ARRAY[
    'zoook-zp-pb10000', 'zoook-zp-pb10000l', 'zoook-zp-pb10000ld', 'zoook-zp-pb10b', 'zoook-zp-pb10d', 'zoook-zp-pb10db',
    'zoook-zp-pb10dc', 'zoook-zp-pb10dd', 'zoook-zp-pb10k', 'zoook-zp-pb10mp', 'zoook-zp-pb10sp', 'zoook-zp-pb125',
    'zoook-zp-pb125a', 'zoook-zp-pb125b', 'zoook-zp-pb13000l', 'zoook-zp-pb2200', 'zoook-zp-pb2400', 'zoook-zp-pb2500',
    'zoook-zp-pb2500a', 'zoook-zp-pb2500b', 'zoook-zp-pb25k', 'zoook-zp-pb2600', 'zoook-zp-pb2600l', 'zoook-zp-pb26m',
    'zoook-zp-pb26r', 'zoook-zp-pb4400', 'zoook-zp-pb5000', 'zoook-zp-pb5400', 'zoook-zp-pb5k', 'zoook-zp-pb5ka',
    'zoook-zp-pb5kb', 'zoook-zp-pb5mp', 'zoook-zp-pb5s', 'zoook-zp-pb7800', 'zoook-zp-pbc25', 'zoook-zp-pbs10',
    'zoook-zp-pbs10c', 'zoook-zp-pbs10d', 'zoook-zp-pbs10e', 'zoook-zp-pbs10f', 'zoook-zp-pbs10g', 'zoook-zp-pbs10h',
    'zoook-zp-pbs15', 'zoook-zp-pbs5', 'zoook-zp-pbs5a'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_speaker (154 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Is the ' || name || ' waterproof, and can I use it in the shower or outdoors?', 'answer', 'Please check the ' || name || '''s IPX rating in its specifications -- many Zoook speakers are splash or water-resistant, but the exact rating varies by model.'),
    jsonb_build_object('question', 'How long does the ' || name || '''s battery last on a single charge?', 'answer', 'Please check the ' || name || '''s specifications for its rated playback time, as battery life varies with volume level used.'),
    jsonb_build_object('question', 'Can I connect two ' || name || ' units together for stereo sound (TWS pairing)?', 'answer', 'Check the ' || name || '''s product description for TWS (true wireless stereo) pairing support.'),
    jsonb_build_object('question', 'Does the ' || name || ' have a built-in microphone for calls?', 'answer', 'Please check the ' || name || '''s specifications -- most Bluetooth speakers in this range support hands-free calling via a built-in mic.'),
    jsonb_build_object('question', 'What is the Bluetooth range for the ' || name || '?', 'answer', 'Typical Bluetooth range is around 10 meters line-of-sight; check the ' || name || '''s specifications for its rated range.')
  )
WHERE slug = ANY(ARRAY[
    'bluetooth-audio-system-bass-bomber', 'bluetooth-earphone-bassbeats-dynamite', 'zoook-bass-master', 'zoook-bass-max', 'zoook-bass-monster-110', 'zoook-bass-monster-220',
    'zoook-bass-monster-330', 'zoook-bass-rocker', 'zoook-bass-warrior', 'zoook-bass-x1000', 'zoook-basslord', 'zoook-bomber',
    'zoook-karaoke-mic', 'zoook-mini-blaster', 'zoook-musicblaster', 'zoook-rocker-bluemate', 'zoook-rocker-boombox-atom', 'zoook-rocker-color-blast',
    'zoook-rocker-couplet', 'zoook-rocker-flame', 'zoook-rocker-harmony', 'zoook-rocker-ismart', 'zoook-rocker-jam', 'zoook-rocker-maestro',
    'zoook-rocker-thunder', 'zoook-rocker-thunder-2', 'zoook-rocker-thunder-buds', 'zoook-rocker-thunder-plus', 'zoook-rocker-thunder-pro', 'zoook-rocker-thunder-xl',
    'zoook-rocker-thunder-xxl-duet', 'zoook-rocker-thunderbird', 'zoook-rocker-thunderstone', 'zoook-rocker-twins', 'zoook-thunder-bolt', 'zoook-thunder-storm',
    'zoook-twin-blaster', 'zoook-twin-pro-blaster', 'zoook-zb-aqua', 'zoook-zb-be1', 'zoook-zb-beatles', 'zoook-zb-bhp110l',
    'zoook-zb-bhp15', 'zoook-zb-bhp18', 'zoook-zb-bnb200', 'zoook-zb-boom', 'zoook-zb-boombastic', 'zoook-zb-box',
    'zoook-zb-br165', 'zoook-zb-bs100', 'zoook-zb-bs300', 'zoook-zb-bsw', 'zoook-zb-bswf', 'zoook-zb-btck',
    'zoook-zb-bts51', 'zoook-zb-bts520', 'zoook-zb-btx2', 'zoook-zb-btx3', 'zoook-zb-btx4', 'zoook-zb-bullet',
    'zoook-zb-cuppa', 'zoook-zb-dot', 'zoook-zb-electra', 'zoook-zb-elite', 'zoook-zb-eureka', 'zoook-zb-halo',
    'zoook-zb-jazz', 'zoook-zb-jazz-beatz', 'zoook-zb-jazz-blaster', 'zoook-zb-jazz-claws', 'zoook-zb-jazz-mini', 'zoook-zb-jazz-musicbot',
    'zoook-zb-jazz-xl', 'zoook-zb-jazzxl', 'zoook-zb-magic', 'zoook-zb-oval', 'zoook-zb-pocket-dynamo', 'zoook-zb-pure-magic',
    'zoook-zb-retract', 'zoook-zb-rock', 'zoook-zb-rocker', 'zoook-zb-rocker-2', 'zoook-zb-rocker-3', 'zoook-zb-rocker-bluemate',
    'zoook-zb-rocker-bluemate-combo', 'zoook-zb-rocker-bomb', 'zoook-zb-rocker-boombox', 'zoook-zb-rocker-encore', 'zoook-zb-rocker-ifit', 'zoook-zb-rocker-igear',
    'zoook-zb-rocker-m', 'zoook-zb-rocker-m2', 'zoook-zb-rocker-mini', 'zoook-zb-rocker-plush', 'zoook-zb-rocker-prism', 'zoook-zb-rocker-soulmate',
    'zoook-zb-rocker-soundquake', 'zoook-zb-rocker-torpedo', 'zoook-zb-rocker-trumpet', 'zoook-zb-rocker-twinpods', 'zoook-zb-rocker-vibes', 'zoook-zb-rocker-volcano',
    'zoook-zb-rockstar', 'zoook-zb-selfie', 'zoook-zb-selfiem', 'zoook-zb-selfiepro', 'zoook-zb-selrem', 'zoook-zb-solarmuse',
    'zoook-zb-soulmate2', 'zoook-zb-soundcube', 'zoook-zb-soundmate', 'zoook-zb-spb', 'zoook-zb-sprinter', 'zoook-zb-timeblue',
    'zoook-zb-touch', 'zoook-zb-vault', 'zoook-zm-bold', 'zoook-zm-bs505', 'zoook-zm-e100', 'zoook-zm-e100m',
    'zoook-zm-e11m', 'zoook-zm-e200m', 'zoook-zm-e300m', 'zoook-zm-e4m', 'zoook-zm-e5m', 'zoook-zm-e6m',
    'zoook-zm-e7m', 'zoook-zm-e8m', 'zoook-zm-em14', 'zoook-zm-em21', 'zoook-zm-h10', 'zoook-zm-h15',
    'zoook-zm-h400', 'zoook-zm-h605', 'zoook-zm-h609', 'zoook-zm-h703', 'zoook-zm-h713', 'zoook-zm-isound',
    'zoook-zm-jazz-dj1', 'zoook-zm-jazz-x1', 'zoook-zm-nb100', 'zoook-zm-rocker-glitz', 'zoook-zm-rocker-rdx-i1', 'zoook-zm-rocker-rdxo1',
    'zoook-zm-rocker-symphony', 'zoook-zm-rocker-wristband', 'zoook-zm-sp2100', 'zoook-zm-sp2500', 'zoook-zm-sp2600', 'zoook-zm-sp3200',
    'zoook-zm-sp3300', 'zoook-zm-sp4400', 'zoook-zm-sp5100', 'zoook-zm-us100'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ---------- zoook_wireless_charger (3 products) ----------
UPDATE products
SET faqs = jsonb_build_array(
    jsonb_build_object('question', 'Does the ' || name || ' support fast wireless charging?', 'answer', 'Please check the ' || name || '''s specifications for its maximum output wattage and supported fast-charge standards.'),
    jsonb_build_object('question', 'Will the ' || name || ' work with a phone case on?', 'answer', 'The ' || name || ' works through cases up to a few millimeters thick; very thick or metal-backed cases may need to be removed for reliable charging.')
  )
WHERE slug = ANY(ARRAY[
    'entergo-induction-pad-aurapad-neo', 'entergo-induction-pad-aurapad-prime', 'entergo-induction-pad-aurapad-zen'
  ])
  AND (faqs IS NULL OR faqs = '[]'::jsonb);

-- ============================================================
-- Verification
-- ============================================================
SELECT
  count(*) FILTER (WHERE faqs IS NOT NULL AND faqs != '[]'::jsonb) AS products_with_faqs,
  count(*) AS total_products
FROM products;
