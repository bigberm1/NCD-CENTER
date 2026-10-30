import React, { useState } from 'react';
import { Patient, LabRecord, FundusRecord } from '../../types';
import { FileSpreadsheet, Download, CheckCircle, Database, AlertCircle, FileText } from 'lucide-react';

interface Export43ViewProps {
  patients: Patient[];
  labRecords: LabRecord[];
  fundusRecords: FundusRecord[];
}

export const Export43View: React.FC<Export43ViewProps> = ({
  patients,
  labRecords,
  fundusRecords
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('PERSON');
  const [previewContent, setPreviewContent] = useState<string>('');

  const FOLDERS = [
    { code: 'PERSON', name: 'ข้อมูลประชากรทั่วไปและที่อยู่', count: patients.length },
    { code: 'CHRONIC', name: 'ทะเบียนผู้ป่วยโรคเรื้อรัง (HT, DM, DLP)', count: patients.filter(p => p.ht || p.dm || p.dlp).length },
    { code: 'LABFU', name: 'ข้อมูลผลการตรวจทางห้องปฏิบัติการ (Lab)', count: labRecords.length },
    { code: 'NCDSCREEN', name: 'ข้อมูลคัดกรองเบาหวาน/ความดันและตรวจตา', count: fundusRecords.length },
    { code: 'CLINIC', name: 'ข้อมูลการให้บริการคลินิก NCD', count: patients.length },
    { code: 'APPOINT', name: 'ข้อมูลการนัดหมายผู้รับบริการ', count: fundusRecords.filter(f => f.nextAppointment).length }
  ];

  const handleGeneratePreview = (folderCode: string) => {
    setSelectedFolder(folderCode);
    let sample = '';

    if (folderCode === 'PERSON') {
      const header = 'HOSPCODE|PID|CID|PRENAME|NAME|LNAME|HN|SEX|BIRTH|MSTATUS|OCCUPATION|NATION|RELIGION|EDUCATION|TYPEAREA|D_UPDATE\n';
      const rows = patients.map(p =>
        `${p.serviceCode}|${p.hn}|${p.cid13}|${p.prefix}|${p.firstName}|${p.lastName}|${p.hn}|1|${p.birthDate.replace(/\//g, '')}|1|01|099|01|01|1|${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
      ).join('\n');
      sample = header + rows;
    } else if (folderCode === 'CHRONIC') {
      const header = 'HOSPCODE|PID|DATEDX|CHRONIC|HOSP_DX|HOSP_RX|DATE_DISCH|TYPEDISCH|D_UPDATE\n';
      const rows = patients.flatMap(p => {
        const list = [];
        if (p.ht) list.push(`${p.serviceCode}|${p.hn}|${p.ht.replace(/\//g, '')}|I10|${p.serviceCode}|${p.serviceCode}||01|20261030`);
        if (p.dm) list.push(`${p.serviceCode}|${p.hn}|${p.dm.replace(/\//g, '')}|E119|${p.serviceCode}|${p.serviceCode}||01|20261030`);
        if (p.dlp) list.push(`${p.serviceCode}|${p.hn}|${p.dlp.replace(/\//g, '')}|E785|${p.serviceCode}|${p.serviceCode}||01|20261030`);
        return list;
      }).join('\n');
      sample = header + rows;
    } else if (folderCode === 'LABFU') {
      const header = 'HOSPCODE|PID|SEQ|DATE_SERV|LABTEST|LABRESULT|D_UPDATE\n';
      const rows = labRecords.map(l =>
        `${l.id.slice(0, 5)}|${l.hn}|${l.visitNum}|${l.serviceDate.replace(/\//g, '')}|FBS|${l.fbs}|20261030\n` +
        `${l.id.slice(0, 5)}|${l.hn}|${l.visitNum}|${l.serviceDate.replace(/\//g, '')}|HBA1C|${l.hba1c}|20261030`
      ).join('\n');
      sample = header + rows;
    } else {
      sample = `HOSPCODE|PID|D_SERV|DETAIL|D_UPDATE\n05869|580001|20261025|DATA_RECORD_OK|20261030`;
    }

    setPreviewContent(sample);
  };

  const handleDownloadFile = () => {
    if (!previewContent) handleGeneratePreview(selectedFolder);
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFolder}_05869_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">ระบบส่งออก 43 แฟ้มมาตรฐานกระทรวงสาธารณสุข (HDC 43 Folders)</h2>
            <p className="text-xs text-slate-500">แปลงข้อมูลผู้ป่วยโรคเรื้อรัง ผลการตรวจแล็บ และผลตรวจตาตามโครงสร้างแฟ้มมาตรฐาน สปสช./HDC</p>
          </div>
        </div>

        <button
          onClick={handleDownloadFile}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          ดาวน์โหลดแฟ้ม {selectedFolder}.txt
        </button>
      </div>

      {/* Grid of Folders */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {FOLDERS.map((f) => {
          const isSelected = selectedFolder === f.code;
          return (
            <button
              key={f.code}
              type="button"
              onClick={() => handleGeneratePreview(f.code)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <span className="font-mono text-sm font-bold block">{f.code}</span>
                <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                  {f.name}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-3 self-start ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {f.count} รายการ
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>ตัวอย่างเนื้อหาแฟ้ม {selectedFolder}.txt (รูปแบบ Pipe-Delimited Standard)</span>
          </div>
          <button
            onClick={() => handleGeneratePreview(selectedFolder)}
            className="text-xs text-blue-600 hover:underline"
          >
            สร้างตัวอย่างใหม่
          </button>
        </div>

        <pre className="bg-slate-900 text-amber-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
          {previewContent || 'กดเลือกแฟ้มด้านบนเพื่อดูตัวอย่างข้อมูล'}
        </pre>
      </div>
    </div>
  );
};
