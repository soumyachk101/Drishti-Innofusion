// Drishti v0.1 — organization settings page | 11-Jul-2026
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ApiError, api } from "../../api/client";
import { useAuth } from "../../auth";
import { Button } from "../../components/Button";
import { Card } from "../../components/primitives";
import { useToast } from "../../store/graphStore";
import { Field } from "../auth/AuthLayout";

export function SettingsPage() {
  const { user, refreshMe } = useAuth();
  const toast = useToast();
  const orgQ = useQuery({ queryKey: ["org"], queryFn: () => api.org() });

  const [name, setName] = useState(user?.name ?? "");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);

  const saveName = useMutation({
    mutationFn: () => api.patchMe({ name: name.trim() }),
    onSuccess: async () => {
      await refreshMe();
      toast.show("Profile updated", "success");
    },
    onError: () => toast.show("Couldn't update the profile — retry", "error"),
  });

  const changePw = useMutation({
    mutationFn: () => api.patchMe({ current_password: pw.current, new_password: pw.next }),
    onSuccess: () => {
      setPw({ current: "", next: "", confirm: "" });
      toast.show("Password changed", "success");
    },
    onError: (err) =>
      setPwError(
        err instanceof ApiError && err.status === 401
          ? "Current password is incorrect."
          : "Couldn't change the password — retry.",
      ),
  });

  const submitName = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) saveName.mutate();
  };
  const submitPw = (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pw.next.length < 8) {
      setPwError("New password needs at least 8 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("New passwords don't match.");
      return;
    }
    changePw.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="font-display text-h1 text-ink-primary">Settings</h1>

      <Card className="space-y-4 p-5">
        <div className="font-display text-h3 text-ink-primary">Profile</div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-small">
          <dt className="text-ink-muted">Email</dt>
          <dd className="font-mono text-ink-secondary">{user?.email}</dd>
          <dt className="text-ink-muted">Role</dt>
          <dd className="text-ink-secondary">{user?.role}</dd>
          <dt className="text-ink-muted">Organization</dt>
          <dd className="text-ink-secondary">
            {user?.org_name}
            {orgQ.data && (
              <span className="text-ink-muted">
                {" "}
                · {orgQ.data.asset_count} assets · {orgQ.data.member_count} member
                {orgQ.data.member_count === 1 ? "" : "s"}
              </span>
            )}
          </dd>
        </dl>
        <form onSubmit={submitName} className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" loading={saveName.isPending} disabled={!name.trim()}>
            Save
          </Button>
        </form>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="font-display text-h3 text-ink-primary">Change password</div>
        <form onSubmit={submitPw} className="space-y-3" noValidate>
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={pw.current}
            onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))}
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            value={pw.next}
            onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))}
          />
          <Field
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={pw.confirm}
            onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
          />
          {pwError && (
            <div className="rounded-md border border-risk-critical/30 bg-risk-critical/10 p-2.5 text-small text-ink-secondary">
              {pwError}
            </div>
          )}
          <Button type="submit" loading={changePw.isPending} disabled={!pw.current || !pw.next}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
