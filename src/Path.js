class Path {
    constructor(){
        this.startNode = null;
        this.edgeList = [];
        this.dirsTravelled = [Dirs.Endpoint]

        this.allDirs = [Dirs.Up, Dirs.Down, Dirs.Left, Dirs.Right]
    }

    generate(nodes, length){
        let curNode = Phaser.Utils.Array.GetRandom(nodes, 0, nodes.length);
        //console.log("Selected starting node ", curNode.x, ", ", curNode.y)

        curNode.endPoint = true;
        this.maxLength = length;

        curNode.cross()
        this.startNode = curNode;

        this.recursivePath(curNode);

        //console.log("Path finished: ", this.edgeList)
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

            //console.log("Looking at edge ", curDir)

            //If we've already found an edge, or this is the direction we came from, skip
            if(selectedEdge) continue
            let inverseDir = InverseDirs[this.dirsTravelled[this.dirsTravelled.length-1]];
            if(curDir == inverseDir) continue

            //If there's no edge in that direction, skip
            let edge = node.edges[curDir]
            if (edge == null) { continue }  

            //If the edge in that direction, or the node it leads to, can't be crossed, skip
            let otherNode = edge.otherNode(node);
            let edgeCrossable = edge.canCross();
            let nodeCrossable = otherNode.canCross();
            if(!edgeCrossable || !nodeCrossable) continue

            //As far as we can tell from here this edge is valid, so let's cross it
            selectedEdge = edge;
            edge.cross();
            otherNode.cross()
            this.dirsTravelled.push(curDir);
            this.edgeList.push(edge)
            //console.log("Travelling " + dirNames[curDir]);

            //If we're at the desired distance, we're all done
            if(this.edgeList.length == this.maxLength){
                let finalNode = otherNode
                this.dirsTravelled.push(curDir);
                finalNode.endPoint = true
                return true
            } 
    
            //We still have edges to go, so keep looking
            let goesTheDistance = this.recursivePath(otherNode) 
            //If goesTheDistance is false, only leads to a dead end 
            if(goesTheDistance){ return true }
            else {
                selectedEdge.uncross()
                otherNode.uncross()
                this.dirsTravelled.pop()
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