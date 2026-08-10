const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`sudo -u postgres psql -d graceandforce_db -c "UPDATE users SET school_id = NULL, olympiad_registered = false, \\"classLevel\\" = NULL, age = NULL, parent_name = NULL, parent_phone = NULL WHERE username = 'hananphashim1' RETURNING email;"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({ host: '65.20.85.75', port: 22, username: 'graceandforce', password: 'wvpi2!ZnTcV];ncy' });
