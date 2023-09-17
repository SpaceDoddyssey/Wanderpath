class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        this.graphics = this.add.graphics();
        this.restraintTexts = []

        var rnd = Phaser.Math.RND;
        rnd.init("Seed") //Note: This does not seem to do anything :| I need to figure out how to seed properly

        // define keys     Note: Not currently used
        keyUP    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyLEFT  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyR     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // show game title text
        this.add.text(20, 10, 'Wanderpath', textConfig);

        //Hook up the button that regenerates the whole game with new given parameters
        document.getElementById('regenerateGridButton').onclick = this.regenerateWholeScene.bind(this);

        //Create the elements of the base grid
        this.populateGrid(gridWidth, gridHeight);
        //Generate a puzzle within the grid
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
    }
    update(){ 
        //TODO: Not working
        if (Phaser.Input.Keyboard.JustDown(keyR)) { this.regenerateWholeScene; }
    }

//###################################################################################################################
//############################################## GENERATING THE PUZZLE ##############################################    
//###################################################################################################################

    generatePuzzle(width, height){
        console.clear()

        let validPuzzle = false;
        //First generate a valid path
        while(!validPuzzle){
            this.targetPath = new Path()
            this.targetPath.generate(this.nodes, maxLength)

            this.placeRestraints();

            this.nodes.forEach(node => { node.timesCrossed = 0 })
            this.edges.forEach(edge => { edge.timesCrossed = 0 })

            validPuzzle = this.checkSolutions()
            if(!validPuzzle){
                this.resetGrid()
            }
        }

        this.printGrid() //Debug

        //Get a list of all the elements and shuffle them
        let allElements = this.nodes.concat(this.edges);
        // Phaser.Utils.Array.Shuffle(allElements); //Maybe adds something? Not sure
        
        //Remove restraints that can be safely removed while maintaining uniqueness, in a random order
        allElements.forEach(element => {
            this.tryRemoveRestraint(element);    
        })
        
        console.log("----------------- \nAll Restraints removed. \n-----------------")
        this.checkSolutions(); //Here for debug purposes
        this.drawGrid()
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
                console.log("RC1 Restraint successfully removed")
                return true;
            } else {
                console.log("RC1 Restraint could not be removed")
                element.numberRestraint = restraint;
                return false;
            }
        }
    }

    // Called on an existing puzzle to check the number of possible solutions to the puzzle 
    // Used for restraint removal
    checkSolutions(){
        // Check for solutions from the first of the two end nodes
        this.solutionNodeList = []

        let totalSolutions = 0
        endNode1.cross()
        this.solutionNodeList.push(endNode1.ID)
        num_solutions = 0;
        this.recursiveSolutionFinder(endNode1, endNode2, Dirs.Endpoint, 0);
        console.log("Found " + num_solutions + " solutions from start node 1")
        if(num_solutions > 1) {
            endNode1.uncross()
            return false
        }
        endNode1.uncross()
        totalSolutions += num_solutions;

        // Check for solutions from the second of the two end nodes
        // Note: Currently unused 
        //     - this is only necessary if we have One Way Street constraints, which are not currently implemented
        if(hasOneWayStreets){
            endNode2.cross()
            this.solutionNodeList.pop()
            this.solutionNodeList.push(endNode2.ID)
            num_solutions = 0;
            this.recursiveSolutionFinder(endNode2, endNode1, Dirs.Endpoint, 0);
            this.solutionNodeList.pop()
            console.log("Found " + num_solutions + " solutions from start node 2")
            if(num_solutions > 1) {
                endNode2.uncross()
                return false
            }
            endNode2.uncross()
            totalSolutions += num_solutions;
        }

        if (totalSolutions < 1) return false

        return true;
    }

    recursiveSolutionFinder(node, goalNode, lastDir, length){
        //console.log("Checking node " + node.ID)

        //NEWDEBUG
        //this.drawGrid();
        //NEWDEBuG

        if(node == goalNode && lastDir != Dirs.Endpoint) { 
            if(this.allRestraintsSatisfied()) {
                console.log("Found a solution")
                console.log(this.solutionNodeList)
                num_solutions += 1;
                return
            } else {
                //console.log("Touched the end - restraints not satisfied, continuing")
            }
        }
        //Past this point we know we are not already on a solution, so we need to keep looking

        //Note: I wanted to abort early if you reach maxLength, but I need to know if there are solutions that are longer than maxLength

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
                this.solutionNodeList.push(otherNode.ID)
                length++
                    this.recursiveSolutionFinder(otherNode, goalNode, curDir, length)
                length--
                this.solutionNodeList.pop()
            edge.uncross();
            otherNode.uncross()
            if(num_solutions > 1) return
        }

        // if(solutions > 0){
        //     console.log("Branch with ", solutions, " solutions")
        // }
        return
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

//###################################################################################################################
//############################################## MANIPULATING THE GRID ##############################################    
//###################################################################################################################

    //This function is called when the user clicks the Regenerate Game button on the left side of the page
    regenerateWholeScene(){
        //Get the new parameters
        let newGW = document.getElementById('widthField').value
        let newGH = document.getElementById('heightField').value
        let newML = document.getElementById('lengthField').value
        let newMC = document.getElementById('maxCrossingField').value
        
        //Check that the parameters are valid, display error message if necessary
        //The maximum path length is (width * height - 1) * maxCrossings
        let errorMessage = document.getElementById("invalidParamsErrorText");
        if(newML > (newGW * newGH - 1) * newMC){ 
            errorMessage.innerHTML = "<b>&nbspInvalid settings!</b><br>&nbspPath Length must be at most&nbsp<br>&nbsp(Width * Height - 1) * Max Crosses&nbsp"
            return;
        } else {
            errorMessage.innerHTML = ""
        }

        gridWidth  = newGW;
        gridHeight = newGH;
        maxLength  = newML;
        maxCrosses = newMC;

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
    // Creates the edges and nodes for a grid of the requested size
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
    placeRestraints(){   
        let allElements = this.nodes.concat(this.edges)
        allElements.forEach(element => {
            element.addRestraints();
        })
    }

//##############################################################################################################
//############################################## DRAWING THE GRID ##############################################    
//##############################################################################################################

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
                    node.numberRestraint, restraintConfig).setOrigin(0.5, 0.55));
            }
        })
        this.edges.forEach(edge => {
            if(edge.numberRestraint != -1){
                this.restraintTexts.push(this.add.text((edge.ScreenLoc())[0], 
                    (edge.ScreenLoc())[1], 
                    edge.numberRestraint, restraintConfig).setOrigin(0.5, 0.55));
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
            this.graphics.fillStyle(color, 1).fillCircle(loc[0], loc[1], 24)  
        } else {
            let loc = node.ScreenLoc();
            this.graphics.fillStyle(color, 1).fillRect(loc[0] - 9, loc[1] - 9, 18, 18)
        }
    }
    drawEdge(edge){
        let fromLoc = edge.from.ScreenLoc();
        let toLoc   = edge.to.ScreenLoc();

        if(edge.timesCrossed > 0){
            this.graphics.lineStyle(18, 0xFF0000, 1.0);
        } else {
            this.graphics.lineStyle(18, 0xFFFFFF, 1.0);
        }

        //NEWDEBUG
        // let shade = edge.numberRestraint * 10;
        // if (shade > 255) shade = 255;
        // let color = 0x004040 + (shade << 16);
        // this.graphics.lineStyle(18, color, 1.0);
        //NEWDEBUG

        this.graphics.beginPath();
        this.graphics.moveTo(fromLoc[0], fromLoc[1]);
        this.graphics.lineTo(toLoc[0], toLoc[1]);
        this.graphics.stroke();
    }

    //Prints the grid to console for debug purposes
    printGrid(){
        let nodeArray = []
        let edgeArray = []
        this.nodes.forEach(node => { nodeArray.push(node.numberRestraint) })
        this.edges.forEach(edge => { edgeArray.push(edge.numberRestraint) })

        console.log(nodeArray)
        console.log(edgeArray)
    }
}