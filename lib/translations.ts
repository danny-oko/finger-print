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
    pillIdentity: string;
    pillUnity: string;
    pillNextGen: string;
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

const en: Translations = {
  hero: {
    badge: "Since 2017 • 5 Editions",
    title: "Finger Print",
    subtitle: "Teen Seminar for Mongolian Churches",
    description:
      "Supporting and connecting youth ministries across Mongolia's Evangelical churches—helping every teen discover their unique, God-given identity.",
    ctaPrimary: "Watch Short Film",
    ctaSecondary: "Get In Touch",
  },
  nav: {
    home: "Home",
    about: "About",
    journey: "Journey",
    stories: "Stories",
    gallery: "Gallery",
    getInTouch: "Get In Touch",
  },
  footer: {
    navigation: "NAVIGATION",
    contact: "CONTACT",
    motto: "One movement. One generation. One church family.",
    rightsText: "All rights reserved • FirstChurch",
  },
  identity: {
    label: "Our Identity",
    main: "Finger Print supports and connects youth ministries across Mongolia's Evangelical churches — helping teenagers recognize their distinct identity and God-given value within Christ through a shared space of worship, growth, and community.",
    clarify:
      "This mission begins in adolescence—the season where identity is formed and value is revealed.",
    pillIdentity: "Identity",
    pillUnity: "Unity",
    pillNextGen: "Next Generation",
  },
  journey: {
    label: "Impact",
    heading: "Impact Timeline",
    theJourney: "The Journey",
    since: "Since",
    subheading:
      "Five editions since 2017, building unity and strengthening youth ministry across Evangelical churches.",
    hoverHint: "Hover over each year to reveal images.",
    mobileHint: "Swipe images on each year card.",
    rotating: [
      "First Prayer",
      "the Calling",
      "Faith Began",
      "By His Grace",
      "Faith Began",
      "Rooted in Christ",
    ],
    edition: "Edition",
    title1: "1st Edition",
    title2: "2nd Edition",
    title3: "3rd Edition",
    title4: "4th Edition",
    title5: "5th Edition",
    summary1:
      "The beginning of a shared youth ministry network across Evangelical churches.",
    summary2:
      "A clearer focus on identity in Christ through worship, teaching, and community.",
    summary3:
      "Stronger collaboration between youth leaders and ministries, with deeper unity.",
    summary4:
      "Sustaining the movement through challenges while keeping teens connected to faith.",
    summary5:
      "Serving the next generation with renewed vision and wider cooperation.",
    pillsAttendees: "Attendees: TBA",
    pillsChurches: "Churches: TBA",
    pillsLocation: "Location: Ulaanbaatar",
    pillsTheme: "Theme: TBA",
    pillsVolunteers: "Volunteers: TBA",
    pillsFormat: "Format: TBA",
    pillsReach: "Reach: TBA",
  },
  slides: {
    slide1Badge: "Discovering God-Given Identity",
    slide1Title: "Where every life carries a distinct imprint.",
    slide1Desc:
      "A gathering that helps teens recognize their unique value in Christ and grow together in faith.",
    slide2Badge: "Evangelical Youth Collaboration",
    slide2Title: "Serving the next generation together.",
    slide2Desc:
      "An annual gathering connecting Evangelical churches to strengthen youth ministry across Mongolia.",
    slide3Badge: "National Youth Seminar",
    slide3Title: "A collaborative youth ministry initiative",
    slide3Desc:
      '"Finger Print" brings churches together to nurture, guide, and support Mongolia\'s teenagers in Christ.',
  },
  projects: {
    heading: "Stories in Motion",
    shortFilm: "Short Film",
    eventDayVideo: "Event day Video",
    open: "Open",
  },
  gallery: {
    title: "The Community",
  },
  manifesto: {
    label: "Why it matters",
    text1: "Adolescence is a defining season where",
    pillIdentity: "identity",
    text2: "is shaped, where",
    pillWorth: "worth",
    text3: "is discovered, and faith is anchored in",
    pillChrist: "Christ",
    text4: ".",
  },
  langName: {
    en: "English",
    mn: "Монгол",
    ko: "한국어",
  },
};

const ko: Translations = {
  hero: {
    badge: "2017년부터 • 5회 개최",
    title: "핑거프린트",
    subtitle: "몽골 교회 청소년 세미나",
    description:
      "몽골 복음주의 교회들의 청소년 사역을 지원하고 연결하여, 모든 청소년이 그리스도 안에서 하나님이 주신 고유한 정체성과 가치를 발견하도록 돕습니다.",
    ctaPrimary: "단편 영상 보기",
    ctaSecondary: "문의하기",
  },
  nav: {
    home: "홈",
    about: "소개",
    journey: "여정",
    stories: "스토리",
    gallery: "갤러리",
    getInTouch: "문의하기",
  },
  footer: {
    navigation: "메뉴",
    contact: "연락처",
    motto: "하나의 움직임. 한 세대. 한 교회 가족.",
    rightsText: "All rights reserved • FirstChurch",
  },
  identity: {
    label: "우리의 정체성",
    main: "핑거프린트는 몽골 복음주의 교회들의 청소년 사역을 지원하고 연결합니다. 예배와 말씀, 교제의 자리 안에서 청소년들이 그리스도 안에서 자신의 뚜렷한 정체성과 하나님이 주신 가치를 깨닫고 믿도록 돕습니다.",
    clarify:
      "이 사명은 정체성이 형성되고 가치가 드러나는 시기인 청소년기에서 시작됩니다.",
    pillIdentity: "정체성",
    pillUnity: "연합",
    pillNextGen: "다음 세대",
  },
  journey: {
    label: "임팩트",
    heading: "임팩트 타임라인",
    theJourney: "여정",
    since: "~부터",
    subheading:
      "2017년 이후 5회에 걸쳐 복음주의 교회들의 청소년 사역을 세우고 연합을 강화해 왔습니다.",
    hoverHint: "각 연도에 마우스를 올리면 사진이 표시됩니다.",
    mobileHint: "각 연도 카드에서 이미지를 좌우로 넘겨보세요.",
    rotating: [
      "첫 기도",
      "부르심",
      "믿음의 시작",
      "그의 은혜로",
      "다시 믿음의 시작",
      "그리스도 안에 뿌리내림",
    ],
    edition: "회",
    title1: "1회",
    title2: "2회",
    title3: "3회",
    title4: "4회",
    title5: "5회",
    summary1: "복음주의 교회들 사이에서 청소년 사역 네트워크가 시작되었습니다.",
    summary2:
      "예배와 말씀, 교제를 통해 그리스도 안의 정체성을 더 선명히 붙들었습니다.",
    summary3: "청소년 리더와 사역 간 협력이 강화되고, 연합이 더 깊어졌습니다.",
    summary4:
      "도전 속에서도 청소년들이 믿음과 공동체 안에 연결되도록 흐름을 이어갔습니다.",
    summary5: "새로운 비전과 더 넓은 협력으로 다음 세대를 섬기고 있습니다.",
    pillsAttendees: "참가자: 미정",
    pillsChurches: "교회: 미정",
    pillsLocation: "장소: 울란바토르",
    pillsTheme: "주제: 미정",
    pillsVolunteers: "봉사자: 미정",
    pillsFormat: "형식: 미정",
    pillsReach: "확장: 미정",
  },
  slides: {
    slide1Badge: "하나님이 주신 정체성 발견",
    slide1Title: "각 사람의 삶에는 고유한 흔적이 있습니다.",
    slide1Desc:
      "청소년들이 그리스도 안에서 자신의 가치를 발견하고, 믿음 안에서 함께 성장하도록 돕는 모임입니다.",
    slide2Badge: "복음주의 청소년 연합",
    slide2Title: "다음 세대를 함께 섬깁니다.",
    slide2Desc:
      "몽골 전역의 복음주의 교회들이 연합하여 청소년 사역을 세우는 연례 모임입니다.",
    slide3Badge: "전국 청소년 세미나",
    slide3Title: "함께 세우는 청소년 사역",
    slide3Desc:
      '"핑거프린트"는 교회들이 함께 몽골의 청소년들을 그리스도 안에서 양육하고, 인도하며, 지지하도록 연결합니다.',
  },
  projects: {
    heading: "움직이는 이야기",
    shortFilm: "단편 영상",
    eventDayVideo: "행사 당일 영상",
    open: "열기",
  },
  gallery: {
    title: "공동체",
  },
  manifesto: {
    label: "왜 중요한가",
    text1: "청소년기는",
    pillIdentity: "정체성",
    text2: "이 형성되고",
    pillWorth: "가치",
    text3: "가 발견되며 믿음이",
    pillChrist: "그리스도",
    text4: " 안에 굳게 세워지는 결정적 시기입니다.",
  },
  langName: {
    en: "영어",
    mn: "몽골어",
    ko: "한국어",
  },
};

const mn: Translations = {
  hero: {
    badge: "2017 оноос хойш • 5 удаа",
    title: "Finger Print",
    subtitle: "Монголын сүмүүдийн залуучуудын семинар",
    description:
      "Монголын Шүүгчдийн сүмүүдийн залуучуудын үйлчилгээг дэмжиж, холбож, залуу бүр Христод өөрийн өвөрмөц, Бурханаас өгсөн үнэлэмжийг олоход нь туслана.",
    ctaPrimary: "Богино кино үзэх",
    ctaSecondary: "Холбогдох",
  },
  nav: {
    home: "Нүүр",
    about: "Танилцуулга",
    journey: "Аялал",
    stories: "Түүхүүд",
    gallery: "Галлерей",
    getInTouch: "Холбогдох",
  },
  footer: {
    navigation: "ЦЭС",
    contact: "ХОЛБОО БАРИХ",
    motto: "Нэг хөдөлгөөн. Нэг үе. Нэг сүмийн гэр бүл.",
    rightsText: "All rights reserved • FirstChurch",
  },
  identity: {
    label: "Хурууны хээ гэж юу вэ?",
    main: "Хүн бүрийн хурууны хээ давтагдаггүйтэй адил өсвөр насны хүүхэд бүр Эзэний дотор өөрийн онцгой мөн чанарыг олж, ухаарч, итгэх хэрэгтэй. “Хурууны Хээ” семинар нь өсвөрийн чуулгануудыг дэмжин хамтран үйлчилж, оролцогч бүрт баяр хөөр, урам зориг өгдөг бөгөөд жил бүр шинэ сэдвээр зохион байгуулагддаг.",
    clarify:
      "Энэ эрхэм зорилго өсвөр насанд эхэлдэг—үнэлэмж бүрдэж, үнэ цэнэ илэрдэг цаг.",
    pillIdentity: "Үнэлэмж",
    pillUnity: "Нэгдэл",
    pillNextGen: "Дараагийн үе",
  },
  journey: {
    label: "Нөлөө",
    heading: "Нөлөөний цагийн хүснэгт",
    theJourney: "Бидний аялал",
    since: "Тэр цагаас",
    subheading:
      "2017 оноос хойш таван удаа Шүүгчдийн сүмүүдийн залуучуудын үйлчилгээг бэхжүүлж, нэгдлийг бэхжүүлсэн.",
    hoverHint: "Жил бүрийн дээр хулганаа авч зургуудыг харна уу.",
    mobileHint: "Жил бүрийн картан дээр зургуудыг гүйлгэнэ үү.",
    rotating: [
      "Анхны залбирал",
      "Дуудлага",
      "Итгэл эхэлсэн",
      "Түүний нигүүлслээр",
      "Итгэл эхэлсэн",
      "Христод үндэслэсэн",
    ],
    edition: "удаа",
    title1: "1-р удаа",
    title2: "2-р удаа",
    title3: "3-р удаа",
    title4: "4-р удаа",
    title5: "5-р удаа",
    summary1: "Шүүгчдийн сүмүүдийн залуучуудын үйлчилгээний сүлжээний эхлэл.",
    summary2:
      "Шүүглэл, заах арга, нийгэмлэгээр Христод үнэлэмжид илүү анхаарсан.",
    summary3:
      "Залуу удирдагч, үйлчилгээнүүдийн хоорондын хамтын ажиллагаа бэхжиж, нэгдэл гүнзгийрсэн.",
    summary4:
      "Бэрхшээлтэй үед ч залуучуудыг итгэлтэй холбоод хөдөлгөөнийг үргэлжлүүлсэн.",
    summary5:
      "Шинэ алсын хараа, өргөн хамтын ажиллагаагаар дараагийн үеийг үйлчилж байна.",
    pillsAttendees: "Оролцогчид: Тодорхойгоогүй",
    pillsChurches: "Сүмүүд: Тодорхойгоогүй",
    pillsLocation: "Байршил: Улаанбаатар",
    pillsTheme: "Сэдэв: Тодорхойгоогүй",
    pillsVolunteers: "Сайн дурын ажилчид: Тодорхойгоогүй",
    pillsFormat: "Формат: Тодорхойгоогүй",
    pillsReach: "Хүртээмж: Тодорхойгоогүй",
  },
  slides: {
    slide1Badge: "Бурханаас өгсөн үнэлэмжийг олох",
    slide1Title: "Амьдрал бүр өөрийн өвөрмөц ул мөртэй.",
    slide1Desc:
      "Залуучууд Христод өөрийн үнэ цэнийг танин, итгэлээр хамт өсөхөд туслах цуглаан.",
    slide2Badge: "Шүүгчдийн залуучуудын хамтын ажиллагаа",
    slide2Title: "Дараагийн үеийг хамт үйлчилж байна.",
    slide2Desc:
      "Монгол даяар залуучуудын үйлчилгээг бэхжүүлэхийн тулд Шүүгчдийн сүмүүдийг холбох жилийн цуглаан.",
    slide3Badge: "Үндэсний залуучуудын семинар",
    slide3Title: "Хамтын залуучуудын үйлчилгээ",
    slide3Desc:
      '"FingerPrint" нь сүмүүдийг Монголын залуучуудыг Христод хамт хүмүүжүүлж, удирдан, дэмжихэд нэгтгэнэ.',
  },
  projects: {
    heading: "Хөдөлгөөнт түүхүүд",
    shortFilm: "Богино кино",
    eventDayVideo: "Арга хэмжээний өдрийн видео",
    open: "Үзэх",
  },
  gallery: {
    title: "Нийгэмлэг",
  },
  manifesto: {
    label: "Яагаад чухал вэ",
    text1: "Өсвөр нас бол итгэл нь",
    pillIdentity: "Христийн дотор",
    text2: "хэлбэршиж, Түүний загалмайн ажлаар",
    pillWorth: "үнэ цэнээ",
    text3: "ухааран,",
    pillChrist: "ЭЗЭН дотор",
    text4: "төлөвших чухал мөч юм.",
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
