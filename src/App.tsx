import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/views/HomeView';
import { PatientsView } from './components/views/PatientsView';
import { FundusView } from './components/views/FundusView';
import { LabView } from './components/views/LabView';
import { TelemedView } from './components/views/TelemedView';
import { FootView } from './components/views/FootView';
import { RemissionView } from './components/views/RemissionView';
import { Export43View } from './components/views/Export43View';
import { DownloadView } from './components/views/DownloadView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { FileImportModal } from './components/FileImportModal';
import { OpdCardPrintModal } from './components/OpdCardPrintModal';
import { supabaseManager } from './lib/supabase';
import {
  Patient,
  FundusDate,
  FundusRecord,
  TelemedDate,
  TelemedRecord,
  LabRecord,
  DownloadFile,
  User,
  ServiceUnitStat,
  DashboardFundusSummary
} from './types';


export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isFileImportModalOpen, setIsFileImportModalOpen] = useState(false);
  const [isOpdPrintModalOpen, setIsOpdPrintModalOpen] = useState(false);
  const [opdPrintPatient, setOpdPrintPatient] = useState<Patient | null>(null);
  const [opdPrintDateStr, setOpdPrintDateStr] = useState<string | null>(null);

  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fundusDates, setFundusDates] = useState<FundusDate[]>([]);
  const [fundusRecords, setFundusRecords] = useState<FundusRecord[]>([]);
  const [telemedDates, setTelemedDates] = useState<TelemedDate[]>([]);
  const [telemedRecords, setTelemedRecords] = useState<TelemedRecord[]>([]);
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [downloadFiles, setDownloadFiles] = useState<DownloadFile[]>([]);
  const [serviceUnitStats, setServiceUnitStats] = useState<ServiceUnitStat[]>([]);
  const [dashboardFundus, setDashboardFundus] = useState<DashboardFundusSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(supabaseManager.getCurrentUser());
  const [supabaseConnected, setSupabaseConnected] = useState(supabaseManager.getStatus().isConnected);
  const [loading, setLoading] = useState(true);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pts, fDates, fRecs, tDates, tRecs, lRecs, dFiles, sStats, dFundus] = await Promise.all([
        supabaseManager.getPatients(),
        supabaseManager.getFundusDates(),
        supabaseManager.getFundusRecords(),
        supabaseManager.getTelemedDates(),
        supabaseManager.getTelemedRecords(),
        supabaseManager.getLabRecords(),
        supabaseManager.getDownloadFiles(),
        supabaseManager.getServiceUnitStats(),
        supabaseManager.getDashboardFundus()
      ]);

      setPatients(pts);
      setFundusDates(fDates);
      setFundusRecords(fRecs);
      setTelemedDates(tDates);
      setTelemedRecords(tRecs);
      setLabRecords(lRecs);
      setDownloadFiles(dFiles);
      setServiceUnitStats(sStats);
      setDashboardFundus(dFundus);
      setSupabaseConnected(supabaseManager.getStatus().isConnected);
    } catch (err) {
      console.error('Error loading clinic data:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers for Data Mutations
  const handleSavePatient = async (p: Patient) => {
    await supabaseManager.savePatient(p);
    const updated = await supabaseManager.getPatients();
    setPatients(updated);
  };

  const handleDeletePatient = async (hn: string) => {
    await supabaseManager.deletePatient(hn);
    const updated = await supabaseManager.getPatients();
    setPatients(updated);
  };

  const handleSaveFundusDate = async (d: FundusDate) => {
    await supabaseManager.saveFundusDate(d);
    const updated = await supabaseManager.getFundusDates();
    setFundusDates(updated);
  };

  const handleDeleteFundusDate = async (id: string) => {
    await supabaseManager.deleteFundusDate(id);
    const [dList, rList] = await Promise.all([
      supabaseManager.getFundusDates(),
      supabaseManager.getFundusRecords()
    ]);
    setFundusDates(dList);
    setFundusRecords(rList);
  };

  const handleSaveFundusRecord = async (r: FundusRecord) => {
    await supabaseManager.saveFundusRecord(r);
    const updated = await supabaseManager.getFundusRecords();
    setFundusRecords(updated);
  };

  const handleDeleteFundusRecord = async (id: string) => {
    await supabaseManager.deleteFundusRecord(id);
    const updated = await supabaseManager.getFundusRecords();
    setFundusRecords(updated);
  };

  const handleSaveTelemedDate = async (d: TelemedDate) => {
    await supabaseManager.saveTelemedDate(d);
    const updated = await supabaseManager.getTelemedDates();
    setTelemedDates(updated);
  };

  const handleDeleteTelemedDate = async (id: string) => {
    await supabaseManager.deleteTelemedDate(id);
    const [dList, rList] = await Promise.all([
      supabaseManager.getTelemedDates(),
      supabaseManager.getTelemedRecords()
    ]);
    setTelemedDates(dList);
    setTelemedRecords(rList);
  };

  const handleSaveTelemedRecord = async (r: TelemedRecord) => {
    await supabaseManager.saveTelemedRecord(r);
    const updated = await supabaseManager.getTelemedRecords();
    setTelemedRecords(updated);
  };

  const handleDeleteTelemedRecord = async (id: string) => {
    await supabaseManager.deleteTelemedRecord(id);
    const updated = await supabaseManager.getTelemedRecords();
    setTelemedRecords(updated);
  };

  const handleSaveLabBatch = async (records: LabRecord[], overwrite: boolean) => {
    await supabaseManager.saveLabRecordsBatch(records, overwrite);
    const updated = await supabaseManager.getLabRecords();
    setLabRecords(updated);
  };

  const handleDeleteLabByDate = async (dateStr: string) => {
    await supabaseManager.deleteLabRecordsByDate(dateStr);
    const updated = await supabaseManager.getLabRecords();
    setLabRecords(updated);
  };

  const handleDeleteLabById = async (id: string) => {
    await supabaseManager.deleteLabRecordById(id);
    const updated = await supabaseManager.getLabRecords();
    setLabRecords(updated);
  };

  const handleSaveDownloadFile = async (f: DownloadFile) => {
    await supabaseManager.saveDownloadFile(f);
    const updated = await supabaseManager.getDownloadFiles();
    setDownloadFiles(updated);
  };

  const handleDeleteDownloadFile = async (id: string) => {
    await supabaseManager.deleteDownloadFile(id);
    const updated = await supabaseManager.getDownloadFiles();
    setDownloadFiles(updated);
  };

  // OPD Card print trigger
  const handlePrintOpdCardForPatient = (p: Patient) => {
    setOpdPrintPatient(p);
    setOpdPrintDateStr(null);
    setIsOpdPrintModalOpen(true);
  };

  const handlePrintAllOpdCardsForDate = (dateStr: string) => {
    setOpdPrintPatient(null);
    setOpdPrintDateStr(dateStr);
    setIsOpdPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Sarabun',sans-serif] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        counts={{
          patients: patients.length,
          fundusDates: fundusDates.length,
          telemedDates: telemedDates.length,
          labRecords: labRecords.length
        }}
      />

      {/* Main Body */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Navbar
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenFileImportModal={() => setIsFileImportModalOpen(true)}
          supabaseConnected={supabaseConnected}
          currentUser={currentUser}
        />

        <main className="p-4 lg:p-7 flex-1 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">กำลังโหลดข้อมูลระบบ NCD Center...</span>
            </div>
          ) : (
            <>
              {currentView === 'home' && (
                <HomeView
                  patients={patients}
                  fundusDates={fundusDates}
                  fundusRecords={fundusRecords}
                  labRecords={labRecords}
                  serviceUnitStats={serviceUnitStats}
                  dashboardFundus={dashboardFundus}
                  onSyncComplete={loadAllData}
                />
              )}


              {currentView === 'patients' && (
                <PatientsView
                  patients={patients}
                  onSavePatient={handleSavePatient}
                  onDeletePatient={handleDeletePatient}
                  onPrintOpdCard={handlePrintOpdCardForPatient}
                />
              )}

              {currentView === 'fundus' && (
                <FundusView
                  fundusDates={fundusDates}
                  fundusRecords={fundusRecords}
                  patients={patients}
                  onSaveFundusDate={handleSaveFundusDate}
                  onDeleteFundusDate={handleDeleteFundusDate}
                  onSaveFundusRecord={handleSaveFundusRecord}
                  onDeleteFundusRecord={handleDeleteFundusRecord}
                />
              )}

              {currentView === 'lab' && (
                <LabView
                  labRecords={labRecords}
                  onSaveLabBatch={handleSaveLabBatch}
                  onDeleteLabByDate={handleDeleteLabByDate}
                  onDeleteLabById={handleDeleteLabById}
                  onPrintAllOpdCardsForDate={handlePrintAllOpdCardsForDate}
                />
              )}

              {currentView === 'telemed' && (
                <TelemedView
                  telemedDates={telemedDates}
                  telemedRecords={telemedRecords}
                  patients={patients}
                  onSaveTelemedDate={handleSaveTelemedDate}
                  onDeleteTelemedDate={handleDeleteTelemedDate}
                  onSaveTelemedRecord={handleSaveTelemedRecord}
                  onDeleteTelemedRecord={handleDeleteTelemedRecord}
                />
              )}

              {currentView === 'foot' && (
                <FootView patients={patients} />
              )}

              {currentView === 'remission' && (
                <RemissionView patients={patients} />
              )}

              {currentView === 'export43' && (
                <Export43View
                  patients={patients}
                  labRecords={labRecords}
                  fundusRecords={fundusRecords}
                />
              )}

              {currentView === 'download' && (
                <DownloadView
                  downloadFiles={downloadFiles}
                  onSaveFile={handleSaveDownloadFile}
                  onDeleteFile={handleDeleteDownloadFile}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Supabase Connection Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={() => {
          setSupabaseConnected(supabaseManager.getStatus().isConnected);
          loadAllData();
        }}
      />

      {/* File Data Extractor & Importer Modal */}
      <FileImportModal
        isOpen={isFileImportModalOpen}
        onClose={() => setIsFileImportModalOpen(false)}
        onImportComplete={loadAllData}
      />

      {/* OPD Card Printable Modal */}
      <OpdCardPrintModal
        isOpen={isOpdPrintModalOpen}
        onClose={() => setIsOpdPrintModalOpen(false)}
        patient={opdPrintPatient}
        labRecords={
          opdPrintDateStr
            ? labRecords.filter(l => l.serviceDate === opdPrintDateStr)
            : opdPrintPatient
            ? labRecords.filter(l => l.hn === opdPrintPatient.hn)
            : labRecords
        }
        dateStr={opdPrintDateStr}
      />
    </div>
  );
}
