"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchOrganization,
  fetchOrganizationMembers,
  fetchOrganizationInvitations,
  inviteOrganizationMember,
  reissueOrganizationInvitation,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  type OrganizationSummary,
  type OrganizationMember,
  type OrganizationInvitation,
} from "@/lib/api";

type InviteRole = "MEMBER";
type MemberRole = "ADMIN" | "MEMBER";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function TeamPage() {
  const { user, authState } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("MEMBER");
  const [inviteUrl, setInviteUrl] = useState("");
  const [notice, setNotice] = useState("");

  const enabled = authState === "authenticated";

  const { data: organization, isLoading: loadingOrg } = useQuery<OrganizationSummary>({
    queryKey: ["organization"],
    queryFn: fetchOrganization,
    enabled,
  });

  const { data: members = [], isLoading: loadingMembers } = useQuery<OrganizationMember[]>({
    queryKey: ["organizationMembers"],
    queryFn: fetchOrganizationMembers,
    enabled,
  });

  const { data: invitations = [] } = useQuery<OrganizationInvitation[]>({
    queryKey: ["organizationInvitations"],
    queryFn: fetchOrganizationInvitations,
    enabled: enabled && organization?.membership_role === "ADMIN",
  });

  const loading = loadingOrg || loadingMembers;
  const isAdmin = organization?.membership_role === "ADMIN";

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["organization"] });
    qc.invalidateQueries({ queryKey: ["organizationMembers"] });
    qc.invalidateQueries({ queryKey: ["organizationInvitations"] });
  }, [qc]);

  async function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setBusy(true); setError(null); setNotice(""); setInviteUrl("");
    try {
      const invite = await inviteOrganizationMember(normalized, inviteRole);
      const url = `${window.location.origin}/signup?invite_token=${encodeURIComponent(invite.invite_token)}`;
      setInviteUrl(url); setEmail("");
      setNotice(`Invitation created for ${invite.email}. Share this one-time link with the invitee.`);
      invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invitation");
    } finally { setBusy(false); }
  }

  async function changeRole(member: OrganizationMember, role: MemberRole) {
    setBusy(true); setError(null); setNotice("");
    try {
      await updateOrganizationMemberRole(member.user_id, role);
      setNotice(`Updated ${member.display_name}'s role to ${role}.`);
      invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update member role");
    } finally { setBusy(false); }
  }

  async function removeMember(member: OrganizationMember) {
    const confirmed = window.confirm(`Deactivate ${member.display_name} (${member.email}) and revoke their workspace access?`);
    if (!confirmed) return;
    setBusy(true); setError(null); setNotice("");
    try {
      await removeOrganizationMember(member.user_id);
      setNotice(`${member.display_name} has been deactivated and removed from the active workspace roster.`);
      invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove workspace member");
    } finally { setBusy(false); }
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setNotice("Invitation link copied.");
    } catch {
      setError("Clipboard access was blocked. Select and copy the invitation link manually.");
    }
  }

  async function reissueInvite(invitation: OrganizationInvitation) {
    setBusy(true); setError(null); setNotice(""); setInviteUrl("");
    try {
      const updated = await reissueOrganizationInvitation(invitation.invitation_id);
      const url = `${window.location.origin}/signup?invite_token=${encodeURIComponent(updated.invite_token)}`;
      setInviteUrl(url);
      setNotice(`A new invitation link was issued for ${updated.email}. The previous link is no longer valid.`);
      invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reissue invitation");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Workspace administration</p>
            <h1 className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>Team</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage the people who can access this organization and its connected knowledge.</p>
          </header>

          {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)", color: "var(--status-error-text)" }}>{error}</div>}
          {notice && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{notice}</div>}

          {loading ? (
            <div className="rounded-2xl p-8 text-sm" style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Loading workspace…</div>
          ) : organization ? (
            <>
              <section className="rounded-2xl p-5" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Current organization</p>
                    <h2 className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>{organization.name}</h2>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Workspace ID: {organization.tenant_id}</p>
                  </div>
                  <div className="flex gap-5">
                    <div><p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{organization.member_count}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>Active members</p></div>
                    <div><p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{organization.membership_role}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>Your role</p></div>
                  </div>
                </div>
              </section>

              {isAdmin && (
                <section className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                  <div>
                    <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Invite a teammate</h2>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Invitations expire after seven days. Copy and share the one-time link with the exact email address entered; reissuing invalidates the previous link.</p>
                  </div>
                  <form onSubmit={submitInvite} className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-3">
                    <label htmlFor="invite-email" className="sr-only">Email address</label>
                    <input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" className="rounded-xl px-3 py-2.5 text-sm outline-none" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <label htmlFor="invite-role" className="sr-only">Role</label>
                    <select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as InviteRole)} className="rounded-xl px-3 py-2.5 text-sm outline-none" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      <option value="MEMBER">Member</option>
                    </select>
                    <button type="submit" disabled={busy} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>{busy ? "Creating…" : "Create invite"}</button>
                  </form>
                  {inviteUrl && (
                    <div className="space-y-2">
                    <label htmlFor="invite-link" className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>One-time invitation link</label>
                      <div className="flex gap-2">
                        <input id="invite-link" readOnly value={inviteUrl} className="min-w-0 flex-1 rounded-xl px-3 py-2 text-xs" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        <button type="button" onClick={copyInvite} className="rounded-xl px-3 py-2 text-xs font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>Copy</button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div><h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Members</h2><p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Active accounts in this workspace</p></div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{members.length} members</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {members.map((member) => (
                    <div key={member.user_id} className="px-5 py-3.5 flex flex-wrap items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>{member.display_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{member.display_name}{member.user_id === user?.user_id ? " (you)" : ""}</p><p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{member.email} · Joined {dateLabel(member.joined_at)}</p></div>
                      {isAdmin && !member.is_owner && member.user_id !== user?.user_id ? (
                        <>
                          <select value={member.role} disabled={busy} onChange={(e) => changeRole(member, e.target.value as MemberRole)} className="rounded-lg px-2.5 py-2 text-xs" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                            {member.role === "VIEWER" && <option value="VIEWER" disabled>Viewer (legacy)</option>}
                            <option value="ADMIN">Admin</option><option value="MEMBER">Member</option>
                          </select>
                          <button type="button" disabled={busy} onClick={() => removeMember(member)} className="text-xs px-2.5 py-2 rounded-lg disabled:opacity-40" style={{ color: "var(--status-error-text)", border: "1px solid var(--border)" }}>Remove</button>
                        </>
                      ) : (
                        <span className="text-xs px-2.5 py-1.5 rounded-lg" style={{ color: "var(--text-secondary)", background: "var(--surface-hover)" }}>{member.is_owner ? "Owner · Admin" : member.role}</span>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && <p className="px-5 py-8 text-sm" style={{ color: "var(--text-muted)" }}>No active members found.</p>}
                </div>
              </section>

              {isAdmin && (
                <section className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}><h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Pending invitations</h2></div>
                  {invitations.length ? invitations.map((invite) => (
                    <div key={invite.invitation_id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
                      <div><p className="text-sm" style={{ color: "var(--text-primary)" }}>{invite.email}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{invite.role} · Expires {dateLabel(invite.expires_at)}</p></div>
                      <button type="button" disabled={busy} onClick={() => reissueInvite(invite)} className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-50" style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}>Reissue link</button>
                    </div>
                  )) : <p className="px-5 py-6 text-sm" style={{ color: "var(--text-muted)" }}>No pending invitations.</p>}
                </section>
              )}

              {!isAdmin && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Only workspace administrators can invite, change roles, or deactivate members.</p>}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
