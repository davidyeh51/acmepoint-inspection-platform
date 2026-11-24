/**
 * ACMEPOINT Energy Services (6692) — 太陽光電巡檢報告智能自動化平台 (CF-086)
 * 60 天強制輪替網路金鑰驗證模組（取代傳統帳號管理）
 * 對接 Supabase Edge Function: inspection-key-admin
 */
(function (root) {
  'use strict';

  const GATE_STORAGE_KEY = 'ACME_INSP_GATE_TOKEN_V1';
  const ROLE_LABELS = {
    owner: 'OWNER 最高擁有者',
    admin: 'ADMIN 主管管理員',
    member: 'MEMBER 維運工程師',
    viewer: 'VIEWER 唯讀檢視',
  };

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const twDate = (v) => {
    if (!v) return '—';
    try {
      return new Date(v).toLocaleDateString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return String(v);
    }
  };

  const twFull = (v) => {
    if (!v) return '—';
    try {
      return new Date(v).toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false,
      });
    } catch {
      return String(v);
    }
  };

  function showToast(msg, isError = false) {
    const el = document.getElementById('mcToast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'mc-toast' + (isError ? ' err' : '');
    el.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.hidden = true;
    }, 3800);
  }
  root.showToast = showToast;

  const InspAuth = {
    profile: null,
    user: null,
    permissions: {
      role: 'viewer',
      is_owner: false,
      is_admin: false,
      can_manage_keys: false,
      can_rotate: false,
      can_export: false,
      can_edit: false,
      can_approve: false,
    },
    rotation: null,
    portalConfig: {},
    adminLoaded: false,

    getGateToken() {
      return sessionStorage.getItem(GATE_STORAGE_KEY) || localStorage.getItem(GATE_STORAGE_KEY) || '';
    },

    setGateToken(tok) {
      if (tok) {
        sessionStorage.setItem(GATE_STORAGE_KEY, tok);
        localStorage.setItem(GATE_STORAGE_KEY, tok);
      } else {
        sessionStorage.removeItem(GATE_STORAGE_KEY);
        localStorage.removeItem(GATE_STORAGE_KEY);
      }
    },

    isGuest() {
      return !this.user || !this.profile || !this.profile.active;
    },

    isAdmin() {
      return Boolean(this.permissions && this.permissions.is_admin);
    },

    canEdit() {
      return Boolean(this.permissions && this.permissions.can_edit);
    },

    canApprove() {
      return Boolean(this.permissions && this.permissions.can_approve);
    },

    async apiCall(body) {
      const url = typeof SupabaseConfig !== 'undefined' ? SupabaseConfig.getUrl() : '';
      const anonKey = typeof SupabaseConfig !== 'undefined' ? SupabaseConfig.getKey() : '';
      const gt = this.getGateToken();
      const hdrs = { 'Content-Type': 'application/json', apikey: anonKey };
      if (gt) hdrs['x-insp-gate'] = gt;
      const resp = await fetch(`${url}/functions/v1/inspection-key-admin`, {
        method: 'POST',
        headers: hdrs,
        body: JSON.stringify({ ...body, gate_token: gt }),
      });
      const data = await resp.json().catch(() => ({ error: '伺服器回應格式錯誤' }));
      if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
      return data;
    },

    async logEvent(eventAction, target = '', detail = {}) {
      if (this.isGuest()) return;
      try {
        await this.apiCall({ action: 'log_event', event_action: eventAction, target, detail });
      } catch {}
    },

    showGateScreen(errMsg = '') {
      this.user = null;
      this.profile = null;
      this.adminLoaded = false;
      document.documentElement.classList.remove('authenticated');
      const shell = document.getElementById('authShell');
      const app = document.getElementById('appView');
      if (shell) shell.hidden = false;
      if (app) app.hidden = true;
      const errEl = document.getElementById('gateErr');
      if (errEl) {
        errEl.className = 'mc-err';
        errEl.textContent = errMsg || '';
      }
      const inp = document.getElementById('gateKeyInput');
      if (inp) {
        inp.value = '';
        setTimeout(() => inp.focus(), 50);
      }
    },

    renderRotationStatus(rot) {
      if (!rot) return;
      this.rotation = rot;
      const chip = document.getElementById('keyCycleChip');
      const txt = document.getElementById('keyCycleText');
      const sched = document.getElementById('rotationScheduleText');
      const alertWrap = document.getElementById('rotationAlertWrap');
      const alertBox = document.getElementById('rotationAlertBox');
      const alertMsg = document.getElementById('rotationAlertMsg');
      const metaBox = document.getElementById('rotateMetaBox');

      const rotatedDate = twDate(rot.rotated_at);
      const dueDate = twDate(rot.due_at);
      const rem = Number(rot.days_remaining ?? 0);

      if (sched) {
        sched.textContent = `🔑 60 天強制輪替週期：啟用 ${rotatedDate} · 到期 ${dueDate}（尚餘 ${Math.max(0, rem)} 天）`;
      }

      if (chip && txt) {
        if (rot.is_overdue) {
          chip.className = 'key-cycle-chip overdue';
          txt.textContent = `金鑰已逾 60 天（逾期 ${Math.abs(rem)} 天）`;
        } else if (rot.should_remind) {
          chip.className = 'key-cycle-chip warn';
          txt.textContent = `60 天變更倒數：剩 ${rem} 天`;
        } else {
          chip.className = 'key-cycle-chip';
          txt.textContent = `60 天變更倒數：尚餘 ${rem} 天`;
        }
      }

      if (alertWrap && alertBox && alertMsg) {
        if (rot.is_overdue) {
          alertBox.className = 'rotation-alert-box overdue';
          alertMsg.innerHTML = `<strong>⚠️ 60 天金鑰定期變更提醒（已屆期）：</strong>目前網路金鑰自 ${esc(rotatedDate)} 啟用已超過 60 天（到期日 ${esc(dueDate)}）。請立即輪替更新。`;
          alertWrap.hidden = false;
        } else if (rot.should_remind) {
          alertBox.className = 'rotation-alert-box';
          alertMsg.innerHTML = `<strong>🔔 60 天金鑰定期變更提醒：</strong>目前網路金鑰將於 <strong>${esc(dueDate)}</strong> 屆滿並自動鎖定（僅剩 <strong>${rem} 天</strong>）。請提前完成輪替。`;
          alertWrap.hidden = false;
        } else {
          alertWrap.hidden = true;
        }
      }

      if (metaBox) {
        metaBox.innerHTML = `
          <div><strong>目前金鑰識別：</strong><span class="mono-code">${esc(rot.key_hint)}</span>（${esc(rot.label)}）</div>
          <div><strong>上次變更日期：</strong>${esc(rotatedDate)}（已使用 ${rot.days_elapsed} 天）</div>
          <div><strong>60 天強制到期日：</strong>${esc(dueDate)}（尚餘 <strong>${rem} 天</strong>）</div>
        `;
      }
    },

    applyPermissions(perms, config) {
      this.permissions = {
        role: 'viewer',
        is_owner: false,
        is_admin: false,
        can_manage_keys: false,
        can_rotate: false,
        can_export: false,
        can_edit: false,
        can_approve: false,
        ...(perms || {}),
      };
      this.portalConfig = config || {};

      const badge = document.getElementById('roleBadge');
      if (badge) {
        badge.textContent = ROLE_LABELS[this.permissions.role] || String(this.permissions.role).toUpperCase();
        badge.className = 'role-pill ' + this.permissions.role;
      }

      const tabAdmin = document.getElementById('tab-btn-admin');
      if (tabAdmin) tabAdmin.hidden = !this.permissions.is_admin;

      const rotBtn = document.getElementById('openRotateModal');
      if (rotBtn) rotBtn.hidden = !this.permissions.can_rotate;

      const alertRotBtn = document.getElementById('alertRotateBtn');
      if (alertRotBtn) alertRotBtn.hidden = !this.permissions.can_rotate;

      const optOwner = document.getElementById('admOptOwner');
      if (optOwner) optOwner.hidden = !this.permissions.is_owner;

      const noticeText = document.getElementById('noticeText');
      if (noticeText && this.portalConfig.portal_notice) {
        noticeText.textContent = this.portalConfig.portal_notice;
      }

      const driveLink = document.getElementById('driveFolderLink');
      if (driveLink) {
        if (this.portalConfig.drive_folder_url) {
          driveLink.href = this.portalConfig.drive_folder_url;
          driveLink.hidden = false;
        } else {
          driveLink.hidden = true;
        }
      }

      document.querySelectorAll('[data-admin-only]').forEach((el) => {
        el.hidden = !this.permissions.is_admin;
      });
      document.querySelectorAll('[data-edit-only]').forEach((el) => {
        el.hidden = !this.permissions.can_edit;
      });
      document.querySelectorAll('[data-approve-only]').forEach((el) => {
        el.hidden = !this.permissions.can_approve;
      });
    },

    async applyUnlockedPayload(res) {
      if (window.supabaseService && window.supabaseService.client && res.session && res.session.access_token && res.session.refresh_token) {
        const { data, error } = await window.supabaseService.client.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (error) {
          console.warn('Supabase session attach note:', error.message);
        }
        this.user = (data && data.user) || { id: 'key-session', email: 'insp-key@acmepoint.internal' };
      } else {
        this.user = { id: 'key-session', email: 'insp-key@acmepoint.internal' };
      }

      const isAdmin = Boolean(res.permissions && res.permissions.is_admin);
      this.profile = {
        active: true,
        role: isAdmin ? 'admin' : 'member',
        scope: (res.permissions && res.permissions.role) || 'member',
        label: res.key_label || '網路金鑰',
      };

      this.applyPermissions(res.permissions, res.config);
      this.renderRotationStatus(res.rotation);

      document.documentElement.classList.add('authenticated');
      const shell = document.getElementById('authShell');
      const app = document.getElementById('appView');
      if (shell) shell.hidden = true;
      if (app) app.hidden = false;
    },

    async init() {
      const existingToken = this.getGateToken();
      if (!existingToken) {
        this.showGateScreen('');
        return false;
      }
      try {
        const res = await this.apiCall({ action: 'gate_status' });
        if (!res.valid) {
          this.setGateToken('');
          this.showGateScreen('通行憑證已過期或金鑰已更新，請重新輸入網路存取金鑰。');
          return false;
        }
        await this.applyUnlockedPayload(res);
        return true;
      } catch (err) {
        console.warn('Gate validation error:', err);
        this.setGateToken('');
        this.showGateScreen('無法驗證通行憑證，請重新輸入網路存取金鑰。');
        return false;
      }
    },

    async unlock(event) {
      if (event) event.preventDefault();
      const inp = document.getElementById('gateKeyInput');
      const btn = document.getElementById('gateBtn');
      const errEl = document.getElementById('gateErr');
      const rawKey = String(inp ? inp.value : '').trim();
      if (!rawKey) return;

      if (btn) btn.disabled = true;
      if (errEl) {
        errEl.className = 'mc-err';
        errEl.textContent = '驗證網路金鑰與簽發資料庫憑證中…';
      }

      try {
        const res = await this.apiCall({ action: 'verify_key', access_key: rawKey });
        this.setGateToken(res.gate_token);
        await this.applyUnlockedPayload(res);
        if (inp) inp.value = '';
        if (errEl) errEl.textContent = '';
        showToast(`已解鎖：${res.key_label}（60 天週期尚餘 ${res.rotation?.days_remaining ?? 60} 天）`);
        if (typeof initializeApp === 'function') {
          await initializeApp();
        }
      } catch (err) {
        if (errEl) {
          errEl.className = 'mc-err';
          errEl.textContent = err.message || '網路金鑰驗證失敗，請重新輸入。';
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    async logout() {
      this.setGateToken('');
      try {
        if (window.supabaseService && window.supabaseService.client) {
          await window.supabaseService.client.auth.signOut({ scope: 'local' });
        }
      } catch {}
      this.showGateScreen('');
      showToast('已安全鎖定並登出系統。');
    },

    // ── 60-Day Key Rotation Modal ──
    generateStrongKey(prefix = 'INSP') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const seg = (n) => {
        const arr = new Uint8Array(n);
        crypto.getRandomValues(arr);
        return Array.from(arr, (x) => chars[x % chars.length]).join('');
      };
      return `${prefix}-${seg(4)}-${seg(4)}`;
    },

    openRotateModal() {
      const modal = document.getElementById('rotateModal');
      if (!modal) return;
      const err = document.getElementById('rotateModalErr');
      if (err) { err.className = 'mc-err'; err.textContent = ''; }
      const f = document.getElementById('rotateModalForm');
      if (f) f.reset();
      modal.hidden = false;
      const cur = document.getElementById('curKeyInput');
      if (cur) setTimeout(() => cur.focus(), 40);
    },

    closeRotateModal() {
      const modal = document.getElementById('rotateModal');
      if (modal) modal.hidden = true;
    },

    fillRandomRotateKey() {
      const k = this.generateStrongKey('INSP');
      const i1 = document.getElementById('newKeyInput1');
      const i2 = document.getElementById('newKeyInput2');
      if (i1) i1.value = k;
      if (i2) i2.value = k;
    },

    async submitRotateKey(event) {
      if (event) event.preventDefault();
      const cur = String(document.getElementById('curKeyInput')?.value || '').trim();
      const k1 = String(document.getElementById('newKeyInput1')?.value || '').trim();
      const k2 = String(document.getElementById('newKeyInput2')?.value || '').trim();
      const err = document.getElementById('rotateModalErr');
      const btn = document.getElementById('rotateModalSubmit');

      if (k1 !== k2) {
        if (err) { err.className = 'mc-err'; err.textContent = '兩次輸入的新金鑰不一致，請重新確認。'; }
        return;
      }

      if (btn) btn.disabled = true;
      if (err) { err.className = 'mc-err'; err.textContent = '正在加密更新 60 天網路金鑰…'; }

      try {
        const res = await this.apiCall({
          action: 'rotate_key',
          current_key: cur,
          new_key: k1,
        });
        this.setGateToken(res.gate_token);
        this.applyPermissions(res.permissions, this.portalConfig);
        this.renderRotationStatus(res.rotation);
        if (err) {
          err.className = 'mc-err ok';
          err.textContent = `金鑰變更成功！新金鑰已啟用並重設 60 天週期（到期日：${twDate(res.rotation?.due_at)}）。請立即妥善記錄新金鑰：${k1}`;
        }
        this.adminLoaded = false;
        showToast('60 天網路金鑰已輪替更新，舊金鑰已立即失效。');
      } catch (e) {
        if (err) { err.className = 'mc-err'; err.textContent = e.message || '輪替失敗'; }
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    // ── Exhibit 06: Admin Console (Key Registry, Portal Config, Audit Logs) ──
    async loadAdminConsole(force = false) {
      if (!this.isAdmin()) return;
      if (this.adminLoaded && !force) return;
      const keysTbody = document.getElementById('admKeysTbody');
      const logsTbody = document.getElementById('admLogsTbody');
      if (keysTbody) keysTbody.innerHTML = '<tr><td colspan="9" style="color:var(--mute)">載入金鑰清冊中…</td></tr>';

      try {
        const res = await this.apiCall({ action: 'admin_overview' });
        this.adminLoaded = true;

        const driveInput = document.getElementById('admDriveUrl');
        const noticeInput = document.getElementById('admNoticeText');
        if (driveInput) driveInput.value = res.config?.drive_folder_url || '';
        if (noticeInput) noticeInput.value = res.config?.portal_notice || '';

        if (keysTbody) {
          const rows = res.keys || [];
          if (!rows.length) {
            keysTbody.innerHTML = '<tr><td colspan="9" style="color:var(--mute)">尚無金鑰資料</td></tr>';
          } else {
            keysTbody.innerHTML = rows
              .map((k) => {
                const expDate = twDate(k.expires_at);
                const remDays = k.expires_at ? Math.ceil((Date.parse(k.expires_at) - Date.now()) / 86400000) : 60;
                const expTag = remDays <= 0
                  ? `<span style="color:var(--t-danger);font-weight:700">${esc(expDate)}（已過期）</span>`
                  : remDays <= 7
                  ? `<span style="color:var(--t-warning);font-weight:700">${esc(expDate)}（剩 ${remDays} 天）</span>`
                  : `${esc(expDate)}（剩 ${remDays} 天）`;
                const statusBadge = k.enabled
                  ? '<span class="status-badge on">啟用中</span>'
                  : '<span class="status-badge off">已停用</span>';
                const currentTag = k.is_current ? ' <span class="mono-code">目前使用中</span>' : '';
                const permSummary = [
                  k.can_edit ? '編輯' : '唯讀',
                  k.can_approve ? '審核簽章' : null,
                  k.can_export ? '匯出' : null,
                ].filter(Boolean).join(' / ');
                const actions = k.is_current
                  ? '<button type="button" class="mc-link" onclick="InspAuth.openRotateModal()">輪替金鑰</button>'
                  : `<button type="button" class="mc-link" onclick="InspAuth.toggleKey('${esc(k.id)}', ${!k.enabled})">${k.enabled ? '停用' : '啟用'}</button> · <button type="button" class="mc-link" style="color:var(--t-danger)" onclick="InspAuth.deleteKey('${esc(k.id)}')">刪除</button>`;

                return `<tr>
                  <td><strong>${esc(k.label)}</strong>${currentTag}</td>
                  <td><span class="mono-code">${esc(k.key_hint)}</span></td>
                  <td><span class="role-pill ${esc(k.scope)}">${esc(k.scope.toUpperCase())}</span></td>
                  <td>${esc(permSummary)}</td>
                  <td style="font-variant-numeric:tabular-nums">${k.usage_count || 0}</td>
                  <td>${k.last_used_at ? esc(twFull(k.last_used_at)) : '尚未登入'}</td>
                  <td>${expTag}</td>
                  <td>${statusBadge}</td>
                  <td>${actions}</td>
                </tr>`;
              })
              .join('');
          }
        }

        if (logsTbody) {
          const logs = res.audit_logs || [];
          if (!logs.length) {
            logsTbody.innerHTML = '<tr><td colspan="5" style="color:var(--mute)">尚無稽核紀錄</td></tr>';
          } else {
            logsTbody.innerHTML = logs
              .map((l) => `<tr>
                <td style="white-space:nowrap;font-variant-numeric:tabular-nums">${esc(twFull(l.created_at))}</td>
                <td>${esc(l.actor_email || 'anonymous')}</td>
                <td><span class="mono-code">${esc(l.action)}</span></td>
                <td>${esc(l.target || '—')}</td>
                <td style="font-size:12px;color:var(--mute)">${esc(JSON.stringify(l.detail || {}))}</td>
              </tr>`)
              .join('');
          }
        }
      } catch (e) {
        if (keysTbody) {
          keysTbody.innerHTML = `<tr><td colspan="9" style="color:var(--t-danger)">載入失敗：${esc(e.message)}</td></tr>`;
        }
      }
    },

    async createKey(event) {
      if (event) event.preventDefault();
      const errEl = document.getElementById('admKeyErr');
      const revEl = document.getElementById('admKeyReveal');
      const btn = document.getElementById('admCreateKeyBtn');
      if (errEl) { errEl.className = 'mc-err'; errEl.textContent = ''; }
      if (revEl) revEl.hidden = true;
      if (btn) btn.disabled = true;

      try {
        const payload = {
          action: 'create_access_key',
          label: document.getElementById('admKeyLabel')?.value || '',
          scope: document.getElementById('admKeyScope')?.value || 'member',
          raw_key: document.getElementById('admKeyCustom')?.value || '',
          expires_days: Number(document.getElementById('admKeyDays')?.value || 60),
          enforce_expiry: Boolean(document.getElementById('admKeyEnforce')?.checked ?? true),
          can_export: Boolean(document.getElementById('admKeyExport')?.checked ?? true),
          can_edit: Boolean(document.getElementById('admKeyEdit')?.checked ?? true),
          can_approve: Boolean(document.getElementById('admKeyApprove')?.checked ?? false),
        };
        const res = await this.apiCall(payload);
        if (revEl) {
          revEl.hidden = false;
          revEl.innerHTML = `
            <div><strong>✅ 已發行全新 60 天網路金鑰（僅顯示一次，請立即複製交付）：</strong></div>
            <code>${esc(res.plaintext_key)}</code>
            <div style="font-size:12px;margin-top:4px">標籤：${esc(res.key.label)} · 等級：${esc(res.key.scope.toUpperCase())} · 到期日：${esc(twDate(res.key.expires_at))}</div>
          `;
        }
        document.getElementById('admCreateKeyForm')?.reset();
        const daysInp = document.getElementById('admKeyDays');
        if (daysInp) daysInp.value = '60';
        await this.loadAdminConsole(true);
      } catch (e) {
        if (errEl) { errEl.className = 'mc-err'; errEl.textContent = e.message || '發行失敗'; }
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    async toggleKey(id, enabled) {
      try {
        await this.apiCall({ action: 'update_access_key', id, enabled });
        showToast(enabled ? '已重新啟用該網路金鑰。' : '已立即停用該網路金鑰。');
        await this.loadAdminConsole(true);
      } catch (e) {
        showToast(e.message, true);
      }
    },

    async deleteKey(id) {
      if (!confirm('確定要永久刪除此網路金鑰嗎？刪除後將無法復原。')) return;
      try {
        await this.apiCall({ action: 'delete_access_key', id });
        showToast('已刪除該網路金鑰。');
        await this.loadAdminConsole(true);
      } catch (e) {
        showToast(e.message, true);
      }
    },

    async savePortalConfig(event) {
      if (event) event.preventDefault();
      const errEl = document.getElementById('admCfgErr');
      const btn = document.getElementById('admSaveCfgBtn');
      if (errEl) { errEl.className = 'mc-err'; errEl.textContent = ''; }
      if (btn) btn.disabled = true;

      try {
        const res = await this.apiCall({
          action: 'update_portal_config',
          drive_folder_url: document.getElementById('admDriveUrl')?.value || '',
          portal_notice: document.getElementById('admNoticeText')?.value || '',
        });
        this.applyPermissions(this.permissions, res.config);
        if (errEl) { errEl.className = 'mc-err ok'; errEl.textContent = '系統設定已儲存並立即生效。'; }
        await this.loadAdminConsole(true);
      } catch (e) {
        if (errEl) { errEl.className = 'mc-err'; errEl.textContent = e.message || '儲存失敗'; }
      } finally {
        if (btn) btn.disabled = false;
      }
    },
  };

  root.InspAuth = InspAuth;
})(window);
