// https://script.google.com/macros/s/AKfycbxClBBJ7t2RJcZfA-0ei_c-e3_qo55-X6MdBsdlgOQ_WNZOj5IKwqZUbMbxzM1LDnCt/exec

const SPREADSHEET_ID = '1wAWxLj8-PJLcTFfk8KGfRfwlweOtrvi2t2Ufn9-hFMA';
const SHEET_PERSON = 'person';
const SHEET_USER = 'user';
const SHEET_HOSPITAL = 'c_hospital';
const SHEET_RIGHT = 'c_right';
const SHEET_VILLAGE = 'c_village';
const SHEET_FUNDUS_OPTION = 'c_fundus';
const SHEET_FUNDUS_DATE = 'fundus_date';
const SHEET_FUNDUS = 'fundus';
const SHEET_LAB = 'lab';
const SHEET_DASHBOARD = 'dashboard';
const SHEET_TELEMED_DATE = 'telemed_date';
const SHEET_TELEMED = 'telemed';
const SHEET_TELEMED_ROOM = 'c_tele_room';
const SHEET_DOWNLOAD = 'download';
const DOWNLOAD_FOLDER_ID = '1Ovv5fTdtTMekS0-fVcXJ-EkB9jXfviho'; // Google Drive folder for download files

// Constants for download functionality
const FUNDUS_DATE_HEADERS = [
  'id',
  'วันที่',
  'รหัสหน่วยบริการ',
  'หน่วยบริการ',
  'ชื่อผู้บันทึก',
  'วันที่บันทึก'
];
const FUNDUS_DATE_FIELDS = [
  'id',
  'date',
  'serviceCode',
  'serviceName',
  'recorderName',
  'recordDate'
];
const FUNDUS_DATE_ID_COL = 0;
const FUNDUS_DATE_DATE_COL = 1;

const FUNDUS_HEADERS = [
  'ID',
  'วันที่ตรวจ',
  'HN',
  'คำนำหน้า',
  'ชื่อ',
  'นามสกุล',
  'น้ำหนัก',
  'ส่วนสูง',
  'รอบเอว',
  'SBP',
  'DBP',
  'PR',
  'ผลการตรวจ (ซ้าย)',
  'ผลการตรวจ (ขวา)',
  'นัดครั้งต่อไป',
  'สถานะการมาตามนัด',
  'บันทึกการมาตามนัด',
  'SessionID',
  'ชื่อผู้บันทึก',
  'วันที่บันทึก',
  'ชื่อผู้แก้ไข',
  'วันที่แก้ไข'
];
const FUNDUS_FIELDS = [
  'id',
  'date',
  'hn',
  'prefix',
  'firstName',
  'lastName',
  'weight',
  'height',
  'waist',
  'sbp',
  'dbp',
  'pr',
  'resultLeft',
  'resultRight',
  'nextAppointment',
  'appointmentStatus',
  'appointmentNote',
  'sessionID',
  'recorderName',
  'recordDate',
  'updaterName',
  'updateDate'
];
const FUNDUS_ID_COL = 0;
const FUNDUS_DATE_COL = 1;
const FUNDUS_HN_COL = 2;
const FUNDUS_SESSION_ID_COL = 14;

const TELEMED_DATE_HEADERS = [
  'id',
  'วันที่นัด',
  'รหัสหน่วยบริการ',
  'หน่วยบริการ',
  'ชื่อผู้บันทึก',
  'วันที่บันทึก'
];
const TELEMED_DATE_FIELDS = [
  'id',
  'date',
  'serviceCode',
  'serviceName',
  'recorderName',
  'recordDate'
];
const TELEMED_DATE_ID_COL = 0;
const TELEMED_DATE_DATE_COL = 1;

const TELEMED_HEADERS = [
  'ID',
  'วันที่นัด',
  'HN',
  'คำนำหน้า',
  'ชื่อ',
  'นามสกุล',
  'HT',
  'DM',
  'DLP',
  'โรคอื่นๆ',
  'เบอร์โทร',
  'รายละเอียด',
  'ใบยินยอม',
  'รหัสหน่วยบริการ',
  'หน่วยบริการ',
  'ห้อง TeleMed',
  'ผู้ให้บริการ',
  'นัด (เดือน)',
  'วันที่นัด',
  'หมายเหตุ',
  'SessionID',
  'ชื่อผู้บันทึก',
  'วันที่บันทึก',
  'ชื่อผู้แก้ไข',
  'วันที่แก้ไข'
];
const TELEMED_FIELDS = [
  'id',
  'date',
  'hn',
  'prefix',
  'firstName',
  'lastName',
  'ht',
  'dm',
  'dlp',
  'otherDisease',
  'phone',
  'details',
  'consent',
  'serviceCode',
  'serviceName',
  'room',
  'provider',
  'appointmentMonth',
  'appointmentDate',
  'note',
  'sessionID',
  'recorderName',
  'recordDate',
  'updaterName',
  'updateDate'
];
const TELEMED_ID_COL = 0;
const TELEMED_DATE_COL = 1;
const TELEMED_HN_COL = 2;
const TELEMED_SESSION_ID_COL = 20;

const SESSION_TTL_SECONDS = 14400; // 4 ชั่วโมง
const SESSION_CACHE_PREFIX = 'NCD_TREE_SESSION_';

const LOOKUP_CACHE_KEY = 'NCD_TREE_LOOKUPS_V1';
const LOOKUP_CACHE_SECONDS = 600; // 10 นาที

const HN_CACHE_PREFIX = 'NCD_TREE_HN_';
const HN_CACHE_SECONDS = 14400; // 4 ชั่วโมง

const PERSON_HEADERS = [
  'HN', '13 หลัก', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'วันเกิด',
  'บ้านเลขที่', 'หมู่', 'ชื่อหมู่บ้าน 33 ชุมชน', 'ชื่อหมู่บ้านนอกเขต',
  'ตำบล', 'อำเภอ', 'จังหวัด', 'เบอร์โทร', 'รหัสหน่วยบริการ',
  'ชื่อหน่วยบริการ', 'สิทธิการรักษา',
  'HT', 'DM', 'DLP', 'สถานะ', 'วันที่เสียชีวิต',
  'บันทึกเพิ่มเติม', 'วันที่ Upddate', 'ชื่อผู้แก้ไข'
];

const PERSON_FIELDS = [
  'hn', 'cid13', 'prefix', 'firstName', 'lastName', 'birthDate',
  'houseNo', 'moo', 'village33', 'villageOutside',
  'tambon', 'amphoe', 'province', 'phone', 'serviceCode',
  'serviceName', 'treatmentRight',
  'ht', 'dm', 'dlp', 'status', 'deathDate',
  'note', 'updateDate', 'updaterName'
];

const LEADING_ZERO_FIELDS = ['houseNo', 'phone'];
const HN_COL_INDEX = PERSON_FIELDS.indexOf('hn');

const USER_HEADERS = ['Username', 'Password', 'ชื่อ-นามสกุล', 'Role'];
const USER_FIELDS = ['username', 'password', 'fullName', 'role'];
const USER_USERNAME_COL = 0;
const USER_PASSWORD_COL = 1;
const USER_FULLNAME_COL = 2;
const USER_ROLE_COL = 3;
const SHEET_MENU = 'c_menu';
const SHEET_USER_MENU = 'user_menu';
const DEFAULT_MENU_IDS = ['home', 'patients', 'fundus', 'lab', 'foot', 'remission', 'telemed', 'export43','download'];

function setupMenuSheets() {
  return ensureMenuSheets_();
}

function ensureMenuSheets_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const menuHeaders = ['MenuID', 'MenuName', 'View', 'Icon', 'Sort', 'Active'];
  const menuDefaults = [
    ['home', 'หน้าหลัก', 'home', 'fa-house', 1, true],
    ['patients', 'รายชื่อผู้ป่วย', 'patients', 'fa-users', 2, true],
    ['fundus', 'ตรวจตา', 'fundus', 'fa-eye', 3, true],
    ['lab', 'ตรวจเลือด', 'lab', 'fa-flask-vial', 4, true],
    ['foot', 'ตรวจเท้า', 'foot', 'fa-shoe-prints', 5, true],
    ['remission', 'Remission', 'remission', 'fa-arrow-trend-down', 6, true],
    ['telemed', 'TeleMed', 'telemed', 'fa-video', 7, true],
    ['export43', 'ส่ง 43 แฟ้ม', 'export43', 'fa-file-export', 8, true],
    ['download', 'ดาวน์โหลด', 'download', 'fa-circle-down', 9, true]
  ];
  let menu = ss.getSheetByName(SHEET_MENU);
  if (!menu) menu = ss.insertSheet(SHEET_MENU);
  if (menu.getLastRow() === 0) { menu.getRange(1, 1, 1, menuHeaders.length).setValues([menuHeaders]); menu.getRange(2, 1, menuDefaults.length, menuHeaders.length).setValues(menuDefaults); }
  let um = ss.getSheetByName(SHEET_USER_MENU);
  if (!um) um = ss.insertSheet(SHEET_USER_MENU);
  if (um.getLastRow() === 0) um.getRange(1, 1, 1, 5).setValues([['Username', 'MenuID', 'CanView', 'UpdatedAt', 'UpdatedBy']]);
  
  // Ensure TeleMed sheets exist
  let telemedDate = ss.getSheetByName(SHEET_TELEMED_DATE);
  if (!telemedDate) telemedDate = ss.insertSheet(SHEET_TELEMED_DATE);
  if (telemedDate.getLastRow() === 0) telemedDate.getRange(1, 1, 1, TELEMED_DATE_HEADERS.length).setValues([TELEMED_DATE_HEADERS]);
  
  let telemed = ss.getSheetByName(SHEET_TELEMED);
  if (!telemed) telemed = ss.insertSheet(SHEET_TELEMED);
  if (telemed.getLastRow() === 0) telemed.getRange(1, 1, 1, TELEMED_HEADERS.length).setValues([TELEMED_HEADERS]);
  
  let telemedRoom = ss.getSheetByName(SHEET_TELEMED_ROOM);
  if (!telemedRoom) telemedRoom = ss.insertSheet(SHEET_TELEMED_ROOM);
  if (telemedRoom.getLastRow() === 0) telemedRoom.getRange(1, 1, 1, 2).setValues([['No', 'ห้อง TeleMed']]);
  
  return { success: true, menuSheet: SHEET_MENU, userMenuSheet: SHEET_USER_MENU };
}


function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('NCD Center')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/16799/16799204.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheet_(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('ไม่พบชีต ' + sheetName);
  return sheet;
}

function getThaiDateString_() {
  const now = new Date();
  const year = now.getFullYear() + 543;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hh}:${mm}:${ss}`;
}

function prefixLeadingZero_(val) {
  if (val == null) return '';
  const s = String(val).trim();
  if (!s) return '';
  if (s.charAt(0) === "'") return s;
  return "'" + s;
}

function stripLeadingQuote_(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.charAt(0) === "'") return s.substring(1);
  return s;
}

function createSessionToken_() {
  return Utilities.getUuid() + '-' + Utilities.getUuid();
}

function generateSessionId_() {
  return Utilities.getUuid();
}

function createServerSession_(username, fullName, role) {
  const token = createSessionToken_();
  const cache = CacheService.getScriptCache();
  cache.put(
    SESSION_CACHE_PREFIX + token,
    JSON.stringify({
      username: username,
      fullName: fullName,
      role: role || '',
      createdAt: Date.now()
    }),
    SESSION_TTL_SECONDS
  );
  return token;
}

function destroyServerSession_(token) {
  if (!token) return;
  CacheService
    .getScriptCache()
    .remove(SESSION_CACHE_PREFIX + token);
}

function getUserFromSheet_(username) {
  if (!username) return null;
  const sheet = getSheet_(SHEET_USER);
  const data = sheet.getDataRange().getDisplayValues();
  if (data.length < 2) return null;
  const target = String(username).trim();
  for (let i = 1; i < data.length; i++) {
    const u = String(data[i][USER_USERNAME_COL] || '').trim();
    if (u === target) {
      const fullName = String(
        data[i][USER_FULLNAME_COL] || ''
      ).trim();
      if (!fullName) return null;
      const role = String(
        data[i][USER_ROLE_COL] || ''
      ).trim();
      return {
        username: u,
        fullName: fullName,
        name: fullName,
        role: role
      };
    }
  }

  return null;
}

function getVerifiedUser_(currentUser) {
  if (
    !currentUser ||
    typeof currentUser !== 'object' ||
    !currentUser.token
  ) {
    return null;
  }
  const token = String(
    currentUser.token
  ).trim();
  if (!token) return null;
  const cache = CacheService.getScriptCache();
  const cacheKey =
    SESSION_CACHE_PREFIX + token;
  const raw = cache.get(cacheKey);
  if (!raw) return null;
  let session;
  try {
    session = JSON.parse(raw);
  } catch (e) {
    return null;
  }
  if (
    !session ||
    !session.username
  ) {
    return null;
  }
  const role = session.role || '';
  if (session.fullName) {
    cache.put(
      cacheKey,
      JSON.stringify({
        username: session.username,
        fullName: session.fullName,
        role: role,
        createdAt: session.createdAt
      }),
      SESSION_TTL_SECONDS
    );
    return {
      username: session.username,
      fullName: session.fullName,
      name: session.fullName,
      role: role,
      token: token
    };
  }
  const sheetUser =
    getUserFromSheet_(session.username);
  if (!sheetUser) {
    destroyServerSession_(token);
    return null;
  }
  const finalRole = role || sheetUser.role || '';
  cache.put(
    cacheKey,
    JSON.stringify({
      username: sheetUser.username,
      fullName: sheetUser.fullName,
      role: finalRole,
      createdAt: session.createdAt
    }),
    SESSION_TTL_SECONDS
  );
  return {
    username: sheetUser.username,
    fullName: sheetUser.fullName,
    name: sheetUser.fullName,
    role: finalRole,
    token: token
  };
}

function verifyUser_(currentUser) {
  return !!getVerifiedUser_(currentUser);
}

function login(username, password) {
  try {
    if (!username || !password) {
      return {
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      };
    }
    const sheet = getSheet_(SHEET_USER);
    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) {
      return {
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้งาน'
      };
    }
    const uIn = String(username).trim();
    const pIn = String(password);
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const u = String(
        row[USER_USERNAME_COL] || ''
      ).trim();
      const p = String(
        row[USER_PASSWORD_COL] || ''
      );
      const fullName = String(
        row[USER_FULLNAME_COL] || ''
      ).trim();
      const role = String(
        row[USER_ROLE_COL] || ''
      ).trim();
      if (u === uIn && p === pIn) {
        if (!fullName) {
          return {
            success: false,
            message: 'ข้อมูลชื่อ-นามสกุลผู้ใช้ไม่ครบ'
          };
        }
        const token = createServerSession_(u, fullName, role);
        return {
          success: true,
          user: {
            username: u,
            fullName: fullName,
            name: fullName,
            role: role,
            token: token
          }
        };
      }
    }
    return {
      success: false,
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function changePassword(username, oldPassword, newPassword, currentUser) {
  try {
    if (!username || !oldPassword || !newPassword) {
      return {
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบ'
      };
    }
    
    const verifiedUser = getVerifiedUser_(currentUser);
    if (!verifiedUser) {
      return {
        success: false,
        message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
        needLogin: true
      };
    }
    
    if (String(verifiedUser.username) !== String(username).trim()) {
      return {
        success: false,
        message: 'ไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้อื่น'
      };
    }
    
    const sheet = getSheet_(SHEET_USER);
    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) {
      return {
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้งาน'
      };
    }
    
    const uIn = String(username).trim();
    const pIn = String(oldPassword);
    let foundRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const u = String(row[USER_USERNAME_COL] || '').trim();
      const p = String(row[USER_PASSWORD_COL] || '');
      
      if (u === uIn) {
        foundRow = i + 1; // +1 because data array is 0-indexed but sheet rows are 1-indexed
        if (p !== pIn) {
          return {
            success: false,
            message: 'รหัสผ่านเดิมไม่ถูกต้อง'
          };
        }
        break;
      }
    }
    
    if (foundRow === -1) {
      return {
        success: false,
        message: 'ไม่พบผู้ใช้ในระบบ'
      };
    }
    
    // Update password
    sheet.getRange(foundRow, USER_PASSWORD_COL + 1).setValue(newPassword);
    
    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function isTruthyMenuValue_(v) {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'อนุญาต', 'เปิด', 'ใช่'].indexOf(s) >= 0;
}

function getMenuAccess_(verifiedUser) {
  const all = {};
  DEFAULT_MENU_IDS.forEach(function (id) { all[id] = false; });
  const username = String((verifiedUser && verifiedUser.username) || '').trim();
  const role = String((verifiedUser && verifiedUser.role) || '').trim().toLowerCase();
  if (role === 'admin') {
    DEFAULT_MENU_IDS.forEach(function (id) { all[id] = true; });
    return all;
  }
  try {
    const menuSheet = getSheet_(SHEET_MENU);
    const menuRows = menuSheet.getDataRange().getDisplayValues();
    const activeIds = {};
    for (let i = 1; i < menuRows.length; i++) {
      const id = String(menuRows[i][0] || '').trim();
      const active = menuRows[i].length < 6 ? true : isTruthyMenuValue_(menuRows[i][5]);
      if (id && active) activeIds[id] = true;
    }
    const userSheet = getSheet_(SHEET_USER_MENU);
    const userRows = userSheet.getDataRange().getDisplayValues();
    for (let i = 1; i < userRows.length; i++) {
      const u = String(userRows[i][0] || '').trim();
      const menuId = String(userRows[i][1] || '').trim();
      const canView = isTruthyMenuValue_(userRows[i][2]);
      if (u === username && activeIds[menuId]) all[menuId] = canView;
    }
  } catch (e) {
    // DEFAULT_MENU_IDS.forEach(function (id) { all[id] = true; });
  }
  return all;
}

function requireMenuAccess_(currentUser, menuId) {
  const verified = getVerifiedUser_(currentUser);
  if (!verified) return { ok: false, verified: null, response: { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true } };
  const access = getMenuAccess_(verified);
  if (!access[String(menuId || '')]) return { ok: false, verified: verified, response: { success: false, message: 'คุณไม่มีสิทธิ์เข้าถึงเมนูนี้', forbidden: true } };
  return { ok: true, verified: verified, response: null };
}

function getLookupsDataCached_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(LOOKUP_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ถ้า cache เสีย ให้สร้างใหม่
    }
  }
  const hospitals = [];
  const treatmentRights = [];
  const villages33 = [];

  // ---------------- HOSPITAL ----------------
  try {
    const s1 = getSheet_(SHEET_HOSPITAL);
    const d1 = s1.getDataRange().getDisplayValues();
    for (let i = 1; i < d1.length; i++) {
      const code = String(d1[i][0] || '').trim();
      const name = String(d1[i][1] || '').trim();
      if (code || name) {
        hospitals.push({
          code: code,
          name: name
        });
      }
    }
  } catch (e) { }

  // ---------------- RIGHT ----------------
  try {
    const s2 = getSheet_(SHEET_RIGHT);
    const d2 = s2.getDataRange().getDisplayValues();
    for (let i = 1; i < d2.length; i++) {
      const v = String(d2[i][1] || '').trim();
      if (v) {
        treatmentRights.push(v);
      }
    }
  } catch (e) { }

  // ---------------- VILLAGE ----------------
  try {
    const s3 = getSheet_(SHEET_VILLAGE);
    const d3 = s3.getDataRange().getDisplayValues();
    for (let i = 1; i < d3.length; i++) {
      const v = String(d3[i][2] || '').trim();
      if (v) {
        villages33.push(v);
      }
    }
  } catch (e) { }
  const result = {
    hospitals: hospitals,
    treatmentRights: treatmentRights,
    villages33: villages33
  };
  cache.put(
    LOOKUP_CACHE_KEY,
    JSON.stringify(result),
    LOOKUP_CACHE_SECONDS
  );
  return result;
}

function getLookups(currentUser) {
  const verifiedUser = getVerifiedUser_(currentUser);
  if (!verifiedUser) {
    return {
      success: false,
      message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      needLogin: true
    };
  }
  try {
    const lookupData = getLookupsDataCached_();
    const thaiMonths = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม'
    ];
    const statuses = [
      'รักษาอยู่',
      'รักษา รพ.สต.',
      'ติดตามไม่ได้',
      'เสียชีวิต'
    ];
    const prefixes = [
      'นาย',
      'นาง',
      'นางสาว',
      'เด็กชาย',
      'เด็กหญิง',
      'สามเณร',
      'พระ',
      'แม่ชี'
    ];

    return {
      success: true,
      hospitals: lookupData.hospitals,
      treatmentRights: lookupData.treatmentRights,
      villages33: lookupData.villages33,
      thaiMonths: thaiMonths,
      statuses: statuses,
      prefixes: prefixes,
      menuAccess: getMenuAccess_(verifiedUser),
      currentUser: {
        username: verifiedUser.username,
        fullName: verifiedUser.fullName,
        name: verifiedUser.fullName,
        role: verifiedUser.role || '',
        token: verifiedUser.token
      }
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function clearLookupCache() {
  CacheService
    .getScriptCache()
    .remove(LOOKUP_CACHE_KEY);
  return 'Lookup cache cleared';
}

function recordFromRow_(row) {
  const record = {};
  PERSON_FIELDS.forEach((field, idx) => {
    let v = row[idx] != null ? String(row[idx]).trim() : '';
    record[field] = v;
  });
  return record;
}

function getHNCacheKey_(hn) {
  return HN_CACHE_PREFIX + String(hn).trim();
}

function getCachedHNRows_(hn) {
  const key = getHNCacheKey_(hn);
  const raw = CacheService
    .getScriptCache()
    .get(key);
  if (!raw) return null;
  try {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) {
      return null;
    }
    return rows
      .map(Number)
      .filter(function (row) {
        return Number.isInteger(row) && row >= 2;
      });
  } catch (e) {
    return null;
  }
}

function setCachedHNRows_(hn, rows) {
  const cleanRows = (rows || [])
    .map(Number)
    .filter(function (row) {
      return Number.isInteger(row) && row >= 2;
    });
  CacheService
    .getScriptCache()
    .put(
      getHNCacheKey_(hn),
      JSON.stringify(cleanRows),
      HN_CACHE_SECONDS
    );
}

function clearHNCache_(hn) {
  if (!hn) return;
  CacheService
    .getScriptCache()
    .remove(
      getHNCacheKey_(hn)
    );
}

function searchByHN(hn, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return {
      success: false,
      message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      needLogin: true
    };
  }
  try {
    const targetHN = String(hn || '').trim();
    if (!targetHN) {
      return {
        success: true,
        found: false,
        data: []
      };
    }
    const sheet = getSheet_(SHEET_PERSON);
    let cachedRows = getCachedHNRows_(targetHN);
    if (cachedRows && cachedRows.length > 0) {
      const results = [];
      cachedRows.forEach(function (rowIndex) {
        const currentHN = String(
          sheet
            .getRange(rowIndex, HN_COL_INDEX + 1)
            .getDisplayValue()
          || ''
        ).trim();
        if (currentHN !== targetHN) {
          return;
        }
        const row = sheet
          .getRange(
            rowIndex,
            1,
            1,
            PERSON_FIELDS.length
          )
          .getDisplayValues()[0];
        const record = recordFromRow_(row);
        record._rowIndex = rowIndex;
        results.push(record);
      });
      if (results.length > 0) {
        return {
          success: true,
          found: true,
          data: results
        };

      }
      clearHNCache_(targetHN);
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return {
        success: true,
        found: false,
        data: []
      };
    }
    const hnColumn = sheet.getRange(
      2,
      HN_COL_INDEX + 1,
      lastRow - 1,
      1
    );
    const matches = hnColumn
      .createTextFinder(targetHN)
      .matchEntireCell(true)
      .matchCase(true)
      .useRegularExpression(false)
      .findAll();
    if (!matches || matches.length === 0) {
      return {
        success: true,
        found: false,
        data: []
      };
    }
    const rowIndexes = matches.map(function (cell) {
      return cell.getRow();
    });
    setCachedHNRows_(targetHN, rowIndexes);
    const results = [];
    rowIndexes.forEach(function (rowIndex) {
      const row = sheet
        .getRange(
          rowIndex,
          1,
          1,
          PERSON_FIELDS.length
        )
        .getDisplayValues()[0];
      const record = recordFromRow_(row);
      record._rowIndex = rowIndex;
      results.push(record);
    });
    return {
      success: true,
      found: true,
      data: results
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function getPersonByHN(hn, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  try {
    const targetHN = String(hn || '').trim();
    if (!targetHN) return { success: false, message: 'กรุณาระบุ HN' };

    const sheet = getSheet_(SHEET_PERSON);
    const rowIdx = findRowIndexByHN_(sheet, targetHN);

    if (rowIdx === -1) {
      return { success: false, message: 'ไม่พบข้อมูล HN ในฐานข้อมูล person' };
    }

    const row = sheet.getRange(rowIdx, 1, 1, PERSON_FIELDS.length).getDisplayValues()[0];
    const record = recordFromRow_(row);

    return {
      success: true,
      data: record
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function prepareRowForWrite_(data, extra) {
  const row = [];
  PERSON_FIELDS.forEach((field) => {
    if (field === 'updateDate') row.push(extra.updateDate);
    else if (field === 'updaterName') row.push(extra.updaterName);
    else {
      let v = data[field] != null ? String(data[field]).trim() : '';
      if (LEADING_ZERO_FIELDS.indexOf(field) !== -1) {
        v = prefixLeadingZero_(v);
      }
      row.push(v);
    }
  });
  return row;
}

function checkHNExists(hn, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return {
      success: false,
      message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      needLogin: true,
      exists: false
    };
  }
  try {
    const targetHN = String(hn || '').trim();
    if (!targetHN) {
      return { success: true, exists: false };
    }
    const sheet = getSheet_(SHEET_PERSON);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, exists: false };
    }
    const hnColumn = sheet.getRange(
      2,
      HN_COL_INDEX + 1,
      lastRow - 1,
      1
    );
    const cell = hnColumn
      .createTextFinder(targetHN)
      .matchEntireCell(true)
      .matchCase(true)
      .useRegularExpression(false)
      .findNext();
    return {
      success: true,
      exists: !!cell
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      exists: false
    };
  }
}

function createPerson(data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return {
      success: false,
      message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      needLogin: true
    };
  }
  try {
    const targetHN = String((data && data.hn) || '').trim();
    if (targetHN) {
      const sheet = getSheet_(SHEET_PERSON);
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const hnColumn = sheet.getRange(
          2,
          HN_COL_INDEX + 1,
          lastRow - 1,
          1
        );
        const cell = hnColumn
          .createTextFinder(targetHN)
          .matchEntireCell(true)
          .matchCase(true)
          .useRegularExpression(false)
          .findNext();
        if (cell) {
          return {
            success: false,
            message: 'HN นี้มีอยู่แล้วในระบบ (' + targetHN + ') กรุณาตรวจสอบ'
          };
        }
      }
    }
    const sheet = getSheet_(SHEET_PERSON);
    const now = getThaiDateString_();
    const row = prepareRowForWrite_(data, {
      updateDate: now,
      updaterName: verifiedUser.fullName
    });
    sheet.appendRow(row);
    const newRow = sheet.getLastRow();
    setCachedHNRows_(data.hn, [newRow]);
    const savedRow = sheet.getRange(newRow, 1, 1, PERSON_FIELDS.length).getDisplayValues()[0];
    const record = recordFromRow_(savedRow);
    return {
      success: true,
      hn: data.hn,
      message: 'เพิ่มข้อมูลสำเร็จ',
      data: [record]
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function findRowIndexByHN_(sheet, hn) {
  const targetHN = String(hn || '').trim();
  if (!targetHN) return -1;
  const cachedRows = getCachedHNRows_(targetHN);
  if (cachedRows && cachedRows.length > 0) {
    for (let i = 0; i < cachedRows.length; i++) {
      const rowIndex = cachedRows[i];
      const currentHN = String(
        sheet
          .getRange(
            rowIndex,
            HN_COL_INDEX + 1
          )
          .getDisplayValue()
        || ''
      ).trim();
      if (currentHN === targetHN) {
        return rowIndex;
      }
    }
    clearHNCache_(targetHN);
  }
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const hnColumn = sheet.getRange(
    2,
    HN_COL_INDEX + 1,
    lastRow - 1,
    1
  );
  const cell = hnColumn
    .createTextFinder(targetHN)
    .matchEntireCell(true)
    .matchCase(true)
    .useRegularExpression(false)
    .findNext();
  if (!cell) {
    return -1;
  }
  const rowIndex = cell.getRow();
  setCachedHNRows_(targetHN, [rowIndex]);
  return rowIndex;
}

function updatePerson(hn, data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return {
      success: false,
      message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      needLogin: true
    };
  }
  try {
    const sheet = getSheet_(SHEET_PERSON);
    const rowIdx = findRowIndexByHN_(sheet, hn);
    if (rowIdx === -1) {
      return {
        success: false,
        message: 'ไม่พบ HN ที่ต้องการแก้ไข'
      };
    }
    const oldHN = String(hn || '').trim();
    const newHN = String(data.hn || '').trim();
    const now = getThaiDateString_();
    const row = prepareRowForWrite_(data, {
      updateDate: now,
      updaterName: verifiedUser.fullName
    });
    sheet
      .getRange(
        rowIdx,
        1,
        1,
        PERSON_FIELDS.length
      )
      .setValues([row]);
    clearHNCache_(oldHN);
    setCachedHNRows_(newHN, [rowIdx]);
    const savedRow = sheet.getRange(rowIdx, 1, 1, PERSON_FIELDS.length).getDisplayValues()[0];
    const record = recordFromRow_(savedRow);
    return {
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      data: [record]
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}


function getPatientListPage(currentUser, page, pageSize, searchText) {
  const accessCheck = requireMenuAccess_(currentUser, 'patients');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  try {
    const sheet = getSheet_(SHEET_PERSON);
    const lastRow = sheet.getLastRow();
    const userRole = String(verifiedUser.role || '').trim();
    const isAdmin = userRole.toLowerCase() === 'admin';
    const p = Math.max(1, Number(page) || 1);
    const requestedSize = Number(pageSize);
    // pageSize = 0 หมายถึงส่งข้อมูลที่ผ่านสิทธิ์ทั้งหมดกลับมาครั้งเดียว
    const size = requestedSize === 0 ? 0 : Math.min(50, Math.max(1, requestedSize || 10));
    const q = String(searchText || '').trim().toLowerCase();
    const total = Math.max(0, lastRow - 1);
    if (lastRow < 2) {
      return { success: true, role: userRole, isAdmin: isAdmin, total: 0, filteredTotal: 0, page: p, pageSize: size, data: [] };
    }

    // อ่านเฉพาะ A:U ซึ่งเพียงพอสำหรับตารางรายชื่อและ Role filter
    const rows = sheet.getRange(2, 1, lastRow - 1, 21).getDisplayValues();
    const filtered = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const serviceName = String(r[15] || '').trim();
      if (isAdmin) {
        if (!serviceName) continue;
      } else if (userRole) {
        if (serviceName !== userRole) continue;
      }
      if (q) {
        const hay = [r[0], r[1], r[2], r[3], r[4], r[15]].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      filtered.push({
        hn: String(r[0] || '').trim(), cid13: String(r[1] || '').trim(), prefix: String(r[2] || '').trim(),
        firstName: String(r[3] || '').trim(), lastName: String(r[4] || '').trim(), houseNo: stripLeadingQuote_(r[6]),
        moo: String(r[7] || '').trim(), village33: String(r[8] || '').trim(), villageOutside: String(r[9] || '').trim(),
        tambon: String(r[10] || '').trim(), serviceCode: String(r[14] || '').trim(), serviceName: serviceName,
        ht: String(r[17] || '').trim(), dm: String(r[18] || '').trim(), dlp: String(r[19] || '').trim(),
        status: String(r[20] || '').trim(), _rowIndex: i + 2
      });
    }
    const filteredTotal = filtered.length;
    const startIndex = size > 0 ? (p - 1) * size : 0;
    const data = size > 0 ? filtered.slice(startIndex, startIndex + size) : filtered;
    return { success: true, role: userRole, isAdmin: isAdmin, total: total, filteredTotal: filteredTotal, page: p, pageSize: size, data: data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}


function logout(currentUser) {
  try {
    if (currentUser && currentUser.token) {
      destroyServerSession_(currentUser.token);
    }
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

function normalizeThaiDateStr_(d) {
  if (!d) return '';
  const s = String(d).trim();
  if (!s) return '';
  // ถ้าเป็น YYYY-MM-DD อยู่แล้ว ไม่ต้องทำอะไร
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) return s;

  const parts = s.split(/[\/\-]/);
  if (parts.length !== 3) return s;

  // ตรวจสอบว่าส่วนแรกเป็นปีหรือไม่ (ถ้า > 31 แสดงว่าเป็นปี)
  const first = parseInt(parts[0], 10);
  if (first > 31) return s; // น่าจะเป็น YYYY-MM-DD หรือรูปแบบอื่นที่ไม่ใช่ DD/MM/YYYY

  const day = String(parseInt(parts[0], 10) || 0).padStart(2, '0');
  const month = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
  const year = String(parseInt(parts[2], 10) || 0).padStart(4, '0');
  if (!day || !month || !year) return s;
  return day + '/' + month + '/' + year;
}

function parseThaiDateToCE_(d) {
  if (!d) return null;
  const s = normalizeThaiDateStr_(d);
  const parts = s.split('/');
  if (parts.length !== 3) {
    const mDash = String(d || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (mDash) {
      let y2 = parseInt(mDash[1], 10);
      const m2 = parseInt(mDash[2], 10);
      const d2 = parseInt(mDash[3], 10);
      if (!isNaN(y2) && !isNaN(m2) && !isNaN(d2) && m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31) {
        // ถ้าเป็น พ.ศ. (> 2400) ให้แปลงเป็น CE
        if (y2 > 2400) y2 -= 543;
        return new Date(y2, m2 - 1, d2, 0, 0, 0, 0);
      }
    }
    return null;
  }
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (!day || !month || !year) return null;
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  // ถ้าเป็น พ.ศ. (> 2400) ให้แปลงเป็น CE
  if (year > 2400) year = year - 543;
  const dt = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return dt;
}

function formatCE_toSheetDate_(dt) {
  if (!dt || !(dt instanceof Date) || isNaN(dt.getTime())) return '';
  const y = String(dt.getFullYear()).padStart(4, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function sheetDateToDisplayBE_(s) {
  if (!s) return '';
  const str = String(s).trim();
  if (!str) return '';
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) {
    const m2 = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m2) {
      const y = parseInt(m2[3], 10);
      const displayY = (y > 2400) ? y : (y + 543);
      return String(parseInt(m2[1], 10)) + '/' + String(parseInt(m2[2], 10)) + '/' + String(displayY);
    }
    return str;
  }
  let y = parseInt(m[1], 10);
  // ถ้าเป็น พ.ศ. อยู่แล้ว (> 2400) ให้ใช้เลย ถ้าเป็น CE ให้แปลงเป็น BE
  const displayY = (y > 2400) ? y : (y + 543);
  return String(parseInt(m[3], 10)) + '/' + String(parseInt(m[2], 10)) + '/' + String(displayY);
}

function parseAnyDateToSheetCE_(d) {
  const dt = parseThaiDateToCE_(d);
  if (!dt) return '';
  return formatCE_toSheetDate_(dt);
}

function parseAnyDateToSheetBE_(d) {
  // บันทึกวันที่เป็น พ.ศ. โดยตรง (ไม่แปลงเป็น CE)
  if (!d) return '';
  const s = normalizeThaiDateStr_(d);
  const parts = s.split('/');
  if (parts.length !== 3) {
    const mDash = String(d || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (mDash) {
      let y2 = parseInt(mDash[1], 10);
      const m2 = parseInt(mDash[2], 10);
      const d2 = parseInt(mDash[3], 10);
      if (!isNaN(y2) && !isNaN(m2) && !isNaN(d2) && m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31) {
        // ถ้าเป็น CE ให้แปลงเป็น BE
        if (y2 < 2400) y2 += 543;
        return String(y2) + '-' + String(m2).padStart(2, '0') + '-' + String(d2).padStart(2, '0');
      }
    }
    return d;
  }
  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (!day || !month || !year) return d;
  if (isNaN(day) || isNaN(month) || isNaN(year)) return d;
  if (month < 1 || month > 12) return d;
  if (day < 1 || day > 31) return d;
  // ถ้าเป็น CE ให้แปลงเป็น BE
  if (year < 2400) year = year + 543;
  return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function ensureFundusDateSheet_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow >= 1) return;
  sheet.appendRow(FUNDUS_DATE_HEADERS);
  const rng = sheet.getRange(1, 1, 1, FUNDUS_DATE_HEADERS.length);
  rng.setFontWeight('bold');
  rng.setBackground('#f8fafc');
  sheet.setFrozenRows(1);
}

function ensureFundusSheet_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) {
    sheet.appendRow(FUNDUS_HEADERS);
  } else {
    // อัปเดตหัวตารางเพื่อให้แน่ใจว่ามีฟิลด์ใหม่ (เช่น SessionID)
    sheet.getRange(1, 1, 1, FUNDUS_HEADERS.length).setValues([FUNDUS_HEADERS]);
  }
  const rng = sheet.getRange(1, 1, 1, FUNDUS_HEADERS.length);
  rng.setFontWeight('bold');
  rng.setBackground('#f8fafc');
  sheet.setFrozenRows(1);
}

function fundusDateRecordFromRow_(row) {
  if (!row) return null;
  const obj = {};
  for (let i = 0; i < FUNDUS_DATE_FIELDS.length; i++) {
    const key = FUNDUS_DATE_FIELDS[i];
    let v = row[i];
    if (key === 'date') {
      v = sheetDateToDisplayBE_(v);
    }
    obj[key] = (v == null) ? '' : String(v).trim();
  }
  return obj;
}

function fundusDateRowFromRecord_(rec) {
  const row = [];
  for (let i = 0; i < FUNDUS_DATE_FIELDS.length; i++) {
    const key = FUNDUS_DATE_FIELDS[i];
    let v = (rec && rec[key] != null) ? String(rec[key]).trim() : '';
    if (key === 'date') {
      v = parseAnyDateToSheetBE_(v);
    }
    if (key === 'serviceCode') {
      v = prefixLeadingZero_(v);
    }
    row.push(v);
  }
  return row;
}

function fundusRecordFromRow_(row) {
  if (!row) return null;
  const obj = {};
  for (let i = 0; i < FUNDUS_FIELDS.length; i++) {
    const key = FUNDUS_FIELDS[i];
    // Handle missing columns in existing data
    let v = (i < row.length && row[i] != null) ? row[i] : '';
    // Convert date to display format for frontend
    if (key === 'date') {
      v = sheetDateToDisplayBE_(v);
    }
    obj[key] = (v == null) ? '' : String(v).trim();
  }
  return obj;
}

function fundusRowFromRecord_(rec) {
  const row = [];
  for (let i = 0; i < FUNDUS_FIELDS.length; i++) {
    const key = FUNDUS_FIELDS[i];
    let v = (rec && rec[key] != null) ? String(rec[key]).trim() : '';
    if (key === 'date') {
      v = parseAnyDateToSheetBE_(v);
    }
    if (key === 'hn' || key === 'weight' || key === 'height' || key === 'waist' ||
      key === 'sbp' || key === 'dbp' || key === 'pr' || key === 'serviceCode') {
      if (v) {
        v = prefixLeadingZero_(v);
      }
    }
    row.push(v);
  }
  return row;
}

function getFundusDates(currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง รายการวันที่ตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_FUNDUS_DATE);
    ensureFundusDateSheet_(sheet);
    const data = sheet.getDataRange().getDisplayValues();
    const dates = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length === 0) continue;
      const firstCol = (data[i][FUNDUS_DATE_ID_COL] == null) ? '' : String(data[i][FUNDUS_DATE_ID_COL]).trim();
      if (!firstCol) continue;
      const rawDateCell = String(data[i][FUNDUS_DATE_DATE_COL] || '').trim();
      const sortKey = parseThaiDateToCE_(rawDateCell);
      const rec = fundusDateRecordFromRow_(data[i]);
      if (rec) {
        rec._sortMillis = sortKey ? sortKey.getTime() : 0;
        dates.push(rec);
      }
    }
    dates.sort(function (a, b) {
      const ak = Number(a._sortMillis || 0);
      const bk = Number(b._sortMillis || 0);
      if (ak === 0 && bk === 0) return 0;
      if (ak === 0) return 1;
      if (bk === 0) return -1;
      return bk - ak;
    });
    dates.forEach(function (d) { delete d._sortMillis; });
    return { success: true, dates: dates };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function createFundusDate(data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์สร้างวันที่ตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    if (!data) throw new Error('ไม่มีข้อมูลวันที่ตรวจตา');
    const dateStr = String(data.date || '').trim();
    if (!dateStr) throw new Error('จำเป็นต้องระบุ วันที่ตรวจ');
    const parsed = parseThaiDateToCE_(dateStr);
    if (!parsed) throw new Error('รูปแบบวันที่ไม่ถูกต้อง (ตัวอย่าง 25/09/2569)');
    const serviceCode = String(data.serviceCode || '').trim();
    const serviceName = String(data.serviceName || '').trim();
    const dateSheet = getSheet_(SHEET_FUNDUS_DATE);
    ensureFundusDateSheet_(dateSheet);
    const lastRow = dateSheet.getLastRow();
    const sheetCE = formatCE_toSheetDate_(parsed);
    if (lastRow >= 2) {
      const dateColRange = dateSheet.getRange(2, FUNDUS_DATE_DATE_COL + 1, lastRow - 1, 1);
      let dupeCell = null;
      if (serviceCode) {
        const rows = dateColRange.getDisplayValues();
        const svcRows = dateSheet.getRange(2, 3, lastRow - 1, 1).getDisplayValues();
        for (let i = 0; i < rows.length; i++) {
          const d1 = String(rows[i][0] || '').trim();
          const sc = String(svcRows[i][0] || '').trim();
          if (d1 === sheetCE && sc === serviceCode) {
            dupeCell = dateSheet.getRange(i + 2, FUNDUS_DATE_DATE_COL + 1);
            break;
          }
        }
      } else {
        dupeCell = dateColRange
          .createTextFinder(sheetCE)
          .matchEntireCell(true)
          .matchCase(false)
          .useRegularExpression(false)
          .findNext();
      }
      if (dupeCell) throw new Error('วันที่ตรวจ "' + sheetDateToDisplayBE_(sheetCE) + '" + หน่วยบริการนี้ มีอยู่แล้วในระบบ');
    }
    const id = (Utilities.getUuid() || '') + '-' + Date.now();

    // const newRec = {
    //   id: id,
    //   date: sheetCE,
    //   serviceCode: serviceCode,
    //   serviceName: serviceName
    // };
    const now = getThaiDateString_();
    const newRec = {
      id: id,
      date: sheetCE,
      serviceCode: serviceCode,
      serviceName: serviceName,
      recorderName: verifiedUser.fullName,
      recordDate: now
    };

    const row = fundusDateRowFromRecord_(newRec);
    dateSheet.appendRow(row);
    const newRowIdx = dateSheet.getLastRow();
    const savedRow = dateSheet.getRange(newRowIdx, 1, 1, FUNDUS_DATE_FIELDS.length).getDisplayValues()[0];
    const savedRecord = fundusDateRecordFromRow_(savedRow);
    return { success: true, message: 'เพิ่มวันที่ตรวจตาสำเร็จ', record: savedRecord };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function getFundusByDate(dateId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์ดูรายการตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const id = String(dateId || '').trim();
    if (!id) throw new Error('จำเป็นต้องระบุ id วันที่ตรวจ');
    const dateSheet = getSheet_(SHEET_FUNDUS_DATE);
    ensureFundusDateSheet_(dateSheet);
    const dateSheetLastRow = dateSheet.getLastRow();
    let dateRec = null;
    if (dateSheetLastRow >= 2) {
      const idColRange = dateSheet.getRange(2, FUNDUS_DATE_ID_COL + 1, dateSheetLastRow - 1, 1);
      const cell = idColRange
        .createTextFinder(id)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) {
        const rowIdx = cell.getRow();
        const rowVals = dateSheet.getRange(rowIdx, 1, 1, FUNDUS_DATE_FIELDS.length).getDisplayValues()[0];
        dateRec = fundusDateRecordFromRow_(rowVals);
      }
    }
    if (!dateRec) throw new Error('ไม่พบวันที่ตรวจตาที่ระบุ');
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const records = [];
    const lastRow = fundusSheet.getLastRow();
    if (lastRow >= 2) {
      const data = fundusSheet.getDataRange().getDisplayValues();
      for (let i = 1; i < data.length; i++) {
        if (!data[i] || data[i].length === 0) continue;
        const firstCol = (data[i][FUNDUS_ID_COL] == null) ? '' : String(data[i][FUNDUS_ID_COL]).trim();
        if (!firstCol) continue;
        const rowDateValue = (data[i][FUNDUS_DATE_COL] == null) ? '' : String(data[i][FUNDUS_DATE_COL]).trim();
        const rowSessionId = (data[i][FUNDUS_SESSION_ID_COL] == null) ? '' : String(data[i][FUNDUS_SESSION_ID_COL]).trim();
        // Convert rowDateValue to display format for comparison
        const rowDateDisplay = sheetDateToDisplayBE_(rowDateValue);
        // Match by sessionID OR by date (for backward compatibility with existing data)
        if (rowSessionId !== id && rowDateDisplay !== dateRec.date) continue;
        const rec = fundusRecordFromRow_(data[i]);
        if (rec) {
          rec.prefix = stripLeadingQuote_(rec.prefix);
          rec.firstName = stripLeadingQuote_(rec.firstName);
          rec.lastName = stripLeadingQuote_(rec.lastName);
          rec.hn = stripLeadingQuote_(rec.hn);
          rec.weight = stripLeadingQuote_(rec.weight);
          rec.height = stripLeadingQuote_(rec.height);
          rec.waist = stripLeadingQuote_(rec.waist);
          rec.sbp = stripLeadingQuote_(rec.sbp);
          rec.dbp = stripLeadingQuote_(rec.dbp);
          rec.pr = stripLeadingQuote_(rec.pr);
          records.push(rec);
        }
      }
    }
    return { success: true, dateRecord: dateRec, records: records };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function addFundusRecord(dateId, data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์บันทึกผลตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const id = String(dateId || '').trim();
    if (!id) throw new Error('จำเป็นต้องระบุ id วันที่ตรวจ');
    if (!data) throw new Error('ไม่มีข้อมูลผู้ตรวจตา');
    const hn = String(data.hn || '').trim();
    if (!hn) throw new Error('จำเป็นต้องระบุ HN');
    const prefix = String(data.prefix || '').trim();
    const firstName = String(data.firstName || '').trim();
    const lastName = String(data.lastName || '').trim();
    if (!firstName && !lastName && !prefix) {
      throw new Error('จำเป็นต้องระบุ คำนำหน้า หรือ ชื่อ หรือ นามสกุล');
    }
    const dateSheet = getSheet_(SHEET_FUNDUS_DATE);
    ensureFundusDateSheet_(dateSheet);
    const lastRowDate = dateSheet.getLastRow();
    let found = false;
    let actualDateString = id;
    if (lastRowDate >= 2) {
      const idColRange = dateSheet.getRange(2, FUNDUS_DATE_ID_COL + 1, lastRowDate - 1, 1);
      const cell = idColRange
        .createTextFinder(id)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) {
        found = true;
        const dateValue = dateSheet.getRange(cell.getRow(), FUNDUS_DATE_DATE_COL + 1).getDisplayValue();
        // Convert to BE format for storage in fundus sheet
        actualDateString = parseAnyDateToSheetBE_(dateValue);
      }
    }
    if (!found) throw new Error('ไม่พบวันที่ตรวจตาที่ระบุ');
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const recordId = (Utilities.getUuid() || '') + '-' + Date.now();
    const now = getThaiDateString_();
    // actualDateString is already in BE format (YYYY-MM-DD with BE year)
    const newRec = {
      id: recordId,
      date: actualDateString, // Already in BE format from fundus_date sheet
      hn: hn,
      prefix: prefix,
      firstName: firstName,
      lastName: lastName,
      weight: String(data.weight || '').trim(),
      height: String(data.height || '').trim(),
      waist: String(data.waist || '').trim(),
      sbp: String(data.sbp || '').trim(),
      dbp: String(data.dbp || '').trim(),
      pr: String(data.pr || '').trim(),
      resultLeft: String(data.resultLeft || '').trim(),
      resultRight: String(data.resultRight || '').trim(),
      nextAppointment: String(data.nextAppointment || '').trim(),
      appointmentStatus: '',
      appointmentNote: '',
      sessionID: id,
      recorderName: verifiedUser.fullName,
      recordDate: now,
      updaterName: '',
      updateDate: ''
    };
    const row = fundusRowFromRecord_(newRec);
    fundusSheet.appendRow(row);
    const newRowIdx = fundusSheet.getLastRow();
    const savedRow = fundusSheet.getRange(newRowIdx, 1, 1, FUNDUS_FIELDS.length).getDisplayValues()[0];
    const savedRecord = fundusRecordFromRow_(savedRow);
    if (savedRecord) {
      savedRecord.hn = stripLeadingQuote_(savedRecord.hn);
      savedRecord.prefix = stripLeadingQuote_(savedRecord.prefix);
      savedRecord.firstName = stripLeadingQuote_(savedRecord.firstName);
      savedRecord.lastName = stripLeadingQuote_(savedRecord.lastName);
      savedRecord.weight = stripLeadingQuote_(savedRecord.weight);
      savedRecord.height = stripLeadingQuote_(savedRecord.height);
      savedRecord.waist = stripLeadingQuote_(savedRecord.waist);
      savedRecord.sbp = stripLeadingQuote_(savedRecord.sbp);
      savedRecord.dbp = stripLeadingQuote_(savedRecord.dbp);
      savedRecord.pr = stripLeadingQuote_(savedRecord.pr);
    }
    return { success: true, message: 'บันทึกคนตรวจตาสำเร็จ', record: savedRecord };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function updateFundusRecord(recordId, patch, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์อัปเดตผลตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const rid = String(recordId || '').trim();
    if (!rid) throw new Error('จำเป็นต้องระบุ ID ของรายการตรวจตา');
    if (!patch || typeof patch !== 'object') throw new Error('ไม่มีข้อมูลที่จะอัปเดต');
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const lastRow = fundusSheet.getLastRow();
    let foundRowIdx = -1;
    let existingRow = null;
    if (lastRow >= 2) {
      const idColRange = fundusSheet.getRange(2, FUNDUS_ID_COL + 1, lastRow - 1, 1);
      const cell = idColRange
        .createTextFinder(rid)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) {
        foundRowIdx = cell.getRow();
        existingRow = fundusSheet.getRange(foundRowIdx, 1, 1, FUNDUS_FIELDS.length).getDisplayValues()[0];
      }
    }
    if (!existingRow) throw new Error('ไม่พบรายการตรวจตาที่ระบุ');
    const existing = fundusRecordFromRow_(existingRow) || {};
    // const ALLOWED_PATCH_KEYS = ['resultLeft', 'resultRight'];
    const ALLOWED_PATCH_KEYS = [
      'resultLeft',
      'resultRight',
      'weight',
      'height',
      'waist',
      'sbp',
      'dbp',
      'pr',
      'nextAppointment',
      'appointmentStatus',
      'appointmentNote'
    ];
    const merged = {};
    for (let i = 0; i < FUNDUS_FIELDS.length; i++) {
      const k = FUNDUS_FIELDS[i];
      merged[k] = (existing[k] != null) ? String(existing[k]) : '';
    }
    for (let k in patch) {
      if (ALLOWED_PATCH_KEYS.indexOf(k) === -1) continue;
      const v = (patch[k] == null) ? '' : String(patch[k]).trim();
      merged[k] = v;
    }
    merged.updaterName = verifiedUser.fullName;
    merged.updateDate = getThaiDateString_();
    const writeRow = fundusRowFromRecord_(merged);
    fundusSheet.getRange(foundRowIdx, 1, 1, writeRow.length).setValues([writeRow]);
    const savedRow = fundusSheet.getRange(foundRowIdx, 1, 1, FUNDUS_FIELDS.length).getDisplayValues()[0];
    const savedRecord = fundusRecordFromRow_(savedRow);
    if (savedRecord) {
      savedRecord.hn = stripLeadingQuote_(savedRecord.hn);
      savedRecord.prefix = stripLeadingQuote_(savedRecord.prefix);
      savedRecord.firstName = stripLeadingQuote_(savedRecord.firstName);
      savedRecord.lastName = stripLeadingQuote_(savedRecord.lastName);
      savedRecord.weight = stripLeadingQuote_(savedRecord.weight);
      savedRecord.height = stripLeadingQuote_(savedRecord.height);
      savedRecord.waist = stripLeadingQuote_(savedRecord.waist);
      savedRecord.sbp = stripLeadingQuote_(savedRecord.sbp);
      savedRecord.dbp = stripLeadingQuote_(savedRecord.dbp);
      savedRecord.pr = stripLeadingQuote_(savedRecord.pr);
    }
    return { success: true, message: 'อัปเดตผลตรวจตาสำเร็จ', record: savedRecord };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function updateFundusAppointment(recordId, patch, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์อัปเดตการมาตามนัด (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const rid = String(recordId || '').trim();
    if (!rid) throw new Error('จำเป็นต้องระบุ ID ของรายการตรวจตา');
    if (!patch || typeof patch !== 'object') throw new Error('ไม่มีข้อมูลที่จะอัปเดต');
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const lastRow = fundusSheet.getLastRow();
    let foundRowIdx = -1;
    let existingRow = null;
    if (lastRow >= 2) {
      const idColRange = fundusSheet.getRange(2, FUNDUS_ID_COL + 1, lastRow - 1, 1);
      const cell = idColRange
        .createTextFinder(rid)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) {
        foundRowIdx = cell.getRow();
        existingRow = fundusSheet.getRange(foundRowIdx, 1, 1, FUNDUS_FIELDS.length).getDisplayValues()[0];
      }
    }
    if (!existingRow) throw new Error('ไม่พบรายการตรวจตาที่ระบุ');
    const existing = fundusRecordFromRow_(existingRow) || {};
    const ALLOWED_APPOINTMENT_KEYS = ['appointmentStatus', 'appointmentNote'];
    const merged = {};
    for (let i = 0; i < FUNDUS_FIELDS.length; i++) {
      const k = FUNDUS_FIELDS[i];
      merged[k] = (existing[k] != null) ? String(existing[k]) : '';
    }
    for (let k in patch) {
      if (ALLOWED_APPOINTMENT_KEYS.indexOf(k) === -1) continue;
      const v = (patch[k] == null) ? '' : String(patch[k]).trim();
      merged[k] = v;
    }
    merged.updaterName = verifiedUser.fullName;
    merged.updateDate = getThaiDateString_();
    const writeRow = fundusRowFromRecord_(merged);
    fundusSheet.getRange(foundRowIdx, 1, 1, writeRow.length).setValues([writeRow]);
    const savedRow = fundusSheet.getRange(foundRowIdx, 1, 1, FUNDUS_FIELDS.length).getDisplayValues()[0];
    const savedRecord = fundusRecordFromRow_(savedRow);
    if (savedRecord) {
      savedRecord.hn = stripLeadingQuote_(savedRecord.hn);
      savedRecord.prefix = stripLeadingQuote_(savedRecord.prefix);
      savedRecord.firstName = stripLeadingQuote_(savedRecord.firstName);
      savedRecord.lastName = stripLeadingQuote_(savedRecord.lastName);
    }
    return { success: true, message: 'บันทึกการมาตามนัดสำเร็จ', record: savedRecord };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function checkAppointmentSlotAvailability(appointmentDate, excludeRecordId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  try {
    const dateStr = String(appointmentDate || '').trim();
    if (!dateStr) return { success: true, available: true };
    
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const lastRow = fundusSheet.getLastRow();
    
    if (lastRow < 2) return { success: true, available: true };
    
    const data = fundusSheet.getRange(2, 1, lastRow - 1, FUNDUS_FIELDS.length).getDisplayValues();
    const nextAppointmentColIndex = FUNDUS_FIELDS.indexOf('nextAppointment');
    const idColIndex = FUNDUS_FIELDS.indexOf('id');
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const existingAppointment = String(row[nextAppointmentColIndex] || '').trim();
      const existingId = String(row[idColIndex] || '').trim();
      
      // Skip the current record when editing
      if (excludeRecordId && existingId === excludeRecordId) continue;
      
      if (existingAppointment === dateStr) {
        return { 
          success: true, 
          available: false, 
          message: 'วันที่ ' + dateStr + ' มีผู้ป่วยนัดครั้งต่อไปอยู่แล้ว' 
        };
      }
    }
    
    return { success: true, available: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteFundusRecord(recordId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์ลบรายการตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const rid = String(recordId || '').trim();
    if (!rid) throw new Error('จำเป็นต้องระบุ ID ของรายการตรวจตา');
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const lastRow = fundusSheet.getLastRow();
    let foundRowIdx = -1;
    if (lastRow >= 2) {
      const idColRange = fundusSheet.getRange(2, FUNDUS_ID_COL + 1, lastRow - 1, 1);
      const cell = idColRange
        .createTextFinder(rid)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) {
        foundRowIdx = cell.getRow();
      }
    }
    if (foundRowIdx === -1) throw new Error('ไม่พบรายการตรวจตาที่ระบุ');
    fundusSheet.deleteRow(foundRowIdx);
    return { success: true, message: 'ลบรายการคนตรวจตาสำเร็จ' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteFundusDate(dateId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์ลบวันที่ตรวจตา (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const did = String(dateId || '').trim();
    if (!did) throw new Error('จำเป็นต้องระบุ ID วันที่ตรวจ');
    const dateSheet = getSheet_(SHEET_FUNDUS_DATE);
    ensureFundusDateSheet_(dateSheet);
    const fundusSheet = getSheet_(SHEET_FUNDUS);
    ensureFundusSheet_(fundusSheet);
    const dateLastRow = dateSheet.getLastRow();
    let foundRowIdx = -1;
    if (dateLastRow >= 2) {
      const idColRange = dateSheet.getRange(2, FUNDUS_DATE_ID_COL + 1, dateLastRow - 1, 1);
      const cell = idColRange
        .createTextFinder(did)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (cell) foundRowIdx = cell.getRow();
    }
    if (foundRowIdx === -1) throw new Error('ไม่พบวันที่ตรวจตาที่ระบุ');
    
    // ดึงวันที่จริงจาก fundus_date sheet เพื่อใช้ในการค้นหา
    const dateValue = dateSheet.getRange(foundRowIdx, FUNDUS_DATE_DATE_COL + 1).getDisplayValue();
    const actualDateString = parseAnyDateToSheetBE_(dateValue);
    
    const fundusLastRow = fundusSheet.getLastRow();
    let hasRecords = false;
    if (fundusLastRow >= 2) {
      // ค้นหาในคอลัมน์วันที่ตรวจด้วยวันที่จริง
      const dateColRange = fundusSheet.getRange(2, FUNDUS_DATE_COL + 1, fundusLastRow - 1, 1);
      const usedCell = dateColRange
        .createTextFinder(actualDateString)
        .matchEntireCell(true)
        .matchCase(true)
        .useRegularExpression(false)
        .findNext();
      if (usedCell) hasRecords = true;

      // ถ้าไม่พบ ค้นหาในคอลัมน์ SessionID ด้วย dateId
      if (!hasRecords) {
        const sessionColRange = fundusSheet.getRange(2, FUNDUS_SESSION_ID_COL + 1, fundusLastRow - 1, 1);
        const usedCell2 = sessionColRange
          .createTextFinder(did)
          .matchEntireCell(true)
          .matchCase(true)
          .useRegularExpression(false)
          .findNext();
        if (usedCell2) hasRecords = true;
      }
    }
    if (hasRecords) throw new Error('ไม่สามารถลบได้ เนื่องจากมีคนตรวจตาอยู่ในวันที่นี้');
    dateSheet.deleteRow(foundRowIdx);
    return { success: true, message: 'ลบวันที่ตรวจตาสำเร็จ' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function getFundusOptions(currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'fundus');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  try {
    let resultOptions = [];
    try {
      const s = getSheet_(SHEET_FUNDUS_OPTION);
      const d = s.getDataRange().getDisplayValues();
      for (let i = 1; i < d.length; i++) {
        const val = String(d[i][1] || '').trim();
        if (val) resultOptions.push(val);
      }
    } catch (e) { }
    return { success: true, resultOptions: resultOptions };
  } catch (err) {
    return { success: false, message: err.message, resultOptions: [] };
  }
}

// ============ TeleMedicine Functions ============

function ensureTelemedDateSheet_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, TELEMED_DATE_HEADERS.length).setValues([TELEMED_DATE_HEADERS]);
  }
}

function telemedDateRecordFromRow_(row) {
  if (!row || row.length < TELEMED_DATE_FIELDS.length) return null;
  const rec = {};
  TELEMED_DATE_FIELDS.forEach(function (field, idx) {
    let val = (row[idx] == null) ? '' : String(row[idx]).trim();
    if (field === 'serviceCode') val = stripLeadingQuote_(val);
    rec[field] = val;
  });
  return rec;
}

function getTelemedDates(currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง รายการวันที่ TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED_DATE);
    ensureTelemedDateSheet_(sheet);
    const data = sheet.getDataRange().getDisplayValues();
    const dates = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length === 0) continue;
      const firstCol = (data[i][TELEMED_DATE_ID_COL] == null) ? '' : String(data[i][TELEMED_DATE_ID_COL]).trim();
      if (!firstCol) continue;
      const rawDateCell = String(data[i][TELEMED_DATE_DATE_COL] || '').trim();
      const sortKey = parseThaiDateToCE_(rawDateCell);
      const rec = telemedDateRecordFromRow_(data[i]);
      if (rec) {
        rec._sortMillis = sortKey ? sortKey.getTime() : 0;
        dates.push(rec);
      }
    }
    dates.sort(function (a, b) {
      const ak = Number(a._sortMillis || 0);
      const bk = Number(b._sortMillis || 0);
      if (ak === 0 && bk === 0) return 0;
      if (ak === 0) return 1;
      if (bk === 0) return -1;
      return bk - ak;
    });
    dates.forEach(function (d) { delete d._sortMillis; });
    return { success: true, dates: dates };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function createTelemedDate(data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์เพิ่มวันที่ TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED_DATE);
    ensureTelemedDateSheet_(sheet);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getDisplayValues();
    let maxId = 0;
    for (let i = 1; i < values.length; i++) {
      const idVal = String(values[i][TELEMED_DATE_ID_COL] || '').trim();
      if (idVal) {
        const idNum = parseInt(idVal, 10);
        if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
      }
    }
    const newId = maxId + 1;
    const now = new Date();
    const nowStr = Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    const newRow = [
      String(newId),
      data.date || '',
      data.serviceCode ? prefixLeadingZero_(data.serviceCode) : '',
      data.serviceName || '',
      verifiedUser.fullName || '',
      nowStr
    ];
    sheet.appendRow(newRow);
    const rec = telemedDateRecordFromRow_(newRow);
    return { success: true, message: 'เพิ่มวันที่นัด TeleMedicine สำเร็จ', record: rec };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteTelemedDate(dateId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์ลบวันที่ TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const telemedSheet = getSheet_(SHEET_TELEMED);
    const telemedData = telemedSheet.getDataRange().getDisplayValues();
    let hasRecords = false;
    for (let i = 1; i < telemedData.length; i++) {
      if (!telemedData[i] || telemedData[i].length === 0) continue;
      const refDateId = String(telemedData[i][TELEMED_DATE_COL] || '').trim();
      if (refDateId === String(dateId)) {
        hasRecords = true;
        break;
      }
    }
    if (hasRecords) {
      return { success: false, message: 'ไม่สามารถลบวันที่นัดที่มีผู้รับบริการอยู่ได้' };
    }
    const dateSheet = getSheet_(SHEET_TELEMED_DATE);
    const dateData = dateSheet.getDataRange().getDisplayValues();
    for (let i = 1; i < dateData.length; i++) {
      if (!dateData[i] || dateData[i].length === 0) continue;
      const rowId = String(dateData[i][TELEMED_DATE_ID_COL] || '').trim();
      if (rowId === String(dateId)) {
        dateSheet.deleteRow(i + 1);
        return { success: true, message: 'ลบวันที่นัด TeleMedicine สำเร็จ' };
      }
    }
    return { success: false, message: 'ไม่พบวันที่นัดที่ต้องการลบ' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function telemedRecordFromRow_(row) {
  if (!row || row.length < TELEMED_FIELDS.length) return null;
  const rec = {};
  TELEMED_FIELDS.forEach(function (field, idx) {
    let val = (row[idx] == null) ? '' : String(row[idx]).trim();
    if (field === 'phone' || field === 'serviceCode') val = stripLeadingQuote_(val);
    rec[field] = val;
  });
  return rec;
}

function getTelemedByDate(dateId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED);
    const data = sheet.getDataRange().getDisplayValues();
    const records = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length === 0) continue;
      const refDateId = String(data[i][TELEMED_DATE_COL] || '').trim();
      if (refDateId === String(dateId)) {
        const rec = telemedRecordFromRow_(data[i]);
        if (rec) records.push(rec);
      }
    }
    const dateSheet = getSheet_(SHEET_TELEMED_DATE);
    const dateData = dateSheet.getDataRange().getDisplayValues();
    let dateRecord = null;
    for (let i = 1; i < dateData.length; i++) {
      if (!dateData[i] || dateData[i].length === 0) continue;
      const rowId = String(dateData[i][TELEMED_DATE_ID_COL] || '').trim();
      if (rowId === String(dateId)) {
        dateRecord = telemedDateRecordFromRow_(dateData[i]);
        break;
      }
    }
    return { success: true, records: records, dateRecord: dateRecord };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function addTelemedRecord(dateId, data, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์บันทึก TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, TELEMED_HEADERS.length).setValues([TELEMED_HEADERS]);
    }
    const dataRange = sheet.getDataRange();
    const values = dataRange.getDisplayValues();
    let maxId = 0;
    for (let i = 1; i < values.length; i++) {
      const idVal = String(values[i][TELEMED_ID_COL] || '').trim();
      if (idVal) {
        const idNum = parseInt(idVal, 10);
        if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
      }
    }
    const newId = maxId + 1;
    const now = new Date();
    const nowStr = Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    const sessionId = generateSessionId_();
    const newRow = [
      String(newId),
      String(dateId),
      data.hn || '',
      data.prefix || '',
      data.firstName || '',
      data.lastName || '',
      data.ht || '',
      data.dm || '',
      data.dlp || '',
      data.otherDisease || '',
      data.phone ? prefixLeadingZero_(data.phone) : '',
      data.details || '',
      data.consent || '',
      data.serviceCode ? prefixLeadingZero_(data.serviceCode) : '',
      data.serviceName || '',
      data.room || '',
      data.provider || '',
      data.appointmentMonth || '',
      data.appointmentDate || '',
      data.note || '',
      sessionId,
      verifiedUser.fullName || '',
      nowStr,
      '',
      ''
    ];
    sheet.appendRow(newRow);
    const rec = telemedRecordFromRow_(newRow);
    return { success: true, message: 'บันทึก TeleMedicine สำเร็จ', record: rec };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function updateTelemedRecord(recordId, patch, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์แก้ไข TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED);
    const data = sheet.getDataRange().getDisplayValues();
    for (let i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length === 0) continue;
      const rowId = String(data[i][TELEMED_ID_COL] || '').trim();
      if (rowId === String(recordId)) {
        const rec = telemedRecordFromRow_(data[i]);
        if (!rec) continue;
        const now = new Date();
        const nowStr = Utilities.formatDate(now, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
        
        if (patch.ht !== undefined) rec.ht = patch.ht;
        if (patch.dm !== undefined) rec.dm = patch.dm;
        if (patch.dlp !== undefined) rec.dlp = patch.dlp;
        if (patch.otherDisease !== undefined) rec.otherDisease = patch.otherDisease;
        if (patch.phone !== undefined) rec.phone = patch.phone;
        if (patch.details !== undefined) rec.details = patch.details;
        if (patch.consent !== undefined) rec.consent = patch.consent;
        if (patch.serviceCode !== undefined) rec.serviceCode = patch.serviceCode;
        if (patch.serviceName !== undefined) rec.serviceName = patch.serviceName;
        if (patch.room !== undefined) rec.room = patch.room;
        if (patch.provider !== undefined) rec.provider = patch.provider;
        if (patch.appointmentMonth !== undefined) rec.appointmentMonth = patch.appointmentMonth;
        if (patch.appointmentDate !== undefined) rec.appointmentDate = patch.appointmentDate;
        if (patch.note !== undefined) rec.note = patch.note;
        rec.updaterName = verifiedUser.fullName || '';
        rec.updateDate = nowStr;

        const newRow = TELEMED_FIELDS.map(function (field) {
          let val = rec[field] || '';
          if (field === 'phone' && val) val = prefixLeadingZero_(val);
          if (field === 'serviceCode' && val) val = prefixLeadingZero_(val);
          return val;
        });
        sheet.getRange(i + 1, 1, 1, TELEMED_FIELDS.length).setValues([newRow]);
        return { success: true, message: 'แก้ไข TeleMedicine สำเร็จ' };
      }
    }
    return { success: false, message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteTelemedRecord(recordId, currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  if (!verifiedUser.role || String(verifiedUser.role).toLowerCase() !== 'admin') {
    return { success: false, message: 'ไม่มีสิทธิ์ลบ TeleMedicine (เฉพาะ Admin เท่านั้น)' };
  }
  try {
    const sheet = getSheet_(SHEET_TELEMED);
    const data = sheet.getDataRange().getDisplayValues();
    for (let i = 1; i < data.length; i++) {
      if (!data[i] || data[i].length === 0) continue;
      const rowId = String(data[i][TELEMED_ID_COL] || '').trim();
      if (rowId === String(recordId)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'ลบรายการ TeleMedicine สำเร็จ' };
      }
    }
    return { success: false, message: 'ไม่พบรายการที่ต้องการลบ' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// เติม SessionID ย้อนหลังให้แถวที่เพิ่มข้อมูลลงชีตโดยตรง (รันด้วยมือครั้งเดียวจากหน้า Apps Script: เลือกฟังก์ชันนี้แล้วกด Run)
function backfillTelemedSessionIds() {
  try {
    const sheet = getSheet_(SHEET_TELEMED);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, updated: 0, message: 'ไม่มีข้อมูลให้เติม' };
    }

    const range = sheet.getRange(2, 1, lastRow - 1, TELEMED_FIELDS.length);
    const values = range.getValues();

    const ids = [];
    let updated = 0;

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const currentId = String(row[TELEMED_SESSION_ID_COL] == null ? '' : row[TELEMED_SESSION_ID_COL]).trim();

      // ข้ามแถวที่ว่างทั้งหมด
      const hasData = row.some(function (cell) {
        return String(cell == null ? '' : cell).trim() !== '';
      });

      if (!hasData) {
        ids.push([currentId]);
      } else if (currentId) {
        ids.push([currentId]);
      } else {
        ids.push([generateSessionId_()]);
        updated++;
      }
    }

    if (updated > 0) {
      sheet.getRange(2, TELEMED_SESSION_ID_COL + 1, ids.length, 1).setValues(ids);
    }

    const message = 'เติม SessionID เรียบร้อย ' + updated + ' แถว';
    Logger.log(message);
    return { success: true, updated: updated, message: message };
  } catch (err) {
    Logger.log('backfillTelemedSessionIds failed: ' + err.toString());
    return { success: false, message: err.message };
  }
}

function getTelemedOptions(currentUser) {
  const accessCheck = requireMenuAccess_(currentUser, 'telemed');
  if (!accessCheck.ok) return accessCheck.response;
  const verifiedUser = accessCheck.verified;
  if (!verifiedUser) {
    return { success: false, message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', needLogin: true };
  }
  try {
    let hospitals = [];
    let rooms = [];
    
    try {
      const hSheet = getSheet_(SHEET_HOSPITAL);
      const hData = hSheet.getDataRange().getDisplayValues();
      for (let i = 1; i < hData.length; i++) {
        if (!hData[i] || hData[i].length === 0) continue;
        const code = String(hData[i][0] || '').trim();
        const name = String(hData[i][1] || '').trim();
        if (code && name) {
          hospitals.push({ code: code, name: name });
        }
      }
    } catch (e) { }
    
    try {
      const rSheet = getSheet_(SHEET_TELEMED_ROOM);
      const rData = rSheet.getDataRange().getDisplayValues();
      for (let i = 1; i < rData.length; i++) {
        if (!rData[i] || rData[i].length === 0) continue;
        const room = String(rData[i][1] || '').trim();
        if (room) {
          rooms.push(room);
        }
      }
    } catch (e) { }
    
    return { success: true, hospitals: hospitals, rooms: rooms };
  } catch (err) {
    return { success: false, message: err.message, hospitals: [], rooms: [] };
  }
}






// ====================================================================================================================================
// ====================================================================================================================================
// ====================================================================================================================================

/**
 * ฟังก์ชันสำหรับรับข้อมูลที่ Upload แล้วตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
 */
function uploadBloodTestExcel(dataArray) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);
    var personSheet = ss.getSheetByName(SHEET_PERSON);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_LAB);
      var headers = ["ID", "ชื่อ-สกุล", "HN", "หน่วยบริการ", "FBS", "HbA1C", "BUN", "Cr", "TC", "TG", "HDL", "LDL", "วันที่รับบริการ", "ครั้งที่", "BP_Top", "BP_Bottom", "น้ำหนัก", "ส่วนสูง", "ชีพจร", "อัตราการหายใจ", "eGFR"];
      sheet.appendRow(headers);
    }

    // โหลดข้อมูล person เพื่อดึงหน่วยบริการ
    var personData = {};
    if (personSheet) {
      var personLastRow = personSheet.getLastRow();
      if (personLastRow > 1) {
        var personValues = personSheet.getRange(2, 1, personLastRow - 1, 17).getDisplayValues(); // HN col 0, serviceName col 16
        for (var p = 0; p < personValues.length; p++) {
          var hn = String(personValues[p][0] || '').trim();
          var serviceName = String(personValues[p][16] || '').trim();
          if (hn) {
            personData[hn] = serviceName;
          }
        }
      }
    }

    var lastRow = sheet.getLastRow();
    var existingIds = [];

    if (lastRow > 1) {
      var idValues = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      existingIds = idValues.map(function(row) { return String(row[0]).trim(); });
    }

    var duplicateCount = 0;
    var newDataToSave = [];

    for (var i = 0; i < dataArray.length; i++) {
      var recordId = String(dataArray[i][0]).trim();
      var hn = String(dataArray[i][2] || '').trim();

      // ดึงหน่วยบริการจาก person sheet
      var serviceName = personData[hn] || '';

      // สร้าง record ใหม่โดยเพิ่มหน่วยบริการที่ col D (index 3)
      var newRecord = dataArray[i].slice();
      newRecord.splice(3, 0, serviceName); // Insert at index 3 (after HN)

      if (existingIds.indexOf(recordId) !== -1) {
        duplicateCount++;
      } else {
        newDataToSave.push(newRecord);
      }
    }

    return {
      success: true,
      total: dataArray.length,
      duplicates: duplicateCount,
      newRecords: newDataToSave.length,
      readyToSave: newDataToSave
    };

  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * บันทึกข้อมูลลงชีต
 * @param {Array} newDataArray - ข้อมูลที่จะบันทึก
 * @param {Boolean} updateExisting - true = อัปเดตรายการซ้ำ, false = เพิ่มเฉพาะรายการใหม่
 */
function confirmSaveBloodTest(newDataArray, updateExisting) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);

    if (newDataArray.length === 0) {
      return { success: true, savedCount: 0 };
    }

    if (updateExisting) {
      // อัปเดตรายการซ้ำ + เพิ่มรายการใหม่
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var existingData = sheet.getRange(2, 1, lastRow - 1, newDataArray[0].length).getValues();
        var existingIds = {};

        // สร้าง map ของ ID ที่มีอยู่
        for (var i = 0; i < existingData.length; i++) {
          var id = String(existingData[i][0] || '');
          if (id) {
            existingIds[id] = i + 2; // เก็บ row number (1-indexed)
          }
        }

        // อัปเดตรายการที่ซ้ำ
        var updatedCount = 0;
        var newRows = [];

        for (var j = 0; j < newDataArray.length; j++) {
          var id = String(newDataArray[j][0] || '');
          if (id && existingIds[id]) {
            // อัปเดตรายการที่มีอยู่
            sheet.getRange(existingIds[id], 1, 1, newDataArray[j].length).setValues([newDataArray[j]]);
            updatedCount++;
          } else {
            // เก็บรายการใหม่ไว้เพิ่มทีหลัง
            newRows.push(newDataArray[j]);
          }
        }

        // เพิ่มรายการใหม่
        if (newRows.length > 0) {
          sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
        }

        return { success: true, savedCount: updatedCount + newRows.length };
      } else {
        // ไม่มีข้อมูลเดิม เพิ่มทั้งหมด
        sheet.getRange(2, 1, newDataArray.length, newDataArray[0].length).setValues(newDataArray);
        return { success: true, savedCount: newDataArray.length };
      }
    } else {
      // เพิ่มเฉพาะรายการใหม่ (เดิม)
      sheet.getRange(sheet.getLastRow() + 1, 1, newDataArray.length, newDataArray[0].length).setValues(newDataArray);
      return { success: true, savedCount: newDataArray.length };
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * ดึงข้อมูลสรุปปฏิทิน (นับจำนวนผู้รับบริการแต่ละวันแบบ DD/MM/YYYY พ.ศ.)
 */
function getBloodTestCalendarStats(month, yearCE) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);
    if (!sheet) return { success: true, stats: {} };
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, stats: {} };
    
    // ดึงข้อมูลตั้งแต่คอลัมน์ E (FBS) ถึง M (วันที่รับบริการ) เพื่อตรวจสอบผลเลือด
    // Index: 4=FBS, 5=HbA1C, 6=BUN, 7=Cr, 8=TC, 9=TG, 10=HDL, 11=LDL, 12=serviceDate
    var data = sheet.getRange(2, 5, lastRow - 1, 9).getDisplayValues();
    var stats = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var dateStr = String(row[8]).trim(); // column M (index 8 in this range)
      
      if (dateStr) {
        // ตรวจสอบว่ามีผลเลือดอย่างน้อย 1 ค่าหรือไม่ (FBS, HbA1C, BUN, Cr, TC, TG, HDL, LDL)
        var hasBloodTest = false;
        for (var j = 0; j < 8; j++) { // check first 8 columns (blood test values)
          if (row[j] && String(row[j]).trim() !== '') {
            hasBloodTest = true;
            break;
          }
        }
        
        // นับเฉพาะรายการที่มีผลเลือด
        if (hasBloodTest) {
          if (!stats[dateStr]) stats[dateStr] = 0;
          stats[dateStr]++;
        }
      }
    }
    return { success: true, stats: stats };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * ดึงข้อมูลผู้รับบริการตามวันที่เลือกในปฏิทิน
 */
function getBloodTestRecordsByDate(dateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);
    if (!sheet) return { success: true, records: [] };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, records: [] };

    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
    var records = [];

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][12]).trim() === dateStr) { // col 12 = วันที่รับบริการ (เลื่อนไป 1 เพราะมีหน่วยบริการ)
        records.push({
          id: data[i][0],
          name: data[i][1],
          hn: data[i][2],
          serviceUnit: data[i][3],
          fbs: data[i][4],
          hba1c: data[i][5],
          bun: data[i][6],
          cr: data[i][7],
          tc: data[i][8],
          tg: data[i][9],
          hdl: data[i][10],
          ldl: data[i][11],
          serviceDate: data[i][12],
          visitNum: data[i][13],
          bpTop: data[i][14],
          bpBottom: data[i][15],
          weight: data[i][16],
          height: data[i][17],
          pr: data[i][18],
          rr: data[i][19],
          egfr: data[i][20]
        });
      }
    }
    return { success: true, records: records };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}


/**
 * ดึงข้อมูลผู้รับบริการตรวจเลือดทั้งหมด
 */
function getAllBloodTestRecords() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB); // อ้างอิงตัวแปร SHEET_LAB ที่มีอยู่แล้ว
    if (!sheet) return { success: true, records: [] };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, records: [] };

    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
    var records = [];

    for (var i = 0; i < data.length; i++) {
      records.push({
        id: data[i][0], name: data[i][1], hn: data[i][2], serviceUnit: data[i][3],
        fbs: data[i][4], hba1c: data[i][5], bun: data[i][6], cr: data[i][7], tc: data[i][8],
        tg: data[i][9], hdl: data[i][10], ldl: data[i][11], serviceDate: data[i][12],
        visitNum: data[i][13], bpTop: data[i][14], bpBottom: data[i][15],
        weight: data[i][16], height: data[i][17], pr: data[i][18],
        rr: data[i][19], egfr: data[i][20]
      });
    }
    return { success: true, records: records };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Dashboard: ดึงข้อมูลทั้งหมดจากชีต dashboard (ไม่ต้อง login)
 */
function getDashboardData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboardSheet = ss.getSheetByName(SHEET_DASHBOARD);
    if (!dashboardSheet) return { success: true, patientsData: [], fundusData: [] };

    const lastRow = dashboardSheet.getLastRow();
    if (lastRow <= 1) return { success: true, patientsData: [], fundusData: [] };

    // ดึงข้อมูลทั้งหมดจากชีต dashboard (column A-L = index 0-11)
    const data = dashboardSheet.getRange(2, 1, lastRow - 1, 12).getDisplayValues();

    // แปลงข้อมูลเป็น 2 dataset แยกกัน
    const patientsData = [];
    const fundusData = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Dataset 1: จำนวนผู้ป่วย (Column A:B)
      const serviceName = String(row[0] || '').trim();
      const count = String(row[1] || '').trim();
      if (serviceName || count) {
        patientsData.push({
          serviceName: serviceName,
          count: count
        });
      }

      // Dataset 2: Dashboard ตรวจตา (Column D:L)
      const examDate = String(row[3] || '').trim();
      const location = String(row[4] || '').trim();
      const total = String(row[5] || '').trim();
      const noDR = String(row[6] || '').trim();
      const mildNPDR = String(row[7] || '').trim();
      const moderateNPDR = String(row[8] || '').trim();
      const severeNPDR = String(row[9] || '').trim();
      const pdr = String(row[10] || '').trim();
      const poorView = String(row[11] || '').trim();

      if (examDate || location || total || noDR || mildNPDR || moderateNPDR || severeNPDR || pdr || poorView) {
        fundusData.push({
          examDate: examDate,
          location: location,
          total: total,
          noDR: noDR,
          mildNPDR: mildNPDR,
          moderateNPDR: moderateNPDR,
          severeNPDR: severeNPDR,
          pdr: pdr,
          poorView: poorView
        });
      }
    }

    return { success: true, patientsData: patientsData, fundusData: fundusData };
  } catch (err) {
    return { success: false, message: err.message, patientsData: [], fundusData: [] };
  }
}

/**
 * ลบข้อมูลผลการตรวจเลือดตามวันที่
 */
function deleteBloodTestByDate(dateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);
    if (!sheet) return { success: false, message: 'ไม่พบชีตข้อมูล' };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, deletedCount: 0 };

    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
    var rowsToDelete = [];

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][12]).trim() === dateStr) { // col 12 = วันที่รับบริการ
        rowsToDelete.push(i + 2); // Row number (1-indexed)
      }
    }

    if (rowsToDelete.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // ลบจากล่างขึ้นบนเพื่อไม่ให้ row number เปลี่ยน
    rowsToDelete.sort(function(a, b) { return b - a; });
    for (var j = 0; j < rowsToDelete.length; j++) {
      sheet.deleteRow(rowsToDelete[j]);
    }

    return { success: true, deletedCount: rowsToDelete.length };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * ลบข้อมูลผลการตรวจเลือดตาม ID
 */
function deleteBloodTestById(id) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAB);
    if (!sheet) return { success: false, message: 'ไม่พบชีตข้อมูล' };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'ไม่พบข้อมูล' };

    var data = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    var rowToDelete = -1;

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(id).trim()) {
        rowToDelete = i + 2; // Row number (1-indexed)
        break;
      }
    }

    if (rowToDelete === -1) {
      return { success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ' };
    }

    sheet.deleteRow(rowToDelete);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * สร้าง HTML สำหรับพิมพ์ OPD Card
 */
function generateOPDCards(dateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var labSheet = ss.getSheetByName(SHEET_LAB);
    var personSheet = ss.getSheetByName(SHEET_PERSON);

    if (!labSheet) return { success: false, message: 'ไม่พบชีตข้อมูลตรวจเลือด' };
    if (!personSheet) return { success: false, message: 'ไม่พบชีตข้อมูลผู้ป่วย' };

    // ดึงข้อมูลตรวจเลือดตามวันที่
    var labLastRow = labSheet.getLastRow();
    if (labLastRow <= 1) return { success: false, message: 'ไม่มีข้อมูลในวันที่ที่เลือก' };

    var labData = labSheet.getRange(2, 1, labLastRow - 1, 21).getDisplayValues();
    var labRecords = [];

    for (var i = 0; i < labData.length; i++) {
      if (String(labData[i][12]).trim() === dateStr) { // col 12 = วันที่รับบริการ
        labRecords.push({
          id: labData[i][0],
          hn: labData[i][2],
          serviceUnit: labData[i][3],
          fbs: labData[i][4],
          hba1c: labData[i][5],
          bun: labData[i][6],
          cr: labData[i][7],
          tc: labData[i][8],
          tg: labData[i][9],
          hdl: labData[i][10],
          ldl: labData[i][11],
          serviceDate: labData[i][12],
          visitNum: labData[i][13],
          bpTop: labData[i][14],
          bpBottom: labData[i][15],
          weight: labData[i][16],
          height: labData[i][17],
          pr: labData[i][18],
          rr: labData[i][19],
          egfr: labData[i][20]
        });
      }
    }

    if (labRecords.length === 0) return { success: false, message: 'ไม่มีข้อมูลในวันที่ที่เลือก' };

    // ดึงข้อมูลผู้ป่วย
    var personLastRow = personSheet.getLastRow();
    var personData = {};
    if (personLastRow > 1) {
      var personValues = personSheet.getRange(2, 1, personLastRow - 1, 22).getDisplayValues();
      for (var p = 0; p < personValues.length; p++) {
        var hn = String(personValues[p][0] || '').trim();
        if (hn) {
          personData[hn] = {
            prefix: personValues[p][3],
            firstName: personValues[p][4],
            lastName: personValues[p][5],
            birthDate: personValues[p][6],
            treatmentRight: personValues[p][17],
            ht: personValues[p][18],
            dm: personValues[p][19],
            dlp: personValues[p][20]
          };
        }
      }
    }

    // สร้าง HTML
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">';
    html += '<style>';
    html += '@page { size: A5 landscape; margin: 20mm; }';
    html += 'body { font-family: "Sarabun", sans-serif; font-size: 14px; margin: 0; padding: 0; }';
    html += '.opd-card { width: 100%; height: 140mm; border: 2px solid #000; padding: 10px; page-break-after: always; page-break-inside: avoid; box-sizing: border-box; }';
    
    // Header
    html += '.opd-paper-header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }';
    html += '.opd-header-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }';
    html += '.opd-patient-header { display: flex; gap: 20px; margin-top: 5px; align-items: center; }';
    html += '.opd-hn { font-size: 20px; font-weight: bold; min-width: 80px; }';
    html += '.opd-patient-name { font-size: 20px; font-weight: bold; }';
    
    // Main layout
    html += '.opd-main { display: flex; gap: 10px; }';
    html += '.opd-left { flex: 0 0 40%; border-right: 2px solid #000; padding-right: 10px; }';
    html += '.opd-right { flex: 0 0 57%; }';
    
    // General info
    html += '.general-info { margin-bottom: 10px; }';
    html += '.general-row { display: flex; gap: 10px; margin-bottom: 5px; align-items: center; }';
    html += '.general-row span { font-size: 12px; }';
    html += '.general-row strong { font-size: 12px; min-width: 40px; text-align: center; }';
    
    // LAB section
    html += '.lab-section { margin-top: 10px; }';
    html += '.lab-title { font-size: 12px; font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; }';
    html += '.lab-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }';
    html += '.lab-table th { border: 1px solid #000; padding: 2px 3px; text-align: center; font-size: 12px; font-weight: bold; background-color: #f0f0f0; }';
    html += '.lab-table td { border: 1px solid #000; padding: 2px 3px; text-align: center; font-size: 12px; }';
    html += '.lab-table .lab-name { text-align: left; font-weight: bold; }';
    html += '.lab-table .lab-normal { color: #000; }';
    html += '.lab-table .lab-result { font-weight: bold; }';
    html += '.lab-table .lab-status-normal { color: #000; font-weight: bold; }';
    html += '.lab-table .lab-status-abnormal { color: #000; font-weight: bold; }';
    
    // Treatment section
    html += '.diagnosis-title { font-size: 12px; margin-bottom: 5px; }';
    html += '.treatment-title { font-size: 12px; font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; }';
    html += '.treatment-table { width: 100%; border-collapse: collapse; }';
    html += '.treatment-table th { border: 1px solid #000; padding: 4px 3px; text-align: center; font-size: 12px; font-weight: bold; background-color: #f0f0f0; }';
    html += '.treatment-table td { border: 1px solid #000; padding: 4px 3px; text-align: center; font-size: 12px; }';
    
    // Doctor signature
    html += '.doctor-sign { margin-top: 150px; font-size: 12px; }';
    html += '</style></head><body>';

    // สร้าง OPD Card สำหรับแต่ละคน
    for (var j = 0; j < labRecords.length; j++) {
      var lab = labRecords[j];
      var person = personData[lab.hn] || {};

      // =========================
      // ชื่อผู้ป่วย
      // =========================
      var fullName =
        (person.prefix || '') + ' ' +
        (person.firstName || '') + ' ' +
        (person.lastName || '');

      // =========================
      // Diagnosis
      // =========================
      var diagnoses = [];

      if (person.ht === 'รักษาอยู่' || person.ht === 'รักษา รพ.สต.')
        diagnoses.push('HT');

      if (person.dm === 'รักษาอยู่' || person.dm === 'รักษา รพ.สต.')
        diagnoses.push('DM');

      if (person.dlp === 'รักษาอยู่' || person.dlp === 'รักษา รพ.สต.')
        diagnoses.push('DLP');

      var diagnosis = diagnoses.length
        ? diagnoses.join(' / ')
        : '-';

      // =========================
      // OPD CARD
      // =========================
      html += '<div class="opd-card">';

      // ==================================================
      // HEADER
      // ==================================================
      html += '<div class="opd-paper-header">';

      html += '<div class="opd-header-title">';
      html += '<strong>OPD CARD</strong>';
      html += ' งานพัฒนาระบบบริการปฐมภูมิและสนับสนุนเครือข่าย ';
      html += 'กลุ่มงานเวชกรรมสังคม รพศ.เชียงราย';
      html += '</div>';

      html += '<div class="opd-patient-header">';

      html += '<div class="opd-hn">';
      html += (lab.hn || '-');
      html += '</div>';

      html += '<div class="opd-patient-name">';
      html += '- ' + fullName;
      html += '</div>';

      html += '</div>';

      html += '</div>';


      // ==================================================
      // MAIN CONTENT
      // ซ้าย = ข้อมูลทั่วไป + LAB
      // ขวา = Treatment
      // ==================================================
      html += '<div class="opd-main">';


      // ==================================================
      // LEFT
      // ==================================================
      html += '<div class="opd-left">';


      // --------------------------
      // ข้อมูลทั่วไป
      // --------------------------
      html += '<div class="general-info">';

      html += '<div class="general-row mb-5">';
      html += '<span>วันที่</span>';
      html += '<strong>' + (lab.serviceDate || '-') + '</strong>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>DX</span>';
      html += '<strong>' + diagnosis + '</strong>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>น้ำหนัก :</span>';
      html += '<strong>' + (lab.weight || '-') + '</strong>';
      html += '<span>กก.</span>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>ส่วนสูง :</span>';
      html += '<strong>' + (lab.height || '-') + '</strong>';
      html += '<span>ซม.</span>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>ความดันโลหิต (BP) :</span>';
      html += '<strong>' +
        (lab.bpTop || '-') + '/' +
        (lab.bpBottom || '-') +
        '</strong>';
      html += '<span>mmHg</span>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>ชีพจร (PR) :</span>';
      html += '<strong>' + (lab.pr || '-') + '</strong>';
      html += '<span>min</span>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>Urine Sugar:</span>';
      html += '<strong>-</strong>';
      html += '</div>';

      html += '<div class="general-row">';
      html += '<span>Urine Albumin:</span>';
      html += '<strong>-</strong>';
      html += '</div>';

      html += '</div>';


      // ==================================================
      // LAB
      // ==================================================
      html += '<div class="lab-section">';

      html += '<div class="lab-title">LAB result</div>';

      html += '<table class="lab-table">';

      // หัวข้อตาราง
      html += '<tr>';
      html += '<th>ชื่อ Lab</th>';
      html += '<th>ค่าปกติ</th>';
      html += '<th>ผล</th>';
      html += '<th>แปลผล</th>';
      html += '</tr>';

      // ฟังก์ชันตรวจสอบค่าปกติ/ผิดปกติ
      function checkLabStatus(value, labName) {
        if (!value || value === '-') return { status: '-', text: '-' };
        
        var numVal = parseFloat(value);
        if (isNaN(numVal)) return { status: '-', text: '-' };
        
        // ค่าปกติแบบง่าย (สามารถดึงจาก c_lab ได้ในอนาคต)
        var normals = {
          'FBS': { min: 70, max: 110 },
          'HbA1C': { min: 4.8, max: 6 },
          'TC': { min: 150, max: 200 },
          'TG': { min: 0, max: 170 },
          'HDL': { min: 35, max: 95 },
          'LDL': { min: 0, max: 130 },
          'BUN': { min: 9, max: 19 },
          'Cr': { min: 0.5, max: 1.5 },
          'eGFR': { min: 60, max: 999 }
        };
        
        var normal = normals[labName];
        if (!normal) return { status: '-', text: '-' };
        
        if (numVal < normal.min || numVal > normal.max) {
          return { status: 'abnormal', text: 'ผิดปกติ' };
        } else {
          return { status: 'normal', text: 'ปกติ' };
        }
      }

      // รายการ Lab แต่ละตัว
      var labItems = [
        { name: 'FBS', value: lab.fbs, normal: '70-110' },
        { name: 'HbA1C', value: lab.hba1c, normal: '4.8-6' },
        { name: 'TC', value: lab.tc, normal: '150-200' },
        { name: 'TG', value: lab.tg, normal: '0-170' },
        { name: 'HDL', value: lab.hdl, normal: '35-95' },
        { name: 'LDL', value: lab.ldl, normal: '0-130' },
        { name: 'BUN', value: lab.bun, normal: '9-19' },
        { name: 'Cr', value: lab.cr, normal: '0.5-1.5' },
        { name: 'eGFR', value: lab.egfr, normal: '>60' }
      ];

      for (var i = 0; i < labItems.length; i++) {
        var item = labItems[i];
        var check = checkLabStatus(item.value, item.name);
        
        html += '<tr>';
        html += '<td class="lab-name">' + item.name + '</td>';
        html += '<td class="lab-normal">' + item.normal + '</td>';
        html += '<td class="lab-result">' + (item.value || '-') + '</td>';
        
        if (check.status === 'normal') {
          html += '<td class="lab-status-normal">' + check.text + '</td>';
        } else if (check.status === 'abnormal') {
          html += '<td class="lab-status-abnormal">' + check.text + '</td>';
        } else {
          html += '<td>' + check.text + '</td>';
        }
        
        html += '</tr>';
      }

      html += '</table>';

      html += '</div>'; // lab-section

      html += '</div>'; // opd-left


      // ==================================================
      // RIGHT : TREATMENT
      // ==================================================
      html += '<div class="opd-right">';

      html += '<div class="diagnosis-title">';
      html += 'การวินิจฉัย : <strong>' + diagnosis + '</strong>';
      html += '</div>';

      html += '<div class="treatment-title">Treatment</div>';

      html += '<table class="treatment-table">';

      html += '<tr>';
      html += '<th>/</th>';
      html += '<th>Medication</th>';
      html += '<th>(mg)</th>';
      html += '<th>Dosage</th>';
      html += '<th>/</th>';
      html += '<th>Medication</th>';
      html += '<th>(mg)</th>';
      html += '<th>Dosage</th>';
      html += '</tr>';

      var leftMeds = [
        ['Atenolol', '50', ''],
        ['Amlodipine', '', ''],
        ['Enalapril', '', ''],
        ['HCTZ', '25', ''],
        ['Losartan', '50', ''],
        ['Metformin', '500', ''],
        ['Glipizide', '5', '']
      ];

      var rightMeds = [
        ['Simvastatin', '20', ''],
        ['Atorvastatin', '40', ''],
        ['Gemfibrozil', '300', ''],
        ['Aspirin', '81', ''],
        ['Omeprazole', '20', ''],
        ['Folic acid', '5', '']
      ];

      for (var m = 0; m < 7; m++) {

        html += '<tr>';

        // ซ้าย
        html += '<td></td>';
        html += '<td>' + (leftMeds[m] ? leftMeds[m][0] : '') + '</td>';
        html += '<td>' + (leftMeds[m] ? leftMeds[m][1] : '') + '</td>';
        html += '<td>' + (leftMeds[m] ? leftMeds[m][2] : '') + '</td>';

        // ขวา
        html += '<td></td>';
        html += '<td>' + (rightMeds[m] ? rightMeds[m][0] : '') + '</td>';
        html += '<td>' + (rightMeds[m] ? rightMeds[m][1] : '') + '</td>';
        html += '<td>' + (rightMeds[m] ? rightMeds[m][2] : '') + '</td>';

        html += '</tr>';
      }

      html += '</table>';

      // ลายเซ็นแพทย์
      html += '<div class="doctor-sign">';
      html += '<div style="margin-top: 20px;">';
      html += 'แพทย์................................................................................................';
      html += '</div>';
      html += '</div>';

      html += '</div>'; // opd-right

      html += '</div>'; // opd-main

      html += '</div>'; // opd-card
    }





    html += '</body></html>';

    return { success: true, html: html };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}


/**
 * ดึงค่าปกติจากชีต c_lab
 */
function getLabNormalValues() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('c_lab');
    if (!sheet) return { success: false, message: 'ไม่พบชีต c_lab' };
    
    var data = sheet.getDataRange().getDisplayValues();
    var normals = {};
    // วนลูปข้าม Header (เริ่ม i=1)
    for (var i = 1; i < data.length; i++) {
      var labName = String(data[i][0]).trim().toUpperCase(); // ชื่อ Lab
      var min = parseFloat(data[i][1]); // Min
      var max = parseFloat(data[i][2]); // Max
      if (labName) {
        normals[labName] = { 
          min: isNaN(min) ? null : min, 
          max: isNaN(max) ? null : max 
        };
      }
    }
    return { success: true, normals: normals };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ============ DOWNLOAD FUNCTIONS ============

// Check admin permission from user sheet 
function checkAdminPermission() {
  try {
    const user = Session.getActiveUser();
    if (!user || !user.getEmail()) {
      return { success: false, isAdmin: false, message: 'ไม่พบข้อมูลผู้ใช้' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = ss.getSheetByName(SHEET_USER);
    if (!userSheet) {
      return { success: false, isAdmin: false, message: 'ไม่พบชีต user' };
    }

    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, isAdmin: false, message: 'ไม่มีข้อมูลผู้ใช้ในระบบ' };
    }

    const data = userSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const userEmail = user.getEmail().toLowerCase();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const username = String(row[0] || '').trim();
      const role = String(row[3] || '').trim().toLowerCase();

      if (username.toLowerCase() === userEmail && role === 'admin') {
        return { success: true, isAdmin: true, message: 'มีสิทธิ์ admin' };
      }
    }

    return { success: true, isAdmin: false, message: 'ไม่มีสิทธิ์ admin' };
  } catch (e) {
    return { success: false, isAdmin: false, message: e.toString() };
  }
}

function checkDriveAccess() {
  try {
    // Try to access the folder to check permissions
    const folder = DriveApp.getFolderById(DOWNLOAD_FOLDER_ID);
    const folderName = folder.getName();
    return { success: true, hasAccess: true, folderName: folderName };
  } catch (e) {
    return { success: false, hasAccess: false, message: e.toString() };
  }
}

// Function to test Drive access manually (for admin to authorize)
function testDriveAccess() {
  let user = '(ไม่ทราบบัญชี)';
  try {
    user = Session.getEffectiveUser().getEmail() || user;
  } catch (ignore) { }
  try {
    const folder = DriveApp.getFolderById(DOWNLOAD_FOLDER_ID);
    Logger.log('บัญชีที่รัน: ' + user + ' | Drive access OK | โฟลเดอร์: ' + folder.getName());
    return { success: true, message: 'Drive access OK', folderName: folder.getName(), user: user };
  } catch (e) {
    Logger.log('บัญชีที่รัน: ' + user + ' | Drive access FAILED | ' + e.toString());
    return { success: false, message: e.toString(), user: user };
  }
}

// ตรวจสอบสถานะการอนุญาต (authorization) และคืน URL สำหรับกดยินยอมสิทธิ์
function getDriveAuthorizationUrl() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const status = String(info.getAuthorizationStatus());
    const url = info.getAuthorizationUrl();
    Logger.log('AuthStatus: ' + status + ' | AuthUrl: ' + (url || '(authorized แล้ว ไม่มี URL)'));
    return { success: true, status: status, url: url || '' };
  } catch (e) {
    Logger.log('AUTH CHECK FAILED: ' + e.toString());
    return { success: false, message: e.toString() };
  }
}

function getDownloadFiles() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const downloadSheet = ss.getSheetByName(SHEET_DOWNLOAD);
    if (!downloadSheet) return { success: true, files: [] };

    const lastRow = downloadSheet.getLastRow();
    if (lastRow <= 1) return { success: true, files: [] };

    // Headers: ชื่อไฟล์, ขนาดไฟล์, วันที่อัปเดตล่าสุด, File ID, Download URL, ชนิดไฟล์
    ensureDownloadHeader_(downloadSheet);

    const data = downloadSheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();

    const files = [];
    const backfill = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const fileName = String(row[0] || '').trim();
      const fileSize = String(row[1] || '').trim();
      const updatedDate = String(row[2] || '').trim();
      const fileId = String(row[3] || '').trim();
      const downloadUrl = String(row[4] || '').trim();
      let fileType = String(row[5] || '').trim();

      if (fileName && fileId) {
        // แถวเก่าที่ยังไม่มีชนิดไฟล์: ดึงจาก Google Drive แล้วบันทึกกลับลงชีต
        if (!fileType) {
          try {
            fileType = DriveApp.getFileById(fileId).getMimeType() || '';
            if (fileType) backfill.push({ rowIndex: i + 2, mimeType: fileType });
          } catch (ignoreBackfill) { /* ไฟล์อาจถูกลบหรือไม่มีสิทธิ์ */ }
        }

        files.push({
          fileName: fileName,
          fileSize: fileSize,
          updatedDate: updatedDate,
          fileId: fileId,
          fileType: fileType,
          // ลิงก์เปิด/ดาวน์โหลดไฟล์แบบเดียวกับที่เก็บในชีต (ถ้ามี) หรือสร้างจาก File ID
          fileUrl: downloadUrl || ('https://lh3.googleusercontent.com/d/' + fileId)
        });
      }
    }

    if (backfill.length) {
      try {
        backfill.forEach(function (item) {
          downloadSheet.getRange(item.rowIndex, 6).setValue(item.mimeType);
        });
      } catch (ignoreWrite) { /* ignore */ }
    }

    return { success: true, files: files };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// เตรียมหัวตารางชีต download (เพิ่มคอลัมน์ "ชนิดไฟล์" ให้ชีตเดิมโดยไม่กระทบข้อมูล)
function ensureDownloadHeader_(downloadSheet) {
  const headers = ['ชื่อไฟล์', 'ขนาดไฟล์', 'วันที่อัปเดตล่าสุด', 'File ID', 'Download URL', 'ชนิดไฟล์'];
  const current = downloadSheet.getRange(1, 1, 1, headers.length).getValues()[0];
  for (let i = 0; i < headers.length; i++) {
    if (String(current[i] || '').trim() !== headers[i]) {
      downloadSheet.getRange(1, i + 1).setValue(headers[i]);
    }
  }
}

// Resolve MIME type from a file name's extension (the MimeType enum has no fromExtension method)
function getMimeTypeByFileName_(fileName) {
  const ext = String(fileName || '').split('.').pop().toLowerCase();
  const map = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    zip: 'application/zip',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'text/javascript'
  };
  return map[ext] || 'application/octet-stream';
}

function saveDownloadFile(fileId, fileName, base64Data, originalFileName, mimeType) {
  try {
    // Check Drive access first
    let folder;
    try {
      folder = DriveApp.getFolderById(DOWNLOAD_FOLDER_ID);
    } catch (e) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง Google Drive กรุณาอนุญาตเข้าถึง Drive ก่อนใช้งานฟีเจอร์นี้ (' + e.toString() + ')' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let downloadSheet = ss.getSheetByName(SHEET_DOWNLOAD);
    if (!downloadSheet) {
      downloadSheet = ss.insertSheet(SHEET_DOWNLOAD);
      downloadSheet.appendRow(['ชื่อไฟล์', 'ขนาดไฟล์', 'วันที่อัปเดตล่าสุด', 'File ID', 'Download URL', 'ชนิดไฟล์']);
    }
    ensureDownloadHeader_(downloadSheet);

    let file;
    let fileSize;
    let fileType;
    let downloadUrl;

    // ใช้ชนิดไฟล์ที่เบราว์เซอร์ตรวจได้ก่อน ถ้าไม่มีจึงเดาจากนามสกุล
    const resolvedMime = mimeType || getMimeTypeByFileName_(originalFileName || fileName);

    if (fileId) {
      // Update existing file
      file = DriveApp.getFileById(fileId);
      if (base64Data) {
        // Upload new file content
        const decoded = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decoded, resolvedMime, originalFileName);
        file.setContent(blob);
      } else {
        // Update only name
        file.setName(fileName);
      }
      downloadUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    } else {
      // Create new file
      const decoded = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decoded, resolvedMime, fileName);
      file = folder.createFile(blob);
      fileId = file.getId();
      downloadUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    }

    fileSize = file.getSize();
    try {
      fileType = file.getMimeType() || resolvedMime;
    } catch (ignoreMime) {
      fileType = resolvedMime;
    }

    // Allow anyone with the link to download the file
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareError) {
      // Ignore sharing errors (e.g. not the file owner); the file is still saved
    }

    // Update or add to sheet
    const lastRow = downloadSheet.getLastRow();
    let existingRowIndex = -1;

    if (lastRow > 1) {
      const fileIds = downloadSheet.getRange(2, 4, lastRow - 1, 1).getValues();
      for (let i = 0; i < fileIds.length; i++) {
        if (String(fileIds[i][0]) === fileId) {
          existingRowIndex = i + 2;
          break;
        }
      }
    }

    const now = new Date();
    const updatedDate = Utilities.formatDate(now, ss.getSpreadsheetTimeZone(), 'dd/MM/yyyy HH:mm');

    if (existingRowIndex > 0) {
      // Update existing row
      downloadSheet.getRange(existingRowIndex, 1, 1, 6).setValues([
        [fileName, fileSize, updatedDate, fileId, downloadUrl, fileType]
      ]);
    } else {
      // Add new row
      downloadSheet.appendRow([fileName, fileSize, updatedDate, fileId, downloadUrl, fileType]);
    }

    return { success: true, fileId: fileId };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function deleteDownloadFile(fileId) {
  try {
    // Check Drive access first
    try {
      const file = DriveApp.getFileById(fileId);
    } catch (e) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง Google Drive กรุณาอนุญาตเข้าถึง Drive ก่อนใช้งานฟีเจอร์นี้' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const downloadSheet = ss.getSheetByName(SHEET_DOWNLOAD);
    if (!downloadSheet) return { success: false, message: 'ไม่พบชีต download' };

    // Delete from Drive
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    // Delete from sheet
    const lastRow = downloadSheet.getLastRow();
    if (lastRow > 1) {
      const fileIds = downloadSheet.getRange(2, 4, lastRow - 1, 1).getValues();
      for (let i = 0; i < fileIds.length; i++) {
        if (String(fileIds[i][0]) === fileId) {
          downloadSheet.deleteRow(i + 2);
          break;
        }
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}




