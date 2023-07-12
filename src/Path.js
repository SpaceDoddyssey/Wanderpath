class Path {
    constructor(){
        this.startNode = null;
        this.edgeList = [];
        this.lastDir = Dirs.Endpoint

        this.allDirs = [Dirs.Up, Dirs.Down, Dirs.Left, Dirs.Right]
    }

    generate(nodes, length){
        let curNode = Phaser.Utils.Array.GetRandom(nodes, 0, nodes.length);
        console.log("Selected starting node ", curNode.x, ", ", curNode.y)

        curNode.endPoint = true;
        this.maxLength = length;

        this.recursivePath(curNode);

        this.startNode = curNode;
        console.log("Path finished: ", this.edgeList)

        //Wipe the timesCrossed of each 
    }
    
    //Recursively moves in a random direction, pushing edges to the path, backing up if it can't move
    recursivePath(node){
        //Iterate through the directions randomly
        let validDirs = [... this.allDirs]
        Phaser.Utils.Array.Shuffle(validDirs);

        //Check each edge 
        let selectedEdge = null;
        for(let i = 0; i < 4; i++) {
            let curDir = validDirs[i];

            console.log("Looking at edge ", curDir)

            //If we've already found an edge, or this is the direction we came from, skip
            if(selectedEdge || curDir == this.lastDir) continue

            //If there's no edge in that direction, skip
            let edge = node.edges[curDir]
            if (edge == null) { continue }  

            //If the edge in that direction, or the node it leads to, can't be crossed, skip
            let edgeCrossable = edge.canCross();
            let nodeCrossable = edge.otherNode(node).canCross();
            if(!edgeCrossable || !nodeCrossable) continue

            //As far as we can tell from here this edge is valid, so let's cross it
            selectedEdge = edge;
            edge.cross();
            this.edgeList.push(edge)

            //If we're at the desired distance, we've succeeded
            if(this.edgeList.length == this.maxLength){
                return true
            } 
    
            //We still have edges to go, so keep looking
            let goesTheDistance = this.recursivePath(selectedEdge.otherNode(node)) 
            //If goesTheDistance is false, only leads to a dead end 
            if(goesTheDistance){ return true }
            else {
                selectedEdge.uncross()
                selectedEdge = null
                this.edgeList.pop()
                continue
            }
        }

        //If we're at this point either we've finished or we've hit a dead end and need to backtrack
        if(selectedEdge == null) {
            return false
        } else {
            return true
        }
    }
}