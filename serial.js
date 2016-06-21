// we need a sandbox to run eval in (no stringevaluation alowed here (CSP)
sandbox=document.getElementById("Sandbox").contentWindow;
window.addEventListener("message", receivefromSand, false);

function receivefromSand(event){
    //we got a letter from sandbox 
    if(sandbox==event.source){
        var msg=event.data;
        logger(1,msg.toString());
        if(msg.type=="raw") writeSerial(msg.data);
        else if(msg.type=="frame") sendArrayBuffer(prepareSerialFrame(msg.data));
    }
}

function sendtoSand(msg){
    // send a letter to sandbox
    try{
        sandbox.postMessage(msg,"*");
    }catch(e){
        v=e;
    }
}

var ports=null;

{
    function setportfromelem(e){
        document.getElementById("port").value =e.currentTarget.innerText;
    }
    function refreshports(){
        chrome.serial.getDevices(function(p) {
            //  console.log(ports[i].path);
            var list=document.getElementById('ports');
            list.innerHTML='';
            ports = p;
            for(var  i in ports ){
                e = document.createElement('div');
                e.innerText = ports[i].path;
                e.onclick= setportfromelem;
                //function(){var e=ports[i].path; return function(){document.getElementById("port").value = e;};}();
                list.appendChild(e);
            }
            if(document.getElementById("port").value=='' && ports.length >=1)document.getElementById("port").value=ports[0].path;
        });
    }
    window.setInterval(refreshports,1000);
}

{// setup baudratelist
    var baudrates=[110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200];
    var list=document.getElementById('rates');
    var setratefromclick = function (e){
        document.getElementById("rate").value =e.currentTarget.innerText;
    };
    for(var  i in baudrates ){
        e = document.createElement('div');
        e.innerText = baudrates[i];
        e.onclick = setratefromclick;
        list.appendChild(e);
    }
    if(document.getElementById("rate").value=='')
        document.getElementById("rate").value=57600;
}

{// setup toolslist
    var tools=[
        {   name:"stringformer",func:function(){
            chrome.app.window.create('stringformer.html', {
            'outerBounds': {'width': 800,'height': 600}
            });}
        },
        /*{   name:"debug",func:function(){
            chrome.app.window.create('debug.html', {
            'outerBounds': {'width': 800,'height': 600}
            });}
        },*/
        {   name:"debuglevel 0",func:function(){logging = 0;}},
        {   name:"debuglevel 1",func:function(){logging = 1;}},
        {   name:"debuglevel 2",func:function(){logging = 2;}},
        {   name:"debuglevel 3",func:function(){logging = 3;}},
        {   name:"debuglevel 4",func:function(){logging = 4;}},
        {   name:"debuglevel 5",func:function(){logging = 5;}},
        {   name:"send init frame",func:function(){
            sendArrayBuffer(prepareSerialFrame("!!"));}
        }
    ];
    var list=document.getElementById("tools");
    for(var i in tools ){
        e = document.createElement('div');
        e.innerText = tools[i].name;
        e.onclick = tools[i].func;
        list.appendChild(e);
    }
}

var connection = null;


// teletype framing no escaping 
//added escapping since no escaping bit me
var SOF = 0x01;
var EOF = 0x04;
var ESC = 0x10;
var ESCMASK =0x40;

var logging = 0;

var logger = function(lvl,msg){
    if(logging >= lvl) console.log(msg);
};

var frmstatus={no:{}, in:{}, esc:{}};

var receiverstatus = frmstatus.no;
var stringReceived = '';

var onReceiveCallback = function(info) {
    if (info.connectionId == connection.connectionId && info.data) {
        var bytes  = new Uint8Array(info.data);
        logger(3,String.fromCharCode.apply(null, bytes));
        for( var i in bytes ){
            var c = bytes[i];
            logger(5,String.fromCharCode(c));
            if(receiverstatus == frmstatus.in){
                if( c == SOF){
                    //lost a frame but go on with a new one
                    receiverstatus = frmstatus.in;
                    stringReceived = '';
                }else if( c == EOF){
                    //frame complete
                    logger(1,"rx Serial Frame: " + stringReceived);
                    sendtoSand(stringReceived);
                    stringReceived ='';
                    receiverstatus = frmstatus.no;
                }else if( c == ESC ){
                    receiverstatus = frmstatus.esc;
                    
                }else{
                    stringReceived += String.fromCharCode(c);
                }
            }else if(receiverstatus == frmstatus.esc){
                stringReceived += String.fromCharCode(ESC ^ ESCMASK);
                receiverstatus = frmstatus.in;
            }else if( receiverstatus == frmstatus.no){
                if( c == SOF){
                    // start a new frame
                    receiverstatus = frmstatus.in;
                    stringReceived = '';
                }
            }
        }
    }
};

chrome.serial.onReceive.addListener(onReceiveCallback);

var sendArrayBuffer= function (buf){
    chrome.serial.send(connection.connectionId, buf, function(){});
};

var prepareSerialFrame = function(str){
    logger(1,"tx Serial Frame: " + str);
    var buf = new ArrayBuffer(str.length*2+2);
    var bufView = new Uint8Array(buf);
    var bufi = 0;
    bufView[bufi] = SOF;
    bufi++;
    for (var i=0; i<str.length; i++) {
        var c = str.charCodeAt(i);
        if(c == SOF || c== EOF || c == ESC){
            bufView[bufi]=ESC;
            bufView[bufi]=c ^ ESCMASK;
            bufi+=2;
        }else{
            bufView[bufi]=c;
            bufi++;
        }
    }
    bufView[bufi] = EOF;
    return buf;
};

var writeSerial=function(str) {
    sendArrayBuffer(convertStringToArrayBuffer(str));
};

// Convert string to ArrayBuffer
var convertStringToArrayBuffer=function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
        bufView[i]=str.charCodeAt(i);
    }
    return buf;
};

function connect(){
    chrome.serial.connect(
        document.getElementById("port").value,
        {"bitrate":parseInt(document.getElementById("rate").value)},
        function(c){// connectionlight -> green
            connection=c;
            var l=document.getElementById("conlight");
            l.innerText="Connected";
            l.style.backgroundColor="green";
        });
};

function disconnect(){
    chrome.serial.disconnect(
        connection.connectionId,
        function(){// connectionlight -> red
            var l=document.getElementById("conlight");
            l.innerText="Disconnected";
            l.style.backgroundColor="red";
        }
    );
};


document.getElementById("conbtn").onclick=connect;
document.getElementById("disconbtn").onclick=disconnect;

{//setup connectionlight
    var l=document.getElementById("conlight");
    l.innerText="Disconnected";
    l.style.backgroundColor="red";
}
