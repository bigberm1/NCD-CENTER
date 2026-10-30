import React, { useState, useMemo } from 'react';
import { Patient } from '../../types';
import { formatHN, formatCID, formatPhone, formatThaiDateBE } from '../../utils/thaiDate';
import { INITIAL_HOSPITALS, INITIAL_RIGHTS, INITIAL_VILLAGES_33 } from '../../data/initialData';
import * as XLSX from 'xlsx';
import {
  Search,
  UserPlus,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  PenSquare,
  Trash2,
  Stethoscope,
  Hospital,
  ClipboardCheck,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  onSavePatient: (patient: Patient) => Promise<any>;
  onDeletePatient: (hn: string) => Promise<any>;
  onPrintOpdCard: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSavePatient,
  onDeletePatient,
  onPrintOpdCard
}) => {
  // Filter states
  const [searchHN, setSearchHN] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState<Patient>({
    hn: '',
    cid13: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    birthDate: '',
    houseNo: '',
    moo: '',
    village33: '',
    villageOutside: '',
    tambon: 'รอบเวียง',
    amphoe: 'เมืองเชียงราย',
    province: 'เชียงราย',
    phone: '',
    serviceCode: '05869',
    serviceName: 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)',
    treatmentRight: 'ประกันสุขภาพถ้วนหน้า (UC)',
    ht: '',
    dm: '',
    dlp: '',
    status: 'รักษาอยู่',
    deathDate: '',
    note: ''
  });

  const toggleDisease = (d: string) => {
    setSelectedDiseases(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
    setCurrentPage(1);
  };

  const handleHNQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHN.trim()) return;
    const cleanSearch = searchHN.trim().toLowerCase();
    const found = patients.find(p =>
      p.hn.toLowerCase() === cleanSearch ||
      p.cid13.replace(/\D/g, '') === cleanSearch.replace(/\D/g, '')
    );
    if (found) {
      setDetailPatient(found);
    } else {
      alert(`ไม่พบผู้ป่วย HN หรือเลขบัตร: ${searchHN} ในระบบ`);
    }
  };

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return patients.filter(p => {
      // Search text
      if (q) {
        const text = [
          p.hn,
          p.cid13,
          p.prefix,
          p.firstName,
          p.lastName,
          p.serviceName,
          p.tambon,
          p.village33
        ].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }

      // Disease filters
      if (selectedDiseases.length > 0) {
        const hasAllDiseases = selectedDiseases.every(d => {
          if (d === 'ht') return Boolean(p.ht && p.ht !== '-');
          if (d === 'dm') return Boolean(p.dm && p.dm !== '-');
          if (d === 'dlp') return Boolean(p.dlp && p.dlp !== '-');
          return false;
        });
        if (!hasAllDiseases) return false;
      }

      // Status filter
      if (statusFilter && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [patients, filterSearch, selectedDiseases, statusFilter]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormData({
      hn: '',
      cid13: '',
      prefix: 'นาย',
      firstName: '',
      lastName: '',
      birthDate: '',
      houseNo: '',
      moo: '',
      village33: INITIAL_VILLAGES_33[0] || '',
      villageOutside: '-',
      tambon: 'รอบเวียง',
      amphoe: 'เมืองเชียงราย',
      province: 'เชียงราย',
      phone: '',
      serviceCode: '05869',
      serviceName: 'PCU โฮงยาไทย (กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย)',
      treatmentRight: INITIAL_RIGHTS[0] || 'ประกันสุขภาพถ้วนหน้า (UC)',
      ht: '',
      dm: '',
      dlp: '',
      status: 'รักษาอยู่',
      deathDate: '',
      note: ''
    });
    setShowFormModal(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFormData({ ...p });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hn || !formData.firstName || !formData.lastName) {
      alert('กรุณากรอก HN และชื่อ-นามสกุลให้ครบถ้วน');
      return;
    }

    const payload: Patient = {
      ...formData,
      updateDate: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH'),
      updaterName: 'เจ้าหน้าที่คลินิก'
    };

    await onSavePatient(payload);
    setShowFormModal(false);
    if (detailPatient && detailPatient.hn === payload.hn) {
      setDetailPatient(payload);
    }
  };

  const handleDelete = async (hn: string) => {
    if (window.confirm(`ยืนยันการลบผู้ป่วย HN: ${formatHN(hn)} หรือไม่?`)) {
      await onDeletePatient(hn);
      if (detailPatient && detailPatient.hn === hn) {
        setDetailPatient(null);
      }
    }
  };

  const exportToExcel = () => {
    const rows = filteredPatients.map(p => ({
      'HN': formatHN(p.hn),
      '13 หลัก': formatCID(p.cid13),
      'คำนำหน้า': p.prefix,
      'ชื่อ': p.firstName,
      'นามสกุล': p.lastName,
      'วันเกิด': p.birthDate,
      'บ้านเลขที่': p.houseNo,
      'หมู่': p.moo,
      'ชื่อหมู่บ้าน 33 ชุมชน': p.village33,
      'ตำบล': p.tambon,
      'อำเภอ': p.amphoe,
      'จังหวัด': p.province,
      'เบอร์โทร': p.phone,
      'หน่วยบริการ': p.serviceName,
      'สิทธิการรักษา': p.treatmentRight,
      'HT': p.ht ? 'มี' : '-',
      'DM': p.dm ? 'มี' : '-',
      'DLP': p.dlp ? 'มี' : '-',
      'สถานะ': p.status
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อผู้ป่วย');
    XLSX.writeFile(wb, `Patients_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Search Card (Original NCD Style) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleHNQuickSearch} className="max-w-3xl mx-auto space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            ค้นหาผู้ป่วยด่วนด้วยเลข HN หรือเลขบัตร 13 หลัก
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchHN}
                onChange={(e) => setSearchHN(e.target.value)}
                placeholder="กรอกเลข HN เช่น 580001 หรือเลขบัตรประชาชน 13 หลัก..."
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Search className="w-4 h-4" />
              ค้นหา
            </button>
            {searchHN && (
              <button
                type="button"
                onClick={() => setSearchHN('')}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-xs transition"
              >
                ล้าง
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            ฐานข้อมูลผู้ป่วยคลินิกโรคเรื้อรัง NCD Center โฮงยาไทย (เชื่อมต่อระบบโปรแกรมต้นไม้ 2008 & Supabase)
          </span>
        </form>
      </div>

      {/* Directory & Filters Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-slate-200/70 bg-slate-50/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">กรองและค้นหารายชื่อผู้ป่วย</h2>
              <p className="text-xs text-slate-500">แสดงผลเรียลไทม์ {filteredPatients.length} รายการ (จากทั้งหมด {patients.length})</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openCreateModal}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                ลงทะเบียนผู้ป่วยใหม่
              </button>
              <button
                onClick={exportToExcel}
                className="px-3.5 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                ส่งออก Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Search Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ค้นหาในตาราง
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => {
                    setFilterSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="HN / เลข 13 หลัก / ชื่อ / ชุมชน / หน่วยบริการ..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Disease Filter Pills */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                โรคประจำตัว (เลือกได้หลายโรค)
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'ht', label: 'HT ความดัน', activeClass: 'bg-sky-100 text-sky-800 border-sky-300' },
                  { id: 'dm', label: 'DM เบาหวาน', activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                  { id: 'dlp', label: 'DLP ไขมัน', activeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
                ].map(d => {
                  const isActive = selectedDiseases.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDisease(d.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                        isActive
                          ? `${d.activeClass} shadow-2xs`
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                สถานะการรักษา
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">ทุกสถานะ</option>
                <option value="รักษาอยู่">รักษาอยู่</option>
                <option value="รักษา รพ.สต.">รักษา รพ.สต.</option>
                <option value="ติดตามไม่ได้">ติดตามไม่ได้</option>
                <option value="เสียชีวิต">เสียชีวิต</option>
              </select>
            </div>
          </div>

          {(filterSearch || selectedDiseases.length > 0 || statusFilter) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setFilterSearch('');
                  setSelectedDiseases([]);
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <FilterX className="w-3.5 h-3.5" />
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">HN</th>
                <th className="py-2.5 px-3">เลข 13 หลัก</th>
                <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                <th className="py-2.5 px-3">บ้านเลขที่</th>
                <th className="py-2.5 px-3">หมู่</th>
                <th className="py-2.5 px-3">ชื่อหมู่บ้าน/ชุมชน</th>
                <th className="py-2.5 px-3">ตำบล</th>
                <th className="py-2.5 px-3 text-center">HT</th>
                <th className="py-2.5 px-3 text-center">DM</th>
                <th className="py-2.5 px-3 text-center">DLP</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
                <th className="py-2.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    ไม่พบรายชื่อผู้ป่วยตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((p) => {
                  const fullName = `${p.prefix} ${p.firstName} ${p.lastName}`.trim();
                  return (
                    <tr key={p.hn} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{formatHN(p.hn)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{formatCID(p.cid13)}</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">{fullName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.houseNo || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.moo || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.village33 || p.villageOutside || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.tambon || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        {p.ht && p.ht !== '-' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            HT
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.dm && p.dm !== '-' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            DM
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.dlp && p.dlp !== '-' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            DLP
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status === 'รักษาอยู่' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.status === 'รักษา รพ.สต.' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          p.status === 'เสียชีวิต' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailPatient(p)}
                            className="px-2 py-1 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg text-xs font-medium transition flex items-center gap-1"
                            title="ดูข้อมูลละเอียด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ข้อมูล</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                            title="แก้ไข"
                          >
                            <PenSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.hn)}
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            แสดง {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredPatients.length)} จากทั้งหมด {filteredPatients.length} รายการ
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            >
              <option value="10">10 แถว/หน้า</option>
              <option value="25">25 แถว/หน้า</option>
              <option value="50">50 แถว/หน้า</option>
              <option value="100">100 แถว/หน้า</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL (Matching Hong Ya Thai Person Card Layout) */}
      {detailPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-base">ข้อมูลผู้ป่วยโรคเรื้อรัง (NCD Hong Ya Thai)</h3>
              </div>
              <button
                onClick={() => setDetailPatient(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-slate-50/50">
              {/* Header card with Name, HN pill, CID pill */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {detailPatient.prefix} {detailPatient.firstName} {detailPatient.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        HN: {formatHN(detailPatient.hn)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        เลขบัตร: {formatCID(detailPatient.cid13)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        สถานะ: {detailPatient.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPrintOpdCard(detailPatient)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Printer className="w-4 h-4" />
                      พิมพ์ OPD Card
                    </button>
                    <button
                      onClick={() => {
                        openEditModal(detailPatient);
                      }}
                      className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <PenSquare className="w-4 h-4" />
                      แก้ไข
                    </button>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">วันเกิด:</span>
                    <span className="font-semibold text-slate-800">{formatThaiDateBE(detailPatient.birthDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                    <span className="font-semibold text-slate-800">{formatPhone(detailPatient.phone)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">ที่อยู่:</span>
                    <span className="font-semibold text-slate-800">
                      บ้านเลขที่ {detailPatient.houseNo || '-'} หมู่ {detailPatient.moo || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">ชุมชน/หมู่บ้าน:</span>
                    <span className="font-semibold text-slate-800">{detailPatient.village33 || detailPatient.villageOutside || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">ตำบล / อำเภอ / จังหวัด:</span>
                    <span className="font-semibold text-slate-800">
                      {detailPatient.tambon} อ.{detailPatient.amphoe} จ.{detailPatient.province}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500">สิทธิการรักษา:</span>
                    <span className="font-semibold text-slate-800">{detailPatient.treatmentRight}</span>
                  </div>
                </div>
              </div>

              {/* Chronic & Service Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chronic Diseases */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>โรคประจำตัวและการวินิจฉัย</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/70 border border-sky-100">
                      <span className="font-bold text-sky-800">HT (ความดันโลหิตสูง)</span>
                      <span className="text-slate-600">{detailPatient.ht ? `วินิจฉัย: ${formatThaiDateBE(detailPatient.ht)}` : 'ยังไม่มีประวัติ'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <span className="font-bold text-emerald-800">DM (เบาหวาน)</span>
                      <span className="text-slate-600">{detailPatient.dm ? `วินิจฉัย: ${formatThaiDateBE(detailPatient.dm)}` : 'ยังไม่มีประวัติ'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                      <span className="font-bold text-amber-800">DLP (ไขมันในเลือดสูง)</span>
                      <span className="text-slate-600">{detailPatient.dlp ? `วินิจฉัย: ${formatThaiDateBE(detailPatient.dlp)}` : 'ยังไม่มีประวัติ'}</span>
                    </div>
                  </div>
                </div>

                {/* Service Unit & Hospital */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Hospital className="w-4 h-4 text-blue-600" />
                    <span>หน่วยบริการประจำและข้อมูลบันทึก</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span>รหัสหน่วยบริการ:</span>
                      <span className="font-semibold text-slate-800">{detailPatient.serviceCode}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span>ชื่อหน่วยบริการ:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-xs">{detailPatient.serviceName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span>บันทึกเพิ่มเติม:</span>
                      <span className="text-slate-800">{detailPatient.note || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 p-2 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  แก้ไขล่าสุด: {detailPatient.updateDate || '-'}
                </span>
                <span>ผู้บันทึก: {detailPatient.updaterName || '-'}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailPatient(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PATIENT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-base">
                  {editingPatient ? 'แก้ไขข้อมูลผู้ป่วย' : 'ลงทะเบียนผู้ป่วยโรคเรื้อรังใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="overflow-y-auto p-6 space-y-5 text-xs flex-1">
              {/* Section 1: Basic Info */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="font-bold text-slate-700 block">1. ข้อมูลพื้นฐานผู้ป่วย</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">HN <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.hn}
                      disabled={Boolean(editingPatient)}
                      onChange={(e) => setFormData({ ...formData, hn: e.target.value })}
                      placeholder="เช่น 580001"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">เลข 13 หลัก <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={formData.cid13}
                      onChange={(e) => setFormData({ ...formData, cid13: e.target.value })}
                      placeholder="13 หลัก"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">คำนำหน้า</label>
                    <select
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="เด็กชาย">เด็กชาย</option>
                      <option value="เด็กหญิง">เด็กหญิง</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">วันเกิด (พ.ศ.)</label>
                    <input
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      placeholder="วว/ดด/ปปปป"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">ชื่อจริง <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">นามสกุล <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="font-bold text-slate-700 block">2. ที่อยู่และการติดต่อ</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">บ้านเลขที่</label>
                    <input
                      type="text"
                      value={formData.houseNo}
                      onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">หมู่ที่</label>
                    <input
                      type="text"
                      value={formData.moo}
                      onChange={(e) => setFormData({ ...formData, moo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">ชื่อหมู่บ้าน 33 ชุมชน</label>
                    <select
                      value={formData.village33}
                      onChange={(e) => setFormData({ ...formData, village33: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="">--เลือกชุมชน--</option>
                      {INITIAL_VILLAGES_33.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">ตำบล</label>
                    <input
                      type="text"
                      value={formData.tambon}
                      onChange={(e) => setFormData({ ...formData, tambon: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">อำเภอ</label>
                    <input
                      type="text"
                      value={formData.amphoe}
                      onChange={(e) => setFormData({ ...formData, amphoe: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">จังหวัด</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxx"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Hospital & Rights */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="font-bold text-slate-700 block">3. สิทธิการรักษาและหน่วยบริการ</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">หน่วยบริการ</label>
                    <select
                      value={formData.serviceCode}
                      onChange={(e) => {
                        const h = INITIAL_HOSPITALS.find(x => x.code === e.target.value);
                        setFormData({
                          ...formData,
                          serviceCode: e.target.value,
                          serviceName: h?.name || ''
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      {INITIAL_HOSPITALS.map(h => (
                        <option key={h.code} value={h.code}>
                          {h.code} - {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">สิทธิการรักษา</label>
                    <select
                      value={formData.treatmentRight}
                      onChange={(e) => setFormData({ ...formData, treatmentRight: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      {INITIAL_RIGHTS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Chronic Diseases Diagnosis */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="font-bold text-slate-700 block">4. ประวัติวันที่วินิจฉัยโรคเรื้อรัง</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">วันที่วินิจฉัย HT</label>
                    <input
                      type="text"
                      value={formData.ht}
                      onChange={(e) => setFormData({ ...formData, ht: e.target.value })}
                      placeholder="วว/ดด/ปปปป (เว้นได้)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">วันที่วินิจฉัย DM</label>
                    <input
                      type="text"
                      value={formData.dm}
                      onChange={(e) => setFormData({ ...formData, dm: e.target.value })}
                      placeholder="วว/ดด/ปปปป (เว้นได้)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">วันที่วินิจฉัย DLP</label>
                    <input
                      type="text"
                      value={formData.dlp}
                      onChange={(e) => setFormData({ ...formData, dlp: e.target.value })}
                      placeholder="วว/ดด/ปปปป (เว้นได้)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Status & Notes */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="font-bold text-slate-700 block">5. สถานะและบันทึกเพิ่มเติม</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">สถานะผู้ป่วย</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="รักษาอยู่">รักษาอยู่</option>
                      <option value="รักษา รพ.สต.">รักษา รพ.สต.</option>
                      <option value="ติดตามไม่ได้">ติดตามไม่ได้</option>
                      <option value="เสียชีวิต">เสียชีวิต</option>
                    </select>
                  </div>
                  {formData.status === 'เสียชีวิต' && (
                    <div>
                      <label className="block text-slate-600 mb-1">วันที่เสียชีวิต</label>
                      <input
                        type="text"
                        value={formData.deathDate || ''}
                        onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                        placeholder="วว/ดด/ปปปป"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">บันทึกเพิ่มเติม</label>
                    <textarea
                      rows={2}
                      value={formData.note || ''}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="บันทึกข้อมูลอาการ แผนการรักษา หรือหมายเหตุ..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editingPatient ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลผู้ป่วย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
