class PuzzleGrid {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        restraintTexts = [];

        this.populateGrid(gridWidth, gridHeight);
        this.playerDirStack = [Dirs.EndPoint]; 
        this.goalNode = null;
        this.startNode = null;
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
        this.allElements = [...this.edges, ...this.nodes];
    }

    resetAndRegenerate(){
        this.nodes = [];
        this.edges = [];
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.populateGrid(gridWidth, gridHeight);
        this.resetGrid();
        this.generatePuzzle(this.gridWidth, this.gridHeight);
        this.drawGrid();
    }

    resetGrid(){
        scene.targetPath = null;
        this.nodes.forEach(node => node.reset());
        this.edges.forEach(edge => edge.reset());
        restraintTexts.forEach(text => {
            text.destroy();
        })
        restraintTexts = [];
        hasOneWayStreets = false;
    }

//###################################################################################################################
//#################################################### GAMEPLAY #####################################################   
//###################################################################################################################
    
    movePlayer(direction){
        document.querySelector("#HtmlWinLabel").innerHTML = "<br>";
        let edge = playerNode.edges[direction];

        let lastDir = this.playerDirStack[this.playerDirStack.length - 1];
        if(lastDir == InverseDirs[direction]){
            edge.uncross(edge.otherNode(playerNode));
            playerNode.uncross();
            this.playerDirStack.pop();
        } else {
            if(edge == null || !edge.canCross(playerNode) || !edge.otherNode(playerNode).canCross()){
                if (playerMoveDebug) console.log("Player can't move in that direction");
                return false;
            }
            edge.cross(playerNode);
            edge.otherNode(playerNode).cross();
            this.playerDirStack.push(direction);
        }
        
        playerNode = edge.otherNode(playerNode);
        if (playerMoveDebug) console.log("Player moved to node " + playerNode.ID);
        this.drawGrid();
    }

    undoMove(){
        document.querySelector("#HtmlWinLabel").innerHTML = "<br>";
        if(this.playerDirStack.length <= 1) return;
        let edge = playerNode.edges[InverseDirs[this.playerDirStack[this.playerDirStack.length - 1]]];

        edge.uncross(edge.otherNode(playerNode));
        playerNode.uncross();
        playerNode = edge.otherNode(playerNode);
        this.playerDirStack.pop();
        this.drawGrid();
    }

    resetPlayer(){
        document.querySelector("#HtmlWinLabel").innerHTML = "<br>";
        while(this.playerDirStack.length > 1){
            this.undoMove();
        }
    }

    changeStartNode(){
        this.resetPlayer();
        this.startNode.uncross();
        this.goalNode.cross();
        playerNode = this.goalNode;
        [this.startNode, this.goalNode] = [this.goalNode, this.startNode];
        this.drawGrid();
    }

    checkWin(){
        let winMessage = document.querySelector("#HtmlWinLabel");
        console.log("playerNode = " + playerNode.ID + " goalNode = " + this.goalNode.ID);
        if(playerNode != this.goalNode){
            winMessage.innerHTML = "&nbspYou're not at the goal node!&nbsp";
            return;
        }

        if(playerNode == endNode1 || playerNode == endNode2){
            if(this.allRestraintsSatisfied()){
                winMessage.innerHTML = "<b>&nbspPuzzle solved!&nbsp</b>";
            } else {
                winMessage.innerHTML = "&nbspSome restraints aren't satisfied!&nbsp";
            }
        }
    }

//###################################################################################################################
//############################################## GENERATING THE PUZZLE ##############################################    
//###################################################################################################################

    generatePuzzle(width, height){
        let validPuzzle = false;
        let attempts = 0;
        //First generate a valid path
        while(!validPuzzle){
            // console.clear();
            this.targetPath = new Path()
            this.targetPath.generate(this.nodes, maxLength)

            this.placeRestraints();

            if (restraintDebug) console.log("==== initial restraints placed ====");

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
                // console.clear();
                console.log("Failed to generate puzzle. Trying again. Attempts = " + attempts );

                if(attempts > 500){
                    console.log("Failed to generate puzzle after 500 attempts. Giving up.")
                    errorMessage.innerHTML = "&nbspFailed to generate valid puzzle&nbsp"
                    return;
                }

                this.resetGrid()
            }
        }

        //Now we have a valid path, so we can start removing restraints
        //First create a list of restraints
        this.restraintList = [];
        this.allElements.forEach(element => {
            // this.restraintList.push([...element.GetRestraints])
            if(element.numberRestraint){
                this.restraintList.push(element.numberRestraint);
            }
            if(element.oneWayRestraint){
                hasOneWayStreets = true;
                this.restraintList.push(element.oneWayRestraint);
            }
        })

        //Remove restraints that can be safely removed while maintaining uniqueness, in a random order
        rand.shuffle(this.restraintList);
        this.restraintList.forEach(restraint => {
            this.tryRemoveRestraint(restraint);    
        })
        
        if (restraintDebug) console.log("----------------- \nAll Restraints removed. \n-----------------")

        playerNode = endNode1;
        this.startNode = endNode1;
        this.goalNode = endNode2;
        endNode1.cross();
    }

    placeRestraints(){   
        this.allElements.forEach(element => {
            element.addRestraints();
        })
    }

    allRestraintsSatisfied(){
        // .some tests whether the case is true for at least one element in the array
        return !this.allElements.some(element => !element.restraintsSatisfied());
    }

    // Called on an existing puzzle to check the number of possible solutions to the puzzle 
    // Used for restraint removal
    checkSolutions(startNode, targetNode){
        // Check for solutions from the first of the two end nodes
        this.solutionNodeList = [startNode.ID];

        num_solutions = 0;
        recursionCounter = 0;
        this.recursiveSolutionFinder(startNode, targetNode, Dirs.Endpoint, 0);
        if (foundSolutionDebug) console.log("Found " + num_solutions + " solutions from node " + startNode.ID)
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
                if (foundSolutionDebug) console.log("Found a solution")
                //console.log(this.solutionNodeList)
                if(length != maxLength){
                    //We've just found a solution that is not the same length as the intended solution
                    //We know that the intended solution is still out there, so if this is the first solution we've found,
                    //we know we can abort early, and we can do this by just adding an extra solution
                    num_solutions += 1;
                }
                num_solutions += 1;
                return
            }
        }
        //Past this point we know we are not already on a solution, so we need to keep looking
        //Note: Thought about aborting early if you reach maxLength, but I need to know if there are solutions that are longer than maxLength

        //If the node can't be crossed any more times, 
        //and there is more than 1 remaining crosses on edges with number restraints leading out of this node,
        //we know that we've made a mistake somewhere and can abort early
        if(node.numberRestraint?.isSatisfied()){
            let remainingOutboundCrosses = 0;
            for(let i = 0; i < 4; i++){
                let e = node.edges[i];
                if (e && e.numberRestraint){ 
                    remainingOutboundCrosses += e.numberRestraint.number - e.timesCrossed
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

        return
    }

    tryRemoveRestraint(restraint){
        let element = restraint.element;
        let typeToRemove = restraint.type;
        if(restraintDebug) {
            console.log("xxxx " + element + typeToRemove);
            if(element.elementType == "Node"){
                console.log("Attempting to remove restraint from node at ", element.x, ", ", element.y)
            } else {
                console.log("Attempting to remove restraint of type " + typeToRemove + " from edge ", element.ID)
            }
        }

        let removedSuccessfuly = false;
        
        element.tempRemoveRestraint(typeToRemove);
        if (typeToRemove == "OneWay"){
            //Check if there are any one way streets remaining
            hasOneWayStreets = this.edges.some(edge => edge.oneWayRestraint);
        }

        //This logic is the same for all restraint types
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
            if (restraintDebug) console.log("RC1 " + typeToRemove + " restraint successfully removed")
            return true;
        } else {
            element.restoreRestraint(typeToRemove);
            if (restraintDebug) console.log("RC1 " + typeToRemove + " restraint could not be removed")
            recursionLimitReached = false;
            return false;
        }
    }

//##############################################################################################################
//############################################## DRAWING THE GRID ##############################################    
//##############################################################################################################

    drawGrid(){
        for (const [name, layer] of Object.entries(graphicsLayers)) {
            layer.clear();
        };

        restraintTexts.forEach(text => {
            text.destroy()
        })
        restraintTexts = [];
        this.allElements.forEach(element => {
            element.draw();
        });

        if (playerMovementEnabled) { 
            playerNode.drawPlayer(this.playerDirStack[this.playerDirStack.length - 1]);
        }

        this.allElements.forEach(element => {
            element.drawRestraints();
        });
    }
}