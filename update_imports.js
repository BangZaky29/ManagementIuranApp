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
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            for (const [oldService, newFolder] of Object.entries(mappings)) {
                const regex = new RegExp(`services/${oldService}`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, `services/${newFolder}`);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory('./src');
console.log("Done updating imports.");
