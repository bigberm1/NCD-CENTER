import React from 'react';
import { Patient, LabRecord } from '../types';
import { formatHN } from '../utils/thaiDate';
import { Printer, X } from 'lucide-react';

interface OpdCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  labRecords?: LabRecord[];
  dateStr?: string | null;
}

export const OpdCardPrintModal: React.FC<OpdCardPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  labRecords = [],
  dateStr
}) => {
  if (!isOpen) return null;

  // Find relevant lab record for the patient or use latest
  const targetLab = labRecords.find(l => patient && l.hn === patient.hn) || labRecords[0] || null;

  const fullName = patient
    ? `${patient.prefix} ${patient.firstName} ${patient.lastName}`.trim()
    : targetLab?.name || '-';

  const diagnoses: string[] = [];
  if (patient?.ht && patient.ht !== '-') diagnoses.push('HT');
  if (patient?.dm && patient.dm !== '-') diagnoses.push('DM');
  if (patient?.dlp && patient.dlp !== '-') diagnoses.push('DLP');
  const diagnosisStr = diagnoses.length > 0 ? diagnoses.join(' / ') : '-';

  const handlePrint = () => {
    window.print();
  };

  const LAB_ITEMS = [
    { name: 'FBS', value: targetLab?.fbs, normal: '70-110', min: 70, max: 110 },
    { name: 'HbA1C', value: targetLab?.hba1c, normal: '4.8-6.0', min: 4.8, max: 6.0 },
    { name: 'TC', value: targetLab?.tc, normal: '150-200', min: 150, max: 200 },
    { name: 'TG', value: targetLab?.tg, normal: '0-170', min: 0, max: 170 },
    { name: 'HDL', value: targetLab?.hdl, normal: '35-95', min: 35, max: 95 },
    { name: 'LDL', value: targetLab?.ldl, normal: '0-130', min: 0, max: 130 },
    { name: 'BUN', value: targetLab?.bun, normal: '9-19', min: 9, max: 19 },
    { name: 'Cr', value: targetLab?.cr, normal: '0.5-1.5', min: 0.5, max: 1.5 },
    { name: 'eGFR', value: targetLab?.egfr, normal: '>60', min: 60, max: 999 }
  ];

  const LEFT_MEDS = [
    ['Atenolol', '50', ''],
    ['Amlodipine', '5', ''],
    ['Enalapril', '10', ''],
    ['HCTZ', '25', ''],
    ['Losartan', '50', ''],
    ['Metformin', '500', ''],
    ['Glipizide', '5', '']
  ];

  const RIGHT_MEDS = [
    ['Simvastatin', '20', ''],
    ['Atorvastatin', '40', ''],
    ['Gemfibrozil', '300', ''],
    ['Aspirin', '81', ''],
    ['Omeprazole', '20', ''],
    ['Folic acid', '5', ''],
    ['Vitamin B Complex', '', '']
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header toolbar (Hidden on print) */}
        <div className="print:hidden bg-slate-800 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm">พิมพ์แบบฟอร์มเวชระเบียน (OPD Card NCD Center)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              สั่งพิมพ์ (Print)
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white rounded-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable OPD Card Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[760px] bg-white border-2 border-slate-900 p-5 text-slate-900 font-['Sarabun',sans-serif] shadow-lg print:shadow-none print:m-0 print:border-2">
            {/* Paper Header */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3">
              <div className="text-sm font-bold leading-tight">
                <strong className="text-base font-extrabold mr-2">OPD CARD</strong>
                งานพัฒนาระบบบริการปฐมภูมิและสนับสนุนเครือข่าย กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย
              </div>
              <div className="flex items-center gap-6 mt-2">
                <div className="text-lg font-black tracking-tight">
                  HN: {patient ? formatHN(patient.hn) : targetLab?.hn || '-'}
                </div>
                <div className="text-base font-bold">
                  ชื่อ-สกุล: {fullName}
                </div>
              </div>
            </div>

            {/* Main Content Grid (Left: V/S + Lab, Right: Treatment) */}
            <div className="grid grid-cols-12 border border-slate-900">
              {/* Left Column (5 of 12) */}
              <div className="col-span-5 border-r border-slate-900 p-2 text-xs space-y-2">
                {/* V/S Details */}
                <div className="space-y-1 pb-2 border-b border-slate-900">
                  <div className="flex justify-between">
                    <span className="font-semibold">วันที่:</span>
                    <span className="font-bold">{dateStr || targetLab?.serviceDate || new Date().toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">DX:</span>
                    <span className="font-bold">{diagnosisStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>น้ำหนัก:</span>
                    <span className="font-bold">{targetLab?.weight || '-'} กก.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ส่วนสูง:</span>
                    <span className="font-bold">{targetLab?.height || '-'} ซม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความดัน (BP):</span>
                    <span className="font-bold">
                      {targetLab?.bpTop && targetLab?.bpBottom ? `${targetLab.bpTop}/${targetLab.bpBottom}` : '-'} mmHg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ชีพจร (PR):</span>
                    <span className="font-bold">{targetLab?.pr || '-'} /min</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Urine Sugar: -</span>
                    <span>Urine Albumin: -</span>
                  </div>
                </div>

                {/* Lab Result Table */}
                <div className="pt-1">
                  <div className="font-bold text-[11px] mb-1 italic">LAB result</div>
                  <table className="w-full text-[11px] border-collapse border border-slate-900 text-center">
                    <thead className="bg-slate-100 font-bold border-b border-slate-900">
                      <tr>
                        <th className="border border-slate-900 py-0.5 text-left px-1">ชื่อ Lab</th>
                        <th className="border border-slate-900 py-0.5">ค่าปกติ</th>
                        <th className="border border-slate-900 py-0.5">ผล</th>
                        <th className="border border-slate-900 py-0.5">แปลผล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LAB_ITEMS.map((item, i) => {
                        let status = '-';
                        if (item.value && !isNaN(parseFloat(item.value))) {
                          const val = parseFloat(item.value);
                          if (val < item.min || (item.max !== null && val > item.max)) {
                            status = 'ผิดปกติ';
                          } else {
                            status = 'ปกติ';
                          }
                        }
                        return (
                          <tr key={i} className="border-b border-slate-400">
                            <td className="border border-slate-900 py-0.5 text-left px-1 font-bold">{item.name}</td>
                            <td className="border border-slate-900 py-0.5 text-[10px] italic">{item.normal}</td>
                            <td className="border border-slate-900 py-0.5 font-bold">{item.value || '-'}</td>
                            <td className={`border border-slate-900 py-0.5 font-semibold ${status === 'ผิดปกติ' ? 'font-bold' : ''}`}>
                              {status}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (7 of 12) - Treatment & Doctor Signature */}
              <div className="col-span-7 p-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs mb-2">
                    การวินิจฉัย : <span className="font-extrabold underline">{diagnosisStr}</span>
                  </div>
                  <div className="font-bold text-[11px] mb-1 italic">Treatment & Medication</div>

                  <table className="w-full text-[10.5px] border-collapse border border-slate-900">
                    <thead className="bg-slate-100 border-b border-slate-900 font-bold text-center">
                      <tr>
                        <th className="border border-slate-900 py-0.5 w-6">/</th>
                        <th className="border border-slate-900 py-0.5 text-left px-1">Medication</th>
                        <th className="border border-slate-900 py-0.5 w-8">mg</th>
                        <th className="border border-slate-900 py-0.5 w-6">/</th>
                        <th className="border border-slate-900 py-0.5 text-left px-1">Medication</th>
                        <th className="border border-slate-900 py-0.5 w-8">mg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LEFT_MEDS.map((left, idx) => {
                        const right = RIGHT_MEDS[idx];
                        return (
                          <tr key={idx} className="border-b border-slate-400 h-6">
                            <td className="border border-slate-900 text-center"></td>
                            <td className="border border-slate-900 px-1 font-medium">{left[0]}</td>
                            <td className="border border-slate-900 text-center">{left[1]}</td>
                            <td className="border border-slate-900 text-center"></td>
                            <td className="border border-slate-900 px-1 font-medium">{right ? right[0] : ''}</td>
                            <td className="border border-slate-900 text-center">{right ? right[1] : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Doctor Sign Line */}
                <div className="pt-10 text-xs">
                  <div>แพทย์ ................................................................................................</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
