import { supabase } from '../lib/supabase';

export type GeocodedPoint = { lat: number; lng: number };

// Types
export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  branch_id?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branches?: { id: string; name: string };
}

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  country_id?: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  countries?: { id: string; name: string };
}

export interface Client {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country_id?: string;
  created_at: string;
  updated_at: string;
  countries?: { id: string; name: string };
}

export interface Equipment {
  id: string;
  client_id: string;
  branch_id?: string;
  name: string;
  type?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  installation_date?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
  status: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  clients?: { id: string; name: string };
  branches?: { id: string; name: string };
}

export interface Job {
    id: string;
    client_id: string;
    branch_id?: string;
    equipment_id?: string;
    assigned_to?: string;
    sales_person_id?: string;
    created_by?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    site_address?: string;
    site_latitude?: number;
    site_longitude?: number;
    scheduled_date?: string;
    due_date?: string;
    completed_date?: string;
    created_at: string;
    updated_at: string;
    clients?: { id: string; name: string };
    branches?: { id: string; name: string };
    equipment?: { id: string; name: string };
    assigned_users?: { id: string; first_name: string; last_name: string };
    created_by_users?: { id: string; first_name: string; last_name: string };
    sales_person?: { id: string; first_name: string; last_name: string };
}

export interface Inspection {
  id: string;
  job_id: string;
  equipment_id: string;
  inspector_id?: string;
  status: string;
  overall_result?: string;
  notes?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  jobs?: { id: string; title: string; sales_person_id?: string };
  equipment?: { id: string; name: string };
  inspector?: { id: string; first_name: string; last_name: string };
}

// ==================== COUNTRIES ====================
export const getCountries = async (): Promise<Country[]> => {
  const { data, error } = await supabase.from('countries').select('*').order('name');
  if (error) throw error;
  return data || [];
};

export const createCountry = async (country: Omit<Country, 'id' | 'created_at' | 'updated_at'>): Promise<Country> => {
  const { data, error } = await supabase.from('countries').insert(country).select().single();
  if (error) throw error;
  return data;
};

export const updateCountry = async (id: string, country: Partial<Omit<Country, 'id' | 'created_at' | 'updated_at'>>): Promise<Country> => {
  const { data, error } = await supabase.from('countries').update(country).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCountry = async (id: string): Promise<void> => {
  const { error } = await supabase.from('countries').delete().eq('id', id);
  if (error) throw error;
};

// ==================== BRANCHES ====================
export const getBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase.from('branches').select(`
    *,
    countries (id, name)
  `).order('name');
  if (error) throw error;
  return data || [];
};

export const getBranch = async (id: string): Promise<Branch> => {
  const { data, error } = await supabase.from('branches').select(`
    *,
    countries (id, name)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) throw error;
};

export const createBranch = async (branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> => {
  const { data, error } = await supabase.from('branches').insert(branch).select(`
    *,
    countries (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const updateBranch = async (id: string, branch: Partial<Omit<Branch, 'id' | 'created_at' | 'updated_at'>>): Promise<Branch> => {
  const { data, error } = await supabase.from('branches').update(branch).eq('id', id).select(`
    *,
    countries (id, name)
  `).single();
  if (error) throw error;
  return data;
};

// ==================== USERS ====================
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select(`
    *,
    branches (id, name)
  `).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase.from('users').select(`
    *,
    branches (id, name)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const { data, error } = await supabase.from('users').insert(user).select(`
    *,
    branches (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> => {
  const { data, error } = await supabase.from('users').update(user).eq('id', id).select(`
    *,
    branches (id, name)
  `).single();
  if (error) throw error;
  return data;
};

// ==================== CLIENTS ====================
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select(`
    *,
    countries (id, name)
  `).order('name');
  if (error) throw error;
  return data || [];
};

export const getClient = async (id: string): Promise<Client> => {
  const { data, error } = await supabase.from('clients').select(`
    *,
    countries (id, name)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const { data, error } = await supabase.from('clients').insert(client).select(`
    *,
    countries (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const updateClient = async (id: string, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> => {
  const { data, error } = await supabase.from('clients').update(client).eq('id', id).select(`
    *,
    countries (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
};

export const geocodeAddressNominatim = async (
  address: string,
  opts?: { countryHint?: string },
): Promise<GeocodedPoint | null> => {
  const cleaned = address.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  const hint = opts?.countryHint?.replace(/\s+/g, ' ').trim();
  const { data, error } = await supabase.functions.invoke('geocode', {
    body: {
      address: cleaned,
      countryHint: hint || undefined,
    },
  });
  if (error) return null;
  const lat = Number((data as any)?.lat);
  const lng = Number((data as any)?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

// ==================== JOBS ====================
export const getJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase.from('jobs').select(`
    *,
    clients (id, name),
    branches (id, name),
    equipment (id, name),
    assigned_users:users!jobs_assigned_to_fkey(id, first_name, last_name),
    created_by_users:users!jobs_created_by_fkey(id, first_name, last_name),
    sales_person:users!jobs_sales_person_id_fkey(id, first_name, last_name)
  `).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getJob = async (id: string): Promise<Job> => {
  const { data, error } = await supabase.from('jobs').select(`
    *,
    clients (id, name),
    branches (id, name),
    equipment (id, name),
    assigned_users:users!jobs_assigned_to_fkey(id, first_name, last_name),
    created_by_users:users!jobs_created_by_fkey(id, first_name, last_name),
    sales_person:users!jobs_sales_person_id_fkey(id, first_name, last_name)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> => {
  const { data, error } = await supabase.from('jobs').insert(job).select(`
    *,
    clients (id, name),
    branches (id, name),
    equipment (id, name),
    assigned_users:users!jobs_assigned_to_fkey(id, first_name, last_name),
    created_by_users:users!jobs_created_by_fkey(id, first_name, last_name),
    sales_person:users!jobs_sales_person_id_fkey(id, first_name, last_name)
  `).single();
  if (error) throw error;
  return data;
};

export const updateJob = async (id: string, job: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>): Promise<Job> => {
  const { data, error } = await supabase.from('jobs').update(job).eq('id', id).select(`
    *,
    clients (id, name),
    branches (id, name),
    equipment (id, name),
    assigned_users:users!jobs_assigned_to_fkey(id, first_name, last_name),
    created_by_users:users!jobs_created_by_fkey(id, first_name, last_name),
    sales_person:users!jobs_sales_person_id_fkey(id, first_name, last_name)
  `).single();
  if (error) throw error;
  return data;
};

export const deleteJob = async (id: string): Promise<void> => {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw error;
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
};

export const adminSetUserPassword = async (userId: string, password: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: { action: 'set_password', user_id: userId, password },
  });
  if (error) throw error;
  if ((data as any)?.error) {
    throw new Error((data as any).error);
  }
};

// ==================== EQUIPMENT ====================
export const getEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase.from('equipment').select(`
    *,
    clients (id, name),
    branches (id, name)
  `).order('name');
  if (error) throw error;
  return data || [];
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const { data, error } = await supabase.from('equipment').select(`
    *,
    clients (id, name),
    branches (id, name)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createEquipment = async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
  const { data, error } = await supabase.from('equipment').insert(equipment).select(`
    *,
    clients (id, name),
    branches (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const updateEquipment = async (id: string, equipment: Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>): Promise<Equipment> => {
  const { data, error } = await supabase.from('equipment').update(equipment).eq('id', id).select(`
    *,
    clients (id, name),
    branches (id, name)
  `).single();
  if (error) throw error;
  return data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const { error } = await supabase.from('equipment').delete().eq('id', id);
  if (error) throw error;
};

// ==================== INSPECTIONS ====================
export const getInspections = async (): Promise<Inspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      jobs (id, title),
      equipment (id, name),
      inspector:users!inspections_inspector_id_fkey (id, first_name, last_name)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getInspectionById = async (id: string): Promise<Inspection> => {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      jobs (id, title, sales_person_id),
      equipment (id, name),
      inspector:users!inspections_inspector_id_fkey (id, first_name, last_name)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateInspection = async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
  const { data, error } = await supabase
    .from('inspections')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      jobs (id, title),
      equipment (id, name),
      inspector:users!inspections_inspector_id_fkey (id, first_name, last_name)
    `)
    .single();
  if (error) throw error;
  return data;
};

// Dashboard KPIs
export const getDashboardStats = async () => {
  const [
    jobsResult, usersResult, clientsResult, equipmentResult, inspectionsResult] = await Promise.all([
    supabase.from('jobs').select('*'),
    supabase.from('users').select('*'),
    supabase.from('clients').select('*'),
    supabase.from('equipment').select('*'),
    supabase.from('inspections').select('*'),
  ]);

  const jobs = jobsResult.data || [];
  const users = usersResult.data || [];
  const clients = clientsResult.data || [];
  const equipment = equipmentResult.data || [];
  const inspections = inspectionsResult.data || [];

  const statusCounts: Record<string, number> = {};
  jobs.forEach(job => {
    statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
  });

  const inspectionStatusCounts: Record<string, number> = {};
  inspections.forEach(inspection => {
    inspectionStatusCounts[inspection.status] = (inspectionStatusCounts[inspection.status] || 0) + 1;
  });

  return {
    totalJobs: jobs.length,
    openJobs: statusCounts['open'] || 0,
    inProgress: statusCounts['in_progress'] || 0,
    assigned: statusCounts['assigned'] || 0,
    submitted: statusCounts['submitted'] || 0,
    completed: statusCounts['completed'] || 0,
    approved: statusCounts['approved'] || 0,
    rejected: statusCounts['rejected'] || 0,
    closed: statusCounts['closed'] || 0,
    overdue: 0,
    totalUsers: users.length,
    totalClients: clients.length,
    totalEquipment: equipment.length,
    totalInspections: inspections.length,
    draftInspections: inspectionStatusCounts['draft'] || 0,
    submittedInspections: inspectionStatusCounts['submitted'] || 0,
    approvedInspections: inspectionStatusCounts['approved'] || 0,
    rejectedInspections: inspectionStatusCounts['rejected'] || 0,
  };
};

export const getCurrentUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, branches (id, name)')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

// Role definitions and permissions
export type UserRole = 'super_admin' | 'admin' | 'engineer' | 'sales';

export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  admin: ['*'], // Almost all permissions (except maybe some super_admin only)
  engineer: ['read:jobs', 'read:equipment', 'write:inspections'],
  sales: ['read:clients', 'read:jobs'],
};

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  users?: { first_name?: string; last_name?: string };
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      users (first_name, last_name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export interface LocationTracking {
  id: string;
  user_id: string;
  job_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  recorded_at: string;
  users?: { first_name?: string; last_name?: string; role?: string };
  jobs?: { title?: string };
}

export const getLocationTracking = async (): Promise<LocationTracking[]> => {
  const { data, error } = await supabase
    .from('location_tracking')
    .select(`
      *,
      users (first_name, last_name, role),
      jobs (title)
    `)
    .order('recorded_at', { ascending: false })
    .limit(500);
  
  if (error) throw error;
  return data || [];
};

export interface AppSettings {
  id: number;
  geofence_radius_meters: number;
  updated_at?: string;
}

export const getAppSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('id, geofence_radius_meters, updated_at')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
};

export const updateAppSettings = async (updates: Partial<Pick<AppSettings, 'geofence_radius_meters'>>): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select('id, geofence_radius_meters, updated_at')
    .single();
  if (error) throw error;
  return data;
};

export interface ChatMessage {
  id: string;
  job_id: string;
  sender_id: string;
  message: string;
  media_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: { first_name?: string; last_name?: string; role?: string };
  jobs?: { title?: string };
  media?: { id: string; file_url: string; file_type: string; file_name: string } | null;
}

export interface ChatMessageLite {
  id: string;
  sender_id: string;
  created_at: string;
}

export const getChatMessagesLite = async (): Promise<ChatMessageLite[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, sender_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users!chat_messages_sender_id_fkey (first_name, last_name, role),
      media (id, file_url, file_type, file_name),
      jobs!inner (title)
    `)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getChatMessagesByJobIds = async (jobIds: string[]): Promise<ChatMessage[]> => {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      `
      *,
      sender:users!chat_messages_sender_id_fkey (first_name, last_name, role),
      media (id, file_url, file_type, file_name),
      jobs!inner (title)
    `
    )
    .in('job_id', jobIds)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getChatMessageById = async (id: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      `
      *,
      sender:users!chat_messages_sender_id_fkey (first_name, last_name, role),
      media (id, file_url, file_type, file_name),
      jobs!inner (title)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createChatMessage = async (message: Omit<ChatMessage, 'id' | 'created_at' | 'is_read'>): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select(`
      *,
      sender:users!chat_messages_sender_id_fkey (first_name, last_name, role),
      media (id, file_url, file_type, file_name),
      jobs!inner (title)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const markChatThreadRead = async (jobId: string, currentUserId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('job_id', jobId)
    .neq('sender_id', currentUserId)
    .eq('is_read', false);
  if (error) throw error;
};

export interface Media {
  id: string;
  job_id?: string;
  inspection_id?: string;
  defect_id?: string;
  uploaded_by?: string;
  file_name: string;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  watermark_data?: any;
  is_approved: boolean;
  created_at: string;
  jobs?: { id: string; title?: string; clients?: { id: string; name: string } };
  uploader?: { first_name?: string; last_name?: string };
}

export const createMedia = async (
  media: Omit<Media, 'id' | 'created_at' | 'is_approved'> & { is_approved?: boolean }
): Promise<Media> => {
  const { data, error } = await supabase
    .from('media')
    .insert({ ...media, is_approved: media.is_approved ?? false })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getMedia = async (): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select(
      `
      *,
      jobs (id, title, clients (id, name)),
      uploader:users!media_uploaded_by_fkey (first_name, last_name)
    `
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateMedia = async (id: string, updates: Partial<Pick<Media, 'is_approved' | 'watermark_data' | 'thumbnail_url'>>): Promise<Media> => {
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', id)
    .select(
      `
      *,
      jobs (id, title, clients (id, name)),
      uploader:users!media_uploaded_by_fkey (first_name, last_name)
    `
    )
    .single();
  if (error) throw error;
  return data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw error;
};

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  category?: string;
  folder_id?: string;
  equipment_id?: string;
  client_id?: string;
  uploaded_by?: string;
  version: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  uploader?: { first_name?: string; last_name?: string };
  clients?: { id: string; name: string };
  equipment?: { id: string; name: string };
}

export interface DocumentFolder {
  id: string;
  name: string;
  parent_id?: string;
  created_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string | null;
  title: string;
  message?: string;
  type?: string;
  is_read: boolean;
  related_job_id?: string | null;
  created_at: string;
  users?: { first_name?: string; last_name?: string };
  jobs?: { title?: string };
}

export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  // Trigger push notification via Edge Function
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const functionUrl = `${supabaseUrl}/functions/v1/send-push-notification`;
    
    await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
      body: JSON.stringify({ notification_id: data.id }),
    });
  } catch (err) {
    console.error('Error triggering push notification:', err);
    // Don't fail the whole operation if push notification fails
  }

  return data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
};

export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
};

export const getDocumentFolders = async (): Promise<DocumentFolder[]> => {
  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createDocumentFolder = async (
  folder: Omit<DocumentFolder, 'id' | 'created_at'>
): Promise<DocumentFolder> => {
  const { data, error } = await supabase.from('document_folders').insert(folder).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteDocumentFolder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('document_folders').delete().eq('id', id);
  if (error) throw error;
};

export const getDocuments = async (): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      uploader:users!documents_uploaded_by_fkey (first_name, last_name),
      clients (id, name),
      equipment (id, name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createDocument = async (
  doc: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'uploader' | 'clients' | 'equipment'>
): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select(
      `
      *,
      uploader:users!documents_uploaded_by_fkey (first_name, last_name),
      clients (id, name),
      equipment (id, name)
    `
    )
    .single();

  if (error) throw error;
  return data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
};
