// The adventure around the levels: a question to think about before each lesson, how each island's
// idea was first invented, a mystery per island whose clues come one level at a time, and a fox that
// grows stronger with every level it finishes.
import type { Lang } from './i18n'
import { ISLANDS, type IslandId, type LevelId } from './islands'

/** Pictures for "think first" questions (rows split by '/', items by spaces, as in stories). */
export const PONDER_PICS: Record<LevelId, string> = {
  'forest-count': '🍎 🍎 🍎 🍎 / 🍎 🍎 🍎',
  'forest-line': '🐸 / 0 1 2 3 4 5 6',
  'forest-flash': '⚄',
  'bay-make10': '🥚 🥚 🥚 🥚 🥚 / 🥚 🥚 ⬜ ⬜ ⬜',
  'bay-teen': '🔟 / 🟡 🟡 🟡',
  'bay-add20': '🍬 🍬 🍬 🍬 🍬 🍬 🍬 🍬 / 🍬 🍬 🍬 🍬 🍬',
  'place-blocks': '💯 💯 / 🔟 🔟 🔟 / 1️⃣',
  'place-digit': '3️⃣0️⃣5️⃣ / 3️⃣5️⃣',
  'place-column': '🐷 / 4️⃣8️⃣ ➕ 2️⃣7️⃣',
  'shapes-name': '🔺 🔄 🔻',
  'shapes-symmetry': '🦋 🌀',
  'shapes-measure': '📏 / 2 3 4 5 6 7 / ✏️',
  'farm-array': '🥬 🥬 🥬 🥬 / 🥬 🥬 🥬 🥬 / 🥬 🥬 🥬 🥬',
  'farm-times': '🍬 🍬 🍬 / 🍬 🍬 🍬 / 🍬 🍬 🍬 / 🍬 🍬 🍬',
  'farm-share': '🥕 🥕 🥕 🥕 🥕 🥕 🥕 🥕 / 🐰 🐰',
  'market-clock': '🕞',
  'market-coins': '🔟 🔟 5️⃣ 1️⃣ 1️⃣',
  'market-change': '💵 5️⃣0️⃣ / 🥞 3️⃣5️⃣',
  'kitchen-name': '🍕 / ◔',
  'kitchen-line': '🏠 🚶 ➖ ➖ 🏫',
  'kitchen-equal': '◑ / ◔ ◔',
  'port-place': '🚲 / 1️⃣2️⃣0️⃣0️⃣0️⃣',
  'port-area': '🟩 🟩 🟩 / 🟩 🟩 🟩',
  'port-decimal': '🌡️ / 3️⃣7️⃣.5️⃣',
  'challenge-pattern': '🔴 🔵 🔴 🔵 🔴 ❓',
  'challenge-balance': '🍉 ⚖️ 🍎 🍎 🍎',
  'challenge-legs': '🐔 🐰 ❓ / 🦶 × 10',
}

/** Pictures for "long, long ago" scenes, played before each island's everyday story. */
export const ORIGIN_PICS: Record<IslandId, string[]> = {
  forest: ['🦴 / 🏹 🦌 🦌 🦌', '🦴 / | | | | |'],
  bay: ['🖐️ 🖐️', '🖐️ 🖐️ ➡️ 🔟'],
  place: ['🥢 🥢 🥢 🥢 🥢 🥢 🥢 / 🥢 🥢 🥢 🥢 🥢 🥢 🥢', '📦 📦 / 🥢 🥢 🥢'],
  shapes: ['🌊 / 🌾 🌾 🌾', '🪢 📐 / 🟫 🟫 🟫'],
  farm: ['🌾 🌾 🌾 🌾 🌾 🌾 / 🌾 🌾 🌾 🌾 🌾 🌾 / 🌙', '🌾 🌾 🌾 / 🌾 🌾 🌾 / ✖️'],
  market: ['☀️ / 🪵 🕳️', '🐚 🐚 🐚 ➡️ 🐟 / 🪙'],
  kitchen: ['🍞 / 🧑 🧑 🧑', '🍞 ✂️ / ◔ ◔ ◔ ◔'],
  port: ['🚢 / 📦 📦 📦 📦 📦 📦', '🔢 / 0️⃣'],
  challenge: ['🔺 / 🧐', '🔺 ☀️ / 📏 🧍 📏'],
}

/** The power the fox gains when an island's mystery is solved. */
export const POWER_ICONS: Record<IslandId, string> = {
  forest: '🔍', bay: '🧭', place: '🗝️', shapes: '📐', farm: '⚡', market: '⌚', kitchen: '🥄', port: '🔭', challenge: '🧠',
}

interface Mystery { title: string; clues: [string, string, string]; solved: string; power: string }
interface Ponder { q: string; choices: string[] }

interface AdventureText {
  ponderTitle: string
  dunno: string
  ponderAck: (choice: string) => string
  ponderDunno: string
  letsSee: string
  longAgo: string
  mysteryTitle: string
  clueOf: (n: number) => string
  hidden: string
  foxGrew: (level: number) => string
  newClue: (n: number) => string
  solvedTitle: string
  newPower: (power: string) => string
  nowRank: (rank: string) => string
  /** One title per number of islands solved, 0 to 9. */
  ranks: string[]
  islandHi: (title: string) => string
  ponder: Record<LevelId, Ponder>
  origin: Record<IslandId, string[]>
  mystery: Record<IslandId, Mystery>
}

const zh: AdventureText = {
  ponderTitle: '🤔 想想看',
  dunno: '🤔 還不知道',
  ponderAck: c => `你想的是「${c}」。好想法！我們一起來看看小狐狸怎麼想。`,
  ponderDunno: '沒關係，想不出來也很棒！我們一起來看看小狐狸怎麼想。',
  letsSee: '看示範',
  longAgo: '📜 從前從前',
  mysteryTitle: '🧩 島上的謎題',
  clueOf: n => `線索 ${n}`,
  hidden: '？？？ 過關就能找到',
  foxGrew: n => `小狐狸變強了！升到 Lv.${n}`,
  newClue: n => `找到線索 ${n}：`,
  solvedTitle: '🎉 謎題解開了！',
  newPower: p => `小狐狸得到新能力：${p}`,
  nowRank: r => `現在是「${r}」！`,
  ranks: ['小狐狸寶寶', '見習小狐狸', '數數小偵探', '小小探險家', '數學小勇士', '數學騎士', '智慧騎士', '數學魔法師', '大魔法師', '數學島守護者'],
  islandHi: title => `${title}每過一關，就會找到一條線索。一起解開謎題吧！`,
  ponder: {
    'forest-count': { q: '有幾顆蘋果？要怎麼數，才不會數兩次？', choices: ['6', '7', '8'] },
    'forest-line': { q: '青蛙在 2，往前跳 3 格，會跳到哪裡？', choices: ['4', '5', '6'] },
    'forest-flash': { q: '不要一顆一顆數，你能一眼看出幾點嗎？', choices: ['4', '5', '6'] },
    'bay-make10': { q: '再放幾顆雞蛋，盒子就滿了？你怎麼知道的？', choices: ['2', '3', '4'] },
    'bay-teen': { q: '一盒 10 顆，再加 3 顆，一共幾顆？', choices: ['13', '103', '31'] },
    'bay-add20': { q: '8 顆糖再拿 5 顆，有沒有比一顆一顆數更快的方法？', choices: ['12', '13', '14'] },
    'place-blocks': { q: '兩個一百、三個十、一個一，一共是多少？', choices: ['231', '2031', '6'] },
    'place-digit': { q: '305 和 35 都有 3 和 5，哪個比較多？為什麼？', choices: ['305', '35', '一樣多'] },
    'place-column': { q: '48 元再存 27 元，個位 8 加 7 超過 10 了，該怎麼辦？', choices: ['75', '65', '615'] },
    'shapes-name': { q: '三角形倒過來，還是三角形嗎？', choices: ['是', '不是'] },
    'shapes-symmetry': { q: '哪一個對折之後，兩邊會一模一樣？', choices: ['🦋', '🌀'] },
    'shapes-measure': { q: '尺斷了，從 2 開始量，鉛筆尖到 7。鉛筆有多長？', choices: ['5', '7', '9'] },
    'farm-array': { q: '不要一棵一棵數，你能很快算出有幾棵菜嗎？', choices: ['10', '12', '14'] },
    'farm-times': { q: '4 袋糖果，每袋 3 顆，一共幾顆？', choices: ['7', '12', '15'] },
    'farm-share': { q: '8 根紅蘿蔔分給 2 隻兔子，每隻幾根才公平？', choices: ['3', '4', '5'] },
    'market-clock': { q: '短針在 3 和 4 中間，長針指著 6，是幾點幾分？', choices: ['3:06', '3:30', '6:15'] },
    'market-coins': { q: '這些硬幣一共多少錢？先數哪一種比較快？', choices: ['17', '27', '30'] },
    'market-change': { q: '用 50 元買 35 元的蛋餅，老闆要找多少？', choices: ['15', '25', '85'] },
    'kitchen-name': { q: '披薩切成一樣大的 4 片，一片要怎麼說？', choices: ['2 分之 1', '4 分之 1', '4'] },
    'kitchen-line': { q: '從家走到學校，走到一半的地方，是全程的幾分之幾？', choices: ['2 分之 1', '3 分之 1', '2'] },
    'kitchen-equal': { q: '半個披薩，和 2 片 4 分之 1，哪個比較多？', choices: ['半個', '2 片', '一樣多'] },
    'port-place': { q: '腳踏車 12000 元，要怎麼唸？', choices: ['一千兩百', '一萬兩千', '十二百'] },
    'port-area': { q: '要鋪滿這塊地，需要幾塊地墊？', choices: ['5', '6', '9'] },
    'port-decimal': { q: '體溫 37.5 度，比 37 度多還是少？', choices: ['多一點', '少一點', '一樣'] },
    'challenge-pattern': { q: '紅、藍、紅、藍、紅……下一個是什麼？', choices: ['🔴', '🔵'] },
    'challenge-balance': { q: '天平平衡了：一顆西瓜和幾顆蘋果一樣重？', choices: ['2', '3', '4'] },
    'challenge-legs': { q: '雞和兔子一共 3 隻，有 10 隻腳。你猜有幾隻兔子？', choices: ['1 隻', '2 隻', '3 隻'] },
  },
  origin: {
    forest: ['很久很久以前，還沒有數字。獵人出去打獵，要怎麼記住抓到幾隻鹿呢？', '他們想到一個好方法：抓到一隻，就在骨頭上刻一條線。看線有幾條，就知道有幾隻。這就是數數的開始！'],
    bay: ['從前的人用手指頭數東西，兩隻手剛好有 10 根手指。', '數到 10，手指用完了，就記下「一個十」，再從頭數。所以我們的數字，都是十個十個一組！'],
    place: ['古時候的人用小竹棒算數，叫做算籌。棒子一多，排得亂七八糟，好難看懂。', '於是十根綁成一捆，十捆再綁成一大捆。放的位置不同，代表的大小就不同。這就是位值！'],
    shapes: ['很久以前，大河每年都會淹水，把農田的界線全部沖掉了。', '人們拿打了結的繩子量長度、拉出直直的角，把田重新畫好。量長度和認形狀，就是這樣開始的！'],
    farm: ['從前的農夫想知道田裡有幾棵麥子，一棵一棵數，數到天黑都數不完。', '聰明的農夫把麥子種成一排一排，每排一樣多。數一排有幾棵、有幾排，一下就算出來。這就是乘法！'],
    market: ['很久以前沒有時鐘，人們看太陽照出的影子，知道現在是什麼時候。', '以前買東西用貝殼來交換，後來才有了硬幣。錢要算清楚，交換才公平！'],
    kitchen: ['古時候的人要把麵包分給工人，可是麵包不夠，沒辦法一人一整個。', '他們把麵包切成一樣大的小塊，一個人拿「幾分之幾」。分數就是這樣來的！'],
    port: ['大船越造越大，載的貨物多到上千、上萬件，數字也要越來越大。', '人們發明了「0」來佔住位置，再大的數都寫得出來：10、100、1000、10000！'],
    challenge: ['很久以前，有人站在高高的金字塔前想：這麼高，爬不上去，要怎麼知道它有多高？', '他看著太陽下的影子，比一比自己的影子，就推理出金字塔的高度。數學不只是算，還能幫我們想出答案！'],
  },
  mystery: {
    forest: {
      title: '松鼠的果子少了！',
      clues: ['倉庫裡數一數，只剩 7 顆果子，可是原本有 10 顆。', '地上的小腳印一跳一跳，從 1 號樹跳到了 4 號樹。', '4 號樹洞裡，一眼就看到 3 顆果子！'],
      solved: '7 顆加 3 顆，剛好 10 顆！原來是小松鼠藏起來當點心。',
      power: '🔍 數清楚的眼睛',
    },
    bay: {
      title: '船長的寶箱打不開！',
      clues: ['寶箱上寫著：「把珍珠放滿 10 顆才會開。」裡面已經有 6 顆。', '船長的紙條說：「第二道密碼是一個十和 4 個一。」', '再放 4 顆珍珠，湊滿 10 顆；密碼輸入 14……'],
      solved: '喀！寶箱打開了，裡面是 14 顆閃亮的貝殼！',
      power: '🧭 湊十羅盤',
    },
    place: {
      title: '商店的價錢牌被風吹亂了！',
      clues: ['撿到一張牌：2 個百、5 個十、3 個一，是 253 元。', '另一張寫 352，數字一樣，位置不同，價錢也不一樣。', '小熊 253 元加上皮球 352 元，一共是 605 元。'],
      solved: '價錢牌都放回正確的位置，老闆說：「謝謝小狐狸，再也不會算錯錢了！」',
      power: '🗝️ 位值鑰匙',
    },
    shapes: {
      title: '小木屋的窗戶裝不上去！',
      clues: ['窗框是正方形，可是做好的玻璃是長方形。', '對折玻璃上的花紋，左右一模一樣，花紋沒問題。', '用尺量：窗框 30 公分，玻璃 35 公分，多了 5 公分。'],
      solved: '把玻璃切掉 5 公分，變成正方形，窗戶裝好了！',
      power: '📐 魔法量尺',
    },
    farm: {
      title: '是誰偷吃了高麗菜？',
      clues: ['菜園 3 排、每排 5 棵，應該有 15 棵，現在只剩 12 棵。', '地上有兔子腳印，一隻兔子 4 隻腳，一共 12 個腳印，是 3 隻兔子。', '少了 3 棵菜，3 隻兔子平分，每隻吃了 1 棵。'],
      solved: '原來是 3 隻肚子餓的小兔子！小狐狸幫牠們種了一排自己的紅蘿蔔。',
      power: '⚡ 乘法閃電',
    },
    market: {
      title: '市集的大鐘停了！',
      clues: ['大鐘停在 3 點，可是現在已經 3 點半了。', '修鐘師傅說：修理要 45 元。錢包裡有 4 個 10 元和 1 個 5 元，剛好夠。', '付了 50 元，師傅找回 5 元，一毛都沒少。'],
      solved: '噹、噹、噹！大鐘修好了，市集準時開張。',
      power: '⌚ 時光手錶',
    },
    kitchen: {
      title: '生日蛋糕不夠分？',
      clues: ['蛋糕切成 4 片，可是來了 8 個朋友。', '每片再切一半，一片就變成 8 分之 1。', '2 片 8 分之 1，和 1 片 4 分之 1 一樣多！'],
      solved: '8 個朋友每人一片 8 分之 1，大家都吃到了，誰都不吃虧。',
      power: '🥄 公平魔法勺',
    },
    port: {
      title: '大船的貨單看不懂！',
      clues: ['貨單寫著 3 萬 2 千件，就是 32,000 件。', '倉庫地板長 8 格、寬 5 格，一共可以放 40 箱。', '每箱重 2.5 公斤，比 2 公斤多一半。'],
      solved: '貨物整整齊齊搬進倉庫，船長送給小狐狸一副望遠鏡！',
      power: '🔭 大數望遠鏡',
    },
    challenge: {
      title: '神秘的寶藏地圖',
      clues: ['地圖上的石頭寫著 2、4、6、8……往第 10 號石頭走。', '寶箱旁的天平：1 顆寶石和 2 枚金幣一樣重。', '守門的雞和兔子共 5 隻、14 隻腳：3 隻雞、2 隻兔子，門開了！'],
      solved: '寶藏是一本《思考之書》，小狐狸成為真正的數學偵探！',
      power: '🧠 偵探大腦',
    },
  },
}

const en: AdventureText = {
  ponderTitle: '🤔 Think first',
  dunno: "🤔 Not sure yet",
  ponderAck: c => `You thought "${c}". Good thinking! Let's see how Fox works it out.`,
  ponderDunno: "That's fine, thinking about it is great! Let's see how Fox works it out.",
  letsSee: 'Watch',
  longAgo: '📜 Long, long ago',
  mysteryTitle: '🧩 Island mystery',
  clueOf: n => `Clue ${n}`,
  hidden: '??? Finish a level to find it',
  foxGrew: n => `Fox got stronger! Now Lv.${n}`,
  newClue: n => `Found clue ${n}: `,
  solvedTitle: '🎉 Mystery solved!',
  newPower: p => `Fox has a new power: ${p}`,
  nowRank: r => `Now a ${r}!`,
  ranks: ['Baby Fox', 'Fox Cub', 'Counting Detective', 'Little Explorer', 'Math Hero', 'Math Knight', 'Wise Knight', 'Math Wizard', 'Grand Wizard', 'Guardian of Math Islands'],
  islandHi: title => `${title} Each level you finish finds a clue. Let's solve the mystery!`,
  ponder: {
    'forest-count': { q: 'How many apples? How do you count so you never count one twice?', choices: ['6', '7', '8'] },
    'forest-line': { q: 'The frog is on 2 and hops 3 forward. Where does it land?', choices: ['4', '5', '6'] },
    'forest-flash': { q: "Don't count one by one: can you see how many dots at a glance?", choices: ['4', '5', '6'] },
    'bay-make10': { q: 'How many more eggs fill the box? How do you know?', choices: ['2', '3', '4'] },
    'bay-teen': { q: 'A box of 10 and 3 more. How many altogether?', choices: ['13', '103', '31'] },
    'bay-add20': { q: '8 sweets and 5 more. Is there a quicker way than counting one by one?', choices: ['12', '13', '14'] },
    'place-blocks': { q: 'Two hundreds, three tens and one one. How much is that?', choices: ['231', '2031', '6'] },
    'place-digit': { q: '305 and 35 both have a 3 and a 5. Which is more? Why?', choices: ['305', '35', 'The same'] },
    'place-column': { q: 'Save 27 more on top of 48. The ones, 8 + 7, go past 10. What now?', choices: ['75', '65', '615'] },
    'shapes-name': { q: 'Turn a triangle upside down. Is it still a triangle?', choices: ['Yes', 'No'] },
    'shapes-symmetry': { q: 'Which one has two matching halves when you fold it?', choices: ['🦋', '🌀'] },
    'shapes-measure': { q: 'A broken ruler starts at 2 and the pencil tip is at 7. How long is the pencil?', choices: ['5', '7', '9'] },
    'farm-array': { q: "Don't count one by one: how quickly can you find how many cabbages?", choices: ['10', '12', '14'] },
    'farm-times': { q: '4 bags of sweets, 3 in each. How many sweets?', choices: ['7', '12', '15'] },
    'farm-share': { q: '8 carrots for 2 rabbits. How many each is fair?', choices: ['3', '4', '5'] },
    'market-clock': { q: 'The short hand is between 3 and 4, the long hand points at 6. What time is it?', choices: ['3:06', '3:30', '6:15'] },
    'market-coins': { q: 'How much are these coins? Which kind is quickest to count first?', choices: ['17', '27', '30'] },
    'market-change': { q: 'You pay 50 for a 35 pancake roll. How much change?', choices: ['15', '25', '85'] },
    'kitchen-name': { q: 'A pizza cut into 4 equal slices. What do we call one slice?', choices: ['one half', 'one quarter', '4'] },
    'kitchen-line': { q: 'Halfway from home to school: what fraction of the way is that?', choices: ['one half', 'one third', '2'] },
    'kitchen-equal': { q: 'Half a pizza, or 2 quarter slices: which is more?', choices: ['Half', '2 quarters', 'The same'] },
    'port-place': { q: 'A bike costs 12000. How do you say it?', choices: ['one thousand two hundred', 'twelve thousand', 'twelve hundred hundred'] },
    'port-area': { q: 'How many mats cover this floor?', choices: ['5', '6', '9'] },
    'port-decimal': { q: 'A temperature of 37.5: more or less than 37?', choices: ['A bit more', 'A bit less', 'The same'] },
    'challenge-pattern': { q: 'Red, blue, red, blue, red… what comes next?', choices: ['🔴', '🔵'] },
    'challenge-balance': { q: 'The scale balances. One melon weighs the same as how many apples?', choices: ['2', '3', '4'] },
    'challenge-legs': { q: '3 chickens and rabbits with 10 legs. How many rabbits, do you think?', choices: ['1', '2', '3'] },
  },
  origin: {
    forest: ['Long, long ago there were no numbers. How could a hunter remember how many deer he caught?', 'He had a clever idea: one scratch on a bone for each deer. Count the scratches and you know how many. That is how counting began!'],
    bay: ['People long ago counted on their fingers, and two hands have exactly 10 fingers.', 'At 10 the fingers run out, so you note down "one ten" and start again. That is why our numbers go in groups of ten!'],
    place: ['Long ago people did sums with little bamboo sticks. With lots of sticks the piles got messy and hard to read.', 'So they tied 10 sticks into a bundle, and 10 bundles into a big bundle. Where a bundle sits shows how much it is worth. That is place value!'],
    shapes: ['Long ago a great river flooded every year and washed away the edges of the fields.', 'People used knotted ropes to measure lengths and make straight corners, and drew the fields again. That is how measuring and shapes began!'],
    farm: ['A farmer long ago wanted to know how many wheat plants were in the field. Counting one by one, he was still counting at nightfall.', 'A clever farmer planted in rows, the same number in each. Count one row and the number of rows, and you know straight away. That is multiplying!'],
    market: ['Long ago there were no clocks. People looked at the shadows the sun made to tell the time.', 'People once swapped shells for things, and later coins were invented. Counting money carefully keeps a swap fair!'],
    kitchen: ['Long ago people had to share bread with workers, but there was not a whole loaf for each.', 'So they cut the bread into equal pieces, and each person got a fraction. That is where fractions come from!'],
    port: ['Ships grew bigger and carried thousands, then tens of thousands of boxes. Numbers had to grow bigger too.', 'People invented 0 to hold a place, so even huge numbers can be written: 10, 100, 1000, 10000!'],
    challenge: ['Long ago someone stood before a tall pyramid and wondered: I cannot climb it, so how can I know how tall it is?', 'He compared its shadow with his own shadow in the sun and worked out its height. Maths is not just sums; it helps us think our way to answers!'],
  },
  mystery: {
    forest: {
      title: "The squirrels' nuts are missing!",
      clues: ['Count the store: only 7 nuts left, but there were 10.', 'Little footprints hop from tree 1 to tree 4.', 'In the hole in tree 4 you can see 3 nuts at a glance!'],
      solved: '7 and 3 make exactly 10! The little squirrel hid them for a snack.',
      power: '🔍 Sharp counting eyes',
    },
    bay: {
      title: "The captain's chest won't open!",
      clues: ['The chest says: "Fill me with 10 pearls to open." There are 6 inside.', 'The captain\'s note says: "The second code is one ten and 4 ones."', 'Put in 4 more pearls to make 10, and type in 14…'],
      solved: 'Click! The chest opens, and inside are 14 shining shells!',
      power: '🧭 Make-ten compass',
    },
    place: {
      title: "The wind blew the shop's price tags away!",
      clues: ['One tag: 2 hundreds, 5 tens, 3 ones. That is 253.', 'Another says 352: the same digits in different places, so a different price.', 'The bear at 253 plus the ball at 352 makes 605.'],
      solved: 'All the tags are back in place. The shopkeeper says: "Thank you, Fox! Nobody will get the money wrong now."',
      power: '🗝️ Place-value key',
    },
    shapes: {
      title: "The cabin window won't fit!",
      clues: ['The frame is a square, but the glass is a rectangle.', 'Fold the pattern on the glass: both sides match, so the pattern is fine.', 'Measure: the frame is 30 cm and the glass is 35 cm. 5 cm too long.'],
      solved: 'Trim 5 cm off the glass to make a square, and the window fits!',
      power: '📐 Magic ruler',
    },
    farm: {
      title: 'Who ate the cabbages?',
      clues: ['3 rows of 5 should make 15 cabbages, but only 12 are left.', 'Rabbit footprints: 4 feet each and 12 prints, so 3 rabbits.', '3 cabbages gone, shared by 3 rabbits: 1 each.'],
      solved: 'It was 3 hungry little rabbits! Fox planted them a row of carrots of their own.',
      power: '⚡ Times lightning',
    },
    market: {
      title: 'The market clock has stopped!',
      clues: ["The clock says 3 o'clock, but it is already half past 3.", 'The clockmaker charges 45. The purse has four 10s and one 5: just enough.', 'Pay 50 and get 5 back. Not a coin missing.'],
      solved: 'Dong, dong, dong! The clock is fixed and the market opens on time.',
      power: '⌚ Time watch',
    },
    kitchen: {
      title: 'Not enough birthday cake?',
      clues: ['The cake is cut into 4 slices, but 8 friends came.', 'Cut each slice in half: now one slice is one eighth.', 'Two eighths are the same as one quarter!'],
      solved: 'All 8 friends get one eighth each. Everyone has some and nobody gets less.',
      power: '🥄 Fair-share spoon',
    },
    port: {
      title: "The ship's cargo list is a puzzle!",
      clues: ['The list says 32 thousand items: 32,000.', 'The warehouse floor is 8 squares long and 5 wide: room for 40 boxes.', 'Each box weighs 2.5 kg, half a kilo more than 2.'],
      solved: 'All the cargo is stacked neatly away, and the captain gives Fox a telescope!',
      power: '🔭 Big-number telescope',
    },
    challenge: {
      title: 'The secret treasure map',
      clues: ['The stones on the map go 2, 4, 6, 8… walk to stone 10.', 'The scale by the chest: 1 jewel weighs the same as 2 gold coins.', 'The gate guards, chickens and rabbits, have 5 heads and 14 legs: 3 chickens and 2 rabbits. The gate opens!'],
      solved: 'The treasure is The Book of Thinking. Fox is a real math detective now!',
      power: '🧠 Detective brain',
    },
  },
}

export const ADVENTURE: Record<Lang, AdventureText> = { zh, en }

/** Levels with at least one star: the fox's level. */
export const foxLevel = (stars: Record<string, number>) =>
  ISLANDS.reduce((n, i) => n + i.levels.filter(l => (stars[l.id] ?? 0) > 0).length, 0)

/** Islands whose every level has a star: their mysteries are solved and their powers won. */
export const solvedIslands = (stars: Record<string, number>) =>
  ISLANDS.filter(i => i.levels.every(l => (stars[l.id] ?? 0) > 0)).map(i => i.id)
