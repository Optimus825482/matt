import type {
  HistoryItem,
  Mission,
  MissionId,
  Operation,
  PerformanceBand,
  Profile,
  ProfileId,
  Question,
  SessionState,
} from './types'

const achievementDefinitions = [
  {
    code: 'first-session',
    title: 'İlk Kalkış',
    description: 'İlk tur başarıyla tamamlandı.',
  },
  {
    code: 'streak-5',
    title: 'Seri Makinesi',
    description: 'Bir turda en az 5 doğruyu arka arkaya buldu.',
  },
  {
    code: 'division-master',
    title: 'Bölme Dedektifi',
    description: 'Bölme modunda en az %80 doğruluk yakaladı.',
  },
  {
    code: 'accuracy-90',
    title: 'Keskin Nişancı',
    description: 'Bir turu %90 veya üzeri doğrulukla bitirdi.',
  },
]

export const missions: Mission[] = [
  {
    id: 'mixed',
    title: 'Karma Akış',
    description: 'Toplama, çıkarma, çarpma ve bölmeyi birlikte döndürür.',
    skills: ['4 işlem', 'geçiş hızı', 'karışık pratik'],
    goal: 'İşlem türünü hızlı tanıyıp doğru yöntemi seçmek.',
    strategy: 'Soruyu görür görmez işlem türünü adlandır, sonra çöz.',
  },
  {
    id: 'tables',
    title: 'Tablo Avı',
    description: 'Çarpım tablosunda özellikle 6, 7, 8 ve 9 odaklı sprint.',
    skills: ['çarpım tablosu', 'çarpma stratejileri', 'seri oluşturma'],
    goal: 'Çarpım tablosunu parçalayarak zihinden hızlandırmak.',
    strategy: '7×8 gibi sorularda 5×8 + 2×8 gibi parçalama kullan.',
  },
  {
    id: 'division',
    title: 'Bölme Dedektifi',
    description: 'Tam sayılı sonuç veren bölme sorularıyla akıl yürütme kurar.',
    skills: ['bölme', 'ters işlem', 'kontrol etme'],
    goal: 'Bölmeyi çarpmanın tersi olarak kullanmak.',
    strategy: 'Önce hangi sayı ile çarpıldığında böleni vereceğini düşün.',
  },
  {
    id: 'warmup',
    title: 'Roket Isıtma',
    description: 'Toplama ve çıkarma ile tempoyu yükseltir.',
    skills: ['toplama', 'çıkarma', 'zihinden işlem'],
    goal: 'Kolay sorularda akıcı ve hatasız kalmak.',
    strategy: 'Yakın onluklara yuvarlayıp farkı zihinden telafi et.',
  },
]

export const profiles: Record<ProfileId, Profile> = {
  steady: {
    id: 'steady',
    title: 'Rahat Başlangıç',
    description: 'Düşük stresle ritim kurmak için.',
    seconds: 90,
    label: 'öğrenme odaklı',
  },
  focus: {
    id: 'focus',
    title: 'Odak Modu',
    description: 'Hem hız hem doğruluk için dengeli tur.',
    seconds: 60,
    label: 'dengeli tempo',
  },
  boost: {
    id: 'boost',
    title: 'Turbo Seri',
    description: 'Kısa sürede refleksleri canlandırmak için.',
    seconds: 45,
    label: 'yüksek tempo',
  },
}

const operationSymbols: Record<Operation, Question['symbol']> = {
  addition: '+',
  subtraction: '-',
  multiplication: '×',
  division: '÷',
}

const operationPrompts: Record<Operation, string[]> = {
  addition: [
    'Önce yakın onluğu fark et, sonra küçük düzeltmeyi ekle.',
    'Toplarken onluk ve birlikleri zihninde ayır.',
  ],
  subtraction: [
    'Çıkarma yaparken eksileni tamamlayarak da düşünebilirsin.',
    'Farkı bulurken yakın onluğa kadar saymak işe yarar.',
  ],
  multiplication: [
    'Çarpmayı eşit gruplar olarak düşün.',
    'Zor çarpımı kolay çarpıma parçala.',
  ],
  division: [
    'Bölmeyi tersinden çarpma sorusu gibi kontrol et.',
    'Böleni kaç kez kullanınca bölünene ulaşırsın?',
  ],
}

const encouragements = [
  'Harika, tempo oturuyor.',
  'Süper, işlem türünü hızlı yakaladın.',
  'Bravo, zihinden kontrolün kuvvetli.',
]

const recoveryNotes = [
  'Olabilir. Önce işlem türünü sakince belirle, sonra tekrar dene.',
  'Yaklaştın. Ters işlemle kontrol etmek işini kolaylaştırır.',
  'Küçük bir kaçış oldu. Sayıları parçalamayı dene.',
]

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function selectOperations(missionId: MissionId): Operation[] {
  switch (missionId) {
    case 'warmup':
      return ['addition', 'subtraction']
    case 'tables':
      return ['multiplication']
    case 'division':
      return ['division']
    default:
      return ['addition', 'subtraction', 'multiplication', 'division']
  }
}

function buildQuestion(operation: Operation): Question {
  const createdAt = Date.now()

  if (operation === 'addition') {
    const left = randomInt(18, 89)
    const right = randomInt(11, 49)
    return {
      id: `${operation}-${createdAt}`,
      operation,
      left,
      right,
      symbol: operationSymbols[operation],
      answer: left + right,
      prompt: randomItem(operationPrompts[operation]),
      createdAt,
    }
  }

  if (operation === 'subtraction') {
    const right = randomInt(8, 47)
    const answer = randomInt(12, 64)
    const left = answer + right
    return {
      id: `${operation}-${createdAt}`,
      operation,
      left,
      right,
      symbol: operationSymbols[operation],
      answer,
      prompt: randomItem(operationPrompts[operation]),
      createdAt,
    }
  }

  if (operation === 'multiplication') {
    const left = randomItem([4, 5, 6, 7, 8, 9, 11, 12])
    const right = randomItem([3, 4, 6, 7, 8, 9, 11, 12])
    return {
      id: `${operation}-${createdAt}`,
      operation,
      left,
      right,
      symbol: operationSymbols[operation],
      answer: left * right,
      prompt: randomItem(operationPrompts[operation]),
      createdAt,
    }
  }

  const right = randomItem([2, 3, 4, 5, 6, 7, 8, 9, 11, 12])
  const answer = randomInt(2, 12)
  const left = right * answer

  return {
    id: `${operation}-${createdAt}`,
    operation,
    left,
    right,
    symbol: operationSymbols[operation],
    answer,
    prompt: randomItem(operationPrompts[operation]),
    createdAt,
  }
}

export function getMissionById(missionId: MissionId): Mission {
  return missions.find((item) => item.id === missionId) ?? missions[0]
}

export function getNextQuestion(
  missionId: MissionId,
  _profileId: ProfileId,
  history: HistoryItem[],
): Question {
  const pool = selectOperations(missionId)
  const previousOperation = history.at(-1)?.operation
  const preferredPool =
    history.length > 0 && pool.length > 1
      ? pool.filter((operation) => operation !== previousOperation)
      : pool

  return buildQuestion(randomItem(preferredPool))
}

export function createInitialState(
  missionId: MissionId,
  profileId: ProfileId,
): SessionState {
  return {
    missionId,
    profileId,
    currentQuestion: getNextQuestion(missionId, profileId, []),
    history: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    remainingSeconds: profiles[profileId].seconds,
    status: 'playing',
    feedback: {
      isCorrect: true,
      message: 'Hazırsan ilk soruyla başlayalım.',
    },
    coachText: 'İşlemi gördüğünde önce türünü söyle, sonra çöz. Bu küçük durak hata oranını düşürür.',
  }
}

export function gradeAnswer(question: Question, givenAnswer: number): HistoryItem {
  const isCorrect = question.answer === givenAnswer
  const reactionSeconds = Math.max(1, Math.round((Date.now() - question.createdAt) / 1000))

  return {
    questionId: question.id,
    operation: question.operation,
    expectedAnswer: question.answer,
    givenAnswer,
    isCorrect,
    points: isCorrect ? Math.max(8, 20 - reactionSeconds) : 0,
    reactionSeconds,
    feedback: {
      isCorrect,
      message: isCorrect
        ? `${randomItem(encouragements)} +${Math.max(8, 20 - reactionSeconds)} puan`
        : `${randomItem(recoveryNotes)} Doğru cevap ${question.answer}.`,
    },
  }
}

export function buildCoachMessage(result: HistoryItem, nextQuestion: Question): string {
  if (result.isCorrect) {
    return `${formatOperation(nextQuestion.operation)} moduna geçiyoruz. ${nextQuestion.prompt}`
  }

  if (result.operation === 'division') {
    return 'Bölmede çarpmaya dön: bölen ile hangi sayı çarpılırsa bölünen gelir, onu ara.'
  }

  if (result.operation === 'multiplication') {
    return 'Zor çarpımı kolay iki parçaya böl. Örneğin 7×8 için 5×8 ve 2×8 düşün.'
  }

  return 'Sayıları zihinde onluklar ve birlikler olarak ayırmak hata payını azaltır.'
}

export function getAccuracy(history: HistoryItem[]): number {
  if (history.length === 0) {
    return 100
  }

  return Math.round((history.filter((item) => item.isCorrect).length / history.length) * 100)
}

export function getReactionAverage(history: HistoryItem[]): number {
  if (history.length === 0) {
    return 0
  }

  const total = history.reduce((sum, item) => sum + item.reactionSeconds, 0)
  return Number((total / history.length).toFixed(1))
}

export function getPerformanceBand(score: number, accuracy: number): PerformanceBand {
  if (score >= 180 && accuracy >= 85) {
    return {
      title: 'Yıldız Pilot',
      description: 'Hız ve doğruluk birlikte çok iyi gidiyor. Artık daha zor turlara hazırsın.',
      badge: 'Seri ustası',
    }
  }

  if (score >= 110 && accuracy >= 70) {
    return {
      title: 'Ritim Bulucu',
      description: 'Doğru strateji oluşuyor. Birkaç tur daha ile otomatiklik güçlenir.',
      badge: 'Dengeli akış',
    }
  }

  return {
    title: 'Isınma Gücü',
    description: 'Temel yerleşiyor. Kısa ve sık tekrarlarla hızın belirgin şekilde artar.',
    badge: 'Temel güçleniyor',
  }
}

export function getResultHeadline(performanceBand: PerformanceBand): string {
  if (performanceBand.title === 'Yıldız Pilot') {
    return 'Bu tur gerçekten çok akıcı geçti.'
  }

  if (performanceBand.title === 'Ritim Bulucu') {
    return 'Ritim kuruluyor, birkaç tekrar daha çok faydalı olacak.'
  }

  return 'Başlangıç sağlam, şimdi tekrarlarla hızlanma zamanı.'
}

export function getTimerLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function formatOperation(operation: Operation): string {
  switch (operation) {
    case 'addition':
      return 'Toplama'
    case 'subtraction':
      return 'Çıkarma'
    case 'multiplication':
      return 'Çarpma'
    case 'division':
      return 'Bölme'
  }
}

export function getAchievementDefinitions() {
  return achievementDefinitions
}
