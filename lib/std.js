// import does not work yet wait for upcoming javascript versions
// import "lib/flot/jquery.js" 
// import "lib/flot/jquery.flot.js"
// import "lib/flot/jquery.flot.navigate.js"
// import "lib/plotter.js"

autoloader("lib/flot/jquery.js");
autoloader("lib/flot/jquery.flot.js");
autoloader("lib/flot/jquery.flot.navigate.js");
autoloader("lib/plotter.js");

runner.append({ '!S':createStandardelement,'!d':guiData ,'!c':csnData});
//,'!s':changeStandardelement

function parsedata(x){
    var ret={style:""}; //initilise return object including empty style string
    x = x.replace(/!!/g,'&#33;'); //double Exclamation mark escapes ! 
    var data=x.split('!');
    for(i in data){
        var aid = data[i][0];
        var aval = data[i].substr(1);
        switch(data[i][0]){
            case 'w'://width
                ret.style += ";width:"+aval;
                break;
            case 'h'://height
                ret.style += ";height:"+aval;
                break;
            case 's'://style
                ret.style += aval;
                break;
            case 'v'://value
                ret.value = aval;
                break;
            
        }
    }
    
    return ret;
}

function createStandardelement(x){
    //<element><ID><data>
    var element=x[0];
    var id=x.substr(1,2);
    var elementID="_SD_"+id;
    var data=parsedata(x.substr(3));
    switch(element){
        case 'l':
            //l linebreak
            HTMLappend("<br id=\""+elementID+"\" style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
        case 'b':
            //b Button _name 
            HTMLappend("<input id=\""+elementID+"\" value=\""+data.value+"\" type=\"button\""+
                        " onclick=\'sendframe(\"!g"+id+"\")\' style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:document.getElementById(elementID)}}();
            break;
        case 's':
            //s slider
            HTMLappend("<input id=\""+elementID+"\" value=\""+data.value+"\" type=\"range\"" + 
                    " min=0 max=255 onchange=\'sendframe(\"!g"+id+"\" + this.value)\'"+
                    " style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:document.getElementById(elementID)}}();
            break;
        case 'c':
            //c checkbox
            HTMLappend("<input id=\""+elementID+"\" type=\"checkbox\""+
                " onchange='sendframe(\"!g"+id+"\"this.value?\"t\":\"f\")\'"+
                " style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
        case 'M':
            //M moving graph
            var c = new plotcontainer();
            HTMLappend("<div id=\""+elementID+"\" style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            //apply defaut width and height if not set
            if (!elem.style.width) elem.style.width="100%";
            if (!elem.style.height) elem.style.height="20em";
            c.assign(elementID);
            //TODO inidizierte Daten?
            c.onupdate=c.plote;
            c.maxsize=data.value?data.value:100;
            c.plote();
            IDs[id]=function(){ return {element:elem,c:c,csndata:function(d){this.c.attach_data(d)}}}();
            break;
        case 'G':
            //G not moving garph
            var c = new plotcontainer();
            HTMLappend("<div id=\""+elementID+"\" style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            if (!elem.style.width) elem.style.width="100%";
            if (!elem.style.height) elem.style.height="20em";
            c.assign(elementID); 
            //TODO inidizierte Daten?
            c.onupdate=c.plote;
            c.plote();
            IDs[id]=function(){ return {element:elem,c:c,csndata:function(d){this.c.attach_data(d)}}}();
            break;
        case 't':
            //text input
            HTMLappend("<input id=\""+elementID+"\" type=\"text\""+
                    " onchange=\'sendframe(\"!g"+id+"\" + this.value)\' style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
        case 'd':
            HTMLappend("<div id=\""+elementID+"\""+
                    " style=\"display:inline-block;"+data.style+"\"></div>");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
    }
    //L Label _name
    //c checkbox
    //G FixedGraph 
    //M MovingGraph  _name _size 
    //s Slider _min _max
    //S SVG
}

function csnData(x){
    //tranforms comma seperated list of Numbers to an array 
    //calls csndata funtion of element (plots)
    //<element ID>,<CSNdata>
    var elementID=x.substr(0,2);
    var data=x.substr(2);
    var csndata =data.split(',');
    for(i in csndata){
        // for each value
        csndata[i] = Number(csndata[i]);
    }
    IDs[elementID].csndata(csndata);
}

function guiData(x){
    //calls data funtion of element 
    //<element ID>,<data>
    IDs[elementID].data(data);
}
