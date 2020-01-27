/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/
//グローバル変数で保存
//諧調


function cartoonizePhotos(posterizeVal,toneCurveVal){

    //ラスタライズ処理を行う。
    processRasterize();
    
    var originalLayer=activeDocument.activeLayer;
    
    //オリジナルはいつでも複製できるように非表示にしておく。
    originalLayer.visible=false;
    
    var lineLayer=originalLayer.duplicate();
    lineLayer.name="LineLayer";
    
    var drawLayer=originalLayer.duplicate();
    drawLayer.name="DrawLayer";
    setDrawLayer(drawLayer,posterizeVal);
    
 　　
    activeDocument.activeLayer=lineLayer;
    
    //ポスタリゼーション処理（3諧調
    processPosterize(posterizeVal);//入力値を操作できるようにする
    
    //トーンカーブの処理を行う。（マスタチャネルを操作する
    var ms= { ch: 'MS', pt: [ [0,0],[toneCurveVal,255.0], [255.0,255.0] ] }
    processToneCurve(ms);
    
    //色相変更
    var set= { heu: 1, strt: -100, lght: 0 }
    processHueSaturation(false, set);
    

    //すべて選択
    activeDocument.selection.selectAll();
    //コピー
    lineLayer.copy();
    //マスクの作成
    createActiveLayerMask();
    //マスクチャネルをオンにする
    showActiveLayerChannelMask();
    //マスクにコピーをペーストする
    pasteMask();
    //マスクを反転する
    invertActiveLayer();
    //選択の解除
    activeDocument.selection.deselect();
    
　　//マスクからそのもののレイヤーへカーソル移動　
    selectRgb();

    
    //トーンレイヤーも上記の処理を繰り返すのでこのタイミングで作成する。
    var toneLayer=lineLayer.duplicate();
    toneLayer.name="ToneLayer";
    
    //トーンのみの処理
    activeDocument.activeLayer=toneLayer;
    
    //ガウス処理
    processGausBlur(3);
     //ハーフトーン処理
    processColorHalftone(4,0,0,0,0);
    
    //グループにし、マスクを結合する
    var lineLayerSet=createLayerSet(lineLayer.name);
    lineLayer.move(lineLayerSet,ElementPlacement.PLACEATEND);
    lineLayer=concatMaskgroup();
    
    var toneLayerSet=createLayerSet(toneLayer.name);
    toneLayer.move(toneLayerSet,ElementPlacement.PLACEATEND);
    toneLayer=concatMaskgroup();

    //今までのレイヤーを一つのレイヤーセットにまとめる
    var resultLayerSet=createLayerSet("ResultLayerSet");
    originalLayer.move(resultLayerSet,ElementPlacement.PLACEATBEGINNING);
    drawLayer.move(resultLayerSet,ElementPlacement.PLACEATBEGINNING);
    toneLayer.move(resultLayerSet,ElementPlacement.PLACEATBEGINNING);
    lineLayer.move(resultLayerSet,ElementPlacement.PLACEATBEGINNING);
}

//塗りレイヤーを作成する
function setDrawLayer(layerObj,posterizeVal){
    activeDocument.activeLayer=layerObj;
    //ポスタリゼーション3諧調
    processPosterize(posterizeVal);
    //色相変更
    var set= { heu: 1, strt: -100, lght: 0 }
    processHueSaturation(false, set);
    //ガウス処理を行う
    processGausBlur(1);
}

// ぼかし（ガウス）を処理する 
function processGausBlur (rds) {
    var actDesc= new ActionDescriptor();
    actDesc.putUnitDouble( charIDToTypeID('Rds '), charIDToTypeID('#Pxl'), rds ); //半径
    executeAction( charIDToTypeID('GsnB'), actDesc, DialogModes.NO );
}
function selectRgb(){
    var idslct = charIDToTypeID( "slct" );
    var desc26 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref6 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idRGB = charIDToTypeID( "RGB " );
        ref6.putEnumerated( idChnl, idChnl, idRGB );
    desc26.putReference( idnull, ref6 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc26.putBoolean( idMkVs, false );
executeAction( idslct, desc26, DialogModes.NO );
}
// カラーハーフトーン
function processColorHalftone (rds, ch1, ch2, ch3, ch4) {
    var actDesc= new ActionDescriptor();
    actDesc.putInteger( charIDToTypeID('Rds '), rds ); // 最大半径
    actDesc.putInteger( charIDToTypeID('Ang1'), ch1 ); // チャンネル1
    actDesc.putInteger( charIDToTypeID('Ang2'), ch2 ); // チャンネル2
    actDesc.putInteger( charIDToTypeID('Ang3'), ch3 ); // チャンネル3
    actDesc.putInteger( charIDToTypeID('Ang4'), ch4 ); // チャンネル4
    executeAction( charIDToTypeID('ClrH'), actDesc, DialogModes.NO );
}

//  トーンカーブ
function processToneCurve () {
    var setPoint= function (pt){
        var desc = new ActionDescriptor();
        desc.putDouble( charIDToTypeID('Hrzn'), pt[0] ); // X座標
        desc.putDouble( charIDToTypeID('Vrtc'), pt[1] ); // Y座標
        return desc;
    }
    var subDesc= function (prop){
        var channel= {'MS':'Cmps', 'RD':'Rd  ', 'GR':'Grn ', 'BL':'Bl  ', 'CY':'Cyn ', 'MG':'Mgnt', 'YW':'Yllw', 'K':'Blck', 'GY':'Trgt', 'L':'Lght', 'A':'A   ', 'B':'B   ' };
        var desc= new ActionDescriptor();
        var ref= new ActionReference();
        if (channel=='GY') {
             ref1.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
        } else {
            ref.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID( channel [prop.ch] ) );
        }
        desc.putReference( charIDToTypeID('Chnl'), ref );
        var crv= new ActionList();
        for (var i=0; i < prop.pt.length; i++) {
            crv.putObject( charIDToTypeID('Pnt '), setPoint( prop.pt[i] ) );
        }
        desc.putList( charIDToTypeID('Crv '), crv );
        return desc;
    } 
    var cList= new ActionList();
    if (arguments.length == 0) {
        // 自動補正
        var desc= new ActionDescriptor();
        var ref= new ActionReference();
        ref.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Cmps') );
        desc.putReference( charIDToTypeID('Chnl'), ref );
        desc.putBoolean( stringIDToTypeID('autoMachineLearning'), true );
        desc.putBoolean( stringIDToTypeID('autoFaces'), true );
        cList.putObject( charIDToTypeID('CrvA'), desc );
    } else {
        // チャンネルの数だけ繰り返す
        for (var i=0; i < arguments.length; i++) {
            cList.putObject( charIDToTypeID('CrvA'), subDesc( arguments[i] ) );
        }
    }
    var actDesc= new ActionDescriptor();
    actDesc.putList( charIDToTypeID('Adjs'), cList );
    executeAction( charIDToTypeID('Crvs'), actDesc, DialogModes.NO ); 
}

//ポスタリゼーション
function processPosterize (level) {
    var actDesc= new ActionDescriptor();
    actDesc.putInteger( charIDToTypeID('Lvls'), level );
    executeAction( charIDToTypeID('Pstr'), actDesc, DialogModes.NO );
}

//アクティブレイヤーを反転させる
function invertActiveLayer(){
    var idInvr = charIDToTypeID( "Invr" );
executeAction( idInvr, undefined, DialogModes.NO );
}

//マスクチャネルを表示
function showActiveLayerChannelMask(){
    var idShw = charIDToTypeID( "Shw " );
    var desc5 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var list1 = new ActionList();
            var ref2 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref2.putEnumerated( idChnl, idOrdn, idTrgt );
        list1.putReference( ref2 );
    desc5.putList( idnull, list1 );
executeAction( idShw, desc5, DialogModes.NO );
}

//マスクにコピーをペーストする
function pasteMask(){
    
    var idpast = charIDToTypeID( "past" );
    var desc7 = new ActionDescriptor();
    var idAntA = charIDToTypeID( "AntA" );
    var idAnnt = charIDToTypeID( "Annt" );
    var idAnno = charIDToTypeID( "Anno" );
    desc7.putEnumerated( idAntA, idAnnt, idAnno );
    var idAs = charIDToTypeID( "As  " );
    var idPxel = charIDToTypeID( "Pxel" );
    desc7.putClass( idAs, idPxel );
executeAction( idpast, desc7, DialogModes.NO );
}

//レイヤーグループ(レイヤーセット)の作成
function createLayerSet(layerSetName){
    var layObjs=activeDocument.artLayers;
    var laySetObj= activeDocument.layerSets.add();
    laySetObj.name= layerSetName;
     return laySetObj;
}

//すべてのレイヤーをグループに格納する
function addAllLayerInLayerSet(laySetObj){
     var layObjs=activeDocument.artLayers;
        //直下にある対象レイヤーをグループに格納する
    for(var i = 0;  i < layObjs.length;  i++){
        if(layObjs[i].allLocked==false&&layObjs[i].typename=="ArtLayer"){
            layObjs[i].duplicate(laySetObj,ElementPlacement.PLACEATEND);         
        }     
    } 
}

//マスクの作成
function createActiveLayerMask(){
    var idMk = charIDToTypeID( "Mk  " );
    var desc2 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    desc2.putClass( idNw, idChnl );
    var idAt = charIDToTypeID( "At  " );
        var ref1 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idAt, ref1 );
    var idUsng = charIDToTypeID( "Usng" );
    var idUsrM = charIDToTypeID( "UsrM" );
    var idRvlA = charIDToTypeID( "RvlA" );
    desc2.putEnumerated( idUsng, idUsrM, idRvlA );
executeAction( idMk, desc2, DialogModes.NO );
}

//グループをマスクごと結合
function concatMaskgroup(){
    var layer =activeDocument.activeLayer;
if(layer.typename == 'LayerSet') {
    var layerName= activeDocument.activeLayer.name;
    var layerSetObj= activeDocument.layerSets[layerName];
    var newLayer= layerSetObj.merge();
    newLayer.name= layerName;
    return newLayer;
}else {
    alert("グループを選択してね");
    return layer;
}
}

//色相・彩度
function processHueSaturation (colorize) {
    var subDesc= function (f, c, prop){
        var desc= new ActionDescriptor();
        if (prop.range && f) {
            desc.putInteger( charIDToTypeID('LclR'), c );
            desc.putInteger( charIDToTypeID('BgnR'), prop.range[0] ); // 左外側
            desc.putInteger( charIDToTypeID('BgnS'), prop.range[1] ); // 左内側
            desc.putInteger( charIDToTypeID('EndS'), prop.range[2] ); // 右内側
            desc.putInteger( charIDToTypeID('EndR'), prop.range[3] ); // 右外側
        }
        desc.putInteger( charIDToTypeID('H   '), prop.heu ); // 色相
        desc.putInteger( charIDToTypeID('Strt'), prop.strt ); // 彩度
        desc.putInteger( charIDToTypeID('Lght'), prop.lght ); // 明度
        return desc;
    }
    var cnt=0;
    var rList= new ActionList();
    if (colorize) {
        rList.putObject( charIDToTypeID('Hst2'), subDesc( false, cnt, arguments[1] ) );
    } else {
        for (var i=1; i < arguments.length; i++) {
            if (arguments[i].range) {cnt++}
            rList.putObject( charIDToTypeID('Hst2'), subDesc( true, cnt, arguments[i] ) );
            if ( i==7 ) {break;}
        }
    }
    var actDesc= new ActionDescriptor();
    actDesc.putList( charIDToTypeID('Adjs'), rList );
    actDesc.putBoolean( charIDToTypeID('Clrz'), colorize ); // 色彩の統一
    executeAction( charIDToTypeID('HStr'), actDesc, DialogModes.NO );
}

//ラスタライズ
function processRasterize(){
    var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1.putEnumerated( idLyr, idOrdn, idTrgt );
    desc3.putReference( idnull, ref1 );
executeAction( idrasterizeLayer, desc3, DialogModes.NO );
}
