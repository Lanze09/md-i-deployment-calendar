import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ENVIRONMENTS, RISK_COLORS, RISK_LEVELS, STATUSES } from '../../constants/environments';
import { TEAMS, TEAM_KEYS } from '../../constants/teams';
import { cx, deploymentIsFrozen } from '../../lib/utils';
import type {
  Deployment,
  DeploymentInput,
  EnvironmentName,
  RiskLevel,
  TeamKey,
} from '../../types';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

const emptyInput = (dateIso: string | null): DeploymentInput => ({
  title: '',
  description: null,
  team: 'IDM',
  environment: 'Development',
  deploy_date: dateIso ?? new Date().toISOString().slice(0, 10),
  deploy_time_start: null,
  deploy_time_end: null,
  status: 'Scheduled',
  owner: '',
  risk_level: 'Low',
  rollback_plan: null,
  notes: null,
});

interface FormErrors {
  title?: string;
  owner?: string;
  deploy_date?: string;
}

export function DeploymentModal() {
  const app = useApp();
  const {
    isDeploymentModalOpen,
    editingDeployment,
    selectedDate,
    closeDeploymentModal,
    deployments,
    freezePeriods,
    pushToast,
  } = app;

  const [form, setForm] = useState<DeploymentInput>(() =>
    editingDeployment ? toInput(editingDeployment) : emptyInput(selectedDate),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isDeploymentModalOpen) {
      setForm(editingDeployment ? toInput(editingDeployment) : emptyInput(selectedDate));
      setErrors({});
      setShowAdvanced(Boolean(editingDeployment?.rollback_plan));
    }
  }, [isDeploymentModalOpen, editingDeployment, selectedDate]);

  const frozen = deploymentIsFrozen(
    { deploy_date: form.deploy_date, environment: form.environment },
    freezePeriods.freezePeriods,
  );

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.owner.trim()) next.owner = 'Owner is required';
    if (!form.deploy_date) next.deploy_date = 'Date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingDeployment) {
        await deployments.edit(editingDeployment.id, form);
        pushToast({ type: 'success', title: 'Deployment updated', description: form.title });
      } else {
        await deployments.add(form);
        pushToast({ type: 'success', title: 'Deployment scheduled', description: form.title });
      }
      closeDeploymentModal();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Failed to save',
        description: (err as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingDeployment) return;
    try {
      await deployments.remove(editingDeployment.id);
      pushToast({ type: 'info', title: 'Deployment deleted' });
      setConfirmDelete(false);
      closeDeploymentModal();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Failed to delete',
        description: (err as Error).message,
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={isDeploymentModalOpen}
        onClose={closeDeploymentModal}
        title={editingDeployment ? 'Edit deployment' : 'New deployment'}
        size="lg"
        labelledBy="deployment-modal-title"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {frozen && (
            <div className="flex items-start gap-2 rounded-card border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-sm">
              <AlertTriangle size={16} className="mt-0.5 text-status-warning" />
              <div>
                <div className="font-medium text-status-warning">Inside freeze period</div>
                <div className="text-slate-600 dark:text-slate-300">
                  {frozen.title}: {frozen.reason}
                </div>
              </div>
            </div>
          )}

          <Field
            label="Title"
            error={errors.title}
            input={
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="e.g. IDM v25C — UAT migration cycle 1"
              />
            }
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Team"
              input={
                <div className="relative">
                  <Select
                    value={form.team}
                    onChange={(e) => setForm({ ...form, team: e.target.value as TeamKey })}
                    options={TEAM_KEYS.map((k) => ({ value: k, label: `${TEAMS[k].label} — ${TEAMS[k].fullName}` }))}
                  />
                  <span
                    className="pointer-events-none absolute left-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: TEAMS[form.team].color }}
                  />
                  <style>{`select { padding-left: 22px; }`}</style>
                </div>
              }
            />
            <Field
              label="Environment"
              input={
                <Select
                  value={form.environment}
                  onChange={(e) =>
                    setForm({ ...form, environment: e.target.value as EnvironmentName })
                  }
                  options={ENVIRONMENTS.map((e) => ({ value: e, label: e }))}
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Date"
              error={errors.deploy_date}
              input={
                <input
                  type="date"
                  value={form.deploy_date}
                  onChange={(e) => setForm({ ...form, deploy_date: e.target.value })}
                  className={inputClass}
                />
              }
            />
            <Field
              label="Start time"
              input={
                <input
                  type="time"
                  value={form.deploy_time_start ?? ''}
                  onChange={(e) => setForm({ ...form, deploy_time_start: e.target.value || null })}
                  className={inputClass}
                />
              }
            />
            <Field
              label="End time"
              input={
                <input
                  type="time"
                  value={form.deploy_time_end ?? ''}
                  onChange={(e) => setForm({ ...form, deploy_time_end: e.target.value || null })}
                  className={inputClass}
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Owner"
              error={errors.owner}
              input={
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Lanze"
                />
              }
            />
            <Field
              label="Status"
              input={
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Deployment['status'] })}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                />
              }
            />
          </div>

          <Field
            label="Risk level"
            input={
              <div className="flex gap-1.5">
                {RISK_LEVELS.map((r) => {
                  const active = form.risk_level === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setForm({ ...form, risk_level: r as RiskLevel })}
                      className={cx(
                        'flex-1 rounded-btn px-3 py-1.5 text-xs font-medium transition-all',
                        active
                          ? 'text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-surface-dark-tertiary dark:text-slate-300 dark:hover:bg-slate-700',
                      )}
                      style={active ? { backgroundColor: RISK_COLORS[r] } : undefined}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            }
          />

          <Field
            label="Description"
            input={
              <textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                className={cx(inputClass, 'h-20 resize-none')}
                placeholder="What is being deployed and why"
              />
            }
          />

          <Field
            label="Notes"
            input={
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
                className={cx(inputClass, 'h-16 resize-none')}
                placeholder="Anything the rest of the group should know"
              />
            }
          />

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs font-medium text-accenture-400 hover:underline"
          >
            {showAdvanced ? 'Hide rollback plan' : 'Show rollback plan'}
          </button>
          {showAdvanced && (
            <Field
              label="Rollback plan"
              input={
                <textarea
                  value={form.rollback_plan ?? ''}
                  onChange={(e) => setForm({ ...form, rollback_plan: e.target.value || null })}
                  className={cx(inputClass, 'h-20 resize-none')}
                  placeholder="If this goes wrong, how do we roll back?"
                />
              }
            />
          )}

          <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
            <div>
              {editingDeployment && (
                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" type="button" onClick={closeDeploymentModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editingDeployment ? 'Save changes' : 'Schedule deployment'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete deployment?"
        message={`This permanently removes "${editingDeployment?.title}" from the calendar.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

const inputClass =
  'w-full rounded-btn border border-slate-300 bg-white px-3 py-2 text-sm font-body text-slate-900 transition-colors focus:border-accenture-400 dark:border-slate-700 dark:bg-surface-dark-tertiary dark:text-slate-100';

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {input}
      {error && <span className="mt-1 block text-xs text-status-danger">{error}</span>}
    </label>
  );
}

function toInput(d: Deployment): DeploymentInput {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = d;
  return rest;
}
