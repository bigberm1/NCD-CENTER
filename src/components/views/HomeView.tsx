import React, { useState, useMemo } from 'react';
import { Patient, FundusDate, FundusRecord, LabRecord } from '../../types';
import { getFiscalYear } from '../../utils/thaiDate';
import { Users, Eye, Activity, Building2, Calendar, Filter, RotateCcw, TrendingUp } from 'lucide-react';

interface HomeViewProps {
  patients: Patient[];
  fundusDates: FundusDate[];
  fundusRecords: FundusRecord[];
  labRecords: LabRecord[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  patients,
  fundusDates,
  fundusRecords,
  labRecords
}) => {
  const [activeTab, setActiveTab] = useState<'patientsByService' | 'fundusByService'>('patientsByService');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // 1. Group patients by service unit
  const patientsByService = useMemo(() => {
    const map: Record<string, number> = {};
    patients.forEach(p => {
      const name = p.serviceName || 'ไม่ระบุหน่วยบริการ';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([serviceName, count]) => ({
      serviceName,
      count
    })).sort((a, b) => b.count - a.count);
  }, [patients]);

  const maxPatientCount = useMemo(() => {
    return Math.max(...patientsByService.map(p => p.count), 1);
  }, [patientsByService]);

  // 2. Fundus dates and options for filter
  const fundusFiscalYears = useMemo(() => {
    const years = new Set<string>();
    fundusDates.forEach(d => {
      const fy = getFiscalYear(d.date);
      if (fy) years.add(fy);
    });
    return Array.from(years).sort().reverse();
  }, [fundusDates]);

  const fundusLocations = useMemo(() => {
    const locs = new Set<string>();
    fundusDates.forEach(d => {
      if (d.serviceName) locs.add(d.serviceName);
    });
    return Array.from(locs).sort();
  }, [fundusDates]);

  // 3. Filtered fundus dates
  const filteredFundusData = useMemo(() => {
    return fundusDates.filter(d => {
      let matchYear = true;
      let matchLoc = true;
      if (selectedYear) {
        const fy = getFiscalYear(d.date);
        matchYear = fy === selectedYear;
      }
      if (selectedLocation) {
        matchLoc = d.serviceName === selectedLocation;
      }
      return matchYear && matchLoc;
    }).map(d => {
      // Find records for this date
      const recs = fundusRecords.filter(r => r.sessionID === d.id || r.date === d.date);
      let noDR = 0;
      let mildNPDR = 0;
      let moderateNPDR = 0;
      let severeNPDR = 0;
      let pdr = 0;
      let poorView = 0;

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
        date: d.date,
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
  }, [fundusDates, fundusRecords, selectedYear, selectedLocation]);

  // Stats Counters
  const totalPatients = patients.length;
  const htCount = patients.filter(p => p.ht && p.ht !== '-').length;
  const dmCount = patients.filter(p => p.dm && p.dm !== '-').length;
  const dlpCount = patients.filter(p => p.dlp && p.dlp !== '-').length;
  const totalFundusExams = fundusRecords.length;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{totalPatients.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">ผู้ป่วยในระบบทั้งหมด</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-sky-700">{dmCount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">เบาหวาน (DM)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{htCount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">ความดัน (HT)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{totalFundusExams.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">ตรวจคัดกรองจอตา (คน)</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-2">
        <button
          onClick={() => setActiveTab('patientsByService')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
            activeTab === 'patientsByService'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          จำนวนผู้ป่วยตามหน่วยบริการ
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

      {/* Tab 1: Patients by Service Unit */}
      {activeTab === 'patientsByService' && (
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">
                สถิติจำนวนผู้ป่วยจำแนกตามชื่อหน่วยบริการเครือข่าย
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              รวม {patientsByService.length} หน่วยบริการ
            </span>
          </div>

          {/* Clean Visual Bar Chart */}
          <div className="space-y-3.5 pt-2">
            {patientsByService.map((item, idx) => {
              const pct = Math.round((item.count / maxPatientCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate max-w-md">{item.serviceName}</span>
                    <span className="font-bold text-blue-700 shrink-0">
                      {item.count} คน
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-500 block">ผู้ป่วย HT เดี่ยว / ร่วม</span>
              <span className="text-lg font-bold text-slate-800">{htCount} คน</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-500 block">ผู้ป่วย DM เดี่ยว / ร่วม</span>
              <span className="text-lg font-bold text-slate-800">{dmCount} คน</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-500 block">ผู้ป่วย DLP เดี่ยว / ร่วม</span>
              <span className="text-lg font-bold text-slate-800">{dlpCount} คน</span>
            </div>
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
              <option value="">ทุกสถานที่ / หน่วยบริการ</option>
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
                  สรุปผลการตรวจคัดกรองจอประสาทตาเบาหวาน (DR)
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
                    <th className="py-2.5 px-3 text-center bg-blue-50/50 text-blue-900 font-bold">รวมทั้งหมด</th>
                    <th className="py-2.5 px-3 text-center text-emerald-700">No DR</th>
                    <th className="py-2.5 px-3 text-center text-sky-700">Mild NPDR</th>
                    <th className="py-2.5 px-3 text-center text-amber-700">Mod NPDR</th>
                    <th className="py-2.5 px-3 text-center text-rose-700 font-bold">Severe NPDR</th>
                    <th className="py-2.5 px-3 text-center text-rose-800 font-bold">PDR</th>
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
                        <td className="py-2.5 px-3 text-center font-medium">{row.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.location}</td>
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
                        <td className="py-2.5 px-3 text-center text-rose-800 font-bold">
                          {row.pdr > 0 ? (
                            <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
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
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
