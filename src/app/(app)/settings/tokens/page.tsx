'use client'

import { useState, useEffect, useCallback } from 'react'
import { Key, Plus, Trash2, Copy, Check, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { SettingsTabs } from '@/components/layout/settings-tabs'
import { patsApi, type PAT, type CreatePATResponse } from '@/lib/api/pats.api'
import { cn } from '@/lib/utils/cn'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso) < new Date()
}

// ─── New token reveal box ─────────────────────────────────────────────────────
function NewTokenBox({ token, onDismiss }: { token: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-sky-300">
            Lưu token ngay bây giờ — nó sẽ không hiển thị lại
          </p>
          <p className="mt-1 text-xs text-sky-400/70">
            Sao chép và lưu token vào nơi an toàn. Bạn sẽ không thể xem lại token này.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-sky-500/20 bg-gray-950 px-3 py-2 font-mono text-sm text-sky-200 break-all">
              {token}
            </code>
            <button
              onClick={copy}
              className="flex-shrink-0 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-300 hover:bg-sky-500/20 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Sao chép
                </>
              )}
            </button>
          </div>
          <button
            onClick={onDismiss}
            className="mt-3 text-xs text-sky-500/60 hover:text-sky-400 transition-colors"
          >
            Tôi đã lưu token, đóng thông báo
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create token form ─────────────────────────────────────────────────────────
function CreateTokenForm({ onCreate }: { onCreate: (result: CreatePATResponse) => void }) {
  const [name, setName] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const days = expiresInDays ? parseInt(expiresInDays, 10) : undefined
      const { data } = await patsApi.create(name.trim(), days)
      onCreate(data)
      setName('')
      setExpiresInDays('')
    } catch {
      setError('Không thể tạo token. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/5 bg-gray-900 p-6">
      <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-sky-400" />
        Tạo token mới
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Tên token, ví dụ: "CEO Dashboard"'
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        />
        <select
          value={expiresInDays}
          onChange={e => setExpiresInDays(e.target.value)}
          className="w-full sm:w-44 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        >
          <option value="">Không hết hạn</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
          <option value="180">180 ngày</option>
          <option value="365">1 năm</option>
        </select>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Key className="h-4 w-4" />
          )}
          Tạo token
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </form>
  )
}

// ─── Token row ────────────────────────────────────────────────────────────────
function TokenRow({ pat, onRevoke }: { pat: PAT; onRevoke: (id: string) => void }) {
  const [revoking, setRevoking] = useState(false)
  const expired = isExpired(pat.expiresAt)

  const handleRevoke = async () => {
    if (!confirm(`Thu hồi token "${pat.name}"? Hành động này không thể hoàn tác.`)) return
    setRevoking(true)
    try {
      await patsApi.revoke(pat.id)
      onRevoke(pat.id)
    } catch {
      setRevoking(false)
    }
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
        <Key className="h-4 w-4 text-sky-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-100">{pat.name}</span>
          <code className="rounded px-1.5 py-0.5 text-xs font-mono bg-white/5 text-gray-400 border border-white/5">
            {pat.tokenPrefix}...
          </code>
          {expired && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Clock className="h-3 w-3" />
              Đã hết hạn
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>Tạo lúc: {formatDate(pat.createdAt)}</span>
          {pat.expiresAt && (
            <span className={cn(expired ? 'text-amber-500/70' : '')}>
              Hết hạn: {formatDate(pat.expiresAt)}
            </span>
          )}
          <span>Dùng lần cuối: {formatDate(pat.lastUsedAt)}</span>
          <span className="text-gray-600">{pat.scopes.join(', ')}</span>
        </div>
      </div>
      <button
        onClick={handleRevoke}
        disabled={revoking}
        className="flex-shrink-0 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50 transition-colors flex items-center gap-1.5"
      >
        {revoking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Thu hồi
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TokensSettingsPage() {
  const [tokens, setTokens] = useState<PAT[]>([])
  const [loading, setLoading] = useState(true)
  const [newToken, setNewToken] = useState<CreatePATResponse | null>(null)

  const loadTokens = useCallback(async () => {
    try {
      const { data } = await patsApi.list()
      setTokens(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTokens()
  }, [loadTokens])

  const handleCreated = (result: CreatePATResponse) => {
    setNewToken(result)
    // Add to list without the raw token
    setTokens(prev => [{
      id: result.id,
      name: result.name,
      tokenPrefix: result.tokenPrefix,
      scopes: result.scopes,
      expiresAt: result.expiresAt,
      lastUsedAt: null,
      createdAt: result.createdAt,
    }, ...prev])
  }

  const handleRevoked = (id: string) => {
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <SettingsTabs activeTab="tokens" />

      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-gray-100">API Tokens</h2>
          <p className="mt-1 text-sm text-gray-400">
            Personal Access Tokens cho phép ứng dụng bên ngoài truy cập WebWow thay bạn.
            Token có đầy đủ quyền của tài khoản — hãy giữ bí mật.
          </p>
        </div>

        {/* New token reveal */}
        {newToken && (
          <NewTokenBox
            token={newToken.token}
            onDismiss={() => setNewToken(null)}
          />
        )}

        {/* Create form */}
        <CreateTokenForm onCreate={handleCreated} />

        {/* Token list */}
        <div className="rounded-xl border border-white/5 bg-gray-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-gray-100">Tokens hiện tại</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="h-8 w-8 text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">Chưa có token nào</p>
              <p className="mt-1 text-xs text-gray-600">Tạo token đầu tiên ở trên</p>
            </div>
          ) : (
            <div>
              {tokens.map(pat => (
                <TokenRow key={pat.id} pat={pat} onRevoke={handleRevoked} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
