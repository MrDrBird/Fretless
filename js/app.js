/////////////////////////
// MUSICAL RULES
/////////////////////////

const Notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']; // array of all possible notes. *DO NOT TOUCH*

const Scales = {
    'Major': {
        'steps':[2,2,1,2,2,2], // ends 1 step from root
        'numerals':['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii' + '&deg']
    }, 
    'Minor':{ 
        'steps': [2,1,2,2,1,2], // ends 2 steps from root
        'numerals': ['i', 'ii' + '&deg', 'III', 'iv', 'v', 'VI', 'VII']
    }
};

/////////////////////////
// MUSICAL PRESET
/////////////////////////

// Preset Fretboard Layouts
let Tuning = ['E']; // Current tuning for strings on fretboard. *Is set to EADGBE by default on page load*

const instrumentPresets = [ // array of all possible instruments including preset tuning options
    {
        'inst': '4 String Bass',
        'opts':{
            'standard': {
                'desc': 'Standard - [EADG]',
                'val': 'E,A,D,G'
            },
            'dropD': {
                'desc': 'Drop D - [DADG]',
                'val': 'D,A,D,G'
            }
        }
    },
    {
        'inst': '5 String Bass',
        'opts':{
            'standard': {
                'desc': 'Standard - [BEADG]',
                'val': 'B,E,A,D,G'
            },
            'alternative': {
                'desc': 'Alternative - [EADGB]',
                'val': 'E,A,D,G,B'
            }
        }
    },
    { // default setting
        'inst': '6 String Guitar',
        'opts': {
            'standard': { // default setting
                'desc': 'Standard - [EADGBE]',
                'val': 'E,A,D,G,B,E'
            },
            'dropD': {
                'desc': 'Drop D - [DADGBE]',
                'val': 'D,A,D,G,B,E'
            }
        }
    },
    {
        'inst': '7 String Guitar',
        'opts':{
            'standard': {
                'desc': 'Standard - [BEADGBE]',
                'val': 'B,E,A,D,G,B,E'
            },
            'alternative': {
                'desc': 'Alternative - [EADGBEA]',
                'val': 'E,A,D,G,B,A'
            }
        }
    }
];
//TODO - find more preset tuning for all preset instruments!
//TODO - piano mode
    // 1 string [C].  *square notes, black keys. special setting
//TODO - broken string mode
    // allow user to declare string broken (string is unusable - must be muted or invisible entirely)


// Fret/key count
let LowFret = 0; // Current lowest fret number displayed on fretboard. *Stays 0 on page load*
let HighFret = 17; // Current highestest fret number displayed on fretboard *Varies based on page width*

let highlightFrets = [3, 5, 7, 9];

/////////////////////////
// STORAGE ARRAYS
/////////////////////////

let MutedNotes = []; // Storage area for muted notes
let SavedChords = []; // Storage area for saved chords

///////////////////////////
// Helper Functions
//////////////////////////

function newEl(element, id, classes, innerHTML){ // returns new element with possible id, class list, and innerHTML.
    let newEl = document.createElement(element); // create new element of given type
    if(id){ newEl.id = id; } // set element id if given
    if(classes){ newEl.classList.add(classes); } // add element classes if given
    if(innerHTML){ newEl.innerHTML = innerHTML; } // set element contents if given
    return newEl; // return new element
};

function getNote(index){ // returns Note at given index
    let fixedIndex = index%12; // reduce the given index (possible results between -11 & 11)
    if (fixedIndex < 0){ fixedIndex += 12; } // fix index if negative
    return Notes[fixedIndex]; // return Note at fixed index
}

function setSelected(arr){
    MutedNotes = Notes.filter(function(note){ return arr.indexOf(note) === -1 });
}

function getSelected(){ // returns array of notes that are note muted
    let notMutedNotes = Notes.filter(function(note){ return MutedNotes.indexOf(note) === -1 });
    if(notMutedNotes.length === Notes.length){
        notMutedNotes = [];
    }
    return notMutedNotes;
}

/////////////////////////
// PAGE ELEMENTS
/////////////////////////

// MAIN ELEMENTS (HEADER - (Title, Instrument, todo - 'extras' dropdown menu for mobile), FRETBOARD, CHORD DISPLAY)

const headerElement = document.querySelector('#header');
const mainElement = document.querySelector('#main');

function setPresets(){
    let w = window.innerWidth;

    if(w >= 1080){
        HighFret = 24;
    }
    else if(w >= 900){
        HighFret = 17;
    }
    else if(w >= 720){
        HighFret = 15;
    }
    else if(w >= 640){
        HighFret = 12;
    }
    else if(w >= 480){
        HighFret = 10;
    }
    else{
        HighFret = 8;
    }
}

function createInstrumentManager(){ // create all elements for instrument select
    let instManager = newEl('div', 'instrumentManager'); // create new div to contain all parts of the Instrument Manager
    let instLabel = newEl('span', false, 'label', 'Instrument: '); // create new span to label instrument selection
    let instSelect = newEl('select', 'instrumentSelect'); // create new select box for instruments

    instrumentPresets.forEach(function(instrument){ // create option field for each instrument
        let instOpt = newEl('option'); // create option element
        instOpt.value = instrument.inst; // set option value
        instOpt.text = instrument.inst; // set option text

        if(instrument.inst === '6 String Guitar'){ // set '6 String Guitar' as default selection
            instOpt.selected = true; // mark option as selected

            let standardTuning = instrument.opts.standard.val.split(','); // split standard tuning option into array
            Tuning = standardTuning.slice(); // preset page tuning to selected tuning (EADGBE)
        }

        instSelect.append(instOpt); // add option to select
    });

    instSelect.addEventListener('change', function(event){ // attach listener to instrument select
        processStringCountChange(event); // process new instrument selection
    });

    instManager.append(instLabel, instSelect); // add label and input to instrument manager
    headerElement.append(instManager); // add instrument manager to page
}

function createFretBoard(){ // create page element to display fretboard

    const fretBoard = newEl('div','fretBoard'); // create container for strings and frets
    const fretBoardStrings = newEl('div', 'fretBoardStrings'); // create container for strings
    fretBoard.append(fretBoardStrings); // attach string container to fret board
    mainElement.append(fretBoard); // add fretboard to main element

    // add strings based on preset tuning to fretboard
    Tuning.forEach(function(){ // add empty string to fret board for each note in tuneing
        fretBoardStrings.append( newEl('div', false, 'string') ); // attach new string to fretboard
    });

    refreshTuning(); // set intial tuning of strings
    createFretCount(); // create fret counter below strings
    
}

function createNewNote(note, isFret){ // returns new note or fret element
    note = String(note); // process number 0 to not be read as 'false' **used for frets
    
    let classType = isFret ? 'fret' : 'note'; // determine which class to set
    let newNote = newEl('div', false, classType, note); // create new element of determined type
    
    if(!isFret){ // stuff for note elements
        attachMuteListener(newNote); // make note mute-able
        if(MutedNotes.indexOf(note) >= 0){ // if note is in muted list
            newNote.classList.add('mute'); // mute note
        } 
    }

    return newNote; // return new note element
}

function createFretCount(){ // create area for fret count display
    let fretBoard = document.querySelector('#fretBoard'); // select fret board on page

    let fretCount = newEl('div', 'fretCount'); // create element to contain fret count
    
    for(let i=LowFret; i<=HighFret; i++){ // add frets from lowest set fret to highest
        fretCount.append( createNewNote(i, true) ); // attach new note(fret) to fretCount area
    }
    fretBoard.append(fretCount); // attach fret count to fret board
}

function createAllNotesDisplay(){ // create page element to display selected chord notes
    const allNotesDisplay = newEl('div', 'allNotesDisplay'); // create container for entire display area
    let allNotesContainer = newEl('div', 'allNotesContainer'); //create element to display notes of current chord
    
    Notes.forEach( function(note){ // for every note in Notes array
        allNotesContainer.append( createNewNote(note) ); // attach new note to notes display
    });

    allNotesDisplay.append(allNotesContainer); // attach note display to chord display

    // create reset chord button
    let resetChordButton = newEl('button', 'resetChordButton', 'sBtn', 'RESET'); // create button element
    resetChordButton.disabled = true; // set button to disabled on load
    resetChordButton.addEventListener('click', function(){ // add click listener
        MutedNotes = []; // empty MutedNotes array
        refreshNoteVisibility(); // refresh note visibility
        updateCurrentChord();
    });

    allNotesDisplay.append(resetChordButton); // attach reset button to chord display

    mainElement.append(allNotesDisplay); // attach chord display to main element of page
}

// EXTRA ELEMENTS (FRET LIMIT, TUNING MANAGER, SAVED CHORDS...)

function createExtrasDisplay(){ // create area for extra features
    const extrasDisplay = newEl('div', 'extrasDisplay'); // create extras container

    //TODO - filter what is attached based on page size

    extrasDisplay.append( createFretManager() ); // attach fret manager to extras
    extrasDisplay.append( createTuningManager() ); // attach tuning manager
    extrasDisplay.append( createChordManager() ); // attach chord manager
    extrasDisplay.append( createKeyManager() ); // attach key manager
    
    mainElement.append(extrasDisplay); // attach extras to main element of page
    resetTuningPresetOptions();
    updateSavedChordsList();
}

function createFretManager(){ // create all elements for fret manager 
    let fretManager = newEl('div', 'fretLimit', 'extra'); // create container for fretManager content 
    let fmHeader = newEl('h3', false, 'extrasHeader', 'Fret Manager'); // create header for fret manager
    fretManager.append(fmHeader); // attach header to container

    
    let limits = [ // fret limit presets
        { 'name': 'Low',
          'number': LowFret,
          'min': 0,
          'max': HighFret
        },
        { 'name': 'High',
          'number': HighFret,
          'min': LowFret,
          'max': 27
        }
    ];

    let limitsContainer = newEl('div', 'limitsContainer');

    limits.forEach(limit => { // create manager for each limit

        let lmId = `limitManager${limit.name}`; // create limit manager container Id
        let lmInputId = `limitInput${limit.name}`; // create limit Input Id
        let attrObj = { // create attributes object for limit Input
            'type': 'number',
            'value': limit.number,
            'min':  limit.min,
            'max': limit.max
        };

        let lmInput = newEl('input', lmInputId, 'fretLimitInput'); // create input element

        for(let key in attrObj){ // set input attributes
            lmInput.setAttribute(key, attrObj[key]);
        }

        lmInput.addEventListener('change', function(event){ // add click listener to limit input
            processFretLimitChange(event); // process change
        });

        let limitManager = newEl('div', lmId, 'limitManager'); // create container for limit manager

        limitManager.append( newEl('span', false, 'label', `${limit.name}: `), lmInput);

        limitsContainer.append(limitManager);
        
    });
    fretManager.append(limitsContainer);
    return fretManager;
}

function createTuningManager(){ // create all elements for tuning manager
    let tuningManager = newEl('div', 'tuningManager', 'extra'); // create container for all related elements 
    let tmHeader = newEl('h3', false, 'extrasHeader', 'Tuning Manager'); // create header element
    
    ////////////////////////////////////
    //  Create preset tuning options  //
    ////////////////////////////////////

    // create select element with preset tuning options
    let tmPresets = newEl('div', 'tuningPresets');
    let label = newEl('span', false, 'label', 'Presets: ');
    let tuningSelect = newEl('select', 'tuningSelect'); // create select element

    //set listener on tuning select
    tuningSelect.addEventListener('change', function(event){
        Tuning = event.target.value.split(',');
        refreshTuning();
    });

    tmPresets.append(label, tuningSelect);

    ////////////////////////////////////
    //  Create Custom Tuning Buttons  //
    ////////////////////////////////////

    let tmCustom = newEl('div', 'tuningCustom'); // container for tuners

    // creates tuner for each individual string
    Tuning.forEach(function(note, index){ // for each note in Tuning array
        tmCustom.append( createCustomTuner(index) ); // create new tuner
    });

    // create tuner for all strings
    let tunerAll = newEl('div', 'tunerAll', false); // create tuner for ALL strings
    let btnInc = newEl('button', false, 'hBtn', ' + '); // create button to increase tuning
    let btnDec = newEl('button', false, 'hBtn', ' - '); // create button to decrease tuning
    let disp = newEl('div', false, 'tunerNote', 'All Strings'); // create display for current tuning

    btnInc.addEventListener('click', function(){
        let newTuning = [];
        Tuning.forEach(function(tune){
            newTuning.push( getNote( Notes.indexOf(tune)+1 ) );
        });
        Tuning = newTuning;
        let tuningSelect = document.querySelector('#tuningSelect');
        let myOpt = tuningSelect[tuningSelect.length-1];
        
        for( opt in tuningSelect.children ){
            if(tuningSelect.children[opt].value === Tuning.join(',')){
                myOpt = tuningSelect.children[opt];
            }
        }

        myOpt.selected = true;
        refreshTuning();
    });

    btnDec.addEventListener('click', function(){
        let newTuning = [];
        Tuning.forEach(function(tune){
            newTuning.push( getNote( Notes.indexOf(tune)-1 ) );
        });
        Tuning = newTuning;
        let tuningSelect = document.querySelector('#tuningSelect');
        let myOpt = tuningSelect[tuningSelect.length-1];
        
        for( opt in tuningSelect.children ){
            if(tuningSelect.children[opt].value === Tuning.join(',')){
                myOpt = tuningSelect.children[opt];
            }
        }

        myOpt.selected = true;
        refreshTuning();
    });

    tunerAll.append(btnDec, disp, btnInc);
    tuningManager.append(tmHeader, tmCustom, tunerAll, tmPresets); //attach header to tuning manager
    return tuningManager;
}

function createCustomTuner(index){ // create custom tuner for tuning manager

    let allStrings = document.querySelectorAll('.string');
    let string = allStrings[allStrings.length - index - 1];
    let note = Tuning[index]; // note corresponds to tuning index

    let tuner = newEl('div', false, 'tuner'); // create element to contain tuning elements
    let btnInc = newEl('button', false, 'vBtn', ' + '); // create button to increase tuning
    let btnDec = newEl('button', false, 'vBtn', ' - '); // create button to decrease tuning
    let disp = newEl('div', false, 'tunerNote', note); // create display for current tuning

    btnInc.addEventListener('click', function(){
        let newRoot = getNote(Notes.indexOf(disp.innerHTML)+1);
        Tuning.splice(index, 1, newRoot);
        disp.innerHTML = newRoot;
        tuneString(string, newRoot);

        let tuningSelect = document.querySelector('#tuningSelect');
        let myOpt = tuningSelect[tuningSelect.length-1];
        
        for( opt in tuningSelect.children ){
            if(tuningSelect.children[opt].value === Tuning.join(',')){
                myOpt = tuningSelect.children[opt];
            }
        }

        myOpt.selected = true;
    });

    btnDec.addEventListener('click', function(){
        let newRoot = getNote(Notes.indexOf(disp.innerHTML)-1);
        Tuning.splice(index, 1, newRoot);
        disp.innerHTML = newRoot;
        tuneString(string, newRoot);

        let tuningSelect = document.querySelector('#tuningSelect');
        let myOpt = tuningSelect[tuningSelect.length-1];
        
        for( opt in tuningSelect.children ){
            if(tuningSelect.children[opt].value === Tuning.join(',')){
                myOpt = tuningSelect.children[opt];
            }
        }

        myOpt.selected = true;
    });
    
    tuner.append(btnInc, disp, btnDec);
    return tuner;
}

function resetTuningPresetOptions(){ // reset options in tuning select
    let tuningSelect = document.querySelector('#tuningSelect'); // get tuning select element
    while(tuningSelect.children.length > 0){
        tuningSelect.children[0].remove();
    }
    
    let curInst = document.querySelector('#instrumentSelect').value; // get selected instrument
    let tunings = instrumentPresets.find( function(inst){ return inst.inst === curInst} ).opts; // get instrument preset tunings
    for(key in tunings){
        let option = newEl('option'); // create new option element
        option.value = tunings[key].val; // set option value
        option.text = tunings[key].desc; // set option text

        if( tunings[key] === 'standard' ){
            option.selected = true;
        }

        tuningSelect.append(option);
    }

    let option = newEl('option'); // create new option element
    option.value = 'CUSTOM'; // set option value
    option.text = 'CUSTOM'; // set option text
    option.disabled = true;
    tuningSelect.append(option);
}

function resetCustomTuners(){
    let cont = document.querySelector('#tuningCustom');
    if(cont){
        let tuners = document.querySelectorAll('.tuner');
        for(let i = 0; i < tuners.length; i++){ // remove all tuners
            tuners[i].remove();
        }

        //set corrent amount of tuners
        for(let i = 0; i < Tuning.length; i++){
            cont.append( createCustomTuner(i) );
        }
    }
}

function createChordManager(){
    let chordManager = newEl('div', 'chordManager', 'extra');
    let cmHeader = newEl('h3', false, 'extrasHeader', 'Chord Manager');

    let curretChord = newEl('div', 'currentChord');
        let ccLabel = newEl('span', false, 'label', 'Current Chord');
        let ccList = newEl('div', false, 'chordList');
            let ccElement = newEl('div', false, 'chordDisplay');
                let ccChord = newEl('div', 'currentChordDisplay', 'chord', 'No Selected Notes');
                let ccSaveBtn = newEl('button', 'chordSaveButton', 'hBtn', ' + ');
                ccSaveBtn.addEventListener('click', processSaveChord);
            ccElement.append(ccChord, ccSaveBtn);
        ccList.append(ccElement);
    curretChord.append(ccLabel, ccList);


    let savedChords = newEl('div', 'savedChords');
        let scLabel = newEl('span', false, 'label', 'Saved Chords');
        let scList = newEl('div', 'savedChordsList', 'chordList');

    savedChords.append(scLabel, scList);

    chordManager.append(cmHeader, curretChord, savedChords);
    return chordManager;
}

function createSavedChord(newSave){
    let scElement = newEl('div', false, 'chordDisplay');
    let scChord = newEl('span', false, 'chord', newSave);
    let scDeleteBtn = newEl('button', false, 'hBtn', ' x ');

    scChord.addEventListener('click', function(e){ 
        let value = e.target.innerHTML;
        if(value !== 'No Saved Chords'){
            let selected = value.split(', ');
            MutedNotes = Notes.filter( function(x){ return selected.indexOf(x) === -1 });
        }
        updateCurrentChord();
        refreshNoteVisibility();
    });

    scDeleteBtn.addEventListener('click', function(e){ removeSavedChord(e) });
        
    scElement.append(scChord, scDeleteBtn);
    return scElement;
}

function createKeyManager(){
    let keyManager = newEl('div', 'keyManager', 'extra');
    let kmHeader = newEl('h3', false, 'extrasHeader', 'Key Manager');
    let kmSelects = newEl('div', 'keyManagerSelects');

    let keyNoteSelect = newEl('select', 'keyNoteSelect');
    Notes.forEach(function(note){
        let option = newEl('option', false, false, note);
        option.value = note;
        keyNoteSelect.append(option);
    });

    let keyScaleSelect = newEl('select', 'keyToneSelect');
    for(key in Scales){
        let option = newEl('option', false, false, key);
        option.value = key;
        keyScaleSelect.append(option);
    }

    let keyGenerateBtn = newEl('button', 'keyGenerateBtn', 'sBtn', 'SHOW');
    
    let kmScalesLabel = newEl('span', false, 'label', 'Full Scale');
    let kmScaleDisplay = newEl('div', 'keyManagerScaleDisplay', 'chordDisplay');
    let kmScale = newEl('span', 'keyScale', 'chord', 'No Scale Generated');
    let kmScaleSaveBtn = newEl('button', 'scaleSaveBtn', 'hBtn', ' + ');
    
    kmScaleDisplay.append(kmScale, kmScaleSaveBtn)
    kmSelects.append(keyNoteSelect, keyScaleSelect, keyGenerateBtn);
    
    let kmNumeralsLabel = newEl('span', false, 'label', 'Key Chords');
    let kmNumeralsList = newEl('div', 'kmNumeralsList', 'chordList');
    let numeralsDefault = createNumeralChord('X', 'No Key Selected');
    // let numeralsDefault = newEl('span', false, 'chord', 'No Scale Generated');

    kmNumeralsList.append(numeralsDefault);

    keyManager.append(kmHeader, kmSelects, kmScalesLabel, kmScaleDisplay, kmNumeralsLabel, kmNumeralsList);
    
    keyGenerateBtn.addEventListener('click', function(){
        let rNote = keyNoteSelect.value;
        let sName = keyScaleSelect.value;
        processKeyGen(rNote, sName);
    });

    kmScaleSaveBtn.addEventListener('click', function(){
        if(kmScale.innerHTML !== 'No Scale Generated'){
            let notes = kmScale.innerHTML.split(', ');
            setSelected(notes);
            updateCurrentChord();
            refreshNoteVisibility();
        }
    });

    return keyManager;
}

function createNumeralChord(num, nChord){
    let container = newEl('div', false, 'chordDisplay');
    
    let sNum = newEl('span', false, 'chord', num+':');
    let sChord = newEl('span', false, 'chord', nChord);
    let span = newEl('span', false, 'chord');
    span.append(sNum,sChord);
    
    
    let btn = newEl('button', false, 'hBtn', ' + ');
    btn.addEventListener('click', function(e){
        let tgt = e.target;
        let parent = tgt.parentNode;
        let cSpan = parent.children[0].children[1].innerHTML;

        if(cSpan!=='No Key Selected'){

            let notes = cSpan.split(', ');
            setSelected(notes);
            updateCurrentChord();
            refreshNoteVisibility();

            console.log(cSpan); 
        }
    });
       
    container.append(span, btn);
    // container.append(spans, btn);
    return container;
}

///////////////////////////
// PAGE FUNCTIONAlITY
///////////////////////////

function processStringCountChange(e){ // handle new instrument selection
    let instInput = e.target.value; // value of selected instrument
    let instObj = instrumentPresets.find(inst => inst.inst === instInput); // find selected instrument presets
    
    Tuning = instObj.opts.standard.val.split(','); // set fret board tuning to standard option

    refreshTuning(); // reset fretboard tuning
    resetTuningPresetOptions(); // reset preset tuning select options
    refreshNoteVisibility(); // refresh visible/muted notes
}

function refreshTuning(){ // reset tuning of all strings on fret board

    let allStrings = document.querySelectorAll('.string'); // find all strings currently on page

    if (allStrings.length !== Tuning.length ){ // if strings need to be added or removed 
        if(allStrings.length < Tuning.length){ // if there are not enough string for the selected tuning
            for(let i=0; i < Tuning.length - allStrings.length; i++){
                fretBoardStrings.append( newEl('div', false, 'string') ); // attach new string to fretboard
            }
        }
        else if( allStrings.length > Tuning.length){ // if there are more strings than the selected tuining
            for(let i=0; i < allStrings.length - Tuning.length; i++){
                allStrings[i].remove(); // remove string from fretboard
            }
        }
        allStrings = document.querySelectorAll('.string'); // refresh list of strings
    } 
    
    for(let i = 0; i<Tuning.length; i++){ // Tune each string
        let ind = allStrings.length-i-1; // get index of paired string
        let str = allStrings[ind]; // get paired string 
        tuneString(str, Tuning[i]); // set string tuning
    }

    //TODO - update custom tuning manager
    resetCustomTuners();
    refreshNoteVisibility();
}

function tuneString(string, root){ // reset tuning of given string
    let rootIndex = Notes.indexOf(root); // get Note index of string tuning
    let fretCount = HighFret-LowFret+1; // get required number of frets on string

    for(let i = 0; i < fretCount; i++){ // for all required frets
        let currentFret = i+LowFret; // index of current fret
        let fretClass = false;
        if(currentFret === 0){
            fretClass = 'openNote';
        }
        else if(currentFret%12 === 0){
            fretClass = 'octiveNote';
        }
        else if(highlightFrets.indexOf(currentFret%12) !== -1){
            fretClass = 'highlightNote';
        }

        let thisNote = getNote(currentFret + rootIndex); // Note of current Fret

        if(string.children[i]){ // if note element already exists
            string.children[i].innerHTML = thisNote; // reset contents of note

        }
        else{ // if note element does not exist
            let newNote = createNewNote(thisNote); // create new note
            if(fretClass){newNote.classList.add(fretClass)}

            string.append(newNote); // add note to string
        }
    }

    refreshNoteVisibility(string);
}

function attachMuteListener(noteElement){ // attach click listener to note enabling mute/visible feature
    noteElement.addEventListener('click', function(){ // attach click listener
        
            let note = this.innerHTML; // save clicked note
        
            if(MutedNotes.length === 0){ // if no notes are muted, highlight selected note (by muting all other notes)
                MutedNotes = Notes.slice(); // set muted notes to a copy of all notes
                MutedNotes.splice( MutedNotes.indexOf(note), 1 ); // remove selected note from muted array
            }
            else{ // if one or more note is muted, toggle selected note. *if all notes are muted, reset all notes to visible
                if( MutedNotes.indexOf(note) === -1 ){ // if note is not in muted array
                    if(MutedNotes.length < 11){ // if muted array is not at capacity
                        MutedNotes.push(note); // add note to muted array
                    }
                    else{ // if muted array is at capacity (all notes are muted)
                        MutedNotes = []; // reset muted array
                    }
                }
                else{ // remove note from muted array
                    MutedNotes.splice( MutedNotes.indexOf(note), 1 );
                } 
            }
            
            refreshNoteVisibility();
            updateCurrentChord();
    });
}

function refreshNoteVisibility(string){ // reset all notes mute/visible 
    let area = string ? string : document;

    let allNotes = area.querySelectorAll('.note'); // select all notes on page

    allNotes.forEach(function(element){ 
        let note = element.innerHTML; // get note of current element
        let hasClass = element.classList.contains('mute') ? true : false; // determine if element already has 'muted' class
        let isMuted = MutedNotes.indexOf(note) !== -1 ? true : false; // determine if element should have 'muted' class

        if( (hasClass && !isMuted) || (!hasClass && isMuted) ){ // add or remove 'muted' class if neccessary
            element.classList.toggle('mute');
        }
    });

    let btn = document.querySelector('#resetChordButton'); // find reset chord button
    if(btn){ btn.disabled = MutedNotes.length === 0; } // set disabled based on number of muted notes
}

function processFretLimitChange(event){ // process user input from fret manager
    let tgt = event.target; // selected input element
    let val = Number(tgt.value); // value of input
    let isLow = tgt.id === 'limitInputLow' ? true : false; // determine if high or low fret limit
    let msg = false; // set error message if invalid input

    if(isLow){ // if low fret limit
        if(val < 0){ // prevent low end from going below 0
            val = 0; // set low limit to 0
            msg = 'fret 0 is the low limit'; // display error message
        }
        else if(val > HighFret){ // prevent low end from exceeding high end
            val = HighFret; // set low limit to high limit
            msg = 'the low fret limit cannot exceed the high limit'; // display error message
        }
        LowFret = val; // sync low fret limit with low input
    }
    else{ // if high fre limit
        if(val > 27){ //prevent high end from exceeding 27
            val = 27; // set high limit to 27
            msg = 'fret 27 is the high limit'; // display error message
        }
        else if(val < LowFret){ // prevent high end from dropping below low end
            val = LowFret; // set high value to low fret
            msg = 'the low fret limit cannot exceed the high limit'; // display error message
        }
        HighFret = val;
    }

    if( msg ){ // if error message exists
        tgt.value = val; // set input value to correction;
        alert(msg); // display error message
    }

    refreshFretLimit(); // reflect changes on fretboard
}

function refreshFretLimit(){ // set low and high frets on strings

    let fretCount = document.querySelector('#fretCount'); // get fret count display
    let curLow = Number(fretCount.children[0].innerHTML); // get current low fret limit
    let curHigh = Number(fretCount.children[fretCount.children.length-1].innerHTML); // get current high fret limit
    
    let allStrings = document.querySelectorAll('.string'); // get all strings on page
    
    // adds notes to low end of string
    while(curLow > LowFret){ // while the current low limit is greater than the set low limit
        curLow--; // lower the low limit
        allStrings.forEach(function(string){ // for each string
            let lowInd = Notes.indexOf(string.children[0].innerHTML); // get Note index of lowest note on string
            let newInd = lowInd-1; // set new limit to 1 lower than current lowest
            let newNote = getNote(newInd); // get note 1 step below current limit
            let newElement = createNewNote(newNote); // create new note
            if(MutedNotes.indexOf(newNote) !== -1){ // if new note is muted
                newElement.classList.add('mute'); // add muted class to note
            }

            let fretClass = false;
            if(curLow=== 0){
                fretClass = 'openNote';
            }
            else if(curLow%12 === 0){
                fretClass = 'octiveNote';
            }
            else if(highlightFrets.indexOf(curLow%12) !== -1){
                fretClass = 'highlightNote';
            }

            if(fretClass){ // if new note is muted
                newElement.classList.add(fretClass); // add muted class to note
            }

            string.prepend(newElement); // add new note to front end of string
        });

        fretCount.prepend(createNewNote(curLow, true)); // add lower fret to beginning of fret count
    }

    //add notes to high end of string
    while(curHigh < HighFret){ // while current high limit is lower than require high limit
        curHigh++; // raise high limit
        allStrings.forEach(function(string){ // for each string
            let highInd = Notes.indexOf(string.children[string.children.length-1].innerHTML); // get Note index of current highest note
            let newInd = highInd+1; // set new index to 1 higher than current highest
            let newNote = getNote(newInd); // get note of new index
            let newElement = createNewNote(newNote); // create new note element
            if(MutedNotes.indexOf(newNote) !== -1){ //if new note is muted
                newElement.classList.add('mute'); // muted new note
            }

            let fretClass = false;
            if(curHigh=== 0){
                fretClass = 'openNote';
            }
            else if(curHigh%12 === 0){
                fretClass = 'octiveNote';
            }
            else if(highlightFrets.indexOf(curHigh%12) !== -1){
                fretClass = 'highlightNote';
            }

            if(fretClass){ // if new note is muted
                newElement.classList.add(fretClass); // add muted class to note
            }

            string.append(newElement); // attach new note to string
        });
        fretCount.append(createNewNote(curHigh, true)); // add new fret to fret count
    }

    //remove notes from low end of string
    while(LowFret > curLow){ // while there are frets beyond the low limit
        allStrings.forEach(function(string){ // for each string
            string.children[0].remove(); // remove the first note
        });
        fretCount.children[0].remove(); // remove the first fret from fret count
        curLow++; // increase the current low limit
    }
    
    //remove notes from low end of string
    while(HighFret < curHigh){ // while there are frets beyond the high limit
        allStrings.forEach(function(string){ // for each string
            string.children[string.children.length-1].remove(); // remove the last note
        });
        fretCount.children[fretCount.children.length-1].remove(); // remove the last fret of the string count
        curHigh--; // lower current high limit
    }
    
}

function updateCurrentChord(){
    let selectedNotes = getSelected();
    let ccDisplay = document.querySelector('#currentChordDisplay');
    let msg = selectedNotes.length > 0 ? selectedNotes.join(', ') : 'No Selected Notes';
    ccDisplay.innerHTML = msg;
}

function processSaveChord(){
    let selected = getSelected();
    if(selected.length < 2){
        alert('Chords need at least 2 notes');
    }
    else{
        let isSaved = false;
        for(chord in SavedChords){
            if (SavedChords[chord].join('') === selected.join('')){
                alert('This chord has already been saved');
                isSaved=true;
            }
        }
        if(!isSaved){
            SavedChords.push(selected);
            updateSavedChordsList();
        }
    }
}

function updateSavedChordsList(){
    let scList = document.querySelector('#savedChordsList');
    let noChordsMsg = 'No Saved Chords';

    if(SavedChords.length === 0 ){ // if no chords are saved
        for(let i = 0; i < scList.children.length; i++){ // for any possible chords in saved list
            scList.children[i].remove(); // remove chord
        }
        let blankChord = createSavedChord(noChordsMsg); // create blank chord
        scList.append(blankChord); // add blank chord to list
    }
    else{
        if(scList.children[0].children[0].innerHTML === noChordsMsg){ // remove blank chord if listed
            scList.children[0].remove();
        }
        SavedChords.forEach(function(chord){
            let isListed = false;
            let index = 0;
            while(index < scList.children.length){ 
                let saved = scList.children[index].children[0].innerHTML;
                if(chord.join(', ') === saved){
                    isListed = true;
                }
                index++;
            }
            if(!isListed){
                let newChord = createSavedChord(chord.join(', '));
                scList.append(newChord);  
            }
        });
    }
}

function removeSavedChord(e){
    let element = e.target.parentNode;
    let chord = element.children[0].innerHTML;

    if(chord === 'No Saved Chords'){
        alert('No Chords Saved');
    }else{
        let remInd = SavedChords.findIndex(function(saved){ return saved.join(', ') === chord });
        SavedChords.splice(remInd, 1);
        element.remove();
        updateSavedChordsList();
    }
}

function processKeyGen(rNote, sName){
    let scaleDisplay = document.querySelector('#keyScale');
    let numeralsDisp = document.querySelector('#kmNumeralsList');
    let numerals = Scales[sName]['numerals'];
    
    let gScale = getScale(rNote, sName);
    scaleDisplay.innerHTML = gScale.join(', ');
    
    numeralsDisp.innerHTML = '';
    numerals.forEach(function(num, i){
        let arr = [gScale[i], gScale[(i+2)%7], gScale[(i+4)%7]];
        let numEl = createNumeralChord(num, arr.join(', '));
        
        numeralsDisp.append(numEl);
    });
}


function getScale(rootNote, scaleName){
    let steps = Scales[scaleName]['steps'];
    let rIndex = Notes.indexOf(rootNote);

    let thisScale = [rootNote];

    steps.forEach(function(step){
        rIndex += Number(step);
        thisScale.push(getNote(rIndex));
    });

    return thisScale;
}




///////////////////////////
// INIT
///////////////////////////

function init(){
    setPresets();
    createInstrumentManager();
    createFretBoard();
    createAllNotesDisplay();
    createExtrasDisplay();
}

init();

///////////////////////////
// TEMPORARY
///////////////////////////