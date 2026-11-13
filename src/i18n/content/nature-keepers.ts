import type { StaticImageData } from 'next/image';
import tanjungRusa from '@/assets/initiative/desa-wisata-tanjung-rusa.jpg';
import kiara from '@/assets/initiative/gibbon-conservation-experience-kiara.jpg';
import menuaKulan from '@/assets/initiative/hutan-adat-tuah-menua-kulan.jpg';
import klalik from '@/assets/initiative/klalik-echidna-park.jpg';
import ketambe from '@/assets/initiative/komunitas-konservasi-edukasi-ketambe.jpg';
import letsBirding from '@/assets/initiative/letsbirding-sumatra.jpg';
import kalaimis from '@/assets/initiative/wisata-alam-liar-kalaimis.jpg';
import type { Locale } from '@/i18n/config';

/* "Kenali Para Penjaga Alam" / "Meet the Nature Keepers" on /initiative.
 *
 * Copy is verbatim from the content owner. Photos live in
 * src/assets/initiative/. `image` is optional — without it the card shows a
 * plain placeholder block. */

type Localized = { title: string; tagline: string; body: string; facts: string[] };

export type NatureKeeper = {
  id: string;
  image?: StaticImageData;
  copy: Record<Locale, Localized>;
};

export const NATURE_KEEPERS: NatureKeeper[] = [
  {
    id: 'letsbirding-sumatra',
    image: letsBirding,
    copy: {
      id: {
        title: 'LetsBirding Sumatra',
        tagline: 'Burung endemik Sumatra di Beutong, Nagan Raya.',
        body: 'Trip birdwatching 4–7 hari bersama pemandu lokal berbahasa Indonesia dan Inggris. Rute bisa disesuaikan dengan target spesies, dengan homestay, transportasi, dan makan sudah termasuk.',
        facts: [
          'Lokasi: Nagan Raya, Aceh',
          'Kegiatan: Birdwatching',
          'Durasi: 4–7 hari',
          'Waktu terbaik: Juli–September',
          'Kapasitas: 6–10 orang',
          'Harga: Sesuai paket',
          'Bahasa pemandu: Indonesia, Inggris',
          'Kontak: WA 0813-6809-1314 · IG @letsbirding',
        ],
      },
      en: {
        title: 'LetsBirding Sumatra',
        tagline: 'Sumatran endemics in Beutong, Nagan Raya.',
        body: 'A 4–7 day birding trip with local guides who speak Indonesian and English. Routes can be tailored to your target species, with homestay, transport and meals included.',
        facts: [
          'Location: Nagan Raya, Aceh',
          'Activities: Birdwatching',
          'Duration: 4–7 days',
          'Best time: July–September',
          'Group size: 6–10 people',
          'Price: Varies by package',
          'Guide languages: Indonesian, English',
          'Contact: WhatsApp +62 813-6809-1314 · Instagram @letsbirding',
        ],
      },
    },
  },
  {
    id: 'ketambe',
    image: ketambe,
    copy: {
      id: {
        title: 'Komunitas Konservasi dan Edukasi Ketambe',
        tagline: 'Orangutan liar, owa, siamang, dan rangkong di hutan Ketambe.',
        body: 'Program 4–7 hari mengamati primata, burung, reptil, dan tumbuhan hutan Sumatra bersama 30 pemandu lokal. Cocok untuk rombongan besar dan kegiatan edukasi.',
        facts: [
          'Lokasi: Ketambe, Aceh',
          'Kegiatan: Primata dan mamalia, birdwatching, reptil, tumbuhan, edukasi konservasi',
          'Durasi: 4–7 hari',
          'Waktu terbaik: April–September',
          'Kapasitas: Lebih dari 20 orang',
          'Harga: Di bawah Rp1 juta/orang',
          'Bahasa pemandu: Indonesia, Inggris',
          'Kontak: WA 0812-6275-8122 · sumatrawildorangutans.wordpress.com',
        ],
      },
      en: {
        title: 'Ketambe Conservation and Education Community',
        tagline: 'Wild orangutans, gibbons, siamangs and hornbills in the Ketambe forest.',
        body: 'A 4–7 day programme to observe primates, birds, reptiles and forest plants of Sumatra with a team of 30 local guides. Well suited to large groups and educational visits.',
        facts: [
          'Location: Ketambe, Aceh',
          'Activities: Primate and mammal watching, birdwatching, reptiles, plants, conservation education',
          'Duration: 4–7 days',
          'Best time: April–September',
          'Group size: More than 20 people',
          'Price: Under Rp1 million per person',
          'Guide languages: Indonesian, English',
          'Contact: WhatsApp +62 812-6275-8122 · sumatrawildorangutans.wordpress.com',
        ],
      },
    },
  },
  {
    id: 'kiara',
    image: kiara,
    copy: {
      id: {
        title: 'Gibbon Conservation Experience – KIARA',
        tagline: 'Owa jawa, primata endemik Jawa yang hidup di hutan pegunungan Bogor.',
        body: 'Pengalaman 2–3 hari mengamati owa jawa, menginap di rumah warga, dan ikut lokakarya ecoprint (cetak motif daun pada kain) bersama masyarakat. Durasi dan ukuran rombongan bisa disesuaikan.',
        facts: [
          'Lokasi: Bogor, Jawa Barat',
          'Kegiatan: Pengamatan mamalia, wisata budaya',
          'Durasi: 2–3 hari, bisa disesuaikan',
          'Waktu terbaik: April–September',
          'Kapasitas: Bisa disesuaikan',
          'Harga: Sesuai paket',
          'Bahasa pemandu: Indonesia, bahasa daerah',
          'Kontak: WhatsApp +62 815-8653-4372 · kiara-indonesia.org · Instagram @yayasankiara',
        ],
      },
      en: {
        title: 'Gibbon Conservation Experience – KIARA',
        tagline: 'The Javan gibbon, endemic to Java, in the mountain forests of Bogor.',
        body: 'A 2–3 day experience to watch Javan gibbons, stay with local families and join an ecoprint workshop (leaf-printing on fabric) with the community. Duration and group size are flexible.',
        facts: [
          'Location: Bogor, West Java',
          'Activities: Mammal watching, cultural tourism',
          'Duration: 2–3 days, flexible',
          'Best time: April–September',
          'Group size: Flexible',
          'Price: Varies by package',
          'Guide languages: Indonesian, local language',
          'Contact: WhatsApp +62 815-8653-4372 · kiara-indonesia.org · Instagram @yayasankiara',
        ],
      },
    },
  },
  {
    id: 'tanjung-rusa',
    image: tanjungRusa,
    copy: {
      id: {
        title: 'Desa Wisata Tanjung Rusa',
        tagline: 'Lutung putih yang langka di pesisir Belitung.',
        body: 'Perjalanan sehari mencari lutung kelabu berwarna putih (leusistik), mengamati burung, menyusuri pesisir dengan perahu, dan mengenal budaya desa. Bisa dikunjungi sepanjang tahun.',
        facts: [
          'Lokasi: Belitung, Bangka Belitung',
          'Kegiatan: Pengamatan mamalia dan burung, wisata budaya',
          'Durasi: 1 hari, bisa disesuaikan',
          'Waktu terbaik: Sepanjang tahun',
          'Kapasitas: 3–5 orang',
          'Harga: Di bawah Rp1 juta/orang',
          'Bahasa pemandu: Indonesia',
          'Kontak: WhatsApp +62 817-5210-792 · rusaputih.com · Instagram @visittanjungrusa',
        ],
      },
      en: {
        title: 'Tanjung Rusa Tourism Village',
        tagline: 'Rare white langurs on the coast of Belitung.',
        body: 'A one-day trip to look for leucistic (white) silvered langurs, watch birds, explore the coast by boat and get to know village culture. Open all year round.',
        facts: [
          'Location: Belitung, Bangka Belitung Islands',
          'Activities: Mammal watching, birdwatching, cultural tourism',
          'Duration: 1 day, flexible',
          'Best time: All year',
          'Group size: 3–5 people',
          'Price: Under Rp1 million per person',
          'Guide languages: Indonesian',
          'Contact: WhatsApp +62 817-5210-792 · rusaputih.com · Instagram @visittanjungrusa',
        ],
      },
    },
  },
  {
    id: 'menua-kulan',
    image: menuaKulan,
    copy: {
      id: {
        title: 'Hutan Adat Tuah Menua Kulan',
        tagline: 'Rangkong dan burung endemik Borneo di hutan adat.',
        body: 'Pengamatan burung selama 2–3 hari di hutan yang dijaga lembaga adat, dengan incaran rangkong gading, kangkareng hitam, julang jambul-hitam, dan tiong-batu kalimantan. Tersedia perahu dan bilik kamuflase untuk memotret satwa.',
        facts: [
          'Lokasi: Kalimantan (kabupaten menunggu konfirmasi)',
          'Kegiatan: Pengamatan dan fotografi burung',
          'Durasi: 2–3 hari',
          'Waktu terbaik: Januari–Maret, Oktober–Desember',
          'Kapasitas: 6–10 orang',
          'Harga: Di bawah Rp1 juta/orang',
          'Bahasa pemandu: Indonesia',
          'Kontak: WhatsApp 0821-5240-8736 · jalailintang.id · Instagram @menua_kulan',
        ],
      },
      en: {
        title: 'Hutan Adat Tuah Menua Kulan',
        tagline: 'Hornbills and Bornean endemics in a community-guarded customary forest.',
        body: 'A 2–3 day birding trip in a forest protected by its customary (adat) institution, targeting Helmeted, Black and Wrinkled Hornbills and the Bornean Bristlehead. Boats and a photography hide are available.',
        facts: [
          'Location: Kalimantan (regency to be confirmed)',
          'Activities: Birdwatching, bird photography',
          'Duration: 2–3 days',
          'Best time: January–March, October–December',
          'Group size: 6–10 people',
          'Price: Under Rp1 million per person',
          'Guide languages: Indonesian',
          'Contact: WhatsApp +62 821-5240-8736 · jalailintang.id · Instagram @menua_kulan',
        ],
      },
    },
  },
  {
    id: 'klalik-echidna-park',
    image: klalik,
    copy: {
      id: {
        title: 'Klalik Echidna Park',
        tagline: 'Nokdiak (echidna), mamalia bertelur dari hutan Papua.',
        body: 'Penjelajahan 4–7 hari bersama Pokdarwis Kampung Klalik mencari landak semut, burung, dan reptil endemik Papua. Pemandu, penginapan warga, transportasi, dan makan sudah termasuk.',
        facts: [
          'Lokasi: Kabupaten Sorong, Papua Barat Daya',
          'Kegiatan: Pengamatan mamalia, burung, dan reptil',
          'Durasi: 4–7 hari',
          'Waktu terbaik: Sepanjang tahun',
          'Kapasitas: 6–10 orang',
          'Harga: Rp5–10 juta/orang',
          'Bahasa pemandu: Indonesia',
          'Kontak: WhatsApp 0852-5235-8286 · Facebook: Klalik Echidna Park',
        ],
      },
      en: {
        title: 'Klalik Echidna Park',
        tagline: 'The echidna, an egg-laying mammal of the Papuan forest.',
        body: 'A 4–7 day expedition with the Klalik village tourism group to search for echidnas and Papua’s endemic birds and reptiles. Guides, homestay, transport and meals are included.',
        facts: [
          'Location: Sorong Regency, Southwest Papua',
          'Activities: Mammal, bird and reptile watching',
          'Duration: 4–7 days',
          'Best time: All year',
          'Group size: 6–10 people',
          'Price: Rp5–10 million per person',
          'Guide languages: Indonesian',
          'Contact: WhatsApp +62 852-5235-8286 · Facebook: Klalik Echidna Park',
        ],
      },
    },
  },
  {
    id: 'kalaimis',
    image: kalaimis,
    copy: {
      id: {
        title: 'Wisata Alam Liar Kalaimis',
        tagline: 'Cenderawasih hingga raja udang, burung ikonik yang bisa kamu amati dekat dari penginapan.',
        body: 'Wisata ini menawarkan pengalaman mengamati burung endemik Papua, reptil, amfibi, serangga, dan tiga air terjun dalam satu kawasan. Tersedia binokular dan teropong monokuler untuk pengamatan.',
        facts: [
          'Lokasi: Distrik Makbon, Kabupaten Sorong, Papua Barat Daya',
          'Kegiatan: Pengamatan burung, mamalia, reptil, dan tumbuhan, wisata budaya',
          'Durasi: 2–3 hari, bisa disesuaikan',
          'Waktu terbaik: Sepanjang tahun',
          'Kapasitas: 3–5 orang',
          'Harga: Sesuai paket',
          'Bahasa pemandu: Indonesia, Inggris',
          'Kontak: WhatsApp 0812-4362-5146 · Instagram @Kalaimis Wildlife Tourism',
        ],
      },
      en: {
        title: 'Kalaimis Wildlife Tourism',
        tagline: 'Birds-of-paradise and Vogelkop kingfishers, a short walk from the homestay.',
        body: 'Kalaimis offers Papuan endemic birds, reptiles, amphibians, insects and three waterfalls in one area. Binoculars and a spotting scope are provided.',
        facts: [
          'Location: Makbon District, Sorong Regency, Southwest Papua',
          'Activities: Bird, mammal, reptile and plant watching, cultural tourism',
          'Duration: 2–3 days, flexible',
          'Best time: All year',
          'Group size: 3–5 people',
          'Price: Varies by package',
          'Guide languages: Indonesian, English',
          'Contact: WhatsApp +62 812-4362-5146 · Instagram @Kalaimis Wildlife Tourism',
        ],
      },
    },
  },
];
