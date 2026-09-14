const SHEET_NAME = "Hasil";
const NUM_QUESTIONS = 10; // jumlah soal uraian (identik untuk pretes & postes)

const SHEET_NAME_LKPD = "LKPD";
const MAX_UJICOBA = 5; // batas maksimal kolom Uji Coba yang disediakan di sheet

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (data.action === "lkpd") {
      return saveLkpd_(data);
    }

    return savePretestPosttest_(data);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function savePretestPosttest_(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    const headers = buildHeaders_();
    ensureHeaders_(sheet, headers);

    const sessionId = String(data.sessionId || "");
    if (!sessionId) return json_({ ok: false, message: "Session ID kosong" });

    const lastCol = headers.length;
    const row = findSessionRow_(sheet, sessionId);

    if (row === -1) {
      // ============ BARIS BARU (biasanya dari Pretest) ============
      const rowValues = new Array(lastCol).fill("");
      rowValues[0] = new Date();
      rowValues[1] = sessionId;
      rowValues[2] = data.nama || "";
      rowValues[3] = data.email || "";

      if (data.action === "pretest" && Array.isArray(data.pretestAnswers)) {
        writeAnswers_(rowValues, data.pretestAnswers, 4); // kolom E (index 4) = Jawaban Pretes No1
      }
      if (data.action === "posttest" && Array.isArray(data.postestAnswers)) {
        // Berjaga-jaga kalau posttest dikirim duluan tanpa sesi pretest sebelumnya
        writeAnswers_(rowValues, data.postestAnswers, 25); // kolom Z (index 25) = Jawaban Postes No1
      }

      const newRowNum = sheet.getLastRow() + 1;
      sheet.getRange(newRowNum, 1, 1, lastCol).setValues([rowValues]);
      writeTotalFormulas_(sheet, newRowNum);
    } else {
      // ============ BARIS SUDAH ADA (update, biasanya dari Posttest) ============
      const values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
      values[0] = new Date();
      if (data.nama) values[2] = data.nama;
      if (data.email) values[3] = data.email;

      if (data.action === "pretest" && Array.isArray(data.pretestAnswers)) {
        writeAnswers_(values, data.pretestAnswers, 4);
      }
      if (data.action === "posttest" && Array.isArray(data.postestAnswers)) {
        writeAnswers_(values, data.postestAnswers, 25);
      }

      sheet.getRange(row, 1, 1, lastCol).setValues([values]);
      writeTotalFormulas_(sheet, row);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Susunan kolom (1-indexed):
 * 1  Timestamp
 * 2  Session ID
 * 3  Nama Peserta Didik
 * 4  Email
 * 5..24   Jawaban Pretes No1..No10 berselang-seling dengan Skor Pretes No1..No10 (1-4, diisi manual oleh guru)
 * 25 Total Skor Pretes (0-100) -> otomatis (formula), terisi begitu skor per soal diisi guru
 * 26..45  Jawaban Postes No1..No10 berselang-seling dengan Skor Postes No1..No10 (1-4, diisi manual oleh guru)
 * 46 Total Skor Postes (0-100) -> otomatis (formula)
 */
function buildHeaders_() {
  const headers = ["Timestamp", "Session ID", "Nama Peserta Didik", "Email"];

  for (let i = 1; i <= NUM_QUESTIONS; i++) {
    headers.push("Jawaban Pretes No" + i);
    headers.push("Skor Pretes No" + i + " (1-4)");
  }
  headers.push("Total Skor Pretes (0-100)");

  for (let i = 1; i <= NUM_QUESTIONS; i++) {
    headers.push("Jawaban Postes No" + i);
    headers.push("Skor Postes No" + i + " (1-4)");
  }
  headers.push("Total Skor Postes (0-100)");

  return headers;
}

/**
 * Menulis jawaban esai ke dalam array baris (0-indexed).
 * startIdx0 = index (0-based) kolom "Jawaban No1".
 * Kolom skor (startIdx0 + 1, +3, +5, ...) SENGAJA tidak disentuh
 * supaya skor yang sudah diisi guru sebelumnya tidak ikut tertimpa/hilang.
 */
function writeAnswers_(rowArray, answers, startIdx0) {
  for (let i = 0; i < NUM_QUESTIONS; i++) {
    const idx = startIdx0 + i * 2;
    rowArray[idx] = answers[i] || "";
  }
}

function writeTotalFormulas_(sheet, rowNum) {
  // Kolom skor Pretes: 6, 8, 10, ..., 24 (1-indexed)
  const pretesSkorCols = [];
  for (let i = 0; i < NUM_QUESTIONS; i++) pretesSkorCols.push(6 + i * 2);
  const pretesRefs = pretesSkorCols.map((c) => colLetter_(c) + rowNum).join(",");
  sheet.getRange(rowNum, 25).setFormula(
    '=IF(COUNT(' + pretesRefs + ')=0,"",ROUND(SUM(' + pretesRefs + ')/' + (NUM_QUESTIONS * 4) + '*100,1))'
  );

  // Kolom skor Postes: 27, 29, 31, ..., 45 (1-indexed)
  const postesSkorCols = [];
  for (let i = 0; i < NUM_QUESTIONS; i++) postesSkorCols.push(27 + i * 2);
  const postesRefs = postesSkorCols.map((c) => colLetter_(c) + rowNum).join(",");
  sheet.getRange(rowNum, 46).setFormula(
    '=IF(COUNT(' + postesRefs + ')=0,"",ROUND(SUM(' + postesRefs + ')/' + (NUM_QUESTIONS * 4) + '*100,1))'
  );
}

function colLetter_(colNum) {
  let letter = "";
  while (colNum > 0) {
    const rem = (colNum - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    colNum = Math.floor((colNum - 1) / 26);
  }
  return letter;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }
  // Struktur kolom berubah total (dari pilihan ganda ke uraian),
  // jadi header baris pertama selalu diselaraskan ke struktur terbaru.
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function findSessionRow_(sheet, sessionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === sessionId) return i + 2;
  }
  return -1;
}

/**
 * ==========================================================
 * LKPD (LEMBAR KERJA PESERTA DIDIK) — DIKERJAKAN PER KELOMPOK
 * ==========================================================
 * Susunan kolom (1-indexed):
 * 1  Timestamp
 * 2  Kelompok ID
 * 3  Nama Anggota 1
 * 4  Nama Anggota 2
 * 5  Pertanyaan Pemantik 1
 * 6  Pertanyaan Pemantik 2
 * 7  Fase 1 - Target Daya Listrik Minimal (Watt)
 * 8  Fase 1 - Batasan Biaya Maksimal (Rp)
 * 9  Fase 1 - Batasan Area/Lahan (m2)
 * 10 Fase 2 - Jawaban 1 (jenis pembangkit & alasan)
 * 11 Fase 2 - Jawaban 2 (variabel fisika yang diatur)
 * 12 Fase 3 - PLTB Kecepatan Angin (m/s)
 * 13 Fase 3 - PLTB Jari-jari Rotor (m)
 * 14 Fase 3 - PLTMH Debit Air (m3/s)
 * 15 Fase 3 - PLTMH Ketinggian/Head (m)
 * 16 Fase 3 - PLTS Luas Panel (m2)
 * 17 Fase 3 - PLTS Intensitas Cahaya (W/m2)
 * 18..47 Uji Coba 1..5, masing-masing 6 kolom:
 *        Jenis Pembangkit, Parameter yang Diubah, Daya (Watt), Biaya (Rp), Efisiensi (%), Memenuhi Target
 * 48 Fase 5 - Jawaban 1 (uji coba ke berapa memenuhi kriteria)
 * 49 Fase 5 - Jawaban 2 (kendala uji coba 1 & perbaikannya)
 * 50 Fase 5 - Jawaban 3 (hubungan antar variabel terhadap daya)
 * 51 Fase 6 - Kesimpulan / laporan akhir
 * 52 Refleksi 1 - Tingkat pemahaman
 * 53 Refleksi 2 - Bagian paling menantang
 * 54 Refleksi 3 - Hal baru yang dipelajari
 */
function saveLkpd_(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_LKPD) || ss.insertSheet(SHEET_NAME_LKPD);

    const headers = buildLkpdHeaders_();
    ensureHeaders_(sheet, headers);

    const kelompokId = String(data.kelompokId || "");
    if (!kelompokId) return json_({ ok: false, message: "Kelompok ID kosong" });

    const lastCol = headers.length;
    const rowValues = new Array(lastCol).fill("");

    rowValues[0] = new Date();
    rowValues[1] = kelompokId;
    rowValues[2] = data.anggota1 || "";
    rowValues[3] = data.anggota2 || "";
    rowValues[4] = data.pemantik1 || "";
    rowValues[5] = data.pemantik2 || "";
    rowValues[6] = data.f1Target || "";
    rowValues[7] = data.f1Biaya || "";
    rowValues[8] = data.f1Lahan || "";
    rowValues[9] = data.f2q1 || "";
    rowValues[10] = data.f2q2 || "";
    rowValues[11] = data.f3PltbV || "";
    rowValues[12] = data.f3PltbR || "";
    rowValues[13] = data.f3MhQ || "";
    rowValues[14] = data.f3MhH || "";
    rowValues[15] = data.f3sA || "";
    rowValues[16] = data.f3sG || "";

    const ujiCoba = Array.isArray(data.ujiCoba) ? data.ujiCoba : [];
    for (let i = 0; i < MAX_UJICOBA; i++) {
      const base = 17 + i * 6; // index 0-based kolom "Jenis Pembangkit" Uji Coba ke-(i+1)
      const uc = ujiCoba[i] || {};
      rowValues[base] = uc.jenis || "";
      rowValues[base + 1] = uc.parameter || "";
      rowValues[base + 2] = uc.daya || "";
      rowValues[base + 3] = uc.biaya || "";
      rowValues[base + 4] = uc.efisiensi || "";
      rowValues[base + 5] = uc.target || "";
    }

    rowValues[47] = data.f5q1 || "";
    rowValues[48] = data.f5q2 || "";
    rowValues[49] = data.f5q3 || "";
    rowValues[50] = data.f6kesimpulan || "";
    rowValues[51] = data.refleksi1 || "";
    rowValues[52] = data.refleksi2 || "";
    rowValues[53] = data.refleksi3 || "";

    const row = findGroupRow_(sheet, kelompokId);
    if (row === -1) {
      const newRowNum = sheet.getLastRow() + 1;
      sheet.getRange(newRowNum, 1, 1, lastCol).setValues([rowValues]);
    } else {
      sheet.getRange(row, 1, 1, lastCol).setValues([rowValues]);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function buildLkpdHeaders_() {
  const headers = ["Timestamp", "Kelompok ID", "Nama Anggota 1", "Nama Anggota 2"];

  headers.push("Pertanyaan Pemantik 1", "Pertanyaan Pemantik 2");
  headers.push(
    "F1 - Target Daya Minimal (Watt)",
    "F1 - Batasan Biaya Maksimal (Rp)",
    "F1 - Batasan Area/Lahan (m2)"
  );
  headers.push("F2 - Jenis Pembangkit & Alasan", "F2 - Variabel Fisika yang Diatur");
  headers.push(
    "F3 - PLTB Kecepatan Angin (m/s)",
    "F3 - PLTB Jari-jari Rotor (m)",
    "F3 - PLTMH Debit Air (m3/s)",
    "F3 - PLTMH Ketinggian/Head (m)",
    "F3 - PLTS Luas Panel (m2)",
    "F3 - PLTS Intensitas Cahaya (W/m2)"
  );

  for (let i = 1; i <= MAX_UJICOBA; i++) {
    headers.push(
      "Uji Coba " + i + " - Jenis Pembangkit",
      "Uji Coba " + i + " - Parameter yang Diubah",
      "Uji Coba " + i + " - Daya (Watt)",
      "Uji Coba " + i + " - Biaya (Rp)",
      "Uji Coba " + i + " - Efisiensi (%)",
      "Uji Coba " + i + " - Memenuhi Target"
    );
  }

  headers.push(
    "F5 - Uji Coba yang Memenuhi Kriteria",
    "F5 - Kendala Uji Coba 1 & Perbaikannya",
    "F5 - Hubungan Antar Variabel terhadap Daya"
  );
  headers.push("F6 - Kesimpulan / Laporan Akhir");
  headers.push("Refleksi - Tingkat Pemahaman", "Refleksi - Bagian Paling Menantang", "Refleksi - Hal Baru yang Dipelajari");

  return headers;
}

function findGroupRow_(sheet, kelompokId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === kelompokId) return i + 2;
  }
  return -1;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}