import { useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { updateSettings } from '@/storage/settings';

type OnboardingStep =
  | 'welcome'
  | 'pin'
  | 'finish';

function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isPinned, setIsPinned] = useState<boolean | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  async function checkPinnedStatus() {
    setCheckingPin(true);

    const userSettings = 
        await browser.action.getUserSettings();

    setIsPinned(userSettings.isOnToolbar);
    setCheckingPin(false);
  }

  async function handleFinish() {
    await updateSettings({
        onboardingCompleted: true,
    });

    const currentTab = await browser.tabs.getCurrent();

    if (currentTab?.id !== undefined) {
        await browser.tabs.remove(currentTab.id);
    }
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step === 'pin') {
        void checkPinnedStatus();
    }
  }, [step]);


  if (step === 'pin') {
  return (
    <main className="onboarding">
      <section className="welcomeCard">
        <img
          src="/icon/128.png"
          alt=""
          className="welcomeLogo"
        />

        <p className="stepLabel">
          Step 2 of 3
        </p>

        <h1
            ref={headingRef}
            tabIndex={-1}
        >
            Keep RevisitLoop close by
        </h1>


        <p className="intro">
          Pin RevisitLoop to your browser toolbar
          so it is easy to save a page and so you
          can always see the badge when a Loop needs
          your attention.
        </p>

        <div className="pinInstructions">
          <strong>How to pin it</strong>

          <p>
            Open your browser's extensions menu,
            find RevisitLoop, and choose the option
            to pin it to the toolbar.
          </p>
        </div>

        <div
          className={
            isPinned
              ? 'pinStatus pinStatusSuccess'
              : 'pinStatus'
          }
        >
          {checkingPin ? (
            <span>Checking toolbar...</span>
          ) : isPinned ? (
            <>
              <strong>RevisitLoop is pinned</strong>
              <span>
                You’ll be able to see waiting Loop
                badges directly from the toolbar.
              </span>
            </>
          ) : (
            <>
              <strong>Not pinned yet</strong>
              <span>
                Pin it when you’re ready, then check
                again below.
              </span>
            </>
          )}
        </div>

        <div className="pinActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={() => setStep('welcome')}
          >
            Back
          </button>

          {isPinned ? (
            <button
              type="button"
              className="primaryButton"
              onClick={() => setStep('finish')}
            >
              Continue
            </button>
          ) : (
            <>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => setStep('finish')}
              >
                Skip for now
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={() => void checkPinnedStatus()}
                disabled={checkingPin}
              >
                {checkingPin
                  ? 'Checking...'
                  : 'Check again'}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

  if (step === 'finish') {
    return (
      <main className="onboarding">
        <section className="welcomeCard">
          <img
            src="/icon/128.png"
            alt=""
            className="welcomeLogo"
          />

          <p className="stepLabel">
            Step 3 of 3
          </p>

          <h1
            ref={headingRef}
            tabIndex={-1}
          >
            You're ready to start looping
          </h1>

          <p className="intro">
            RevisitLoop will use toolbar badges by
            default when something needs your
            attention. System notifications are
            optional and can be enabled later in
            Settings.
          </p>

          <button
            type="button"
            className="primaryButton"
            onClick={() => void handleFinish()}
          >
            Finish
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="onboarding">
      <section className="welcomeCard">
        <img
          src="/brand/revisitloop-brand.png"
          alt=""
          className="welcomeBrand"
        />

        <p className="stepLabel">
          Step 1 of 3
        </p>

        <h1
          ref={headingRef}
          tabIndex={-1}
        >
            Welcome to RevisitLoop
        </h1>

        <p className="tagline">
          Close the tab, not the thought.
        </p>

        <p className="intro">
          Save why a page matters, give it a lease
          if you want, and close the tab without
          losing the reason you opened it.
        </p>

        <div className="featureSummary">
          <div>
            <strong>Save the context</strong>
            <span>
              Keep the reason a page matters,
              not just the URL.
            </span>
          </div>

          <div>
            <strong>Come back when it matters</strong>
            <span>
              Use leases or return-to-site reminders
              to bring a Loop back to your attention.
            </span>
          </div>

          <div>
            <strong>Keep your browser cleaner</strong>
            <span>
              Close the tab while RevisitLoop keeps
              track of the thought for you.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="primaryButton"
          onClick={() => setStep('pin')}
        >
          Get started
        </button>
      </section>
    </main>
  );
}

export default Onboarding;