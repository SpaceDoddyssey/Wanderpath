class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    preload() {
    }

    create() {
        // text configuration
        let textConfig = {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }

        this.graphics = this.add.graphics();

        // show game title text
        this.add.text(10, 0, 'Spaghetti Loops', textConfig);

        // define keys
        keyUP    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyLEFT  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.populateGrid(gridWidth, gridHeight);
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
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
                    this.edges.push(new Edge(from, to))
                }
                //Connect to the node below
                if(y != height - 1){
                    let from = this.nodes[ (width * y) + x ]
                    let to   = this.nodes[ (width * (y + 1)) + x ]
                    this.edges.push(new Edge(from, to))
                }
            }
        }
    }

    generatePuzzle(width, height){

    }

    drawGrid(){
        //this.edges.forEach(node => console.log(node))
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
        this.edges.forEach(edge => {
            this.drawEdge(edge);    
        });
    }

    drawNode(node){}
    drawEdge(edge){
        let fromLoc = edge.from.Loc();
        let toLoc   = edge.to.Loc();

        this.graphics.lineStyle(10, 0xFFFFFF, 1.0);
        this.graphics.beginPath();
        this.graphics.moveTo(fromLoc[0], fromLoc[1]);
        this.graphics.lineTo(toLoc[0], toLoc[1]);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    update() {
    }
}