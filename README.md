# JS Dev Console for Feartress 恐惧之森轻量级控制台
## 【前言】
Steam商店：https://store.steampowered.com/app/1904280

移植于M3 JS Console for Melvor Idle

 (https://github.com/ChaseStrackbein/m3-dev-console) MIT License
 
对源码做了小幅修改以适配Feartress

## 【意义】
1.轻量化控制台

       a.用于直接输入修改代码（不需要下载较为笨重的Debugtron）
       b.用于导出汉化文本（不需要alert了 可以直接复制）
       ……

2.尝试移植成功代表非electron套皮浏览器也可用此方法移植（比如Steam上的脆皮？）


## 【缺点】
1.需要手动引入js、css（每次更新后需要重新引入）

2.打印结果均以文本形式显示（需要借助外部工具格式化结果）

3.无法联想变量代码

4.无法完整调试（electron调试还是用Debugtron吧，非electron似乎没有调试工具只能用这个打印打印变量了）

## 【准备工作】
1.将Feartress-console.js、Feartress-console.css复制到游戏目录(Feartress\resources\app\electron\release\dist\)

![修改play.html以引入js css](example_img/%E4%BF%AE%E6%94%B9play.html%E4%BB%A5%E5%BC%95%E5%85%A5js%20css.png)
2.修改游戏目录的play.html （详见附件"修改play.html以引入js css.png"）

`<head>`中引入css及jQuery（m3-dev-console原作者用了jQuery，jQuery地址仅供参考可以自行选择，注意墙）

```
<link rel="stylesheet" type='text/css' href="./Feartress-console.css">
<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js"></script>
```

`<body>`中引入js

```
<script src='Feartress-console.js'></script>
```

## 【使用方法】
1.打开游戏，加载存档

2.点击右上角Console按钮加载控制台（切换快捷键Shift+~）

3.左下角>处为js代码输入处

左下角﹀点击可最小化控制台界面

右上角🗑清空控制台

右上角×为隐藏控制台

控制台界面最上方可拖动

![用于汉化](example_img/%E7%94%A8%E4%BA%8E%E6%B1%89%E5%8C%96.png)
![用于输入修改代码](example_img/%E7%94%A8%E4%BA%8E%E8%BE%93%E5%85%A5%E4%BF%AE%E6%94%B9%E4%BB%A3%E7%A0%81.png)


(Original README.md above)
# M3 JS Console for Melvor Idle
Allows you to use an emulation of the developer console in the Steam edition of Melvor Idle. Shift + ` to access (configurable via the [Keybindings](https://github.com/ChaseStrackbein/melvor-keybindings) mod, just make sure dev.Console comes **after** Keybindings in your load order). There is also a button to open the console once loaded into a character, found next to the cloud save button.

![Screenshot of dev.Console](example.png)
