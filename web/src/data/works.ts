// Portfolio works data. All videos are YOUR local assets, never stock images.
// Add authorized MP4 files to web/public/works/videos/ to enable moving covers.
export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
  desc?: string
  role?: string
  video?: string
}
export interface WorkGroup { heading: string; items: string[] }
export interface WorkSection {
  id: string; no: string; title: string; tagline: string
  items?: WorkListItem[]; groups?: WorkGroup[]; awards?: string[]; footer?: string
}
export interface WorksLang {
  title: string; closeLabel: string; openLabel: string; hint: string
  awardsLabel: string; visitLabel: string; detailPlaceholder: string
  phImageLabel: string; phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}
export const WORKS: Record<'en' | 'kn', WorksLang> = {
  en: {
    title: 'Selected Works',
    closeLabel: 'Close',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Awards',
    visitLabel: 'Watch video',
    detailPlaceholder: 'More details coming soon',
    phImageLabel: 'Video',
    phButtonLabel: 'Watch',
    countLabel: (n) => `${n} works`,
    sections: [
      {
      id: 'productions', no: '01', title: 'Productions', tagline: 'Concept · Script · Visuals · Direction',
      items: [
        { name: 'Technology', slug: 'tech', meta: 'Concept · Script · Production · Direction', link: 'https://www.instagram.com/p/DeHRhLnzswi/', desc: 'Developed the concept, wrote the script, generated video visuals, contributed to production and directed the video before editing.', role: 'Creative production', video: '/works/videos/tech.mp4', tags: ['Video'] },
        { name: 'Home Appliances', slug: 'appliance', meta: 'Concept · Script · Production · Direction', link: 'https://www.instagram.com/p/DeMc_pKP1t1/', desc: 'Developed the concept, wrote the script, generated video visuals, contributed to production and directed the video before editing.', role: 'Creative production', video: '/works/videos/appliance.mp4', tags: ['Video'] },
        { name: 'Polar Bear', slug: 'polar-bear', meta: 'Concept · Script · Production · Direction', link: 'https://www.instagram.com/p/DbdYCHOys14/', desc: 'Developed the concept, wrote the script, generated video visuals, contributed to production and directed the video before editing.', role: 'Creative production', video: '/works/videos/polar-bear.mp4', tags: ['Video'] },
        { name: 'Business Stories', slug: 'business-story', meta: 'Concept · Script · Production · Direction', link: 'https://www.instagram.com/p/DdRNQICvkXu/', desc: 'Developed the concept, wrote the script, generated video visuals, contributed to production and directed the video before editing.', role: 'Creative production', video: '/works/videos/business-story.mp4', tags: ['Video'] }
      ],
    },
      {
      id: 'campaigns', no: '02', title: 'Campaigns', tagline: 'Little Bengaluru Stories · 8 episodes',
      items: [
        { name: 'Temples of Bengaluru', slug: 'temples-bengaluru', meta: '8-episode series', link: 'https://www.instagram.com/reel/Daxg7UtSCxt/', desc: 'Wrote scripts for all eight episodes of the Temples of Bengaluru heritage series for Little Bengaluru Stories.', role: 'Scriptwriter — all 8 episodes', video: '/works/videos/temples-bengaluru.mp4', tags: ['Heritage', 'Series'] }
      ],
    },
      {
      id: 'music', no: '03', title: 'Music', tagline: 'Content creation · Guitar · Vocals',
      items: [
        { name: 'MyRaag', slug: 'myraag', meta: 'Carnatic fusion', desc: 'Musical content creation, rhythm guitar and vocals with the Carnatic fusion band MyRaag.', role: 'Musical creator · Rhythm guitar · Vocals', video: '/works/videos/myraag.mp4', tags: ['Music'] },
        { name: 'Mini Amp Stories', slug: 'mini-amp-stories', meta: 'Music & performance', desc: 'Musical content creation, rhythm guitar and vocals for Mini Amp Stories.', role: 'Musical creator · Rhythm guitar · Vocals', video: '/works/videos/mini-amp-stories.mp4', tags: ['Music'] }
      ],
    },
      {
      id: 'upcoming', no: '04', title: 'In the Making', tagline: 'Five upcoming ventures',
      items: [
        { name: 'Creators & Co.', slug: 'creators-and-co', meta: 'In development', desc: 'A production company built for creators.' },
        { name: 'Business Stories Explainer', slug: 'business-explainers', meta: 'Name to be announced', desc: 'An upcoming channel exploring and explaining business stories.' },
        { name: 'Trio Tales', slug: 'trio-tales', meta: 'Comedy channel', desc: 'An upcoming comedy channel.' },
        { name: 'Guitar Learning Channel', slug: 'guitar-learning', meta: 'YouTube · Education', desc: 'An upcoming YouTube channel for learning guitar.' },
        { name: 'Guesstimato', slug: 'guesstimato', meta: 'Business guessing game · Under 60s', desc: 'A host asks local businesses four or five questions, guesses their monthly or annual turnover, then reveals only whether the guess was correct — never the actual amount. Every video is under 60 seconds.' }
      ],
      footer: 'Concepts in development — not yet launched.',
    }
    ],
  },
  kn: {
    title: 'ಆಯ್ದ ಕೆಲಸಗಳು',
    closeLabel: 'ಮುಚ್ಚಿ',
    openLabel: 'ವೀಕ್ಷಿಸಿ',
    hint: 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ',
    awardsLabel: 'ಪ್ರಶಸ್ತಿಗಳು',
    visitLabel: 'ವೀಡಿಯೊ ನೋಡಿ',
    detailPlaceholder: 'ಹೆಚ್ಚಿನ ವಿವರಗಳು ಶೀಘ್ರದಲ್ಲೇ',
    phImageLabel: 'ವೀಡಿಯೊ',
    phButtonLabel: 'ವೀಕ್ಷಿಸಿ',
    countLabel: (n) => `${n} ಕೆಲಸಗಳು`,
    sections: [
      {
      id: 'productions', no: '01', title: 'ವೀಡಿಯೊ ನಿರ್ಮಾಣ', tagline: 'ಪರಿಕಲ್ಪನೆ · ಸ್ಕ್ರಿಪ್ಟ್ · ದೃಶ್ಯ · ನಿರ್ದೇಶನ',
      items: [
        { name: 'ತಂತ್ರಜ್ಞಾನ', slug: 'tech', meta: 'ಪರಿಕಲ್ಪನೆ · ಸ್ಕ್ರಿಪ್ಟ್ · ನಿರ್ಮಾಣ · ನಿರ್ದೇಶನ', link: 'https://www.instagram.com/p/DeHRhLnzswi/', desc: 'ಪರಿಕಲ್ಪನೆ, ಸ್ಕ್ರಿಪ್ಟ್, ವೀಡಿಯೊ ದೃಶ್ಯಗಳ ರಚನೆ, ನಿರ್ಮಾಣ ಮತ್ತು ಎಡಿಟಿಂಗ್\u200cಗೆ ಮುನ್ನ ನಿರ್ದೇಶನ.', role: 'ಸೃಜನಾತ್ಮಕ ನಿರ್ಮಾಣ', video: '/works/videos/tech.mp4', tags: ['Video'] },
        { name: 'ಗೃಹೋಪಯೋಗಿ ಸಾಧನಗಳು', slug: 'appliance', meta: 'ಪರಿಕಲ್ಪನೆ · ಸ್ಕ್ರಿಪ್ಟ್ · ನಿರ್ಮಾಣ · ನಿರ್ದೇಶನ', link: 'https://www.instagram.com/p/DeMc_pKP1t1/', desc: 'ಪರಿಕಲ್ಪನೆ, ಸ್ಕ್ರಿಪ್ಟ್, ವೀಡಿಯೊ ದೃಶ್ಯಗಳ ರಚನೆ, ನಿರ್ಮಾಣ ಮತ್ತು ಎಡಿಟಿಂಗ್\u200cಗೆ ಮುನ್ನ ನಿರ್ದೇಶನ.', role: 'ಸೃಜನಾತ್ಮಕ ನಿರ್ಮಾಣ', video: '/works/videos/appliance.mp4', tags: ['Video'] },
        { name: 'ಹಿಮಕರಡಿ', slug: 'polar-bear', meta: 'ಪರಿಕಲ್ಪನೆ · ಸ್ಕ್ರಿಪ್ಟ್ · ನಿರ್ಮಾಣ · ನಿರ್ದೇಶನ', link: 'https://www.instagram.com/p/DbdYCHOys14/', desc: 'ಪರಿಕಲ್ಪನೆ, ಸ್ಕ್ರಿಪ್ಟ್, ವೀಡಿಯೊ ದೃಶ್ಯಗಳ ರಚನೆ, ನಿರ್ಮಾಣ ಮತ್ತು ಎಡಿಟಿಂಗ್\u200cಗೆ ಮುನ್ನ ನಿರ್ದೇಶನ.', role: 'ಸೃಜನಾತ್ಮಕ ನಿರ್ಮಾಣ', video: '/works/videos/polar-bear.mp4', tags: ['Video'] },
        { name: 'ಉದ್ಯಮ ಕಥೆಗಳು', slug: 'business-story', meta: 'ಪರಿಕಲ್ಪನೆ · ಸ್ಕ್ರಿಪ್ಟ್ · ನಿರ್ಮಾಣ · ನಿರ್ದೇಶನ', link: 'https://www.instagram.com/p/DdRNQICvkXu/', desc: 'ಪರಿಕಲ್ಪನೆ, ಸ್ಕ್ರಿಪ್ಟ್, ವೀಡಿಯೊ ದೃಶ್ಯಗಳ ರಚನೆ, ನಿರ್ಮಾಣ ಮತ್ತು ಎಡಿಟಿಂಗ್\u200cಗೆ ಮುನ್ನ ನಿರ್ದೇಶನ.', role: 'ಸೃಜನಾತ್ಮಕ ನಿರ್ಮಾಣ', video: '/works/videos/business-story.mp4', tags: ['Video'] }
      ],
    },
      {
      id: 'campaigns', no: '02', title: 'ಅಭಿಯಾನಗಳು', tagline: 'ಲಿಟಲ್ ಬೆಂಗಳೂರು ಸ್ಟೋರೀಸ್ · 8 ಕಂತುಗಳು',
      items: [
        { name: 'ಬೆಂಗಳೂರಿನ ದೇವಾಲಯಗಳು', slug: 'temples-bengaluru', meta: '8 ಕಂತುಗಳ ಸರಣಿ', link: 'https://www.instagram.com/reel/Daxg7UtSCxt/', desc: 'ಲಿಟಲ್ ಬೆಂಗಳೂರು ಸ್ಟೋರೀಸ್\u200cನ ಬೆಂಗಳೂರಿನ ದೇವಾಲಯಗಳು ಸರಣಿಯ ಎಲ್ಲಾ ಎಂಟು ಕಂತುಗಳಿಗೆ ಸ್ಕ್ರಿಪ್ಟ್ ಬರೆದಿದ್ದೇನೆ.', role: 'ಸ್ಕ್ರಿಪ್ಟ್ ರೈಟರ್ — ಎಲ್ಲಾ 8 ಕಂತುಗಳು', video: '/works/videos/temples-bengaluru.mp4', tags: ['ಪರಂಪರೆ', 'ಸರಣಿ'] }
      ],
    },
      {
      id: 'music', no: '03', title: 'ಸಂಗೀತ', tagline: 'ಕಂಟೆಂಟ್ ರಚನೆ · ಗಿಟಾರ್ · ಗಾಯನ',
      items: [
        { name: 'MyRaag', slug: 'myraag', meta: 'ಕರ್ನಾಟಕ ಸಂಗೀತ ಫ್ಯೂಷನ್', desc: 'ಮೈರಾಗ್ ಕರ್ನಾಟಕ ಸಂಗೀತ ಫ್ಯೂಷನ್ ಬ್ಯಾಂಡ್\u200cನಲ್ಲಿ ಸಂಗೀತ ಕಂಟೆಂಟ್ ರಚನೆ, ರಿದಮ್ ಗಿಟಾರ್ ಮತ್ತು ಗಾಯನ.', role: 'ಸಂಗೀತ ರಚನೆ · ರಿದಮ್ ಗಿಟಾರ್ · ಗಾಯನ', video: '/works/videos/myraag.mp4', tags: ['ಸಂಗೀತ'] },
        { name: 'Mini Amp Stories', slug: 'mini-amp-stories', meta: 'ಸಂಗೀತ ಮತ್ತು ಪ್ರದರ್ಶನ', desc: 'ಮಿನಿ ಆಂಪ್ ಸ್ಟೋರೀಸ್\u200cಗಾಗಿ ಸಂಗೀತ ಕಂಟೆಂಟ್ ರಚನೆ, ರಿದಮ್ ಗಿಟಾರ್ ಮತ್ತು ಗಾಯನ.', role: 'ಸಂಗೀತ ರಚನೆ · ರಿದಮ್ ಗಿಟಾರ್ · ಗಾಯನ', video: '/works/videos/mini-amp-stories.mp4', tags: ['ಸಂಗೀತ'] }
      ],
    },
      {
      id: 'upcoming', no: '04', title: 'ರೂಪುಗೊಳ್ಳುತ್ತಿರುವ ಯೋಜನೆಗಳು', tagline: 'ಐದು ಮುಂಬರುವ ಯೋಜನೆಗಳು',
      items: [
        { name: 'Creators & Co.', slug: 'creators-and-co', meta: 'ಅಭಿವೃದ್ಧಿಯಲ್ಲಿದೆ', desc: 'ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್\u200cಗಳಿಗಾಗಿ ನಿರ್ಮಾಣ ಸಂಸ್ಥೆ.' },
        { name: 'ಉದ್ಯಮ ಕಥೆಗಳ ವಿವರಣೆ', slug: 'business-explainers', meta: 'ಹೆಸರು ಇನ್ನೂ ನಿಗದಿಯಾಗಿಲ್ಲ', desc: 'ಉದ್ಯಮ ಕಥೆಗಳನ್ನು ವಿವರಿಸುವ ಹೊಸ ಚಾನೆಲ್.' },
        { name: 'Trio Tales', slug: 'trio-tales', meta: 'ಹಾಸ್ಯ ಚಾನೆಲ್', desc: 'ಮುಂಬರುವ ಹಾಸ್ಯ ಚಾನೆಲ್.' },
        { name: 'ಗಿಟಾರ್ ಕಲಿಕೆ ಚಾನೆಲ್', slug: 'guitar-learning', meta: 'ಯೂಟ್ಯೂಬ್ · ಶಿಕ್ಷಣ', desc: 'ಗಿಟಾರ್ ಕಲಿಯಲು ಮುಂಬರುವ ಯೂಟ್ಯೂಬ್ ಚಾನೆಲ್.' },
        { name: 'Guesstimato', slug: 'guesstimato', meta: 'ಉದ್ಯಮ ಊಹೆ · 60 ಸೆಕೆಂಡ್ ಒಳಗೆ', desc: 'ನಿರೂಪಕರು ಸ್ಥಳೀಯ ಉದ್ಯಮಗಳಿಗೆ ನಾಲ್ಕೈದು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮಾಸಿಕ ಅಥವಾ ವಾರ್ಷಿಕ ವಹಿವಾಟನ್ನು ಊಹಿಸುತ್ತಾರೆ. ನಿಖರ ಮೊತ್ತವನ್ನು ಹೇಳದೆ, ಊಹೆ ಸರಿಯೋ ತಪ್ಪೋ ಮಾತ್ರ ತಿಳಿಸುತ್ತಾರೆ. ಪ್ರತಿಯೊಂದು ವೀಡಿಯೊ 60 ಸೆಕೆಂಡ್\u200cಗಳೊಳಗೆ.' }
      ],
      footer: 'ಅಭಿವೃದ್ಧಿಯಲ್ಲಿರುವ ಪರಿಕಲ್ಪನೆಗಳು — ಇನ್ನೂ ಆರಂಭವಾಗಿಲ್ಲ.',
    }
    ],
  },
}
// No remote/stock cover images. Covers come from locally supplied videos only.

export const SECTION_COVERS: Record<string, string> = {
  productions: `${import.meta.env.BASE_URL}works/covers/Sagar%20BTS%20.png`,
  campaigns: `${import.meta.env.BASE_URL}works/covers/Sagar%20Campaigns.png`,
  music: `${import.meta.env.BASE_URL}works/covers/Sagar%20Music.png`,
}

export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
