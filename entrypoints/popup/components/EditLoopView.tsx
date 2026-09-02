import { useEffect, useState } from 'react';
import { updateActiveLoop } from '@/services/loopService';
import { formatDateTimeForInput, parseLocalDateTime } from '@/utils/dateTime';
import { getSettings } from '@/storage/settings';
import type { LeaseOption, Loop } from '@/types/loop';
import { ArrowLeftIcon } from './Icons';

type EditLoopViewProps = {
  loop: Loop;
  onCancel: () => void;
  onSaved: (loop: Loop) => void;
};

export function EditLoopView({
  loop,
  onCancel,
  onSaved,
}: EditLoopViewProps) {
  const [purpose, setPurpose] = useState(loop.purpose);
  const [lease, setLease] = useState<LeaseOption>(loop.lease);
  const [remindOnReturn, setRemindOnReturn] = useState(loop.remindOnReturn);
  const [use24HourTime, setUse24HourTime] = useState(false);
  const [customLeaseDate, setCustomLeaseDate] = useState('');
  const [customLeaseTime, setCustomLeaseTime] = useState('');

  const customLeaseTimestamp =
    lease === 'custom'
      ? parseLocalDateTime(
          customLeaseDate,
          customLeaseTime,
          use24HourTime,
      )
    : null;

  const hasValidCustomLease =
      lease !== 'custom' ||
      (
        customLeaseTimestamp !== null &&
        customLeaseTimestamp > Date.now()
      );

  const hasCustomLeaseInput =
      customLeaseDate.trim().length > 0 ||
      customLeaseTime.trim().length > 0;

  const canSave =
      purpose.trim().length > 0 &&
      hasValidCustomLease;

  async function handleSave() {
    if (!canSave) {
      return;
    }

    const updatedLoop = await updateActiveLoop(loop.id, {
      purpose,
      lease,
      remindOnReturn,
      customLeaseExpiresAt:
        lease === 'custom'
          ? customLeaseTimestamp
          : undefined,
    });

    if (!updatedLoop) {
      return;
    }

    onSaved(updatedLoop);
  }

  useEffect(() => {
    async function loadTimeSettings() {
      const settings = await getSettings();

      setUse24HourTime(settings.use24HourTime);

      if (
        loop.lease === 'custom' &&
        loop.leaseExpiresAt !== null
      ) {
        const formatted = formatDateTimeForInput(
          loop.leaseExpiresAt,
          settings.use24HourTime,
        );

        setCustomLeaseDate(formatted.dateText);
        setCustomLeaseTime(formatted.timeText);
      }
    }

    void loadTimeSettings();
  })

  return (
    <main className="app">
      <header className="settingsHeader">
        <button
          type="button"
          className="iconButton"
          onClick={onCancel}
          aria-label="Back to Active Loops"
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Edit Loop</h1>
          <p>Change this Loop's purpose or lease.</p>
        </div>
      </header>

      <section className="currentPage">
        <p className="sectionLabel">Saved page</p>
        <p className="pageTitle">{loop.title}</p>
        <p
          className="pageUrl"
          title={loop.url}
        >
          {loop.url}
        </p>
      </section>

      <div className="loopForm">
        <label htmlFor="edit-purpose">
          Why is this tab open?
        </label>

        <textarea
          id="edit-purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          rows={3}
        />

        <fieldset>
          <legend>Lease</legend>

          <div className="leaseOptions">
            <button
              type="button"
              className={lease === 'none' ? 'selected' : ''}
              onClick={() => setLease('none')}
            >
              No expiration
            </button>

            <button
              type="button"
              className={lease === '1-hour' ? 'selected' : ''}
              onClick={() => setLease('1-hour')}
            >
              1 hour
            </button>

            <button
              type="button"
              className={lease === 'tonight' ? 'selected' : ''}
              onClick={() => setLease('tonight')}
            >
              Tonight
            </button>

            <button
              type="button"
              className={lease === 'tomorrow' ? 'selected' : ''}
              onClick={() => setLease('tomorrow')}
            >
              Tomorrow
            </button>

            <button
              type="button"
              className={lease === 'custom' ? 'selected' : ''}
              onClick={() => setLease('custom')}
            >
              Custom
            </button>
          </div>

          {lease === 'custom' && (
            <div className="customLease">
              <label htmlFor="edit-custom-lease-date">
                Date
              </label>

              <input
                id="edit-custom-lease-date"
                type="text"
                value={customLeaseDate}
                onChange={(event) => 
                  setCustomLeaseDate(event.target.value)
                }
                placeholder="MM/DD/YYYY"
                inputMode="numeric"
              />

              <label htmlFor="edit-custom-lease-time">
                Time
              </label>

              <input
                id="edit-custom-lease-time"
                type="text"
                value={customLeaseTime}
                onChange={(event) => 
                  setCustomLeaseTime(event.target.value)
                }
                placeholder={
                  use24HourTime
                    ? '15:30'
                    : '3:30'
                }
              />

              <p className="customLeaseHint">
                {use24HourTime
                  ? 'Example: 09/05/2026 at 15:30'
                  : 'Example: 09/05/2026 at 3:30 PM'}
              </p>

              {!hasValidCustomLease && hasCustomLeaseInput && (
                <p className="fieldError">
                  Enter a valid date and future time.
                </p>
              )}
            </div>
          )}
        </fieldset>

        <label className="reminderOption">
          <input
            type="checkbox"
            checked={remindOnReturn}
            onChange={(event) => setRemindOnReturn(event.target.checked)}
          />

          <span>Remind me when I return to this site</span>
        </label>

        <div className="editActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primaryButton"
            onClick={() => void handleSave()}
            disabled={!canSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </main>
  );
}