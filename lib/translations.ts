export type Lang = "en" | "mn" | "ko";

export type Translations = {
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
    title6: string;
    summary1: string;
    summary2: string;
    summary3: string;
    summary4: string;
    summary5: string;
    summary6: string;
    pillsChurches1: string;
    pillsChurches2: string;
    pillsChurches3: string;
    pillsChurches4: string;
    pillsChurches5: string;
    pillsChurches6: string;
    pillsAttendees1: string;
    pillsVolunteers1: string;
    pillsServants1?: string;
    pillsAttendees2: string;
    pillsVolunteers2: string;
    pillsServants2?: string;
    pillsAttendees3: string;
    pillsVolunteers3: string;
    pillsServants3?: string;
    pillsAttendees4: string;
    pillsVolunteers4: string;
    pillsServants4?: string;
    pillsAttendees5: string;
    pillsVolunteers5: string;
    pillsServants5?: string;
    pillsAttendees6: string;
    pillsVolunteers6: string;
    pillsServants6: string;
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

  langName: {
    en: string;
    mn: string;
    ko: string;
  };
};

export const translations: Record<string, Translations> = {
  en: {
    hero: {
      badge: "Since 2016 • 6 times",
      title: "Finger Print",
      subtitle: "Youth Conference",
      description:
        "A conference that supports youth ministries and helps teenagers discover their God-given identity and value in Christ.",
      ctaPrimary: "Watch short film",
      ctaSecondary: "Contact us",
    },

    nav: {
      home: "Home",
      about: "Finger Print",
      attend: "Attend",
      journey: "Our Journey",
      stories: "Stories",
      getInTouch: "Get in touch",
    },

    footer: {
      navigation: "NAVIGATION",
      contact: "CONTACT",
      motto:
        "How precious are Your thoughts concerning me, O God! How vast is the sum of them!",
      rightsText: "All rights reserved • FirstChurch",
    },

    identity: {
      label: "What is Finger Print?",
      main: "Finger Print conference exists to help teenagers understand their value and identity in Christ and to support youth ministries in churches across Mongolia.",
      clarify:
        "How precious are Your thoughts concerning me, O God! How vast is the sum of them! — Psalm 139:17",
    },

    journey: {
      label: "Impact",
      heading: "Impact Timeline",
      theJourney: "",
      since: "Since then",
      subheading:
        "Finger Print conference has supported and strengthened youth ministries in Mongolia since 2016.",
      hoverHint: "Hover over the cards to explore :)",
      mobileHint: "",
      rotating: [
        "Called",
        "Found their value",
        "Feared Him",
        "Made decisions",
        "Found hope",
        "Saved by Christ",
      ],
      edition: "edition",
      title1: "First",
      title2: "Second",
      title3: "Third",
      title4: "Fourth",
      title5: "Fifth",
      title6: "Sixth",

      summary1: `"Finger Print"`,
      summary2: `"Let us live in the light” - John 8:12\n“I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.”`,
      summary3: `"Let us hope in the Lord” - Matthew 19:26\nWith man this is impossible, but with God all things are possible.`,
      summary4: `"Let us walk by faith" - For we walk by faith, not by sight. 2 Corinthians 5:7`,
      summary5: `"CONNECT” - 2 Timothy 2:22\nFlee the evil desires of youth and pursue righteousness, faith, love and peace.`,
      summary6: `"You are worthy” - Isaiah 43:4\nYou are precious in my eyes, honored, and I love you.`,

      pillsChurches1: "Churches: 8+",
      pillsChurches2: "Churches: 14+",
      pillsChurches3: "Churches: 10+",
      pillsChurches4: "Churches: 33",
      pillsChurches5: "Churches: 10+",
      pillsChurches6: "Churches: 10+",

      pillsAttendees1: "Attendees: 200+",
      pillsVolunteers1: "Volunteers: 30+",
      pillsServants1: "Servants: 30+",

      pillsAttendees2: "Attendees: 300+",
      pillsVolunteers2: "Volunteers: 25+",
      pillsServants2: "Servants: 25+",

      pillsAttendees3: "Attendees: 300+",
      pillsVolunteers3: "Volunteers: 30+",
      pillsServants3: "Servants: 30+",

      pillsAttendees4: "Attendees: 160",
      pillsVolunteers4: "Volunteers: 30+",
      pillsServants4: "Servants: 30+",

      pillsAttendees5: "Attendees: 350+",
      pillsVolunteers5: "Volunteers: 35+",
      pillsServants5: "Servants: 35+",

      pillsAttendees6: "Attendees: 280+",
      pillsVolunteers6: "Volunteers: 30+",
      pillsServants6: "Servants: 30+",
    },

    slides: {
      slide1Badge: "2025",
      slide1Title: "Finger Print",
      slide1Desc: "Youth Conference - My Value",

      slide2Badge: "2024",
      slide2Title: "Finger Print",
      slide2Desc: "Youth Conference - Connect",

      slide3Badge: "National Youth Seminar",
      slide3Title: "United Youth Ministry",
      slide3Desc:
        "Finger Print unites churches to guide and support Mongolian teenagers in Christ together.",
    },

    projects: {
      heading: "",
      shortFilm: "Short Film",
      eventDayVideo: "Finger Print 2025",
      open: "Watch",
    },

    gallery: {
      title: "Memories made in the Lord",
    },

    manifesto: {
      label: "Why it matters",
      text1: "Teenage years are when",
      pillIdentity: "identity",
      text2: "is formed and",
      pillWorth: "value",
      text3: "is discovered in",
      pillChrist: "Christ",
      text4: ".",
    },

    countdown: {
      dateLabel: "October 3, 2026",
      title: "Finger Print 2026",
      happeningIn: "Starts in",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },

    attend: {
      heading: "Join the Finger Print conference",
      subtitle: "You can participate in the following ways",

      attendTitle: "Attend the conference",
      attendDescription: "Teenagers can attend individually or with friends.",

      serveTitle: "Serve",
      serveDescription:
        "Join the worship team, welcoming team, or organizing team.",

      supportTitle: "Financial support",
      supportDescription: "You can also support the event financially.",
    },

    langName: {
      en: "English",
      mn: "Монгол",
      ko: "한국어",
    },
  },

  mn: {
    hero: {
      badge: "2016 оноос хойш • 6 удаа",
      title: "Хурууны Хээ",
      subtitle: "Өсвөрийн Конференц",
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
        "Аяа Бурхан, надад хандсан бодлууд тань хичнээн нандин бэ! Нийлбэр нь хичнээн их вэ!",
      rightsText: "All rights reserved • FirstChurch",
    },

    identity: {
      label: "Хурууны хээ гэж юу вэ?",
      main: "Хурууны хээ конференц нь өсвөр үеийг өөрийн үнэ цэнэ болон Эзэний доторх онцгой бүтээл гэдгээ ухаарч, Христ итгэлийн амьдралаар амьдрахад нь өсвөрийн чуулгануудтай хамтран дэмжлэг үзүүлэх зорилготой.",
      clarify:
        "Аяа Бурхан, надад хандсан бодлууд тань хичнээн нандин бэ! Нийлбэр нь хичнээн их вэ! Дуулал 139:17",
    },

    journey: {
      label: "Нөлөө",
      heading: "Нөлөөний цагийн шугам",
      theJourney: "",
      since: "Тэр мөчөөс",
      subheading:
        "Хурууны хээ конференц нь 2016 оноос хойш Монголын өсвөрийн чуулганы үйлчлэлийг сэргээж, дэмжсээр ирсэн.",
      hoverHint: "Картууд дээр хулганаа байрлуулж үзээрэй :)",
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
      title1: "Анхны удаа",
      title2: "2 дахь удаа",
      title3: "3 дахь удаа",
      title4: "4 дэх удаа",
      title5: "5 дахь удаа",
      title6: "6дахь удаа",

      summary1: `"Хурууны хээ"`,
      summary2: `“Гэрэл дотор амьдарцгаая” - Иохан 8:12 “Би бол ертөнцийн гэрэл мөн. Намайг дагадаг хүн харанхуй дотор явахгүй, харин амийн гэрэлтэй болно гэж айлдав”`,
      summary3: `“Эзэнд найдацгаая” - Матай 19:26 Энэ нь хүмүүст боломжгүй, харин Бурханд бүх зүйл боломжтой`,
      summary4: `"Итэлээр алхацгаая" - Учир нь бид үзэгдэх зүйлсээр бус, харин итгэлээр алхдаг 2 Коринт 5:7`,
      summary5: `CONNECT” - 2ТИМОТ 2:22 22 Залуу насны дур хүслүүдээс зугт. Цэвэр зүрхнээс Эзэнийг дуудагчдын хамт зөвт байдал, итгэл, хайр ба амар тайвныг мөшгө.`,
      summary6: `“You are worthy” - Исаиа 43:4 Чи Миний нүдэнд үнэтэй, Хүндтэй, Би чамд хайртай…`,

      pillsAttendees1: "Хамрагдсан хүүхдүүд: 200+",
      pillsVolunteers1: "Үйлчилсэн багш: 30+",
      pillsServants1: "",

      pillsAttendees2: "Хамрагдсан хүүхдүүд: 300+",
      pillsVolunteers2: "Үйлчилсэн багш: 25+",
      pillsServants2: "",

      pillsAttendees3: "Хамрагдсан хүүхдүүд: 300+",
      pillsVolunteers3: "Үйлчилсэн багш: 30+",
      pillsServants3: "",

      pillsAttendees4: "Хамрагдсан хүүхдүүд: 160+",
      pillsVolunteers4: "Үйлчилсэн багш: 30+",
      pillsServants4: "",

      pillsAttendees5: "Хамрагдсан хүүхэд: 350+",
      pillsVolunteers5: "Үйлчилсэн багш: 35+",
      pillsServants5: "",

      pillsAttendees6: "Хамрагдсан хүүхэд: 280+",
      pillsVolunteers6: "Үйлчилсэн багш: 30+",
      pillsServants6: "",

      pillsChurches1: "Оролцогч чуулганууд: 8+",
      pillsChurches2: "Оролцогч чуулганууд: 14+",
      pillsChurches3: "Оролцогч чуулганууд: 10+",
      pillsChurches4: "Оролцогч чуулганууд: 33+",
      pillsChurches5: "Оролцогч чуулганууд: 10+",
      pillsChurches6: "Оролцогч чуулганууд: 10+",
    },

    slides: {
      slide1Badge: "2025 он",
      slide1Title: "Хурууны Хээ",
      slide1Desc: "Өсвөрийн Конференц - Миний үнэ цэнэ",

      slide2Badge: "2024 он",
      slide2Title: "Хурууны Хээ",
      slide2Desc: "Өсвөрийн Конференц - Connect",

      slide3Badge: "Үндэсний өсвөрийн семинар",
      slide3Title: "Хамтын өсвөрийн үйлчлэл",
      slide3Desc:
        '"Finger Print" нь сүмүүдийг Монголын өсвөрүүдийг Христ дотор хамт удирдан, дэмжихэд нэгтгэнэ.',
    },

    projects: {
      heading: "",
      shortFilm: "Богино хэмжээний кино",
      eventDayVideo: "Хурууны хээ 2025",
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
      heading: "Хурууны хээ конференцэд нэгдэх",
      subtitle: "Та дараах байдлаар оролцох боломжтой",

      attendTitle: "Конференцэд оролцох",
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
  },

  ko: {
    hero: {
      badge: "2016년부터 • 6회",
      title: "Finger Print",
      subtitle: "청소년 컨퍼런스",
      description:
        "교회의 청소년 사역을 지원하고, 청소년들이 그리스도 안에서 하나님이 주신 자신의 정체성과 가치를 발견하도록 돕는 컨퍼런스입니다.",
      ctaPrimary: "단편 영화 보기",
      ctaSecondary: "문의하기",
    },

    nav: {
      home: "홈",
      about: "Finger Print",
      attend: "참여하기",
      journey: "우리의 여정",
      stories: "이야기",
      getInTouch: "문의",
    },

    footer: {
      navigation: "메뉴",
      contact: "연락처",
      motto:
        "하나님이여, 주께서 나를 향해 가지신 생각이 어찌 그리 귀하신지요! 그 수가 얼마나 많은지요!",
      rightsText: "All rights reserved • FirstChurch",
    },

    identity: {
      label: "Finger Print란 무엇인가요?",
      main: "Finger Print 컨퍼런스는 청소년들이 그리스도 안에서 자신의 가치와 정체성을 깨닫고 믿음의 삶을 살아가도록 돕기 위해 교회 청소년 사역과 함께 협력하는 사역입니다.",
      clarify:
        "하나님이여, 주께서 나를 향해 가지신 생각이 어찌 그리 귀하신지요! 그 수가 얼마나 많은지요! — 시편 139:17",
    },

    journey: {
      label: "영향",
      heading: "영향의 타임라인",
      theJourney: "",
      since: "그 이후로",
      subheading:
        "Finger Print 컨퍼런스는 2016년부터 몽골의 교회 청소년 사역을 격려하고 지원해 왔습니다.",
      hoverHint: "카드 위에 마우스를 올려보세요 :)",
      mobileHint: "",
      rotating: [
        "부르심을 받음",
        "자신의 가치를 발견함",
        "하나님을 경외함",
        "결단함",
        "소망을 발견함",
        "그리스도로 구원받음",
      ],

      edition: "회",
      title1: "첫 번째",
      title2: "두 번째",
      title3: "세 번째",
      title4: "네 번째",
      title5: "다섯 번째",
      title6: "여섯 번째",

      summary1: `"Finger Print"`,
      summary2: `"빛 가운데 살자” - 요한복음 8:12\n“나는 세상의 빛이다. 나를 따르는 사람은 어둠 속을 걷지 않고 생명의 빛을 얻게 될 것이다.”`,
      summary3: `"주님께 소망을 두자” - 마태복음 19:26\n사람으로서는 할 수 없으나 하나님으로서는 다 하실 수 있느니라.`,
      summary4: `"믿음으로 걷자" - 우리는 보이는 것으로가 아니라 믿음으로 행합니다. 고린도후서 5:7`,
      summary5: `"CONNECT” - 디모데후서 2:22\n젊은 시절의 욕망을 피하고 의와 믿음과 사랑과 화평을 추구하십시오.`,
      summary6: `"You are worthy” - 이사야 43:4\n너는 내 눈에 보배롭고 존귀하며 내가 너를 사랑한다.`,

      pillsAttendees1: "참석자: 200+",
      pillsVolunteers1: "봉사자: 30+",

      pillsAttendees2: "참석자: 300+",
      pillsVolunteers2: "봉사자: 25+",

      pillsAttendees3: "참석자: 300+",
      pillsVolunteers3: "봉사자: 30+",

      pillsAttendees4: "참석자: 160+",
      pillsVolunteers4: "봉사자: 30+",

      pillsAttendees5: "참석자: 350+",
      pillsVolunteers5: "봉사자: 35+",

      pillsAttendees6: "참석자: 280+",
      pillsVolunteers6: "봉사자: 30+",

      pillsChurches1: "참여 교회: 8+",
      pillsChurches2: "참여 교회: 14+",
      pillsChurches3: "참여 교회: 10+",
      pillsChurches4: "참여 교회: 33+",
      pillsChurches5: "참여 교회: 10+",
      pillsChurches6: "참여 교회: 10+",

      pillsServants1: "",
      pillsServants2: "",
      pillsServants3: "",
      pillsServants4: "",
      pillsServants5: "",
      pillsServants6: "",
    },

    slides: {
      slide1Badge: "2025년",
      slide1Title: "Finger Print",
      slide1Desc: "청소년 컨퍼런스 - 나의 가치",

      slide2Badge: "2024년",
      slide2Title: "Finger Print",
      slide2Desc: "청소년 컨퍼런스 - Connect",

      slide3Badge: "전국 청소년 세미나",
      slide3Title: "연합 청소년 사역",
      slide3Desc:
        "Finger Print는 몽골의 교회들이 함께 청소년들을 그리스도 안에서 인도하고 지원하도록 돕습니다.",
    },

    projects: {
      heading: "",
      shortFilm: "단편 영화",
      eventDayVideo: "Finger Print 2025",
      open: "보기",
    },

    gallery: {
      title: "주 안에서 만들어진 추억",
    },

    manifesto: {
      label: "왜 중요한가",
      text1: "청소년 시기는",
      pillIdentity: "정체성",
      text2: "이 형성되고",
      pillWorth: "가치",
      text3: "가 발견되며 믿음이",
      pillChrist: "그리스도",
      text4: "안에서 세워지는 중요한 시기입니다.",
    },

    countdown: {
      dateLabel: "2026년 10월 3일",
      title: "Finger Print 2026",
      happeningIn: "시작까지",
      days: "일",
      hours: "시간",
      minutes: "분",
      seconds: "초",
    },

    attend: {
      heading: "Finger Print 컨퍼런스에 참여하기",
      subtitle: "다음과 같은 방법으로 참여할 수 있습니다",

      attendTitle: "컨퍼런스 참석",
      attendDescription: "청소년은 혼자 또는 친구와 함께 참석할 수 있습니다.",

      serveTitle: "섬기기",
      serveDescription: "찬양팀, 환영팀 또는 행사 준비팀에 참여할 수 있습니다.",

      supportTitle: "재정 후원",
      supportDescription: "행사를 재정적으로 후원할 수도 있습니다.",
    },

    langName: {
      en: "English",
      mn: "Монгол",
      ko: "한국어",
    },
  },
};

function getByPath(obj: unknown, path: string): string | string[] | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" || Array.isArray(current)
    ? current
    : undefined;
}

export function getTranslation(lang: Lang, key: string): string {
  const data = translations[lang] ?? translations.en;
  const value = getByPath(data, key) ?? getByPath(translations.en, key);
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

export function getTranslations(lang: Lang): Translations {
  return (translations[lang] ?? translations.en) as Translations;
}
