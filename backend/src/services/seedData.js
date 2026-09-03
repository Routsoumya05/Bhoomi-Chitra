const bcrypt = require('bcryptjs');

// Helper 1: Generate Contiguous Corridor Parcels (Left & Right intact strips sharing borders with 0 gaps)
function generateCorridorParcels({
  startLat,
  startLng,
  angleDeg = 45,
  segmentLengthDeg = 0.0035,
  widthDeg = 0.0016,
  pairsCount = 15
}) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = segmentLengthDeg * Math.cos(rad);
  const dy = segmentLengthDeg * Math.sin(rad);

  // Normal unit vector perpendicular to corridor
  const nx = -Math.sin(rad) * widthDeg;
  const ny = Math.cos(rad) * widthDeg;

  // Pre-calculate centerline stations C[0...pairsCount], Left L[0...pairsCount], Right R[0...pairsCount]
  const C = [];
  const L = [];
  const R = [];

  for (let k = 0; k <= pairsCount; k++) {
    const cLng = Number((startLng + k * dx).toFixed(6));
    const cLat = Number((startLat + k * dy).toFixed(6));
    C.push([cLng, cLat]);
    L.push([Number((cLng + nx).toFixed(6)), Number((cLat + ny).toFixed(6))]);
    R.push([Number((cLng - nx).toFixed(6)), Number((cLat - ny).toFixed(6))]);
  }

  const parcels = [];

  for (let k = 0; k < pairsCount; k++) {
    // Left parcel: C[k] -> C[k+1] -> L[k+1] -> L[k] -> C[k]
    const leftCoords = [
      C[k],
      C[k + 1],
      L[k + 1],
      L[k],
      C[k]
    ];
    const leftCentroid = [
      Number(((C[k][0] + C[k + 1][0] + L[k + 1][0] + L[k][0]) / 4).toFixed(6)),
      Number(((C[k][1] + C[k + 1][1] + L[k + 1][1] + L[k][1]) / 4).toFixed(6))
    ];

    // Right parcel: R[k] -> R[k+1] -> C[k+1] -> C[k] -> R[k]
    const rightCoords = [
      R[k],
      R[k + 1],
      C[k + 1],
      C[k],
      R[k]
    ];
    const rightCentroid = [
      Number(((R[k][0] + R[k + 1][0] + C[k + 1][0] + C[k][0]) / 4).toFixed(6)),
      Number(((R[k][1] + R[k + 1][1] + C[k + 1][1] + C[k][1]) / 4).toFixed(6))
    ];

    parcels.push({
      side: 'LEFT',
      segmentIndex: k,
      geojson: { type: 'Polygon', coordinates: [leftCoords] },
      centroidLng: leftCentroid[0],
      centroidLat: leftCentroid[1]
    });

    parcels.push({
      side: 'RIGHT',
      segmentIndex: k,
      geojson: { type: 'Polygon', coordinates: [rightCoords] },
      centroidLng: rightCentroid[0],
      centroidLat: rightCentroid[1]
    });
  }

  return parcels;
}

// Helper 2: Generate Contiguous 2D Grid Parcels (M x N rectangular mosaic sharing borders with 0 gaps)
function generateGridParcels({
  originLat,
  originLng,
  rows = 5,
  cols = 5,
  cellWidthLng = 0.0025,
  cellHeightLat = 0.0022
}) {
  const parcels = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const minLng = Number((originLng + c * cellWidthLng).toFixed(6));
      const maxLng = Number((originLng + (c + 1) * cellWidthLng).toFixed(6));
      const minLat = Number((originLat + r * cellHeightLat).toFixed(6));
      const maxLat = Number((originLat + (r + 1) * cellHeightLat).toFixed(6));

      const coords = [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ];

      const centroidLng = Number(((minLng + maxLng) / 2).toFixed(6));
      const centroidLat = Number(((minLat + maxLat) / 2).toFixed(6));

      parcels.push({
        row: r,
        col: c,
        geojson: { type: 'Polygon', coordinates: [coords] },
        centroidLng,
        centroidLat
      });
    }
  }

  return parcels;
}

// Regional name generator for authentic private landholders
function getRegionalOwnerName(stateCode, idx) {
  const names = {
    OD: [
      'Debendra Pradhan', 'Pravakar Sahoo', 'Sudhanshu Samal', 'Minati Mohanty',
      'Rabindra Behera', 'Santilata Rout', 'Kailash Nayak', 'Duryodhan Biswal',
      'Bikash Barik', 'Sasmita Jena', 'Ganeswar Sahu', 'Laxmidhar Mallick'
    ],
    MH: [
      'Sanjay Patil', 'Chandrakant Deshmukh', 'Vaishali Shinde', 'Prakash Gaikwad',
      'Anil Kulkarni', 'Sunita Chavan', 'Ramesh Jadhav', 'Nitin Gokhale',
      'Madhukar Sawant', 'Sangeeta Shirodkar', 'Amol Joshi', 'Pradeep Kale'
    ],
    UP: [
      'Ram Chandra Shukla', 'Dinesh Kumar Yadav', 'Satyendra Singh', 'Phoolmati Devi',
      'Brijesh Tiwari', 'Shiv Prasad Maurya', 'Santosh Gupta', 'Manoj Pandey',
      'Rajendra Prasad Mishra', 'Sharda Verma', 'Virendra Chauhan', 'Kameshwar Rai'
    ],
    GJ: [
      'Hitesh Patel', 'Bhavesh Shah', 'Meena Ben Solanki', 'Jagdish Prajapati',
      'Kirit Desai', 'Chetan Vaghela', 'Urmila Patel', 'Ghanshyam Joshi',
      'Manish Zala', 'Pravin Solanki', 'Jashubhai Thakor', 'Dipti Trivedi'
    ],
    KA: [
      'Manjunath Gowda', 'Chennappa Reddy', 'Lakshmamma', 'Basavaraj Patil',
      'Ramesh Hegde', 'Gangadhar Swamy', 'Anasuya Bai', 'Narayanaswamy K',
      'Shivakumar Hiremath', 'Venkatasubbiah', 'Nagaveni Shetty', 'Mallikarjun'
    ]
  };

  const list = names[stateCode] || names.OD;
  return list[idx % list.length];
}

// Get Statutory details for non-private lands
function getStatutoryLandInfo(landType, stateCode, village, idx) {
  const statBodies = {
    OD: { name: 'IDCO (Odisha Industrial Infrastructure Development Corporation)', code: 'IDCO' },
    MH: { name: 'MIDC (Maharashtra Industrial Development Corporation)', code: 'MIDC' },
    UP: { name: 'UPSIDA (Uttar Pradesh State Industrial Development Authority)', code: 'UPSIDA' },
    GJ: { name: 'GIDC (Gujarat Industrial Development Corporation)', code: 'GIDC' },
    KA: { name: 'KIADB (Karnataka Industrial Areas Development Board)', code: 'KIADB' }
  };
  const body = statBodies[stateCode] || statBodies.OD;

  switch (landType) {
    case 'GOVT_REVENUE':
      return {
        ownerName: `Department of Revenue & Disaster Management, Govt of State (Nazul / Khasmahal Section)`,
        maskId: `GOVT-REV-${stateCode}-${1000 + idx}`,
        contact: '+91 0674 239****',
        aadhaar: 'GOVT-DEPT-SANCTION',
        disputeReason: null
      };
    case 'STATE_STATUTORY':
      return {
        ownerName: body.name,
        maskId: `STAT-${body.code}-${2000 + idx}`,
        contact: '+91 080 222****',
        aadhaar: 'STATUTORY-CORP-NOC',
        disputeReason: null
      };
    case 'GRAM_SABHA':
      return {
        ownerName: `Gram Sabha / Village Panchayat (${village} - Gochara / Communal Land)`,
        maskId: `GRAM-SABHA-${3000 + idx}`,
        contact: '+91 94370 0****',
        aadhaar: 'PANCHAYAT-NOC-FRA',
        disputeReason: null
      };
    case 'FOREST_LAND':
      return {
        ownerName: `Divisional Forest Officer (DFO), Territorial & Social Forestry Division`,
        maskId: `FOR-DEPT-${4000 + idx}`,
        contact: '+91 94371 0****',
        aadhaar: 'MOEFCC-FCA-STAGE2',
        disputeReason: null
      };
    case 'CENTRAL_GOVT':
      return {
        ownerName: `Ministry of Defence / Military Estates Officer & Indian Railways`,
        maskId: `CEN-GOVT-${5000 + idx}`,
        contact: '+91 011 2301****',
        aadhaar: 'INTER-MIN-TRANSFER',
        disputeReason: null
      };
    case 'WATER_BODY':
      return {
        ownerName: `Department of Water Resources (Command Area & Irrigation Catchment)`,
        maskId: `WATER-DEPT-${6000 + idx}`,
        contact: '+91 0674 253****',
        aadhaar: 'WATER-CATCHMENT-NOC',
        disputeReason: null
      };
    default:
      return null;
  }
}

async function seedAllData(db) {
  const passwordHash = bcrypt.hashSync('Demo@1234', 10);

  // 1. Roles
  const roles = [
    { name: 'System Administrator', code: 'SYS_ADMIN', desc: 'Full nationwide system control, user management, audit review' },
    { name: 'Central Ministry', code: 'CENTRAL_MINISTRY', desc: 'National monitoring, proposal approvals, policy and MIS reports' },
    { name: 'State Government', code: 'STATE_GOVT', desc: 'State-wide verification, proposal forwarding, district monitoring' },
    { name: 'District Authority', code: 'DISTRICT_AUTHORITY', desc: 'CALA, proposal scrutiny, award declaration, compensation, possession' },
    { name: 'Project Implementing Agency', code: 'PIA', desc: 'NHAI/RVNL, project creation, proposal submission, parcel identification' },
    { name: 'Field Officer', code: 'FIELD_OFFICER', desc: 'On-site GPS verification, photos, field remarks, possession verification' },
    { name: 'Public User', code: 'PUBLIC_USER', desc: 'Read-only citizen access to public land acquisition records and GIS' }
  ];

  for (const r of roles) {
    await db.query(
      'INSERT INTO roles (name, code, description) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
      [r.name, r.code, r.desc]
    );
  }

  // 2. States
  const states = [
    { name: 'Odisha', code: 'OD', capital: 'Bhubaneswar', districts: 30, lat: 20.9517, lng: 85.0985 },
    { name: 'Maharashtra', code: 'MH', capital: 'Mumbai', districts: 36, lat: 19.7515, lng: 75.7139 },
    { name: 'Uttar Pradesh', code: 'UP', capital: 'Lucknow', districts: 75, lat: 26.8467, lng: 80.9462 },
    { name: 'Gujarat', code: 'GJ', capital: 'Gandhinagar', districts: 33, lat: 22.2587, lng: 71.1924 },
    { name: 'Karnataka', code: 'KA', capital: 'Bengaluru', districts: 31, lat: 15.3173, lng: 75.7139 }
  ];

  for (const s of states) {
    await db.query(
      'INSERT INTO states (name, code, capital, total_districts, center_lat, center_lng) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING',
      [s.name, s.code, s.capital, s.districts, s.lat, s.lng]
    );
  }

  // Get state IDs
  const stateRes = await db.query('SELECT id, code FROM states');
  const stateMap = {};
  stateRes.rows.forEach(r => { stateMap[r.code] = r.id; });

  // 3. Districts
  const districts = [
    { state_id: stateMap['OD'], name: 'Dhenkanal', code: 'OD-DHK', hq: 'Dhenkanal', lat: 20.6583, lng: 85.5997 },
    { state_id: stateMap['OD'], name: 'Cuttack', code: 'OD-CTC', hq: 'Cuttack', lat: 20.4625, lng: 85.8830 },
    { state_id: stateMap['MH'], name: 'Pune', code: 'MH-PUN', hq: 'Pune', lat: 18.5204, lng: 73.8567 },
    { state_id: stateMap['MH'], name: 'Nagpur', code: 'MH-NGP', hq: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { state_id: stateMap['UP'], name: 'Varanasi', code: 'UP-VNS', hq: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { state_id: stateMap['UP'], name: 'Lucknow', code: 'UP-LKO', hq: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { state_id: stateMap['GJ'], name: 'Ahmedabad', code: 'GJ-AMD', hq: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { state_id: stateMap['GJ'], name: 'Surat', code: 'GJ-SRT', hq: 'Surat', lat: 21.1702, lng: 72.8311 },
    { state_id: stateMap['KA'], name: 'Bengaluru Rural', code: 'KA-BLR', hq: 'Bengaluru', lat: 13.0674, lng: 77.5684 },
    { state_id: stateMap['KA'], name: 'Mysuru', code: 'KA-MYS', hq: 'Mysuru', lat: 12.2958, lng: 76.6394 }
  ];

  for (const d of districts) {
    await db.query(
      'INSERT INTO districts (state_id, name, code, headquarters, center_lat, center_lng) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (state_id, name) DO NOTHING',
      [d.state_id, d.name, d.code, d.hq, d.lat, d.lng]
    );
  }

  const distRes = await db.query('SELECT id, name FROM districts');
  const distMap = {};
  distRes.rows.forEach(r => { distMap[r.name] = r.id; });

  // 4. Users (Demo Accounts)
  const users = [
    { email: 'admin@bhoomichitra.demo', name: 'Dr. Rajesh Verma, IAS', role: 'SYS_ADMIN', phone: '+91 98765 00001', state: null, dist: null, dept: 'Department of Land Resources (DoLR), MoRD' },
    { email: 'central@bhoomichitra.demo', name: 'Smt. Anita Sundaram, IAS', role: 'CENTRAL_MINISTRY', phone: '+91 98765 00002', state: null, dist: null, dept: 'Ministry of Road Transport & Highways (MoRTH)' },
    { email: 'state@bhoomichitra.demo', name: 'Shri Manoj Kumar Mishra, IAS', role: 'STATE_GOVT', phone: '+91 98765 00003', state: stateMap['OD'], dist: null, dept: 'Revenue & Disaster Management Dept, Govt of Odisha' },
    { email: 'district@bhoomichitra.demo', name: 'Shri Somesh Upadhyay, IAS', role: 'DISTRICT_AUTHORITY', phone: '+91 98765 00004', state: stateMap['OD'], dist: distMap['Dhenkanal'], dept: 'District Collectorate & CALA, Dhenkanal' },
    { email: 'pia@bhoomichitra.demo', name: 'Er. Pradeep Satapathy', role: 'PIA', phone: '+91 98765 00005', state: stateMap['OD'], dist: distMap['Dhenkanal'], dept: 'National Highways Authority of India (NHAI PIU Cuttack/Dhenkanal)' },
    { email: 'field@bhoomichitra.demo', name: 'Bipin Bihari Rout', role: 'FIELD_OFFICER', phone: '+91 98765 00006', state: stateMap['OD'], dist: distMap['Dhenkanal'], dept: 'Revenue Inspector Office, Sadar Tehsil Dhenkanal' },
    { email: 'public@bhoomichitra.demo', name: 'Citizen Public Access', role: 'PUBLIC_USER', phone: '+91 98765 00007', state: null, dist: null, dept: 'Public Portal Access' }
  ];

  for (const u of users) {
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role_code, state_id, district_id, department_agency, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) ON CONFLICT (email) DO NOTHING`,
      [u.email, passwordHash, u.name, u.phone, u.role, u.state, u.dist, u.dept]
    );
  }

  const userRes = await db.query('SELECT id, email FROM users');
  const userMap = {};
  userRes.rows.forEach(r => { userMap[r.email] = r.id; });

  // 5. Projects (15 Realistic Projects)
  const projects = [
    {
      code: 'NHAI-OD-NH55-01',
      name: 'NH-55 4-Laning Corridor Expansion (Cuttack - Dhenkanal - Angul Section)',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'National Highways Authority of India (NHAI)',
      state_id: stateMap['OD'],
      district_id: distMap['Dhenkanal'],
      desc: 'Four-laning of existing 2-lane National Highway 55 from km 0.000 to km 112.000 to improve industrial freight movement between Paradip Port, Cuttack, and the mining-industrial hub of Angul-Talcher.',
      cost: 2450.00,
      req_land: 342.50,
      acq_land: 184.20,
      not_land: 310.00,
      target: '2027-03-31',
      status: 'COMPENSATION_STAGE',
      risk: 78,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'NHSRCL-GJ-HSR-02',
      name: 'Mumbai - Ahmedabad High Speed Rail (Surat Section)',
      type: 'RAILWAY',
      ministry: 'Ministry of Railways (MoR)',
      agency: 'National High Speed Rail Corporation Limited (NHSRCL)',
      state_id: stateMap['GJ'],
      district_id: distMap['Surat'],
      desc: 'Dedicated high-speed bullet train corridor connecting Mumbai and Ahmedabad across Gujarat agricultural, government, and industrial parcels.',
      cost: 8900.00,
      req_land: 215.00,
      acq_land: 198.50,
      not_land: 215.00,
      target: '2026-12-31',
      status: 'POSSESSION_STAGE',
      risk: 32,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'MSRDC-MH-PRR-03',
      name: 'Pune Outer Ring Road Western Alignment',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'Maharashtra State Road Development Corporation (MSRDC)',
      state_id: stateMap['MH'],
      district_id: distMap['Pune'],
      desc: '136 km long 8-lane expressway around Pune Metropolitan Region to decongest city traffic and facilitate industrial transit.',
      cost: 4800.00,
      req_land: 480.00,
      acq_land: 210.00,
      not_land: 410.00,
      target: '2027-06-30',
      status: 'ACQUISITION_IN_PROGRESS',
      risk: 64,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'NHAI-UP-VKE-04',
      name: 'Varanasi - Kolkata Greenfield Expressway (Varanasi Section)',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'National Highways Authority of India (NHAI)',
      state_id: stateMap['UP'],
      district_id: distMap['Varanasi'],
      desc: 'Access-controlled 6-lane greenfield expressway connecting eastern UP with ports in West Bengal.',
      cost: 3600.00,
      req_land: 310.00,
      acq_land: 95.00,
      not_land: 280.00,
      target: '2027-11-30',
      status: 'NOTIFICATION',
      risk: 58,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'KRIDE-KA-BSRP-05',
      name: 'Bengaluru Suburban Railway Project (Corridor 4 - Kanaka Line)',
      type: 'METRO',
      ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
      agency: 'Rail Infrastructure Development Company (Karnataka) Ltd',
      state_id: stateMap['KA'],
      district_id: distMap['Bengaluru Rural'],
      desc: 'Suburban rail corridor connecting Heelalige to Rajanukunte to decongest Bengaluru IT corridors.',
      cost: 3200.00,
      req_land: 120.00,
      acq_land: 75.00,
      not_land: 110.00,
      target: '2027-04-30',
      status: 'AWARD_STAGE',
      risk: 42,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'ECOR-OD-DAFR-06',
      name: 'Dhenkanal - Angul Dedicated Heavy Mineral Rail Line',
      type: 'RAILWAY',
      ministry: 'Ministry of Railways (MoR)',
      agency: 'East Coast Railway / RVNL',
      state_id: stateMap['OD'],
      district_id: distMap['Dhenkanal'],
      desc: 'Additional 3rd rail line dedicated for coal and mineral evacuation from Mahanadi Coalfields to Dhamra and Paradip Ports.',
      cost: 1450.00,
      req_land: 165.00,
      acq_land: 140.00,
      not_land: 165.00,
      target: '2026-08-31',
      status: 'RR_STAGE',
      risk: 28,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'NHAI-MH-NMM-07',
      name: 'Nagpur Multi-Modal Logistics Park & Industrial Feeder',
      type: 'INDUSTRIAL',
      ministry: 'Ministry of Commerce & Industry (MoCI)',
      agency: 'National Highways Logistics Management Limited (NHLML)',
      state_id: stateMap['MH'],
      district_id: distMap['Nagpur'],
      desc: 'Integrated logistics hub providing rail-road-air cargo aggregation at central point of India.',
      cost: 1100.00,
      req_land: 280.00,
      acq_land: 260.00,
      not_land: 280.00,
      target: '2026-10-31',
      status: 'POSSESSION_STAGE',
      risk: 21,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'NHAI-UP-LOR-08',
      name: 'Lucknow Outer Ring Road Phase-III Extension',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'National Highways Authority of India (NHAI)',
      state_id: stateMap['UP'],
      district_id: distMap['Lucknow'],
      desc: 'Ring road expressway package completing northern bypass of state capital Lucknow.',
      cost: 2150.00,
      req_land: 220.00,
      acq_land: 195.00,
      not_land: 220.00,
      target: '2026-09-30',
      status: 'COMPLETED',
      risk: 15,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'DSIR-GJ-EXP-09',
      name: 'Ahmedabad - Dholera SIR Access-Controlled Expressway',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'National Highways Authority of India (NHAI)',
      state_id: stateMap['GJ'],
      district_id: distMap['Ahmedabad'],
      desc: '109 km 4-lane expressway connecting Ahmedabad with Dholera Special Investment Region and International Airport.',
      cost: 3500.00,
      req_land: 390.00,
      acq_land: 360.00,
      not_land: 390.00,
      target: '2026-11-15',
      status: 'POSSESSION_STAGE',
      risk: 25,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'NHAI-KA-MKH-10',
      name: 'Mysuru - Kushalnagar 4-Lane Economic Corridor',
      type: 'HIGHWAY',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'National Highways Authority of India (NHAI)',
      state_id: stateMap['KA'],
      district_id: distMap['Mysuru'],
      desc: 'Upgradation of NH-275 connecting Mysuru with Kodagu tourist and agricultural hub.',
      cost: 1850.00,
      req_land: 195.00,
      acq_land: 60.00,
      not_land: 180.00,
      target: '2027-08-31',
      status: 'ACQUISITION_IN_PROGRESS',
      risk: 54,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'WRD-OD-MBC-11',
      name: 'Mahanadi-Brahmani River Basin Irrigation Canal Extension',
      type: 'IRRIGATION',
      ministry: 'Ministry of Jal Shakti',
      agency: 'Department of Water Resources, Govt of Odisha',
      state_id: stateMap['OD'],
      district_id: distMap['Cuttack'],
      desc: 'Left bank major canal providing assured irrigation to 45,000 hectares in Cuttack and Dhenkanal districts.',
      cost: 920.00,
      req_land: 240.00,
      acq_land: 85.00,
      not_land: 210.00,
      target: '2028-03-31',
      status: 'UNDER_SCRUTINY',
      risk: 62,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'JNPA-MH-PFC-12',
      name: 'JNPA Port to Pune Multi-Modal Dedicated Freight Spur',
      type: 'PORT',
      ministry: 'Ministry of Ports, Shipping and Waterways',
      agency: 'Jawaharlal Nehru Port Authority (JNPA)',
      state_id: stateMap['MH'],
      district_id: distMap['Pune'],
      desc: 'Dedicated rail and expressway freight corridor from Nhava Sheva container terminal to Talegaon-Chakan auto cluster.',
      cost: 4100.00,
      req_land: 330.00,
      acq_land: 45.00,
      not_land: 290.00,
      target: '2028-06-30',
      status: 'STATE_VERIFICATION',
      risk: 48,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'DFCCIL-UP-VNS-13',
      name: 'Eastern Dedicated Freight Corridor (Varanasi Feeder Loop)',
      type: 'RAILWAY',
      ministry: 'Ministry of Railways (MoR)',
      agency: 'Dedicated Freight Corridor Corporation of India Ltd',
      state_id: stateMap['UP'],
      district_id: distMap['Varanasi'],
      desc: 'Direct freight rail feeder connecting Ramnagar Multi-Modal Terminal to EDFC mainline.',
      cost: 1350.00,
      req_land: 140.00,
      acq_land: 110.00,
      not_land: 140.00,
      target: '2026-12-15',
      status: 'AWARD_STAGE',
      risk: 39,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'SECI-GJ-KSP-14',
      name: 'Khavda Mega Renewable Energy Park (Power Evacuation Corridor)',
      type: 'RENEWABLE',
      ministry: 'Ministry of New and Renewable Energy (MNRE)',
      agency: 'Power Grid Corporation of India Limited (PGCIL)',
      state_id: stateMap['GJ'],
      district_id: distMap['Ahmedabad'],
      desc: '765 kV double circuit transmission line corridor evacuating 30 GW green energy from Kutch to Western Grid.',
      cost: 2900.00,
      req_land: 260.00,
      acq_land: 220.00,
      not_land: 260.00,
      target: '2026-10-31',
      status: 'COMPENSATION_STAGE',
      risk: 35,
      created_by: userMap['pia@bhoomichitra.demo']
    },
    {
      code: 'KIADB-KA-BLR-15',
      name: 'Devenahalli Aerospace & Defence SEZ Expansion Phase-2',
      type: 'INDUSTRIAL',
      ministry: 'Ministry of Commerce & Industry (MoCI)',
      agency: 'Karnataka Industrial Areas Development Board (KIADB)',
      state_id: stateMap['KA'],
      district_id: distMap['Bengaluru Rural'],
      desc: 'High-tech aerospace engineering and avionics manufacturing industrial cluster land acquisition.',
      cost: 1750.00,
      req_land: 290.00,
      acq_land: 130.00,
      not_land: 270.00,
      target: '2027-09-30',
      status: 'ACQUISITION_IN_PROGRESS',
      risk: 56,
      created_by: userMap['pia@bhoomichitra.demo']
    }
  ];

  for (const p of projects) {
    await db.query(
      `INSERT INTO projects (project_code, name, project_type, ministry, implementing_agency, state_id, district_id,
        description, estimated_cost_cr, required_land_ha, acquired_land_ha, notified_land_ha,
        target_completion_date, current_status, risk_score, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (project_code) DO NOTHING`,
      [p.code, p.name, p.type, p.ministry, p.agency, p.state_id, p.district_id, p.desc, p.cost, p.req_land, p.acq_land, p.not_land, p.target, p.status, p.risk, p.created_by]
    );
  }

  const projRes = await db.query('SELECT id, project_code FROM projects');
  const projMap = {};
  projRes.rows.forEach(r => { projMap[r.project_code] = r.id; });

  const flagshipId = projMap['NHAI-OD-NH55-01'];

  // 6. Acquisition Proposals
  await db.query(
    `INSERT INTO acquisition_proposals (project_id, proposal_number, submission_date, scrutiny_status, scrutiny_remarks, state_forwarded_date, central_approved_date)
     VALUES ($1, 'PROP-2025-OD-NH55', '2025-02-10', 'APPROVED', 'Proposal scrutinised by CALA Dhenkanal and found compliant with RFCTLARR Act 2013 and NH Act 1956 Section 3A.', '2025-03-15', '2025-04-20')
     ON CONFLICT (proposal_number) DO NOTHING`,
    [flagshipId]
  );

  // 7. Workflow Instance & 13 Steps for Flagship Project
  const wfInst = await db.query(
    `INSERT INTO workflow_instances (project_id, current_stage, is_completed, initiated_at)
     VALUES ($1, 'COMPENSATION_DISBURSEMENT', false, '2025-02-10') RETURNING id`,
    [flagshipId]
  );
  const wfId = wfInst.rows[0]?.id;

  if (wfId) {
    const workflowStages = [
      { name: 'PROJECT PROPOSAL', status: 'COMPLETED', auth: 'PIA (NHAI)', due: '2025-02-15', comp: '2025-02-10', act: 'Submitted by NHAI Project Director' },
      { name: 'DOCUMENT SUBMISSION', status: 'COMPLETED', auth: 'PIA (NHAI)', due: '2025-02-28', comp: '2025-02-20', act: 'Feasibility Report, Alignment Maps & SIA Uploaded' },
      { name: 'DISTRICT SCRUTINY', status: 'COMPLETED', auth: 'CALA / Collector Dhenkanal', due: '2025-03-20', comp: '2025-03-15', act: 'Revenue record verification and Khasra validation verified' },
      { name: 'STATE VERIFICATION', status: 'COMPLETED', auth: 'Revenue Dept Govt of Odisha', due: '2025-04-10', comp: '2025-04-05', act: 'Verified under State Land Policy and forwarded to Central Ministry' },
      { name: 'CENTRAL APPROVAL', status: 'COMPLETED', auth: 'MoRTH Central Ministry', due: '2025-05-01', comp: '2025-04-20', act: 'Administrative & Financial sanction accorded' },
      { name: 'NOTIFICATION', status: 'COMPLETED', auth: 'Competent Authority (CALA)', due: '2025-06-15', comp: '2025-06-02', act: 'Section 3A Gazette Notification published' },
      { name: 'LAND SURVEY', status: 'COMPLETED', auth: 'Joint Survey Team / Field Officers', due: '2025-08-30', comp: '2025-08-18', act: 'Joint Measurement Survey (JMS) completed across 14 villages' },
      { name: 'AWARD DECLARATION', status: 'COMPLETED', auth: 'CALA Dhenkanal', due: '2025-11-15', comp: '2025-11-10', act: 'Section 3G Land Acquisition Award Order No. 42/2025 declared' },
      { name: 'COMPENSATION ASSESSMENT', status: 'COMPLETED', auth: 'CALA Dhenkanal', due: '2025-12-15', comp: '2025-12-05', act: 'Basic Market Value determined with 100% Solatium & 12% Additional Market Value' },
      { name: 'COMPENSATION DISBURSEMENT', status: 'IN_PROGRESS', auth: 'Special Land Acquisition Officer', due: '2026-03-31', comp: null, act: 'Active disbursement via PFMS/DBT. ₹118.40 Cr disbursed, ₹54.20 Cr pending for 67 families' },
      { name: 'POSSESSION', status: 'IN_PROGRESS', auth: 'District Administration / NHAI', due: '2026-06-30', comp: null, act: 'Physical possession taken for 68 parcels; 18 parcels pending dispute resolution' },
      { name: 'REHABILITATION & RESETTLEMENT', status: 'IN_PROGRESS', auth: 'R&R Commissioner / Collector', due: '2026-09-30', comp: null, act: 'Relocation site construction underway at Balarampur Colony (76.8% progress)' },
      { name: 'PROJECT COMPLETION', status: 'PENDING', auth: 'Central Ministry / State Govt', due: '2027-03-31', comp: null, act: 'Awaiting completion of compensation, possession and R&R handover' }
    ];

    for (const st of workflowStages) {
      await db.query(
        `INSERT INTO workflow_steps (workflow_id, stage_name, status, assigned_authority, due_date, completed_date, action_taken)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [wfId, st.name, st.status, st.auth, st.due, st.comp, st.act]
      );
    }
  }

  // 8. 400+ Intact Contiguous Land Parcels across ALL 15 Projects (Zero Gaps, Intact Geometric Lines & Grids)
  await seedContiguousParcels(db, projMap, stateMap, distMap, userMap);

  // 9. Awards
  await db.query(
    `INSERT INTO awards (project_id, award_number, declaration_date, total_parcels, total_area_ha, total_award_amount_inr, solatium_amount_inr, competent_authority, status)
     VALUES ($1, 'CALA-DHK-AWARD-42/2025', '2025-11-10', 60, 184.20, 1726000000.00, 863000000.00, 'Collector & CALA Dhenkanal', 'DECLARED')
     ON CONFLICT (award_number) DO NOTHING`,
    [flagshipId]
  );

  // 10. Affected & Displaced Families
  const categories = ['OBC', 'GENERAL', 'SC', 'ST', 'BPL'];
  const familyIds = [];

  for (let f = 1; f <= 50; f++) {
    const fCode = `FAM-NH55-${String(f).padStart(4, '0')}`;
    const isDisplaced = f <= 22; // 22 displaced families
    const cat = categories[f % categories.length];
    const headNames = ['Purna Chandra Sahoo', 'Laxmidhar Pradhan', 'Basanta Kumar Samal', 'Anusaya Mohanty', 'Ganeswar Behera', 'Niranjan Rout', 'Bhagaban Nayak'];
    const hName = headNames[f % headNames.length] + ` (${f})`;
    const hMasked = `Family Head: ******${1000 + f}`;
    const rehabStatus = isDisplaced ? (f <= 15 ? 'RELOCATED' : 'ALLOTTED') : 'NOT_REQUIRED';
    const livStatus = f <= 35 ? 'COMPLETED' : 'IN_PROGRESS';

    const fRes = await db.query(
      `INSERT INTO affected_families (
        project_id, district_id, family_code, head_name, head_masked,
        members_count, category, is_displaced, eligibility_status, rehabilitation_status, livelihood_assistance_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ELIGIBLE', $9, $10)
      ON CONFLICT (family_code) DO NOTHING RETURNING id`,
      [flagshipId, distMap['Dhenkanal'], fCode, hName, hMasked, 3 + (f % 4), cat, isDisplaced, rehabStatus, livStatus]
    );

    if (fRes.rows[0]?.id) {
      familyIds.push(fRes.rows[0].id);
      if (isDisplaced) {
        await db.query(
          `INSERT INTO displaced_families (affected_family_id, project_id, relocation_site, housing_allotment_status, relocation_date)
           VALUES ($1, $2, 'Balarampur R&R Colony, Sector 2', $3, $4)`,
          [fRes.rows[0].id, flagshipId, f <= 15 ? 'HANDED_OVER' : 'CONSTRUCTED', f <= 15 ? '2025-12-20' : null]
        );
      }
    }
  }

  // 11. Compensation Assessments and Payments
  const parcelRows = await db.query('SELECT id, area_ha, market_value_inr FROM land_parcels WHERE project_id = $1 LIMIT 50', [flagshipId]);
  let totalAssessed = 0;
  let totalDisbursed = 0;

  for (let c = 0; c < parcelRows.rows.length; c++) {
    const pr = parcelRows.rows[c];
    const famId = familyIds[c % familyIds.length] || null;
    const baseVal = Number(pr.market_value_inr);
    const multiplier = 1.25;
    const solatium = baseVal * multiplier; // 100% solatium
    const totalComp = (baseVal * multiplier) + solatium;
    totalAssessed += totalComp;

    const cStatus = c < 30 ? 'PAID' : (c < 40 ? 'PARTIALLY_PAID' : 'ASSESSED');
    const disbursedAmt = cStatus === 'PAID' ? totalComp : (cStatus === 'PARTIALLY_PAID' ? totalComp * 0.5 : 0);
    const pendingAmt = totalComp - disbursedAmt;
    totalDisbursed += disbursedAmt;

    const assessRes = await db.query(
      `INSERT INTO compensation_assessments (
        project_id, parcel_id, affected_family_id, base_market_value, multiplier_factor,
        solatium_percentage, total_assessed_amount, eligible_amount, status
      ) VALUES ($1, $2, $3, $4, $5, 100.0, $6, $6, $7) RETURNING id`,
      [flagshipId, pr.id, famId, baseVal, multiplier, totalComp, cStatus === 'PAID' ? 'APPROVED' : 'ASSESSED']
    );

    const assessId = assessRes.rows[0]?.id;

    if (assessId) {
      const txRef = cStatus !== 'ASSESSED' ? `PFMS-DBT-2026-${100000 + c}` : null;
      const pDate = cStatus !== 'ASSESSED' ? '2026-01-15' : null;
      await db.query(
        `INSERT INTO compensation_payments (
          assessment_id, project_id, affected_family_id, disbursed_amount, pending_amount,
          payment_date, payment_mode, transaction_ref, payment_status, disbursed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, 'RTGS_PFMS', $7, $8, $9)`,
        [assessId, flagshipId, famId, disbursedAmt, pendingAmt, pDate, txRef, cStatus, userMap['district@bhoomichitra.demo']]
      );
    }
  }

  // 12. R&R Case Record
  await db.query(
    `INSERT INTO rr_cases (
      project_id, total_affected, total_displaced, housing_assistance_completed,
      livelihood_assistance_completed, relocation_completed, rr_completion_percentage, nodal_officer_id
    ) VALUES ($1, 420, 138, 112, 320, 106, 76.80, $2)`,
    [flagshipId, userMap['district@bhoomichitra.demo']]
  );

  // 13. Possession Records for 25 Completed Parcels
  const completedParcels = await db.query('SELECT id, centroid_lat, centroid_lng FROM land_parcels WHERE project_id = $1 AND status = $2 LIMIT 25', [flagshipId, 'POSSESSION_COMPLETED']);
  for (const cp of completedParcels.rows) {
    await db.query(
      `INSERT INTO possession_records (
        parcel_id, project_id, status, possession_date, verified_by_id,
        gps_lat, gps_lng, gps_accuracy_m, photo_url, remarks
      ) VALUES ($1, $2, 'COMPLETED', '2026-01-20', $3, $4, $5, 2.4, '/uploads/sample_field_possession.jpg', 'Physical boundary stones erected and joint verification signed with CALA.')`,
      [cp.id, flagshipId, userMap['field@bhoomichitra.demo'], cp.centroid_lat, cp.centroid_lng]
    );
  }

  // 14. Documents (with Versions)
  const docs = [
    { cat: 'PROPOSAL', title: 'Detailed Project Report & Land Requirement Plan (NH-55)', fn: 'NH55_DPR_LandPlan_v2.pdf', size: 14200000, ver: 2 },
    { cat: 'NOTIFICATION', title: 'Gazette Notification under Section 3A (S.O. 1842(E))', fn: 'Gazette_Notification_Sec3A.pdf', size: 2840000, ver: 1 },
    { cat: 'LAND_SURVEY', title: 'Joint Measurement Survey (JMS) Field Sheets', fn: 'JMS_Survey_Dhenkanal_14Villages.pdf', size: 8950000, ver: 2 },
    { cat: 'AWARD_ORDER', title: 'Competent Authority Award Order No. 42/2025', fn: 'CALA_Award_Order_42_2025.pdf', size: 4520000, ver: 1 },
    { cat: 'COMPENSATION_DOC', title: 'PFMS DBT Direct Disbursement Summary Statement', fn: 'PFMS_Disbursement_Batch_Jan2026.pdf', size: 1980000, ver: 1 },
    { cat: 'RR_DOC', title: 'Balarampur Resettlement Colony Allotment Matrix', fn: 'RR_Colony_Allotment_R1.pdf', size: 3410000, ver: 1 },
    { cat: 'POSSESSION_CERTIFICATE', title: 'Joint Possession Certificate Package 1 & 2', fn: 'Joint_Possession_Certificate_Pkg1.pdf', size: 2150000, ver: 1 }
  ];

  for (const d of docs) {
    const docIns = await db.query(
      `INSERT INTO documents (project_id, category, title, file_name, file_path, file_size, file_type, version, uploaded_by_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'application/pdf', $7, $8, 'VERIFIED') RETURNING id`,
      [flagshipId, d.cat, d.title, d.fn, `/uploads/${d.fn}`, d.size, d.ver, userMap['district@bhoomichitra.demo']]
    );

    const docId = docIns.rows[0]?.id;
    if (docId) {
      await db.query(
        `INSERT INTO document_versions (document_id, version_number, file_path, change_summary, uploaded_by_id)
         VALUES ($1, 1, $2, 'Initial verified upload', $3)`,
        [docId, `/uploads/${d.fn}`, userMap['district@bhoomichitra.demo']]
      );
      if (d.ver > 1) {
        await db.query(
          `INSERT INTO document_versions (document_id, version_number, file_path, change_summary, uploaded_by_id)
           VALUES ($1, 2, $2, 'Revised alignment correction per JMS findings', $3)`,
          [docId, `/uploads/${d.fn}`, userMap['district@bhoomichitra.demo']]
        );
      }
    }
  }

  // 15. Milestones
  const milestones = [
    { name: 'Proposal Scrutiny & Approval', code: 'SCRUTINY', seq: 1, exp: '2025-04-30', act: '2025-04-20', delay: 0, status: 'COMPLETED' },
    { name: 'Section 3A / 11 Notification', code: 'NOTIFICATION', seq: 2, exp: '2025-06-30', act: '2025-06-02', delay: 0, status: 'COMPLETED' },
    { name: 'Joint Measurement Survey (JMS)', code: 'SURVEY', seq: 3, exp: '2025-08-15', act: '2025-08-18', delay: 3, status: 'COMPLETED' },
    { name: 'Section 3G Land Award Declaration', code: 'AWARD', seq: 4, exp: '2025-10-23', act: '2025-11-10', delay: 18, status: 'COMPLETED' },
    { name: 'Compensation Disbursement (Phase 1)', code: 'COMPENSATION', seq: 5, exp: '2025-12-31', act: null, delay: 63, status: 'DELAYED' },
    { name: 'Physical Land Possession Handover', code: 'POSSESSION', seq: 6, exp: '2026-04-30', act: null, delay: 0, status: 'AT_RISK' },
    { name: 'R&R Colony Relocation & Livelihood Grant', code: 'RR', seq: 7, exp: '2026-08-31', act: null, delay: 0, status: 'ON_TIME' },
    { name: 'Final Handover to Implementing Agency', code: 'COMPLETION', seq: 8, exp: '2027-03-31', act: null, delay: 0, status: 'ON_TIME' }
  ];

  for (const m of milestones) {
    await db.query(
      `INSERT INTO milestones (project_id, milestone_name, stage_code, sequence_order, expected_date, actual_date, delay_days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [flagshipId, m.name, m.code, m.seq, m.exp, m.act, m.delay, m.status]
    );
  }

  // 16. Transparent Acquisition Risk Score (Flagship Score: 78 - HIGH RISK)
  const contributingFactors = [
    { factor: 'Disputed Land Parcels', detail: '8% of corridor parcels under active litigation in High Court / civil court disputes', weight: '25%', impact: '+22 pts' },
    { factor: 'Compensation Disbursement Lag', detail: '₹54.20 Cr compensation pending disbursement for 67 landholder families', weight: '25%', impact: '+25 pts' },
    { factor: 'Milestone Delay', detail: 'Compensation Phase 1 delayed by 63 days beyond original gazetted target', weight: '25%', impact: '+19 pts' },
    { factor: 'R&R Housing Handover Backlog', detail: '26 displaced families awaiting final physical handover of housing units', weight: '15%', impact: '+12 pts' }
  ];

  const recommendedActions = [
    { action: 'Prioritize special Lok Adalat / revenue court camp for disputed parcels in Gondia & Joranda villages', urgency: 'CRITICAL', dept: 'District Administration / CALA' },
    { action: 'Expedite PFMS direct bank account validation for remaining 67 beneficiary landholder families', urgency: 'HIGH', dept: 'Special Land Acquisition Office' },
    { action: 'Escalate power and water connection completion at Balarampur R&R Colony Sector 2', urgency: 'HIGH', dept: 'R&R Commissioner / PWD' },
    { action: 'Conduct weekly joint coordination meeting between NHAI PIU Cuttack and CALA Dhenkanal', urgency: 'MEDIUM', dept: 'Joint Review Committee' }
  ];

  await db.query(
    `INSERT INTO risk_scores (project_id, score, risk_level, contributing_factors_json, recommended_actions_json)
     VALUES ($1, 78, 'HIGH', $2, $3)`,
    [flagshipId, JSON.stringify(contributingFactors), JSON.stringify(recommendedActions)]
  );

  // 17. Audit Logs
  const auditEntries = [
    { u: userMap['pia@bhoomichitra.demo'], name: 'Er. Pradeep Satapathy', role: 'PIA', act: 'SUBMIT_PROPOSAL', entity: 'Project', entId: String(flagshipId), prev: null, next: { status: 'SUBMITTED' } },
    { u: userMap['district@bhoomichitra.demo'], name: 'Shri Somesh Upadhyay, IAS', role: 'DISTRICT_AUTHORITY', act: 'VERIFY_LAND_RECORDS', entity: 'Proposal', entId: 'PROP-2025-OD-NH55', prev: { scrutiny_status: 'SUBMITTED' }, next: { scrutiny_status: 'VERIFIED' } },
    { u: userMap['state@bhoomichitra.demo'], name: 'Shri Manoj Kumar Mishra, IAS', role: 'STATE_GOVT', act: 'FORWARD_PROPOSAL', entity: 'Proposal', entId: 'PROP-2025-OD-NH55', prev: { stage: 'STATE_VERIFICATION' }, next: { stage: 'CENTRAL_APPROVAL' } },
    { u: userMap['central@bhoomichitra.demo'], name: 'Smt. Anita Sundaram, IAS', role: 'CENTRAL_MINISTRY', act: 'APPROVE_PROPOSAL', entity: 'Proposal', entId: 'PROP-2025-OD-NH55', prev: { status: 'CENTRAL_APPROVAL' }, next: { status: 'NOTIFICATION' } },
    { u: userMap['district@bhoomichitra.demo'], name: 'Shri Somesh Upadhyay, IAS', role: 'DISTRICT_AUTHORITY', act: 'DECLARE_AWARD', entity: 'Award', entId: 'CALA-DHK-AWARD-42/2025', prev: null, next: { amount: 1726000000.00, parcels: 60 } },
    { u: userMap['field@bhoomichitra.demo'], name: 'Bipin Bihari Rout', role: 'FIELD_OFFICER', act: 'VERIFY_PARCEL_GPS', entity: 'LandParcel', entId: 'OD-DHK-NH55-0001', prev: { verified: false }, next: { verified: true, gps: '20.6580, 85.5990' } },
    { u: userMap['district@bhoomichitra.demo'], name: 'Shri Somesh Upadhyay, IAS', role: 'DISTRICT_AUTHORITY', act: 'DISBURSE_COMPENSATION', entity: 'Compensation', entId: 'FAM-NH55-0001', prev: { status: 'PENDING' }, next: { status: 'PAID', amt: 3450000 } }
  ];

  for (const a of auditEntries) {
    await db.query(
      `INSERT INTO audit_logs (user_id, user_name, role, action, entity, entity_id, previous_value_json, new_value_json, ip_address, session_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '127.0.0.1', 'SESSION-DEMO-INIT')`,
      [a.u, a.name, a.role, a.act, a.entity, a.entId, JSON.stringify(a.prev), JSON.stringify(a.next)]
    );
  }

  // 18. Notifications
  const initialNotifications = [
    { u: userMap['district@bhoomichitra.demo'], role: 'DISTRICT_AUTHORITY', title: 'Compensation Disbursement Pending Action', msg: '67 beneficiary families awaiting DBT disbursement approval for NH-55 corridor Package 2.', cat: 'COMPENSATION', link: `/admin/projects/${flagshipId}?tab=compensation` },
    { u: userMap['field@bhoomichitra.demo'], role: 'FIELD_OFFICER', title: 'New Parcels Assigned for GPS Verification', msg: '6 parcels in Village Joranda assigned for field photograph and GPS landmark verification.', cat: 'FIELD_ASSIGNMENT', link: '/field-officer' },
    { u: userMap['central@bhoomichitra.demo'], role: 'CENTRAL_MINISTRY', title: 'High Acquisition Risk Alert: NH-55 Expansion', msg: 'Project NHAI-OD-NH55-01 risk score elevated to 78 (HIGH RISK) due to disputed parcels and compensation delay.', cat: 'RISK_ALERT', link: `/admin/projects/${flagshipId}?tab=risk` },
    { u: userMap['state@bhoomichitra.demo'], role: 'STATE_GOVT', title: 'Quarterly Land Acquisition Review Scheduled', msg: 'Review of highway corridors in Dhenkanal and Cuttack districts scheduled for Friday.', cat: 'MEETING', link: '/admin/reports' },
    { u: null, role: 'PUBLIC', title: 'Public Notice: Section 3A Gazette Notification Published', msg: 'Land acquisition notification published for National Highway 55 expansion in Dhenkanal district.', cat: 'PUBLIC_NOTICE', link: `/projects/${flagshipId}` }
  ];

  for (const n of initialNotifications) {
    await db.query(
      `INSERT INTO notifications (user_id, role_target, title, message, category, link, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [n.u, n.role, n.title, n.msg, n.cat, n.link]
    );
  }
}

// Sub-function to seed contiguous parcels across all 15 projects
async function seedContiguousParcels(db, projMap, stateMap, distMap, userMap) {
  // Clear dependent tables to respect foreign key constraints
  await db.query('DELETE FROM compensation_payments');
  await db.query('DELETE FROM compensation_assessments');
  await db.query('DELETE FROM possession_records');
  await db.query('DELETE FROM land_owners');
  await db.query('DELETE FROM land_parcels');

  // Define geometric corridor & grid parameters for ALL 15 projects
  const projectGeometries = [
    {
      code: 'NHAI-OD-NH55-01',
      stateCode: 'OD',
      distName: 'Dhenkanal',
      tehsil: 'Dhenkanal Sadar',
      villages: ['Gondia', 'Joranda', 'Kapilash Road', 'Motanga', 'Balarampur', 'Hindol Road', 'Kamakhyanagar Feeder', 'Bhapur'],
      type: 'corridor',
      startLat: 20.6200,
      startLng: 85.5500,
      angleDeg: 38,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 30 // 60 contiguous corridor parcels
    },
    {
      code: 'NHSRCL-GJ-HSR-02',
      stateCode: 'GJ',
      distName: 'Surat',
      tehsil: 'Olpad',
      villages: ['Olpad', 'Sayan', 'Karanj', 'Kim', 'Masma'],
      type: 'corridor',
      startLat: 21.1300,
      startLng: 72.8000,
      angleDeg: 28,
      segmentLengthDeg: 0.0034,
      widthDeg: 0.0015,
      pairsCount: 15 // 30 contiguous rail corridor parcels
    },
    {
      code: 'MSRDC-MH-PRR-03',
      stateCode: 'MH',
      distName: 'Pune',
      tehsil: 'Haveli',
      villages: ['Pirangut', 'Paud Road', 'Urse', 'Chakan Feeder', 'Maval'],
      type: 'corridor',
      startLat: 18.4800,
      startLng: 73.8000,
      angleDeg: 55,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0017,
      pairsCount: 15 // 30 contiguous expressway parcels
    },
    {
      code: 'NHAI-UP-VKE-04',
      stateCode: 'UP',
      distName: 'Varanasi',
      tehsil: 'Rohaniya',
      villages: ['Rohaniya', 'Mirzamurad', 'Kachhwa', 'Raja Talab'],
      type: 'corridor',
      startLat: 25.2800,
      startLng: 82.9300,
      angleDeg: 40,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 13 // 26 contiguous corridor parcels
    },
    {
      code: 'KRIDE-KA-BSRP-05',
      stateCode: 'KA',
      distName: 'Bengaluru Rural',
      tehsil: 'Doddaballapur',
      villages: ['Rajanukunte', 'Doddaballapur', 'Marasandra', 'Kakolu'],
      type: 'corridor',
      startLat: 13.0300,
      startLng: 77.5300,
      angleDeg: 30,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0014,
      pairsCount: 12 // 24 contiguous transit parcels
    },
    {
      code: 'ECOR-OD-DAFR-06',
      stateCode: 'OD',
      distName: 'Dhenkanal',
      tehsil: 'Hindol',
      villages: ['Hindol', 'Rasol', 'Kandhara', 'Meramandali'],
      type: 'corridor',
      startLat: 20.6900,
      startLng: 85.4200,
      angleDeg: 45,
      segmentLengthDeg: 0.0036,
      widthDeg: 0.0015,
      pairsCount: 12 // 24 contiguous rail parcels
    },
    {
      code: 'NHAI-MH-NMM-07',
      stateCode: 'MH',
      distName: 'Nagpur',
      tehsil: 'Nagpur Rural',
      villages: ['MIHAN Logistics Sector 1', 'MIHAN Logistics Sector 2', 'Butibori Feeder Zone', 'Sindi Cargo Terminal'],
      type: 'grid',
      originLat: 21.1350,
      originLng: 79.0750,
      rows: 5,
      cols: 5,
      cellWidthLng: 0.0025,
      cellHeightLat: 0.0022 // 25 contiguous rectangular grid parcels
    },
    {
      code: 'NHAI-UP-LOR-08',
      stateCode: 'UP',
      distName: 'Lucknow',
      tehsil: 'Bakshi Ka Talab',
      villages: ['Itaunja', 'Mahona', 'Kumhrawan', 'Banthra'],
      type: 'corridor',
      startLat: 26.8100,
      startLng: 80.9100,
      angleDeg: 45,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 12 // 24 contiguous expressway parcels
    },
    {
      code: 'DSIR-GJ-EXP-09',
      stateCode: 'GJ',
      distName: 'Ahmedabad',
      tehsil: 'Dholka',
      villages: ['Dholka', 'Bavla', 'Sarandi', 'Dholera SIR Gate 1'],
      type: 'corridor',
      startLat: 22.9600,
      startLng: 72.5300,
      angleDeg: 22,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 13 // 26 contiguous expressway parcels
    },
    {
      code: 'NHAI-KA-MKH-10',
      stateCode: 'KA',
      distName: 'Mysuru',
      tehsil: 'Hunsur',
      villages: ['Hunsur', 'Biligere', 'Periyapatna', 'Kushalnagar Feeder'],
      type: 'corridor',
      startLat: 12.2700,
      startLng: 76.5900,
      angleDeg: 50,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 12 // 24 contiguous corridor parcels
    },
    {
      code: 'WRD-OD-MBC-11',
      stateCode: 'OD',
      distName: 'Cuttack',
      tehsil: 'Choudwar',
      villages: ['Choudwar Left Bank', 'Tangi', 'Kapaleswar', 'Brahmani Feeder'],
      type: 'corridor',
      startLat: 20.4300,
      startLng: 85.8500,
      angleDeg: 35,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0014,
      pairsCount: 12 // 24 contiguous canal ROW parcels
    },
    {
      code: 'JNPA-MH-PFC-12',
      stateCode: 'MH',
      distName: 'Pune',
      tehsil: 'Khed',
      villages: ['Chakan Auto Hub', 'Talegaon Dabhade', 'Khed SEZ', 'Akurdi Feeder'],
      type: 'corridor',
      startLat: 18.6900,
      startLng: 73.6100,
      angleDeg: 40,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0016,
      pairsCount: 12 // 24 contiguous freight spur parcels
    },
    {
      code: 'DFCCIL-UP-VNS-13',
      stateCode: 'UP',
      distName: 'Varanasi',
      tehsil: 'Chandauli Border',
      villages: ['Mughalsarai Feeder', 'Ramnagar Multi-Modal', 'Jeonathpur', 'Varanasi Yard'],
      type: 'corridor',
      startLat: 25.2300,
      startLng: 83.0100,
      angleDeg: 35,
      segmentLengthDeg: 0.0035,
      widthDeg: 0.0015,
      pairsCount: 12 // 24 contiguous rail parcels
    },
    {
      code: 'SECI-GJ-KSP-14',
      stateCode: 'GJ',
      distName: 'Ahmedabad',
      tehsil: 'Khavda Sub-Division',
      villages: ['Khavda Solar Block A', 'Khavda Wind Block B', 'Power Evacuation Substation 765kV', 'Renewable Grid Feeder'],
      type: 'grid',
      originLat: 23.8300,
      originLng: 69.7300,
      rows: 5,
      cols: 5,
      cellWidthLng: 0.0028,
      cellHeightLat: 0.0024 // 25 contiguous solar-wind sector grid parcels
    },
    {
      code: 'KIADB-KA-BLR-15',
      stateCode: 'KA',
      distName: 'Bengaluru Rural',
      tehsil: 'Devanahalli',
      villages: ['Aerospace SEZ Sector 1', 'Defence Avionics Sector 2', 'Hardware Park Block C', 'Aerospace Feeder Corridor'],
      type: 'grid',
      originLat: 13.2200,
      originLng: 77.6900,
      rows: 5,
      cols: 5,
      cellWidthLng: 0.0025,
      cellHeightLat: 0.0022 // 25 contiguous aerospace SEZ sector grid parcels
    }
  ];

  let globalParcelCounter = 1;

  for (const pConfig of projectGeometries) {
    const pId = projMap[pConfig.code];
    if (!pId) continue;

    const sId = stateMap[pConfig.stateCode];
    const dId = distMap[pConfig.distName];

    // Generate intact contiguous geometric shapes
    let parcelPolys = [];
    if (pConfig.type === 'corridor') {
      parcelPolys = generateCorridorParcels({
        startLat: pConfig.startLat,
        startLng: pConfig.startLng,
        angleDeg: pConfig.angleDeg,
        segmentLengthDeg: pConfig.segmentLengthDeg,
        widthDeg: pConfig.widthDeg,
        pairsCount: pConfig.pairsCount
      });
    } else {
      parcelPolys = generateGridParcels({
        originLat: pConfig.originLat,
        originLng: pConfig.originLng,
        rows: pConfig.rows,
        cols: pConfig.cols,
        cellWidthLng: pConfig.cellWidthLng,
        cellHeightLat: pConfig.cellHeightLat
      });
    }

    for (let i = 0; i < parcelPolys.length; i++) {
      const poly = parcelPolys[i];
      const vName = pConfig.villages[i % pConfig.villages.length];
      const khasra = `Plot / Khasra ${100 + (i * 4)}/${(i % 5) + 1}`;
      const pCode = `${pConfig.code.substring(0, 10)}-P${String(i + 1).padStart(3, '0')}`;

      // Realistic statutory land classification distribution
      let landType = 'PRIVATE_AGRICULTURAL';
      if (i === 0 || i === 12) landType = 'GOVT_REVENUE';
      else if (i === 1 || i === 13) landType = 'STATE_STATUTORY';
      else if (i === 2 || i === 16) landType = 'GRAM_SABHA';
      else if (i === 3 || i === 19) landType = 'FOREST_LAND';
      else if (i === 4) landType = 'CENTRAL_GOVT';
      else if (i === 5) landType = 'WATER_BODY';
      else if (i % 7 === 0) landType = 'PRIVATE_COMMERCIAL';
      else if (i % 9 === 0) landType = 'PRIVATE_RESIDENTIAL';
      else landType = 'PRIVATE_AGRICULTURAL';

      // Status distribution
      let status = 'COMPENSATION_PAID';
      let disputeReason = null;
      if (i < 8) {
        status = 'POSSESSION_COMPLETED';
      } else if (i < 14) {
        status = 'COMPENSATION_PAID';
      } else if (i < 18) {
        status = 'COMPENSATION_PENDING';
      } else if (i < 21) {
        status = 'AWARD_DECLARED';
      } else if (i === 22 || i === 23) {
        status = 'DISPUTED';
        const reasons = [
          'Title succession dispute pending in District Civil Court (Title Suit 42/2025)',
          'Boundary demarcation clarification sought with State Forest / Revenue Dept',
          'Co-sharers disputed compensation apportionment ratio before CALA',
          'Demand for enhanced solatium as commercial parcel classification'
        ];
        disputeReason = reasons[i % reasons.length];
      } else {
        status = 'NOTIFICATION_ISSUED';
      }

      const areaHa = Number((0.65 + ((i * 0.11) % 2.8)).toFixed(4));
      const areaAcres = Number((areaHa * 2.47105).toFixed(4));
      const marketVal = Math.round(areaHa * 19500000);

      const isVerified = status === 'POSSESSION_COMPLETED' || status === 'COMPENSATION_PAID';

      const pIns = await db.query(
        `INSERT INTO land_parcels (
          project_id, parcel_code, state_id, district_id, tehsil, village,
          khasra_survey_no, land_type, area_ha, area_acres, status, boundary_geojson,
          centroid_lat, centroid_lng, market_value_inr, verified_by_field_officer,
          field_officer_id, dispute_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          pId, pCode, sId, dId, pConfig.tehsil, vName,
          khasra, landType, areaHa, areaAcres, status, JSON.stringify(poly.geojson),
          poly.centroidLat, poly.centroidLng, marketVal, isVerified,
          userMap['field@bhoomichitra.demo'], disputeReason
        ]
      );

      const parcelId = pIns.rows[0]?.id;

      // Add Land Ownership with realistic statutory details
      if (parcelId) {
        const statutoryInfo = getStatutoryLandInfo(landType, pConfig.stateCode, vName, globalParcelCounter);
        
        let ownerName, maskId, contact, aadhaar;
        if (statutoryInfo) {
          ownerName = statutoryInfo.ownerName;
          maskId = statutoryInfo.maskId;
          contact = statutoryInfo.contact;
          aadhaar = statutoryInfo.aadhaar;
        } else {
          ownerName = getRegionalOwnerName(pConfig.stateCode, globalParcelCounter);
          maskId = `Owner ID: ******${3000 + globalParcelCounter}`;
          contact = `+91 98*** ***${10 + (globalParcelCounter % 90)}`;
          aadhaar = `Aadhaar: *******${4000 + globalParcelCounter}`;
        }

        await db.query(
          `INSERT INTO land_owners (parcel_id, full_name, masked_reference, share_percentage, contact_masked, aadhaar_masked)
           VALUES ($1, $2, $3, 100.00, $4, $5)`,
          [parcelId, ownerName, maskId, contact, aadhaar]
        );
      }

      globalParcelCounter++;
    }
  }

  console.log(`Seeded ${globalParcelCounter - 1} intact contiguous parcels across all 15 projects!`);
}

module.exports = {
  seedAllData,
  seedContiguousParcels
};
