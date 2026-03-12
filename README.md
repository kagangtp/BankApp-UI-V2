# UI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

src/app/
├── core/                   # Uygulamanın beyni (Tek seferlik yüklenenler)
│   ├── auth/               # AuthService, Token yönetimi
│   ├── guards/             # auth.guard.ts (Giriş yapmayanı Dashboard'a sokmaz)
│   ├── interceptors/       # jwt.interceptor.ts (.NET API'sine her seferinde Token ekler)
│   ├── services/           # ApiService (Generic http istekleri)
│   └── models/             # API'den gelen ana veri modelleri (User, ApiResponse)
│
├── layout/                 # Uygulamanın iki farklı yüzü (Shells)
│   ├── auth-layout/        # Login için: O mor gradient arka plan ve beyaz kutu iskeleti
│   ├── main-layout/        # Dashboard için: Sidebar + Navbar + Content iskeleti
│   └── components/         # Layout'a özel parçalar
│       ├── sidebar/        # Sol menü (Icons, Nav Links)
│       └── navbar/         # Sağ üstteki "Admin User" alanı
│
├── features/               # Sayfalar ve İş Mantığı (Business Logic)
│   ├── auth/               # Giriş işlemleri
│   │   └── login/          # Senin paylaştığın o Login ekranı bileşeni
│   ├── dashboard/          # Paylaştığın o istatistikli ana sayfa
│   │   └── components/     # Stat-card, recent-activity gibi dashboard-özel parçalar
│   ├── customers/          # Müşteri yönetimi sayfası
│   └── transactions/       # İşlem geçmişi sayfası
│
├── shared/                 # Her yerden çağrılabilecek "Yardımcılar"
│   ├── components/         # Custom-button, custom-input (Login'deki gibi şık inputlar)
│   ├── pipes/              # currency.pipe.ts (Döviz formatlama)
│   └── directives/         # click-outside.directive.ts
│
└── app.routes.ts           # İki dünyayı birbirine bağlayan yönlendirme merkezi
