"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo, type Variants } from "motion/react";
import Image from "next/image";
import { useReducer } from "react";
import type { Decision, Match, PublicProfile } from "@/lib/discover";

type Notice = { id: number; tone: Decision | "error"; text: string };

type State = {
  deck: PublicProfile[];
  matches: Match[];
  view: "deck" | "matches";
  celebrating: Match | null;
  notice: Notice | null;
  lastDecision: Decision;
};

type Action =
  | { type: "swiped"; profile: PublicProfile; decision: Decision }
  | { type: "matched"; match: Match }
  | { type: "failed"; profile: PublicProfile; message: string }
  | { type: "closeMatch" }
  | { type: "show"; view: State["view"] };

const nextId = (n: Notice | null) => (n?.id ?? 0) + 1;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "swiped":
      return {
        ...s,
        deck: s.deck.filter((p) => p.id !== a.profile.id),
        lastDecision: a.decision,
        notice: {
          id: nextId(s.notice),
          tone: a.decision,
          text: a.decision === "like" ? `You liked ${a.profile.name}` : `You passed on ${a.profile.name}`,
        },
      };
    case "matched":
      return { ...s, celebrating: a.match, matches: [a.match, ...s.matches.filter((m) => m.profile.id !== a.match.profile.id)] };
    case "failed":
      return { ...s, deck: [a.profile, ...s.deck], notice: { id: nextId(s.notice), tone: "error", text: a.message } };
    case "closeMatch":
      return { ...s, celebrating: null };
    case "show":
      return { ...s, view: a.view, celebrating: null };
  }
}

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

export function Discover({ initialFeed, initialMatches }: { initialFeed: PublicProfile[]; initialMatches: Match[] }) {
  const [state, dispatch] = useReducer(reducer, {
    deck: initialFeed,
    matches: initialMatches,
    view: "deck",
    celebrating: null,
    notice: null,
    lastDecision: "pass",
  });
  const top = state.deck[0];
  const next = state.deck[1];

  async function decide(profile: PublicProfile, decision: Decision) {
    dispatch({ type: "swiped", profile, decision });
    try {
      const res = await fetch("/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, decision }),
      });
      if (res.status === 409) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { matched: boolean; match: Match | null };
      if (body.match) dispatch({ type: "matched", match: body.match });
    } catch {
      dispatch({ type: "failed", profile, message: `Couldn't save that swipe. ${profile.name} is back on top.` });
    }
  }

  const swipeTop = (decision: Decision) => top && void decide(top, decision);
  const showMatches = () => dispatch({ type: "show", view: "matches" });
  const showDeck = () => dispatch({ type: "show", view: "deck" });

  return (
    <section className="discover">
      <header className="discover-head">
        <h1>Discover</h1>
        <div className="segmented" role="tablist" aria-label="Discover views">
          <button role="tab" aria-selected={state.view === "deck"} onClick={showDeck}>
            Swipe
          </button>
          <button role="tab" aria-selected={state.view === "matches"} onClick={showMatches}>
            Matches{state.matches.length > 0 && <span className="count">{state.matches.length}</span>}
          </button>
        </div>
      </header>

      {state.view === "matches" ? (
        <MatchesList matches={state.matches} onSwipe={showDeck} />
      ) : (
        <>
          <div className="deck">
            {!top && <EmptyState matchCount={state.matches.length} onSeeMatches={showMatches} />}
            {next && <NextCard key={next.id} profile={next} />}
            <AnimatePresence custom={state.lastDecision === "like" ? 1 : -1}>
              {top && <TopCard key={top.id} profile={top} onDecide={swipeTop} />}
            </AnimatePresence>
          </div>

          {top && (
            <div className="actions">
              <button className="action pass" aria-label={`Pass on ${top.name}`} onClick={() => swipeTop("pass")}>
                ✕
              </button>
              <button className="action like" aria-label={`Like ${top.name}`} onClick={() => swipeTop("like")}>
                ♥
              </button>
            </div>
          )}

          {top && <p className="hint">{state.deck.length} left · drag the card or tap a button</p>}
        </>
      )}

      {state.notice && (
        <div key={state.notice.id} className={`toast ${state.notice.tone}`} role="status" aria-live="polite">
          {state.notice.text}
        </div>
      )}

      {state.celebrating && (
        <MatchOverlay match={state.celebrating} onClose={() => dispatch({ type: "closeMatch" })} onSeeMatches={showMatches} />
      )}
    </section>
  );
}

function CardBody({ profile, priority }: { profile: PublicProfile; priority?: boolean }) {
  return (
    <>
      <Image src={profile.photo} alt={profile.name} fill sizes="(max-width: 480px) 100vw, 440px" draggable={false} priority={priority} />
      <div className="card-info">
        <h2>
          {profile.name}, <span>{profile.age}</span>
        </h2>
        <p className="place">📍 {profile.place}</p>
        <p className="bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

function NextCard({ profile }: { profile: PublicProfile }) {
  return (
    <motion.article className="card behind" aria-hidden initial={{ scale: 0.88, y: 28 }} animate={{ scale: 0.94, y: 14 }}>
      <CardBody profile={profile} />
    </motion.article>
  );
}

const cardVariants: Variants = {
  waiting: { scale: 0.94, y: 14 },
  active: { scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
  gone: (direction: number) => ({ x: direction * 560, rotate: direction * 24, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }),
};

function TopCard({ profile, onDecide }: { profile: PublicProfile; onDecide: (d: Decision) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-16, 16]);
  const likeOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0]);

  return (
    <motion.article
      className="card"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onDecide("like");
        else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onDecide("pass");
      }}
      variants={cardVariants}
      initial="waiting"
      animate="active"
      exit="gone"
    >
      <CardBody profile={profile} priority />
      <motion.span className="stamp like" style={{ opacity: likeOpacity }}>
        LIKE
      </motion.span>
      <motion.span className="stamp pass" style={{ opacity: passOpacity }}>
        NOPE
      </motion.span>
    </motion.article>
  );
}

function EmptyState({ matchCount, onSeeMatches }: { matchCount: number; onSeeMatches: () => void }) {
  return (
    <div className="empty">
      <div className="empty-icon">✨</div>
      <h2>You&apos;re all caught up</h2>
      <p>You&apos;ve seen everyone for now. New people will show up here as they join.</p>
      {matchCount > 0 && (
        <button className="primary" onClick={onSeeMatches}>
          See your {matchCount} {matchCount === 1 ? "match" : "matches"}
        </button>
      )}
    </div>
  );
}

function MatchesList({ matches, onSwipe }: { matches: Match[]; onSwipe: () => void }) {
  if (matches.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">💌</div>
        <h2>No matches yet</h2>
        <p>A match appears only when you both like each other. Nobody ever sees a one-sided like.</p>
        <button className="primary" onClick={onSwipe}>
          Start swiping
        </button>
      </div>
    );
  }
  return (
    <ul className="matches">
      {matches.map((m) => (
        <li key={m.profile.id}>
          <Image src={m.profile.photo} alt="" width={64} height={64} />
          <div>
            <strong>
              {m.profile.name}, {m.profile.age}
            </strong>
            <span>{m.profile.place}</span>
            <time dateTime={m.matchedAt}>Matched {new Date(m.matchedAt).toLocaleDateString("en-IN")}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MatchOverlay({ match, onClose, onSeeMatches }: { match: Match; onClose: () => void; onSeeMatches: () => void }) {
  return (
    <motion.div className="overlay" role="dialog" aria-modal="true" aria-labelledby="match-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="overlay-card" initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <h2 id="match-title">It&apos;s a match!</h2>
        <p>You and {match.profile.name} like each other.</p>
        <div className="pair">
          <div className="you">You</div>
          <Image src={match.profile.photo} alt={match.profile.name} width={112} height={112} />
        </div>
        <button className="primary" onClick={onSeeMatches}>
          See matches
        </button>
        <button className="ghost" onClick={onClose} autoFocus>
          Keep swiping
        </button>
      </motion.div>
    </motion.div>
  );
}
