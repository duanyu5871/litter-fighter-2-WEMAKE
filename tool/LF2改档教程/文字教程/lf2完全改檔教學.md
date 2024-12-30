# 人物act(即frame)的分布

- 213：普通冲跳，即>>J。
- 214：倒冲跳，即>>J<（大家试一下就知道有的）。
- 215：state：4、6刚落地的动作。
- 219：刚滚完的动作或刚爬起的动作，rowing（滚地）frame230,231的next。特别地，既不是state：4、6，也不是state：100时刚落地也跳到frame219。
- 232：丢出被捉的人，可随便改，就是frame121有traction：232或-232。
- 399：可利用。
  ※frame120、122、130~144、232不属系统预设的，可随便改。
  ※可利用的frame：
- 235~398，145~179，124~129，28，29，39，48，49，59，6X，7X，8X，95，207，399（X是随人物punch，super_punch,jump_attack,run_attack等的frame数量决定的）。

pic：数值如果是dat中没载入的，就代表长宽各为0的空白图，通常用pic：999。
wait：
用next: 接动作时
wait:n=（n+1）单位时间
用hit_x 或 opoint:接的动作
wait:n= n个单位时间
30单位时间=1秒

人物state：

※落地跳到的frame：
2.state：13，落地不影响动作或跳到next。

next：999 气功波跳到frame0，人物在地上也跳到frame0，在空中frame212。

itr解说：
kind：
2：与state：1004作用时，自己跳到act115；与state：2004作用后，自己跳到act116。（捡武器）
4：如果人物是被抓起丢出去的，可敌我通杀。
5：写在武器on_hand中，只有wpoint attacking不是0时才有效，仅表示范围，其他还靠entry。
7：在此frame中不拿武器按A可捡state：1004的武器，但不影响动作。
10：无论敌人原始高度，也无视dvy。
14：敌我都能阻挡。

〈特别说明〉快速回复HP的方法。
1.state：1700，补暗红色的血到满，不能补无色的部位。
2.itr kind：8，若暗红色部分大于injury，则补injury数量的HP；若暗红色部分小于injury，则把暗红色补满。3.喝id：122 type：6的武器可回复，补多少不能改，补至500HP为止（废话，仅仅与4.对比）。4.在hit到达的frame中写入mp：-x000，则补10xHP，无任何限制，甚至能在超过500HP以后继续补，但不能用F6（否则补不了）。
500HP~600HP之间时，会出现红色棒超出外面的情况。
600HP~1100HP之间时，所有血都变成暗红色，暗红色的多少是超过600的部分决定的。
1100HP以上时，红色棒会像死后的一样，但蓝色棒正常不变。

※当itr为冰火或kind不为0、4、9时，fall的作用：1.当fall≤60时，打不到state：12的人。2.当fall=70时，打得到state：12的人。

effect：在kind：0、4、9时有效。
effect：23 光柱时用上。
effect：25 不着火的火焰。

bdy：
kind：0 普通。
kind：1XXX 被打到跳到frameXXX，仅id：300有效。
※kind：1XXX必须被人物、id：210、202的武器所有itr kind：0打到才有效。
〈特别发现〉无敌。
人物无敌可用bdy y：-10000。（有的招利用itr y：-10000造成打无敌的特效）
气功波无敌要删除bdy。
场地边缘无限高度会阻挡人物bdy。如果人物用bdy y：-10000，则不会跑到场外；如果人物删除bdy，就会跑到场外。

opoint：
kind：1 发出object（可以是人物分身、武器、气功波）
kind：2 召唤拿在手中的武器。

dvx、y完全说明：
这里只以x为例，y与X一样。
设opoint dvx：a，object本身的dvx：b，实际气功波速度为v，
当a=0时，v=b；
当b=0时，v=a；
当b=550时，v=0；
当a<b时，v=b；
当a=b时，v=a=b；
当a>b时，v=a。
一句话概括就是：取a、b中较快的是v；a、b中若有一个为0，则v取另一个的值；若b为550，则气功波不运动。

※同一个frame中只能有一个opoint。直接由hit，catchingact，opoint action到达的第一个frame中opoint无效。

cpoint：
cover：10你盖住被抓者的图示，11被抓者盖住你的图示。
injury：只会打到被抓者。
hurtable：无论它为0或1，被抓者一定会被cpoint injury打到。
如果hurtable为1且vaction为130~132，那么当敌人被打到时自己跳到frame0。
当decrease时间扣完时情况也是这样。
throwvz，throwinjury：不丢人时写-842150451，丢人时按实际情况写。
※丢人之前最后一个frame的vaction必须不含cpoint kind：2。
throwinjury：0自己会消失，-1是变化术。

变身与图档：1.图档file（?-?）数值只是记事本功能，pic是从0开始根据每个图档row\*col累加得到的。例如：
file(0-69): sprite\sys\XXX*0.bmp w: 79 h: 79 row: 10 col: 7
file(70-150): sprite\sys\XXX_1.bmp w: 79 h: 79 row: 10 col: 7
file(151-160): sprite\sys\XXX_2.bmp w: 149 h: 87 row: 5 col: 2
file(161-170): sprite\sys\XXX_3.bmp w: 94 h: 64 row: 6 col: 1
则pic：151不是XXX_2.bmp的第一张图，而是XXX_3.bmp的第二张图，系统无视file(?-?)。2.如果人物是变身后的，则实际使用的pic是frame中pic+140。
例如：原本frame中设置pic：142，则变身后使用的是pic：282。3.变身设置后所对应的图片如果不同，就会造成criminal的效果，例如：
file(0-69): sprite\sys\xxx_0.bmp w: 79 h: 79 row: 10 col: 7
file(70-139): sprite\sys\xxx_1.bmp w: 79 h: 79 row: 10 col: 7
file(140-209): sprite\sys\xxx_0b.bmp w: 79 h: 79 row: 10 col: 7
file(210-279): sprite\sys\xxx_1b.bmp w: 79 h: 79 row: 10 col: 7
file(280-349): sprite\sys\xxx_2.bmp w: 79 h: 79 row: 10 col: 7
file(350-419): sprite\sys\xxx_2.bmp w: 79 h: 79 row: 10 col: 7
file(420-489): sprite\sys\xxx_2b.bmp w: 79 h: 79 row: 10 col: 7
此时，如果人物是变身后的，则使用图档为xxx*?b.bmp;如果是直接选的，则图档为xxx\_?.bmp。4.变身设置后pic数值都必须使pic与pic+140两幅图对应。例如：
file(0-69): sprite\sys\xxx_0.bmp w: 79 h: 79 row: 10 col: 7
file(70-139): sprite\sys\xxx_1.bmp w: 79 h: 79 row: 10 col: 7
file(140-209): sprite\sys\xxx_0.bmp w: 79 h: 79 row: 10 col: 7
file(210-279): sprite\sys\xxx_1.bmp w: 79 h: 79 row: 10 col: 7
file(280-349): sprite\sys\xxx_2.bmp w: 79 h: 79 row: 10 col: 7
file(350-419): sprite\sys\xxx_2.bmp w: 79 h: 79 row: 10 col: 7
file(420-489): sprite\sys\xxx_2.bmp w: 79 h: 79 row: 10 col: 7
则设置pic时只能是载入图档的第一个，这里即是0~69、70~139、280~349。5.变身前最后一个frame中，pic显示的是变身前人物的图档，next、hit无效，一律next：999。6.变成id：50的人时用state：8050，则pic会+140；用state：9995则不会。

气功波：
R-LouisEX的凤凰羽毛中设了weapon_hp：10000。气功波HP不是默认500（501？）吗？
hit_a：气功波的耗HP值。每个气功波有500MP，耗完后跳至hit_d:?,hit_d:0则跳到frame20，且失去跟踪能力。F7不但能使人物HP、MP归500，也能使气功波HP归500。
※气功波没HP时跳转frame的原则与itr kind：9打到人HP归0一样。
hit_j：会强制移动。
hit_Fa：
5、6、8、9、13：按相应数量发出特定id和frame的气功波。例如：
9：随机发出id：221、222，frame0的气功波。
……
10：没有追踪效果，只会加速。

state：
15：打中人物、武器自己无影响，被气功波打中后效果同3000。
18：与人物一样。
3005：利用facing: X0只能使气功波平行飞行（不重合），但飞行时不能上下分叉。
※state：3006的穿心强度还与bdefend有关（对于打中人、小波、武器而言，下同）。穿心箭、恶魔炸弹能所向无敌，是因为它的bdefend有60或以上；气旋斩一下就会被反弹，这与它bdefend只有20有关。

act分布：
10：state：3000气功波用itr kind：0打到人。
20：被打中（只有itr kind：0才能打到气功波）。
30：被反弹。
40：见下面“itr能反弹气功波原则”。
※气功波的反弹是在rebounding中设置opoint action:0 oid:[自己的id] 反弹回去。有些气功波一反弹就爆是把这个opoint删除。

※itr能反弹气功波原则：
itr打波反弹与否，分很多情况的。Itr kind 0 的话，要看攻击物的 type 和被攻击波的state 如type 0 的这种打state 3000 3002 就可以反弹， 其他的type都不会反弹波；但是有一个特殊的 itr kind 9 任何 type 的object 装上它都能反弹 state 3000 3002 3006 (打3005会跳到frame 40). （这里所谓反弹波，是使波跳到frame 30）

武器：
攻击表：怎样设置武器的攻击范围？
轻型武器act：
20~35：可以随便更改，是人物wpoint的weaponact。
60：刚落地。
70：貌似无用。
64：可随便更改，是frame60、70用next跳转几个frame后到达的。
重型武器act：
0：重型武器被投掷或从天上掉下都是这个frame。
10：同轻型武器，是人物wpoint的weaponact。
〈特别发现〉武器的投掷方法是由id决定的。

id特性：
1.id：201、202的武器不受itr kind：10、15影响，
1.1 id：201、202能与bdy kind：1XXX作用。
2.id：6 HP＜1/3时才能hit_ja:300。
id：7、8 HP各小于1/5时才能合体为id：51的人，跳到frame290。
※在没有hit_ja：的frame中按DJA就能解除。
※HP限制“lf2.net”解除。
3.id：6 一次盔甲防御。
id：37 二次盔甲防御。
id：52 二次强力防御。
盔甲防御：
（1）只能防御kind：0 effect：0、1、5~9。
（2）bdefend必须小于等于60才能防御。
强力防御：
（1）只能防御itr kind：0。
（2）同上，bdefend必须小于等于60才能防御。
4.id：8，209，213 所有itr kind：0能使state：3000的气功波反弹成id：209的气功波。
id：213的武器被挥动（wpoint attacking不为0）时也能使state：3000的气功波反弹成id：209的气功波。
id：210，220，221~226，228以及3xx不受id：8、209、313影响。
5.id：223、224 只能直发，且没有影子（除了穿透效果外，其他与state：3005同）。6.（1）id：122的武器能使人回复HP，MP。
id：123的武器能使人快速回复MP。
（2）闯关时遇到敌人的id如果为30~37及39，则敌人影子下不会写“com”。
（3）id：100~199 会掉落的物品。不能更改。

闯关：
id：闯关的实际顺序，#stage x-x只是记事本功能用的。如果id与编号配合的话，stage x-y的id应为[x-1][y-1]（两位数）。例如，stage 2-4的id是13。每大关最多10小关。
人物没有的id：
3000：id：30或31的人（随机）。

LF所有秘密解释：0.开启游戏成功后，打入「lf2.net」即可使用隐藏人物，切记不要按到右边的数字键。
注：id：30~39、50~59的人物必须打“lf2.net”才能使用。
1.DeepMP少于15、BatMP少于10MP时，在地上打滚，往反方向出D>J会往回滚。
注：在hit到达的frame中若MP不足则不会影响动作，但这个hit若是D>A，D>J的则会影响方向。第23同。
2.Rudolf被击上天，适当时机下按D>J可在空中使用刺虎。
注：在rowing（受身）中有hit_Fj：274（即刺虎的第二个frame）。因为D>J中含有J，所以会进入受身状态，再利用hit发刺虎。3.战争模式的牛奶与啤酒选项弄反了。
注：exe有bug，与改档无关。
4.Louis在落地的前一个影格受到某些攻击，会停顿在空中。
注：与盔甲防御有关。
5.F7可以使Rudolf分身变成500HP。
注：F7的作用是所有人HP归500，分身出来的也一样。6.按着F7还可让招式持久，例如让防护盾永不消失。
注：F7可以使气功波的HP归500。7.四个飞弹同时击中气旋斩可抵销
注：见前面气功波state解说的下面，与气旋斩bdefend太低有关。
8.Bat秘密招式：捉人+DvA。
注：frame121中有hit_Da：274。
9.Firen跟Freeze同队伍，双方HP都少于5/1，两人面对面奔跑会融合成Firzen，DJA解除。
注：id特性。
10.Louis当HP少于2/1按下DJA可脱下盔甲成为LouisEX。
注：HP限制是id特性，至于他按DJA干什么是frame设的，变身是state：9995。11.某些角色拿着武器到墙边，使其手上的武器完全受到视窗遮蔽，会发现武器自动消失。
注：武器、气功波到达场外会消失，但角色拿武器必须足够远（wpoint的x足够大），所以只有部分角色能做到。
12.Rudolf可用变化术提早起身（还可爆冰）。
注：必须是变回来才行。state：501无论处于哪个frame都会强制变身。13.旋风摔在捉人瞬间遇到对方攻击（但有捉到），会有意想不到的效果。
注：效果是：不影响动作，但自己会根据对方攻击itr的dvx、dvy运动。任何itr kind：3都会这样。
14.Rudolf变成Freeze，再与Firen合体，Rudolf用变化术变回原体，Firen消失了。
注：state：501是强制变身，且变化术仍会识别为自己变成的是Freeze，所以变回去后自己是Freeze，Firen消失了。15.百烈拳第三～四拳受到某些攻击，使出昇龙霸会昇很高 。
注：好象是惯性问题..... 16.百烈腿、百烈拳、旋风腿、无影脚在打人时候，如果另一人突然加进来给你打，你会从头第一击起。
注：vrest原因。
18.Davis跑步时候可以不滚地而出任何招式。
注：在rowing（滚地）中有hit。19.用Rudolf变化成Julian后使用镜像，此时变回本尊Rudolf发现镜像变成你的分身。
注：镜像是人物的分身，他的frame是人物无法跳到的，最后会消失。state：501是强制变身，对分身也是。
20.Knight拿着武器按D>A可以挥剑。
注：standing、walking、defend中有hit_Fa：240，此frame与frame60的next是一样的，也是挥剑。
21.Rudolf拿着轻型武器会藏在衣里。
注：wpoint中写入cover：1。
22.Davis的>>A可中途按下A提早收拳，此时无法攻击到敌方，但是可以反弹一些东西。
注：在run_attack的第三个frame中有hit_a：89，frame89中有itr effect：4。
※17条谁能解释？17.当Rudolf要变身为对方的瞬间，对方如果在这时候遭受特定攻击，就会悬浮在空中。

实用技巧：1.使某一招式在hp<某一上限时才可使用 ：
增加它的mp使用量，并且攒招时持续消耗mp，使消耗的mp>500,并且在hp<某一上限时可回复得过来。2.使某一招式在某些关不能使用 ：
在人质档(criminal.dat)里增加一个frame，pic:999，state：3005。
再在里面增加一个itr,范围如下：
X:0 y:特殊位置（自己设定） w:10000 h:100
然后找到想要改的人物，在那一招式中加上bdy ：
X:0 y: 特殊位置 w:10000 h:100
最后打开关卡档(stage.dat)，在需要使招式失效的关卡里放置那个人质。3.使招式减少敌人的mp:
在所有人的档中都加入一个frame,比如398，设定扣的mp,
然后做招，如果是近身的就在人的frame中加cpoint vaction: 398（caughtact：398也行）,如果是远的就在气功波的frame中加入抓人招. 4.加背景音乐：
在人质档(criminal.dat)里增加一个frame，sound: xxx（背景音乐）pic:999 ，state：3005。
在下一个frame里 设置 wait:0,然后跳到刚才的frame 。
另外，在关卡档(stage.dat)里横向每隔700-800个单位长度放置一个人质，目的是让你不论在哪里都能听到音乐。5.令Firzen冰盾具有Freeze或冷冻波效果：
把frame110改为wait：0，再新键一个与110完全相同的frame（如235，用复制粘贴再改编号），把这个frame改成wait：11。同时，在id：209加一个与Firzen的frame235完全相同的frame（如50），其中pic：999，state：3005，并让Firzen在frame235在center位置发一个opoint，action：50，oid：209。这样就可以了。6.在某关删除所有人质及分身：
在人质档(criminal.dat)里增加2个frame，内容如下：

<frame> 90 ??? 
pic: 999 state: 3005 wait: 75 next: 91 dvx: 0 dvy: 0 dvz: 0 centerx: 0 centery: 0 hit_a: 0 hit_d: 0 hit_j: 0 
itr: 
kind: 0 x: -10000 y: -11000 w: 20000 h: 22000 dvx: 0 fall: 70 vrest: 300 bdefend: 100 injury: 10000 zwidth: 1000 
effect: 6 
itr_end: 
<frame_end>

<frame> 91 ??? 
pic: 999 state: 3005 wait: 5 next: 1000 dvx: 0 dvy: 0 dvz: 0 centerx: 0 centery: 0 hit_a: 0 hit_d: 0 hit_j: 0 
itr: 
kind: 0 x: -10000 y: -11000 w: 20000 h: 22000 dvx: 0 fall: 70 vrest: 300 bdefend: 100 injury: -500 zwidth: 1000 
effect: 6 
itr_end: 
<frame_end>

wait：75=比死人质消失时间稍长
effect：6=无火花、声音
范围：全场
injury: 10000=必死无疑
injury: -500=立即补满

另外，配合一些爆炸、声音等进行障眼，效果会比较好。

特此鸣谢：裂影Felix，Tseyinhei，拖鞋，Jerry Hawk，58.30.54.\*
