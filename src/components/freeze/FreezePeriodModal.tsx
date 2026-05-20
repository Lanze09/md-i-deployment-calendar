import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { ENVIRONMENTS } from '../../constants/environments';
import { useApp } from '../../context/AppContext';
import type { EnvironmentName, FreezePeriod, FreezePeriodInput } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';

const inputClass =
  'w-full rounded-btn border border-slate-300 bg-white px-3 py-2 text-sm font-body text-slate-900 transition-colors focus:border-accenture-400 dark:border-slate-700 dark:bg-surface-dark-tertiary dark:text-slate-100';

const blankInput: FreezePeriodInput = {
  title: '',
  reason: null,
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(new Date(), 'yyyy-MM-dd'),
  affected_environments: [],
};

export function FreezePeriodModal() {
  const app = useApp();
  const { isFreezeModalOpen, setFreezeModalOpen, freezePeriods, pushToast } = app;

  const [draft, setDraft] = useState<FreezePeriodInput>(blankInput);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isFreezeModalOpen) {
      setDraft(blankInput);
      setEditingId(null);
    }
  }, [isFreezeModalOpen]);

  const beginEdit = (f: FreezePeriod) => {
    setEditingId(f.id);
    setDraft({
      title: f.title,
      reason: f.reason,
      start_date: f.start_date,
      end_date: f.end_date,
      affected_environments: f.affected_environments,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      pushToast({ type: 'error', title: 'Title required' });
      return;
    }
    try {
      if (editingId) {
        await freezePeriods.edit(editingId, draft);
        pushToast({ type: 'success', title: 'Freeze period updated' });
      } else {
        await freezePeriods.add(draft);
        pushToast({ type: 'success', title: 'Freeze period added' });
      }
      setDraft(blankInput);
      setEditingId(null);
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to save', description: (err as Error).message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await freezePeriods.remove(id);
      pushToast({ type: 'info', title: 'Freeze period removed' });
      setConfirmDeleteId(null);
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to delete', description: (err as Error).message });
    }
  };

  const toggleEnv = (env: EnvironmentName) => {
    setDraft((prev) => ({
      ...prev,
      affected_environments: prev.affected_environments.includes(env)
        ? prev.affected_environments.filter((e) => e !== env)
        : [...prev.affected_environments, env],
    }));
  };

  return (
    <>
      <Modal
        isOpen={isFreezeModalOpen}
        onClose={() => setFreezeModalOpen(false)}
        title="Freeze periods"
        size="lg"
        labelledBy="freeze-modal-title"
      >
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Existing freezes
            </h3>
            {freezePeriods.freezePeriods.length === 0 ? (
              <p className="text-sm text-slate-500">None configured.</p>
            ) : (
              <ul className="space-y-2">
                {freezePeriods.freezePeriods.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-start gap-3 rounded-card border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {f.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(parseISO(f.start_date), 'MMM d')} – {format(parseISO(f.end_date), 'MMM d, yyyy')}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {f.affected_environments.map((e) => (
                          <Badge key={e}>{e}</Badge>
                        ))}
                      </div>
                      {f.reason && (
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                          {f.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" onClick={() => beginEdit(f)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(f.id)}
                        aria-label="Delete freeze period"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {editingId ? 'Edit freeze' : 'Add new freeze'}
            </h3>
            <input
              className={inputClass}
              placeholder="Title (e.g. Client UAT Freeze)"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <textarea
              className={`${inputClass} h-16 resize-none`}
              placeholder="Reason"
              value={draft.reason ?? ''}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value || null })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className={inputClass}
                value={draft.start_date}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
              />
              <input
                type="date"
                className={inputClass}
                value={draft.end_date}
                onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
              />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-500">Affected environments</div>
              <div className="grid grid-cols-2 gap-1">
                {ENVIRONMENTS.map((env) => (
                  <Checkbox
                    key={env}
                    checked={draft.affected_environments.includes(env)}
                    onChange={() => toggleEnv(env)}
                    label={env}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setDraft(blankInput);
                  }}
                >
                  Cancel edit
                </Button>
              )}
              <Button type="submit">
                <Plus size={14} /> {editingId ? 'Save changes' : 'Add freeze'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete freeze period?"
        message="This removes the freeze entirely. Deployments scheduled during this window will no longer show a warning."
        confirmLabel="Delete"
        destructive
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
