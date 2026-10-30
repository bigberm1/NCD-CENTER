import React, { useState, useMemo } from 'react';
import { FundusDate, FundusRecord, Patient } from '../../types';
import { formatHN, formatThaiDateBE } from '../../utils/thaiDate';
import { INITIAL_HOSPITALS } from '../../data/initialData';
import * as XLSX from 'xlsx';
import {
  Eye,
  Calendar,
  CalendarPlus,
  Users,
  Search,
  PenSquare,
  Trash2,
  FileSpreadsheet,
  Printer,
  RotateCw,
  Plus,
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react';

interface FundusViewProps {
  fundusDates: FundusDate[];
  fundusRecords: FundusRecord[];
  patients: Patient[];
  onSaveFundusDate: (date: FundusDate) => Promise<any>;
  onDeleteFundusDate: (id: string) => Promise<any>;
  onSaveFundusRecord: (record: FundusRecord) => Promise<any>;
  onDeleteFundusRecord: (id: string) => Promise<any>;
}

const DR_OPTIONS = [
  'No DR',
  'Mild NPDR',
  'Moderate NPDR',
  'Severe NPDR',
  'PDR',
  'Poor View'
];

export const FundusView: React.FC<FundusViewProps> = ({
  fundusDates,
  fundusRecords,
  patients,
  onSaveFundusDate,
  onDeleteFundusDate,
  onSaveFundusRecord,
  onDeleteFundusRecord
}) => {
  // Selection
  const [selectedDateId, setSelectedDateId] = useState<string>(
    fundusDates[0]?.id || ''
  );

  // New Date Form
  const [newDateVal, setNewDateVal] = useState('');
  const [newServiceCode, setNewServiceCode] = useState(INITIAL_HOSPITALS[0]?.code || '05869');

  // Record Form Modal or Toggle
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form Fields
  const [formHN, setFormHN] = useState('');
  const [formPrefix, setFormPrefix] = useState('นาย');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formWaist, setFormWaist] = useState('');
  const [formSBP, setFormSBP] = useState('');
  const [formDBP, setFormDBP] = useState('');
  const [formPR, setFormPR] = useState('');
  const [formResultLeft, setFormResultLeft] = useState('No DR');
  const [formResultRight, setFormResultRight] = useState('No DR');
  const [formNextAppt, setFormNextAppt] = useState('');
  const [formApptStatus, setFormApptStatus] = useState('มาตามนัด');
  const [formApptNote, setFormApptNote] = useState('');

  // Selected Date Object
  const selectedDate = useMemo(() => {
    return fundusDates.find(d => d.id === selectedDateId) || null;
  }, [fundusDates, selectedDateId]);

  // Records for this date
  const recordsForSelectedDate = useMemo(() => {
    if (!selectedDateId) return [];
    return fundusRecords.filter(
      r => r.sessionID === selectedDateId || (selectedDate && r.date === selectedDate.date)
    );
  }, [fundusRecords, selectedDateId, selectedDate]);

  // Lookup HN in Patients database
  const handleHNLookup = () => {
    if (!formHN.trim()) {
      alert('กรุณากรอกเลข HN ที่ต้องการค้นหา');
      return;
    }
    const cleanHN = formHN.trim().toLowerCase();
    const found = patients.find(p => p.hn.toLowerCase() === cleanHN);
    if (found) {
      setFormPrefix(found.prefix || 'นาย');
      setFormFirstName(found.firstName || '');
      setFormLastName(found.lastName || '');
    } else {
      alert(`ไม่พบ HN ${formHN} ในฐานข้อมูลทะเบียนผู้ป่วย`);
    }
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateVal.trim()) {
      alert('กรุณาระบุ วันที่ตรวจตา');
      return;
    }
    const hosp = INITIAL_HOSPITALS.find(h => h.code === newServiceCode);
    const newDate: FundusDate = {
      id: `fundus-d-${Date.now()}`,
      date: newDateVal.trim(),
      serviceCode: newServiceCode,
      serviceName: hosp?.name || 'PCU โฮงยาไทย',
      recorderName: 'เจ้าหน้าที่คลินิก',
      recordDate: new Date().toLocaleDateString('th-TH')
    };

    await onSaveFundusDate(newDate);
    setSelectedDateId(newDate.id);
    setNewDateVal('');
  };

  const handleOpenAddRecord = () => {
    setEditingRecordId(null);
    setFormHN('');
    setFormPrefix('นาย');
    setFormFirstName('');
    setFormLastName('');
    setFormWeight('');
    setFormHeight('');
    setFormWaist('');
    setFormSBP('');
    setFormDBP('');
    setFormPR('');
    setFormResultLeft('No DR');
    setFormResultRight('No DR');
    setFormNextAppt('');
    setFormApptStatus('มาตามนัด');
    setFormApptNote('');
    setShowRecordForm(true);
  };

  const handleEditRecord = (rec: FundusRecord) => {
    setEditingRecordId(rec.id);
    setFormHN(rec.hn);
    setFormPrefix(rec.prefix);
    setFormFirstName(rec.firstName);
    setFormLastName(rec.lastName);
    setFormWeight(rec.weight);
    setFormHeight(rec.height);
    setFormWaist(rec.waist);
    setFormSBP(rec.sbp);
    setFormDBP(rec.dbp);
    setFormPR(rec.pr);
    setFormResultLeft(rec.resultLeft || 'No DR');
    setFormResultRight(rec.resultRight || 'No DR');
    setFormNextAppt(rec.nextAppointment);
    setFormApptStatus(rec.appointmentStatus || 'มาตามนัด');
    setFormApptNote(rec.appointmentNote || '');
    setShowRecordForm(true);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('กรุณาเลือกวันที่ตรวจตาก่อน');
      return;
    }
    if (!formHN || !formFirstName) {
      alert('กรุณากรอก HN และชื่อผู้ป่วย');
      return;
    }

    const payload: FundusRecord = {
      id: editingRecordId || `f-rec-${Date.now()}`,
      date: selectedDate.date,
      hn: formHN,
      prefix: formPrefix,
      firstName: formFirstName,
      lastName: formLastName,
      weight: formWeight,
      height: formHeight,
      waist: formWaist,
      sbp: formSBP,
      dbp: formDBP,
      pr: formPR,
      resultLeft: formResultLeft,
      resultRight: formResultRight,
      nextAppointment: formNextAppt,
      appointmentStatus: formApptStatus,
      appointmentNote: formApptNote,
      sessionID: selectedDate.id,
      recorderName: 'เจ้าหน้าที่ตรวจตา',
      recordDate: new Date().toLocaleDateString('th-TH'),
      updaterName: 'เจ้าหน้าที่ตรวจตา',
      updateDate: new Date().toLocaleDateString('th-TH')
    };

    await onSaveFundusRecord(payload);
    setShowRecordForm(false);
  };

  const handleDeleteDate = async (id: string, dateStr: string) => {
    if (window.confirm(`ยืนยันการลบวันที่ตรวจตา ${dateStr} และรายการตรวจทั้งหมดในวันนี้?`)) {
      await onDeleteFundusDate(id);
      if (selectedDateId === id) {
        const remaining = fundusDates.filter(d => d.id !== id);
        setSelectedDateId(remaining[0]?.id || '');
      }
    }
  };

  const exportFundusExcel = () => {
    if (!selectedDate) return;
    const rows = recordsForSelectedDate.map((r, i) => ({
      'ลำดับ': i + 1,
      'HN': formatHN(r.hn),
      'ชื่อ-นามสกุล': `${r.prefix} ${r.firstName} ${r.lastName}`,
      'น้ำหนัก': r.weight || '-',
      'ส่วนสูง': r.height || '-',
      'รอบเอว': r.waist || '-',
      'BP': `${r.sbp}/${r.dbp}`,
      'PR': r.pr || '-',
      'ตาซ้าย': r.resultLeft || '-',
      'ตาขวา': r.resultRight || '-',
      'นัดครั้งต่อไป': r.nextAppointment || '-',
      'มาตามนัด': r.appointmentStatus || '-',
      'หมายเหตุ': r.appointmentNote || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ผลตรวจตา');
    XLSX.writeFile(wb, `Fundus_Report_${selectedDate.date.replace(/[\/-]/g, '')}.xlsx`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Date Management (col-3) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800 text-sm">วันที่ตรวจตา</h2>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              {fundusDates.length} วัน
            </span>
          </div>

          {/* Form to Add Date */}
          <form onSubmit={handleAddDate} className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 text-xs">
            <div className="font-semibold text-slate-700">เพิ่มวันตรวจตาใหม่</div>
            <div>
              <label className="block text-slate-600 mb-1">เลือกหน่วยบริการ</label>
              <select
                value={newServiceCode}
                onChange={(e) => setNewServiceCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
              >
                {INITIAL_HOSPITALS.map(h => (
                  <option key={h.code} value={h.code}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">วันที่ตรวจ (วว/ดด/ปปปป)</label>
              <input
                type="text"
                required
                value={newDateVal}
                onChange={(e) => setNewDateVal(e.target.value)}
                placeholder="เช่น 28/10/2569"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1 transition"
            >
              <CalendarPlus className="w-4 h-4" />
              เพิ่มวันที่ตรวจ
            </button>
          </form>

          {/* Dates List */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto pt-1">
            {fundusDates.map((d) => {
              const isSelected = d.id === selectedDateId;
              const count = fundusRecords.filter(r => r.sessionID === d.id || r.date === d.date).length;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDateId(d.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{d.date}</span>
                    </div>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {d.serviceName}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count} คน
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDate(d.id, d.date);
                      }}
                      className={`p-1 rounded hover:bg-rose-500 hover:text-white transition ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}
                      title="ลบวันตรวจ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Selected Date Data & Patients Table (col-9) */}
      <div className="lg:col-span-9 space-y-4">
        {selectedDate ? (
          <>
            {/* Top Info Banner */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">วันที่นัดตรวจตา:</span>
                  <span className="text-base font-bold text-blue-700">{selectedDate.date}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {selectedDate.serviceName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  จำนวนผู้รับบริการในรอบนี้: <strong className="text-slate-800">{recordsForSelectedDate.length}</strong> คน
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddRecord}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มผู้ป่วยตรวจตา
                </button>
                <button
                  type="button"
                  onClick={exportFundusExcel}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  ส่งออก Excel
                </button>
              </div>
            </div>

            {/* Record Form (Add or Edit) */}
            {showRecordForm && (
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">
                    {editingRecordId ? 'แก้ไขผลตรวจตา' : 'บันทึกคนตรวจตาใหม่'}
                  </span>
                  <button
                    onClick={() => setShowRecordForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ปิดฟอร์ม
                  </button>
                </div>

                <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
                  {/* Row 1: HN & Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">HN <span className="text-rose-500">*</span></label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          required
                          value={formHN}
                          onChange={(e) => setFormHN(e.target.value)}
                          placeholder="เลข HN"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleHNLookup}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                          title="ค้นหาชื่อจากฐานข้อมูล"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">คำนำหน้า</label>
                      <input
                        type="text"
                        value={formPrefix}
                        onChange={(e) => setFormPrefix(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">ชื่อ</label>
                      <input
                        type="text"
                        required
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">นามสกุล</label>
                      <input
                        type="text"
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Vitals */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-slate-500 mb-1">น้ำหนัก (กก.)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formWeight}
                        onChange={(e) => setFormWeight(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">ส่วนสูง (ซม.)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formHeight}
                        onChange={(e) => setFormHeight(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">รอบเอว (ซม.)</label>
                      <input
                        type="number"
                        value={formWaist}
                        onChange={(e) => setFormWaist(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">ความดันตัวบน SBP</label>
                      <input
                        type="number"
                        value={formSBP}
                        onChange={(e) => setFormSBP(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">ความดันตัวล่าง DBP</label>
                      <input
                        type="number"
                        value={formDBP}
                        onChange={(e) => setFormDBP(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">ชีพจร PR</label>
                      <input
                        type="number"
                        value={formPR}
                        onChange={(e) => setFormPR(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Findings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">ผลตรวจตา (ตาซ้าย)</label>
                      <select
                        value={formResultLeft}
                        onChange={(e) => setFormResultLeft(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
                      >
                        {DR_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">ผลตรวจตา (ตาขวา)</label>
                      <select
                        value={formResultRight}
                        onChange={(e) => setFormResultRight(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
                      >
                        {DR_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">นัดตรวจครั้งต่อไป</label>
                      <input
                        type="text"
                        value={formNextAppt}
                        onChange={(e) => setFormNextAppt(e.target.value)}
                        placeholder="วว/ดด/ปปปป"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Appointment & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">สถานะการมาตามนัด</label>
                      <select
                        value={formApptStatus}
                        onChange={(e) => setFormApptStatus(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      >
                        <option value="มาตามนัด">มาตามนัด</option>
                        <option value="ไม่มาตามนัด">ไม่มาตามนัด</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">บันทึกเพิ่มเติม</label>
                      <input
                        type="text"
                        value={formApptNote}
                        onChange={(e) => setFormApptNote(e.target.value)}
                        placeholder="ระบุข้อแนะนำ หรือการส่งต่อ..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRecordForm(false)}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      บันทึกผลการตรวจตา
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Fundus Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">ลำดับ</th>
                      <th className="py-2.5 px-3">HN</th>
                      <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-2 text-center">น้ำหนัก</th>
                      <th className="py-2.5 px-2 text-center">ส่วนสูง</th>
                      <th className="py-2.5 px-2 text-center">รอบเอว</th>
                      <th className="py-2.5 px-2 text-center">BP</th>
                      <th className="py-2.5 px-2 text-center">PR</th>
                      <th className="py-2.5 px-3">ตาซ้าย</th>
                      <th className="py-2.5 px-3">ตาขวา</th>
                      <th className="py-2.5 px-3 text-center">นัดครั้งต่อไป</th>
                      <th className="py-2.5 px-2 text-center">มาตามนัด</th>
                      <th className="py-2.5 px-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recordsForSelectedDate.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-slate-400">
                          ยังไม่มีผู้ป่วยในรอบตรวจนี้ กดปุ่ม "เพิ่มผู้ป่วยตรวจตา" เพื่อเริ่มบันทึก
                        </td>
                      </tr>
                    ) : (
                      recordsForSelectedDate.map((r, i) => {
                        const isSevereL = r.resultLeft === 'Severe NPDR' || r.resultLeft === 'PDR';
                        const isSevereR = r.resultRight === 'Severe NPDR' || r.resultRight === 'PDR';
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3 text-center text-slate-400">{i + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{formatHN(r.hn)}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {r.prefix} {r.firstName} {r.lastName}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-600">{r.weight || '-'}</td>
                            <td className="py-2.5 px-2 text-center text-slate-600">{r.height || '-'}</td>
                            <td className="py-2.5 px-2 text-center text-slate-600">{r.waist || '-'}</td>
                            <td className="py-2.5 px-2 text-center font-medium">
                              {r.sbp && r.dbp ? `${r.sbp}/${r.dbp}` : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-600">{r.pr || '-'}</td>
                            <td className="py-2.5 px-3 font-medium">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${
                                isSevereL ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200' : 'text-slate-700'
                              }`}>
                                {r.resultLeft || '-'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${
                                isSevereR ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200' : 'text-slate-700'
                              }`}>
                                {r.resultRight || '-'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{r.nextAppointment || '-'}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.appointmentStatus === 'มาตามนัด' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {r.appointmentStatus || '-'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditRecord(r)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                                  title="แก้ไข"
                                >
                                  <PenSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`ยืนยันการลบผลตรวจตา HN: ${formatHN(r.hn)}?`)) {
                                      onDeleteFundusRecord(r.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            กรุณาเลือกวันที่ตรวจตาจากรายการด้านซ้าย หรือสร้างวันตรวจตาใหม่
          </div>
        )}
      </div>
    </div>
  );
};
