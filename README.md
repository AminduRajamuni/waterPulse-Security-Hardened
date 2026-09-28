# WaterPulse – Security-Hardened Version
**SE4030 – Secure Software Development | Group Assignment**

## 1. Group Members

| Name | Index Number | Contribution |
|---|---|---|
| Weerasiri K L C H | IT23245556 | V1, V4, V5, V6 |
| Jayawardhana  R D L L  | IT23213876 | V3, V8 |
| Rajamuni R D A P | IT23265738 | V2, V7, Google OAuth/OIDC |
| Weerasiri K L C H  | IT23245556 | V12, V13, V14 |

## 2. Project Links

- **Original project (before fixes):** https://github.com/HasarangaWeerasiri/WaterPulse
- **Modified project (after fixes):** https://github.com/AminduRajamuni/waterPulse-Security-Hardened


The first commit in the modified repository is the unmodified original
source. Every later commit is a security fix or the OAuth feature.

## 3. About the Application

WaterPulse is a water contamination reporting platform. Citizens report
contamination, authorities and admins review reports, assign tasks and
manage safe zones.

- **Frontend:** React (Vite), React Router, Tailwind CSS
- **Backend:** Node.js, Express 5
- **Database:** MongoDB (Mongoose)
- **Roles:** citizen, authority, admin

## 4. Vulnerabilities Found and Fixed

We found 14 vulnerabilities across 6 OWASP Top 10 (2021) categories. We fixed 11 of them.

| ID | Vulnerability | OWASP 2021 | Status |
|---|---|---|---|
| V1 | Unauthenticated admin/authority account creation | A01 | Fixed |
| V2 | Hardcoded fallback JWT secret | A02 | Fixed |
| V3 | NoSQL injection through unsanitized input | A03 | Fixed |
| V4 | IDOR on task details endpoint | A01 | Fixed |
| V5 | Public safe-zone endpoints leaking data | A01 | Fixed |
| V6 | HTML injection in outbound emails | A03 | Fixed |
| V7 | No rate limiting on authentication | A07 | Fixed |
| V8 | Internal error messages leaked to clients | A05 | Fixed |
| V9 | JWT missing issuer/audience claims | A07 | Not fixed |
| V10 | JWT in localStorage, 7-day expiry, no revocation | A07 | Not fixed |
| V11 | Inconsistent coordinate validation | A04 | Not fixed |
| V12 | Missing security headers (no Helmet) | A05 | Fixed |
| V13 | Hardcoded CORS configuration | A05 | Fixed |
| V14 | Implicit request body size limit | A04 | Fixed |

The reasons for the three unfixed items (V9, V10, V11) are explained in the
report (Section 6).

## 5. OAuth / OpenID Connect Feature

We added **Sign in / Sign up with Google** using OpenID Connect
(Authorization Code flow).

- The server verifies the Google ID token (signature, issuer, audience, expiry)
- CSRF protection uses a `state` value bound to an httpOnly cookie
- The JWT is passed to the frontend through a short-lived, single-use code,
  never in the URL
- If the Google email matches an existing account, the two are linked
  instead of creating a duplicate
- The existing email/password login still works

## 6. Running the Project Locally

### Prerequisites
- Node.js 18 or higher
- A MongoDB database (local or Atlas)
- A Google OAuth Client ID and Secret (for the Google login feature)

### Backend
    cd backend
    npm install
    # create backend/.env using .env.production.example as a template
    npm run dev

### Frontend
    cd frontend
    npm install
    npm run dev

The backend runs on http://localhost:5000 and the frontend on http://localhost:5173.

### Environment variables (backend/.env)
    MONGO_URI=
    JWT_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

Real values are not included in this repository for security reasons.

Note: the Google login only works for Google accounts added as test users
in our Google Cloud project, because the OAuth app is in testing mode.

## 7. Testing Tools Used

- Manual source code review (white-box)
- Manual exploit testing with curl / PowerShell (black-box)
- OWASP ZAP (automated black-box scan)
- npm audit (dependency check)

## 8. Documentation

The full report (PDF) is included in the submission zip.