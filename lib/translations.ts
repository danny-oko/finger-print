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
    journey: string;
    stories: string;
    gallery: string;
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
  langName: Record<Lang, string>;
};

// english
const en: Translations = {
  hero: {
    badge: "Since 2016 • 6 Editions",
    title: "Finger Print",
    subtitle: "Teen Seminar",
    description: "Oh God, how precious are the thoughts You have toward me!",
    ctaPrimary: "Watch Short Film",
    ctaSecondary: "Get In Touch",
  },

  nav: {
    home: "Home",
    about: "Finger Print",
    journey: "Our Journey",
    gallery: "Attend",
    stories: "Stories",
    getInTouch: "Contact",
  },

  footer: {
    navigation: "MENU",
    contact: "CONTACT",
    motto: "Oh God, how precious are the thoughts You have toward me!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "What is Finger Print?",
    main: "The Finger Print conference works together with youth churches to support teenagers so they may realize their value and understand that they are uniquely created in the Lord, helping them live a life of faith in Christ.",
    clarify:
      "How precious also are Your thoughts toward me, O God! Psalm 139:17",
  },

  journey: {
    label: "Impact",
    heading: "Impact Timeline",
    theJourney: "",
    since: "since that moment",
    subheading:
      "The Finger Print conference has been renewing and supporting youth church ministries in Mongolia since 2016.",
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
    summary1: "A collaborative network of Evangelical youth ministries began.",
    summary2:
      "Focused more deeply on value in Christ through worship, teaching, and fellowship.",
    summary3: "Collaboration between youth leaders and ministries deepened.",
    summary4: "Even in difficult times, teenagers remained connected in faith.",
    summary5:
      "Serving the next generation through a renewed vision and wider cooperation.",
    pillsAttendees: "Attendees: TBA",
    pillsChurches: "Churches: TBA",
    pillsLocation: "Location: Ulaanbaatar",
    pillsTheme: "Theme: TBA",
    pillsVolunteers: "Volunteers: TBA",
    pillsFormat: "Format: TBA",
    pillsReach: "Reach: TBA",
  },

  slides: {
    slide1Badge: "A Time of Worship",
    slide1Title: "A moment to lift our praise together before God",
    slide1Desc:
      "A blessed time of joyfully offering praise before the Lord together.",
    slide2Badge: "Joyful Collaborative Ministry",
    slide2Title: "A ministry serving the next generation",
    slide2Desc:
      "A ministry uniting and strengthening youth ministries of churches across Mongolia.",
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
    title: "Memories We Created Together",
  },

  manifesto: {
    label: "Why It Matters",
    text1: "Adolescence is the season where",
    pillIdentity: "identity",
    text2: "is formed,",
    pillWorth: "value",
    text3: "is revealed, and faith finds its foundation in",
    pillChrist: "Christ",
    text4: ".",
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
    badge: "2016년부터 • 6회",
    title: "핑거프린트",
    subtitle: "청소년 세미나",
    description:
      "몽골 복음주의 교회들의 청소년 사역을 지원하며, 모든 청소년이 그리스도 안에서 하나님이 주신 고유한 가치와 정체성을 발견하도록 돕습니다.",
    ctaPrimary: "단편 영화 보기",
    ctaSecondary: "문의하기",
  },

  nav: {
    home: "홈",
    about: "핑거프린트",
    journey: "우리의 여정",
    gallery: "참여하기",
    stories: "스토리",
    getInTouch: "연락하기",
  },

  footer: {
    navigation: "메뉴",
    contact: "연락처",
    motto: "하나님이시여, 나를 향한 주의 생각은 얼마나 귀한지요!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "핑거프린트란 무엇인가?",
    main: "핑거프린트 컨퍼런스는 청소년 교회들과 협력하여 청소년들이 자신의 가치와 주 안에서 특별히 창조된 존재임을 깨닫고 그리스도 안에서 믿음의 삶을 살아가도록 돕습니다.",
    clarify: "하나님이시여, 주의 생각이 나에게 얼마나 귀한지요! 시편 139:17",
  },

  journey: {
    label: "영향",
    heading: "영향 타임라인",
    theJourney: "",
    since: "그 순간부터",
    subheading:
      "핑거프린트 컨퍼런스는 2016년부터 몽골 청소년 교회 사역을 새롭게 세우고 지원해 왔습니다.",
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
    summary2:
      "찬양과 말씀, 교제를 통해 그리스도 안의 가치에 더욱 집중했습니다.",
    summary3: "청소년 리더들과 사역 간 협력이 깊어졌습니다.",
    summary4: "어려움 속에서도 청소년들이 믿음 안에서 연결되도록 도왔습니다.",
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
    slide1Badge: "찬양의 시간",
    slide1Title: "함께 하나님 앞에 찬양을 올리는 시간",
    slide1Desc: "주님 앞에서 기쁨으로 함께 찬양을 드리는 은혜의 시간입니다.",
    slide2Badge: "기쁨이 가득한 협력 사역",
    slide2Title: "다음 세대를 섬기는 사역",
    slide2Desc: "몽골 교회의 청소년 사역을 하나로 모으고 세우는 사역입니다.",
    slide3Badge: "전국 청소년 세미나",
    slide3Title: "협력 청소년 사역",
    slide3Desc:
      '"Finger Print"는 교회들을 하나로 모아 몽골 청소년들을 그리스도 안에서 인도하고 지원합니다.',
  },

  projects: {
    heading: "함께 만든 이야기",
    shortFilm: "단편 영화",
    eventDayVideo: "컨퍼런스 하이라이트",
    open: "보기",
  },

  gallery: {
    title: "함께 만든 추억",
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

  langName: {
    en: "영어",
    mn: "몽골어",
    ko: "한국어",
  },
};

// mongolian
const mn: Translations = {
  hero: {
    badge: "2016 оноос хойш • 6 удаа",
    title: "Хурууны Хээ",
    subtitle: "Өсвөрийн Семинар",
    description:
      "Монголын евангелийн чуулгануудын өсвөрийн үйлчлэлийг дэмжиж, өсвөр насны хүүхэд бүр Христ дотор Бурханаас өгсөн өвөрмөц үнэ цэнэ, мөн чанарыг нь харуулах зорилготой.",
    ctaPrimary: "Богино хэмжээний кино үзэх",
    ctaSecondary: "Холбоо барих",
  },

  nav: {
    home: "Нүүр",
    about: "Хурууны хээ",
    journey: "Бидний аялал",
    gallery: "Оролцох",
    stories: "Түүхүүд",
    getInTouch: "Холбогдох",
  },

  footer: {
    navigation: "ЦЭС",
    contact: "ХОЛБОО БАРИХ",
    motto: "Аяа Бурхан, надад хандсан бодлууд тань хичнээн нандин бэ!",
    rightsText: "All rights reserved • FirstChurch",
  },

  identity: {
    label: "Хурууны хээ гэж юу вэ?",
    main: "Хурууны хээ конференц нь өсвөр үеийг өөрийн үнэ цэнэ болон Эзэний доторх онцгой бүтээл гэдгээ ухаарч, Христ итгэлийн амьдралаар амьдрахад нь өсвөрийн чуулгануудтай хамтран дэмжлэг үзүүлэх зорилготой.",
    clarify:
      "Аяа Бурхан, надад хандсан бодлууд тань хичнээн нандин бэ! Дуулал 139:17",
  },

  journey: {
    label: "Нөлөө",
    heading: "Нөлөөний цагийн шугам",
    theJourney: "",
    since: "тэр мөчөөс",
    subheading:
      // "2017 оноос хойш 5 удаа евангелийн сүмүүдийн өсвөрийн үйлчлэлийг дэмжиж, нэгдлийг бэхжүүлсээр ирлээ.",
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
    title1: "1-р удаа",
    title2: "2-р удаа",
    title3: "3-р удаа",
    title4: "4-р удаа",
    title5: "5-р удаа",
    summary1: "Евангелийн сүмүүдийн өсвөрийн үйлчлэлийн хамтын сүлжээ эхэлсэн.",
    summary2:
      "Магтаал, сургаал, нөхөрлөлөөр Христ доторх үнэлэмжид илүү төвлөрсөн.",
    summary3:
      "Өсвөрийн удирдагчид болон үйлчлэлүүдийн хамтын ажиллагаа гүнзгийрсэн.",
    summary4: "Бэрхшээлтэй үед ч өсвөрүүдийг итгэлтэй холбоотой байлгасан.",
    summary5:
      "Шинэ алсын хараа, илүү өргөн хамтын ажиллагаагаар дараагийн үеийг үйлчилж байна.",
    pillsAttendees: "Оролцогчид: Тодорхойгүй",
    pillsChurches: "Сүмүүд: Тодорхойгүй",
    pillsLocation: "Байршил: Улаанбаатар",
    pillsTheme: "Сэдэв: Тодорхойгүй",
    pillsVolunteers: "Сайн дурынхан: Тодорхойгүй",
    pillsFormat: "Формат: Тодорхойгүй",
    pillsReach: "Хүрээ: Тодорхойгүй",
  },

  slides: {
    slide1Badge: "Магтаал хүндэтгэлийн цаг",
    slide1Title: "Хамтдаа Бурханы өмнө өөрсдийн магтаалыг өргөх цаг",
    slide1Desc:
      "Хамтаа Эзэний өмнө баяр хөөртэйгөөр магтаалыг өргөх ивээлтэй цаг.",
    slide2Badge: "Баяр хөөр дүүрэн хамтын үйлчлэл",
    slide2Title: "Хойч үедээ үйлчлэх үйлчлэл",
    slide2Desc:
      "Даяар Монгол чуулгануудын өвсөрийн үйлчлэлийг нэгтгэх, босгон байгуулах үйчлэл.",
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
    title: "Хамтдаа бүтээсэн дурсамжууд",
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
