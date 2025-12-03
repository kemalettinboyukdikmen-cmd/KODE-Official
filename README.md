# GençBizz - Haber & Forum Platformu

## Tanım

GençBizz, öğrenciler için modern, güvenli ve tam işlevsel bir haber ve forum platformudur. Haber yayınlama, proje paylaşma, yorum yapma ve moderasyon özellikleri içerir.

## Özellikler

### Haber Sistemi
- ✅ Haber oluşturma ve yayınlama
- ✅ SEO uyumlu URL'ler
- ✅ Görüntüleme sayacı
- ✅ Etiket sistemi

### Forum/Topluluk
- ✅ Proje paylaşımı
- ✅ Fotoğraf ve link ekleme
- ✅ Like/Dislike sistemi
- ✅ Popüler projeler filtresi

### Kullanıcı Sistemi
- ✅ Kayıt ve giriş
- ✅ Profil yönetimi
- ✅ Rol tabanlı erişim (Admin, Editör, Kullanıcı, Yasaklı)
- ✅ JWT + Secure Cookies ile kimlik doğrulama

### Yorum Sistemi
- ✅ Haber ve proje yorumları
- ✅ Anonim yorum seçeneği
- ✅ Yorum silme (kendi ve admin/editör)
- ✅ Yorum bildirimi

### Admin Paneli
- ✅ Kullanıcı yönetimi
- ✅ Rol değiştirme
- ✅ Hesap dondurma/çözme
- ✅ Sistem logları
- ✅ IP whitelist kontrol
- ✅ Cihaz parmak izi doğrulaması

### Güvenlik
- ✅ Bcrypt şifre hashing
- ✅ SQL injection koruması
- ✅ XSS koruması
- ✅ CSRF koruması
- ✅ Rate limiting
- ✅ IP whitelist
- ✅ Denetim logları

## Teknoloji Yığını

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + TypeScript + Tailwind CSS
- **Veritabanı:** Firebase Firestore + Realtime Database
- **Auth:** Firebase Authentication + JWT
- **Hosting:** Firebase + Vercel

## Kurulum

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını kendi Firebase bilgilerinizle doldurun
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## API Uç Noktaları

### Auth
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/me` - Mevcut kullanıcı
- `POST /api/auth/profile` - Profil güncelle

### Haberler
- `GET /api/news/articles` - Haberleri listele
- `GET /api/news/articles/:slug` - Haber detayı
- `POST /api/news/articles` - Haber oluştur (editör+)
- `PUT /api/news/articles/:id` - Haber güncelle (editör+)
- `POST /api/news/articles/:id/publish` - Haber yayınla (editör+)
- `DELETE /api/news/articles/:id` - Haber sil (editör+)

### Forum
- `GET /api/forum/projects` - Projeleri listele
- `GET /api/forum/projects/:id` - Proje detayı
- `POST /api/forum/projects` - Proje oluştur
- `PUT /api/forum/projects/:id` - Proje güncelle
- `POST /api/forum/projects/:id/like` - Beğen
- `POST /api/forum/projects/:id/dislike` - Beğenme

### Yorumlar
- `GET /api/comments/articles/:articleId` - Haber yorumları
- `GET /api/comments/projects/:projectId` - Proje yorumları
- `POST /api/comments` - Yorum oluştur
- `PUT /api/comments/:id` - Yorum güncelle
- `DELETE /api/comments/:id` - Yorum sil
- `POST /api/comments/:id/report` - Yorum bildir

### Admin
- `GET /api/admin/users` - Kullanıcıları listele
- `GET /api/admin/users/search` - Kullanıcı ara
- `POST /api/admin/users/:userId/role` - Rol değiştir
- `POST /api/admin/users/:userId/freeze` - Dondur
- `POST /api/admin/users/:userId/unfreeze` - Çöz
- `DELETE /api/admin/users/:userId` - Sil
- `GET /api/admin/logs/*` - Logları görüntüle

## Veritabanı Yapısı

### Collections
- `users` - Kullanıcı profilleri
- `articles` - Haberler
- `projects` - Forum projeleri
- `comments` - Tüm yorumlar
- `auditLogs` - Sistem logları
- `likes` - Proje beğenileri
- `dislikes` - Proje beğenmileri
- `reports` - Kullanıcı raporları

## Çevresel Değişkenler

### Backend (.env)
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
JWT_SECRET=...
ADMIN_IP_WHITELIST=...
ADMIN_EMAIL=...
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ADMIN_IP_WHITELIST=...
```

## Dağıtım

### Firebase Dağıtımı
```bash
firebase login
firebase init
firebase deploy
```

### Vercel Dağıtımı
```bash
vercel
```

## Lisans

MIT

## İletişim

info@gencbizz.com
