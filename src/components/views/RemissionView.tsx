import React, { useState } from 'react';
import { RemissionRecord, Patient } from '../../types';
import { formatHN } from '../../utils/thaiDate';
import { TrendingDown, Award, HeartPulse, CheckCircle2, Plus, Trash2, ArrowDownRight } from 'lucide-react';

interface RemissionViewProps {
  patients: Patient[];
}

export const RemissionView: React.FC<RemissionViewProps> = ({ patients }) => {
  const [records, setRecords] = useState<RemissionRecord[]>([
    {
      id: 'rem-1',
      hn: '580042',
      name: 'นางบัวผัน คำแสน',
      enrollDate: '01/06/2569',
      baselineHba1c: '8.2',
      currentHba1c: '5.7',
      status: 'อยู่ในเกณฑ์สงบ (Remission)',
      weightLossKg: '6.5',
      fastingGlucose: '98',
      doctorNote: 'หยุดยา Metformin ครบ 3 เดือน ค่าน้ำตาลสะสม HbA1c ยังอยู่ในเกณฑ์ <6.5% ออกกำลังกายสม่ำเสมอ'
    },
    {
      id: 'rem-2',
      hn: '580001',
      name: 'นายสมหมาย ใจดี',
      enrollDate: '15/08/2569',
      baselineHba1c: '7.8',
      currentHba1c: '6.4',
      status: 'หยุดยาเบาหวานแล้ว',
      weightLossKg: '4.0',
      fastingGlucose: '115',
      doctorNote: 'เริ่มหยุดยาเบาหวาน นัดติดตามผลเลือดและ HbA1c ทุก 3 เดือน'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [hn, setHn] = useState('');
  const [name, setName] = useState('');
  const [baselineHba1c, setBaselineHba1c] = useState('8.0');
  const [currentHba1c, setCurrentHba1c] = useState('6.2');
  const [weightLoss, setWeightLoss] = useState('5.0');
  const [status, setStatus] = useState<any>('อยู่ในเกณฑ์สงบ (Remission)');
  const [doctorNote, setDoctorNote] = useState('');

  const handleHNLookup = () => {
    const found = patients.find(p => p.hn === hn.trim());
    if (found) {
      setName(`${found.prefix} ${found.firstName} ${found.lastName}`.trim());
    } else {
      alert(`ไม่พบ HN ${hn} ในระบบ`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hn || !name) return;

    const newRec: RemissionRecord = {
      id: `rem-${Date.now()}`,
      hn,
      name,
      enrollDate: new Date().toLocaleDateString('th-TH'),
      baselineHba1c,
      currentHba1c,
      status,
      weightLossKg: weightLoss,
      fastingGlucose: '100',
      doctorNote: doctorNote || 'ติดตามโปรแกรมปรับเปลี่ยนพฤติกรรม DM Remission'
    };

    setRecords([newRec, ...records]);
    setShowModal(false);
    setHn('');
    setName('');
    setDoctorNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-purple-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">ระบบติดตามคลินิกเบาหวานสงบ (Diabetes Remission Clinic)</h2>
            <p className="text-xs text-slate-500">เป้าหมาย HbA1c &lt; 6.5% โดยหยุดยาเบาหวานอย่างน้อย 3 เดือน ด้วยการปรับเปลี่ยนพฤติกรรม</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          ลงทะเบียนผู้ป่วย Remission
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-purple-900">
              {records.filter(r => r.status.includes('Remission')).length} คน
            </div>
            <div className="text-xs text-slate-500">เข้าสู่ระยะสงบสมบูรณ์ (Remission)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-900">
              {records.filter(r => r.status.includes('หยุดยา')).length} คน
            </div>
            <div className="text-xs text-slate-500">หยุดยาเบาหวานได้สำเร็จ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">{records.length} คน</div>
            <div className="text-xs text-slate-500">ผู้เข้าร่วมโปรแกรมทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">วันที่เริ่มเข้าโปรแกรม</th>
                <th className="py-2.5 px-3">HN</th>
                <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                <th className="py-2.5 px-3 text-center">HbA1c เริ่มต้น</th>
                <th className="py-2.5 px-3 text-center">HbA1c ปัจจุบัน</th>
                <th className="py-2.5 px-3 text-center">น้ำหนักที่ลดได้</th>
                <th className="py-2.5 px-3 text-center">สถานะการสงบ</th>
                <th className="py-2.5 px-4">บันทึกของแพทย์ / แผนการดูแล</th>
                <th className="py-2.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{r.enrollDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{formatHN(r.hn)}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{r.baselineHba1c}%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                      {r.currentHba1c}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-blue-700">
                    -{r.weightLossKg} กก.
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-sm">{r.doctorNote}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setRecords(records.filter(x => x.id !== r.id))}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
              <span className="font-bold text-sm">ลงทะเบียนผู้ป่วยเข้าร่วมโปรแกรม DM Remission</span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">HN ผู้ป่วย *</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      value={hn}
                      onChange={e => setHn(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleHNLookup}
                      className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg"
                    >
                      ค้นหา
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ชื่อ-สกุล</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1">HbA1c เริ่มต้น (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={baselineHba1c}
                    onChange={e => setBaselineHba1c(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">HbA1c ปัจจุบัน (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentHba1c}
                    onChange={e => setCurrentHba1c(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">น้ำหนักที่ลดได้ (กก.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightLoss}
                    onChange={e => setWeightLoss(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">สถานะ Remission</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="อยู่ในเกณฑ์สงบ (Remission)">อยู่ในเกณฑ์สงบ (Remission: HbA1c &lt; 6.5% ไม่ทานยา)</option>
                  <option value="หยุดยาเบาหวานแล้ว">หยุดยาเบาหวานแล้ว (กำลังติดตาม)</option>
                  <option value="กำลังปรับเปลี่ยนพฤติกรรม">กำลังปรับเปลี่ยนพฤติกรรมและลดขนาดยา</option>
                  <option value="กลับมาใช้ยา">กลับมาใช้ยา</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">บันทึกของแพทย์ / แผนการดูแล</label>
                <textarea
                  rows={2}
                  value={doctorNote}
                  onChange={e => setDoctorNote(e.target.value)}
                  placeholder="บันทึกการควบคุมอาหาร คาร์โบไฮเดรต การออกกำลังกาย..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  บันทึกเข้าโปรแกรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
