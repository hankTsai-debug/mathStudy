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
    forest: { name: '數數森林', desc: '1–10 的數數、數線、十格框', story: '松鼠一家要過冬了！要數清楚收集了幾顆果子，才知道夠不夠吃。' },
    bay: { name: '十的海灣', desc: '湊十、11–19、20 以內加減', story: '漁船的一箱裝 10 條魚。會湊十，就能很快算出還差幾條、一共幾條。' },
    place: { name: '位值山谷', desc: '百十個、位值、二位數直式加減', story: '山谷商店的東西越來越多，數字變大了！看懂百位、十位、個位，才不會把 305 元看成 35 元。' },
    shapes: { name: '形狀工坊', desc: '支線：認識形狀、對稱、量長度', story: '木匠要做書架和小屋：選對形狀、量準長度，零件才拼得起來。' },
    farm: { name: '乘法農場', desc: '陣列、九九乘法、平分', story: '農場的菜一排一排，好多好多，一棵一棵數太慢了！學會乘法一下就算出來，還能公平分給兔子。' },
    market: { name: '時間錢幣市集', desc: '支線：看時鐘、數錢、找零', story: '市集要開張了！要看時鐘準時到、數數錢夠不夠買，還要檢查老闆找的錢對不對。' },
    kitchen: { name: '分數廚房', desc: '等分、數線上的分數、等值分數', story: '廚師做蛋糕和披薩，要切得一樣大才公平。食譜上還寫著「半杯」「四分之一匙」。' },
    port: { name: '大數港口', desc: '萬以內的位值、面積周長、小數', story: '大船一次載幾千、幾萬件貨物！要看懂大數、算倉庫地板多大、圍欄多長，還要讀懂 2.5 公斤這種小數。' },
    challenge: { name: '挑戰島', desc: '思維策略：找規律、天平推理、雞兔同籠', story: '島上的謎題沒有現成的算式，要自己想辦法：找規律、推理、先假設再修正。' },
  },
  levels: {
    'forest-count': { name: '數一數', desc: '一個一個點，數出總共有幾個', why: '數清楚有幾個：餅乾夠不夠分給每個朋友？' },
    'forest-line': { name: '青蛙跳數線', desc: '在數線上跳，認識數字的位置', why: '比大小、算差多少：排隊排第幾、電梯到幾樓。' },
    'forest-flash': { name: '十格框快看', desc: '看一眼，就知道有幾個', why: '一眼看出幾個：骰子、骨牌、撲克牌。' },
    'bay-make10': { name: '湊十', desc: '還要幾個，才能湊滿 10？', why: '心算的秘密武器：8 + 5 先湊成 10，就變簡單了。' },
    'bay-teen': { name: '十和幾', desc: '一個十，再加幾個一', why: '讀懂 11 到 19：生日蠟燭、書的頁碼、樓層。' },
    'bay-add20': { name: '開船加減', desc: '先湊十，再算 20 以內加減', why: '玩遊戲算分數、算零用錢還剩多少。' },
    'place-blocks': { name: '積木合體', desc: '百、十、一的積木一共是多少', why: '很多東西一捆一捆數比較快：一罐硬幣、一盒鉛筆。' },
    'place-digit': { name: '數字住哪裡', desc: '同一個數字，在不同位置值不同', why: '看懂價錢：305 元和 35 元差很多！' },
    'place-column': { name: '直式加減', desc: '進位與借位', why: '算更大的數：存錢買玩具，還差多少錢？' },
    'shapes-name': { name: '形狀名字', desc: '轉個方向，還是同一個形狀', why: '認出身邊的形狀：路標、輪子、蜂巢。' },
    'shapes-symmetry': { name: '對折看看', desc: '虛線是不是對稱軸', why: '蝴蝶、臉、剪紙都是對稱的：摺起來剪出漂亮圖案。' },
    'shapes-measure': { name: '量量看', desc: '用尺量長度，不一定從 0 開始', why: '量身高、看書桌放不放得下；尺斷了也能量。' },
    'farm-array': { name: '排排菜園', desc: '幾排幾棵，一共幾棵', why: '數蛋盒、座位、巧克力格子，不用一個一個數。' },
    'farm-times': { name: '九九乘法', desc: '幾組，每組幾個', why: '買 3 包糖果，每包 6 顆，一共幾顆？' },
    'farm-share': { name: '平分紅蘿蔔', desc: '每隻兔子分得一樣多', why: '和朋友公平分糖果，每人一樣多。' },
    'market-clock': { name: '看時鐘', desc: '幾點幾分', why: '知道幾點上學、卡通幾點開始、還有多久下課。' },
    'market-coins': { name: '數錢', desc: '1、5、10、50 元硬幣', why: '買東西前，看看帶的錢夠不夠。' },
    'market-change': { name: '找零錢', desc: '付了錢，要找回多少', why: '檢查老闆找的錢對不對。' },
    'kitchen-name': { name: '切披薩', desc: '塗色的部分是幾分之幾', why: '公平切披薩和蛋糕：每人分到幾分之幾？' },
    'kitchen-line': { name: '分數數線', desc: '分數也住在數線上', why: '路走了幾分之幾、手機電量還剩多少。' },
    'kitchen-equal': { name: '一樣多', desc: '等值分數', why: '半個披薩和 4 分之 2 個一樣多，誰都不吃虧。' },
    'port-place': { name: '大數位值', desc: '千位、萬位', why: '看懂很大的數：腳踏車 12,000 元、城市裡有多少人。' },
    'port-area': { name: '面積與周長', desc: '鋪滿的格子與繞一圈的長度', why: '房間要鋪多少地墊（面積）、花園要圍多長的籬笆（周長）。' },
    'port-decimal': { name: '小數', desc: '十分之一就是 0.1', why: '看懂身高 1.2 公尺、體溫 36.5 度、商品價錢。' },
    'challenge-pattern': { name: '找規律', desc: '下一個數是多少', why: '找到規律就能預測：下週哪天上游泳課、磁磚怎麼排。' },
    'challenge-balance': { name: '天平推理', desc: '一個水果有多重', why: '看不到的數也能推理出來：這就是以後的方程式。' },
    'challenge-legs': { name: '雞兔同籠', desc: '假設全部都是雞', why: '資料不完整時，先假設再修正：偵探就是這樣想的。' },
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
  learnTitle: '📖 看我示範',
  nextStep: '下一步',
  prevStep: '上一步',
  tryIt: '換你試試！',
  /** One narrated line per lesson step, keyed by level kind (see levels/lessons.tsx; lessons.test.ts checks they match). */
  teach: {
    count: [
      '數東西的時候，每一個只點一次：不能漏掉，也不能重複。',
      '一邊點，一邊數：1、2……',
      '……3、4。每一個都點到了。',
      '最後數到的數字是 4，所以一共有 4 個！',
    ],
    line: [
      '數線上的數字，從左到右越來越大。往右跳，數字就變大。',
      '青蛙在 2，要往前跳 3 格。',
      '一格一格跳，一邊數：3、4、5。',
      '停在 5！所以 2 往前跳 3 格是 5，就是 2 + 3 = 5。',
    ],
    flash: [
      '十格框上面一排有 5 格。上面排滿了，就是 5，不用一個一個數。',
      '上面排滿是 5，下面還有 2 個。5 和 2 合起來是 7。',
      '上面還差 1 個才滿 5，所以是 4。看一眼就知道！',
    ],
    makeTen: [
      '十格框一共有 10 格。這裡有 7 個貝殼。',
      '數一數空格：1、2、3。再放 3 個，就排滿了。',
      '所以 7 和 3 湊成 10。記住這些好朋友：1 和 9、2 和 8、3 和 7、4 和 6、5 和 5。',
    ],
    teen: [
      '排滿一整框，就是 10。',
      '第二框有 3 個。從 10 接著數：11、12、13。',
      '一個十和三個一，就是 13。13 的 1 代表一個十，3 代表三個一。',
    ],
    add20: [
      '我們來算 8 + 5。第一個框有 8 個紅點，還差 2 個就滿 10。',
      '從 5 個藍點裡拿 2 個去把框排滿，5 就剩下 3 個。',
      '10 加 3 是 13，所以 8 + 5 = 13。先湊十，再加剩下的！',
      '減法也可以這樣想：13 − 5，先減 3 變成 10，再減 2，就是 8。',
    ],
    blocks: [
      '一顆小方塊是 1。',
      '10 顆小方塊連成一條，一條是 10。',
      '10 條拼成一片，一片是 100。',
      '2 片是 200，3 條是 30，4 顆是 4。合起來是 234。',
    ],
    digit: [
      '每個數字都住在一個位置。最右邊是個位：這個 2 就是 2。',
      '往左一格是十位：5 代表 5 個十，就是 50。',
      '再往左是百位：3 代表 3 個百，就是 300。',
      '所以 352 = 300 + 50 + 2。同一個數字，住得越左邊，代表的越大！',
    ],
    column: [
      '直式加法：個位對個位，十位對十位，從個位開始算。',
      '個位：7 + 5 = 12，滿 10 了！個位寫 2，把 1 個十進到十位。',
      '十位：2 + 1 = 3，再加進位的 1，是 4。答案是 42。',
      '直式減法：42 − 15，個位 2 不夠減 5，就跟十位借 1 個十，變成 12 − 5 = 7。',
      '十位借走 1，剩下 3。3 − 1 = 2。答案是 27。',
    ],
    shapeName: [
      '三角形有 3 條邊、3 個角。',
      '正方形有 4 條一樣長的邊。長方形也是 4 條邊，但是有長有短。',
      '五邊形有 5 條邊，六邊形有 6 條邊。數一數邊，就知道名字！',
      '把三角形轉個方向，邊還是 3 條，所以它還是三角形。',
    ],
    symmetry: [
      '沿著線摺起來，如果兩邊剛好疊在一起，這條線就是對稱軸。愛心沿直線摺，兩邊一模一樣。',
      '沿橫線摺呢？上面圓圓、下面尖尖，疊不起來，所以不是對稱軸。',
      '長方形沿斜線摺，角會跑出去，也疊不起來。想像摺紙，就知道答案！',
    ],
    measure: [
      '量長度時，把東西的頭對齊 0，看尾巴對到幾，就是幾公分。這枝鉛筆是 5 公分。',
      '如果鉛筆不是從 0 開始呢？這枝從 2 到 7。',
      '不能直接看 7！要數中間有幾格：從 2 數到 7 是 5 格，所以還是 5 公分。',
    ],
    array: [
      '菜種成一排一排，每排一樣多。這裡有 3 排，每排 4 棵。',
      '不用一棵一棵數，一排一排數：4、8、12。',
      '3 排、每排 4 棵，就是 3 × 4 = 12。',
    ],
    times: [
      '3 × 5 的意思是：有 3 組，每組 5 個。',
      '一組一組數：5、10、15。',
      '所以 3 × 5 = 15。背熟九九乘法，就不用每次都數。',
    ],
    share: [
      '12 根紅蘿蔔要平分給 3 隻兔子，每隻要一樣多。',
      '像發牌一樣，一隻一根輪流發，一直發到發完。',
      '發完了，每隻都有 4 根。12 平分成 3 份，每份 4，寫成 12 ÷ 3 = 4。',
    ],
    clock: [
      '短針是時針，告訴你幾點；長針是分針。長針指著 12，就是整點：3 點。',
      '長針每走一個數字是 5 分鐘。長針指著 3，就是 3 × 5 = 15 分。',
      '長針指著 6 是 30 分，也就是 3 點半。這時短針走到 3 和 4 的中間。',
    ],
    coins: [
      '台灣的硬幣有 1 元、5 元、10 元和 50 元。',
      '數錢先數大的：50，接著數 10 元：60、70。',
      '再加 5 元是 75，最後數 1 元：76、77。一共 77 元。',
    ],
    change: [
      '東西 37 元，你付了 50 元，老闆要找你多少錢？',
      '從 37 往上數：先數到 40，是 3 元。',
      '再從 40 數到 50，是 10 元。3 + 10 = 13，要找 13 元。',
    ],
    fracName: [
      '把披薩平分成 4 片，每一片都一樣大。',
      '拿走 1 片，就是 4 分之 1，寫成 1/4。下面的 4 是分成幾片，上面的 1 是拿了幾片。',
      '塗了 3 片，就是 4 分之 3。',
    ],
    fracLine: [
      '0 到 1 中間，平分成 4 段。',
      '星星走了 1 段，就是 1/4。',
      '走了 3 段，就是 3/4。要數「段」，不要數直線喔！',
    ],
    fracEqual: [
      '這條分成 2 份，塗了 1 份，是 1/2。',
      '把每一份再切成 2 小份：一共 4 份，塗了 2 份，是 2/4。',
      '塗色的長度一樣長！所以 1/2 = 2/4。分子分母乘同一個數，大小不變。',
    ],
    bigPlace: [
      '數字越大，位置越多：個、十、百、千、萬。每往左一格，就大 10 倍。',
      '45,231 的 5 住在千位，代表 5 個千，就是 5,000。',
      '4 住在萬位，代表 4 個萬，就是 40,000。',
    ],
    area: [
      '面積是裡面鋪了多少格。一格是 1 平方公分。',
      '3 排，每排 4 格：3 × 4 = 12，面積是 12 平方公分。',
      '周長是繞外面一圈的長度：4 + 3 + 4 + 3 = 14 公分。面積數格子，周長量邊！',
    ],
    decimal: [
      '一整條是 1。',
      '把一條平分成 10 格，一格是十分之一，寫成 0.1。',
      '一整條再加 3 格，就是 1.3。小數點左邊是幾整條，右邊是幾格。',
    ],
    pattern: [
      '找規律，先看每次差多少：2 到 5 加 3，5 到 8 加 3，8 到 11 也加 3。',
      '每次都加 3，所以 11 的下一個是 14。',
      '有時候差的數也會變：加 1、加 2、加 3，下一次就是加 4，7 + 4 = 11。',
    ],
    balance: [
      '天平平平的，代表兩邊一樣重。3 個蘋果和 12 一樣重。',
      '把 12 平分成 3 份，每份是 4，所以一個蘋果是 4。',
      '如果左邊多了一個 4：兩邊都拿走 4，天平還是平的。剩下 2 個蘋果和 10 一樣重，一個蘋果是 5。',
    ],
    legs: [
      '籠子裡有 5 個頭、14 隻腳。雞有 2 隻腳，兔子有 4 隻腳。',
      '先假設全部都是雞：5 × 2 = 10 隻腳。可是有 14 隻，多了 4 隻。',
      '把一隻雞換成兔子，就多 2 隻腳。多了 4 隻腳，就是 2 隻兔子，剩下 3 隻是雞。',
    ],
  } as Record<string, string[]>,
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
  useIt: '生活中用得到：',
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
    forest: { name: 'Counting Forest', desc: 'Counting to 10, number lines, ten-frames', story: 'The squirrels are getting ready for winter! They need to count their nuts to know if there are enough.' },
    bay: { name: 'Ten Bay', desc: 'Make ten, 11–19, adding and subtracting to 20', story: 'Every fishing crate holds 10 fish. If you can make ten, you quickly know how many more you need and how many there are.' },
    place: { name: 'Place Value Valley', desc: 'Hundreds, tens, ones; column sums', story: 'The valley shop keeps growing and the numbers are getting bigger! Hundreds, tens and ones stop you mixing up 305 dollars and 35 dollars.' },
    shapes: { name: 'Shape Workshop', desc: 'Side quest: shapes, symmetry, measuring', story: "The carpenter is building a bookshelf and a hut. Pick the right shapes and measure carefully, or the pieces won't fit." },
    farm: { name: 'Times Farm', desc: 'Arrays, times tables, sharing', story: 'The farm has rows and rows of vegetables, and counting one by one is too slow! Times tables work it out in a flash and help share fairly with the rabbits.' },
    market: { name: 'Time & Money Market', desc: 'Side quest: clocks, coins, change', story: "The market is opening! Read the clock to arrive on time, count your money to see if it's enough, and check your change." },
    kitchen: { name: 'Fraction Kitchen', desc: 'Equal parts, fractions on a line, equal fractions', story: 'The chef bakes cakes and pizzas, and every slice must be the same size to be fair. The recipe says "half a cup" and "a quarter spoon" too.' },
    port: { name: 'Big Number Port', desc: 'Big place values, area and perimeter, decimals', story: 'Big ships carry thousands of boxes! Read big numbers, work out how big a warehouse floor is and how long its fence is, and read decimals like 2.5 kg.' },
    challenge: { name: 'Challenge Island', desc: 'Thinking strategies: patterns, balances, heads and legs', story: "These puzzles don't come with a sum to do. Find your own way: spot patterns, reason it out, guess and fix." },
  },
  levels: {
    'forest-count': { name: 'Count Them', desc: 'Tap each one and count how many', why: 'Know how many: are there enough cookies for every friend?' },
    'forest-line': { name: 'Frog Hop', desc: 'Hop along the number line', why: 'Which is bigger, and by how much: your place in line, floors in a lift.' },
    'forest-flash': { name: 'Ten-Frame Flash', desc: 'One quick look — how many?', why: 'See how many at a glance: dice, dominoes, cards.' },
    'bay-make10': { name: 'Make Ten', desc: 'How many more to make 10?', why: 'A mental math shortcut: 8 + 5 is easy once you make ten.' },
    'bay-teen': { name: 'Ten and Some More', desc: 'One ten and some ones', why: 'Read 11 to 19: birthday candles, page numbers, floors.' },
    'bay-add20': { name: 'Boat Sums', desc: 'Make ten first, then add or take away', why: 'Keep score in games, work out how much pocket money is left.' },
    'place-blocks': { name: 'Block Builder', desc: 'Hundreds, tens and ones blocks', why: 'Count big piles fast in bundles: a jar of coins, a box of pencils.' },
    'place-digit': { name: 'Where Digits Live', desc: 'The same digit is worth more in a bigger place', why: 'Read prices: 305 dollars is not 35 dollars!' },
    'place-column': { name: 'Column Sums', desc: 'Carrying and borrowing', why: 'Bigger sums: how much more do you need to save for a toy?' },
    'shapes-name': { name: 'Name the Shape', desc: 'Turned around, still the same shape', why: 'Spot shapes all around you: road signs, wheels, honeycombs.' },
    'shapes-symmetry': { name: 'Fold It', desc: 'Is the dashed line a line of symmetry?', why: 'Butterflies, faces and paper cut-outs are symmetric: fold and cut a pretty pattern.' },
    'shapes-measure': { name: 'Measure It', desc: "Rulers don't always start at 0", why: 'Measure your height, check a desk fits, even with a broken ruler.' },
    'farm-array': { name: 'Garden Rows', desc: 'Rows of plants — how many?', why: 'Count egg boxes, seats and chocolate squares without counting one by one.' },
    'farm-times': { name: 'Times Tables', desc: 'Groups of the same size', why: '3 packs of sweets, 6 in each: how many sweets?' },
    'farm-share': { name: 'Share the Carrots', desc: 'Every rabbit gets the same', why: 'Share sweets fairly so every friend gets the same.' },
    'market-clock': { name: 'Tell the Time', desc: 'Hours and minutes', why: 'Know when school starts, when cartoons are on, how long until break.' },
    'market-coins': { name: 'Count Coins', desc: 'NT$1, 5, 10 and 50 coins', why: 'Before you buy, check you have enough money.' },
    'market-change': { name: 'Give Change', desc: 'How much money comes back?', why: 'Check the shopkeeper gave you the right change.' },
    'kitchen-name': { name: 'Pizza Slices', desc: 'What fraction is shaded?', why: 'Cut pizza and cake fairly: what fraction does each person get?' },
    'kitchen-line': { name: 'Fraction Line', desc: 'Fractions live on the number line too', why: 'How much of the walk is done, how much battery is left.' },
    'kitchen-equal': { name: 'Just as Much', desc: 'Equivalent fractions', why: 'Half a pizza is the same as 2/4, so nobody gets less.' },
    'port-place': { name: 'Big Place Values', desc: 'Thousands and ten-thousands', why: 'Read big numbers: a 12,000-dollar bike, how many people live in your city.' },
    'port-area': { name: 'Area & Perimeter', desc: 'Squares inside, distance around', why: 'How much carpet a room needs (area), how much fence a garden needs (perimeter).' },
    'port-decimal': { name: 'Decimals', desc: 'One tenth is 0.1', why: 'Read 1.2 m tall, 36.5 °C, prices in a shop.' },
    'challenge-pattern': { name: 'Find the Pattern', desc: 'What comes next?', why: 'Patterns let you predict: which day swimming is next week, how tiles are laid.' },
    'challenge-balance': { name: 'Balance Puzzle', desc: 'How heavy is one fruit?', why: "Work out a number you can't see: this is where equations begin." },
    'challenge-legs': { name: 'Heads and Legs', desc: 'What if they were all chickens?', why: "When information is missing, guess and then fix it: that's how detectives think." },
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
  learnTitle: '📖 Watch me',
  nextStep: 'Next',
  prevStep: 'Back',
  tryIt: 'Your turn!',
  teach: {
    count: [
      'When you count, touch each thing once: don\'t skip any, and don\'t count any twice.',
      'Touch and count at the same time: 1, 2…',
      '…3, 4. Every apple has been touched.',
      'The last number you said is 4, so there are 4 apples!',
    ],
    line: [
      'On a number line, numbers get bigger from left to right. Hop right and the number grows.',
      'The frog is on 2. It hops forward 3.',
      'One hop at a time, counting: 3, 4, 5.',
      'It lands on 5! So 2 hop 3 more is 5, which is 2 + 3 = 5.',
    ],
    flash: [
      'The top row of a ten-frame has 5 boxes. A full top row is 5, so you don\'t need to count.',
      'A full top row is 5, and there are 2 more below. 5 and 2 make 7.',
      'The top row needs 1 more to make 5, so this is 4. One look is enough!',
    ],
    makeTen: [
      'A ten-frame has 10 boxes. Here are 7 shells.',
      'Count the empty boxes: 1, 2, 3. Put in 3 more and it is full.',
      'So 7 and 3 make 10. Remember these pairs: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.',
    ],
    teen: [
      'A full ten-frame is 10.',
      'The second frame has 3. Keep counting from 10: 11, 12, 13.',
      'One ten and three ones make 13. The 1 in 13 means one ten; the 3 means three ones.',
    ],
    add20: [
      'Let\'s work out 8 + 5. The first frame has 8 red dots. It needs 2 more to make 10.',
      'Take 2 of the 5 blue dots to fill the frame. That leaves 3.',
      '10 plus 3 is 13, so 8 + 5 = 13. Make ten first, then add the rest!',
      'Taking away works too: for 13 − 5, take 3 to get to 10, then take 2 more. That\'s 8.',
    ],
    blocks: [
      'A small cube is 1.',
      '10 cubes in a line make a rod. A rod is 10.',
      '10 rods make a flat. A flat is 100.',
      '2 flats are 200, 3 rods are 30, 4 cubes are 4. Together that\'s 234.',
    ],
    digit: [
      'Every digit lives in a place. The right end is the ones place: this 2 is just 2.',
      'One step left is the tens place: 5 means 5 tens, which is 50.',
      'One more step left is the hundreds place: 3 means 3 hundreds, which is 300.',
      'So 352 = 300 + 50 + 2. The further left a digit lives, the more it is worth!',
    ],
    column: [
      'In a column sum, line up ones with ones and tens with tens. Start with the ones.',
      'Ones: 7 + 5 = 12. That\'s 10 or more! Write 2 and carry 1 ten to the tens.',
      'Tens: 2 + 1 = 3, plus the 1 you carried is 4. The answer is 42.',
      'Column take-away: for 42 − 15, you can\'t take 5 from 2, so borrow 1 ten. Now it\'s 12 − 5 = 7.',
      'The tens lent 1, so 3 are left. 3 − 1 = 2. The answer is 27.',
    ],
    shapeName: [
      'A triangle has 3 sides and 3 corners.',
      'A square has 4 sides, all the same length. A rectangle has 4 sides too, two long and two short.',
      'A pentagon has 5 sides and a hexagon has 6. Count the sides to know the name!',
      'Turn a triangle around and it still has 3 sides, so it\'s still a triangle.',
    ],
    symmetry: [
      'Fold along the line. If the two halves match exactly, it\'s a line of symmetry. A heart folded down the middle matches.',
      'What about across the middle? The top is round and the bottom is pointy, so they don\'t match. Not a line of symmetry.',
      'Fold a rectangle along a slanted line and the corners stick out. No match. Imagine folding paper to check!',
    ],
    measure: [
      'Put the start of the thing at 0 and read where its end is. This pencil is 5 cm.',
      'What if the pencil doesn\'t start at 0? This one goes from 2 to 7.',
      'Don\'t just read 7! Count the spaces from 2 to 7. There are 5, so it\'s still 5 cm.',
    ],
    array: [
      'The plants are in rows, with the same number in each row. Here are 3 rows of 4.',
      'Don\'t count one by one. Count row by row: 4, 8, 12.',
      '3 rows of 4 is 3 × 4 = 12.',
    ],
    times: [
      '3 × 5 means 3 groups with 5 in each group.',
      'Count group by group: 5, 10, 15.',
      'So 3 × 5 = 15. Once you know your times tables, you won\'t need to count.',
    ],
    share: [
      '12 carrots are shared equally among 3 rabbits. Each rabbit must get the same.',
      'Like dealing cards, give one to each rabbit in turn until they are all gone.',
      'All gone: each rabbit has 4. 12 shared into 3 equal parts is 4, written 12 ÷ 3 = 4.',
    ],
    clock: [
      'The short hand shows the hour; the long hand shows the minutes. Long hand on 12 means o\'clock: 3 o\'clock.',
      'Each number the long hand moves is 5 minutes. On the 3, that\'s 3 × 5 = 15 minutes.',
      'Long hand on the 6 is 30 minutes: half past 3. The short hand is halfway between 3 and 4.',
    ],
    coins: [
      'Taiwan has 1, 5, 10 and 50 dollar coins.',
      'Count the big coins first: 50, then the tens: 60, 70.',
      'Add the 5 to get 75, then the ones: 76, 77. That\'s 77 dollars.',
    ],
    change: [
      'It costs 37 dollars and you pay 50. How much change do you get?',
      'Count up from 37: up to 40 is 3 dollars.',
      'Then from 40 to 50 is 10 dollars. 3 + 10 = 13, so you get 13 back.',
    ],
    fracName: [
      'Cut the pizza into 4 equal slices.',
      'Take 1 slice: that\'s one quarter, written 1/4. The bottom number says how many slices; the top says how many you took.',
      '3 slices shaded is three quarters: 3/4.',
    ],
    fracLine: [
      'The line from 0 to 1 is cut into 4 equal parts.',
      'The star has gone 1 part: that\'s 1/4.',
      '3 parts is 3/4. Count the parts, not the lines!',
    ],
    fracEqual: [
      'This bar has 2 parts and 1 is shaded: 1/2.',
      'Cut every part into 2 smaller parts. Now there are 4, and 2 are shaded: 2/4.',
      'The shaded length is the same! So 1/2 = 2/4. Multiply top and bottom by the same number and the size stays the same.',
    ],
    bigPlace: [
      'Bigger numbers have more places: ones, tens, hundreds, thousands, ten-thousands. Each step left is 10 times bigger.',
      'In 45,231 the 5 is in the thousands place: 5 thousands, which is 5,000.',
      'The 4 is in the ten-thousands place: 40,000.',
    ],
    area: [
      'Area is how many squares fit inside. Each square is 1 square centimetre.',
      '3 rows of 4 squares: 3 × 4 = 12. The area is 12 square centimetres.',
      'Perimeter is the distance all the way around: 4 + 3 + 4 + 3 = 14 cm. Area counts squares; perimeter measures sides!',
    ],
    decimal: [
      'A whole bar is 1.',
      'Cut a bar into 10 equal parts. One part is one tenth, written 0.1.',
      'One whole bar and 3 parts is 1.3. Left of the point is whole bars; right of it is parts.',
    ],
    pattern: [
      'To find a pattern, look at how much it changes: 2 to 5 is +3, 5 to 8 is +3, 8 to 11 is +3.',
      'It adds 3 every time, so after 11 comes 14.',
      'Sometimes the change changes: +1, +2, +3, so next is +4. 7 + 4 = 11.',
    ],
    balance: [
      'A level balance means both sides weigh the same. 3 apples weigh the same as 12.',
      'Split 12 into 3 equal parts: each is 4. So one apple is 4.',
      'If the left also has a 4, take 4 off both sides and it stays level. 2 apples weigh 10, so one apple is 5.',
    ],
    legs: [
      'There are 5 heads and 14 legs. A chicken has 2 legs; a rabbit has 4.',
      'Pretend they are all chickens: 5 × 2 = 10 legs. But there are 14, so 4 are extra.',
      'Each rabbit instead of a chicken adds 2 legs. 4 extra legs means 2 rabbits, and the other 3 are chickens.',
    ],
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
  useIt: 'Where you use it:',
  again: 'Play again',
  back: 'Back',
  note: 'Dev build · progress is saved on this device only',
}

export const STRINGS: Record<Lang, Strings> = { zh, en }
