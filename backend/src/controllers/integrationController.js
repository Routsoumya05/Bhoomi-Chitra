/**
 * BHOOMI CHITRA: Government Data Adapter & Integration Service Layer
 * 
 * DISCLAIMER & DESIGN NOTE:
 * These endpoints provide an extensible abstraction interface for state land records,
 * digital cadastral GIS maps, and national infrastructure portals (PM Gati Shakti).
 * Currently implemented with realistic MVP simulation adapters, ready for direct
 * swap-in of live NIC API credentials, State Bhulekh/Bhoomi web-services, and BhuNaksha WFS.
 */

// State Land Record Adapter (Bhulekh / Bhoomi / Banglarbhumi Simulation)
async function getLandRecordsAdapter(req, res) {
  try {
    const { state = 'OD', district = 'Dhenkanal', tehsil = 'Sadar', village = 'Gondia', khasra } = req.query;

    const mockRecord = {
      sourceSystem: `State Land Records Portal (Simulation: ${state} Bhulekh / RoR Service)`,
      isSimulation: true,
      apiStatus: 'ONLINE_MOCK',
      khasraNo: khasra || '102/4',
      khataNo: '245',
      state,
      district,
      tehsil,
      village,
      rorDetails: {
        recordedTenant: 'Debendra Pradhan & Co-sharers',
        relationship: 'S/O Late Banamali Pradhan',
        casteCategory: 'OBC',
        totalAreaAcres: '2.14',
        kissamLandType: 'Saradha Do-fasali (Irrigated Agricultural)',
        landRevenuePaise: '1250',
        cessPaise: '350',
        encumbranceStatus: 'Clear (No mortgage/charge registered)',
        disputeStatus: 'No civil court lis-pendens recorded in RoR'
      },
      lastUpdatedOnRecord: '2024-11-12'
    };

    res.set('X-Integration-Mode', 'MVP-Simulation');
    return res.json({
      success: true,
      data: mockRecord,
      meta: {
        adapter: 'StateLandRecordsAdapterV1',
        readyForLiveApi: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Land records adapter failed.' });
  }
}

// Digital Cadastral Map Adapter (BhuNaksha / WFS Cadastral GIS Simulation)
async function getCadastralAdapter(req, res) {
  try {
    const { state = 'OD', district = 'Dhenkanal', village = 'Gondia' } = req.query;

    const mockCadastral = {
      sourceSystem: `National Informatics Centre (NIC) BhuNaksha WFS Simulation (${state})`,
      isSimulation: true,
      apiStatus: 'ONLINE_MOCK',
      villageGeocode: '210400102',
      projection: 'EPSG:4326',
      totalSurveyPlots: 412,
      cadastralBoundaryPolygon: {
        type: 'Polygon',
        coordinates: [[
          [85.5850, 20.6500],
          [85.6150, 20.6500],
          [85.6180, 20.6720],
          [85.5880, 20.6720],
          [85.5850, 20.6500]
        ]]
      },
      adjacentVillages: ['Joranda', 'Kapilash Road', 'Motanga']
    };

    res.set('X-Integration-Mode', 'MVP-Simulation');
    return res.json({
      success: true,
      data: mockCadastral,
      meta: {
        adapter: 'BhuNakshaCadastralAdapterV1',
        readyForLiveApi: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Cadastral adapter failed.' });
  }
}

// National Infrastructure / PM Gati Shakti Project Data Adapter
async function getProjectDataAdapter(req, res) {
  try {
    const { projectCode = 'NHAI-OD-NH55-01' } = req.query;

    const mockProjectData = {
      sourceSystem: 'PM Gati Shakti National Master Plan (NMP) Integration Adapter',
      isSimulation: true,
      apiStatus: 'ONLINE_MOCK',
      projectCode,
      sanctionDetails: {
        sanctionAuthority: 'Cabinet Committee on Economic Affairs (CCEA)',
        cabinetApprovalDate: '2024-09-15',
        revisedCostEstimateInrCr: 2450.00,
        fundingPattern: '100% Central Government (NHAI Toll-Operate-Transfer & Capex)',
        alignmentLengthKm: 112.00,
        rightOfWayWidthMeters: 60
      },
      clearances: {
        environmentalClearance: 'APPROVED (MoEFCC File 11-42/2024-IA.III)',
        forestClearanceStage1: 'APPROVED (In-principle granted for 18.4 Ha forest diversion)',
        forestClearanceStage2: 'IN_PROGRESS',
        wildlifeClearance: 'NOT_APPLICABLE',
        railwayOverbridgeApproval: 'APPROVED (East Coast Railway GAD approved)'
      }
    };

    res.set('X-Integration-Mode', 'MVP-Simulation');
    return res.json({
      success: true,
      data: mockProjectData,
      meta: {
        adapter: 'PmGatiShaktiAdapterV1',
        readyForLiveApi: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Project data adapter failed.' });
  }
}

module.exports = {
  getLandRecordsAdapter,
  getCadastralAdapter,
  getProjectDataAdapter
};
