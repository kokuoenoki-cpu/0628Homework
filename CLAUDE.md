# CLAUDE.md — Finance KPI Dashboard (ฝ่ายบัญชี/การเงิน)

## Project Overview

Dashboard สำหรับติดตาม KPI ของทีมบัญชี/การเงิน ใช้ภายในองค์กร
**ข้อมูลทั้งหมดเก็บใน Browser Local Storage** — ไม่มี backend, ไม่มี database ภายนอก, Deploy ได้ทันทีบน Vercel

---

## Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Framework   | Next.js 16 (App Router, TypeScript)    |
| Styling     | Tailwind CSS v4                        |
| Charts      | Recharts (dynamic import, ssr: false)  |
| Icons       | Lucide React                           |
| Storage     | Browser Local Storage (ไม่มี DB)       |
| Hosting     | Vercel                                 |

> **ห้ามใช้**: Supabase, Firebase, PostgreSQL, MySQL, Prisma หรือ Database ใดๆ ทั้งสิ้น

---

## KPI 4 กลุ่มหลัก

### กลุ่ม 1 — AR/AP & กระแสเงินสด

| KPI                       | คำอธิบาย                                          |
|---------------------------|---------------------------------------------------|
| ยอด AR คงค้าง (฿)         | ลูกหนี้การค้ารวม ณ ปัจจุบัน                       |
| ยอด AP คงค้าง (฿)         | เจ้าหนี้การค้ารวม ณ ปัจจุบัน                      |
| DSO (วัน)                 | Days Sales Outstanding — AR ÷ รายได้/วัน          |
| DPO (วัน)                 | Days Payable Outstanding — AP ÷ COGS/วัน          |
| กระแสเงินสดสุทธิ (฿)      | Inflow − Outflow รายเดือน                         |
| AR เกินกำหนด (%)          | สัดส่วน Invoice เลยครบกำหนดเกิน 30 วัน            |
| Collection Rate (%)       | ยอดเก็บได้จริง ÷ ยอด AR ที่ครบกำหนด               |

### กลุ่ม 2 — ปิดงบ & งานบัญชี

| KPI                        | คำอธิบาย                                         |
|----------------------------|--------------------------------------------------|
| วันปิดงบ (วัน)              | จำนวนวันนับจากสิ้นเดือนถึงวันที่ปิดงบสำเร็จ      |
| งานที่ค้างอยู่ (%)          | สัดส่วน Accounting Task ที่ยังไม่เสร็จ           |
| งานเสร็จตรงเวลา (%)         | Task ที่ complete ก่อนหรือตรง due date            |
| ข้อผิดพลาดบัญชี (รายการ)    | จำนวน journal entries ที่ต้องแก้ไขในเดือนนั้น    |
| Reconciliation Rate (%)    | บัญชีที่ reconcile เสร็จแล้ว ÷ บัญชีทั้งหมด      |

### กลุ่ม 3 — งบประมาณ & กำไร

| KPI                        | คำอธิบาย                                         |
|----------------------------|--------------------------------------------------|
| รายได้จริง vs งบ (%)        | Actual Revenue ÷ Budgeted Revenue × 100          |
| ค่าใช้จ่ายจริง vs งบ (%)    | Actual Expense ÷ Budgeted Expense × 100          |
| กำไรขั้นต้น / Gross Margin (%) | (Revenue − COGS) ÷ Revenue × 100             |
| กำไรสุทธิ / Net Margin (%) | Net Profit ÷ Revenue × 100                       |
| Budget Variance (฿)        | ผลต่างระหว่าง Actual กับ Budget รายแผนก           |
| EBITDA (฿)                 | Earnings Before Interest, Tax, Depreciation      |

### กลุ่ม 4 — ภาษี & Compliance

| KPI                        | คำอธิบาย                                         |
|----------------------------|--------------------------------------------------|
| ภาษียื่นตรงเวลา (%)         | ประเภทภาษีที่ยื่นทันกำหนด ÷ ทั้งหมด              |
| ภาษีค้างยื่น (รายการ)       | จำนวนประเภทภาษีที่เลย due date แล้ว              |
| ภาษีมูลค่าเพิ่ม VAT (฿)    | ยอด Output VAT − Input VAT รายเดือน              |
| ภาษีหัก ณ ที่จ่าย (฿)       | ยอด WHT สะสมรายเดือน                             |
| Compliance Score (%)       | ข้อกำหนดที่ปฏิบัติตาม ÷ ข้อกำหนดทั้งหมด          |
| วันชำระภาษีถัดไป            | นับถอยหลังถึง due date ที่ใกล้ที่สุด             |

---

## Data Model (Local Storage)

ทุก key ขึ้นต้นด้วย `fkd_` เพื่อไม่ชนกับ app อื่นใน localStorage

### `fkd_ar_entries` — ลูกหนี้การค้า

```typescript
interface AREntry {
  id: string;
  invoiceNo: string;          // เลขที่ใบแจ้งหนี้
  customerName: string;       // ชื่อลูกค้า
  amount: number;             // จำนวนเงิน (บาท)
  invoiceDate: string;        // ISO date: "2024-01-15"
  dueDate: string;            // ISO date
  status: 'pending' | 'overdue' | 'paid' | 'partial';
  paidAmount?: number;
  paidDate?: string;
  notes?: string;
  createdAt: string;          // ISO datetime
}
```

### `fkd_ap_entries` — เจ้าหนี้การค้า

```typescript
interface APEntry {
  id: string;
  invoiceNo: string;
  vendorName: string;         // ชื่อผู้ขาย/ซัพพลายเออร์
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  paidDate?: string;
  category: string;           // ค่าวัตถุดิบ | ค่าบริการ | ค่าสาธารณูปโภค | อื่นๆ
  notes?: string;
  createdAt: string;
}
```

### `fkd_cashflow` — กระแสเงินสด

```typescript
interface CashFlowEntry {
  id: string;
  date: string;               // ISO date
  type: 'inflow' | 'outflow';
  category: string;           // operations | investing | financing
  subCategory: string;        // หมวดย่อย
  amount: number;
  description: string;
  reference?: string;         // เลขที่เอกสารอ้างอิง
  createdAt: string;
}
```

### `fkd_accounting_tasks` — งานบัญชี/ปิดงบ

```typescript
interface AccountingTask {
  id: string;
  taskName: string;           // ชื่องาน (ภาษาไทย)
  category: 'reconciliation' | 'journal' | 'report' | 'audit' | 'other';
  assignedTo: string;         // ชื่อผู้รับผิดชอบ
  month: string;              // YYYY-MM
  dueDate: string;            // ISO date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: string;
  errorCount: number;         // จำนวน errors ที่พบ (0 = ไม่มี)
  notes?: string;
  createdAt: string;
}
```

### `fkd_budget_items` — งบประมาณรายแผนก

```typescript
interface BudgetItem {
  id: string;
  month: string;              // YYYY-MM
  department: string;         // ชื่อแผนก
  category: string;           // หมวดค่าใช้จ่าย
  budgetAmount: number;       // งบประมาณที่ตั้งไว้
  actualAmount: number;       // ค่าใช้จ่ายจริง
  notes?: string;
  updatedAt: string;
}
```

### `fkd_profit_data` — ข้อมูลกำไร-ขาดทุน

```typescript
interface ProfitData {
  id: string;
  month: string;              // YYYY-MM
  revenue: number;            // รายได้รวม
  cogs: number;               // ต้นทุนขาย (Cost of Goods Sold)
  operatingExpenses: number;  // ค่าใช้จ่ายดำเนินงาน
  interestExpense: number;    // ดอกเบี้ยจ่าย
  taxExpense: number;         // ภาษีเงินได้นิติบุคคล
  otherIncome: number;        // รายได้อื่น
  otherExpenses: number;      // ค่าใช้จ่ายอื่น
  depreciation: number;       // ค่าเสื่อมราคา
  updatedAt: string;
}
```

### `fkd_tax_records` — บันทึกภาษี

```typescript
interface TaxRecord {
  id: string;
  taxType: 'VAT' | 'CIT' | 'WHT' | 'PND1' | 'PND3' | 'PND53' | 'PP30' | 'other';
  period: string;             // YYYY-MM
  dueDate: string;            // ISO date
  amount: number;             // จำนวนเงินภาษี
  status: 'pending' | 'filed' | 'paid' | 'overdue';
  filedDate?: string;
  paidDate?: string;
  referenceNo?: string;       // เลขอ้างอิงการยื่น
  notes?: string;
  createdAt: string;
}
```

### `fkd_compliance_items` — รายการ Compliance

```typescript
interface ComplianceItem {
  id: string;
  name: string;               // ชื่อข้อกำหนด (ภาษาไทย)
  category: string;           // legal | tax | accounting | regulatory
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  nextDueDate: string;        // ISO date
  lastCompletedDate?: string;
  status: 'compliant' | 'pending' | 'overdue' | 'not_applicable';
  responsiblePerson: string;
  notes?: string;
  updatedAt: string;
}
```

---

## Conventions

### ภาษา UI
- **ทุก label, หัวข้อ, ปุ่ม, ข้อความใน UI = ภาษาไทย**
- ชื่อ component, ไฟล์, ตัวแปร, function = ภาษาอังกฤษ
- Error message = ภาษาไทย เช่น `"กรุณากรอกจำนวนเงิน"`
- Placeholder = ภาษาไทย เช่น `"เช่น INV-2024-001"`

### ตัวเลขและสกุลเงิน
```typescript
// ฟอร์แมตเงิน: ใส่ comma + สกุล ฿
formatCurrency(1234567.50)  // → "฿1,234,567.50"
formatCurrency(0)           // → "฿0"

// ใช้ Intl.NumberFormat เสมอ — ไม่เขียน formatter เอง
new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(amount)
```

- เปอร์เซ็นต์: ทศนิยม 1 ตำแหน่ง เช่น `85.3%`
- วันที่แสดง: `15 ม.ค. 2567` — locale `th-TH`
- วันที่เก็บใน data: ISO 8601 เสมอ เช่น `"2024-01-15"`

### Naming Conventions
| สิ่งที่ตั้งชื่อ          | รูปแบบ                | ตัวอย่าง                    |
|--------------------------|----------------------|-----------------------------|
| React Component          | PascalCase           | `KpiCard`, `ArTable`        |
| Hook                     | camelCase + use      | `useArData`, `useTaxData`   |
| Pure function / util     | camelCase            | `formatCurrency`, `calcDSO` |
| Constant                 | SCREAMING_SNAKE_CASE | `LS_KEYS`, `TAX_TYPES`      |
| Folder / file            | kebab-case           | `ar-table.tsx`              |

### Status Badge สี
| Status               | Tailwind classes                          |
|----------------------|-------------------------------------------|
| สำเร็จ / ชำระแล้ว   | `bg-emerald-100 text-emerald-700`         |
| รอดำเนินการ          | `bg-amber-100 text-amber-700`             |
| เกินกำหนด / ค้างชำระ | `bg-rose-100 text-rose-700`              |
| กำลังดำเนินการ       | `bg-blue-100 text-blue-700`              |
| ไม่เกี่ยวข้อง        | `bg-gray-100 text-gray-500`              |

### KPI Traffic Light (threshold color)
```typescript
// ยิ่งน้อยยิ่งดี (เช่น วันปิดงบ, วันค้างชำระ)
const lessBetter = (value: number, good: number, warn: number) =>
  value <= good ? 'text-emerald-600' :
  value <= warn ? 'text-amber-600'   :
                  'text-rose-600';

// ยิ่งมากยิ่งดี (เช่น Collection Rate, Compliance Score)
const moreBetter = (pct: number) =>
  pct >= 90 ? 'text-emerald-600' :
  pct >= 70 ? 'text-amber-600'   :
              'text-rose-600';
```

---

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Sidebar + Navbar)
│   ├── page.tsx                  # หน้า Dashboard หลัก (KPI overview ทุกกลุ่ม)
│   ├── ar-ap/
│   │   └── page.tsx              # AR/AP & กระแสเงินสด
│   ├── accounting/
│   │   └── page.tsx              # ปิดงบ & งานบัญชี
│   ├── budget/
│   │   └── page.tsx              # งบประมาณ & กำไร
│   └── tax/
│       └── page.tsx              # ภาษี & Compliance
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Side nav (เมนูภาษาไทย)
│   │   └── Navbar.tsx            # Top bar + วันที่ไทย
│   ├── ui/
│   │   ├── KpiCard.tsx           # Card แสดง metric + trend
│   │   ├── Modal.tsx             # Modal dialog (Escape ปิดได้)
│   │   ├── StatusBadge.tsx       # Badge traffic-light
│   │   ├── ProgressBar.tsx       # Progress + threshold color
│   │   └── EmptyState.tsx        # Placeholder เมื่อไม่มีข้อมูล
│   ├── charts/
│   │   ├── CashFlowChart.tsx     # Area chart กระแสเงินสด
│   │   ├── BudgetBarChart.tsx    # Bar chart งบ vs จริง
│   │   └── KpiTrendChart.tsx     # Line chart trend รายเดือน
│   ├── ar/
│   │   ├── ArTable.tsx           # ตาราง AR + aging bucket
│   │   └── ArForm.tsx
│   ├── ap/
│   │   ├── ApTable.tsx
│   │   └── ApForm.tsx
│   ├── accounting/
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   ├── budget/
│   │   ├── BudgetTable.tsx
│   │   └── BudgetForm.tsx
│   └── tax/
│       ├── TaxTable.tsx
│       └── TaxForm.tsx
│
└── lib/
    ├── constants.ts              # LS_KEYS, TAX_TYPES, DEPARTMENTS, THRESHOLDS
    ├── utils.ts                  # formatCurrency, formatDate, generateId
    ├── kpi.ts                    # คำนวณ KPI ทุกกลุ่ม (pure functions — ไม่มี side effects)
    └── hooks/
        ├── useLocalStorage.ts    # Generic hook
        ├── useArData.ts
        ├── useApData.ts
        ├── useCashFlow.ts
        ├── useAccountingTasks.ts
        ├── useBudget.ts
        └── useTaxData.ts
```

---

## Commands

```bash
# พัฒนา local
npm run dev        # http://localhost:3000

# ตรวจสอบ type + build (ต้องผ่านก่อน push ทุกครั้ง)
npm run build

# ตรวจสอบ code style
npm run lint

# Deploy
# push ขึ้น GitHub → Vercel auto-deploy
# ไม่มี environment variable ใดๆ ทั้งสิ้น
```

---

## Architecture Notes

### Local Storage Pattern
- ทุก hook ใช้ `useLocalStorage<T>(key, initialValue)` เป็น base
- Hydrate จาก localStorage หลัง mount เท่านั้น — ป้องกัน SSR hydration mismatch
- ห้าม access `window.localStorage` โดยตรงใน component — ให้ผ่าน hook เสมอ

### Chart Components
- **ต้อง** ใช้ `dynamic()` + `{ ssr: false }` ทุก Recharts component
  ```typescript
  const CashFlowChart = dynamic(() => import('@/components/charts/CashFlowChart'), { ssr: false });
  ```

### KPI Calculation
- Logic คำนวณทุก KPI อยู่ใน `lib/kpi.ts` เป็น pure functions ทดสอบได้
- Hook แต่ละตัวเรียก functions จาก `kpi.ts` — ไม่ embed logic ใน component
  ```typescript
  // lib/kpi.ts — ตัวอย่าง
  export const calcDSO = (arTotal: number, dailyRevenue: number): number =>
    dailyRevenue > 0 ? arTotal / dailyRevenue : 0;

  export const calcCollectionRate = (collected: number, billed: number): number =>
    billed > 0 ? (collected / billed) * 100 : 0;

  export const calcGrossMargin = (revenue: number, cogs: number): number =>
    revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
  ```

### Vercel Deployment
- ทุก route export เป็น static (`○`) เพราะไม่มี server-side data fetching
- ไม่มี environment variable — ไม่ต้องตั้งค่าใดๆ บน Vercel
- ข้อมูลอยู่ใน browser ของผู้ใช้แต่ละคน — ไม่ shared ข้าม device
