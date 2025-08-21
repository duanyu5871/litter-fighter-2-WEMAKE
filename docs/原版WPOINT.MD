# WPOINT

wpoint:(手持武器指令开始)
kind: # x: # y: # weaponact: # attacking: # cover: # dvx: # dvy: # dvz: #
wpoint_end:(手持武器指令结束)

kind: 状态，1持在手上，2持在手上，3掉落
x: x座标，与武器的cpoint的x座标配合。
y: y座标，与武器的cpoint的y座标配合。
weaponact: 武器的动作，20 ~ 35之间，在范围之外会在游戏中被打到。
attacking: 攻击状态，在武器中的entry可查。

- 若weaponact不在20 ~ 35之间，则attacking没用。
  cover: 遮盖，0显示在人物之前，1藏在人物之后。
  dvx: 速度，丢出去的x速度。
  dvy: 丢出去的y速度。
  dvz: 丢出去的z速度，要自已按↑↓
- 值=0，则会持在手上，值≠0则会丢出去。(武器的act跳到40)
