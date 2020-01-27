/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();
    
    
    function init() {
                
        themeManager.init();
        
        
            
        $("#btn_execute").click(function () {
            
            
            
            var posterizeVal=$("#posterize_num").val();
            var toneCurveVal=$("#toneCurve_num").val();
            //console.log('ボタンがクリックされました');
            csInterface.evalScript("cartoonizePhotos("+posterizeVal+","+toneCurveVal+")");
        });
    }
        
    init();

}());
    
