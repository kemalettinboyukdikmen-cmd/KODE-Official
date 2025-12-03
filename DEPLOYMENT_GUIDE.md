# Dağıtım Rehberi

## Firebase Kurulumu

### 1. Firebase Projesi Oluştur
- Firebase Console'a git: https://console.firebase.google.com
- Yeni proje oluştur
- Google Analytics'i etkinleştir

### 2. Firebase CLI Yükle
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 3. Firestore Veritabanını Başlat
```bash
firebase init firestore
# Security Rules'ü FIRESTORE_RULES.txt dosyasından kopyala
```

### 4. Realtime Database'yi Başlat (isteğe bağlı)
```bash
firebase init database
# DATABASE_RULES.json dosyasını kullan
```

### 5. Authentication Etkinleştir
- Firebase Console → Authentication
- Email/Password sağlayıcısını etkinleştir

### 6. .env Dosyasını Doldur
Backend'deki .env.example dosyasını kopyala ve Firebase bilgilerini doldur:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Backend Dağıtımı

### Cloud Functions (Firebase)
```bash
cd backend/functions
npm install
firebase deploy --only functions
```

### Alternatif: Cloud Run
```bash
gcloud builds submit --region=us-central1
gcloud run deploy news-platform --region=us-central1
```

### Alternatif: Render/Railway
1. Backend repo'yu GitHub'a push'la
2. Render/Railway'e bağla
3. Environment variables'ı ayarla
4. Deploy et

## Frontend Dağıtımı (Vercel)

### 1. Vercel CLI Yükle
```bash
npm install -g vercel
```

### 2. Deploy Et
```bash
cd frontend
vercel
```

### 3. Environment Variables Ekle
Vercel Dashboard → Settings → Environment Variables:
- `REACT_APP_API_URL=` (backend URL)
- `REACT_APP_ADMIN_IP_WHITELIST=` (admin IP'leri)

### 4. Custom Domain Ekle (isteğe bağlı)
- Vercel → Settings → Domains
- Domain adını ekle

## Admin IP Whitelist Kurulumu

1. Backend .env dosyasında:
```
ADMIN_IP_WHITELIST=192.168.1.100,10.0.0.1
```

2. Kendi bilgisayarının IP'sini öğren:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

3. IP'i whitelist'e ekle

## SSL/TLS Sertifikası

- Vercel: Otomatik olarak Let's Encrypt sertifikası sağlar
- Firebase Hosting: Otomatik olarak SSL sağlar
- Custom domain: Cloudflare Free Plan kullanabilirsin

## Performans Optimizasyonu

### Frontend
- `npm run build` ile production build oluştur
- CDN kullan (Vercel otomatik yapıyor)
- Image optimization: Next.js Image component yerine React Image Optimization

### Backend
- Database indexes oluştur
- Rate limiting'i ayarla
- Caching implement et (Redis)

## Monitoring

### Firebase Console
- Firestore usage
- Authentication metrics
- Cloud Functions performance

### Vercel Analytics
- Deployment history
- Performance metrics
- Error tracking

## Backup ve Disaster Recovery

### Firestore Backups
```bash
firebase firestore:export gs://bucket-name
```

### Database Exports
- Firebase Console → Firestore → Data
- Export Collection

## Troubleshooting

### "Permission denied" hatası
- Firestore Rules'ü kontrol et
- Authentication token'ını kontrol et

### CORS hatası
- Backend CORS settings'ini kontrol et
- Frontend URL'ini backend whitelist'ine ekle

### 404 hatası
- API routes'ı kontrol et
- Base URL'i kontrol et

## İletişim ve Destek

- Issues: GitHub Issues
- Email: info@gencbizz.com
- Discord: [Discord linki]
