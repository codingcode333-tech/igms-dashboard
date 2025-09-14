import { getUser } from "@/context/UserContext";

export const authorsTableData = [
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  },
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  },
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  },
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  },
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  },
  {
    Query: "problem in jammu kashmir",
    From: "30/5/2023",
    To: "9/7/2023",
    State: "ALL",
    District: "ALL",
    Ministry: "ALL",
    Show_Closed: "Yes",
    Type: "Semantic",
    Download: ""

  }


];

export const grievanceTableData = [

  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
  {
    Registration_No: "PRSEC/E/2023/0031369",
    State: "CHANDIGARH",
    Received_Date: "21/7/2023",
    Closing_Date: "21/7/2023",
    Name: "PUNEET PAL SINGH"

  },
];

const fullAccessMinistries = ['ARNPG', 'DARPG']

export const getDepartmentList = () => {
  let username = getUser()?.username
  // let username = 'cbodt' // Test
  let department = departmentData.find(department => department.value == username?.substring(0, 5).toUpperCase())
  if (
    department != undefined
    && !fullAccessMinistries.includes(department.value) // Filtering special ministries
  ) {
    return [
      department
    ]
  }

  return departmentData
}

export const getDefaultDepartment = () => getDepartmentList()[0].value

export const getDepartmentName = shortcode =>
  getDepartmentNameWithShortCode(shortcode)
    .replace(shortcode, '')
    .replace(' - ', '')

export const getDepartmentNameWithShortCode = shortcode =>
  departmentData.find(department => department.value == shortcode)
    ?.label
  ?? ''

export const departmentData = [
  { value: "DOCAF", label: "DOCAF - Department of Consumer Affairs" }, // First priority
  { value: "All", label: "ALL" },

  { value: "OTHER", label: "OTHER" },
  { value: "ADMNR", label: "ADMNR - Administrator" },
  { value: "ARNPG", label: "ARNPG - Department of Administrative Reforms and Public Grievances - PG Division" },
  { value: "AYUSH", label: "AYUSH - Ministry of Ayush" },
  { value: "BADRI", label: "BADRI - DARPG" },
  { value: "BSESP", label: "BSESP - BSES Rajdhani / Yamuna Power Ltd" },
  { value: "C1TZN", label: "C1TZN - COMPLAINANT" },
  { value: "CABRB", label: "CABRB - Cabinet Secretariat(Rashtrapati Bhavan)" },
  { value: "CABST", label: "CABST - Cabinet Secretariat,Secretary(R)" },
  { value: "CAGAO", label: "CAGAO - O/o the Comptroller & Auditor General of India" },
  { value: "CBIHQ", label: "CBIHQ - C.B.I." },
  { value: "CBODT", label: "CBODT - Central Board of Direct Taxes (Income Tax)" },
  { value: "CBOEC", label: "CBOEC - Central Board of Indirect Taxes and Customs" },
  { value: "CMASM", label: "CMASM - Government of Assam - Office of Chief Minister" },
  { value: "COPRS", label: "COPRS - Committee on Petitions Rajya Sabha" },
  { value: "DARPG", label: "DARPG - Department of Administrative Reforms and Public Grievances - Nodal Agency" },
  { value: "DATOM", label: "DATOM - Department of Atomic Energy" },
  { value: "DBIOT", label: "DBIOT - Department of Bio Technology" },
  { value: "DCLTR", label: "DCLTR - Ministry of Culture" },
  { value: "DCOYA", label: "DCOYA - Ministry of Corporate Affairs" },
  { value: "DDESW", label: "DDESW - Department of Ex Servicemen Welfare" },
  { value: "DDPRO", label: "DDPRO - Department of Defence Production" },
  { value: "DDRDO", label: "DDRDO - Department of Defence Research and Development" },
  { value: "DEABD", label: "DEABD - Department of Financial Services (Banking Division)" },
  { value: "DEAID", label: "DEAID - Department of Financial Services (Insurance Division)" },
  { value: "DEAPR", label: "DEAPR - Department of Financial Services (Pension Reforms)" },
  { value: "DEMO1", label: "DEMO1 - Organisation for Demonstration" },
  { value: "DEMO2", label: "DEMO2 - For Demonstration to TRAI" },
  { value: "DEMO3", label: "DEMO3 - For Demonstration in D/o Posts" },
  { value: "DEPOJ", label: "DEPOJ - Department of Justice" },
  { value: "DESUC", label: "DESUC - Delhi Transco Limited" },
  { value: "DFSHR", label: "DFSHR - Department of Fisheries" },
  { value: "DHIND", label: "DHIND - Department of Heavy Industry" },
  { value: "DHLTH", label: "DHLTH - Department of Health & Family Welfare" },
  { value: "DHRES", label: "DHRES - Department of Health Research" },
  { value: "DLGLA", label: "DLGLA - Department of Legal Affairs" },
  { value: "DMAFF", label: "DMAFF - Department of Military Affairs" },
  { value: "DOAAC", label: "DOAAC - Department of Agriculture and Farmers Welfare" },
  { value: "DOAHD", label: "DOAHD - Department of Animal Husbandry, Dairying" },
  { value: "DOARE", label: "DOARE - Department of Agriculture Research and Education" },
  { value: "DOCND", label: "DOCND - Ministry of Earth Sciences" },
  { value: "DOCOM", label: "DOCOM - Department of Commerce" },
  { value: "DOCPC", label: "DOCPC - Department of Chemicals and Petrochemicals" },
  { value: "DODAF", label: "DODAF - Department of Empowerment of Persons with Disabilities" },
  { value: "DODIV", label: "DODIV - Department of Investment & Public Asset Management" },
  { value: "DODWS", label: "DODWS - Ministry of Drinking Water and Sanitation" },
  { value: "DOEAF", label: "DOEAF - Department of Economic Affairs ACC Division" },
  { value: "DOEXP", label: "DOEXP - Department of Expenditure" },
  { value: "DOFPD", label: "DOFPD - Department of Food and Public Distribution" },
  { value: "DOFPI", label: "DOFPI - Ministry of Food Processing Industries" },
  { value: "DOFZR", label: "DOFZR - Department of Fertilizers" },
  { value: "DOIPP", label: "DOIPP - Department for Promotion of Industry and Internal Trade" },
  { value: "DOLDR", label: "DOLDR - Department of Land Resources" },
  { value: "DONER", label: "DONER - Ministry of Development of North Eastern Region" },
  { value: "DOPAT", label: "DOPAT - Department of Personnel and Training" },
  { value: "DOPPW", label: "DOPPW - Department of Pension and Pensioners Welfare" },
  { value: "DORLD", label: "DORLD - Department of Rural Development" },
  { value: "DORVU", label: "DORVU - Department of Revenue" },
  { value: "DOSAT", label: "DOSAT - Department of Science and Technology" },
  { value: "DOSEL", label: "DOSEL - Department of School Education and Literacy" },
  { value: "DOSIR", label: "DOSIR - Department of Scientific & Industrial Research" },
  { value: "DOSKD", label: "DOSKD - Ministry of Skill Development and Entrepreneurship" },
  { value: "DOTEL", label: "DOTEL - Department of Telecommunications" },
  { value: "DOURD", label: "DOURD - Ministry of Housing and Urban Affairs" },
  { value: "DOWCD", label: "DOWCD - Ministry of Women and Child Development" },
  { value: "DPG", label: "DPG - Directorate of Public Grievances" },
  { value: "DARPG/D", label: "DARPG/D Alias for DPG - Directorate of Public Grievances" },
  { value: "DPHAM", label: "DPHAM - Department of Pharmaceutical" },
  { value: "DPLNG", label: "DPLNG - NITI Aayog" },
  { value: "DPOST", label: "DPOST - Department of Posts" },
  { value: "DPUBE", label: "DPUBE - Department of Public Enterprises" },
  { value: "DSEHE", label: "DSEHE - Department of Higher Education" },
  { value: "DSPAC", label: "DSPAC - Department of Space" },
  { value: "DSPRT", label: "DSPRT - Department of Sports" },
  { value: "DTCDH", label: "DTCDH - Delhi Transport Corporation" },
  { value: "DTOUR", label: "DTOUR - Ministry of Tourism" },
  { value: "ECCOM", label: "ECCOM - Election Commission of India" },
  { value: "EIGRC", label: "EIGRC - Investment Grievance Redress Cell" },
  { value: "FADSS", label: "FADSS - Department of Defence Finance" },
  { value: "GNCTD", label: "GNCTD - Government of NCT of Delhi" },
  { value: "GOVAN", label: "GOVAN - Government of Andaman & Nicobar" },
  { value: "GOVAP", label: "GOVAP - Government of Andhra Pradesh" },
  { value: "GOVAR", label: "GOVAR - Government of Arunachal Pradesh" },
  { value: "GOVAS", label: "GOVAS - Government of Assam" },
  { value: "GOVBH", label: "GOVBH - Government of Bihar" },
  { value: "GOVCC", label: "GOVCC - Government of Union Territory of Chandigarh" },
  { value: "GOVCH", label: "GOVCH - Government of Chattisgarh" },
  { value: "GOVDD", label: "GOVDD - Government of Union Territory of Dadra & Nagar Haveli" },
  { value: "GOVDN", label: "GOVDN - Government of Union Territory of Daman & Diu" },
  { value: "GOVGJ", label: "GOVGJ - Government of Gujarat" },
  { value: "GOVGO", label: "GOVGO - Government of Goa" },
  { value: "GOVHP", label: "GOVHP - Government of Himachal Pradesh" },
  { value: "GOVHY", label: "GOVHY - Government of Haryana" },
  { value: "GOVJH", label: "GOVJH - Government of Jharkhand" },
  { value: "GOVJK", label: "GOVJK - Government of Jammu and Kashmir" },
  { value: "GOVKL", label: "GOVKL - Government of Kerala" },
  { value: "GOVKN", label: "GOVKN - Government of Karnataka" },
  { value: "GOVLD", label: "GOVLD - Government of Union Territory of Lakshadweep" },
  { value: "GOVLK", label: "GOVLK - Government of Union Territory of Ladakh" },
  { value: "GOVMG", label: "GOVMG - Government of Meghalaya" },
  { value: "GOVMH", label: "GOVMH - Government of Maharashtra" },
  { value: "GOVMN", label: "GOVMN - Government of Manipur" },
  { value: "GOVMP", label: "GOVMP - Government of Madhya Pradesh" },
  { value: "GOVMZ", label: "GOVMZ - Government of Mizoram" },
  { value: "GOVNL", label: "GOVNL - Government of Nagaland" },
  { value: "GOVOR", label: "GOVOR - Government of Odisha" },
  { value: "GOVPB", label: "GOVPB - Government of Punjab" },
  { value: "GOVPY", label: "GOVPY - Government of Puducherry" },
  { value: "GOVRJ", label: "GOVRJ - Government of Rajasthan" },
  { value: "GOVSK", label: "GOVSK - Government of Sikkim" },
  { value: "GOVTG", label: "GOVTG - Government of Telangana" },
  { value: "GOVTN", label: "GOVTN - Government of Tamil Nadu" },
  { value: "GOVTR", label: "GOVTR - Government of Tripura" },
  { value: "GOVUC", label: "GOVUC - Government of Uttarakhand" },
  { value: "GOVUP", label: "GOVUP - Government of Uttar Pradesh" },
  { value: "GOVWB", label: "GOVWB - Government of West Bengal" },
  { value: "JSOLD", label: "JSOLD - Department of Official Language" },
  { value: "LGVED", label: "LGVED - Legislative Department" },
  { value: "MCDPG", label: "MCDPG - OLD MCD not in Use" },
  { value: "MCOAL", label: "MCOAL - Ministry of Coal" },
  { value: "MEAPD", label: "MEAPD - Ministry of External Affairs" },
  { value: "MEAPM", label: "MEAPM - Ministry Of External Affairs (South Block)" },
  { value: "MHABM", label: "MHABM - Department of Border Management" },
  { value: "MHAIS", label: "MHAIS - Department of Internal Security" },
  { value: "MHAJK", label: "MHAJK - Department of J and K Affairs" },
  { value: "MHAST", label: "MHAST - Department of States" },
  { value: "MHUPA", label: "MHUPA - Ministry of Housing and Poverty Alleviation" },
  { value: "MINHA", label: "MINHA - Ministry of Home Affairs" },
  { value: "MINIT", label: "MINIT - Ministry of Electronics & Information Technology" },
  { value: "MINPA", label: "MINPA - Ministry of Parliamentary Affairs" },
  { value: "MINWR", label: "MINWR - Ministry of Water Resources, River Development & Ganga Rejuv" },
  { value: "MMINE", label: "MMINE - Ministry of Mines" },
  { value: "MMSME", label: "MMSME - Ministry of Micro Small and Medium Enterprises" },
  { value: "MNCES", label: "MNCES - Ministry of Non-Conventional Energy Sources" },
  { value: "MOARI", label: "MOARI - Ministry of Agro and Rural Industries" },
  { value: "MOCAV", label: "MOCAV - Ministry of Civil Aviation" },
  { value: "MOCOP", label: "MOCOP - Ministry of Cooperation" },
  { value: "MODEF", label: "MODEF - Department of Defence" },
  { value: "MOEAF", label: "MOEAF - Ministry of Environment, Forest and Climate Change" },
  { value: "MOIAB", label: "MOIAB - Ministry of Information and Broadcasting" },
  { value: "MOLBR", label: "MOLBR - Ministry of Labour and Employment" },
  { value: "MOMAF", label: "MOMAF - Ministry of Minority Affairs" },
  { value: "MONRE", label: "MONRE - Ministry of New and Renewable Energy" },
  { value: "MOOIA", label: "MOOIA - Ministry of Overseas Indian Affairs" },
  { value: "MOPRJ", label: "MOPRJ - Ministry of Panchayati Raj" },
  { value: "MORLY", label: "MORLY - Ministry of Railways ( Railway Board)" },
  { value: "MORTH", label: "MORTH - Ministry of Road Transport and Highways" },
  { value: "MOSJE", label: "MOSJE - Department of Social Justice and Empowerment" },
  { value: "MOSPI", label: "MOSPI - Ministry of Statistics and Programme Implementation" },
  { value: "MOSSI", label: "MOSSI - Ministry of Small Scale Industries" },
  { value: "MOSTL", label: "MOSTL - Ministry of Steel" },
  { value: "MOYAS", label: "MOYAS - Department of Youth Affairs" },
  { value: "MPANG", label: "MPANG - Ministry of Petroleum and Natural Gas" },
  { value: "MPLAN", label: "MPLAN - Unique Identification Authority of India" },
  { value: "MPOWR", label: "MPOWR - Ministry of Power" },
  { value: "MSHPG", label: "MSHPG - Ministry of Shipping" },
  { value: "MTRBL", label: "MTRBL - Ministry of Tribal Affairs" },
  { value: "MTXTL", label: "MTXTL - Ministry of Textiles" },
  { value: "MULTI", label: "MULTI - MULTI" },
  { value: "NAICO", label: "NAICO - Department of AIDS Control" },
  { value: "NDMCA", label: "NDMCA - New Delhi Municipal Council" },
  { value: "NDPLG", label: "NDPLG - North Delhi Power Limited" },
  { value: "NHRCG", label: "NHRCG - National Human Rights Commission" },
  { value: "PMDPG", label: "PMDPG - Performance Management Division, Cabinet Sectt." },
  { value: "PMOPG", label: "PMOPG - Prime Ministers Office" },
  { value: "PRSEC", label: "PRSEC - President's Secretariat" },
  { value: "RBIBK", label: "RBIBK - Reserve Bank of India" },
  { value: "SCCOM", label: "SCCOM - National Commission for Scheduled Caste" },
  { value: "SEBII", label: "SEBII - Securities and Exchange Board of India" },
  { value: "SSCPG", label: "SSCPG - Staff Selection Commission" },
  { value: "UIDAI", label: "UIDAI - Unique Identification Authority of India" },
  { value: "UPSCG", label: "UPSCG - Union Public Service Commission" }
];

export const stateData = [
  { value: 'All', label: 'ALL' },
  { value: 'andaman and nicobar islands', label: 'ANDAMAN AND NICOBAR ISLANDS' },
  { value: 'andhra pradesh', label: 'ANDHRA PRADESH' },
  { value: 'arunachal pradesh', label: 'ARUNACHAL PRADESH' },
  { value: 'assam', label: 'ASSAM' },
  { value: 'bihar', label: 'BIHAR' },
  { value: 'chandigarh', label: 'CHANDIGARH' },
  { value: 'chhattisgarh', label: 'CHHATTISGARH' },
  { value: 'dadra and nagar haveli', label: 'DADRA AND NAGAR HAVELI' },
  { value: 'daman and diu', label: 'DAMAN AND DIU' },
  { value: 'delhi', label: 'DELHI' },
  { value: 'goa', label: 'GOA' },
  { value: 'gujarat', label: 'GUJARAT' },
  { value: 'haryana', label: 'HARYANA' },
  { value: 'himachal pradesh', label: 'HIMACHAL PRADESH' },
  { value: 'jammu and kashmir', label: 'JAMMU AND KASHMIR' },
  { value: 'jharkhand', label: 'JHARKHAND' },
  { value: 'karnataka', label: 'KARNATAKA' },
  { value: 'kerala', label: 'KERALA' },
  { value: 'ladakh', label: 'LADAKH' },
  { value: 'lakshadweep', label: 'LAKSHADWEEP' },
  { value: 'madhya pradesh', label: 'MADHYA PRADESH' },
  { value: 'maharashtra', label: 'MAHARASHTRA' },
  { value: 'manipur', label: 'MANIPUR' },
  { value: 'meghalaya', label: 'MEGHALAYA' },
  { value: 'mizoram', label: 'MIZORAM' },
  { value: 'nagaland', label: 'NAGALAND' },
  { value: 'odisha', label: 'ODISHA' },
  { value: 'puducherry', label: 'PUDUCHERRY' },
  { value: 'punjab', label: 'PUNJAB' },
  { value: 'rajasthan', label: 'RAJASTHAN' },
  { value: 'sikkim', label: 'SIKKIM' },
  { value: 'tamilnadu', label: 'TAMILNADU' },
  { value: 'telangana', label: 'TELANGANA' },
  { value: 'tripura', label: 'TRIPURA' },
  { value: 'uttar pradesh', label: 'UTTAR PRADESH' },
  { value: 'uttarakhand', label: 'UTTARAKHAND' },
  { value: 'west bengal', label: 'WEST BENGAL' },
];


export default { authorsTableData, grievanceTableData, departmentData, stateData };
