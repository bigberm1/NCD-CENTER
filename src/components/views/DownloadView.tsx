import React, { useState } from 'react';
import { DownloadFile } from '../../types';
import { Download, FileText, FileSpreadsheet, Plus, Trash2, PenSquare, File, ExternalLink, Image } from 'lucide-react';

interface DownloadViewProps {
  downloadFiles: DownloadFile[];
  onSaveFile: (file: DownloadFile) => Promise<any>;
  onDeleteFile: (fileId: string) => Promise<any>;
}

export const DownloadView: React.FC<DownloadViewProps> = ({
  downloadFiles,
  onSaveFile,
  onDeleteFile
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (type.includes('sheet') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg')) {
      return <Image className="w-5 h-5 text-purple-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFileName('');
    setFileType('application/pdf');
    setShowModal(true);
  };

  const handleOpenEdit = (f: DownloadFile) => {
    setEditingId(f.fileId);
    setFileName(f.fileName);
    setFileType(f.fileType);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const payload: DownloadFile = {
      fileId: editingId || `file-${Date.now()}`,
      fileName: fileName.trim(),
      fileSize: editingId ? '1.5 MB' : '850 KB',
      updatedDate: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      fileUrl: '#',
      fileType: fileType
    };

    await onSaveFile(payload);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">ศูนย์รวมเอกสารและแบบฟอร์มดาวน์โหลด (Download Center)</h2>
            <p className="text-xs text-slate-500">รวมแบบฟอร์มการตรวจคัดกรอง NCD, แนวทางเวชปฏิบัติ, เทมเพลต Excel สำหรับบันทึกข้อมูล</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          เพิ่มไฟล์เอกสาร
        </button>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">ลำดับ</th>
                <th className="py-2.5 px-3">ชื่อไฟล์เอกสาร</th>
                <th className="py-2.5 px-3 text-center">ขนาดไฟล์</th>
                <th className="py-2.5 px-3">วันที่อัปเดต</th>
                <th className="py-2.5 px-3 text-center">ดาวน์โหลด</th>
                <th className="py-2.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {downloadFiles.map((file, idx) => (
                <tr key={file.fileId} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        {getFileIcon(file.fileType, file.fileName)}
                      </div>
                      <span className="truncate max-w-md">{file.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 font-mono">{file.fileSize}</td>
                  <td className="py-3 px-3 text-slate-600">{file.updatedDate}</td>
                  <td className="py-3 px-3 text-center">
                    <a
                      href={file.fileUrl || '#'}
                      onClick={(e) => {
                        if (file.fileUrl === '#') {
                          e.preventDefault();
                          alert(`กำลังดาวน์โหลดไฟล์: ${file.fileName}`);
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold inline-flex items-center gap-1.5 transition text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ดาวน์โหลด
                    </a>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(file)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบไฟล์ ${file.fileName}?`)) {
                            onDeleteFile(file.fileId);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
              <span className="font-bold text-sm">
                {editingId ? 'แก้ไขชื่อไฟล์เอกสาร' : 'เพิ่มไฟล์เอกสารใหม่'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">ชื่อไฟล์เอกสาร *</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="เช่น คู่มือการตรวจคัดกรองเบาหวาน.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">ชนิดไฟล์</label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="application/pdf">เอกสาร PDF (.pdf)</option>
                  <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Worksheet (.xlsx)</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</option>
                  <option value="image/png">รูปภาพ PNG (.png)</option>
                </select>
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
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
