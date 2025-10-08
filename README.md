# Sistem Koperasi UMB - Frontend

Aplikasi web frontend untuk mengelola sistem informasi koperasi Universitas Mercu Buana. Dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Development**: ESLint, PostCSS

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

## 🛠️ Installation

1. Clone repository:
```bash
git clone https://github.com/BroAegg/web-koperasi-umb.git
cd web-koperasi-umb
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Development

Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 🏭 Production

Build untuk production:
```bash
npm run build
npm run start
```

## 🧪 Code Quality

Lint code:
```bash
npm run lint
npm run lint:fix
```

## 📁 Struktur Project

```
web-koperasi-umb/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── koperasi/          # Main application
│   │   ├── dashboard/     # Dashboard overview
│   │   ├── inventory/     # Product management
│   │   ├── membership/    # Member management
│   │   └── broadcast/     # Announcements
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static assets
├── package.json           # Dependencies
├── next.config.ts         # Next.js config
├── tailwind.config.js     # Tailwind config
└── tsconfig.json          # TypeScript config
```

## 📊 Fitur Utama

### 🏠 Dashboard
- Overview statistik koperasi
- Ringkasan aktivitas terkini
- Quick actions untuk akses cepat

### 📦 Inventory Management
- CRUD produk koperasi
- Tracking stok real-time
- Alert untuk stok rendah
- Riwayat transaksi masuk/keluar
- Format mata uang Rupiah

### 👥 Member Management
- Registrasi anggota baru
- Manajemen data anggota
- Tracking simpanan (pokok, wajib, sukarela)
- Profil anggota lengkap

### 📢 Broadcast System
- Pengumuman untuk anggota
- Notifikasi penting
- Komunikasi internal koperasi

### 🔐 Authentication
- Login page
- User registration
- Session management

## 🎨 UI/UX Features

- **Responsive Design**: Optimized untuk desktop dan mobile
- **Modern Interface**: Clean dan intuitive
- **Dark/Light Mode**: (Ready untuk implementasi)
- **Accessibility**: WCAG compliant
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 🔧 Backend Integration Ready

Frontend ini sudah siap untuk integrasi dengan backend API:
- Axios/Fetch setup untuk API calls
- Type definitions untuk data models
- Error handling untuk API responses
- Loading states untuk async operations

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Development Team**: UMB Team
- **Repository Owner**: BroAegg

---

*Dibuat dengan ❤️ untuk Universitas Mercu Buana*