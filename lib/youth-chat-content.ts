export type YouthChatVocabulary = {
  term: string;
  meaning?: string;
};

export type YouthChatScene = {
  id: string;
  task: string;
  indonesian: string;
  ttsText: string;
  chinese: string;
  explanation: string;
  vocabulary: YouthChatVocabulary[];
  harvest: string[];
  risk: string;
  learningTip?: string;
};

export const youthChatCategory = {
  slug: 'young-people-chat',
  indonesian: 'Cara Anak Muda Ngobrol',
  title: '年轻人都在怎么聊',
  subtitle: '听懂印尼年轻人的聊天、网络热词、暧昧、互损，以及那些课本很少告诉你的真实表达。',
} as const;

// Human-approved canonical source package. Do not rewrite or infer from W/S/G/T content.
export const youthChatScenes: YouthChatScene[] = [
  {
    "id": "Y01",
    "task": "朋友一喊，直接 Gas!",
    "indonesian": "A: Malam ini nongkrong gak?\nB: Di mana?\nA: PIK aja. Jam 8.\nB: Gas!",
    "ttsText": "Malam ini nongkrong gak?\n Di mana?\n PIK aja. Jam 8.\n Gas!",
    "chinese": "今晚出去坐坐不？/去哪？/就 PIK 吧，8点。/走起！",
    "explanation": "gas = 走起/搞起/冲/就这么定。nongkrong、gak、aja 都是自然口语。",
    "vocabulary": [
      {
        "term": "gas"
      },
      {
        "term": "nongkrong"
      },
      {
        "term": "gak"
      },
      {
        "term": "aja"
      }
    ],
    "harvest": [
      "gas",
      "nongkrong",
      "gak",
      "aja"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y02",
    "task": "今天真的不想动：Mager gue.",
    "indonesian": "A: Nongkrong yuk.\nB: Mager banget gue hari ini.\nA: Lu tiap hari mager. 😂",
    "ttsText": "Nongkrong yuk.\n Mager banget gue hari ini.\n Lu tiap hari mager. 😂",
    "chinese": "出去坐坐吧。/我今天真的懒得动。/你每天都懒得动。😂",
    "explanation": "mager = malas gerak，懒得动/懒得出门。gue/lu 在 Jakarta/Jabodetabek 年轻人口语中很常见。",
    "vocabulary": [
      {
        "term": "mager"
      },
      {
        "term": "gue"
      },
      {
        "term": "lu"
      }
    ],
    "harvest": [
      "mager",
      "gue",
      "lu"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y03",
    "task": "喜欢的人一出现就不会说话：Salting",
    "indonesian": "A: Lu suka sama dia ya?\nB: Nggak lah.\nA: Bohong. Tiap dia datang, lu langsung salting. 😂\nB: Anjir, apaan sih.",
    "ttsText": "Lu suka sama dia ya?\n Nggak lah.\n Bohong. Tiap dia datang, lu langsung salting. 😂\n Anjir, apaan sih.",
    "chinese": "你喜欢他/她吧？/才没有。/骗人，他/她一来你马上就不自然了。😂/靠，什么啦你。",
    "explanation": "salting = salah tingkah，紧张、不自然、手足无措。apaan sih 很像“什么啦你”。anjir 属于较粗感叹。",
    "vocabulary": [
      {
        "term": "salting"
      },
      {
        "term": "bohong"
      },
      {
        "term": "apaan sih"
      },
      {
        "term": "anjir"
      }
    ],
    "harvest": [
      "salting",
      "bohong",
      "apaan sih",
      "anjir"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y04",
    "task": "别太当真：Jangan baper.",
    "indonesian": "A: Eh, gue cuma bercanda. Jangan baper dong.\nB: Siapa yang baper?\nA: Ya lu. 😂",
    "ttsText": "Eh, gue cuma bercanda. Jangan baper dong.\n Siapa yang baper?\n Ya lu. 😂",
    "chinese": "诶，我只是开玩笑。别往心里去嘛。/谁走心了？/就你啊。😂",
    "explanation": "baper = bawa perasaan，走心、当真、往心里去。dong 带劝、催、强调语气。",
    "vocabulary": [
      {
        "term": "baper"
      },
      {
        "term": "cuma bercanda"
      },
      {
        "term": "dong"
      }
    ],
    "harvest": [
      "baper",
      "cuma bercanda",
      "dong"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y05",
    "task": "“你们到底什么关系？”：PDKT",
    "indonesian": "A: Lu sama dia udah jadian?\nB: Belum. Masih PDKT.\nA: Oalah… pantes tiap malam chat terus. 😂",
    "ttsText": "Lu sama dia udah jadian?\n Belum. Masih PDKT.\n Oalah… pantes tiap malam chat terus. 😂",
    "chinese": "你跟他/她已经在一起了？/还没，还在接近了解阶段。/哦……难怪每天晚上一直聊天。😂",
    "explanation": "PDKT = pendekatan，常指正式恋爱前的接近、了解、追求阶段。",
    "vocabulary": [
      {
        "term": "PDKT"
      },
      {
        "term": "jadian"
      },
      {
        "term": "pantes"
      }
    ],
    "harvest": [
      "PDKT",
      "jadian",
      "pantes"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y06",
    "task": "天天聊天，但又不是男女朋友：HTS",
    "indonesian": "A: Jadi kalian pacaran apa nggak sih?\nB: Nggak.\nA: Terus statusnya apa?\nB: HTS kali. 😂",
    "ttsText": "Jadi kalian pacaran apa nggak sih?\n Nggak.\n Terus statusnya apa?\n HTS kali. 😂",
    "chinese": "所以你们到底是不是在谈恋爱？/不是。/那是什么关系？/可能算没名分的关系吧。😂",
    "explanation": "HTS = hubungan tanpa status，没有明确名分/标签的暧昧关系。句尾 kali 在这里有“可能吧/大概吧”的感觉。",
    "vocabulary": [
      {
        "term": "HTS"
      },
      {
        "term": "statusnya apa"
      },
      {
        "term": "kali"
      }
    ],
    "harvest": [
      "HTS",
      "statusnya apa",
      "kali"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y07",
    "task": "半年了还在偷看前任：Gamon",
    "indonesian": "A: Lu masih kepoin mantan?\nB: Cuma lihat doang.\nA: Udah enam bulan, bro. Gamon banget lu. 😂",
    "ttsText": "Lu masih kepoin mantan?\n Cuma lihat doang.\n Udah enam bulan, bro. Gamon banget lu. 😂",
    "chinese": "你还在偷看前任动态？/就看看而已。/都半年了兄弟，你也太走不出来了。😂",
    "explanation": "gamon = gagal move on，还没从上一段关系走出来。",
    "vocabulary": [
      {
        "term": "gamon"
      },
      {
        "term": "kepoin mantan"
      },
      {
        "term": "cuma...doang"
      }
    ],
    "harvest": [
      "gamon",
      "kepoin mantan",
      "cuma...doang"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y08",
    "task": "买了什么好东西？赶紧 spill",
    "indonesian": "A: Sepatunya keren. Spill link-nya dong.\nB: Nanti gue kirim.\nA: Jangan pelit. 😂",
    "ttsText": "Sepatunya keren. Spill link-nya dong.\n Nanti gue kirim.\n Jangan pelit. 😂",
    "chinese": "鞋子不错，链接赶紧发一下。/等下我发你。/别小气。😂",
    "explanation": "spill 在社交媒体和年轻人聊天里常表示分享/透露。",
    "vocabulary": [
      {
        "term": "spill"
      },
      {
        "term": "link-nya"
      },
      {
        "term": "pelit"
      }
    ],
    "harvest": [
      "spill",
      "link-nya",
      "pelit"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y09",
    "task": "“你怎么这么八卦”：Kepo banget",
    "indonesian": "A: Kemarin lu pergi sama siapa?\nB: Temen.\nA: Cewek apa cowok?\nB: Kepo banget sih lu. 😂",
    "ttsText": "Kemarin lu pergi sama siapa?\n Temen.\n Cewek apa cowok?\n Kepo banget sih lu. 😂",
    "chinese": "昨天你跟谁出去了？/朋友。/女的还是男的？/你也太八卦了吧。😂",
    "explanation": "kepo = 好奇、爱打听、八卦。cewek/cowok 是常见的女生/男生口语说法。",
    "vocabulary": [
      {
        "term": "kepo"
      },
      {
        "term": "cewek"
      },
      {
        "term": "cowok"
      },
      {
        "term": "sih"
      }
    ],
    "harvest": [
      "kepo",
      "cewek",
      "cowok",
      "sih"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y10",
    "task": "朋友开始自恋了：Pede banget lu",
    "indonesian": "A: Ganteng banget gue hari ini.\nB: Pede banget lu. 😂\nA: Iri bilang, bos.\nB: Bacot. 😂",
    "ttsText": "Ganteng banget gue hari ini.\n Pede banget lu. 😂\n Iri bilang, bos.\n Bacot. 😂",
    "chinese": "我今天也太帅了。/你是真够自信。😂/嫉妒就直说，老板。/少废话。😂",
    "explanation": "pede = percaya diri，自信。Iri bilang, bos 很像“嫉妒就直说”。bacot 有明显语境风险。",
    "vocabulary": [
      {
        "term": "pede"
      },
      {
        "term": "iri"
      },
      {
        "term": "bacot"
      }
    ],
    "harvest": [
      "pede",
      "iri",
      "bacot"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y11",
    "task": "一句 Bacot lu，为什么有时候会笑、有时候会打起来？",
    "indonesian": "熟人：A: Lu makin gendut ya. / B: Bacot lu. 😂\n冲突：BACOT LU!",
    "ttsText": "Lu makin gendut ya.\nBacot lu. 😂\nBACOT LU!",
    "chinese": "熟人玩笑里可能接近“少废话你😂”；冲突里则可能是明显挑衅性的“闭嘴！”",
    "explanation": "关系、表情、音量和上下文都会改变严重程度。",
    "vocabulary": [
      {
        "term": "makin gendut"
      },
      {
        "term": "bacot"
      }
    ],
    "harvest": [
      "makin gendut",
      "bacot"
    ],
    "risk": "🟡→🔴",
    "learningTip": "先看对方是不是在笑，再判断是不是朋友互损。"
  },
  {
    "id": "Y12",
    "task": "Anjir, serius lu?!",
    "indonesian": "A: Gue bulan depan nikah.\nB: Anjir, serius lu?!\nA: Serius.\nB: Gokil. Akhirnya! 😂",
    "ttsText": "Gue bulan depan nikah.\n Anjir, serius lu?!\n Serius.\n Gokil. Akhirnya! 😂",
    "chinese": "我下个月结婚。/我去，真的假的？！/真的。/牛啊，终于！😂",
    "explanation": "anjir 是较粗、非常非正式的感叹词。gokil 可表达疯了/牛啊/太夸张了。",
    "vocabulary": [
      {
        "term": "anjir"
      },
      {
        "term": "serius lu"
      },
      {
        "term": "gokil"
      },
      {
        "term": "akhirnya"
      }
    ],
    "harvest": [
      "anjir",
      "serius lu",
      "gokil",
      "akhirnya"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y13",
    "task": "看到价格直接一句：Buset, mahal banget",
    "indonesian": "A: Harganya 3 juta.\nB: Buset, mahal banget!\nA: Makanya gue nggak jadi beli.",
    "ttsText": "Harganya 3 juta.\n Buset, mahal banget!\n Makanya gue nggak jadi beli.",
    "chinese": "价格300万盾。/我的天，也太贵了！/所以我没买。",
    "explanation": "buset / buset dah 是强烈感叹，类似“我的天/我去/这么夸张”。",
    "vocabulary": [
      {
        "term": "buset"
      },
      {
        "term": "mahal banget"
      },
      {
        "term": "nggak jadi beli"
      }
    ],
    "harvest": [
      "buset",
      "mahal banget",
      "nggak jadi beli"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y14",
    "task": "一个视频把朋友笑疯了：WKWKWK",
    "indonesian": "A: Anjir, liat ini deh. 😂\nB: WKWKWKWK ngakak gue.\nA: Kocak banget orangnya.",
    "ttsText": "Anjir, liat ini deh. 😂\n WKWKWKWK ngakak gue.\n Kocak banget orangnya.",
    "chinese": "我去，看这个。😂/哈哈哈哈笑死我了。/这个人太搞笑了。",
    "explanation": "wkwk 是印尼网络常见笑声写法；ngakak = 大笑；kocak = 搞笑；liat 是 lihat 的口语写法。",
    "vocabulary": [
      {
        "term": "wkwk"
      },
      {
        "term": "ngakak"
      },
      {
        "term": "kocak"
      },
      {
        "term": "liat"
      }
    ],
    "harvest": [
      "wkwk",
      "ngakak",
      "kocak",
      "liat"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y15",
    "task": "“别装懂”：Sok tahu",
    "indonesian": "A: Gue tau kok, pasti gara-gara ini.\nB: Lu jangan sok tahu deh.\nA: Lah, emang bener.",
    "ttsText": "Gue tau kok, pasti gara-gara ini.\n Lu jangan sok tahu deh.\n Lah, emang bener.",
    "chinese": "我知道啊，肯定就是因为这个。/你别装得什么都懂。/诶，本来就是啊。",
    "explanation": "sok 常表示“装成/自以为”：sok tahu、sok keren、sok sibuk、sok akrab。",
    "vocabulary": [
      {
        "term": "sok tahu"
      },
      {
        "term": "gara-gara"
      },
      {
        "term": "emang"
      }
    ],
    "harvest": [
      "sok tahu",
      "gara-gara",
      "emang"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y16",
    "task": "Receh banget 不是说“零钱很多”",
    "indonesian": "A: Hahaha, lucu kan?\nB: Receh banget jokes lu.\nA: Tapi lu ketawa. 😂",
    "ttsText": "Hahaha, lucu kan?\n Receh banget jokes lu.\n Tapi lu ketawa. 😂",
    "chinese": "哈哈，好笑吧？/你的梗也太烂太低级了。/但你还是笑了。😂",
    "explanation": "jokes receh 常指简单、土、冷、低门槛却可能很好笑的梗。",
    "vocabulary": [
      {
        "term": "receh"
      },
      {
        "term": "jokes"
      },
      {
        "term": "ketawa"
      }
    ],
    "harvest": [
      "receh",
      "jokes",
      "ketawa"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y17",
    "task": "朋友说 Santuy，不是拼错了",
    "indonesian": "A: Bro, kita telat nih!\nB: Santuy aja. Masih sempat.\nA: Santuy apaan, buruan! 😂",
    "ttsText": "Bro, kita telat nih!\n Santuy aja. Masih sempat.\n Santuy apaan, buruan! 😂",
    "chinese": "兄弟，我们迟到了！/淡定，还来得及。/淡定什么啊，快点！😂",
    "explanation": "santuy 是 santai 的玩味/网络化说法，表示淡定、放松。",
    "vocabulary": [
      {
        "term": "santuy"
      },
      {
        "term": "nih"
      },
      {
        "term": "buruan"
      }
    ],
    "harvest": [
      "santuy",
      "nih",
      "buruan"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y18",
    "task": "Auto panik gue",
    "indonesian": "A: HP gue mana?!\nB: Tadi lu taruh di meja.\nA: Nggak ada. Auto panik gue.\nB: Cek tas dulu, woy. 😂",
    "ttsText": "HP gue mana?!\n Tadi lu taruh di meja.\n Nggak ada. Auto panik gue.\n Cek tas dulu, woy. 😂",
    "chinese": "我手机呢？！/你刚才放桌上了。/没有，我直接慌了。/先看看包里，喂。😂",
    "explanation": "auto + X 常表示直接就……/马上进入某状态。woy 很口语。",
    "vocabulary": [
      {
        "term": "auto panik"
      },
      {
        "term": "taruh"
      },
      {
        "term": "cek"
      },
      {
        "term": "woy"
      }
    ],
    "harvest": [
      "auto panik",
      "taruh",
      "cek",
      "woy"
    ],
    "risk": "🟢；woy 🟡"
  },
  {
    "id": "Y19",
    "task": "Gila, keren banget",
    "indonesian": "A: Gimana motor baru gue?\nB: Gila, keren banget!\nA: Mantap kan?\nB: Berapa harganya?",
    "ttsText": "Gimana motor baru gue?\n Gila, keren banget!\n Mantap kan?\n Berapa harganya?",
    "chinese": "我新摩托怎么样？/我去，太帅了！/不错吧？/多少钱？",
    "explanation": "gila 字面是疯，但作感叹时可以是“我去/太牛了”；Lu gila! 在冲突中则可能是“你疯了”。",
    "vocabulary": [
      {
        "term": "gila"
      },
      {
        "term": "keren banget"
      },
      {
        "term": "mantap"
      }
    ],
    "harvest": [
      "gila",
      "keren banget",
      "mantap"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y20",
    "task": "朋友说 Anjing lu 😂，为什么还在笑？",
    "indonesian": "A: Gue tadi ketemu mantan lu.\nB: Hah? Di mana?\nA: Sama cowok baru. 😂\nB: Anjing lu. Ngapain kasih tau gue. 😂",
    "ttsText": "Gue tadi ketemu mantan lu.\n Hah? Di mana?\n Sama cowok baru. 😂\n Anjing lu. Ngapain kasih tau gue. 😂",
    "chinese": "我刚碰到你前任了。/啊？在哪？/跟新男朋友一起。😂/靠你啊，干嘛告诉我。😂",
    "explanation": "anjing 字面是狗，作为粗口可以很强。极熟朋友之间有时会用作粗俗互损/感叹，但冲突中的 ANJING LU! 可能是严重辱骂。",
    "vocabulary": [
      {
        "term": "anjing"
      },
      {
        "term": "mantan"
      },
      {
        "term": "ngapain"
      },
      {
        "term": "kasih tau"
      }
    ],
    "harvest": [
      "anjing",
      "mantan",
      "ngapain",
      "kasih tau"
    ],
    "risk": "🔴",
    "learningTip": "判断谁对谁说、关系、是否在笑、前后是否已有冲突。"
  },
  {
    "id": "Y21",
    "task": "已读不回：Dibaca doang",
    "indonesian": "A: Dia bales chat lu gak?\nB: Nggak. Dibaca doang.\nA: Waduh…\nB: Sakitnya tuh di sini. 😂",
    "ttsText": "Dia bales chat lu gak?\n Nggak. Dibaca doang.\n Waduh…\n Sakitnya tuh di sini. 😂",
    "chinese": "她回你消息了吗？/没有，就看了，没回。/惨了……/扎心了。😂",
    "explanation": "dibaca doang 字面是“只是被读了”，聊天里的真实感觉就是“已读不回”。doang = 只是、就。",
    "vocabulary": [
      {
        "term": "bales"
      },
      {
        "term": "dibaca doang"
      },
      {
        "term": "waduh"
      },
      {
        "term": "doang"
      }
    ],
    "harvest": [
      "bales",
      "dibaca doang",
      "waduh",
      "doang"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y22",
    "task": "突然人间蒸发：Ghosting",
    "indonesian": "A: Kemarin masih chat tiap hari, kan?\nB: Iya. Sekarang hilang.\nA: Di-ghosting?\nB: Kayaknya. Chat gue gak dibales.",
    "ttsText": "Kemarin masih chat tiap hari, kan?\n Iya. Sekarang hilang.\n Di-ghosting?\n Kayaknya. Chat gue gak dibales.",
    "chinese": "你们之前不是每天都聊吗？/对啊，现在人没了。/被直接消失了？/估计是，消息也不回。",
    "explanation": "di-ghosting = 被 ghost / 对方突然断联，通常没有正式解释或明确结束。",
    "vocabulary": [
      {
        "term": "hilang"
      },
      {
        "term": "di-ghosting"
      },
      {
        "term": "gak dibales"
      },
      {
        "term": "kayaknya"
      }
    ],
    "harvest": [
      "hilang",
      "di-ghosting",
      "gak dibales",
      "kayaknya"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y23",
    "task": "又放我鸽子：PHP lagi lu",
    "indonesian": "A: Bro, jadi datang gak?\nB: Kayaknya gak jadi deh.\nA: Anjir, PHP lagi lu.\nB: Sorry, mendadak ada urusan.",
    "ttsText": "Bro, jadi datang gak?\n Kayaknya gak jadi deh.\n Anjir, PHP lagi lu.\n Sorry, mendadak ada urusan.",
    "chinese": "兄弟，你到底来不来？/好像去不了了。/靠，又放我鸽子。/抱歉，突然有事。",
    "explanation": "PHP = pemberi harapan palsu。恋爱里可指给希望又没结果；朋友约局时也可能调侃说好又不来。",
    "vocabulary": [
      {
        "term": "gak jadi"
      },
      {
        "term": "PHP"
      },
      {
        "term": "mendadak"
      },
      {
        "term": "ada urusan"
      }
    ],
    "harvest": [
      "gak jadi",
      "PHP",
      "mendadak",
      "ada urusan"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y24",
    "task": "人呢？全世界都在等你：OTW",
    "indonesian": "A: Lu di mana?\nB: OTW.\nA: OTW dari tadi. 😂\nB: Beneran, lima menit lagi.",
    "ttsText": "Lu di mana?\n OTW.\n OTW dari tadi. 😂\n Beneran, lima menit lagi.",
    "chinese": "你在哪？/路上了。/你半天前就“路上了”。😂/真的，五分钟到。",
    "explanation": "OTW = on the way，但现实里有时真在路上，有时可能刚准备出门。OTW dari tadi 很像“你都OTW半天了”。",
    "vocabulary": [
      {
        "term": "OTW"
      },
      {
        "term": "dari tadi"
      },
      {
        "term": "beneran"
      },
      {
        "term": "lima menit lagi"
      }
    ],
    "harvest": [
      "OTW",
      "dari tadi",
      "beneran",
      "lima menit lagi"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y25",
    "task": "今晚喝一杯？Gas gak?",
    "indonesian": "A: Malam ini minum, gas gak?\nB: Siapa aja?\nA: Anak-anak biasa.\nB: Gas lah.",
    "ttsText": "Malam ini minum, gas gak?\n Siapa aja?\n Anak-anak biasa.\n Gas lah.",
    "chinese": "今晚喝点，走不走？/都有谁？/还是平时那帮人。/走啊。",
    "explanation": "Gas gak? = 搞不搞/去不去；Gas lah = 走啊。anak-anak biasa 在这里是“平时那帮人”。",
    "vocabulary": [
      {
        "term": "gas gak"
      },
      {
        "term": "siapa aja"
      },
      {
        "term": "anak-anak biasa"
      },
      {
        "term": "gas lah"
      }
    ],
    "harvest": [
      "gas gak",
      "siapa aja",
      "anak-anak biasa",
      "gas lah"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y26",
    "task": "大家都去了，我也想去：FOMO",
    "indonesian": "A: Kok lu tiba-tiba mau ikut?\nB: Semua orang pergi. FOMO gue. 😂\nA: Dasar lu.",
    "ttsText": "Kok lu tiba-tiba mau ikut?\n Semua orang pergi. FOMO gue. 😂\n Dasar lu.",
    "chinese": "你怎么突然也想去了？/所有人都去了，搞得我也怕错过。😂/你真的是。",
    "explanation": "FOMO = fear of missing out。FOMO gue 很像“看大家都去了，我也坐不住了”。",
    "vocabulary": [
      {
        "term": "tiba-tiba"
      },
      {
        "term": "ikut"
      },
      {
        "term": "FOMO"
      },
      {
        "term": "dasar lu"
      }
    ],
    "harvest": [
      "tiba-tiba",
      "ikut",
      "FOMO",
      "dasar lu"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y27",
    "task": "买个新东西就一直晒：Flexing",
    "indonesian": "A: Story lu jam baru terus.\nB: Bagus kan? 😂\nA: Flexing mulu lu.\nB: Biar pada iri.",
    "ttsText": "Story lu jam baru terus.\n Bagus kan? 😂\n Flexing mulu lu.\n Biar pada iri.",
    "chinese": "你 Story 怎么全是新表。/好看吧？😂/你就一直炫吧。/让他们羡慕一下。",
    "explanation": "flexing = 炫耀、秀。mulu = 老是、一直。",
    "vocabulary": [
      {
        "term": "flexing"
      },
      {
        "term": "mulu"
      },
      {
        "term": "biar"
      },
      {
        "term": "pada iri"
      }
    ],
    "harvest": [
      "flexing",
      "mulu",
      "biar",
      "pada iri"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y28",
    "task": "TikTok评论区：Relate banget",
    "indonesian": "A: WKWKWK relate banget sama hidup gue.\nB: Gajian masih lama? 😂\nA: Jangan ditanya.",
    "ttsText": "WKWKWK relate banget sama hidup gue.\n Gajian masih lama? 😂\n Jangan ditanya.",
    "chinese": "哈哈哈哈，这简直就是我的人生。/离发工资还早？😂/别问了。",
    "explanation": "Relate banget = 太真实了/这不就是我吗/太有共鸣了。",
    "vocabulary": [
      {
        "term": "relate banget"
      },
      {
        "term": "hidup gue"
      },
      {
        "term": "gajian"
      },
      {
        "term": "jangan ditanya"
      }
    ],
    "harvest": [
      "relate banget",
      "hidup gue",
      "gajian",
      "jangan ditanya"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y29",
    "task": "同事开始八卦：Ada gosip nih",
    "indonesian": "A: Eh, ada gosip nih.\nB: Apaan?\nA: Katanya Rina lagi deket sama anak finance.\nB: Hah? Serius?",
    "ttsText": "Eh, ada gosip nih.\n Apaan?\n Katanya Rina lagi deket sama anak finance.\n Hah? Serius?",
    "chinese": "诶，有瓜。/啥？/听说 Rina 最近跟财务那边一个人走得挺近。/啊？真的假的？",
    "explanation": "Ada gosip nih 很像“有瓜”。katanya = 听说/据说，不代表信息一定真实。",
    "vocabulary": [
      {
        "term": "ada gosip nih"
      },
      {
        "term": "katanya"
      },
      {
        "term": "lagi deket"
      },
      {
        "term": "anak finance"
      }
    ],
    "harvest": [
      "ada gosip nih",
      "katanya",
      "lagi deket",
      "anak finance"
    ],
    "risk": "🟢，办公室八卦注意边界。"
  },
  {
    "id": "Y30",
    "task": "上班人在，魂不在：Gabut",
    "indonesian": "A: Lu ngapain dari tadi?\nB: Gabut. Gak ada kerjaan.\nA: Pantes scroll TikTok mulu.",
    "ttsText": "Lu ngapain dari tadi?\n Gabut. Gak ada kerjaan.\n Pantes scroll TikTok mulu.",
    "chinese": "你半天在干嘛？/闲得没事干，没活。/难怪一直刷 TikTok。",
    "explanation": "gabut 常表示闲得无聊/没事干。Lagi gabut nih = 闲着呢。",
    "vocabulary": [
      {
        "term": "gabut"
      },
      {
        "term": "gak ada kerjaan"
      },
      {
        "term": "scroll"
      },
      {
        "term": "pantes"
      }
    ],
    "harvest": [
      "gabut",
      "gak ada kerjaan",
      "scroll",
      "pantes"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y31",
    "task": "私下吐槽老板：Ribet banget",
    "indonesian": "A: Bos lu gimana?\nB: Baik sih, cuma ribet banget kalau soal laporan.\nA: Detail banget?\nB: Parah.",
    "ttsText": "Bos lu gimana?\n Baik sih, cuma ribet banget kalau soal laporan.\n Detail banget?\n Parah.",
    "chinese": "你老板怎么样？/人倒还行，就是报告这块特别麻烦/要求特别多。/特别抠细节？/严重得很。",
    "explanation": "ribet 可表示麻烦、复杂、事多、折腾。Parah 在年轻人口语里也常单独表示“太夸张了/严重”。",
    "vocabulary": [
      {
        "term": "ribet"
      },
      {
        "term": "cuma"
      },
      {
        "term": "kalau soal"
      },
      {
        "term": "parah"
      }
    ],
    "harvest": [
      "ribet",
      "cuma",
      "kalau soal",
      "parah"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y32",
    "task": "同事偷偷摸鱼：Curi-curi waktu",
    "indonesian": "A: Kok lu nonton YouTube?\nB: Curi-curi waktu bentar. 😂\nA: Awas bos lewat.\nB: Santai.",
    "ttsText": "Kok lu nonton YouTube?\n Curi-curi waktu bentar. 😂\n Awas bos lewat.\n Santai.",
    "chinese": "你怎么在看 YouTube？/偷偷摸会儿鱼。😂/小心老板经过。/淡定。",
    "explanation": "curi-curi waktu 字面像“偷偷偷一点时间”，实际就是趁空偷会儿闲。不为了制造俚语而硬造俚语。",
    "vocabulary": [
      {
        "term": "curi-curi waktu"
      },
      {
        "term": "bentar"
      },
      {
        "term": "awas"
      },
      {
        "term": "lewat"
      }
    ],
    "harvest": [
      "curi-curi waktu",
      "bentar",
      "awas",
      "lewat"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y33",
    "task": "“你是不是吃醋了？”：Cemburu ya?",
    "indonesian": "A: Kok diem?\nB: Nggak apa-apa.\nA: Cemburu ya? 😂\nB: Geer banget lu.",
    "ttsText": "Kok diem?\n Nggak apa-apa.\n Cemburu ya? 😂\n Geer banget lu.",
    "chinese": "怎么不说话了？/没事。/吃醋了？😂/你也太自作多情了。",
    "explanation": "geer / GR 来自 gede rasa，常表示自作多情、想太多，以为别人对你有意思。",
    "vocabulary": [
      {
        "term": "diem"
      },
      {
        "term": "cemburu"
      },
      {
        "term": "geer/GR"
      },
      {
        "term": "nggak apa-apa"
      }
    ],
    "harvest": [
      "diem",
      "cemburu",
      "geer/GR",
      "nggak apa-apa"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y34",
    "task": "试探一句：Kangen gue gak?",
    "indonesian": "A: Kangen gue gak?\nB: Geer. 😂\nA: Jawab aja susah banget.\nB: Dikit.",
    "ttsText": "Kangen gue gak?\n Geer. 😂\n Jawab aja susah banget.\n Dikit.",
    "chinese": "想我没？/少自作多情。😂/回答一下有这么难吗？/一点点。",
    "explanation": "kangen = 想念。Kangen kamu = 想你了；Kangen rumah = 想家；Kangen gue gak? = 想我没？",
    "vocabulary": [
      {
        "term": "kangen"
      },
      {
        "term": "jawab aja"
      },
      {
        "term": "dikit"
      },
      {
        "term": "geer"
      }
    ],
    "harvest": [
      "kangen",
      "jawab aja",
      "dikit",
      "geer"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y35",
    "task": "“所以你到底喜不喜欢我？”",
    "indonesian": "A: Gue mau nanya serius.\nB: Apa?\nA: Lu sebenernya suka sama gue gak sih?\nB: Kok tiba-tiba nanya gitu?",
    "ttsText": "Gue mau nanya serius.\n Apa?\n Lu sebenernya suka sama gue gak sih?\n Kok tiba-tiba nanya gitu?",
    "chinese": "我认真问你一个问题。/什么？/你到底喜不喜欢我？/怎么突然问这个？",
    "explanation": "真实熟人聊天可说 Lu sebenernya suka sama gue gak sih?；sebenernya = 到底/其实；gak sih = 到底……吗。",
    "vocabulary": [
      {
        "term": "sebenernya"
      },
      {
        "term": "suka sama"
      },
      {
        "term": "gak sih"
      },
      {
        "term": "gitu"
      }
    ],
    "harvest": [
      "sebenernya",
      "suka sama",
      "gak sih",
      "gitu"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y36",
    "task": "被拒绝以后：Kita temenan aja ya",
    "indonesian": "A: Gue suka sama lu.\nB: Maaf ya… Kita temenan aja ya.\nA: Oh… iya, gapapa.",
    "ttsText": "Gue suka sama lu.\n Maaf ya… Kita temenan aja ya.\n Oh… iya, gapapa.",
    "chinese": "我喜欢你。/对不起……我们还是做朋友吧。/哦……好，没事。",
    "explanation": "告白场景里的 temenan aja = 拒绝；gapapa 是 nggak apa-apa 的聊天式写法。",
    "vocabulary": [
      {
        "term": "temenan aja"
      },
      {
        "term": "maaf ya"
      },
      {
        "term": "gapapa"
      },
      {
        "term": "suka sama"
      }
    ],
    "harvest": [
      "temenan aja",
      "maaf ya",
      "gapapa",
      "suka sama"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y37",
    "task": "分手时一句：Udahan aja",
    "indonesian": "A: Kita tiap hari berantem terus.\nB: Terus maunya apa?\nA: Udahan aja.\nB: Lu serius?",
    "ttsText": "Kita tiap hari berantem terus.\n Terus maunya apa?\n Udahan aja.\n Lu serius?",
    "chinese": "我们天天都在吵。/那你想怎样？/算了，到此为止吧。/你认真的？",
    "explanation": "情侣关系里 Udahan aja 可能就是“分手吧”；朋友打闹时 Udahan dong 又可能只是“行了别闹了”。",
    "vocabulary": [
      {
        "term": "berantem"
      },
      {
        "term": "maunya apa"
      },
      {
        "term": "udahan aja"
      },
      {
        "term": "serius"
      }
    ],
    "harvest": [
      "berantem",
      "maunya apa",
      "udahan aja",
      "serius"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y38",
    "task": "前任半夜突然发：Udah tidur?",
    "indonesian": "Ex: Udah tidur?\nA: Belum. Kenapa?\nEx: Gapapa. Cuma pengen ngobrol.\nA: Tumben.",
    "ttsText": "Udah tidur?\n Belum. Kenapa?\n Gapapa. Cuma pengen ngobrol.\n Tumben.",
    "chinese": "睡了吗？/还没，怎么了？/没事，就是想聊聊。/稀奇啊。",
    "explanation": "Tumben 在现实口语里很像“哟，今天怎么了？/稀奇啊”。Tumben chat = 今天怎么突然找我了？",
    "vocabulary": [
      {
        "term": "udah tidur"
      },
      {
        "term": "pengen"
      },
      {
        "term": "ngobrol"
      },
      {
        "term": "tumben"
      }
    ],
    "harvest": [
      "udah tidur",
      "pengen",
      "ngobrol",
      "tumben"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y39",
    "task": "深夜聊天：Belum ngantuk",
    "indonesian": "A: Kok belum tidur?\nB: Belum ngantuk. Lu?\nA: Sama.\nB: Yaudah, temenin gue ngobrol. 😂",
    "ttsText": "Kok belum tidur?\n Belum ngantuk. Lu?\n Sama.\n Yaudah, temenin gue ngobrol. 😂",
    "chinese": "怎么还没睡？/还不困，你呢？/我也一样。/那陪我聊会儿。😂",
    "explanation": "ngantuk = 困。temenin gue = 陪我一下。",
    "vocabulary": [
      {
        "term": "ngantuk"
      },
      {
        "term": "sama"
      },
      {
        "term": "yaudah"
      },
      {
        "term": "temenin gue"
      }
    ],
    "harvest": [
      "ngantuk",
      "sama",
      "yaudah",
      "temenin gue"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y40",
    "task": "一句 Terserah，可能开始危险了",
    "indonesian": "场景一：\nA: Mau makan apa?\nB: Terserah. Gue ikut aja.\n场景二（刚吵完）：\nA: Jadi lu maunya gimana?\nB: Terserah.",
    "ttsText": "Mau makan apa?\n Terserah. Gue ikut aja.\n Jadi lu maunya gimana?\n Terserah.",
    "chinese": "场景一“都行，我跟你”；场景二“随你”。",
    "explanation": "同一个 terserah 可以轻松表示“都行”，也可以冷冷表示“随便你”。必须听语气。",
    "vocabulary": [
      {
        "term": "terserah"
      },
      {
        "term": "gue ikut aja"
      },
      {
        "term": "maunya gimana"
      }
    ],
    "harvest": [
      "terserah",
      "gue ikut aja",
      "maunya gimana"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y41",
    "task": "阴阳一句：Iya, paling bener lu",
    "indonesian": "A: Kan gue udah bilang dari awal.\nB: Iya, iya. Paling bener lu.\nA: Kok jadi nyindir?\nB: Siapa yang nyindir?",
    "ttsText": "Kan gue udah bilang dari awal.\n Iya, iya. Paling bener lu.\n Kok jadi nyindir?\n Siapa yang nyindir?",
    "chinese": "我一开始就说了吧。/对对对，就你最对。/怎么开始阴阳我了？/谁阴阳你了？",
    "explanation": "paling bener lu 字面是“你最对”，结合语气可变成反讽。nyindir = 讽刺、暗讽。",
    "vocabulary": [
      {
        "term": "paling bener lu"
      },
      {
        "term": "nyindir"
      },
      {
        "term": "dari awal"
      },
      {
        "term": "kan"
      }
    ],
    "harvest": [
      "paling bener lu",
      "nyindir",
      "dari awal",
      "kan"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y42",
    "task": "朋友吹牛：Halu lu",
    "indonesian": "A: Kayaknya dia suka sama gue.\nB: Halu lu. 😂\nA: Serius, tadi dia liatin gue.\nB: Semua orang juga dia liatin.",
    "ttsText": "Kayaknya dia suka sama gue.\n Halu lu. 😂\n Serius, tadi dia liatin gue.\n Semua orang juga dia liatin.",
    "chinese": "我觉得她可能喜欢我。/你做梦呢。😂/真的，她刚才一直看我。/她谁都看好吗。",
    "explanation": "halu 来自 halusinasi，年轻人口语里常用来调侃想太多/做梦/自己脑补。",
    "vocabulary": [
      {
        "term": "halu"
      },
      {
        "term": "kayaknya"
      },
      {
        "term": "liatin"
      },
      {
        "term": "semua orang"
      }
    ],
    "harvest": [
      "halu",
      "kayaknya",
      "liatin",
      "semua orang"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y43",
    "task": "Lebay banget sih",
    "indonesian": "A: Sakit banget, gue kayak mau mati.\nB: Lebay banget sih lu.\nA: Sakit beneran!",
    "ttsText": "Sakit banget, gue kayak mau mati.\n Lebay banget sih lu.\n Sakit beneran!",
    "chinese": "痛死了，我感觉我要没了。/你也太夸张了吧。/真的疼！",
    "explanation": "lebay = 夸张、戏太多、反应过头。别人真的很难受时乱说也可能不尊重。",
    "vocabulary": [
      {
        "term": "lebay"
      },
      {
        "term": "kayak"
      },
      {
        "term": "beneran"
      }
    ],
    "harvest": [
      "lebay",
      "kayak",
      "beneran"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y44",
    "task": "评论别人：Julid banget",
    "indonesian": "A: Kok dia pakai baju kayak gitu sih?\nB: Lu julid banget deh.\nA: Gue cuma ngomong.",
    "ttsText": "Kok dia pakai baju kayak gitu sih?\n Lu julid banget deh.\n Gue cuma ngomong.",
    "chinese": "她怎么穿成那样啊？/你也太爱说人家了。/我就说说。",
    "explanation": "julid 常用于酸别人、挑别人、刻薄评论别人。kepo 更偏想知道；julid 更偏知道后还要酸几句。",
    "vocabulary": [
      {
        "term": "julid"
      },
      {
        "term": "kepo"
      },
      {
        "term": "gue cuma ngomong"
      }
    ],
    "harvest": [
      "julid",
      "kepo",
      "gue cuma ngomong"
    ],
    "risk": "🟡"
  },
  {
    "id": "Y45",
    "task": "“别装了”：Sok cool",
    "indonesian": "A: Tuh, dia datang.\nB: Biasa aja kali.\nA: Sok cool banget lu. 😂\nB: Apaan sih.",
    "ttsText": "Tuh, dia datang.\n Biasa aja kali.\n Sok cool banget lu. 😂\n Apaan sih.",
    "chinese": "看，她来了。/就正常啊。/你可真能装高冷。😂/什么啦你。",
    "explanation": "sok + 状态常有“故意装成……”的感觉。sok cool = 装酷/装淡定/装高冷。",
    "vocabulary": [
      {
        "term": "tuh"
      },
      {
        "term": "biasa aja"
      },
      {
        "term": "sok cool"
      },
      {
        "term": "apaan sih"
      }
    ],
    "harvest": [
      "tuh",
      "biasa aja",
      "sok cool",
      "apaan sih"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y46",
    "task": "Red flag banget",
    "indonesian": "A: Baru kenal seminggu, HP gue udah mau dicek.\nB: Red flag banget itu.\nA: Iya juga ya.",
    "ttsText": "Baru kenal seminggu, HP gue udah mau dicek.\n Red flag banget itu.\n Iya juga ya.",
    "chinese": "才认识一个星期，就已经想查我手机。/这真的很危险信号了。/好像也是。",
    "explanation": "red flag 指值得警惕的问题/危险信号；green flag 则常表示健康、靠谱的表现。网络判断可能带主观性。",
    "vocabulary": [
      {
        "term": "baru kenal"
      },
      {
        "term": "udah mau dicek"
      },
      {
        "term": "red flag"
      },
      {
        "term": "iya juga ya"
      }
    ],
    "harvest": [
      "baru kenal",
      "udah mau dicek",
      "red flag",
      "iya juga ya"
    ],
    "risk": "🟢"
  },
  {
    "id": "Y47",
    "task": "真吵起来了：Lu maunya apa sih?",
    "indonesian": "A: Dari tadi lu nyalahin gue terus.\nB: Karena emang salah lu!\nA: Lu maunya apa sih?!\nB: Gue cuma mau lu jujur!",
    "ttsText": "Dari tadi lu nyalahin gue terus.\n Karena emang salah lu!\n Lu maunya apa sih?!\n Gue cuma mau lu jujur!",
    "chinese": "你从刚才开始就一直怪我。/因为本来就是你的错！/你到底想怎样？！/我只是要你说实话！",
    "explanation": "这里 sih 配上音量和冲突强化“到底”的感觉，说明气氛已经升级。",
    "vocabulary": [
      {
        "term": "nyalahin"
      },
      {
        "term": "emang salah lu"
      },
      {
        "term": "maunya apa sih"
      },
      {
        "term": "jujur"
      }
    ],
    "harvest": [
      "nyalahin",
      "emang salah lu",
      "maunya apa sih",
      "jujur"
    ],
    "risk": "🟡，以识别为主。"
  },
  {
    "id": "Y48",
    "task": "一句 Goblok，已经不是普通玩笑词",
    "indonesian": "朋友游戏输了：\nA: Salah pencet, bro. 😂\nB: Goblok lu. 😂\n争执中：GOBLOK!",
    "ttsText": "Salah pencet, bro. 😂\nGoblok lu. 😂\nGOBLOK!",
    "chinese": "熟人互损可能接近“你个傻子😂”；争执中可能是明确侮辱“蠢货！”",
    "explanation": "goblok 是明显贬损词。朋友之间能说，不代表学习者也能随便加入。",
    "vocabulary": [
      {
        "term": "goblok"
      },
      {
        "term": "salah pencet"
      },
      {
        "term": "bro"
      }
    ],
    "harvest": [
      "goblok",
      "salah pencet",
      "bro"
    ],
    "risk": "🔴",
    "learningTip": "别人之间能说，不代表你跟他也能说。"
  },
  {
    "id": "Y49",
    "task": "Bangsat：为什么有时朋友笑着说？",
    "indonesian": "A: Kunci motor lu gue sembunyiin. 😂\nB: Bangsat lu! Gue cari dari tadi! 😂",
    "ttsText": "Kunci motor lu gue sembunyiin. 😂\n Bangsat lu! Gue cari dari tadi! 😂",
    "chinese": "你摩托钥匙被我藏起来了。😂/你这混蛋！我找半天了！😂",
    "explanation": "熟人笑着说时可能是带粗口的互损；愤怒或陌生人冲突中则是明显辱骂。",
    "vocabulary": [
      {
        "term": "bangsat"
      },
      {
        "term": "sembunyiin"
      },
      {
        "term": "cari dari tadi"
      }
    ],
    "harvest": [
      "bangsat",
      "sembunyiin",
      "cari dari tadi"
    ],
    "risk": "🔴，识别型词汇，不建议主动模仿。"
  },
  {
    "id": "Y50",
    "task": "真正危险的粗口：听懂，不代表要学着说",
    "indonesian": "可能遇到：anjing / bangsat / goblok / kontol / ngentot\n\n朋友打游戏：\nA: Mati lagi gue!\nB: WKWKWK cupu.\nA: Anjing lu. 😂\n\n陌生人冲突：\nANJING LU!",
    "ttsText": "anjing\nbangsat\ngoblok\nkontol\nngentot\n\nMati lagi gue!\nWKWKWK cupu.\nAnjing lu. 😂\n\nANJING LU!",
    "chinese": "第一种可能只是粗俗的熟人互损；第二种可能已经是明确辱骂和冲突升级。",
    "explanation": "这一课的目标不是让用户学五个脏话，而是建立“听到粗口后判断现场发生了什么”的能力。\nkontol 属于非常粗俗的性器官粗口；ngentot 属于非常粗俗的性行为相关粗口。可能出现在网络、游戏、争吵或极熟朋友的粗俗玩笑里，但都不是尼会说鼓励学习者练习的表达。\n判断至少看：谁在说、对谁说、怎么说、前后发生了什么。",
    "vocabulary": [
      {
        "term": "anjing",
        "meaning": "可作强烈粗口，语境跨度较大"
      },
      {
        "term": "bangsat",
        "meaning": "明显辱骂性粗口"
      },
      {
        "term": "goblok",
        "meaning": "蠢货、很蠢，贬损明显"
      },
      {
        "term": "kontol",
        "meaning": "非常粗俗的性器官粗口"
      },
      {
        "term": "ngentot",
        "meaning": "非常粗俗的性相关粗口"
      }
    ],
    "harvest": [
      "anjing（可作强烈粗口，语境跨度较大）",
      "bangsat（明显辱骂性粗口）",
      "goblok（蠢货、很蠢，贬损明显）",
      "kontol（非常粗俗的性器官粗口）",
      "ngentot（非常粗俗的性相关粗口）"
    ],
    "risk": "🔴 全部以识别和理解为教学目标。",
    "learningTip": "听得懂，不等于你应该学着说。"
  }
];
