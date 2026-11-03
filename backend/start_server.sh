#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login debian -- bash -c "cd /data/data/com.termux/files/home/LISTOAPP_WEB/backend && node dist/server.js"
