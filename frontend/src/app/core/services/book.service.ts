import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book, Chapter } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books: Book[] = [
    {
      id: 'beginner-1',
      title: 'ねこのミミ',
      description: '<ruby>可愛<rt>かわい</rt></ruby>い<ruby>猫<rt>ねこ</rt></ruby>のミミのおはなしです。はじめての<ruby>方<rt>かた</rt></ruby>むけ。',
      level: 'beginner',
      chaptersCount: 1,
      coverImage: 'assets/images/cat-mimi.png'
    },
    {
      id: 'beginner-2',
      title: '東京の一日',
      description: '<ruby>学生<rt>がくせい</rt></ruby>のゆいさんの<ruby>東京<rt>とうきょう</rt></ruby>での<ruby>一日<rt>いちにち</rt></ruby>。<ruby>朝<rt>あさ</rt></ruby>から<ruby>夜<rt>よる</rt></ruby>まで、<ruby>楽<rt>たの</rt></ruby>しい<ruby>物語<rt>ものがたり</rt></ruby>です。',
      level: 'beginner',
      chaptersCount: 5,
      coverImage: 'assets/images/day-in-tokyo.png'
    }
  ];

  private chapters = new Map<string, Chapter[]>([
    ['beginner-1', [
      {
        id: 'ch-1',
        bookId: 'beginner-1',
        number: 1,
        title: 'ねこのミミ',
        content: [
          `<p><ruby data-word-id="w-1">小<rt>ちい</rt></ruby>さい <ruby data-word-id="w-2">猫<rt>ねこ</rt></ruby>がいます。<br>
          その <ruby data-word-id="w-3">名前<rt>なまえ</rt></ruby>はミミです。</p>`,

          `<p>ミミは <ruby data-word-id="w-4">白<rt>しろ</rt></ruby>くて、<ruby data-word-id="w-5">目<rt>め</rt></ruby>が <ruby data-word-id="w-6">大<rt>おお</rt></ruby>きいです。<br>
          とても <ruby data-word-id="w-7">可愛<rt>かわい</rt></ruby>いです。</p>`,

          `<p>ミミは <ruby data-word-id="w-8">田中<rt>たなか</rt></ruby>さんの <ruby data-word-id="w-9">家<rt>いえ</rt></ruby>に <ruby data-word-id="w-10">住<rt>す</rt></ruby>んでいます。<br>
          <ruby data-word-id="w-11">毎日<rt>まいにち</rt></ruby><ruby data-word-id="w-12">朝<rt>あさ</rt></ruby>、ミミは<ruby data-word-id="w-13">起<rt>お</rt></ruby>きます。</p>`,

          `<p><ruby data-word-id="w-14">朝<rt>あさ</rt></ruby>ごはんを <ruby data-word-id="w-15">食<rt>た</rt></ruby>べます。<br>
          <ruby data-word-id="w-16">魚<rt>さかな</rt></ruby>が <ruby data-word-id="w-17">好<rt>す</rt></ruby>きです。</p>`,

          `<p><ruby data-word-id="w-18">お昼<rt>ひる</rt></ruby>に、ミミは <ruby data-word-id="w-19">外<rt>そと</rt></ruby>で <ruby data-word-id="w-20">遊<rt>あそ</rt></ruby>びます。<br>
          <ruby data-word-id="w-21">友達<rt>ともだち</rt></ruby>の <ruby data-word-id="w-22">犬<rt>いぬ</rt></ruby>と <ruby data-word-id="w-23">一緒<rt>いっしょ</rt></ruby>に。</p>`,

          `<p><ruby data-word-id="w-24">夜<rt>よる</rt></ruby>になると、ミミは <ruby data-word-id="w-25">疲<rt>つか</rt></ruby>れます。<br>
          <ruby data-word-id="w-26">田中<rt>たなか</rt></ruby>さんの <ruby data-word-id="w-27">ひざ<rt>ひざ</rt></ruby>の <ruby data-word-id="w-28">上<rt>うえ</rt></ruby>で <ruby data-word-id="w-29">寝<rt>ね</rt></ruby>ます。</p>`,

          `<p>ミミは <ruby data-word-id="w-30">幸<rt>しあわ</rt></ruby>せな <ruby data-word-id="w-31">猫<rt>ねこ</rt></ruby>です。</p>`
        ]
      }
    ]],
    ['beginner-2', [
      {
        id: 'ch-1',
        bookId: 'beginner-2',
        number: 1,
        title: '朝',
        content: [
          `<p><ruby data-word-id="b2-1">私<rt>わたし</rt></ruby>の<ruby data-word-id="b2-2">名前<rt>なまえ</rt></ruby>は<ruby data-word-id="b2-3">山田<rt>やまだ</rt></ruby>ゆいです。<br>
          <ruby data-word-id="b2-4">大学生<rt>だいがくせい</rt></ruby>です。<ruby data-word-id="b2-5">東京<rt>とうきょう</rt></ruby>に<ruby data-word-id="b2-6">住<rt>す</rt></ruby>んでいます。</p>`,

          `<p><ruby data-word-id="b2-7">今日<rt>きょう</rt></ruby>は<ruby data-word-id="b2-8">月曜日<rt>げつようび</rt></ruby>です。<br>
          <ruby data-word-id="b2-9">朝<rt>あさ</rt></ruby>６<ruby data-word-id="b2-10">時<rt>じ</rt></ruby>に<ruby data-word-id="b2-11">目<rt>め</rt></ruby>が<ruby data-word-id="b2-12">覚<rt>さ</rt></ruby>めました。</p>`,

          `<p><ruby data-word-id="b2-13">窓<rt>まど</rt></ruby>を<ruby data-word-id="b2-14">開<rt>あ</rt></ruby>けると、<ruby data-word-id="b2-15">青<rt>あお</rt></ruby>い<ruby data-word-id="b2-16">空<rt>そら</rt></ruby>が<ruby data-word-id="b2-17">見<rt>み</rt></ruby>えました。<br>
          <ruby data-word-id="b2-18">天気<rt>てんき</rt></ruby>が<ruby data-word-id="b2-19">良<rt>よ</rt></ruby>いです。</p>`,

          `<p><ruby data-word-id="b2-20">シャワー<rt>しゃわー</rt></ruby>を<ruby data-word-id="b2-21">浴<rt>あ</rt></ruby>びて、<ruby data-word-id="b2-22">服<rt>ふく</rt></ruby>を<ruby data-word-id="b2-23">着<rt>き</rt></ruby>ました。<br>
          <ruby data-word-id="b2-24">今日<rt>きょう</rt></ruby>は<ruby data-word-id="b2-25">白<rt>しろ</rt></ruby>い<ruby data-word-id="b2-26">シャツ<rt>しゃつ</rt></ruby>と<ruby data-word-id="b2-27">青<rt>あお</rt></ruby>い<ruby data-word-id="b2-28">スカート<rt>すかーと</rt></ruby>です。</p>`,

          `<p><ruby data-word-id="b2-29">台所<rt>だいどころ</rt></ruby>に<ruby data-word-id="b2-30">行<rt>い</rt></ruby>きました。<br>
          <ruby data-word-id="b2-31">朝<rt>あさ</rt></ruby>ごはんを<ruby data-word-id="b2-32">作<rt>つく</rt></ruby>ります。</p>`,

          `<p><ruby data-word-id="b2-33">パン<rt>ぱん</rt></ruby>を<ruby data-word-id="b2-34">焼<rt>や</rt></ruby>いて、<ruby data-word-id="b2-35">卵<rt>たまご</rt></ruby>を<ruby data-word-id="b2-36">料理<rt>りょうり</rt></ruby>しました。<br>
          <ruby data-word-id="b2-37">コーヒー<rt>こーひー</rt></ruby>も<ruby data-word-id="b2-38">入<rt>い</rt></ruby>れました。</p>`,

          `<p><ruby data-word-id="b2-39">テーブル<rt>てーぶる</rt></ruby>で<ruby data-word-id="b2-40">食<rt>た</rt></ruby>べながら、<ruby data-word-id="b2-41">携帯<rt>けいたい</rt></ruby>を<ruby data-word-id="b2-42">見<rt>み</rt></ruby>ました。<br>
          <ruby data-word-id="b2-43">友達<rt>ともだち</rt></ruby>から<ruby data-word-id="b2-44">メッセージ<rt>めっせーじ</rt></ruby>が<ruby data-word-id="b2-45">来<rt>き</rt></ruby>ていました。</p>`,

          `<p>「<ruby data-word-id="b2-46">学校<rt>がっこう</rt></ruby>で<ruby data-word-id="b2-47">会<rt>あ</rt></ruby>おう！」と<ruby data-word-id="b2-48">書<rt>か</rt></ruby>いてありました。<br>
          <ruby data-word-id="b2-49">嬉<rt>うれ</rt></ruby>しくなりました。</p>`
        ]
      },
      {
        id: 'ch-2',
        bookId: 'beginner-2',
        number: 2,
        title: '通学',
        content: [
          `<p>７<ruby data-word-id="b2-50">時半<rt>じはん</rt></ruby>に<ruby data-word-id="b2-51">家<rt>いえ</rt></ruby>を<ruby data-word-id="b2-52">出<rt>で</rt></ruby>ました。<br>
          <ruby data-word-id="b2-53">駅<rt>えき</rt></ruby>まで<ruby data-word-id="b2-54">歩<rt>ある</rt></ruby>いて<ruby data-word-id="b2-55">行<rt>い</rt></ruby>きます。</p>`,

          `<p><ruby data-word-id="b2-56">道<rt>みち</rt></ruby>には<ruby data-word-id="b2-57">色々<rt>いろいろ</rt></ruby>な<ruby data-word-id="b2-58">人<rt>ひと</rt></ruby>がいます。<br>
          <ruby data-word-id="b2-59">会社員<rt>かいしゃいん</rt></ruby>、<ruby data-word-id="b2-60">学生<rt>がくせい</rt></ruby>、<ruby data-word-id="b2-61">子供<rt>こども</rt></ruby>たち。</p>`,

          `<p><ruby data-word-id="b2-62">コンビニ<rt>こんびに</rt></ruby>の<ruby data-word-id="b2-63">前<rt>まえ</rt></ruby>を<ruby data-word-id="b2-64">通<rt>とお</rt></ruby>りました。<br>
          <ruby data-word-id="b2-65">新<rt>あたら</rt></ruby>しい<ruby data-word-id="b2-66">飲<rt>の</rt></ruby>み<ruby data-word-id="b2-67">物<rt>もの</rt></ruby>が<ruby data-word-id="b2-68">売<rt>う</rt></ruby>っていました。</p>`,

          `<p><ruby data-word-id="b2-69">駅<rt>えき</rt></ruby>に<ruby data-word-id="b2-70">着<rt>つ</rt></ruby>きました。<br>
          <ruby data-word-id="b2-71">切符<rt>きっぷ</rt></ruby>を<ruby data-word-id="b2-72">買<rt>か</rt></ruby>って、<ruby data-word-id="b2-73">改札<rt>かいさつ</rt></ruby>を<ruby data-word-id="b2-74">通<rt>とお</rt></ruby>ります。</p>`,

          `<p><ruby data-word-id="b2-75">電車<rt>でんしゃ</rt></ruby>は<ruby data-word-id="b2-76">混<rt>こ</rt></ruby>んでいました。<br>
          <ruby data-word-id="b2-77">立<rt>た</rt></ruby>って<ruby data-word-id="b2-78">乗<rt>の</rt></ruby>りました。</p>`,

          `<p><ruby data-word-id="b2-79">隣<rt>となり</rt></ruby>に<ruby data-word-id="b2-80">おばあさん<rt>おばあさん</rt></ruby>が<ruby data-word-id="b2-81">立<rt>た</rt></ruby>っていました。<br>
          <ruby data-word-id="b2-82">座席<rt>ざせき</rt></ruby>が<ruby data-word-id="b2-83">空<rt>あ</rt></ruby>いたので、<ruby data-word-id="b2-84">譲<rt>ゆず</rt></ruby>りました。</p>`,

          `<p>「ありがとう」と<ruby data-word-id="b2-85">言<rt>い</rt></ruby>ってくれました。<br>
          <ruby data-word-id="b2-86">良<rt>よ</rt></ruby>いことをしたと<ruby data-word-id="b2-87">思<rt>おも</rt></ruby>いました。</p>`,

          `<p><ruby data-word-id="b2-88">窓<rt>まど</rt></ruby>の<ruby data-word-id="b2-89">外<rt>そと</rt></ruby>を<ruby data-word-id="b2-90">見<rt>み</rt></ruby>ました。<br>
          <ruby data-word-id="b2-91">高<rt>たか</rt></ruby>い<ruby data-word-id="b2-92">ビル<rt>びる</rt></ruby>が<ruby data-word-id="b2-93">沢山<rt>たくさん</rt></ruby><ruby data-word-id="b2-94">見<rt>み</rt></ruby>えます。<br>
          <ruby data-word-id="b2-95">東京<rt>とうきょう</rt></ruby>は<ruby data-word-id="b2-96">大<rt>おお</rt></ruby>きな<ruby data-word-id="b2-97">町<rt>まち</rt></ruby>です。</p>`
        ]
      },
      {
        id: 'ch-3',
        bookId: 'beginner-2',
        number: 3,
        title: '授業',
        content: [
          `<p>８<ruby data-word-id="b2-98">時<rt>じ</rt></ruby>４５<ruby data-word-id="b2-99">分<rt>ふん</rt></ruby>に<ruby data-word-id="b2-100">大学<rt>だいがく</rt></ruby>に<ruby data-word-id="b2-101">着<rt>つ</rt></ruby>きました。<br>
          <ruby data-word-id="b2-102">教室<rt>きょうしつ</rt></ruby>に<ruby data-word-id="b2-103">向<rt>む</rt></ruby>かいます。</p>`,

          `<p><ruby data-word-id="b2-104">友達<rt>ともだち</rt></ruby>の<ruby data-word-id="b2-105">さくら<rt>さくら</rt></ruby>さんが<ruby data-word-id="b2-106">待<rt>ま</rt></ruby>っていました。<br>
          「おはよう！」と<ruby data-word-id="b2-107">挨拶<rt>あいさつ</rt></ruby>しました。</p>`,

          `<p><ruby data-word-id="b2-108">一緒<rt>いっしょ</rt></ruby>に<ruby data-word-id="b2-109">教室<rt>きょうしつ</rt></ruby>に<ruby data-word-id="b2-110">入<rt>はい</rt></ruby>りました。<br>
          <ruby data-word-id="b2-111">席<rt>せき</rt></ruby>は<ruby data-word-id="b2-112">真<rt>ま</rt></ruby>ん<ruby data-word-id="b2-113">中<rt>なか</rt></ruby>です。</p>`,

          `<p>９<ruby data-word-id="b2-114">時<rt>じ</rt></ruby>に<ruby data-word-id="b2-115">授業<rt>じゅぎょう</rt></ruby>が<ruby data-word-id="b2-116">始<rt>はじ</rt></ruby>まりました。<br>
          <ruby data-word-id="b2-117">今日<rt>きょう</rt></ruby>は<ruby data-word-id="b2-118">英語<rt>えいご</rt></ruby>の<ruby data-word-id="b2-119">授業<rt>じゅぎょう</rt></ruby>です。</p>`,

          `<p><ruby data-word-id="b2-120">先生<rt>せんせい</rt></ruby>は<ruby data-word-id="b2-121">スミス<rt>すみす</rt></ruby>さんです。<br>
          <ruby data-word-id="b2-122">アメリカ<rt>あめりか</rt></ruby>から<ruby data-word-id="b2-123">来<rt>き</rt></ruby>ました。<br>
          とても<ruby data-word-id="b2-124">優<rt>やさ</rt></ruby>しい<ruby data-word-id="b2-125">先生<rt>せんせい</rt></ruby>です。</p>`,

          `<p><ruby data-word-id="b2-126">授業<rt>じゅぎょう</rt></ruby>で、<ruby data-word-id="b2-127">英語<rt>えいご</rt></ruby>の<ruby data-word-id="b2-128">歌<rt>うた</rt></ruby>を<ruby data-word-id="b2-129">歌<rt>うた</rt></ruby>いました。<br>
          <ruby data-word-id="b2-130">楽<rt>たの</rt></ruby>しかったです。</p>`,

          `<p><ruby data-word-id="b2-131">次<rt>つぎ</rt></ruby>に、<ruby data-word-id="b2-132">文法<rt>ぶんぽう</rt></ruby>の<ruby data-word-id="b2-133">勉強<rt>べんきょう</rt></ruby>をしました。<br>
          <ruby data-word-id="b2-134">少<rt>すこ</rt></ruby>し<ruby data-word-id="b2-135">難<rt>むずか</rt></ruby>しかったです。</p>`,

          `<p>１０<ruby data-word-id="b2-136">時半<rt>じはん</rt></ruby>に<ruby data-word-id="b2-137">授業<rt>じゅぎょう</rt></ruby>が<ruby data-word-id="b2-138">終<rt>お</rt></ruby>わりました。<br>
          <ruby data-word-id="b2-139">次<rt>つぎ</rt></ruby>の<ruby data-word-id="b2-140">授業<rt>じゅぎょう</rt></ruby>まで<ruby data-word-id="b2-141">休憩<rt>きゅうけい</rt></ruby>です。</p>`
        ]
      },
      {
        id: 'ch-4',
        bookId: 'beginner-2',
        number: 4,
        title: '昼休み',
        content: [
          `<p><ruby data-word-id="b2-142">昼休<rt>ひるやす</rt></ruby>みになりました。<br>
          <ruby data-word-id="b2-143">お腹<rt>なか</rt></ruby>が<ruby data-word-id="b2-144">空<rt>す</rt></ruby>きました。</p>`,

          `<p><ruby data-word-id="b2-145">さくら<rt>さくら</rt></ruby>さんと<ruby data-word-id="b2-146">学生食堂<rt>がくせいしょくどう</rt></ruby>に<ruby data-word-id="b2-147">行<rt>い</rt></ruby>きました。<br>
          <ruby data-word-id="b2-148">学生食堂<rt>がくせいしょくどう</rt></ruby>は<ruby data-word-id="b2-149">大<rt>おお</rt></ruby>きくて、<ruby data-word-id="b2-150">明<rt>あか</rt></ruby>るいです。</p>`,

          `<p><ruby data-word-id="b2-151">沢山<rt>たくさん</rt></ruby>の<ruby data-word-id="b2-152">料理<rt>りょうり</rt></ruby>があります。<br>
          <ruby data-word-id="b2-153">私<rt>わたし</rt></ruby>は<ruby data-word-id="b2-154">カレー<rt>かれー</rt></ruby>ライスを<ruby data-word-id="b2-155">選<rt>えら</rt></ruby>びました。</p>`,

          `<p><ruby data-word-id="b2-156">さくら<rt>さくら</rt></ruby>さんは<ruby data-word-id="b2-157">ラーメン<rt>らーめん</rt></ruby>を<ruby data-word-id="b2-158">注文<rt>ちゅうもん</rt></ruby>しました。<br>
          <ruby data-word-id="b2-159">二人<rt>ふたり</rt></ruby>で<ruby data-word-id="b2-160">窓際<rt>まどぎわ</rt></ruby>の<ruby data-word-id="b2-161">席<rt>せき</rt></ruby>に<ruby data-word-id="b2-162">座<rt>すわ</rt></ruby>りました。</p>`,

          `<p><ruby data-word-id="b2-163">食<rt>た</rt></ruby>べながら、<ruby data-word-id="b2-164">色々<rt>いろいろ</rt></ruby>な<ruby data-word-id="b2-165">話<rt>はなし</rt></ruby>をしました。<br>
          <ruby data-word-id="b2-166">週末<rt>しゅうまつ</rt></ruby>の<ruby data-word-id="b2-167">予定<rt>よてい</rt></ruby>について<ruby data-word-id="b2-168">話<rt>はな</rt></ruby>しました。</p>`,

          `<p>「<ruby data-word-id="b2-169">映画<rt>えいが</rt></ruby>を<ruby data-word-id="b2-170">見<rt>み</rt></ruby>に<ruby data-word-id="b2-171">行<rt>い</rt></ruby>かない？」と<ruby data-word-id="b2-172">さくら<rt>さくら</rt></ruby>さんが<ruby data-word-id="b2-173">聞<rt>き</rt></ruby>きました。<br>
          「いいね！<ruby data-word-id="b2-174">行<rt>い</rt></ruby>こう！」と<ruby data-word-id="b2-175">答<rt>こた</rt></ruby>えました。</p>`,

          `<p><ruby data-word-id="b2-176">食事<rt>しょくじ</rt></ruby>が<ruby data-word-id="b2-177">終<rt>お</rt></ruby>わって、<ruby data-word-id="b2-178">図書館<rt>としょかん</rt></ruby>に<ruby data-word-id="b2-179">行<rt>い</rt></ruby>きました。<br>
          <ruby data-word-id="b2-180">午後<rt>ごご</rt></ruby>の<ruby data-word-id="b2-181">授業<rt>じゅぎょう</rt></ruby>の<ruby data-word-id="b2-182">準備<rt>じゅんび</rt></ruby>をします。</p>`,

          `<p><ruby data-word-id="b2-183">図書館<rt>としょかん</rt></ruby>は<ruby data-word-id="b2-184">静<rt>しず</rt></ruby>かでした。<br>
          <ruby data-word-id="b2-185">教科書<rt>きょうかしょ</rt></ruby>を<ruby data-word-id="b2-186">読<rt>よ</rt></ruby>んで、<ruby data-word-id="b2-187">ノート<rt>のーと</rt></ruby>を<ruby data-word-id="b2-188">書<rt>か</rt></ruby>きました。</p>`
        ]
      },
      {
        id: 'ch-5',
        bookId: 'beginner-2',
        number: 5,
        title: '帰り道',
        content: [
          `<p><ruby data-word-id="b2-189">午後<rt>ごご</rt></ruby>の<ruby data-word-id="b2-190">授業<rt>じゅぎょう</rt></ruby>も<ruby data-word-id="b2-191">終<rt>お</rt></ruby>わりました。<br>
          <ruby data-word-id="b2-192">時計<rt>とけい</rt></ruby>を<ruby data-word-id="b2-193">見<rt>み</rt></ruby>ると、５<ruby data-word-id="b2-194">時<rt>じ</rt></ruby>でした。</p>`,

          `<p><ruby data-word-id="b2-195">帰<rt>かえ</rt></ruby>る<ruby data-word-id="b2-196">前<rt>まえ</rt></ruby>に、<ruby data-word-id="b2-197">書店<rt>しょてん</rt></ruby>に<ruby data-word-id="b2-198">寄<rt>よ</rt></ruby>りました。<br>
          <ruby data-word-id="b2-199">新<rt>あたら</rt></ruby>しい<ruby data-word-id="b2-200">本<rt>ほん</rt></ruby>を<ruby data-word-id="b2-201">買<rt>か</rt></ruby>いたかったからです。</p>`,

          `<p><ruby data-word-id="b2-202">書店<rt>しょてん</rt></ruby>には<ruby data-word-id="b2-203">色々<rt>いろいろ</rt></ruby>な<ruby data-word-id="b2-204">本<rt>ほん</rt></ruby>がありました。<br>
          <ruby data-word-id="b2-205">小説<rt>しょうせつ</rt></ruby>、<ruby data-word-id="b2-206">漫画<rt>まんが</rt></ruby>、<ruby data-word-id="b2-207">雑誌<rt>ざっし</rt></ruby>。</p>`,

          `<p><ruby data-word-id="b2-208">好<rt>す</rt></ruby>きな<ruby data-word-id="b2-209">作家<rt>さっか</rt></ruby>の<ruby data-word-id="b2-210">新<rt>あたら</rt></ruby>しい<ruby data-word-id="b2-211">小説<rt>しょうせつ</rt></ruby>を<ruby data-word-id="b2-212">見<rt>み</rt></ruby>つけました。<br>
          <ruby data-word-id="b2-213">買<rt>か</rt></ruby>って、<ruby data-word-id="b2-214">嬉<rt>うれ</rt></ruby>しくなりました。</p>`,

          `<p><ruby data-word-id="b2-215">駅<rt>えき</rt></ruby>に<ruby data-word-id="b2-216">向<rt>む</rt></ruby>かって<ruby data-word-id="b2-217">歩<rt>ある</rt></ruby>きました。<br>
          <ruby data-word-id="b2-218">空<rt>そら</rt></ruby>が<ruby data-word-id="b2-219">オレンジ<rt>おれんじ</rt></ruby>色<ruby data-word-id="b2-220">色<rt>いろ</rt></ruby>になっていました。<br>
          <ruby data-word-id="b2-221">夕方<rt>ゆうがた</rt></ruby>です。</p>`,

          `<p><ruby data-word-id="b2-222">電車<rt>でんしゃ</rt></ruby>に<ruby data-word-id="b2-223">乗<rt>の</rt></ruby>って、<ruby data-word-id="b2-224">買<rt>か</rt></ruby>った<ruby data-word-id="b2-225">本<rt>ほん</rt></ruby>を<ruby data-word-id="b2-226">読<rt>よ</rt></ruby>み<ruby data-word-id="b2-227">始<rt>はじ</rt></ruby>めました。<br>
          とても<ruby data-word-id="b2-228">面白<rt>おもしろ</rt></ruby>かったです。</p>`,

          `<p><ruby data-word-id="b2-229">家<rt>いえ</rt></ruby>に<ruby data-word-id="b2-230">帰<rt>かえ</rt></ruby>ると、６<ruby data-word-id="b2-231">時半<rt>じはん</rt></ruby>でした。<br>
          <ruby data-word-id="b2-232">母<rt>はは</rt></ruby>が「おかえり」と<ruby data-word-id="b2-233">言<rt>い</rt></ruby>いました。</p>`,

          `<p><ruby data-word-id="b2-234">夕<rt>ゆう</rt></ruby>ごはんを<ruby data-word-id="b2-235">食<rt>た</rt></ruby>べて、<ruby data-word-id="b2-236">お風呂<rt>ふろ</rt></ruby>に<ruby data-word-id="b2-237">入<rt>はい</rt></ruby>りました。<br>
          それから、<ruby data-word-id="b2-238">宿題<rt>しゅくだい</rt></ruby>をしました。</p>`,

          `<p>１１<ruby data-word-id="b2-239">時<rt>じ</rt></ruby>に<ruby data-word-id="b2-240">ベッド<rt>べっど</rt></ruby>に<ruby data-word-id="b2-241">入<rt>はい</rt></ruby>りました。<br>
          <ruby data-word-id="b2-242">今日<rt>きょう</rt></ruby>も<ruby data-word-id="b2-243">良<rt>よ</rt></ruby>い<ruby data-word-id="b2-244">一日<rt>いちにち</rt></ruby>でした。</p>`,

          `<p>「おやすみなさい」と<ruby data-word-id="b2-245">言<rt>い</rt></ruby>って、<ruby data-word-id="b2-246">目<rt>め</rt></ruby>を<ruby data-word-id="b2-247">閉<rt>と</rt></ruby>じました。<br>
          <ruby data-word-id="b2-248">明日<rt>あした</rt></ruby>も<ruby data-word-id="b2-249">楽<rt>たの</rt></ruby>しみです。</p>`
        ]
      }
    ]]
  ]);

  private booksSubject = new BehaviorSubject<Book[]>(this.books);
  books$ = this.booksSubject.asObservable();

  constructor() { }

  getBooks(): Observable<Book[]> {
    return this.books$;
  }

  getBook(bookId: string): Book | undefined {
    return this.books.find(b => b.id === bookId);
  }

  getChapters(bookId: string): Chapter[] {
    return this.chapters.get(bookId) || [];
  }

  getChapter(bookId: string, chapterId: string): Chapter | undefined {
    const bookChapters = this.chapters.get(bookId);
    return bookChapters?.find(c => c.id === chapterId);
  }
}
