import React, { useState, useMemo } from 'react';
import { TelemedDate, TelemedRecord, Patient } from '../../types';
import { formatHN, formatPhone, formatThaiDateBE } from '../../utils/thaiDate';
import { INITIAL_HOSPITALS, INITIAL_TELEMED_ROOMS } from '../../data/initialData';
import * as XLSX from 'xlsx';
import {
  Video,
  Calendar,
  CalendarPlus,
  Users,
  Search,
  PenSquare,
  Trash2,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Clock
} from 'lucide-react';

interface TelemedViewProps {
  telemedDates: TelemedDate[];
  telemedRecords: TelemedRecord[];
  patients: Patient[];
  onSaveTelemedDate: (date: TelemedDate) => Promise<any>;
  onDeleteTelemedDate: (id: string) => Promise<any>;
  onSaveTelemedRecord: (record: TelemedRecord) => Promise<any>;
  onDeleteTelemedRecord: (id: string) => Promise<any>;
}

export const TelemedView: React.FC<TelemedViewProps> = ({
  telemedDates,
  telemedRecords,
  patients,
  onSaveTelemedDate,
  onDeleteTelemedDate,
  onSaveTelemedRecord,
  onDeleteTelemedRecord
}) => {
  const [selectedDateId, setSelectedDateId] = useState<string>(
    telemedDates[0]?.id || ''
  );

  // New Date form
  const [newDateVal, setNewDateVal] = useState('');
  const [newServiceCode, setNewServiceCode] = useState(INITIAL_HOSPITALS[0]?.code || '05869');

  // Record Form state
  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form Fields
  const [hn, setHn] = useState('');
  const [fullName, setFullName] = useState('');
  const [ht, setHt] = useState('');
  const [dm, setDm] = useState('');
  const [dlp, setDlp] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [consent, setConsent] = useState<'มี' | 'ไม่มี'>('มี');
  const [serviceCode, setServiceCode] = useState(INITIAL_HOSPITALS[0]?.code || '05869');
  const [serviceName, setServiceName] = useState(INITIAL_HOSPITALS[0]?.name || '');
  const [room, setRoom] = useState(INITIAL_TELEMED_ROOMS[0] || '');
  const [provider, setProvider] = useState('นพ.เวชศาสตร์ครอบครัว รพศ.เชียงราย');
  const [appointmentMonth, setAppointmentMonth] = useState('3');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [note, setNote] = useState('');

  const selectedDate = useMemo(() => {
    return telemedDates.find(d => d.id === selectedDateId) || null;
  }, [telemedDates, selectedDateId]);

  const recordsForDate = useMemo(() => {
    if (!selectedDateId) return [];
    return telemedRecords.filter(r => r.sessionID === selectedDateId || r.date === selectedDateId);
  }, [telemedRecords, selectedDateId]);

  const handleHNLookup = () => {
    if (!hn.trim()) {
      alert('กรุณากรอกเลข HN');
      return;
    }
    const cleanHN = hn.trim().toLowerCase();
    const found = patients.find(p => p.hn.toLowerCase() === cleanHN);
    if (found) {
      setFullName(`${found.prefix} ${found.firstName} ${found.lastName}`.trim());
      setHt(found.ht || '-');
      setDm(found.dm || '-');
      setDlp(found.dlp || '-');
      setPhone(found.phone || '');
    } else {
      alert(`ไม่พบ HN ${hn} ในฐานข้อมูลทะเบียนผู้ป่วย`);
    }
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateVal.trim()) {
      alert('กรุณากรอก วันที่นัด TeleMedicine');
      return;
    }
    const hosp = INITIAL_HOSPITALS.find(h => h.code === newServiceCode);
    const newDate: TelemedDate = {
      id: `telemed-d-${Date.now()}`,
      date: newDateVal.trim(),
      serviceCode: newServiceCode,
      serviceName: hosp?.name || 'PCU โฮงยาไทย',
      recorderName: 'เจ้าหน้าที่คลินิก',
      recordDate: new Date().toLocaleDateString('th-TH')
    };

    await onSaveTelemedDate(newDate);
    setSelectedDateId(newDate.id);
    setNewDateVal('');
  };

  const handleOpenAddRecord = () => {
    setEditingRecordId(null);
    setHn('');
    setFullName('');
    setHt('');
    setDm('');
    setDlp('');
    setOtherDisease('');
    setPhone('');
    setDetails('');
    setConsent('มี');
    setServiceCode(selectedDate?.serviceCode || INITIAL_HOSPITALS[0]?.code || '05869');
    setServiceName(selectedDate?.serviceName || INITIAL_HOSPITALS[0]?.name || '');
    setRoom(INITIAL_TELEMED_ROOMS[0] || '');
    setProvider('นพ.เวชศาสตร์ครอบครัว รพศ.เชียงราย');
    setAppointmentMonth('3');
    setAppointmentDate('');
    setNote('');
    setShowForm(true);
  };

  const handleEditRecord = (rec: TelemedRecord) => {
    setEditingRecordId(rec.id);
    setHn(rec.hn);
    setFullName(`${rec.prefix} ${rec.firstName} ${rec.lastName}`.trim());
    setHt(rec.ht);
    setDm(rec.dm);
    setDlp(rec.dlp);
    setOtherDisease(rec.otherDisease);
    setPhone(rec.phone);
    setDetails(rec.details);
    setConsent((rec.consent as any) || 'มี');
    setServiceCode(rec.serviceCode);
    setServiceName(rec.serviceName);
    setRoom(rec.room);
    setProvider(rec.provider);
    setAppointmentMonth(rec.appointmentMonth);
    setAppointmentDate(rec.appointmentDate);
    setNote(rec.note);
    setShowForm(true);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateId) return;
    if (!hn || !fullName) {
      alert('กรุณากรอก HN และชื่อผู้ป่วย');
      return;
    }

    const nameParts = fullName.split(' ');
    const prefix = nameParts[0] || 'นาย';
    const firstName = nameParts[1] || fullName;
    const lastName = nameParts.slice(2).join(' ') || '';

    const payload: TelemedRecord = {
      id: editingRecordId || `t-rec-${Date.now()}`,
      date: selectedDateId,
      hn,
      prefix,
      firstName,
      lastName,
      ht,
      dm,
      dlp,
      otherDisease,
      phone,
      details,
      consent,
      serviceCode,
      serviceName,
      room,
      provider,
      appointmentMonth,
      appointmentDate,
      note,
      sessionID: selectedDateId,
      recorderName: 'เจ้าหน้าที่คลินิก Telemed',
      recordDate: new Date().toLocaleDateString('th-TH')
    };

    await onSaveTelemedRecord(payload);
    setShowForm(false);
  };

  const exportTelemedExcel = () => {
    if (!selectedDate) return;
    const rows = recordsForDate.map((r, idx) => ({
      'ลำดับ': idx + 1,
      'HN': formatHN(r.hn),
      'ชื่อ-นามสกุล': `${r.prefix} ${r.firstName} ${r.lastName}`,
      'HT': r.ht,
      'DM': r.dm,
      'DLP': r.dlp,
      'โรคอื่นๆ': r.otherDisease || '-',
      'เบอร์โทร': r.phone || '-',
      'ใบยินยอม': r.consent,
      'หน่วยบริการ': r.serviceName,
      'ห้อง TeleMed': r.room,
      'ผู้ให้บริการ': r.provider,
      'นัดหมายครั้งต่อไป': r.appointmentDate || `${r.appointmentMonth} เดือน`,
      'หมายเหตุ': r.note || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TeleMedicine');
    XLSX.writeFile(wb, `Telemed_${selectedDate.date.replace(/[\/-]/g, '')}.xlsx`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: TeleMed Dates (col-3) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800 text-sm">รอบนัด TeleMed</h2>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              {telemedDates.length} วัน
            </span>
          </div>

          {/* Add Date Form */}
          <form onSubmit={handleAddDate} className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 text-xs">
            <div className="font-semibold text-slate-700">เพิ่มรอบนัด TeleMedicine</div>
            <div>
              <label className="block text-slate-600 mb-1">หน่วยบริการ</label>
              <select
                value={newServiceCode}
                onChange={(e) => setNewServiceCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
              >
                {INITIAL_HOSPITALS.map(h => (
                  <option key={h.code} value={h.code}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">วันที่นัด (วว/ดด/ปปปป)</label>
              <input
                type="text"
                required
                value={newDateVal}
                onChange={(e) => setNewDateVal(e.target.value)}
                placeholder="เช่น 30/10/2569"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1 transition"
            >
              <CalendarPlus className="w-4 h-4" />
              เพิ่มวันที่นัด
            </button>
          </form>

          {/* Dates list */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {telemedDates.map(d => {
              const isSelected = d.id === selectedDateId;
              const count = telemedRecords.filter(r => r.sessionID === d.id || r.date === d.id).length;
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
                        if (window.confirm(`ยืนยันการลบวันนัด TeleMed ${d.date}?`)) {
                          onDeleteTelemedDate(d.id);
                        }
                      }}
                      className={`p-1 rounded hover:bg-rose-500 hover:text-white transition ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}
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

      {/* Right: Telemed Patients Table & Form (col-9) */}
      <div className="lg:col-span-9 space-y-4">
        {selectedDate ? (
          <>
            {/* Header info */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">วันที่นัด TeleMed:</span>
                  <span className="text-base font-bold text-blue-700">{selectedDate.date}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {selectedDate.serviceName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  จำนวนผู้รับบริการ: <strong className="text-slate-800">{recordsForDate.length}</strong> คน
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddRecord}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มผู้รับบริการ
                </button>
                <button
                  type="button"
                  onClick={exportTelemedExcel}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  ส่งออก Excel
                </button>
              </div>
            </div>

            {/* Record Form */}
            {showForm && (
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">
                    {editingRecordId ? 'แก้ไขข้อมูล TeleMedicine' : 'บันทึกบริการแพทย์ทางไกลใหม่'}
                  </span>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ปิดฟอร์ม
                  </button>
                </div>

                <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">HN <span className="text-rose-500">*</span></label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          required
                          value={hn}
                          onChange={(e) => setHn(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleHNLookup}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 mb-1">ชื่อ - สกุล</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">HT</label>
                      <input
                        type="text"
                        value={ht}
                        onChange={(e) => setHt(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">DM</label>
                      <input
                        type="text"
                        value={dm}
                        onChange={(e) => setDm(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">DLP</label>
                      <input
                        type="text"
                        value={dlp}
                        onChange={(e) => setDlp(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">โรคอื่นๆ</label>
                      <input
                        type="text"
                        value={otherDisease}
                        onChange={(e) => setOtherDisease(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 mb-1">รายละเอียดการให้บริการ <span className="text-rose-500">*</span></label>
                      <textarea
                        rows={2}
                        required
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="อาการ อาการเตือน แผนการรักษา การปรับยา..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">ใบยินยอมรับบริการ</label>
                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="consentRadio"
                            checked={consent === 'มี'}
                            onChange={() => setConsent('มี')}
                          />
                          <span>มี</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="consentRadio"
                            checked={consent === 'ไม่มี'}
                            onChange={() => setConsent('ไม่มี')}
                          />
                          <span>ไม่มี</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">ห้อง TeleMed</label>
                      <select
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      >
                        {INITIAL_TELEMED_ROOMS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">ผู้ให้บริการ</label>
                      <input
                        type="text"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">ระยะนัด (เดือน)</label>
                      <select
                        value={appointmentMonth}
                        onChange={(e) => setAppointmentMonth(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 9, 12].map(m => (
                          <option key={m} value={m}>{m} เดือน</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">วันที่นัดครั้งต่อไป</label>
                      <input
                        type="text"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        placeholder="วว/ดด/ปปปป"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      บันทึกบริการ TeleMed
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">ลำดับ</th>
                      <th className="py-2.5 px-3">HN</th>
                      <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-3">โรคประจำตัว</th>
                      <th className="py-2.5 px-3">เบอร์โทร</th>
                      <th className="py-2.5 px-2 text-center">ใบยินยอม</th>
                      <th className="py-2.5 px-3">สถานที่ & ห้องตรวจ</th>
                      <th className="py-2.5 px-3">นัดครั้งต่อไป</th>
                      <th className="py-2.5 px-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recordsForDate.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          ยังไม่มีผู้รับบริการ TeleMed ในรอบนี้ กดปุ่ม "เพิ่มผู้รับบริการ" เพื่อเริ่มบันทึก
                        </td>
                      </tr>
                    ) : (
                      recordsForDate.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3 text-center text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{formatHN(r.hn)}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {r.prefix} {r.firstName} {r.lastName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {[r.ht ? 'HT' : '', r.dm ? 'DM' : '', r.dlp ? 'DLP' : '', r.otherDisease]
                              .filter(Boolean)
                              .join(', ') || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{formatPhone(r.phone)}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              r.consent === 'มี' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.consent || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            <div className="font-medium text-slate-800">{r.serviceName}</div>
                            <div className="text-[11px] text-slate-500">{r.room} ({r.provider})</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {r.appointmentDate ? (
                              <span>{r.appointmentDate}</span>
                            ) : (
                              <span>อีก {r.appointmentMonth || '3'} เดือน</span>
                            )}
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
                                  if (window.confirm(`ยืนยันการลบรายการ TeleMed HN: ${formatHN(r.hn)}?`)) {
                                    onDeleteTelemedRecord(r.id);
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            กรุณาเลือกวันที่นัด TeleMedicine จากรายการด้านซ้าย
          </div>
        )}
      </div>
    </div>
  );
};
