import React, { useState, useEffect } from 'react';
import { supabaseManager, SUPABASE_SQL_SCHEMA, SUPABASE_GOOGLE_SHEET_SEED_SQL } from '../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Key,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSeedSql, setCopiedSeedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'sheetSeed'>('config');

  const [syncingSheet, setSyncingSheet] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = supabaseManager.getStatus();
      setStatus(current);
      setUrl(current.url);
      setKey(localStorage.getItem('ncd_supabase_key') || '');
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    supabaseManager.setCredentials(url, key);
    setStatus(supabaseManager.getStatus());
    onConfigChanged();
    handleTest();
  };

  const handleClear = () => {
    supabaseManager.clearCredentials();
    setUrl('');
    setKey('');
    setStatus(supabaseManager.getStatus());
    setTestResult({ success: true, message: 'สลับกลับมาใช้ Local Storage Mode เรียบร้อยแล้ว' });
    onConfigChanged();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await supabaseManager.testConnection();
    setTestResult(res);
    setTesting(false);
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copySeedSql = () => {
    navigator.clipboard.writeText(SUPABASE_GOOGLE_SHEET_SEED_SQL);
    setCopiedSeedSql(true);
    setTimeout(() => setCopiedSeedSql(false), 2000);
  };

  const handleSyncGoogleSheet = async () => {
    setSyncingSheet(true);
    setSyncResult(null);
    const res = await supabaseManager.syncGoogleSheetDataToSupabase();
    setSyncResult(res);
    setSyncingSheet(false);
    onConfigChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">จัดการและนำเข้าข้อมูลสู่ Supabase Database</h3>
              <p className="text-xs text-slate-300">รองรับทั้ง PostgreSQL บน Supabase Cloud และ Local Storage Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            ตั้งค่า API Credentials
          </button>

          <button
            onClick={() => setActiveTab('sheetSeed')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'sheetSeed'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            นำเข้า Google Sheet เดิมสู่ Supabase
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SQL Schema สร้างตาราง
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {activeTab === 'config' && (
            <>
              {/* Current Status banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                status?.isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {status?.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-sm">
                    {status?.isConnected
                      ? 'เชื่อมต่อกับ Supabase Live พร้อมใช้งาน'
                      : 'กำลังทำงานในโหมด Local Database (พร้อมใช้งานทันที)'}
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    {status?.isConnected
                      ? 'ข้อมูลจะถูกอ่านและบันทึกไปยัง Supabase Cloud PostgreSQL ของท่านโดยตรง'
                      : 'ระบบเก็บข้อมูลอัตโนมัติใน Browser LocalStorage ไม่ต้องมีคีย์ก็ใช้งาน ทดสอบ เพิ่ม/แก้ไข/ค้นหา ได้ครบทุกฟังก์ชัน'}
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzprojectid.supabase.co"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    ได้จาก Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon / Public API Key
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    ได้จาก Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon/public)
                  </span>
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </>
          )}

          {/* TAB 2: GOOGLE SHEET IMPORT TO SUPABASE */}
          {activeTab === 'sheetSeed' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
                <div className="font-bold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>นำเข้าฐานข้อมูลเดิมจาก Google Sheet สู่ Supabase</span>
                </div>
                <p className="text-xs leading-relaxed text-blue-800">
                  ระบบได้เตรียมข้อมูลจริงจาก Google Sheet เดิม (ชีต dashboard) ครบทั้ง <strong>41 หน่วยบริการเครือข่าย</strong> (ผู้ป่วยรวมกว่า 26,000+ คน) และผลการตรวจคัดกรองจอประสาทตาเบาหวาน (Fundus DR) ทั้ง <strong>7 รอบตรวจ</strong> ให้พร้อมนำเข้า Supabase
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSyncGoogleSheet}
                    disabled={syncingSheet}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {syncingSheet ? 'กำลังส่งข้อมูลเข้าสู่ Supabase...' : 'คลิกเพื่อนำเข้าสู่ Supabase โดยตรง'}
                  </button>

                  <button
                    onClick={copySeedSql}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    {copiedSeedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSeedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอกคำสั่ง SQL INSERT'}
                  </button>
                </div>
              </div>

              {syncResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    syncResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{syncResult.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำสั่ง SQL INSERT (สำหรับรันใน Supabase SQL Editor หากต้องการนำเข้าด้วยตนเอง):
                </label>
                <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56 border border-slate-800 select-all">
                  {SUPABASE_GOOGLE_SHEET_SEED_SQL}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SCHEMA */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  คัดลอกคำสั่ง SQL ด้านล่างไปวางใน <strong>Supabase SQL Editor</strong> เพื่อสร้างตารางทั้งหมด:
                </span>
                <button
                  onClick={copySql}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-slate-800 select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                💡 <strong>คำแนะนำ:</strong> ในหน้า Supabase Dashboard &gt; เมนูด้านซ้ายเลือก <strong>SQL Editor</strong> &gt; กด <strong>New Query</strong> &gt; วางโค้ดนี้ &gt; กด <strong>Run</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs text-slate-600 hover:text-rose-600 font-medium transition"
          >
            ล้างค่าและกลับสู่โหมด Local
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing || !url || !key}
              className="px-3.5 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              ทดสอบการเชื่อมต่อ
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
