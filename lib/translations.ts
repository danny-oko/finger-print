export type Lang = "en" | "mn" | "ko";

type Translations = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  nav: {
    home: string;
    about: string;
    attend: string;
    journey: string;
    stories: string;
    getInTouch: string;
  };
  footer: {
    navigation: string;
    contact: string;
    motto: string;
    rightsText: string;
  };
  identity: {
    label: string;
    main: string;
    clarify: string;
  };
  journey: {
    label: string;
    heading: string;
    theJourney: string;
    since: string;
    subheading: string;
    hoverHint: string;
    mobileHint: string;
    rotating: string[];
    edition: string;
    title1: string;
    title2: string;
    title3: string;
    title4: string;
    title5: string;
    summary1: string;
    summary2: string;
    summary3: string;
    summary4: string;
    summary5: string;
    pillsAttendees: string;
    pillsChurches: string;
    pillsLocation: string;
    pillsTheme: string;
    pillsVolunteers: string;
    pillsFormat: string;
    pillsReach: string;
  };
  slides: {
    slide1Badge: string;
    slide1Title: string;
    slide1Desc: string;
    slide2Badge: string;
    slide2Title: string;
    slide2Desc: string;
    slide3Badge: string;
    slide3Title: string;
    slide3Desc: string;
  };
  projects: {
    heading: string;
    shortFilm: string;
    eventDayVideo: string;
    open: string;
  };
  gallery: {
    title: string;
  };
  manifesto: {
    label: string;
    text1: string;
    pillIdentity: string;
    text2: string;
    pillWorth: string;
    text3: string;
    pillChrist: string;
    text4: string;
  };
  countdown: {
    dateLabel: string;
    title: string;
    happeningIn: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  attend: {
    heading: string;
    subtitle: string;
    attendTitle: string;
    attendDescription: string;
    serveTitle: string;
    serveDescription: string;
    supportTitle: string;
    supportDescription: string;
  };
  langName: Record<Lang, string>;
};

const en: Translations = {
  hero: {
    badge: "Since 2016 • 7 Editions",
    title: "Finger Print",
    subtitle: "Teen Conference",
    description:
      "Supporting youth ministries of churches and helping every teenager discover the unique value and identity given by God in Christ.",
    ctaPrimary: "Watch Short Film",
    ctaSecondary: "Contact",
  },

  nav: {
    home: "Home",
    about: "About",
    attend: "Attend",
    journey: "Journey",
    stories: "Stories",
    getInTouch: "Contact",
  },

  footer: {
    navigation: "MENU",
    contact: "CONTACT",
    motto:
      "Oh God, how precious are the thoughts You have toward me! How vast is their sum!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "What is Finger Print?",
    main: "The Finger Print conference works together with youth churches to support teenagers so they may realize their value and understand that they are uniquely created in the Lord, helping them live a life of faith in Christ.",
    clarify:
      "Oh God, how precious are the thoughts You have toward me! How vast is their sum! Psalm 139:17",
  },

  journey: {
    label: "Impact",
    heading: "Impact Timeline",
    theJourney: "",
    since: "Since that moment",
    subheading:
      "Since 2016, the Finger Print conference has been renewing and supporting youth ministries of churches in Mongolia.",
    hoverHint: "Hover over the cards to explore :)",
    mobileHint: "",
    rotating: [
      "Called",
      "Saw Their Worth",
      "Feared Him",
      "Made a Decision",
      "Hope Was Born",
      "Saved by Christ",
    ],
    edition: "Edition",
    title1: "1st Edition",
    title2: "2nd Edition",
    title3: "3rd Edition",
    title4: "4th Edition",
    title5: "5th Edition",
    summary1:
      "A collaborative network of youth ministries among Evangelical churches began.",
    summary2:
      "Through worship, teaching, and fellowship, the focus deepened on value in Christ.",
    summary3:
      "Collaboration between youth leaders and ministries became stronger.",
    summary4:
      "Even during difficult times, teenagers remained connected in faith.",
    summary5:
      "Serving the next generation through renewed vision and wider collaboration.",
    pillsAttendees: "Attendees: TBA",
    pillsChurches: "Churches: TBA",
    pillsLocation: "Location: Ulaanbaatar",
    pillsTheme: "Theme: TBA",
    pillsVolunteers: "Volunteers: TBA",
    pillsFormat: "Format: TBA",
    pillsReach: "Reach: TBA",
  },

  slides: {
    slide1Badge: "2025",
    slide1Title: "Finger Print",
    slide1Desc: "Teen Conference - My Value",
    slide2Badge: "2024",
    slide2Title: "Finger Print",
    slide2Desc: "Teen Conference - Connect",
    slide3Badge: "National Teen Seminar",
    slide3Title: "Collaborative Youth Ministry",
    slide3Desc:
      '"Finger Print" unites churches to guide and support Mongolian teenagers in Christ.',
  },

  projects: {
    heading: "Shared Creations",
    shortFilm: "Short Film",
    eventDayVideo: "Conference Recap",
    open: "Watch",
  },

  gallery: {
    title: "Memories Created in the Lord",
  },

  manifesto: {
    label: "Why It Matters",
    text1: "Adolescence is the time when",
    pillIdentity: "identity",
    text2: "is formed,",
    pillWorth: "value",
    text3: "is revealed, and faith finds its foundation in",
    pillChrist: "Christ",
    text4: ".",
  },

  countdown: {
    dateLabel: "October 3, 2026",
    title: "Finger Print 2026",
    happeningIn: "Until It Happens",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },

  attend: {
    heading: "Join the Finger Print Conference",
    subtitle: "You can participate in the following ways",
    attendTitle: "Attend the Conference",
    attendDescription:
      "If you are a teenager, you can participate alone or together with a friend.",
    serveTitle: "Join a Ministry Team",
    serveDescription:
      "You can serve by joining the worship team, welcome team, or organizing team.",
    supportTitle: "Financial Support",
    supportDescription:
      "If you wish, you can support this ministry financially.",
  },

  langName: {
    en: "English",
    mn: "Монгол",
    ko: "한국어",
  },
};
// korean
const ko: Translations = {
  hero: {
    badge: "2016년부터 • 7회",
    title: "핑거프린트",
    subtitle: "청소년 컨퍼런스",
    description:
      "교회의 청소년 사역을 지원하며, 모든 청소년이 그리스도 안에서 하나님이 주신 고유한 가치와 정체성을 발견하도록 돕습니다.",
    ctaPrimary: "단편 영화 보기",
    ctaSecondary: "문의하기",
  },

  nav: {
    home: "홈",
    about: "핑거프린트",
    attend: "참여하기",
    journey: "우리의 여정",
    stories: "이야기",
    getInTouch: "연락하기",
  },

  footer: {
    navigation: "메뉴",
    contact: "연락처",
    motto:
      "하나님이시여, 나를 향한 주의 생각은 얼마나 귀한지요! 그 수가 얼마나 많은지요!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "핑거프린트란 무엇인가?",
    main: "핑거프린트 컨퍼런스는 청소년 교회들과 협력하여 청소년들이 자신의 가치와 주 안에서 특별히 창조된 존재임을 깨닫고 그리스도 안에서 믿음의 삶을 살아가도록 돕습니다.",
    clarify:
      "하나님이시여, 나를 향한 주의 생각은 얼마나 귀한지요! 그 수가 얼마나 많은지요! 시편 139:17",
  },

  journey: {
    label: "영향",
    heading: "영향 타임라인",
    theJourney: "",
    since: "그 순간부터",
    subheading:
      "핑거프린트 컨퍼런스는 2016년부터 몽골 교회의 청소년 사역을 새롭게 세우고 지원해 왔습니다.",
    hoverHint: "카드 위에 마우스를 올려보세요 :)",
    mobileHint: "",
    rotating: [
      "부르심",
      "가치를 발견함",
      "그를 경외함",
      "결단함",
      "희망이 시작됨",
      "그리스도로 구원받음",
    ],
    edition: "회",
    title1: "1회",
    title2: "2회",
    title3: "3회",
    title4: "4회",
    title5: "5회",
    summary1: "복음주의 교회 청소년 사역의 협력 네트워크가 시작되었습니다.",
    summary2: "찬양과 말씀, 교제를 통해 그리스도 안의 가치에 더 집중했습니다.",
    summary3: "청소년 지도자들과 사역 간의 협력이 더욱 깊어졌습니다.",
    summary4: "어려운 시기에도 청소년들이 믿음 안에서 연결되도록 도왔습니다.",
    summary5: "새로운 비전과 더 넓은 협력으로 다음 세대를 섬기고 있습니다.",
    pillsAttendees: "참가자: 미정",
    pillsChurches: "교회: 미정",
    pillsLocation: "장소: 울란바토르",
    pillsTheme: "주제: 미정",
    pillsVolunteers: "봉사자: 미정",
    pillsFormat: "형식: 미정",
    pillsReach: "범위: 미정",
  },

  slides: {
    slide1Badge: "2025년",
    slide1Title: "핑거프린트",
    slide1Desc: "청소년 컨퍼런스 - 나의 가치",
    slide2Badge: "2024년",
    slide2Title: "핑거프린트",
    slide2Desc: "청소년 컨퍼런스 - Connect",
    slide3Badge: "전국 청소년 세미나",
    slide3Title: "협력 청소년 사역",
    slide3Desc:
      '"Finger Print"는 교회들을 하나로 모아 몽골 청소년들을 그리스도 안에서 인도하고 지원합니다.',
  },

  projects: {
    heading: "함께 만든 이야기",
    shortFilm: "단편 영화",
    eventDayVideo: "컨퍼런스 요약",
    open: "보기",
  },

  gallery: {
    title: "주 안에서 만든 추억",
  },

  manifesto: {
    label: "왜 중요한가",
    text1: "청소년기는",
    pillIdentity: "정체성",
    text2: "이 형성되고",
    pillWorth: "가치",
    text3: "가 드러나며 믿음이",
    pillChrist: "그리스도",
    text4: " 안에서 굳게 세워지는 중요한 시기입니다.",
  },

  countdown: {
    dateLabel: "2026년 10월 3일",
    title: "Finger Print 2026",
    happeningIn: "까지 남은 시간",
    days: "일",
    hours: "시간",
    minutes: "분",
    seconds: "초",
  },

  attend: {
    heading: "핑거프린트 컨퍼런스에 참여하기",
    subtitle: "다음과 같은 방법으로 함께할 수 있습니다",
    attendTitle: "컨퍼런스 참가",
    attendDescription:
      "청소년이라면 혼자 또는 친구와 함께 컨퍼런스에 참여할 수 있습니다.",
    serveTitle: "사역팀 참여",
    serveDescription: "찬양팀, 환영팀, 진행팀 등에 참여하여 섬길 수 있습니다.",
    supportTitle: "재정 후원",
    supportDescription: "원하신다면 이 사역을 재정적으로 후원할 수 있습니다.",
  },

  langName: {
    en: "영어",
    mn: "몽골어",
    ko: "한국어",
  },
};

// mongolian
const mn: Translations = {
  hero: {
    badge: "2016 оноос хойш • 7 удаа",
    title: "Хурууны Хээ",
    subtitle: "Өсвөрийн Конферренс",
    description:
      "Чуулгануудын өсвөрийн үйлчлэлийг дэмжиж, өсвөр насны хүүхэд бүр Христ дотор Бурханаас өгсөн өвөрмөц үнэ цэнэ, мөн чанарыг нь харуулах зорилготой.",
    ctaPrimary: "Богино хэмжээний кино үзэх",
    ctaSecondary: "Холбоо барих",
  },

  nav: {
    home: "Нүүр",
    about: "Хурууны хээ",
    attend: "Оролцох",
    journey: "Бидний аялал",
    stories: "Түүхүүд",
    getInTouch: "Холбогдох",
  },

  footer: {
    navigation: "ЦЭС",
    contact: "ХОЛБОО БАРИХ",
    motto:
      "Аяа Бурхан, надад хандсан бодлууд тань Хичнээн нандин бэ!  Нийлбэр нь хичнээн их вэ!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "Хурууны хээ гэж юу вэ?",
    main: "Хурууны хээ конференц нь өсвөр үеийг өөрийн үнэ цэнэ болон Эзэний доторх онцгой бүтээл гэдгээ ухаарч, Христ итгэлийн амьдралаар амьдрахад нь өсвөрийн чуулгануудтай хамтран дэмжлэг үзүүлэх зорилготой.",
    clarify:
      "Аяа Бурхан, надад хандсан бодлууд тань Хичнээн нандин бэ!  Нийлбэр нь хичнээн их вэ!Дуулал 139:17",
  },

  journey: {
    label: "Нөлөө",
    heading: "Нөлөөний цагийн шугам",
    theJourney: "",
    since: "Тэр мөчөөс",
    subheading:
      "Хурууны хээ конфференц нь 2016 оноос хойш Монголын өсвөрийн чуулганы үйлчлэлийн сэргээн болсож, дэмжсээр ирсэн.",
    hoverHint: "Картууд дээр хулганаа байршуулаадд үзээрэй :)",
    mobileHint: "",
    rotating: [
      "Дуудагдсан",
      "Үнэ цэнээ харсан",
      "Түүнээс эмээсэн",
      "Шийдвэр гаргасан",
      "Найдвар төрсөн",
      "Христээр аврагдсан",
    ],
    edition: "удаа",
    title1: "Анхы удаа",
    title2: "2 дахь удаа",
    title3: "3 дахь удаа",
    title4: "4 дэх удаа",
    title5: "5 дахь удаа",
    summary1: `"Хурууны хээ"`,
    summary2: `"Гэрэл дотор амьдарцгаая” - Иохан 8:12 “Би бол ертөнцийн гэрэл мөн. Намайг дагадаг хүн харанхуй дотор явахгүй, харин амийн гэрэлтэй болно гэж айлдав.`,
    summary3: `“Итгэлээр алхацгаая” - 2 Коринт 5:7 Учир нь бид үзэгдэх зүйлсээр биш харин итгэлээр алхдаг`,
    summary4: ` “CONNECT” - 2ТИМОТ 2:22 22 Залуу насны дур хүслүүдээс зугт. Цэвэр зүрхнээс Эзэнийг дуудагчдын хамт зөвт байдал, итгэл, хайр ба амар тайвныг мөшгө.`,
    summary5: `“You are worthy” Исаиа 43:4 Чи Миний нүдэнд үнэтэй, Хүндтэй, Би чамд хайртай…`,
    pillsAttendees: "Оролцогчид: Тодорхойгүй",
    pillsChurches: "Сүмүүд: Тодорхойгүй",
    pillsLocation: "Байршил: Улаанбаатар",
    pillsTheme: "Сэдэв: Тодорхойгүй",
    pillsVolunteers: "Сайн дурынхан: Тодорхойгүй",
    pillsFormat: "Формат: Тодорхойгүй",
    pillsReach: "Хүрээ: Тодорхойгүй",
  },

  slides: {
    slide1Badge: "2025 он",
    slide1Title: "Хурууны Хээ",
    slide1Desc: "Өсвөрийн Конферренс - Миний үнэ цэнэ",
    slide2Badge: "2024 он",
    slide2Title: "Хурууны Хээ",
    slide2Desc: "Өсвөрийн Конферренс - Connect",
    slide3Badge: "Үндэсний өсвөрийн семинар",
    slide3Title: "Хамтын өсвөрийн үйлчлэл",
    slide3Desc:
      '"Finger Print" нь сүмүүдийг Монголын өсвөрүүдийг Христ дотор хамт удирдан, дэмжихэд нэгтгэнэ.',
  },

  projects: {
    heading: "Хамтын бүтээл",
    shortFilm: "Богино хэмжээний кино",
    eventDayVideo: "Конфференцийн хураангуй",
    open: "Үзэх",
  },

  gallery: {
    title: "Эзэн дотор бүтээсэн дурсамжууд",
  },

  manifesto: {
    label: "Яагаад чухал вэ",
    text1: "Өсвөр нас бол",
    pillIdentity: "мөн чанар",
    text2: "төлөвшиж,",
    pillWorth: "үнэ цэнэ",
    text3: "илэрч, итгэл",
    pillChrist: "Христ",
    text4: "дотор бат сууриа олдог чухал үе юм.",
  },

  countdown: {
    dateLabel: "2026 оны 10-р сарын 3",
    title: "Хурууны хээ 2026",
    happeningIn: "болох хүртэл",
    days: "Өдөр",
    hours: "Цаг",
    minutes: "Минут",
    seconds: "Секунд",
  },

  attend: {
    heading: "Хурууны хээ конферренсэд нэгдэх",
    subtitle: "Та дараах байдлаар оролцох боломжтой",
    attendTitle: "Конферренцэд оролцох",
    attendDescription:
      "Хэрэв та өсвөр насны хүүхэд бол ганцаараа эсвэл найзтайгаа хамт оролцох боломжтой.",
    serveTitle: "Үйлчлэлд нэгдэх",
    serveDescription:
      "Магтаалын баг, мэндчилгээний баг болон зохион байгуулах багт нэгдэж үйлчлэх боломжтой.",
    supportTitle: "Санхүүгийн дэмжлэг",
    supportDescription:
      "Хэрэв та хүсвэл энэхүү үйл ажиллагааг санхүүгээр дэмжих боломжтой.",
  },

  langName: {
    en: "English",
    mn: "Монгол",
    ko: "한국어",
  },
};

const translations: Record<Lang, Translations> = { en, mn, ko };

function getByPath(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function getTranslation(lang: Lang, key: string): string {
  const data = translations[lang] ?? en;
  const value = getByPath(data, key) ?? getByPath(en, key);
  return typeof value === "string" ? value : "";
}

export function getTranslations(lang: Lang): Translations {
  return translations[lang] ?? en;
}

export { en, ko, mn };
