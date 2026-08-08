import type { LifeExperience } from '@/lib/life-experiences';
import type { GoldenSceneContent, GoldenSceneLine, GoldenScenePair } from '@/lib/golden-scenes';
import type { WorkplacePattern } from '@/lib/workplace-patterns';
import { livingHomeExperiences } from '@/lib/living-home-experiences';

export type LivingHomeCategory =
  | 'rumah-harian'
  | 'urusan-rumah'
  | 'masak-makan'
  | 'belanja-konsumsi'
  | 'antar-persediaan'
  | 'masalah-rumah';

type GoldenMode = 'location' | 'problem' | 'request' | 'food' | 'shopping' | 'delivery' | 'utility';

type Blueprint = {
  id: string;
  mode: GoldenMode;
  subject: string;
  alternates?: string[];
};

const blueprints = [
  {
    "id": "EXP-LIF-224",
    "mode": "location",
    "subject": "toilet",
    "alternates": [
      "kamar mandi",
      "WC"
    ]
  },
  {
    "id": "EXP-LIF-225",
    "mode": "problem",
    "subject": "tisu toilet",
    "alternates": [
      "kertas tisu",
      "tisu"
    ]
  },
  {
    "id": "EXP-LIF-226",
    "mode": "problem",
    "subject": "air panas",
    "alternates": [
      "air hangat",
      "water heater"
    ]
  },
  {
    "id": "EXP-LIF-227",
    "mode": "problem",
    "subject": "charger",
    "alternates": [
      "colokan",
      "stop kontak"
    ]
  },
  {
    "id": "EXP-LIF-228",
    "mode": "problem",
    "subject": "remote TV",
    "alternates": [
      "remote AC",
      "remote"
    ]
  },
  {
    "id": "EXP-LIF-229",
    "mode": "problem",
    "subject": "kunci pintu",
    "alternates": [
      "kunci kamar",
      "kunci rumah"
    ]
  },
  {
    "id": "EXP-LIF-230",
    "mode": "request",
    "subject": "orang yang mengetuk pintu",
    "alternates": [
      "tamu",
      "orang di luar"
    ]
  },
  {
    "id": "EXP-LIF-231",
    "mode": "delivery",
    "subject": "paket",
    "alternates": [
      "kiriman",
      "barang datang"
    ]
  },
  {
    "id": "EXP-LIF-232",
    "mode": "delivery",
    "subject": "paket salah",
    "alternates": [
      "alamat paket",
      "paket yang dikirim"
    ]
  },
  {
    "id": "EXP-LIF-233",
    "mode": "request",
    "subject": "sampah",
    "alternates": [
      "tong sampah",
      "tempat sampah"
    ]
  },
  {
    "id": "EXP-LIF-234",
    "mode": "request",
    "subject": "buang sampah",
    "alternates": [
      "angkat sampah",
      "keluarin sampah"
    ]
  },
  {
    "id": "EXP-LIF-235",
    "mode": "request",
    "subject": "dapur",
    "alternates": [
      "ruang masak",
      "kompor"
    ]
  },
  {
    "id": "EXP-LIF-236",
    "mode": "request",
    "subject": "lantai",
    "alternates": [
      "pel lantai",
      "mop"
    ]
  },
  {
    "id": "EXP-LIF-237",
    "mode": "request",
    "subject": "baju",
    "alternates": [
      "cucian",
      "pakaian"
    ]
  },
  {
    "id": "EXP-LIF-238",
    "mode": "problem",
    "subject": "baju belum kering",
    "alternates": [
      "jemuran",
      "laundry"
    ]
  },
  {
    "id": "EXP-LIF-239",
    "mode": "request",
    "subject": "setrika",
    "alternates": [
      "baju",
      "pakaian"
    ]
  },
  {
    "id": "EXP-LIF-240",
    "mode": "request",
    "subject": "kamar",
    "alternates": [
      "ruang tidur",
      "ruangan"
    ]
  },
  {
    "id": "EXP-LIF-241",
    "mode": "request",
    "subject": "barang ini",
    "alternates": [
      "benda ini",
      "yang ini"
    ]
  },
  {
    "id": "EXP-LIF-242",
    "mode": "problem",
    "subject": "barang salah tempat",
    "alternates": [
      "posisi barang",
      "taruhannya"
    ]
  },
  {
    "id": "EXP-LIF-243",
    "mode": "food",
    "subject": "menu makan",
    "alternates": [
      "makan malam",
      "makan siang"
    ]
  },
  {
    "id": "EXP-LIF-244",
    "mode": "food",
    "subject": "siapa masak",
    "alternates": [
      "yang masak",
      "giliran masak"
    ]
  },
  {
    "id": "EXP-LIF-245",
    "mode": "request",
    "subject": "satu masakan",
    "alternates": [
      "hidangan",
      "menu"
    ]
  },
  {
    "id": "EXP-LIF-246",
    "mode": "food",
    "subject": "pedas",
    "alternates": [
      "rasa pedas",
      "cabai"
    ]
  },
  {
    "id": "EXP-LIF-247",
    "mode": "food",
    "subject": "asin",
    "alternates": [
      "rasa asin",
      "garam"
    ]
  },
  {
    "id": "EXP-LIF-248",
    "mode": "food",
    "subject": "gula garam cabai",
    "alternates": [
      "bumbu",
      "rempah"
    ]
  },
  {
    "id": "EXP-LIF-249",
    "mode": "food",
    "subject": "makanan",
    "alternates": [
      "masakan",
      "hidangan"
    ]
  },
  {
    "id": "EXP-LIF-250",
    "mode": "food",
    "subject": "isi kulkas",
    "alternates": [
      "stok kulkas",
      "bahan makanan"
    ]
  },
  {
    "id": "EXP-LIF-251",
    "mode": "shopping",
    "subject": "barang habis",
    "alternates": [
      "stok habis",
      "persediaan habis"
    ]
  },
  {
    "id": "EXP-LIF-252",
    "mode": "shopping",
    "subject": "belanja",
    "alternates": [
      "beli",
      "ambil"
    ]
  },
  {
    "id": "EXP-LIF-253",
    "mode": "shopping",
    "subject": "barang salah",
    "alternates": [
      "yang dibeli",
      "pembelian"
    ]
  },
  {
    "id": "EXP-LIF-254",
    "mode": "shopping",
    "subject": "harga",
    "alternates": [
      "biaya",
      "tarif"
    ]
  },
  {
    "id": "EXP-LIF-255",
    "mode": "shopping",
    "subject": "barang di supermarket",
    "alternates": [
      "produk",
      "item"
    ]
  },
  {
    "id": "EXP-LIF-256",
    "mode": "shopping",
    "subject": "kasir",
    "alternates": [
      "bayar",
      "checkout"
    ]
  },
  {
    "id": "EXP-LIF-257",
    "mode": "shopping",
    "subject": "pembayaran",
    "alternates": [
      "QRIS",
      "transfer"
    ]
  },
  {
    "id": "EXP-LIF-258",
    "mode": "shopping",
    "subject": "kembalian",
    "alternates": [
      "uang kecil",
      "receh"
    ]
  },
  {
    "id": "EXP-LIF-259",
    "mode": "delivery",
    "subject": "makanan",
    "alternates": [
      "pesanan",
      "order"
    ]
  },
  {
    "id": "EXP-LIF-260",
    "mode": "delivery",
    "subject": "kurir",
    "alternates": [
      "driver",
      "pengantar"
    ]
  },
  {
    "id": "EXP-LIF-261",
    "mode": "delivery",
    "subject": "barang kurang",
    "alternates": [
      "isi paket",
      "pesanan"
    ]
  },
  {
    "id": "EXP-LIF-262",
    "mode": "delivery",
    "subject": "air minum",
    "alternates": [
      "stok air",
      "air galon"
    ]
  },
  {
    "id": "EXP-LIF-263",
    "mode": "delivery",
    "subject": "galon air",
    "alternates": [
      "air galon",
      "galon"
    ]
  },
  {
    "id": "EXP-LIF-264",
    "mode": "utility",
    "subject": "gas",
    "alternates": [
      "elpiji",
      "tabung gas"
    ]
  },
  {
    "id": "EXP-LIF-265",
    "mode": "utility",
    "subject": "kebutuhan rumah",
    "alternates": [
      "stok rumah",
      "barang rumah"
    ]
  },
  {
    "id": "EXP-LIF-266",
    "mode": "utility",
    "subject": "air",
    "alternates": [
      "air mati",
      "aliran air"
    ]
  },
  {
    "id": "EXP-LIF-267",
    "mode": "utility",
    "subject": "listrik",
    "alternates": [
      "mati lampu",
      "power"
    ]
  },
  {
    "id": "EXP-LIF-268",
    "mode": "utility",
    "subject": "tekanan air",
    "alternates": [
      "aliran air",
      "air kecil"
    ]
  },
  {
    "id": "EXP-LIF-269",
    "mode": "utility",
    "subject": "AC",
    "alternates": [
      "air conditioner",
      "pendingin ruangan"
    ]
  },
  {
    "id": "EXP-LIF-270",
    "mode": "utility",
    "subject": "AC tidak dingin",
    "alternates": [
      "pendingin",
      "air conditioner"
    ]
  },
  {
    "id": "EXP-LIF-271",
    "mode": "utility",
    "subject": "Wi-Fi",
    "alternates": [
      "internet",
      "jaringan"
    ]
  },
  {
    "id": "EXP-LIF-272",
    "mode": "utility",
    "subject": "barang rumah",
    "alternates": [
      "alat rumah",
      "perbaikan"
    ]
  },
  {
    "id": "EXP-LIF-273",
    "mode": "location",
    "subject": "fasilitas terdekat",
    "alternates": [
      "apotek",
      "ATM"
    ]
  }
] as const satisfies readonly Blueprint[];

const pair = (indonesian: string, chinese: string): GoldenScenePair => ({ indonesian, chinese });
const line = (speaker: string, indonesian: string, chinese: string): GoldenSceneLine => ({ speaker, indonesian, chinese });

const getCategory = (id: string): LivingHomeCategory => {
  const number = Number(id.slice(-3));
  if (number >= 224 && number <= 233) return 'rumah-harian';
  if (number >= 234 && number <= 242) return 'urusan-rumah';
  if (number >= 243 && number <= 250) return 'masak-makan';
  if (number >= 251 && number <= 258) return 'belanja-konsumsi';
  if (number >= 259 && number <= 265) return 'antar-persediaan';
  return 'masalah-rumah';
};

const findBlueprint = (id: string) => blueprints.find((item) => item.id === id);

const repliesByMode: Record<GoldenMode, GoldenScenePair[]> = {
  location: [
    pair('Lurus saja, lalu belok kanan.', '一直走，然后右转。'),
    pair('Di sebelah kiri lift.', '在电梯左边。'),
    pair('Di lantai dua.', '在二楼。'),
    pair('Di belakang kasir.', '在收银台后面。'),
  ],
  problem: [
    pair('Baik, saya cek dulu ya.', '好的，我先检查一下。'),
    pair('Sebentar, saya ambilkan yang baru.', '等一下，我去拿新的。'),
    pair('Kalau perlu saya panggil teknisi.', '需要的话我叫维修人员。'),
    pair('Saya kabari setelah selesai.', '弄好后我再通知你。'),
  ],
  request: [
    pair('Baik, saya bantu sekarang.', '好的，我现在帮你。'),
    pair('Iya, tunggu sebentar ya.', '嗯，稍等一下。'),
    pair('Bisa, saya kerjakan dulu.', '可以，我先处理。'),
    pair('Kalau sudah selesai saya bilang ya.', '做好后我告诉你。'),
  ],
  food: [
    pair('Mau yang pedas atau tidak?', '要辣的还是不要辣的？'),
    pair('Masih dimasak, tunggu sebentar ya.', '还在做，稍等一下。'),
    pair('Kalau kurang asin, bilang saja.', '如果太淡，直接说。'),
    pair('Ada di kulkas.', '在冰箱里。'),
  ],
  shopping: [
    pair('Ada di rak sebelah kanan.', '在右边货架。'),
    pair('Harganya masih sama.', '价格还是一样。'),
    pair('Mau bayar tunai atau QRIS?', '要现金还是 QRIS？'),
    pair('Silakan pilih yang ini.', '请选这个。'),
  ],
  delivery: [
    pair('Paketnya sudah sampai.', '包裹已经到了。'),
    pair('Tinggal tunggu kurir ya.', '只要等快递员就好。'),
    pair('Alamatnya sudah benar.', '地址是对的。'),
    pair('Saya cek dulu lokasinya.', '我先看一下位置。'),
  ],
  utility: [
    pair('Baik, saya panggil orangnya.', '好的，我叫人来。'),
    pair('Sebentar, saya cek dulu.', '等一下，我先检查。'),
    pair('Nanti sore bisa diperbaiki.', '今天下午可以修。'),
    pair('Kalau masih sama, lapor lagi ya.', '如果还是一样，再告诉我。'),
  ],
};

const followUpByMode: Record<GoldenMode, GoldenScenePair> = {
  location: pair('Oh, dekat lift ya?', '哦，在电梯附近吗？'),
  problem: pair('Kalau bisa dibantu sekarang ya.', '如果可以的话，现在帮我一下。'),
  request: pair('Kalau sudah selesai kabari ya.', '做好后麻烦告诉我。'),
  food: pair('Kalau bisa jangan terlalu pedas ya.', '如果可以的话，不要太辣。'),
  shopping: pair('Yang ini berapa harganya?', '这个多少钱？'),
  delivery: pair('Saya tunggu di lobi ya.', '我在大堂等。'),
  utility: pair('Kalau bisa diperbaiki hari ini ya.', '如果可以的话，今天修好。'),
};

const closingByMode: Record<GoldenMode, GoldenScenePair> = {
  location: pair('Terima kasih ya.', '谢谢你。'),
  problem: pair('Makasih banyak ya.', '非常感谢。'),
  request: pair('Makasih ya.', '谢谢。'),
  food: pair('Oke, terima kasih.', '好的，谢谢。'),
  shopping: pair('Oke, makasih ya.', '好的，谢谢。'),
  delivery: pair('Terima kasih, saya tunggu.', '谢谢，我等着。'),
  utility: pair('Terima kasih, ya.', '谢谢。'),
};

const variationsByMode = (mode: GoldenMode, subject: string, alternates: readonly string[] = []): GoldenScenePair[] => {
  const alt = alternates[0];
  switch (mode) {
    case 'location':
      return [
        pair(`Permisi, ${subject} di mana ya?`, '不好意思，请问在哪里？'),
        pair(`Kalau mau ke ${alt ?? subject}, lewat mana?`, '如果要去那里，怎么走？'),
        pair(`Boleh tunjukkan arah ke ${subject}?`, '可以指一下去那里的方向吗？'),
        pair('Dekat lift atau bukan?', '是在电梯附近吗？'),
      ];
    case 'problem':
      return [
        pair(`Permisi, ${subject}-nya habis.`, '不好意思，这个没了。'),
        pair('Saya butuh yang baru.', '我需要新的。'),
        pair(`Kalau ${subject}-nya rusak, bisa diganti?`, '如果坏了可以换吗？'),
        pair('Saya tunggu kabarnya ya.', '我等消息。'),
      ];
    case 'request':
      return [
        pair(`Tolong bantu saya dengan ${subject} ya.`, '请帮我处理一下。'),
        pair(`Boleh tolong ${subject} dulu?`, '可以先帮我做一下吗？'),
        pair('Kalau sudah selesai, kabari saya ya.', '做好后告诉我。'),
        pair('Saya tunggu sebentar.', '我先等一下。'),
      ];
    case 'food':
      return [
        pair(`Yang ini jangan terlalu ${subject} ya.`, '这个不要太那样。'),
        pair(`Kalau bisa, ${subject}-nya dikurangi.`, '如果可以，少一点。'),
        pair('Saya mau rasa yang lebih ringan.', '我想要口味清淡一点。'),
        pair('Tambahkan sedikit saja.', '只加一点就好。'),
      ];
    case 'shopping':
      return [
        pair(`Yang ${subject} itu berapa harganya?`, '这个多少钱？'),
        pair(`Ada ${subject} yang lebih murah?`, '有更便宜的吗？'),
        pair(`Saya mau cari ${subject} yang seperti ini.`, '我想找这样的。'),
        pair('Bisa bayar pakai QRIS?', '可以用 QRIS 吗？'),
      ];
    case 'delivery':
      return [
        pair(`Pesanan ${subject} sudah sampai belum?`, '订单到了没有？'),
        pair('Kurirnya sudah sampai di mana?', '骑手到哪里了？'),
        pair('Kalau ada yang kurang, saya kabari ya.', '如果少了什么我再告诉你。'),
        pair('Saya tunggu di depan.', '我在前面等。'),
      ];
    case 'utility':
      return [
        pair(`${subject}-nya bermasalah.`, '这个出问题了。'),
        pair(`Kalau bisa, tolong cek ${subject} ya.`, '如果可以，请帮我检查一下。'),
        pair('Saya butuh bantuan untuk ini.', '我需要这方面的帮助。'),
        pair('Bisa diperbaiki hari ini?', '今天能修好吗？'),
      ];
  }
};

const buildGoldenScene = (experience: LifeExperience): GoldenSceneContent => {
  const blueprint = findBlueprint(experience.id);
  const mode = blueprint?.mode ?? 'request';
  const subject = blueprint?.subject ?? experience.task;
  const alternates = blueprint?.alternates ?? [];

  const firstReply = repliesByMode[mode][0];
  const secondReply = repliesByMode[mode][1];
  const thirdReply = repliesByMode[mode][2];
  const fourthReply = repliesByMode[mode][3];

  return {
    situation: experience.explanation,
    dialogue: [
      line('Aku', experience.indonesian || experience.task, experience.task),
      line('Dia', firstReply.indonesian, firstReply.chinese),
      line('Aku', followUpByMode[mode].indonesian, followUpByMode[mode].chinese),
      line('Dia', secondReply.indonesian, secondReply.chinese),
      line('Aku', closingByMode[mode].indonesian, closingByMode[mode].chinese),
    ],
    replies: [firstReply, secondReply, thirdReply, fourthReply],
    variations: variationsByMode(mode, subject, alternates),
    trySay: pair(experience.indonesian || experience.task, experience.task),
  };
};

const mapExperience = (experience: LifeExperience): LifeExperience => {
  const category = getCategory(experience.id);
  return {
    ...experience,
    category,
    goldenScene: buildGoldenScene(experience),
  };
};

export const livingHomeGoldenExperiences = livingHomeExperiences.map(mapExperience);
