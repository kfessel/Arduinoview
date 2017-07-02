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
            HTMLappend("<input id=\""+elementID+"\" value=\""+data.value+"\"  type=\"button\""+
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
                " onchange='sendframe(\"!g"+id+"\"+this.value?\"t\":\"f\")'"+
                " style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
        case 'M':
            alert("Moving graph M is deprecated use Graph G");
            data.value=data.value?data.value:100;
        case 'G':
            //G graph containig upto 1000 values by default
            //set number of values by giving value (v...)
            //if number of values is 0 it will be not moving
            //!SGv100 Graph with 100 values
            //!SGv0 Graph with inf values -> not moving
            var c = new plotcontainer();
            HTMLappend("<div id=\""+elementID+"\" style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            //apply defaut width and height if not set
            if (!elem.style.width) elem.style.width="100%";
            if (!elem.style.height) elem.style.height="20em";
            c.assign(elementID);
            //TODO inidizierte Daten?
            c.onupdate=c.plote;
            c.maxsize=data.value?data.value:1000;
            c.plote();
            IDs[id]=function(){ return {element:elem,c:c,data:function(d){this.c.attach_data(uncsn(d))},csndata:function(d){this.c.attach_data(d)}}}();
            break;
        case 't':
            //text input
            HTMLappend("<input id=\""+elementID+"\" value=\""+data.value+"\"  type=\"text\""+
                    " onchange=\'sendframe(\"!g"+id+"\" + this.value)\' style=\""+data.style+"\">");
            var elem=document.getElementById(elementID);
            IDs[id]=function(){ return {element:elem}}();
            break;
        case 'k':
            // keyevent
            // TODO filter repitition, select event to listen to
            var w=workelement.e;
            if( w.tabIndex < 0 ) w.tabIndex=0;
            var keyf = function(e){
                var msg = "!g"+id
                if(!e.repeat){
                    if( e.type == "keydown")  msg += "d";
                    if( e.type == "keyup")    msg += "u";
                    if( e.type == "keypress") msg += "p";
                    sendframe(msg + e.key);
                }
            }
            if(!data.value) data.valu = "p";
            if(data.value.includes("d"))w.addEventListener("keydown", keyf);
            if(data.value.includes("p"))w.addEventListener("keypress", keyf);
            if(data.value.includes("u"))w.addEventListener("keyup", keyf);
            break;
        case 'd':
            // inline-block div
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
    //may be deprecated
    //tranforms comma seperated list of Numbers to an array
    //calls csndata funtion of element (plots)
    //<element ID><CSNdata>
    var elementID=x.substr(0,2);
    var data=x.substr(2);
    var csndata =data.split(',');
    for(i in csndata){
        // for each value
        csndata[i] = Number(csndata[i]);
    }
    IDs[elementID].csndata(csndata);
}

function uncsn(x){
    var csndata =x.split(',');
    for(i in csndata){
        // for each value
        csndata[i] = Number(csndata[i]);
    }
    return csndata;
}

function guiData(x){
    //calls data funtion of element
    //<element ID><data>
    var elementID=x.substr(0,2);
    var data=x.substr(2);
    IDs[elementID].data(data);
}
