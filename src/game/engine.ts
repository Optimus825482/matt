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
    code: 'streak-10',
    title: 'Zincir Ustası',
    description: 'Bir turda 10 doğruyu arka arkaya yakaladı.',
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
  {
    code: 'lightning-reflex',
    title: 'Şimşek Refleks',
    description: 'Ortalama tepkisi 3 saniyenin altında kaldı.',
  },
  {
    code: 'marathon-runner',
    title: 'Maraton Koşucusu',
    description: 'Bir turda 20 veya daha fazla soruyu yanıtladı.',
  },
  {
    code: 'perfect-round',
    title: 'Kusursuz Tur',
    description: 'Bir turu tek bir hata bile yapmadan bitirdi.',
  },
  {
    code: 'big-numbers-hero',
    title: 'Büyük Sayı Kahramanı',
    description: 'Büyük Sayılar görevinde %75 ve üzeri doğruluk yakaladı.',
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
  {
    id: 'big-numbers',
    title: 'Büyük Sayılar',
    description: '3 basamaklı toplama ve çıkarma ile zihnin sınırlarını zorlar.',
    skills: ['3 basamak', 'elde tutma', 'onluk birlik ayrımı'],
    goal: 'Büyük sayılarda elde ve ödünç işlemlerini doğru yönetmek.',
    strategy: 'Sayıyı yüzler, onlar ve birler olarak üçe böl, parça parça topla.',
  },
  {
    id: 'speed-tables',
    title: 'Hızlı Tablo',
    description: '11, 12, 13 ve 15 tablolarında hız kazandırır.',
    skills: ['ileri tablo', 'dağılma kuralı', 'zihinden çarpma'],
    goal: '10 üstü tabloları 10×n üzerinden kurgulamak.',
    strategy: '12×7 için 10×7 + 2×7 dağılımını düşün.',
  },
  {
    id: 'marathon',
    title: 'Maraton',
    description: 'Geniş aralıklı karışık sorularla uzun tur dayanıklılığı.',
    skills: ['dayanıklılık', 'konsantrasyon', 'karışık işlem'],
    goal: 'Uzun turda odak ve doğruluğu birlikte korumak.',
    strategy: 'Her 5 soruda bir nefes al ve işlem türünü sesli tekrarla.',
  },
  {
    id: 'precision',
    title: 'Hassasiyet Turu',
    description: 'Daha az sayıda ama daha zor sorularla hassasiyet ölçer.',
    skills: ['kontrol', 'zihinden doğrulama', 'hata azaltma'],
    goal: 'Her cevabı teslim etmeden ters işlemle doğrulamak.',
    strategy: 'Sonucu yazmadan önce ters işlemle bir kez daha kontrol et.',
  },
]

export const profiles: Record<ProfileId, Profile> = {
  zen: {
    id: 'zen',
    title: 'Zen Temposu',
    description: 'Stressiz ritim ve uzun süre için rahat mod.',
    seconds: 120,
    label: 'stressiz tempo',
  },
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
  elite: {
    id: 'elite',
    title: 'Elit Sprint',
    description: 'Refleks sınırını zorlayan kısa ve sert tur.',
    seconds: 30,
    label: 'sprint temposu',
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
    'Büyük sayıyı sabit tut, küçük sayıyı parça parça ekle.',
    'Sayıları onluklara yuvarla, sonra küçük düzeltmeyi uygula.',
    'Elde olacaksa önce birler basamağına bak.',
  ],
  subtraction: [
    'Çıkarma yaparken eksileni tamamlayarak da düşünebilirsin.',
    'Farkı bulurken yakın onluğa kadar saymak işe yarar.',
    'Büyük sayıyı onluk + birlik olarak ayır, sonra çıkar.',
    'İki sayının arasındaki mesafeyi düşün, sayarak gidebilirsin.',
    'Önce yüzlük ya da onluk farkını bul, sonra ince ayar yap.',
  ],
  multiplication: [
    'Çarpmayı eşit gruplar olarak düşün.',
    'Zor çarpımı kolay çarpıma parçala.',
    '×5 için önce ×10 yap, sonra ikiye böl.',
    '×9 için önce ×10 yap, sonra bir kez çıkar.',
    'Çift sayılarla çarpıyorsan yarısını alıp iki kez topla.',
  ],
  division: [
    'Bölmeyi tersinden çarpma sorusu gibi kontrol et.',
    'Böleni kaç kez kullanınca bölünene ulaşırsın?',
    'Bölüneni tanıdık çarpım tablosu değerine indirgeyebilir misin?',
    'Cevabı tahmin et, sonra çarparak doğrula.',
    'Bölünen ile bölen arasındaki ilişkiyi tabloyla eşleştir.',
  ],
}

const encouragements = [
  'Harika, tempo oturuyor.',
  'Süper, işlem türünü hızlı yakaladın.',
  'Bravo, zihinden kontrolün kuvvetli.',
  'Muhteşem, serin büyüyor.',
  'Aferin, refleksin keskin.',
  'İşte bu ritim, böyle devam.',
  'Kusursuz, strateji yerinde.',
]

const recoveryNotes = [
  'Olabilir. Önce işlem türünü sakince belirle, sonra tekrar dene.',
  'Yaklaştın. Ters işlemle kontrol etmek işini kolaylaştırır.',
  'Küçük bir kaçış oldu. Sayıları parçalamayı dene.',
  'Bir nefes al, bu soru senin hızında değildi sadece.',
  'Hata öğretir. Bir sonraki soruda yöntemi sesli söyle.',
  'Hiç önemli değil. Zihinden onluk-birlik ayrımına dikkat.',
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
    case 'big-numbers':
      return ['addition', 'subtraction']
    case 'tables':
    case 'speed-tables':
      return ['multiplication']
    case 'division':
      return ['division']
    case 'precision':
      return ['multiplication', 'division']
    case 'marathon':
    default:
      return ['addition', 'subtraction', 'multiplication', 'division']
  }
}

interface BuildRanges {
  additionLeft: [number, number]
  additionRight: [number, number]
  subtractionRight: [number, number]
  subtractionAnswer: [number, number]
  multiplicationLeft: number[]
  multiplicationRight: number[]
  divisionRight: number[]
  divisionAnswer: [number, number]
}

const defaultRanges: BuildRanges = {
  additionLeft: [18, 89],
  additionRight: [11, 49],
  subtractionRight: [8, 47],
  subtractionAnswer: [12, 64],
  multiplicationLeft: [4, 5, 6, 7, 8, 9, 11, 12],
  multiplicationRight: [3, 4, 6, 7, 8, 9, 11, 12],
  divisionRight: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12],
  divisionAnswer: [2, 12],
}

function getRangesForMission(missionId: MissionId): BuildRanges {
  switch (missionId) {
    case 'big-numbers':
      return {
        ...defaultRanges,
        additionLeft: [120, 899],
        additionRight: [45, 399],
        subtractionRight: [45, 299],
        subtractionAnswer: [80, 599],
      }
    case 'speed-tables':
      return {
        ...defaultRanges,
        multiplicationLeft: [11, 12, 13, 14, 15],
        multiplicationRight: [3, 4, 5, 6, 7, 8, 9],
      }
    case 'marathon':
      return {
        ...defaultRanges,
        additionLeft: [25, 149],
        additionRight: [15, 89],
        subtractionAnswer: [20, 119],
        multiplicationLeft: [6, 7, 8, 9, 11, 12, 13],
        multiplicationRight: [4, 6, 7, 8, 9, 11, 12],
      }
    case 'precision':
      return {
        ...defaultRanges,
        multiplicationLeft: [7, 8, 9, 11, 12, 13, 14],
        multiplicationRight: [6, 7, 8, 9, 11, 12],
        divisionRight: [4, 6, 7, 8, 9, 11, 12],
        divisionAnswer: [4, 14],
      }
    default:
      return defaultRanges
  }
}

function buildQuestion(operation: Operation, missionId: MissionId): Question {
  const createdAt = Date.now()
  const ranges = getRangesForMission(missionId)

  if (operation === 'addition') {
    const left = randomInt(ranges.additionLeft[0], ranges.additionLeft[1])
    const right = randomInt(ranges.additionRight[0], ranges.additionRight[1])
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
    const right = randomInt(ranges.subtractionRight[0], ranges.subtractionRight[1])
    const answer = randomInt(ranges.subtractionAnswer[0], ranges.subtractionAnswer[1])
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
    const left = randomItem(ranges.multiplicationLeft)
    const right = randomItem(ranges.multiplicationRight)
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

  const right = randomItem(ranges.divisionRight)
  const answer = randomInt(ranges.divisionAnswer[0], ranges.divisionAnswer[1])
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

  return buildQuestion(randomItem(preferredPool), missionId)
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
  const points = isCorrect ? Math.max(8, 20 - reactionSeconds) : 0

  return {
    questionId: question.id,
    operation: question.operation,
    expectedAnswer: question.answer,
    givenAnswer,
    isCorrect,
    points,
    reactionSeconds,
    feedback: {
      isCorrect,
      message: isCorrect
        ? `${randomItem(encouragements)} +${points} puan`
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

  if (result.operation === 'subtraction') {
    return 'Çıkarmada yakın onluğa saymak faydalı. Önce büyük farkı yakala, sonra ince ayar yap.'
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
  if (score >= 280 && accuracy >= 92) {
    return {
      title: 'Şampiyon Zihin',
      description: 'Hız ve hassasiyet kusursuz. Bu artık bir zihin sporu.',
      badge: 'Şampiyon',
    }
  }

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

  if (accuracy >= 60) {
    return {
      title: 'Temel Kurucu',
      description: 'Doğruluk yolu açılıyor. Küçük adımlarla hız da gelecek.',
      badge: 'Sağlam temel',
    }
  }

  return {
    title: 'Isınma Gücü',
    description: 'Temel yerleşiyor. Kısa ve sık tekrarlarla hızın belirgin şekilde artar.',
    badge: 'Temel güçleniyor',
  }
}

export function getResultHeadline(performanceBand: PerformanceBand): string {
  if (performanceBand.title === 'Şampiyon Zihin') {
    return 'Olağanüstü bir tur, zihnin tam şampiyon temposunda.'
  }

  if (performanceBand.title === 'Yıldız Pilot') {
    return 'Bu tur gerçekten çok akıcı geçti.'
  }

  if (performanceBand.title === 'Ritim Bulucu') {
    return 'Ritim kuruluyor, birkaç tekrar daha çok faydalı olacak.'
  }

  if (performanceBand.title === 'Temel Kurucu') {
    return 'Doğruluk kazanıyor, şimdi sıra hızı yakalamakta.'
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
