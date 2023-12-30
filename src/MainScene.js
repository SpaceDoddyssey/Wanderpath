class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        scene = this;
        graphics = this.add.graphics();

        initRNG();
        seedButton.addEventListener('click', () => {
            if (parseSeedString(seedTextArea.value)){
                this.regenerateWholeScene();
            }
        });

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

        // show game title text
        this.add.text(game.config.width / 2, 10, 'Wanderpath', textConfig).setOrigin(0.5, 0);

        //Hook up the button that regenerates the whole game with new given parameters
        document.querySelector('#regenerateGridButton').onclick = this.initRandAndGenerate.bind(this);

        //Hook up the undo button
        document.querySelector('#undoButton').onclick = () => { this.puzzle.undoMove(); };

        //Create a new empty puzzle grid
        this.puzzle = new PuzzleGrid(gridWidth, gridHeight);

        //Check if the user has entered a seed in the URL and parse it if so
        let urlSeed = false;
        const seedString = document.location.hash.substring(1);
        if (seedString) {
            console.log("Loading seed from URL:", seedString)
            parseSeedString(seedString);
            urlSeed = true;
            this.puzzle.generatePuzzle(gridWidth, gridHeight);
            setSeedText(seedString);
        } else {
            this.initRandAndGenerate()
        }

        this.puzzle.drawGrid();
    }

    update(){ 
        if (Phaser.Input.Keyboard.JustDown(RKey)) { 
            this.initRandAndGenerate(); 
        }

        if(!playerMovementEnabled) return;

        let curDirKey = this.currentDirectionKey();
        if(curDirKey != null){
            this.puzzle.movePlayer(curDirKey);
        }

        if(Phaser.Input.Keyboard.JustDown(ZKey)){
            this.puzzle.undoMove();
        }
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
        setSeedText(createSeedString());
        window.location.hash = seedTextArea.value;
    }

    //This function is called when the user clicks the Regenerate Game button on the left side of the page
    regenerateWholeScene(){
        let newParams = getCurParameters();
        if(newParams == null){ return; }

        [gridWidth, gridHeight, maxLength, maxCrosses] = newParams;

        // errorMessage.innerHTML = "<b>&nbspGenerating...&nbsp</b>"

        let newDim = newDimensions(gridWidth, gridHeight);
        game.scale.resize(newDim[0], newDim[1]);
        
        this.puzzle.resetAndRegenerate();
        window.location.hash = seedTextArea.value;
    }
}