/* =========================================================
   Visitor nickname (persistent for current browser)
   ========================================================= */
(function () {
  const KEY = 'guest_nick_v1';
  if (!localStorage.getItem(KEY)) {
    const num = Math.floor(10000 + Math.random() * 90000); // 10000–99999
    localStorage.setItem(KEY, `Guest_${num}`);
  }
  // Expose globally
  window.CURRENT_USER = localStorage.getItem(KEY);
})();

/* =========================================================
   Section reveal on scroll + LIVE dot pulse
   ========================================================= */
(function () {
  // Reveal .observe blocks
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.2 }
  );
  document.querySelectorAll('.observe').forEach(el => observer.observe(el));

  // Micro-interaction: pulsate LIVE dot
  setInterval(() => {
    document.querySelectorAll('.badge.live .dot').forEach(dot => {
      dot.style.boxShadow = '0 0 0 0 rgba(255,77,79,.6)';
      dot.animate(
        [
          { boxShadow: '0 0 0 0 rgba(255,77,79,.6)' },
          { boxShadow: '0 0 12px 6px rgba(255,77,79,0)' }
        ],
        { duration: 800, easing: 'ease-out' }
      );
    });
  }, 900);
})();

(function () {
  const videoEl = document.querySelector('.video');
  const titleEl = document.querySelector('.player-header .title');
  const channels = Array.from(document.querySelectorAll('.channels .channel'));
  if (!videoEl || channels.length === 0) return;

  const cache = new Map();
  const controller = new AbortController();

  function getChannelName(li){
    const spans = li.querySelectorAll('span');
    for (const s of spans) {
      if (!s.classList.contains('dot') && !s.classList.contains('viewers')) return s.textContent.trim();
    }
    return '';
  }

  async function fetchBlob(url) {
    if (cache.has(url)) return cache.get(url);
    const res = await fetch(url, { signal: controller.signal, cache: 'force-cache' });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const entry = { blobUrl, size: blob.size };
    cache.set(url, entry);
    return entry;
  }

  (async () => {
    for (const li of channels) {
      const url = li.getAttribute('data-gif');
      if (url) fetchBlob(url).catch(() => {});
    }
  })();

  function setActive(li) {
    document.querySelectorAll('.channels .channel.active').forEach(n => n.classList.remove('active'));
    li.classList.add('active');
  }

  async function swapGif(url) {
    try {
      videoEl.classList.add('fade-out');
      const { blobUrl } = await fetchBlob(url);
      videoEl.src = '';
      requestAnimationFrame(() => {
        videoEl.src = blobUrl;
        videoEl.classList.remove('fade-out');
        videoEl.classList.add('fade-in');
        setTimeout(() => videoEl.classList.remove('fade-in'), 250);
      });
    } catch (_) {
      videoEl.classList.remove('fade-out');
    }
  }

  channels.forEach(li => {
    li.addEventListener('click', () => {
      const url = li.getAttribute('data-gif');
      if (!url) return;
      setActive(li);
      titleEl.textContent = getChannelName(li);
      swapGif(url);
    });
  });

  const first = channels[0];
  if (first && !first.classList.contains('active')) {
    first.classList.add('active');
    titleEl.textContent = getChannelName(first);
  }
})();

/* =========================================================
   Twitch-like chat engine (slow random flow + user messages)
   ========================================================= */
(function () {
  const chat  = document.getElementById('chat');
  const input = document.getElementById('chatInput');
  const send  = document.getElementById('sendBtn');

  if (input) input.placeholder = `Send a message as ${window.CURRENT_USER || 'Guest_00000'}`;

  // --- Random pools ---
  const namePool = [
    'PepeFan','MemeLord','CryptoKit','MoonShot','GigaChad','FrogQueen','DogeWhale',
    'CZ_alpha','ElonW','ShibArmy','BinanceOG','SolanaBoy','DeFiNinja','WhaleWatcher',
    'HODLer42','xXxStreamerxXx','ggwp1337','MemeticAI','PixelPunk','WAGMI_9000'
  ];
   const phrases = [
    'she’s been blinking for 3 hours straight 😭',
    '$BNBITCH to the moon even if she’s not real 🚀',
    'I know it’s a gif but I still said “hi” back 💀',
    'she looked at me... I swear she looked at me',
    '$BNBITCH holders don’t sleep, we just refresh charts',
    'this stream cured my bear market depression',
    'can’t tell if it’s love or hopium',
    'gif or not, she’s still my favorite streamer 🐸💅',
    'imagine simping for a looped frog 😭',
    '$BNBITCH chart goes up every time she blinks',
    'she’s literally just pixels and yet I’m invested',
    'can we get a blink in chat? oh wait',
    'I don’t trade, I just stare',
    '$BNBITCH made me believe in magic',
    'she said nothing and I still felt seen',
    'every frame of this gif = bullish',
    '$BNBITCH dev watching this like 👀',
    'the most consistent streamer on Twitch, never stops',
    'I told my mom I’m watching finance content 💀',
    'she’s giving me emotional stability rn',
    '$BNBITCH community is too powerful',
    'imagine if she rugpulled the gif 😭',
    'she doesn’t move, but my heart does',
    '$BNBITCH holders when she blinks = BUY SIGNAL',
    'this loop has better energy than 99% of Twitch',
    'she hasn’t spoken once and it’s still alpha',
    'the lighting changed in my soul',
    '$BNBITCH + pepe gf = perfection',
    'someone said it’s prerecorded. obviously, it’s blockchain verified',
    '10 hours of silence and I’m still entertained',
    'she’s literally the most faithful streamer — never leaves',
    '$BNBITCH makes me feel alive again',
    'chat pretending it’s live is the real art',
    'she’s been saying “gm” telepathically',
    'every loop = new ATH',
    'imagine not being in $BNBITCH rn',
    'is it weird that I’m emotionally attached to a gif?',
    'she’s the only one who didn’t dump on me',
    '$BNBITCH chart is the real stream',
    'she blinked twice — that means bullish, right?',
    '10k viewers and no one’s coping',
    'I swear she just winked at me 😳',
    '$BNBITCH holders stay winning',
    'I left her stream running all night for good luck',
    'this gif has more soul than 99% of VTubers',
    'when she looks at the camera, my bags feel lighter',
    '$BNBITCH saved my portfolio and my heart',
    'every time she loops, my hope resets',
    'why is she actually kinda fine tho 😭',
    'I told my therapist about this stream',
    '$BNBITCH chart mirrors her blink rate',
    'she’s like Mona Lisa for degens',
    'this isn’t a stream, it’s a lifestyle',
    '$BNBITCH vibes only 🐸💚',
    'sometimes I forget she’s not real',
    '100% engagement rate — she never leaves you on read',
    'I’m convinced this gif runs on $BNBITCH',
    'she’s not lagging, that’s just the blockchain',
    'chat pretending it’s interactive is peak comedy',
    '$BNBITCH team should sponsor her',
    'still waiting for her to say “gm”',
    'I blinked and missed the alpha 😭',
    '$BNBITCH army stronger than ever',
    'is it weird that I trust her more than my ex?',
    'this is the calm before the pump',
    'she’s been bullish since frame one',
    '$BNBITCH — powered by eternal gifs',
    'every frame screams “buy the dip”',
    'I came for the memes, stayed for the hallucination',
    '$BNBITCH holders have immaculate taste',
    'she’s the queen of loops and liquidity',
    'it’s not fake if my emotions are real',
    'she hasn’t aged a second — bullish',
    '$BNBITCH keeps me coping happily',
    'the fact that this isn’t real makes it even better',
    'every blink is a transaction confirmation',
    '$BNBITCH = best community + best frog',
    'this stream has more consistency than BTC',
    'she’s just... perfect pixelated perfection',
    '$BNBITCH didn’t just pump, it ascended',
    'it’s all fun and games until the gif winks',
    '$BNBITCH holders know the grind never stops',
    'blink if $BNBITCH going up... oh wait',
    'she’s literally the face of the bull market',
    '$BNBITCH is art, and she’s the gallery',
    'someone said she’s AI — she’s soul, not code',
    'every frame, I fall deeper into the blockchain',
    '$BNBITCH is my religion now',
    'this loop got me through the last red candle',
    'she doesn’t talk, but she understands',
    '$BNBITCH or nothing, chat',
    'when she stares, I feel bullish',
    'this is the best $BNBITCH marketing ever',
    'I’d rather watch this than CNBC',
    'she hasn’t moved an inch — bullish consolidation',
    '$BNBITCH makes even loops look alive',
    'if she ever actually moves, I’m selling everything',
    'this stream is pure serotonin',
    '$BNBITCH & Pepe waifu forever 🐸💅'
  ];



  const emotes = ['Kappa','PogChamp','FeelsGoodMan','PepeHands','PepeLaugh','BibleThump','monkaS','TriHard','4Head','Pepega'];
  const colors = ['#ff75a0','#1abc9c','#e67e22','#f1c40f','#9b59b6','#3498db','#2ecc71','#e84393','#fd79a8','#00cec9','#74b9ff','#55efc4'];
  const badgeDefs = { mod:{label:'MOD',class:'mod'}, sub:{label:'SUB',class:'sub'}, vip:{label:'VIP',class:'vip'}, user:{label:'',class:'user'} };

  // Helpers
  const nearBottom = () => chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 40;
  const scrollToBottom = () => { chat.scrollTop = chat.scrollHeight; };
  const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomName   = () => rnd(namePool) + ri(1, 999);
  const randomColor  = () => rnd(colors);
  const randomBadges = () => (Math.random() < 0.06 ? ['vip'] : Math.random() < 0.11 ? ['mod'] : Math.random() < 0.28 ? ['sub'] : ['user']);
  const randomText = () => rnd(phrases);

  function renderBadges(badges) {
    return badges.map(b => {
      const def = badgeDefs[b] || badgeDefs.user;
      return def.label ? `<span class="badge ${def.class}">${def.label}</span>` : '';
    }).join('');
  }

  function renderMessage({ name, color, badges, text }) {
    const el = document.createElement('div');
    el.className = 'msg';
    if (name === window.CURRENT_USER) el.classList.add('me');

    const htmlText = text.replace(/\b([A-Za-z][A-Za-z0-9]+)\b/g, m => emotes.includes(m) ? `<span class="emote">${m}</span>` : m);

    el.innerHTML = `
      ${renderBadges(badges)}
      <span class="name" style="color:${color}">${name}</span>
      <span class="colon">:</span>
      <span class="text">${htmlText}</span>
    `;
    return el;
  }

  function addMsg(msg) {
    const stick = nearBottom();
    chat.appendChild(renderMessage(msg));
    if (stick) scrollToBottom();
  }

  // User input -> message under current visitor nickname
  function addUserMessage(text) {
    addMsg({
      name: window.CURRENT_USER,
      color: '#e7e7e8',
      badges: ['user'],
      text
    });
  }

  // Handlers
  if (send && input) {
    send.addEventListener('click', () => {
      const v = (input.value || '').trim();
      if (!v) return;
      addUserMessage(v);
      input.value = '';
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send.click(); });
  }

  // Slow random flow + rare, slow bursts
  const CHAT_MIN_DELAY = 7000;   // 15s
  const CHAT_MAX_DELAY = 15000;   // 30s
  const BURST_CHANCE    = 0.01;   // 1% chance of a rare burst
  const BURST_COUNT_MIN = 2;
  const BURST_COUNT_MAX = 4;
  const BURST_INTERVAL_MIN = 1200; // 1.2s between messages in burst
  const BURST_INTERVAL_MAX = 2000; // 2s
  const BURST_COOLDOWN_MIN = 15000; // 15s cooldown after burst
  const BURST_COOLDOWN_MAX = 30000; // 30s

  function scheduleNext() {
    const base = ri(CHAT_MIN_DELAY, CHAT_MAX_DELAY);

    // Rare slow burst
    if (Math.random() < BURST_CHANCE) {
      const count = ri(BURST_COUNT_MIN, BURST_COUNT_MAX);
      let i = 0;
      const burst = setInterval(() => {
        addMsg({ name: randomName(), color: randomColor(), badges: randomBadges(), text: randomText() });
        if (++i >= count) {
          clearInterval(burst);
          setTimeout(scheduleNext, ri(BURST_COOLDOWN_MIN, BURST_COOLDOWN_MAX));
        }
      }, ri(BURST_INTERVAL_MIN, BURST_INTERVAL_MAX));
      return;
    }

    // Regular slow flow
    setTimeout(() => {
      addMsg({ name: randomName(), color: randomColor(), badges: randomBadges(), text: randomText() });
      scheduleNext();
    }, base);
  }

  // Seed + start
  addMsg({ name: 'system', color: '#b9b9bb', badges: ['user'], text: 'Welcome to the chat room!' });
  scheduleNext();

  // Pause autoscroll when user scrolls up; resume at bottom
  let userPinned = false;
  chat.addEventListener('scroll', () => {
    userPinned = !nearBottom();
    chat.classList.toggle('pinned', userPinned);
  });
})();
(function(){
  const input = document.getElementById('caField');
  const btn   = document.getElementById('copyCA');
  let timer;

  async function copyText(txt){
    try{
      await navigator.clipboard.writeText(txt);
      return true;
    }catch{
      const sel = input;
      sel.removeAttribute('readonly');
      sel.select();
      const ok = document.execCommand('copy');
      sel.setAttribute('readonly','');
      window.getSelection().removeAllRanges();
      return ok;
    }
  }

  btn.addEventListener('click', async () => {
    const ok = await copyText(input.value.trim());
    btn.textContent = 'copied';
    clearTimeout(timer);
    timer = setTimeout(()=>{ btn.textContent = 'copy'; }, 2000);
  });
})();