/**
 * AGT Analytics 360° - Cadre Planning & Mobility Engine
 * Multi-page & Interactive Engine for Officer 360°, Office 360°, Zone 360°, As-on-date, and Mobility Network
 * Integrates data.json with pf-contacts API & Leaflet Geographic Map + Heatmap Visualizations
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
      hierarchy: null,
      coordsMap: new Map()
    },
    activeMap: null,
    currentOfficerEid: null,
    currentOfficeId: null,
    currentZoneId: null,
    asOnDateValue: '2023-01-01',
    isLoaded: false
  };

  // Comprehensive fallback coordinates dictionary for major Indian stations
  const CITY_COORDS = {
    'Delhi': [28.6139, 77.2090],
    'Amritsar': [31.6340, 74.8723],
    'Jaipur': [26.9124, 75.7873],
    'Bengaluru': [12.9716, 77.5946],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Mumbai': [19.0760, 72.8777],
    'Kolkata': [22.5726, 88.3639],
    'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714],
    'Pune': [18.5204, 73.8567],
    'Chandigarh': [30.7333, 76.7794],
    'Patna': [25.5941, 85.1376],
    'Kanpur': [26.4499, 80.3319],
    'Lucknow': [26.8467, 80.9462],
    'Bhopal': [23.2599, 77.4126],
    'Indore': [22.7196, 75.8577],
    'Ludhiana': [30.9010, 75.8573],
    'Jalandhar': [31.3260, 75.5762],
    'Faridabad': [28.4089, 77.3178],
    'Gurugram': [28.4595, 77.0266],
    'Gurgaon': [28.4595, 77.0266],
    'Noida': [28.5355, 77.3910],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Salem': [11.6643, 78.1460],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Tirunelveli': [8.7139, 77.7567],
    'Tiruppur': [11.1085, 77.3411],
    'Vellore': [12.9165, 79.1325],
    'Puducherry': [11.9416, 79.8083],
    'Kochi': [9.9312, 76.2673],
    'Thiruvananthapuram': [8.5241, 76.9366],
    'Trivandrum': [8.5241, 76.9366],
    'Kozhikode': [11.2588, 75.7804],
    'Kannur': [11.8745, 75.3704],
    'Kollam': [8.8932, 76.6141],
    'Kottayam': [9.5916, 76.5222],
    'Bhubaneswar': [20.2961, 85.8245],
    'Rourkela': [22.2604, 84.8536],
    'Berhampur': [19.3150, 84.7941],
    'Ranchi': [23.3441, 85.3096],
    'Jamshedpur': [22.8046, 86.2029],
    'Muzaffarpur': [26.1209, 85.3647],
    'Bhagalpur': [25.2425, 86.9842],
    'Guwahati': [26.1445, 91.7362],
    'Shillong': [25.5788, 91.8933],
    'Agartala': [23.8315, 91.2868],
    'Dehradun': [30.3165, 78.0322],
    'Haldwani': [29.2183, 79.5130],
    'Shimla': [31.1048, 77.1734],
    'Jammu': [32.7266, 74.8570],
    'Srinagar': [34.0837, 74.7973],
    'Surat': [21.1702, 72.8311],
    'Vadodara': [22.3072, 73.1812],
    'Rajkot': [22.3039, 70.8022],
    'Vapi': [20.3893, 72.9106],
    'Nagpur': [21.1458, 79.0882],
    'Nashik': [19.9975, 73.7898],
    'Thane': [19.2183, 72.9781],
    'Navi Mumbai': [19.0330, 73.0297],
    'Aurangabad': [19.8762, 75.3433],
    'Kolhapur': [16.7050, 74.2433],
    'Solapur': [17.6599, 75.9064],
    'Mangaluru': [12.9141, 74.8560],
    'Mangalore': [12.9141, 74.8560],
    'Mysore': [12.2958, 76.6394],
    'Hubli': [15.3647, 75.1240],
    'Shivamogga': [13.9299, 75.5681],
    'Kalaburagi': [17.3297, 76.8343],
    'Ballari': [15.1394, 76.9214],
    'Udupi': [13.3409, 74.7421],
    'Goa': [15.4909, 73.8278],
    'Ujjain': [23.1765, 75.7885],
    'Jodhpur': [26.2389, 73.0243],
    'Udaipur': [24.5854, 73.7125],
    'Kota': [25.2138, 75.8648],
    'Gwalior': [26.2183, 78.1828],
    'Jabalpur': [23.1815, 79.9864],
    'Raipur': [21.2514, 81.6296],
    'Agra': [27.1767, 78.0081],
    'Varanasi': [25.3176, 82.9739],
    'Meerut': [28.9845, 77.7064],
    'Prayagraj': [25.4358, 81.8463],
    'Bareilly': [28.3670, 79.4304],
    'Gorakhpur': [26.7606, 83.3732],
    'Visakhapatnam': [17.6868, 83.2185],
    'Vijayawada': [16.5062, 80.6480],
    'Guntur': [16.3067, 80.4365],
    'Kadapa': [14.4673, 78.8242],
    'Rajamahendravaram': [17.0005, 81.8040]
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
    'LEH': { id: 'ro-leh-ladakh', name: 'Regional Office Leh (Ladakh)', station: 'Leh', zone: 'Delhi & Uttarakhand Zone', zoneId: 'zo-delhi-uttarakhand-jammu-kashmir-and-ladakh', cat: 'Regional Office' },

    'GUWAHATI': { id: 'ro-guwahati', name: 'Regional Office Guwahati', station: 'Guwahati', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'Regional Office' },
    'SHILLONG': { id: 'ro-shillong', name: 'Regional Office Shillong', station: 'Shillong', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'Regional Office' },
    'AGARTALA': { id: 'ro-agartala', name: 'Regional Office Agartala', station: 'Agartala', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'Regional Office' },
    'TINSUKIA': { id: 'ro-tinsukia', name: 'Regional Office Tinsukia', station: 'Tinsukia', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'Regional Office' },
    'IMPHAL': { id: 'do-imphal', name: 'District Office Imphal', station: 'Imphal', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'District Office' },
    'DIMAPUR': { id: 'do-dimapur', name: 'District Office Dimapur', station: 'Dimapur', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'District Office' },
    'AIZAWL': { id: 'do-aizawl', name: 'District Office Aizawl', station: 'Aizawl', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'District Office' },
    'ITANAGAR': { id: 'do-itanagar', name: 'District Office Itanagar', station: 'Itanagar', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'District Office' },
    'SILCHAR': { id: 'do-silchar', name: 'District Office Silchar', station: 'Silchar', zone: 'North Eastern Region Zone', zoneId: 'zo-ner-guwahati', cat: 'District Office' }
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

    const desigPfxs = ['ACC (HQ)', 'ACC(HQ)', 'ACC-II', 'ACC-I', 'ACC', 'RPFC-II', 'RPFC-I', 'RPFC', 'APFC'];
    for (const dp of desigPfxs) {
      if (s.toUpperCase().startsWith(dp + ' ')) {
        s = s.substring(dp.length).trim();
        break;
      }
    }

    const su = s.toUpperCase();

    const matches = [];
    for (const k of SORTED_KEYS) {
      const regex = new RegExp('(?:^|[\\s,()~-])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[\\s,()~-])', 'g');
      let m;
      while ((m = regex.exec(su)) !== null) {
        matches.push({ start: m.index, end: m.index + k.length, key: k });
      }
    }

    matches.sort((a, b) => a.start - b.start);
    const filtered = [];
    for (const m of matches) {
      if (!filtered.some(f => f.start <= m.start && m.end <= f.end && (f.end - f.start) > (m.end - m.start))) {
        filtered.push(m);
      }
    }
    filtered.sort((a, b) => a.start - b.start);

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

  function normalizeDesignation(col2Str, eventStr, prevDesig, lastPromoDate, currentDate) {
    let d = (col2Str || '').trim().toUpperCase();
    if (d === 'APFC') return 'APFC';
    if (d === 'RPFC-II' || d === 'RPFC II' || d === 'RPFC-2') return 'RPFC-II';
    if (d === 'RPFC-I' || d === 'RPFC I' || d === 'RPFC-1') return 'RPFC-I';
    if (d === 'ACC (HQ)' || d === 'ACC(HQ)') return 'ACC (HQ)';
    if (d.startsWith('ACC')) return 'ACC';

    if (eventStr && eventStr.toUpperCase().includes('PROMOTION')) {
      const yearsSinceLastPromo = (lastPromoDate && currentDate) ? (currentDate.getTime() - lastPromoDate.getTime()) / (365.25 * 86400000) : 999;
      // In EPFO cadre rules, inter-grade promotion requires minimum 3-5 years residency.
      // An administrative regularization / confirmation row within 3 years of previous promotion does NOT double-promote.
      if (yearsSinceLastPromo < 3.0) {
        return prevDesig;
      }
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

  // Get geographic coordinates for an office or station
  function getCoords(officeId, stationName) {
    if (officeId && App.pfContacts.coordsMap.has(officeId)) {
      return App.pfContacts.coordsMap.get(officeId);
    }
    if (stationName && CITY_COORDS[stationName]) {
      return CITY_COORDS[stationName];
    }
    if (stationName) {
      for (const [stn, coords] of Object.entries(CITY_COORDS)) {
        if (stationName.toLowerCase().includes(stn.toLowerCase())) {
          return coords;
        }
      }
    }
    return [22.5, 78.5]; // Default center
  }

  function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function computeSpatialMetrics(postings, totalServiceYears) {
    const stationTenures = new Map();
    const zoneTenures = new Map();
    const coordsList = [];
    let maxSingleStint = 0;

    postings.forEach(p => {
      const stn = p.station || 'Unknown';
      const zn = p.zone || 'Unknown';
      const years = p.periodYears || 0;

      maxSingleStint = Math.max(maxSingleStint, years);

      if (!stationTenures.has(stn)) {
        stationTenures.set(stn, { station: stn, totalTenure: 0, maxSingle: 0, count: 0 });
      }
      const stnObj = stationTenures.get(stn);
      stnObj.totalTenure = +(stnObj.totalTenure + years).toFixed(2);
      stnObj.maxSingle = Math.max(stnObj.maxSingle, years);
      stnObj.count++;

      zoneTenures.set(zn, +( (zoneTenures.get(zn) || 0) + years ).toFixed(2));

      const c = getCoords(p.officeId, p.station);
      coordsList.push(c);
    });

    let maxDistanceKm = 0;
    for (let i = 0; i < coordsList.length; i++) {
      for (let j = i + 1; j < coordsList.length; j++) {
        const d = getHaversineDistanceKm(coordsList[i][0], coordsList[i][1], coordsList[j][0], coordsList[j][1]);
        if (d > maxDistanceKm) maxDistanceKm = d;
      }
    }

    let topStation = 'Unknown';
    let topStationTenure = 0;
    stationTenures.forEach((obj, stn) => {
      if (obj.totalTenure > topStationTenure) {
        topStationTenure = obj.totalTenure;
        topStation = stn;
      }
    });

    let topZone = 'Unknown';
    let topZoneTenure = 0;
    zoneTenures.forEach((years, zn) => {
      if (years > topZoneTenure) {
        topZoneTenure = years;
        topZone = zn;
      }
    });

    const topStationPct = totalServiceYears > 0 ? +((topStationTenure / totalServiceYears) * 100).toFixed(1) : 0;
    const topZonePct = totalServiceYears > 0 ? +((topZoneTenure / totalServiceYears) * 100).toFixed(1) : 0;

    const isSingleStintRed = maxSingleStint > 4.0;
    const isCombinedStnRed = topStationTenure > 8.0;
    const isHyperRegional = totalServiceYears >= 5.0 && maxDistanceKm < 250.0;
    const isZoneDominant = totalServiceYears >= 5.0 && topZonePct >= 80.0;
    const isStationDominant = totalServiceYears >= 5.0 && topStationPct >= 65.0;
    const isZoneTenureHigh = topZoneTenure >= 10.0;

    let stagnationTier = 'compliant-green';
    let riskColor = '#15803d';
    let riskLabel = 'Compliant Mobility';

    if (isSingleStintRed || isCombinedStnRed) {
      stagnationTier = 'critical-red';
      riskColor = '#dc2626';
      riskLabel = (isSingleStintRed && isCombinedStnRed) ? 'Single >4y & Station >8y' : (isSingleStintRed ? 'Single Stint >4y Alert' : 'Station Tenure >8y Alert');
    } else if (maxSingleStint >= 3.0 || topStationTenure >= 4.0 || isHyperRegional) {
      stagnationTier = 'warning-orange';
      riskColor = '#ea580c';
      riskLabel = isHyperRegional ? 'Hyper-Regional (<250km)' : 'Extended Tenure (3-4y)';
    }

    return {
      maxSingleStint: parseFloat(maxSingleStint.toFixed(1)),
      maxDistanceKm: Math.round(maxDistanceKm),
      topStation,
      topStationTenure: parseFloat(topStationTenure.toFixed(1)),
      topStationPct,
      topZone,
      topZoneTenure: parseFloat(topZoneTenure.toFixed(1)),
      topZonePct,
      isSingleStintRed,
      isCombinedStnRed,
      isHyperRegional,
      isZoneDominant,
      isStationDominant,
      isZoneTenureHigh,
      stagnationTier,
      riskColor,
      riskLabel
    };
  }

  const MACRO_REGION_COLORS = {
    'North': '#0284c7',
    'NCR': '#6366f1',
    'South': '#16a34a',
    'West': '#ea580c',
    'East': '#9333ea',
    'North East': '#0d9488',
    'Central': '#d97706'
  };

  function getMacroRegion(officeId, station, zone, category) {
    const s = (station || '').toLowerCase();
    const z = (zone || '').toLowerCase();
    const o = (officeId || '').toLowerCase();
    const c = (category || '').toLowerCase();

    // 1. NCR is in North: Return region as 'North' with isNcr flag = true
    const isNcr = (c === 'head office' || c === 'special wing' || o.includes('head-office') || o.includes('pdunass') || o.includes('ndc') || o.includes('vigilance') || o.includes('internal-audit') || s === 'delhi' || s === 'new delhi' || s === 'faridabad' || s === 'gurugram' || s === 'gurgaon' || s === 'noida' || s === 'greater noida' || s === 'ghaziabad');
    
    if (isNcr) {
      return { region: 'North', isNcr: true, label: 'North (NCR)' };
    }

    // 2. North East (NER - Special / Hard Area)
    if (z.includes('ner') || z.includes('north east') || z.includes('assam') || z.includes('meghalaya') || z.includes('tripura') || z.includes('nagaland') || z.includes('manipur') || z.includes('mizoram') || z.includes('arunachal') ||
        ['guwahati', 'shillong', 'agartala', 'imphal', 'dimapur', 'aizawl', 'itanagar', 'tinsukia', 'silchar', 'tezpur', 'dibrugarh', 'jorhat', 'bongaigaon'].includes(s)) {
      return { region: 'North East', isNcr: false, label: 'North East (NER)' };
    }

    // 3. South
    if (z.includes('karnataka') || z.includes('tamil nadu') || z.includes('telangana') || z.includes('andhra') || z.includes('kerala') || z.includes('bengaluru') || z.includes('chennai') || z.includes('hyderabad') ||
        ['bengaluru', 'bangalore', 'chennai', 'hyderabad', 'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'coimbatore', 'madurai', 'salem', 'tirunelveli', 'tiruchirappalli', 'tiruppur', 'vellore', 'puducherry', 'pondicherry', 'kadapa', 'guntur', 'vijayawada', 'visakhapatnam', 'rajamahendravaram', 'kozhikode', 'calicut', 'kannur', 'kollam', 'kottayam', 'mysore', 'mangaluru', 'mangalore', 'hubli', 'shivamogga', 'kalaburagi', 'ballari', 'bellary', 'udupi', 'peenya', 'whitefield', 'yelahanka', 'bommasandra', 'warangal', 'nizamabad', 'karimnagar'].includes(s)) {
      return { region: 'South', isNcr: false, label: 'South' };
    }

    // 4. West
    if (z.includes('maharashtra') || z.includes('gujarat') || z.includes('mumbai') || z.includes('pune') || z.includes('ahmedabad') || z.includes('goa') ||
        ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'thane', 'navi mumbai', 'vashi', 'kandivali', 'bandra', 'ahmedabad', 'surat', 'vadodara', 'baroda', 'rajkot', 'vapi', 'goa', 'panaji', 'kolhapur', 'solapur', 'akola', 'amravati', 'ahmadnagar', 'bharuch', 'bhavnagar'].includes(s)) {
      return { region: 'West', isNcr: false, label: 'West' };
    }

    // 5. Central
    if (z.includes('madhya pradesh') || z.includes('chhattisgarh') || z.includes('mp & chhattisgarh') ||
        ['bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain', 'raipur', 'bilaspur', 'sagar', 'durg'].includes(s)) {
      return { region: 'Central', isNcr: false, label: 'Central' };
    }

    // 6. East (Mainland)
    if (z.includes('west bengal') || z.includes('bihar') || z.includes('jharkhand') || z.includes('odisha') || z.includes('orissa') || z.includes('kolkata') || z.includes('patna') ||
        ['kolkata', 'howrah', 'patna', 'ranchi', 'bhubaneswar', 'muzaffarpur', 'bhagalpur', 'jamshedpur', 'rourkela', 'cuttack', 'berhampur', 'durgapur', 'siliguri', 'port blair', 'katihar', 'alipurduar', 'barbil', 'balasore', 'keonjhar'].includes(s)) {
      return { region: 'East', isNcr: false, label: 'East' };
    }

    // 7. North
    return { region: 'North', isNcr: false, label: 'North' };
  }

  function computeRegionalAffinity(postings, totalServiceYears) {
    const regionTenures = {
      'North': 0,
      'South': 0,
      'West': 0,
      'East': 0,
      'North East': 0,
      'Central': 0
    };
    let ncrTenure = 0;
    let northNonNcrTenure = 0;
    let nerTenure = 0;

    postings.forEach(p => {
      const regObj = getMacroRegion(p.officeId, p.station, p.zone, p.category);
      p.macroRegion = regObj.region;
      p.isNcr = regObj.isNcr;
      p.macroRegionLabel = regObj.label;

      regionTenures[regObj.region] = +( (regionTenures[regObj.region] || 0) + p.periodYears ).toFixed(2);
      if (regObj.isNcr) {
        ncrTenure = +(ncrTenure + p.periodYears).toFixed(2);
      } else if (regObj.region === 'North') {
        northNonNcrTenure = +(northNonNcrTenure + p.periodYears).toFixed(2);
      } else if (regObj.region === 'North East') {
        nerTenure = +(nerTenure + p.periodYears).toFixed(2);
      }
    });

    const sortedRegions = Object.entries(regionTenures)
      .map(([region, years]) => ({
        region,
        years: parseFloat(years.toFixed(1)),
        percent: totalServiceYears > 0 ? Math.round((years / totalServiceYears) * 100) : 0,
        ncrYears: region === 'North' ? parseFloat(ncrTenure.toFixed(1)) : 0,
        ncrPercent: region === 'North' && totalServiceYears > 0 ? Math.round((ncrTenure / totalServiceYears) * 100) : 0,
        northNonNcrYears: region === 'North' ? parseFloat(northNonNcrTenure.toFixed(1)) : 0,
        northNonNcrPercent: region === 'North' && totalServiceYears > 0 ? Math.round((northNonNcrTenure / totalServiceYears) * 100) : 0
      }))
      .sort((a, b) => b.years - a.years);

    const primary = sortedRegions[0] || { region: 'North', years: 0, percent: 0 };
    const secondary = sortedRegions[1] && sortedRegions[1].percent >= 15 ? sortedRegions[1] : null;
    const activeRegions = sortedRegions.filter(r => r.years > 0.3);

    const getRegionDisplayName = (r) => {
      if (r.region === 'North') {
        if (r.ncrYears > 0 && r.northNonNcrYears > 0) return 'North (incl. NCR)';
        if (r.ncrYears > 0 && r.northNonNcrYears === 0) return 'North (NCR Centric)';
        return 'North';
      }
      return r.region;
    };

    const primaryName = getRegionDisplayName(primary);
    let preferenceLabel = '';
    let affinityTag = '';
    let badgeClass = 'good';

    if (totalServiceYears < 2.0) {
      preferenceLabel = `Early Career (${primaryName} Entry)`;
      affinityTag = `Initial ${primaryName} Posting`;
    } else if (primary.percent >= 80) {
      preferenceLabel = `Strong ${primaryName} Affinity (${primary.percent}%)`;
      affinityTag = `Strictly ${primaryName} Centric (${primary.years}y of ${totalServiceYears}y)`;
      badgeClass = 'warn';
    } else if (primary.percent >= 60) {
      if (secondary) {
        preferenceLabel = `${primaryName} Dominant (${primary.percent}%) · ${getRegionDisplayName(secondary)} (${secondary.percent}%)`;
        affinityTag = `Predominantly ${primaryName} with ${secondary.region} exposure`;
      } else {
        preferenceLabel = `${primaryName} Preferred (${primary.percent}%)`;
        affinityTag = `${primaryName} Focused Career`;
      }
    } else if (primary.percent >= 40 && secondary && secondary.percent >= 30) {
      preferenceLabel = `Dual-Region: ${primaryName} (${primary.percent}%) & ${getRegionDisplayName(secondary)} (${secondary.percent}%)`;
      affinityTag = `Bi-Regional (${primary.region} + ${secondary.region})`;
    } else if (activeRegions.length >= 3) {
      preferenceLabel = `Pan-India Rotated (${activeRegions.map(r => `${r.region} ${r.percent}%`).join(' · ')})`;
      affinityTag = `Pan-India Mobility (${activeRegions.length} Macro-Regions)`;
    } else {
      preferenceLabel = `${primaryName} Leaning (${primary.percent}%)`;
      affinityTag = `${primaryName} Primary`;
    }

    return {
      primaryRegion: primary.region,
      primaryDisplayName: primaryName,
      primaryPercent: primary.percent,
      primaryYears: primary.years,
      secondaryRegion: secondary ? secondary.region : null,
      secondaryPercent: secondary ? secondary.percent : 0,
      ncrYears: parseFloat(ncrTenure.toFixed(1)),
      ncrPercent: totalServiceYears > 0 ? Math.round((ncrTenure / totalServiceYears) * 100) : 0,
      hasNerExposure: nerTenure > 0.1,
      nerYears: parseFloat(nerTenure.toFixed(1)),
      nerPercent: totalServiceYears > 0 ? Math.round((nerTenure / totalServiceYears) * 100) : 0,
      breakdown: sortedRegions,
      preferenceLabel,
      affinityTag,
      badgeClass,
      activeRegionsCount: activeRegions.length
    };
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
          // Build coordinates map
          App.pfContacts.offices.forEach(o => {
            if (o.coordinates && o.coordinates.latitude && o.coordinates.longitude) {
              App.pfContacts.coordsMap.set(o.id, [o.coordinates.latitude, o.coordinates.longitude]);
            }
          });
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

      await fetchPfContacts();
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
      let lastPromoDate = null;
      const rawEnriched = officer.records.map((r) => {
        const d1 = parseDate(r.date1);
        const d2 = parseDate(r.date2);
        const desig = normalizeDesignation(r.col2, r.new_col4, prevDesig, lastPromoDate, d1);
        if (desig !== prevDesig && d1) {
          lastPromoDate = d1;
        }
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

          // Check if this record is an administrative confirmation row of a recent transfer/promotion
          // (e.g. within 120 days, same or blank designation, referencing previous relieving office)
          const isRecentAdminConfirmation = (
            item.fromDateTime && prev.fromDateTime &&
            (item.fromDateTime.getTime() - prev.fromDateTime.getTime()) < (120 * 86400000) &&
            (!item.rawRecord.col2 || item.designation === prev.designation) &&
            (item.event.includes('Promotion') || (item.cadreStatus && item.cadreStatus.toUpperCase() === 'REGULAR')) &&
            item.periodYears < 0.35
          );

          if (prev.officeId === item.officeId && prev.designation === item.designation) {
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
          } else if (isRecentAdminConfirmation) {
            // Merge administrative confirmation into the active posting
            prev.mergedCount++;
            prev.subRecords.push(item.rawRecord);
            if (item.cadreStatus) prev.cadreStatus = item.cadreStatus;
            if (item.event && item.event.includes('Promotion') && !prev.event.includes('Promotion')) {
              prev.event = 'Promotion with Transfer';
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

        // Reconcile periodYears with verified calendar date span
        if (cur.fromDateTime) {
          let endDt = cur.toDateTime;
          if (cur.isLatest || !endDt) {
            endDt = new Date(2024, 5, 1); // June 2024 AGT analysis baseline
          }
          if (endDt && endDt > cur.fromDateTime) {
            const calYears = parseFloat(((endDt.getTime() - cur.fromDateTime.getTime()) / (365.25 * 24 * 3600 * 1000)).toFixed(2));
            if (calYears > 0.05) {
              cur.periodYears = calYears;
            }
          }
        }

        totalServiceYears += cur.periodYears;
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

      const spatial = computeSpatialMetrics(officer.postings, totalServiceYears);
      const regionalAffinity = computeRegionalAffinity(officer.postings, totalServiceYears);

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
        postings: officer.postings,
        // Macro-Regional Preference & Affinity
        regionalAffinity: regionalAffinity,
        preferredRegion: regionalAffinity.primaryRegion,
        regionalAffinityLabel: regionalAffinity.preferenceLabel,
        regionalAffinityTag: regionalAffinity.affinityTag,
        // Spatial & Regional Stagnation Metrics
        maxSingleStint: spatial.maxSingleStint,
        maxDistanceKm: spatial.maxDistanceKm,
        topStation: spatial.topStation,
        topStationTenure: spatial.topStationTenure,
        topStationPct: spatial.topStationPct,
        topZone: spatial.topZone,
        topZoneTenure: spatial.topZoneTenure,
        topZonePct: spatial.topZonePct,
        isSingleStintRed: spatial.isSingleStintRed,
        isCombinedStnRed: spatial.isCombinedStnRed,
        isHyperRegional: spatial.isHyperRegional,
        isZoneDominant: spatial.isZoneDominant,
        isStationDominant: spatial.isStationDominant,
        isZoneTenureHigh: spatial.isZoneTenureHigh,
        stagnationTier: spatial.stagnationTier,
        riskColor: spatial.riskColor,
        riskLabel: spatial.riskLabel
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

    if (pathname.includes('spatial-analytics')) {
      showSpatialAnalyticsView();
      return;
    }

    if (params.get('officer') || params.get('eid')) {
      showOfficerProfile(params.get('officer') || params.get('eid'));
    } else if (params.get('office') || params.get('id')) {
      showOfficeProfile(params.get('office') || params.get('id'));
    } else if (params.get('zone') || params.get('zid')) {
      showZoneProfile(params.get('zone') || params.get('zid'));
    } else if (hash.startsWith('#spatial')) {
      showSpatialAnalyticsView();
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

  function showSpatialAnalyticsView() {
    updateNavActive('spatial');
    renderSpatialAnalytics();
  }

  function updateNavActive(viewName) {
    document.querySelectorAll('.nav a, .nav button').forEach(el => {
      const target = el.getAttribute('data-view');
      if (target === viewName) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

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
                <span class="badge" style="background:#eef2ff;color:#4f46e5;font-weight:700;border:1px solid #c7d2fe" title="${o.regionalAffinity.affinityTag}">🧭 ${o.regionalAffinity.preferenceLabel}</span>
                ${o.regionalAffinity.hasNerExposure ? `<span class="badge" style="background:#ccfbf1;color:#0f766e;font-weight:700;border:1px solid #99f6e4" title="Served in North Eastern Region for ${o.regionalAffinity.nerYears} years">🌲 NER Served (${o.regionalAffinity.nerYears}y)</span>` : ''}
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

      <!-- KPI Metrics (5 Cards) -->
      <section class="metrics" style="grid-template-columns:repeat(auto-fit, minmax(180px, 1fr))">
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
        <div class="card metric">
          <small>Preferred Region</small>
          <b style="color:${MACRO_REGION_COLORS[o.regionalAffinity.primaryRegion] || '#4f46e5'}">${o.regionalAffinity.primaryRegion} (${o.regionalAffinity.primaryPercent}%)</b>
          <span>${o.regionalAffinity.affinityTag}</span>
        </div>
      </section>

      <!-- Geographic Posting Journey & Heatmap -->
      <section class="card geo-map-card">
        <div class="title" style="margin-bottom:12px">
          <div>
            <h2>Geographic Posting Journey & Heatmap</h2>
            <span>Visualizing career mobility across Indian stations with thermal tenure density</span>
          </div>
          <div class="map-header-controls">
            <button class="map-toggle-btn active" id="btnMapBoth" onclick="window.App.toggleOfficerMapMode('both')">✨ Combined View</button>
            <button class="map-toggle-btn" id="btnMapHeat" onclick="window.App.toggleOfficerMapMode('heat')">🔥 Thermal Heatmap</button>
            <button class="map-toggle-btn" id="btnMapRoute" onclick="window.App.toggleOfficerMapMode('route')">🛣️ Route Trajectory</button>
          </div>
        </div>
        <div id="officerGeoMap" class="geo-map-container"></div>
        <div class="map-legend">
          <div class="map-legend-item">
            <span class="heatmap-spectrum"></span>
            <span><b>Tenure Intensity (Green ➔ Red):</b> 🟢 &lt;3y Single / &lt;4y Multiple (Green) ➔ 🟡/🟠 3-4y Single / 4-8y Multiple (Orange) ➔ 🔴 <b>&gt;4y Single / &gt;8y Multiple (Red Alert)</b></span>
          </div>
          <div class="map-legend-item" style="margin-left:auto">
            <span class="legend-dot" style="background:#15803d;box-shadow:0 0 0 2px #86efac"></span>
            <b>Current Station (${o.currentStation})</b>
          </div>
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#475569;border-radius:2px;width:16px;height:3px"></span>
            <span>Career Route</span>
          </div>
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
                <p>${p.station} · ${p.zone} · <span class="badge" style="background:${p.isNcr ? '#6366f1' : (MACRO_REGION_COLORS[p.macroRegion] || '#64748b')};color:white;font-size:9px;padding:2px 6px">${p.isNcr ? 'North (NCR)' : p.macroRegion}</span> <span class="pill ${p.event.includes('Promotion') ? 'green' : 'blue'}">${p.event}</span> ${p.mergedCount > 1 ? `<span class="badge" style="font-size:9px;padding:2px 6px">${p.mergedCount} HRM rows</span>` : ''}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="card">
          <div class="title">
            <h2>Macro-Regional Affinity</h2>
            <span>North (incl. NCR) / South / West / East / Central distribution</span>
          </div>
          <div style="font-size:12px;color:var(--ink-secondary);margin-bottom:8px">
            <b>Preferred Region:</b> <span class="badge" style="background:${MACRO_REGION_COLORS[o.regionalAffinity.primaryRegion] || '#4f46e5'};color:white;font-size:11px">${o.regionalAffinity.primaryDisplayName} (${o.regionalAffinity.primaryPercent}%)</span> — <i>${o.regionalAffinity.affinityTag}</i>
          </div>
          <div class="macro-region-bar">
            ${o.regionalAffinity.breakdown.filter(r => r.percent > 0).map(r => {
              if (r.region === 'North' && r.ncrYears > 0 && r.northNonNcrYears > 0) {
                return `
                  <div class="macro-region-seg" style="width:${r.northNonNcrPercent}%;background:#0284c7" title="North (Field): ${r.northNonNcrYears}y (${r.northNonNcrPercent}%)"></div>
                  <div class="macro-region-seg" style="width:${r.ncrPercent}%;background:#6366f1" title="North (NCR): ${r.ncrYears}y (${r.ncrPercent}%)"></div>
                `;
              }
              return `
                <div class="macro-region-seg" style="width:${r.percent}%;background:${r.region === 'North' && r.ncrYears > 0 ? '#6366f1' : (MACRO_REGION_COLORS[r.region] || '#64748b')}" title="${r.region}: ${r.years}y (${r.percent}%)"></div>
              `;
            }).join('')}
          </div>
          <div class="macro-region-chips">
            ${o.regionalAffinity.breakdown.filter(r => r.years > 0).map(r => `
              <div class="macro-region-chip">
                <span class="chip-dot" style="background:${MACRO_REGION_COLORS[r.region] || '#64748b'}"></span>
                <b>${r.region === 'North' ? 'North (incl. NCR)' : r.region}</b>: ${r.years}y (${r.percent}%)
                ${r.region === 'North' && r.ncrYears > 0 ? `<span style="color:#64748b;font-size:10px;margin-left:2px">[NCR: ${r.ncrYears}y${r.northNonNcrYears > 0 ? ` · Field: ${r.northNonNcrYears}y` : ''}]</span>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="title" style="margin-top:24px">
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

    // Initialize Map after rendering DOM
    setTimeout(() => initOfficerMap(o), 50);
  }

  // Officer Map Initializer with True Leaflet.heat Heatmap + Route Group
  function initOfficerMap(o) {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById('officerGeoMap');
    if (!mapEl) return;

    if (App.activeMap) {
      App.activeMap.remove();
      App.activeMap = null;
    }

    const map = L.map('officerGeoMap', {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView([22.5, 78.5], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    App.activeMap = map;

    const latLngs = [];
    const stationMap = new Map();
    const heatPoints = [];

    o.postings.forEach((p, idx) => {
      const coords = getCoords(p.officeId, p.station);
      latLngs.push(coords);

      if (!stationMap.has(p.station)) {
        stationMap.set(p.station, {
          station: p.station,
          coords: coords,
          postings: [],
          totalTenure: 0,
          maxSingleTenure: 0,
          isCurrent: p.isLatest,
          stepOrder: idx + 1
        });
      }
      const stnObj = stationMap.get(p.station);
      stnObj.postings.push(p);
      stnObj.totalTenure = +(stnObj.totalTenure + p.periodYears).toFixed(2);
      stnObj.maxSingleTenure = Math.max(stnObj.maxSingleTenure, p.periodYears);
      if (p.isLatest) stnObj.isCurrent = true;
    });

    // Build Heatmap points weighted by exact user rule:
    // Single stint: < 3y Green, 3-4y Green->Orange, > 4y Red
    // Multiple postings: < 4y Green, 4-8y Green->Orange, > 8y Red
    stationMap.forEach((stn) => {
      const s = stn.maxSingleTenure || 0;
      const c = stn.totalTenure || 0;

      let rSingle = 0.2;
      if (s <= 3.0) {
        rSingle = 0.2 + (s / 3.0) * 0.15; // 0.2 -> 0.35 (Green)
      } else if (s <= 4.0) {
        rSingle = 0.40 + ((s - 3.0) / 1.0) * 0.45; // 0.40 -> 0.85 (Green going Orange)
      } else {
        rSingle = 1.0; // Red (> 4y single)
      }

      let rCombined = 0.2;
      if (c <= 4.0) {
        rCombined = 0.2 + (c / 4.0) * 0.15; // 0.2 -> 0.35 (Green)
      } else if (c <= 8.0) {
        rCombined = 0.40 + ((c - 4.0) / 4.0) * 0.45; // 0.40 -> 0.85 (Green going Orange)
      } else {
        rCombined = 1.0; // Red (> 8y combined)
      }

      const intensity = Math.min(1.0, Math.max(0.2, rSingle, rCombined));
      heatPoints.push([stn.coords[0], stn.coords[1], intensity]);
    });

    // Create True Thermal Heatmap Layer (Strictly Green to Red)
    let heatLayer = null;
    if (typeof L.heatLayer === 'function') {
      heatLayer = L.heatLayer(heatPoints, {
        radius: 48,
        blur: 28,
        maxZoom: 10,
        max: 1.0,
        minOpacity: 0.45,
        gradient: {
          0.20: '#15803d', // Green (< 3y single / < 4y combined)
          0.45: '#84cc16', // Lime Green
          0.65: '#eab308', // Amber / Yellow (3.0-3.5y single / 4-6y combined)
          0.85: '#ea580c', // Orange (3.5-4.0y single / 6-8y combined)
          0.95: '#dc2626'  // Red (>4y single stint OR >8y combined alert)
        }
      }).addTo(map);
    }
    App.officerHeatLayer = heatLayer;

    // Create Route Elements (Neutral Slate Polyline to highlight Green->Red thermal markers)
    const routeElements = [];
    if (latLngs.length > 1) {
      const poly = L.polyline(latLngs, {
        color: '#475569',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
        lineCap: 'round'
      });
      routeElements.push(poly);
    }

    const bounds = L.latLngBounds();

    stationMap.forEach((stn) => {
      bounds.extend(stn.coords);

      const s = stn.maxSingleTenure || 0;
      const c = stn.totalTenure || 0;

      // Exact color mapping:
      // Single: <3y Green, 3-4y Green going Orange, >4y Red
      // Multiple: <4y Green, 4-8y Green going Orange, >8y Red
      let markerColor = '#15803d'; // Green
      let statusClass = 'status-green';

      if (s > 4.0 || c > 8.0) {
        markerColor = '#dc2626'; // Red (>4y single OR >8y multiple)
        statusClass = 'status-red';
      } else if (s >= 3.5 || c >= 6.0) {
        markerColor = '#ea580c'; // Deep Orange (3.5-4y single OR 6-8y multiple)
        statusClass = 'status-orange';
      } else if (s >= 3.0 || c >= 4.0) {
        markerColor = '#eab308'; // Amber/Yellow (3.0-3.5y single OR 4-6y multiple)
        statusClass = 'status-amber';
      } else {
        markerColor = '#15803d'; // Green (< 3y single AND < 4y multiple)
        statusClass = 'status-green';
      }

      // Add a high-visibility SVG tenure halo circle directly under the marker
      const haloRadius = Math.max(30000, Math.min(120000, (stn.totalTenure || 1) * 22000));
      const haloCircle = L.circle(stn.coords, {
        radius: haloRadius,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.22,
        weight: 2
      });
      routeElements.push(haloCircle);

      const iconHtml = `<div class="custom-map-marker ${statusClass} ${stn.isCurrent ? 'is-current' : ''}" style="width:30px;height:30px;font-size:12px">${stn.stepOrder}</div>`;
      const customIcon = L.divIcon({
        className: '',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      let stnAlertHtml = '';
      if (s > 4.0 || c > 8.0) {
        stnAlertHtml = `<div style="margin:4px 0 6px"><span class="badge danger" style="font-size:10px;padding:3px 8px">🚨 Red Alert: ${s > 4.0 ? `Single Stint ${s}y (&gt;4y)` : `Combined ${c}y (&gt;8y)`}</span></div>`;
      } else if (s >= 3.0 || c >= 4.0) {
        stnAlertHtml = `<div style="margin:4px 0 6px"><span class="badge warn" style="font-size:10px;padding:3px 8px">⚠️ Warning: ${s >= 3.0 ? `Single Stint ${s}y (3-4y)` : `Combined ${c}y (4-8y)`}</span></div>`;
      } else {
        stnAlertHtml = `<div style="margin:4px 0 6px"><span class="badge good" style="font-size:10px;padding:3px 8px">✅ Normal Tenure: ${s}y</span></div>`;
      }

      const popupContent = `
        <div class="map-popup-title">${stn.station}</div>
        <div class="map-popup-sub">Cumulative Station Tenure: <b>${stn.totalTenure} Years</b></div>
        ${stnAlertHtml}
        <div style="font-size:11px;color:#475467;margin-top:6px">
          ${stn.postings.map(p => `
            <div style="margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid #f1f5f9">
              <b>${p.designation}</b> · <a href="${getOfficeLink(p.officeId)}" style="color:#1f4e79;font-weight:700">${p.officeName}</a><br>
              <span style="color:#64748b">${p.fromDate} — ${p.toDate} (${p.periodYears}y)</span>
            </div>
          `).join('')}
        </div>
      `;

      const m = L.marker(stn.coords, { icon: customIcon }).bindPopup(popupContent);
      routeElements.push(m);
    });

    const routeGroup = L.layerGroup(routeElements).addTo(map);
    App.officerRouteGroup = routeGroup;

    if (latLngs.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
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

      <!-- Geographic Map: Office Location & Feeder Network -->
      <section class="card geo-map-card">
        <div class="title" style="margin-bottom:12px">
          <div>
            <h2>Office Location & Mobility Corridors</h2>
            <span>Geographic node and key inbound feeder & outbound transfer routes</span>
          </div>
          <div class="hero-badges" style="margin-bottom:0">
            <span class="badge">${off.station}</span>
            <span class="badge">${off.zone}</span>
          </div>
        </div>
        <div id="officeGeoMap" class="geo-map-container"></div>
        <div class="map-legend">
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#1f4e79;border-radius:2px"></span>
            <b>${off.name} (This Office)</b>
          </div>
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#15803d"></span>
            <span>Inbound Origins (Incoming Transfers)</span>
          </div>
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#6366f1"></span>
            <span>Outbound Destinations (Outgoing Moves)</span>
          </div>
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

    setTimeout(() => initOfficeMap(off), 50);
  }

  // Office Map Initializer
  function initOfficeMap(off) {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById('officeGeoMap');
    if (!mapEl) return;

    if (App.activeMap) {
      App.activeMap.remove();
      App.activeMap = null;
    }

    const officeCoords = getCoords(off.id, off.station);

    const map = L.map('officeGeoMap', {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView(officeCoords, 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    App.activeMap = map;

    const bounds = L.latLngBounds([officeCoords]);

    off.topOrigins.forEach(orig => {
      const origCoords = getCoords(null, orig.station);
      bounds.extend(origCoords);
      L.polyline([origCoords, officeCoords], {
        color: '#15803d',
        weight: Math.min(5, Math.max(2, orig.count * 1.2)),
        opacity: 0.75,
        dashArray: '5, 6'
      }).addTo(map);

      L.circleMarker(origCoords, {
        radius: 6,
        color: '#15803d',
        fillColor: '#86efac',
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`<b>Inbound Feeder: ${orig.station}</b><br>${orig.count} transfers to ${off.name}`);
    });

    off.topDestinations.forEach(dest => {
      const destCoords = getCoords(null, dest.station);
      bounds.extend(destCoords);
      L.polyline([officeCoords, destCoords], {
        color: '#6366f1',
        weight: Math.min(5, Math.max(2, dest.count * 1.2)),
        opacity: 0.75,
        dashArray: '5, 6'
      }).addTo(map);

      L.circleMarker(destCoords, {
        radius: 6,
        color: '#6366f1',
        fillColor: '#c7d2fe',
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`<b>Outbound Destination: ${dest.station}</b><br>${dest.count} transfers from ${off.name}`);
    });

    const iconHtml = `<div class="custom-map-marker office-pin" style="width:34px;height:34px;font-size:14px">🏢</div>`;
    const customIcon = L.divIcon({
      className: '',
      html: iconHtml,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17]
    });

    const pfDetails = App.pfContacts.offices.find(p => p.id === off.id) || {};
    const popupContent = `
      <div class="map-popup-title">${off.name}</div>
      <div class="map-popup-sub">${off.category} · ${off.zone}</div>
      <div style="font-size:11px;color:#334155;margin-top:6px">
        <b>Active Tracked Staff:</b> ${off.activeStaffCount} officers<br>
        <b>Total Historical Officers:</b> ${off.totalOfficersCount}<br>
        ${pfDetails.address ? `<b>Address:</b> ${pfDetails.address.replace(/\n/g, ', ')}<br>` : ''}
        ${pfDetails.official_count ? `<b>pf-contacts Officials:</b> ${pfDetails.official_count}` : ''}
      </div>
    `;

    L.marker(officeCoords, { icon: customIcon })
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();

    if (off.topOrigins.length > 0 || off.topDestinations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
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

      <!-- Mobility Geographic Map -->
      <section class="card geo-map-card">
        <div class="title" style="margin-bottom:12px">
          <div>
            <h2>National Transfer Corridors Map</h2>
            <span>Top movement arteries between stations nationwide</span>
          </div>
        </div>
        <div id="mobilityGeoMap" class="geo-map-container"></div>
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

    setTimeout(() => initMobilityMap(topFlows), 50);
  }

  function initMobilityMap(topFlows) {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById('mobilityGeoMap');
    if (!mapEl) return;

    if (App.activeMap) {
      App.activeMap.remove();
      App.activeMap = null;
    }

    const map = L.map('mobilityGeoMap', {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView([22.5, 78.5], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    App.activeMap = map;

    const bounds = L.latLngBounds();

    topFlows.forEach(f => {
      const parts = f.corridor.split(' ➔ ');
      if (parts.length === 2) {
        const c1 = getCoords(null, parts[0].trim());
        const c2 = getCoords(null, parts[1].trim());
        bounds.extend(c1);
        bounds.extend(c2);

        L.polyline([c1, c2], {
          color: '#4f46e5',
          weight: Math.min(6, Math.max(2, f.count * 0.6)),
          opacity: 0.65
        }).addTo(map).bindPopup(`<b>${f.corridor}</b><br><b>${f.count}</b> transfers in AGT history`);

        L.circleMarker(c1, { radius: 4, color: '#4f46e5', fillOpacity: 0.8 }).addTo(map);
        L.circleMarker(c2, { radius: 4, color: '#4f46e5', fillOpacity: 0.8 }).addTo(map);
      }
    });

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  }

  // ==========================================
  // RENDER: Spatial & Regional Stagnation Analytics
  // ==========================================
  App.spatialState = {
    filterType: 'all',
    regionFilter: 'all',
    zoneFilter: 'all',
    desigFilter: 'all',
    searchQuery: '',
    maxRadiusKm: 2500,
    xAxis: 'service',
    yAxis: 'distance',
    selectedEid: null
  };

  function renderSpatialAnalytics() {
    const topCrumb = document.getElementById('topCrumb');
    if (topCrumb) {
      topCrumb.innerHTML = `AGT Analytics / <b>Spatial & Regional Stagnation Lab</b>`;
    }

    const container = document.getElementById('mainContent');
    if (!container) return;

    const totalOfficers = App.officersList.length;
    const singleStintRedCount = App.officersList.filter(o => o.isSingleStintRed).length;
    const combinedStnRedCount = App.officersList.filter(o => o.isCombinedStnRed).length;
    const hyperRegionalCount = App.officersList.filter(o => o.isHyperRegional).length;
    const zoneTenureHighCount = App.officersList.filter(o => o.isZoneTenureHigh).length;
    const stationDomCount = App.officersList.filter(o => o.isStationDominant).length;
    const nerServedCount = App.officersList.filter(o => o.regionalAffinity && o.regionalAffinity.hasNerExposure).length;

    container.innerHTML = `
      <section class="hero">
        <div class="hero-row">
          <div>
            <div class="eyebrow">Institutional Intelligence & Cadre Spatial Analytics</div>
            <h1>Spatial Mobility & Regional Stagnation Lab</h1>
            <div class="sub">Identifying officers confined to small geographic radii, single station dominance, or extended zonal tenure</div>
          </div>
          <div class="actions">
            <button class="btn primary" onclick="window.App.exportSpatialCsv()"><i class="dot"></i> Export Spatial CSV</button>
            <button class="btn" onclick="window.print()">Print Analysis</button>
          </div>
        </div>
      </section>

      <!-- 5 Interactive KPI Metric Cards -->
      <section class="metrics" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr))">
        <div class="card metric" style="cursor:pointer" onclick="window.App.setSpatialFilter('all')">
          <small>Total Officers</small>
          <b>${totalOfficers}</b>
          <span>All Cadres Tracked</span>
        </div>
        <div class="card metric" style="cursor:pointer;border-left:4px solid #dc2626" onclick="window.App.setSpatialFilter('single_red')">
          <small style="color:#dc2626;font-weight:700">🚨 Single Stint &gt; 4y</small>
          <b style="color:#dc2626">${singleStintRedCount}</b>
          <span>${((singleStintRedCount/totalOfficers)*100).toFixed(0)}% of cadre</span>
        </div>
        <div class="card metric" style="cursor:pointer;border-left:4px solid #dc2626" onclick="window.App.setSpatialFilter('stn_red')">
          <small style="color:#dc2626;font-weight:700">🔴 Station Stagnation &gt; 8y</small>
          <b style="color:#dc2626">${combinedStnRedCount}</b>
          <span>Cumulative Station Time</span>
        </div>
        <div class="card metric" style="cursor:pointer;border-left:4px solid #ea580c" onclick="window.App.setSpatialFilter('hyper_regional')">
          <small style="color:#ea580c;font-weight:700">📍 Hyper-Regional (&lt; 250km)</small>
          <b style="color:#ea580c">${hyperRegionalCount}</b>
          <span>Confined Geographic Pocket</span>
        </div>
        <div class="card metric" style="cursor:pointer;border-left:4px solid #d97706" onclick="window.App.setSpatialFilter('zone_high')">
          <small style="color:#d97706;font-weight:700">🌐 Zone Tenure &gt; 10y</small>
          <b style="color:#d97706">${zoneTenureHighCount}</b>
          <span>Single Zone Exposure</span>
        </div>
      </section>

      <!-- Section 1: 2D Spatial Scatter / Quadrant Matrix Plot -->
      <section class="card scatter-plot-card">
        <div class="title" style="margin-bottom:0;padding-bottom:12px;border-bottom:1px solid var(--line)">
          <div>
            <h2>Interactive 2D Spatial Mobility Scatter & Quadrant Matrix</h2>
            <span>Hover on any officer point for live dossier preview; click to inspect details</span>
          </div>
          <div class="scatter-controls">
            <div class="scatter-control-group">
              <label><b>X-Axis:</b></label>
              <select id="scatterXSelect" class="scatter-select" onchange="window.App.updateScatterPlotAxes()">
                <option value="service" ${App.spatialState.xAxis === 'service' ? 'selected' : ''}>Total Service Span (Years)</option>
                <option value="single" ${App.spatialState.xAxis === 'single' ? 'selected' : ''}>Max Single Stint (Years)</option>
                <option value="station" ${App.spatialState.xAxis === 'station' ? 'selected' : ''}>Primary Station Tenure (Years)</option>
              </select>
            </div>
            <div class="scatter-control-group">
              <label><b>Y-Axis:</b></label>
              <select id="scatterYSelect" class="scatter-select" onchange="window.App.updateScatterPlotAxes()">
                <option value="distance" ${App.spatialState.yAxis === 'distance' ? 'selected' : ''}>Max Career Mobility Span (km)</option>
                <option value="zonePct" ${App.spatialState.yAxis === 'zonePct' ? 'selected' : ''}>Primary Zone Dominance (%)</option>
                <option value="stationPct" ${App.spatialState.yAxis === 'stationPct' ? 'selected' : ''}>Primary Station Dominance (%)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="scatter-plot-wrapper" id="scatterPlotWrapper">
          <svg id="scatterPlotSvg" class="scatter-plot-svg"></svg>
          <div id="scatterTooltip" class="scatter-tooltip"></div>
        </div>

        <div class="map-legend" style="padding-top:12px;margin-top:0">
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#dc2626"></span>
            <b>Critical Stagnation (Single &gt;4y OR Combined &gt;8y)</b>
          </div>
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#ea580c"></span>
            <span>Warning (3-4y Single OR Hyper-Regional &lt;250km)</span>
          </div>
          <div class="map-legend-item">
            <span class="legend-dot" style="background:#15803d"></span>
            <span>Compliant / High Dispersion (&gt;600km)</span>
          </div>
          <div style="margin-left:auto;font-size:11px;color:var(--muted)">
            Showing all <b>${totalOfficers} officers</b>
          </div>
        </div>
      </section>

      <!-- Section 2: Regional Stagnation Hubs Map & Zone Matrix (Side-by-Side) -->
      <div class="grid2">
        <section class="card geo-map-card">
          <div class="title" style="margin-bottom:12px">
            <div>
              <h2>Regional Stagnation Hubs Map</h2>
              <span>Geographic clusters with high cadre concentration</span>
            </div>
          </div>
          <div id="spatialHubsMap" class="geo-map-container" style="height:380px"></div>
          <div class="map-legend">
            <div class="map-legend-item">
              <span class="legend-dot" style="background:#dc2626"></span>
              <span>Major Stagnation Hub (Click cluster to filter roster)</span>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="title" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <h2 id="zoneTableTitle">Macro-Zone / Regional Cadre Preference Matrix</h2>
              <span id="zoneTableSub">Cadre distribution and affinity across the 6 Macro-Regions</span>
            </div>
            <div class="map-header-controls" style="margin-left:auto">
              <button class="map-toggle-btn active" id="btnMacroPref" onclick="window.App.toggleZoneView('macro')">🌐 Macro-Zone</button>
              <button class="map-toggle-btn" id="btnZonePref" onclick="window.App.toggleZoneView('pref')">🏛️ Zone-Wise (21 Zones)</button>
              <button class="map-toggle-btn" id="btnZoneRisk" onclick="window.App.toggleZoneView('risk')">🚨 Risk Matrix</button>
            </div>
          </div>
          <div class="table-wrapper" style="max-height:380px;overflow:auto" id="zoneMatrixContainer">
            <!-- Dynamic Zone Matrix Injected Here -->
          </div>
        </section>
      </div>

      <!-- Section 3: Selected Officer Inspector Card (Appears on click) -->
      <div id="officerInspectorCard" style="display:none;margin-bottom:24px"></div>

      <!-- Section 4: Advanced Filterable Officer Roster -->
      <section class="table-section">
        <div class="card">
          <div class="title">
            <div>
              <h2>Cadre Spatial Mobility Roster</h2>
              <span id="rosterCountSub">Filter officers by spatial mobility, station tenure, and regional confinement</span>
            </div>
            <button class="btn sm" onclick="window.App.exportSpatialCsv()">Export Filtered CSV</button>
          </div>

          <!-- Quick Filter Pills -->
          <div class="filter-pills-bar">
            <button class="filter-pill active" data-filter="all" onclick="window.App.setSpatialFilter('all')">All Officers (${totalOfficers})</button>
            <button class="filter-pill danger" data-filter="single_red" onclick="window.App.setSpatialFilter('single_red')">🚨 Single Stint &gt; 4y (${singleStintRedCount})</button>
            <button class="filter-pill danger" data-filter="stn_red" onclick="window.App.setSpatialFilter('stn_red')">🔴 Station &gt; 8y (${combinedStnRedCount})</button>
            <button class="filter-pill warn" data-filter="hyper_regional" onclick="window.App.setSpatialFilter('hyper_regional')">📍 Hyper-Regional &lt; 250km (${hyperRegionalCount})</button>
            <button class="filter-pill warn" data-filter="zone_high" onclick="window.App.setSpatialFilter('zone_high')">🌐 Zone Tenure &gt; 10y (${zoneTenureHighCount})</button>
            <button class="filter-pill" data-filter="station_dominant" onclick="window.App.setSpatialFilter('station_dominant')">🏛️ Station Dominant &gt; 65% (${stationDomCount})</button>
            <button class="filter-pill" style="border-color:#0d9488;color:#0d9488;font-weight:700" data-filter="ner_served" onclick="window.App.setSpatialFilter('ner_served')">🌲 NER Served (${nerServedCount})</button>
          </div>

          <!-- Filter Controls -->
          <div class="filter-controls-row" style="grid-template-columns:1.2fr 1fr 1fr 1fr 1.2fr">
            <input type="text" id="spatialSearchInput" class="search-input" placeholder="Filter by officer name, EID, office, station..." oninput="window.App.onSpatialFilterChange()">
            <select id="spatialRegionSelect" class="scatter-select" style="width:100%" onchange="window.App.onSpatialFilterChange()">
              <option value="all">All Macro-Regions</option>
              <option value="North">North (incl. NCR)</option>
              <option value="South">South Affinity</option>
              <option value="West">West Affinity</option>
              <option value="East">East (Mainland)</option>
              <option value="North East">North East (NER)</option>
              <option value="Central">Central Affinity</option>
              <option value="NCR_only">NCR Centric (&gt;50% NCR)</option>
              <option value="ner_only">Has NER Exposure (${nerServedCount})</option>
              <option value="no_ner">Zero NER Exposure (${totalOfficers - nerServedCount})</option>
            </select>
            <select id="spatialZoneSelect" class="scatter-select" style="width:100%" onchange="window.App.onSpatialFilterChange()">
              <option value="all">All Zones (21 Zones)</option>
              ${App.zonesList.map(z => `<option value="${z.name}">${z.name}</option>`).join('')}
            </select>
            <select id="spatialDesigSelect" class="scatter-select" style="width:100%" onchange="window.App.onSpatialFilterChange()">
              <option value="all">All Designations</option>
              <option value="APFC">APFC</option>
              <option value="RPFC-II">RPFC-II</option>
              <option value="RPFC-I">RPFC-I</option>
              <option value="ACC">ACC / ACC (HQ)</option>
            </select>
            <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--ink-secondary)">
              <span>Max Span:</span>
              <input type="range" id="spatialRadiusSlider" min="50" max="2500" step="50" value="2500" style="flex:1" oninput="window.App.onSpatialSliderChange(this.value)">
              <span id="radiusSliderVal" style="font-weight:700;color:var(--ink)">2500km</span>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Officer Name</th>
                  <th>Designation</th>
                  <th>Current Office</th>
                  <th>Regional Affinity</th>
                  <th>Career Span</th>
                  <th>Max Distance</th>
                  <th>Top Station (Tenure)</th>
                  <th>Max Single Stint</th>
                  <th>Top Zone (% Dominance)</th>
                  <th>Risk Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="spatialRosterTbody">
                <!-- Injected by filterSpatialRoster() -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    setTimeout(() => {
      initSpatialScatterPlot();
      initSpatialHubsMap();
      initMacroPreferenceMatrix();
      filterSpatialRoster();
    }, 50);
  }

  // 2D Spatial Scatter Plot Generator
  function initSpatialScatterPlot() {
    const svg = document.getElementById('scatterPlotSvg');
    const tooltip = document.getElementById('scatterTooltip');
    const wrapper = document.getElementById('scatterPlotWrapper');
    if (!svg || !wrapper) return;

    const width = wrapper.clientWidth || 900;
    const height = 440;
    const padding = { top: 30, right: 30, bottom: 45, left: 60 };

    if (svg.setAttribute) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    const xAxisType = App.spatialState.xAxis;
    const yAxisType = App.spatialState.yAxis;

    // Determine Axis Ranges
    let xMax = 30, xLabel = 'Total Service Span (Years)';
    if (xAxisType === 'single') { xMax = 20; xLabel = 'Max Single Stint (Years)'; }
    else if (xAxisType === 'station') { xMax = 28; xLabel = 'Primary Station Tenure (Years)'; }

    let yMax = 2500, yLabel = 'Max Career Mobility Span (km)';
    if (yAxisType === 'zonePct') { yMax = 100; yLabel = 'Primary Zone Dominance (%)'; }
    else if (yAxisType === 'stationPct') { yMax = 100; yLabel = 'Primary Station Dominance (%)'; }

    const getXVal = (o) => {
      if (xAxisType === 'single') return o.maxSingleStint;
      if (xAxisType === 'station') return o.topStationTenure;
      return o.totalServiceYears;
    };

    const getYVal = (o) => {
      if (yAxisType === 'zonePct') return o.topZonePct;
      if (yAxisType === 'stationPct') return o.topStationPct;
      return o.maxDistanceKm;
    };

    const xScale = (val) => padding.left + (val / xMax) * (width - padding.left - padding.right);
    const yScale = (val) => height - padding.bottom - (val / yMax) * (height - padding.top - padding.bottom);

    // Draw Grid & Axes
    let svgHtml = '';

    // Quadrant Alert Shading (if distance vs service)
    if (xAxisType === 'service' && yAxisType === 'distance') {
      const qX = xScale(5);
      const qY = yScale(250);
      const qW = width - padding.right - qX;
      const qH = (height - padding.bottom) - qY;
      svgHtml += `<rect x="${qX}" y="${qY}" width="${qW}" height="${qH}" fill="rgba(220, 38, 38, 0.06)" rx="4" />`;
      svgHtml += `<text x="${width - padding.right - 8}" y="${height - padding.bottom - 10}" text-anchor="end" fill="#dc2626" font-size="10" font-weight="700" opacity="0.6">🚨 HYPER-REGIONAL / STAGNATION QUADRANT</text>`;
    }

    // Grid lines
    for (let i = 0; i <= 5; i++) {
      const xVal = (xMax / 5) * i;
      const yVal = (yMax / 5) * i;
      const xPos = xScale(xVal);
      const yPos = yScale(yVal);

      // Vertical line & label
      svgHtml += `<line x1="${xPos}" y1="${padding.top}" x2="${xPos}" y2="${height - padding.bottom}" stroke="#e2e8f0" stroke-dasharray="3,3" />`;
      svgHtml += `<text x="${xPos}" y="${height - padding.bottom + 16}" text-anchor="middle" fill="#64748b" font-size="10">${xVal.toFixed(0)}</text>`;

      // Horizontal line & label
      svgHtml += `<line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="#e2e8f0" stroke-dasharray="3,3" />`;
      svgHtml += `<text x="${padding.left - 8}" y="${yPos + 3}" text-anchor="end" fill="#64748b" font-size="10">${yVal.toFixed(0)}</text>`;
    }

    // Axis Labels
    svgHtml += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="#334155" font-size="11" font-weight="700">${xLabel}</text>`;
    svgHtml += `<text x="14" y="${height / 2}" text-anchor="middle" fill="#334155" font-size="11" font-weight="700" transform="rotate(-90 14 ${height / 2})">${yLabel}</text>`;

    // Plot Dots for all officers
    App.officersList.forEach(o => {
      const x = xScale(Math.min(xMax, getXVal(o)));
      const y = yScale(Math.min(yMax, getYVal(o)));
      const isSelected = App.spatialState.selectedEid === o.eid;
      const r = isSelected ? 8 : (o.stagnationTier === 'critical-red' ? 5.5 : 4.5);
      const stroke = isSelected ? '#1e293b' : 'white';
      const strokeWidth = isSelected ? 2.5 : 1;

      svgHtml += `
        <circle class="scatter-dot"
          cx="${x}" cy="${y}" r="${r}"
          fill="${o.riskColor}"
          stroke="${stroke}" stroke-width="${strokeWidth}"
          opacity="${isSelected ? 1 : 0.82}"
          data-eid="${o.eid}"
          data-name="${o.name}"
          data-desig="${o.currentDesignation}"
          data-office="${o.currentOffice}"
          data-stn="${o.topStation}"
          data-stntenure="${o.topStationTenure}"
          data-stint="${o.maxSingleStint}"
          data-dist="${o.maxDistanceKm}"
          data-risk="${o.riskLabel}"
          data-color="${o.riskColor}"
        />
      `;
    });

    svg.innerHTML = svgHtml;

    // Attach interaction events to dots
    const dots = svg.querySelectorAll ? svg.querySelectorAll('.scatter-dot') : (document.querySelectorAll ? document.querySelectorAll('#scatterPlotSvg .scatter-dot') : []);
    dots.forEach(dot => {
      dot.addEventListener('mouseenter', (e) => {
        const d = e.target.dataset || {};
        if (!tooltip) return;
        tooltip.innerHTML = `
          <b>${d.name || ''}</b> (${d.desig || ''})<br>
          <span style="color:#94a3b8">${d.office || ''}</span>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.15)">
            Max Mobility Span: <b>${d.dist || 0} km</b><br>
            Top Station: <b>${d.stn || ''} (${d.stntenure || 0}y)</b><br>
            Max Single Stint: <b>${d.stint || 0}y</b>
          </div>
          <span class="badge" style="background:${d.color || '#15803d'};color:white;margin-top:6px;display:inline-block">${d.risk || ''}</span>
        `;
        tooltip.style.display = 'block';
      });

      dot.addEventListener('mousemove', (e) => {
        if (!tooltip || !wrapper.getBoundingClientRect) return;
        const rect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const tooltipX = mouseX + 15 + 260 > rect.width ? mouseX - 275 : mouseX + 15;
        const tooltipY = mouseY - 40 < 10 ? mouseY + 15 : mouseY - 40;
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
      });

      dot.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
      });

      dot.addEventListener('click', (e) => {
        const eid = (e.target.dataset && e.target.dataset.eid) || e.target.getAttribute('data-eid');
        if (eid) window.App.selectSpatialOfficer(eid);
      });
    });
  }

  // Regional Stagnation Hubs Map Generator
  function initSpatialHubsMap() {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById('spatialHubsMap');
    if (!mapEl) return;

    if (App.activeMap) {
      App.activeMap.remove();
      App.activeMap = null;
    }

    const map = L.map('spatialHubsMap', {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView([22.5, 78.5], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    App.activeMap = map;

    // Define Major Regional Metropolitan Corridors
    const HUBS = [
      { name: 'Delhi NCR Corridor', coords: [28.6139, 77.2090], filterStn: 'delhi' },
      { name: 'Mumbai MMR & Pune Corridor', coords: [19.0760, 72.8777], filterStn: 'mumbai' },
      { name: 'Bengaluru Karnataka Hub', coords: [12.9716, 77.5946], filterStn: 'bengaluru' },
      { name: 'Hyderabad Telangana Hub', coords: [17.3850, 78.4867], filterStn: 'hyderabad' },
      { name: 'Kolkata & Howrah Hub', coords: [22.5726, 88.3639], filterStn: 'kolkata' },
      { name: 'Chennai & Tamil Nadu Hub', coords: [13.0827, 80.2707], filterStn: 'chennai' },
      { name: 'Jaipur & Rajasthan Hub', coords: [26.9124, 75.7873], filterStn: 'jaipur' },
      { name: 'Patna & Bihar Hub', coords: [25.5941, 85.1376], filterStn: 'patna' },
      { name: 'Chandigarh & Punjab Hub', coords: [30.7333, 76.7794], filterStn: 'chandigarh' },
      { name: 'Ahmedabad & Gujarat Hub', coords: [23.0225, 72.5714], filterStn: 'ahmedabad' }
    ];

    HUBS.forEach(hub => {
      const matchingOfficers = App.officersList.filter(o =>
        o.topStation.toLowerCase().includes(hub.filterStn) ||
        o.currentStation.toLowerCase().includes(hub.filterStn)
      );

      const redOfficers = matchingOfficers.filter(o => o.stagnationTier === 'critical-red');
      const count = matchingOfficers.length;

      const circleColor = redOfficers.length > 10 ? '#dc2626' : (redOfficers.length > 3 ? '#ea580c' : '#15803d');
      const radius = Math.max(25000, Math.min(80000, count * 1500));

      L.circle(hub.coords, {
        radius: radius,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.25,
        weight: 2
      }).addTo(map);

      const customIcon = L.divIcon({
        className: '',
        html: `<div class="custom-map-marker" style="background:${circleColor};width:32px;height:32px;font-size:12px;cursor:pointer" title="Click to filter ${hub.name}">${count}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div class="map-popup-title">${hub.name}</div>
        <div class="map-popup-sub"><b>${count}</b> Officers Concentrated Here</div>
        <div style="font-size:11px;color:#475467;margin-top:6px">
          🚨 Single Stint &gt;4y: <b>${redOfficers.length} officers</b><br>
          📍 Hyper-Regional (&lt;250km): <b>${matchingOfficers.filter(o => o.isHyperRegional).length}</b>
        </div>
        <button class="btn sm primary" style="width:100%;margin-top:8px" onclick="window.App.filterByHub('${hub.filterStn}')">Filter Roster to this Hub</button>
      `;

      L.marker(hub.coords, { icon: customIcon }).addTo(map).bindPopup(popupContent);
    });
  }

  // Macro-Zone / Regional Cadre Preference Matrix Table Generator
  function initMacroPreferenceMatrix() {
    const container = document.getElementById('zoneMatrixContainer');
    if (!container) return;

    const titleEl = document.getElementById('zoneTableTitle');
    const subEl = document.getElementById('zoneTableSub');
    if (titleEl) titleEl.innerText = 'Macro-Zone / Regional Cadre Preference Matrix';
    if (subEl) subEl.innerText = 'Cadre distribution and affinity across the 6 Macro-Regions';

    const totalCadre = App.officersList.length;
    const regions = [
      { id: 'North', name: 'North (incl. NCR)', desc: 'Delhi/HO, Punjab, Haryana, Rajasthan, UP, UK, HP, J&K' },
      { id: 'South', name: 'South', desc: 'Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Kerala' },
      { id: 'West', name: 'West', desc: 'Maharashtra, Goa, Gujarat' },
      { id: 'North East', name: 'North East (NER)', desc: 'Assam, Meghalaya, Tripura, Manipur, Nagaland, Mizoram, Arunachal' },
      { id: 'East', name: 'East (Mainland)', desc: 'West Bengal, Bihar, Jharkhand, Odisha' },
      { id: 'Central', name: 'Central', desc: 'Madhya Pradesh, Chhattisgarh' }
    ];

    const macroStats = regions.map(reg => {
      const preferredOfficers = App.officersList.filter(o => o.preferredRegion === reg.id);
      const strongAffinity = preferredOfficers.filter(o => o.regionalAffinity && o.regionalAffinity.primaryPercent >= 80).length;
      const dominantAffinity = preferredOfficers.filter(o => o.regionalAffinity && o.regionalAffinity.primaryPercent >= 60 && o.regionalAffinity.primaryPercent < 80).length;
      const currentOfficers = App.officersList.filter(o => {
        const lastP = o.postings && o.postings[o.postings.length - 1];
        return lastP && lastP.macroRegion === reg.id;
      });

      const totalYears = App.officersList.reduce((acc, o) => {
        if (!o.regionalAffinity || !o.regionalAffinity.breakdown) return acc;
        const rExp = o.regionalAffinity.breakdown.find(r => r.region === reg.id);
        return acc + (rExp ? rExp.years : 0);
      }, 0);

      // NCR sub-breakdown for North
      const ncrDominant = reg.id === 'North' ? preferredOfficers.filter(o => (o.regionalAffinity && o.regionalAffinity.ncrPercent >= 40)).length : 0;

      return {
        regionId: reg.id,
        regionName: reg.name,
        desc: reg.desc,
        preferredCount: preferredOfficers.length,
        preferredPct: totalCadre > 0 ? ((preferredOfficers.length / totalCadre) * 100).toFixed(1) : '0',
        strongAffinity,
        dominantAffinity,
        currentCount: currentOfficers.length,
        totalYears: Math.round(totalYears),
        ncrDominant
      };
    }).sort((a, b) => b.preferredCount - a.preferredCount);

    container.innerHTML = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Macro-Region</th>
            <th>Primary Preferred</th>
            <th>Strong (&gt;80%)</th>
            <th>Dominant (60–80%)</th>
            <th>Currently Posted</th>
            <th>Cumulative Cadre Time</th>
          </tr>
        </thead>
        <tbody>
          ${macroStats.map(m => {
            const barWidth = Math.max(5, Math.min(100, Math.round(parseFloat(m.preferredPct) * 2.2)));
            return `
              <tr onclick="window.App.filterByMacroRegion('${m.regionId}')" title="Click to filter officers preferring ${m.regionName}" style="cursor:pointer">
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span class="chip-dot" style="background:${MACRO_REGION_COLORS[m.regionId] || '#64748b'};width:10px;height:10px;border-radius:50%"></span>
                    <b>${m.regionName}</b>
                  </div>
                  <small style="color:var(--muted);font-size:10px">${m.desc}</small>
                  ${m.regionId === 'North' ? `<div style="font-size:10px;color:#6366f1;margin-top:2px">↳ of which <b>${m.ncrDominant} officers</b> are NCR-centric</div>` : ''}
                </td>
                <td>
                  <div style="font-weight:700;font-size:13px;color:${MACRO_REGION_COLORS[m.regionId] || '#1e293b'}">${m.preferredCount} <span style="font-weight:400;font-size:11px;color:var(--muted)">(${m.preferredPct}%)</span></div>
                  <div class="progress" style="width:85px;height:5px;margin-top:3px">
                    <i style="width:${barWidth}%;background:${MACRO_REGION_COLORS[m.regionId] || '#4f46e5'}"></i>
                  </div>
                </td>
                <td>${m.strongAffinity > 0 ? `<span class="badge warn" style="font-size:11px">${m.strongAffinity}</span>` : '<span style="color:var(--muted)">0</span>'}</td>
                <td>${m.dominantAffinity > 0 ? `<span class="badge good" style="font-size:11px">${m.dominantAffinity}</span>` : '<span style="color:var(--muted)">0</span>'}</td>
                <td><b>${m.currentCount}</b> staff</td>
                <td><b>${m.totalYears.toLocaleString()}y</b></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // Zone-Wise Preference Matrix Table Generator
  function initZonePreferenceMatrix() {
    const container = document.getElementById('zoneMatrixContainer');
    if (!container) return;

    const titleEl = document.getElementById('zoneTableTitle');
    const subEl = document.getElementById('zoneTableSub');
    if (titleEl) titleEl.innerText = 'Zone-Wise Cadre Preference Matrix';
    if (subEl) subEl.innerText = 'Cadre officers classified by primary career zone & affinity strength';

    const totalCadre = App.officersList.length;

    const zoneStats = App.zonesList.map(zone => {
      const preferredOfficers = App.officersList.filter(o => o.topZone === zone.name);
      const currentOfficers = App.officersList.filter(o => o.currentZone === zone.name);
      const strongAffinity = preferredOfficers.filter(o => o.topZonePct >= 80).length;
      const dominantAffinity = preferredOfficers.filter(o => o.topZonePct >= 60 && o.topZonePct < 80).length;
      const totalZoneYears = App.officersList.reduce((acc, o) => {
        const zExp = o.zoneExposure ? o.zoneExposure.find(z => z.zone === zone.name) : null;
        return acc + (zExp ? zExp.years : 0);
      }, 0);

      // Determine dominant macro region for this zone
      const sampleOffice = zone.offices && zone.offices[0];
      const macroReg = getMacroRegion(sampleOffice ? sampleOffice.id : '', '', zone.name, '');

      return {
        zoneName: zone.name,
        zoneId: zone.id,
        macroRegion: macroReg.region,
        preferredCount: preferredOfficers.length,
        preferredPct: totalCadre > 0 ? ((preferredOfficers.length / totalCadre) * 100).toFixed(1) : '0',
        strongAffinity,
        dominantAffinity,
        currentCount: currentOfficers.length,
        totalZoneYears: Math.round(totalZoneYears)
      };
    }).sort((a, b) => b.preferredCount - a.preferredCount);

    container.innerHTML = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Zone Name</th>
            <th>Region</th>
            <th>Preferred By</th>
            <th>Strong (&gt;80%)</th>
            <th>Dominant (60–80%)</th>
            <th>Currently Posted</th>
            <th>Total Cadre Time</th>
          </tr>
        </thead>
        <tbody>
          ${zoneStats.map(z => {
            const barWidth = Math.max(4, Math.min(100, Math.round(parseFloat(z.preferredPct) * 4.5)));
            return `
              <tr onclick="window.App.filterByPreferredZone('${z.zoneName}')" title="Click to filter officers preferring ${z.zoneName}" style="cursor:pointer">
                <td><b><a href="${getZoneLink(z.zoneId)}" class="entity-link" onclick="event.stopPropagation()">${z.zoneName}</a></b></td>
                <td><span class="badge" style="background:${MACRO_REGION_COLORS[z.macroRegion] || '#64748b'};color:white;font-size:9px;padding:2px 6px">${z.macroRegion}</span></td>
                <td>
                  <div style="font-weight:700;font-size:12px">${z.preferredCount} <span style="font-weight:400;color:var(--muted)">(${z.preferredPct}%)</span></div>
                  <div class="progress" style="width:70px;height:4px;margin-top:2px">
                    <i style="width:${barWidth}%;background:#4f46e5"></i>
                  </div>
                </td>
                <td>${z.strongAffinity > 0 ? `<span class="badge warn" style="font-size:10px">${z.strongAffinity}</span>` : '<span style="color:var(--muted)">0</span>'}</td>
                <td>${z.dominantAffinity > 0 ? `<span class="badge good" style="font-size:10px">${z.dominantAffinity}</span>` : '<span style="color:var(--muted)">0</span>'}</td>
                <td><b>${z.currentCount}</b> staff</td>
                <td><b>${z.totalZoneYears.toLocaleString()}y</b></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // Zone Stagnation Matrix Table Generator
  function initZoneStagnationMatrix() {
    const container = document.getElementById('zoneMatrixContainer');
    if (!container) return;

    const titleEl = document.getElementById('zoneTableTitle');
    const subEl = document.getElementById('zoneTableSub');
    if (titleEl) titleEl.innerText = 'Zonal Stagnation Risk Matrix';
    if (subEl) subEl.innerText = 'Ranked by cumulative regional confinement and stagnation index';

    const zoneStats = App.zonesList.map(zone => {
      const officersInZone = App.officersList.filter(o => o.currentZone === zone.name || o.topZone === zone.name);
      const total = officersInZone.length;
      const singleRed = officersInZone.filter(o => o.isSingleStintRed).length;
      const stnRed = officersInZone.filter(o => o.isCombinedStnRed).length;
      const hyper = officersInZone.filter(o => o.isHyperRegional).length;
      const avgDist = total > 0 ? Math.round(officersInZone.reduce((a, o) => a + o.maxDistanceKm, 0) / total) : 0;
      const singleRedPct = total > 0 ? Math.round((singleRed / total) * 100) : 0;
      const score = total > 0 ? Math.min(100, Math.round((singleRedPct * 0.5) + ((stnRed / total) * 30) + ((hyper / total) * 20))) : 0;

      return {
        zoneName: zone.name,
        zoneId: zone.id,
        total,
        singleRed,
        singleRedPct,
        stnRed,
        hyper,
        avgDist,
        score
      };
    }).sort((a, b) => b.score - a.score);

    container.innerHTML = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Zone Name</th>
            <th>Officers</th>
            <th>Single &gt;4y</th>
            <th>Station &gt;8y</th>
            <th>&lt;250km</th>
            <th>Avg Span</th>
            <th>Risk Index</th>
          </tr>
        </thead>
        <tbody>
          ${zoneStats.map(z => {
            const barColor = z.score > 60 ? '#dc2626' : (z.score > 35 ? '#ea580c' : '#15803d');
            return `
              <tr onclick="window.App.filterByZoneName('${z.zoneName}')" title="Click to filter ${z.zoneName}">
                <td><b>${z.zoneName}</b></td>
                <td><b>${z.total}</b></td>
                <td><span class="badge ${z.singleRed > 0 ? 'danger' : 'good'}" style="font-size:10px">${z.singleRed} (${z.singleRedPct}%)</span></td>
                <td>${z.stnRed > 0 ? `<span class="badge danger" style="font-size:10px">${z.stnRed}</span>` : '0'}</td>
                <td>${z.hyper > 0 ? `<span class="badge warn" style="font-size:10px">${z.hyper}</span>` : '0'}</td>
                <td>${z.avgDist} km</td>
                <td>
                  <div class="stagnation-index-bar">
                    <div class="stagnation-bar-outer">
                      <div class="stagnation-bar-fill" style="width:${z.score}%;background:${barColor}"></div>
                    </div>
                    <span style="font-weight:700;font-size:11px;color:${barColor}">${z.score}</span>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // Filterable Officer Roster Engine
  function filterSpatialRoster() {
    const tbody = document.getElementById('spatialRosterTbody');
    const countSub = document.getElementById('rosterCountSub');
    if (!tbody) return;

    const { filterType, regionFilter, zoneFilter, desigFilter, searchQuery, maxRadiusKm } = App.spatialState;

    let filtered = App.officersList.filter(o => {
      // 1. Quick Pill Filter
      if (filterType === 'single_red' && !o.isSingleStintRed) return false;
      if (filterType === 'stn_red' && !o.isCombinedStnRed) return false;
      if (filterType === 'hyper_regional' && !o.isHyperRegional) return false;
      if (filterType === 'zone_high' && !o.isZoneTenureHigh) return false;
      if (filterType === 'station_dominant' && !o.isStationDominant) return false;
      if (filterType === 'ner_served' && (!o.regionalAffinity || !o.regionalAffinity.hasNerExposure)) return false;

      // 2. Macro-Region Filter
      if (regionFilter === 'NCR_only') {
        if ((o.regionalAffinity.ncrPercent || 0) < 40) return false;
      } else if (regionFilter === 'ner_only') {
        if (!o.regionalAffinity || !o.regionalAffinity.hasNerExposure) return false;
      } else if (regionFilter === 'no_ner') {
        if (o.regionalAffinity && o.regionalAffinity.hasNerExposure) return false;
      } else if (regionFilter !== 'all' && o.preferredRegion !== regionFilter) {
        return false;
      }

      // 3. Zone Filter
      if (zoneFilter !== 'all' && o.currentZone !== zoneFilter && o.topZone !== zoneFilter) return false;

      // 4. Designation Filter
      if (desigFilter !== 'all' && !o.currentDesignation.includes(desigFilter)) return false;

      // 5. Max Radius Filter
      if (o.maxDistanceKm > maxRadiusKm) return false;

      // 6. Search Query Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = o.name.toLowerCase().includes(q);
        const matchEid = o.eid.toLowerCase().includes(q);
        const matchOffice = o.currentOffice.toLowerCase().includes(q);
        const matchStation = o.currentStation.toLowerCase().includes(q) || o.topStation.toLowerCase().includes(q);
        const matchRegion = o.preferredRegion.toLowerCase().includes(q);
        if (!matchName && !matchEid && !matchOffice && !matchStation && !matchRegion) return false;
      }

      return true;
    });

    if (countSub) {
      countSub.innerText = `Showing ${filtered.length} of ${App.officersList.length} officers matching criteria`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--muted)">No officers match the selected filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.slice(0, 100).map(o => {
      const isSelected = App.spatialState.selectedEid === o.eid;
      const rowStyle = isSelected ? 'background:#f0fdf4;border-left:4px solid #15803d' : '';
      const distPct = Math.min(100, Math.round((o.maxDistanceKm / 2000) * 100));

      return `
        <tr style="${rowStyle}" id="officer-row-${o.eid}">
          <td>
            <b><a href="${getOfficerLink(o.eid)}" class="entity-link">${o.name}</a></b><br>
            <span style="font-family:monospace;font-size:10px;color:var(--muted)">${o.eid}</span>
            ${o.regionalAffinity && o.regionalAffinity.hasNerExposure ? `<span class="badge" style="background:#ccfbf1;color:#0f766e;font-size:9px;padding:1px 4px;margin-left:4px">🌲 NER</span>` : ''}
          </td>
          <td><b>${o.currentDesignation}</b></td>
          <td><a href="${getOfficeLink(o.currentOfficeId)}" class="entity-link">${o.currentOffice}</a></td>
          <td>
            <span class="badge" style="background:${MACRO_REGION_COLORS[o.preferredRegion] || '#64748b'};color:white;font-size:10px;padding:3px 7px" title="${o.regionalAffinityTag}">
              ${o.preferredRegion} (${o.regionalAffinity.primaryPercent}%)
            </span>
          </td>
          <td><b>${o.totalServiceYears}y</b></td>
          <td>
            <div style="font-weight:700">${o.maxDistanceKm} km</div>
            <div class="progress" style="width:80px;height:5px;margin-top:3px">
              <i style="width:${Math.max(5, distPct)}%;background:${o.maxDistanceKm < 250 ? '#ea580c' : '#15803d'}"></i>
            </div>
          </td>
          <td>
            <b>${o.topStation}</b><br>
            <span style="color:var(--muted);font-size:11px">${o.topStationTenure}y (${o.topStationPct}%)</span>
          </td>
          <td>
            <span class="badge ${o.isSingleStintRed ? 'danger' : (o.maxSingleStint >= 3.0 ? 'warn' : 'good')}" style="font-size:11px">
              ${o.maxSingleStint}y
            </span>
          </td>
          <td>
            <b>${o.topZone}</b><br>
            <span style="color:var(--muted);font-size:11px">${o.topZoneTenure}y (${o.topZonePct}%)</span>
          </td>
          <td>
            <span class="badge" style="background:${o.riskColor};color:white;font-size:10px;padding:3px 7px">
              ${o.riskLabel}
            </span>
          </td>
          <td>
            <button class="btn sm" onclick="window.App.selectSpatialOfficer('${o.eid}')">Inspect</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function selectSpatialOfficer(eid) {
    App.spatialState.selectedEid = eid;
    const o = App.officersByEid.get(eid);
    if (!o) return;

    // Update scatter plot highlighting
    initSpatialScatterPlot();

    // Show Inspector Card
    const card = document.getElementById('officerInspectorCard');
    if (card) {
      card.style.display = 'block';
      card.innerHTML = `
        <div class="card" style="border:2px solid ${o.riskColor};background:#f8fafc">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
            <div>
              <div class="eyebrow" style="color:${o.riskColor}">Officer Spatial Mobility Dossier</div>
              <h2 style="margin:4px 0">${o.name} (${o.currentDesignation})</h2>
              <div class="sub">${o.currentOffice} · ${o.currentZone} · EID: <code>${o.eid}</code></div>
            </div>
            <div class="actions" style="margin-top:0">
              <a href="${getOfficerLink(o.eid)}" class="btn primary">Open Full 360° Profile ➔</a>
              <button class="btn sm" onclick="document.getElementById('officerInspectorCard').style.display='none'">Close</button>
            </div>
          </div>

          <div class="metrics" style="grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));margin-top:14px">
            <div class="card metric" style="padding:12px">
              <small>Regional Affinity</small>
              <b style="color:${MACRO_REGION_COLORS[o.preferredRegion] || '#4f46e5'}">${o.preferredRegion} (${o.regionalAffinity.primaryPercent}%)</b>
              <span>${o.regionalAffinityTag}</span>
            </div>
            <div class="card metric" style="padding:12px">
              <small>Max Distance Span</small>
              <b>${o.maxDistanceKm} km</b>
              <span>${o.distinctStationsCount} distinct stations</span>
            </div>
            <div class="card metric" style="padding:12px">
              <small>Primary Station</small>
              <b>${o.topStation}</b>
              <span>${o.topStationTenure}y (${o.topStationPct}% of career)</span>
            </div>
            <div class="card metric" style="padding:12px">
              <small>Max Single Stint</small>
              <b style="color:${o.isSingleStintRed ? '#dc2626' : '#15803d'}">${o.maxSingleStint}y</b>
              <span>${o.isSingleStintRed ? 'Exceeds 4y alert' : 'Compliant stint'}</span>
            </div>
            <div class="card metric" style="padding:12px">
              <small>Primary Zone</small>
              <b>${o.topZone}</b>
              <span>${o.topZoneTenure}y (${o.topZonePct}% of career)</span>
            </div>
          </div>

          <div class="macro-region-bar" style="margin-top:14px">
            ${o.regionalAffinity.breakdown.filter(r => r.percent > 0).map(r => `
              <div class="macro-region-seg" style="width:${r.percent}%;background:${MACRO_REGION_COLORS[r.region] || '#64748b'}" title="${r.region}: ${r.years}y (${r.percent}%)"></div>
            `).join('')}
          </div>

          <div style="margin-top:10px;padding:10px 14px;background:white;border-radius:8px;border:1px solid var(--line);font-size:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <span class="badge" style="background:${o.riskColor};color:white;font-size:11px">${o.riskLabel}</span>
            ${o.regionalAffinity && o.regionalAffinity.hasNerExposure ? `<span class="badge" style="background:#ccfbf1;color:#0f766e;font-size:11px;font-weight:700">🌲 NER Hard Area Served: ${o.regionalAffinity.nerYears}y</span>` : ''}
            <span><b>Career Trajectory:</b> ${o.postings.map(p => `${p.station} (${p.periodYears}y)`).join(' ➔ ')}</span>
          </div>
        </div>
      `;

      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    filterSpatialRoster();
  }

  function exportSpatialAnalyticsCsv() {
    let csv = 'OfficerName,EID,Designation,CurrentOffice,CurrentZone,TotalServiceYears,PreferredMacroRegion,PreferredRegionPercent,RegionalAffinityTag,HasNERExposure,NERTenureYears,MaxDistanceKm,DistinctStations,DistinctZones,TopStation,TopStationTenureYears,TopStationPercent,MaxSingleStintYears,TopZone,TopZoneTenureYears,TopZonePercent,RiskClassification\n';

    App.officersList.forEach(o => {
      const hasNer = o.regionalAffinity && o.regionalAffinity.hasNerExposure ? 'YES' : 'NO';
      const nerYrs = o.regionalAffinity ? o.regionalAffinity.nerYears : 0;
      csv += `"${o.name}","${o.eid}","${o.currentDesignation}","${o.currentOffice}","${o.currentZone}",${o.totalServiceYears},"${o.preferredRegion}",${o.regionalAffinity.primaryPercent},"${o.regionalAffinityTag}","${hasNer}",${nerYrs},${o.maxDistanceKm},${o.distinctStationsCount},${o.zonesCount},"${o.topStation}",${o.topStationTenure},${o.topStationPct},${o.maxSingleStint},"${o.topZone}",${o.topZoneTenure},${o.topZonePct},"${o.riskLabel}"\n`;
    });

    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'epfo_cadre_spatial_stagnation_analytics.csv');
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    showSpatial: () => {
      if (window.location.pathname.includes('spatial-analytics.html')) {
        showSpatialAnalyticsView();
        history.replaceState(null, '', 'spatial-analytics.html');
      } else {
        window.location.href = 'spatial-analytics.html';
      }
    },
    setSpatialFilter: (filterType) => {
      App.spatialState.filterType = filterType;
      document.querySelectorAll('.filter-pill').forEach(b => {
        if (b.dataset.filter === filterType) b.classList.add('active');
        else b.classList.remove('active');
      });
      filterSpatialRoster();
    },
    updateScatterPlotAxes: () => {
      const xSel = document.getElementById('scatterXSelect');
      const ySel = document.getElementById('scatterYSelect');
      if (xSel) App.spatialState.xAxis = xSel.value;
      if (ySel) App.spatialState.yAxis = ySel.value;
      initSpatialScatterPlot();
    },
    onSpatialFilterChange: () => {
      const search = document.getElementById('spatialSearchInput');
      const region = document.getElementById('spatialRegionSelect');
      const zone = document.getElementById('spatialZoneSelect');
      const desig = document.getElementById('spatialDesigSelect');
      if (search) App.spatialState.searchQuery = search.value.trim();
      if (region) App.spatialState.regionFilter = region.value;
      if (zone) App.spatialState.zoneFilter = zone.value;
      if (desig) App.spatialState.desigFilter = desig.value;
      filterSpatialRoster();
    },
    onSpatialSliderChange: (val) => {
      App.spatialState.maxRadiusKm = parseInt(val, 10);
      const label = document.getElementById('radiusSliderVal');
      if (label) label.innerText = val + 'km';
      filterSpatialRoster();
    },
    filterByHub: (hubFilter) => {
      App.spatialState.searchQuery = hubFilter;
      const input = document.getElementById('spatialSearchInput');
      if (input) input.value = hubFilter;
      filterSpatialRoster();
      const roster = document.getElementById('rosterCountSub');
      if (roster) roster.scrollIntoView({ behavior: 'smooth' });
    },
    filterByZoneName: (zoneName) => {
      App.spatialState.zoneFilter = zoneName;
      const zoneSel = document.getElementById('spatialZoneSelect');
      if (zoneSel) zoneSel.value = zoneName;
      filterSpatialRoster();
      const roster = document.getElementById('rosterCountSub');
      if (roster) roster.scrollIntoView({ behavior: 'smooth' });
    },
    filterByPreferredZone: (zoneName) => {
      App.spatialState.zoneFilter = zoneName;
      const zoneSel = document.getElementById('spatialZoneSelect');
      if (zoneSel) zoneSel.value = zoneName;
      filterSpatialRoster();
      const roster = document.getElementById('rosterCountSub');
      if (roster) roster.scrollIntoView({ behavior: 'smooth' });
    },
    filterByMacroRegion: (regId) => {
      App.spatialState.regionFilter = regId;
      const regSel = document.getElementById('spatialRegionSelect');
      if (regSel) regSel.value = regId;
      filterSpatialRoster();
      const roster = document.getElementById('rosterCountSub');
      if (roster) roster.scrollIntoView({ behavior: 'smooth' });
    },
    toggleZoneView: (viewType) => {
      const btnMacro = document.getElementById('btnMacroPref');
      const btnPref = document.getElementById('btnZonePref');
      const btnRisk = document.getElementById('btnZoneRisk');
      if (btnMacro) btnMacro.classList.toggle('active', viewType === 'macro');
      if (btnPref) btnPref.classList.toggle('active', viewType === 'pref');
      if (btnRisk) btnRisk.classList.toggle('active', viewType === 'risk');
      if (viewType === 'macro') {
        initMacroPreferenceMatrix();
      } else if (viewType === 'pref') {
        initZonePreferenceMatrix();
      } else {
        initZoneStagnationMatrix();
      }
    },
    selectSpatialOfficer: (eid) => selectSpatialOfficer(eid),
    exportSpatialCsv: () => exportSpatialAnalyticsCsv(),
    setAsOnDate: (val) => {
      App.asOnDateValue = val;
      renderAsOnDateSnapshot();
    },
    toggleOfficerMapMode: (mode) => {
      document.querySelectorAll('.map-toggle-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById(mode === 'both' ? 'btnMapBoth' : (mode === 'heat' ? 'btnMapHeat' : 'btnMapRoute'));
      if (btn) btn.classList.add('active');

      if (!App.activeMap) return;

      if (mode === 'both') {
        if (App.officerHeatLayer && !App.activeMap.hasLayer(App.officerHeatLayer)) App.activeMap.addLayer(App.officerHeatLayer);
        if (App.officerRouteGroup && !App.activeMap.hasLayer(App.officerRouteGroup)) App.activeMap.addLayer(App.officerRouteGroup);
      } else if (mode === 'heat') {
        if (App.officerHeatLayer && !App.activeMap.hasLayer(App.officerHeatLayer)) App.activeMap.addLayer(App.officerHeatLayer);
        if (App.officerRouteGroup && App.activeMap.hasLayer(App.officerRouteGroup)) App.activeMap.removeLayer(App.officerRouteGroup);
      } else if (mode === 'route') {
        if (App.officerHeatLayer && App.activeMap.hasLayer(App.officerHeatLayer)) App.activeMap.removeLayer(App.officerHeatLayer);
        if (App.officerRouteGroup && !App.activeMap.hasLayer(App.officerRouteGroup)) App.activeMap.addLayer(App.officerRouteGroup);
      }
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
