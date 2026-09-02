import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { LoopsIcon, SettingsIcon } from './components/Icons';
import { archiveLoop, resumeLoop, snoozeLoop, startLoop } from '@/services/loopService';
import { SettingsView } from './components/SettingsView';
import { LoopsView } from './components/LoopsView';
import { getSettings } from '@/storage/settings';
import { parseLocalDateTime } from '@/utils/dateTime';
import type { LeaseOption, Loop } from '@/types/loop';
import { calculateLeaseExpiration } from '@/utils/lease';
import { getWaitingLoops } from '@/storage/loops';
import './App.css';

type PopupView = 'main' | 'loops' | 'settings';


function App() {
  const [pageTitle, setPageTitle] = useState('Loading current page...');
  const [pageUrl, setPageUrl] = useState('');
  const [purpose, setPurpose] = useState('');
  const [lease, setLease] = useState<LeaseOption>('none');
  const [customLeaseDate, setCustomLeaseDate] = useState('');
  const [customLeaseTime, setCustomLeaseTime] = useState('');
  const [use24HourTime, setUse24HourTime] = useState(false);
  const [remindOnReturn, setRemindOnReturn] = useState(false);
  const [waitingLoops, setWaitingLoops] = useState<Loop[]>([]);
  const [pageTabId, setPageTabId] = useState<number | null>(null);
  
  const [view, setView] = useState<PopupView>('main');

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

  const hasCustomeLeaseInput = 
    customLeaseDate.trim().length > 0 ||
    customLeaseTime.trim().length > 0;

  const canStartLoop = 
    purpose.trim().length > 0 &&
    hasValidCustomLease;

  useEffect(() => {
    async function loadCurrentTab() {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const currentTab = tabs[0];

      if (currentTab?.id !== undefined) {
        setPageTabId(currentTab.id);
      }

      if (currentTab?.title) {
        setPageTitle(currentTab.title);
      } else {
        setPageTitle('Unable to read current page');
      }

      if (currentTab?.url) {
        setPageUrl(currentTab.url);
      }
    }

    loadCurrentTab();
  }, []);

  useEffect(() => {
    async function loadWaitingLoops() {
      const loops = await getWaitingLoops();

      setWaitingLoops(loops);
    }

    void loadWaitingLoops();
  }, []);

  useEffect(() => {
    async function loadTimeSettings() {
      const settings = await getSettings();

      setUse24HourTime(settings.use24HourTime);
    }

    void loadTimeSettings();
  }, []);

    async function handleStartLoop() {
      if (!canStartLoop) {
        return;
      }

      const loop: Loop = {
        id: crypto.randomUUID(),
        title: pageTitle,
        url: pageUrl,
        purpose: purpose.trim(),
        lease,
        leaseExpiresAt: calculateLeaseExpiration(
          lease,
          new Date(),
          customLeaseTimestamp,
        ),
        remindOnReturn,
        status:'active',
        createdAt: Date.now(),
      };
      
      await startLoop(loop);

      if (pageTabId !== null) {
        await browser.tabs.remove(pageTabId);
      }

      console.log('Loop saved and tab closed:', loop);

      window.close();
    }

    if (view === 'loops') {
      return <LoopsView onBack={() => setView('main')} />;
    }

    if (view === 'settings') {
      return <SettingsView onBack={() => setView('main')} />;
    }

    async function handleCompleteLoop(id: string) {
      const archivedLoop = await archiveLoop(id);

      if (!archivedLoop) {
        return;
      }

      setWaitingLoops((currentLoops) => 
        currentLoops.filter((loop) => loop.id !== id),
      );
    }

    async function handleResumeLoop(loop: Loop) {
      await browser.tabs.create({
        url: loop.url,
      });

      const resumedLoop = await resumeLoop(loop.id);

      if (!resumedLoop) {
        return;
      }

      setWaitingLoops((currentLoops) => 
        currentLoops.filter((currentLoop) => currentLoop.id !== loop.id),
      );
    }

    async function handleSnoozeLoop(loop: Loop) {
      const snoozedLoop = await snoozeLoop(loop.id);

      if (!snoozedLoop) {
        return;
      }

      setWaitingLoops((currentLoops) => 
        currentLoops.filter((currentLoop) => currentLoop.id !== loop.id),
      );
    }
      

  return (
    <main className="app">
      <header className="mainHeader">
        <div className="appHeader">
          <div className="brandHeader">
            <img
              src="/icon/32.png"
              alt=""
              className="brandIcon"
            />

            <h1>RevisitLoop</h1>
          </div>
          
          <p>Close the tab, not the thought.</p>
        </div>

        <div className="headerActions">
          <button
            type="button"
            className="headerButton"
            onClick={() => setView('loops')}
          >
            <LoopsIcon />
            <span>Loops</span>
          </button>

          <button
            type="button"
            className="iconButton"
            onClick={() => setView('settings')}
            aria-label="Open settings"
            title="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {waitingLoops.length > 0 && (
        <section className="waitingSection">
          <div className="sectionHeader">
            <h2>Needs attention</h2>
            <span className="waitingCount">{waitingLoops.length}</span>
          </div>

          <div className="waitingList">
            {waitingLoops.map((loop) => (
              <article
                key={loop.id}
                className="waitingLoop"
              >
                <strong>{loop.purpose}</strong>
                <p>{loop.title}</p>

                <div className="waitingActions">
                  <button
                    type="button"
                    onClick={() => void handleResumeLoop(loop)}
                  >
                    Resume
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSnoozeLoop(loop)}
                  >
                    Snooze 1h
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCompleteLoop(loop.id)}
                  >
                    Done
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="currentPage">
        <span className="sectionLabel">Current page</span>
        <p className="pageTitle">{pageTitle}</p>
        <p 
          className="pageUrl"
          title={pageUrl}
        >
          {pageUrl}
        </p>
      </section>

      <section className="loopForm">
        <label htmlFor="purpose">Why is this tab open?</label>

        <textarea
          id="purpose"
          name="purpose"
          placeholder="What do you need to come back to?"
          rows={3}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        />

        <fieldset>
          <legend>Keep this tab until</legend>

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
              <label htmlFor="custom-lease">
                Date
              </label>

              <input
                id="custom-lease-date"
                type="text"
                value={customLeaseDate}
                onChange={(event) => 
                  setCustomLeaseDate(event.target.value)
                }
                placeholder="MM/DD/YYYY"
                inputMode="numeric"
              />

              <label htmlFor="custom-lease-time">
                Time
              </label>

              <input
                id="custom-lease-time"
                type="text"
                value={customLeaseTime}
                onChange={(event) => 
                  setCustomLeaseTime(event.target.value)
                }
                placeholder={
                  use24HourTime
                    ? '15:30'
                    : '3:30 PM'
                }
              />

              <p className="customLeaseHint">
                {use24HourTime
                  ? 'Example: 09/05/2026 at 15:30'
                  : 'Example: 09/05/2026 at 3:30 PM'}
              </p>

              {!hasValidCustomLease && hasCustomeLeaseInput && (
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
          Remind me when I return to this site
        </label>

        <button 
          type="button" 
          className="primaryButton"
          onClick={handleStartLoop}
          disabled={!canStartLoop}
          >
          Start Loop & Close Tab
        </button>
      </section>
    </main>
  );
}

export default App;