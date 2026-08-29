/**
 * AGT Analytics 360° - Cadre Planning & Mobility Engine
 * Multi-page & Interactive SPA Engine for Officer 360°, Office 360°, Zone 360°, As-on-date, and Mobility Network
 * Integrates data.json with pf-contacts API (https://gauravmeena0708.github.io/pf-contacts/api/v1/manifest.json)
 */

(function () {
  'use strict';

  // Global State
  const App = {
    rawData: [],
    officersByEid: new Map(),
    officersList: [],
    officesById: new Map(),
    officesList: [],
    zonesById: new Map(),
    zonesList: [],
    pfContacts: {
      manifest: null,
      offices: [],
      hierarchy: null
    },
    pageMode: 'auto', // 'index', 'officer', 'office', 'zone', 'as-on-date', 'mobility'
    currentOfficerEid: null,
    currentOfficeId: null,
    currentZoneId: null,
    asOnDateValue: '2023-01-01',
    isLoaded: false
  };

  // Comprehensive dictionary of canonical office mappings
  const OFFICE_DICT = {
    'NATRSS': { id: 'pdunass-pdunass', name: 'PDUNASS (NATRSS)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Training Institute' },
    'PDUNASS': { id: 'pdunass-pdunass', name: 'PDUNASS (NATRSS)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Training Institute' },
    'NATIONAL DATA CENTRE': { id: 'ndc-national-data-centre', name: 'National Data Centre (NDC)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Special Wing' },
    'NDC': { id: 'ndc-national-data-centre', name: 'National Data Centre (NDC)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Special Wing' },
    'INTERNAL AUDIT': { id: 'internal-audit-internal-audit-wing', name: 'Internal Audit Wing', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Special Wing' },
    'VIGILANCE': { id: 'vigilance-vigilance-wing', name: 'Vigilance Wing', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Special Wing' },
    'HEAD OFFICE': { id: 'head-office', name: 'Head Office (Delhi)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Head Office' },
    'HO': { id: 'head-office', name: 'Head Office (Delhi)', station: 'Delhi', zone: 'Head Office', zoneId: 'head-office', cat: 'Head Office' },

    'ZTI-SZ': { id: 'zti-zonal-training-institute-south-zone', name: 'ZTI South Zone (Chennai)', station: 'Chennai', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Training Institute' },
    'ZTI SZ': { id: 'zti-zonal-training-institute-south-zone', name: 'ZTI South Zone (Chennai)', station: 'Chennai', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Training Institute' },
    'ZTI-NZ': { id: 'zti-zonal-training-institute-north-zone', name: 'ZTI North Zone (Faridabad)', station: 'Faridabad', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Training Institute' },
    'ZTI NZ': { id: 'zti-zonal-training-institute-north-zone', name: 'ZTI North Zone (Faridabad)', station: 'Faridabad', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Training Institute' },
    'ZTI-WZ': { id: 'zti-zonal-training-institute-west-zone', name: 'ZTI West Zone (Ujjain)', station: 'Ujjain', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Training Institute' },
    'ZTI WZ': { id: 'zti-zonal-training-institute-west-zone', name: 'ZTI West Zone (Ujjain)', station: 'Ujjain', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Training Institute' },
    'ZTI-EZ': { id: 'zti-zonal-training-institute-east-zone', name: 'ZTI East Zone (Kolkata)', station: 'Kolkata', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Training Institute' },
    'ZTI EZ': { id: 'zti-zonal-training-institute-east-zone', name: 'ZTI East Zone (Kolkata)', station: 'Kolkata', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Training Institute' },

    'DELHI NORTH': { id: 'ro-delhi-north', name: 'Regional Office Delhi North', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'DELHI SOUTH': { id: 'ro-delhi-south', name: 'Regional Office Delhi South', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'DELHI CENTRAL': { id: 'ro-delhi-central', name: 'Regional Office Delhi Central', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'DELHI EAST': { id: 'ro-delhi-east', name: 'Regional Office Delhi East (Laxmi Nagar)', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'DELHI WEST': { id: 'ro-delhi-west', name: 'Regional Office Delhi West', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'LAXMI NAGAR': { id: 'ro-delhi-east', name: 'Regional Office Delhi East (Laxmi Nagar)', station: 'Delhi', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },

    'JAIPUR': { id: 'ro-jaipur', name: 'Regional Office Jaipur', station: 'Jaipur', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'Regional Office' },
    'JODHPUR': { id: 'ro-jodhpur', name: 'Regional Office Jodhpur', station: 'Jodhpur', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'Regional Office' },
    'KOTA': { id: 'ro-kota', name: 'Regional Office Kota', station: 'Kota', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'Regional Office' },
    'UDAIPUR': { id: 'ro-udaipur', name: 'Regional Office Udaipur', station: 'Udaipur', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'Regional Office' },
    'ALWAR': { id: 'do-alwar', name: 'District Office Alwar', station: 'Alwar', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'District Office' },
    'AJMER': { id: 'do-ajmer', name: 'District Office Ajmer', station: 'Ajmer', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'District Office' },
    'BHILWARA': { id: 'do-bhilwara', name: 'District Office Bhilwara', station: 'Bhilwara', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'District Office' },
    'BIKANER': { id: 'do-bikaner', name: 'District Office Bikaner', station: 'Bikaner', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'District Office' },
    'SRIGANGANAGAR': { id: 'do-sriganganagar', name: 'District Office Sri Ganganagar', station: 'Sri Ganganagar', zone: 'Rajasthan Zone', zoneId: 'zo-rajasthan', cat: 'District Office' },

    'AMRITSAR': { id: 'ro-amritsar', name: 'Regional Office Amritsar', station: 'Amritsar', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'CHANDIGARH': { id: 'ro-chandigarh', name: 'Regional Office Chandigarh', station: 'Chandigarh', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'LUDHIANA': { id: 'ro-ludhiana', name: 'Regional Office Ludhiana', station: 'Ludhiana', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'JALANDHAR': { id: 'ro-jalandhar', name: 'Regional Office Jalandhar', station: 'Jalandhar', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'BHATINDA': { id: 'ro-bhatinda', name: 'Regional Office Bhatinda', station: 'Bhatinda', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'SHIMLA': { id: 'ro-shimla', name: 'Regional Office Shimla', station: 'Shimla', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'Regional Office' },
    'BATALA': { id: 'do-batala', name: 'District Office Batala', station: 'Batala', zone: 'Punjab & HP Zone', zoneId: 'zo-punjab-himachal-pradesh', cat: 'District Office' },

    'K R PURAM (WHITEFIELD)': { id: 'ro-k-r-puram-whitefield', name: 'Regional Office KR Puram (Whitefield)', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'K R PURAM': { id: 'ro-k-r-puram-whitefield', name: 'Regional Office KR Puram (Whitefield)', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'WHITEFIELD': { id: 'ro-k-r-puram-whitefield', name: 'Regional Office KR Puram (Whitefield)', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'BANGALORE': { id: 'ro-bengaluru-central', name: 'Regional Office Bengaluru Central', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'BENGALURU': { id: 'ro-bengaluru-central', name: 'Regional Office Bengaluru Central', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'PEENYA': { id: 'ro-peenya', name: 'Regional Office Peenya', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'YELAHANKA': { id: 'ro-yelahanka', name: 'Regional Office Yelahanka', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'BOMMASANDRA': { id: 'ro-bommasandra', name: 'Regional Office Bommasandra', station: 'Bengaluru', zone: 'Karnataka Zone', zoneId: 'zo-bengaluru-bengaluru', cat: 'Regional Office' },
    'MANGALORE': { id: 'ro-mangaluru', name: 'Regional Office Mangaluru', station: 'Mangaluru', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'MANGALURU': { id: 'ro-mangaluru', name: 'Regional Office Mangaluru', station: 'Mangaluru', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'MYSORE': { id: 'ro-mysore', name: 'Regional Office Mysore', station: 'Mysore', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'HUBLI': { id: 'ro-hubli', name: 'Regional Office Hubli', station: 'Hubli', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'SHIMOGA': { id: 'ro-shimoga', name: 'Regional Office Shivamogga', station: 'Shivamogga', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'SHIVAMOGGA': { id: 'ro-shimoga', name: 'Regional Office Shivamogga', station: 'Shivamogga', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'GULBARGA': { id: 'ro-gulbarga', name: 'Regional Office Kalaburagi', station: 'Kalaburagi', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'KALABURAGI': { id: 'ro-gulbarga', name: 'Regional Office Kalaburagi', station: 'Kalaburagi', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'BELLARY': { id: 'ro-bellary', name: 'Regional Office Ballari', station: 'Ballari', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'BALLARI': { id: 'ro-bellary', name: 'Regional Office Ballari', station: 'Ballari', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'UDUPI': { id: 'ro-udupi', name: 'Regional Office Udupi', station: 'Udupi', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'TUMKUR': { id: 'ro-tumkur', name: 'Regional Office Tumakuru', station: 'Tumakuru', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'TUMAKURU': { id: 'ro-tumkur', name: 'Regional Office Tumakuru', station: 'Tumakuru', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'RAICHUR': { id: 'ro-raichur', name: 'Regional Office Raichur', station: 'Raichur', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },
    'GOA': { id: 'ro-goa', name: 'Regional Office Goa', station: 'Goa', zone: 'Karnataka & Goa Zone', zoneId: 'zo-karnataka-other-than-bengaluru-goa-hubli', cat: 'Regional Office' },

    'CHENNAI': { id: 'ro-chennai-north', name: 'Regional Office Chennai North', station: 'Chennai', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },
    'AMBATTUR': { id: 'ro-ambattur', name: 'Regional Office Ambattur', station: 'Chennai', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },
    'TAMBARAM': { id: 'ro-tambaram', name: 'Regional Office Tambaram', station: 'Chennai', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },
    'COIMBATORE': { id: 'ro-coimbatore', name: 'Regional Office Coimbatore', station: 'Coimbatore', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'MADURAI': { id: 'ro-madurai', name: 'Regional Office Madurai', station: 'Madurai', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'SALEM': { id: 'ro-salem', name: 'Regional Office Salem', station: 'Salem', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'TRICHY': { id: 'ro-trichy', name: 'Regional Office Tiruchirappalli', station: 'Tiruchirappalli', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'TIRUCHIRAPPALLI': { id: 'ro-trichy', name: 'Regional Office Tiruchirappalli', station: 'Tiruchirappalli', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'TIRUNELVELI': { id: 'ro-tirunelveli', name: 'Regional Office Tirunelveli', station: 'Tirunelveli', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'TIRUPPUR': { id: 'ro-tiruppur', name: 'Regional Office Tiruppur', station: 'Tiruppur', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'TIRUPUR': { id: 'ro-tiruppur', name: 'Regional Office Tiruppur', station: 'Tiruppur', zone: 'Tamil Nadu Zone', zoneId: 'zo-tamil-nadu-excluding-chennai', cat: 'Regional Office' },
    'VELLORE': { id: 'ro-vellore', name: 'Regional Office Vellore', station: 'Vellore', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },
    'PUDUCHERRY': { id: 'ro-puducherry', name: 'Regional Office Puducherry', station: 'Puducherry', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },
    'PONDICHERRY': { id: 'ro-puducherry', name: 'Regional Office Puducherry', station: 'Puducherry', zone: 'Tamil Nadu Zone', zoneId: 'zo-chennai-puducherry-chennai', cat: 'Regional Office' },

    'BANDRA': { id: 'ro-mumbai-bandra', name: 'Regional Office Bandra', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'MUMBAI': { id: 'ro-mumbai-bandra', name: 'Regional Office Bandra', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'FORT': { id: 'ro-mumbai-fort', name: 'Regional Office Mumbai Fort', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'MUMBAI FORT': { id: 'ro-mumbai-fort', name: 'Regional Office Mumbai Fort', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'DADAR': { id: 'ro-mumbai-dadar', name: 'Regional Office Dadar', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'KANDIVALI': { id: 'ro-kandivali-east', name: 'Regional Office Kandivali', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-thane', cat: 'Regional Office' },
    'POWAI': { id: 'ro-mumbai-powai', name: 'Regional Office Powai', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'NARIMAN POINT': { id: 'ro-mumbai-nariman-point', name: 'Regional Office Nariman Point', station: 'Mumbai', zone: 'Maharashtra Zone', zoneId: 'zo-bandra', cat: 'Regional Office' },
    'THANE': { id: 'ro-thane-north', name: 'Regional Office Thane', station: 'Thane', zone: 'Thane Zone', zoneId: 'zo-thane', cat: 'Regional Office' },
    'VASHI': { id: 'ro-vashi', name: 'Regional Office Vashi', station: 'Navi Mumbai', zone: 'Thane Zone', zoneId: 'zo-thane', cat: 'Regional Office' },
    'PUNE': { id: 'ro-pune-cantt', name: 'Regional Office Pune (Cantt)', station: 'Pune', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'AKURDI': { id: 'ro-pune-akurdi', name: 'Regional Office Pune (Akurdi)', station: 'Pune', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'HINJAWADI': { id: 'ro-pune-hinjawadi', name: 'Regional Office Pune (Hinjawadi)', station: 'Pune', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'VIMAN NAGAR': { id: 'ro-pune-viman-nagar', name: 'Regional Office Pune (Viman Nagar)', station: 'Pune', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'NAGPUR': { id: 'ro-nagpur', name: 'Regional Office Nagpur', station: 'Nagpur', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'NASIK': { id: 'ro-nasik', name: 'Regional Office Nashik', station: 'Nashik', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'NASHIK': { id: 'ro-nasik', name: 'Regional Office Nashik', station: 'Nashik', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'AURANGABAD': { id: 'ro-aurangabad', name: 'Regional Office Aurangabad', station: 'Chhatrapati Sambhajinagar', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'KOLHAPUR': { id: 'ro-kolhapur', name: 'Regional Office Kolhapur', station: 'Kolhapur', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'SOLAPUR': { id: 'ro-solapur', name: 'Regional Office Solapur', station: 'Solapur', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },
    'AKOLA': { id: 'ro-akola', name: 'Regional Office Akola', station: 'Akola', zone: 'Maharashtra Zone', zoneId: 'zo-maharashtra-excluding-mumbai-pune', cat: 'Regional Office' },

    'HYDERABAD': { id: 'ro-hyderabad-barkatpura', name: 'Regional Office Hyderabad (Barkatpura)', station: 'Hyderabad', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'KUKATPALLI': { id: 'ro-kukatpalli', name: 'Regional Office Kukatpalli', station: 'Hyderabad', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'NIZAMABAD': { id: 'ro-nizamabad', name: 'Regional Office Nizamabad', station: 'Nizamabad', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'WARANGAL': { id: 'ro-warangal', name: 'Regional Office Warangal', station: 'Warangal', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'KARIMNAGAR': { id: 'ro-karimnagar', name: 'Regional Office Karimnagar', station: 'Karimnagar', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'SANGAREDDY': { id: 'ro-sangareddy', name: 'Regional Office Sangareddy', station: 'Sangareddy', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'Regional Office' },
    'PATANCHERU': { id: 'do-patancheru', name: 'District Office Patancheru', station: 'Patancheru', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'District Office' },
    'SIDDIPET': { id: 'do-siddipet', name: 'District Office Siddipet', station: 'Siddipet', zone: 'Telangana Zone', zoneId: 'zo-telangana-hyderabad', cat: 'District Office' },

    'AHMEDABAD': { id: 'ro-ahmedabad', name: 'Regional Office Ahmedabad', station: 'Ahmedabad', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'SURAT': { id: 'ro-surat', name: 'Regional Office Surat', station: 'Surat', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'VADODARA': { id: 'ro-vadodara', name: 'Regional Office Vadodara', station: 'Vadodara', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'BARODA': { id: 'ro-vadodara', name: 'Regional Office Vadodara', station: 'Vadodara', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'RAJKOT': { id: 'ro-rajkot', name: 'Regional Office Rajkot', station: 'Rajkot', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'VATWA': { id: 'ro-vatwa', name: 'Regional Office Vatwa', station: 'Ahmedabad', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'NARODA': { id: 'ro-naroda', name: 'Regional Office Naroda', station: 'Ahmedabad', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'VAPI': { id: 'ro-vapi', name: 'Regional Office Vapi', station: 'Vapi', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'Regional Office' },
    'BHARUCH': { id: 'do-bharuch', name: 'District Office Bharuch', station: 'Bharuch', zone: 'Gujarat Zone', zoneId: 'zo-gujarat-ahmedabad', cat: 'District Office' },

    'GURGAON': { id: 'ro-gurugram-east', name: 'Regional Office Gurugram', station: 'Gurugram', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Regional Office' },
    'GURUGRAM': { id: 'ro-gurugram-east', name: 'Regional Office Gurugram', station: 'Gurugram', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Regional Office' },
    'FARIDABAD': { id: 'ro-faridabad', name: 'Regional Office Faridabad', station: 'Faridabad', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Regional Office' },
    'KARNAL': { id: 'ro-karnal', name: 'Regional Office Karnal', station: 'Karnal', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Regional Office' },
    'ROHTAK': { id: 'ro-htak', name: 'Regional Office Rohtak', station: 'Rohtak', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'Regional Office' },
    'SONIPAT': { id: 'do-sonipat', name: 'District Office Sonipat', station: 'Sonipat', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'District Office' },
    'PANIPAT': { id: 'do-panipat', name: 'District Office Panipat', station: 'Panipat', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'District Office' },
    'HISAR': { id: 'do-hisar', name: 'District Office Hisar', station: 'Hisar', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'District Office' },
    'HISSAR': { id: 'do-hisar', name: 'District Office Hisar', station: 'Hisar', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'District Office' },
    'AMBALA': { id: 'do-ambala', name: 'District Office Ambala', station: 'Ambala', zone: 'Haryana Zone', zoneId: 'zo-haryana', cat: 'District Office' },

    'KANPUR': { id: 'ro-kanpur', name: 'Regional Office Kanpur', station: 'Kanpur', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'LUCKNOW': { id: 'ro-lucknow', name: 'Regional Office Lucknow', station: 'Lucknow', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'AGRA': { id: 'ro-agra', name: 'Regional Office Agra', station: 'Agra', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'VARANASI': { id: 'ro-varanasi', name: 'Regional Office Varanasi', station: 'Varanasi', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'MEERUT': { id: 'ro-meerut', name: 'Regional Office Meerut', station: 'Meerut', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'NOIDA': { id: 'ro-noida', name: 'Regional Office Noida', station: 'Noida', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'GREATER NOIDA': { id: 'ro-greater-noida', name: 'Regional Office Greater Noida', station: 'Greater Noida', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'GORAKHPUR': { id: 'ro-gorakhpur', name: 'Regional Office Gorakhpur', station: 'Gorakhpur', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'BAREILLY': { id: 'ro-bareilly', name: 'Regional Office Bareilly', station: 'Bareilly', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'ALLAHABAD': { id: 'ro-allahabad-prayagraj', name: 'Regional Office Prayagraj', station: 'Prayagraj', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },
    'PRAYAGRAJ': { id: 'ro-allahabad-prayagraj', name: 'Regional Office Prayagraj', station: 'Prayagraj', zone: 'Uttar Pradesh Zone', zoneId: 'zo-uttar-pradesh', cat: 'Regional Office' },

    'BHOPAL': { id: 'ro-bhopal', name: 'Regional Office Bhopal', station: 'Bhopal', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'INDORE': { id: 'ro-indore', name: 'Regional Office Indore', station: 'Indore', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'JABALPUR': { id: 'ro-jabalpur', name: 'Regional Office Jabalpur', station: 'Jabalpur', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'GWALIOR': { id: 'ro-gwalior', name: 'Regional Office Gwalior', station: 'Gwalior', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'UJJAIN': { id: 'ro-ujjain', name: 'Regional Office Ujjain', station: 'Ujjain', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'SAGAR': { id: 'ro-sagar', name: 'Regional Office Sagar', station: 'Sagar', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'RAIPUR': { id: 'ro-raipur-chattisgarh', name: 'Regional Office Raipur', station: 'Raipur', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },
    'BILASPUR': { id: 'ro-bilaspur', name: 'Regional Office Bilaspur', station: 'Bilaspur', zone: 'MP & Chhattisgarh Zone', zoneId: 'zo-madhya-pradesh-chattisgarh-bhopal', cat: 'Regional Office' },

    'PATNA': { id: 'ro-patna', name: 'Regional Office Patna', station: 'Patna', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'Regional Office' },
    'RANCHI': { id: 'ro-ranchi', name: 'Regional Office Ranchi', station: 'Ranchi', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'Regional Office' },
    'JAMSHEDPUR': { id: 'ro-jamshedpur', name: 'Regional Office Jamshedpur', station: 'Jamshedpur', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'Regional Office' },
    'MUZAFFARPUR': { id: 'ro-muzaffarpur', name: 'Regional Office Muzaffarpur', station: 'Muzaffarpur', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'Regional Office' },
    'BHAGALPUR': { id: 'ro-bhagalpur', name: 'Regional Office Bhagalpur', station: 'Bhagalpur', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'Regional Office' },
    'DARBHANGA': { id: 'do-darbhanga', name: 'District Office Darbhanga', station: 'Darbhanga', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'District Office' },
    'DHANBAD': { id: 'do-dhanbad', name: 'District Office Dhanbad', station: 'Dhanbad', zone: 'Bihar & Jharkhand Zone', zoneId: 'zo-bihar-jharkhand-patna', cat: 'District Office' },

    'BHUBANESWAR': { id: 'ro-bhubaneswar', name: 'Regional Office Bhubaneswar', station: 'Bhubaneswar', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'Regional Office' },
    'BHUBANESHWAR': { id: 'ro-bhubaneswar', name: 'Regional Office Bhubaneswar', station: 'Bhubaneswar', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'Regional Office' },
    'ROURKELA': { id: 'ro-urkela', name: 'Regional Office Rourkela', station: 'Rourkela', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'Regional Office' },
    'BERHAMPUR': { id: 'ro-berhampur', name: 'Regional Office Berhampur', station: 'Berhampur', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'Regional Office' },
    'KEONJHAR': { id: 'ro-keonjhar', name: 'Regional Office Keonjhar', station: 'Keonjhar', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'Regional Office' },
    'SAMBALPUR': { id: 'do-sambalpur', name: 'District Office Sambalpur', station: 'Sambalpur', zone: 'Odisha Zone', zoneId: 'zo-orissa-bhubaneswar', cat: 'District Office' },

    'THIRUVANANTHAPURAM': { id: 'ro-thiruvananthapuram', name: 'Regional Office Thiruvananthapuram', station: 'Thiruvananthapuram', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'TRIVANDRUM': { id: 'ro-thiruvananthapuram', name: 'Regional Office Thiruvananthapuram', station: 'Thiruvananthapuram', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'KOCHI': { id: 'ro-kochi', name: 'Regional Office Kochi', station: 'Kochi', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'COCHIN': { id: 'ro-kochi', name: 'Regional Office Kochi', station: 'Kochi', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'KOZHIKODE': { id: 'ro-kozhikode-calicut', name: 'Regional Office Kozhikode', station: 'Kozhikode', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'CALICUT': { id: 'ro-kozhikode-calicut', name: 'Regional Office Kozhikode', station: 'Kozhikode', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'KANNUR': { id: 'ro-kannur', name: 'Regional Office Kannur', station: 'Kannur', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'KOLLAM': { id: 'ro-kollam', name: 'Regional Office Kollam', station: 'Kollam', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },
    'KOTTAYAM': { id: 'ro-kottayam', name: 'Regional Office Kottayam', station: 'Kottayam', zone: 'Kerala Zone', zoneId: 'zo-kerala-lakshadweep-thiruvananthapuram', cat: 'Regional Office' },

    'GUWAHATI': { id: 'ro-guwahati', name: 'Regional Office Guwahati', station: 'Guwahati', zone: 'North-East Zone', zoneId: 'zo-north-eastern-region-guwahati', cat: 'Regional Office' },
    'SHILLONG': { id: 'ro-shillong', name: 'Regional Office Shillong', station: 'Shillong', zone: 'North-East Zone', zoneId: 'zo-north-eastern-region-guwahati', cat: 'Regional Office' },
    'AGARTALA': { id: 'ro-agartala', name: 'Regional Office Agartala', station: 'Agartala', zone: 'North-East Zone', zoneId: 'zo-north-eastern-region-guwahati', cat: 'Regional Office' },
    'TINSUKIA': { id: 'ro-tinsukia', name: 'Regional Office Tinsukia', station: 'Tinsukia', zone: 'North-East Zone', zoneId: 'zo-north-eastern-region-guwahati', cat: 'Regional Office' },
    'AIZAWL': { id: 'sso-aizawl', name: 'Special State Office Aizawl', station: 'Aizawl', zone: 'North-East Zone', zoneId: 'zo-north-eastern-region-guwahati', cat: 'Special State Office' },
    'GANGTOK': { id: 'sso-gangtok', name: 'Special State Office Gangtok', station: 'Gangtok', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Special State Office' },

    'VISAKHAPATNAM': { id: 'ro-visakhapatnam', name: 'Regional Office Visakhapatnam', station: 'Visakhapatnam', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'VISHAKAPATNAM': { id: 'ro-visakhapatnam', name: 'Regional Office Visakhapatnam', station: 'Visakhapatnam', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'VIJAYAWADA': { id: 'ro-vijayawada', name: 'Regional Office Vijayawada', station: 'Vijayawada', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'VIJAYWADA': { id: 'ro-vijayawada', name: 'Regional Office Vijayawada', station: 'Vijayawada', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'GUNTUR': { id: 'ro-guntur', name: 'Regional Office Guntur', station: 'Guntur', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'KADAPA': { id: 'ro-kadapa', name: 'Regional Office Kadapa', station: 'Kadapa', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'CUDDAPAH': { id: 'ro-kadapa', name: 'Regional Office Kadapa', station: 'Kadapa', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'RAJAHMUNDRY': { id: 'ro-rajamahendravaram', name: 'Regional Office Rajamahendravaram', station: 'Rajamahendravaram', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },
    'RAJAMAHENDRAVARAM': { id: 'ro-rajamahendravaram', name: 'Regional Office Rajamahendravaram', station: 'Rajamahendravaram', zone: 'Andhra Pradesh Zone', zoneId: 'zo-andhra-pradesh-vijayawada', cat: 'Regional Office' },

    'KOLKATA': { id: 'ro-kolkata', name: 'Regional Office Kolkata', station: 'Kolkata', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'CALCUTTA': { id: 'ro-kolkata', name: 'Regional Office Kolkata', station: 'Kolkata', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'PARK STREET': { id: 'ro-park-street', name: 'Regional Office Park Street', station: 'Kolkata', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'BARRACKPORE': { id: 'ro-barrackpore', name: 'Regional Office Barrackpore', station: 'Barrackpore', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'HOWRAH': { id: 'ro-howrah', name: 'Regional Office Howrah', station: 'Howrah', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'DURGAPUR': { id: 'ro-durgapur', name: 'Regional Office Durgapur', station: 'Durgapur', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'SILIGURI': { id: 'ro-siliguri', name: 'Regional Office Siliguri', station: 'Siliguri', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'JALPAIGURI': { id: 'ro-jalpaiguri', name: 'Regional Office Jalpaiguri', station: 'Jalpaiguri', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'JANGIPUR': { id: 'ro-jangipur', name: 'Regional Office Jangipur', station: 'Jangipur', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },
    'PORT BLAIR': { id: 'ro-port-blair', name: 'Regional Office Port Blair', station: 'Port Blair', zone: 'WB & NER Zone', zoneId: 'zo-wb-a-n-islands-sikkim-kolkata', cat: 'Regional Office' },

    'DEHRADUN': { id: 'ro-dehradun', name: 'Regional Office Dehradun', station: 'Dehradun', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'HALDWANI': { id: 'ro-haldwani', name: 'Regional Office Haldwani', station: 'Haldwani', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'JAMMU': { id: 'ro-jammu', name: 'Regional Office Jammu', station: 'Jammu', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'SRINAGAR': { id: 'ro-kashmir-srinagar', name: 'Regional Office Srinagar', station: 'Srinagar', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },
    'LEH': { id: 'ro-leh-ladakh', name: 'Regional Office Leh (Ladakh)', station: 'Leh', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' }
  };

  const SORTED_KEYS = Object.keys(OFFICE_DICT).sort((a, b) => b.length - a.length);

  // Helper: Date parsing
  function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += (year > 50 ? 1900 : 2000);
      return new Date(year, month, day);
    }
    return null;
  }

  // Parse col4 and resolve TARGET posting office & station accurately
  function resolveOffice(col4Str) {
    if (!col4Str) {
      return { ...OFFICE_DICT['HEAD OFFICE'], raw: '' };
    }

    let s = col4Str.trim();
    // Strip prefix events
    const prefixes = [
      'AD-HOC PROMOTION AT SAME OFFICE',
      'PROMOTION AT SAME OFFICE',
      'REVOCATION OF SUSPENSION AT SAME OFFICE',
      'DEPUTATION AT SAME OFFICE',
      'SUSPENSION AT SAME OFFICE',
      'REPATRIATION FROM DEPUTATION AT SAME OFFICE',
      'ON STUDY LEAVE',
      'BACK FROM STUDY LEAVE',
      'ON FOREIGN SERVICE',
      'BACK FROM FOREIGN SERVICE',
      'FROM DEPUTATION AT SAME OFFICE'
    ];
    for (const p of prefixes) {
      if (s.toUpperCase().startsWith(p)) {
        s = s.substring(p.length).trim();
        break;
      }
    }

    // Strip designation prefixes
    const desigPfxs = ['ACC (HQ)', 'ACC(HQ)', 'ACC-II', 'ACC-I', 'ACC', 'RPFC-II', 'RPFC-I', 'RPFC', 'APFC'];
    for (const dp of desigPfxs) {
      if (s.toUpperCase().startsWith(dp + ' ')) {
        s = s.substring(dp.length).trim();
        break;
      }
    }

    const su = s.toUpperCase();

    // Find all matching place tokens with word boundary regex
    const matches = [];
    for (const k of SORTED_KEYS) {
      const regex = new RegExp('(?:^|[\\s,()~-])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[\\s,()~-])', 'g');
      let m;
      while ((m = regex.exec(su)) !== null) {
        matches.push({ start: m.index, end: m.index + k.length, key: k });
      }
    }

    // Filter out overlapping sub-matches
    matches.sort((a, b) => a.start - b.start);
    const filtered = [];
    for (const m of matches) {
      if (!filtered.some(f => f.start <= m.start && m.end <= f.end && (f.end - f.start) > (m.end - m.start))) {
        filtered.push(m);
      }
    }
    filtered.sort((a, b) => a.start - b.start);

    // Fallback if no known dictionary token matched
    if (filtered.length === 0) {
      let clean = s.replace(/^(D\.O\s*[-–]|S\.S\.O\s*[-–]|RO\s+|ZO\s+|DO\s+)/i, '').replace(/[()]/g, '').trim();
      let isDo = s.toUpperCase().includes('D.O') || s.toUpperCase().includes('DISTRICT');
      let words = clean.split(/\s+/);
      let stn = words[words.length - 1] || 'Unknown';
      let stnTitle = stn.charAt(0).toUpperCase() + stn.slice(1).toLowerCase();
      let offName = isDo ? `District Office ${stnTitle}` : `Regional Office ${stnTitle}`;
      let offId = isDo ? `do-${stn.toLowerCase()}` : `ro-${stn.toLowerCase()}`;
      return {
        id: offId,
        name: offName,
        station: stnTitle,
        zone: 'Field Operations Zone',
        zoneId: 'zo-field',
        cat: isDo ? 'District Office' : 'Regional Office',
        category: isDo ? 'District Office' : 'Regional Office',
        raw: col4Str
      };
    }

    let targetKey;
    if (filtered.length === 1) {
      targetKey = filtered[0].key;
    } else if (filtered.length === 2) {
      const t0 = filtered[0].key;
      const t1 = filtered[1].key;
      const specialInstitutes = ['ZTI-SZ', 'ZTI-NZ', 'ZTI-WZ', 'ZTI-EZ', 'HEAD OFFICE', 'HO', 'NATRSS', 'PDUNASS', 'NDC', 'VIGILANCE', 'INTERNAL AUDIT'];
      if (specialInstitutes.includes(t0) && ['CHENNAI', 'DELHI', 'FARIDABAD', 'UJJAIN', 'KOLKATA'].includes(t1)) {
        targetKey = t0;
      } else {
        targetKey = t1;
      }
    } else {
      targetKey = filtered[1].key;
    }

    const resolved = OFFICE_DICT[targetKey] || OFFICE_DICT['HEAD OFFICE'];
    return {
      ...resolved,
      category: resolved.cat,
      raw: col4Str
    };
  }

  function normalizeDesignation(col2Str, eventStr, prevDesig) {
    let d = (col2Str || '').trim().toUpperCase();
    if (d === 'APFC') return 'APFC';
    if (d === 'RPFC-II' || d === 'RPFC II' || d === 'RPFC-2') return 'RPFC-II';
    if (d === 'RPFC-I' || d === 'RPFC I' || d === 'RPFC-1') return 'RPFC-I';
    if (d === 'ACC (HQ)' || d === 'ACC(HQ)') return 'ACC (HQ)';
    if (d.startsWith('ACC')) return 'ACC';

    if (eventStr && eventStr.toUpperCase().includes('PROMOTION')) {
      if (prevDesig === 'APFC') return 'RPFC-II';
      if (prevDesig === 'RPFC-II') return 'RPFC-I';
      if (prevDesig === 'RPFC-I') return 'ACC';
      if (prevDesig === 'ACC') return 'ACC (HQ)';
    }

    return prevDesig || 'APFC';
  }

  function normalizeEvent(eventStr, col4Str) {
    let ev = (eventStr || '').trim();
    if (ev && ev !== 'None') return ev;

    let c = (col4Str || '').toUpperCase();
    if (c.includes('PROMOTION AT SAME OFFICE') || c.includes('AD-HOC PROMOTION AT SAME OFFICE')) return 'Promotion at same office';
    if (c.includes('PROMOTION WITH TRANSFER')) return 'Promotion with transfer';
    if (c.includes('STUDY LEAVE')) return 'Study leave';
    if (c.includes('DEPUTATION')) return 'Deputation';
    if (c.includes('FOREIGN SERVICE')) return 'Foreign service';
    if (c.includes('SUSPENSION')) return 'Suspension';

    return 'Transferred';
  }

  async function fetchPfContacts() {
    try {
      const manifestUrl = 'https://gauravmeena0708.github.io/pf-contacts/api/v1/manifest.json';
      const base = 'https://gauravmeena0708.github.io/pf-contacts/api/v1/';
      const mResp = await fetch(manifestUrl);
      if (mResp.ok) {
        App.pfContacts.manifest = await mResp.json();
        const oResp = await fetch(base + 'offices.json');
        if (oResp.ok) {
          const oData = await oResp.json();
          App.pfContacts.offices = oData.offices || [];
        }
        const hResp = await fetch(base + 'hierarchy.json');
        if (hResp.ok) {
          App.pfContacts.hierarchy = await hResp.json();
        }
      }
    } catch (err) {
      console.warn('pf-contacts live API load notice:', err.message);
    }
  }

  async function init() {
    try {
      const resp = await fetch('data.json');
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      App.rawData = await resp.json();

      fetchPfContacts();
      processData();
      App.isLoaded = true;

      // Detect Page Mode & Route
      detectPageModeAndRoute();
      window.addEventListener('hashchange', detectPageModeAndRoute);
      window.addEventListener('popstate', detectPageModeAndRoute);

      setupEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
      showErrorState(error);
    }
  }

  function processData() {
    const officerMap = new Map();
    const officePostingsMap = new Map();
    const zoneMap = new Map();

    App.rawData.forEach((record, index) => {
      const eid = record.eid;
      if (!officerMap.has(eid)) {
        officerMap.set(eid, {
          eid: eid,
          name: record.name_office.replace(/\s+Office$/, '').trim() || 'Officer',
          rawName: record.name_office,
          dob: record.dob,
          records: []
        });
      }
      officerMap.get(eid).records.push({ ...record, rawIndex: index });
    });

    officerMap.forEach((officer) => {
      officer.records.sort((a, b) => {
        const da = parseDate(a.date1);
        const db = parseDate(b.date1);
        if (da && db) return da.getTime() - db.getTime();
        if (da) return -1;
        if (db) return 1;
        return 0;
      });

      let prevDesig = 'APFC';
      const rawEnriched = officer.records.map((r, idx) => {
        const d1 = parseDate(r.date1);
        const d2 = parseDate(r.date2);
        const desig = normalizeDesignation(r.col2, r.new_col4, prevDesig);
        prevDesig = desig;

        const offMeta = resolveOffice(r.col4);
        let event = normalizeEvent(r.new_col4, r.col4);
        if ((!r.new_col4 || r.new_col4 === 'None') && offMeta.cat === 'Training Institute') {
          event = 'Induction Training / Initial Entry';
        }
        const period = parseFloat(r.period1) || 0;

        return {
          eid: officer.eid,
          officerName: officer.name,
          fromDate: r.date1,
          toDate: r.date2 || '',
          fromDateTime: d1,
          toDateTime: d2,
          designation: desig,
          cadreStatus: r.col3 || 'Regular',
          officeId: offMeta.id,
          officeName: offMeta.name,
          station: offMeta.station,
          zone: offMeta.zone,
          zoneId: offMeta.zoneId,
          category: offMeta.category || offMeta.cat,
          event: event,
          periodYears: period,
          period2: parseFloat(r.period2) || period,
          rawCol4: r.col4,
          rawRecord: r
        };
      });

      // Consolidate consecutive duplicate/split HRM rows at same office & designation
      const consolidated = [];
      rawEnriched.forEach((item) => {
        if (consolidated.length === 0) {
          consolidated.push({
            ...item,
            mergedCount: 1,
            subRecords: [item.rawRecord]
          });
        } else {
          const prev = consolidated[consolidated.length - 1];
          if (prev.officeId === item.officeId && prev.designation === item.designation) {
            // Same continuous tenure at this office
            prev.mergedCount++;
            prev.subRecords.push(item.rawRecord);
            prev.periodYears = Math.max(prev.periodYears, item.periodYears, parseFloat((prev.periodYears + item.periodYears).toFixed(2)));
            if (item.fromDateTime && (!prev.fromDateTime || item.fromDateTime < prev.fromDateTime)) {
              prev.fromDateTime = item.fromDateTime;
              prev.fromDate = item.fromDate;
            }
            if (item.toDateTime && (!prev.toDateTime || item.toDateTime > prev.toDateTime)) {
              prev.toDateTime = item.toDateTime;
              prev.toDate = item.toDate;
            }
            if (item.event && item.event !== 'Transferred') {
              prev.event = item.event;
            }
          } else {
            consolidated.push({
              ...item,
              mergedCount: 1,
              subRecords: [item.rawRecord]
            });
          }
        }
      });

      // Chain dates and movement transitions
      let totalServiceYears = 0;
      for (let i = 0; i < consolidated.length; i++) {
        const cur = consolidated[i];
        totalServiceYears += cur.periodYears;
        cur.prevOffice = i > 0 ? consolidated[i - 1].officeName : 'Initial Cadre Entry';
        cur.prevStation = i > 0 ? consolidated[i - 1].station : 'Entry';
        cur.prevZone = i > 0 ? consolidated[i - 1].zone : 'Entry';

        if (i < consolidated.length - 1) {
          cur.toDate = consolidated[i + 1].fromDate || cur.toDate || '—';
          cur.toDateTime = consolidated[i + 1].fromDateTime || cur.toDateTime;
          cur.nextOffice = consolidated[i + 1].officeName;
          cur.nextStation = consolidated[i + 1].station;
          cur.nextZone = consolidated[i + 1].zone;
          cur.isLatest = false;
        } else {
          cur.toDate = 'Present';
          cur.nextOffice = '— (Active)';
          cur.nextStation = cur.station;
          cur.nextZone = cur.zone;
          cur.isLatest = true;
        }
      }

      officer.postings = consolidated;

      const latestPosting = officer.postings[officer.postings.length - 1] || {};
      const uniqueOffices = new Set(officer.postings.map(p => p.officeId));
      const uniqueStations = new Set(officer.postings.map(p => p.station));
      const uniqueZones = new Set(officer.postings.map(p => p.zone));

      const zoneTenureMap = new Map();
      officer.postings.forEach(p => {
        const cur = zoneTenureMap.get(p.zone) || 0;
        zoneTenureMap.set(p.zone, cur + p.periodYears);
      });

      const zoneExposure = Array.from(zoneTenureMap.entries()).map(([zName, years]) => ({
        zone: zName,
        years: parseFloat(years.toFixed(1)),
        percent: totalServiceYears > 0 ? Math.round((years / totalServiceYears) * 100) : 0
      })).sort((a, b) => b.years - a.years);

      const catTenureMap = { 'Regional Office': 0, 'Head Office': 0, 'Zonal Office': 0, 'Training Institute': 0, 'Other': 0 };
      officer.postings.forEach(p => {
        if (p.category === 'Head Office' || p.category === 'Special Wing') catTenureMap['Head Office'] += p.periodYears;
        else if (p.category === 'Regional Office' || p.category === 'District Office') catTenureMap['Regional Office'] += p.periodYears;
        else if (p.category === 'Zonal Office') catTenureMap['Zonal Office'] += p.periodYears;
        else if (p.category === 'Training Institute') catTenureMap['Training Institute'] += p.periodYears;
        else catTenureMap['Other'] += p.periodYears;
      });

      let curStationTenure = 0;
      for (let i = officer.postings.length - 1; i >= 0; i--) {
        if (officer.postings[i].station === latestPosting.station) {
          curStationTenure += officer.postings[i].periodYears;
        } else {
          break;
        }
      }

      let curOfficeTenure = 0;
      for (let i = officer.postings.length - 1; i >= 0; i--) {
        if (officer.postings[i].officeId === latestPosting.officeId) {
          curOfficeTenure += officer.postings[i].periodYears;
        } else {
          break;
        }
      }

      let curZoneTenure = 0;
      for (let i = officer.postings.length - 1; i >= 0; i--) {
        if (officer.postings[i].zone === latestPosting.zone) {
          curZoneTenure += officer.postings[i].periodYears;
        } else {
          break;
        }
      }

      const gradeMap = new Map();
      officer.postings.forEach(p => {
        const cur = gradeMap.get(p.designation) || 0;
        gradeMap.set(p.designation, cur + p.periodYears);
      });
      const gradeProgression = Array.from(gradeMap.entries()).map(([g, yrs]) => ({
        grade: g,
        years: parseFloat(yrs.toFixed(1))
      }));

      let interZoneMoves = 0;
      let intraZoneMoves = 0;
      for (let i = 1; i < officer.postings.length; i++) {
        if (officer.postings[i].zone !== officer.postings[i - 1].zone) {
          interZoneMoves++;
        } else if (officer.postings[i].officeId !== officer.postings[i - 1].officeId) {
          intraZoneMoves++;
        }
      }

      const stationCounts = {};
      officer.postings.forEach(p => {
        stationCounts[p.station] = (stationCounts[p.station] || 0) + 1;
      });
      const repeatStations = Object.entries(stationCounts).filter(([_, count]) => count > 1).length;

      const officerProfile = {
        eid: officer.eid,
        name: officer.name,
        dob: officer.dob,
        currentDesignation: latestPosting.designation || 'APFC',
        currentOffice: latestPosting.officeName || 'Head Office (Delhi)',
        currentOfficeId: latestPosting.officeId || 'head-office',
        currentStation: latestPosting.station || 'Delhi',
        currentZone: latestPosting.zone || 'Head Office',
        currentStationTenure: parseFloat(curStationTenure.toFixed(1)),
        currentOfficeTenure: parseFloat(curOfficeTenure.toFixed(1)),
        currentZoneTenure: parseFloat(curZoneTenure.toFixed(1)),
        totalServiceYears: parseFloat(totalServiceYears.toFixed(1)),
        distinctOfficesCount: uniqueOffices.size,
        distinctStationsCount: uniqueStations.size,
        zonesCount: uniqueZones.size,
        transfersCount: Math.max(0, officer.postings.length - 1),
        promotionsCount: officer.postings.filter(p => p.event.toLowerCase().includes('promotion')).length,
        avgStationTenure: uniqueStations.size > 0 ? parseFloat((totalServiceYears / uniqueStations.size).toFixed(1)) : 0,
        zoneExposure: zoneExposure,
        experienceMix: catTenureMap,
        gradeProgression: gradeProgression,
        interZoneMoves: interZoneMoves,
        intraZoneMoves: intraZoneMoves,
        repeatStations: repeatStations,
        postings: officer.postings
      };

      App.officersByEid.set(officer.eid, officerProfile);
      App.officersList.push(officerProfile);

      officer.postings.forEach(p => {
        if (!officePostingsMap.has(p.officeId)) {
          officePostingsMap.set(p.officeId, {
            id: p.officeId,
            name: p.officeName,
            station: p.station,
            zone: p.zone,
            zoneId: p.zoneId,
            category: p.category,
            postings: []
          });
        }
        officePostingsMap.get(p.officeId).postings.push(p);
      });
    });

    officePostingsMap.forEach((office) => {
      office.postings.sort((a, b) => {
        if (a.fromDateTime && b.fromDateTime) return b.fromDateTime.getTime() - a.fromDateTime.getTime();
        return 0;
      });

      const uniqueOfficers = new Set(office.postings.map(p => p.eid));
      const activeStaff = office.postings.filter(p => p.isLatest);

      const originsMap = new Map();
      const destinationsMap = new Map();

      office.postings.forEach(p => {
        if (p.prevStation && p.prevStation !== 'Entry' && p.prevStation !== p.station) {
          originsMap.set(p.prevStation, (originsMap.get(p.prevStation) || 0) + 1);
        }
        if (p.nextStation && p.nextStation !== '— (Active)' && p.nextStation !== p.station) {
          destinationsMap.set(p.nextStation, (destinationsMap.get(p.nextStation) || 0) + 1);
        }
      });

      const topOrigins = Array.from(originsMap.entries())
        .map(([stn, count]) => ({ station: stn, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topDestinations = Array.from(destinationsMap.entries())
        .map(([stn, count]) => ({ station: stn, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const tenures = office.postings.map(p => p.periodYears).filter(t => t > 0);
      tenures.sort((a, b) => a - b);
      const medianTenure = tenures.length > 0 ? tenures[Math.floor(tenures.length / 2)] : 0;
      const avgTenure = tenures.length > 0 ? (tenures.reduce((a, b) => a + b, 0) / tenures.length) : 0;

      const cadreMix = { 'ACC': 0, 'RPFC-I': 0, 'RPFC-II': 0, 'APFC': 0 };
      activeStaff.forEach(p => {
        if (cadreMix[p.designation] !== undefined) cadreMix[p.designation]++;
        else cadreMix['APFC']++;
      });

      let under1 = 0, between1and3 = 0, over3 = 0;
      activeStaff.forEach(p => {
        if (p.periodYears < 1.0) under1++;
        else if (p.periodYears <= 3.0) between1and3++;
        else over3++;
      });

      const leadershipTimeline = office.postings
        .filter(p => ['RPFC-I', 'RPFC-II', 'ACC', 'ACC (HQ)'].includes(p.designation))
        .slice(0, 10);

      let hoExposed = 0;
      let multiZoneExposed = 0;
      uniqueOfficers.forEach(eid => {
        const offProfile = App.officersByEid.get(eid);
        if (offProfile) {
          if (offProfile.postings.some(p => p.category === 'Head Office' || p.category === 'Special Wing')) hoExposed++;
          if (offProfile.zonesCount >= 2) multiZoneExposed++;
        }
      });

      const officeProfile = {
        id: office.id,
        name: office.name,
        station: office.station,
        zone: office.zone,
        zoneId: office.zoneId,
        category: office.category,
        totalOfficersCount: uniqueOfficers.size,
        activeStaffCount: activeStaff.length,
        activeStaff: activeStaff,
        cadreMix: cadreMix,
        medianTenure: parseFloat(medianTenure.toFixed(1)),
        avgTenure: parseFloat(avgTenure.toFixed(1)),
        transfersInCount: office.postings.length,
        transfersOutCount: office.postings.filter(p => p.nextOffice && p.nextOffice !== '— (Active)').length,
        topOrigins: topOrigins,
        topDestinations: topDestinations,
        tenureDistribution: { under1, between1and3, over3, total: activeStaff.length || 1 },
        leadershipTimeline: leadershipTimeline,
        hoExposurePercent: uniqueOfficers.size > 0 ? Math.round((hoExposed / uniqueOfficers.size) * 100) : 0,
        multiZonePercent: uniqueOfficers.size > 0 ? Math.round((multiZoneExposed / uniqueOfficers.size) * 100) : 0,
        postings: office.postings
      };

      App.officesById.set(office.id, officeProfile);
      App.officesList.push(officeProfile);

      if (!zoneMap.has(office.zone)) {
        zoneMap.set(office.zone, {
          id: office.zoneId,
          name: office.zone,
          offices: [],
          totalPostings: 0,
          uniqueOfficers: new Set()
        });
      }
      const zObj = zoneMap.get(office.zone);
      zObj.offices.push(officeProfile);
      zObj.totalPostings += office.postings.length;
      office.postings.forEach(p => zObj.uniqueOfficers.add(p.eid));
    });

    zoneMap.forEach((z) => {
      const zoneProfile = {
        id: z.id,
        name: z.name,
        officesCount: z.offices.length,
        offices: z.offices,
        totalPostingsCount: z.totalPostings,
        officersCount: z.uniqueOfficers.size
      };
      App.zonesById.set(z.id, zoneProfile);
      App.zonesList.push(zoneProfile);
    });

    App.officersList.sort((a, b) => a.name.localeCompare(b.name));
    App.officesList.sort((a, b) => b.totalOfficersCount - a.totalOfficersCount);
    App.zonesList.sort((a, b) => b.officersCount - a.officersCount);
  }

  // Multi-Page & Route Detection
  function detectPageModeAndRoute() {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash || '';
    const params = new URLSearchParams(window.location.search);

    // Check specific HTML page filenames
    if (pathname.includes('office-profile')) {
      const officeId = params.get('id') || params.get('office') || (hash.startsWith('#office/') ? hash.substring(8) : null) || 'ro-jaipur';
      showOfficeProfile(officeId);
      return;
    }

    if (pathname.includes('officer-profile')) {
      const eid = params.get('eid') || params.get('officer') || (hash.startsWith('#officer/') ? hash.substring(9) : null) || (App.officersList[0] ? App.officersList[0].eid : null);
      showOfficerProfile(eid);
      return;
    }

    if (pathname.includes('zone-profile')) {
      const zid = params.get('id') || params.get('zone') || (hash.startsWith('#zone/') ? hash.substring(6) : null) || 'zo-rajasthan';
      showZoneProfile(zid);
      return;
    }

    if (pathname.includes('as-on-date')) {
      showAsOnDateView();
      return;
    }

    if (pathname.includes('mobility')) {
      showMobilityNetworkView();
      return;
    }

    // Default: index.html (supports hash routes or URL query params)
    if (params.get('officer') || params.get('eid')) {
      showOfficerProfile(params.get('officer') || params.get('eid'));
    } else if (params.get('office') || params.get('id')) {
      showOfficeProfile(params.get('office') || params.get('id'));
    } else if (params.get('zone') || params.get('zid')) {
      showZoneProfile(params.get('zone') || params.get('zid'));
    } else if (hash.startsWith('#office')) {
      const id = hash.startsWith('#office/') ? hash.substring('#office/'.length) : (App.currentOfficeId || 'ro-jaipur');
      showOfficeProfile(id);
    } else if (hash.startsWith('#zone')) {
      const zid = hash.startsWith('#zone/') ? hash.substring('#zone/'.length) : (App.currentZoneId || 'zo-rajasthan');
      showZoneProfile(zid);
    } else if (hash.startsWith('#as-on-date')) {
      showAsOnDateView();
    } else if (hash.startsWith('#mobility')) {
      showMobilityNetworkView();
    } else {
      const eid = hash.startsWith('#officer/') ? hash.substring('#officer/'.length) : (App.currentOfficerEid || (App.officersList[0] ? App.officersList[0].eid : null));
      showOfficerProfile(eid);
    }
  }

  // View Switchers
  function showOfficerProfile(eid) {
    if (!App.officersByEid.has(eid)) {
      const found = App.officersList.find(o => o.eid === eid || o.name.toLowerCase().includes((eid || '').toLowerCase()));
      eid = found ? found.eid : (App.officersList[0] ? App.officersList[0].eid : null);
    }
    App.currentOfficerEid = eid;
    updateNavActive('officer');
    renderOfficerProfile(eid);
  }

  function showOfficeProfile(officeId) {
    if (!App.officesById.has(officeId)) {
      const found = App.officesList.find(o => o.id === officeId || o.station.toLowerCase() === (officeId || '').toLowerCase() || o.name.toLowerCase().includes((officeId || '').toLowerCase()));
      officeId = found ? found.id : (App.officesList[0] ? App.officesList[0].id : 'ro-jaipur');
    }
    App.currentOfficeId = officeId;
    updateNavActive('office');
    renderOfficeProfile(officeId);
  }

  function showZoneProfile(zoneId) {
    if (!App.zonesById.has(zoneId)) {
      const found = App.zonesList.find(z => z.id === zoneId || z.name.toLowerCase().includes((zoneId || '').toLowerCase()));
      zoneId = found ? found.id : (App.zonesList[0] ? App.zonesList[0].id : 'zo-rajasthan');
    }
    App.currentZoneId = zoneId;
    updateNavActive('zone');
    renderZoneProfile(zoneId);
  }

  function showAsOnDateView() {
    updateNavActive('as-on-date');
    renderAsOnDateSnapshot();
  }

  function showMobilityNetworkView() {
    updateNavActive('mobility');
    renderMobilityNetwork();
  }

  function updateNavActive(viewName) {
    document.querySelectorAll('.nav a, .nav button').forEach(el => {
      const target = el.getAttribute('data-view');
      if (target === viewName) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  // Helper to construct cross-page links
  function getOfficerLink(eid) {
    return `officer-profile.html?eid=${encodeURIComponent(eid)}`;
  }

  function getOfficeLink(officeId) {
    return `office-profile.html?id=${encodeURIComponent(officeId)}`;
  }

  function getZoneLink(zoneId) {
    return `zone-profile.html?id=${encodeURIComponent(zoneId)}`;
  }

  // ==========================================
  // RENDER: Officer 360° Profile
  // ==========================================
  function renderOfficerProfile(eid) {
    const o = App.officersByEid.get(eid);
    if (!o) return;

    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <a href="officer-profile.html?eid=${o.eid}">Officer 360°</a> / <b>${o.name}</b>`;
    }

    const initials = o.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'OF';

    let stnBadgeClass = 'good';
    if (o.currentStationTenure >= 5.0) stnBadgeClass = 'danger';
    else if (o.currentStationTenure >= 3.0) stnBadgeClass = 'warn';

    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div class="profile">
            <div class="avatar">${initials}</div>
            <div>
              <div class="eyebrow">Officer 360° Dossier</div>
              <h1>${o.name}</h1>
              <div class="sub">${o.currentDesignation} · <a href="${getOfficeLink(o.currentOfficeId)}" class="entity-link">${o.currentOffice}</a> · ${o.currentZone}</div>
              <div class="hero-badges">
                <span class="badge" style="font-family:monospace;font-size:12px;letter-spacing:0.02em" title="Officer EID">EID: ${o.eid}</span>
                <span class="badge good">Tracked Service: ${o.totalServiceYears} Years</span>
                <span class="badge">Station: ${o.currentStation}</span>
                <span class="badge ${stnBadgeClass}">Station tenure: ${o.currentStationTenure}y</span>
                <span class="badge">DOB: ${o.dob}</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="btn" onclick="window.App.exportOfficerJson('${o.eid}')"><i class="dot"></i> Export JSON</button>
            <button class="btn" onclick="window.App.exportOfficerCsv('${o.eid}')">Export CSV</button>
            <button class="btn" onclick="window.print()">Print Dossier</button>
            <button class="btn primary" onclick="window.App.showRawPostingsModal('${o.eid}')">Raw Postings</button>
          </div>
        </div>
      </section>

      <!-- KPI Metrics (4 Cards) -->
      <section class="metrics">
        <div class="card metric">
          <small>Distinct Offices</small>
          <b>${o.distinctOfficesCount}</b>
          <span>Across ${o.distinctStationsCount} stations</span>
        </div>
        <div class="card metric">
          <small>Zones Served</small>
          <b>${o.zonesCount}</b>
          <span>Includes Head Office / Field</span>
        </div>
        <div class="card metric">
          <small>Transfers</small>
          <b>${o.transfersCount}</b>
          <span>${o.promotionsCount} linked to promotion</span>
        </div>
        <div class="card metric">
          <small>Avg Station Tenure</small>
          <b>${o.avgStationTenure}y</b>
          <span>Across entire career</span>
        </div>
      </section>

      <!-- Grid 2: Career Timeline & Zone Exposure -->
      <div class="grid2">
        <section class="card">
          <div class="title">
            <h2>Career Timeline</h2>
            <span>${o.postings.length} chronological postings</span>
          </div>
          <div class="timeline">
            ${o.postings.slice().reverse().map(p => `
              <div class="event ${p.isLatest ? 'current' : ''}">
                <small>${p.fromDate} — ${p.toDate} (${p.periodYears}y)</small>
                <b>${p.designation} · <a href="${getOfficeLink(p.officeId)}" class="entity-link">${p.officeName}</a></b>
                <p>${p.station} · ${p.zone} · <span class="pill ${p.event.includes('Promotion') ? 'green' : 'blue'}">${p.event}</span></p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Zone Exposure</h2>
            <span>Career time per zone</span>
          </div>
          ${o.zoneExposure.map(z => `
            <div class="prow">
              <div class="phead">
                <b>${z.zone}</b>
                <span>${z.years}y · ${z.percent}%</span>
              </div>
              <div class="progress"><i style="width:${Math.max(5, z.percent)}%"></i></div>
            </div>
          `).join('')}

          <div class="title" style="margin-top:24px">
            <h2>Experience Mix</h2>
            <span>By organisation tier</span>
          </div>
          <div class="list">
            <div class="item">
              <div>
                <b>Regional Office</b>
                <p>Field administration exposure</p>
              </div>
              <strong>${(o.experienceMix['Regional Office'] || 0).toFixed(1)}y</strong>
            </div>
            <div class="item">
              <div>
                <b>Head Office</b>
                <p>Policy / central administration</p>
              </div>
              <strong>${(o.experienceMix['Head Office'] || 0).toFixed(1)}y</strong>
            </div>
            <div class="item">
              <div>
                <b>Training Institute / NATRSS</b>
                <p>Capacity building / academics</p>
              </div>
              <strong>${(o.experienceMix['Training Institute'] || 0).toFixed(1)}y</strong>
            </div>
          </div>
        </section>
      </div>

      <!-- Grid 3: Current Tenures, Grade Progression, Mobility -->
      <div class="grid3">
        <section class="card">
          <div class="title">
            <h2>Current Tenure Status</h2>
            <span>Continuous durations</span>
          </div>
          <div class="list">
            <div class="item">
              <div>
                <b>Office Tenure</b>
                <p>${o.currentOffice}</p>
              </div>
              <strong>${o.currentOfficeTenure}y</strong>
            </div>
            <div class="item">
              <div>
                <b>Station Tenure</b>
                <p>${o.currentStation} (All postings)</p>
              </div>
              <span class="pill ${stnBadgeClass}">${o.currentStationTenure}y</span>
            </div>
            <div class="item">
              <div>
                <b>Zone Tenure</b>
                <p>${o.currentZone}</p>
              </div>
              <strong>${o.currentZoneTenure}y</strong>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Career Progression</h2>
            <span>Grade & Cadre history</span>
          </div>
          <div class="list">
            ${o.gradeProgression.map(g => `
              <div class="item">
                <div>
                  <b>${g.grade}</b>
                  <p>Cadre tenure</p>
                </div>
                <span class="pill blue">${g.years}y</span>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Movement Summary</h2>
            <span>Mobility metrics</span>
          </div>
          <div class="list">
            <div class="item">
              <div>
                <b>Inter-zone Moves</b>
                <p>Between distinct zones</p>
              </div>
              <strong>${o.interZoneMoves}</strong>
            </div>
            <div class="item">
              <div>
                <b>Intra-zone Moves</b>
                <p>Within same zone</p>
              </div>
              <strong>${o.intraZoneMoves}</strong>
            </div>
            <div class="item">
              <div>
                <b>Repeat Stations</b>
                <p>Stations served more than once</p>
              </div>
              <strong>${o.repeatStations}</strong>
            </div>
          </div>
        </section>
      </div>

      <!-- Detailed Posting History Table -->
      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>Detailed Posting History</h2>
              <span>Full chronological posting record</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Designation</th>
                  <th>Office</th>
                  <th>Station</th>
                  <th>Zone</th>
                  <th>Event</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                ${o.postings.slice().reverse().map(p => `
                  <tr>
                    <td><b>${p.fromDate}</b></td>
                    <td>${p.toDate}</td>
                    <td><b>${p.designation}</b></td>
                    <td><a href="${getOfficeLink(p.officeId)}" class="entity-link">${p.officeName}</a></td>
                    <td>${p.station}</td>
                    <td>${p.zone}</td>
                    <td><span class="pill ${p.event.includes('Promotion') ? 'green' : 'blue'}">${p.event}</span></td>
                    <td><b>${p.periodYears}y</b></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="notice">
        <b>Design Principle:</b> Officer 360° is descriptive and informational. Any AGT-policy threshold (e.g. 3-year station tenure cooling-off) is displayed as an analytical marker, never as an automated transfer decision.
      </div>
    `;
  }

  // ==========================================
  // RENDER: Office 360° Profile
  // ==========================================
  function renderOfficeProfile(officeId) {
    const off = App.officesById.get(officeId);
    if (!off) return;

    const pfDetails = App.pfContacts.offices.find(p => p.id === off.id) || {};

    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <a href="office-profile.html?id=${off.id}">Office 360°</a> / <b>${off.name}</b>`;
    }

    let avatarClass = 'office-ro';
    if (off.category === 'Zonal Office') avatarClass = 'office-zo';
    else if (off.category === 'Head Office') avatarClass = 'office-ho';
    else if (off.category === 'Training Institute') avatarClass = 'office-ti';
    else if (off.category === 'District Office') avatarClass = 'office-do';

    const avatarLetters = off.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div class="profile">
            <div class="avatar ${avatarClass}">${avatarLetters}</div>
            <div>
              <div class="eyebrow">Office 360° Dossier</div>
              <h1>${off.name}</h1>
              <div class="sub">${off.category} · <a href="${getZoneLink(off.zoneId)}" class="entity-link">${off.zone}</a> · ${off.station}</div>
              <div class="hero-badges">
                <span class="badge" style="font-family:monospace;font-size:12px">ID: ${off.id}</span>
                <span class="badge good">${off.activeStaffCount} Active Tracked Staff</span>
                <span class="badge">${off.postings.length} Historical Postings</span>
                ${pfDetails.official_count ? `<span class="badge">pf-contacts: ${pfDetails.official_count} Officials</span>` : ''}
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="btn" onclick="window.App.exportOfficeCsv('${off.id}')">Export Staffing CSV</button>
            <button class="btn" onclick="window.print()">Print Profile</button>
            <a href="as-on-date.html" class="btn primary">As-on-date Staffing</a>
          </div>
        </div>
      </section>

      <!-- KPI Metrics (4 Cards) -->
      <section class="metrics">
        <div class="card metric">
          <small>Officers in History</small>
          <b>${off.totalOfficersCount}</b>
          <span>Across tracked cadres</span>
        </div>
        <div class="card metric">
          <small>Median Posting Tenure</small>
          <b>${off.medianTenure}y</b>
          <span>Average ${off.avgTenure} years</span>
        </div>
        <div class="card metric">
          <small>Transfers In (Inflow)</small>
          <b>${off.transfersInCount}</b>
          <span>From ${off.topOrigins.length} key origins</span>
        </div>
        <div class="card metric">
          <small>Transfers Out (Outflow)</small>
          <b>${off.transfersOutCount}</b>
          <span>To ${off.topDestinations.length} destinations</span>
        </div>
      </section>

      <!-- Grid 2: Active Cadre Mix & Leadership Timeline -->
      <div class="grid2">
        <section class="card">
          <div class="title">
            <h2>Current Tracked Cadre Mix</h2>
            <span>${off.activeStaffCount} active officers</span>
          </div>
          <div class="list">
            <div class="item">
              <div>
                <b>ACC / Senior Leadership</b>
                <p>Apex and SAG level</p>
              </div>
              <strong>${off.cadreMix['ACC'] || 0}</strong>
            </div>
            <div class="item">
              <div>
                <b>RPFC-I</b>
                <p>Officer-in-Charge / Senior Commissioner</p>
              </div>
              <strong>${off.cadreMix['RPFC-I'] || 0}</strong>
            </div>
            <div class="item">
              <div>
                <b>RPFC-II</b>
                <p>Commissioner Cadre</p>
              </div>
              <strong>${off.cadreMix['RPFC-II'] || 0}</strong>
            </div>
            <div class="item">
              <div>
                <b>APFC</b>
                <p>Assistant Commissioner Cadre</p>
              </div>
              <strong>${off.cadreMix['APFC'] || 0}</strong>
            </div>
          </div>

          <div class="title" style="margin-top:24px">
            <h2>Current Tenure Distribution</h2>
            <span>Tracked active staff</span>
          </div>
          <div class="prow">
            <div class="phead">
              <b>&lt; 1 year</b>
              <span>${off.tenureDistribution.under1} officer(s)</span>
            </div>
            <div class="progress"><i style="width:${Math.round((off.tenureDistribution.under1 / off.tenureDistribution.total) * 100)}%"></i></div>
          </div>
          <div class="prow">
            <div class="phead">
              <b>1 — 3 years</b>
              <span>${off.tenureDistribution.between1and3} officer(s)</span>
            </div>
            <div class="progress"><i style="width:${Math.round((off.tenureDistribution.between1and3 / off.tenureDistribution.total) * 100)}%"></i></div>
          </div>
          <div class="prow">
            <div class="phead">
              <b>&gt; 3 years (Cooling-off threshold)</b>
              <span>${off.tenureDistribution.over3} officer(s)</span>
            </div>
            <div class="progress"><i style="width:${Math.round((off.tenureDistribution.over3 / off.tenureDistribution.total) * 100)}%; background:var(--warn)"></i></div>
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Leadership History</h2>
            <span>Officers posted at this office</span>
          </div>
          <div class="timeline">
            ${off.leadershipTimeline.map(p => `
              <div class="event ${p.isLatest ? 'current' : ''}">
                <small>${p.fromDate} — ${p.toDate} (${p.periodYears}y)</small>
                <b><a href="${getOfficerLink(p.eid)}" class="entity-link">${p.officerName}</a> · ${p.designation}</b>
                <p>From: ${p.prevStation} · To: ${p.nextStation} · <span class="pill blue">${p.event}</span></p>
              </div>
            `).join('')}
          </div>
        </section>
      </div>

      <!-- Grid 3: Incoming Origins, Outgoing Destinations, Experience Mix -->
      <div class="grid3">
        <section class="card">
          <div class="title">
            <h2>Incoming Origins</h2>
            <span>Top previous stations</span>
          </div>
          <div class="list">
            ${off.topOrigins.length > 0 ? off.topOrigins.map(o => `
              <div class="item">
                <div>
                  <b>${o.station}</b>
                  <p>Inbound transfers</p>
                </div>
                <strong>${o.count}</strong>
              </div>
            `).join('') : '<p style="color:var(--muted);font-size:12px">No inbound transfer data</p>'}
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Outgoing Destinations</h2>
            <span>Top next stations</span>
          </div>
          <div class="list">
            ${off.topDestinations.length > 0 ? off.topDestinations.map(d => `
              <div class="item">
                <div>
                  <b>${d.station}</b>
                  <p>Outbound moves</p>
                </div>
                <strong>${d.count}</strong>
              </div>
            `).join('') : '<p style="color:var(--muted);font-size:12px">No outbound transfer data</p>'}
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Staff Experience Mix</h2>
            <span>Historical officer pool</span>
          </div>
          <div class="list">
            <div class="item">
              <div>
                <b>Prior HO Exposure</b>
                <p>Served in Head Office / PDUNASS</p>
              </div>
              <span class="pill green">${off.hoExposurePercent}%</span>
            </div>
            <div class="item">
              <div>
                <b>Multi-zone Exposure</b>
                <p>Served in 2+ Zones</p>
              </div>
              <span class="pill blue">${off.multiZonePercent}%</span>
            </div>
            <div class="item">
              <div>
                <b>pf-contacts Linked</b>
                <p>Verified API Office ID</p>
              </div>
              <span class="pill green">High</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Full Historical Staffing Table -->
      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>Who Was Posted Here, and When?</h2>
              <span>All recorded officer postings at ${off.name}</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Designation</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Tenure</th>
                  <th>Previous Station</th>
                  <th>Next Station</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                ${off.postings.map(p => `
                  <tr>
                    <td><b><a href="${getOfficerLink(p.eid)}" class="entity-link">${p.officerName}</a></b></td>
                    <td><b>${p.designation}</b></td>
                    <td>${p.fromDate}</td>
                    <td>${p.toDate}</td>
                    <td><b>${p.periodYears}y</b></td>
                    <td>${p.prevStation}</td>
                    <td>${p.nextStation}</td>
                    <td><span class="pill ${p.event.includes('Promotion') ? 'green' : 'blue'}">${p.event}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="notice">
        <b>Design Principle:</b> Office 360° reverses the officer career trajectory to provide an institutional memory view: who served here, when, for how long, where they came from, and where they went next.
      </div>
    `;
  }

  // ==========================================
  // RENDER: Zone 360° Rollup
  // ==========================================
  function renderZoneProfile(zoneId) {
    const z = App.zonesById.get(zoneId) || App.zonesList[0];
    if (!z) return;

    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <a href="zone-profile.html?id=${z.id}">Zone 360°</a> / <b>${z.name}</b>`;
    }

    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div class="profile">
            <div class="avatar office-zo">ZO</div>
            <div>
              <div class="eyebrow">Zonal Overview</div>
              <h1>${z.name}</h1>
              <div class="sub">Zonal Jurisdictional Rollup · ${z.officesCount} Regional & Field Offices</div>
              <div class="hero-badges">
                <span class="badge good">${z.officesCount} Offices Tracked</span>
                <span class="badge">${z.officersCount} Officers in History</span>
                <span class="badge">${z.totalPostingsCount} Total Postings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Offices under this zone -->
      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>Offices in ${z.name}</h2>
              <span>Click any office to view its 360° profile</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Office Name</th>
                  <th>Category</th>
                  <th>Station</th>
                  <th>Active Staff</th>
                  <th>Total Historical Officers</th>
                  <th>Median Tenure</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${z.offices.map(o => `
                  <tr>
                    <td><b><a href="${getOfficeLink(o.id)}" class="entity-link">${o.name}</a></b></td>
                    <td><span class="pill blue">${o.category}</span></td>
                    <td>${o.station}</td>
                    <td><b>${o.activeStaffCount}</b></td>
                    <td>${o.totalOfficersCount}</td>
                    <td>${o.medianTenure}y</td>
                    <td><a href="${getOfficeLink(o.id)}" class="btn sm">View 360°</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- All Zones Directory -->
      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>All EPFO Zones (21 Zones + Head Office)</h2>
              <span>National jurisdictional overview</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Zone Name</th>
                  <th>Tracked Offices</th>
                  <th>Total Officers</th>
                  <th>Historical Postings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${App.zonesList.map(zone => `
                  <tr>
                    <td><b><a href="${getZoneLink(zone.id)}" class="entity-link">${zone.name}</a></b></td>
                    <td>${zone.officesCount}</td>
                    <td>${zone.officersCount}</td>
                    <td>${zone.totalPostingsCount}</td>
                    <td><a href="${getZoneLink(zone.id)}" class="btn sm">Explore Zone</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================
  // RENDER: As-On-Date Staffing Simulator
  // ==========================================
  function renderAsOnDateSnapshot() {
    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <b>As-on-date Staffing Snapshot</b>`;
    }

    const container = document.getElementById('mainContent');
    if (!container) return;

    const queryDateStr = App.asOnDateValue;
    const qDate = parseDate(queryDateStr.split('-').reverse().join('/')) || new Date(2023, 0, 1);

    const activeOnDate = [];
    App.rawData.forEach(record => {
      const d1 = parseDate(record.date1);
      const d2 = parseDate(record.date2);
      if (d1 && d1 <= qDate) {
        if (!d2 || d2 >= qDate) {
          const offMeta = resolveOffice(record.col4);
          const desig = normalizeDesignation(record.col2, record.new_col4, 'APFC');
          const offName = record.name_office.replace(/\s+Office$/, '').trim();
          const tenureOnDate = Math.max(0, ((qDate.getTime() - d1.getTime()) / (365.25 * 24 * 3600 * 1000))).toFixed(1);

          activeOnDate.push({
            eid: record.eid,
            officerName: offName,
            designation: desig,
            officeId: offMeta.id,
            officeName: offMeta.name,
            station: offMeta.station,
            zone: offMeta.zone,
            joinedDate: record.date1,
            tenureOnDate: tenureOnDate
          });
        }
      }
    });

    activeOnDate.sort((a, b) => a.officeName.localeCompare(b.officeName));

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div>
            <div class="eyebrow">Time Machine & Staffing Simulator</div>
            <h1>As-on-date Office Staffing Snapshot</h1>
            <div class="sub">Query exact officer deployments across all EPFO offices on any historical date</div>
          </div>
        </div>
      </section>

      <div class="as-on-date-bar">
        <label for="asOnDateInput">Select As-On Date:</label>
        <input type="date" id="asOnDateInput" value="${App.asOnDateValue}" onchange="window.App.setAsOnDate(this.value)">
        <button class="btn sm" onclick="window.App.setAsOnDate('2023-01-01')">01 Jan 2023</button>
        <button class="btn sm" onclick="window.App.setAsOnDate('2020-01-01')">01 Jan 2020</button>
        <button class="btn sm" onclick="window.App.setAsOnDate('2015-01-01')">01 Jan 2015</button>
        <span class="badge good" style="margin-left:auto">${activeOnDate.length} Active Deployments</span>
      </div>

      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>Deployments on ${queryDateStr}</h2>
              <span>Showing ${activeOnDate.length} officers stationed across offices</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Office</th>
                  <th>Station</th>
                  <th>Zone</th>
                  <th>Officer Name</th>
                  <th>Designation</th>
                  <th>Posted Since</th>
                  <th>Tenure on Date</th>
                </tr>
              </thead>
              <tbody>
                ${activeOnDate.map(d => `
                  <tr>
                    <td><b><a href="${getOfficeLink(d.officeId)}" class="entity-link">${d.officeName}</a></b></td>
                    <td>${d.station}</td>
                    <td>${d.zone}</td>
                    <td><b><a href="${getOfficerLink(d.eid)}" class="entity-link">${d.officerName}</a></b></td>
                    <td><b>${d.designation}</b></td>
                    <td>${d.joinedDate}</td>
                    <td><span class="pill blue">${d.tenureOnDate}y</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================
  // RENDER: Mobility Network View
  // ==========================================
  function renderMobilityNetwork() {
    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <b>Mobility Network Analysis</b>`;
    }

    const container = document.getElementById('mainContent');
    if (!container) return;

    const flowMap = new Map();
    App.officersList.forEach(officer => {
      for (let i = 1; i < officer.postings.length; i++) {
        const fromStn = officer.postings[i - 1].station;
        const toStn = officer.postings[i].station;
        if (fromStn && toStn && fromStn !== toStn) {
          const key = `${fromStn} ➔ ${toStn}`;
          flowMap.set(key, (flowMap.get(key) || 0) + 1);
        }
      }
    });

    const topFlows = Array.from(flowMap.entries())
      .map(([corridor, count]) => ({ corridor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div>
            <div class="eyebrow">Cadre Mobility Analytics</div>
            <h1>Inter-Station Transfer Network</h1>
            <div class="sub">High-frequency movement corridors between EPFO stations</div>
          </div>
        </div>
      </section>

      <section class="table-section">
        <div class="card">
          <div class="table-head">
            <div class="title" style="margin-bottom:0">
              <h2>Top 25 Transfer Corridors</h2>
              <span>Origin to Destination frequency in AGT history</span>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Transfer Corridor (From ➔ To)</th>
                  <th>Frequency (Transfers)</th>
                  <th>Corridor Intensity</th>
                </tr>
              </thead>
              <tbody>
                ${topFlows.map((f, idx) => `
                  <tr>
                    <td><b>#${idx + 1}</b></td>
                    <td><b>${f.corridor}</b></td>
                    <td><b>${f.count} transfers</b></td>
                    <td>
                      <div class="progress" style="width:200px">
                        <i style="width:${Math.min(100, f.count * 4)}%"></i>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================
  // Search & Omnibox
  // ==========================================
  function setupEventListeners() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    if (searchInput && searchDropdown) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
          searchDropdown.innerHTML = '';
          searchDropdown.classList.remove('open');
          return;
        }

        const matchedOfficers = App.officersList.filter(o =>
          o.name.toLowerCase().includes(query) ||
          o.eid.toLowerCase().includes(query) ||
          o.currentOffice.toLowerCase().includes(query) ||
          o.currentStation.toLowerCase().includes(query) ||
          o.postings.some(p => p.station.toLowerCase().includes(query) || p.officeName.toLowerCase().includes(query))
        ).slice(0, 6);

        const matchedOffices = App.officesList.filter(off =>
          off.name.toLowerCase().includes(query) ||
          off.station.toLowerCase().includes(query) ||
          off.zone.toLowerCase().includes(query)
        ).slice(0, 6);

        if (matchedOfficers.length === 0 && matchedOffices.length === 0) {
          searchDropdown.innerHTML = '<div style="padding:14px;color:var(--muted);font-size:12px;text-align:center">No officers or offices matching query</div>';
          searchDropdown.classList.add('open');
          return;
        }

        let html = '';
        if (matchedOfficers.length > 0) {
          html += '<div class="search-group-title">👤 Officers</div>';
          matchedOfficers.forEach(o => {
            html += `
              <div class="search-item" onclick="window.App.selectOfficerFromSearch('${o.eid}')">
                <div class="search-item-info">
                  <span class="search-item-title">${o.name}</span>
                  <span class="search-item-sub">${o.currentDesignation} · ${o.currentOffice} · ${o.currentZone}</span>
                </div>
                <span class="badge">${o.currentStationTenure}y stn</span>
              </div>
            `;
          });
        }

        if (matchedOffices.length > 0) {
          html += '<div class="search-group-title">🏢 Offices & Stations</div>';
          matchedOffices.forEach(off => {
            html += `
              <div class="search-item" onclick="window.App.selectOfficeFromSearch('${off.id}')">
                <div class="search-item-info">
                  <span class="search-item-title">${off.name}</span>
                  <span class="search-item-sub">${off.category} · ${off.station} · ${off.zone}</span>
                </div>
                <span class="badge good">${off.activeStaffCount} staff</span>
              </div>
            `;
          });
        }

        searchDropdown.innerHTML = html;
        searchDropdown.classList.add('open');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box-wrapper')) {
          searchDropdown.classList.remove('open');
        }
      });
    }
  }

  // ==========================================
  // Public Exports & Navigation Actions
  // ==========================================
  window.App = {
    init,
    showOfficer: (eid) => {
      if (window.location.pathname.includes('officer-profile.html')) {
        showOfficerProfile(eid);
        history.replaceState(null, '', `officer-profile.html?eid=${encodeURIComponent(eid)}`);
      } else {
        window.location.href = `officer-profile.html?eid=${encodeURIComponent(eid)}`;
      }
    },
    showOffice: (id) => {
      if (window.location.pathname.includes('office-profile.html')) {
        showOfficeProfile(id);
        history.replaceState(null, '', `office-profile.html?id=${encodeURIComponent(id)}`);
      } else {
        window.location.href = `office-profile.html?id=${encodeURIComponent(id)}`;
      }
    },
    showZone: (zid) => {
      if (window.location.pathname.includes('zone-profile.html')) {
        showZoneProfile(zid);
        history.replaceState(null, '', `zone-profile.html?id=${encodeURIComponent(zid)}`);
      } else {
        window.location.href = `zone-profile.html?id=${encodeURIComponent(zid)}`;
      }
    },
    selectOfficerFromSearch: (eid) => {
      document.getElementById('searchDropdown').classList.remove('open');
      document.getElementById('globalSearchInput').value = '';
      window.App.showOfficer(eid);
    },
    selectOfficeFromSearch: (id) => {
      document.getElementById('searchDropdown').classList.remove('open');
      document.getElementById('globalSearchInput').value = '';
      window.App.showOffice(id);
    },
    setAsOnDate: (val) => {
      App.asOnDateValue = val;
      renderAsOnDateSnapshot();
    },
    exportOfficerJson: (eid) => {
      const o = App.officersByEid.get(eid);
      if (!o) return;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(o, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `officer_360_${o.eid}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    exportOfficerCsv: (eid) => {
      const o = App.officersByEid.get(eid);
      if (!o) return;
      let csv = 'From,To,Designation,Office,Station,Zone,Event,PeriodYears\n';
      o.postings.forEach(p => {
        csv += `"${p.fromDate}","${p.toDate}","${p.designation}","${p.officeName}","${p.station}","${p.zone}","${p.event}",${p.periodYears}\n`;
      });
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `officer_postings_${o.eid}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    exportOfficeCsv: (officeId) => {
      const off = App.officesById.get(officeId);
      if (!off) return;
      let csv = 'OfficerName,EID,Designation,From,To,TenureYears,PreviousStation,NextStation,Event\n';
      off.postings.forEach(p => {
        csv += `"${p.officerName}","${p.eid}","${p.designation}","${p.fromDate}","${p.toDate}",${p.periodYears},"${p.prevStation}","${p.nextStation}","${p.event}"\n`;
      });
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `office_staffing_${off.id}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    showRawPostingsModal: (eid) => {
      const o = App.officersByEid.get(eid);
      if (!o) return;
      const rawRecords = App.rawData.filter(r => r.eid === eid);
      const modal = document.getElementById('appModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalContent = document.getElementById('modalContent');
      if (modal && modalTitle && modalContent) {
        modalTitle.innerText = `HRM Raw Postings Data · ${o.name} (${o.eid})`;
        modalContent.innerHTML = `
          <div style="margin-bottom:12px;font-size:12px;color:var(--ink-secondary)">
            Showing <b>${rawRecords.length} raw HRM records</b> from <code>data.json</code> consolidated into <b>${o.postings.length} career postings</b>.
          </div>
          <h4 style="margin:12px 0 6px;font-size:13px">Raw HRM Sub-Records:</h4>
          <pre style="background:#f8fafc;padding:14px;border-radius:8px;font-size:11px;overflow:auto;max-height:220px;border:1px solid var(--line)">${JSON.stringify(rawRecords, null, 2)}</pre>
          <h4 style="margin:16px 0 6px;font-size:13px">Consolidated 360° Postings:</h4>
          <pre style="background:#f8fafc;padding:14px;border-radius:8px;font-size:11px;overflow:auto;max-height:220px;border:1px solid var(--line)">${JSON.stringify(o.postings, null, 2)}</pre>
        `;
        modal.classList.add('open');
      }
    },
    closeModal: () => {
      const modal = document.getElementById('appModal');
      if (modal) modal.classList.remove('open');
    }
  };

  function showErrorState(err) {
    const container = document.getElementById('mainContent');
    if (container) {
      container.innerHTML = `
        <div class="card" style="margin-top:40px;text-align:center;padding:40px">
          <h2 style="color:var(--danger)">Error Loading AGT Data</h2>
          <p style="color:var(--muted)">Unable to parse data.json: ${err.message}</p>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
