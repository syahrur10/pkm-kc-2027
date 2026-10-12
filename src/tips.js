/** tips.js — pustaka aksi anti-kantuk. Tambah/ubah objek di sini. */
export const CATS = ['Semua', 'Minum', 'Gerak', 'Napas', 'Mata', 'Lingkungan', 'Istirahat'];
export const ACTIONS = [
  { id: 'air', cat: 'Minum', icon: '💧', title: 'Minum air putih', sec: 30, why: 'Dehidrasi ringan saja sudah menurunkan konsentrasi.', steps: ['Ambil segelas air putih (±250 ml).', 'Minum perlahan sampai habis.', 'Tarik napas dalam 3 kali.'] },
  { id: 'muka', cat: 'Minum', icon: '🚿', title: 'Cuci muka air dingin', sec: 60, why: 'Rasa dingin memicu sistem saraf simpatis sehingga lebih terjaga.', steps: ['Cuci muka dengan air dingin 20 detik.', 'Basuh juga tengkuk dan pergelangan tangan.', 'Keringkan dan duduk tegak.'] },
  { id: 'leher', cat: 'Gerak', icon: '🙆', title: 'Peregangan leher & bahu', sec: 60, why: 'Gerakan melancarkan aliran darah ke otak.', steps: ['Miringkan kepala ke kanan, tahan 10 detik.', 'Ganti ke kiri, tahan 10 detik.', 'Putar bahu ke belakang 10 kali.', 'Tekuk leher pelan ke depan dan belakang.'] },
  { id: 'jalan', cat: 'Gerak', icon: '🚶', title: 'Jalan kaki 3 menit', sec: 180, why: 'Berjalan menaikkan detak jantung dan suplai oksigen.', steps: ['Berdiri, tinggalkan kursi.', 'Jalan cepat keliling ruangan atau naik-turun tangga.', 'Ayunkan lengan dan buka dada.'] },
  { id: 'jj', cat: 'Gerak', icon: '🤸', title: 'Jumping jack 30 detik', sec: 30, why: 'Olahraga singkat intensitas tinggi cepat membangunkan tubuh.', steps: ['Berdiri tegak, kaki rapat.', 'Lompat sambil buka kaki dan angkat tangan.', 'Lakukan sekitar 20 kali.'] },
  { id: 'napas', cat: 'Napas', icon: '🌬️', title: 'Napas 4-4-6', sec: 60, why: 'Napas dalam menambah oksigen dan menenangkan fokus.', steps: ['Tarik napas lewat hidung 4 hitungan.', 'Tahan 4 hitungan.', 'Buang lewat mulut 6 hitungan.', 'Ulangi 5 kali.'] },
  { id: 'mata', cat: 'Mata', icon: '👀', title: 'Aturan 20-20-20', sec: 20, why: 'Mengistirahatkan otot mata yang lelah menatap layar.', steps: ['Lihat benda sejauh ±6 meter.', 'Tahan 20 detik.', 'Kedipkan mata 10 kali pelan-pelan.'] },
  { id: 'pijat', cat: 'Mata', icon: '💆', title: 'Pijat wajah & telinga', sec: 45, why: 'Stimulasi ringan meningkatkan kewaspadaan.', steps: ['Tepuk-tepuk pipi dengan lembut.', 'Pijat pelipis memutar 10 kali.', 'Tarik pelan daun telinga ke bawah 10 kali.'] },
  { id: 'udara', cat: 'Lingkungan', icon: '🪟', title: 'Cari udara & cahaya', sec: 60, why: 'Ruang pengap dan redup membuat otak mengira waktunya tidur.', steps: ['Buka jendela atau pindah ke tempat terang.', 'Naikkan kecerahan lampu ruangan.', 'Turunkan suhu atau nyalakan kipas.'] },
  { id: 'snack', cat: 'Lingkungan', icon: '🍎', title: 'Camilan ringan', sec: 120, why: 'Buah atau kacang memberi energi stabil, tidak seperti gula berlebih.', steps: ['Pilih buah, kacang, atau yoghurt.', 'Hindari manis berlebihan dan makanan berat.', 'Makan pelan sambil berdiri.'] },
  { id: 'nap', cat: 'Istirahat', icon: '😴', title: 'Power nap 15 menit', sec: 900, why: 'Tidur singkat memulihkan kewaspadaan tanpa membuat pusing.', steps: ['Cari tempat tenang dan nyaman.', 'Pasang alarm 15 menit, jangan lebih.', 'Pejamkan mata, rileks.', 'Setelah bangun, minum air dan regangkan badan.'] },
];
export const MSG = {
  idle: 'Saya jaga matamu. Kalau mulai ngantuk, saya pandu apa yang harus dilakukan.',
  fokus: 'Kamu masih segar. Pertahankan!', waspada: 'Matamu mulai berat. Tegakkan badan dan tarik napas dalam.',
  noface: 'Wajahmu belum terlihat. Hadap kamera dan pastikan cahaya cukup.',
  hydrate: 'Sudah 20 menit. Waktunya minum air dan lihat objek jauh sebentar.',
  berat: 'Kamu sudah berulang kali ngantuk. Istirahat atau tidur sebentar lebih efektif daripada memaksa lanjut.',
};
