import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Patient,
  FundusDate,
  FundusRecord,
  TelemedDate,
  TelemedRecord,
  LabRecord,
  DownloadFile,
  User,
  ServiceUnitStat,
  DashboardFundusSummary
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_FUNDUS_DATES,
  INITIAL_FUNDUS_RECORDS,
  INITIAL_TELEMED_DATES,
  INITIAL_TELEMED_RECORDS,
  INITIAL_LAB_RECORDS,
  INITIAL_DOWNLOAD_FILES,
  INITIAL_SERVICE_UNIT_STATS,
  INITIAL_DASHBOARD_FUNDUS
} from '../data/initialData';


// Local storage keys
const LS_KEYS = {
  SUPABASE_URL: 'ncd_supabase_url',
  SUPABASE_KEY: 'ncd_supabase_key',
  PATIENTS: 'ncd_patients_v1',
  FUNDUS_DATES: 'ncd_fundus_dates_v1',
  FUNDUS_RECORDS: 'ncd_fundus_records_v1',
  TELEMED_DATES: 'ncd_telemed_dates_v1',
  TELEMED_RECORDS: 'ncd_telemed_records_v1',
  LAB_RECORDS: 'ncd_lab_records_v1',
  DOWNLOAD_FILES: 'ncd_download_files_v1',
  CURRENT_USER: 'ncd_current_user_v1',
  SERVICE_UNIT_STATS: 'ncd_service_unit_stats_v1',
  DASHBOARD_FUNDUS: 'ncd_dashboard_fundus_v1'
};


// SQL Schema for Supabase
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- NCD Center - Hong Ya Thai (โฮงยาไทย) Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  hn TEXT PRIMARY KEY,
  cid13 TEXT,
  prefix TEXT,
  first_name TEXT,
  last_name TEXT,
  birth_date TEXT,
  house_no TEXT,
  moo TEXT,
  village33 TEXT,
  village_outside TEXT,
  tambon TEXT,
  amphoe TEXT,
  province TEXT,
  phone TEXT,
  service_code TEXT,
  service_name TEXT,
  treatment_right TEXT,
  ht TEXT,
  dm TEXT,
  dlp TEXT,
  status TEXT DEFAULT 'รักษาอยู่',
  death_date TEXT,
  note TEXT,
  update_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updater_name TEXT
);

-- 2. Fundus Exam Dates Table
CREATE TABLE IF NOT EXISTS fundus_dates (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  service_code TEXT,
  service_name TEXT,
  recorder_name TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fundus Patient Records Table
CREATE TABLE IF NOT EXISTS fundus_records (
  id TEXT PRIMARY KEY,
  date TEXT,
  hn TEXT,
  prefix TEXT,
  first_name TEXT,
  last_name TEXT,
  weight TEXT,
  height TEXT,
  waist TEXT,
  sbp TEXT,
  dbp TEXT,
  pr TEXT,
  result_left TEXT,
  result_right TEXT,
  next_appointment TEXT,
  appointment_status TEXT,
  appointment_note TEXT,
  session_id TEXT REFERENCES fundus_dates(id) ON DELETE CASCADE,
  recorder_name TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updater_name TEXT,
  update_date TIMESTAMP WITH TIME ZONE
);

-- 4. TeleMed Dates Table
CREATE TABLE IF NOT EXISTS telemed_dates (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  service_code TEXT,
  service_name TEXT,
  recorder_name TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TeleMed Records Table
CREATE TABLE IF NOT EXISTS telemed_records (
  id TEXT PRIMARY KEY,
  date TEXT,
  hn TEXT,
  prefix TEXT,
  first_name TEXT,
  last_name TEXT,
  ht TEXT,
  dm TEXT,
  dlp TEXT,
  other_disease TEXT,
  phone TEXT,
  details TEXT,
  consent TEXT,
  service_code TEXT,
  service_name TEXT,
  room TEXT,
  provider TEXT,
  appointment_month TEXT,
  appointment_date TEXT,
  note TEXT,
  session_id TEXT REFERENCES telemed_dates(id) ON DELETE CASCADE,
  recorder_name TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updater_name TEXT,
  update_date TIMESTAMP WITH TIME ZONE
);

-- 6. Lab Blood Test Records Table
CREATE TABLE IF NOT EXISTS lab_records (
  id TEXT PRIMARY KEY,
  name TEXT,
  hn TEXT NOT NULL,
  service_unit TEXT,
  fbs TEXT,
  hba1c TEXT,
  bun TEXT,
  cr TEXT,
  tc TEXT,
  tg TEXT,
  hdl TEXT,
  ldl TEXT,
  service_date TEXT,
  visit_num TEXT,
  bp_top TEXT,
  bp_bottom TEXT,
  weight TEXT,
  height TEXT,
  pr TEXT,
  rr TEXT,
  egfr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Download Documents Table
CREATE TABLE IF NOT EXISTS download_files (
  file_id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size TEXT,
  updated_date TEXT,
  file_url TEXT,
  file_type TEXT
);

-- 8. Dashboard Service Unit Stats (จาก Google Sheet เดิม)
CREATE TABLE IF NOT EXISTS dashboard_service_stats (
  service_name TEXT PRIMARY KEY,
  patient_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Dashboard Fundus Eye Screening Summary (จาก Google Sheet เดิม)
CREATE TABLE IF NOT EXISTS dashboard_fundus_summary (
  id TEXT PRIMARY KEY,
  exam_date TEXT NOT NULL,
  location TEXT NOT NULL,
  total INTEGER DEFAULT 0,
  no_dr INTEGER DEFAULT 0,
  mild_npdr INTEGER DEFAULT 0,
  moderate_npdr INTEGER DEFAULT 0,
  severe_npdr INTEGER DEFAULT 0,
  pdr INTEGER DEFAULT 0,
  poor_view INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Allow Read/Write for Authenticated / Anon (Demo)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON patients FOR ALL USING (true);

ALTER TABLE fundus_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON fundus_dates FOR ALL USING (true);

ALTER TABLE fundus_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON fundus_records FOR ALL USING (true);

ALTER TABLE telemed_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON telemed_dates FOR ALL USING (true);

ALTER TABLE telemed_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON telemed_records FOR ALL USING (true);

ALTER TABLE lab_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON lab_records FOR ALL USING (true);

ALTER TABLE download_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON download_files FOR ALL USING (true);

ALTER TABLE dashboard_service_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON dashboard_service_stats FOR ALL USING (true);

ALTER TABLE dashboard_fundus_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON dashboard_fundus_summary FOR ALL USING (true);
`;

export const SUPABASE_GOOGLE_SHEET_SEED_SQL = `-- ========================================================
-- คำสั่ง SQL สำหรับนำเข้าข้อมูลจาก Google Sheet เดิม เข้า Supabase
-- วางใน Supabase SQL Editor แล้วกด Run ได้ทันที
-- ========================================================

-- 1. บันทึกข้อมูลจำนวนผู้ป่วยจำแนกตามหน่วยบริการ (41 แห่ง)
INSERT INTO dashboard_service_stats (service_name, patient_count) VALUES
('ศูนย์สุขภาพชุมชนเมืองเชียงราย (PCU)', 3105),
('ห้วยสัก', 1940),
('บ้านดู่', 1890),
('ป่าอ้อดอนชัย', 1617),
('แม่ยาว', 1513),
('ดอยลาน', 1378),
('สันทราย', 1366),
('รพศ.เบอร์ 4, 14', 1363),
('ท่าสาย', 1330),
('สันตาลเหลือง', 1167),
('สันหนอง', 1002),
('ริมกก', 843),
('น้ำลัด', 834),
('แม่กรณ์', 809),
('เรือนจำกลาง', 695),
('ดอยฮาง', 614),
('ร่องปลาขาว', 605),
('โล๊ะป่าตุ้ม', 529),
('โป่งพระบาท', 511),
('ปางขอน', 483),
('รอบเวียง', 478),
('ร่องเบ้อ', 450),
('หัวฝาย', 403),
('แม่ข้าวต้ม', 336),
('พนาสวรรค์', 304),
('ป่ายางมนต์', 304),
('นางแล', 261),
('รวมมิตร', 261),
('ดงเทพนิมิตร', 260),
('ปางริมกรณ์', 255),
('ท่าสุด', 226),
('ห้วยชมภู', 193),
('ห้วยแม่ซ้าย', 158),
('รพ.เชียงราย', 91),
('จะคือ', 72),
('โล๊ะป่าห้า', 58),
('นอกเขต อ.เมืองเชียงราย', 50),
('รพ.โอเวอร์บรุ๊ค', 1),
('รพ.ศรีบุรินทร์', 1),
('คลินิกหมอครอบครัว (PCC)', 0),
('รพ.ค่ายเม็งรายมหาราช', 0)
ON CONFLICT (service_name) DO UPDATE SET patient_count = EXCLUDED.patient_count;

-- 2. บันทึกข้อมูลผลการตรวจคัดกรองจอประสาทตาเบาหวาน (Fundus Summary)
INSERT INTO dashboard_fundus_summary (id, exam_date, location, total, no_dr, mild_npdr, moderate_npdr, severe_npdr, pdr, poor_view) VALUES
('f-summary-1', '2569-10-01', 'สันทราย', 137, 113, 9, 14, 1, 0, 0),
('f-summary-2', '2569-10-12', 'สันทราย', 99, 79, 5, 15, 0, 0, 0),
('f-summary-3', '2569-10-15', 'บ้านดู่', 147, 121, 6, 20, 0, 0, 0),
('f-summary-4', '2569-10-16', 'บ้านดู่', 178, 126, 16, 28, 6, 1, 0),
('f-summary-5', '2569-10-22', 'ดงเทพนิมิตร', 74, 53, 2, 19, 0, 0, 0),
('f-summary-6', '2569-10-29', 'ท่าสาย', 141, 107, 13, 20, 0, 0, 0),
('f-summary-7', '2569-10-30', 'ท่าสาย', 118, 87, 6, 20, 2, 2, 0)
ON CONFLICT (id) DO UPDATE SET
  total = EXCLUDED.total,
  no_dr = EXCLUDED.no_dr,
  mild_npdr = EXCLUDED.mild_npdr,
  moderate_npdr = EXCLUDED.moderate_npdr,
  severe_npdr = EXCLUDED.severe_npdr,
  pdr = EXCLUDED.pdr,
  poor_view = EXCLUDED.poor_view;
`;


export class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient | null = null;
  private url: string = '';
  private key: string = '';
  private isConnected: boolean = false;

  private constructor() {
    this.initCredentials();
    this.initClient();
  }

  public static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  private initCredentials() {
    // Check localStorage first, then environment variable
    const storedUrl = localStorage.getItem(LS_KEYS.SUPABASE_URL);
    const storedKey = localStorage.getItem(LS_KEYS.SUPABASE_KEY);

    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    this.url = storedUrl || envUrl || '';
    this.key = storedKey || envKey || '';
  }

  private initClient() {
    if (this.url && this.key && this.url.startsWith('http')) {
      try {
        this.client = createClient(this.url, this.key);
        this.isConnected = true;
      } catch (e) {
        console.warn('Failed to initialize Supabase client:', e);
        this.client = null;
        this.isConnected = false;
      }
    } else {
      this.client = null;
      this.isConnected = false;
    }
  }

  public setCredentials(url: string, key: string): boolean {
    this.url = url.trim();
    this.key = key.trim();
    localStorage.setItem(LS_KEYS.SUPABASE_URL, this.url);
    localStorage.setItem(LS_KEYS.SUPABASE_KEY, this.key);
    this.initClient();
    return this.isConnected;
  }

  public clearCredentials() {
    this.url = '';
    this.key = '';
    localStorage.removeItem(LS_KEYS.SUPABASE_URL);
    localStorage.removeItem(LS_KEYS.SUPABASE_KEY);
    this.client = null;
    this.isConnected = false;
  }

  public getStatus() {
    return {
      hasUrl: Boolean(this.url),
      hasKey: Boolean(this.key),
      url: this.url,
      isConnected: this.isConnected,
      mode: this.isConnected ? 'Supabase Live' : 'Local Storage Mode'
    };
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'ยังไม่ได้ระบุ Supabase URL หรือ Anon Key' };
    }
    try {
      const { error } = await this.client.from('patients').select('hn').limit(1);
      if (error) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'เชื่อมต่อ Supabase ได้แล้ว แต่ยังไม่ได้สร้างตาราง (Table)! กรุณารัน SQL Schema ในแท็บ SQL Editor ของ Supabase'
          };
        }
        return { success: false, message: `Supabase Error: ${error.message}` };
      }
      return { success: true, message: 'เชื่อมต่อกับฐานข้อมูล Supabase สำเร็จเรียบร้อยแล้ว!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'การเชื่อมต่อล้มเหลว' };
    }
  }

  // ----------------------------------------------------
  // DATA OPERATIONS WITH AUTO FALLBACK TO LOCAL STORAGE
  // ----------------------------------------------------

  // PATIENTS
  public async getPatients(): Promise<Patient[]> {
    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client.from('patients').select('*').order('update_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDbPatient);
        }
      } catch (e) {
        console.warn('Fallback to local patients due to error:', e);
      }
    }
    return this.getLocal<Patient[]>(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  public async savePatient(patient: Patient): Promise<Patient> {
    const list = await this.getPatients();
    const idx = list.findIndex(p => p.hn === patient.hn);
    let updatedList: Patient[];
    if (idx >= 0) {
      updatedList = [...list];
      updatedList[idx] = patient;
    } else {
      updatedList = [patient, ...list];
    }
    this.setLocal(LS_KEYS.PATIENTS, updatedList);

    if (this.isConnected && this.client) {
      try {
        await this.client.from('patients').upsert(this.mapToDbPatient(patient));
      } catch (e) {
        console.warn('Could not sync patient to Supabase:', e);
      }
    }
    return patient;
  }

  public async deletePatient(hn: string): Promise<boolean> {
    const list = await this.getPatients();
    const filtered = list.filter(p => p.hn !== hn);
    this.setLocal(LS_KEYS.PATIENTS, filtered);

    if (this.isConnected && this.client) {
      try {
        await this.client.from('patients').delete().eq('hn', hn);
      } catch (e) {
        console.warn('Could not delete patient from Supabase:', e);
      }
    }
    return true;
  }

  // FUNDUS DATES & RECORDS
  public async getFundusDates(): Promise<FundusDate[]> {
    return this.getLocal<FundusDate[]>(LS_KEYS.FUNDUS_DATES, INITIAL_FUNDUS_DATES);
  }

  public async saveFundusDate(date: FundusDate): Promise<FundusDate> {
    const dates = await this.getFundusDates();
    const updated = [date, ...dates];
    this.setLocal(LS_KEYS.FUNDUS_DATES, updated);
    return date;
  }

  public async deleteFundusDate(dateId: string): Promise<boolean> {
    const dates = await this.getFundusDates();
    this.setLocal(LS_KEYS.FUNDUS_DATES, dates.filter(d => d.id !== dateId));
    const records = await this.getFundusRecords();
    this.setLocal(LS_KEYS.FUNDUS_RECORDS, records.filter(r => r.sessionID !== dateId));
    return true;
  }

  public async getFundusRecords(): Promise<FundusRecord[]> {
    return this.getLocal<FundusRecord[]>(LS_KEYS.FUNDUS_RECORDS, INITIAL_FUNDUS_RECORDS);
  }

  public async saveFundusRecord(rec: FundusRecord): Promise<FundusRecord> {
    const list = await this.getFundusRecords();
    const idx = list.findIndex(r => r.id === rec.id);
    let updated: FundusRecord[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = rec;
    } else {
      updated = [rec, ...list];
    }
    this.setLocal(LS_KEYS.FUNDUS_RECORDS, updated);
    return rec;
  }

  public async deleteFundusRecord(recId: string): Promise<boolean> {
    const list = await this.getFundusRecords();
    this.setLocal(LS_KEYS.FUNDUS_RECORDS, list.filter(r => r.id !== recId));
    return true;
  }

  // TELEMED DATES & RECORDS
  public async getTelemedDates(): Promise<TelemedDate[]> {
    return this.getLocal<TelemedDate[]>(LS_KEYS.TELEMED_DATES, INITIAL_TELEMED_DATES);
  }

  public async saveTelemedDate(date: TelemedDate): Promise<TelemedDate> {
    const dates = await this.getTelemedDates();
    const updated = [date, ...dates];
    this.setLocal(LS_KEYS.TELEMED_DATES, updated);
    return date;
  }

  public async deleteTelemedDate(dateId: string): Promise<boolean> {
    const dates = await this.getTelemedDates();
    this.setLocal(LS_KEYS.TELEMED_DATES, dates.filter(d => d.id !== dateId));
    const records = await this.getTelemedRecords();
    this.setLocal(LS_KEYS.TELEMED_RECORDS, records.filter(r => r.sessionID !== dateId && r.date !== dateId));
    return true;
  }

  public async getTelemedRecords(): Promise<TelemedRecord[]> {
    return this.getLocal<TelemedRecord[]>(LS_KEYS.TELEMED_RECORDS, INITIAL_TELEMED_RECORDS);
  }

  public async saveTelemedRecord(rec: TelemedRecord): Promise<TelemedRecord> {
    const list = await this.getTelemedRecords();
    const idx = list.findIndex(r => r.id === rec.id);
    let updated: TelemedRecord[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = rec;
    } else {
      updated = [rec, ...list];
    }
    this.setLocal(LS_KEYS.TELEMED_RECORDS, updated);
    return rec;
  }

  public async deleteTelemedRecord(recId: string): Promise<boolean> {
    const list = await this.getTelemedRecords();
    this.setLocal(LS_KEYS.TELEMED_RECORDS, list.filter(r => r.id !== recId));
    return true;
  }

  // LAB RECORDS
  public async getLabRecords(): Promise<LabRecord[]> {
    return this.getLocal<LabRecord[]>(LS_KEYS.LAB_RECORDS, INITIAL_LAB_RECORDS);
  }

  public async saveLabRecordsBatch(records: LabRecord[], overwrite: boolean = false): Promise<{ savedCount: number }> {
    const current = await this.getLabRecords();
    const map = new Map<string, LabRecord>();

    if (!overwrite) {
      current.forEach(r => map.set(r.id, r));
      records.forEach(r => {
        if (!map.has(r.id)) map.set(r.id, r);
      });
    } else {
      current.forEach(r => map.set(r.id, r));
      records.forEach(r => map.set(r.id, r));
    }

    const merged = Array.from(map.values());
    this.setLocal(LS_KEYS.LAB_RECORDS, merged);
    return { savedCount: records.length };
  }

  public async deleteLabRecordsByDate(dateStr: string): Promise<number> {
    const current = await this.getLabRecords();
    const remaining = current.filter(r => r.serviceDate !== dateStr);
    const deletedCount = current.length - remaining.length;
    this.setLocal(LS_KEYS.LAB_RECORDS, remaining);
    return deletedCount;
  }

  public async deleteLabRecordById(id: string): Promise<boolean> {
    const current = await this.getLabRecords();
    this.setLocal(LS_KEYS.LAB_RECORDS, current.filter(r => r.id !== id));
    return true;
  }

  // DOWNLOAD FILES
  public async getDownloadFiles(): Promise<DownloadFile[]> {
    return this.getLocal<DownloadFile[]>(LS_KEYS.DOWNLOAD_FILES, INITIAL_DOWNLOAD_FILES);
  }

  public async saveDownloadFile(file: DownloadFile): Promise<DownloadFile> {
    const list = await this.getDownloadFiles();
    const idx = list.findIndex(f => f.fileId === file.fileId);
    let updated: DownloadFile[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = file;
    } else {
      updated = [file, ...list];
    }
    this.setLocal(LS_KEYS.DOWNLOAD_FILES, updated);
    return file;
  }

  public async deleteDownloadFile(fileId: string): Promise<boolean> {
    const list = await this.getDownloadFiles();
    this.setLocal(LS_KEYS.DOWNLOAD_FILES, list.filter(f => f.fileId !== fileId));
    return true;
  }

  // DASHBOARD SERVICE UNIT STATS (จาก Google Sheet เดิม)
  public async getServiceUnitStats(): Promise<ServiceUnitStat[]> {
    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('dashboard_service_stats')
          .select('*')
          .order('patient_count', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(r => ({
            serviceName: r.service_name,
            patientCount: Number(r.patient_count) || 0
          }));
        }
      } catch (e) {
        console.warn('Fallback to local service unit stats:', e);
      }
    }
    return this.getLocal<ServiceUnitStat[]>(LS_KEYS.SERVICE_UNIT_STATS, INITIAL_SERVICE_UNIT_STATS);
  }

  public async saveServiceUnitStats(list: ServiceUnitStat[]): Promise<void> {
    this.setLocal(LS_KEYS.SERVICE_UNIT_STATS, list);
    if (this.isConnected && this.client) {
      try {
        const rows = list.map(item => ({
          service_name: item.serviceName,
          patient_count: item.patientCount,
          updated_at: new Date().toISOString()
        }));
        await this.client.from('dashboard_service_stats').upsert(rows);
      } catch (e) {
        console.warn('Could not sync service stats to Supabase:', e);
      }
    }
  }

  // DASHBOARD FUNDUS SUMMARY (จาก Google Sheet เดิม)
  public async getDashboardFundus(): Promise<DashboardFundusSummary[]> {
    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('dashboard_fundus_summary')
          .select('*')
          .order('exam_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(r => ({
            id: r.id,
            examDate: r.exam_date,
            location: r.location,
            total: Number(r.total) || 0,
            noDR: Number(r.no_dr) || 0,
            mildNPDR: Number(r.mild_npdr) || 0,
            moderateNPDR: Number(r.moderate_npdr) || 0,
            severeNPDR: Number(r.severe_npdr) || 0,
            pdr: Number(r.pdr) || 0,
            poorView: Number(r.poor_view) || 0
          }));
        }
      } catch (e) {
        console.warn('Fallback to local dashboard fundus:', e);
      }
    }
    return this.getLocal<DashboardFundusSummary[]>(LS_KEYS.DASHBOARD_FUNDUS, INITIAL_DASHBOARD_FUNDUS);
  }

  public async saveDashboardFundus(list: DashboardFundusSummary[]): Promise<void> {
    this.setLocal(LS_KEYS.DASHBOARD_FUNDUS, list);
    if (this.isConnected && this.client) {
      try {
        const rows = list.map(r => ({
          id: r.id,
          exam_date: r.examDate,
          location: r.location,
          total: r.total,
          no_dr: r.noDR,
          mild_npdr: r.mildNPDR,
          moderate_npdr: r.moderateNPDR,
          severe_npdr: r.severeNPDR,
          pdr: r.pdr,
          poor_view: r.poorView,
          updated_at: new Date().toISOString()
        }));
        await this.client.from('dashboard_fundus_summary').upsert(rows);
      } catch (e) {
        console.warn('Could not sync fundus summaries to Supabase:', e);
      }
    }
  }

  // ซิงก์ข้อมูลจาก Google Sheet เดิม ไปยัง Supabase โดยตรง
  public async syncGoogleSheetDataToSupabase(): Promise<{ success: boolean; message: string; count: number }> {
    if (!this.client || !this.isConnected) {
      // บันทึกลง local ทันที
      this.setLocal(LS_KEYS.SERVICE_UNIT_STATS, INITIAL_SERVICE_UNIT_STATS);
      this.setLocal(LS_KEYS.DASHBOARD_FUNDUS, INITIAL_DASHBOARD_FUNDUS);
      return {
        success: true,
        count: INITIAL_SERVICE_UNIT_STATS.length + INITIAL_DASHBOARD_FUNDUS.length,
        message: 'นำเข้าข้อมูล Google Sheet เดิมเข้าสู่ระบบ Local Storage สำเร็จเรียบร้อย (พร้อมแสดงผลทันที)'
      };
    }

    try {
      const serviceRows = INITIAL_SERVICE_UNIT_STATS.map(s => ({
        service_name: s.serviceName,
        patient_count: s.patientCount,
        updated_at: new Date().toISOString()
      }));
      const fundusRows = INITIAL_DASHBOARD_FUNDUS.map(f => ({
        id: f.id,
        exam_date: f.examDate,
        location: f.location,
        total: f.total,
        no_dr: f.noDR,
        mild_npdr: f.mildNPDR,
        moderate_npdr: f.moderateNPDR,
        severe_npdr: f.severeNPDR,
        pdr: f.pdr,
        poor_view: f.poorView,
        updated_at: new Date().toISOString()
      }));

      const { error: err1 } = await this.client.from('dashboard_service_stats').upsert(serviceRows);
      const { error: err2 } = await this.client.from('dashboard_fundus_summary').upsert(fundusRows);

      if (err1 || err2) {
        const errMsg = (err1 || err2)?.message;
        return {
          success: false,
          count: 0,
          message: `Supabase Error: ${errMsg}. แนะนำให้กดแท็บ "SQL Schema" แล้วรันคำสั่งสร้างตารางใน Supabase ก่อน`
        };
      }

      this.setLocal(LS_KEYS.SERVICE_UNIT_STATS, INITIAL_SERVICE_UNIT_STATS);
      this.setLocal(LS_KEYS.DASHBOARD_FUNDUS, INITIAL_DASHBOARD_FUNDUS);

      return {
        success: true,
        count: serviceRows.length + fundusRows.length,
        message: `นำเข้าข้อมูล Google Sheet (หน่วยบริการ 41 แห่ง และประวัติคัดกรองจอตา 7 รอบ) เข้า Supabase สำเร็จเรียบร้อยแล้ว!`
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        message: e.message || 'เกิดข้อผิดพลาดในการซิงก์ข้อมูล'
      };
    }
  }

  // BULK RESET / RESTORE DEMO
  public resetToDefaultDemoData() {
    this.setLocal(LS_KEYS.PATIENTS, INITIAL_PATIENTS);
    this.setLocal(LS_KEYS.FUNDUS_DATES, INITIAL_FUNDUS_DATES);
    this.setLocal(LS_KEYS.FUNDUS_RECORDS, INITIAL_FUNDUS_RECORDS);
    this.setLocal(LS_KEYS.TELEMED_DATES, INITIAL_TELEMED_DATES);
    this.setLocal(LS_KEYS.TELEMED_RECORDS, INITIAL_TELEMED_RECORDS);
    this.setLocal(LS_KEYS.LAB_RECORDS, INITIAL_LAB_RECORDS);
    this.setLocal(LS_KEYS.DOWNLOAD_FILES, INITIAL_DOWNLOAD_FILES);
    this.setLocal(LS_KEYS.SERVICE_UNIT_STATS, INITIAL_SERVICE_UNIT_STATS);
    this.setLocal(LS_KEYS.DASHBOARD_FUNDUS, INITIAL_DASHBOARD_FUNDUS);
  }

  // EXPORT ALL DATA AS JSON
  public async exportAllData() {
    return {
      exportedAt: new Date().toISOString(),
      serviceUnitStats: await this.getServiceUnitStats(),
      dashboardFundus: await this.getDashboardFundus(),
      patients: await this.getPatients(),
      fundusDates: await this.getFundusDates(),
      fundusRecords: await this.getFundusRecords(),
      telemedDates: await this.getTelemedDates(),
      telemedRecords: await this.getTelemedRecords(),
      labRecords: await this.getLabRecords(),
      downloadFiles: await this.getDownloadFiles()
    };
  }


  // IMPORT DATA FROM JSON
  public importJsonData(data: any): { success: boolean; message: string } {
    try {
      if (data.patients && Array.isArray(data.patients)) {
        this.setLocal(LS_KEYS.PATIENTS, data.patients);
      }
      if (data.fundusDates && Array.isArray(data.fundusDates)) {
        this.setLocal(LS_KEYS.FUNDUS_DATES, data.fundusDates);
      }
      if (data.fundusRecords && Array.isArray(data.fundusRecords)) {
        this.setLocal(LS_KEYS.FUNDUS_RECORDS, data.fundusRecords);
      }
      if (data.telemedDates && Array.isArray(data.telemedDates)) {
        this.setLocal(LS_KEYS.TELEMED_DATES, data.telemedDates);
      }
      if (data.telemedRecords && Array.isArray(data.telemedRecords)) {
        this.setLocal(LS_KEYS.TELEMED_RECORDS, data.telemedRecords);
      }
      if (data.labRecords && Array.isArray(data.labRecords)) {
        this.setLocal(LS_KEYS.LAB_RECORDS, data.labRecords);
      }
      if (data.downloadFiles && Array.isArray(data.downloadFiles)) {
        this.setLocal(LS_KEYS.DOWNLOAD_FILES, data.downloadFiles);
      }
      return { success: true, message: 'นำเข้าข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว' };
    } catch (e: any) {
      return { success: false, message: e.message || 'รูปแบบไฟล์ JSON ไม่ถูกต้อง' };
    }
  }

  // CURRENT USER SESSION
  public getCurrentUser(): User {
    const raw = localStorage.getItem(LS_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return {
      username: 'admin',
      name: 'ผู้ดูแลระบบ PCU โฮงยาไทย',
      fullName: 'ผู้ดูแลระบบ PCU โฮงยาไทย',
      role: 'admin'
    };
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEYS.CURRENT_USER);
    }
  }

  // HELPERS
  private getLocal<T>(key: string, defaultVal: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultVal;
    }
  }

  private setLocal<T>(key: string, val: T): void {
    localStorage.setItem(key, JSON.stringify(val));
  }

  private mapFromDbPatient(row: any): Patient {
    return {
      hn: row.hn || '',
      cid13: row.cid13 || '',
      prefix: row.prefix || '',
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      birthDate: row.birth_date || '',
      houseNo: row.house_no || '',
      moo: row.moo || '',
      village33: row.village33 || '',
      villageOutside: row.village_outside || '',
      tambon: row.tambon || '',
      amphoe: row.amphoe || '',
      province: row.province || '',
      phone: row.phone || '',
      serviceCode: row.service_code || '',
      serviceName: row.service_name || '',
      treatmentRight: row.treatment_right || '',
      ht: row.ht || '',
      dm: row.dm || '',
      dlp: row.dlp || '',
      status: row.status || 'รักษาอยู่',
      deathDate: row.death_date || '',
      note: row.note || '',
      updateDate: row.update_date || '',
      updaterName: row.updater_name || ''
    };
  }

  private mapToDbPatient(p: Patient): any {
    return {
      hn: p.hn,
      cid13: p.cid13,
      prefix: p.prefix,
      first_name: p.firstName,
      last_name: p.lastName,
      birth_date: p.birthDate,
      house_no: p.houseNo,
      moo: p.moo,
      village33: p.village33,
      village_outside: p.villageOutside,
      tambon: p.tambon,
      amphoe: p.amphoe,
      province: p.province,
      phone: p.phone,
      service_code: p.serviceCode,
      service_name: p.serviceName,
      treatment_right: p.treatmentRight,
      ht: p.ht,
      dm: p.dm,
      dlp: p.dlp,
      status: p.status,
      death_date: p.deathDate,
      note: p.note,
      update_date: new Date().toISOString(),
      updater_name: p.updaterName || 'System'
    };
  }
}

export const supabaseManager = SupabaseManager.getInstance();
