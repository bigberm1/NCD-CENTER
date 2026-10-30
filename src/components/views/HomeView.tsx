import React, { useState, useMemo } from 'react';
import { Patient, FundusDate, FundusRecord, LabRecord, ServiceUnitStat, DashboardFundusSummary } from '../../types';
import { getFiscalYear } from '../../utils/thaiDate';
import { supabaseManager } from '../../lib/supabase';
import {
  Users,
  Eye,
  Activity,
  Building2,
  Calendar,
  Filter,
  RotateCcw,
  TrendingUp,
  Database,
  CheckCircle2,
  Search
} from 'lucide-react';

interface HomeViewProps {
  patients: Patient[];
  fundusDates: FundusDate[];
  fundusRecords: FundusRecord[];
  labRecords: LabRecord[];
  serviceUnitStats?: ServiceUnitStat[];
  dashboardFundus?: DashboardFundusSummary[];
  onSyncComplete?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  patients,
  fundusDates,
  fundusRecords,
  labRecords,
  serviceUnitStats = [],
  dashboardFundus = [],
  onSyncComplete
}) => {
  const [activeTab, setActiveTab] = useState<'patientsByService' | 'fundusByService'>('patientsByService');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // 1. Service Unit Stats (Combine Google Sheet 41 units with local patients)
  const displayServiceStats = useMemo(() => {
    if (serviceUnitStats && serviceUnitStats.length > 0) {
      if (!serviceSearch.trim()) return serviceUnitStats;
      const q = serviceSearch.trim().toLowerCase();
      return serviceUnitStats.filter(s => s.serviceName.toLowerCase().includes(q));
    }

    // Fallback: group patients by service unit
    const map: Record<string, number> = {};
    patients.forEach(p => {
      const name = p.serviceName || 'ไม่ระบุหน่วยบริการ';
      map[name] = (map[name] || 0) + 1;
    });
    const list = Object.entries(map).map(([serviceName, count]) => ({
      serviceName,
      patientCount: count
    })).sort((a, b) => b.patientCount - a.patientCount);

    if (!serviceSearch.trim()) return list;
    const q = serviceSearch.trim().toLowerCase();
    return list.filter(s => s.serviceName.toLowerCase().includes(q));
  }, [serviceUnitStats, patients, serviceSearch]);

  const totalPatientsAllUnits = useMemo(() => {
    if (serviceUnitStats && serviceUnitStats.length > 0) {
      return serviceUnitStats.reduce((sum, s) => sum + s.patientCount, 0);
    }
    return patients.length;
  }, [serviceUnitStats, patients]);

  const maxPatientCount = useMemo(() => {
    return Math.max(...displayServiceStats.map(p => p.patientCount), 1);
  }, [displayServiceStats]);

  // 2. Fundus dates and options for filter
  const allFundusSummaries = useMemo(() => {
    if (dashboardFundus && dashboardFundus.length > 0) {
      return dashboardFundus;
    }
    // Fallback generate from fundusDates
    return fundusDates.map(d => {
      const recs = fundusRecords.filter(r => r.sessionID === d.id || r.date === d.date);
      let noDR = 0, mildNPDR = 0, moderateNPDR = 0, severeNPDR = 0, pdr = 0, poorView = 0;
      recs.forEach(r => {
        const worst = [r.resultLeft, r.resultRight].join(' ');
        if (worst.includes('PDR') && !worst.includes('NPDR')) pdr++;
        else if (worst.includes('Severe NPDR')) severeNPDR++;
        else if (worst.includes('Moderate NPDR')) moderateNPDR++;
        else if (worst.includes('Mild NPDR')) mildNPDR++;
        else if (worst.includes('Poor View')) poorView++;
        else if (worst.includes('No DR')) noDR++;
      });
      return {
        id: d.id,
        examDate: d.date,
        location: d.serviceName,
        total: recs.length,
        noDR,
        mildNPDR,
        moderateNPDR,
        severeNPDR,
        pdr,
        poorView
      };
    });
  }, [dashboardFundus, fundusDates, fundusRecords]);

  const fundusFiscalYears = useMemo(() => {
    const years = new Set<string>();
    allFundusSummaries.forEach(d => {
      const fy = getFiscalYear(d.examDate);
      if (fy) years.add(fy);
    });
    return Array.from(years).sort().reverse();
  }, [allFundusSummaries]);

  const fundusLocations = useMemo(() => {
    const locs = new Set<string>();
    allFundusSummaries.forEach(d => {
      if (d.location) locs.add(d.location);
    });
    return Array.from(locs).sort();
  }, [allFundusSummaries]);

  // 3. Filtered fundus data
  const filteredFundusData = useMemo(() => {
    return allFundusSummaries.filter(d => {
      let matchYear = true;
      let matchLoc = true;
      if (selectedYear) {
        const fy = getFiscalYear(d.examDate);
        matchYear = fy === selectedYear;
      }
      if (selectedLocation) {
        matchLoc = d.location === selectedLocation;
      }
      return matchYear && matchLoc;
    });
  }, [allFundusSummaries, selectedYear, selectedLocation]);

  // Calculate totals from fundus screening
  const fundusTotals = useMemo(() => {
    return filteredFundusData.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      noDR: acc.noDR + curr.noDR,
      mild: acc.mild + curr.mildNPDR,
      moderate: acc.moderate + curr.moderateNPDR,
      severe: acc.severe + curr.severeNPDR,
      pdr: acc.pdr + curr.pdr,
      poorView: acc.poorView + curr.poorView
    }), { total: 0, noDR: 0, mild: 0, moderate: 0, severe: 0, pdr: 0, poorView: 0 });
  }, [filteredFundusData]);

  // Stats Counters
  const htCount = patients.filter(p => p.ht && p.ht !== '-').length;
  const dmCount = patients.filter(p => p.dm && p.dm !== '-').length;

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await supabaseManager.syncGoogleSheetDataToSupabase();
    setIsSyncing(false);
    setSyncFeedback(res.message);
    if (onSyncComplete) onSyncComplete();
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{totalPatientsAllUnits.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">ผู้ป่วยในระบบทั้งหมด (คน)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-sky-700">{serviceUnitStats.length || 41} แห่ง</div>
            <div className="text-xs text-slate-500 font-medium">หน่วยบริการเครือข่าย อ.เมือง</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{fundusTotals.total.toLocaleString()} คน</div>
            <div className="text-xs text-slate-500 font-medium">ยอดตรวจคัดกรองจอตา (DR)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-700">
              {(fundusTotals.severe + fundusTotals.pdr).toLocaleString()} คน
            </div>
            <div className="text-xs text-slate-500 font-medium">Severe NPDR / PDR (ส่งต่อ)</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('patientsByService')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
              activeTab === 'patientsByService'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            จำนวนผู้ป่วยตามหน่วยบริการ (41 แห่ง)
          </button>

          <button
            onClick={() => setActiveTab('fundusByService')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
              activeTab === 'fundusByService'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            Dashboard ตรวจตา (Fundus)
          </button>
        </div>

        {/* Sync Google Sheet Data to Supabase Button */}
        <button
          onClick={handleSyncToSupabase}
          disabled={isSyncing}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          title="ซิงก์ข้อมูลฐานข้อมูลเดิมจาก Google Sheet นี้เข้าสู่ Supabase"
        >
          <Database className="w-3.5 h-3.5" />
          {isSyncing ? 'กำลังนำเข้าสู่ Supabase...' : 'นำเข้าชุดข้อมูลนี้สู่ Supabase'}
        </button>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Tab 1: Patients by Service Unit */}
      {activeTab === 'patientsByService' && (
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">
                สถิติจำนวนผู้ป่วยจำแนกตามชื่อหน่วยบริการ (Google Sheet เดิม)
              </h2>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="ค้นหาชื่อหน่วยบริการ..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>
          </div>

          {/* Clean Visual Bar Chart of All Units */}
          <div className="space-y-3 pt-2 max-h-[560px] overflow-y-auto pr-1">
            {displayServiceStats.map((item, idx) => {
              const pct = Math.round((item.patientCount / maxPatientCount) * 100);
              return (
                <div key={idx} className="space-y-1 group">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-2 truncate max-w-md">
                      <span className="w-6 text-center text-[10px] font-bold text-slate-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="truncate group-hover:text-blue-600 transition font-semibold">
                        {item.serviceName}
                      </span>
                    </span>
                    <span className="font-bold text-blue-700 shrink-0 font-mono">
                      {item.patientCount.toLocaleString()} คน
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out group-hover:bg-blue-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>แสดง {displayServiceStats.length} หน่วยบริการ</span>
            <span className="font-bold text-slate-800">
              รวมผู้ป่วยทั้งหมด: {totalPatientsAllUnits.toLocaleString()} คน
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Fundus Eye Screening Dashboard */}
      {activeTab === 'fundusByService' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Filter className="w-4 h-4" />
              <span>ตัวกรอง:</span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">ปีงบประมาณทั้งหมด</option>
              {fundusFiscalYears.map(y => (
                <option key={y} value={y}>ปีงบประมาณ {y}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 max-w-xs"
            >
              <option value="">ทุกสถานที่ตรวจ</option>
              {fundusLocations.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            {(selectedYear || selectedLocation) && (
              <button
                onClick={() => {
                  setSelectedYear('');
                  setSelectedLocation('');
                }}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ต
              </button>
            )}
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  สรุปผลการตรวจคัดกรองจอประสาทตาเบาหวาน (DR) จาก Google Sheet
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                พบข้อมูล {filteredFundusData.length} รอบตรวจ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">ลำดับ</th>
                    <th className="py-2.5 px-3 text-center">วันที่ตรวจตา</th>
                    <th className="py-2.5 px-3">สถานที่ตรวจ</th>
                    <th className="py-2.5 px-3 text-center bg-blue-50/50 text-blue-900 font-bold">จำนวนทั้งหมด</th>
                    <th className="py-2.5 px-3 text-center text-emerald-700 font-semibold">No DR</th>
                    <th className="py-2.5 px-3 text-center text-sky-700 font-semibold">Mild NPDR</th>
                    <th className="py-2.5 px-3 text-center text-amber-700 font-semibold">Mod NPDR</th>
                    <th className="py-2.5 px-3 text-center text-rose-700 font-bold">Severe NPDR</th>
                    <th className="py-2.5 px-3 text-center text-rose-900 font-bold">PDR</th>
                    <th className="py-2.5 px-3 text-center text-slate-500">Poor View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFundusData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-slate-400">
                        ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredFundusData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-center font-medium">{row.examDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.location}</td>
                        <td className="py-2.5 px-3 text-center font-bold bg-blue-50/30 text-blue-800">
                          {row.total}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-700 font-medium">{row.noDR}</td>
                        <td className="py-2.5 px-3 text-center text-sky-700 font-medium">{row.mildNPDR}</td>
                        <td className="py-2.5 px-3 text-center text-amber-700 font-medium">{row.moderateNPDR}</td>
                        <td className="py-2.5 px-3 text-center text-rose-700 font-bold">
                          {row.severeNPDR > 0 ? (
                            <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                              {row.severeNPDR}
                            </span>
                          ) : (
                            0
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-rose-900 font-bold">
                          {row.pdr > 0 ? (
                            <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-black">
                              {row.pdr}
                            </span>
                          ) : (
                            0
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{row.poorView}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Total Summary Footer */}
                {filteredFundusData.length > 0 && (
                  <tfoot className="bg-slate-100/80 font-bold text-slate-800 border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-right">รวมทั้งสิ้น:</td>
                      <td className="py-2.5 px-3 text-center text-blue-700">{fundusTotals.total}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-700">{fundusTotals.noDR}</td>
                      <td className="py-2.5 px-3 text-center text-sky-700">{fundusTotals.mild}</td>
                      <td className="py-2.5 px-3 text-center text-amber-700">{fundusTotals.moderate}</td>
                      <td className="py-2.5 px-3 text-center text-rose-700">{fundusTotals.severe}</td>
                      <td className="py-2.5 px-3 text-center text-rose-900">{fundusTotals.pdr}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{fundusTotals.poorView}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
