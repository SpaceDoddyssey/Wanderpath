class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        scene = this;
        graphics = this.add.graphics();

        initRNG();

        // define keys 
        UpKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        DownKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        LeftKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        RightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        RKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        ZKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        WKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        AKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        SKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        DKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        XKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        QKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        EnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //Hook up buttons that call scene functions
        document.querySelector('#regenerateGridButton').onclick = () => { this.initRandAndGenerate(); };
        document.querySelector('#undoButton').onclick = () => { this.puzzle.undoMove(); };
        document.querySelector('#resetButton').onclick = () => { this.puzzle.resetPlayer(); };
        document.querySelector('#changeStartNodeButton').onclick = () => { this.puzzle.changeStartNode(); };
        document.querySelector('#checkSolutionButton').onclick = () => { this.puzzle.checkWin(); };

        //Create a new empty puzzle grid
        this.puzzle = new PuzzleGrid(gridWidth, gridHeight);

        //Check if the user has entered a seed in the URL and parse it if so
        let urlSeed = false;
        const seedString = document.location.hash.substring(1);
        if (seedString) {
            console.log("Loading seed from URL:", seedString)
            let validSeed = parseSeedString(seedString);
            if(validSeed){
                urlSeed = true;
                this.regenerateWholeScene();
            } else {
                console.log("Invalid seed in URL, generating a new one")
                widthField.value = 3;
                heightField.value = 3;
                lengthField.value = 12;
                maxCrossField.value = 4;
                [gridWidth, gridHeight, maxLength, maxCrosses] = [3, 3, 12, 4];
                this.initRandAndGenerate();
                errorMessage.innerHTML = "<b>&nbspInvalid seed loaded!</b><br>Generating with default settings"
            }
        } else {
            this.initRandAndGenerate()
        }

        this.puzzle.drawGrid();
    }

    update(){ 
        if (Phaser.Input.Keyboard.JustDown(RKey)) { this.initRandAndGenerate(); }

        if(!playerMovementEnabled) return;

        //Input handling
        let curDirKey = this.currentDirectionKey();
        if(curDirKey != null){ this.puzzle.movePlayer(curDirKey); }
        if(Phaser.Input.Keyboard.JustDown(ZKey)){ this.puzzle.undoMove(); }
        if(Phaser.Input.Keyboard.JustDown(XKey)){ this.puzzle.resetPlayer(); }
        if(Phaser.Input.Keyboard.JustDown(QKey)){ this.puzzle.changeStartNode(); }
        if(Phaser.Input.Keyboard.JustDown(EnterKey)){ this.puzzle.checkWin(); }
    }

    currentDirectionKey(){
        if(Phaser.Input.Keyboard.JustDown(UpKey) || Phaser.Input.Keyboard.JustDown(WKey))    return Dirs.Up;
        if(Phaser.Input.Keyboard.JustDown(DownKey) || Phaser.Input.Keyboard.JustDown(SKey))  return Dirs.Down;
        if(Phaser.Input.Keyboard.JustDown(LeftKey) || Phaser.Input.Keyboard.JustDown(AKey))  return Dirs.Left;
        if(Phaser.Input.Keyboard.JustDown(RightKey) || Phaser.Input.Keyboard.JustDown(DKey)) return Dirs.Right;
        return null;
    }

    initRandAndGenerate(){
        initRNG();
        this.regenerateWholeScene(); 
        let seedString = createSeedString();
        window.location.hash = seedString;
    }

    //This function is called when the user clicks the Regenerate Game button on the left side of the page
    regenerateWholeScene(){
        let newParams = getCurParameters();
        if(newParams == null){ return; }

        [gridWidth, gridHeight, maxLength, maxCrosses] = newParams;

        // errorMessage.innerHTML = "<b>&nbspGenerating...&nbsp</b>"
        adjustScale();
        this.puzzle.resetAndRegenerate();
    }
}