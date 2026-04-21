import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  buildCoachMessage,
  createInitialState,
  formatOperation,
  getAccuracy,
  getMissionById,
  getNextQuestion,
  getPerformanceBand,
  getReactionAverage,
  getResultHeadline,
  getTimerLabel,
  gradeAnswer,
  missions,
  profiles,
} from './game/engine'
import type { MissionId, ProfileId } from './game/types'

type Screen = 'home' | 'missions' | 'play'
type BadgeId =
  | 'first-session'
  | 'streak-five'
  | 'streak-ten'
  | 'accuracy-90'
  | 'tables-master'
  | 'division-master'
  | 'hundred-club'
  | 'lightning-reflex'
  | 'marathon-runner'
  | 'perfect-round'
  | 'big-numbers-hero'

type CareerStats = {
  playerName: string
  totalSolved: number
  totalSessions: number
  bestStreak: number
  bestAccuracy: number
  badges: BadgeId[]
  recentMissionTitle: string
}

type BadgeDefinition = {
  id: BadgeId
  title: string
  caption: string
  palette: string
}

const badgeCatalog: BadgeDefinition[] = [
  {
    id: 'first-session',
    title: 'Ilk Kalkis',
    caption: 'Ilk gorev tamamlandi.',
    palette: 'cyan',
  },
  {
    id: 'streak-five',
    title: 'Seri Ustasi',
    caption: 'Bir turda en az 5 dogru seri kuruldu.',
    palette: 'amber',
  },
  {
    id: 'accuracy-90',
    title: 'Keskin Nisan',
    caption: 'Bir gorev %90 ve uzeri dogrulukla bitti.',
    palette: 'violet',
  },
  {
    id: 'tables-master',
    title: 'Tablo Komutani',
    caption: 'Carpim tablosu gorevinde yuksek dogruluk yakalandi.',
    palette: 'rose',
  },
  {
    id: 'division-master',
    title: 'Bolme Dedektifi',
    caption: 'Bolme gorevi temiz bir performansla tamamlandi.',
    palette: 'emerald',
  },
  {
    id: 'hundred-club',
    title: 'Yuz Soru Kulubu',
    caption: 'Toplam cozulen soru sayisi 100 oldu.',
    palette: 'sky',
  },
  {
    id: 'streak-ten',
    title: 'Zincir Ustasi',
    caption: 'Bir turda 10 dogru arka arkaya yakalandi.',
    palette: 'amber',
  },
  {
    id: 'lightning-reflex',
    title: 'Simsek Refleks',
    caption: 'Ortalama tepki suresi 3 saniyenin altinda.',
    palette: 'cyan',
  },
  {
    id: 'marathon-runner',
    title: 'Maraton Kosucusu',
    caption: 'Bir turda 20 veya daha fazla soru cozuldu.',
    palette: 'violet',
  },
  {
    id: 'perfect-round',
    title: 'Kusursuz Tur',
    caption: 'Bir tur hatasiz tamamlandi.',
    palette: 'emerald',
  },
  {
    id: 'big-numbers-hero',
    title: 'Buyuk Sayi Kahramani',
    caption: 'Buyuk Sayilar gorevinde yuksek dogruluk yakalandi.',
    palette: 'rose',
  },
]

function BadgeVisual({ badgeId }: { badgeId: BadgeId }) {
  if (badgeId === 'first-session') {
    return (
      <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
        <circle cx="48" cy="48" r="30" className="badge-orbit" />
        <path d="M47 18 L58 40 L82 43 L64 59 L69 82 L47 70 L25 82 L30 59 L12 43 L36 40 Z" className="badge-core" />
      </svg>
    )
  }

  if (badgeId === 'streak-five') {
    return (
      <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
        <path d="M18 62 C36 28, 54 24, 78 18 C62 42, 52 62, 32 78 Z" className="badge-core" />
        <circle cx="28" cy="30" r="6" className="badge-spark" />
        <circle cx="64" cy="70" r="5" className="badge-spark" />
      </svg>
    )
  }

  if (badgeId === 'accuracy-90') {
    return (
      <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
        <circle cx="48" cy="48" r="28" className="badge-orbit" />
        <circle cx="48" cy="48" r="15" className="badge-core" />
        <path d="M48 16 L52 44 L80 48 L52 52 L48 80 L44 52 L16 48 L44 44 Z" className="badge-spark" />
      </svg>
    )
  }

  if (badgeId === 'tables-master') {
    return (
      <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
        <rect x="20" y="20" width="56" height="56" rx="12" className="badge-orbit" />
        <path d="M30 36 H66 M30 48 H66 M30 60 H66 M42 28 V68 M54 28 V68" className="badge-grid-line" />
      </svg>
    )
  }

  if (badgeId === 'division-master') {
    return (
      <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
        <circle cx="48" cy="24" r="7" className="badge-spark" />
        <circle cx="48" cy="72" r="7" className="badge-spark" />
        <path d="M24 48 H72" className="badge-core-line" />
        <circle cx="48" cy="48" r="24" className="badge-orbit" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 96 96" className="badge-icon" aria-hidden="true">
      <circle cx="48" cy="48" r="30" className="badge-orbit" />
      <path d="M48 18 L55 38 L76 38 L59 52 L66 74 L48 60 L30 74 L37 52 L20 38 L41 38 Z" className="badge-core" />
      <circle cx="73" cy="25" r="6" className="badge-spark" />
    </svg>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [missionId, setMissionId] = useState<MissionId>('mixed')
  const [profileId, setProfileId] = useState<ProfileId>('focus')
  const [session, setSession] = useState(() => createInitialState('mixed', 'focus'))
  const [answer, setAnswer] = useState('')
  const [started, setStarted] = useState(false)
  const [career, setCareer] = useState<CareerStats>({
    playerName: 'Yildiz Kaptan',
    totalSolved: 0,
    totalSessions: 0,
    bestStreak: 0,
    bestAccuracy: 0,
    badges: [],
    recentMissionTitle: 'Hazirlaniyor',
  })
  const hasRecordedResult = useRef(false)

  const mission = useMemo(() => getMissionById(missionId), [missionId])
  const profile = profiles[profileId]
  const accuracy = getAccuracy(session.history)
  const averageReaction = getReactionAverage(session.history)
  const performanceBand = getPerformanceBand(session.score, accuracy)
  const resultHeadline = getResultHeadline(performanceBand)
  const wrongAnswers = session.history.filter((item) => !item.isCorrect).length

  useEffect(() => {
    if (!started || screen !== 'play' || session.status !== 'playing') {
      return
    }

    const interval = window.setInterval(() => {
      setSession((current) => {
        if (current.status !== 'playing') {
          return current
        }

        const nextRemaining = Math.max(0, current.remainingSeconds - 1)
        if (nextRemaining > 0) {
          return { ...current, remainingSeconds: nextRemaining }
        }

        return { ...current, remainingSeconds: 0, status: 'finished' }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [screen, session.status, started])

  useEffect(() => {
    if (screen !== 'play' || session.status !== 'finished' || hasRecordedResult.current) {
      return
    }

    hasRecordedResult.current = true
    setCareer((current) => {
      const nextTotalSolved = current.totalSolved + session.history.length
      const nextBadges = new Set(current.badges)

      nextBadges.add('first-session')
      if (session.bestStreak >= 5) {
        nextBadges.add('streak-five')
      }
      if (accuracy >= 90 && session.history.length >= 8) {
        nextBadges.add('accuracy-90')
      }
      if (session.missionId === 'tables' && accuracy >= 85) {
        nextBadges.add('tables-master')
      }
      if (session.missionId === 'division' && accuracy >= 85) {
        nextBadges.add('division-master')
      }
      if (nextTotalSolved >= 100) {
        nextBadges.add('hundred-club')
      }
      if (session.bestStreak >= 10) {
        nextBadges.add('streak-ten')
      }
      if (session.history.length >= 20) {
        nextBadges.add('marathon-runner')
      }
      if (session.history.length >= 6 && session.history.every((item) => item.isCorrect)) {
        nextBadges.add('perfect-round')
      }
      if (averageReaction > 0 && averageReaction < 3) {
        nextBadges.add('lightning-reflex')
      }
      if (session.missionId === 'big-numbers' && accuracy >= 75) {
        nextBadges.add('big-numbers-hero')
      }

      return {
        ...current,
        totalSolved: nextTotalSolved,
        totalSessions: current.totalSessions + 1,
        bestStreak: Math.max(current.bestStreak, session.bestStreak),
        bestAccuracy: Math.max(current.bestAccuracy, accuracy),
        badges: [...nextBadges],
        recentMissionTitle: mission.title,
      }
    })
  }, [accuracy, averageReaction, mission.title, screen, session])

  const startMission = () => {
    hasRecordedResult.current = false
    setSession(createInitialState(missionId, profileId))
    setAnswer('')
    setStarted(true)
    setScreen('play')
  }

  const restartMission = () => {
    hasRecordedResult.current = false
    setSession(createInitialState(missionId, profileId))
    setAnswer('')
    setStarted(true)
  }

  const submitAnswer = () => {
    if (session.status !== 'playing' || answer.trim() === '') {
      return
    }

    const numericAnswer = Number(answer)
    if (Number.isNaN(numericAnswer)) {
      return
    }

    startTransition(() => {
      setSession((current) => {
        if (current.status !== 'playing') {
          return current
        }

        const evaluated = gradeAnswer(current.currentQuestion, numericAnswer)
        const nextQuestion = getNextQuestion(current.missionId, current.profileId, current.history)

        return {
          ...current,
          currentQuestion: nextQuestion,
          history: [...current.history, evaluated],
          score:
            current.score +
            evaluated.points +
            (evaluated.isCorrect && current.streak >= 2 ? 4 : 0),
          streak: evaluated.isCorrect ? current.streak + 1 : 0,
          bestStreak: evaluated.isCorrect
            ? Math.max(current.bestStreak, current.streak + 1)
            : current.bestStreak,
          feedback: evaluated.feedback,
          coachText: buildCoachMessage(evaluated, nextQuestion),
        }
      })
      setAnswer('')
    })
  }

  return (
    <main className="app-shell">
      {screen === 'home' ? (
        <HomeScreen
          badges={badgeCatalog}
          career={career}
          onGoToMissions={() => setScreen('missions')}
        />
      ) : null}

      {screen === 'missions' ? (
        <MissionScreen
          missionId={missionId}
          onBackHome={() => setScreen('home')}
          onChangeMission={setMissionId}
          onChangeProfile={setProfileId}
          onStartMission={startMission}
          profileId={profileId}
        />
      ) : null}

      {screen === 'play' ? (
        <PlayScreen
          answer={answer}
          averageReaction={averageReaction}
          mission={mission}
          onAnswerChange={setAnswer}
          onBackHome={() => setScreen('home')}
          onRestart={restartMission}
          performanceBand={performanceBand}
          profile={profile}
          resultHeadline={resultHeadline}
          session={session}
          submitAnswer={submitAnswer}
          wrongAnswers={wrongAnswers}
          accuracy={accuracy}
        />
      ) : null}
    </main>
  )
}

function HomeScreen({
  career,
  badges,
  onGoToMissions,
}: {
  career: CareerStats
  badges: BadgeDefinition[]
  onGoToMissions: () => void
}) {
  return (
    <>
      <section className="hero-panel home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Orion Matematik Ussu</p>
          <p className="hero-tag">Ana us ve motivasyon panosu</p>
          <h1>{career.playerName}</h1>
          <p className="hero-description">
            Cozulen sorular, kazanilan rozetler ve son gorev raporu burada seni bekliyor.
          </p>
          <button className="primary-button" onClick={onGoToMissions} type="button">
            Gorev secimine git
          </button>
        </div>

        <div className="hero-card status-card">
          <p className="card-label">Bugunku durum</p>
          <div className="hero-stats">
            <div>
              <span>Cozulen soru</span>
              <strong>{career.totalSolved}</strong>
            </div>
            <div>
              <span>Tamamlanan gorev</span>
              <strong>{career.totalSessions}</strong>
            </div>
            <div>
              <span>En iyi seri</span>
              <strong>{career.bestStreak}</strong>
            </div>
            <div>
              <span>En yuksek dogruluk</span>
              <strong>%{career.bestAccuracy}</strong>
            </div>
          </div>
          <p className="status-copy">Son gorev: {career.recentMissionTitle}</p>
        </div>
      </section>

      <section className="badge-showcase">
        <div className="panel-heading">
          <h2>Rozet vitrini</h2>
          <p>Her yeni gorev seni yeni bir unvana yaklastirir.</p>
        </div>

        <div className="badge-wall">
          {badges.map((badge) => {
            const unlocked = career.badges.includes(badge.id)
            return (
              <article
                className={`badge-plaque ${unlocked ? 'unlocked' : 'locked'} badge-${badge.palette}`}
                key={badge.id}
              >
                <div className="badge-mark">{unlocked ? 'Acilmis' : 'Kilitli'}</div>
                <div className="badge-visual-shell">
                  <BadgeVisual badgeId={badge.id} />
                </div>
                <h3>{badge.title}</h3>
                <p>{badge.caption}</p>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}

function MissionScreen({
  missionId,
  profileId,
  onChangeMission,
  onChangeProfile,
  onBackHome,
  onStartMission,
}: {
  missionId: MissionId
  profileId: ProfileId
  onChangeMission: (value: MissionId) => void
  onChangeProfile: (value: ProfileId) => void
  onBackHome: () => void
  onStartMission: () => void
}) {
  return (
    <>
      <section className="topbar mission-topbar">
        <div>
          <p className="eyebrow">Gorev hangari</p>
          <h2>Bugun hangi gorevi baslatmak istiyorsun?</h2>
        </div>
        <button className="ghost-button" onClick={onBackHome} type="button">
          Ana usse don
        </button>
      </section>

      <section className="config-panel">
        <div className="panel-heading">
          <h2>Gorev secimi</h2>
          <p>Gorevi sec, tempoyu belirle, sonra tek tusla goreve cik.</p>
        </div>

        <div className="choice-grid">
          {missions.map((item) => (
            <button
              key={item.id}
              className={`choice-card ${missionId === item.id ? 'selected' : ''}`}
              onClick={() => onChangeMission(item.id)}
              type="button"
            >
              <span className="choice-title">{item.title}</span>
              <span className="choice-copy">{item.description}</span>
              <span className="choice-meta">{item.skills.join(' • ')}</span>
            </button>
          ))}
        </div>

        <div className="panel-heading tempo-heading">
          <h2>Tempo secimi</h2>
          <p>Mobil ve tablet kullaniminda rahat hissettiren tempoyu sec.</p>
        </div>

        <div className="choice-grid profile-grid">
          {Object.values(profiles).map((item) => (
            <button
              key={item.id}
              className={`choice-card tempo-card ${profileId === item.id ? 'selected' : ''}`}
              onClick={() => onChangeProfile(item.id)}
              type="button"
            >
              <span className="choice-title">{item.title}</span>
              <span className="choice-copy">{item.description}</span>
              <span className="choice-meta">
                {item.seconds} saniye • {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="start-row">
          <p className="start-note">
            Secili gorev: <strong>{getMissionById(missionId).title}</strong> · {profiles[profileId].title}
          </p>
          <button className="primary-button" onClick={onStartMission} type="button">
            Basla
          </button>
        </div>
      </section>
    </>
  )
}

function PlayScreen({
  session,
  mission,
  profile,
  answer,
  accuracy,
  averageReaction,
  wrongAnswers,
  performanceBand,
  resultHeadline,
  onAnswerChange,
  submitAnswer,
  onRestart,
  onBackHome,
}: {
  session: ReturnType<typeof createInitialState>
  mission: ReturnType<typeof getMissionById>
  profile: (typeof profiles)[ProfileId]
  answer: string
  accuracy: number
  averageReaction: number
  wrongAnswers: number
  performanceBand: ReturnType<typeof getPerformanceBand>
  resultHeadline: string
  onAnswerChange: (value: string) => void
  submitAnswer: () => void
  onRestart: () => void
  onBackHome: () => void
}) {
  return (
    <>
      <section className="topbar play-topbar">
        <div>
          <p className="eyebrow">Aktif gorev</p>
          <h2>
            {mission.title} · {profile.title}
          </h2>
        </div>
        <button className="ghost-button" onClick={onBackHome} type="button">
          Ana usse don
        </button>
      </section>

      <section className="playground">
        <div className="scoreboard">
          <div className="score-item">
            <span>Sure</span>
            <strong>{getTimerLabel(session.remainingSeconds)}</strong>
          </div>
          <div className="score-item">
            <span>Puan</span>
            <strong>{session.score}</strong>
          </div>
          <div className="score-item">
            <span>Seri</span>
            <strong>{session.streak}</strong>
          </div>
          <div className="score-item">
            <span>Dogruluk</span>
            <strong>%{accuracy}</strong>
          </div>
        </div>

        <div className="question-panel">
          <div className="question-topline">
            <span>{mission.title}</span>
            <span>{formatOperation(session.currentQuestion.operation)}</span>
          </div>

          {session.status === 'finished' ? (
            <div className="summary-card">
              <p className="summary-kicker">{resultHeadline}</p>
              <h3>{performanceBand.title}</h3>
              <p>{performanceBand.description}</p>
              <div className="summary-grid">
                <div>
                  <span>Cozulen soru</span>
                  <strong>{session.history.length}</strong>
                </div>
                <div>
                  <span>Yanlis</span>
                  <strong>{wrongAnswers}</strong>
                </div>
                <div>
                  <span>En iyi seri</span>
                  <strong>{session.bestStreak}</strong>
                </div>
                <div>
                  <span>Ortalama hiz</span>
                  <strong>{averageReaction} sn</strong>
                </div>
              </div>
              <p className="coach-copy">{session.coachText}</p>
              <div className="finish-actions">
                <button className="primary-button" onClick={onBackHome} type="button">
                  Ana usse don
                </button>
                <button className="ghost-button" onClick={onRestart} type="button">
                  Ayni gorevi tekrar dene
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="question-expression">
                <span>{session.currentQuestion.left}</span>
                <span>{session.currentQuestion.symbol}</span>
                <span>{session.currentQuestion.right}</span>
                <span>=</span>
                <span className="question-blank">?</span>
              </div>

              <p className="question-tip">{session.currentQuestion.prompt}</p>

              <div className="answer-row">
                <input
                  aria-label="Cevap"
                  className="answer-input"
                  inputMode="numeric"
                  onChange={(event) => onAnswerChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      submitAnswer()
                    }
                  }}
                  placeholder="Cevabini yaz"
                  type="text"
                  value={answer}
                />
                <button className="primary-button" onClick={submitAnswer} type="button">
                  Kontrol et
                </button>
              </div>

              <div className={`feedback-box ${session.feedback.isCorrect ? 'good' : 'bad'}`}>
                <p>{session.feedback.message}</p>
                <small>{session.coachText}</small>
              </div>
            </>
          )}
        </div>

        <aside className="coach-panel">
          <h3>Gorev aciklamasi</h3>
          <p className="coach-copy">{mission.description}</p>
          <div className="insight-block">
            <span>Hedef</span>
            <strong>{mission.goal}</strong>
          </div>
          <div className="insight-block">
            <span>Strateji</span>
            <strong>{mission.strategy}</strong>
          </div>
          <div className="insight-block">
            <span>Tempo</span>
            <strong>{profile.title}</strong>
          </div>
        </aside>
      </section>
    </>
  )
}

export default App
