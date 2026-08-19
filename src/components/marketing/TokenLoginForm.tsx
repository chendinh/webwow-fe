'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Key, Loader } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useOrgStore } from '@/stores/org.store'
import { organizationsApi } from '@/lib/api/organizations.api'

export function TokenLoginForm() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.tokenLogin(token.trim())
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      // Load org
      try {
        const orgsRes = await organizationsApi.list()
        if (orgsRes.data?.length > 0) {
          useOrgStore.getState().setActiveOrg(orgsRes.data[0].id, orgsRes.data[0].slug)
        }
      } catch { /* ignore */ }
      router.push('/consult')
    } catch {
      setError('Token không hợp lệ hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
        <Key className="h-3 w-3" />
        Đã có API token? Đăng nhập ngay
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="wwt_xxxxxxxxxxxxxxxx"
          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60 font-mono"
        />
        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="rounded-lg bg-sky-500/20 border border-sky-500/30 px-3 py-2 text-sm text-sky-300 hover:bg-sky-500/30 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </form>
  )
}
