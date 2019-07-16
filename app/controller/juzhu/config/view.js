
function getView(FILE_NAME) {

  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=c9VzBGjpGifxq4HPKdyXHWxErdqpcI74"></script>
        <script type="text/javascript" src="http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js"></script>
        <title id="titlePage"></title>
        <script type="text/javascript" src="./data/${FILE_NAME}"></script>
        <style type="text/css">
        ul,
        li {
            list-style: none;
            margin: 0;
            padding: 0;
            float: left;
        }
        
        html {
            height: 100%
        }
        
        body {
            height: 100%;
            margin: 0px;
            padding: 0px;
            font-family: "微软雅黑";
        }
        
        #container {
            height: 650px;
            width: 100%;
        }
        
        #r-result {
            width: 100%;
        }
        #pageTopTitle{
            position: fixed;
            left:10px;
            right:10px;
            z-index: 1;
            color:#666;
            font-size:20px;
        }
        </style>
    </head>
    
    <body>
        <h3 id="pageTopTitle"></h3>
        <div id="container">
        </div>
        <div id="r-result">
            <input type="button" onclick="juzhuMap();" value="居住地" />
            <input type="number"  id="maxValueJuzhu"></input>
            <input type="button" onclick="changeMaxValueJuzhu()" value="调整居住参考值"></input><br/>
            <input type="button" onclick="changfangMap();" value="常访地" />
            <input type="number"  id="maxValueChangfang"></input>
            <input type="button" onclick="changeMaxValueChangfang()" value="调整常访参考值"></input>
            <input type="button" onclick="getPointer();" value="" id="cityValue" />
        </div>
    </body>
    
    </html>
    <script type="text/javascript">
    
    
    var changfangHeatMap = originObj.changfangData
    var juzhuHeatMap = originObj.juzhuData
    var juzhuMax = originObj.juzhumaxValue
    var changfangMax = originObj.changfangmaxValue
    var radius = originObj.radius
    var cirData = originObj.dataPointers
    var pointer = originObj.pointer
    
    
    
    var map = new BMap.Map("container"); // 创建地图实例
    var point = new BMap.Point(pointer.lng,pointer.lat); //初始化北京地图，设置中心点坐标和地图级别
    map.centerAndZoom(point, 12.4);
    map.enableScrollWheelZoom(); // 允许滚轮缩放
    
    
    function getPointes(heatData){
        var points = []
        for (var i = 0, len = heatData.length; i < len; i++) {
            var temp = heatData[i];
            var obj = {
                lng: temp[0],
                lat: temp[1],
                count: temp[2],
            }
            points.push(obj);
        }
        return points
    
    }
    
    
    if (!isSupportCanvas()) {
        alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
    }
    
    var heatmapOverlay = new BMapLib.HeatmapOverlay({
       "radius": radius,
    });
    map.addOverlay(heatmapOverlay);
    
    function changeMaxValueJuzhu (argument) {
        document.querySelector("#titlePage").innerText = pointer.name+'-居住地'
        document.querySelector("#pageTopTitle").innerText = pointer.name+'-居住地'
      var num = document.querySelector("#maxValueJuzhu").value;
      heatmapOverlay.setDataSet({
          data: getPointes(juzhuHeatMap),
            max: num
        });
    }
    function changeMaxValueChangfang (argument) {
     document.querySelector("#titlePage").innerText = pointer.name+'-常访地'
        document.querySelector("#pageTopTitle").innerText = pointer.name+'-常访地'
        var num = document.querySelector("#maxValueChangfang").value;
        heatmapOverlay.setDataSet({
        data: getPointes(changfangHeatMap),
        max: num
        });
    }
    
    document.querySelector("#maxValueJuzhu").value = juzhuMax
    document.querySelector("#maxValueChangfang").value = changfangMax
    
    function changfangMap(){
        document.querySelector("#titlePage").innerText = pointer.name+'-常访地'
        document.querySelector("#pageTopTitle").innerText = pointer.name+'-常访地'
        // document.getElementById("titlePage").innerText = '常访地'
        var _changfang = getPointes(changfangHeatMap)
        heatmapOverlay.setDataSet({
            data: _changfang,
            max: changfangMax
        });
    }
    
    function juzhuMap(){
        document.querySelector("#titlePage").innerText = pointer.name+'-居住地'
        document.querySelector("#pageTopTitle").innerText = pointer.name+'-居住地'
        // document.getElementById("titlePage").innerText='居住地'
        var _juzhu = getPointes(juzhuHeatMap)
        heatmapOverlay.setDataSet({
            data: _juzhu ,
            max: juzhuMax
        });
    }
    
    function getPointer() {
        var point = new BMap.Point(pointer.lng,pointer.lat);
        map.centerAndZoom(point, 11);
    }
    
    
    heatmapOverlay.show();
    
    //判断浏览区是否支持canvas
    function isSupportCanvas() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }
    
     if (document.createElement('canvas').getContext) {  // 判断当前浏览器是否支持绘制海量点
            var audiPoints = [];
            var benzPoints = [];
            var bmwPoints = [];
    
            var audiOptions = {
               color: '#bb0a3a'
            }
             var benzOptions = {
               color: '#3c4b4b'
            }
             var bmwOptions = {
               color: '#0033cc'
            }
            if(cirData&&cirData.length>0){
    
            
            for (var i = 0; i < cirData.length; i++) {
              if(cirData[i][2]=='audi'){
                audiPoints.push(new BMap.Point(cirData[i][0], cirData[i][1]));		
            }else if(cirData[i][2]=='benz'){
              benzPoints.push(new BMap.Point(cirData[i][0], cirData[i][1]));		
            }else if(cirData[i][2]=='bmw'){
            bmwPoints.push(new BMap.Point(cirData[i][0], cirData[i][1]));		
            }         
            }
    
           
            var audiPointCollection = new BMap.PointCollection(audiPoints, audiOptions);  // 初始化PointCollection
            var benzPointCollection = new BMap.PointCollection(benzPoints, benzOptions);  // 初始化PointCollection
            var bmwPointCollection = new BMap.PointCollection(bmwPoints, bmwOptions);  // 初始化PointCollection
            // pointCollection.addEventListener('click', function (e) {
              // alert('单击点的坐标为：' + e.point.lng + ',' + e.point.lat);  // 监听点击事件
            // });
            map.addOverlay(audiPointCollection);  // 添加Overlay
            map.addOverlay(benzPointCollection);  // 添加Overlay
            map.addOverlay(bmwPointCollection);  // 添加Overlay
            }
        } else {
            alert('请在chrome、safari、IE8+以上浏览器查看本示例');
        }
    
    
    window.onload=function(){
         changfangMap()
         document.querySelector("#cityValue").value = pointer.name
         document.querySelector("#titlePage").innerText = pointer.name+'-常访地'
         document.querySelector("#pageTopTitle").innerText = pointer.name+'-常访地'
    }
    </script>
    `;
}

module.exports = {
  getView,
};

