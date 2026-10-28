import type {
  Add20, Area, ArrayQ, Balance, Blocks, Change, Column, Decimal, DigitValue, FracEqual, Fraction, Legs, Measure, Share, Shape, Times,
} from './game/quizzes'

export type Lang = 'zh' | 'en'

/** Prompt and hint for one choice-based level. Hints point at a strategy, never the answer. */
interface QuizText<D> { prompt: (d: D) => string; hint: (d: D) => string }

const PLACE_ZH = ['個', '十', '百', '千', '萬']
const PLACE_EN = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands']
const fmt = (n: number) => n.toLocaleString('en-US')

const zh = {
  appTitle: '數學島',
  langBtn: 'EN',
  hiMap: '嗨！我是小狐狸。今天想去哪座島？',
  hiIsland: '選一個關卡開始吧！',
  locked: (island: string) => `先在「${island}」的每一關都拿到星星，就能解鎖喔！`,
  islands: {
    forest: { name: '數數森林', desc: '1–10 的數數、數線、十格框' },
    bay: { name: '十的海灣', desc: '湊十、11–19、20 以內加減' },
    place: { name: '位值山谷', desc: '百十個、位值、二位數直式加減' },
    shapes: { name: '形狀工坊', desc: '支線：認識形狀、對稱、量長度' },
    farm: { name: '乘法農場', desc: '陣列、九九乘法、平分' },
    market: { name: '時間錢幣市集', desc: '支線：看時鐘、數錢、找零' },
    kitchen: { name: '分數廚房', desc: '等分、數線上的分數、等值分數' },
    port: { name: '大數港口', desc: '萬以內的位值、面積周長、小數' },
    challenge: { name: '挑戰島', desc: '思維策略：找規律、天平推理、雞兔同籠' },
  },
  levels: {
    'forest-count': { name: '數一數', desc: '一個一個點，數出總共有幾個' },
    'forest-line': { name: '青蛙跳數線', desc: '在數線上跳，認識數字的位置' },
    'forest-flash': { name: '十格框快看', desc: '看一眼，就知道有幾個' },
    'bay-make10': { name: '湊十', desc: '還要幾個，才能湊滿 10？' },
    'bay-teen': { name: '十和幾', desc: '一個十，再加幾個一' },
    'bay-add20': { name: '開船加減', desc: '先湊十，再算 20 以內加減' },
    'place-blocks': { name: '積木合體', desc: '百、十、一的積木一共是多少' },
    'place-digit': { name: '數字住哪裡', desc: '同一個數字，在不同位置值不同' },
    'place-column': { name: '直式加減', desc: '進位與借位' },
    'shapes-name': { name: '形狀名字', desc: '轉個方向，還是同一個形狀' },
    'shapes-symmetry': { name: '對折看看', desc: '虛線是不是對稱軸' },
    'shapes-measure': { name: '量量看', desc: '用尺量長度，不一定從 0 開始' },
    'farm-array': { name: '排排菜園', desc: '幾排幾棵，一共幾棵' },
    'farm-times': { name: '九九乘法', desc: '幾組，每組幾個' },
    'farm-share': { name: '平分紅蘿蔔', desc: '每隻兔子分得一樣多' },
    'market-clock': { name: '看時鐘', desc: '幾點幾分' },
    'market-coins': { name: '數錢', desc: '1、5、10、50 元硬幣' },
    'market-change': { name: '找零錢', desc: '付了錢，要找回多少' },
    'kitchen-name': { name: '切披薩', desc: '塗色的部分是幾分之幾' },
    'kitchen-line': { name: '分數數線', desc: '分數也住在數線上' },
    'kitchen-equal': { name: '一樣多', desc: '等值分數' },
    'port-place': { name: '大數位值', desc: '千位、萬位' },
    'port-area': { name: '面積與周長', desc: '鋪滿的格子與繞一圈的長度' },
    'port-decimal': { name: '小數', desc: '十分之一就是 0.1' },
    'challenge-pattern': { name: '找規律', desc: '下一個數是多少' },
    'challenge-balance': { name: '天平推理', desc: '一個水果有多重' },
    'challenge-legs': { name: '雞兔同籠', desc: '假設全部都是雞' },
  },
  shapes: { circle: '圓形', triangle: '三角形', square: '正方形', rectangle: '長方形', pentagon: '五邊形', hexagon: '六邊形' } satisfies Record<Shape, string>,
  yes: '會',
  no: '不會',
  quiz: {
    add20: {
      prompt: d => `${d.a} ${d.op === '+' ? '加' : '減'} ${d.b} 等於多少？`,
      hint: d => d.op === '-' ? `先減到 10：${d.a} 減 ${d.a - 10} 是 10，再減剩下的 ${d.b - (d.a - 10)}。`
        : d.a + d.b > 10 ? `先把 ${d.a} 湊成 10，要從 ${d.b} 拿 ${10 - d.a} 個過來，${d.b} 還剩幾個？`
          : '紅點和藍點，一起數數看。',
    } as QuizText<Add20>,
    blocks: {
      prompt: () => '這些積木一共是多少？',
      hint: d => d.n >= 100 ? '一片是 100，一條是 10，一顆是 1。先數百，再數十，最後數一。' : '一條是 10，一顆是 1。先十個十個數，再一個一個數。',
    } as QuizText<Blocks>,
    digit: {
      prompt: d => `${fmt(d.n)} 裡的 ${d.digit}，代表多少？`,
      hint: d => `${d.digit} 住在${PLACE_ZH[d.place]}位。${PLACE_ZH[d.place]}位的 1 是 ${fmt(10 ** d.place)}。`,
    } as QuizText<DigitValue>,
    column: {
      prompt: d => `${d.a} ${d.op === '+' ? '加' : '減'} ${d.b} 等於多少？`,
      hint: d => d.op === '-' ? (d.a % 10 < d.b % 10 ? '個位不夠減，要跟十位借 1 個十。' : '先減個位，再減十位。')
        : (d.a % 10) + (d.b % 10) >= 10 ? '個位加起來滿 10 了，要進 1 到十位喔！' : '先加個位，再加十位。',
    } as QuizText<Column>,
    shapeName: {
      prompt: () => '這是什麼形狀？',
      hint: () => '數一數它有幾條邊、幾個角？',
    } as QuizText<unknown>,
    symmetry: {
      prompt: () => '沿著虛線對折，兩邊會一模一樣嗎？',
      hint: () => '想像把紙沿虛線摺起來，兩邊會不會剛好疊在一起？',
    } as QuizText<unknown>,
    measure: {
      prompt: () => '這枝鉛筆有幾公分長？',
      hint: d => d.start === 0 ? '從 0 開始，數一數經過幾格。' : `鉛筆不是從 0 開始喔！從 ${d.start} 數到尾巴，經過幾格？`,
    } as QuizText<Measure>,
    array: {
      prompt: d => `菜園有 ${d.rows} 排，每排 ${d.cols} 棵。一共幾棵？`,
      hint: d => `${d.rows} 個 ${d.cols}：${d.cols}、${d.cols * 2}……繼續數下去。`,
    } as QuizText<ArrayQ>,
    times: {
      prompt: d => `${d.a} 乘以 ${d.b} 等於多少？`,
      hint: d => `${d.a} 組，每組 ${d.b} 個。一組一組數：${d.b}、${d.b * 2}……`,
    } as QuizText<Times>,
    share: {
      prompt: d => `把 ${d.total} 根紅蘿蔔平分給 ${d.groups} 隻兔子，每隻分到幾根？`,
      hint: () => '一隻一根輪流分，分完之後，每隻有幾根？',
    } as QuizText<Share>,
    clock: {
      prompt: () => '現在是幾點幾分？',
      hint: () => '短針指「點」，長針指「分」。長針每走一個數字是 5 分鐘。',
    } as QuizText<unknown>,
    coins: {
      prompt: () => '這些錢一共是多少元？',
      hint: () => '先數大的硬幣，再數小的：50、10、5、1。',
    } as QuizText<unknown>,
    change: {
      prompt: d => `東西 ${d.price} 元，你付了 ${d.paid} 元，要找回多少元？`,
      hint: d => `從 ${d.price} 往上數，數到 ${d.paid}，一共數了多少？`,
    } as QuizText<Change>,
    fracName: {
      prompt: () => '塗色的部分是幾分之幾？',
      hint: d => `整個披薩平分成 ${d.d} 片，塗色的有幾片？`,
    } as QuizText<Fraction>,
    fracLine: {
      prompt: () => '星星的位置是幾分之幾？',
      hint: d => `0 到 1 平分成 ${d.d} 段。星星走了幾段？數「段」，不是數直線。`,
    } as QuizText<Fraction>,
    fracEqual: {
      prompt: d => `哪一個和 ${d.d} 分之 ${d.k} 一樣多？`,
      hint: () => '把每一塊再切成一樣多的小塊：分子和分母要乘同一個數，不是加。',
    } as QuizText<FracEqual>,
    area: {
      prompt: d => d.ask === 'area' ? '這塊地的面積是幾平方公分？' : '這塊地的周長是幾公分？',
      hint: d => d.ask === 'area' ? `一格是 1 平方公分。${d.h} 排，每排 ${d.w} 格。` : `周長是繞一圈的長度：${d.w} + ${d.h} + ${d.w} + ${d.h}。`,
    } as QuizText<Area>,
    decimal: {
      prompt: () => '塗色的部分是多少？用小數表示。',
      hint: () => '一整條是 1，平分成 10 格，一格是 0.1。',
    } as QuizText<Decimal>,
    pattern: {
      prompt: () => '下一個數是多少？',
      hint: () => '看看每一次差多少？差的數有沒有在變？',
    } as QuizText<unknown>,
    balance: {
      prompt: d => `${d.copies} 個${d.fruit}${d.extra ? `加上 ${d.extra}` : ''}，和 ${d.total} 一樣重。一個${d.fruit}是多少？`,
      hint: d => d.extra ? `兩邊都先拿走 ${d.extra}，再把剩下的平分成 ${d.copies} 份。` : `把 ${d.total} 平分成 ${d.copies} 份。`,
    } as QuizText<Balance>,
    legs: {
      prompt: d => `籠子裡有雞和兔子，共 ${d.heads} 個頭、${d.legs} 隻腳。兔子有幾隻？`,
      hint: d => `假設全部都是雞，會有 ${d.heads * 2} 隻腳。多出來的腳，是兔子的，每隻兔子多 2 隻。`,
    } as QuizText<Legs>,
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
  locked: (island: string) => `Earn a star in every game on ${island} to unlock this island!`,
  islands: {
    forest: { name: 'Counting Forest', desc: 'Counting to 10, number lines, ten-frames' },
    bay: { name: 'Ten Bay', desc: 'Make ten, 11–19, adding and subtracting to 20' },
    place: { name: 'Place Value Valley', desc: 'Hundreds, tens, ones; column sums' },
    shapes: { name: 'Shape Workshop', desc: 'Side quest: shapes, symmetry, measuring' },
    farm: { name: 'Times Farm', desc: 'Arrays, times tables, sharing' },
    market: { name: 'Time & Money Market', desc: 'Side quest: clocks, coins, change' },
    kitchen: { name: 'Fraction Kitchen', desc: 'Equal parts, fractions on a line, equal fractions' },
    port: { name: 'Big Number Port', desc: 'Big place values, area and perimeter, decimals' },
    challenge: { name: 'Challenge Island', desc: 'Thinking strategies: patterns, balances, heads and legs' },
  },
  levels: {
    'forest-count': { name: 'Count Them', desc: 'Tap each one and count how many' },
    'forest-line': { name: 'Frog Hop', desc: 'Hop along the number line' },
    'forest-flash': { name: 'Ten-Frame Flash', desc: 'One quick look — how many?' },
    'bay-make10': { name: 'Make Ten', desc: 'How many more to make 10?' },
    'bay-teen': { name: 'Ten and Some More', desc: 'One ten and some ones' },
    'bay-add20': { name: 'Boat Sums', desc: 'Make ten first, then add or take away' },
    'place-blocks': { name: 'Block Builder', desc: 'Hundreds, tens and ones blocks' },
    'place-digit': { name: 'Where Digits Live', desc: 'The same digit is worth more in a bigger place' },
    'place-column': { name: 'Column Sums', desc: 'Carrying and borrowing' },
    'shapes-name': { name: 'Name the Shape', desc: 'Turned around, still the same shape' },
    'shapes-symmetry': { name: 'Fold It', desc: 'Is the dashed line a line of symmetry?' },
    'shapes-measure': { name: 'Measure It', desc: "Rulers don't always start at 0" },
    'farm-array': { name: 'Garden Rows', desc: 'Rows of plants — how many?' },
    'farm-times': { name: 'Times Tables', desc: 'Groups of the same size' },
    'farm-share': { name: 'Share the Carrots', desc: 'Every rabbit gets the same' },
    'market-clock': { name: 'Tell the Time', desc: 'Hours and minutes' },
    'market-coins': { name: 'Count Coins', desc: 'NT$1, 5, 10 and 50 coins' },
    'market-change': { name: 'Give Change', desc: 'How much money comes back?' },
    'kitchen-name': { name: 'Pizza Slices', desc: 'What fraction is shaded?' },
    'kitchen-line': { name: 'Fraction Line', desc: 'Fractions live on the number line too' },
    'kitchen-equal': { name: 'Just as Much', desc: 'Equivalent fractions' },
    'port-place': { name: 'Big Place Values', desc: 'Thousands and ten-thousands' },
    'port-area': { name: 'Area & Perimeter', desc: 'Squares inside, distance around' },
    'port-decimal': { name: 'Decimals', desc: 'One tenth is 0.1' },
    'challenge-pattern': { name: 'Find the Pattern', desc: 'What comes next?' },
    'challenge-balance': { name: 'Balance Puzzle', desc: 'How heavy is one fruit?' },
    'challenge-legs': { name: 'Heads and Legs', desc: 'What if they were all chickens?' },
  },
  shapes: { circle: 'Circle', triangle: 'Triangle', square: 'Square', rectangle: 'Rectangle', pentagon: 'Pentagon', hexagon: 'Hexagon' },
  yes: 'Yes',
  no: 'No',
  quiz: {
    add20: {
      prompt: d => `What is ${d.a} ${d.op === '+' ? 'plus' : 'minus'} ${d.b}?`,
      hint: d => d.op === '-' ? `Go down to 10 first: ${d.a} minus ${d.a - 10} is 10. Then take away the other ${d.b - (d.a - 10)}.`
        : d.a + d.b > 10 ? `Make ${d.a} into 10 by taking ${10 - d.a} from ${d.b}. How many are left in ${d.b}?`
          : 'Count the red and blue dots together.',
    } as QuizText<Add20>,
    blocks: {
      prompt: () => 'How much are these blocks altogether?',
      hint: d => d.n >= 100 ? 'A flat is 100, a rod is 10, a cube is 1. Count hundreds, then tens, then ones.' : 'A rod is 10, a cube is 1. Count by tens, then by ones.',
    } as QuizText<Blocks>,
    digit: {
      prompt: d => `In ${fmt(d.n)}, what is the ${d.digit} worth?`,
      hint: d => `The ${d.digit} is in the ${PLACE_EN[d.place]} place. One in that place is worth ${fmt(10 ** d.place)}.`,
    } as QuizText<DigitValue>,
    column: {
      prompt: d => `What is ${d.a} ${d.op === '+' ? 'plus' : 'minus'} ${d.b}?`,
      hint: d => d.op === '-' ? (d.a % 10 < d.b % 10 ? "The ones can't be taken away — borrow 1 ten from the tens." : 'Subtract the ones, then the tens.')
        : (d.a % 10) + (d.b % 10) >= 10 ? 'The ones make 10 or more — carry 1 to the tens!' : 'Add the ones, then the tens.',
    } as QuizText<Column>,
    shapeName: { prompt: () => 'What shape is this?', hint: () => 'How many sides and corners does it have?' } as QuizText<unknown>,
    symmetry: {
      prompt: () => 'If you fold along the dashed line, do both sides match?',
      hint: () => 'Imagine folding the paper on the line. Would the two halves lie exactly on top of each other?',
    } as QuizText<unknown>,
    measure: {
      prompt: () => 'How many centimetres long is the pencil?',
      hint: d => d.start === 0 ? 'Start at 0 and count the spaces.' : `The pencil doesn't start at 0! Count the spaces from ${d.start} to its end.`,
    } as QuizText<Measure>,
    array: {
      prompt: d => `The garden has ${d.rows} rows of ${d.cols} plants. How many plants?`,
      hint: d => `${d.rows} lots of ${d.cols}: ${d.cols}, ${d.cols * 2}… keep counting.`,
    } as QuizText<ArrayQ>,
    times: {
      prompt: d => `What is ${d.a} times ${d.b}?`,
      hint: d => `${d.a} groups of ${d.b}. Count group by group: ${d.b}, ${d.b * 2}…`,
    } as QuizText<Times>,
    share: {
      prompt: d => `Share ${d.total} carrots equally among ${d.groups} rabbits. How many does each get?`,
      hint: () => 'Give one to each rabbit in turn. When they are all gone, how many does each have?',
    } as QuizText<Share>,
    clock: { prompt: () => 'What time is it?', hint: () => 'The short hand shows the hour, the long hand the minutes. Each number on the long hand is 5 minutes.' } as QuizText<unknown>,
    coins: { prompt: () => 'How much money is this?', hint: () => 'Count the big coins first, then the small ones: 50, 10, 5, 1.' } as QuizText<unknown>,
    change: {
      prompt: d => `It costs ${d.price} dollars and you pay ${d.paid}. How much change do you get?`,
      hint: d => `Count up from ${d.price} to ${d.paid}. How much did you count?`,
    } as QuizText<Change>,
    fracName: { prompt: () => 'What fraction is shaded?', hint: d => `The pizza is cut into ${d.d} equal slices. How many are shaded?` } as QuizText<Fraction>,
    fracLine: {
      prompt: () => 'What fraction is the star at?',
      hint: d => `0 to 1 is split into ${d.d} equal parts. How many parts has the star gone? Count parts, not lines.`,
    } as QuizText<Fraction>,
    fracEqual: {
      prompt: d => `Which one is the same as ${d.k}/${d.d}?`,
      hint: () => 'Cut every piece into the same number of smaller pieces: multiply the top and bottom by the same number — don\'t add.',
    } as QuizText<FracEqual>,
    area: {
      prompt: d => d.ask === 'area' ? 'What is the area in square centimetres?' : 'What is the perimeter in centimetres?',
      hint: d => d.ask === 'area' ? `Each square is 1 square centimetre. ${d.h} rows of ${d.w}.` : `Perimeter is the distance all the way around: ${d.w} + ${d.h} + ${d.w} + ${d.h}.`,
    } as QuizText<Area>,
    decimal: { prompt: () => 'How much is shaded? Write it as a decimal.', hint: () => 'A whole strip is 1. It has 10 equal parts, so each part is 0.1.' } as QuizText<Decimal>,
    pattern: { prompt: () => 'What number comes next?', hint: () => 'How much does it change each time? Is the change changing?' } as QuizText<unknown>,
    balance: {
      prompt: d => `${d.copies} ${d.fruit}${d.extra ? ` and ${d.extra}` : ''} weigh the same as ${d.total}. How much is one ${d.fruit}?`,
      hint: d => d.extra ? `Take ${d.extra} off both sides, then split what is left into ${d.copies} equal parts.` : `Split ${d.total} into ${d.copies} equal parts.`,
    } as QuizText<Balance>,
    legs: {
      prompt: d => `Chickens and rabbits: ${d.heads} heads and ${d.legs} legs. How many rabbits?`,
      hint: d => `If they were all chickens there would be ${d.heads * 2} legs. The extra legs belong to rabbits — each rabbit has 2 extra.`,
    } as QuizText<Legs>,
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
