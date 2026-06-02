# AGENTS.md

Panduan ini berlaku untuk seluruh file di repository ini. Ikuti instruksi ini saat bekerja sebagai AI agent atau coding assistant di project ini.

## Bahasa Komunikasi

- Gunakan Bahasa Indonesia untuk penjelasan, ringkasan, komentar kerja, dan final response.
- Technical term seperti build, dependency, migration, component, dan route boleh tetap memakai Bahasa Inggris jika lebih jelas.
- Code, command, nama file, dan output terminal tetap sesuai bahasa aslinya.

## Tech Stack Project

- Backend: Laravel 13, PHP 8.3+
- Frontend: Inertia.js, React 18, Vite 8
- Styling: Tailwind CSS, `@tailwindcss/forms`
- Auth/scaffold: Laravel Breeze + Inertia
- Testing: PHPUnit
- Package manager: npm dan Composer

## Prinsip Kerja

- Jangan mengubah file tanpa membaca konteks terkait terlebih dahulu.
- Jangan melakukan refactor besar jika user hanya meminta fix kecil.
- Jangan mengubah dependency tanpa alasan jelas dan tanpa menjelaskan dampaknya.
- Jangan commit, push, merge, atau membuat branch kecuali diminta eksplisit oleh user.
- Jangan menjalankan command destruktif seperti `git reset --hard`, `git clean -fd`, atau menghapus perubahan user tanpa izin.
- Jangan commit file rahasia seperti `.env`, credential, token, key, atau file lokal editor.

## Dependency dan Lockfile

- Untuk setup dari clone baru, prioritaskan `composer install` dan `npm ci` jika `package-lock.json` sudah valid.
- Jika dependency berubah, update `package.json` dan `package-lock.json` bersama-sama.
- Jangan gunakan `npm install --force` atau `npm install --legacy-peer-deps` sebagai fix permanen.
- `--legacy-peer-deps` hanya boleh dipakai sebagai workaround lokal sementara dan jangan commit lockfile hasilnya tanpa persetujuan tim.
- Jaga kompatibilitas Vite stack:
  - `vite` major version harus kompatibel dengan `@vitejs/plugin-react`.
  - Project ini mengarah ke Vite 8, jadi React plugin harus versi yang mendukung Vite 8.
  - `laravel-vite-plugin` harus tetap kompatibel dengan versi Vite yang dipakai.
- Jangan menghapus `package-lock.json` dari repository kecuali ada keputusan tim.

## Laravel Backend

- Ikuti konvensi Laravel untuk controller, model, migration, request validation, policy, dan route naming.
- Simpan route web di `routes/web.php`; route auth scaffold berada di `routes/auth.php`.
- Gunakan validation Laravel untuk input dari user.
- Jangan menaruh business logic besar di route closure jika logic mulai kompleks; pindahkan ke controller/service yang sesuai.
- Setelah mengubah PHP, jalankan pemeriksaan yang relevan:
  - `composer test`
  - `php artisan test`
  - `vendor/bin/pint` jika formatting PHP perlu dirapikan dan tersedia.
- Jangan mengubah migration lama yang sudah diasumsikan pernah berjalan di environment lain; buat migration baru untuk perubahan schema.

## Inertia dan React Frontend

- Entry frontend utama ada di `resources/js/app.jsx`.
- Page Inertia berada di `resources/js/Pages`.
- Reusable component berada di `resources/js/Components`.
- Layout berada di `resources/js/Layouts`.
- Gunakan pola komponen yang sudah ada sebelum membuat pola baru.
- Jangan mencampur manipulasi DOM manual/jQuery dengan React kecuali untuk library legacy yang memang membutuhkannya.
- Setelah menyelesaikan task frontend, jangan menjalankan `npm run build` tanpa izin user terlebih dahulu.
- Jika perlu menjalankan project untuk validasi manual:
  - Backend: `php artisan serve`
  - Frontend: `npm run dev`

## Styling dan UI

- Gunakan Tailwind utility class dan token yang sudah didefinisikan di `tailwind.config.js`.
- Pertahankan arah visual yang sudah ada: botanical, warna hijau/earth tone, font Montserrat dan Playfair Display.
- Jangan mengganti keseluruhan design system tanpa permintaan eksplisit.
- Untuk perubahan UI, cek tampilan desktop dan mobile jika memungkinkan.
- Hindari styling inline kecuali benar-benar diperlukan.

## Environment dan File Lokal

- `.env` tidak boleh di-commit.
- Gunakan `.env.example` sebagai referensi konfigurasi environment.
- `vendor/`, `node_modules/`, `public/build/`, dan file cache tidak boleh di-commit.
- Jika setup lokal gagal karena dependency belum terinstall, jangan ubah source code sebelum memastikan dependency sudah valid.

## Batasan Resource Lokal

- Jangan menjalankan command berat tanpa izin user terlebih dahulu.
- Jangan menjalankan server atau background process tanpa izin user, termasuk:
  - `php artisan serve`
  - `npm run dev`
  - `npm run watch`
  - `composer dev`
  - `php artisan queue:work`
  - `php artisan queue:listen`
  - `php artisan pail`
- Hindari `composer dev` kecuali user eksplisit meminta menjalankan semua service sekaligus, karena command ini menjalankan server, queue listener, log watcher, dan Vite bersamaan.
- Jika perlu menjalankan project untuk validasi, minta izin user terlebih dahulu dan jalankan service secara terpisah:
  - Backend: `php artisan serve`
  - Frontend: `npm run dev`
- Jangan menjalankan lebih dari satu server/dev process yang sama secara bersamaan.
- Setelah selesai validasi, hentikan process dev server yang dijalankan oleh AI.
- Jangan menjalankan command watch mode yang terus hidup kecuali user meminta eksplisit.
- Jangan menjalankan install dependency berulang-ulang tanpa alasan jelas.
- Jangan menjalankan `npm install`, `npm ci`, `composer install`, atau update lockfile tanpa izin user.
- Jangan menjalankan `npm run build`, `composer test`, `php artisan test`, atau test suite penuh tanpa izin jika perubahan hanya kecil.
- Jangan menjalankan command yang menghasilkan banyak file/cache tanpa izin user, seperti build production, asset generation, storage link, image conversion massal, atau script scraping.
- Jangan membaca atau memproses file besar seperti image, video, atau archive secara massal kecuali memang diminta.
- Jangan menjalankan script custom seperti `convert.mjs`, `convert.py`, `slice_image.py`, `fetch_stitch.mjs`, atau `create_placeholders.py` tanpa membaca isinya dan meminta izin user.
- Prioritaskan pemeriksaan ringan dulu, seperti membaca file terkait, cek `git status`, atau menjalankan test spesifik jika ada.

## Git dan Kolaborasi

- Cek `git status` sebelum mengubah file jika task berpotensi menyentuh banyak file.
- Jangan menimpa perubahan lokal milik user atau collaborator.
- Untuk fix dependency, gunakan branch terpisah dan commit minimal berisi file yang relevan saja.
- Untuk perubahan dependency npm, commit `package.json` dan `package-lock.json` bersama-sama.
- Untuk perubahan dependency Composer, commit `composer.json` dan `composer.lock` bersama-sama.
- Tulis commit message yang jelas jika user meminta commit.

## Verifikasi Sebelum Menyatakan Selesai

- Untuk perubahan PHP/backend: jalankan test Laravel/PHPUnit yang relevan.
- Untuk perubahan frontend: jangan menjalankan `npm run build` tanpa izin user terlebih dahulu.
- Untuk perubahan dependency: jalankan install bersih jika memungkinkan, lalu build/test.
- Jika test atau build gagal karena kondisi awal project, jelaskan error yang terjadi dan file/command terkait.
- Jangan mengklaim sudah lolos test/build jika command belum dijalankan.

## Batasan Perubahan

- Implementasikan hanya yang diminta user.
- Jika menemukan masalah lain, laporkan sebagai catatan terpisah, jangan langsung memperbaiki tanpa izin.
- Jangan menambahkan package baru jika solusi bisa memakai dependency yang sudah ada.
- Jangan menambahkan fallback, compatibility shim, atau defensive code yang tidak dibutuhkan oleh kontrak saat ini.
