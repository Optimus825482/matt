# Matematikte Pratik

7. sınıf düzeyindeki öğrenciler için hazırlanmış, oyun hissi taşıyan bir matematik pratik uygulaması.

Bu sürümde artık:

- çocuk hesabı girişi vardır
- veriler SQLite veritabanında tutulur
- turlar ve cevap hareketleri kaydedilir
- rozetler kalıcıdır
- görünür olmayan bir `superadmin` girişi ile tüm çocuk aktiviteleri izlenebilir

## Geliştirme

```bash
npm install
npm run dev
```

Vite arayüzü ve Express API birlikte çalışır.

## Superadmin girişi

Arayüzde link verilmez. Doğrudan şu yolu açman gerekir:

```text
/superadmin/entry
```

Varsayılan bilgiler:

```text
Kullanıcı adı: superadmin
Şifre: ChangeMe!2026
```

İstersen bunları ortam değişkenleriyle değiştirebilirsin:

```bash
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=guclu-bir-sifre
APP_SESSION_SECRET=uzun-bir-gizli-anahtar
```

## Doğrulama

```bash
npm run test
npm run lint
npm run build
```

## Docker / Coolify

Projede artık tek container ile deploy için gerekli dosyalar var:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

Yerel Docker testi:

```bash
docker compose up --build
```

Uygulama container içinde `3001` portunda çalışır ve SQLite verisi `/app/data` altında kalıcı tutulur.

Coolify için önerilen kullanım:

1. Docker Compose tabanlı yeni resource oluştur.
2. Repo içindeki `docker-compose.yml` dosyasını kullan.
3. `APP_SESSION_SECRET` ve `SUPERADMIN_PASSWORD` değişkenlerini Coolify UI üzerinden doldur.
4. Domain'i `app` servisine bağla.

Coolify Docker Compose dokümantasyonuna göre compose dosyası tek kaynak kabul edilir ve environment değişkenleri doğrudan compose içinden tanımlanabilir. Kaynaklar:

- [Coolify Docker Compose Docs](https://coolify.io/docs/knowledge-base/docker/compose)
- [Coolify Docker Compose Build Pack Docs](https://coolify.io/docs/applications/build-packs/docker-compose)
