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

const en: Translations = {
  hero: {
    badge: "Since 2017 • 5 Editions",
    title: "Finger Print",
    subtitle: "Teen Seminar for Mongolian Churches",
    description:
      "Supporting and connecting youth ministries across Mongolia's Evangelical churches—helping every teenager discover their God-given identity and worth in Christ.",
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
    main: "The Finger Print Conference partners with youth churches to help teenagers discover their true value and recognize that they are uniquely created by God. Together we encourage them to live a life of faith rooted in Christ.",
    clarify:
      "How precious also are thy thoughts unto me, O God!  How great is the sum of them! Psalm 193:17",
  },

  journey: {
    label: "Impact",
    heading: "Impact Timeline",
    theJourney: "The Journey",
    since: "Since",
    subheading:
      "Five editions since 2017, strengthening youth ministry and unity among Evangelical churches.",
    hoverHint: "Hover over each year to reveal images.",
    mobileHint: "Swipe images on each year card.",
    rotating: [
      "First Prayer",
      "The Calling",
      "Faith Began",
      "By His Grace",
      "Faith Renewed",
      "Rooted in Christ",
    ],
    edition: "Edition",
    title1: "1st Edition",
    title2: "2nd Edition",
    title3: "3rd Edition",
    title4: "4th Edition",
    title5: "5th Edition",
    summary1:
      "The beginning of a shared youth ministry network among Evangelical churches.",
    summary2:
      "A stronger focus on identity in Christ through worship, teaching, and fellowship.",
    summary3:
      "Deeper collaboration among youth leaders and ministries across churches.",
    summary4:
      "Sustaining the movement through challenges while keeping teens connected in faith.",
    summary5:
      "Continuing to serve the next generation with renewed vision and wider cooperation.",
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
    slide1Title: "Every life carries a unique imprint.",
    slide1Desc:
      "A gathering that helps teenagers recognize their value in Christ and grow together in faith.",
    slide2Badge: "Evangelical Youth Collaboration",
    slide2Title: "Serving the next generation together.",
    slide2Desc:
      "An annual gathering connecting Evangelical churches to strengthen youth ministry across Mongolia.",
    slide3Badge: "National Youth Seminar",
    slide3Title: "A collaborative youth ministry initiative",
    slide3Desc:
      '"Finger Print" brings churches together to guide, nurture, and support Mongolia’s teenagers in Christ.',
  },

  projects: {
    heading: "Stories in Motion",
    shortFilm: "Short Film",
    eventDayVideo: "Event Day Video",
    open: "Open",
  },

  gallery: {
    title: "The Community",
  },

  manifesto: {
    label: "Why It Matters",
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
      "몽골 복음주의 교회들의 청소년 사역을 연결하고 지원하여, 모든 청소년이 그리스도 안에서 하나님이 주신 고유한 정체성과 가치를 발견하도록 돕습니다.",
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
    main: "핑거프린트 컨퍼런스는 청소년 교회들과 협력하여 청소년들이 그리스도 안에서 하나님이 주신 가치와 고유한 정체성을 깨닫고 믿음의 삶을 살아가도록 돕습니다.",
    clarify:
      "하나님이시여, 주의 생각은 나에게 정말 소중합니다. 어쩌면 주는 그렇게도 많은 생각을 하십니까? 시편 139:17",
  },

  journey: {
    label: "임팩트",
    heading: "임팩트 타임라인",
    theJourney: "여정",
    since: "~부터",
    subheading:
      "2017년 이후 5회에 걸쳐 복음주의 교회들의 청소년 사역과 연합을 세워 왔습니다.",
    hoverHint: "각 연도에 마우스를 올리면 사진이 표시됩니다.",
    mobileHint: "각 연도 카드에서 이미지를 좌우로 넘겨보세요.",
    rotating: [
      "첫 기도",
      "부르심",
      "믿음의 시작",
      "그의 은혜로",
      "믿음의 새 시작",
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
      "예배와 말씀, 교제를 통해 그리스도 안의 정체성을 더욱 분명히 붙들었습니다.",
    summary3: "청소년 리더들과 사역 간 협력이 강화되었습니다.",
    summary4:
      "도전 속에서도 청소년들이 믿음 안에 연결되도록 흐름을 이어갔습니다.",
    summary5: "새로운 비전과 협력으로 다음 세대를 계속 섬기고 있습니다.",
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
      "청소년들이 그리스도 안에서 자신의 가치를 발견하고 믿음 안에서 성장하도록 돕는 모임입니다.",
    slide2Badge: "복음주의 청소년 연합",
    slide2Title: "다음 세대를 함께 섬깁니다.",
    slide2Desc:
      "몽골 전역의 교회들이 연합하여 청소년 사역을 세우는 연례 모임입니다.",
    slide3Badge: "전국 청소년 세미나",
    slide3Title: "함께 세우는 청소년 사역",
    slide3Desc:
      '"핑거프린트"는 교회들이 함께 몽골 청소년들을 그리스도 안에서 양육하고 지원하도록 연결합니다.',
  },

  projects: {
    heading: "움직이는 이야기",
    shortFilm: "단편 영상",
    eventDayVideo: "행사 영상",
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
    text4: " 안에 굳게 세워지는 시기입니다.",
  },

  langName: {
    en: "영어",
    mn: "몽골어",
    ko: "한국어",
  },
};

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
    motto: "Нэг хөдөлгөөн. Нэг үе. Нэг сүмийн гэр бүл.",
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
    theJourney: "Бидний аялал",
    since: "Тэр цагаас",
    subheading:
      "2017 оноос хойш 5 удаа евангелийн сүмүүдийн өсвөрийн үйлчлэлийг дэмжиж, нэгдлийг бэхжүүлсээр ирлээ.",
    hoverHint: "Жил бүрийн дээр хулганаа авч зургуудыг харна уу.",
    mobileHint: "Жил бүрийн картан дээр зургуудыг гүйлгэнэ үү.",
    rotating: [
      "Анхны залбирал",
      "Дуудлага",
      "Итгэл эхэлсэн",
      "Түүний нигүүлслээр",
      "Итгэл шинэчлэгдсэн",
      "Христод үндэслэсэн",
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
    heading: "Хөдөлгөөнт түүхүүд",
    shortFilm: "Богино кино",
    eventDayVideo: "Арга хэмжээний видео",
    open: "Үзэх",
  },

  gallery: {
    title: "Нийгэмлэг",
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
