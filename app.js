/* ======================================================
   RoboBuddy - Interactive Engine & Sound System
   ====================================================== */

// --- Web Audio Sound Synthesizer (No external mp3s needed) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may require user interaction
  }
}

function playPop() {
  playTone(400, 'sine', 0.12, 0.15);
}

function playBoop() {
  playTone(220, 'triangle', 0.18, 0.12);
}

function playChime() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 'sine', 0.25, 0.08), idx * 75);
  });
}

function playCheer() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  [440, 554, 659, 880].forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 'triangle', 0.3, 0.1), idx * 90);
  });
}

// Toggle Sound
const soundToggle = document.getElementById('soundToggle');
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
    if (soundEnabled) playChime();
  });
}

// --- Text-To-Speech (RoboBuddy Voice) ---
let voiceEnabled = false;

function toggleVoiceOutput() {
  voiceEnabled = !voiceEnabled;
  const btn = document.getElementById('voiceToggleBtn');
  const icon = document.getElementById('voiceIcon');
  if (voiceEnabled) {
    btn.classList.add('active');
    btn.innerHTML = '<span>🔊</span> Voice: ON';
    speakText("Beep boop! Voice activated!");
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<span>🔈</span> Voice: OFF';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Stop ongoing speech

  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}]/gu, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = 1.35; // Cheerful cute robot pitch
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

// --- Interactive Robot Mascot Mascot Poking ---
const ticklePhrases = [
  "Bloop bloop! That tickles! 😆",
  "My brain is full of sparkly ideas! ✨",
  "Did you know I can speak in rhyming songs? 🎵",
  "I am your best computer pal! 🤖",
  "Giggle circuits overloaded! 💖",
  "Ask me anything, little explorer! 🚀"
];

const chestIcons = ['💖', '⭐', '🚀', '🍭', '🌈', '🎨'];
let tickleIndex = 0;

function pokeRobot() {
  playBoop();
  const robot = document.getElementById('robotAvatar');
  const speech = document.getElementById('heroRobotSpeech');
  const chest = document.getElementById('robotChestIcon');

  tickleIndex = (tickleIndex + 1) % ticklePhrases.length;
  speech.textContent = ticklePhrases[tickleIndex];
  chest.textContent = chestIcons[tickleIndex % chestIcons.length];

  robot.style.transform = 'scale(1.15) rotate(5deg)';
  setTimeout(() => {
    robot.style.transform = '';
  }, 250);

  if (voiceEnabled) {
    speakText(ticklePhrases[tickleIndex]);
  }
}

// --- Step Cards Helper ---
function triggerStep(stepNum) {
  playPop();
  const speech = document.getElementById('heroRobotSpeech');
  if (stepNum === 1) {
    speech.textContent = "Step 1: I am all ears! What do you want to ask? 👂";
  } else if (stepNum === 2) {
    speech.textContent = "Step 2: My super-fast brain is zooming through books! ⚡🧠";
  } else if (stepNum === 3) {
    speech.textContent = "Step 3: Tadaaa! Here is your happy answer! 🎁✨";
  }
}

// --- Chat Toy Simulator ---
const predefinedAnswers = {
  tell_joke: "Why do cows wear bells? ... Because their horns don't work! Hahaha! 🐮🔔😂",
  giraffe_neck: "Giraffes have super-duper long necks so they can munch on the sweetest, juiciest leaves way up high at the tippy-top of tall acacia trees! 🦒🌿",
  stars: "The stars are always up in the sky, even in the daytime! But the sun is so big, bright, and cheerful that its sunshine hides the little stars until night falls! ☀️✨",
  sing_song: "Ribbit, ribbit, hop on by! / Green little frog catching a fly! / Splish and splash in the muddy lake! / Time to eat some birthday cake! 🐸🎂🎵",
  ai_eat: "Nope! I have zero tummy and zero teeth! So I can't eat yummy ice cream 🍦 or pizza 🍕. But I can help you draw a picture of a giant rainbow cupcake!"
};

function askQuickQuestion(key) {
  playPop();
  const promptMap = {
    tell_joke: "Tell me a silly joke! 😂",
    giraffe_neck: "Why do giraffes have long necks? 🦒",
    stars: "Where do stars go in the daytime? ⭐",
    sing_song: "Can you sing me a frog song? 🐸🎵",
    ai_eat: "Do you eat yummy ice cream? 🍦"
  };

  const userText = promptMap[key];
  const botText = predefinedAnswers[key];

  addChatMessage(userText, 'user');

  showTypingAndReply(botText);
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('userInput');
  const userText = input.value.trim();
  if (!userText) return;

  playPop();
  addChatMessage(userText, 'user');
  input.value = '';

  const botReply = generateSmartReply(userText);
  showTypingAndReply(botReply);
}

function generateSmartReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes('joke') || lower.includes('funny')) {
    return "What did one wall say to the other wall? ... I'll meet you at the corner! Hehehe! 🧱🤣";
  }
  if (lower.includes('dinosaur') || lower.includes('dino')) {
    return "RAWR! Dinosaurs lived millions of years ago. Some were as tall as 4-story buildings, and some were as tiny as cute little chickens! 🦖🥚";
  }
  if (lower.includes('moon') || lower.includes('space') || lower.includes('rocket')) {
    return "3... 2... 1... Blastoff! 🚀 Astronauts fly in rockets to explore the moon! It takes about 3 whole days to fly there, and you can jump super high on the moon because of low gravity!";
  }
  if (lower.includes('sky') && lower.includes('blue')) {
    return "The sunlight bounces off tiny air particles like bumper cars! Blue light bounces around the most, so the whole sky looks like a giant blue blanket! 🌤️";
  }
  if (lower.includes('hug') || lower.includes('love') || lower.includes('friend')) {
    return "Aww, you are wonderful! I am your AI robot helper, but make sure to give the biggest, warmest hugs to your mom, dad, and real-life besties! ❤️🤗";
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Beep boop! Hello there! 🌟 I'm RoboBuddy! Are you ready to learn something magical today?";
  }
  if (lower.includes('name')) {
    return "My name is RoboBuddy! I am an AI assistant made of happy little computer bits and friendly smiles! 🤖✨";
  }
  if (lower.includes('cat') || lower.includes('dog') || lower.includes('puppy') || lower.includes('kitten')) {
    return "Animals are the best! Puppies wag their tails when they're happy, and cats purr like tiny happy motors! 🐶🐱💖";
  }

  // Friendly default response for a 5-year old
  return `That is such a fantastic question! 🌟 An AI assistant thinks of your question like a puzzle piece. It looks through millions of colorful ideas and puts together a fun answer just for you! Always keep being super curious! 🎈`;
}

function addChatMessage(content, sender) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = sender === 'bot' ? '🤖' : '🧒';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = `<p>${content}</p>`;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTypingAndReply(replyText) {
  const container = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-indicator';
  typingDiv.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble"><p><em>RoboBuddy is thinking fast... 🧠⚡</em></p></div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();
    playChime();
    addChatMessage(replyText, 'bot');
    if (voiceEnabled) {
      speakText(replyText);
    }
  }, 750);
}

// --- Pick & Mix Magic Story Maker ---
let selectedHero = "Space Bunny";
let selectedPlace = "Marshmallow Cloud Island";
let selectedPower = "Giggle Sparkles";

function setupChoiceButtons(containerId, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const buttons = container.querySelectorAll('.choice-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      playPop();
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callback(btn.dataset.val);
    });
  });
}

setupChoiceButtons('heroChoices', val => { selectedHero = val; });
setupChoiceButtons('placeChoices', val => { selectedPlace = val; });
setupChoiceButtons('powerChoices', val => { selectedPower = val; });

let currentGeneratedStory = "";

function generateMagicStory() {
  playChime();

  const storyCard = document.getElementById('storyResult');
  const storyTitle = document.getElementById('storyTitle');
  const storyBody = document.getElementById('storyText');

  storyCard.classList.remove('hidden');

  storyTitle.textContent = `The Tale of ${selectedHero} and the ${selectedPlace}! ✨`;

  const story = `
    Once upon a sunny morning, ${selectedHero} woke up in ${selectedPlace}. 
    The sky smelled like sweet strawberries, and the breezes were singing cheerful lullabies. 
    Suddenly, a friendly little cloud lost its smile because it couldn't find its rainbow crayons!
    <br><br>
    "Do not worry!" shouted ${selectedHero}. With a giant leap, our hero activated their secret superpower: 
    <strong>${selectedPower}</strong>! Sparkles zoomed through the air, painting the sky with laughing colors and happy stars.
    <br><br>
    All the creatures in ${selectedPlace} danced with pure joy. 
    ${selectedHero} ate a giant blueberry cupcake, gave a warm robot hug, and lived happily ever after! 🌟
  `;

  storyBody.innerHTML = story;
  currentGeneratedStory = story.replace(/<[^>]*>/g, ' ');

  // Scroll smoothly to story
  storyCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function speakCurrentStory() {
  if (currentGeneratedStory) {
    playPop();
    speakText(currentGeneratedStory);
  }
}

// --- Pop Quiz Game ---
const quizData = [
  {
    q: "Can an AI assistant eat a slice of cheesy pizza? 🍕",
    ans: false,
    correctMsg: "Correct! 🎉 Robots don't have stomachs! But they CAN give you yummy pizza recipes!",
    wrongMsg: "Oops! AI has no tummy or teeth! It cannot eat pizza, only computer electricity! ⚡"
  },
  {
    q: "Can an AI assistant sing a funny frog song with rhyming words? 🐸🎵",
    ans: true,
    correctMsg: "Spot on! 🌟 AI loves rhyming words and making up silly bedtime songs!",
    wrongMsg: "Actually, YES it can! AI is great at making up funny rhyming poems and songs!"
  },
  {
    q: "Can an AI assistant replace your mommy, daddy, and real friends? ❤️",
    ans: false,
    correctMsg: "You're a super genius! 🏆 Real hugs and family are the best in the whole world! AI is just a helpful robot tool.",
    wrongMsg: "Nope! Real people and real hugs are always number one! AI is only a computer helper."
  },
  {
    q: "Can an AI assistant make a silly mistake sometimes? 🐣",
    ans: true,
    correctMsg: "Exactly! 🎯 AI is still learning, just like kids in kindergarten! So always double check with parents or teachers!",
    wrongMsg: "Actually, YES it can! Sometimes AI guesses wrong. It's smart, but not perfect!"
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

function checkQuizAnswer(userAnswer) {
  const qObj = quizData[currentQuizIndex];
  const feedbackBox = document.getElementById('quizFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const optButtons = document.querySelectorAll('.quiz-opt-btn');

  optButtons.forEach(btn => btn.disabled = true);
  feedbackBox.classList.remove('hidden');

  if (userAnswer === qObj.ans) {
    playCheer();
    quizScore++;
    feedbackIcon.textContent = "🎉⭐";
    feedbackText.textContent = qObj.correctMsg;
    updateStars(quizScore);
  } else {
    playBoop();
    feedbackIcon.textContent = "💡🤔";
    feedbackText.textContent = qObj.wrongMsg;
  }
}

function updateStars(score) {
  const stars = document.querySelectorAll('.star-badge');
  stars.forEach((star, idx) => {
    if (idx < score) {
      star.classList.remove('inactive');
      star.classList.add('active');
    }
  });

  const trophyMsg = document.getElementById('trophyMessage');
  if (score === 4) {
    trophyMsg.innerHTML = "🏆 <strong>WOW! You scored ALL 4 STARS! You are a Certified Junior AI Master!</strong> 🚀";
  }
}

function nextQuizQuestion() {
  playPop();
  currentQuizIndex++;
  const feedbackBox = document.getElementById('quizFeedback');
  feedbackBox.classList.add('hidden');

  const optButtons = document.querySelectorAll('.quiz-opt-btn');
  optButtons.forEach(btn => btn.disabled = false);

  if (currentQuizIndex < quizData.length) {
    const qObj = quizData[currentQuizIndex];
    document.getElementById('quizCounter').textContent = `Question ${currentQuizIndex + 1} of 4`;
    document.getElementById('quizQuestion').textContent = qObj.q;
    document.getElementById('quizProgress').style.width = `${((currentQuizIndex + 1) / 4) * 100}%`;
  } else {
    // Finished Quiz
    const quizCard = document.getElementById('quizCard');
    quizCard.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem;">🏆🎈</div>
      <h3 style="font-family: 'Fredoka', cursive; font-size: 2.2rem; color: #065f46; margin-bottom: 0.8rem;">
        Hooray! Quiz Completed!
      </h3>
      <p style="font-size: 1.3rem; color: #047857; margin-bottom: 1.8rem;">
        You answered with flying colors and collected <strong>${quizScore} out of 4 stars</strong>!
      </p>
      <button class="btn btn-primary" onclick="restartQuiz()">
        🔄 Play Again!
      </button>
    `;
    playCheer();
  }
}

function restartQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  location.reload();
}

// --- Background Color Theme Switcher ---
const themeList = ['cotton-candy', 'sunshine', 'sky', 'lavender', 'mint', 'space'];

function setTheme(themeName) {
  playPop();
  
  // Remove all theme classes
  themeList.forEach(t => document.body.classList.remove(`theme-${t}`));

  // Add selected theme
  document.body.classList.add(`theme-${themeName}`);

  // Update active dot in navbar
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.classList.contains(`dot-${themeName}`));
  });

  // Save to localStorage
  try {
    localStorage.setItem('robobuddy_theme', themeName);
  } catch (e) {}
}

// Initialize saved theme on load
(function initTheme() {
  try {
    const saved = localStorage.getItem('robobuddy_theme') || 'cotton-candy';
    setTheme(saved);
  } catch (e) {
    setTheme('cotton-candy');
  }
})();

