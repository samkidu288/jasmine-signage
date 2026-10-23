# Panduan Lengkap Deploy Jasmine Digital Signage ke VPS

Panduan ini ditujukan untuk **samkidu288** dalam melakukan upload melalui GitHub dan menjalankan aplikasi di VPS Ubuntu/Debian menggunakan **Port 3007** (berada di atas port 3006 yang sedang aktif).

---

## 📋 Ringkasan Konfigurasi

| Parameter | Nilai |
| :--- | :--- |
| **Akun GitHub** | `samkidu288` |
| **Port Internal VPS** | `3007` (bebas bentrok dengan port 3006) |
| **Domain TV Player** | `signage.jasminelaundry.my.id` |
| **Domain Admin CMS** | `adminsignage.jasminelaundry.my.id` |
| **Runtime & Process** | Node.js (v18+) & PM2 |
| **Web Server Proxy** | Nginx Reverse Proxy + SSL Let's Encrypt |

---

## 🚀 Langkah 1: Push Project ke GitHub (samkidu288)

1. Buat repository baru di akun GitHub Anda: **`https://github.com/new`**
   - Nama repo disarankan: `jasmine-signage` (Private atau Public).
2. Di komputer lokal Anda (folder project ini):
   ```bash
   git init
   git add .
   git commit -m "feat: digital signage jasmine laundry port 3007"
   git branch -M main
   git remote add origin https://github.com/samkidu288/jasmine-signage.git
   git push -u origin main
   ```

---

## 🖥️ Langkah 2: Masuk ke VPS & Siapkan Direktori

1. **Login ke VPS via SSH**:
   ```bash
   ssh root@IP_VPS_ANDA
   ```

2. **Pastikan Node.js (v18+ atau v20+) dan Git Terinstall**:
   ```bash
   node -v
   npm -v
   git --version
   ```
   *(Jika belum ada Node.js v20, install dengan: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`)*

3. **Install PM2 secara global** (jika belum pernah):
   ```bash
   npm install -g pm2
   ```

4. **Clone Repository dari GitHub**:
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/samkidu288/jasmine-signage.git
   cd jasmine-signage
   ```

---

## ⚙️ Langkah 3: Install Dependencies, Konfigurasi & Build

1. **Install seluruh package**:
   ```bash
   npm install
   ```

2. **Buat file `.env`**:
   ```bash
   cp .env.example .env
   ```
   Pastikan isi `.env`:
   ```ini
   PORT=3007
   NODE_ENV=production
   APP_URL="https://adminsignage.jasminelaundry.my.id"
   ```

3. **Build Frontend**:
   ```bash
   npm run build
   ```
   *(Perintah ini akan membuat folder `dist/` yang siap disajikan cepat oleh server Express).*

---

## ⚡ Langkah 4: Jalankan Aplikasi Menggunakan PM2 (Port 3007)

Aplikasi telah dilengkapi file **`ecosystem.config.cjs`** yang otomatis mengonfigurasi Port 3007 dan mode production.

1. **Start aplikasi dengan PM2**:
   ```bash
   pm2 start ecosystem.config.cjs
   ```

2. **Cek status aplikasi**:
   ```bash
   pm2 status
   ```
   *(Pastikan status `jasmine-signage` adalah **online**).*

3. **Tes endpoint internal dari VPS**:
   ```bash
   curl http://localhost:3007/api/health
   ```
   *(Harus mengembalikan respon: `{"status":"ok",...}`)*

4. **Simpan konfigurasi PM2 agar otomatis jalan saat VPS reboot**:
   ```bash
   pm2 save
   pm2 startup
   ```
   *(Salin dan jalankan baris perintah `sudo env PATH...` yang diberikan oleh PM2 jika ada).*

---

## 🌐 Langkah 5: Konfigurasi DNS Domain

Di panel DNS domain Anda (Cloudflare / Niagahoster / IDCloudHost / cPanel):
- Buat **A Record**:
  - `signage.jasminelaundry.my.id` &rarr; `IP_VPS_ANDA`
  - `adminsignage.jasminelaundry.my.id` &rarr; `IP_VPS_ANDA`

---

## 🛡️ Langkah 6: Konfigurasi Nginx Reverse Proxy (Port 3007)

1. **Buat file konfigurasi Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/jasminesignage
   ```

2. **Tempel konfigurasi berikut**:
   ```nginx
   server {
       listen 80;
       server_name signage.jasminelaundry.my.id adminsignage.jasminelaundry.my.id;

       # Batas upload file video & gambar besar
       client_max_body_size 100M;

       location / {
           proxy_pass http://127.0.0.1:3007;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Aktifkan konfigurasi & reload Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/jasminesignage /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 🔒 Langkah 7: Pasang SSL HTTPS (Let's Encrypt / Certbot)

Jalankan perintah Certbot:
```bash
sudo certbot --nginx -d signage.jasminelaundry.my.id -d adminsignage.jasminelaundry.my.id
```
Pilih opsi **Redirect HTTP ke HTTPS (opsi 2)**. Certbot akan otomatis mengupdate file Nginx Anda dengan sertifikat SSL resmi yang aktif dan diperbarui otomatis.

---

## 📺 Langkah 8: Konfigurasi di Android TV (Browser TVBro)

1. Buka **Google Play Store** di Android TV, instal browser **TVBro**.
2. Masukkan alamat: **`https://signage.jasminelaundry.my.id`**
3. Tekan tombol **Menu** pada remote TV:
   - Pilih **Fullscreen (Layar Penuh)**.
   - Atur halaman sebagai **Homepage** agar saat TVBro dibuka langsung memutar signage.
4. Klik tombol **"Mulai & Aktifkan Suara TV"** (atau tekan tombol OK remote 1x) untuk mengaktifkan pemutaran audio backsound.
5. Selesai! TV akan menampilkan playlist video dan gambar secara looping, dengan auto-mute cerdas saat video berputar dan teks berjalan di bagian bawah.

---

## 🔄 Cara Update Kode di Kemudian Hari

Jika ada perubahan kode dari GitHub:
```bash
cd /var/www/jasmine-signage
git pull origin main
npm install
npm run build
pm2 restart jasmine-signage
```
