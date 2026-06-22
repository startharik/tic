import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, Loader2, AlertCircle, Lock } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminSetUserPassword, getBranches, getUser, updateUser } from '../../services/supabaseService'
import type { Branch, User as UserType } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

const EditUserPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [user, setUser] = useState<UserType | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'engineer' as UserType['role'],
    branch_id: '',
    is_active: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true)
        if (!id) throw new Error('No user ID provided')
        const [userData, branchesData] = await Promise.all([getUser(id), getBranches()])
        setUser(userData)
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          role: userData.role,
          branch_id: userData.branch_id || '',
          is_active: userData.is_active,
        })
        setBranches(branchesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setFetchingData(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      setLoading(true)
      if (!id) throw new Error('No user ID provided')
      const dataToSubmit = {
        ...formData,
        branch_id: formData.branch_id || undefined,
      }
      await updateUser(id, dataToSubmit)
      navigate('/admin/users')
    } catch (error: any) {
      console.error('Error updating user:', error)
      setErrorMessage(error.message || 'Failed to update user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)
    if (!id) return
    if (userProfile?.role !== 'super_admin') {
      setPasswordError('Forbidden')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      setPasswordLoading(true)
      await adminSetUserPassword(id, newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password updated')
    } catch (e: any) {
      setPasswordError(e?.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">User not found</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
            <p className="text-slate-500 text-sm">Update user account details.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">First Name</label>
            <input
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., John"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Last Name</label>
            <input
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="+966 ..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="operation_manager">Operation Manager</option>
              <option value="engineer">Engineer / Inspector</option>
              <option value="trainer">Trainer</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Branch</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {userProfile?.role === 'super_admin' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Password</h2>
              <p className="text-sm text-slate-500">Update this user’s password (super admin only).</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          {(passwordError || passwordSuccess) && (
            <div
              className={`p-4 rounded-lg border flex items-start space-x-3 ${
                passwordError ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${passwordError ? 'text-rose-500' : 'text-emerald-600'}`} />
              <p className={`text-sm ${passwordError ? 'text-rose-700' : 'text-emerald-700'}`}>{passwordError || passwordSuccess}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={passwordLoading}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

export default EditUserPage
