class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics();

        // show game title text
        this.add.text(10, 0, 'Spaghetti Loops', textConfig);

        // define keys
        keyUP    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyLEFT  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        const generateButton = this.add.text(10, 70, 'Generate new puzzle', { fill: '#0f0' });
        generateButton.setInteractive();
        generateButton.on('pointerdown', () => { 
            this.resetGrid()
            this.generatePuzzle(gridWidth, gridHeight);
            this.drawGrid();
        });

        this.restraintTexts = []

        this.populateGrid(gridWidth, gridHeight);
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
    }

    placeRestraint(){   
        let allElements = this.nodes.concat(this.edges)
        Phaser.Utils.Array.Shuffle(allElements)
        for(let i = 0; i < allElements.length; i++){
            let element = allElements[i]
            let added = element.addRandomRestraint();
            if(added) return
        }
    }

    resetGrid(){
        this.targetPath = null
        this.nodes.forEach(node => {
            node.timesCrossed = 0
            node.numberRestraint = -1
            node.endPoint = false
        })
        this.edges.forEach(edge => {
            edge.timesCrossed = 0
            edge.numberRestraint = -1
        })
        this.restraintTexts.forEach(text => {
            console.log("text")
            text.destroy()
        })
    }
    populateGrid(width, height){
        this.nodes = []
        this.edges = []
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let n = new Node(x, y);
                this.nodes.push(n)   
            }
        }
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                //Connect to the node to the right
                if(x != width - 1){
                    let from = this.nodes[ (width * y) + x ]
                    let to   = this.nodes[ (width * y) + x + 1]
                    this.edges.push(from.connectEdge(to, Dirs.Right))
                }
                //Connect to the node below
                if(y != height - 1){
                    let from = this.nodes[ (width * y) + x ]
                    let to   = this.nodes[ (width * (y + 1)) + x ]
                    this.edges.push(from.connectEdge(to, Dirs.Down))
                }
            }
        }
    }
    generatePuzzle(width, height){
        this.targetPath = new Path()
        this.targetPath.generate(this.nodes, 8)

        this.placeRestraint();
        this.placeRestraint();
        this.placeRestraint();
    }
    drawGrid(){
        this.graphics.clear();
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
        this.edges.forEach(edge => {
            this.drawEdge(edge);    
        });
        this.drawRestraints();
    }

    drawRestraints(){
        this.nodes.forEach(node => {
            if(node.numberRestraint != -1){
                //console.log("node")
                this.restraintTexts.push(this.add.text((node.ScreenLoc())[0], 
                    (node.ScreenLoc())[1], 
                    node.numberRestraint, restraintConfig).setOrigin(0.5));
            }
        })
        this.edges.forEach(edge => {
            if(edge.numberRestraint != -1){
                this.restraintTexts.push(this.add.text((edge.ScreenLoc())[0], 
                            (edge.ScreenLoc())[1], 
                            edge.numberRestraint, restraintConfig).setOrigin(0.5));
            }
        })
    }

    drawNode(node){
        if(node.endPoint){
            let loc = node.ScreenLoc();
            this.graphics.fillStyle(0xFFFFFF, 1).fillCircle(loc[0], loc[1], 20)  
        }
    }
    drawEdge(edge){
        let fromLoc = edge.from.ScreenLoc();
        let toLoc   = edge.to.ScreenLoc();

        if(edge.timesCrossed > 0){
            this.graphics.lineStyle(10, 0xFF0000, 1.0);
        } else {
            this.graphics.lineStyle(10, 0xFFFFFF, 1.0);
        }
        this.graphics.beginPath();
        this.graphics.moveTo(fromLoc[0], fromLoc[1]);
        this.graphics.lineTo(toLoc[0], toLoc[1]);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    update() {
    }
}