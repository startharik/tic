import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { LocationTracker } from './components/LocationTracker';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const MainDashboard = lazy(() => import('./pages/dashboard/MainDashboard'));
const JobsPage = lazy(() => import('./pages/dashboard/JobsPage'));
const CreateJobPage = lazy(() => import('./pages/dashboard/CreateJobPage'));
const UsersPage = lazy(() => import('./pages/dashboard/UsersPage'));
const BranchesPage = lazy(() => import('./pages/dashboard/BranchesPage'));
const EquipmentPage = lazy(() => import('./pages/dashboard/EquipmentPage'));
const LiveTrackingPage = lazy(() => import('./pages/dashboard/LiveTrackingPage'));
const ReportsDashboard = lazy(() => import('./pages/dashboard/ReportsDashboard'));
const ClientsPage = lazy(() => import('./pages/dashboard/ClientsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const RenewalsPage = lazy(() => import('./pages/dashboard/RenewalsPage'));
const ScheduleRenewalPage = lazy(() => import('./pages/dashboard/ScheduleRenewalPage'));
const DocumentsPage = lazy(() => import('./pages/dashboard/DocumentsPage'));
const UploadDocumentPage = lazy(() => import('./pages/dashboard/UploadDocumentPage'));
const ChatPage = lazy(() => import('./pages/dashboard/ChatPage'));
const CreateAssetPage = lazy(() => import('./pages/dashboard/CreateAssetPage'));
const CreateUserPage = lazy(() => import('./pages/dashboard/CreateUserPage'));
const EditUserPage = lazy(() => import('./pages/dashboard/EditUserPage'));
const CreateBranchPage = lazy(() => import('./pages/dashboard/CreateBranchPage'));
const EditBranchPage = lazy(() => import('./pages/dashboard/EditBranchPage'));
const CreateClientPage = lazy(() => import('./pages/dashboard/CreateClientPage'));
const EditClientPage = lazy(() => import('./pages/dashboard/EditClientPage'));
const PlaceholderPage = lazy(() => import('./pages/dashboard/PlaceholderPage'));
const JobDetailsPage = lazy(() => import('./pages/dashboard/JobDetailsPage'));
const EditJobPage = lazy(() => import('./pages/dashboard/EditJobPage'));
const JobTimelinePage = lazy(() => import('./pages/dashboard/JobTimelinePage'));
const JobCalendarPage = lazy(() => import('./pages/dashboard/JobCalendarPage'));
const JobMapPage = lazy(() => import('./pages/dashboard/JobMapPage'));
const AssetDetailsPage = lazy(() => import('./pages/dashboard/AssetDetailsPage'));
const InspectionManagementPage = lazy(() => import('./pages/dashboard/InspectionManagementPage'));
const ReviewInspectionPage = lazy(() => import('./pages/dashboard/ReviewInspectionPage'));
const TrainingManagementPage = lazy(() => import('./pages/dashboard/TrainingManagementPage'));
const ReviewTrainingPage = lazy(() => import('./pages/dashboard/ReviewTrainingPage'));
const MediaManagementPage = lazy(() => import('./pages/dashboard/MediaManagementPage'));
const NotificationManagementPage = lazy(() => import('./pages/dashboard/NotificationManagementPage'));
const AuditLogsPage = lazy(() => import('./pages/dashboard/AuditLogsPage'));
const CreateEquipmentPage = lazy(() => import('./pages/dashboard/CreateEquipmentPage'));
const EditEquipmentPage = lazy(() => import('./pages/dashboard/EditEquipmentPage'));
const SchedulingPage = lazy(() => import('./pages/dashboard/SchedulingPage'));

const AppShellFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<AppShellFallback />}>
        <LocationTracker />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
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
            <Route path="users/create" element={<CreateUserPage />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="equipment/create" element={<CreateEquipmentPage />} />
            <Route path="equipment/:id/edit" element={<EditEquipmentPage />} />
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
            <Route path="trainings" element={<TrainingManagementPage />} />
            <Route path="trainings/:id/review" element={<ReviewTrainingPage />} />
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
            <Route path="scheduling" element={<SchedulingPage />} />
            <Route path="scheduling/calendar" element={<PlaceholderPage title="Calendar Scheduler" variant="dashboard" />} />
            <Route path="scheduling/availability" element={<PlaceholderPage title="Engineer Availability" variant="table" />} />
            <Route path="scheduling/shifts" element={<PlaceholderPage title="Shift Planning" variant="table" />} />
            <Route path="scheduling/upcoming-renewals" element={<PlaceholderPage title="Upcoming Renewals" variant="table" />} />
            <Route path="scheduling/expiry-alerts" element={<PlaceholderPage title="Expiry Alerts" variant="table" />} />
            <Route path="security" element={<Navigate to="/admin/security/audit-logs" replace />} />
            <Route path="security/audit-logs" element={<AuditLogsPage />} />
            <Route path="security/access-logs" element={<PlaceholderPage title="Access Logs" variant="table" />} />
            <Route path="security/settings" element={<PlaceholderPage title="Security Settings" variant="form" />} />
            <Route path="security/roles" element={<PlaceholderPage title="Role Permissions" variant="form" />} />
            <Route path="security/backup" element={<PlaceholderPage title="Data Backup" variant="detail" />} />
            <Route path="security/system-logs" element={<PlaceholderPage title="System Logs" variant="table" />} />
            <Route path="security/compliance" element={<PlaceholderPage title="Compliance Monitoring" variant="dashboard" />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/create" element={<CreateClientPage />} />
            <Route path="clients/:id/edit" element={<EditClientPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="branches/create" element={<CreateBranchPage />} />
            <Route path="branches/:id/edit" element={<EditBranchPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
