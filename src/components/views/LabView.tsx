import React, { useState, useMemo, useRef } from 'react';
import { LabRecord } from '../../types';
import { formatHN, checkLabStatus, THAI_MONTHS_FULL } from '../../utils/thaiDate';
import * as XLSX from 'xlsx';
import {
  FlaskConical,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Printer,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  X
} from 'lucide-react';

interface LabViewProps {
  labRecords: LabRecord[];
  onSaveLabBatch: (records: LabRecord[], overwrite: boolean) => Promise<any>;
  onDeleteLabByDate: (dateStr: string) => Promise<any>;
  onDeleteLabById: (id: string) => Promise<any>;
  onPrintAllOpdCardsForDate: (dateStr: string) => void;
}

export const LabView: React.FC<LabViewProps> = ({
  labRecords,
  onSaveLabBatch,
  onDeleteLabByDate,
  onDeleteLabById,
  onPrintAllOpdCardsForDate
}) => {
  // Calendar State (Thai Buddhist Era)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [viewAllRecords, setViewAllRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [parsedUploadData, setParsedUploadData] = useState<{
    records: LabRecord[];
    duplicates: number;
    newRecords: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMonth = currentDate.getMonth();
  const currentYearCE = currentDate.getFullYear();
  const currentYearBE = currentYearCE + 543;

  // Group stats for each date
  const dateCounts = useMemo(() => {
    const map: Record<string, number> = {};
    labRecords.forEach(r => {
      if (r.serviceDate) {
        map[r.serviceDate] = (map[r.serviceDate] || 0) + 1;
      }
    });
    return map;
  }, [labRecords]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYearCE, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYearCE, currentMonth, 1).getDay();

    const days: Array<{
      dayNum: number;
      dateStr: string;
      isToday: boolean;
      hasData: boolean;
      patientCount: number;
    } | null> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const today = new Date();
    const isThisMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYearCE;

    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYearBE}`;
      const count = dateCounts[dStr] || 0;
      days.push({
        dayNum: day,
        dateStr: dStr,
        isToday: isThisMonth && today.getDate() === day,
        hasData: count > 0,
        patientCount: count
      });
    }

    return days;
  }, [currentMonth, currentYearCE, currentYearBE, dateCounts]);

  const serviceDaysInMonth = useMemo(() => {
    return calendarDays.filter(d => d && d.hasData).length;
  }, [calendarDays]);

  const totalPatientsInMonth = useMemo(() => {
    return calendarDays.reduce((sum, d) => sum + (d?.patientCount || 0), 0);
  }, [calendarDays]);

  // Filtered displayed records
  const displayedRecords = useMemo(() => {
    let list = labRecords;
    if (!viewAllRecords && selectedDateStr) {
      list = list.filter(r => r.serviceDate === selectedDateStr);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.hn.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.serviceUnit.toLowerCase().includes(q)
      );
    }
    return list;
  }, [labRecords, viewAllRecords, selectedDateStr, searchTerm]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYearCE, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYearCE, currentMonth + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setViewAllRecords(false);
  };

  // Excel File Parsing for Lab
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    processExcel(file);
  };

  const processExcel = (file: File) => {
    setUploadLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (json.length <= 1) {
          alert('ไม่พบข้อมูลในไฟล์ Excel');
          setUploadLoading(false);
          return;
        }

        const existingIds = new Set(labRecords.map(r => r.id));
        const parsed: LabRecord[] = [];
        let duplicates = 0;

        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0 || !row[2]) continue;

          const rawDate = row[11] ? String(row[11]).trim() : '';
          const hn = String(row[2]).trim();

          let id = '';
          if (rawDate) {
            const parts = rawDate.split('/');
            id = parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}-${hn}` : `${rawDate}-${hn}`;
          } else {
            id = `NODATE-${hn}`;
          }

          if (existingIds.has(id)) {
            duplicates++;
          }

          parsed.push({
            id: id,
            name: row[1] ? String(row[1]).trim() : `ผู้ป่วย HN ${hn}`,
            hn: hn,
            serviceUnit: row[3] ? String(row[3]).trim() : 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)',
            fbs: row[4] !== undefined ? String(row[4]).trim() : '',
            hba1c: row[5] !== undefined ? String(row[5]).trim() : '',
            bun: row[6] !== undefined ? String(row[6]).trim() : '',
            cr: row[7] !== undefined ? String(row[7]).trim() : '',
            tc: row[8] !== undefined ? String(row[8]).trim() : '',
            tg: row[9] !== undefined ? String(row[9]).trim() : '',
            hdl: row[10] !== undefined ? String(row[10]).trim() : '',
            ldl: row[11] !== undefined ? String(row[11]).trim() : '',
            serviceDate: rawDate,
            visitNum: row[12] !== undefined ? String(row[12]).trim() : '1',
            bpTop: row[13] !== undefined ? String(row[13]).trim() : '',
            bpBottom: row[14] !== undefined ? String(row[14]).trim() : '',
            weight: row[15] !== undefined ? String(row[15]).trim() : '',
            height: row[16] !== undefined ? String(row[16]).trim() : '',
            pr: row[17] !== undefined ? String(row[17]).trim() : '',
            rr: row[18] !== undefined ? String(row[18]).trim() : '',
            egfr: row[19] !== undefined ? String(row[19]).trim() : ''
          });
        }

        setParsedUploadData({
          records: parsed,
          duplicates,
          newRecords: parsed.length - duplicates
        });
        setUploadLoading(false);
      } catch (err: any) {
        alert('อ่านไฟล์ Excel ล้มเหลว: ' + err.message);
        setUploadLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmSave = async (overwrite: boolean) => {
    if (!parsedUploadData || parsedUploadData.records.length === 0) return;
    setUploadLoading(true);
    await onSaveLabBatch(parsedUploadData.records, overwrite);
    setUploadLoading(false);
    setUploadFile(null);
    setParsedUploadData(null);
    alert('บันทึกผลการตรวจเลือดเข้าสู่ระบบเรียบร้อยแล้ว!');
  };

  const handleDeleteAllForDate = async () => {
    if (!selectedDateStr) return;
    if (window.confirm(`ยืนยันการลบผลตรวจเลือดของวันที่ ${selectedDateStr} ทั้งหมดหรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้`)) {
      await onDeleteLabByDate(selectedDateStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Heading Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">ระบบผลการตรวจเลือดประจำหน่วยบริการ</h2>
            <p className="text-xs text-slate-500">บันทึก นำเข้า ตรวจสอบความผิดปกติ และพิมพ์ OPD Card</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setViewAllRecords(true);
              setSelectedDateStr(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              viewAllRecords
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            รายชื่อตรวจเลือดทั้งหมด ({labRecords.length})
          </button>
        </div>
      </div>

      {/* Top 2 Cards: Thai Calendar (Left) & Excel Upload (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CALENDAR (col-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Calendar Month Header */}
          <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm">
              {THAI_MONTHS_FULL[currentMonth]} {currentYearBE}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sub summary */}
          <div className="bg-blue-50/70 border-b border-blue-100/60 px-4 py-2 text-center text-xs text-blue-900 font-medium">
            วันที่มีบริการ: <strong className="text-blue-700">{serviceDaysInMonth}</strong> วัน | ผู้รับบริการรวม: <strong className="text-blue-700">{totalPatientsInMonth}</strong> คน
          </div>

          {/* Grid */}
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, idx) => (
                <div key={idx} className="text-[11px] font-bold text-slate-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, idx) => {
                if (!item) {
                  return <div key={idx} className="aspect-square" />;
                }
                const isSelected = selectedDateStr === item.dateStr && !viewAllRecords;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(item.dateStr)}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center text-xs transition relative border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : item.hasData
                        ? 'bg-blue-50/70 hover:bg-blue-100 text-blue-900 border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700 border-slate-100'
                    } ${item.isToday && !isSelected ? 'ring-2 ring-blue-500 font-bold' : ''}`}
                  >
                    <span className="text-[11px] leading-tight">{item.dayNum}</span>
                    {item.hasData && (
                      <span className={`text-[9px] font-bold px-1 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                      }`}>
                        {item.patientCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* EXCEL UPLOAD CARD (col-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Upload ผลการตรวจเลือด (Excel .xlsx, .xls)
            </h3>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {uploadFile ? uploadFile.name : 'เลือกไฟล์ Excel หรือลากมาวางที่นี่'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับไฟล์นามสกุล .xlsx หรือ .xls จากระบบห้องปฏิบัติการ
              </p>
            </div>
          </div>

          {/* Summary / Result of uploaded file */}
          {parsedUploadData && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="font-bold text-slate-800">ผลการวิเคราะห์ไฟล์:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">ทั้งหมด</span>
                  <span className="font-bold text-slate-800 text-sm">{parsedUploadData.records.length}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">ข้อมูลซ้ำเดิม</span>
                  <span className="font-bold text-rose-600 text-sm">{parsedUploadData.duplicates}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">รายการใหม่</span>
                  <span className="font-bold text-emerald-600 text-sm">{parsedUploadData.newRecords}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmSave(false)}
                  disabled={uploadLoading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  บันทึกเฉพาะรายใหม่
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmSave(true)}
                  disabled={uploadLoading}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition"
                >
                  บันทึกใหม่ + ปรับปรุงซ้ำ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BLOOD TEST DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">
              {viewAllRecords
                ? 'รายการข้อมูลตรวจเลือดทั้งหมด'
                : selectedDateStr
                ? `ข้อมูลประจำวันที่: ${selectedDateStr}`
                : 'กรุณาเลือกวันที่จากปฏิทิน หรือกดดูทั้งหมด'}
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {displayedRecords.length} คน
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input in table */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, HN..."
                className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            {selectedDateStr && !viewAllRecords && (
              <>
                <button
                  type="button"
                  onClick={() => onPrintAllOpdCardsForDate(selectedDateStr)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print OPD ทั้งหมด ({displayedRecords.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllForDate}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบ Lab วันนี้ทั้งหมด
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">ชื่อ-สกุล</th>
                <th className="py-2.5 px-3">HN</th>
                <th className="py-2.5 px-3">หน่วยบริการ</th>
                <th className="py-2.5 px-2 text-center">FBS</th>
                <th className="py-2.5 px-2 text-center">HbA1C</th>
                <th className="py-2.5 px-2 text-center">BUN</th>
                <th className="py-2.5 px-2 text-center">Cr</th>
                <th className="py-2.5 px-2 text-center">TC</th>
                <th className="py-2.5 px-2 text-center">TG</th>
                <th className="py-2.5 px-2 text-center">HDL</th>
                <th className="py-2.5 px-2 text-center">LDL</th>
                <th className="py-2.5 px-3 text-center">วันที่รับบริการ</th>
                <th className="py-2.5 px-2 text-center">BP บน/ล่าง</th>
                <th className="py-2.5 px-2 text-center">eGFR</th>
                <th className="py-2.5 px-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400">
                    {selectedDateStr || viewAllRecords
                      ? 'ไม่พบข้อมูลผลการตรวจเลือด'
                      : 'กรุณาเลือกวันที่จากปฏิทินด้านบน หรืออัปโหลดไฟล์ Excel'}
                  </td>
                </tr>
              ) : (
                displayedRecords.map((r) => {
                  const fbsCheck = checkLabStatus(r.fbs, 'FBS');
                  const a1cCheck = checkLabStatus(r.hba1c, 'HBA1C');
                  const tcCheck = checkLabStatus(r.tc, 'TC');
                  const egfrCheck = checkLabStatus(r.egfr, 'EGFR');

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{r.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">{formatHN(r.hn)}</td>
                      <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{r.serviceUnit}</td>

                      <td className="py-2 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${fbsCheck.badgeClass}`}>
                          {r.fbs || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${a1cCheck.badgeClass}`}>
                          {r.hba1c || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-center text-slate-600">{r.bun || '-'}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{r.cr || '-'}</td>

                      <td className="py-2 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${tcCheck.badgeClass}`}>
                          {r.tc || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-center text-slate-600">{r.tg || '-'}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{r.hdl || '-'}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{r.ldl || '-'}</td>

                      <td className="py-2 px-3 text-center text-slate-700">{r.serviceDate}</td>
                      <td className="py-2 px-2 text-center font-medium">
                        {r.bpTop && r.bpBottom ? `${r.bpTop}/${r.bpBottom}` : '-'}
                      </td>

                      <td className="py-2 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${egfrCheck.badgeClass}`}>
                          {r.egfr || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบผลตรวจแล็บ ID: ${r.id}?`)) {
                              onDeleteLabById(r.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
