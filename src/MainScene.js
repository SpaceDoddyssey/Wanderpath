class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics();

        // show game title text
        this.add.text(10, 0, 'Spaghetti Plate', textConfig);

        var rnd = Phaser.Math.RND;
        rnd.init("Blah")

        // define keys
        keyUP    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyLEFT  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        const generateButton = this.add.text(10, 70, 'Generate new puzzle', { fill: '#0f0' });
        generateButton.setInteractive();
        generateButton.on('pointerdown', () => { 
            this.resetGrid()
            let allElements = this.nodes.concat(this.edges)
            allElements.forEach(el => { el.maxCrosses = maxCrosses })
            this.generatePuzzle(gridWidth, gridHeight);
            this.drawGrid();
        });

        document.getElementById('regenerateGridButton').onclick = this.regenerateScene.bind(this);
        
        this.restraintTexts = []

        this.populateGrid(gridWidth, gridHeight);
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
    }

    generatePuzzle(width, height){
        console.clear()

        this.targetPath = new Path()
        this.targetPath.generate(this.nodes, maxLength)

        this.placeRestraints();

        this.nodes.forEach(node => { node.timesCrossed = 0 })
        this.edges.forEach(edge => { edge.timesCrossed = 0 })

        let redundantRestraintsLeft = true;
        let allElements = this.nodes.concat(this.edges);
        Phaser.Utils.Array.Shuffle(allElements);

        //let removed = this.tryRemoveRestraint(this.nodes[0]);   

        this.drawGrid()

        this.printGrid()

        while(redundantRestraintsLeft){
            redundantRestraintsLeft = false;
            allElements.forEach(element => {
                let removed = this.tryRemoveRestraint(element);    
                if(removed){
                    redundantRestraintsLeft = true
                }
                this.drawGrid();
            })
        }

        console.log("----------------- All Restraints removed.")
        this.checkSolutions();
    }

    tryRemoveRestraint(element){
        if(element.numberRestraint == -1){
            //There's no restraint here to remove
            return false;
        } else {
            //Save and remove the restraint on the element
            let restraint = element.numberRestraint;
            element.numberRestraint = -1;

            if(element.x){
                console.log("Attempting to remove restraint from node at ", element.x, ", ", element.y)
            } else {
                console.log("Attempting to remove restraint from edge ", element.ID)
            }

            //If there is still only one solution, the restraint is safe to remove
            if(this.checkSolutions()){
                console.log("Restraint successfully removed")
                return true;
            } else {
                console.log("Restraint could not be removed")
                element.numberRestraint = restraint;
                return false;
            }
        }
    }

    checkSolutions(){
         // Check for solutions from the first of the two end nodes

        let totalSolutions = 0
        endNode1.cross()
        let num_solutions = this.recursiveSolutionFinder(endNode1, endNode2, Dirs.Endpoint, 0);
        console.log("Found " + num_solutions + " solutions from start node 1")
        if(num_solutions > 1) {
            endNode1.uncross()
            return false
        }
        endNode1.uncross()
        totalSolutions += num_solutions;

        // Check for solutions from the second of the two end nodes
        endNode2.cross()
        num_solutions = this.recursiveSolutionFinder(endNode2, endNode1, Dirs.Endpoint, 0);
        console.log("Found " + num_solutions + " solutions from start node 2")
        if(num_solutions > 1) {
            endNode2.uncross()
            return false
        }
        endNode2.uncross()
        totalSolutions += num_solutions;

        if (totalSolutions < 1) return false

        return true;
    }

    recursiveSolutionFinder(node, goalNode, lastDir, length){
        //console.log("Checking node " + node.ID)
        if(node == goalNode && lastDir != Dirs.Endpoint) { 
            if(this.allRestraintsSatisfied()) {
                console.log("Found a solution")
                return 1 
            } else {
                //console.log("Touched the end - restraints not satisfied, continuing")
            }
        }
        let solutions = 0 

        for(let i = 0; i < 4; i++) {
            let curDir = i;

            //console.log("Looking at edge ", curDir)

            //If this is the direction we came from, skip
            let inverseDir = InverseDirs[lastDir];
            if(curDir == inverseDir) { 
                //console.log("That's the way we came"); 
                continue 
            }

            //If there's no edge in that direction, skip
            let edge = node.edges[curDir]
            if (edge == null) { 
                //console.log("No edge"); 
                continue 
            }  

            //If the edge in that direction, or the node it leads to, can't be crossed, skip
            let otherNode = edge.otherNode(node);
            let edgeCrossable = edge.canCross();
            let nodeCrossable = otherNode.canCross();
            if(!edgeCrossable || !nodeCrossable) {
                //console.log("Can't be crossed"); 
                continue
            }

            //As far as we can tell from here this edge is valid, so let's cross it
            edge.cross();
            otherNode.cross()

            length++
            solutions += this.recursiveSolutionFinder(otherNode, goalNode, curDir, length)
            length--

            edge.uncross();
            otherNode.uncross()

            if(solutions > 1) return solutions
        }

        if(solutions > 0){
            //console.log("Branch with ", solutions, " solutions")
        }
        return solutions
    }

    allRestraintsSatisfied(){
        let allElements = this.nodes.concat(this.edges)
        let counter = 0
        for(let i = 0; i < allElements.length; i++){
            let element = allElements[i];
            counter++
            //console.log("Checking element " + counter);
            if(element.restraintsSatisfied() == false) { 
                //console.log("Not fulfilled, crossed ", element.timesCrossed, " times instead of ", element.numberRestraint)
                return false 
            }
        }
        return true
    }

    regenerateScene(){
        gridWidth  = document.getElementById('widthField').value
        gridHeight = document.getElementById('heightField').value
        maxLength  = document.getElementById('lengthField').value
        maxCrosses = document.getElementById('maxCrossingField').value
        
        let newDim = newDimensions(gridWidth, gridHeight);
        game.scale.resize(newDim[0], newDim[1]);
        
        this.resetGrid();
        this.populateGrid(gridWidth, gridHeight);
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
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
            //console.log("text")
            text.destroy()
        })
        this.restraintTexts = [];
    }
    populateGrid(width, height){
        this.nodes = []
        this.edges = []
        let counter = 0
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let n = new Node(x, y, counter++);
                this.nodes.push(n)   
            }
        }
        counter = 0
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                //Connect to the node to the right
                if(x != width - 1){
                    let from = this.nodes[ (width * y) + x ]
                    let to   = this.nodes[ (width * y) + x + 1]
                    this.edges.push(from.connectEdge(to, Dirs.Right, counter++))
                }
                //Connect to the node below
                if(y != height - 1){
                    let from = this.nodes[ (width * y) + x ]
                    let to   = this.nodes[ (width * (y + 1)) + x ]
                    this.edges.push(from.connectEdge(to, Dirs.Down, counter++))
                }
            }
        }
    }
    
    drawGrid(){
        this.graphics.clear();
        this.edges.forEach(edge => {
            this.drawEdge(edge);    
        });
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
        this.drawRestraints();
    }

    printGrid(){
        let nodeArray = []
        let edgeArray = []
        this.nodes.forEach(node => { nodeArray.push(node.numberRestraint) })
        this.edges.forEach(edge => { edgeArray.push(edge.numberRestraint) })

        console.log(nodeArray)
        console.log(edgeArray)
    }

    placeRestraints(){   
        let allElements = this.nodes.concat(this.edges)
        Phaser.Utils.Array.Shuffle(allElements)
        allElements.forEach(element => {
            element.addRestraints();
        })
    }
    drawRestraints(){
        this.restraintTexts.forEach(text => {
            //console.log("text")
            text.destroy()
        })
        this.restraintTexts = [];

        this.nodes.forEach(node => {
            if(node.numberRestraint != -1){
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
        let color
        if(node.timesCrossed > 0){
            color = 0xFF0000
        } else {
            color = 0xFFFFFF
        }

        if(node.endPoint){
            let loc = node.ScreenLoc();
            this.graphics.fillStyle(color, 1).fillCircle(loc[0], loc[1], 20)  
        } else {
            let loc = node.ScreenLoc();
            this.graphics.fillStyle(color, 1).fillRect(loc[0] - 7, loc[1] - 7, 14, 14)
        }
    }
    drawEdge(edge){
        let fromLoc = edge.from.ScreenLoc();
        let toLoc   = edge.to.ScreenLoc();

        if(edge.timesCrossed > 0){
            this.graphics.lineStyle(14, 0xFF0000, 1.0);
        } else {
            this.graphics.lineStyle(14, 0xFFFFFF, 1.0);
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