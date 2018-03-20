/** CSS 小妖精 組合腳本 for (PhotoShop Script)
 *    author :     Jax
 *  email :     weskerjax+dm@gmail.com
 *  website :     http://jax-work-archive.blogspot.com/
 *  history :    2010.09.01
 */
// css_sprite_ps-script.jsx
//#target photoshop 

/** 建立參考線
 * @param {Int} pixelOffSet 偏移像素
 * @param {String} orientation ["Vrtc" => 垂直 ,"Hrzn" => 水平]
 */
function makeGuide(pixelOffSet, orientation) {
    var id8 = charIDToTypeID( "Mk  " );
    var desc4 = new ActionDescriptor();
    var id9 = charIDToTypeID( "Nw  " );
    var desc5 = new ActionDescriptor();
    var id10 = charIDToTypeID( "Pstn" );
    var id11 = charIDToTypeID( "#Rlt" );
    desc5.putUnitDouble( id10, id11, pixelOffSet ); // integer
    var id12 = charIDToTypeID( "Ornt" );
    var id13 = charIDToTypeID( "Ornt" );
    var id14 = charIDToTypeID( orientation ); // "Vrtc", "Hrzn"
    desc5.putEnumerated( id12, id13, id14 );
    var id15 = charIDToTypeID( "Gd  " );
    desc4.putObject( id9, id15, desc5 );
      executeAction( id8, desc4, DialogModes.NO );
}



function readCorrespond(){
	var correspond=[];
    // 選擇參考的 CSS 名稱對應檔
    var mySavefile = File.openDialog("解析原始的  CSS 樣式檔","CSS Files:*.CSS");
    if(!mySavefile || !mySavefile.exists){return correspond};
	
    // 開啟檔案
    var fileRef = new File(mySavefile);
    if (!fileRef.open("r","","")){
        alert("無法開啟檔案！！");
    }else{
		var temp = '';
		/*過濾註解*/
		var styleString = fileRef.read().replace(/\/\*[^*]*\*\//gi,'');
		/*解析樣式區塊*/
		styleString.replace(/([^{}]+)\{([^}]+)\}/gi, function(i,name,style){
			name = name.replace(/^\s+|\s+$/g,'');
			var urlMatch=style.match(/url\(([^)]+)\)/i);
	        if(!name || !urlMatch || !urlMatch[1]){return;}
			var fileName = urlMatch[1].replace(/['"]/gi,'').split('/').pop()
	        if(!fileName){return;}
			
			correspond.push({'name':name,'file':fileName});
		});	
	}
    fileRef.close();
	return correspond;
}


function main(){
    //判斷是否有開啟圖檔
    if (app.documents.length == 0) {return;}

	var correspond = readCorrespond();
    var atDoc;
    var list = [];
    var length = app.documents.length;
	
    var fillColor = new SolidColor();
    fillColor.rgb.hexValue = 'FFFFFF';

    //新增目標圖片文件
    var newPic = app.documents.add(
        1, 1, 72,
        "css_sprite",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );
	
	

    var height=0;
    var width = newPic.width;
    //複製所有圖檔至新建立的圖檔
    for (var i=0; i<length; i++){
        //選定要操作的圖檔
        atDoc=app.activeDocument=app.documents[i];
		
        //新增圖層
        var aLayer = atDoc.activeLayer=atDoc.artLayers.add();
        //複製背景底圖
        try {
            atDoc.backgroundLayer.duplicate(aLayer,ElementPlacement.PLACEAFTER);
            atDoc.backgroundLayer.remove();
        } catch (e){}
        //將新圖層與下一層互換
        aLayer.move(atDoc.layers[1],ElementPlacement.PLACEAFTER);
        //標註四周的定位點
        var w=atDoc.width.value, h=atDoc.height.value;
	    atDoc.selection.select([
			[1,0],[1,1],[0,1],
			[0,h-1],[1,h-1],[1,h],
			[w-1,h],[w-1,h-1],[w,h-1],
			[w,1],[w-1,1],[w-1,0],
			[1,0]
		]);
	    atDoc.selection.invert(); //反向選取
	    atDoc.selection.fill(fillColor,ColorBlendMode.NORMAL,1);// 填滿	
        atDoc.mergeVisibleLayers(); //合併可見圖層
		
		
		
        //複製圖層
        atDoc.selection.selectAll()
        atDoc.selection.copy()
		//核對記錄圖片定位資訊
		var point=null;
	    for (var j=0,l=correspond.length; j<l; j++){
			if(correspond[j].file!=atDoc.name){continue;}
			correspond[j].height=atDoc.height.value; 
			point=j; break;
		}
		//新增圖片定位資訊
		if(point===null){ 
			correspond.push({'name':atDoc.name,'file':atDoc.name,'height':atDoc.height.value}); 
			point=j; 
		}
		
        //累計高度
        height += atDoc.height.value;
        //最大寬度
		if(width < atDoc.width){ width=atDoc.width; }

		
        //貼上圖層
        atDoc=app.activeDocument=newPic;
        correspond[point].layer = atDoc.paste();
        correspond[point].layer.name = correspond[point].file;
    };



    //關閉複製過的檔案
    for (var i=length; i--;){
        app.documents[i].close(SaveOptions.DONOTSAVECHANGES);
    };


    atDoc=app.activeDocument=newPic;
    atDoc.resizeCanvas(width,height,AnchorPosition.TOPLEFT); //變更圖片大小
	
    //變更圖層定位
	var top=0;
    for (var i=0,l=correspond.length; i<l; i++){
		if(correspond[i].layer===undefined){continue;}
        //記錄定位
	    for (var j=0,l=correspond.length; j<l; j++){
			if(correspond[j].file!=correspond[i].file){continue;}
	        correspond[j].top=top;
		}		
        correspond[i].layer.translate(0,top); //移動圖層
        if(top>0){ makeGuide(top,"Hrzn"); } //建立參考線
		top+=correspond[i].height; //定位累計
    };



    // 輸出 CSS 定位檔
    var mySavefile = File.saveDialog("輸出 CSS 定位檔","CSS Files:*.CSS");
    if(!mySavefile){return};
    if(mySavefile.exists && !confirm("你確定要覆蓋這個檔案？")){return;}
    // 開啟檔案
    var fileRef = new File(mySavefile);
    if (!fileRef.open("w","","")){
        alert("無法開啟檔案！！");
    }else{
	    // 輸出 CSS 定位設定
	    for (var i=0,l=correspond.length; i<l; i++){
			if(correspond[i].top===undefined){continue;}
	        fileRef.writeln(
				correspond[i].name+'{ background-position: 0 -'+correspond[i].top+'px; }'
			);
		}	
	}
    fileRef.close();
}




//把Photoshop推到最上層
app.bringToFront();
//設定使用的單位為「像素(Pixel)」
app.preferences.rulerUnits = Units.PIXELS;
//執行主程式
main();

alert('成功執行！');

