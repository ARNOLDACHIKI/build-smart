# Build Buddy AI — User Guide & Mock Login Accounts

This guide explains how a user can run and use the website end-to-end, including test accounts for each role.

## 1) Start the website locally

From the project root:

```bash
npm run dev
```

Expected local URLs:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`

---

## 2) Login process

1. Open `http://localhost:8080/login`
2. Enter email + password from the mock account list below
3. After login, the app routes by role:
   - `USER` → `/dashboard`
   - `ENGINEER` → `/engineer`
   - `ADMIN` → `/admin`
   - Other specialized roles → `/portal`

---

## 3) Mock users and login credentials

> All seeded demo users use the same password: **`123456`**

| Role | Name | Email | Password |
|---|---|---|---|
| USER | Ivy Naliaka | ivy@gmail.com | 123456 |
| ADMIN | Platform Admin | admin@gmail.com | 123456 |
| ENGINEER | David Mwangi | david@gmail.com | 123456 |
| ENGINEER | Grace Njeri | grace@gmail.com | 123456 |
| ENGINEER | Joseph Otieno | joseph@gmail.com | 123456 |
| LABOURER | Kevin Kamau | kevin@gmail.com | 123456 |
| CEMENT_SUPPLIER | Brenda Achieng | brenda@gmail.com | 123456 |
| GENERAL_SUPPLIER | Brian Kiptoo | brian@gmail.com | 123456 |
| DEVELOPER | Faith Wanjiku | faith@gmail.com | 123456 |
| FINANCIER | Samuel Mutiso | samuel@gmail.com | 123456 |
| CONTRACTOR | Hassan Ali | hassan@gmail.com | 123456 |
| REAL_ESTATE | Lillian Atieno | lillian@gmail.com | 123456 |
| CONSULTANT | Mary Akinyi | mary@gmail.com | 123456 |
| TENANT | Esther Wambui | esther@gmail.com | 123456 |
| PROJECT_MANAGER | Patrick Odhiambo | patrick@gmail.com | 123456 |
| REGULATOR | Dorcas Chebet | dorcas@gmail.com | 123456 |
| LOCAL_STAKEHOLDER | Moses Kariuki | moses@gmail.com | 123456 |

---

## 4) Suggested user processes (realistic demo flows)

## A) Normal client flow (`USER`)
Login with:
- Email: `ivy@gmail.com`
- Password: `123456`

Then:
1. Go to dashboard home
2. Open assistant and send a request such as:
   - "Contact QS Mary Akinyi about building a 7-storey apartment in Kaloleni and ask their budget"
3. Check:
   - `Dashboard > Messages`
   - `Dashboard > Notifications`
4. Track replies from contacted professionals

## B) Professional reply flow (`CONSULTANT` or `ENGINEER`)
Login with:
- Consultant example: `mary@gmail.com`
- Engineer example: `david@gmail.com`
- Password: `123456`

Then:
1. Open inbox (`/portal/inbox` for consultant-like roles, `/engineer/inbox` for engineers)
2. Open incoming inquiry
3. Send a reply
4. Confirm status changes and message appears in notifications/inbox

## C) Admin flow (`ADMIN`)
Login with:
- Email: `admin@gmail.com`
- Password: `123456`

Then:
1. Open `/admin`
2. Review users/projects/subscriptions/logs
3. Open AI/admin settings pages for controls and monitoring

---

## 5) Key pages by role

- `USER`: Dashboard, Projects, Tasks, Notifications, Messages, Profile
- `ENGINEER`: Home, Inbox, Notifications, Projects, Portfolio, Analytics
- `SPECIALIZED PORTAL ROLES`: Portal Home, Inbox, Notifications, Tasks, Marketplace, Network
- `ADMIN`: Overview, Users, Projects, Subscriptions, Content, Logs, AI, Settings

---

## 6) Notes for testers

- Mock accounts are seeded automatically by backend startup logic.
- These credentials are for development/demo only.
- In production, use strong unique passwords and disable any dev bypass settings.
