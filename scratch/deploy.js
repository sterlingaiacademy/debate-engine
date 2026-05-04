const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const path = require('path');

const config = {
  host: '65.20.85.75',
  port: 22,
  username: 'graceandforce',
  password: 'wvpi2!ZnTcV];ncy',
  readyTimeout: 20000
};

const backendDir = path.resolve(__dirname, '../backend');
const setupScript = path.resolve(__dirname, '../vultr-setup.sh');
const nginxConf = path.resolve(__dirname, '../nginx-graceandforce.conf');

async function deploy() {
  const sftp = new SftpClient();
  const ssh = new Client();

  try {
    console.log('Connecting via SFTP...');
    await sftp.connect(config);
    
    console.log('Creating directories...');
    await executeSsh(ssh, config, 'sudo mkdir -p /var/www/grace-and-force/backend && sudo chown -R graceandforce:graceandforce /var/www');

    console.log('Uploading backend folder...');
    await sftp.uploadDir(backendDir, '/var/www/grace-and-force/backend');
    
    console.log('Uploading setup scripts...');
    await sftp.fastPut(setupScript, '/var/www/grace-and-force/vultr-setup.sh');
    await sftp.fastPut(nginxConf, '/var/www/grace-and-force/nginx-graceandforce.conf');

    console.log('Executing setup script...');
    // We pipe the password to sudo -S
    const setupCmd = `echo "${config.password}" | sudo -S bash /var/www/grace-and-force/vultr-setup.sh`;
    await executeSsh(ssh, config, setupCmd, true);

    console.log('Setting up Nginx...');
    const nginxCmd = `
      echo "${config.password}" | sudo -S cp /var/www/grace-and-force/nginx-graceandforce.conf /etc/nginx/sites-available/graceandforce
      echo "${config.password}" | sudo -S ln -sf /etc/nginx/sites-available/graceandforce /etc/nginx/sites-enabled/
      echo "${config.password}" | sudo -S nginx -t
      echo "${config.password}" | sudo -S systemctl reload nginx
    `;
    await executeSsh(ssh, config, nginxCmd, true);

    console.log('=== DEPLOYMENT COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Deployment Error:', err);
  } finally {
    await sftp.end();
  }
}

function executeSsh(sshClient, sshConfig, command, printOutput = false) {
  return new Promise((resolve, reject) => {
    // If not already connected
    sshClient.on('ready', () => {
      sshClient.exec(command, { pty: true }, (err, stream) => {
        if (err) return reject(err);
        
        let out = '';
        stream.on('close', (code, signal) => {
          sshClient.end();
          if (code !== 0) reject(new Error(`Command failed with code ${code}. Output: ${out}`));
          else resolve(out);
        }).on('data', (data) => {
          out += data.toString();
          if (printOutput) process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          out += data.toString();
          if (printOutput) process.stderr.write(data.toString());
        });
      });
    }).on('error', reject).connect(sshConfig);
  });
}

deploy();
