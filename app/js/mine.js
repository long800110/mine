/*系统变量*/
var WIDTH = 9;
var HEIGHT = 9;
var MINE_NUM = 10;
var WIN_NUM = WIDTH * HEIGHT - MINE_NUM;/*当点开的按钮的数量为winNum时即可判定为所有的地雷均被排除，游戏胜利*/

/*变量*/

/*判断游戏是否开始*/
var gameStarted = false;
/*状态数组*/
var statusArray;
/*剩余地雷数*/
var remainer;
/*计时器*/
var timer;
/*临时数组，用于记录短时间内鼠标的点击状态*/
var buttons,buttons2;
/*判断在很短时间内是否有鼠标mousedown事件的标志位*/
var isProcessedCellUpButton = false;
/*判断在很短时间内是否有鼠标mouseup事件的标志位*/
var isProcessedUpButton = false;

/*记录同时mousedown键的个数*/
var isProcessedDownButton = 0;
/*鼠标事件状态： 1：鼠标座击，2:鼠标右击，3:鼠标左右键同时点击*/
var mouseEventType;
/*用于记录当鼠标点击时当前按钮在表格中的坐标*/
var indexX, indexY;
/*计时器句柄*/
var tt, tt2;


window.onload = function(){
	initGame();
	

}

/**
	初始化游戏
*/
function initGame(){
	timer = 0;
	isProcessedDownButton = 0;
	outputTime();
	startGame();
	initTimer();

	
	/*防止按钮上的mousedown事件冒泡到按钮下的格子上*/
	$('.clickable').bind('mousedown', function(event){
		event.stopPropagation();
	});
	/*对格子的左右键同时点击进行处理*/
	$('.cell').bind('mousedown', function(event){
		var td = $(event.target);
		var y = td.index();
		var tr = td.parent();
		var x = tr.index();
		isProcessedDownButton ++;
		if(isProcessedDownButton === 2){
				handleMouseDown(x, y);
		}

	});

	
	$('.clickable').on('mousemove', function(event){
		return false;
	});
	$('.clickable').on('mouseup', function(event){
		
		
		event.stopPropagation();
		
		var td = $(event.target).parent();
		var y = td.index();
		var tr = td.parent();
		var x = tr.index();
		if(!isProcessedUpButton){
			buttons = new Array();
			isProcessedUpButton = true;
			buttons.push(event.which);
			setTimeout(function(){
				handleButtonMouseUp(x, y);
			},100); 
		}
		else{
			buttons.push(event.which);
		}
	});
	$('.cell').on('mouseup', function(event){
		if(isProcessedDownButton > 0){
			isProcessedDownButton --;
		}
		
		
		var td = $(event.target);
		var y = td.index();
		var tr = td.parent();
		var x = tr.index();
		if(!isProcessedCellUpButton){
			buttons2 = new Array();
			isProcessedCellUpButton = true;
			buttons2.push(event.which);
			setTimeout(function(){
				handleCellMouseUp(x, y);
			},100); 
		}
		else{
			buttons2.push(event.which);
		}
		
	});	
}
/**
	初始化计时器 
*/
function initTimer(){
	closeTimer();
	gameStarted = false;
	startTimer();

}

/**
	屏蔽鼠标右键菜单
*/
document.oncontextmenu = function(){ 
	return false;
}

/**
	关闭菜单
*/
function toggleMenu(){
	var subMenu = $('.sub_menu');
	if(subMenu.hasClass('active')){
		subMenu.removeClass('active');
	}else{
		subMenu.addClass('active');
	}
	
}
/**
	开关菜单
*/
function closeMenu(){
	var subMenu = $('.sub_menu');
	subMenu.removeClass('active');	
}

/**
	开始游戏的入口
*/
function start(){
	closeMenu()
	$('#start').blur();
	$('#start').removeClass('icon-cool2');
	$('#start').removeClass('icon-sad2');
	$('#start').addClass('icon-smile2');
	initGame();
}

/**
	设置困难度：初级
*/
function setEasy(){
	$('body').removeClass('hard');
	$('body').removeClass('normal');
	$('body').addClass('easy');
	WIDTH = 9;
	HEIGHT = 9;
	MINE_NUM = 10;
	WIN_NUM = WIDTH * HEIGHT - MINE_NUM;	
	start();
}

/**
	设置困难度：中级
*/
function setNormal(){
	$('body').removeClass('hard');
	$('body').removeClass('easy');
	$('body').addClass('normal');
	WIDTH = 16;
	HEIGHT = 16;
	MINE_NUM = 40;	
	WIN_NUM = WIDTH * HEIGHT - MINE_NUM;
	start();
}

/**
	设置困难度：高级
*/
function setHard(){
	$('body').removeClass('normal');
	$('body').removeClass('easy');
	$('body').addClass('hard');
	WIDTH = 16;
	HEIGHT = 30;
	MINE_NUM = 99;	
	WIN_NUM = WIDTH * HEIGHT - MINE_NUM;
	start();
}

/**
	推出游戏
*/
function exit(){
	toggleMenu();
}

function handleMouseDown(x, y){
	

		var btn = getButton(x, y);
		if(btn.css('display') != 'none' && !btn.hasClass('icon-flag')){
			var td = btn.parent();
			td.addClass('flat');
		}
		var positions = getAroundPosition(x, y);

		for(var k = 0 ; k < 8 ; k ++){
			var offset_x = positions[k][0];
			var offset_y = positions[k][1];
			if(offset_x < 0 || offset_x > WIDTH - 1 || offset_y < 0 || offset_y > HEIGHT -1 ){
				continue;
			}
			var btn = getButton(offset_x, offset_y);
			if(btn.css('display') != 'none' && !btn.hasClass('icon-flag')){
				var td = btn.parent();
				td.addClass('flat');
			}
		}
		isProcessedDownButton = 0;
}


/**
	对点击到有按钮覆盖的格子的处理
*/
function handleButtonMouseUp(x, y){
	isProcessedUpButton = false;
	if(buttons.length === 2){//左右键同时抬起
		return; //什么都不做
	}
	else if(buttons[0] === 1){//鼠标左击
		gameStarted = true;
		handleLeftClick(x, y);
	}
	else if(buttons[0] === 3){//鼠标右击
		handleRightClick(x, y);
	}
}

/**
	对点击到没有按钮覆盖的格子的处理
*/
function handleCellMouseUp(x, y){
	
	if(buttons2.length === 2){//左右键同时抬起
		
		handleBothClick(x, y);
	}
	$('.cell').removeClass('flat');
	isProcessedCellUpButton = false;
}
/**
	处理鼠标左击
*/
function handleLeftClick(x, y){
	var button = getButton(x, y);
	//等于0，说明周围没有地雷，要递归的把周围没有地雷的地方都打开，比较麻烦
	if(statusArray[x][y] === 0){
		handleBlank(x, y);
	}
	//等于9，说明踩地雷上了，GAME OVER
	else if(statusArray[x][y] === 9){
		//点错的地雷背景标成红色
		var button = getButton(x, y);
		var td = button.parent();
		td.css('background-color', 'red');
		//标错小旗的格子标成大红叉
		var flagBtns = $('#mineTable').find('.icon-flag');
		for(var i = 0 ; i < flagBtns.length ; i ++){
			var btn = flagBtns[i];
			var td = $(btn).parent();
			var y = td.index();
			var tr = td.parent();
			var x = tr.index();
			if(statusArray[x][y] !== 9){
				td.addClass('icon-error-mine');
			}
		}
		gameOver();
		return;
	}
	//其他情况，说明周围至少有一颗地雷，仅仅把这个按钮移除掉就好了
	else{
		button.hide();
		checkIfWin();
	}
} 
/**
	对周围不是地雷进行递归处理
*/
function handleBlank(x, y){
	var status = statusArray[x][y];
	var button = getButton(x, y);
	if(button.css('display') === 'none'){
		return;
	}
	button.hide();
	checkIfWin();
	if(status === 0){

		var positions = getAroundPosition(x, y);
		for(var k = 0 ; k < 8 ; k ++){
			var offset_x = positions[k][0];
			var offset_y = positions[k][1];
			if(offset_x < 0 || offset_x > WIDTH - 1 || offset_y < 0 || offset_y > HEIGHT -1 ){
				continue;
			}
			handleBlank(offset_x, offset_y);
		}
	}
	else{
		return;
	}
}

/**
	判断游戏是否结束
*/
function checkIfWin(){
	var remainNum = $('#mineTable').find('button[style="display: none;"]').length;
	if(remainNum === WIN_NUM){
		gameWin();
	}
}

/**
	游戏以游戏者胜利结束，对系统进行善后处理
*/
function gameWin(){
	alert('你赢了');
	$('.clickable').attr('disabled','disabled');
	gameStarted = false;
	$('#start').removeClass('icon-smile2');
	$('#start').removeClass('icon-sad2');
	$('#start').addClass('icon-cool2');
}

/**
	游戏结束，对系统进行善后处理
*/
function gameOver(){
	gameStarted = false;
	$('.clickable').hide();
	$('#start').removeClass('icon-smile2');
	$('#start').removeClass('icon-cool2');
	$('#start').addClass('icon-sad2');
}
/**
	处理鼠标右击
*/
function handleRightClick(x, y){
	var button = getButton(x, y);
	if(button.hasClass('icon-flag')){
		button.removeClass('icon-flag');
		remainer ++ ; 
		outputRemain();
	}
	else{
		if(remainer === 0){
			return;
		}
		
		button.addClass('icon-flag');
		remainer -- ; 
		outputRemain()
	}
} 
/**
	处理鼠标同时抬起
*/
function handleBothClick(x, y){
	var mineNum = statusArray[x][y]; //得到周围的地雷数，也就是格子中显示的数字
	if(mineNum === 0){
		return;  //说明点的是没有数字的格子，不做处理
	}
	var positions = getAroundPosition(x, y);
	var flagNum = 0; //已标记为小旗的按钮的数量
	for(var k = 0 ; k < 8 ; k ++){
		var offset_x = positions[k][0];
		var offset_y = positions[k][1];
		if(offset_x < 0 || offset_x > WIDTH - 1 || offset_y < 0 || offset_y > HEIGHT -1 ){
			continue;
		}
		var button = getButton(offset_x, offset_y);	
		if(button.css('display') != 'none' && button.hasClass('icon-flag')){
			flagNum ++;
		}
	}
	if(flagNum !== mineNum){ //小旗的数量不等于应有地雷的数量，不做处理直接返回
		return;
	}
	for(var l = 0 ; l < 8 ; l ++){
		var offset_x = positions[l][0];
		var offset_y = positions[l][1];
		if(offset_x < 0 || offset_x > WIDTH - 1 || offset_y < 0 || offset_y > HEIGHT -1 ){
			continue;
		}
		var button = getButton(offset_x, offset_y);	
		if(button.css('display') != 'none' && !button.hasClass('icon-flag')){
			handleLeftClick(offset_x, offset_y); //对周围的八个格子中没标小旗的按钮分别做一次点击左键操作
		}
		
	}
} 
/**
	根据当前坐标获取按钮
*/
function getButton(x,y){
	return $('#mineTable tr').eq(x).find('td').eq(y).children();
}
//开始游戏 
function startGame(){
	remainer = MINE_NUM;
	timer = 0;
	statusArray = generateArray(WIDTH, HEIGHT);/*初始化状态数组*/
	generateMine(MINE_NUM);
	fillNonMineZone();
	drawTable(WIDTH,HEIGHT);
	outputRemain();
}

function startTimer(){
	if(gameStarted === true){
		timer ++ ;
		outputTime();
		
	}
	tt = setTimeout('startTimer()', 1000);
	
}

function closeTimer(){
	clearTimeout(tt);
}

/**
	输出剩余地雷数量
*/
function outputRemain(){
	var remainStr = formatNumber(remainer);
	$('#remain').html(remainStr);
}

/**
	输出已用时间 
*/
function outputTime(){
	var timeStr = formatNumber(timer);
	$('#timer').html(timeStr);	
}
/**
	格式化数字，数字不足三位前面补0， 数字大于999则显示为999
*/
function formatNumber(number){
	if(number > 999){
		return '999';
	}
	else if(number < 10){
		return '00' + number.toString();
	}
	else if(number < 100){
		return '0' + number.toString();
	}
	else {
		return number.toString();
	}
}

/**
	根据状态数组绘制表格
*/
function drawTable(x, y){
	var table=$("<table id='mineTable' class='mineTable'>");
	 $("#mineZone").html($(''));
     for(var i = 0 ; i < x ; i ++ )
     {
        var tr=$("<tr>");
        tr.appendTo(table);
        for(var j = 0 ; j < y ; j ++ )
        {
			var cellClass = "";
			var status = statusArray[i][j];
			switch(status){
				case 0:
					cellClass = "n0";
					break;
				case 1:
					cellClass = "n1";
					break;
				case 2:
					cellClass = "n2";
					break;
				case 3:
					cellClass = "n3";
					break;
				case 4:
					cellClass = "n4";
					break;
				case 5:
					cellClass = "n5";
					break;
				case 6:
					cellClass = "n6";
					break;
				case 7:
					cellClass = "n7";
					break;
				case 8:
					cellClass = "n8";
					break;
				case 9:
					cellClass = "icon-b0";
					break;						
			}
			var td=$("<td class='cell " + cellClass + "'><button class='btn clickable'></button></td>");
			td.appendTo(tr);
        }
		var trend = $("</tr>");
		trend.appendTo(table);
     }
	 
     table.appendTo($("#mineZone"));
}

/**
	填充非地雷区域
*/
function fillNonMineZone(){
	var amount = 0;
	var offset_i, offset_j;
	for(var i = 0; i < WIDTH ; i ++){
		for(var j = 0 ; j < HEIGHT ; j ++){
			amount = 0;
			if(statusArray[i][j] === 9){
				continue;
			}
			var positions = getAroundPosition(i, j);
			for(var k = 0 ; k < 8 ; k ++){
				offset_i = positions[k][0];
				offset_j = positions[k][1];
				if(isMine(offset_i, offset_j)){
					amount ++;
				}
			}
			statusArray[i][j] = amount;
		}
	}
	
}/**
	获取周围位置坐标
*/
function getAroundPosition(x, y){
	var positions = [[x - 1, y],[x - 1, y - 1], [x, y - 1], [x + 1, y - 1], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x - 1, y + 1]];
	return positions;
}
/**
	判断当前位置是否是地雷
*/
function isMine(x, y){
	if(x < 0 || y < 0 || x > WIDTH -1 || y > HEIGHT - 1){
		return false;
	}else{
		return (statusArray[x][y] === 9);
	}
	
}
/**
	生成一个x*y的二维数组
*/
function generateArray(x, y){
	var arr = new Array();
	for(var i = 0; i < x; i ++){
		arr[i]=new Array(); 
		for(var j= 0; j < y; j ++){
			arr[i][j]= 0;
		}
	}
	return arr;
}
/**
	组中插入number个地雷 
*/
function generateMine(number){
	for(var i = 0; i < number ;){
		var x = getRandomNum(0, WIDTH - 1);
		var y = getRandomNum(0, HEIGHT - 1);
		if(statusArray[x][y] === 9){
		}else{
			statusArray[x][y] = 9;
			 i ++;
		}
	}
}
/**
	产生随机整数 
	param: min 随机数下限
	param: max 随机数上限
*/
function getRandomNum(min, max){
	var range = max - min;   
	var rand = Math.random();   
	return(min + Math.round(rand * range));  
}