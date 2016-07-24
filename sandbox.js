window.addEventListener("message", receiveMessage, false);
var host=null;
var IDs = [];

// contains / links to the runnner functions (used by receiveMessage
var runner={
    '!!':function(x){window.location="sandbox.html"}, // reload sandbox
    '!j':function(x){eval(x)},// evaluate as javascript
    '!w':function(x){workelement.e=x},// set workelment
    '!h':HTMLreplace, // replace current workelement's innerHTML
    '!H':HTMLappend,  // append to current workelement's innerHTML
     append:function (d){ for (i in d){ this[i] = d[i]}} // appends an object / dictionary to this
};


// workelement manages the current workelement which is the element that HTMLappend and HTMLreplace work on
var workelement={
    elem: null,
    setValue:function(x){ var a;
        if(!x) this.elem=null;
        else if(IDs[x]) this.elem = IDs[x].element;
        else if( a = document.getElementById(x) ) this.elem = a;
        else if( x instanceof Element )  this.elem = x;
        else throw new Error("workelement: " + x + " not found");
        return this.getValue();
    },
    getValue:function(){
        //default to document.body
        if(this.elem){
            return this.elem;
        }else
            return document.body;
    },
    // workelement.e gets the curret element if it's rvalue and sets current element if it's lvalue // usage see HTMLappend
    get e(){ return this.getValue()},
    set e(x){ this.setValue(x)}
}

// replaces the innerHTML of the current workelement
function HTMLreplace(x){
    workelement.e.innerHTML = x;
}

// creates an temporary div replaces its innerHTML and than transfers appends every node inside that div to the current workelement
function HTMLappend(x){
    //document.body.innerHTML += x; //wrong: replaces complete page whith itself and appended elements
    var d=document.createElement("div");
    d.innerHTML = x;
    //append each node
    var e = workelement.e;
    for(i = d.firstChild; i != d.lastChild;i = i.nextSibling)
        e.appendChild(i);
    e.appendChild(d.lastChild);
}

// interpretes Messages that are send to the sandbox
function receiveMessage(event){
    host=event.source;
    if( event.data.type=="frame"){
    try{
        msg = event.data.data
        var rid=msg.substring(0,2);
        var str=msg.substring(2);
        if(runner[rid]){
            runner[rid](str);
        }
        else{
            ERROR('unknown Runner: ' +rid )
        }
    } catch (e) {
        ERROR(e.toString() + "\nFrame: " +event.data);
        throw e
    }}
}

// sends a message to the Arduino using the hosts connection sendraw instucts the host to not pack a frame the message-string will be send byte by byte
function sendraw(msg){
    if (host) host.postMessage({type:"raw",data:msg},"*");
}

// sends a message to the Arduino using the hosts connection sendframe instucts the host to pack a frame
function sendframe(msg){
    if (host) host.postMessage({type:"frame",data:msg},"*");
}

function sendidandvalue(obj){
    sendframe(obj.id+':'+obj.value);
}

// displays a red div to show errors
function ERROR(msg){
    var id = "ERROID";
    elem = document.getElementById(id);
    if (!elem){
        elem = document.createElement('div');
        elem.id = id;
        elem.style.backgroundColor="red";
        elem.style.foregroundColor="white";
        elem.style.color="white";
        elem.style.position="fixed";
        elem.style.width="calc(100% - 5em)";
        elem.style.padding="2em";
        elem.style.bottom="10em";
        elem.onclick=function(){this.innerText='';this.style.display="none"}
        document.body.appendChild(elem);
    }
    elem.style.display = "block";
    elem.innerText += msg + '\n';
    var errors = elem.innerText.split('\n')
    //show first and last 5 lines
    if( errors.length > 10 ){
        var upr = errors.slice(0,4)
        var lowr = errors.slice(-5)
        elem.innerText=upr.join('\n')+'\n...\n'+lowr.join('\n')
    }
}

alert = ERROR; //use ERROR function to display alerts

//loads javascript-files by adding a script elemet to the head
//http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
function loadjsfile(filename, onload){
    var fileref=document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", filename);
    fileref.setAttribute("onload",onload);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

// does the same as loadjsfile for css files
function loadcssfile(filename){
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

// this serializes the loading of multible js files to avoid racecondition
autoloader = function(){
    var script = [];
    var i = 0;
    var running = false;
    return function(x,onload){
        if(typeof x == "string" ){
            if(onload)  x = [x,onload]
            else    x = [x,""]
        }
        if(typeof x == "object" ){
            var search = true;
            for( j in script ){
                if( script[j][0] == x[0]){
                    alert("found")
                    search = false;
                    break;
                }
            }
            if (search) script[script.length] = x;
        }else if(typeof x == "number" && i != x){
            i = x;
            if(i < script.length) loadjsfile(script[i][0],"autoloader("+ (i+1)+ ");"+script[i][1]);
            else running=false;
        }
        if(!running){
            running = true;
            if(i < script.length) loadjsfile(script[i][0],"autoloader("+ (i+1)+ ");"+script[i][1]);
            else running=false;
        }
    }
}();

// sounds a beep
function beep(){
    //sound a simple short annoying beep to create attention
    var actx = new AudioContext();
    var osc = actx.createOscillator();
    osc.connect(actx.destination);
    osc.frequency = 1000;
    osc.type = 'square';
    osc.start();
//     var f=function(){osc.stop(); delete actx;};
//     function(actx,osc){return }(actx,osc)
    end = Date.now()+200;
    while(Date.now() < end); //bussy wait setTimeout(function(){osc.stop(); actx.close();},200) since has some randomness
    osc.stop();
    actx.close();
}

autoloader("lib/shorthand.js");
