import React, { useState } from 'react';
import { FootRecord, Patient } from '../../types';
import { formatHN } from '../../utils/thaiDate';
import { Footprints, ShieldAlert, Plus, CheckCircle2, AlertTriangle, FileSpreadsheet, Trash2 } from 'lucide-react';

interface FootViewProps {
  patients: Patient[];
}

export const FootView: React.FC<FootViewProps> = ({ patients }) => {
  const [footRecords, setFootRecords] = useState<FootRecord[]>([
    {
      id: 'foot-1',
      date: '25/10/2569',
      hn: '580001',
      name: 'นายสมหมาย ใจดี',
      monofilamentLeft: 'ปกติ',
      monofilamentRight: 'ปกติ',
      pulseLeft: 'คลำได้',
      pulseRight: 'คลำได้',
      deformity: 'ไม่มี',
      ulcer: 'ไม่มี',
      riskLevel: 'ความเสี่ยงต่ำ',
      advice: 'การรับความรู้สึกลักษณะปกติ เท้าไม่มีแผล แนะนำสวมรองเท้าที่เหมาะสมและตรวจเท้าตนเองทุกวัน'
    },
    {
      id: 'foot-2',
      date: '18/10/2569',
      hn: '580042',
      name: 'นางบัวผัน คำแสน',
      monofilamentLeft: 'ผิดปกติ',
      monofilamentRight: 'ปกติ',
      pulseLeft: 'คลำได้',
      pulseRight: 'คลำได้',
      deformity: 'ไม่มี',
      ulcer: 'ไม่มี',
      riskLevel: 'ความเสี่ยงปานกลาง',
      advice: 'เท้าซ้ายเริ่มสูญเสียความรู้สึกจาก Monofilament test แนะนำการดูแลเท้าอย่างใกล้ชิดและตัดเล็บให้ถูกวิธี'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [hn, setHn] = useState('');
  const [name, setName] = useState('');
  const [monoLeft, setMonoLeft] = useState<'ปกติ' | 'ผิดปกติ'>('ปกติ');
  const [monoRight, setMonoRight] = useState<'ปกติ' | 'ผิดปกติ'>('ปกติ');
  const [pulseLeft, setPulseLeft] = useState<'คลำได้' | 'คลำไม่ได้'>('คลำได้');
  const [pulseRight, setPulseRight] = useState<'คลำได้' | 'คลำไม่ได้'>('คลำได้');
  const [deformity, setDeformity] = useState<'ไม่มี' | 'มี'>('ไม่มี');
  const [ulcer, setUlcer] = useState<'ไม่มี' | 'มี'>('ไม่มี');
  const [advice, setAdvice] = useState('');

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
    if (!hn || !name) {
      alert('กรุณากรอก HN และชื่อผู้ป่วย');
      return;
    }

    // Determine risk
    let risk: 'ความเสี่ยงต่ำ' | 'ความเสี่ยงปานกลาง' | 'ความเสี่ยงสูง' | 'ความเสี่ยงสูงมาก' = 'ความเสี่ยงต่ำ';
    if (ulcer === 'มี') risk = 'ความเสี่ยงสูงมาก';
    else if (deformity === 'มี' || pulseLeft === 'คลำไม่ได้' || pulseRight === 'คลำไม่ได้') risk = 'ความเสี่ยงสูง';
    else if (monoLeft === 'ผิดปกติ' || monoRight === 'ผิดปกติ') risk = 'ความเสี่ยงปานกลาง';

    const newRecord: FootRecord = {
      id: `foot-${Date.now()}`,
      date: new Date().toLocaleDateString('th-TH'),
      hn,
      name,
      monofilamentLeft: monoLeft,
      monofilamentRight: monoRight,
      pulseLeft,
      pulseRight,
      deformity,
      ulcer,
      riskLevel: risk,
      advice: advice || 'แนะนำตรวจเท้าตนเองทุกวัน สวมรองเท้าหุ้มส้น'
    };

    setFootRecords([newRecord, ...footRecords]);
    setShowModal(false);
    setHn('');
    setName('');
    setAdvice('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-5 h-5 text-orange-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">ระบบตรวจคัดกรองเท้าผู้ป่วยเบาหวาน (Diabetic Foot Screening)</h2>
            <p className="text-xs text-slate-500">ประเมิน Monofilament ชีพจรหลอดเลือดแดง แผลเบาหวาน และจัดกลุ่มความเสี่ยง</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          บันทึกผลการตรวจเท้า
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">วันที่ตรวจ</th>
                <th className="py-2.5 px-3">HN</th>
                <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                <th className="py-2.5 px-3 text-center">Monofilament ซ้าย/ขวา</th>
                <th className="py-2.5 px-3 text-center">ชีพจรเท้า ซ้าย/ขวา</th>
                <th className="py-2.5 px-2 text-center">ผิดรูป</th>
                <th className="py-2.5 px-2 text-center">แผล</th>
                <th className="py-2.5 px-3 text-center">ระดับความเสี่ยง</th>
                <th className="py-2.5 px-4">คำแนะนำการดูแลเท้า</th>
                <th className="py-2.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {footRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{r.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{formatHN(r.hn)}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      r.monofilamentLeft === 'ผิดปกติ' || r.monofilamentRight === 'ผิดปกติ'
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {r.monofilamentLeft} / {r.monofilamentRight}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.pulseLeft} / {r.pulseRight}
                  </td>
                  <td className="py-2.5 px-2 text-center">{r.deformity}</td>
                  <td className="py-2.5 px-2 text-center">
                    {r.ulcer === 'มี' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">มีแผล</span>
                    ) : (
                      'ไม่มี'
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.riskLevel === 'ความเสี่ยงต่ำ' ? 'bg-emerald-100 text-emerald-800' :
                      r.riskLevel === 'ความเสี่ยงปานกลาง' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {r.riskLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate">{r.advice}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setFootRecords(footRecords.filter(f => f.id !== r.id))}
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
              <span className="font-bold text-sm">บันทึกการตรวจเท้าผู้ป่วยเบาหวาน</span>
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

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Monofilament ซ้าย</label>
                  <select
                    value={monoLeft}
                    onChange={e => setMonoLeft(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ปกติ">ปกติ (รับความรู้สึกได้)</option>
                    <option value="ผิดปกติ">ผิดปกติ (ชา/ไม่รู้สึก)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Monofilament ขวา</label>
                  <select
                    value={monoRight}
                    onChange={e => setMonoRight(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ปกติ">ปกติ (รับความรู้สึกได้)</option>
                    <option value="ผิดปกติ">ผิดปกติ (ชา/ไม่รู้สึก)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">ชีพจรเท้าซ้าย (Dorsalis Pedis)</label>
                  <select
                    value={pulseLeft}
                    onChange={e => setPulseLeft(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="คลำได้">คลำได้ชัดเจน</option>
                    <option value="คลำไม่ได้">คลำไม่ได้ / เบามาก</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">ชีพจรเท้าขวา (Dorsalis Pedis)</label>
                  <select
                    value={pulseRight}
                    onChange={e => setPulseRight(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="คลำได้">คลำได้ชัดเจน</option>
                    <option value="คลำไม่ได้">คลำไม่ได้ / เบามาก</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ความผิดรูปของเท้า</label>
                  <select
                    value={deformity}
                    onChange={e => setDeformity(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ไม่มี">ไม่มี</option>
                    <option value="มี">มี (นิ้วเก หงิกงอ ตาปลา)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">แผลที่เท้า</label>
                  <select
                    value={ulcer}
                    onChange={e => setUlcer(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ไม่มี">ไม่มี</option>
                    <option value="มี">มีแผล</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">คำแนะนำ / การส่งต่อ</label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={e => setAdvice(e.target.value)}
                  placeholder="ให้คำแนะนำการตัดเล็บ การเลือกรองเท้า การตรวจประเมินซ้ำ..."
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
                  className="px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  บันทึกผล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
