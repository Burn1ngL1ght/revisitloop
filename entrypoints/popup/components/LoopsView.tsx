import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { archiveLoop, removeLoop, restoreLoop } from '@/services/loopService';
import { EditLoopView } from './EditLoopView';
import { getActiveLoops, getArchivedLoops } from '@/storage/loops';
import { getSettings } from '@/storage/settings';
import { formatLocalDateTime } from '@/utils/dateTime';
import { ArrowLeftIcon } from './Icons';
import type { Loop } from '@/types/loop';

type LoopsViewProps = {
  onBack: () => void;
};

type LoopsTab = 'active' | 'archived';

export function LoopsView({ onBack }: LoopsViewProps) {
  const [tab, setTab] = useState<LoopsTab>('active');
  const [activeLoops, setActiveLoops] = useState<Loop[]>([]);
  const [archivedLoops, setArchivedLoops] = useState<Loop[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingLoop, setEditingLoop] = useState<Loop | null>(null);
  const [use24HourTime, setUse24HourTime] = useState(false);

  async function handleArchiveLoop(id: string) {
    const archivedLoop = await archiveLoop(id);

    if (!archivedLoop) {
        return;
    }

    setActiveLoops((currentLoops) => 
        currentLoops.filter((loop) => loop.id !== id),
    );

    setArchivedLoops((currentLoops) => [
        ...currentLoops,
        archivedLoop,
    ]);
  }

  async function handleOpenLoop(loop: Loop) {
    await browser.tabs.create({
        url:loop.url,
    });
  }

  async function handleRestoreLoop(id: string) {
    const restoredLoop = await restoreLoop(id);

    if(!restoredLoop) {
        return;
    }

    setArchivedLoops((currentLoops) => 
        currentLoops.filter((loop) => loop.id !== id),
    );

    setActiveLoops((currentLoops) => [
        ...currentLoops,
        restoredLoop,
    ]);
  }

  async function handleDeleteLoop(id: string) {
    const deleted = await removeLoop(id);

    if (!deleted) {
        return;
    }

    setArchivedLoops((currentLoops) => 
        currentLoops.filter((loop) => loop.id !== id),
    );

    setDeleteConfirmId(null);
  }

  useEffect(() => {
    async function loadLoops() {
        const active = await getActiveLoops();
        const archived = await getArchivedLoops();
        const settings = await getSettings();

        setActiveLoops(active);
        setArchivedLoops(archived);
        setUse24HourTime(settings.use24HourTime);
    }

    void loadLoops();
  }, []);

  if (editingLoop) {
    return (
        <EditLoopView
            loop={editingLoop}
            onCancel={() => setEditingLoop(null)}
            onSaved={(updatedLoop) => {
                setActiveLoops((currentLoops) =>
                    currentLoops.map((loop) => 
                        loop.id === updatedLoop.id
                            ? updatedLoop
                            : loop,
                    ),
                );

                setEditingLoop(null);
            }}
        />
    );
  }

  return (
    <main className="app">
      <header className="settingsHeader">
        <button
          type="button"
          className="iconButton"
          onClick={onBack}
          aria-label="Back to RevisitLoop"
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Loops</h1>
          <p>View and manage your saved Loops.</p>
        </div>
      </header>

      <nav className="loopsTabs" aria-label="Loop categories">
        <button
          type="button"
          className={tab === 'active' ? 'selected' : ''}
          onClick={() => setTab('active')}
        >
          Active
        </button>

        <button
          type="button"
          className={tab === 'archived' ? 'selected' : ''}
          onClick={() => setTab('archived')}
        >
          Archived
        </button>
      </nav>

      {tab === 'active' ? (
        <section className="loopsViewSection">
          <div className="sectionHeader">
            <h2>Active Loops</h2>

            {activeLoops.length > 0 && (
                <span className="waitingCount">{activeLoops.length}</span>
            )}
          </div>

          {activeLoops.length === 0 ? (
            <p className="emptyState">
                You don't have any active Loops.
            </p>
          ) : (
            <div className="loopsManagementList">
                {activeLoops.map((loop) => (
                    <article
                        key={loop.id}
                        className="managedLoop"
                    >
                        <strong>{loop.purpose}</strong>
                        <p>{loop.title}</p>

                        <span className="loopLease">
                            {loop.leaseExpiresAt === null
                            ? 'No expiration'
                            : `Expires ${formatLocalDateTime(
                                loop.leaseExpiresAt,
                                use24HourTime,
                            )}`}
                        </span>

                        {loop.remindOnReturn && (
                            <span className="loopReminder">
                                Remind on return
                            </span>
                        )}

                        <div className="managedLoopActions">
                            <button
                                type="button"
                                onClick={() => void handleOpenLoop(loop)}
                            >
                                Open
                            </button>

                            <button
                                type="button"
                                onClick={() => setEditingLoop(loop)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleArchiveLoop(loop.id)}
                            >
                                Archive
                            </button>
                        </div>
                    </article>
                ))}
            </div>
          )}
        </section>
      ) : (
        <section className="loopsViewSection">
          <div className="sectionHeader">
            <h2>Archived Loops</h2>

            {archivedLoops.length > 0 && (
                <span className="waitingCount">{archivedLoops.length}</span>
            )}
          </div>

          {archivedLoops.length === 0 ? (
            <p className="emptyState">
                You don't have any archived Loops.
            </p>
          ) : (
            <div className="loopsManagementList">
                {archivedLoops.map((loop) => (
                    <article
                        key={loop.id}
                        className="managedLoop"
                    >
                        <strong>{loop.purpose}</strong>
                        <p>{loop.title}</p>

                        <span className="loopLease">
                            Archived
                        </span>

                        <div className="managedLoopActions">
                            {deleteConfirmId === loop.id ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="dangerButton"
                                        onClick={() => void handleDeleteLoop(loop.id)}
                                    >
                                        Delete Permanently
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => void handleOpenLoop(loop)}
                                    >
                                        Open
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void handleRestoreLoop(loop.id)}
                                    >
                                        Restore
                                    </button>

                                    <button
                                        type="button"
                                        className="dangerButton"
                                        onClick={() => setDeleteConfirmId(loop.id)}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </article>
                ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}