# Zagovor vaj — apart-alert (RIRS)

Ta dokument natančno opisuje, **kaj pokazati pri zagovoru vsake vaje**, **kje v kodi/repozitoriju** je posamezna zahteva implementirana in **pogosta vprašanja** asistenta.

Repozitorij: <https://github.com/lovro-cus/apart-alert>
Aplikacija: informacijski sistem za iskanje in obveščanje o prostih apartmajih.
Tehnologije: **React + Vite** (frontend), **Express + Supabase** (backend), **Docker**, **GitHub Actions**.

Struktura projekta:
```
apart-alert/
├─ backend/            Express API
│  ├─ index.js         vstopna točka + vse poti (endpoints)
│  ├─ lib/             čista poslovna logika (testljiva brez baze)
│  ├─ tests/           backend testi (Vitest + supertest)
│  ├─ Dockerfile       slika backenda
│  └─ apartments.js    statični seznam 100 apartmajev
├─ frontend/           React + Vite
│  ├─ src/             komponente + src/lib čista logika + testi
│  ├─ Dockerfile       multi-stage build → nginx
│  └─ nginx.conf       SPA streženje
├─ docs/
│  ├─ index.html       GitHub Pages predstavitvena stran (vaja 5)
│  └─ optimizacija.md  zapis za vajo 7
├─ supabase/schema.sql SQL shema baze
├─ sonar-project.properties  SonarCloud konfiguracija (vaja 6)
├─ .github/workflows/
│  ├─ ci.yml           glavni CI/CD cevovod (vaje 3–6)
│  └─ codeql.yml       GitHub Code Scanning (vaja 7)
├─ NASTAVITVE.md       ročni koraki (secrets, računi)
└─ ZAGOVOR.md          ta dokument
```

> **Splošni nasvet za zagovor:** zavihek **Actions** na GitHubu odpri vnaprej — večino dokazov pokažeš tam (zeleni job-i, artefakti, okolja, odobritve).

---

## Vaja 2 — GitHub Flow in implementacija

### Cilj
Urediti repozitorij po strategiji GitHub Flow (environment branches): 3 dolgoживeče veje, kratkoживeče feature veje, združevanje prek PR, zaklenjene dolgoживeče veje.

### Kaj pokazati (v živo)
1. **Tri dolgoживeče veje** — repo → gumb za izbiro vej: `main`, `pre-production`, `production`.
2. **Zaščita vej** — Settings → **Rules / Rulesets** → pravilo, ki zahteva PR. Lahko demonstriraš poskus direktnega pusha:
   ```bash
   git checkout main
   git commit --allow-empty -m "test"
   git push origin main      # → ZAVRNJEN: "Changes must be made through a pull request"
   ```
3. **Feature veja + PR** — zavihek **Pull requests → Closed**: pokaži zmergeane PR-je (npr. `feature/apartment-details`).
4. **Nova funkcionalnost (2. del)** — funkcionalnost **"Podrobnosti apartmaja"**:
   - Backend endpoint `GET /apartments/:id` → `backend/index.js` (vrstica ~193).
   - Čista funkcija `getApartmentById` → `backend/lib/apartments.js`.
   - Frontend komponenta → `frontend/src/ApartmentDetails.jsx`, gumb "Podrobnosti" v `frontend/src/App.jsx`.

### Kje v repozitoriju
| Zahteva | Kje |
|---------|-----|
| Dolgoживeče veje | GitHub → veje `main`, `pre-production`, `production` |
| Zaščita / PR obvezen | Settings → Rules → Rulesets |
| Feature veje + PR-ji | zavihek Pull requests (zaprti) |
| Nova funkcionalnost | `backend/index.js`, `backend/lib/apartments.js`, `frontend/src/ApartmentDetails.jsx` |

### Pogosta vprašanja
- *Zakaj GitHub Flow in ne Git Flow?* — preprostejši, dovolj za majhne ekipe; dolgoживeče veje predstavljajo okolja.
- *Kako preprečiš direkten push?* — Ruleset z "Require a pull request before merging".

---

## Vaja 3 — Testiranje enot in izvedba testov v cevovodu

### Cilj
≥20 testov (FE + BE), GitHub Actions workflow s testno fazo, poročila o pokritosti kot artefakti.

### Kaj pokazati (v živo)
1. **Lokalni zagon testov:**
   ```bash
   cd backend && npm test        # 32 testov
   cd ../frontend && npm test    # 15 testov
   ```
   Skupaj **47 testov** (zahteva ≥20).
2. **Pokritost:** `npm run coverage` v obeh mapah.
3. **V cevovodu:** Actions → zadnji zagon → job-a **"Backend testi"** in **"Frontend testi"** zelena.
4. **Artefakti:** v zagonu spodaj → `backend-coverage`, `frontend-coverage` (prenesljivi).

### Kje v kodi
| Kaj | Kje |
|-----|-----|
| Backend čista logika (testirana) | `backend/lib/apartments.js`, `metrics.js`, `alerts.js`, `auth.js` |
| Backend testi (unit + integracijski) | `backend/tests/apartments.test.js`, `metrics.test.js`, `alerts.test.js`, `routes.test.js` |
| Integracijski testi poti (supertest, mock Supabase) | `backend/tests/routes.test.js` |
| Frontend čista logika | `frontend/src/lib/apartments.js`, `validation.js` |
| Frontend testi (unit + komponentni RTL) | `frontend/src/lib/*.test.js`, `App.test.jsx`, `ApartmentDetails.test.jsx` |
| Test skripte | `backend/package.json` in `frontend/package.json` (`test`, `coverage`) |
| CI testna faza | `.github/workflows/ci.yml` → job-a `backend-tests`, `frontend-tests` |
| Artefakti pokritosti | `ci.yml` → koraka `upload-artifact` (`backend-coverage`, `frontend-coverage`) |

### Ključne razlage
- **Zakaj `lib/` mape?** Poslovno logiko (filtriranje, agregacija metrik, ujemanje alertov) sem ločil iz route handlerjev, da jo testiram **brez baze** → hitri, zanesljivi unit testi.
- **Kako testiraš poti, ki kličejo Supabase?** Z `supertest` + `vi.mock("@supabase/supabase-js")` (glej vrh `routes.test.js`) — baze ne kličemo, simuliramo odgovore.
- **Raznolikost testov:** robni primeri filtra, case-insensitive iskanje, agregacije, validacija gesla, 403 za admin middleware, 404 za neobstoječ apartma, render komponent.

### Pogosta vprašanja
- *Unit vs. integracijski test?* — unit = čista funkcija (`filterApartments`), integracijski = cel HTTP request prek `supertest` (`GET /search`).
- *Kaj je artefakt?* — datoteke, shranjene po zagonu (tu poročila o pokritosti) za poznejši pregled.

---

## Vaja 4 — Gradnja in namestitev z GitHub Actions

### Cilj
Build faza, caching odvisnosti, gradbeni artefakti, gradnja Docker slik, push na Docker Hub, deploy na storitev.

### Kaj pokazati (v živo)
1. **Build faza:** Actions → job **"Gradnja"** zelen (`vite build`).
2. **Caching:** v logu `setup-node` → "Cache restored" (npm); v Docker job-u "cache-from gha".
3. **Gradbeni artefakt:** zagon → artefakt `frontend-dist`.
4. **Docker slike:** <https://hub.docker.com> → repozitorija `apart-alert-backend`, `apart-alert-frontend` z oznakami (`dev`/`prod`/sha).
5. **Deploy deluje:** odpri javni URL na Render:
   - backend `…onrender.com/search?location=Bled` → JSON
   - frontend `…onrender.com` → aplikacija

### Kje v kodi
| Zahteva | Kje |
|---------|-----|
| Build faza | `ci.yml` → job `build` (`npm run build`, upload `frontend-dist`) |
| npm caching | `ci.yml` → `setup-node` z `cache: npm` + `cache-dependency-path` |
| Docker layer caching | `ci.yml` → `build-push-action` z `cache-from/to: type=gha` |
| Gradbeni artefakt | `ci.yml` → `upload-artifact` (`frontend-dist`) |
| Dockerfile (backend) | `backend/Dockerfile` |
| Dockerfile (frontend, multi-stage + nginx) | `frontend/Dockerfile`, `frontend/nginx.conf` |
| Push na Docker Hub | `ci.yml` → job `deliver` (`docker/login-action`, `build-push-action`, secrets `DOCKER_USERNAME/PASSWORD`) |
| Deploy | `ci.yml` → job `deliver` (Render deploy hooki) |
| Konfigurabilen API URL | `frontend/src/lib/config.js` (`VITE_API_URL`) |

### Ključne razlage
- **Caching:** `actions/setup-node` shrani `~/.npm` po ključu iz `package-lock.json`; Docker plasti se predpomnijo prek GitHub cache (`type=gha`) → krajši čas gradnje.
- **Multi-stage Docker (frontend):** 1. stopnja zgradi z Node, 2. stopnja servira statične datoteke prek `nginx` → manjša, varnejša slika.
- **Zakaj `VITE_API_URL`?** Naslov backenda se vgradi v frontend ob build-u (Vite env je build-time), zato je konfigurabilen prek spremenljivke namesto hardcodiran.

### Pogosta vprašanja
- *Kje so secrets?* — GitHub → Settings → Secrets and variables → Actions (glej `NASTAVITVE.md`).
- *Kako veš, da je slika na Docker Hubu?* — vidna v repozitoriju na hub.docker.com + log koraka "push".

---

## Vaja 5 — Namestitev različnih vej in uporaba okolij

### Cilj
GitHub Pages predstavitvena stran + Environments (development/production), production z ročno odobritvijo, Docker slike označene `dev`/`prod`.

### Kaj pokazati (v živo)
1. **GitHub Pages stran:** `https://lovro-cus.github.io/apart-alert/` → ime projekta, ekipa, opis.
2. **Pages deploy v cevovodu:** Actions → job **"Deploy na GitHub Pages"** zelen.
3. **Okolji:** Settings → **Environments** → `development`, `production` (+ `github-pages`).
4. **Ročna odobritev:** push/PR na `production` → Actions → zagon **čaka** → **Review deployments → Approve and deploy**.
5. **Oznake slik:** push na `main` → oznaka `:dev`; na `production` → oznaka `:prod` (vidno na Docker Hub + v logu job-a `deliver`).

### Kje v kodi
| Zahteva | Kje |
|---------|-----|
| Statična stran | `docs/index.html` |
| Pages deploy | `ci.yml` → job `pages` (`upload-pages-artifact`, `deploy-pages`) |
| Okolje development (main → `:dev`) | `ci.yml` → job `deliver`, `environment.name` izraz + korak "Določi okolje in oznako" |
| Okolje production (production → `:prod`) | isti job; ročna odobritev se nastavi v GitHub Environments |
| Ročna odobritev | GitHub → Settings → Environments → `production` → **Required reviewers** |

### Ključne razlage
- **Kako se izbere okolje?** V `deliver` job-u: `environment.name = production` če je veja `production`, sicer `development`. Korak "Določi okolje in oznako" nastavi oznako `dev`/`prod`.
- **Kako deluje ročna odobritev?** Okolje `production` ima *Required reviewers*; ko job cilja to okolje, se ustavi in čaka na odobritev v zavihku Actions.
- **Tok sprememb:** koda → `main` (development) → PR `main → production` → po odobritvi production.

### Pogosta vprašanja
- *Zakaj se Pages deploya samo z `main`?* — produkcijska predstavitvena stran sledi glavni veji (`if: github.ref == 'refs/heads/main'`).
- *Kje je nastavljena ročna odobritev — v kodi ali na GitHubu?* — na GitHubu (Environments → Required reviewers); workflow jo le sproži prek `environment:`.

---

## Vaja 6 — Vključitev storitve SonarCloud

### Cilj
SonarCloud analiza celotne kode (BE + FE) v cevovodu + kakovostne pregrade (quality gate), ki prekinejo cevovod pred namestitvijo na produkcijo.

### Kaj pokazati (v živo)
1. **SonarCloud nadzorna plošča:** projekt `lovro-cus_apart-alert` → metrike (bugs, vulnerabilities, code smells, coverage, duplications) in **Quality Gate: Passed**.
2. **Analiza v cevovodu:** Actions → job **"SonarCloud analiza"** zelen.
3. **Quality gate blokira:** razloži, da `deliver` (deploy) **ne steče**, če quality gate pade (npr. demonstracija prejšnje varnostne težave, ki je blokirala deploy).

### Kje v kodi
| Zahteva | Kje |
|---------|-----|
| Sonar konfiguracija (sources BE+FE, lcov coverage) | `sonar-project.properties` |
| Sonar analiza job | `ci.yml` → job `sonarcloud` (`SonarSource/sonarqube-scan-action`) |
| Quality gate | `ci.yml` → korak `sonarsource/sonarqube-quality-gate-action` |
| Gate blokira deploy | `ci.yml` → job `deliver` ima `needs: [build, sonarcloud]` in pogoj, da sonarcloud ne sme pasti |
| Coverage za Sonar | koraka "Pokritost (backend/frontend)" v job-u `sonarcloud` |
| Token | GitHub Secret `SONAR_TOKEN` |

### Ključne razlage
- **Kaj je quality gate?** Niz pragov (npr. Security Rating = A, brez novih ranljivosti, duplikacije ≤ 3 %). Če niso izpolnjeni, gate "Failed".
- **Kako blokira cevovod?** `deliver` ima `needs: sonarcloud`; če gate pade, job `sonarcloud` pade → `deliver` se ne izvede → ni deploya.
- **Konkreten primer:** SonarCloud je našel ranljivost `docker:S6505` (npm namestitvene skripte) v `Dockerfile` → gate Failed → deploy blokiran. Odpravil sem z `--ignore-scripts` v obeh Dockerfile-ih → gate Passed.
- **Opomba:** quality gate se izvaja na `main` in PR-jih proti `main` (tam koda nastaja); na produkcijo pride samo že-preverjena koda.

### Pogosta vprašanja
- *Avtomatska vs. CI analiza?* — izklopil sem "Automatic Analysis" v SonarCloud, ker uporabljam CI-based (sicer se spopadeta).
- *Kateri ključi?* — `sonar.projectKey` in `sonar.organization` v `sonar-project.properties`.

---

## Vaja 7 — Optimizacija cevovodov

### Cilj
Najti in odpraviti pomanjkljivosti/ranljivosti v cevovodu z orodji **Datadog**, **Snyk** in **GitHub Code Scanning**; zapisati ugotovitve.

### Kaj pokazati (v živo)
1. **Datadog:** CI Pipelines / dashboard s trajanji opravil (ozka grla). + zaslonski posnetek.
2. **GitHub Code Scanning:** zavihek **Security → Code scanning** → CodeQL opozorila (in kako so odpravljena/komentirana).
3. **Snyk:** Actions → job **"Snyk varnostni pregled"** (ali app.snyk.io) → najdene ranljivosti.
4. **Zapis:** `docs/optimizacija.md` → ugotovitve + posnetki.

### Kje v kodi/repozitoriju
| Zahteva | Kje |
|---------|-----|
| CodeQL (Code Scanning) | `.github/workflows/codeql.yml` → rezultati v Security → Code scanning |
| Snyk pregled (odvisnosti + Dockerfile) | `ci.yml` → job `snyk` (Secret `SNYK_TOKEN`) |
| Datadog | nastavitev v Datadog UI (GitHub integracija) — ni v kodi |
| Optimizacije cevovoda | `ci.yml`: `concurrency` (preklic), sočasni testi, npm + Docker cache, multi-stage Dockerfile, `.dockerignore` |
| Zapis ugotovitev | `docs/optimizacija.md` |

### Konkretne optimizacije (razlaga)
| Optimizacija | Kje | Učinek |
|--------------|-----|--------|
| Sočasni testi | `ci.yml` `backend-tests` + `frontend-tests` ločena | krajši skupni čas |
| `concurrency` preklic | vrh `ci.yml` | manj porabljenih virov |
| npm cache | `setup-node cache: npm` | hitrejši `npm ci` |
| Docker layer cache | `build-push-action cache-from/to gha` | hitrejša gradnja slik |
| Multi-stage + `.dockerignore` | `frontend/Dockerfile`, `*/.dockerignore` | manjše, varnejše slike |
| Odprava ranljivosti | `--ignore-scripts` v Dockerfile-ih | varnejša gradnja |

### Pogosta vprašanja
- *Katero ozko grlo si našel?* — najdaljša sta gradnja/push Docker slik in `npm ci`; rešeno s cache-i in sočasnostjo.
- *Katero ranljivost si odpravil?* — `docker:S6505` (npm lifecycle skripte) → `--ignore-scripts`; CodeQL/Snyk opozorila pregledana.

---

## Hitri "demo scenarij" za zagovor (priporočen vrstni red)
1. Pokaži **veje + ruleset** (vaja 2) in poskus zavrnjenega pusha.
2. Lokalno `npm test` (vaja 3) → 47 testov.
3. GitHub **Actions** → en zagon: zeleni job-i `tests → build → sonarcloud → deliver` + artefakti (vaje 3, 4, 6).
4. **Docker Hub** → sliki z oznakami (vaji 4, 5).
5. **GitHub Pages** stran (vaja 5).
6. **Environments** + **Review deployments** odobritev za production (vaja 5).
7. **SonarCloud** dashboard + Quality Gate Passed (vaja 6).
8. **Security → Code scanning**, **Snyk** job, **Datadog** dashboard + `docs/optimizacija.md` (vaja 7).

> Vse ročne nastavitve (secrets, računi, okolja) so popisane v **`NASTAVITVE.md`**.
