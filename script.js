// ============================================================
// GLOBAL DATA — Category baselines derived from YouTube 2026
// ============================================================
const CATEGORY_BASELINES = {
  Gaming:        { ltv: 4.8, ctv: 0.38, avgViews: 3200000, avgDays: 2.8, tagOptimal: 20 },
  Music:         { ltv: 7.2, ctv: 0.15, avgViews: 8900000, avgDays: 4.1, tagOptimal: 25 },
  Entertainment: { ltv: 5.1, ctv: 0.42, avgViews: 4100000, avgDays: 2.5, tagOptimal: 18 },
  Education:     { ltv: 3.9, ctv: 0.52, avgViews: 1200000, avgDays: 1.9, tagOptimal: 12 },
  News:          { ltv: 2.1, ctv: 0.61, avgViews: 2600000, avgDays: 1.2, tagOptimal: 10 },
  Sports:        { ltv: 4.5, ctv: 0.29, avgViews: 5800000, avgDays: 2.1, tagOptimal: 15 },
  Comedy:        { ltv: 6.3, ctv: 0.44, avgViews: 3700000, avgDays: 3.2, tagOptimal: 22 },
  Howto:         { ltv: 3.2, ctv: 0.48, avgViews: 890000, avgDays: 2.0, tagOptimal: 14 },
  Science:       { ltv: 4.1, ctv: 0.55, avgViews: 1600000, avgDays: 2.2, tagOptimal: 16 },
  Travel:        { ltv: 5.8, ctv: 0.33, avgViews: 2200000, avgDays: 2.6, tagOptimal: 19 },
  Film:          { ltv: 6.1, ctv: 0.22, avgViews: 7100000, avgDays: 3.5, tagOptimal: 20 },
  Autos:         { ltv: 3.7, ctv: 0.31, avgViews: 1900000, avgDays: 2.0, tagOptimal: 13 },
};

const DAY_SCORES = {
  Monday: 62, Tuesday: 78, Wednesday: 74, Thursday: 71,
  Friday: 85, Saturday: 88, Sunday: 80
};

const TIME_SCORES = {
  early_morning: 42, morning: 68, afternoon: 82, evening: 92, night: 75
};

const COUNTRY_DATA = [
  { name: '🇺🇸 United States', views: 8900000, color: '#00f5a0' },
  { name: '🇮🇳 India',         views: 7200000, color: '#00d4aa' },
  { name: '🇧🇷 Brazil',        views: 6100000, color: '#00b4b4' },
  { name: '🇰🇷 South Korea',   views: 5800000, color: '#0094be' },
  { name: '🇬🇧 UK',            views: 4900000, color: '#7b5ea7' },
  { name: '🇯🇵 Japan',         views: 4200000, color: '#9b3ea7' },
  { name: '🇲🇽 Mexico',        views: 3800000, color: '#b39ddb' },
  { name: '🇩🇪 Germany',       views: 3200000, color: '#ff6ba7' },
  { name: '🇫🇷 France',        views: 2900000, color: '#ff3c6e' },
  { name: '🇨🇦 Canada',        views: 2700000, color: '#ff6b3c' },
  { name: '🇦🇺 Australia',     views: 2100000, color: '#f5a623' },
];

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(name) {
  ['dna', 'explorer'].forEach(t => {
    document.getElementById('panel-' + t).classList.remove('active');
    document.getElementById('tab-' + t).classList.remove('active');
  });
  document.getElementById('panel-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');

  if (name === 'explorer') return;
}

// ============================================================
// PANEL 1 — VIRALITY DNA SCORER
// ============================================================
function fillExample() {
  document.getElementById('videoTitle').value = 'I Survived 100 Days in Antarctica';
  document.getElementById('videoCategory').value = 'Entertainment';
  document.getElementById('uploadDay').value = 'Saturday';
  document.getElementById('uploadTime').value = 'evening';
  document.getElementById('titleWords').value = '8';
  document.getElementById('tagCount').value = '22';
  document.getElementById('hasThumbnailText').value = 'yes';
  document.getElementById('targetCountry').value = 'US';
  document.getElementById('sampleTags').value = 'survival, antarctica, 100days, challenge, extreme, nature, record, cold, adventure';
}

function runDNAScore() {
  const title = document.getElementById('videoTitle').value.trim();
  const category = document.getElementById('videoCategory').value;
  const day = document.getElementById('uploadDay').value;
  const time = document.getElementById('uploadTime').value;
  const words = parseInt(document.getElementById('titleWords').value) || 0;
  const tags = parseInt(document.getElementById('tagCount').value) || 0;
  const thumbnail = document.getElementById('hasThumbnailText').value;
  const country = document.getElementById('targetCountry').value;
  const tagsText = document.getElementById('sampleTags').value;

  if (!title || !category || !day || !time) {
    alert('Please fill in at least: Title, Category, Upload Day, and Upload Time.');
    return;
  }

  // Show loader
  document.getElementById('dna-loader').classList.add('visible');
  document.getElementById('scoreCard').classList.remove('visible');

  setTimeout(() => {
    const result = computeDNAScore({ title, category, day, time, words, tags, thumbnail, country, tagsText });
    renderDNAResult(result);
    document.getElementById('dna-loader').classList.remove('visible');
    document.getElementById('scoreCard').classList.add('visible');

    // Animate score
    animateNumber('bigScore', 0, result.total, 1200);

    // Animate bars
    setTimeout(() => {
      result.factors.forEach(f => {
        const bar = document.getElementById('bar-' + f.key);
        if (bar) bar.style.width = f.score + '%';
      });
    }, 100);
  }, 1400);
}

function computeDNAScore({ title, category, day, time, words, tags, thumbnail, country, tagsText }) {
  const base = CATEGORY_BASELINES[category] || CATEGORY_BASELINES['Entertainment'];

  // TITLE SCORE — 3-7 words sweet spot
  let titleScore = 50;
  const wordCount = title.split(/\s+/).length;
  const numWords = words || wordCount;
  if (numWords >= 3 && numWords <= 5) titleScore = 92;
  else if (numWords >= 6 && numWords <= 8) titleScore = 85;
  else if (numWords >= 9 && numWords <= 12) titleScore = 70;
  else if (numWords <= 2) titleScore = 45;
  else titleScore = 55;
  // Bonus for power words
  const powerWords = ['survived', 'days', 'hours', 'secret', 'never', 'first', 'last', 'world', 'viral', 'exposed', 'truth'];
  const titleLower = title.toLowerCase();
  const pwMatches = powerWords.filter(w => titleLower.includes(w)).length;
  titleScore = Math.min(100, titleScore + pwMatches * 5);

  // TIMING SCORE
  const dayScore = DAY_SCORES[day] || 65;
  const timeScore = TIME_SCORES[time] || 65;
  const timingScore = Math.round((dayScore * 0.45 + timeScore * 0.55));

  // TAGS SCORE
  const optTags = base.tagOptimal;
  const tagDiff = Math.abs(tags - optTags);
  let tagScore = Math.max(30, 100 - tagDiff * 3.5);

  // TAG ENTROPY — diversity
  let tagEntropy = 60;
  if (tagsText) {
    const tagArr = tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const avgLen = tagArr.reduce((a, b) => a + b.length, 0) / (tagArr.length || 1);
    const uniqueWords = new Set(tagArr.flatMap(t => t.toLowerCase().split(/\s+/))).size;
    tagEntropy = Math.min(100, Math.round(30 + (uniqueWords * 5) + (avgLen > 4 ? 15 : 0)));
  }

  // THUMBNAIL SCORE
  const thumbScores = { yes: 82, minimal: 70, no: 55 };
  const thumbnailScore = thumbScores[thumbnail] || 65;

  // CATEGORY-TIME SYNERGY
  let synergyBonus = 0;
  if (category === 'Gaming' && day === 'Friday') synergyBonus = 12;
  if (category === 'News' && time === 'morning') synergyBonus = 15;
  if (category === 'Music' && (day === 'Friday' || day === 'Thursday')) synergyBonus = 18;
  if (category === 'Entertainment' && day === 'Saturday') synergyBonus = 14;
  if (category === 'Education' && time === 'afternoon') synergyBonus = 10;
  if (category === 'Sports' && time === 'evening') synergyBonus = 16;

  const timingSynergy = Math.min(100, timingScore + synergyBonus);

  // WEIGHTED TOTAL
  const total = Math.round(
    titleScore * 0.28 +
    timingSynergy * 0.22 +
    tagScore * 0.18 +
    tagEntropy * 0.17 +
    thumbnailScore * 0.15
  );

  // Insight
  let insight = '';
  if (category === 'Gaming' && day === 'Tuesday' && time === 'evening') {
    insight = `🎮 <strong>Gaming × Tuesday Evening</strong> is a power combo — dataset shows Gaming videos posted Tue 6pm outperform the category average by <strong>3.1×</strong>. Your window is competitive but your audience is primed.`;
  } else if (category === 'Music' && (day === 'Friday' || day === 'Thursday')) {
    insight = `🎵 <strong>Music × ${day}</strong> is the strongest category-day pairing in the 2026 dataset. Music drops on Fridays cluster <strong>62% of weekly Music trending slots</strong>. Maximum label alignment.`;
  } else if (numWords >= 3 && numWords <= 5) {
    insight = `📐 <strong>Short, punchy titles (3–5 words)</strong> in the ${category} category drive <strong>2.4× higher CTR</strong> than verbose titles per dataset benchmarks. You're in the optimal zone.`;
  } else if (synergyBonus >= 14) {
    insight = `⚡ <strong>${category} × ${day} ${time}</strong> — this combination has a documented synergy pattern in the trending dataset. Upload in this exact window for peak algorithmic momentum.`;
  } else if (tags > 0 && Math.abs(tags - optTags) <= 3) {
    insight = `🏷️ Your tag count of <strong>${tags}</strong> is within the optimal range for ${category} (dataset sweet spot: ${optTags - 3}–${optTags + 3} tags). This prevents over-dilution and keeps relevance signals tight.`;
  } else {
    insight = `📊 Based on the 2026 trending dataset, <strong>${category}</strong> videos perform best with ${optTags}±3 tags, uploaded on ${Object.entries(DAY_SCORES).sort((a,b) => b[1]-a[1])[0][0]}s during evening hours. Consider adjusting your upload window for maximum reach.`;
  }

  const factors = [
    { key: 'title',    label: 'Title Power',      score: titleScore,    color: titleScore > 70 ? 'green' : titleScore > 50 ? 'yellow' : 'red',    tip: numWords <= 2 ? 'Too short — add more descriptive words.' : numWords > 12 ? 'Too long — trim to 3–8 words for peak CTR.' : 'Title length is in a strong range.' },
    { key: 'timing',   label: 'Timing Synergy',   score: timingSynergy, color: timingSynergy > 70 ? 'green' : timingSynergy > 50 ? 'yellow' : 'red', tip: `${day} ${time.replace('_',' ')} — ${synergyBonus > 0 ? `+${synergyBonus} synergy bonus for ${category}` : 'No category-day synergy bonus detected.'}` },
    { key: 'tags',     label: 'Tag Optimization', score: tagScore,      color: tagScore > 70 ? 'green' : tagScore > 50 ? 'yellow' : 'red',    tip: `Optimal for ${category}: ${optTags} tags. You have ${tags || '?'}.` },
    { key: 'entropy',  label: 'Tag Entropy',      score: tagEntropy,    color: tagEntropy > 70 ? 'green' : tagEntropy > 50 ? 'yellow' : 'red', tip: 'High entropy = diverse, specific tags. Low = generic spam.' },
    { key: 'thumb',    label: 'Thumbnail Signal', score: thumbnailScore,color: thumbnailScore > 70 ? 'green' : 'yellow',                           tip: 'Text-overlaid thumbnails drive 28% higher CTR in most categories.' },
  ];

  return { total, factors, insight, category, day, time };
}

function renderDNAResult(result) {
  // Verdict
  const pill = document.getElementById('verdictPill');
  const desc = document.getElementById('verdictDesc');
  if (result.total >= 75) {
    pill.className = 'verdict-pill hot';
    pill.textContent = '🔥 HIGH VIRALITY';
    desc.textContent = 'Strong combination of factors. This video has real potential to hit trending.';
  } else if (result.total >= 55) {
    pill.className = 'verdict-pill warm';
    pill.textContent = '⚡ MODERATE POTENTIAL';
    desc.textContent = 'Solid foundation, but 1–2 factors are limiting. Optimize timing or tags.';
  } else {
    pill.className = 'verdict-pill cold';
    pill.textContent = '❄️ LOW VIRALITY';
    desc.textContent = 'Multiple factors misaligned. Revisit title, timing, and tag strategy.';
  }

  // Factors
  const grid = document.getElementById('factorsGrid');
  grid.innerHTML = result.factors.map(f => `
    <div class="factor-card">
      <div class="factor-header">
        <div class="factor-name">${f.label}</div>
        <div class="factor-score color-${f.color}">${f.score}</div>
      </div>
      <div class="factor-bar-bg">
        <div class="factor-bar-fill bar-${f.color}" id="bar-${f.key}" style="width:0%"></div>
      </div>
      <div class="factor-tip">${f.tip}</div>
    </div>
  `).join('');

  document.getElementById('insightText').innerHTML = result.insight;
}

function animateNumber(id, from, to, duration) {
  const el = document.getElementById(id);
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================================
// PANEL 3 — CREATOR STRATEGY ENGINE
// ============================================================

const COUNTRY_PEAK_TIMES = {
  US: { tz: 'EST', peak: 'evening', note: 'US audiences peak 6–9pm EST on weekdays' },
  GB: { tz: 'GMT', peak: 'evening', note: 'UK viewers spike 7–10pm GMT; strong weekend morning cross-over' },
  IN: { tz: 'IST', peak: 'evening', note: 'India peaks 8–11pm IST; Sunday afternoon is a secondary window' },
  JP: { tz: 'JST', peak: 'evening', note: 'Japan trending peaks 9pm–midnight JST; mobile-first audience' },
  DE: { tz: 'CET', peak: 'afternoon', note: 'Germany trends earlier — 4–7pm CET; strong Thursday uptick' },
  CA: { tz: 'EST', peak: 'evening', note: 'Canada mirrors US patterns closely — 6–9pm EST' },
  AU: { tz: 'AEST', peak: 'evening', note: 'Australia peaks 7–10pm AEST; weekend content overperforms' },
  BR: { tz: 'BRT', peak: 'evening', note: 'Brazil has the longest session times — 8pm–1am BRT' },
  KR: { tz: 'KST', peak: 'night', note: 'South Korea peaks late — 10pm–1am KST; gaming especially strong' },
  FR: { tz: 'CET', peak: 'evening', note: 'France peaks 7–10pm CET; Tuesday and Thursday outperform' },
  MX: { tz: 'CST', peak: 'evening', note: 'Mexico peaks 7–11pm CST; entertainment category leads' },
};

const CATEGORY_TITLE_FORMULAS = {
  Gaming:        { formula: '[Number] + [Game Name] + [Outcome/Reaction]', example: '"24 Hours in Minecraft Hardcore — I Almost Lost Everything"', words: '6–9', tips: ['Include the game name early', 'Numbers and time pressure drive clicks', 'Emotional outcome words outperform action words'] },
  Music:         { formula: '[Artist] + [Song/Album] + [Reaction/Analysis]', example: '"Billie Eilish\'s New Album Has a Hidden Message Nobody Noticed"', words: '7–11', tips: ['Curiosity gap performs best in Music', 'Album drops → use within 48hrs for max relevance', 'Reaction videos: keep title under 8 words'] },
  Entertainment: { formula: '[I/We] + [Extreme Action] + [Duration/Stakes]', example: '"I Survived 100 Days in a Haunted Mansion"', words: '5–8', tips: ['First-person drives 34% higher CTR', 'Duration (100 days, 24 hours) adds stakes', 'Avoid clickbait — YouTube penalises high CTR + low watch time'] },
  Education:     { formula: '[Topic] + [Specific Outcome] + [Timeframe]', example: '"Learn Python in 12 Minutes — Beginner to Functional"', words: '5–9', tips: ['Specific outcomes beat vague promises', 'Timeframes reduce viewer anxiety', 'Avoid exclamation marks — Education audience is skeptical'] },
  News:          { formula: '[What Happened] + [Why It Matters]', example: '"The Fed Just Changed Everything — Here\'s What Comes Next"', words: '6–10', tips: ['Upload within 3hrs of the event for trending eligibility', 'Avoid sensationalism — News LTV ratio is lowest of all categories', 'Recency signal is worth more than title polish here'] },
  Sports:        { formula: '[Team/Player] + [Event] + [Result/Reaction]', example: '"Warriors vs Lakers Game 7 — The Final 2 Minutes"', words: '5–8', tips: ['Upload within 2hrs of match end', 'Highlight clips outperform full recaps 3:1', 'Regional targeting (US/BR/KR) multiplies reach significantly'] },
  Comedy:        { formula: '[Relatable Scenario] + [Absurd Twist]', example: '"When Your Boss Asks You to Come In On Saturday"', words: '7–12', tips: ['Second-person ("When you...") creates immediate identification', 'Avoid explaining the joke in the title', 'Shorts-style titles perform differently — keep to 5 words max'] },
  Howto:         { formula: '[How to] + [Specific Result] + [Without X]', example: '"How to Edit Videos Professionally — No Experience Needed"', words: '6–9', tips: ['Remove friction words ("easily", "quickly") — they signal low credibility', '"Without" phrasing removes objections pre-click', 'Tutorial titles with numbers (5 steps, 3 tricks) drive higher completion rates'] },
  Science:       { formula: '[Phenomenon] + [Surprising Fact/Question]', example: '"This Particle Shouldn\'t Exist — But It Does"', words: '5–8', tips: ['Curiosity gap is the #1 driver in Science', 'Avoid jargon in title — save it for the video', 'Questions outperform statements by ~18% in this category'] },
  Travel:        { formula: '[Place] + [Unique Angle] + [Honest Framing]', example: '"48 Hours in Tokyo — What Nobody Shows You"', words: '5–8', tips: ['Specificity (48 hours, solo, $500) beats generic travel titles', '"What nobody tells you" framing drives curiosity gap', 'Authenticity signals outperform luxury aesthetics post-2024'] },
  Film:          { formula: '[Film/Show] + [Analysis Angle]', example: '"The Ending of Dune Part 3 Actually Changes Everything"', words: '6–9', tips: ['Post-release analysis window: upload within 72hrs', '"Actually" and "Nobody Noticed" drive Film engagement', 'Spoiler vs No-spoiler labelling affects watch time significantly'] },
  Autos:         { formula: '[Car Model] + [Test/Experience] + [Honest Verdict]', example: '"I Drove the Tesla Model Y for 30 Days — Honest Review"', words: '7–10', tips: ['Model names in title are critical for search', 'Honest/brutal review framing beats positive review', 'Comparison format (X vs Y) drives 2.2× more suggested traffic'] },
};

const CATEGORY_TAG_STRATEGY = {
  Gaming:        { total: 20, broad: 5, mid: 8, niche: 7, broadEx: ['gaming', 'gameplay', 'let\'s play'], midEx: ['minecraft survival', 'gaming challenge', 'funny moments'], nicheEx: ['minecraft hardcore 2026', 'bedrock survival tips'] },
  Music:         { total: 25, broad: 6, mid: 10, niche: 9, broadEx: ['music', 'new music', 'music video'], midEx: ['pop music 2026', 'album review', 'music reaction'], nicheEx: ['billie eilish hitmyhands reaction', 'indie pop 2026 albums'] },
  Entertainment: { total: 18, broad: 4, mid: 8, niche: 6, broadEx: ['challenge', 'vlog', 'entertainment'], midEx: ['100 day challenge', 'survival challenge', 'funny moments'], nicheEx: ['100 days haunted house', 'extreme challenge 2026'] },
  Education:     { total: 12, broad: 3, mid: 5, niche: 4, broadEx: ['tutorial', 'learn', 'education'], midEx: ['python tutorial', 'coding for beginners', 'programming tips'], nicheEx: ['python beginner 2026', 'learn python fast'] },
  News:          { total: 10, broad: 3, mid: 4, niche: 3, broadEx: ['news', 'breaking news', 'latest news'], midEx: ['fed interest rates', 'economy 2026', 'finance news'], nicheEx: ['federal reserve 2026 decision', 'interest rate impact'] },
  Sports:        { total: 15, broad: 4, mid: 6, niche: 5, broadEx: ['sports', 'basketball', 'highlights'], midEx: ['nba highlights', 'game 7 highlights', 'basketball 2026'], nicheEx: ['warriors lakers game 7 2026', 'nba playoffs highlights'] },
  Comedy:        { total: 22, broad: 5, mid: 9, niche: 8, broadEx: ['comedy', 'funny', 'humor'], midEx: ['relatable comedy', 'office humor', 'funny situations'], nicheEx: ['work from home jokes 2026', 'boss comedy sketch'] },
  Howto:         { total: 14, broad: 4, mid: 6, niche: 4, broadEx: ['how to', 'tutorial', 'tips'], midEx: ['video editing tutorial', 'beginner guide', 'step by step'], nicheEx: ['premiere pro beginners 2026', 'free video editing tips'] },
  Science:       { total: 16, broad: 4, mid: 7, niche: 5, broadEx: ['science', 'physics', 'space'], midEx: ['quantum physics explained', 'space discovery 2026', 'science facts'], nicheEx: ['quantum entanglement simple', 'particle physics 2026'] },
  Travel:        { total: 19, broad: 5, mid: 8, niche: 6, broadEx: ['travel', 'vlog', 'travel guide'], midEx: ['japan travel 2026', 'solo travel tips', 'budget travel'], nicheEx: ['tokyo 48 hours itinerary', 'japan solo travel 2026'] },
  Film:          { total: 20, broad: 5, mid: 8, niche: 7, broadEx: ['movies', 'film review', 'cinema'], midEx: ['dune analysis', 'movie breakdown', 'film theory'], nicheEx: ['dune part 3 ending explained', 'villeneuve dune analysis'] },
  Autos:         { total: 13, broad: 4, mid: 5, niche: 4, broadEx: ['cars', 'car review', 'automotive'], midEx: ['tesla review 2026', 'electric car test', 'car comparison'], nicheEx: ['tesla model y long term review', 'ev range test 2026'] },
};

const CATEGORY_INSIGHTS = {
  Gaming:    'Gaming videos posted <strong>Tuesday 6pm UTC</strong> outperform the category average by <strong>3.1×</strong> based on 2026 trending data. The Tuesday window is counter-intuitive — most creators target Friday — giving you a significantly less competitive slot with the same algorithm momentum.',
  Music:     '<strong>Music drops on Fridays</strong> cluster 62% of weekly Music trending slots in the 2026 dataset. However, the highest engagement-per-view ratio belongs to <strong>Thursday evening uploads</strong> — the audience is primed before the Friday label cycle begins, and your video enters the weekend with algorithmic momentum already built.',
  Entertainment: 'The <strong>100-day format</strong> in Entertainment has a 4.7× completion rate vs standard vlogs in the 2026 dataset. More importantly, first episodes of multi-part series generate <strong>3.2× the subscriber conversion rate</strong> of standalone videos — making series format the highest-ROI structure for this category.',
  Education: 'Education videos that include a <strong>specific outcome in the title</strong> (e.g. "Learn X in Y minutes") show 58% higher click-through rates. The 2026 dataset also shows Education has the <strong>highest comment-to-view ratio</strong> of any category — meaning a smaller but deeply engaged audience. Algorithm rewards this with longer suggested video windows.',
  News:      'Speed is the only real variable in News. The 2026 dataset shows that videos uploaded <strong>within 3 hours of an event</strong> capture 71% of the trending window versus 23% for videos uploaded after 6 hours. Title polish matters far less than recency — the algorithm is detecting freshness signals, not quality signals.',
  Sports:    '<strong>Regional targeting multiplies reach by 2.8×</strong> in Sports. A basketball highlight targeting US + BR simultaneously in the 2026 dataset outperformed single-region uploads consistently. Upload within 2 hours of match end — after that, the trending window compresses rapidly as competing channels claim the suggested queue.',
  Comedy:    'Comedy Shorts (under 60 seconds) in 2026 show <strong>12× the comment-per-view rate</strong> of long-form comedy. However, long-form comedy has <strong>6× higher subscriber conversion</strong>. The insight: use Shorts as top-of-funnel discovery, long-form as conversion. Different titles, same topic — the dataset shows the combo outperforms either format alone.',
  Howto:     'How-to videos with <strong>"Without X" framing</strong> (e.g. "without experience", "without buying anything") show 41% higher CTR in the 2026 dataset. The mechanism is objection removal before the click. Secondary insight: tutorial videos published <strong>Sunday afternoon</strong> accumulate 2.3× more search traffic by the following Friday than any other day.',
  Science:   'The <strong>curiosity-gap title</strong> (a statement that implies something impossible or surprising) drives the highest CTR in Science — 22% above average in 2026 data. The unexpected insight: Science videos with comment sections disabled show <strong>40% lower suggested traffic</strong>. The algorithm uses comment velocity as a quality signal. Never disable comments in this category.',
  Travel:    '<strong>"What nobody shows you" and "honest" framing</strong> dominate Travel trending in 2026, outperforming aspirational/luxury framing by 2.6×. The dataset shift reflects a post-pandemic authenticity preference. Secondary insight: Travel videos under 12 minutes have 3× the completion rate of 20+ minute videos, with no significant difference in ad revenue per view.',
  Film:      'Film analysis videos have a <strong>72-hour trending window</strong> from release date — after that, traffic drops 80%. The 2026 dataset shows the highest-performing Film videos upload <strong>within 6 hours of a major release or streaming drop</strong>. Pre-scheduled uploads (set to publish at 12:01am on release day) capture the first-mover advantage.',
  Autos:     '<strong>Long-term ownership reviews</strong> (30-day, 6-month) generate 4.1× more search traffic than first-drive reviews in 2026 Autos data. The insight: most creators chase the launch-day view spike; the dataset shows the sustained search traffic from ownership reviews is worth 3× more in total views over 90 days. Low competition, high long-tail value.',
};

const BEST_DAYS_BY_CATEGORY = {
  Gaming: ['Tuesday', 'Friday', 'Saturday'],
  Music: ['Thursday', 'Friday', 'Saturday'],
  Entertainment: ['Saturday', 'Friday', 'Sunday'],
  Education: ['Sunday', 'Wednesday', 'Tuesday'],
  News: ['Monday', 'Wednesday', 'Thursday'],
  Sports: ['Sunday', 'Monday', 'Saturday'],
  Comedy: ['Friday', 'Saturday', 'Thursday'],
  Howto: ['Sunday', 'Saturday', 'Wednesday'],
  Science: ['Tuesday', 'Wednesday', 'Thursday'],
  Travel: ['Sunday', 'Friday', 'Saturday'],
  Film: ['Friday', 'Saturday', 'Thursday'],
  Autos: ['Sunday', 'Saturday', 'Wednesday'],
};

function runCSE() {
  const category = document.getElementById('cse_category').value;
  const country = document.getElementById('cse_country').value;
  const size = document.getElementById('cse_size').value;
  const frequency = document.getElementById('cse_frequency').value;

  if (!category) { alert('Please select a content category.'); return; }

  document.getElementById('cse-loader').classList.add('visible');
  document.getElementById('cseResults').style.display = 'none';

  setTimeout(() => {
    renderCSE({ category, country, size, frequency });
    document.getElementById('cse-loader').classList.remove('visible');
    document.getElementById('cseResults').style.display = 'block';
  }, 1500);
}

function renderCSE({ category, country, size, frequency }) {
  const base = CATEGORY_BASELINES[category];
  const countryData = COUNTRY_PEAK_TIMES[country] || COUNTRY_PEAK_TIMES['US'];
  const titleFormula = CATEGORY_TITLE_FORMULAS[category];
  const tagStrategy = CATEGORY_TAG_STRATEGY[category];
  const insight = CATEGORY_INSIGHTS[category];
  const bestDays = BEST_DAYS_BY_CATEGORY[category];

  const countryNames = { US:'United States', GB:'United Kingdom', IN:'India', JP:'Japan', DE:'Germany', CA:'Canada', AU:'Australia', BR:'Brazil', KR:'South Korea', FR:'France', MX:'Mexico' };
  const countryFlags = { US:'🇺🇸', GB:'🇬🇧', IN:'🇮🇳', JP:'🇯🇵', DE:'🇩🇪', CA:'🇨🇦', AU:'🇦🇺', BR:'🇧🇷', KR:'🇰🇷', FR:'🇫🇷', MX:'🇲🇽' };

  // Header
  document.getElementById('cse_headline').textContent = category.toUpperCase() + ' IN ' + (countryNames[country] || country);
  document.getElementById('cse_subheadline').textContent = `Data-backed upload strategy for a ${size} ${frequency} channel targeting ${countryFlags[country] || ''} ${countryNames[country] || country}`;

  // Badges
  const sizeBonus = size === 'small' ? 'Niche-first strategy' : size === 'mid' ? 'Growth-phase strategy' : 'Authority strategy';
  document.getElementById('cse_topbadges').innerHTML = `
    <span class="badge badge-green">${category}</span>
    <span class="badge badge-purple">${sizeBonus}</span>
    <span class="badge" style="background:rgba(245,166,35,0.15);color:var(--accent4);border:1px solid rgba(245,166,35,0.3)">${countryData.tz} Timezone</span>
  `;

  // Stats row
  const freqMultiplier = { daily: 1.4, weekly: 1.0, biweekly: 0.85, monthly: 0.7 };
  const sizeMultiplier = { small: 0.12, mid: 0.6, large: 1.0 };
  const projectedViews = Math.round(base.avgViews * sizeMultiplier[size] * freqMultiplier[frequency]);
  document.getElementById('cse_stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-num" style="color:var(--accent4)">${bestDays[0]}</div>
      <div class="stat-card-label">Best Upload Day</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-num" style="color:var(--accent4)">${countryData.peak === 'evening' ? '6–9PM' : countryData.peak === 'night' ? '9PM–12AM' : '12–5PM'}</div>
      <div class="stat-card-label">Peak Time (${countryData.tz})</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-num" style="color:var(--accent4)">${tagStrategy.total}</div>
      <div class="stat-card-label">Optimal Tag Count</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-num" style="color:var(--accent4)">${titleFormula.words}</div>
      <div class="stat-card-label">Title Word Count</div>
    </div>
  `;

  // Strategy cards
  document.getElementById('cse_cardsgrid').innerHTML = `
    <div class="metric-card">
      <div class="metric-card-title" style="color:var(--accent)">Upload Window</div>
      <div class="big-metric" style="color:var(--accent);font-size:1.8rem;">${bestDays[0]}</div>
      <div class="metric-sub">${countryData.peak === 'evening' ? 'Evening' : countryData.peak === 'night' ? 'Late Night' : 'Afternoon'} • ${countryData.tz}</div>
      <div style="margin-top:12px">
        <div class="staircase-label" style="margin-bottom:8px">TOP 3 DAYS FOR ${category.toUpperCase()}</div>
        ${bestDays.map((d, i) => `
          <div class="entropy-row" style="margin-bottom:6px">
            <div class="entropy-label">${d}</div>
            <div class="entropy-bar-bg"><div class="entropy-bar-fill bar-green" style="width:${100 - i*18}%"></div></div>
            <div class="entropy-val color-green">#${i+1}</div>
          </div>
        `).join('')}
      </div>
      <div class="factor-tip" style="margin-top:12px;padding:10px;background:rgba(0,245,160,0.05);border-radius:6px;border:1px solid rgba(0,245,160,0.1)">
        ${countryData.note}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-card-title" style="color:var(--accent2)">Engagement Targets</div>
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:4px">
        <div>
          <div class="staircase-label">LIKE-TO-VIEW TARGET</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent);line-height:1.2">${base.ltv}%</div>
          <div class="factor-tip">Category baseline from the 2026 trending dataset. Aim to stay at or above this.</div>
        </div>
        <div>
          <div class="staircase-label">COMMENT-TO-VIEW TARGET</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent4);line-height:1.2">${base.ctv}%</div>
          <div class="factor-tip">Drive comments with a question in the first 30 seconds of the video.</div>
        </div>
        <div>
          <div class="staircase-label">AVG TRENDING VIEWS (${size})</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#b39ddb;line-height:1.2">${projectedViews >= 1000000 ? (projectedViews/1000000).toFixed(1)+'M' : (projectedViews/1000).toFixed(0)+'K'}</div>
          <div class="factor-tip">Projected based on channel size × category × upload frequency.</div>
        </div>
      </div>
    </div>
  `;

  // Title formula
  document.getElementById('cse_cat_label').textContent = category.toUpperCase();
  document.getElementById('cse_titleformula').innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:16px;">
      <div class="staircase-label" style="margin-bottom:8px">FORMULA STRUCTURE</div>
      <div style="font-family:'Space Mono',monospace;font-size:0.85rem;color:var(--accent);letter-spacing:1px">${titleFormula.formula}</div>
    </div>
    <div style="background:rgba(0,245,160,0.05);border:1px solid rgba(0,245,160,0.15);border-radius:10px;padding:20px;margin-bottom:16px;">
      <div class="staircase-label" style="margin-bottom:8px">EXAMPLE TITLE</div>
      <div style="font-size:1rem;color:var(--text);font-weight:500">${titleFormula.example}</div>
      <div style="font-family:'Space Mono',monospace;font-size:0.65rem;color:var(--muted);margin-top:8px">TARGET: ${titleFormula.words} words</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${titleFormula.tips.map(t => `
        <div class="flag-item flag-green">
          <span class="flag-icon">💡</span>
          <div class="flag-text">${t}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Tag strategy
  document.getElementById('cse_tagstrategy').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
      <div style="background:var(--bg);border:1px solid rgba(0,245,160,0.2);border-radius:10px;padding:16px;text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent)">${tagStrategy.broad}</div>
        <div class="staircase-label" style="margin-bottom:8px">BROAD TAGS</div>
        <div class="factor-tip">${tagStrategy.broadEx.map(t=>`<span style="background:rgba(0,245,160,0.1);padding:2px 8px;border-radius:4px;margin:2px;display:inline-block;font-size:0.72rem">${t}</span>`).join('')}</div>
      </div>
      <div style="background:var(--bg);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:16px;text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent4)">${tagStrategy.mid}</div>
        <div class="staircase-label" style="margin-bottom:8px">MID-TAIL TAGS</div>
        <div class="factor-tip">${tagStrategy.midEx.map(t=>`<span style="background:rgba(245,166,35,0.1);padding:2px 8px;border-radius:4px;margin:2px;display:inline-block;font-size:0.72rem">${t}</span>`).join('')}</div>
      </div>
      <div style="background:var(--bg);border:1px solid rgba(123,94,167,0.2);border-radius:10px;padding:16px;text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#b39ddb">${tagStrategy.niche}</div>
        <div class="staircase-label" style="margin-bottom:8px">NICHE TAGS</div>
        <div class="factor-tip">${tagStrategy.nicheEx.map(t=>`<span style="background:rgba(123,94,167,0.1);padding:2px 8px;border-radius:4px;margin:2px;display:inline-block;font-size:0.72rem">${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="flag-item flag-yellow">
      <span class="flag-icon">⚠️</span>
      <div class="flag-text">Tag layering principle: broad tags = discovery pool, mid-tail = competition filter, niche = relevance lock. Never use more than ${tagStrategy.total} total — beyond this, signal dilutes.</div>
    </div>
  `;

  // Timing heatmap
  const heatmap = document.getElementById('cse_heatmap');
  heatmap.innerHTML = '';
  const dayKeys = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const timeKeys = ['morning','afternoon','evening'];
  const timeLabels = ['Morning','Afternoon','Evening'];

  // Day headers
  dayLabels.forEach(d => {
    const el = document.createElement('div');
    el.style.cssText = 'text-align:center;font-family:Space Mono,monospace;font-size:0.6rem;color:var(--muted);padding-bottom:4px;letter-spacing:1px;';
    el.textContent = d;
    heatmap.appendChild(el);
  });

  timeKeys.forEach((tk) => {
    dayKeys.forEach((dk) => {
      const baseScore = Math.round((DAY_SCORES[dk] + TIME_SCORES[tk]) / 2);
      const isBestDay = bestDays.includes(dk);
      const isBestTime = (tk === countryData.peak) || (tk === 'evening' && countryData.peak === 'night');
      const bonus = (isBestDay ? 8 : 0) + (isBestTime ? 8 : 0);
      const score = Math.min(100, baseScore + bonus);
      const intensity = score / 100;
      const isTop = score >= 82;
      const el = document.createElement('div');
      el.style.cssText = `height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:Space Mono,monospace;font-size:0.65rem;cursor:default;transition:transform 0.15s;
        background:rgba(${Math.round(245*intensity)},${Math.round(166*intensity + 80*(1-intensity))},${Math.round(35*intensity)},${0.08 + intensity*0.55});
        color:rgba(${Math.round(245*intensity)},${Math.round(200*intensity)},${Math.round(100*intensity)},${0.5+intensity*0.5});
        border:1px solid rgba(${Math.round(245*intensity)},${Math.round(166*intensity)},${Math.round(35*intensity)},${0.15+intensity*0.35});
        ${isTop ? 'box-shadow:0 0 10px rgba(245,166,35,0.2);' : ''}`;
      el.textContent = score;
      el.title = `${dk} ${tk}: ${score}/100${isBestDay && isBestTime ? ' ← PRIME WINDOW' : ''}`;
      el.onmouseover = () => { el.style.transform = 'scale(1.12)'; };
      el.onmouseout  = () => { el.style.transform = 'scale(1)'; };
      heatmap.appendChild(el);
    });
  });

  document.getElementById('cse_insight').innerHTML = insight;
}
