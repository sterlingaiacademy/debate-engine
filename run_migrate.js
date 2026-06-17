const { Client: SSH } = require('ssh2');
const ExcelJS = require('exceljs');
const path = require('path');

const password = 'wvpi2!ZnTcV];ncy';
const script = `PGPASSWORD='Pck/aawJlsLFZxWu3CG7aw==' psql -h localhost -U graceandforce_user -d graceandforce_db -t -A -F'|' -c "SET search_path TO gforce; SELECT code, school_name, plan, is_used, to_char(expires_at AT TIME ZONE 'Asia/Kolkata', 'DD-Mon-YYYY') FROM school_coupons WHERE school_name = 'Labour India Public School' ORDER BY id ASC;" 2>&1`;

const conn = new SSH();
let output = '';

conn.on('ready', () => {
  conn.exec(script, (err, stream) => {
    if (err) { conn.end(); return; }
    stream.on('data', d => output += d.toString())
      .on('close', async () => {
        conn.end();
        const lines = output.trim().split('\n').filter(l => l.trim() && !l.startsWith('SET'));

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('School Codes');

        sheet.columns = [
          { header: '#',            key: 'num',    width: 6 },
          { header: 'Code',         key: 'code',   width: 24 },
          { header: 'Plan',         key: 'plan',   width: 10 },
          { header: 'School',       key: 'school', width: 30 },
          { header: 'Status',       key: 'status', width: 12 },
          { header: 'Valid Until',  key: 'expiry', width: 18 },
          { header: 'How to Redeem', key: 'howto', width: 55 },
        ];

        const header = sheet.getRow(1);
        header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        header.alignment = { vertical: 'middle', horizontal: 'center' };
        header.height = 22;

        lines.forEach((line, i) => {
          const cols = line.split('|');
          const isUsed = cols[3] === 't';
          const row = sheet.addRow({
            num: i + 1,
            code: cols[0],
            plan: (cols[2] || 'pro').toUpperCase(),
            school: cols[1],
            status: isUsed ? 'Used ✓' : 'Available',
            expiry: cols[4],
            howto: 'G-Force app → Dashboard → ENTER CODE → Paste code → APPLY',
          });
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFF5F3FF' : 'FFFFFFFF' } };
          row.getCell('code').font = { bold: true, family: 2, color: { argb: 'FF6D28D9' } };
          const statusCell = row.getCell('status');
          statusCell.font = { bold: true, color: { argb: isUsed ? 'FF16A34A' : 'FFDC2626' } };
        });

        sheet.autoFilter = { from: 'A1', to: 'G1' };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Instructions sheet
        const instrSheet = workbook.addWorksheet('Instructions for School');
        instrSheet.getColumn(1).width = 72;
        [
          ['G-Force AI — School Coupon Codes'],
          [''],
          ['School: Labour India Public School'],
          ['Plan: PRO'],
          [`Total Codes: ${lines.length}`],
          [`Valid Until: ${lines[0]?.split('|')[4] || '08-Jul-2026'}`],
          [''],
          ['HOW STUDENTS REDEEM THEIR CODE:'],
          ['1. Open the G-Force app at graceandforce.com'],
          ['2. Log in or create a student account'],
          ['3. On the Dashboard, click "Redeem" / "ENTER CODE"'],
          ['4. Type or paste your unique code (e.g. GFPRO-XXXX-XXXX)'],
          ['5. Click APPLY — your plan upgrades instantly to PRO!'],
          [''],
          ['IMPORTANT RULES:'],
          ['- Each code works for ONE account only'],
          ['- Do NOT share your code with others'],
          [`- Codes expire on ${lines[0]?.split('|')[4] || '08-Jul-2026'}`],
          ['- For help, contact support@graceandforce.com'],
        ].forEach((l, i) => {
          const row = instrSheet.addRow(l);
          if (i === 0) row.font = { bold: true, size: 14, color: { argb: 'FF6D28D9' } };
          if (l[0]?.startsWith('HOW') || l[0]?.startsWith('IMPORTANT')) row.font = { bold: true, size: 11 };
        });

        const outPath = path.join(__dirname, 'school_codes_Labour_India_Public_School_pro.xlsx');
        await workbook.xlsx.writeFile(outPath);
        console.log(`✅ Excel saved: ${outPath}`);
        console.log(`Total codes: ${lines.length}`);
      });
  });
}).on('error', e => console.error(e))
  .connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password });
