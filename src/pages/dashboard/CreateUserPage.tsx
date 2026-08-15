import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getBranches } from '../../services/supabaseService'
import type { Branch } from '../../services/supabaseService'
import { supabase } from '../../lib/supabase'

// Password strength checker
type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | ''

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return ''
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'engineer',
    branch_id: '',
    is_active: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true)
        const branchesData = await getBranches()
        setBranches(branchesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setFetchingData(false)
      }
    }
    fetchData()
  }, [])

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password))
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      setLoading(true)

      const payload = {
        ...formData,
        branch_id: formData.branch_id || null,
      }

      console.log('Calling create-user function with payload:', payload)
      // Call our Edge Function to create the user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: payload,
      })

      console.log('Full function response:', { data, error })
      if (error) {
        console.error('Full error details:', JSON.stringify(error, null, 2))
        let errorMessage = 'Failed to create user'
        if (error.context) {
          console.error('Error context:', error.context)
          try {
            const cloned = error.context.clone()
            const errBody = await cloned.text()
            console.error('Error body:', errBody)
            try {
              const errJson = JSON.parse(errBody)
              errorMessage = errJson.error || errJson.message || errorMessage
            } catch (parseErr) {
              errorMessage = errBody || errorMessage
            }
          } catch (e) {
            console.error('Error getting error body:', e)
          }
        }
        throw new Error(errorMessage)
      }

      navigate('/admin/users')
    } catch (error: any) {
      console.error('Error creating user:', error)
      const msg = error?.message || 'Failed to create user. Please try again.'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'fair':
        return 'bg-orange-500'
      case 'good':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthText = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'Weak'
      case 'fair':
        return 'Fair'
      case 'good':
        return 'Good'
      case 'strong':
        return 'Strong'
      default:
        return ''
    }
  }

  const getStrengthPercentage = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return '25%'
      case 'fair':
        return '50%'
      case 'good':
        return '75%'
      case 'strong':
        return '100%'
      default:
        return '0%'
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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
            <h1 className="text-2xl font-bold text-slate-900">Add New User</h1>
            <p className="text-slate-500 text-sm">Create user accounts for Admins, Engineers, and Sales.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save</span>
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
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., john.doe"
            />
          </div>
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
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  const newEmail = e.target.value
                  setFormData({ ...formData, email: newEmail })
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                placeholder="name@company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password strength meter */}
            {formData.password && (
              <div className="space-y-1">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: getStrengthPercentage(passwordStrength) }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'fair' ? 'text-orange-600' :
                    passwordStrength === 'good' ? 'text-yellow-600' :
                    passwordStrength === 'strong' ? 'text-green-600' : ''
                  }`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className={`flex items-center space-x-1 ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                    {formData.password.length >= 6 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}
                    <span>At least 6 characters</span>
                  </p>
                  <p className={`flex items-center space-x-1 ${(/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) ? 'text-green-600' : ''}`}>
                    {(/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}
                    <span>Uppercase & lowercase</span>
                  </p>
                  <p className={`flex items-center space-x-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    {/[0-9]/.test(formData.password) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}
                    <span>Numbers</span>
                  </p>
                  <p className={`flex items-center space-x-1 ${/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                    {/[^a-zA-Z0-9]/.test(formData.password) ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-300" />}
                    <span>Special characters</span>
                  </p>
                </div>
              </div>
            )}
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
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
    </form>
  )
}

export default CreateUserPage
