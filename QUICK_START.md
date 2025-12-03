# Hızlı Başlangıç Rehberi

## Gerekli Bileşenler

- Node.js 18+
- npm veya yarn
- Firebase hesabı
- Vercel hesabı (frontend için)

## Yerel Geliştirme Ortamını Kurma

### 1. Backend Kurulumu

```bash
cd backend
npm install

# .env dosyasını oluştur
cp .env.example .env

# Firebase bilgilerini .env dosyasına ekle
# FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY vb.

# Development sunucusunu başlat
npm run dev
```

Backend şu adresinden çalışacak: `http://localhost:5000`

### 2. Frontend Kurulumu

```bash
cd frontend
npm install

# Development sunucusunu başlat
npm run dev
```

Frontend şu adresinden çalışacak: `http://localhost:3000`

## Test Kullanıcısı Oluşturma

### Admin Kullanıcısı
```
Email: admin@gencbizz.com
Şifre: Admin@12345
Rol: admin
```

### Editör Kullanıcısı
```
Email: editor@gencbizz.com
Şifre: Editor@12345
Rol: editor
```

### Kullanıcı
```
Email: user@gencbizz.com
Şifre: User@12345
Rol: user
```

## Örnek API Çağrıları

### Kayıt Ol
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "confirmPassword": "Test@12345",
    "name": "Test User"
  }'
```

### Giriş Yap
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345"
  }'
```

### Haber Oluştur
```bash
curl -X POST http://localhost:5000/api/news/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Yeni Haber",
    "content": "Haber içeriği",
    "excerpt": "Haber özeti",
    "tags": ["eğitim", "teknoloji"]
  }'
```

### Haberleri Listele
```bash
curl -X GET http://localhost:5000/api/news/articles
```

## Dosya Yapısı

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # İş mantığı
│   │   ├── routes/           # API yolları
│   │   ├── services/         # Veri işlemleri
│   │   ├── middleware/       # Ara yazılım
│   │   ├── config/           # Yapılandırma
│   │   ├── types/            # TypeScript türleri
│   │   ├── utils/            # Yardımcı fonksiyonlar
│   │   └── index.ts          # Ana giriş noktası
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React bileşenleri
│   │   ├── pages/            # Sayfalar
│   │   ├── services/         # API istemcisi
│   │   ├── hooks/            # Custom hooks
│   │   ├── styles/           # CSS dosyaları
│   │   ├── App.tsx           # Ana uygulama
│   │   └── main.tsx          # Giriş noktası
│   ├── public/               # Statik dosyalar
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── README.md                 # Proje açıklaması
├── DEPLOYMENT_GUIDE.md       # Dağıtım rehberi
├── FIRESTORE_RULES.txt       # Firestore güvenlik kuralları
└── DATABASE_RULES.json       # Realtime DB kuralları
```

## Geliştirme İpuçları

### Debug Modu
Backend'de debug modunu açmak için:
```bash
DEBUG=* npm run dev
```

### Database'de Veri Görme
Firebase Console → Firestore → Verileri görüntüle

### Network Trafiğini İzleme
Browser DevTools → Network tab

## İçeriğe İlişkin Sorunlar

### Giriş yapamıyorsanız
- Email ve şifreyi kontrol et
- Hesabın dondurulmamış olduğundan emin ol
- Roles'ü kontrol et

### Haber oluşturulamıyorsanız
- Admin veya Editör rolüne sahip olduğundan emin ol
- Backend'in çalışıp çalışmadığını kontrol et
- Network tab'ında hataları kontrol et

### Veritabanı bağlantısı kurulamıyorsanız
- Firebase bağlantı bilgilerini kontrol et
- `.env` dosyasını kontrol et
- Firebase Console'da Firestore etkin olduğundan emin ol

## Sonraki Adımlar

1. ✅ Temel özellikleri test et
2. ✅ Admin panelini dene
3. ✅ Kullanıcı yönetimini test et
4. ✅ Haber ve forum işlevlerini test et
5. ✅ Firebase'e dağıt
6. ✅ Vercel'e dağıt
7. ✅ Custom domain bağla
8. ✅ SSL sertifikası ekle

## Destek Almak

- **Hatalar:** GitHub Issues
- **Sorular:** Discussions
- **Email:** info@gencbizz.com
