# Optimizacija cevovoda in varnostni pregled (vaja 7)

Ta dokument povzema ugotovljeno stanje CI/CD cevovoda in Docker zabojnikov,
identificirane težave/ranljivosti ter izvedene izboljšave in optimizacije.

> 📸 **Opomba:** k vsakemu razdelku dodaj zaslonske posnetke uporabljenih orodij
> (Datadog, Snyk, GitHub Code Scanning) na označenih mestih.

---

## 1. Datadog – spremljanje CI/CD

Datadog CI Visibility je integriran z repozitorijem in spremlja metrike izvajanja
cevovoda (trajanje posameznih opravil, pogostost zagonov, delež neuspelih zagonov).

**Ugotovljena ozka grla:**
- Najdaljši opravili sta `deliver` (gradnja in nalaganje Docker slik) in namestitev odvisnosti `npm ci`.
- Testni opravili sta se prej izvajali zaporedno; gradnja Docker slik ni imela predpomnilnika plasti.

📸 _Zaslonski posnetek: Datadog nadzorna plošča s trajanji opravil._

---

## 2. Izvedene optimizacije cevovoda

| Optimizacija | Opis | Učinek |
|--------------|------|--------|
| **Sočasnost testov** | `backend-tests` in `frontend-tests` tečeta vzporedno | krajši skupni čas |
| **npm predpomnjenje** | `actions/setup-node` z `cache: npm` (ločen ključ za FE/BE) | hitrejši `npm ci` |
| **Docker layer cache** | `cache-from/to: type=gha` v `build-push-action` | bistveno hitrejša ponovna gradnja slik |
| **Multi-stage Docker** | frontend se zgradi in servira prek `nginx` (manjša slika) | manjši, varnejši zabojnik |
| **`concurrency` preklic** | preklic predhodnih tekočih zagonov iste veje | manj porabljenih virov |
| **`.dockerignore`** | izključitev `node_modules`, `coverage`, testov iz konteksta | hitrejši build, manjši kontekst |

📸 _Zaslonski posnetek: primerjava trajanja zagona pred/po optimizaciji._

---

## 3. GitHub Code Scanning (CodeQL)

V repozitoriju je pod **Security → Code scanning** omogočen CodeQL
(workflow `.github/workflows/codeql.yml`), ki analizira JavaScript/TypeScript kodo.

**Ugotovitve in odprava:**
- _(Sem vpiši najdene opozorila in kako so bila odpravljena oz. zakaj so lažno pozitivna.)_

📸 _Zaslonski posnetek: GitHub Code scanning alerts._

---

## 4. Snyk – ranljivosti zabojnika in odvisnosti

Snyk pregled je vključen v cevovod (opravilo `snyk` v `ci.yml`) in pregleda
odvisnosti backenda ter Docker sliko (`backend/Dockerfile`).

**Ugotovitve in odprava:**
- Posodobitev osnovne slike (`node:20-alpine`) na novejšo različico, kjer je bilo smiselno.
- _(Sem piši konkretne najdene ranljivosti in ukrepe.)_

📸 _Zaslonski posnetek: Snyk poročilo._

---

## 5. Povzetek

Cevovod je po optimizaciji hitrejši (sočasnost + predpomnjenje), zabojniki manjši
(multi-stage + `.dockerignore`), varnostni pregledi (CodeQL, Snyk) pa so vključeni
neposredno v CI/CD, kar omogoča sprotno odkrivanje ranljivosti.
