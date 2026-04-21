import cookieParser from 'cookie-parser'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import initSqlJs from 'sql.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dataDir = path.join(rootDir, 'data')
const dbPath = path.join(dataDir, 'math-practice.sqlite')
const distDir = path.join(rootDir, 'dist')

fs.mkdirSync(dataDir, { recursive: true })

const SQL = await initSqlJs({
  locateFile: (file) => path.join(rootDir, 'node_modules', 'sql.js', 'dist', file),
})

const db = fs.existsSync(dbPath)
  ? new SQL.Database(fs.readFileSync(dbPath))
  : new SQL.Database()

const app = express()
const port = Number(process.env.PORT ?? 3001)
const sessionSecret = process.env.APP_SESSION_SECRET ?? 'dev-secret-change-me'
const adminUsername = process.env.SUPERADMIN_USERNAME ?? 'superadmin'
const adminPassword = process.env.SUPERADMIN_PASSWORD ?? 'ChangeMe!2026'

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

function persistDb() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()))
}

function exec(sql, params = []) {
  const statement = db.prepare(sql)
  statement.bind(params)
  statement.step()
  statement.free()
}

function getAll(sql, params = []) {
  const statement = db.prepare(sql)
  statement.bind(params)
  const rows = []

  while (statement.step()) {
    rows.push(statement.getAsObject())
  }

  statement.free()
  return rows
}

function getOne(sql, params = []) {
  return getAll(sql, params)[0]
}

function run(sql, params = []) {
  exec(sql, params)
  const meta = getOne('SELECT last_insert_rowid() AS lastInsertRowid, changes() AS changes')
  persistDb()
  return {
    lastInsertRowid: Number(meta?.lastInsertRowid ?? 0),
    changes: Number(meta?.changes ?? 0),
  }
}

function transaction(work) {
  exec('BEGIN')
  try {
    const result = work()
    exec('COMMIT')
    persistDb()
    return result
  } catch (error) {
    exec('ROLLBACK')
    throw error
  }
}

exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'child',
    created_at TEXT NOT NULL
  )
`)

exec(`
  CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_id TEXT NOT NULL,
    mission_title TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    profile_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    best_streak INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    average_reaction REAL NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`)

exec(`
  CREATE TABLE IF NOT EXISTS answer_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    operation TEXT NOT NULL,
    expected_answer INTEGER NOT NULL,
    given_answer INTEGER NOT NULL,
    reaction_seconds REAL NOT NULL,
    is_correct INTEGER NOT NULL,
    points INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`)

exec(`
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    UNIQUE(user_id, code)
  )
`)

persistDb()

function nowIso() {
  return new Date().toISOString()
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function safeEqualHex(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'))
}

function safeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function verifyPassword(password, hashed) {
  const [salt, originalHash] = hashed.split(':')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return safeEqualHex(originalHash, hash)
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', sessionSecret).update(body).digest('base64url')
  return `${body}.${signature}`
}

function readToken(token) {
  if (!token) {
    return null
  }

  const [body, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', sessionSecret).update(body).digest('base64url')
  if (signature !== expected) {
    return null
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (payload.expiresAt < Date.now()) {
    return null
  }

  return payload
}

function setSessionCookie(res, name, payload) {
  res.cookie(name, signToken(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}

function clearSessionCookie(res, name) {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  })
}

function getChildUser(req) {
  const payload = readToken(req.cookies.student_session)
  if (!payload || payload.role !== 'child') {
    return null
  }

  return getOne(
    'SELECT id, username, display_name AS displayName FROM users WHERE id = ? AND role = ?',
    [payload.userId, 'child'],
  )
}

function requireChild(req, res, next) {
  const user = getChildUser(req)
  if (!user) {
    res.status(401).json({ error: 'Oturum gerekli.' })
    return
  }

  req.childUser = {
    ...user,
    id: Number(user.id),
  }
  next()
}

function requireSuperAdmin(req, res, next) {
  const payload = readToken(req.cookies.superadmin_session)
  if (!payload || payload.role !== 'superadmin') {
    res.status(401).json({ error: 'Superadmin oturumu gerekli.' })
    return
  }

  req.superAdmin = { username: payload.username }
  next()
}

function getAchievementDefinitions() {
  return [
    {
      code: 'first-session',
      title: 'İlk Kalkış',
      description: 'İlk tur başarıyla tamamlandı.',
      matches: ({ summary }) => summary.totalSessions >= 1,
    },
    {
      code: 'streak-5',
      title: 'Seri Makinesi',
      description: 'Bir turda en az 5 doğruyu arka arkaya buldu.',
      matches: ({ payload }) => payload.bestStreak >= 5,
    },
    {
      code: 'division-master',
      title: 'Bölme Dedektifi',
      description: 'Bölme modunda en az %80 doğruluk yakaladı.',
      matches: ({ payload }) => payload.missionId === 'division' && payload.accuracy >= 80,
    },
    {
      code: 'accuracy-90',
      title: 'Keskin Nişancı',
      description: 'Bir turu %90 veya üzeri doğrulukla bitirdi.',
      matches: ({ payload }) => payload.accuracy >= 90 && payload.questionCount >= 8,
    },
  ]
}

function getChildDashboard(userId) {
  const rawSummary = getOne(
    `
      SELECT
        COUNT(*) AS totalSessions,
        COALESCE(SUM(question_count), 0) AS totalQuestions,
        COALESCE(MAX(best_streak), 0) AS bestStreak,
        COALESCE(ROUND(AVG(accuracy)), 0) AS averageAccuracy
      FROM game_sessions
      WHERE user_id = ?
    `,
    [userId],
  )

  const summary = {
    totalSessions: Number(rawSummary?.totalSessions ?? 0),
    totalQuestions: Number(rawSummary?.totalQuestions ?? 0),
    bestStreak: Number(rawSummary?.bestStreak ?? 0),
    averageAccuracy: Number(rawSummary?.averageAccuracy ?? 0),
  }

  const achievements = getAll(
    `
      SELECT code, title, description, unlocked_at AS unlockedAt
      FROM achievements
      WHERE user_id = ?
      ORDER BY unlocked_at DESC
    `,
    [userId],
  )

  const recentSessions = getAll(
    `
      SELECT
        id AS sessionId,
        mission_title AS missionTitle,
        score,
        accuracy,
        completed_at AS completedAt
      FROM game_sessions
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 6
    `,
    [userId],
  ).map((item) => ({
    sessionId: Number(item.sessionId),
    missionTitle: String(item.missionTitle),
    score: Number(item.score),
    accuracy: Number(item.accuracy),
    completedAt: String(item.completedAt),
  }))

  return {
    summary,
    achievements,
    recentSessions,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/signup', (req, res) => {
  const { username, password, displayName } = req.body ?? {}
  if (!username || !password) {
    res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' })
    return
  }

  const normalizedUsername = String(username).trim().toLowerCase()
  if (normalizedUsername.length < 3 || String(password).length < 4) {
    res.status(400).json({ error: 'Kullanıcı adı ve şifre çok kısa.' })
    return
  }

  const existing = getOne('SELECT id FROM users WHERE username = ?', [normalizedUsername])
  if (existing) {
    res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' })
    return
  }

  const result = run(
    `
      INSERT INTO users (username, display_name, password_hash, role, created_at)
      VALUES (?, ?, ?, 'child', ?)
    `,
    [normalizedUsername, displayName?.trim() || normalizedUsername, hashPassword(password), nowIso()],
  )

  setSessionCookie(res, 'student_session', {
    userId: result.lastInsertRowid,
    role: 'child',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  })

  res.json({ ok: true })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const user = getOne(
    'SELECT id, username, display_name AS displayName, password_hash AS passwordHash FROM users WHERE username = ? AND role = ?',
    [String(username).trim().toLowerCase(), 'child'],
  )

  if (!user || !verifyPassword(String(password), String(user.passwordHash))) {
    res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış.' })
    return
  }

  setSessionCookie(res, 'student_session', {
    userId: Number(user.id),
    role: 'child',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  })

  res.json({ ok: true })
})

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res, 'student_session')
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const user = getChildUser(req)
  if (!user) {
    res.json({ authenticated: false })
    return
  }

  res.json({
    authenticated: true,
    role: 'child',
    user: {
      id: Number(user.id),
      username: String(user.username),
      displayName: String(user.displayName),
    },
  })
})

app.get('/api/child/dashboard', requireChild, (req, res) => {
  res.json(getChildDashboard(req.childUser.id))
})

app.post('/api/game/session', requireChild, (req, res) => {
  const payload = req.body ?? {}
  const createdAt = nowIso()

  const newlyUnlocked = transaction(() => {
    const sessionResult = run(
      `
        INSERT INTO game_sessions (
          user_id, mission_id, mission_title, profile_id, profile_title, score, accuracy,
          best_streak, question_count, wrong_answers, average_reaction, started_at, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.childUser.id,
        payload.missionId,
        payload.missionTitle,
        payload.profileId,
        payload.profileTitle,
        payload.score,
        payload.accuracy,
        payload.bestStreak,
        payload.questionCount,
        payload.wrongAnswers,
        payload.averageReaction,
        payload.startedAt,
        payload.completedAt,
        createdAt,
      ],
    )

    for (const answer of payload.answers ?? []) {
      exec(
        `
          INSERT INTO answer_events (
            session_id, user_id, operation, expected_answer, given_answer, reaction_seconds, is_correct, points, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionResult.lastInsertRowid,
          req.childUser.id,
          answer.operation,
          answer.expectedAnswer,
          answer.givenAnswer,
          answer.reactionSeconds,
          answer.isCorrect ? 1 : 0,
          answer.points,
          createdAt,
        ],
      )
    }

    const summary = getChildDashboard(req.childUser.id).summary
    const unlocked = []

    for (const definition of getAchievementDefinitions()) {
      if (!definition.matches({ payload, summary })) {
        continue
      }

      const result = run(
        `
          INSERT OR IGNORE INTO achievements (user_id, code, title, description, unlocked_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          req.childUser.id,
          definition.code,
          definition.title,
          definition.description,
          createdAt,
        ],
      )

      if (result.changes > 0) {
        unlocked.push({
          code: definition.code,
          title: definition.title,
          description: definition.description,
          unlockedAt: createdAt,
        })
      }
    }

    return unlocked
  })

  res.json({
    dashboard: getChildDashboard(req.childUser.id),
    newlyUnlocked,
  })
})

app.post('/api/superadmin/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const valid =
    safeEqualText(String(username).trim(), adminUsername) &&
    safeEqualText(String(password), adminPassword)

  if (!valid) {
    res.status(401).json({ error: 'Superadmin bilgileri yanlış.' })
    return
  }

  setSessionCookie(res, 'superadmin_session', {
    username: adminUsername,
    role: 'superadmin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 8,
  })

  res.json({ ok: true })
})

app.post('/api/superadmin/logout', (_req, res) => {
  clearSessionCookie(res, 'superadmin_session')
  res.json({ ok: true })
})

app.get('/api/superadmin/overview', requireSuperAdmin, (req, res) => {
  const children = getAll(
    `
      SELECT
        users.id AS userId,
        users.username,
        users.display_name AS displayName,
        MAX(game_sessions.completed_at) AS lastActivityAt
      FROM users
      LEFT JOIN game_sessions ON game_sessions.user_id = users.id
      WHERE users.role = 'child'
      GROUP BY users.id
      ORDER BY lastActivityAt DESC
    `,
  ).map((item) => ({
    userId: Number(item.userId),
    username: String(item.username),
    displayName: String(item.displayName),
    lastActivityAt: item.lastActivityAt == null ? null : String(item.lastActivityAt),
  }))

  const recentSessions = getAll(
    `
      SELECT
        game_sessions.id AS sessionId,
        users.display_name AS displayName,
        game_sessions.mission_title AS missionTitle,
        game_sessions.score,
        game_sessions.accuracy,
        game_sessions.question_count AS questionCount,
        game_sessions.completed_at AS completedAt
      FROM game_sessions
      INNER JOIN users ON users.id = game_sessions.user_id
      ORDER BY game_sessions.completed_at DESC
      LIMIT 20
    `,
  ).map((item) => ({
    sessionId: Number(item.sessionId),
    displayName: String(item.displayName),
    missionTitle: String(item.missionTitle),
    score: Number(item.score),
    accuracy: Number(item.accuracy),
    questionCount: Number(item.questionCount),
    completedAt: String(item.completedAt),
  }))

  const recentAnswers = getAll(
    `
      SELECT
        answer_events.id AS answerId,
        users.display_name AS displayName,
        answer_events.operation,
        answer_events.expected_answer AS expectedAnswer,
        answer_events.given_answer AS givenAnswer,
        answer_events.reaction_seconds AS reactionSeconds,
        answer_events.is_correct AS isCorrect,
        answer_events.created_at AS createdAt
      FROM answer_events
      INNER JOIN users ON users.id = answer_events.user_id
      ORDER BY answer_events.created_at DESC
      LIMIT 30
    `,
  ).map((item) => ({
    answerId: Number(item.answerId),
    displayName: String(item.displayName),
    operation: String(item.operation),
    expectedAnswer: Number(item.expectedAnswer),
    givenAnswer: Number(item.givenAnswer),
    reactionSeconds: Number(item.reactionSeconds),
    isCorrect: Boolean(item.isCorrect),
    createdAt: String(item.createdAt),
  }))

  res.json({
    admin: req.superAdmin,
    children,
    recentSessions,
    recentAnswers,
  })
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Matematikte Pratik API hazır: http://localhost:${port}`)
  if (process.env.SUPERADMIN_PASSWORD == null) {
    console.log(`Varsayılan superadmin: ${adminUsername} / ${adminPassword}`)
  }
})
