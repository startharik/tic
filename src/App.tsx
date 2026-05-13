import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './pages/dashboard/MainDashboard';
import JobsPage from './pages/dashboard/JobsPage';
import CreateJobPage from './pages/dashboard/CreateJobPage';
import UsersPage from './pages/dashboard/UsersPage';
import BranchesPage from './pages/dashboard/BranchesPage';
import EquipmentPage from './pages/dashboard/EquipmentPage';
import LiveTrackingPage from './pages/dashboard/LiveTrackingPage';
import ReportsDashboard from './pages/dashboard/ReportsDashboard';
import ClientsPage from './pages/dashboard/ClientsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import RenewalsPage from './pages/dashboard/RenewalsPage';
import ScheduleRenewalPage from './pages/dashboard/ScheduleRenewalPage';
import DocumentsPage from './pages/dashboard/DocumentsPage';
import UploadDocumentPage from './pages/dashboard/UploadDocumentPage';
import ChatPage from './pages/dashboard/ChatPage';
import CreateAssetPage from './pages/dashboard/CreateAssetPage';
import CreateUserPage from './pages/dashboard/CreateUserPage';
import CreateBranchPage from './pages/dashboard/CreateBranchPage';
import CreateClientPage from './pages/dashboard/CreateClientPage';
import PlaceholderPage from './pages/dashboard/PlaceholderPage';
import JobDetailsPage from './pages/dashboard/JobDetailsPage';
import EditJobPage from './pages/dashboard/EditJobPage';
import JobTimelinePage from './pages/dashboard/JobTimelinePage';
import JobCalendarPage from './pages/dashboard/JobCalendarPage';
import JobMapPage from './pages/dashboard/JobMapPage';
import AssetDetailsPage from './pages/dashboard/AssetDetailsPage';
import InspectionManagementPage from './pages/dashboard/InspectionManagementPage';
import ReviewInspectionPage from './pages/dashboard/ReviewInspectionPage';
import MediaManagementPage from './pages/dashboard/MediaManagementPage';
import NotificationManagementPage from './pages/dashboard/NotificationManagementPage';
import SuperAdminPanel from './pages/dashboard/SuperAdminPanel';
import AuditLogsPage from './pages/dashboard/AuditLogsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<MainDashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/create" element={<CreateJobPage />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="jobs/:jobId/edit" element={<EditJobPage />} />
          <Route path="jobs/:jobId/assign" element={<PlaceholderPage title="Assign Job" variant="form" />} />
          <Route path="jobs/bulk-assign" element={<PlaceholderPage title="Bulk Assign Jobs" variant="form" />} />
          <Route path="jobs/calendar" element={<JobCalendarPage />} />
          <Route path="jobs/map" element={<JobMapPage />} />
          <Route path="jobs/:jobId/timeline" element={<JobTimelinePage />} />
          <Route path="jobs/:jobId/approval" element={<PlaceholderPage title="Job Approval" variant="detail" />} />
          <Route path="jobs/rejected" element={<PlaceholderPage title="Rejected Jobs" variant="table" />} />
          <Route path="jobs/closed" element={<PlaceholderPage title="Closed Jobs" variant="table" />} />
          <Route path="jobs/escalated" element={<PlaceholderPage title="Escalated Jobs" variant="table" />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="assets" element={<EquipmentPage />} />
          <Route path="assets/create" element={<CreateAssetPage />} />
          <Route path="assets/:assetId" element={<AssetDetailsPage />} />
          <Route path="assets/:assetId/history" element={<PlaceholderPage title="Asset Inspection History" variant="table" />} />
          <Route path="assets/:assetId/certificates" element={<PlaceholderPage title="Asset Certificates" variant="table" />} />
          <Route path="assets/tracking" element={<PlaceholderPage title="Asset Tracking" variant="dashboard" />} />
          <Route path="assets/scan" element={<PlaceholderPage title="QR / Barcode Scan" variant="detail" />} />
          <Route path="renewals" element={<RenewalsPage />} />
          <Route path="renewals/schedule" element={<ScheduleRenewalPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/upload" element={<UploadDocumentPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="tracking" element={<LiveTrackingPage />} />
          <Route path="tracking/geofence" element={<PlaceholderPage title="Geo-Fence Management" variant="table" />} />
          <Route path="tracking/sites" element={<PlaceholderPage title="Site Locations" variant="table" />} />
          <Route path="tracking/routes" element={<PlaceholderPage title="Route History" variant="table" />} />
          <Route path="tracking/attendance" element={<PlaceholderPage title="Attendance Tracking" variant="table" />} />
          <Route path="tracking/checkins" element={<PlaceholderPage title="Check-In / Check-Out Logs" variant="table" />} />
          <Route path="approvals" element={<ReportsDashboard />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="inspections" element={<InspectionManagementPage />} />
          <Route path="inspections/templates" element={<PlaceholderPage title="Inspection Templates" variant="table" />} />
          <Route path="inspections/checklists/create" element={<PlaceholderPage title="Create Checklist" variant="form" />} />
          <Route path="inspections/forms/builder" element={<PlaceholderPage title="Dynamic Form Builder" variant="form" />} />
          <Route path="inspections/submissions" element={<PlaceholderPage title="Inspection Submissions" variant="table" />} />
          <Route path="inspections/:id/review" element={<ReviewInspectionPage />} />
          <Route path="inspections/:id/decision" element={<PlaceholderPage title="Approve / Reject Inspection" variant="form" />} />
          <Route path="inspections/defects" element={<PlaceholderPage title="Defect Management" variant="table" />} />
          <Route path="inspections/ncr" element={<PlaceholderPage title="NCR (Non-Conformance Report)" variant="form" />} />
          <Route path="inspections/corrective-actions" element={<PlaceholderPage title="Corrective Actions" variant="table" />} />
          <Route path="inspections/history" element={<PlaceholderPage title="Inspection History" variant="table" />} />
          <Route path="media" element={<MediaManagementPage />} />
          <Route path="media/photos" element={<PlaceholderPage title="Photos Review" variant="table" />} />
          <Route path="media/approvals" element={<PlaceholderPage title="Media Approval" variant="table" />} />
          <Route path="media/watermarked" element={<PlaceholderPage title="Watermarked Media Viewer" variant="detail" />} />
          <Route path="media/videos" element={<PlaceholderPage title="Video Management" variant="table" />} />
          <Route path="notifications" element={<NotificationManagementPage />} />
          <Route path="notifications/templates" element={<PlaceholderPage title="Notification Templates" variant="table" />} />
          <Route path="notifications/send" element={<PlaceholderPage title="Send Notifications" variant="form" />} />
          <Route path="notifications/email" element={<PlaceholderPage title="Email Notifications" variant="table" />} />
          <Route path="notifications/sms" element={<PlaceholderPage title="SMS Notifications" variant="table" />} />
          <Route path="notifications/push-logs" element={<PlaceholderPage title="Push Notification Logs" variant="table" />} />
          <Route path="scheduling" element={<PlaceholderPage title="Scheduling & Planning" variant="dashboard" />} />
          <Route path="scheduling/calendar" element={<PlaceholderPage title="Calendar Scheduler" variant="dashboard" />} />
          <Route path="scheduling/availability" element={<PlaceholderPage title="Engineer Availability" variant="table" />} />
          <Route path="scheduling/shifts" element={<PlaceholderPage title="Shift Planning" variant="table" />} />
          <Route path="scheduling/upcoming-renewals" element={<PlaceholderPage title="Upcoming Renewals" variant="table" />} />
          <Route path="scheduling/expiry-alerts" element={<PlaceholderPage title="Expiry Alerts" variant="table" />} />
          <Route path="security" element={<SuperAdminPanel />} />
          <Route path="security/audit-logs" element={<AuditLogsPage />} />
          <Route path="security/access-logs" element={<PlaceholderPage title="Access Logs" variant="table" />} />
          <Route path="security/settings" element={<PlaceholderPage title="Security Settings" variant="form" />} />
          <Route path="security/roles" element={<PlaceholderPage title="Role Permissions" variant="form" />} />
          <Route path="security/backup" element={<PlaceholderPage title="Data Backup" variant="detail" />} />
          <Route path="security/system-logs" element={<PlaceholderPage title="System Logs" variant="table" />} />
          <Route path="security/compliance" element={<PlaceholderPage title="Compliance Monitoring" variant="dashboard" />} />
          <Route path="super-admin" element={<PlaceholderPage title="Super Admin Panel" variant="dashboard" />} />
          <Route path="super-admin/multi-country" element={<PlaceholderPage title="Multi-Country Control" variant="dashboard" />} />
          <Route path="super-admin/multi-company" element={<PlaceholderPage title="Multi-Company Management" variant="table" />} />
          <Route path="super-admin/license" element={<PlaceholderPage title="License Management" variant="table" />} />
          <Route path="super-admin/subscriptions" element={<PlaceholderPage title="Subscription Management" variant="table" />} />
          <Route path="super-admin/tenants" element={<PlaceholderPage title="Tenant Management" variant="table" />} />
          <Route path="super-admin/global-analytics" element={<PlaceholderPage title="Global Analytics" variant="dashboard" />} />
          <Route path="super-admin/health" element={<PlaceholderPage title="System Health Monitoring" variant="dashboard" />} />
          <Route path="super-admin/audit-logs" element={<PlaceholderPage title="Global Audit Logs" variant="table" />} />
          <Route path="super-admin/master-settings" element={<PlaceholderPage title="Master Settings" variant="form" />} />
          <Route path="super-admin/white-label" element={<PlaceholderPage title="White Label Settings" variant="form" />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/create" element={<CreateClientPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users/create" element={<CreateUserPage />} />
          <Route path="branches/create" element={<CreateBranchPage />} />
          {/* Add more admin routes here */}
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
