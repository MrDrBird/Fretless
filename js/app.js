// PROJECT TODOS

// CHORD SAVING
// fix fret count padding/margin

//const board = document.querySelector('#board');
const saveChordBtn = document.querySelector('#saveChordBtn');
const highlightedNoteDisp = document.querySelector('#highlightedNoteDisp');
const resetChordBtn = document.querySelector('#resetChordBtn');
const stringsDisp = document.querySelector('#stringsDisp');
const fretCountDisp = document.querySelector('#fretCountDisp');
const tuningManager = document.querySelector('#tuningManager');
const stringCountSelect = document.querySelector('#stringCountSelect');
const fretLowBtn = document.querySelector('#fretLowBtn');
const fretHighBtn = document.querySelector('#fretHighBtn');
const savedChordsDisp = document.querySelector('#savedChordsDisp');

const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]; // All notes on fretboard
const markedFrets = [3, 5, 7, 9];

let guitarStandard = stringCountSelect.value;
let tuning = guitarStandard.split(' ');
let stringCount = tuning.length;


let strings = []; // array of strings on page
let frets = []; // array of frets on page
let highlighted = []; // array of highlighted notes on page
let savedChords = []; // arrary of saved chords 

// quick div creator
const newDiv = function(id, classes, innerText){
    let newDiv = document.createElement('div');
    if(id){ newDiv.setAttribute('id', id)}
    if(classes){
        let allClasses = classes.split(' ');
        allClasses.forEach( v => newDiv.classList.add(v));
    }
    if(innerText){ newDiv.innerText = innerText }
    return newDiv;
}

// makes sure note index is between 0 - 11 (A - G#)
const fixNoteIndex = function(num){
    let newNum = num % 12; 
    if (newNum < 0){
        newNum += 12;
    } else if (newNum > 11){
        newNum -= 12;
    }
    return newNum;
}

// removes all children from a given div
const removeChildren = function(div){
    while( div.children.length > 0){
        div.children[0].remove();
    }
}

// runs on page load
const init = function(){

    //add highlighted note display notes to page
    notes.forEach( v => {
        createFret(highlightedNoteDisp);
        highlightedNoteDisp.children[highlightedNoteDisp.children.length-1].innerText = v;
    });
    
    //create default fret board
    makeFretBoard();

    //show (empty) saved chords array
    showSavedChords();
}

// clears current freboard and creates new display based on page settings
const makeFretBoard = function(){

    //clear fret board (remove all strings and fret count)
    clearFretBoard();

    //Add string for each note in tuning array
    tuning.forEach( (v, i) => {
        createString(v, i);
    });

    // refresh page arrays
    strings = document.querySelectorAll('.string'); // set page strings array
    frets = document.querySelectorAll('.fret'); // set page frets

    // displays fret count below strings on the fretboard
    fretCountDisp.style.marginTop = (tuning.length/2 + 35) + 'px';
    createFretCount();

    // highlight selected notes
    highlightNotes();
};

// removes all strings, fret count display icons, and string tuners from page
const clearFretBoard = function(){
    // remove all strings
    removeChildren(stringsDisp);

    // remove fret count icons
    removeChildren(fretCountDisp);

    //remove all tuners
    removeChildren(tuningManager);
}

// create new string and tuner and add them to the board and page
const createString = function(openNote, stringIndex){
    // create new string div
    let newString = newDiv(false, 'string');
    
    // styles string thickness to look like guitar strings
    newString.style.padding = 20/(stringIndex+4) +'px 0px'; // LOOK HERE FOR STRING PADDING ISSUES!!!!!
    newString.style.margin = 35 - 10/(stringIndex+4) +'px 0px'; // LOOK HERE FOR STRING MARGIN ISSUES!!!!!

    // Add frets to string based on page input
    for(let i = +fretLowBtn.value; i <= +fretHighBtn.value; i++){
        createFret(newString);
    }

    //label frets with notes
    tuneString(newString, openNote);

    // add string to board
    stringsDisp.prepend(newString); // add string to board (prepend for legibility)
    
    // create tuner for string
    createTuner(newString, stringIndex);
}

const createFret = function(string, shouldPrepend){
    let newFret = newDiv(false, 'fret');

    newFret.addEventListener('click', function(){
        toggleHighlight(this.innerText);
    });

    shouldPrepend ? string.prepend(newFret) : string.append(newFret);
}

const createFretCount = function(){
    removeChildren(fretCountDisp);
    for(let i= +fretLowBtn.value; i <= +fretHighBtn.value; i++){
        let count = newDiv(false, 'fret fretNumber', ''+i);

         // tag fret with marked classes if needed
         if( i === 0 ){
            count.classList.add('openNoteFret');
        }
        else if ( i % 12 === 0){
            count.classList.add('octaveNoteFret');
        }
        else if ( markedFrets.indexOf(i % 12) !== -1){
            count.classList.add('markedNoteFret');
        }


        fretCountDisp.append(count);
    }
}

const createTuner = function(string, tuningIndex){
    let stringTuner = newDiv(false, 'stringTuner');

    let btnTuneUp = document.createElement('button');
    btnTuneUp.innerText = '+';
    
    let btnTuneDown = document.createElement('button');
    btnTuneDown.innerText = '-';
    
    let stringTune = document.createElement('span');
    let stringNoteIndex = notes.indexOf(string.children[0].innerText) - fretLowBtn.value;

    stringTune.innerText = notes[fixNoteIndex(stringNoteIndex)];

    btnTuneUp.addEventListener('click', function(){
        changeTuning(string, true);

        let noteIndex = notes.indexOf( stringTune.innerText ) + 1;
        tuning[ tuningIndex ] = notes[noteIndex];
        stringTune.innerText = notes[ fixNoteIndex(noteIndex) ];
    });
    btnTuneDown.addEventListener('click', function(){
        changeTuning(string, false);

        let noteIndex = notes.indexOf( stringTune.innerText ) - 1;
        
        tuning[ tuningIndex ] = notes[ fixNoteIndex(noteIndex) ];

        stringTune.innerText = notes[ fixNoteIndex(noteIndex) ];
    });

    stringTuner.append(btnTuneUp, stringTune, btnTuneDown);

    tuningManager.append(stringTuner);
}

const tuneString = function(string, openNote){
    let openIndex = notes.indexOf(openNote);
    
    // add notes to fret
    for(let i = +fretLowBtn.value; i <= +fretHighBtn.value; i++){
        let fretIndex = i - fretLowBtn.value;
        let noteIndex = (openIndex + i)%12; 
        let myFret = string.children[fretIndex];

        // add note to fret
        myFret.innerText = notes[noteIndex];
        
        // tag fret with marked classes if needed
        if( i === 0 ){
            myFret.classList.add('openNoteFret');
        }
        else if ( i % 12 === 0){
            myFret.classList.add('octaveNoteFret');
        }
        else if ( markedFrets.indexOf(i % 12) !== -1){
            myFret.classList.add('markedNoteFret');
        }
    }

    highlightNotes();
}

const changeTuning = function(string, isIncreasing){
    let noteIndex = notes.indexOf( string.children[0].innerText) - fretLowBtn.value;
    isIncreasing ? noteIndex++ : noteIndex--;
    console.log(noteIndex);
    tuneString(string, notes[ fixNoteIndex(noteIndex) ]);
    console.log(tuning);
}

const addFrets = function(){
    let currentLow = +fretCountDisp.children[0].innerText;
    let currentHigh = +fretCountDisp.children[ fretCountDisp.children.length - 1 ].innerText;
    
    if( currentLow > fretLowBtn.value ){
        //add frets to bottom end
        for(let i =0; i<strings.length; i++){
            while(currentLow > fretLowBtn.value){
                currentLow--;
                createFret(strings[i], true);
            }
        }
    }

    if(currentHigh < fretHighBtn.value ){
        //add frets to high end
        while(currentHigh < fretHighBtn.value){
            for(let i = 0; i<strings.length; i++){
                createFret(strings[i]);
                currentHigh
            }
        }
    }

    //rewrite fret count icons
    createFretCount();
}

const highlightNotes = function(){
    if(highlighted.length === 0){
        frets.forEach( v => {
            v.classList.remove('highlight');
            v.classList.remove('dampen');
        });
    } else {
        highlighted.sort();
        frets.forEach(v => {
            if( highlighted.indexOf(v.innerHTML) >= 0 && !v.classList.contains('highlight') ){
                v.classList.remove('dampen');
                v.classList.add('highlight');
            } 
            else if ( highlighted.indexOf(v.innerHTML) === -1 && !v.classList.contains('dampen')){
                v.classList.add('dampen');
                v.classList.remove('highlight');
            }
        });

    }
}

const toggleHighlight = function(fretNote){
    highlighted.indexOf(fretNote) >= 0 ? highlighted.splice( highlighted.indexOf(fretNote), 1) : highlighted.push(fretNote);
    highlightNotes();
}

const showSavedChords = function(){
    removeChildren(savedChordsDisp);
    if(savedChords.length === 0){
        let message = newDiv(false, 'savedChord', 'No Saved Chords');
        savedChordsDisp.append(message);
    }
    else{    
        savedChords.forEach( v => {
            let chord = newDiv(false, 'savedChord', v);
            let removeBtn = newDiv(false, 'removeChordBtn', 'X');
            removeBtn.addEventListener('click', function(){removeChord(v)});
            chord.addEventListener('click', function(){showChord(v)});
            let group = newDiv(false, 'savedChordGroup');
            group.append(chord);
            group.append(removeBtn);
            savedChordsDisp.append(group); 
        });
        
    }
}

const saveChord = function(){
    if(highlighted.length > 1){
        let str = highlighted.join(' ');
        savedChords.indexOf(str) === -1 ? savedChords.push(str) : false;
        showSavedChords();
    } else {
        alert('Chords must have more than 1 note!');
    }
}

const removeChord = function(chord){
    let removedIndex = savedChords.indexOf(chord);
    savedChords.splice(removedIndex, 1);
    showSavedChords();
}

const showChord = function(chord){
    highlighted = chord.split(' ');
    highlightNotes();
}

saveChordBtn.addEventListener('click', saveChord);

resetChordBtn.addEventListener('click', function(){
    if(highlighted.length > 0){
        highlighted = [];
        highlightNotes();
    }
});

stringCountSelect.addEventListener('change', function(){
    tuning = this.value.split(' ');
    makeFretBoard();
    highlightNotes();
});

fretLowBtn.addEventListener('change', makeFretBoard);

fretHighBtn.addEventListener('change', makeFretBoard);


init();