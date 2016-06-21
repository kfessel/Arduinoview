 function plotcontainer(){
     this.store=[];
     this.onupdate=undefined;
     this.plottarget=undefined;
     this.maxsize=undefined;
     this.attach_data = function (d){
         //data == []
         for(i in d){
             if(this.store[i]){
                 this.store[i].push(d[i]);
             }else{
                 this.store[i]=[d[i]];
             }
         }
         if(this.maxsize > 0){
             for(i in this.store){
                 begin = this.store[i].length - this.maxsize;
                 if( begin > 0 ){
                     for(j in this.store[i]){
                         if (j < begin){
                             this.store[i][j]=undefined
                         }
                     }
                 }
             }
         }
         if (this.onupdate) this.onupdate();
     };
     this.enumdata = function(datas){// all values enumerate
         var ds=[]
         for( i in datas ){
             ds.push([])
             for(j in datas[i]){
                 if(datas[i][j] !== undefined)
                     ds[i].push([j,datas[i][j]])
             }
         }
         return ds;
     }
     this.connectdata = function(datas){
         var ds=[]
         for( i in datas ){
             if(i != 0){ ds.push([])
                 for(j in datas[i]){
                     if(datas[i][j] !== undefined)
                         ds[i-1].push([datas[0][j],datas[i][j]])
                 }
             }
         }
         return ds;
     }
     this.plotconfig={
         zoom: {
             interactive: true
         },
         pan: {
             interactive: true
         }
     };
     this.autofit=true;
     this.datamorph=this.enumdata;
     var plothelp=function(self){
         timeout= null;
         self.doplot = function(){
             if (timeout) { //clear timeout
                 clearTimeout(timeout);
                 timeout = null;
             }
             var plotconfig = self.plotconfig;
             if(self.plotobj && !self.autofit){
                 plotconfig=self.plotobj.getOptions();
             }
             self.plotobj = $.plot('#'+ self.plottarget,self.datamorph(self.store),plotconfig);
         }
         // self plot waits 300 ms do accumulate futher data before doing the plot
         self.plot=function(){
             if(!timeout) timeout = setTimeout(function(self){return function(){ self.doplot()}}(self),300);
         }
     }(this)
     this.plote = function() {
         this.datamorph=this.enumdata
         this.plot();
     };
     this.plotc = function() { 
         this.datamorph=this.connectdata;
         this.plot();
     };
     this.place = function( elem, style, target) {
         //initalise not initialiesed values
         if(!elem)   elem = document.body;
         if(!style)  style = "width:100%;height:20em;";
         if(!target) target = "T" + Math.round(Math.random()*2000);
         this.plottarget = target;
         (elem).innerHTML+='<div id="'+ this.plottarget + '" style="' + style + '"></div>'
     }
     this.assign=function (target){
         window.addEventListener("resize",function(x){var self=x; return function(){self.plot()};}(this))
         this.plottarget = target;
     }
 }; 
 