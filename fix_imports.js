const fs = require('fs');
const path = require('path');

const mappings = {
    'adminService': 'admin',
    'feeService': 'fee',
    'activityLogService': 'activityLog',
    'bannerService': 'banner',
    'complexService': 'complex',
    'guestService': 'guest',
    'panicService': 'panic',
    'newsService': 'news',
    'laporanService': 'laporan',
    'iuranService': 'iuran',
    'notificationService': 'notification',
    'notificationSettingsService': 'notification',
    'paymentConfirmationService': 'payment',
    'paymentMethodService': 'payment',
    'receiptService': 'payment'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Skip node_modules and the new service folders themselves
            if (file === 'node_modules' || file === '.expo') continue;
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            for (const [oldService, newFolder] of Object.entries(mappings)) {
                // Match patterns like: services/newsService' or services/newsService"
                const regex = new RegExp(`(services/)${oldService}(['";])`, 'g');
                if (regex.test(content)) {
                    content = content.replace(new RegExp(`(services/)${oldService}(['";])`, 'g'), `$1${newFolder}$2`);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

const srcDir = path.join(__dirname, 'src');
console.log('Processing directory:', srcDir);
processDirectory(srcDir);
console.log('Done updating imports.');
