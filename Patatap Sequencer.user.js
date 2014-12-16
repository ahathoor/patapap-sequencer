// ==UserScript==
// @name         Patatap Sequencer
// @namespace    n
// @version      0.1
// @description  Sequencer for patatap.com
// @author       Mikko Tamminen
// @match        http://www.patatap.com/
// @grant        none
// ==/UserScript==

function simulateKeyPress(character) {
    var e = jQuery.Event("keydown");
    e.which = character.toUpperCase().charCodeAt(0);
    $(window).trigger(e);
}

function doit() {
    simulateKeyPress("W");
}

seqSteps = 12;
seqInterval = 100;
seqCurrentStep = 0;
seqPlaying = false;

function step(s) {
    seqCurrentStep = s%seqSteps;
    for (var i=0; i<26; i++) {
        var rowChar = String.fromCharCode('A'.charCodeAt(0) + i);
        if (seqField[rowChar] && seqField[rowChar][s] === 1)
        	simulateKeyPress(rowChar);
        if($(seqWin['seqElement_' + rowChar + '_' + s]).css('border-color') === 'rgb(255, 127, 80)')
        	$(seqWin['seqElement_' + rowChar + '_' + s]).css('border-color','rgb(20, 127, 80)');
        else 
        	$(seqWin['seqElement_' + rowChar + '_' + s]).css('border-color','rgb(255, 127, 80)');            
    }
    if(seqPlaying)
    	setTimeout(function() { step( (s+1)%seqSteps ) }, seqInterval);
}


seqPlay = function() {
    if(!seqPlaying) {
        seqPlaying = true;
		step(0);
    } else {
    	seqPlaying = false;
        setTimeout(function() { $(".element",seqWin.document).css('border-color','rgb(255, 127, 80)'); }, seqInterval); //recolor boxes
    }
}

seqRun = function() {
    
    //Initialize the sequencer memory
    seqField = {};
    for (var i=0; i<26; i++) {
        var rowChar = String.fromCharCode('A'.charCodeAt(0) + i);
        seqField[rowChar] = [];
        for(var j=0; j<seqSteps; j++) {
            seqField[rowChar].push(0);
        }
    }
    //draw the window
    seqWin = window.open('','Sequencer','width=500,height=500');
    seqWin.document.open();
    function write(x) { seqWin.document.write(x); }
    
    write("<style>" +
          "* {" +
          "  box-sizing: border-box;" +
          "  }" +
          ".row {" +
          "  display: flex;" + 
          "  background-color: white;" +
          "  height: 40px;" +
          "  align-items: center;" +
          "  }" +
          ".element {" +
          "  border: 1px solid coral;" +
          "  border-color: coral;" +
          "  background-color: white;" +
          "  margin: auto;" +
          "  width: 40px;" +
          "  height: 70%;" +
          "  text-align: center;" +
          "  font-size: 12px;" +
          "  color: gray;" +
          "  line-height: 30px;" +
          "  }" +
          ".float {" +
          "  width: 20px;" + 
          "  text-align: center;" +
          "  }" +
          "#hoverTag {" +
          "  position: absolute;" +
          "  top: 0px;" +
          "  left: 0px;" +
          "  background-color: wheat;" +
          "  border: 1px solid #101010;" + 
          "  }" +
          "</style>");
    
    
    for (var i=0; i<26; i++) {
        var rowChar = String.fromCharCode('A'.charCodeAt(0) + i);
        
        
        write('<div class=row id=seqRow' + rowChar + '>');
        write('<span class=float>' + rowChar + '</span>');
        if (i % 2 === 0)
        	$('#seqRow' + rowChar, seqWin.document).css('background-color','#F0F0F0');
        
        //Create sixteen buttons per row
        for(var j=0; j<seqField[rowChar].length; j++) {
            
            //Create the individual button
            var elementId = 'seqElement_' + rowChar + '_' + j;
            write('<span class=element id=' + elementId + '>' + j);
            write('</span>');
            
            //Attach clickhandler to button
            $(seqWin[elementId]).click(function(event) {
                var tmp = event.target.id.split('_');
                var char = tmp[1];
                var number = tmp[2];
                
                if (seqField[char][number] === 0) {
                    seqField[char][number] = 1;
                	$(event.target).css('background-color','coral');
                } else {
                    seqField[char][number] = 0;
                	$(event.target).css('background-color','white');
                }
            });
            $(seqWin[elementId]).mouseenter(function(event) {
                
                var tmp = event.target.id.split('_');
                var char = tmp[1];
                var number = tmp[2];
                
                $('#hoverTag',seqWin.document).text(char + " " + number);
                $('#hoverTag',seqWin.document).css('top', event.pageY + 10);
                $('#hoverTag',seqWin.document).css('left', event.pageX + 10);
                $('#hoverTag',seqWin.document).show();
            }).mouseleave( function() {
                $('#hoverTag',seqWin.document).hide();
            });
        }
        write('</div>');
    }
    
    //REC handler
    $(seqWin).keydown(function(event) {
    	var char = String.fromCharCode(event.keyCode);
        var number = seqCurrentStep;
        if (seqField[char] !== undefined) {
            if (seqField[char][number] === 0) {
                seqField[char][number] = 1;
                $('#seqElement_' + char + '_' + number, seqWin.document).css('background-color','coral');
            } else {
                seqField[char][number] = 0;
                $('#seqElement_' + char + '_' + number, seqWin.document).css('background-color','white');
            }
        }
        if(event.keyCode === 32) {
        	seqPlay();
        }
    });
    
    //Draw the controls
    write('<br><input type=button value=play/pause id=playPause>');
    $(seqWin['playPause']).click(function() {
        seqPlay();
    });
    
    write('step interval (ms):');
    
    write('<input type=text value=' + seqInterval + ' id=stepLength>');
    $(seqWin['stepLength']).change(function(ev) {
        seqInterval = ev.target.value;
    });
    
    write('Steps:');
    
    write('<input type=text value=' + seqSteps + ' id=stepCount>');
    $(seqWin['stepCount']).change(function(ev) {
        seqSteps = ev.target.value;
        seqRun();
    });
    
    
    write('<span id=hoverTag></span>');
}

$(seqRun);
