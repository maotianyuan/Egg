
function getView(FILE_NAME) {

  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
      <script type="text/javascript" src="http://test.oainsight.zebra-c.com/lib/core/jquery-1.10.2.min.js?_=1517278420871"></script>
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
          <input type="number"  id="maxValueJuzhu"></input>
          <input type="button" onclick="changeMaxValueFanYu()" value="调整广州番禺总体参考值"></input><span style="padding:0 10px;"></span>
          <input type="button" onclick="changeMaxValueFanYu('A')" value="调整广州番禺A参考值"></input><span style="padding:0 10px;"></span>
          <input type="button" onclick="changeMaxValueFanYu('B')" value="调整广州番禺B参考值"></input><span style="padding:0 10px;"></span>
          <input type="button" onclick="changeMaxValueFanYu('C')" value="调整广州番禺C参考值"></input><span style="padding:0 10px;"></span>
          <input type="button" onclick="changeMaxValueFanYu('D')" value="调整广州番禺D参考值"></input><span style="padding:0 10px;"></span>
          

          <input type="number"  id="maxValueChangfang"></input>
          <input type="button" onclick="changeMaxValueHuiJun()" value="调整广州汇骏总体参考值"></input>



      </div>
  </body>
  
  </html>
  <script type="text/javascript">

  var ObjeHandler = {
    init(){
        this.createIpt()
        this.action()
    },
    action () {
        var _this = this
        $("#inputWrap").on('click', '.ipt', function() {
            var i = $(this).index()
            _this.mapData = originObj[i]
            console.log(_this.mapData)
        })
    },
    createIpt () {
        var btnStr = '';
        for(var item of originObj){
            btnStr += '<input class="ipt" data-type="" type="button" value="'+item.pointer.nameHtml+'"></input>'
        }
        $('#inputWrap').append(btnStr);
    },
}
// console.log(originObj)
ObjeHandler.init()
  console.log(originObj)
  
  var huijunHeatMap = originObj.huijunData
  var fanyuHeatMap = originObj.fanyuData
  var fanyuMax = originObj.fanyumaxValue
  var huijunMax = originObj.huijunmaxValue
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
  
  function changeMaxValueFanYu (type = '') {
      document.querySelector("#titlePage").innerText = pointer.name + '-广州番禺'
      document.querySelector("#pageTopTitle").innerText = pointer.name+'-广州番禺'
    var num = document.querySelector("#maxValueJuzhu").value;
    var key = 'fanyuData' + type
    heatmapOverlay.setDataSet({
        data: getPointes(fanyuHeatMap+originObj[key]),
          max: num
      });
  }
  function changeMaxValueHuiJun (argument) {
   document.querySelector("#titlePage").innerText = pointer.name+'-广州汇骏'
      document.querySelector("#pageTopTitle").innerText = pointer.name+'-广州汇骏'
      var num = document.querySelector("#maxValueChangfang").value;
      heatmapOverlay.setDataSet({
      data: getPointes(huijunHeatMap),
      max: num
      });
  }
  
  document.querySelector("#maxValueJuzhu").value = fanyuMax
  document.querySelector("#maxValueChangfang").value = huijunMax
  
  function changfangMap(){
      document.querySelector("#titlePage").innerText = pointer.name+'-广州汇骏'
      document.querySelector("#pageTopTitle").innerText = pointer.name+'-广州汇骏'
      // document.getElementById("titlePage").innerText = '广州汇骏'
      var _changfang = getPointes(huijunHeatMap)
      heatmapOverlay.setDataSet({
          data: _changfang,
          max: huijunMax
      });
  }
  
  function juzhuMap(){
      document.querySelector("#titlePage").innerText = pointer.name+'-居住地'
      document.querySelector("#pageTopTitle").innerText = pointer.name+'-居住地'
      // document.getElementById("titlePage").innerText='居住地'
      var _juzhu = getPointes(fanyuHeatMap)
      heatmapOverlay.setDataSet({
          data: _juzhu ,
          max: fanyuMax
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
    //    document.querySelector("#titlePage").innerText = pointer.name+'-广州汇骏'
    //    document.querySelector("#pageTopTitle").innerText = pointer.name+'-常访地'
  }
  </script>
  `;
}

module.exports = {
  getView,
};
