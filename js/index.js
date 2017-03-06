/*
定义全局变量
*/
var MAX_PATH_LENGTH = 10001				//最大路径长度
var nodeNum 	 	= 0;				//景点数量
var pathNum 	 	= 0;				//路径数量
var sights 		 	= new Array();		//顶点信息数组
var paths 		 	= new Array();		//路径信息数组
var G 			 	= new Array(); 		//邻接矩阵存放顶点和边信息
var curOperation 	= 0;				//标识当前操作
var START 			= -1;				//起始景点
var END 			= -1;				//终止景点
var can;

window.onload = function() {
	$('addnode').onclick = function() {
		curOperation = 1;
		setOperationInfo(1,-1 ,-1);
		$('queryrlt').style.display = 'none';
	}
	$('setlines').onclick = function() {
		curOperation = 2;
		setOperationInfo(2, -1, -1);
		$('queryrlt').style.display = 'none';
	}
	$('selnode').onclick = function() {
		curOperation = 3;
		setOperationInfo(3, -1, -1);
		$('queryrlt').style.display = 'none';
	}
	$('querypaths').onclick = queryPaths;

	var draw_area = $('draw_area');
	can = draw_area.getContext('2d');
	$('draw_area').onclick = function() {
		if(1 == curOperation) {			
			addNode();
		} else if(2 == curOperation) {
			setLines();
		} else if(3 == curOperation) {
			selectSights();
		}
	}

	$('resetnode').onclick = function() {
		if(confirm('确定重置景点吗？')) {
			nodeNum = 0;
			pathNum = 0;
			setNodePathInfo(true);
			setNodePathInfo(false);
			can.clearRect(0,0,770,500);
		}		
	}
}

function SightNode() {
	this.n0um = 0;
	this.XPos = 0;
	this.YPos = 0;
}

function PathNode() {
	this.startNode = 0;
	this.endNode = 0;
	this.pathLength = 0;
}

function $(id) {
	return document.getElementById(id);
}

//添加景点
function addNode() {
	var mouse_pos = getMousePos();
	if(!isNodePosAvailable(mouse_pos.x, mouse_pos.y)) {
		alert('景点之间距离太近，请重新设置！');
		return;
	}
	sights[nodeNum] = new SightNode();
	sights[nodeNum].num = nodeNum + 1;
	sights[nodeNum].XPos = mouse_pos.x;
	sights[nodeNum].YPos = mouse_pos.y;	
	can.beginPath();
	can.arc(mouse_pos.x, mouse_pos.y, 15, 0, 360, false);	
	can.strokeStyle="rgb(255,0,0)";
	can.fillStyle = "rgb(255,0,0)";
	can.fill();
	can.font = "16px Courier New";
	can.fillStyle = "rgb(255,255,255)";
	var offset = nodeNum < 9 ? 5 : 9;
	can.fillText(nodeNum + 1, mouse_pos.x - offset, mouse_pos.y + 5);
	can.stroke();
	can.closePath();
	nodeNum++;
	setNodePathInfo(true);
}

//获取鼠标点击坐标
function getMousePos(event) {	
    var e = event || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || e.clientX + scrollX;
    var y = e.pageY || e.clientY + scrollY;
    var cont_left = $('cont_left');
	var cont_left_pos = getAbsPoint(cont_left);
    return { 'x': x - cont_left_pos.x, 'y': y - cont_left_pos.y};
}

//获取元素在body内右上角绝对坐标
function getAbsPoint(e) { 
    var x = e.offsetLeft;
    var y = e.offsetTop;      
    while(e = e.offsetParent) {    
       x += e.offsetLeft;      
       y += e.offsetTop;   
    }     
    return {'x' : x, 'y' : y};   
}   

//获取鼠标点击的结点编号
function getClickedNode() {
	mousePos = getMousePos();
	for (var i = 0, j = sights.length; i < j; i++) {
		var range = Math.pow((sights[i].XPos - mousePos.x), 2) + Math.pow((sights[i].YPos - mousePos.y), 2);
		if(range <= 225) {
			return sights[i].num;
		}
	}
	return -1;
}

//判断两点之间距离是否太近
function isNodePosAvailable(newX, newY){
	for(var i = 0; i < nodeNum; i++){
		var range = Math.pow((newX - sights[i].XPos), 2) + Math.pow((newY - sights[i].YPos), 2);
		if (range < 5000)
			return false;
	}
	return true;
}

//判断两点间路径是否设置
function isPathExist(node1, node2) {
	for(var i = 0, j = paths.length; i < j; i++) {
		if((node1 == paths[i].startNode && node2 == paths[i].endNode) || (node2 == paths[i].startNode && node1 == paths[i].endNode)) {
			return true;
		}
	}
	return false;
}

//设置顶点和边数量提示信息
function setNodePathInfo(setNode) {
	if(setNode) {
		var nodeInfo = $('nodenum');
		nodeInfo.innerHTML = nodeNum;
	} else {
		var pathInfo = $('pathnum');
		pathInfo.innerHTML = pathNum;
	}	
}

//设置路线
var startSight  = -1;
var endSight    = -1;
var selFinished = false;
function setLines() {
	if(nodeNum < 2) {
		alert('请先添加景点！');
		return;
	}
	var selNode = getClickedNode();
	if(!selFinished) {
		if(-1 != selNode) {
			paths[pathNum] = new PathNode();
			startSight = selNode;
			paths[pathNum].startNode = selNode;
			selFinished = true;
			setOperationInfo(2, startSight, -1);
		}
	} else if(selFinished) {
		if(-1 != selNode) {
			if(startSight == selNode) {
				return false;
			}
			if(isPathExist(startSight, selNode)) {
				alert('该路径以是设置！');
				return false;
			}		
			endSight = selNode;
			paths[pathNum].endNode = selNode;
			setOperationInfo(2, startSight, endSight);
			$('drawnodeinfo').innerHTML = '请设置 <span style="color:blue;font-weight:bold">景点' + startSight + ' - 景点' + endSight + '</span> 的路径长度';
			$('cont_right_bottom').style.display = 'block';
			$('pathlength').focus();
			$('subbtn').onclick = drawPath;
		}
	}
}

//绘制路线
function drawPath() {
	var pathLength = $('pathlength').value;	
	if(pathLength) {
		paths[pathNum].pathLength = pathLength;
		can.beginPath();
		can.strokeStyle = "rgb(0, 0, 255)";	//设置画笔颜色
		can.fillStyle = "rgb(0, 0, 0)"
		can.moveTo(sights[startSight - 1].XPos, sights[startSight - 1].YPos);
		can.lineTo(sights[endSight - 1].XPos, sights[endSight - 1].YPos);
		var textXPos = (sights[startSight - 1].XPos + sights[endSight - 1].XPos) / 2;
		var textYPos = (sights[startSight - 1].YPos + sights[endSight - 1].YPos) / 2;
		can.fillText(pathLength, textXPos, textYPos);
		can.stroke();
		can.closePath();
		startSight = -1;
		endSight = -1;
		pathNum++;
		selFinished = false;
		setNodePathInfo(false);
		$('pathlength').value = '';
		$('cont_right_bottom').style.display = 'none';
		setOperationInfo(2,-1 ,-1);
		redrawNode();
		return true;
	} else {
		alert('请设置路径长度');
		return false;
	}		
}

//重绘景点
function redrawNode() {	
	for(var i = 0; i < nodeNum; i++) {
		can.beginPath();
		can.arc(sights[i].XPos, sights[i].YPos, 15, 0, 360, false);	
		can.strokeStyle="rgb(255,0,0)";
		can.fillStyle = "rgb(255,0,0)";
		can.fill();
		can.font = "16px Courier New";
		can.fillStyle = "rgb(255,255,255)";
		var offset = i < 9 ? 5 : 9;
		can.fillText(i + 1, sights[i].XPos - offset, sights[i].YPos + 5);
		can.stroke();
		can.closePath();
	}	
}

//设置操作信息
function setOperationInfo(oper, node1, node2) {
	$('operinfo').style.display = 'block';
	$('startnode').innerHTML = '';
	$('endnode').innerHTML = '';
	var curOper = $('curoper');
	if(1 == oper) {
		curOper.innerHTML = '添加景点';
	} else if(2 == oper) {
		curOper.innerHTML = '设置路线';
	} else if(3 == oper) {
		curOper.innerHTML = '选择景点';
	} else {
		curOper.innerHTML = oper;
	}
	if(node1 != -1) {
		$('startnode').innerHTML = '起始景点：<span style="color:blue">景点' + node1 + '</span>';
	}
	if(node2 != -1) {
		$('endnode').innerHTML = '终止景点：<span style="color:blue">景点' + node2 + '</span>';
	}
}

//选择查询路线的起始点和终点
var isSelected = false;
function selectSights() {
	var curSel = getClickedNode();
	if(curSel != -1) {
		if(!isSelected) {
			START = curSel;
			isSelected = true;
			setOperationInfo(3, START, -1);
		} else {
			if(curSel == START) {
				alert('起始点和终点不能相同！')
				return false;
			}
			END = curSel;
			isSelected = false;
			setOperationInfo(3, START, END);
		}
	}
}

//创建邻接矩阵
function createMatrix() {
	for(var i = 0; i < nodeNum; i ++) {		
		G[i] = new Array();
		for(var j = 0; j < nodeNum; j++) {
			G[i][j] = MAX_PATH_LENGTH;
		}
		G[i][i] = 0;
	}

	for(var i = 0; i < pathNum; i++) {
		G[paths[i].startNode - 1][paths[i].endNode - 1] = paths[i].pathLength;
		G[paths[i].endNode - 1][paths[i].startNode - 1] = paths[i].pathLength;
	}
}

//Dijkstra算法求最短路径
var s 	 = new Array();  	// 判断是否已存入该点到S集合中
var prev = new Array();		//记录当前结点的前一个结点
var dist = new Array();		//记录到各点的最短路径
function Dijkstra(n, v, G) {
	for(var i = 0; i < n; i++) {
		dist[i] = G[v][i];
		s[i] = false;     
		if(dist[i] == MAX_PATH_LENGTH) {
			prev[i] = 0;
		} else {
			prev[i] = v;
		}
	}
	dist[v] = 0;
	s[v] = true;

	// 依次将未放入S集合的结点中，取dist[]最小值的结点，放入结合S中
	// 一旦S包含了所有V中顶点，dist就记录了从源点到所有其他顶点之间的最短路径长度
	for(var i = 1; i < n; i++) {
		var tmp = MAX_PATH_LENGTH;
		var u = v;
		// 找出当前未使用的点j的dist[j]最小值
		for(var j = 0; j < n; j++) {
			if((!s[j]) && (parseInt(dist[j]) < tmp)) {
				u = j;              // u保存当前邻接点中距离最小的点的号码
				tmp = dist[j];
			}
		}
			
		s[u] = true;    // 表示u点已存入S集合中
						// 更新dist
		for(var j = 0; j < n; j++) {
			if((!s[j]) && (parseInt(G[u][j]) < MAX_PATH_LENGTH)) {
				var newdist = parseInt(dist[u]) + parseInt(G[u][j]);
				if(newdist < dist[j]) {
					dist[j] = newdist;
					prev[j] = u;
				}
			}
		}			
	}
}

//查找最短路径
function searchPaths(Prev, v, u) {
	var que = new Array(); //保存最短路线
	var tot = 0;
	que[tot] = u;
	tot++;
	var tmp = Prev[u];
	while (tmp != v) {
		que[tot] = tmp;
		tot++;
		tmp = Prev[tmp];
	}
	que[tot] = v;
	
	return que;
}

//最短路径查询
function queryPaths() {
	if(nodeNum < 2) {
		alert('请先设置景点和路径');
		return;
	}
	setOperationInfo('最短路径查询', START, END);
	$('queryrlt').style.display = 'block';
	createMatrix();
	Dijkstra(nodeNum, START - 1, G);
	var rlt = searchPaths(prev, START - 1, END - 1);
	if(dist[END - 1] == MAX_PATH_LENGTH) {
		$('minlength').innerHTML = '两景点之间没有线路';
		$('minpaths').innerHTML = '';
	} else {
		$('minlength').innerHTML = dist[END - 1];
		can.beginPath();
		can.lineWidth = '3';
		can.strokeStyle = "rgb(0, 255, 0)";
		for(var i = rlt.length, j = 0; i > j; i--) {
			$('minpaths').innerHTML += parseInt(rlt[i - 1]) + 1 + ', ';
			if(i == rlt.length) {				
				can.moveTo(sights[rlt[i - 1]].XPos, sights[rlt[i - 1]].YPos);			
			} else {
				can.lineTo(sights[rlt[i - 1]].XPos, sights[rlt[i - 1]].YPos);
				can.moveTo(sights[rlt[i - 1]].XPos, sights[rlt[i - 1]].YPos);	
			}
		}
		can.stroke();
		can.closePath();
		redrawNode();
	}	
}
