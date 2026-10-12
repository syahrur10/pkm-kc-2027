# WakeLens — AI Drowsiness Detection

Deteksi kantuk real-time lewat kamera (Vite + HTML/CSS/JS murni). Layar berubah warna hijau → kuning → merah, berbunyi dan bergetar, lalu
**Bot WakeLens** memandu aksi anti-kantuk (minum air, peregangan, napas, istirahat) lengkap dengan timer.

```bash
npm install && npm run dev     # http://localhost:5173 (kamera butuh localhost/HTTPS)
npm run build                  # dist/ siap deploy ke Vercel
```

## Metode (untuk laporan PKM-KC)
| Indikator | Fungsi |
|---|---|
| EAR (Eye Aspect Ratio) | rasio bukaan mata; turun saat mata menutup |
| PERCLOS | persentase waktu mata tertutup dalam 30 detik |
| MAR (Mouth Aspect Ratio) | mendeteksi menguap |
| Head pitch | mendeteksi kepala terkulai/mengangguk |
Keempatnya digabung menjadi **indeks kantuk 0–100** (<35 fokus, 35–70 waspada, ≥70 ngantuk). Kalibrasi otomatis 3 detik menyesuaikan tiap pengguna.
Model: MediaPipe Face Landmarker (478 titik, jalan di browser, tanpa server). Sensitivitas diatur lewat dropdown atau objek `SENS` di `src/main.js`.
Isi tips: `src/tips.js`. Riwayat sesi tersimpan di `localStorage` (`wakelens.sessions`).

## Jadikan APK (Capacitor)
```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init WakeLens com.contoh.wakelens --web-dir=dist
npm run build && npx cap add android && npx cap sync && npx cap open android
```
Tambahkan `<uses-permission android:name="android.permission.CAMERA" />` di `AndroidManifest.xml`. Cara tercepat: deploy ke Vercel, buka di Chrome HP, "Tambahkan ke layar utama" (PWA).
