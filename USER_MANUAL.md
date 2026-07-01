# Web Admin User Manual

## 1. Introduction
This user manual is written for end users of the Web Admin portal. It explains how to use the application, navigate the interface, and complete operational tasks such as creating jobs, managing clients, uploading documents, and reviewing reports.

This manual does not cover developer setup, source code, or backend implementation.

## Table of Contents
1. [Introduction](#1-introduction)
2. [How to Use This Manual](#2-how-to-use-this-manual)
3. [Getting Started](#3-getting-started)
   - [Login Page](#31-login-page)
   - [Forgot Password](#32-forgot-password)
   - [After Login](#33-after-login)
4. [Application Layout and Navigation](#4-application-layout-and-navigation)
   - [Main Layout](#41-main-layout)
   - [Sidebar and Search](#42-sidebar-and-search)
   - [Top Actions and Notifications](#43-top-actions-and-notifications)
5. [Dashboard](#5-dashboard)
   - [Dashboard Overview](#51-dashboard-overview)
   - [What to Use the Dashboard For](#52-what-to-use-the-dashboard-for)
6. [Jobs](#6-jobs)
   - [Jobs Page](#61-jobs-page)
   - [Job List](#62-job-list)
   - [Create Job Page](#63-create-job-page)
   - [Job Details Page](#64-job-details-page)
   - [Edit Job](#65-edit-job)
7. [Clients](#7-clients)
   - [Clients Page](#71-clients-page)
   - [Create Client Page](#72-create-client-page)
8. [Users](#8-users)
   - [Users Page](#81-users-page)
   - [Create User Page](#82-create-user-page)
   - [User Actions](#83-user-actions)
9. [Branches](#9-branches)
   - [Branches Page](#91-branches-page)
   - [Create Branch Page](#92-create-branch-page)
10. [Assets / Equipment](#10-assets--equipment)
   - [Assets Page](#101-assets-page)
   - [Create Asset Page](#102-create-asset-page)
11. [Documents](#11-documents)
   - [Documents Page](#111-documents-page)
   - [Upload Document Page](#112-upload-document-page)
   - [Document Organization](#113-document-organization)
12. [Chat](#12-chat)
   - [Chat Page](#121-chat-page)
13. [Notifications](#13-notifications)
   - [Notifications Page](#131-notifications-page)
   - [Notification Templates and Sending](#132-notification-templates-and-sending)
14. [Media](#14-media)
   - [Media Page](#141-media-page)
15. [Live Tracking](#15-live-tracking)
   - [Live Tracking Page](#151-live-tracking-page)
16. [Reports](#16-reports)
   - [Reports Dashboard](#161-reports-dashboard)
   - [Report Filters](#162-report-filters)
17. [Audit Logs](#17-audit-logs)
   - [Audit Logs Page](#171-audit-logs-page)
18. [Settings](#18-settings)
   - [Settings Page Overview](#181-settings-page-overview)
   - [Profile](#182-profile)
   - [Preferences](#183-preferences)
   - [Security](#184-security)
   - [Operations (Super Admin Only)](#185-operations-super-admin-only)
19. [Common Workflows](#19-common-workflows)
   - [Create and Assign a Job](#191-create-and-assign-a-job)
   - [Upload a Document for a Client](#192-upload-a-document-for-a-client)
   - [Add a New User](#193-add-a-new-user)
   - [Create a New Branch](#194-create-a-new-branch)
   - [Add a New Asset](#195-add-a-new-asset)
   - [Approve a Submitted Job Report](#196-approve-a-submitted-job-report)
20. [Tips and Best Practices](#20-tips-and-best-practices)
21. [Support](#21-support)
22. [Glossary of Terms](#22-glossary-of-terms)

## 2. How to Use This Manual
- Read the sections for the pages you use most often.
- Follow step-by-step instructions for common workflows.
- Use the glossary of features when you need detailed descriptions of buttons, filters, and fields.
- Refer to the support section if you encounter issues.

## 3. Getting Started

### 3.1 Login Page
The login page is the first screen you see when you open the portal.

Available fields and controls:
- **Email Address**: Enter your work email.
- **Password**: Enter your password.
- **Show password**: Click the eye icon to reveal or hide the password.
- **Remember me**: Optionally keep your session active.
- **Forgot password?**: Click this link if you need to reset your password.
- **Sign In**: Click to log in.

### 3.2 Forgot Password
1. Click **Forgot password?**.
2. Enter your email address.
3. Click **Send Reset Email**.
4. Check your inbox for the reset link.
5. Follow the email instructions to reset your password.

### 3.3 After Login
After successful login, you are taken to the admin dashboard.

If login fails:
- Verify email and password.
- Make sure your account is active.
- Contact your system administrator if you still cannot log in.

## 4. Application Layout and Navigation

### 4.1 Main Layout
The portal uses a left sidebar for navigation and a main content area for pages.

Key navigation sections:
- **Overview**: Dashboard
- **Operations**: Jobs, Inspections, Trainings, Assets, Renewals, Scheduling
- **Collaboration**: Chat, Documents, Media, Notifications
- **Monitoring**: Live Tracking
- **Management**: Clients, Users, Branches
- **Analytics**: Reports
- **System**: Audit Logs, Settings

### 4.2 Sidebar and Search
- Use the sidebar to move between sections.
- If a section is missing, your role may not have access.
- Use the search box in the sidebar to quickly jump to pages by name.

### 4.3 Top Actions and Notifications
Some pages show action buttons at the top right, including:
- **Create** buttons
- **Export** options
- **Filters**
- **Search** fields

The header may also show notifications and user menu options.

## 5. Dashboard

### 5.1 Dashboard Overview
The dashboard provides a summary of operational metrics and live activity.

Common dashboard elements:
- KPI cards such as **Total Jobs**, **Open Jobs**, **In Progress**, **Submitted**, **Closed**, and **Total Users**.
- A **Jobs by Status** chart showing open, assigned, in progress, approved, rejected, and closed jobs.
- A **Jobs by Branch** chart showing workload distribution by branch.
- For super admins, a **Live Tracking** shortcut to view active field team locations.

### 5.2 What to Use the Dashboard For
- Quickly check overall job volume and status.
- Identify branches with the highest job count.
- Access the live tracking page if your role supports it.
- Use the dashboard as a starting point for operational decisions.

## 6. Jobs

### 6.1 Jobs Page
The Jobs page is the central place for managing field work.

Controls and features:
- **Search box**: Find jobs by job ID, client name, engineer name, or title.
- **Status filter**: Filter jobs by assigned, in progress, submitted, approved, completed, closed, or rejected.
- **More Filters**: pending filter options for extended search.
- **Export**: Download filtered job data to Excel or PDF.
- **Create New Job**: Opens the job creation form.

### 6.2 Job List
Each row in the job list displays:
- Job number (short ID)
- Client and job title
- Assigned engineer
- Trainer
- Sales person
- Scheduled date
- Priority
- Status badge
- Actions for editing and deleting

Click a row or the job ID to open the job details page.

### 6.3 Create Job Page
Use this form to add new jobs.

Form fields:
- **Client**: Select the client for the job.
- **Branch**: Choose the applicable branch.
- **Asset / Equipment**: Optionally link an asset.
- **Assigned To**: Choose the engineer responsible for the job.
- **Trainer**: Optionally assign a trainer.
- **Sales Person**: Optionally assign a sales person.
- **Title**: Enter the job title.
- **Description**: Provide job instructions or notes.
- **Status**: Default is **assigned**; other statuses may be available.
- **Priority**: Choose low, medium, high, or urgent.
- **Type**: Either **inspection** or **training**.
- **Site Address**: Enter the site address.
- **Site Latitude / Longitude**: Optionally enter coordinates.
- **Scheduled Date**: Choose the start date.
- **Due Date**: Optionally choose a due date.

Behavior:
- If coordinates are missing and an address is provided, the system attempts to geocode the address.
- When users are assigned, the system may send notification messages automatically.

Save the job to return to the job list.

### 6.4 Job Details Page
The job details page shows a job overview and action controls.

Displayed information includes:
- Job title and status badge
- Short job number
- Client name
- Assigned engineer, trainer, and sales person
- Job type (Inspection or Training)
- Scheduled date
- Site address and coordinates
- Priority level
- Description / instructions

Actions available:
- **Back** to return to the jobs list.
- **Edit Job** to change details.
- **Approve Report** if a submitted job is ready for approval.
- **Open Chat** to discuss the job with the team.

### 6.5 Edit Job
The Edit Job page uses the same fields as Create Job.

Common edits:
- Change status to **in progress**, **submitted**, **approved**, or **closed**.
- Reassign the engineer, trainer, or sales person.
- Update the site address or coordinates.
- Modify scheduled or due dates.

After saving, changes apply immediately and update the job list.

## 7. Clients

### 7.1 Clients Page
Use the Clients page to manage customer profiles.

Features:
- Browse client records.
- Search clients by name.
- Create new clients.
- Edit existing client details.

### 7.2 Create Client Page
Fields include:
- **Client Name**: Required.
- **Primary Contact**: Optional.
- **Email**: Optional.
- **Phone**: Optional.
- **City**: Optional.
- **Country**: Select from available countries.
- **Address**: Optional full address.

Use this page to add a new client that can be assigned to jobs, documents, and assets.

## 8. Users

### 8.1 Users Page
The Users page is for managing system accounts.

Features:
- Search users by name, email, or role.
- Filter by branch, role, or active/inactive status.
- View total users and role summaries.
- Create new users.
- Edit or delete existing users.

### 8.2 Create User Page
Fields include:
- **First Name**: Required.
- **Last Name**: Required.
- **Email**: Required.
- **Password**: Required; show/hide password available.
- **Phone**: Optional.
- **Role**: Choose from super_admin, admin, coordinator, operation_manager, engineer, trainer, or sales.
- **Branch**: Optional branch assignment.
- **Status**: Active or inactive.

Additional information:
- Password strength is shown while typing.
- New users are provisioned through a backend function.

### 8.3 User Actions
From the Users page, you can:
- Open a user record for details.
- Edit profile and role.
- Delete users when needed.

## 9. Branches

### 9.1 Branches Page
Branches represent locations or field offices.

Each branch card displays:
- Branch name
- Country and city
- Number of employees
- Active jobs count
- Contact email or phone
- Edit and delete actions

### 9.2 Create Branch Page
Fields include:
- **Branch Name**: Required.
- **Country**: Select an existing country or add a new one.
- **City**: Optional.
- **Postal Code**: Optional.
- **Address**: Optional.
- **Phone**: Optional.
- **Email**: Optional.

Use this page to add new operational locations to the system.

## 10. Assets / Equipment

### 10.1 Assets Page
The Assets page displays equipment records.

Available features:
- Search assets by ID, name, or type.
- Export asset data to CSV, Excel, or PDF.
- Add a new asset.
- Edit or delete assets.

Each asset card includes:
- Asset ID
- Name and type
- Serial number and model
- Client and branch assignment
- Status and inspection dates
- Optional photo or QR code preview

### 10.2 Create Asset Page
Fields include:
- **Equipment Name**: Required.
- **Type**: Optional.
- **Model**: Optional.
- **Serial Number**: Optional.
- **Client**: Optional.
- **Branch**: Optional.
- **Status**: Choose Active, Under Maintenance, or Inactive.
- **Installation Date**: Optional.
- **Last Inspection Date**: Optional.
- **Next Inspection Date**: Optional.
- **Manufacturer**: Optional.
- **Photo Upload**: Upload an image preview for the asset.

Behavior:
- Photo uploads are stored in the media storage.
- After saving, the asset is listed on the Assets page.

## 11. Documents

### 11.1 Documents Page
The Documents page manages files and folders.

Features:
- Search documents by title, description, client, or asset.
- Browse by folder, category, client, or asset.
- Switch between grid and list views.
- Create new folders.
- Delete documents or folders.

The page organizes documents into:
- **Folders** (root and nested)
- **Categories** such as Procedure, Drawing, Certificate, Template, or Client Attachment
- **By Client** and **By Asset** groups

### 11.2 Upload Document Page
Fields include:
- **Document Name**: Required.
- **Type**: Required (Procedure, Drawing, Certificate, Template, Client Attachment).
- **Version**: Recommended (for document versioning).
- **Expiry Date**: Optional.
- **Client**: Optional.
- **Asset**: Optional.
- **Folder**: Optional.
- **Description**: Optional details or notes.
- **File**: Choose a PDF, image, or document file.

Behavior:
- Selecting a client filters linked assets.
- The file is uploaded to storage and the public link is attached to the document record.
- The document appears in Documents after saving.

### 11.3 Document Organization
Use folders and groups to keep files organized:
- Create folders for departments, projects, or document types.
- Use category tiles to filter documents by type.
- Browse by client or asset when attaching documents to records.

## 12. Chat

### 12.1 Chat Page
The Chat page is used for team messaging.

Use this page to:
- Send messages to colleagues.
- Collaborate on jobs and operational issues.
- Open job-related chats from the Job Details page.

## 13. Notifications

### 13.1 Notifications Page
Notifications show alerts for job assignments, approvals, and updates.

Use this page to:
- Review unread and recent notifications.
- Mark notifications as read.

### 13.2 Notification Templates and Sending
Some portal functions support notification templates.

Use templates when sending messages to:
- notify users about job assignments
- announce changes or updates
- send reminders

## 14. Media

### 14.1 Media Page
Media stores uploaded images, videos, and related assets.

The page may include:
- photo review
- video management
- approval workflows
- watermarked media viewer

Use this page to review and approve uploaded media.

## 15. Live Tracking

### 15.1 Live Tracking Page
Live Tracking is available for super admins and shows active field team locations.

Features:
- View engineers and staff on a map.
- Monitor current location updates.
- Open the tracking page from the dashboard link.

This page is useful for tracking field movement and verifying job coverage.

## 16. Reports

### 16.1 Reports Dashboard
The Reports page provides analytics on operations.

Available report types include:
- Inspection Approvals
- Jobs Report
- Engineers Report
- Users Report
- Branches Report
- Documents Report
- Renewals Report
- Audit Logs

Features:
- Select report type from the dropdown.
- Use date range filters to narrow results.
- Save or export report data.

### 16.2 Report Filters
Common filters include:
- **Date From / Date To**: limit results to a date window.
- **Role Filter**: show only engineers, admins, or specific roles.
- **User Filter**: focus on a single user.

Use reports to track team performance, compliance, and job activity.

## 17. Audit Logs

### 17.1 Audit Logs Page
Audit Logs record system actions and user activity.

Use this page to:
- Search logs by user or action
- Review events within a date range
- Investigate changes and approvals

Logs are useful for tracking what happened and who made changes.

## 18. Settings

### 18.1 Settings Page Overview
Settings contains profile, preferences, security, and operations tabs.

Tabs include:
- **Profile**
- **Preferences**
- **Security**
- **Operations** (visible only to super admins)

### 18.2 Profile
Update personal information:
- **First Name**
- **Last Name**
- **Phone**
- **Email** (read-only)

Save changes to update your profile.

### 18.3 Preferences
Adjust personal preferences:
- **Timezone**: set your local time zone.
- **Language**: choose English or Arabic.

Save preferences to apply them immediately.

### 18.4 Security
Use this section to:
- Reset your password via email.
- Manage account access if available.

### 18.5 Operations (Super Admin Only)
Super admins can update operational settings such as:
- **Geofence radius**

Save changes when you update operational parameters.

## 19. Common Workflows

### 19.1 Create and Assign a Job
1. Open **Jobs**.
2. Click **Create New Job**.
3. Fill in:
   - Client
   - Branch
   - Assigned Engineer
   - Title and description
   - Status and priority
   - Site address or coordinates
   - Scheduled date
4. Click **Create Job**.
5. Verify the job appears in the job list.

### 19.2 Upload a Document for a Client
1. Open **Documents**.
2. Click **Upload Document**.
3. Enter:
   - Document name
   - Type
   - Version
   - Client and asset (optional)
   - Folder (optional)
   - Description
4. Pick a file and click **Save**.
5. Confirm the document appears in the correct folder or group.

### 19.3 Add a New User
1. Open **Users**.
2. Click **Add New User**.
3. Enter name, email, password, phone, role, and branch.
4. Save the user.
5. Confirm the user appears in the user list.

### 19.4 Create a New Branch
1. Open **Branches**.
2. Click **Add New Branch**.
3. Enter branch name, country, city, and contact details.
4. Save the branch.
5. Confirm it appears in the branch cards.

### 19.5 Add a New Asset
1. Open **Assets**.
2. Click **Add New Asset**.
3. Enter equipment name, type, serial number, client, branch, and status.
4. Upload a photo if available.
5. Save the asset.
6. Confirm it appears in the equipment list.

### 19.6 Approve a Submitted Job Report
1. Open **Jobs**.
2. Find a job with **Submitted** status.
3. Click the job ID to open details.
4. Click **Approve Report**.
5. Confirm the status changes to **Approved**.

## 20. Tips and Best Practices
- Keep data accurate for clients, branches, and assets.
- Use clear job titles and descriptions.
- Assign the correct engineer and trainer to reduce errors.
- Upload documents to the correct folder and category.
- Review notifications daily to stay up to date.
- Use reports to monitor job progress, inspections, and team performance.

## 21. Support
If you need help, contact your administrator or support team. Provide the relevant job, client, asset, or user details when requesting assistance.

## 22. Glossary of Terms
- **Job**: a field assignment such as an inspection or training.
- **Client**: the customer or company for whom the job is performed.
- **Branch**: a physical location or operational office.
- **Asset / Equipment**: a piece of equipment or item tracked in the system.
- **Document**: a file such as a procedure, drawing, certificate, or form.
- **Notification**: an alert sent to users about assignments or updates.
- **Audit Log**: a record of system actions and user activity.
- **Live Tracking**: real-time location monitoring for field staff.
