export type Lang = 'zh' | 'en'

const zh = {
  appTitle: '數學島',
  langBtn: 'EN',
  hiMap: '嗨！我是小狐狸。今天想去哪座島？',
  hiIsland: '選一個關卡開始吧！',
  locked: '先在前一座島的每一關都拿到星星，就能解鎖喔！',
  islands: {
    forest: { name: '數數森林', desc: '1–10 的數數、數線、十格框' },
    bay: { name: '十的海灣', desc: '湊十、認識 11–19' },
  },
  levels: {
    'forest-count': { name: '數一數', desc: '一個一個點，數出總共有幾個' },
    'forest-line': { name: '青蛙跳數線', desc: '在數線上跳，認識數字的位置' },
    'forest-flash': { name: '十格框快看', desc: '看一眼，就知道有幾個' },
    'bay-make10': { name: '湊十', desc: '還要幾個，才能湊滿 10？' },
    'bay-teen': { name: '十和幾', desc: '一個十，再加幾個一' },
  },
  countTap: (fruit: string) => `把每個${fruit}點一下，一個一個數！`,
  howMany: '一共有幾個？',
  countHint: '差一點！看看你最後數到的數字是多少？',
  jumpTo: (n: number) => `幫青蛙跳到 ${n}！`,
  hopFwd: (start: number, hop: number) => `青蛙在 ${start}，往前跳 ${hop} 格，會停在哪裡？`,
  tooSmall: (i: number) => `跳到 ${i} 了，還不夠遠，再往右邊試試！`,
  tooBig: (i: number) => `跳到 ${i} 了，跳過頭囉，往左邊一點！`,
  look: '仔細看！',
  howManyDots: '剛剛有幾個點？',
  frameHint: (n: number) =>
    n > 5 ? `上面一排是 5 個，下面還有 ${n - 5} 個。合起來是幾個？`
      : n === 5 ? '剛好排滿一整排喔！一排是幾個？'
        : `上面這排還差 ${5 - n} 個才滿 5 個。所以有幾個？`,
  makeTen: (n: number) => `這裡有 ${n} 個貝殼，還要幾個才能把十格框排滿？`,
  makeTenHint: '數一數，空的格子有幾個？',
  teen: '一個滿滿的十格框是 10。兩個框合起來，一共是多少？',
  teenHint: '滿滿一框是 10，接著數第二框：11、12、13……',
  praise: ['你一個一個數，好仔細！', '答對了！你用了好方法。', '太棒了，你很專心！', '對了！你越來越熟練了。'],
  result: (ok: number) => `這一關你第一次就答對 ${ok} 題。多練習，大腦會越來越強！`,
  again: '再玩一次',
  back: '回去',
  note: '開發版 · 進度只存在這台裝置',
}

export type Strings = typeof zh

const en: Strings = {
  appTitle: 'Math Islands',
  langBtn: '中文',
  hiMap: "Hi! I'm Little Fox. Which island shall we visit today?",
  hiIsland: 'Pick a game to start!',
  locked: 'Earn a star in every game on the island before to unlock this one!',
  islands: {
    forest: { name: 'Counting Forest', desc: 'Counting to 10, number lines, ten-frames' },
    bay: { name: 'Ten Bay', desc: 'Make ten, meet 11–19' },
  },
  levels: {
    'forest-count': { name: 'Count Them', desc: 'Tap each one and count how many' },
    'forest-line': { name: 'Frog Hop', desc: 'Hop along the number line' },
    'forest-flash': { name: 'Ten-Frame Flash', desc: 'One quick look — how many?' },
    'bay-make10': { name: 'Make Ten', desc: 'How many more to make 10?' },
    'bay-teen': { name: 'Ten and Some More', desc: 'One ten and some ones' },
  },
  countTap: (fruit: string) => `Tap each ${fruit} and count one by one!`,
  howMany: 'How many altogether?',
  countHint: 'So close! What was the last number you counted?',
  jumpTo: (n: number) => `Help the frog hop to ${n}!`,
  hopFwd: (start: number, hop: number) => `The frog is on ${start}. Hop forward ${hop}. Where does it land?`,
  tooSmall: (i: number) => `You landed on ${i}. Not far enough — try further right!`,
  tooBig: (i: number) => `You landed on ${i}. Too far — go a bit left!`,
  look: 'Look carefully!',
  howManyDots: 'How many dots did you see?',
  frameHint: (n: number) =>
    n > 5 ? `The top row has 5. The bottom row has ${n - 5} more. How many altogether?`
      : n === 5 ? 'The top row is exactly full! How many make a full row?'
        : `The top row needs ${5 - n} more to make 5. So how many are there?`,
  makeTen: (n: number) => `There are ${n} shells. How many more fill the ten-frame?`,
  makeTenHint: 'Count the empty boxes. How many are there?',
  teen: 'A full ten-frame is 10. How many are there in both frames?',
  teenHint: 'A full frame is 10. Keep counting on the second frame: 11, 12, 13…',
  praise: ['You counted carefully!', 'Yes! You used a good strategy.', 'Great focus!', "That's right! You're getting better and better."],
  result: (ok: number) => `You got ${ok} right on the first try. Practice makes your brain stronger!`,
  again: 'Play again',
  back: 'Back',
  note: 'Dev build · progress is saved on this device only',
}

export const STRINGS: Record<Lang, Strings> = { zh, en }
