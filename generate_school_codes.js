/**
 * School Coupon Generator
 * Usage: node generate_school_codes.js <schoolName> <count> <plan> <expiryDays>
 * Example: node generate_school_codes.js "DPS Bangalore" 20 pro 365
 */

const { Client: SSH } = require('ssh2');
const ExcelJS = require('exceljs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_SECRET = 'gforce_admin_2026';
const API_BASE = 'https://graceandforce.com';

const args = process.argv.slice(2);
const schoolName = args[0] || 'Demo School';
const count = parseInt(args[1]) || 20;
const plan = (args[2] || 'pro').toLowerCase();
const expiryDays = parseInt(args[3]) || 365;

(async () => {
  console.log(`\n🏫 Generating ${count} ${plan.toUpperCase()} codes for "${schoolName}"...`);
  console.log(`   Expiry: ${expiryDays} days from today\n`);

  try {
    const res = await fetch(`${API_BASE}/api/admin/generate-school-coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: ADMIN_SECRET, schoolName, plan, count, expiryDays })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('❌ Error:', data.error || 'Unknown error');
      process.exit(1);
    }

    const { codes, batchId, expiresAt } = data;
    console.log(`✅ Generated ${codes.length} codes`);
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   Expires : ${new Date(expiresAt).toLocaleDateString('en-IN')}\n`);

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('School Codes');

    sheet.columns = [
      { header: '#',           key: 'num',    width: 6 },
      { header: 'Code',        key: 'code',   width: 22 },
      { header: 'Plan',        key: 'plan',   width: 10 },
      { header: 'School',      key: 'school', width: 28 },
      { header: 'Status',      key: 'status', width: 12 },
      { header: 'Valid Until', key: 'expiry', width: 18 },
      { header: 'How to Redeem', key: 'howto', width: 50 },
    ];

    // Style header
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    header.alignment = { vertical: 'middle', horizontal: 'center' };
    header.height = 22;

    const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    codes.forEach((code, i) => {
      const row = sheet.addRow({
        num: i + 1,
        code,
        plan: plan.toUpperCase(),
        school: schoolName,
        status: 'Unused',
        expiry: expiryFormatted,
        howto: 'Open G-Force app → Settings → Redeem School Code → Enter code → Click Activate'
      });
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFEFF6FF' : 'FFFFFFFF' } };
      row.getCell('code').font = { bold: true, family: 2, color: { argb: 'FF1D4ED8' } };
      row.getCell('status').font = { bold: true, color: { argb: 'FFEF4444' } };
    });

    sheet.autoFilter = { from: 'A1', to: 'G1' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Instructions sheet
    const instrSheet = workbook.addWorksheet('Instructions for School');
    instrSheet.getColumn(1).width = 70;
    const lines = [
      ['G-Force School Coupon Codes'],
      [''],
      [`School: ${schoolName}`],
      [`Plan: ${plan.toUpperCase()}`],
      [`Total Codes: ${codes.length}`],
      [`Valid Until: ${expiryFormatted}`],
      [`Batch ID: ${batchId}`],
      [''],
      ['HOW STUDENTS REDEEM THEIR CODE:'],
      ['1. Open the G-Force app (graceandforce.com)'],
      ['2. Log in or create an account'],
      ['3. Go to Settings (bottom left menu)'],
      ['4. Scroll down to "Redeem School Code" section'],
      ['5. Enter your unique code (e.g. GFPRO-A3X9-K2M7)'],
      ['6. Click "Activate" — your plan upgrades instantly!'],
      [''],
      ['IMPORTANT:'],
      ['- Each code is single-use (one code per student)'],
      ['- Do NOT share codes publicly'],
      [`- Codes expire on ${expiryFormatted}`],
      ['- Contact support@graceandforce.com for help'],
    ];
    lines.forEach((l, i) => {
      const row = instrSheet.addRow(l);
      if (i === 0) row.font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
      if (l[0]?.startsWith('HOW') || l[0]?.startsWith('IMPORTANT')) row.font = { bold: true, size: 11 };
    });

    const safeName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    const outFile = path.join(__dirname, `school_codes_${safeName}_${plan}.xlsx`);
    await workbook.xlsx.writeFile(outFile);

    console.log(`📁 Excel saved: ${outFile}`);
    console.log(`\n🎉 Share this file with ${schoolName}. Each student gets one unique code.\n`);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
