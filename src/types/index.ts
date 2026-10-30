export interface Patient {
  hn: string;
  cid13: string;
  prefix: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD or DD/MM/BE
  houseNo: string;
  moo: string;
  village33: string;
  villageOutside: string;
  tambon: string;
  amphoe: string;
  province: string;
  phone: string;
  serviceCode: string;
  serviceName: string;
  treatmentRight: string;
  ht: string; // diagnosis date
  dm: string; // diagnosis date
  dlp: string; // diagnosis date
  status: 'รักษาอยู่' | 'รักษา รพ.สต.' | 'ติดตามไม่ได้' | 'เสียชีวิต';
  deathDate?: string;
  note?: string;
  updateDate?: string;
  updaterName?: string;
}

export interface FundusDate {
  id: string;
  date: string; // DD/MM/YYYY พ.ศ.
  serviceCode: string;
  serviceName: string;
  recorderName: string;
  recordDate: string;
}

export interface FundusRecord {
  id: string;
  date: string;
  hn: string;
  prefix: string;
  firstName: string;
  lastName: string;
  weight: string;
  height: string;
  waist: string;
  sbp: string;
  dbp: string;
  pr: string;
  resultLeft: string;
  resultRight: string;
  nextAppointment: string;
  appointmentStatus: string;
  appointmentNote: string;
  sessionID: string;
  recorderName?: string;
  recordDate?: string;
  updaterName?: string;
  updateDate?: string;
}

export interface TelemedDate {
  id: string;
  date: string;
  serviceCode: string;
  serviceName: string;
  recorderName: string;
  recordDate: string;
}

export interface TelemedRecord {
  id: string;
  date: string; // dateId or date string
  hn: string;
  prefix: string;
  firstName: string;
  lastName: string;
  ht: string;
  dm: string;
  dlp: string;
  otherDisease: string;
  phone: string;
  details: string;
  consent: 'มี' | 'ไม่มี' | '';
  serviceCode: string;
  serviceName: string;
  room: string;
  provider: string;
  appointmentMonth: string;
  appointmentDate: string;
  note: string;
  sessionID: string;
  recorderName?: string;
  recordDate?: string;
  updaterName?: string;
  updateDate?: string;
}

export interface LabRecord {
  id: string; // YYYYMMDD-HN
  name: string;
  hn: string;
  serviceUnit: string;
  fbs: string;
  hba1c: string;
  bun: string;
  cr: string;
  tc: string;
  tg: string;
  hdl: string;
  ldl: string;
  serviceDate: string; // DD/MM/YYYY (พ.ศ.)
  visitNum: string;
  bpTop: string;
  bpBottom: string;
  weight: string;
  height: string;
  pr: string;
  rr: string;
  egfr: string;
}

export interface FootRecord {
  id: string;
  date: string;
  hn: string;
  name: string;
  monofilamentLeft: 'ปกติ' | 'ผิดปกติ';
  monofilamentRight: 'ปกติ' | 'ผิดปกติ';
  pulseLeft: 'คลำได้' | 'คลำไม่ได้';
  pulseRight: 'คลำได้' | 'คลำไม่ได้';
  deformity: 'ไม่มี' | 'มี';
  ulcer: 'ไม่มี' | 'มี';
  riskLevel: 'ความเสี่ยงต่ำ' | 'ความเสี่ยงปานกลาง' | 'ความเสี่ยงสูง' | 'ความเสี่ยงสูงมาก';
  advice: string;
}

export interface RemissionRecord {
  id: string;
  hn: string;
  name: string;
  enrollDate: string;
  baselineHba1c: string;
  currentHba1c: string;
  status: 'อยู่ในเกณฑ์สงบ (Remission)' | 'กำลังปรับเปลี่ยนพฤติกรรม' | 'หยุดยาเบาหวานแล้ว' | 'กลับมาใช้ยา';
  weightLossKg: string;
  fastingGlucose: string;
  doctorNote: string;
}

export interface DownloadFile {
  fileId: string;
  fileName: string;
  fileSize: string;
  updatedDate: string;
  fileUrl: string;
  fileType: string;
}

export interface User {
  username: string;
  name: string;
  fullName: string;
  role: 'admin' | 'staff' | string;
  password?: string;
  token?: string;
}

export interface Hospital {
  code: string;
  name: string;
}

export interface ServiceUnitStat {
  serviceName: string;
  patientCount: number;
}

export interface DashboardFundusSummary {
  id: string;
  examDate: string; // e.g. '2569-10-01'
  location: string;
  total: number;
  noDR: number;
  mildNPDR: number;
  moderateNPDR: number;
  severeNPDR: number;
  pdr: number;
  poorView: number;
}

export interface LabNormal {
  min: number | null;
  max: number | null;
  unit: string;
  description: string;
}

