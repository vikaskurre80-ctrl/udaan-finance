# UdaanWorks - Final Logic Specification (Phase 2)

## 1. Main Goal
Track for each client:
- Payment total, billed amount, reel package size.
- Completed and pending reels.
- Team members assigned to the work and their payments.
- Automatic finance tracking for both clients and team.

## 2. Client System (Core)
### Add Client
Admin adds a new client with the following fields:
- Client Name
- Shop Name
- Location
- Package Price (e.g., ₹6000)
- Total Reels (e.g., 12)
- Price Per Reel (Auto-calculated: ₹6000 / 12 = ₹500, default fallback ₹500)
- Start Date
- Due Date
- Payment Status

### Client Dashboard (Tracker)
Each client has a dedicated tracker displaying:
- **Package Value:** e.g., ₹6000
- **Total Reels:** e.g., 12
- **Completed Reels:** Auto-calculated based on approved videos.
- **Pending Reels:** Total - Completed.
- **Total Earned (Revenue):** Completed Reels * Price Per Reel.
- **Remaining Amount:** Package Value - Total Earned.
- **Payment Received:** Total amount collected.
- **Pending Collection:** Total Earned - Payment Received (or Package - Received depending on view preference).
- **Progress Bar:** Visual indicator of Completed / Total Reels.

## 3. Video System
### Add Video
Admin form to add a video:
1. **Select Client:** (Dropdown)
2. **Video Name:** (e.g., Kurta Promo Reel)
3. **Date**
4. **Assign Team:** (Checkboxes for roles)
   - Shooter (e.g., Dhanewar)
   - Editor (e.g., Aishwarya)
   - SMM (e.g., Chitransh)
   - Ads (e.g., Anurag)
   - Client Manager (e.g., Pravin)
5. **Notes**

### Automatic Actions (On Video Creation/Approval)
- Client's **Completed Reels** increments by 1.
- Client's **Pending Reels** decrements by 1.
- Revenue (Total Earned) updates.
- **Team Salary Auto Split:** (When admin approves the video completion)
  - Shooter: ₹100
  - Editor: ₹150
  - SMM: ₹50
  - Ads: ₹50
  - Client Manager: ₹50
  - Company Fund: ₹100

## 4. Team Dashboard
- Members see available assigned videos.
- They can select a video, mark it as **"Completed"**, and add a note (e.g., "Outdoor shoot completed").
- Status becomes pending admin approval.

## 5. Approval Logic
- **Before approval:** No salary added to the team member.
- **After Admin Approval:** Salary automatically updates for the team member.

## 6. Client Finance Tracking
Admin sees a master table:
| Client | Total | Received | Pending | Reels Done |
|---|---|---|---|---|
| Boyzone | ₹6000 | ₹3000 | ₹3000 | 7/12 |

### Client Payment Button
Admin can click **+ Payment Received** and enter an amount.
- This updates `Total Received` and auto-calculates `Pending Collection`.

## 7. Monthly Save System
- Data should be accessible by month (e.g., June 2026, July 2026).
- Admin can view previous months, edit, add, delete, and download reports.

## 8. Premium UI Style
- **Theme:** White Luxury (Apple + Stripe + Notion inspired).
- **Visuals:** Premium white, soft grey, minimal, smooth cards, rounded corners, soft shadows, beautiful graphs, clean spacing.
