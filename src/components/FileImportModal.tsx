import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabaseManager } from '../lib/supabase';
import { Patient, LabRecord, FundusRecord, TelemedRecord } from '../types';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Download, RefreshCw, FileText, X } from 'lucide-react';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [importType, setImportType] = useState<'patients' | 'lab' | 'fundus' | 'telemed' | 'json'>('patients');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [duplicateOption, setDuplicateOption] = useState<'skip' | 'update'>('skip');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setStatusMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();

    if (f.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setHeaders(['Object Key', 'Items Count']);
          const preview = Object.keys(json).map(key => ({
            'Object Key': key,
            'Items Count': Array.isArray(json[key]) ? json[key].length : 'Object'
          }));
          setPreviewRows(preview);
          setIsProcessing(false);
          setStatusMessage({ type: 'info', text: `อ่านไฟล์ JSON สำเร็จ (${preview.length} หมวดหมู่ข้อมูล)` });
        } catch (err: any) {
          setIsProcessing(false);
          setStatusMessage({ type: 'error', text: 'ไม่สามารถอ่านไฟล์ JSON ได้: ' + err.message });
        }
      };
      reader.readAsText(f);
      return;
    }

    // Excel or CSV file
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length === 0) {
          setIsProcessing(false);
          setStatusMessage({ type: 'error', text: 'ไม่พบข้อมูลในไฟล์ Excel' });
          return;
        }

        const head = (json[0] || []).map(h => String(h || '').trim());
        setHeaders(head);

        const rows: any[] = [];
        for (let i = 1; i < Math.min(json.length, 101); i++) {
          const rowData = json[i];
          if (!rowData || rowData.length === 0) continue;
          const obj: any = {};
          head.forEach((colName, idx) => {
            obj[colName || `Col_${idx + 1}`] = rowData[idx] !== undefined ? String(rowData[idx]).trim() : '';
          });
          rows.push(obj);
        }

        setPreviewRows(rows);
        setIsProcessing(false);
        setStatusMessage({
          type: 'info',
          text: `ตรวจพบข้อมูลทั้งหมด ${json.length - 1} แถว (แสดงตัวอย่าง ${rows.length} แถวแรก)`
        });
      } catch (err: any) {
        setIsProcessing(false);
        setStatusMessage({ type: 'error', text: 'อ่านไฟล์ Excel ล้มเหลว: ' + err.message });
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleExecuteImport = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = supabaseManager.importJsonData(data);
        setIsProcessing(false);
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'นำเข้าข้อมูลจากไฟล์ JSON สำเร็จเรียบร้อย!' });
          setTimeout(() => {
            onImportComplete();
            onClose();
          }, 1500);
        } else {
          setStatusMessage({ type: 'error', text: res.message });
        }
        return;
      }

      // Handle Excel / CSV based on importType
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (importType === 'patients') {
        const patientsList = await supabaseManager.getPatients();
        let importedCount = 0;

        for (const row of rows) {
          const hn = String(row['HN'] || row['hn'] || row['เลข HN'] || '').trim();
          if (!hn) continue;

          const patient: Patient = {
            hn: hn,
            cid13: String(row['13 หลัก'] || row['cid13'] || row['เลขบัตรประชาชน'] || '').trim(),
            prefix: String(row['คำนำหน้า'] || row['prefix'] || '').trim(),
            firstName: String(row['ชื่อ'] || row['firstName'] || row['ชื่อจริง'] || '').trim(),
            lastName: String(row['นามสกุล'] || row['lastName'] || '').trim(),
            birthDate: String(row['วันเกิด'] || row['birthDate'] || '').trim(),
            houseNo: String(row['บ้านเลขที่'] || row['houseNo'] || '').trim(),
            moo: String(row['หมู่'] || row['moo'] || '').trim(),
            village33: String(row['ชื่อหมู่บ้าน 33 ชุมชน'] || row['village33'] || '').trim(),
            villageOutside: String(row['ชื่อหมู่บ้านนอกเขต'] || row['villageOutside'] || '').trim(),
            tambon: String(row['ตำบล'] || row['tambon'] || 'รอบเวียง').trim(),
            amphoe: String(row['อำเภอ'] || row['amphoe'] || 'เมืองเชียงราย').trim(),
            province: String(row['จังหวัด'] || row['province'] || 'เชียงราย').trim(),
            phone: String(row['เบอร์โทร'] || row['phone'] || '').trim(),
            serviceCode: String(row['รหัสหน่วยบริการ'] || row['serviceCode'] || '05869').trim(),
            serviceName: String(row['ชื่อหน่วยบริการ'] || row['serviceName'] || 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)').trim(),
            treatmentRight: String(row['สิทธิการรักษา'] || row['treatmentRight'] || 'ประกันสุขภาพถ้วนหน้า (UC)').trim(),
            ht: String(row['HT'] || row['ht'] || '').trim(),
            dm: String(row['DM'] || row['dm'] || '').trim(),
            dlp: String(row['DLP'] || row['dlp'] || '').trim(),
            status: (row['สถานะ'] || row['status'] || 'รักษาอยู่') as any,
            note: String(row['บันทึกเพิ่มเติม'] || row['note'] || '').trim(),
            updateDate: new Date().toLocaleDateString('th-TH'),
            updaterName: 'File Import'
          };

          const exists = patientsList.some(p => p.hn === hn);
          if (exists && duplicateOption === 'skip') {
            continue;
          }

          await supabaseManager.savePatient(patient);
          importedCount++;
        }

        setIsProcessing(false);
        setStatusMessage({ type: 'success', text: `นำเข้าข้อมูลผู้ป่วยสำเร็จ ${importedCount} รายการ` });
      } else if (importType === 'lab') {
        const labRecords: LabRecord[] = [];
        const todayThai = new Date().toLocaleDateString('th-TH');

        for (const row of rows) {
          const hn = String(row['HN'] || row['hn'] || row['เลข HN'] || '').trim();
          if (!hn) continue;
          const serviceDate = String(row['วันที่รับบริการ'] || row['serviceDate'] || todayThai).trim();
          const cleanDate = serviceDate.replace(/[\/-]/g, '');

          labRecords.push({
            id: `${cleanDate}-${hn}`,
            name: String(row['ชื่อ-สกุล'] || row['name'] || '').trim(),
            hn: hn,
            serviceUnit: String(row['หน่วยบริการ'] || row['serviceUnit'] || 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)').trim(),
            fbs: String(row['FBS'] || row['fbs'] || '').trim(),
            hba1c: String(row['HbA1C'] || row['hba1c'] || row['HBA1C'] || '').trim(),
            bun: String(row['BUN'] || row['bun'] || '').trim(),
            cr: String(row['Cr'] || row['cr'] || '').trim(),
            tc: String(row['TC'] || row['tc'] || '').trim(),
            tg: String(row['TG'] || row['tg'] || '').trim(),
            hdl: String(row['HDL'] || row['hdl'] || '').trim(),
            ldl: String(row['LDL'] || row['ldl'] || '').trim(),
            serviceDate: serviceDate,
            visitNum: String(row['ครั้งที่'] || row['visitNum'] || '1').trim(),
            bpTop: String(row['BP_Top'] || row['bpTop'] || row['SBP'] || '').trim(),
            bpBottom: String(row['BP_Bottom'] || row['bpBottom'] || row['DBP'] || '').trim(),
            weight: String(row['น้ำหนัก'] || row['weight'] || '').trim(),
            height: String(row['ส่วนสูง'] || row['height'] || '').trim(),
            pr: String(row['ชีพจร'] || row['pr'] || '').trim(),
            rr: String(row['อัตราการหายใจ'] || row['rr'] || '').trim(),
            egfr: String(row['eGFR'] || row['egfr'] || '').trim()
          });
        }

        const res = await supabaseManager.saveLabRecordsBatch(labRecords, duplicateOption === 'update');
        setIsProcessing(false);
        setStatusMessage({ type: 'success', text: `นำเข้าผลตรวจเลือดสำเร็จ ${res.savedCount} รายการ` });
      }

      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการนำเข้า: ' + err.message });
    }
  };

  const handleDownloadTemplate = () => {
    let templateData: any[] = [];
    let fileName = '';

    if (importType === 'patients') {
      fileName = 'Template_รายชื่อผู้ป่วย_NCD.xlsx';
      templateData = [
        {
          'HN': '580999',
          '13 หลัก': '1579900123456',
          'คำนำหน้า': 'นาย',
          'ชื่อ': 'ตัวอย่าง',
          'นามสกุล': 'ใจสมบูรณ์',
          'วันเกิด': '15/05/2505',
          'บ้านเลขที่': '12/3',
          'หมู่': '2',
          'ชื่อหมู่บ้าน 33 ชุมชน': 'ชุมชนเด่นห้า',
          'ชื่อหมู่บ้านนอกเขต': '-',
          'ตำบล': 'รอบเวียง',
          'อำเภอ': 'เมืองเชียงราย',
          'จังหวัด': 'เชียงราย',
          'เบอร์โทร': '0812345678',
          'รหัสหน่วยบริการ': '05869',
          'ชื่อหน่วยบริการ': 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)',
          'สิทธิการรักษา': 'ประกันสุขภาพถ้วนหน้า (UC)',
          'HT': '10/01/2560',
          'DM': '15/03/2562',
          'DLP': '20/08/2564',
          'สถานะ': 'รักษาอยู่',
          'บันทึกเพิ่มเติม': 'ผู้ป่วยนัดติดตามอาการสม่ำเสมอ'
        }
      ];
    } else if (importType === 'lab') {
      fileName = 'Template_ผลตรวจเลือด_Lab.xlsx';
      templateData = [
        {
          'HN': '580999',
          'ชื่อ-สกุล': 'นายตัวอย่าง ใจสมบูรณ์',
          'หน่วยบริการ': 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)',
          'FBS': '112',
          'HbA1C': '6.2',
          'BUN': '14.5',
          'Cr': '0.92',
          'TC': '180',
          'TG': '135',
          'HDL': '46',
          'LDL': '105',
          'วันที่รับบริการ': '25/10/2569',
          'ครั้งที่': '1',
          'BP_Top': '130',
          'BP_Bottom': '82',
          'น้ำหนัก': '65.0',
          'ส่วนสูง': '165',
          'ชีพจร': '74',
          'อัตราการหายใจ': '18',
          'eGFR': '85.2'
        }
      ];
    }

    if (templateData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, fileName);
    }
  };

  const handleRestoreDemo = () => {
    if (window.confirm('คุณต้องการโหลดข้อมูลตัวอย่างเริ่มต้นของคลินิก NCD Center โฮงยาไทย หรือไม่? ข้อมูลเดิมจะถูกเขียนทับด้วยชุดข้อมูลตัวอย่าง')) {
      supabaseManager.resetToDefaultDemoData();
      onImportComplete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">ระบบดึงข้อมูลจากไฟล์ (File Data Extractor & Importer)</h3>
              <p className="text-xs text-slate-300">รองรับ Excel (.xlsx, .xls), CSV และ JSON พร้อมจัดเก็บเข้าสู่ระบบและ Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Target Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกประเภทข้อมูลที่ต้องการนำเข้า
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'patients', label: 'ทะเบียนผู้ป่วย', icon: FileText },
                { id: 'lab', label: 'ผลตรวจเลือด (Lab)', icon: FileSpreadsheet },
                { id: 'fundus', label: 'ตรวจตา (Fundus)', icon: FileText },
                { id: 'json', label: 'กู้คืน Backup (JSON)', icon: RefreshCw },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setImportType(item.id as any);
                    setFile(null);
                    setPreviewRows([]);
                    setStatusMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition ${
                    importType === item.id
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${importType === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับไฟล์นามสกุล .xlsx, .xls, .csv หรือ .json (ขนาดสูงสุด 15MB)
              </p>
            </div>
          </div>

          {/* Download Template & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600">ต้องการไฟล์ตัวอย่างสำหรับทดสอบ?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลดไฟล์ตัวอย่าง Template (.xlsx)
              </button>
              <button
                type="button"
                onClick={handleRestoreDemo}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                โหลดชุดข้อมูลคลินิกโฮงยาไทย
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  ตัวอย่างข้อมูลที่ดึงได้ ({previewRows.length} แถวแรก)
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dupOption"
                      checked={duplicateOption === 'skip'}
                      onChange={() => setDuplicateOption('skip')}
                    />
                    <span>ข้ามข้อมูลซ้ำ</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dupOption"
                      checked={duplicateOption === 'update'}
                      onChange={() => setDuplicateOption('update')}
                    />
                    <span>อัปเดตข้อมูลที่มีอยู่เดิม</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      {headers.slice(0, 10).map((h, i) => (
                        <th key={i} className="py-2 px-3 whitespace-nowrap">
                          {h || `Col ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-1.5 px-3 text-center text-slate-400">{idx + 1}</td>
                        {headers.slice(0, 10).map((h, i) => (
                          <td key={i} className="py-1.5 px-3 whitespace-nowrap max-w-xs truncate text-slate-600">
                            {row[h || `Col_${i + 1}`] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={!file || isProcessing || previewRows.length === 0}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition"
          >
            {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>นำเข้าข้อมูลเข้าสู่ระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
