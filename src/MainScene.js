class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        this.graphics = this.add.graphics();
        this.restraintTexts = [];

        initRNG();
        document.querySelector('#seedButton').addEventListener('click', () => {
            if (parseSeedString()){
                console.log("Parsed: ", getCurParameters());
                this.regenerateWholeScene();
            }
        });

        // define keys     Note: Not currently used
        [keyUP, keyDOWN, keyLEFT, keyRIGHT, keyR] = 
        ['UP', 'DOWN', 'LEFT', 'RIGHT', 'R'].map(dir => this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[dir]));
        
        // show game title text
        this.add.text(game.config.width / 2, 10, 'Wanderpath', textConfig).setOrigin(0.5, 0);

        //Hook up the button that regenerates the whole game with new given parameters
        document.querySelector('#regenerateGridButton').onclick = this.initRandAndGenerate.bind(this);

        //Create the elements of the base grid
        this.populateGrid(gridWidth, gridHeight);
        //Generate a puzzle within the grid
        this.generatePuzzle(gridWidth, gridHeight);

        this.drawGrid();
    }
    update(){ 
        if (Phaser.Input.Keyboard.JustDown(keyR)) { 
            initRNG();
            this.regenerateWholeScene(); 
        }
    }

//###################################################################################################################
//############################################## GENERATING THE PUZZLE ##############################################    
//###################################################################################################################

    initRandAndGenerate(){
        initRNG();
        this.regenerateWholeScene(); 
    }

    generatePuzzle(width, height){
        let validPuzzle = false;
        let attempts = 0;
        console.clear();
        //First generate a valid path
        while(!validPuzzle){
            this.targetPath = new Path()
            this.targetPath.generate(this.nodes, maxLength)

            this.placeRestraints();

            console.log("==== initial restraints placed ====");
            this.printGrid(); //Debug

            this.nodes.forEach(item => { item.timesCrossed = 0 });
            this.edges.forEach(item => { item.timesCrossed = 0 });

            //First we make sure that we haven't ended up with a puzzle where there are 
            //  multiple solutions even with all restraints active
            recursionLimitReached = false;
            recursionCounter = 0;
            let solutionsFromEN1 = this.checkSolutions(endNode1, endNode2);
            let solutionsFromEN2 = 0;
            if(hasOneWayStreets){
                solutionsFromEN2 = this.checkSolutions(endNode2, endNode1);
            }
            //If there is exactly one solution from both end nodes or exactly one from one end node and 0 from the other
            validPuzzle = ((solutionsFromEN1 == 1 && solutionsFromEN2 < 2) 
                        || (solutionsFromEN2 == 1 && solutionsFromEN1 < 2))
            if(!validPuzzle){
                attempts += 1;
                console.log("  ");
                console.log("*** Puzzle not valid!  attempts = " + attempts );

                if(attempts > 500){
                    let errorMessage = document.querySelector("#HtmlErrorLabel");
                    errorMessage.innerHTML = "&nbspFailed to generate valid puzzle&nbsp"
                    return;
                }

                this.resetGrid()
            }
        }

        //Now we have a valid path, so we can start removing restraints
        this.restraintList = [];
        this.allElements.forEach(element => {
            if(element.numberRestraint != -1){
                this.restraintList.push([element, "Number"]);
            }
            if(element.oneWayRestraint){
                hasOneWayStreets = true;
                this.restraintList.push([element, "OneWay"]);
            }
        })
        rand.shuffle(this.restraintList);

        //Remove restraints that can be safely removed while maintaining uniqueness, in a random order
        this.restraintList.forEach(restraint => {
            this.tryRemoveRestraint(restraint[0], restraint[1]);    
        })
        
        console.log("----------------- \nAll Restraints removed. \n-----------------")

        // this.printGrid() //Debug
        this.drawGrid()
    }

    tryRemoveRestraint(element, typeToRemove){
        console.log("xxxx " + element + typeToRemove);
        if(element.elementType == "Node"){
            console.log("Attempting to remove restraint from node at ", element.x, ", ", element.y)
        } else {
            console.log("Attempting to remove restraint of type " + typeToRemove + " from edge ", element.ID)
        }

        let removedSuccessfuly = false;
        let restraint = element.numberRestraint;
        if(typeToRemove == "Number"){
            //Save and remove the restraint on the element
            element.numberRestraint = -1;

            // this.printGrid() //Debug
        } else if (typeToRemove == "OneWay"){
            element.oneWayRestraint = false;

            //Check if there are any one way streets remaining
            hasOneWayStreets = false;
            this.edges.forEach(edge => {
                if(edge.oneWayRestraint) hasOneWayStreets = true; 
            })
        }

        //Logic is the same for all restraint types
        let solutionsFromEN1 = this.checkSolutions(endNode1, endNode2);
        if(hasOneWayStreets){
            //If there's more than one solution from EN1 we don't care how many from EN2
            if(solutionsFromEN1 > 1){
                removedSuccessfuly = false
            } else {
                let solutionsFromEN2 = this.checkSolutions(endNode2, endNode1);
                //If there is either 1 solution from EN2, or no solutions from EN2 but 1 solutions from EN1, success 
                removedSuccessfuly = 
                    (solutionsFromEN2 == 1 || (solutionsFromEN1 == 1 && solutionsFromEN2 == 0)
                    ? true : false);
            }
        } else {
            //In this case we know there are as many solutions from EN1 as EN2
            removedSuccessfuly = (solutionsFromEN1 == 1);
        }

        if(removedSuccessfuly){
            console.log("RC1 " + typeToRemove + " restraint successfully removed")
            return true;
        } else {
            if(typeToRemove == "Number"){
                element.numberRestraint = restraint;
            } else if (typeToRemove == "OneWay"){
                element.oneWayRestraint = true;
                hasOneWayStreets = true; 
            }
            console.log("RC1 " + typeToRemove + " restraint could not be removed")
            recursionLimitReached = false;
            return false;
        }
    }

    // Called on an existing puzzle to check the number of possible solutions to the puzzle 
    // Used for restraint removal
    checkSolutions(startNode, targetNode){
        // Check for solutions from the first of the two end nodes
        this.solutionNodeList = []

        this.solutionNodeList.push(startNode.ID)
        num_solutions = 0;
        recursionCounter = 0;
        this.recursiveSolutionFinder(startNode, targetNode, Dirs.Endpoint, 0);
        console.log("Found " + num_solutions + " solutions from node " + startNode.ID)
        startNode.uncross();
        targetNode.uncross();
        if(recursionLimitReached) {
            console.log("Recursion limit reached");
            return 100;
        }

        return num_solutions;
    }

    recursiveSolutionFinder(node, goalNode, lastDir, length){
        if(recursiveDebugLevel >= 3){
            let indent = " ".repeat(length);
            console.log( indent + "node " + node.ID + "  " + length )
        }
        recursionCounter += 1;

        if(recursiveDebugLevel >= 1){
            if(recursiveDebugLevel >= 2){
                console.log(recursionCounter + "  " + this.solutionNodeList);
            }
            if (recursionCounter % 1000 == 0) { 
                console.log(recursionCounter);
            }
        }
        if(recursionCounter >= recursionLimit){
            recursionLimitReached = true;
            return;
        }

        node.cross();

        if(node == goalNode) { 
            if (reachedGoalDebug) { console.log("Reached goal node"); }
            if(this.allRestraintsSatisfied()) {
                console.log("Found a solution")
                //console.log(this.solutionNodeList)
                if(length != maxLength){
                    //We've just found a solution that is not the same length as the intended solution
                    //We know that the intended solution is still out there, so if this is the first solution we've found,
                    //we know we can abort early, and we can do this by just adding an extra solution
                    num_solutions += 1;
                }
                num_solutions += 1;
                return
            } else {
                //console.log("Touched the end - restraints not satisfied, continuing")
            }
        }
        //Past this point we know we are not already on a solution, so we need to keep looking

        //Note: Thought about aborting early if you reach maxLength, but I need to know if there are solutions that are longer than maxLength

        if(node.numberRestraint != -1 && node.timesCrossed == node.numberRestraint){
            let remainingOutboundCrosses = 0;
            for(let i = 0; i < 4; i++){
                let e = node.edges[i];
                if (e != null && e.numberRestraint != -1){ 
                    remainingOutboundCrosses += e.numberRestraint - e.timesCrossed
                }
                if(remainingOutboundCrosses > 1){
                    return;
                }
            }
        }

        for(let i = 0; i < 4; i++) {
            let curDir = i;

            //console.log("Looking at edge ", curDir)

            //If this is the direction we came from, skip
            if(curDir == InverseDirs[lastDir]) { 
                //console.log("That's the way we came"); 
                continue 
            }

            //If there's no edge in that direction, skip
            let edge = node.edges[curDir];
            if (edge == null) { 
                //console.log("No edge"); 
                continue 
            }  

            //If the edge in that direction, or the node it leads to, can't be crossed, skip
            let otherNode = edge.otherNode(node);
            if( !edge.canCross(node) || !otherNode.canCross()) {
                //console.log("Can't be crossed"); 
                continue
            }

            //As far as we can tell from here this edge is valid, so let's cross it
            edge.cross(node);
                this.solutionNodeList.push(otherNode.ID)
                length++
                    this.recursiveSolutionFinder(otherNode, goalNode, curDir, length)
                length--
                this.solutionNodeList.pop()
            edge.uncross(node);
            otherNode.uncross()
            if(num_solutions > 1) return
        }

        // if(solutions > 0){
        //     console.log("Branch with ", solutions, " solutions")
        // }
        return
    }

    allRestraintsSatisfied(){
        let counter = 0
        for(let i = 0; i < this.allElements.length; i++){    
            let element = this.allElements[i];
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
        let newParams = getCurParameters();
        if(newParams == null){ return; }

        [gridWidth, gridHeight, maxLength, maxCrosses] = newParams;

        // errorMessage.innerHTML = "<b>&nbspGenerating...&nbsp</b>"

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
            node.reset();
        })
        this.edges.forEach(edge => {
            edge.reset();
        })
        this.restraintTexts.forEach(text => {
            //console.log("text")
            text.destroy()
        })
        this.restraintTexts = [];
        hasOneWayStreets = false;
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
                let from = this.nodes[ (width * y) + x ]
                //Connect to the node to the right
                if(x != width - 1){
                    let to   = this.nodes[ (width * y) + x + 1]
                    this.edges.push(from.connectEdge(to, Dirs.Right, counter++))
                }
                //Connect to the node below
                if(y != height - 1){
                    let to   = this.nodes[ (width * (y + 1)) + x ]
                    this.edges.push(from.connectEdge(to, Dirs.Down, counter++))
                }
            }
        }
        this.allElements = [...this.nodes, ...this.edges];
    }
    placeRestraints(){   
        this.allElements.forEach(element => {
            element.addRestraints();
        })
    }

//##############################################################################################################
//############################################## DRAWING THE GRID ##############################################    
//##############################################################################################################

    drawGrid(){
        this.graphics.clear();
        [...this.edges, ...this.nodes].forEach(element => {
            element.draw(this.graphics);
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
            if(edge.oneWayRestraint){
                let [ANodeLoc, BNodeLoc] = [edge.ANode.ScreenLoc(), edge.BNode.ScreenLoc()];
                let [ALoc, BLoc] = [percentBetween(BNodeLoc, ANodeLoc, 0.85), percentBetween(ANodeLoc, BNodeLoc, 0.85)];
                this.graphics.lineStyle(3, 0x83BCFF, 1.0);

                let [CLoc, DLoc] = [[], []];
                let firstLoc, secondLoc;

                let horizontalOrVertical = edge.ANode.y == edge.BNode.y ? 1 : 0;

                [firstLoc, secondLoc] = edge.canCrossAtoB ? [ALoc, BLoc] : [BLoc, ALoc];
                [CLoc[0], CLoc[1], DLoc[0], DLoc[1]] = edge.canCrossAtoB ? [ALoc[0], ALoc[1], ALoc[0], ALoc[1]] : [BLoc[0], BLoc[1], BLoc[0], BLoc[1]];
                CLoc[horizontalOrVertical] -= edgeWidth / 5.1;
                DLoc[horizontalOrVertical] += edgeWidth / 5.1;
                
                this.graphics.beginPath();
                this.graphics.moveTo(...firstLoc);
                this.graphics.lineTo(...secondLoc);
                this.graphics.lineTo(...CLoc);
                this.graphics.lineTo(...DLoc);
                this.graphics.lineTo(...secondLoc);
                this.graphics.stroke();
            }
        })
    }

    //Prints the grid to console for debug purposes
    printGrid(){
        //let nodeArray = []
        //let edgeArray = []
        //this.nodes.forEach(node => { nodeArray.push(node.numberRestraint) })
        //this.edges.forEach(edge => { edgeArray.push(edge.numberRestraint) })
        //console.log(nodeArray)
        //console.log(edgeArray)

        this.edges.forEach(edge => {
            if(edge.oneWayRestraint){
                console.log("One way restraint on edge " + edge.ID + 
                    (edge.canCrossAtoB ? 
                        " from " + edge.ANode.ID + " to " + edge.BNode.ID : 
                        " from " + edge.BNode.ID + " to " + edge.ANode.ID))
            }
        })

        //Debug - written by Brian Dodd while helping to debug something tough
        console.log("<Grid>")
        for( var r=0; r<gridHeight; r++) {
            let line = " ";
            for( var c=0; c<gridWidth; c++) {
                let id = (r*gridWidth) + c;
                line += "[";
                if ( id < 10) line += " ";
                line = line + id + "]:";
                let n = this.nodes[id];

                if ( n.numberRestraint <  0) line += "##";
                else {
                    if ( n.numberRestraint < 10) line += " ";
                         line += n.numberRestraint;
                }

                //if (n.edges[0]==null) line += "-"; else line += "e";  //U
                //if (n.edges[1]==null) line += "-"; else line += "e";  //D
                //if (n.edges[2]==null) line += "-"; else line += "e";  //L
                //if (n.edges[3]==null) line += "-"; else line += "e";  //R
 
                if (n.edges[3]==null) { //right edge
                    line += "       ";
                } else {
                    let e = n.edges[3]; // right

                    let ch0 = "{";
                    let ch1 = "}";
                    if (e.oneWayRestraint) {
                        if (e.canCrossBtoA) ch0="<"; else ch0="(";
                        if (e.canCrossAtoB) ch1=">"; else ch1=")";
                    }       
                    line += "  "+ch0;
                    if ( e.ID < 10) line += " ";
                    line = line + e.ID + ch1 + ":";
                    if ( e.numberRestraint <  0) line += "##";
                    else {
                        if ( e.numberRestraint < 10) line += " ";
                             line += e.numberRestraint;
                    }
                }
                line += " ";
            }
            console.log( line );


            line = " ";
            for( let c=0; c<gridWidth; c++) {
               let id = (r*gridWidth) + c;
                let n = this.nodes[id];
                 if (n.edges[1]==null) { //bottom edge
                    line += "      ";
                } else {
                    let e = n.edges[1]; //bottom
                    let ch0 = "{";
                    let ch1 = "}";
                    if (e.oneWayRestraint) {
                        if (e.canCrossBtoA) ch0="<"; else ch0="(";
                        if (e.canCrossAtoB) ch1=">"; else ch1=")";
                    }       

                    line += ch0;
                    if ( e.ID < 10) line += " ";
                    line = line + e.ID + ch1 + ":";

                    if ( e.numberRestraint <  0) line += "##";
                    else {
                        if ( e.numberRestraint < 10) line += " ";
                        line += e.numberRestraint;
                    }
                }
                line += "          ";
            }
            console.log( line );
        }
        console.log(" ")
    }
}