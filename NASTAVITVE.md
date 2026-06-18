# Ročne nastavitve (kar moraš narediti sam)

Koda in cevovod so pripravljeni. Spodaj je vse, česar **ne morem narediti jaz**
(potrebni so tvoji računi, žetoni in GitHub nastavitve). Urejeno po vajah.

> Lokacija za skrivnosti in spremenljivke:
> **Repo → Settings → Secrets and variables → Actions**
> - **Secrets** = občutljive vrednosti (žetoni, gesla)
> - **Variables** = navadne vrednosti (npr. URL-ji)

---

## 📋 Hitri pregled vsega, kar je treba dodati

### Secrets
| Ime | Za vajo | Od kod |
|-----|---------|--------|
| `DOCKER_USERNAME` | 4 | Docker Hub uporabniško ime |
| `DOCKER_PASSWORD` | 4 | Docker Hub **access token** |
| `RENDER_DEPLOY_HOOK_BACKEND` | 4/5 | Render – deploy hook backend servisa |
| `RENDER_DEPLOY_HOOK_FRONTEND` | 4/5 | Render – deploy hook frontend servisa |
| `SONAR_TOKEN` | 6 | SonarCloud žeton |
| `SNYK_TOKEN` | 7 | Snyk API žeton |

### Variables
| Ime | Za vajo | Vrednost |
|-----|---------|----------|
| `VITE_API_URL` | 4/5 | javni URL backenda na Render (npr. `https://apart-alert-backend.onrender.com`) |

### Računi, ki jih potrebuješ
Docker Hub · Supabase · Render · SonarCloud · Snyk · Datadog

---

## Vaja 2 – GitHub Flow ✅ (narejeno, samo preveri)

- [x] 3 dolgoживeče veje: `main`, `pre-production`, `production`
- [x] Branch protection / ruleset (zahteva PR, brez direktnega pusha) — **Required approvals = 0** (delaš sam!)
- [x] Funkcionalnost prek feature veje + PR

> **Naprej vse delo poteka prek feature vej + PR**, ker so dolgoживeče veje zaklenjene.
> Za vsak nov PR: počakaj na zelen CI → **Merge pull request**.

---

## Vaja 4 – Gradnja, Docker, deploy

### 1. Docker Hub
1. Ustvari račun na <https://hub.docker.com>.
2. **Account settings → Security → New Access Token** (Read & Write) → skopiraj.
3. Dodaj **Secrets**:
   - `DOCKER_USERNAME` = uporabniško ime
   - `DOCKER_PASSWORD` = access token
4. Repozitorija `apart-alert-backend` in `apart-alert-frontend` se ustvarita ob prvem push samodejno.

### 2. Supabase (da deployana aplikacija dela)
1. Nov projekt na <https://supabase.com>.
2. **Project Settings → API**: skopiraj **Project URL** in **service_role** ključ.
   (Koda uporablja `auth.admin`, zato rabi service_role, ne anon.)
3. Te vrednosti vpišeš v Render (spodaj), **ne** v GitHub.

### 3. Render (deploy)
1. Račun na <https://render.com> (prijava z GitHub).
2. **Backend servis**: New → **Web Service** → *Deploy an existing image* →
   `docker.io/<DOCKER_USERNAME>/apart-alert-backend:dev`
   - Instance: **Free**
   - **Environment** spremenljivke: `SUPABASE_URL`, `SUPABASE_KEY` (service_role), po želji `MAIL_USER`, `MAIL_PASS`
   - Po kreiranju: **Settings → Deploy Hook** → skopiraj URL → Secret `RENDER_DEPLOY_HOOK_BACKEND`
   - Skopiraj javni URL servisa
3. **Frontend servis**: New → **Web Service** → *Deploy an existing image* →
   `docker.io/<DOCKER_USERNAME>/apart-alert-frontend:dev`
   - **Settings → Deploy Hook** → Secret `RENDER_DEPLOY_HOOK_FRONTEND`
4. Dodaj **Variable** `VITE_API_URL` = javni URL backenda.

> Brez teh secrets cevovod **ne pade** – deploy korak se le izpiše "preskakujem".

---

## Vaja 5 – GitHub Pages + Environments

### 1. GitHub Pages (enkratna nastavitev)
- **Settings → Pages → Build and deployment → Source = GitHub Actions**.
- Po prvem uspešnem zagonu bo stran na `https://lovro-cus.github.io/apart-alert/`.

### 2. Environments
- **Settings → Environments → New environment** → ustvari:
  - `development`
  - `production` → odpri ga → vključi **Required reviewers** (dodaj sebe) =
    **ročna odobritev** pred deployem na produkcijo.
- (Okolje `github-pages` se ustvari samodejno.)

### 3. Kako deluje dev vs. prod
- Push na **`main`** → slike z oznako **`:dev`** → okolje **development** (samodejno).
- Push na **`production`** → slike z oznako **`:prod`** → okolje **production**
  (čaka na tvojo **ročno odobritev** v zavihku Actions).

> Spremembe na produkcijo: odpri PR `main` → `production` in ga zmergeaj.

---

## Vaja 6 – SonarCloud + quality gate

1. Prijava na <https://sonarcloud.io> z GitHub.
2. **+ → Analyze new project** → izberi `apart-alert`.
3. Skopiraj **Project Key** in **Organization Key**.
4. **Odpri `sonar-project.properties`** v korenu repo-ja in zamenjaj:
   ```
   sonar.projectKey=<tvoj-project-key>
   sonar.organization=<tvoj-organization-key>
   ```
   (trenutno sta nastavljena `lovro-cus_apart-alert` in `lovro-cus` – preveri, da se ujemata!)
5. V SonarCloud: **Administration → Analysis Method → izklopi "Automatic Analysis"**
   (uporabljamo CI-based analizo).
6. Ustvari žeton: **My Account → Security → Generate Token** → Secret `SONAR_TOKEN`.

> Dokler `SONAR_TOKEN` ni nastavljen, se opravilo `sonarcloud` preskoči.
> Ko je nastavljen, **quality gate blokira deploy**, če pregrade niso izpolnjene.

---

## Vaja 7 – Optimizacija (Datadog, Snyk, Code Scanning)

### 1. GitHub Code Scanning (CodeQL)
- **Settings → Code security → Code scanning → Set up → Default** *ali* pusti,
  da teče naš workflow `.github/workflows/codeql.yml`.
- Po zagonu preglej **Security → Code scanning alerts** in odpravi, kar je mogoče.

### 2. Snyk
1. Račun na <https://snyk.io> (prijava z GitHub).
2. **Account settings → Auth Token** → skopiraj → Secret `SNYK_TOKEN`.
3. Po zagonu opravila `snyk` preglej najdene ranljivosti.

### 3. Datadog
1. Račun na <https://www.datadoghq.com>.
2. **CI Visibility → GitHub** → poveži repozitorij (namesti Datadog GitHub App).
3. Nastavi nadzorno ploščo za metrike CI/CD (trajanja opravil, neuspešni zagoni).

### 4. Zapis ugotovitev
- Dopolni **`docs/optimizacija.md`** in dodaj **zaslonske posnetke** orodij
  (Datadog dashboard, Snyk poročilo, Code scanning alerts).

---

## ✅ Vrstni red, ki ga priporočam
1. Zmergeaj PR za vaje 5–7 (ko ga ustvarim/pushnem).
2. Vklopi **Pages** (Source = GitHub Actions) in ustvari **Environments**.
3. Dodaj Docker + Render secrets/variable → preveri deploy.
4. Poveži **SonarCloud**, popravi `sonar-project.properties`, dodaj `SONAR_TOKEN`.
5. Vklopi **Code scanning**, dodaj `SNYK_TOKEN`, poveži **Datadog**.
6. Dopolni `docs/optimizacija.md` s posnetki.
