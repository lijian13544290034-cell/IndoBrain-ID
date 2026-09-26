export type NewMicroSceneAsset = {
  id: string;
  assetTitle: string;
  category: string;
  task: string;
  indonesian: string;
  chinese: string;
  explanation: string;
  vocabulary: { term: string; meaning: string }[];
  learningTip?: string;
  metadata: {
    realNeed: string;
    needSource: string;
    validationLevel: string;
    relatedScenes: string[];
    productStoryCandidate: number;
    videoCandidate: number;
    geoPublicCandidate: number;
    geoQueries: string[];
    freeAcquisitionCandidate: 'yes' | 'candidate' | 'no';
    publicLayer: string;
    paidLayer: string;
  };
};

export type NewMicroScenePlacement = { module: 'driver' | 'factory' | 'life'; role?: 'manager'; category: string };

// Mechanically imported from NIHUISHUO_MICRO_SCENES_01-50_HUMAN_APPROVED.md. Do not rewrite.
export const newMicroSceneAssets: NewMicroSceneAsset[] = [
  {
    "id": "N01",
    "assetTitle": "Baik, Pak",
    "category": "工作·沟通",
    "task": "为什么员工总说 Baik, Pak？",
    "indonesian": "Besok datang lebih pagi, ya.\nBaik, Pak.",
    "chinese": "明天早点来。\n好的，老板/先生。",
    "explanation": "这里的 `baik` 是回应指令时的“好的 / 明白 / OK”。`baik` 本身也可以表达“好”，例如 `Dia orang baik.` = 他是个好人。评价结果“不错”可见 `bagus`；说食物好吃通常用 `enak`。不要先想中文的“好”怎么翻译，先想：到底是什么好？",
    "vocabulary": [
      {
        "term": "baik",
        "meaning": "好的；好"
      },
      {
        "term": "bagus",
        "meaning": "好、不错"
      },
      {
        "term": "enak",
        "meaning": "好吃；舒服（依语境）"
      }
    ],
    "learningTip": "别把中文“好”机械对应成一个印尼语词。",
    "metadata": {
      "realNeed": "为什么员工总说 Baik, Pak？",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N29"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Baik Pak是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N02",
    "assetTitle": "“拿”到底是 ambil 还是 bawa？",
    "category": "生活·工作",
    "task": "“拿”用印尼语怎么说？",
    "indonesian": "Tolong ambil yang itu.\nTolong bawakan ke sini.\nBawa ini ke kantor.\nSiapa yang ambil ini?\nKamu salah ambil.",
    "chinese": "请拿那个。\n帮我拿到这里来。\n把这个带到办公室。\n谁拿走了这个？\n你拿错了。",
    "explanation": "`ambil` 常用于拿、取、取来；`bawa` 强调带着某物移动。现实中要结合动作方向和上下文理解，不要把中文“拿”固定翻成一个词。",
    "vocabulary": [
      {
        "term": "ambil",
        "meaning": "拿、取"
      },
      {
        "term": "bawa",
        "meaning": "带、拿着走"
      },
      {
        "term": "bawakan ke sini",
        "meaning": "帮我拿到这里来"
      },
      {
        "term": "salah ambil",
        "meaning": "拿错"
      }
    ],
    "metadata": {
      "realNeed": "“拿”用印尼语怎么说？",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "ambil和bawa有什么区别？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N03",
    "assetTitle": "仓库装车，不只学一个 muat",
    "category": "工作·工厂",
    "task": "装车用印尼语怎么说，并把装货流程说清楚。",
    "indonesian": "Muat yang ini dulu.\nYang ini jangan dimuat dulu.\nSudah selesai dimuat?\nBelum, masih ada.\nMasih sisa berapa?\nCek lagi jumlahnya.\nJangan sampai salah muat.\nKalau sudah selesai, foto lalu kirim ke saya.",
    "chinese": "先装这一批。\n这个先别装。\n装完了吗？\n还没有，还有。\n还剩多少？\n再检查一下数量。\n别装错。\n装完以后拍照发给我。",
    "explanation": "真实需求不是只知道“装货/装车”可以用 `muat`，而是从先装哪批、是否装完、剩余数量、避免装错一直沟通到完成汇报。",
    "vocabulary": [
      {
        "term": "muat",
        "meaning": "装载"
      },
      {
        "term": "dimuat",
        "meaning": "被装载"
      },
      {
        "term": "sisa",
        "meaning": "剩余"
      },
      {
        "term": "salah muat",
        "meaning": "装错"
      },
      {
        "term": "kirim ke saya",
        "meaning": "发给我"
      }
    ],
    "metadata": {
      "realNeed": "装车用印尼语怎么说，并把装货流程说清楚。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N25"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "装车用印尼语怎么说？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N04",
    "assetTitle": "tidak 为什么变成 gak？",
    "category": "口语·听力",
    "task": "学过 tidak，但真实交流里听不出 gak/nggak。",
    "indonesian": "Kamu tahu barangnya di mana?\nGak tahu, Pak.",
    "chinese": "你知道东西在哪里吗？\n不知道，老板。",
    "explanation": "教材里常见 `tidak`，真实口语里经常会听到 `gak/nggak`。先建立听力转换：看到 `tidak` 会认，听到 `gak` 也要马上反应过来。",
    "vocabulary": [
      {
        "term": "tidak",
        "meaning": "不"
      },
      {
        "term": "gak / nggak",
        "meaning": "不（常见口语）"
      },
      {
        "term": "gak tahu",
        "meaning": "不知道"
      }
    ],
    "metadata": {
      "realNeed": "学过 tidak，但真实交流里听不出 gak/nggak。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N05",
        "N50"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "gak和tidak有什么区别？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N05",
    "assetTitle": "sudah 为什么变成 udah？",
    "category": "口语·听力",
    "task": "认识 sudah，却听不出 udah。",
    "indonesian": "Udah selesai?\nUdah, Pak.\nBelum.",
    "chinese": "做完了吗？\n做完了，老板。\n还没有。",
    "explanation": "`sudah` 在口语里常听成 `udah`。真实交流中还要把 `udah` 和 `belum` 建立成快速反应，而不是先在脑子里翻译。",
    "vocabulary": [
      {
        "term": "sudah",
        "meaning": "已经"
      },
      {
        "term": "udah",
        "meaning": "sudah 的常见口语形式"
      },
      {
        "term": "belum",
        "meaning": "还没有"
      }
    ],
    "metadata": {
      "realNeed": "认识 sudah，却听不出 udah。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N12",
        "N42",
        "N50"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "udah和sudah有什么区别？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N06",
    "assetTitle": "dulu 不只是“以前”",
    "category": "生活·口语",
    "task": "学过 dulu=以前，却听不懂 Tunggu dulu。",
    "indonesian": "Tunggu dulu, ya.\nMakan dulu.\nSaya pergi dulu.\nCek dulu.\nDulu saya tinggal di Jakarta.",
    "chinese": "先等一下。\n先吃饭。\n我先走了。\n先检查一下。\n以前我住在雅加达。",
    "explanation": "`dulu` 既可以表达过去的“以前”，也经常放在动作后表达顺序上的“先……”。理解整块表达比固定背“dulu = 以前”更实用。",
    "vocabulary": [
      {
        "term": "tunggu dulu",
        "meaning": "先等一下"
      },
      {
        "term": "cek dulu",
        "meaning": "先检查"
      },
      {
        "term": "dulu",
        "meaning": "以前；先（依结构/语境）"
      }
    ],
    "metadata": {
      "realNeed": "学过 dulu=以前，却听不懂 Tunggu dulu。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "dulu为什么有时候是“先”？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N07",
    "assetTitle": "lagi 到底是“正在”还是“再”？",
    "category": "生活·口语",
    "task": "同一个 lagi 在真实对话里有不同作用。",
    "indonesian": "Lagi apa?\nLagi makan.\nLagi kerja.\nCoba lagi.",
    "chinese": "在干嘛？\n正在吃饭。\n正在工作。\n再试一次。",
    "explanation": "`lagi` 在不同结构里可以表示正在进行，也可以表示“再、又”。不要孤立固定翻译，要看它和什么词组合。",
    "vocabulary": [
      {
        "term": "lagi apa?",
        "meaning": "在干嘛？"
      },
      {
        "term": "lagi makan",
        "meaning": "正在吃饭"
      },
      {
        "term": "coba lagi",
        "meaning": "再试一次"
      }
    ],
    "metadata": {
      "realNeed": "同一个 lagi 在真实对话里有不同作用。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "lagi是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N08",
    "assetTitle": "酒店出问题，怎么把事情解决完？",
    "category": "旅行·酒店",
    "task": "在酒店遇到问题时不会连续表达需求。",
    "indonesian": "Kartu kamar saya gak bisa dipakai.\nTolong kirim dua handuk ke kamar saya.\nAir minumnya habis.\nAC-nya kurang dingin.\nWi-Fi-nya gak bisa tersambung.",
    "chinese": "我的房卡用不了。\n请送两条毛巾到我的房间。\n饮用水没有了。\n空调不太冷。\nWi-Fi 连不上。",
    "explanation": "酒店场景真正需要的是描述问题并让工作人员处理，而不是只背“酒店、房间、毛巾”等名词。",
    "vocabulary": [
      {
        "term": "gak bisa dipakai",
        "meaning": "不能用"
      },
      {
        "term": "kirim ... ke kamar",
        "meaning": "送……到房间"
      },
      {
        "term": "habis",
        "meaning": "没了/用完了"
      },
      {
        "term": "kurang dingin",
        "meaning": "不太冷"
      },
      {
        "term": "gak bisa tersambung",
        "meaning": "连不上"
      }
    ],
    "metadata": {
      "realNeed": "在酒店遇到问题时不会连续表达需求。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "酒店房卡不能用印尼语怎么说？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N09",
    "assetTitle": "Masa sih? 不是“时期”",
    "category": "社交·聊天",
    "task": "认识 masa，却听不懂聊天里的 Masa sih?",
    "indonesian": "Dia mau nikah bulan depan.\nMasa sih?",
    "chinese": "他下个月要结婚。\n真的假的？/不会吧？",
    "explanation": "`Masa sih?` 在聊天里是非常常见的反应，表达惊讶、怀疑等语气。不要和 `masa lalu`（过去）机械混在一起。",
    "vocabulary": [
      {
        "term": "Masa sih?",
        "meaning": "真的假的？/不会吧？"
      },
      {
        "term": "masa lalu",
        "meaning": "过去"
      }
    ],
    "metadata": {
      "realNeed": "认识 masa，却听不懂聊天里的 Masa sih?",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Masa sih是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N10",
    "assetTitle": "Jancok 到底是什么意思？",
    "category": "社交·高风险口语",
    "task": "听到 jancok，不知道真实中文意思和风险。",
    "indonesian": "Jancok, keren banget!\nJancok!",
    "chinese": "朋友语境：卧槽，也太牛了吧！\n冲突语境：操！/他妈的！（可能带明显挑衅或辱骂）",
    "explanation": "`jancok/jancuk` 是高度粗俗、强烈依赖关系、语气和地区语境的表达，尤其与东爪哇/泗水语言文化关联较强。熟人开玩笑和陌生人冲突完全不是一回事。",
    "vocabulary": [
      {
        "term": "jancok / jancuk",
        "meaning": "高度粗俗的感叹/辱骂表达，中文需按语境理解"
      }
    ],
    "learningTip": "🔴 使用风险：高。听懂不等于你应该学着说。",
    "metadata": {
      "realNeed": "听到 jancok，不知道真实中文意思和风险。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N11",
        "N44",
        "N45",
        "N48",
        "N49"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Jancok是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N11",
    "assetTitle": "Bangsat 到底有多重？",
    "category": "社交·高风险口语",
    "task": "听到 bangsat，不知道到底骂得多重。",
    "indonesian": "Dasar bangsat!",
    "chinese": "你这个混蛋！/王八蛋！/混账！",
    "explanation": "`bangsat` 是明显的侮辱性表达。熟人之间有时可能互相开玩笑，但冲突语境完全不同，不能因为听到朋友这样说就把它当成普通口语。",
    "vocabulary": [
      {
        "term": "bangsat",
        "meaning": "混蛋/王八蛋/混账（强度依语境）"
      },
      {
        "term": "dasar ...",
        "meaning": "你这个……（在此类结构中可加强评价/责骂）"
      }
    ],
    "learningTip": "🔴 使用风险：高。先学会判断，不要随便模仿。",
    "metadata": {
      "realNeed": "听到 bangsat，不知道到底骂得多重。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N10",
        "N44",
        "N45"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Bangsat是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N12",
    "assetTitle": "Belum：最常听见的“还没有”",
    "category": "工作·生活",
    "task": "听懂“还没”以后，不知道怎么继续追问。",
    "indonesian": "Barangnya sudah datang?\nBelum, Pak.\nKapan datang?\nKatanya sore ini.",
    "chinese": "货到了吗？\n还没有，老板。\n什么时候到？\n他说/据说今天下午。",
    "explanation": "`belum` 的核心是“还没有”。实际沟通里要和 `sudah` 建立成一组快速反应，并学会在“还没有”之后继续追问时间。",
    "vocabulary": [
      {
        "term": "belum",
        "meaning": "还没有"
      },
      {
        "term": "sudah",
        "meaning": "已经"
      },
      {
        "term": "kapan datang?",
        "meaning": "什么时候到？"
      },
      {
        "term": "katanya",
        "meaning": "他说/听说/据说（依语境）"
      }
    ],
    "metadata": {
      "realNeed": "听懂“还没”以后，不知道怎么继续追问。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N05",
        "N23",
        "N50"
      ],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "belum是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N13",
    "assetTitle": "saja 为什么现实里总听成 aja？",
    "category": "口语·听力",
    "task": "学过 saja，但现实中总听到 aja。",
    "indonesian": "Yang ini aja.\nDi sini aja.\nBesok aja.",
    "chinese": "就这个吧。\n就这里吧。\n那就明天吧。",
    "explanation": "`saja` 在日常口语里经常听到 `aja`。学习重点不是判断谁“对谁错”，而是听到 `aja` 能立刻理解真实句子。",
    "vocabulary": [
      {
        "term": "saja",
        "meaning": "就、只等（依结构）"
      },
      {
        "term": "aja",
        "meaning": "saja 的常见口语形式"
      },
      {
        "term": "yang ini aja",
        "meaning": "就这个吧"
      }
    ],
    "metadata": {
      "realNeed": "学过 saja，但现实中总听到 aja。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "aja和saja有什么区别？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N14",
    "assetTitle": "gimana：出问题以后最重要的一句",
    "category": "工作·口语",
    "task": "知道 bagaimana，却听不出 gimana；事情出问题后不会追问。",
    "indonesian": "Barangnya belum datang.\nTerus gimana?\nSaya coba hubungi supplier dulu.",
    "chinese": "货还没到。\n那怎么办？/然后呢？\n我先试着联系供应商。",
    "explanation": "`gimana` 是 `bagaimana` 的常见口语形式。`Terus gimana?` 在真实交流里非常实用：事情出了变化以后，继续问“那怎么办/然后呢”。",
    "vocabulary": [
      {
        "term": "gimana",
        "meaning": "怎么/怎么样（口语）"
      },
      {
        "term": "terus gimana?",
        "meaning": "那怎么办？/然后呢？"
      },
      {
        "term": "hubungi supplier",
        "meaning": "联系供应商"
      }
    ],
    "metadata": {
      "realNeed": "知道 bagaimana，却听不出 gimana；事情出问题后不会追问。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Terus gimana是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N15",
    "assetTitle": "kok：为什么听起来像在质问？",
    "category": "工作·聊天",
    "task": "听到 kok 很多，却不知道它在表达什么语气。",
    "indonesian": "Kok belum selesai?\nMesinnya tadi ada masalah, Pak.\nKok bisa?\nKok gitu?",
    "chinese": "怎么还没做完？\n刚才机器出了点问题，老板。\n怎么会这样？/怎么可能？\n怎么这样？",
    "explanation": "`kok` 经常出现在“现实和预期不一致”的反应里。它不是一个永远能固定翻译成某个中文词的助词，语气也会影响听感。",
    "vocabulary": [
      {
        "term": "kok belum selesai?",
        "meaning": "怎么还没完成？"
      },
      {
        "term": "kok bisa?",
        "meaning": "怎么会这样？/怎么可能？"
      },
      {
        "term": "kok gitu?",
        "meaning": "怎么这样？"
      }
    ],
    "metadata": {
      "realNeed": "听到 kok 很多，却不知道它在表达什么语气。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "kok在印尼语里是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N16",
    "assetTitle": "dong：为什么一句话突然变软了？",
    "category": "社交·聊天",
    "task": "听到 dong，却不知道为什么句子语气变了。",
    "indonesian": "Bantuin dong.\nCepetan dong.\nBilang dong.",
    "chinese": "帮帮忙嘛。\n快点嘛。\n说嘛/告诉我嘛。",
    "explanation": "`dong` 常给请求、催促等增加特定口语语气，但不能机械规定 `dong = 嘛`。关系、语调和整句话决定实际感觉。",
    "vocabulary": [
      {
        "term": "bantuin dong",
        "meaning": "帮帮忙嘛"
      },
      {
        "term": "cepetan dong",
        "meaning": "快点嘛"
      },
      {
        "term": "bilang dong",
        "meaning": "说嘛/告诉我嘛"
      }
    ],
    "learningTip": "🟢/🟡 熟人语境常见，但仍要看关系。",
    "metadata": {
      "realNeed": "听到 dong，却不知道为什么句子语气变了。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "dong是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N17",
    "assetTitle": "sih：Apa sih? 为什么可能有点不耐烦？",
    "category": "社交·聊天",
    "task": "知道每个词，却听不懂 sih 带来的真实语气。",
    "indonesian": "Eh, sini deh.\nApa sih?\nKamu kenapa sih?\nMasa sih?",
    "chinese": "欸，过来一下。\n干嘛啊？/什么啊？\n你到底怎么了啊？\n真的假的？/不会吧？",
    "explanation": "`sih` 是高频口语成分，作用依句型和语气变化。`Apa sih?` 某些语气下可能带一点不耐烦，不能把 `sih` 固定翻成一个中文字。",
    "vocabulary": [
      {
        "term": "apa sih?",
        "meaning": "干嘛啊？/什么啊？"
      },
      {
        "term": "kenapa sih?",
        "meaning": "到底怎么了啊？"
      },
      {
        "term": "masa sih?",
        "meaning": "真的假的？"
      }
    ],
    "metadata": {
      "realNeed": "知道每个词，却听不懂 sih 带来的真实语气。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Apa sih是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N18",
    "assetTitle": "nih / tuh：没有动作和语境就很难翻",
    "category": "社交·聊天",
    "task": "聊天里频繁听见 nih/tuh，但字典式翻译帮不上忙。",
    "indonesian": "Tuh kan!\nTuh, dia datang.\nNih.",
    "chinese": "你看吧！/我就说吧！\n你看，他来了。\n喏。/给你。/你看。（依动作和语境）",
    "explanation": "`nih/tuh` 很依赖说话现场、指向、动作和语气。尤其单独一句 `Nih.`，离开现场很难只靠一个固定中文词解释完整。",
    "vocabulary": [
      {
        "term": "tuh kan",
        "meaning": "你看吧/我就说吧"
      },
      {
        "term": "tuh",
        "meaning": "你看/那边那个（依语境）"
      },
      {
        "term": "nih",
        "meaning": "喏/给你/你看（依语境）"
      }
    ],
    "metadata": {
      "realNeed": "聊天里频繁听见 nih/tuh，但字典式翻译帮不上忙。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "tuh kan是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N19",
    "assetTitle": "gue / lu：听得懂，但别到处照搬",
    "category": "社交·聊天",
    "task": "在雅加达经常听见 gue/lu，却不知道什么时候能用。",
    "indonesian": "Lu tahu dia di mana?\nGue gak tahu.",
    "chinese": "你知道他在哪里吗？\n我不知道。",
    "explanation": "`gue/lu` 在雅加达及周边的熟人、年轻人口语中很常见，但不是任何场合都适合替换 `saya/kamu`。面对客户、长辈、正式关系时尤其要注意称呼和关系。",
    "vocabulary": [
      {
        "term": "gue",
        "meaning": "我（特定口语/关系）"
      },
      {
        "term": "lu",
        "meaning": "你（特定口语/关系）"
      },
      {
        "term": "gue gak tahu",
        "meaning": "我不知道"
      }
    ],
    "learningTip": "🟡 先学会听，再判断自己的关系是否适合使用。",
    "metadata": {
      "realNeed": "在雅加达经常听见 gue/lu，却不知道什么时候能用。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "gue和lu是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N20",
    "assetTitle": "cari / ketemu：找人和找到人不是一回事",
    "category": "工作·生活",
    "task": "中文一个“找”，真实场景却需要区分寻找和找到。",
    "indonesian": "Andi di mana?\nSaya lagi cari dia, Pak.\nSudah ketemu?\nSudah.",
    "chinese": "Andi 在哪里？\n我正在找他，老板。\n找到了吗？\n找到了。",
    "explanation": "`cari` 常用于寻找；`ketemu` 在日常口语里可以表达遇见/见到，也可在这类语境中表达“找到了”。要学完整动作链，而不是只背一个“找”。",
    "vocabulary": [
      {
        "term": "cari",
        "meaning": "找、寻找"
      },
      {
        "term": "lagi cari",
        "meaning": "正在找"
      },
      {
        "term": "ketemu",
        "meaning": "遇见/见到；找到（依语境）"
      },
      {
        "term": "sudah ketemu?",
        "meaning": "找到了吗？"
      }
    ],
    "metadata": {
      "realNeed": "中文一个“找”，真实场景却需要区分寻找和找到。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "cari和ketemu有什么区别？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N21",
    "assetTitle": "员工说 mau izin，不只是“许可”",
    "category": "工作·员工",
    "task": "员工说 izin 时，中国老板不知道是不是在请假。",
    "indonesian": "Pak, besok saya mau izin.\nKenapa?\nMau izin berapa hari?\nSatu hari saja, Pak.",
    "chinese": "老板，我明天想请假。\n怎么了？\n想请几天？\n一天就好，老板。",
    "explanation": "`izin` 的基础含义与“许可、允许”有关；工作语境里的 `mau izin` 经常是在表达要请假、请示暂时不能工作等。具体制度仍以实际公司规定为准。",
    "vocabulary": [
      {
        "term": "izin",
        "meaning": "许可；请假/请示（依语境）"
      },
      {
        "term": "mau izin",
        "meaning": "想请假/想请示"
      },
      {
        "term": "berapa hari?",
        "meaning": "几天？"
      }
    ],
    "metadata": {
      "realNeed": "员工说 izin 时，中国老板不知道是不是在请假。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N22"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "印尼语请假怎么说？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N22",
    "assetTitle": "员工今天不能上班",
    "category": "工作·员工",
    "task": "员工请病假时的真实表达听不懂。",
    "indonesian": "Pak, hari ini saya gak bisa masuk kerja.\nKenapa?\nSaya kurang enak badan.\nKalau besok masih belum sehat, kabari saya.",
    "chinese": "老板，我今天不能来上班。\n怎么了？\n我身体有点不舒服。\n如果明天还没好，告诉我。",
    "explanation": "`kurang enak badan` 是常见整块表达，意思是身体不太舒服，不要逐词理解。`masuk kerja` 在这里是来上班/上班。",
    "vocabulary": [
      {
        "term": "gak bisa masuk kerja",
        "meaning": "不能来上班"
      },
      {
        "term": "kurang enak badan",
        "meaning": "身体不太舒服"
      },
      {
        "term": "kabari saya",
        "meaning": "告诉我/通知我"
      }
    ],
    "metadata": {
      "realNeed": "员工请病假时的真实表达听不懂。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "kurang enak badan是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N23",
    "assetTitle": "司机说 Lagi di jalan：还在路上",
    "category": "司机",
    "task": "司机说还在路上，但用户真正需要知道还要多久。",
    "indonesian": "Kamu sudah sampai?\nBelum, Pak. Lagi di jalan.\nBerapa menit lagi?\nSekitar sepuluh menit.",
    "chinese": "你到了吗？\n还没，老板。还在路上。\n还要几分钟？\n大约10分钟。",
    "explanation": "`lagi di jalan` 在这类语境就是“还在路上”。听到以后最实用的下一句是继续确认 `Berapa menit lagi?`。",
    "vocabulary": [
      {
        "term": "lagi di jalan",
        "meaning": "还在路上"
      },
      {
        "term": "berapa menit lagi?",
        "meaning": "还要几分钟？"
      },
      {
        "term": "sekitar",
        "meaning": "大约"
      }
    ],
    "metadata": {
      "realNeed": "司机说还在路上，但用户真正需要知道还要多久。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N37",
        "N50"
      ],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "lagi di jalan是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N24",
    "assetTitle": "堵车以后，怎么让司机换路线？",
    "category": "司机",
    "task": "知道“堵车”，却不会继续和司机决定路线。",
    "indonesian": "Macet banget, Pak.\nAda jalan lain?\nAda, tapi agak jauh.\nGak apa-apa. Coba lewat jalan lain.\nYang lebih cepat aja.",
    "chinese": "太堵了，老板。\n有别的路吗？\n有，但是有点远。\n没关系，试试走别的路。\n走更快的就行。",
    "explanation": "真实司机场景不是只学 `macet = 堵车`，而是听懂路况以后继续问替代路线并做决定。",
    "vocabulary": [
      {
        "term": "macet",
        "meaning": "堵车"
      },
      {
        "term": "jalan lain",
        "meaning": "其他路线"
      },
      {
        "term": "lewat",
        "meaning": "经过/走……"
      },
      {
        "term": "yang lebih cepat",
        "meaning": "更快的那个"
      }
    ],
    "metadata": {
      "realNeed": "知道“堵车”，却不会继续和司机决定路线。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "堵车用印尼语怎么说？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N25",
    "assetTitle": "数量对不上，怎么让员工查清楚？",
    "category": "工作·工厂",
    "task": "仓库数量异常时不会把检查流程说完整。",
    "indonesian": "Jumlahnya gak sesuai.\nKurang berapa, Pak?\nCoba hitung lagi.\nCek satu-satu.\nKalau ada yang kurang, kabari saya.",
    "chinese": "数量对不上。\n少多少，老板？\n再数一次。\n一个一个检查。\n如果有少的，告诉我。",
    "explanation": "工作现场真正需要的是从发现数量不符，到重数、逐一检查，再到反馈缺少情况。",
    "vocabulary": [
      {
        "term": "jumlah",
        "meaning": "数量"
      },
      {
        "term": "gak sesuai",
        "meaning": "不符合/对不上"
      },
      {
        "term": "hitung lagi",
        "meaning": "再数一次"
      },
      {
        "term": "satu-satu",
        "meaning": "一个一个"
      },
      {
        "term": "kabari saya",
        "meaning": "告诉我"
      }
    ],
    "metadata": {
      "realNeed": "仓库数量异常时不会把检查流程说完整。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N03"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "数量对不上印尼语怎么说？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N26",
    "assetTitle": "bisa：会、能、可以，都可能是它",
    "category": "生活·工作",
    "task": "一个 bisa 对应多个中文意思，容易机械翻译。",
    "indonesian": "Ini masih bisa dipakai?\nMasih bisa, Pak.\nGak bisa. Harus diperbaiki.\nKamu bisa bahasa Mandarin?\nBesok bisa datang?",
    "chinese": "这个还能用吗？\n还能用，老板。\n不能用了，必须修。\n你会中文吗？\n明天能来吗？",
    "explanation": "`bisa` 的核心覆盖能力、可能性以及很多中文“能/可以”的场景。不要先强行寻找唯一中文对应，要看整句在问什么。",
    "vocabulary": [
      {
        "term": "bisa dipakai",
        "meaning": "能用"
      },
      {
        "term": "gak bisa",
        "meaning": "不能"
      },
      {
        "term": "bisa bahasa Mandarin",
        "meaning": "会中文"
      },
      {
        "term": "bisa datang",
        "meaning": "能来"
      }
    ],
    "metadata": {
      "realNeed": "一个 bisa 对应多个中文意思，容易机械翻译。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "bisa是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N27",
    "assetTitle": "habis：没了，也可以是“……以后”",
    "category": "生活·工作",
    "task": "听见 habis 时不知道是“没了”还是“做完以后”。",
    "indonesian": "Pak, airnya habis.\nBensinnya hampir habis.\nHabis makan, kita berangkat.",
    "chinese": "老板，水没了。\n油快没了。\n吃完饭以后，我们出发。",
    "explanation": "`habis` 可以表达用完、耗尽，也可以在结构里表达完成某动作以后。理解句型比只背“habis = 完”更可靠。",
    "vocabulary": [
      {
        "term": "habis",
        "meaning": "用完/没了；完成后（依结构）"
      },
      {
        "term": "hampir habis",
        "meaning": "快没了"
      },
      {
        "term": "habis makan",
        "meaning": "吃完饭以后"
      }
    ],
    "metadata": {
      "realNeed": "听见 habis 时不知道是“没了”还是“做完以后”。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Habis makan是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N28",
    "assetTitle": "tinggal：不是只有“住”",
    "category": "生活·工作",
    "task": "学过 tinggal=住，听到 tinggal dua 却反应不过来。",
    "indonesian": "Barangnya masih ada berapa?\nTinggal dua, Pak.\nSaya tinggal di Jakarta.",
    "chinese": "货还剩多少？\n只剩两个了，老板。\n我住在雅加达。",
    "explanation": "`tinggal` 可以表示居住；在 `tinggal dua` 这类结构里则是“只剩两个”。真实口语必须按完整结构理解。",
    "vocabulary": [
      {
        "term": "tinggal dua",
        "meaning": "只剩两个"
      },
      {
        "term": "tinggal di Jakarta",
        "meaning": "住在雅加达"
      },
      {
        "term": "masih ada berapa?",
        "meaning": "还剩多少？"
      }
    ],
    "metadata": {
      "realNeed": "学过 tinggal=住，听到 tinggal dua 却反应不过来。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Tinggal dua是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N29",
    "assetTitle": "好吃别先说 bagus",
    "category": "餐厅·生活",
    "task": "中文“好”造成 baik/bagus/enak 混用。",
    "indonesian": "Enak gak?\nEnak banget.\nYang mana paling enak?\nPedas gak?\nJangan terlalu pedas.",
    "chinese": "好吃吗？\n特别好吃。\n哪个最好吃？\n辣吗？\n不要太辣。",
    "explanation": "说食物味道好吃，常用 `enak`。不要因为中文都是一个“好”，就自动套用 `bagus`。先判断你说的是味道、品质、人物还是回应。",
    "vocabulary": [
      {
        "term": "enak",
        "meaning": "好吃；舒服（依语境）"
      },
      {
        "term": "enak banget",
        "meaning": "特别好吃"
      },
      {
        "term": "paling enak",
        "meaning": "最好吃"
      },
      {
        "term": "jangan terlalu pedas",
        "meaning": "不要太辣"
      }
    ],
    "metadata": {
      "realNeed": "中文“好”造成 baik/bagus/enak 混用。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N01"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "enak和bagus有什么区别？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N30",
    "assetTitle": "讲价不是只会说 murah",
    "category": "购物·生活",
    "task": "会问价格，但不会把讲价继续下去。",
    "indonesian": "Berapa harganya?\nDua ratus ribu.\nMahal banget. Bisa kurang?\nKalau saya ambil dua, berapa?\nOke, saya ambil dua.",
    "chinese": "多少钱？\n20万。\n太贵了，能便宜一点吗？\n如果我拿两个，多少钱？\n好，我拿两个。",
    "explanation": "真实讲价是“问价 → 表达贵 → 问能不能少 → 用数量谈价格 → 做决定”的连续过程。",
    "vocabulary": [
      {
        "term": "berapa harganya?",
        "meaning": "多少钱？"
      },
      {
        "term": "mahal banget",
        "meaning": "太贵了"
      },
      {
        "term": "bisa kurang?",
        "meaning": "能少一点吗？"
      },
      {
        "term": "ambil dua",
        "meaning": "拿两个/买两个"
      }
    ],
    "metadata": {
      "realNeed": "会问价格，但不会把讲价继续下去。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Bisa kurang是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N31",
    "assetTitle": "20万为什么每个数字都认识却听不出来？",
    "category": "数字·生活",
    "task": "会1到10，却听不懂真实报价。",
    "indonesian": "Berapa harganya?\nDua ratus ribu.\nDua ratus ribu?\nIya.",
    "chinese": "多少钱？\n20万印尼盾。\n20万？\n对。",
    "explanation": "现实需要的不是只会 `satu, dua, tiga`，而是听到真实价格时能马上反应。",
    "vocabulary": [
      {
        "term": "ribu",
        "meaning": "千"
      },
      {
        "term": "ratus",
        "meaning": "百"
      },
      {
        "term": "juta",
        "meaning": "百万"
      },
      {
        "term": "dua ratus ribu",
        "meaning": "20万"
      }
    ],
    "metadata": {
      "realNeed": "会1到10，却听不懂真实报价。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N30",
        "N32",
        "N33",
        "N34"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "dua ratus ribu是多少钱？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N32",
    "assetTitle": "satu setengah juta 到底是多少钱？",
    "category": "数字·生活",
    "task": "价格里听到 setengah 后不能快速换算。",
    "indonesian": "Berapa harganya?\nSatu setengah juta.\nSatu juta lima ratus ribu?\nIya.",
    "chinese": "多少钱？\n150万印尼盾。\n150万？\n对。",
    "explanation": "`setengah` = 一半。`satu setengah juta` 在价格语境就是150万印尼盾，`dua setengah juta` 则是250万。",
    "vocabulary": [
      {
        "term": "setengah",
        "meaning": "一半"
      },
      {
        "term": "satu setengah juta",
        "meaning": "150万"
      },
      {
        "term": "dua setengah juta",
        "meaning": "250万"
      }
    ],
    "metadata": {
      "realNeed": "价格里听到 setengah 后不能快速换算。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "satu setengah juta是多少钱？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N33",
    "assetTitle": "面试说 gaji lima juta，就是500万",
    "category": "工作·数字",
    "task": "数字学习和真实工资沟通脱节。",
    "indonesian": "Gaji yang kamu harapkan berapa?\nSekitar lima juta.\nLima juta?\nIya, Pak.",
    "chinese": "你的期望工资是多少？\n大概500万印尼盾。\n500万？\n对，老板。",
    "explanation": "学 `lima = 5` 不等于能处理工资沟通。真实目标是听到 `lima juta` 时马上知道对方在谈500万印尼盾。",
    "vocabulary": [
      {
        "term": "gaji",
        "meaning": "工资"
      },
      {
        "term": "yang kamu harapkan",
        "meaning": "你期望的"
      },
      {
        "term": "sekitar",
        "meaning": "大约"
      },
      {
        "term": "lima juta",
        "meaning": "500万"
      }
    ],
    "metadata": {
      "realNeed": "数字学习和真实工资沟通脱节。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "期望工资用印尼语怎么问？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N34",
    "assetTitle": "电话号码：0–9都会，为什么还是记不下来？",
    "category": "数字·生活",
    "task": "单个数字都会，但连续号码跟不上。",
    "indonesian": "Nomor WhatsApp-nya berapa?\nMaaf, ulangi pelan-pelan.\nBisa kirim lewat WhatsApp aja?",
    "chinese": "WhatsApp号码是多少？\n不好意思，麻烦慢一点再说一次。\n可以直接用WhatsApp发给我吗？",
    "explanation": "真正困难的是连续数字的实时听辨，不是认识0–9。数字训练应该进入价格、电话、数量、工资和时间。",
    "vocabulary": [
      {
        "term": "nomor",
        "meaning": "号码"
      },
      {
        "term": "ulangi",
        "meaning": "再说一次/重复"
      },
      {
        "term": "pelan-pelan",
        "meaning": "慢一点"
      },
      {
        "term": "kirim",
        "meaning": "发送"
      }
    ],
    "metadata": {
      "realNeed": "单个数字都会，但连续号码跟不上。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "电话号码用印尼语怎么问？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N35",
    "assetTitle": "航班晚点，到底几点飞？",
    "category": "旅行·机场",
    "task": "航班异常时不会继续确认关键信息。",
    "indonesian": "Pesawatnya delay sampai jam berapa?\nSekitar jam delapan malam.\nGate-nya tetap sama?\nIya, masih sama.",
    "chinese": "飞机延误到几点？\n大约晚上8点。\n登机口还是原来的吗？\n对，还是一样。",
    "explanation": "机场能力不是背 `pesawat`、`bandara`，而是航班发生变化时继续问清时间和登机口。",
    "vocabulary": [
      {
        "term": "delay",
        "meaning": "延误（日常航空语境常见）"
      },
      {
        "term": "sampai jam berapa?",
        "meaning": "到几点？"
      },
      {
        "term": "gate",
        "meaning": "登机口"
      },
      {
        "term": "tetap sama",
        "meaning": "还是一样"
      }
    ],
    "metadata": {
      "realNeed": "航班异常时不会继续确认关键信息。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "航班延误用印尼语怎么问？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N36",
    "assetTitle": "行李超重，先问超了多少",
    "category": "旅行·机场",
    "task": "机场行李出问题时不会完成后续沟通。",
    "indonesian": "Bagasi saya kelebihan berat?\nLebih berapa kilo?\nKalau tambah bagasi, berapa biayanya?",
    "chinese": "我的行李超重了吗？\n超了多少公斤？\n如果增加行李额，要多少钱？",
    "explanation": "真实任务是知道超重以后继续确认超多少、如何处理以及费用，而不是只背 `bagasi = 行李`。",
    "vocabulary": [
      {
        "term": "bagasi",
        "meaning": "行李/托运行李"
      },
      {
        "term": "kelebihan berat",
        "meaning": "超重"
      },
      {
        "term": "berapa kilo?",
        "meaning": "多少公斤？"
      },
      {
        "term": "biaya",
        "meaning": "费用"
      }
    ],
    "metadata": {
      "realNeed": "机场行李出问题时不会完成后续沟通。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "行李超重印尼语怎么说？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N37",
    "assetTitle": "司机回 OTW，别以为马上就到",
    "category": "司机·WhatsApp",
    "task": "司机只回OTW，用户真正关心的是多久到。",
    "indonesian": "Kamu di mana?\nOTW, Pak.\nBerapa menit lagi?",
    "chinese": "你在哪里？\n在路上了，老板。\n还要几分钟？",
    "explanation": "`OTW` 来自英文 `on the way`，在印尼 WhatsApp 聊天中很常见。知道 OTW 是“在路上”还不够；真正实用的是继续问 `Berapa menit lagi?`。",
    "vocabulary": [
      {
        "term": "OTW",
        "meaning": "在路上"
      },
      {
        "term": "berapa menit lagi?",
        "meaning": "还要几分钟？"
      }
    ],
    "metadata": {
      "realNeed": "司机只回OTW，用户真正关心的是多久到。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N23",
        "N50"
      ],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "印尼人说OTW是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N38",
    "assetTitle": "Nanti 到底是几点？",
    "category": "工作·员工",
    "task": "听懂 nanti，却没有把模糊时间变成可执行时间。",
    "indonesian": "Nanti saya kerjakan, Pak.\nNanti jam berapa?\nSebelum jam lima harus selesai, ya.",
    "chinese": "我待会儿做，老板。\n待会儿是几点？\n5点以前要完成。",
    "explanation": "`nanti` 可以表达待会儿、之后等。工作管理里真正的问题是“待会儿到底什么时候”，所以重要任务可以继续确认具体时间。",
    "vocabulary": [
      {
        "term": "nanti",
        "meaning": "待会儿/之后"
      },
      {
        "term": "nanti jam berapa?",
        "meaning": "待会儿是几点？"
      },
      {
        "term": "sebelum jam lima",
        "meaning": "5点以前"
      },
      {
        "term": "harus selesai",
        "meaning": "必须完成"
      }
    ],
    "metadata": {
      "realNeed": "听懂 nanti，却没有把模糊时间变成可执行时间。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N39"
      ],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "nanti是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N39",
    "assetTitle": "Sebentar lagi：到底还要等多久？",
    "category": "工作·口语",
    "task": "听到“等一下”后一直等，不会追问具体时间。",
    "indonesian": "Sudah selesai?\nSebentar lagi, Pak.\nKira-kira berapa menit lagi?",
    "chinese": "做完了吗？\n马上/再等一会儿，老板。\n大概还要几分钟？",
    "explanation": "`sebentar lagi` 很常见，但不是精确时间。重要事情需要明确时，可以继续问 `Kira-kira berapa menit lagi?`。",
    "vocabulary": [
      {
        "term": "sebentar",
        "meaning": "一会儿"
      },
      {
        "term": "sebentar lagi",
        "meaning": "马上/再等一会儿"
      },
      {
        "term": "kira-kira",
        "meaning": "大概"
      },
      {
        "term": "berapa menit lagi?",
        "meaning": "还要几分钟？"
      }
    ],
    "metadata": {
      "realNeed": "听到“等一下”后一直等，不会追问具体时间。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N38",
        "N50"
      ],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "sebentar lagi是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N40",
    "assetTitle": "beres：事情“搞定了”",
    "category": "工作·口语",
    "task": "听到 beres 不知道是在说事情已经处理好。",
    "indonesian": "Sudah selesai?\nSudah beres, Pak.\nBeres!\nBelum beres.",
    "chinese": "做完了吗？\n已经搞定了，老板。\n搞定！\n还没处理好。",
    "explanation": "`beres` 在真实口语里经常表示事情处理好了、搞定了。它不一定描述某个具体动作，而是在告诉你结果状态。",
    "vocabulary": [
      {
        "term": "beres",
        "meaning": "搞定、处理好"
      },
      {
        "term": "sudah beres",
        "meaning": "已经弄好了"
      },
      {
        "term": "belum beres",
        "meaning": "还没处理好"
      }
    ],
    "metadata": {
      "realNeed": "听到 beres 不知道是在说事情已经处理好。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Sudah beres是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N41",
    "assetTitle": "Terserah：一句“随便”为什么有时很危险？",
    "category": "社交·关系",
    "task": "知道 terserah=随便，却判断不了对方是不是生气。",
    "indonesian": "Mau makan apa?\nTerserah.\nYa udah, terserah kamu!",
    "chinese": "想吃什么？\n随便，都可以。\n行吧，随你！/你爱怎样怎样！（依语气）",
    "explanation": "同一个 `terserah`，字面核心没有突然改变，但关系、语气和前后发生的事情会改变听感。它可能是真的“都可以”，也可能带明显不高兴。",
    "vocabulary": [
      {
        "term": "terserah",
        "meaning": "随你/都可以/随便"
      },
      {
        "term": "terserah kamu",
        "meaning": "随你（情绪依语境）"
      }
    ],
    "learningTip": "🟡 语气敏感。听懂词义以后还要听懂关系。",
    "metadata": {
      "realNeed": "知道 terserah=随便，却判断不了对方是不是生气。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N42"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Terserah kamu是生气了吗？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N42",
    "assetTitle": "Udah! 有时候不是“已经”",
    "category": "社交·口语",
    "task": "单词认识，却因为语用变化听不懂整句话。",
    "indonesian": "Udah, udah.\nUdah deh.",
    "chinese": "好了好了。/行了行了。\n算了吧。/好了吧。",
    "explanation": "`udah` 是 `sudah` 的常见口语形式，但单独或在特定语境里说 `Udah!`，可能是在表达“好了、够了、行了”，不能机械翻成“已经”。",
    "vocabulary": [
      {
        "term": "udah",
        "meaning": "已经；好了/够了等（依语境）"
      },
      {
        "term": "udah deh",
        "meaning": "好了吧/算了吧"
      },
      {
        "term": "udah, udah",
        "meaning": "好了好了"
      }
    ],
    "metadata": {
      "realNeed": "单词认识，却因为语用变化听不懂整句话。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N05",
        "N41"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Udah deh是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N43",
    "assetTitle": "Gila! 不一定是在说“疯子”",
    "category": "社交·口语",
    "task": "字典义知道，但真实感叹用法听不懂。",
    "indonesian": "Gila, bagus banget!\nLu gila?",
    "chinese": "我的天，也太漂亮了！/卧槽，太漂亮了！\n你疯了吗？（依语气）",
    "explanation": "`gila` 的基本意思和“疯、疯狂”有关，但年轻人口语里也常作为强烈感叹。看到 `Gila!` 不能自动判断对方在说谁“疯了”。",
    "vocabulary": [
      {
        "term": "gila",
        "meaning": "疯；也可作强烈感叹"
      },
      {
        "term": "gila, keren banget",
        "meaning": "我的天/卧槽，也太酷了"
      },
      {
        "term": "lu gila?",
        "meaning": "你疯了吗？"
      }
    ],
    "learningTip": "🟡 关系和语气很重要。",
    "metadata": {
      "realNeed": "字典义知道，但真实感叹用法听不懂。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "印尼人说Gila是在骂人吗？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N44",
    "assetTitle": "Anjing：是“狗”，也可能是在骂人",
    "category": "社交·高风险口语",
    "task": "听到 anjing 时无法判断是在说动物还是骂人。",
    "indonesian": "Anjing!",
    "chinese": "字面：狗。\n粗俗/冲突语境：妈的！/操！/混蛋！（具体依语境）",
    "explanation": "`anjing` 的字面意思是“狗”，但在某些口语、争吵或粗俗感叹中也可能成为骂人/感叹表达。判断时至少看：是不是在说动物、双方关系、说话语气。",
    "vocabulary": [
      {
        "term": "anjing",
        "meaning": "狗；某些语境中也可作粗俗骂人/感叹表达"
      }
    ],
    "learningTip": "🔴 使用风险：高。别人说得自然，不代表你说也自然。",
    "metadata": {
      "realNeed": "听到 anjing 时无法判断是在说动物还是骂人。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N10",
        "N11",
        "N45"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Anjing在印尼语里是脏话吗？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N45",
    "assetTitle": "Goblok 到底有多难听？",
    "category": "社交·高风险口语",
    "task": "需要知道 goblok 的真实中文强度，而不是只知道“骂人”。",
    "indonesian": "Goblok!\nGoblok lu!",
    "chinese": "蠢货！/白痴！/傻逼！（强度依语气）\n你个蠢货！/你个傻逼！（依关系和语气）",
    "explanation": "`goblok` 是对别人智力或行为的粗俗贬损。陌生人冲突中攻击性明显；熟人互损也可能听到，但不代表它是普通礼貌用语。",
    "vocabulary": [
      {
        "term": "goblok",
        "meaning": "蠢、蠢货、白痴；强烈语境下可接近更粗俗的中文辱骂"
      }
    ],
    "learningTip": "🔴 使用风险：高。先听懂，不建议随意模仿。",
    "metadata": {
      "realNeed": "需要知道 goblok 的真实中文强度，而不是只知道“骂人”。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N10",
        "N11",
        "N44"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Goblok骂人严重吗？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N46",
    "assetTitle": "Gak tahu malu：不是生硬的“不知道害羞”",
    "category": "社交·高风险口语",
    "task": "逐词都认识，但整块表达翻译错。",
    "indonesian": "Gak tahu malu!",
    "chinese": "不要脸！/真不知道羞耻！",
    "explanation": "逐词看是 `gak`（不）+ `tahu`（知道）+ `malu`（害羞/羞耻），但真实中文应整块理解为“不要脸/不知道羞耻”等，而不是生硬逐词翻译。",
    "vocabulary": [
      {
        "term": "malu",
        "meaning": "害羞、羞耻"
      },
      {
        "term": "gak tahu malu",
        "meaning": "不要脸/不知道羞耻"
      }
    ],
    "learningTip": "🟡/🔴 明显负面表达，注意冲突风险。",
    "metadata": {
      "realNeed": "逐词都认识，但整块表达翻译错。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Gak tahu malu是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N47",
    "assetTitle": "Celaka：不只是简单的“糟糕”",
    "category": "社交·高风险口语",
    "task": "只给一个中文词不足以解释 celaka 的不同负面语境。",
    "indonesian": "Celaka!",
    "chinese": "糟了！/坏了！（具体依语境）",
    "explanation": "`celaka` 也和不幸、灾祸、倒霉等负面概念有关。听到时要看完整句子：是在感叹事情糟了，还是在针对某个人说负面的话。",
    "vocabulary": [
      {
        "term": "celaka",
        "meaning": "不幸、灾祸、糟糕；具体含义依结构和语境"
      }
    ],
    "learningTip": "🟡 先理解完整句子，不建议脱离上下文乱用。",
    "metadata": {
      "realNeed": "只给一个中文词不足以解释 celaka 的不同负面语境。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [],
      "productStoryCandidate": 4,
      "videoCandidate": 4,
      "geoPublicCandidate": 4,
      "geoQueries": [
        "Celaka是什么意思？"
      ],
      "freeAcquisitionCandidate": "candidate",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N48",
    "assetTitle": "Kontol：听懂就行，千万别乱说",
    "category": "社交·高风险口语",
    "task": "用户可能在现实/网络中听到，却被教材回避真实含义。",
    "indonesian": "Kontol!",
    "chinese": "字面：阴茎 / 鸡巴。\n作为脏话时，可接近非常粗俗的“操 / 鸡巴 / 他妈的”等，具体作用依句子和语境。",
    "explanation": "这是明显粗俗的词。告诉学习者真实中文，是为了听到以后知道对方说了什么，不是让学习者练习骂人。",
    "vocabulary": [
      {
        "term": "kontol",
        "meaning": "男性生殖器的粗俗说法；也可作为高度粗俗的辱骂/感叹表达"
      }
    ],
    "learningTip": "🔴 使用风险：非常高。认识 ≠ 推荐使用。",
    "metadata": {
      "realNeed": "用户可能在现实/网络中听到，却被教材回避真实含义。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N49"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Kontol是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N49",
    "assetTitle": "Ngentot 是什么意思？",
    "category": "社交·高风险口语",
    "task": "现实粗俗表达需要真实释义和风险判断。",
    "indonesian": "ngentot",
    "chinese": "非常粗俗地表达性行为，大致相当于“操 / 干 / 做爱”；在某些结构中也可能成为攻击性很强的脏话成分。",
    "explanation": "这个词没有必要为了“文明”而只解释成“一个不好的词”，否则学习者仍不知道自己听见了什么。但它也不是普通、礼貌的“性爱”教学词汇。",
    "vocabulary": [
      {
        "term": "ngentot",
        "meaning": "对性行为非常粗俗的说法；也可能进入辱骂表达"
      }
    ],
    "learningTip": "🔴 使用风险：非常高。目标是听懂现实，不是模仿粗俗表达。",
    "metadata": {
      "realNeed": "现实粗俗表达需要真实释义和风险判断。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N48"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Ngentot是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  },
  {
    "id": "N50",
    "assetTitle": "每个词都学过，司机一说你还是没听懂",
    "category": "司机·真实口语",
    "task": "典型痛点：教材词都认识，真实回复仍然听不懂。",
    "indonesian": "Kamu sudah sampai?\nBelum, Pak. Lagi di jalan. Bentar lagi nyampe.",
    "chinese": "你到了吗？\n还没老板，还在路上，马上就到了。",
    "explanation": "你可能已经学过 `belum`、`sebentar`、`sampai`，但真实交流里会听到 `bentar`、`nyampe` 等口语形式。学习目标不能只是“这个单词我学过”，而是印尼人真的这样说时能够马上听懂。",
    "vocabulary": [
      {
        "term": "belum",
        "meaning": "还没"
      },
      {
        "term": "lagi di jalan",
        "meaning": "还在路上"
      },
      {
        "term": "bentar",
        "meaning": "`sebentar` 的口语形式，一会儿/等一下"
      },
      {
        "term": "nyampe",
        "meaning": "与 `sampai`（到达）相关的口语形式"
      },
      {
        "term": "bentar lagi nyampe",
        "meaning": "马上就到了"
      }
    ],
    "learningTip": "让你学到的印尼语，和印尼人真正说的印尼语，慢慢变成同一种语言。",
    "metadata": {
      "realNeed": "典型痛点：教材词都认识，真实回复仍然听不懂。",
      "needSource": "scenario-expansion / needs-verification unless separately evidenced in repository source material",
      "validationLevel": "needs-verification (do not fabricate external evidence)",
      "relatedScenes": [
        "N04",
        "N05",
        "N12",
        "N23",
        "N37",
        "N39"
      ],
      "productStoryCandidate": 5,
      "videoCandidate": 5,
      "geoPublicCandidate": 5,
      "geoQueries": [
        "Bentar lagi nyampe是什么意思？"
      ],
      "freeAcquisitionCandidate": "yes",
      "publicLayer": "core answer + 1–2 approved examples + concise usage explanation; future publication requires separate approval",
      "paidLayer": "full Micro Scene + continuous context + related scenes + listening/TTS + variable/substitution practice where supported"
    }
  }
];

export const newMicroScenePlacements: Record<string, NewMicroScenePlacement> = {
  "N01": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N02": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N03": {
    "module": "factory",
    "role": "manager",
    "category": "pengiriman"
  },
  "N04": {
    "module": "life",
    "category": "daily-chat"
  },
  "N05": {
    "module": "life",
    "category": "daily-chat"
  },
  "N06": {
    "module": "life",
    "category": "daily-chat"
  },
  "N07": {
    "module": "life",
    "category": "daily-chat"
  },
  "N08": {
    "module": "life",
    "category": "hotel-stay"
  },
  "N09": {
    "module": "life",
    "category": "daily-chat"
  },
  "N10": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N11": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N12": {
    "module": "factory",
    "role": "manager",
    "category": "material"
  },
  "N13": {
    "module": "life",
    "category": "daily-chat"
  },
  "N14": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N15": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N16": {
    "module": "life",
    "category": "daily-chat"
  },
  "N17": {
    "module": "life",
    "category": "daily-chat"
  },
  "N18": {
    "module": "life",
    "category": "daily-chat"
  },
  "N19": {
    "module": "life",
    "category": "daily-chat"
  },
  "N20": {
    "module": "factory",
    "role": "manager",
    "category": "material"
  },
  "N21": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N22": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N23": {
    "module": "driver",
    "category": "jemput"
  },
  "N24": {
    "module": "driver",
    "category": "perjalanan"
  },
  "N25": {
    "module": "factory",
    "role": "manager",
    "category": "pengiriman"
  },
  "N26": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N27": {
    "module": "life",
    "category": "daily-chat"
  },
  "N28": {
    "module": "life",
    "category": "daily-chat"
  },
  "N29": {
    "module": "life",
    "category": "meals-coffee"
  },
  "N30": {
    "module": "life",
    "category": "supermarket"
  },
  "N31": {
    "module": "life",
    "category": "bank-payments"
  },
  "N32": {
    "module": "life",
    "category": "bank-payments"
  },
  "N33": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N34": {
    "module": "life",
    "category": "bank-payments"
  },
  "N35": {
    "module": "life",
    "category": "airport-travel"
  },
  "N36": {
    "module": "life",
    "category": "airport-travel"
  },
  "N37": {
    "module": "driver",
    "category": "jemput"
  },
  "N38": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N39": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N40": {
    "module": "factory",
    "role": "manager",
    "category": "produksi"
  },
  "N41": {
    "module": "life",
    "category": "daily-chat"
  },
  "N42": {
    "module": "life",
    "category": "daily-chat"
  },
  "N43": {
    "module": "life",
    "category": "daily-chat"
  },
  "N44": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N45": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N46": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N47": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N48": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N49": {
    "module": "life",
    "category": "cultural-exchange"
  },
  "N50": {
    "module": "driver",
    "category": "jemput"
  }
};
